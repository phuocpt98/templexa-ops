/**
 * extract.js — Hàm chạy TRONG trình duyệt (page.evaluate) để đo một trang LadiPage đã tải về.
 * Trả về cây phần tử theo từng section/popup: vị trí CSS (left/top/width/height), kiểu chữ, khung, ảnh,
 * hiệu ứng (#ID.ladi-animation), hành động bấm (script_event_data), form, đếm ngược, khối HTML nhúng.
 * Dùng bởi convert.js — gọi 2 lần: khổ điện thoại (420) và khổ máy tính (1280).
 */
module.exports = function extractInPage() {
  // Tắt nạp chậm của LadiPage để có đủ địa chỉ ảnh
  document.body.classList.remove('lazyload');
  var lz = document.getElementById('style_lazyload'); if (lz) lz.remove();
  document.querySelectorAll('.ladi-lazyload').forEach(function (e) { e.classList.remove('ladi-lazyload'); });
  // LadiPage giấu phần tử chờ hiệu ứng (opacity 0 !important) → bỏ để đo độ mờ thật của thiết kế
  document.querySelectorAll('.ladi-animation-hidden').forEach(function (e) { e.classList.remove('ladi-animation-hidden'); });

  var ev = {};
  try { ev = JSON.parse(document.getElementById('script_event_data').textContent); } catch (e) {}

  var anim = {}, keyframes = {}, fontFaces = [];
  for (var k = 0; k < document.styleSheets.length; k++) {
    var rules; try { rules = document.styleSheets[k].cssRules; } catch (e) { continue; }
    (function walk(rs) {
      for (var i = 0; i < rs.length; i++) {
        var r = rs[i];
        if (r.type === CSSRule.KEYFRAMES_RULE) { keyframes[r.name] = r.cssText; continue; }
        if (r.type === CSSRule.FONT_FACE_RULE) { fontFaces.push({ css: r.cssText, base: (r.parentStyleSheet && r.parentStyleSheet.href) || location.href }); continue; }
        if (r.cssRules && !r.selectorText) { walk(r.cssRules); continue; }
        if (r.selectorText && r.style && r.style.animationName) {
          r.selectorText.split(',').forEach(function (sel) {
            var m = sel.match(/#([A-Za-z0-9_]+)\.ladi-animation/);
            if (m) anim[m[1]] = [r.style.animationName, r.style.animationDelay || '0s', r.style.animationDuration || '1s', r.style.animationIterationCount || '1'];
          });
        }
      }
    })(rules);
  }

  function pick(el, props) {
    if (!el) return {};
    var s = getComputedStyle(el), o = {};
    props.forEach(function (p) { o[p] = s.getPropertyValue(p); });
    return o;
  }
  var TXT = ['font-family', 'font-size', 'font-weight', 'font-style', 'color', 'line-height', 'letter-spacing', 'text-align', 'text-transform', 'text-shadow', 'text-decoration-line', 'background-image', '-webkit-background-clip', '-webkit-text-stroke-width', '-webkit-text-stroke-color'];
  var BOX = ['background-color', 'background-image', 'background-size', 'background-position', 'background-repeat', 'background-attachment', 'border-top-width', 'border-top-style', 'border-top-color', 'border-right-width', 'border-bottom-width', 'border-left-width', 'border-radius', 'box-shadow', 'opacity', 'filter', 'mix-blend-mode', '-webkit-mask-image', '-webkit-mask-size', '-webkit-mask-position', 'transform'];

  function node(el) {
    var s = getComputedStyle(el), inner = el.firstElementChild;
    var type = inner ? ([].slice.call(inner.classList).find(function (c) { return /^ladi-(group|headline|paragraph|list-paragraph|image|box|button|shape|line|countdown|form|html-code|popup|video|frame|gallery|carousel|tabs|collection)$/.test(c); }) || inner.tagName) : '?';
    var o = {
      id: el.id, type: type,
      cls: [].slice.call(el.classList).filter(function (c) { return !/^ladi-/.test(c); }).join(' '),
      pos: [s.left, s.top, s.width, s.height], z: s.zIndex, disp: s.display, position: s.position,
      fix: s.position === 'fixed' ? [s.left, s.right, s.top, s.bottom] : null,
      eop: s.opacity, anim: anim[el.id] || null, ev: ev[el.id] || null
    };
    if (type === 'ladi-group' || type === 'ladi-popup') {
      o.kids = [].slice.call(inner.children).filter(function (c) { return c.classList.contains('ladi-element'); }).map(node);
      if (type === 'ladi-popup') o.bg = pick(inner.querySelector('.ladi-popup-background'), BOX);
    } else if (/headline|paragraph/.test(type)) {
      o.html = inner.innerHTML.trim(); o.st = pick(inner, TXT);
    } else if (type === 'ladi-button') {
      var t = el.querySelector('.ladi-button-headline .ladi-headline');
      o.html = t ? t.innerHTML.trim() : ''; o.st = t ? pick(t, TXT) : {};
      o.bb = pick(el.querySelector('.ladi-button-background'), BOX);
      o.bst = pick(inner, ['border-radius', 'border-top-width', 'border-top-style', 'border-top-color', 'box-shadow']);
    } else if (type === 'ladi-box' || type === 'ladi-frame') {
      o.st = pick(inner, BOX);
    } else if (type === 'ladi-image') {
      o.st = pick(inner, BOX);
      var ib = inner.querySelector('.ladi-image-background'), is = getComputedStyle(ib);
      o.img = [is.backgroundImage, is.left, is.top, is.width, is.height];
    } else if (type === 'ladi-line') {
      var lc = inner.querySelector('.ladi-line-container'), er = el.getBoundingClientRect(), lr = lc.getBoundingClientRect();
      o.line = { box: [lr.left - er.left, lr.top - er.top, lr.width, lr.height],
        b: pick(lc, ['border-top', 'border-right', 'border-bottom', 'border-left']) };
    } else if (type === 'ladi-shape') {
      o.svg = inner.innerHTML.trim();
    } else if (type === 'ladi-countdown') {
      var cr = el.getBoundingClientRect();
      o.items = [].slice.call(inner.querySelectorAll(':scope > .ladi-element')).map(function (it) {
        var r = it.getBoundingClientRect();   // ô đếm ngược thường xếp bằng flex → lấy vị trí thật trên màn
        return { type: it.getAttribute('data-item-type'), pos: [(r.left - cr.left) + 'px', (r.top - cr.top) + 'px', r.width + 'px', r.height + 'px'],
          bg: pick(it.querySelector('.ladi-countdown-background'), BOX), st: pick(it.querySelector('.ladi-countdown-text'), TXT) };
      });
      o.layout = getComputedStyle(inner).display;
    } else if (type === 'ladi-form') {
      o.items = [].slice.call(inner.querySelectorAll(':scope > .ladi-element')).map(function (it) {
        var is = getComputedStyle(it), btn = it.querySelector('.ladi-button');
        var r = { id: it.id, pos: [is.left, is.top, is.width, is.height] };
        if (btn) {
          var tt = it.querySelector('.ladi-button-headline .ladi-headline');
          r.button = tt ? tt.innerHTML.trim() : ''; r.st = tt ? pick(tt, TXT) : {};
          r.bb = pick(it.querySelector('.ladi-button-background'), BOX);
          r.bst = pick(btn, ['border-radius', 'border-top-width', 'border-top-style', 'border-top-color']);
        } else {
          var ctl = it.querySelector('.ladi-form-control, .ladi-form-checkbox, input, select, textarea');
          r.html = (it.querySelector('.ladi-form-item') || it).innerHTML.replace(/<script[\s\S]*?<\/script>/g, '').trim();
          r.bg = pick(it.querySelector('.ladi-form-item-background'), BOX);
          r.st = pick(ctl, ['font-family', 'font-size', 'color', 'padding-left', 'padding-top', 'line-height']);
        }
        return r;
      });
    } else {
      // bỏ script làm rối / script LadiPage (bảo vệ bản quyền, tracking) — giữ phần còn lại để phân loại
      o.raw = inner ? inner.innerHTML.replace(/<script[\s\S]*?<\/script>/g, function (m) { return /_0x|LadiPage|ladi_/.test(m) ? '' : m; }) : '';
      if (o.raw && o.raw.length > 200000) o.raw = o.raw.slice(0, 200000);
    }
    return o;
  }

  var out = { sections: [], popups: [], keyframes: keyframes, fontFaces: fontFaces, audio: [], eventData: ev };
  document.querySelectorAll('.ladi-wraper > .ladi-section').forEach(function (sec) {
    if (sec.id === 'SECTION_POPUP') return;
    var bg = sec.querySelector(':scope > .ladi-section-background');
    var ov = sec.querySelector(':scope > .ladi-overlay');
    var cont = sec.querySelector(':scope > .ladi-container');
    out.sections.push({ id: sec.id, h: getComputedStyle(sec).height, disp: getComputedStyle(sec).display,
      bg: bg ? pick(bg, BOX) : null, ov: ov ? pick(ov, BOX) : null,
      kids: cont ? [].slice.call(cont.children).filter(function (c) { return c.classList.contains('ladi-element'); }).map(node) : [] });
  });
  // Popup: hiện tạm để đo, rồi ẩn lại
  document.querySelectorAll('#SECTION_POPUP .ladi-container > .ladi-element').forEach(function (p) {
    var old = p.style.display; p.style.display = 'block';
    var n = node(p); var s = getComputedStyle(p);
    n.box = [s.width, s.height, s.borderRadius];
    out.popups.push(n); p.style.display = old;
  });
  // Khối ẩn/hiện (collapse) đang display:none → đo lại khi hiện tạm
  function measureHidden(list) {
    list.forEach(function (n) {
      if (n.disp === 'none') {
        var el = document.getElementById(n.id);
        if (el) { var old = el.style.display; el.style.display = 'block'; var m = node(el); el.style.display = old; Object.assign(n, m, { disp: 'none' }); }
      }
      if (n.kids) measureHidden(n.kids);
    });
  }
  out.sections.forEach(function (s) { measureHidden(s.kids); });
  document.querySelectorAll('audio').forEach(function (a) {
    var src = a.getAttribute('src') || (a.querySelector('source') && a.querySelector('source').getAttribute('src'));
    if (src) out.audio.push(src);
  });
  out.title = document.title;
  var vw = document.documentElement.innerHTML.match(/var e = (\d+); var f = (\d+)/);
  out.dw = vw ? +vw[1] : 960; out.mw = vw ? +vw[2] : 420;
  return out;
};

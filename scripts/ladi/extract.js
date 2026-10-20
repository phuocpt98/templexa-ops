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
  // tắt mọi hiệu ứng để đo trạng thái tĩnh của thiết kế (xoay, phóng… không bị lẫn khung hình đang chạy)
  var stop = document.createElement('style'); stop.textContent = '*{animation:none!important;transition:none!important}'; document.head.appendChild(stop);
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
  var BOX = ['background-color', 'background-image', 'background-size', 'background-position', 'background-repeat', 'background-attachment', 'border-top-width', 'border-top-style', 'border-top-color', 'border-right-width', 'border-bottom-width', 'border-left-width', 'border-right-style', 'border-bottom-style', 'border-left-style', 'border-right-color', 'border-bottom-color', 'border-left-color', 'border-radius', 'box-shadow', 'opacity', 'filter', 'mix-blend-mode', '-webkit-mask-image', '-webkit-mask-size', '-webkit-mask-position', 'transform'];

  function node(el) {
    var s = getComputedStyle(el), inner = el.firstElementChild;
    var type = inner ? ([].slice.call(inner.classList).find(function (c) { return /^ladi-(group|headline|paragraph|list-paragraph|image|box|button|shape|line|countdown|form|html-code|popup|video|frame|gallery|carousel|tabs|collection)$/.test(c); }) || inner.tagName) : '?';
    var o = {
      id: el.id, type: type,
      cls: [].slice.call(el.classList).filter(function (c) { return !/^ladi-/.test(c); }).join(' '),
      pos: [s.left, s.top, s.width, s.height], z: s.zIndex, disp: s.display, position: s.position,
      fix: s.position === 'fixed' ? [s.left, s.right, s.top, s.bottom, s.transform] : null,
      eop: s.opacity, anim: anim[el.id] || null, ev: ev[el.id] || null,
      tf: s.position !== 'fixed' && s.transform !== 'none' ? s.transform : null
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
      o.img = [is.backgroundImage, is.left, is.top, is.width, is.height, is.backgroundSize, is.backgroundPosition];
    } else if (type === 'ladi-gallery') {
      var gv = inner.querySelector('.ladi-gallery-view'), gc = inner.querySelector('.ladi-gallery-control'), er0 = el.getBoundingClientRect();
      var rel = function (x) { if (!x) return null; var r = x.getBoundingClientRect(); return [r.left - er0.left, r.top - er0.top, r.width, r.height]; };
      o.gal = { view: rel(gv), ctrl: rel(gc),
        items: [].map.call(inner.querySelectorAll('.ladi-gallery-view-item'), function (x) { return getComputedStyle(x).backgroundImage; }),
        thumb: rel(inner.querySelector('.ladi-gallery-control-item')),
        thumbGap: (function () { var t = inner.querySelectorAll('.ladi-gallery-control-item'); return t.length > 1 ? t[1].getBoundingClientRect().left - t[0].getBoundingClientRect().left : 0; })(),
        viewSt: pick(gv, ['border-radius', 'background-size', 'background-color']), thumbSt: pick(inner.querySelector('.ladi-gallery-control-item'), ['border-radius', 'border-top-width', 'border-top-color', 'border-top-style']),
        itemSize: gv && inner.querySelector('.ladi-gallery-view-item') ? getComputedStyle(inner.querySelector('.ladi-gallery-view-item')).backgroundSize : 'cover' };
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
      // thuộc tính của khung bao (widget dùng class / data-* trên khung để định kiểu)
      o.attrs = {};
      var vars = [el, inner].map(function (x) { return x ? (x.getAttribute('style') || '').split(';').filter(function (d) { return /^\s*--/.test(d); }).join(';') : ''; }).filter(Boolean).join(';');
      if (vars) o.vars = vars;   // biến CSS widget ghi trên khung (--cd-num-fs…)
      [el, inner].forEach(function (x) { if (x) [].forEach.call(x.attributes, function (a) { if (!/^(id|style)$/.test(a.name) && !(a.name === 'class' && /^ladi-/.test(a.value))) o.attrs[a.name] = (o.attrs[a.name] ? o.attrs[a.name] + ' ' : '') + a.value.replace(/\bladi-[\w-]+/g, '').trim(); }); });
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
    var wasOpen = getComputedStyle(p).display !== 'none';
    var old = p.style.display; p.style.display = 'block';
    var n = node(p); var s = getComputedStyle(p); n.open = wasOpen;
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
  var vendor = '';
  for (var k2 = 0; k2 < document.styleSheets.length; k2++) {
    var sh = document.styleSheets[k2], own = sh.ownerNode, txt = '';
    try { txt = [].map.call(sh.cssRules, function (r) { return r.cssText; }).join('\n'); } catch (e) { continue; }
    var href = sh.href || '';
    if (href) { if (!/127\.0\.0\.1/.test(href) || /fonts\.css|StyleWedding\.css|MessageBoxFunction\.css/i.test(href)) continue; }
    else {
      if (own && (own.id || '').indexOf('style_') === 0) continue;                      // CSS của LadiPage
      if (own && own.closest && own.closest('.ladi-html-code')) continue;               // đã nằm trong khối HTML
      if ((txt.match(/\.ladi-|#(SECTION|HEADLINE|PARAGRAPH|IMAGE|BOX|GROUP|BUTTON)\d/g) || []).length > 10) continue;
    }
    vendor += '/* ' + (href ? href.split('/').pop() : 'style chèn lúc chạy') + ' */\n' + txt.replace(/@font-face[^}]*}/g, '') + '\n';
  }
  out.vendorCss = vendor;
  out.title = document.title;
  var vw = document.documentElement.innerHTML.match(/var e = (\d+); var f = (\d+)/);
  out.dw = vw ? +vw[1] : 960; out.mw = vw ? +vw[2] : 420;
  return out;
};

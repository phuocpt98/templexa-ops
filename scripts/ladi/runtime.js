/* Thiệp chuyển từ LadiPage — mã chạy chung (convert.js chèn nguyên khối này vào cuối index.html).
   Mọi thao tác đọc từ thuộc tính HTML, không phụ thuộc id cố định:
   data-a="tên thời-lượng trễ số-lần"  hiệu ứng khi cuộn tới
   data-act='[{"t":"popup","id":"…"}, {"t":"collapse","id":"…"}, {"t":"fn","fn":"sig.save"}, {"t":"section","id":"…"}, {"t":"toggle","id":"…"}]'
   .guest-name  tên khách theo ?name= / ?n= / ?ten=        .zoom  ảnh bấm phóng to (album)
   .off_speaker / .on_speaker + <audio id="bgm">  nút nhạc      .cd[data-at|data-daily]  đếm ngược
   form.lp-form  form xác nhận + lời chúc     #wishList  danh sách lời chúc (WISHES + máy khách)
   #sigBoard + #sigCanvas  lưu bút ký tên */
(function () {
  'use strict';
  var CFG = window.CARD || {};
  var KEY = CFG.key || 'tpx';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var store = {
    get: function (k) { try { return JSON.parse(localStorage.getItem(KEY + '_' + k) || '[]'); } catch (e) { return []; } },
    set: function (k, v) { try { localStorage.setItem(KEY + '_' + k, JSON.stringify(v)); } catch (e) {} }
  };
  function toast(msg) {
    var t = document.createElement('div'); t.className = 'toast'; t.textContent = msg;
    document.body.appendChild(t); setTimeout(function () { t.remove(); }, 2600);
  }

  // ---- Khung 420px co theo màn điện thoại; từ 768px dùng bố cục máy tính (CSS)
  var card = $('#card');
  function fit() {
    var w = document.documentElement.clientWidth;
    card.style.zoom = w < 768 ? w / (CFG.mw || 420) : 1;
    $$('.pop-box').forEach(function (b) {
      b.style.zoom = 1;
      var bw = parseFloat(getComputedStyle(b).width) || 420;
      if (b.parentNode.classList.contains('pop-full')) {   // popup phủ kín màn (phong bì mở thiệp)
        var z = w < 768 ? w / bw : 1; b.style.zoom = z; b.style.height = (window.innerHeight / z) + 'px';
        if (w >= 768) b.style.width = w + 'px';
      } else if (!b.parentNode.classList.contains('dropbox')) b.style.zoom = Math.min(1, (w - 12) / bw);
    });
  }
  fit(); window.addEventListener('resize', fit);

  // ---- Hiệu ứng xuất hiện
  function play(el) {
    if (el.classList.contains('shown')) return;
    var p = el.getAttribute('data-a').split(' ');
    setTimeout(function () {
      el.classList.add('shown');
      el.style.animation = p[0] + ' ' + p[1] + ' ' + (p[3] === 'infinite' ? 'infinite' : (p[3] || 1)) + ' both';
    }, parseFloat(p[2]) * 1000 || 0);
  }
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { play(e.target); io.unobserve(e.target); } });
  });
  $$('#card [data-a]').forEach(function (el) { io.observe(el); });

  // ---- Tên khách
  var q = new URLSearchParams(location.search);
  var guest = q.get('name') || q.get('n') || q.get('ten');
  if (guest) $$('.guest-name').forEach(function (el) { el.textContent = guest; });

  // ---- Nhạc
  var bgm = $('#bgm');
  if (bgm) {
    var sync = function () {
      $$('.on_speaker').forEach(function (e) { e.style.display = bgm.paused ? 'none' : 'block'; });
      $$('.off_speaker').forEach(function (e) { e.style.display = bgm.paused ? 'block' : 'none'; });
    };
    var tryPlay = function () { var p = bgm.play(); if (p && p.catch) p.catch(function () {}); };
    bgm.addEventListener('play', sync); bgm.addEventListener('pause', sync); sync();
    var first = function () { tryPlay(); ['click', 'touchstart', 'scroll'].forEach(function (ev) { window.removeEventListener(ev, first); }); };
    ['click', 'touchstart', 'scroll'].forEach(function (ev) { window.addEventListener(ev, first, { passive: true }); });
    $$('.off_speaker').forEach(function (e) { e.addEventListener('click', function (ev) { ev.stopPropagation(); tryPlay(); }); });
    $$('.on_speaker').forEach(function (e) { e.addEventListener('click', function (ev) { ev.stopPropagation(); bgm.pause(); }); });
    tryPlay();
  }

  // ---- Đếm ngược (đến ngày giờ cụ thể, hoặc kiểu "trong ngày" của LadiPage)
  $$('.cd').forEach(function (cd) {
    [['#cd-day', 'day'], ['#cd-hour', 'hour'], ['#cd-min', 'minute'], ['#cd-sec', 'seconds']].forEach(function (k) { var e = $(k[0], cd); if (e) e.setAttribute('data-cd', k[1]); });
    var at = cd.getAttribute('data-at') ? new Date(cd.getAttribute('data-at')) : (CFG.date ? new Date(CFG.date) : null);
    function pad(n) { return (n < 10 ? '0' : '') + n; }
    function tick() {
      var end = at;
      if (!end) { end = new Date(); end.setHours(23, 59, 59, 999); }
      var d = Math.max(0, end - Date.now()) / 1000;
      var v = { day: Math.floor(d / 86400), hour: Math.floor(d % 86400 / 3600), minute: Math.floor(d % 3600 / 60), seconds: Math.floor(d % 60) };
      $$('[data-cd]', cd).forEach(function (e) { e.textContent = pad(v[e.getAttribute('data-cd')]); });
    }
    tick(); setInterval(tick, 1000);
  });

  // ---- Popup
  function openPop(id) {
    var p = document.getElementById(id); if (!p) return;
    p.hidden = false; fit();
    $$('[data-a]', p).forEach(function (el) { el.classList.remove('shown'); el.style.animation = ''; play(el); });
  }
  $$('.pop').forEach(function (p) {
    p.addEventListener('click', function (e) { if (e.target === p || e.target.closest('.pop-x')) p.hidden = true; });
  });

  // ---- Khối ẩn/hiện: phần chứa nó cao thêm cho vừa
  function toggleCollapse(id) {
    var el = document.getElementById(id); if (!el) return;
    var sec = el.closest('.sec'); var open = !el.classList.contains('open');
    el.classList.toggle('open', open);
    if (sec) {
      if (!sec.dataset.h) sec.dataset.h = sec.offsetHeight;
      sec.style.height = open ? Math.max(+sec.dataset.h, el.offsetTop + el.offsetHeight + 20) + 'px' : '';
    }
  }

  // ---- Lưu bút ký tên
  var sig = { clear: function () {}, preview: function () {}, save: function () {} };
  var cv = $('#sigCanvas') || $('#wb-sig-canvas'), board = $('#sigBoard') || $('#wb-sig-display-inner');
  var wb = $('#wb-sig-root');
  if (cv && !cv.getAttribute('width')) cv.width = cv.clientWidth || 320;
  if (board && wb) { board.style.position = 'relative'; board.style.minHeight = '100%'; }
  if (cv && board) {
    var ctx = cv.getContext('2d'), drawing = false, last = null, lw = 2, preview = null;
    var ink = CFG.ink || '#6A6A6A';
    var pt = function (e) {
      var r = cv.getBoundingClientRect(), t = e.touches ? e.touches[0] : e;
      return { x: (t.clientX - r.left) * cv.width / r.width, y: (t.clientY - r.top) * cv.height / r.height, t: Date.now() };
    };
    var down = function (e) { e.preventDefault(); drawing = true; last = pt(e); };
    var move = function (e) {
      if (!drawing) return; e.preventDefault();
      var p = pt(e), v = Math.hypot(p.x - last.x, p.y - last.y) / Math.max(1, p.t - last.t);
      lw = lw * 0.6 + (Math.max(1, Math.min(5, 7 - v * 0.2)) + 1.5) * 0.4;
      ctx.lineWidth = lw; ctx.lineCap = ctx.lineJoin = 'round'; ctx.strokeStyle = ink;
      ctx.beginPath(); ctx.moveTo(last.x, last.y); ctx.lineTo(p.x, p.y); ctx.stroke(); last = p;
    };
    var up = function () { drawing = false; };
    cv.addEventListener('mousedown', down); cv.addEventListener('mousemove', move); window.addEventListener('mouseup', up);
    cv.addEventListener('touchstart', down, { passive: false }); cv.addEventListener('touchmove', move, { passive: false }); cv.addEventListener('touchend', up);
    var hasInk = function () {
      var d = ctx.getImageData(0, 0, cv.width, cv.height).data;
      for (var i = 3; i < d.length; i += 4) if (d[i] > 20) return true;
      return false;
    };
    var drag = function (el) {
      var sx, sy, ox, oy, on = false;
      var d = function (e) { e.preventDefault(); on = true; var t = e.touches ? e.touches[0] : e; sx = t.clientX; sy = t.clientY; ox = parseFloat(el.style.left); oy = parseFloat(el.style.top); };
      var m = function (e) {
        if (!on) return; e.preventDefault();
        var t = e.touches ? e.touches[0] : e, r = board.getBoundingClientRect();
        el.style.left = Math.max(0, Math.min(85, ox + (t.clientX - sx) / r.width * 100)) + '%';
        el.style.top = Math.max(0, Math.min(92, oy + (t.clientY - sy) / r.height * 100)) + '%';
      };
      var u = function () { on = false; };
      el.addEventListener('mousedown', d); window.addEventListener('mousemove', m); window.addEventListener('mouseup', u);
      el.addEventListener('touchstart', d, { passive: false }); window.addEventListener('touchmove', m, { passive: false }); window.addEventListener('touchend', u);
    };
    var saveBtns = function (show) { $$('.sig-save').forEach(function (b) { b.style.display = show ? '' : 'none'; }); };
    saveBtns(false);
    sig.clear = function () { ctx.clearRect(0, 0, cv.width, cv.height); if (preview) { preview.remove(); preview = null; } saveBtns(false); };
    sig.preview = function () {
      if (!hasInk()) { toast('Bạn ký tên vào khung trước nhé!'); return; }
      if (!preview) {
        preview = document.createElement('img'); preview.className = 'sig-new';
        preview.style.left = '40%'; preview.style.top = '40%'; board.appendChild(preview); drag(preview);
      }
      preview.src = cv.toDataURL('image/png'); saveBtns(true);
      board.scrollIntoView({ behavior: 'smooth', block: 'center' });
      toast('Kéo chữ ký tới chỗ bạn thích rồi bấm Lưu');
    };
    sig.save = function () {
      if (!preview) { toast('Bấm "Xem thử" trước khi lưu nhé!'); return false; }
      var list = store.get('signatures');
      list.push({ image: preview.src, x: parseFloat(preview.style.left), y: parseFloat(preview.style.top) });
      store.set('signatures', list);
      preview.classList.remove('sig-new'); preview = null;
      ctx.clearRect(0, 0, cv.width, cv.height); saveBtns(false);
      toast('Chữ ký của bạn đã được lưu trên thiệp!');
    };
    store.get('signatures').forEach(function (s) {
      var im = document.createElement('img'); im.src = s.image; im.style.left = s.x + '%'; im.style.top = s.y + '%'; im.alt = '';
      board.appendChild(im);
    });
  }

  if (wb) {   // widget lưu bút kiểu mới: mở khung ký → Chỉnh vị trí (xem thử) → Lưu
    var pad = $('#wb-sig-pad'), posBtns = $('#wb-sig-pos-btns'), openRow = $('#wb-sig-btn-row');
    var showEl = function (e, on) { if (e) e.style.display = on ? 'block' : 'none'; };
    showEl(pad, false); showEl(posBtns, false);
    var bind = function (id, fn) { var b = document.getElementById(id); if (b) b.addEventListener('click', function (e) { e.preventDefault(); fn(); }); };
    bind('wb-sig-open-btn', function () { showEl(pad, true); showEl(openRow, false); if (!cv.width || cv.width < 50) cv.width = cv.clientWidth || 320; });
    bind('wb-sig-btn-clear', function () { sig.clear(); });
    bind('wb-sig-btn-cancel', function () { sig.clear(); showEl(pad, false); showEl(openRow, true); });
    bind('wb-sig-btn-pos', function () { sig.preview(); if ($('.sig-new')) { showEl(pad, false); showEl(posBtns, true); } });
    bind('wb-sig-btn-back', function () { showEl(posBtns, false); showEl(pad, true); });
    bind('wb-sig-btn-save', function () { if (sig.save() !== false) { showEl(posBtns, false); showEl(openRow, true); } });
  }

  // ---- Widget form kiểu mới (wb-rsvp-form / wb-msg-form)
  $$('.wb-opt-group').forEach(function (g) {
    $$('.wb-opt-label', g).forEach(function (o) {
      o.addEventListener('click', function () {
        $$('.wb-opt-label', g).forEach(function (x) { x.classList.toggle('active', x === o); });
        if (g.getAttribute('data-name') === 'attendance') {
          var f = g.closest('.wb-rsvp-form'), c = f && $('.wb-guest-count-field', f);
          if (c) c.style.display = o.getAttribute('data-val') === 'yes' ? '' : 'none';
        }
      });
    });
  });
  $$('.wb-counter').forEach(function (c) {
    var v = $('.wb-counter-val', c);
    $('.wb-dec', c).addEventListener('click', function () { v.value = Math.max(1, (+v.value || 1) - 1); });
    $('.wb-inc', c).addEventListener('click', function () { v.value = (+v.value || 1) + 1; });
  });
  $$('.wb-form-textarea').forEach(function (t) {
    var n = t.parentNode.querySelector('.wb-char-num');
    t.addEventListener('input', function () { if (n) n.textContent = t.value.length; });
  });
  $$('.wb-submit-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var f = btn.closest('.wb-msg-form, .wb-rsvp-form'); if (!f) return;
      var name = ($('input[name=name]', f) || {}).value || '';
      var fb = $('.wb-feedback', f);
      if (!name.trim()) { if (fb) fb.textContent = 'Bạn nhập tên giúp mình nhé!'; return; }
      var msgEl = $('textarea', f);
      if (msgEl && msgEl.value.trim()) {
        var l = store.get('wishes'); l.unshift({ name: name.trim(), message: msgEl.value.trim() }); store.set('wishes', l);
        if (wl) wl.insertBefore(wishEl(name.trim(), msgEl.value.trim()), wl.firstChild);
        msgEl.value = ''; var cn = $('.wb-char-num', f); if (cn) cn.textContent = '0';
        if (fb) fb.textContent = 'Cảm ơn bạn đã gửi lời chúc!';
      } else if (fb) fb.textContent = 'Cảm ơn bạn đã xác nhận!';
      toast(msgEl ? 'Cảm ơn bạn đã gửi lời chúc!' : 'Cảm ơn bạn đã xác nhận tham dự!');
    });
  });

  // ---- Lời chúc
  var wl = $('#wishList');
  function wishEl(n, m) {
    var d = document.createElement('div'); d.className = 'wish';
    var b = document.createElement('b'); b.textContent = n; var p = document.createElement('p'); p.textContent = m;
    d.appendChild(b); d.appendChild(p); return d;
  }
  if (wl) store.get('wishes').concat(window.WISHES || []).forEach(function (w) { wl.appendChild(wishEl(w.name || w[0], w.message || w[1])); });
  var syncEmpty = function () { $$('.wish-empty').forEach(function (e) { e.style.display = wl && wl.children.length ? 'none' : ''; }); };
  syncEmpty(); if (wl) new MutationObserver(syncEmpty).observe(wl, { childList: true });

  // ---- Form xác nhận tham dự + lời chúc
  $$('form.lp-form').forEach(function (f) {
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = (f.querySelector('[name=name]') || {}).value || 'Khách mời';
      var msgEl = f.querySelector('[name=message]') || f.querySelector('textarea');
      var msg = msgEl ? msgEl.value.trim() : '';
      if (msg) {
        var l = store.get('wishes'); l.unshift({ name: name.trim(), message: msg }); store.set('wishes', l);
        if (wl) wl.insertBefore(wishEl(name.trim(), msg), wl.firstChild);
      }
      f.reset();
      if (f.getAttribute('data-popup')) openPop(f.getAttribute('data-popup'));
      else toast('Cảm ơn bạn đã gửi lời chúc!');
    });
  });

  // ---- Hành động bấm (popup, ẩn/hiện, cuộn tới phần, hàm lưu bút)
  var FN = { 'sig.clear': function () { sig.clear(); }, 'sig.preview': function () { sig.preview(); }, 'sig.save': function () { return sig.save(); } };
  function setShown(id, on) {
    var x = document.getElementById(id); if (!x) return;
    if (x.classList.contains('pop')) { if (on) openPop(id); else x.hidden = true; return; }
    if (on) x.classList.remove('hid', 'hid-m', 'hid-d'); else x.classList.add('hid');
    if (x.classList.contains('collapse-target')) x.classList.toggle('open', on);
    if (on) $$('[data-a]', x).concat(x.hasAttribute('data-a') ? [x] : []).forEach(function (k) { io.observe(k); });
  }
  function dropbox(id, el, at) {
    var p = document.getElementById(id); if (!p) return;
    if (!p.hidden) { p.hidden = true; return; }
    p.hidden = false; var box = $('.pop-box', p), r = el.getBoundingClientRect();
    box.style.position = 'fixed'; box.style.zoom = 1;
    var bw = box.offsetWidth, z = (card.style.zoom || 1) * 1;
    box.style.zoom = z;
    var left = /right/.test(at) ? (r.right / z - bw) : (r.left / z);
    box.style.left = Math.max(4, left) + 'px'; box.style.top = (r.bottom / z + 4) + 'px';
  }
  $$('[data-act]').forEach(function (el) {
    var acts = JSON.parse(el.getAttribute('data-act'));
    var run = function (on, leave) {
      for (var i = 0; i < acts.length; i++) {
        var a = acts[i];
        if ((a.on || 'click') !== on) continue;
        if (a.ms && !a._d) { setTimeout(function (x) { x._d = true; doAct(x, leave); x._d = false; }.bind(null, a), a.ms); continue; }
        if (doAct(a, leave) === false) break;
      }
    };
    var doAct = function (a, leave) {
      {
        if (a.t === 'fn' && FN[a.fn] && FN[a.fn]() === false) return false;
        if (a.t === 'popup') openPop(a.id);
        if (a.t === 'collapse') toggleCollapse(a.id);
        if (a.t === 'toggle') { var x = document.getElementById(a.id); if (x) x.classList.toggle('open'); }
        if (a.t === 'section') { var s = document.getElementById(a.id); if (s) s.scrollIntoView({ behavior: 'smooth' }); }
        if (a.t === 'show') a.ids.forEach(function (id) { setShown(id, !leave); });
        if (a.t === 'hide') a.ids.forEach(function (id) { setShown(id, !!leave); });
        if (a.t === 'style') { var t = document.getElementById(a.id); if (t) { if (leave) t.style.cssText = t.dataset.css0 || ''; else { if (t.dataset.css0 === undefined) t.dataset.css0 = t.style.cssText; t.style.cssText += ';' + a.css; } } }
        if (a.t === 'copy') {
          var txt = a.text || (el.closest('.el[id^=g]') || el).innerText.replace(/\s+/g, ' ').trim();
          var m = txt.match(/\d[\d\s.]{5,}\d/); if (m) txt = m[0].replace(/[\s.]/g, '');
          if (navigator.clipboard) navigator.clipboard.writeText(txt).then(function () { toast('Đã sao chép: ' + txt); }, function () { toast(txt); }); else toast(txt);
        }
        if (a.t === 'dropbox') dropbox(a.id, el, a.at);
        if (a.t === 'hideLater') setTimeout(function (sel) { $$(sel).forEach(function (h) { h.style.display = 'none'; }); }.bind(null, a.sel), a.ms);
        if (a.t === 'hideSel') $$(a.sel).forEach(function (h) { h.style.display = 'none'; });
        if (a.t === 'showSel') $$(a.sel).forEach(function (h) { h.style.display = ''; });
        if (a.t === 'link') location.href = a.href;
      }
    };
    if (acts.some(function (a) { return (a.on || 'click') === 'click'; })) {
      el.style.cursor = 'pointer';
      el.addEventListener('click', function (e) { e.stopPropagation(); run('click'); });
    }
    if (acts.some(function (a) { return a.on === 'hover'; })) {
      el.addEventListener('mouseenter', function () { run('hover'); });
      el.addEventListener('mouseleave', function () { run('hover', true); });
    }
  });
  // popup tự mở khi tải trang (phong bì…)
  $$('.pop[data-open]').forEach(function (p) { setTimeout(function () { openPop(p.id); }, +p.getAttribute('data-open') || 0); });

  // ---- Trình chiếu ảnh (ladi-gallery): mũi tên, ảnh nhỏ, tự chuyển, vuốt
  $$('.gal').forEach(function (g) {
    var ss = $$('.gal-s', g), ts = $$('.gal-t', g), i = 0, tr = $('.gal-tr', g);
    var go = function (k) {
      i = (k + ss.length) % ss.length;
      ss.forEach(function (x, j) { x.classList.toggle('on', j === i); });
      ts.forEach(function (x, j) { x.classList.toggle('on', j === i); });
      if (tr && ts[i]) tr.scrollTo({ left: ts[i].offsetLeft - tr.clientWidth / 2 + ts[i].offsetWidth / 2, behavior: 'smooth' });
    };
    $('.gal-prev', g).addEventListener('click', function (e) { e.stopPropagation(); go(i - 1); });
    $('.gal-next', g).addEventListener('click', function (e) { e.stopPropagation(); go(i + 1); });
    ts.forEach(function (t, j) { t.addEventListener('click', function () { go(j); }); });
    var sx = 0, v = $('.gal-v', g);
    v.addEventListener('touchstart', function (e) { sx = e.changedTouches[0].screenX; }, { passive: true });
    v.addEventListener('touchend', function (e) { var dx = e.changedTouches[0].screenX - sx; if (dx < -40) go(i + 1); if (dx > 40) go(i - 1); }, { passive: true });
    var ms = +g.getAttribute('data-auto'); if (ms) setInterval(function () { if (!document.hidden) go(i + 1); }, ms);
  });

  // ---- Album: bấm ảnh phóng to, vuốt/nút chuyển ảnh
  var lb = $('#lightbox');
  if (lb) {
    var lbImg = $('img', lb), pics = [], cur = 0;
    var urlOf = function (el) { var i = $('.ladi-image-background', el) || $('i', el) || el; var m = getComputedStyle(i).backgroundImage.match(/url\("?(.*?)"?\)/); return m ? m[1] : ''; };
    var show = function (i) { cur = (i + pics.length) % pics.length; lbImg.style.opacity = '.3'; lbImg.src = pics[cur]; };
    lbImg.onload = function () { lbImg.style.opacity = '1'; };
    $$('.zoom, .snap .photoBookImage').forEach(function (el) {
      el.addEventListener('click', function () {
        pics = $$('.zoom, .snap .photoBookImage').filter(function (x) { return x.offsetParent; }).map(urlOf).filter(function (u, i, a) { return u && a.indexOf(u) === i; });
        show(Math.max(0, pics.indexOf(urlOf(el)))); lb.hidden = false; document.body.style.overflow = 'hidden';
      });
    });
    var closeLb = function () { lb.hidden = true; document.body.style.overflow = ''; };
    $('.lb-x', lb).addEventListener('click', closeLb);
    $('.lb-prev', lb).addEventListener('click', function () { show(cur - 1); });
    $('.lb-next', lb).addEventListener('click', function () { show(cur + 1); });
    lb.addEventListener('click', function (e) { if (e.target === lb) closeLb(); });
    document.addEventListener('keydown', function (e) {
      if (lb.hidden) return;
      if (e.key === 'Escape') closeLb(); else if (e.key === 'ArrowLeft') show(cur - 1); else if (e.key === 'ArrowRight') show(cur + 1);
    });
    var sx = 0;
    lb.addEventListener('touchstart', function (e) { sx = e.changedTouches[0].screenX; }, { passive: true });
    lb.addEventListener('touchend', function (e) { var dx = e.changedTouches[0].screenX - sx; if (dx < -50) show(cur + 1); if (dx > 50) show(cur - 1); }, { passive: true });
  }
})();

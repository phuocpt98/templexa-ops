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
      var bw = parseFloat(getComputedStyle(b).width) || 420;
      b.style.zoom = Math.min(1, (w - 12) / bw);
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
    var at = cd.getAttribute('data-at') ? new Date(cd.getAttribute('data-at')) : null;
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
  var cv = $('#sigCanvas'), board = $('#sigBoard');
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

  // ---- Lời chúc
  var wl = $('#wishList');
  function wishEl(n, m) {
    var d = document.createElement('div'); d.className = 'wish';
    var b = document.createElement('b'); b.textContent = n; var p = document.createElement('p'); p.textContent = m;
    d.appendChild(b); d.appendChild(p); return d;
  }
  if (wl) store.get('wishes').concat(window.WISHES || []).forEach(function (w) { wl.appendChild(wishEl(w.name || w[0], w.message || w[1])); });

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
  $$('[data-act]').forEach(function (el) {
    var acts = JSON.parse(el.getAttribute('data-act'));
    el.style.cursor = 'pointer';
    el.addEventListener('click', function (e) {
      e.stopPropagation();
      for (var i = 0; i < acts.length; i++) {
        var a = acts[i];
        if (a.t === 'fn' && FN[a.fn] && FN[a.fn]() === false) break;
        if (a.t === 'popup') openPop(a.id);
        if (a.t === 'collapse') toggleCollapse(a.id);
        if (a.t === 'toggle') { var x = document.getElementById(a.id); if (x) x.classList.toggle('open'); }
        if (a.t === 'section') { var s = document.getElementById(a.id); if (s) s.scrollIntoView({ behavior: 'smooth' }); }
      }
    });
  });

  // ---- Album: bấm ảnh phóng to, vuốt/nút chuyển ảnh
  var lb = $('#lightbox');
  if (lb) {
    var lbImg = $('img', lb), pics = [], cur = 0;
    var urlOf = function (el) { var i = $('i', el) || el; var m = getComputedStyle(i).backgroundImage.match(/url\("?(.*?)"?\)/); return m ? m[1] : ''; };
    var show = function (i) { cur = (i + pics.length) % pics.length; lbImg.style.opacity = '.3'; lbImg.src = pics[cur]; };
    lbImg.onload = function () { lbImg.style.opacity = '1'; };
    $$('.zoom').forEach(function (el) {
      el.addEventListener('click', function () {
        pics = $$('.zoom').map(urlOf).filter(function (u, i, a) { return u && a.indexOf(u) === i; });
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

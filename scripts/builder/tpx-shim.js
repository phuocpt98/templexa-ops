/* Templexa — thay phần máy chủ của bộ thiệp builder (view.js) bằng lưu trên máy khách (localStorage).
   port.js chèn file này TRƯỚC view.js.
   - fetch php/rsvp.php, php/message.php → lưu localStorage, trả {status:'ok'} (view.js tự hiện popup cảm ơn)
   - #MessageBox: hiện lời chúc đã gửi (chế độ "tất cả mọi người")
   - widget ký tên #wb-sig-root: ký → Chỉnh vị trí (kéo thả trên ảnh) → Lưu */
(function () {
  'use strict';
  var KEY = window.TPX_KEY || 'tpx';
  var store = {
    get: function (k) { try { return JSON.parse(localStorage.getItem(KEY + '_' + k) || '[]'); } catch (e) { return []; } },
    set: function (k, v) { try { localStorage.setItem(KEY + '_' + k, JSON.stringify(v)); } catch (e) {} }
  };
  var $ = function (s, r) { return (r || document).querySelector(s); };
  function toast(msg) {
    var t = document.createElement('div'); t.className = 'tpx-toast'; t.textContent = msg;
    document.body.appendChild(t); setTimeout(function () { t.remove(); }, 2600);
  }
  var css = document.createElement('style');
  css.textContent = '.tpx-toast{position:fixed;left:50%;bottom:80px;transform:translateX(-50%);z-index:99999;background:rgba(40,40,40,.92);color:#fff;font:14px system-ui,sans-serif;padding:10px 16px;border-radius:20px;max-width:90vw;text-align:center}'
    + '.tpx-wish{margin:0 0 12px;padding:14px 16px;background:rgba(255,255,255,.8);border-radius:10px;box-shadow:0 2px 8px rgba(0,0,0,.06);text-align:left;white-space:pre-line}'
    + '.tpx-wish b{display:block;margin-bottom:6px}'
    + '#wb-sig-display-inner .wb-sig-item{position:absolute;width:30%;height:auto;opacity:1}'
    + '#wb-sig-display-inner .sig-new{outline:1px dashed rgba(255,255,255,.9);cursor:move;z-index:3;pointer-events:auto}';
  document.head.appendChild(css);

  // ---- 1. Gửi xác nhận / lời chúc
  var realFetch = window.fetch;
  window.fetch = function (u, o) {
    var m = /\/php\/(rsvp|message)\.php/.exec(String(u));
    if (!m) return realFetch.apply(this, arguments);
    var rec = { t: Date.now() };
    if (o && o.body && o.body.forEach) o.body.forEach(function (v, k) { rec[k] = v; });
    var kind = m[1] === 'rsvp' ? 'rsvp' : 'wishes';
    var list = store.get(kind); list.push(rec); store.set(kind, list);
    if (kind === 'wishes') setTimeout(renderWishes, 0);
    return Promise.resolve(new Response(JSON.stringify({ status: 'ok' }), { headers: { 'Content-Type': 'application/json' } }));
  };

  // ---- 2. Danh sách lời chúc
  function renderWishes() {
    var box = $('#MessageBox'); if (!box) return;
    var list = store.get('wishes').filter(function (w) { return !/private|rieng|chỉ/i.test(w.visibility || ''); });
    if (!list.length) return;
    var ph = $('#MessageBox-placeholder'); if (ph) ph.style.display = 'none';
    Array.prototype.slice.call(box.querySelectorAll('.tpx-wish')).forEach(function (x) { x.remove(); });
    list.slice().reverse().forEach(function (w) {
      var d = document.createElement('div'); d.className = 'tpx-wish';
      var b = document.createElement('b'); b.textContent = w.name || 'Khách mời';
      var p = document.createElement('span'); p.textContent = w.message || '';
      d.appendChild(b); d.appendChild(p); box.appendChild(d);
    });
  }

  // ---- 3. Widget ký tên
  function initSig() {
    var root = $('#wb-sig-root'), cv = $('#wb-sig-canvas'), board = $('#wb-sig-display-inner');
    if (!root || !cv || !board) return;
    var pad = $('#wb-sig-pad'), posBtns = $('#wb-sig-pos-btns'), openRow = $('#wb-sig-btn-row');
    var show = function (e, on, d) { if (e) e.style.display = on ? (d || 'block') : 'none'; };
    var ctx = cv.getContext('2d'), drawing = false, last = null, lw = 2, preview = null;
    var ink = window.colorSignature || '#333';
    var fit = function () { if (cv.clientWidth && cv.width !== cv.clientWidth) cv.width = cv.clientWidth; };
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
        el.style.left = Math.max(0, Math.min(70, ox + (t.clientX - sx) / r.width * 100)) + '%';
        el.style.top = Math.max(0, Math.min(90, oy + (t.clientY - sy) / r.height * 100)) + '%';
      };
      var u = function () { on = false; };
      el.addEventListener('mousedown', d); window.addEventListener('mousemove', m); window.addEventListener('mouseup', u);
      el.addEventListener('touchstart', d, { passive: false }); window.addEventListener('touchmove', m, { passive: false }); window.addEventListener('touchend', u);
    };
    var addImg = function (src, x, y) {
      var im = document.createElement('img'); im.className = 'wb-sig-item'; im.alt = ''; im.src = src;
      im.style.left = x + '%'; im.style.top = y + '%'; board.appendChild(im); return im;
    };
    store.get('signatures').forEach(function (s) { addImg(s.image, s.x, s.y); });
    var clear = function () { ctx.clearRect(0, 0, cv.width, cv.height); if (preview) { preview.remove(); preview = null; } };
    var bind = function (id, fn) { var b = document.getElementById(id); if (b) b.addEventListener('click', function (e) { e.preventDefault(); fn(); }); };
    bind('wb-sig-open-btn', function () { show(pad, true); show(openRow, false); fit(); });
    bind('wb-sig-btn-clear', clear);
    bind('wb-sig-btn-cancel', function () { clear(); show(pad, false); show(openRow, true, 'flex'); });
    bind('wb-sig-btn-pos', function () {
      if (!hasInk()) { toast('Bạn ký tên vào khung trước nhé!'); return; }
      if (!preview) { preview = addImg('', 35, 40); preview.classList.add('sig-new'); drag(preview); }
      preview.src = cv.toDataURL('image/png');
      show(pad, false); show(posBtns, true, 'flex');
      board.scrollIntoView({ behavior: 'smooth', block: 'center' });
      toast('Kéo chữ ký tới chỗ bạn thích rồi bấm Lưu');
    });
    bind('wb-sig-btn-back', function () { show(posBtns, false); show(pad, true); });
    bind('wb-sig-btn-save', function () {
      if (!preview) return;
      var list = store.get('signatures');
      list.push({ image: preview.src, x: parseFloat(preview.style.left), y: parseFloat(preview.style.top) });
      store.set('signatures', list);
      preview.classList.remove('sig-new'); preview = null;
      ctx.clearRect(0, 0, cv.width, cv.height);
      show(posBtns, false); show(openRow, true, 'flex');
      toast('Chữ ký của bạn đã được lưu trên thiệp!');
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { renderWishes(); initSig(); });
  else { renderWishes(); initSig(); }
})();

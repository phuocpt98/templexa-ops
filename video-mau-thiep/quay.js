/**
 * quay.js — Quay video giới thiệu mẫu thiệp theo kịch bản.
 *
 *   node video-mau-thiep/quay.js <id-mau> [--hd] [--giay N] [--fps N] [--tai-font]
 *     <id-mau>    tên file kich-ban/<id-mau>.json (vd gen-269-dusty-rose)
 *     --hd        vẽ ở 2× rồi thu về 1080×1920 (nét hơn, quay lâu gấp ~3)
 *     --giay N    chỉ quay N giây đầu (thử nhanh)
 *     --fps N     số khung/giây (mặc định 30)
 *     --tai-font  chỉ tải font Google của thiệp vào font-cache/ rồi thoát (chạy ở máy CÓ mạng, commit font-cache/)
 *
 * Font: Google Fonts luôn đọc từ font-cache/ (lưu trong git), không ra mạng — máy Muse không vào được
 * fonts.googleapis.com. Thiếu font → script báo và DỪNG, không quay ra video sai chữ.
 *
 * Cách quay: KHÔNG ghi màn hình theo thời gian thật. Script đóng băng đồng hồ của trang
 * (setTimeout, requestAnimationFrame, Date, animation CSS) rồi tự đẩy thời gian từng 1/FPS giây,
 * chụp đúng 1 ảnh mỗi khung. Máy chậm hay nhanh thì video vẫn đủ khung đều nhau, cuộn và hiệu ứng
 * đều tăm tắp — không cần bồi khung (minterpolate) nên không nhoè.
 */
const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { execFileSync } = require('child_process');

const FOLDER = __dirname;
const OPS_ROOT = path.join(FOLDER, '..');
// Muse: Templexa nằm trong ops/ · máy chủ shop: Templexa nằm cạnh templexa-ops/
const TEMPLEXA = [path.join(OPS_ROOT, 'Templexa'), path.join(OPS_ROOT, '..', 'Templexa')].find((p) => fs.existsSync(p));
if (!TEMPLEXA) { console.error('LOI: không thấy thư mục Templexa/'); process.exit(1); }
const puppeteer = require(path.join(TEMPLEXA, 'node_modules/puppeteer'));

const args = process.argv.slice(2);
const ID = args.find((a) => !a.startsWith('--') && !/^\d+$/.test(a));
const opt = (k) => (args.includes(k) ? +args[args.indexOf(k) + 1] : 0);
const HD = args.includes('--hd');
const GIAY = opt('--giay');
const TAI_FONT = args.includes('--tai-font');
const FONT_DIR = path.join(FOLDER, 'font-cache');
if (!ID) { console.error('Dùng: node quay.js <id-mau> [--hd] [--giay N]'); process.exit(1); }
const CFG = JSON.parse(fs.readFileSync(path.join(FOLDER, 'kich-ban', ID + '.json'), 'utf8'));

const FPS = opt('--fps') || 30, DT = 1000 / FPS;
const PORT = 8791;
const MIME = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css',
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp',
  '.mp3': 'audio/mpeg', '.svg': 'image/svg+xml', '.json': 'application/json',
  '.woff': 'font/woff', '.woff2': 'font/woff2', '.gif': 'image/gif', '.ico': 'image/x-icon',
};

// /Templexa/... → thư mục Templexa, còn lại → templexa-ops/
function resolveFile(urlPath) {
  if (urlPath.startsWith('/Templexa/')) return path.join(TEMPLEXA, urlPath.slice('/Templexa/'.length));
  return path.join(OPS_ROOT, urlPath);
}

function startServer() {
  return new Promise((resolve) => {
    const srv = http.createServer((req, res) => {
      try {
        const file = resolveFile(decodeURIComponent(req.url.split('?')[0]));
        if (!fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404); res.end('not found'); return; }
        const ext = path.extname(file).toLowerCase();
        const headers = { 'Content-Type': MIME[ext] || 'application/octet-stream' };
        if (ext !== '.html') headers['Cache-Control'] = 'public, max-age=3600';
        res.writeHead(200, headers);
        fs.createReadStream(file).pipe(res);
      } catch (e) { res.writeHead(500); res.end('err'); }
    });
    srv.listen(PORT, '127.0.0.1', () => resolve(srv));
  });
}

// Đồng hồ ảo — chạy trong MỌI khung (sân khấu + iframe thiệp) trước script của trang.
const VIRTUAL_TIME = `(() => {
  if (window.__vt) return;
  let now = 0, tid = 1, rid = 1, rafs = [];
  const timers = new Map(), base = Date.now(), ODate = Date;
  function VDate(...a) {
    if (!(this instanceof VDate)) return new ODate(base + now).toString();
    return a.length ? new ODate(...a) : new ODate(base + now);
  }
  VDate.prototype = ODate.prototype; VDate.now = () => base + now; VDate.parse = ODate.parse; VDate.UTC = ODate.UTC;
  window.Date = VDate;
  performance.now = () => now;
  window.setTimeout = (fn, ms, ...a) => { const id = tid++; timers.set(id, { fn, at: now + Math.max(0, +ms || 0), a }); return id; };
  window.setInterval = (fn, ms, ...a) => { const id = tid++, iv = Math.max(4, +ms || 0); timers.set(id, { fn, at: now + iv, iv, a }); return id; };
  window.clearTimeout = window.clearInterval = (id) => timers.delete(id);
  window.requestAnimationFrame = (fn) => { const id = rid++; rafs.push({ id, fn }); return id; };
  window.cancelAnimationFrame = (id) => { rafs = rafs.filter((r) => r.id !== id); };
  const start = new WeakMap();
  window.__vt = {
    advance(ms) {
      const target = now + ms;
      for (let g = 0; g < 5000; g++) {
        let pick = null;
        for (const [id, t] of timers) if (t.at <= target && (!pick || t.at < pick[1].at)) pick = [id, t];
        if (!pick) break;
        const [id, t] = pick;
        now = Math.max(now, t.at);
        if (t.iv) t.at += t.iv; else timers.delete(id);
        try { typeof t.fn === 'function' ? t.fn(...t.a) : (0, eval)(t.fn); } catch (e) {}
      }
      now = target;
      const list = rafs; rafs = [];
      list.forEach((r) => { try { r.fn(now); } catch (e) {} });
      document.getAnimations().forEach((an) => {
        if (!start.has(an)) { start.set(an, now); an.pause(); }
        an.currentTime = now - start.get(an);
      });
    },
  };
})();`;

(async () => {
  const srv = await startServer();
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'quay-'));
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--no-proxy-server', '--autoplay-policy=no-user-gesture-required', '--hide-scrollbars', '--mute-audio'],
    });
    const page = await browser.newPage();
    await page.setViewport({ width: 1080, height: 1920, deviceScaleFactor: HD ? 2 : 1 });
    await page.evaluateOnNewDocument(VIRTUAL_TIME);

    // Chỉ cho nạp file local. Google Fonts trả từ font-cache/ (--tai-font: tải thật rồi lưu vào đó).
    // Mọi đường ra mạng khác bị chặn để không chờ mạng.
    fs.mkdirSync(FONT_DIR, { recursive: true });
    const isFont = (u) => u.startsWith('https://fonts.googleapis.com/') || u.startsWith('https://fonts.gstatic.com/');
    const fontFile = (u) => path.join(FONT_DIR, require('crypto').createHash('sha1').update(u).digest('hex').slice(0, 16)
      + (u.includes('fonts.googleapis.com') ? '.css' : '.woff2'));
    const missing = new Set();
    await page.setRequestInterception(true);
    page.on('request', (r) => {
      const u = r.url();
      if (isFont(u)) {
        const f = fontFile(u);
        if (fs.existsSync(f)) return r.respond({ status: 200, body: fs.readFileSync(f),
          contentType: f.endsWith('.css') ? 'text/css; charset=utf-8' : 'font/woff2',
          headers: { 'Access-Control-Allow-Origin': '*' } }).catch(() => {});
        if (TAI_FONT) return r.continue().catch(() => {});
        missing.add(u); return r.abort().catch(() => {});
      }
      const ok = u.startsWith('http://127.0.0.1') || u.startsWith('data:') || u.startsWith('blob:') || u === 'about:blank';
      ok ? r.continue().catch(() => {}) : r.abort().catch(() => {});
    });
    let saved = 0;
    if (TAI_FONT) page.on('response', async (res) => {
      const u = res.url();
      if (!isFont(u) || res.status() !== 200 || fs.existsSync(fontFile(u))) return;
      try { fs.writeFileSync(fontFile(u), await res.buffer()); saved++; } catch (e) {}
    });

    const qs = new URLSearchParams({
      nen: '/video-mau-thiep/' + CFG.nen, thiep: '/' + CFG.thiep, 'tieu-de': CFG.tieuDe,
      'gioi-thieu': CFG.gioiThieu, 'vi-tri': CFG.viTriWeb, rong: String(CFG.rong || 414),
    });
    const STAGE = `http://127.0.0.1:${PORT}/video-mau-thiep/san-khau.html?${qs}`;
    const thiepMark = '/' + CFG.thiep.split('/').slice(-2, -1)[0] + '/';

    const advance = async (ms) => {
      for (const f of page.frames()) await f.evaluate((m) => window.__vt && window.__vt.advance(m), ms).catch(() => {});
    };
    const openStage = async () => {
      await page.goto(STAGE, { waitUntil: 'networkidle0', timeout: 90000 });
      for (let i = 0; i < 60; i++) {
        const f = page.frames().find((fr) => fr.url().includes(thiepMark));
        if (f && await f.evaluate((s) => !!document.querySelector(s), CFG.cho || 'body').catch(() => false)) {
          await f.evaluate(() => document.fonts.ready);
          for (let k = 0; k < 30; k++) await advance(DT); // 1 giây ảo cho trang ổn định
          return f;
        }
        await new Promise((r) => setTimeout(r, 500));
      }
      throw new Error('Không thấy iframe thiệp ' + thiepMark);
    };

    // ===== Vòng khởi động: mở thiệp, cuộn hết 1 lượt để ảnh/font nạp vào cache, rồi tải lại.
    console.log('Vong khoi dong...');
    let frame = await openStage();
    const firstClick = CFG.timeline.find((s) => s.click);
    if (firstClick) await frame.evaluate((s) => { const el = document.querySelector(s); if (el) el.click(); }, firstClick.click).catch(() => {});
    for (let k = 0; k < 60; k++) await advance(DT);
    const H = await frame.evaluate(() => document.documentElement.scrollHeight);
    for (let y = 0; y <= H; y += 400) { await frame.evaluate((v) => window.scrollTo(0, v), y); await advance(DT); }
    await frame.evaluate(() => Promise.all([...document.images].map((im) => im.decode().catch(() => {}))));
    if (TAI_FONT) { await new Promise((r) => setTimeout(r, 1500)); console.log(`Da luu ${saved} file font moi vao font-cache/ — nho commit.`); return; }
    if (missing.size) {
      throw new Error(`Thiếu ${missing.size} file font trong font-cache/ (vd ${[...missing][0]}).\n`
        + `Nhờ chủ shop chạy trên máy có mạng: node video-mau-thiep/quay.js ${ID} --tai-font  rồi commit font-cache/.`);
    }
    frame = await openStage();
    console.log('Khoi dong xong — quay that');

    // ===== Quay từng khung =====
    const fdir = path.join(tmp, 'frames');
    fs.mkdirSync(fdir);
    let n = 0, nhacMs = null;
    const maxFrames = GIAY ? GIAY * FPS : Infinity;
    const shot = async () => {
      if (n >= maxFrames) return;
      await page.screenshot({ path: path.join(fdir, `f${String(n).padStart(5, '0')}.jpg`), type: 'jpeg', quality: 95 });
      n++;
      if (n % (FPS * 3) === 0) console.log(`  ${n / FPS}s`);
    };
    const hold = async (ms) => { for (let t = 0; t < ms; t += DT) { await advance(DT); await shot(); } };
    const ease = (p) => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2);
    const scrollTo = async (findSrc, ms) => {
      const [y0, y1] = await frame.evaluate((src) => {
        const max = document.documentElement.scrollHeight - innerHeight;
        if (!src) return [scrollY, 0]; // null = về đầu trang
        const el = (0, eval)(src)();
        const to = el ? el.getBoundingClientRect().top + scrollY - 40 : scrollY;
        return [scrollY, Math.max(0, Math.min(max, to))];
      }, findSrc);
      const steps = Math.round(ms / DT);
      for (let i = 1; i <= steps; i++) {
        await frame.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), y0 + (y1 - y0) * ease(i / steps));
        await advance(DT); await shot();
      }
    };

    for (const st of CFG.timeline) {
      if (n >= maxFrames) break;
      if (st.sleep) await hold(st.sleep);
      else if (st.click) {
        await frame.evaluate((s) => { const el = document.querySelector(s); if (el) el.click(); }, st.click).catch(() => {});
        if (st.nhac && nhacMs === null) nhacMs = Math.round(n * DT);
      } else if (st.scroll) await scrollTo(`() => document.querySelector(${JSON.stringify(st.scroll)})`, st.ms);
      else if (st.scrollText) await scrollTo(`() => [...document.querySelectorAll(${JSON.stringify(st.scrollText[0])})].find((h) => h.textContent.includes(${JSON.stringify(st.scrollText[1])}))`, st.ms);
      else if (st.top) await scrollTo(null, st.top);
      else if (st.endcard) await page.evaluate(() => window.hienManKet());
    }
    const dur = n / FPS;
    console.log(`Quay xong: ${n} khung = ${dur.toFixed(1)} giây`);

    // ===== Dựng video: đúng FPS như đã chụp, thêm nhạc của thiệp, nhỏ dần 2,5 giây cuối
    fs.mkdirSync(path.join(FOLDER, 'video'), { recursive: true });
    const out = path.join(FOLDER, 'video', ID + '.mp4');
    const delay = nhacMs || 0;
    const ff = ['-y', '-framerate', String(FPS), '-i', path.join(fdir, 'f%05d.jpg')];
    if (CFG.nhac) ff.push('-i', path.join(OPS_ROOT, CFG.nhac).replace(path.join(OPS_ROOT, 'Templexa'), TEMPLEXA));
    ff.push('-vf', 'scale=1080:1920:flags=lanczos,format=yuv420p', '-c:v', 'libx264', '-preset', 'slow', '-crf', '17',
      '-profile:v', 'high', '-r', String(FPS), '-movflags', '+faststart');
    if (CFG.nhac) ff.push('-af', `adelay=${delay}|${delay},volume=0.5,afade=t=out:st=${Math.max(0, dur - 2.5).toFixed(2)}:d=2.5`,
      '-c:a', 'aac', '-b:a', '160k', '-shortest');
    ff.push(out);
    execFileSync('ffmpeg', ff, { stdio: 'pipe' });
    console.log('XONG:', out);
  } finally {
    if (browser) await browser.close();
    srv.close();
    fs.rmSync(tmp, { recursive: true, force: true });
  }
})().catch((e) => { console.error('LOI:', e.message); process.exit(1); });

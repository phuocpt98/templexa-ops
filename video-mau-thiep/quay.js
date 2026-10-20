/**
 * quay.js — Quay video giới thiệu mẫu thiệp theo kịch bản.
 *
 *   node video-mau-thiep/quay.js <id-mau> [--hd [N]] [--giay N] [--fps N] [--doan N] [--lam-lai] [--tai-font]
 *     <id-mau>    tên file kich-ban/<id-mau>.json (vd gen-269-dusty-rose)
 *     --hd [N]    vẽ ở N× (mặc định 2; máy ít RAM dùng 1.5) rồi thu về 1080×1920 — nét hơn
 *     --giay N    chỉ quay N giây đầu (thử nhanh)
 *     --fps N     số khung/giây (mặc định 30)
 *     --doan N    mỗi đoạn quay N giây trong 1 Chrome mới (mặc định: "doan" trong kịch bản, không có thì 5).
 *                 Đổi được giữa chừng — lần chạy tiếp dùng độ dài mới, phần đã quay giữ nguyên.
 *     --lam-lai   bỏ tiến độ cũ, quay lại từ đầu
 *     --tai-font  chỉ tải font Google của thiệp này vào font-cache/ rồi thoát (cả catalog: tai-font.js)
 *
 * QUAY THEO ĐOẠN + CHẠY TIẾP ĐƯỢC: video chia đoạn N giây, mỗi đoạn mở Chrome mới, quay xong đóng ngay
 * (RAM luôn thấp). Ảnh từng khung + tiến độ lưu ở video/.job-<id>/ (state.json, log.txt, frames/).
 * Máy khởi động lại / Chrome sập → chạy LẠI ĐÚNG LỆNH CŨ là quay tiếp từ đoạn dở.
 * Đoạn sau mở thiệp rồi TUA LẠI kịch bản không chụp (bấm, cuộn, hiệu ứng) tới đúng khung ngắt —
 * đúng toạ độ cuộn và trạng thái. Hoa rơi/ngẫu nhiên và giờ đồng hồ được cố định nên mối nối liền mạch.
 * Đủ mọi đoạn mới ghép video + nhạc 1 lần (nhạc bắt đầu đúng lúc bấm có "nhac": true).
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
const { execFileSync } = require('child_process');

const FOLDER = __dirname;
const OPS_ROOT = path.join(FOLDER, '..');
// Muse: Templexa nằm trong ops/ · máy chủ shop: Templexa nằm cạnh templexa-ops/
const TEMPLEXA = [path.join(OPS_ROOT, 'Templexa'), path.join(OPS_ROOT, '..', 'Templexa')].find((p) => fs.existsSync(p));
if (!TEMPLEXA) { console.error('LOI: không thấy thư mục Templexa/'); process.exit(1); }
const puppeteer = require(path.join(TEMPLEXA, 'node_modules/puppeteer'));

const args = process.argv.slice(2);
const ID = args.find((a) => !a.startsWith('--') && !/^[\d.]+$/.test(a));
const opt = (k) => (args.includes(k) ? +args[args.indexOf(k) + 1] : 0);
const HD = args.includes('--hd') ? (opt('--hd') || 2) : 1;
const GIAY = opt('--giay');
const TAI_FONT = args.includes('--tai-font');
const LAM_LAI = args.includes('--lam-lai');

const dbg = (...m) => process.env.DEBUG && console.log('[dbg]', ...m);
const FONT_DIR = path.join(FOLDER, 'font-cache');
if (!ID) { console.error('Dùng: node quay.js <id-mau> [--hd [N]] [--giay N] [--doan N] [--lam-lai]'); process.exit(1); }
const CFG = JSON.parse(fs.readFileSync(path.join(FOLDER, 'kich-ban', ID + '.json'), 'utf8'));
// Độ dài 1 đoạn (giây): --doan N > "doan" trong kịch bản > 5. Đổi lúc nào cũng được, kể cả khi đang quay dở.
const DOAN = opt('--doan') || CFG.doan || 5;

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
// base: "giờ thật" cố định cho cả lượt quay (mọi đoạn giống nhau → đếm ngược không nhảy ở mối nối).
// Math.random cố định hạt giống → hoa rơi/ngẫu nhiên lặp lại y hệt khi tua lại ở đoạn sau.
const virtualTime = (base) => `(() => {
  if (window.__vt) return;
  let now = 0, tid = 1, rid = 1, rafs = [], seed = 20261020;
  const timers = new Map(), base = ${base}, ODate = Date, RT = window.setTimeout.bind(window);
  const RAF = window.requestAnimationFrame.bind(window);
  Math.random = () => { seed |= 0; seed = (seed + 0x6D2B79F5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
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
    sleep: (ms) => new Promise((r) => RT(r, ms)), // chờ theo đồng hồ THẬT (dùng cho script quay)
    paint: () => new Promise((r) => { RAF(() => r()); RT(r, 120); }), // đợi trình duyệt vẽ 1 lần (lúc tua không chụp)
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

// ===== Số khung của kịch bản — tính trước, không cần mở trình duyệt
function framePlan() {
  let n = 0;
  for (const st of CFG.timeline) {
    if (st.sleep) n += Math.ceil(st.sleep / DT - 1e-9);
    else if (st.scroll || st.scrollText) n += Math.round(st.ms / DT);
    else if (st.top) n += Math.round(st.top / DT);
  }
  return GIAY ? Math.min(n, Math.round(GIAY * FPS)) : n;
}

// ===== Tiến độ (chạy tiếp được sau khi máy khởi động lại)
const JOB = path.join(FOLDER, 'video', '.job-' + ID);
const FRAMES = path.join(JOB, 'frames');
const STATE = path.join(JOB, 'state.json');
const log = (m) => {
  const line = `[${new Date().toISOString().replace('T', ' ').slice(0, 19)}] ${m}`;
  console.log(line); fs.appendFileSync(path.join(JOB, 'log.txt'), line + '\n');
};
const saveState = (st) => fs.writeFileSync(STATE, JSON.stringify(st, null, 2));
const KEY = require('crypto').createHash('sha1').update(JSON.stringify({ CFG, FPS, HD, GIAY, v: 2 })).digest('hex').slice(0, 12);
const frameFile = (i) => path.join(FRAMES, `f${String(i).padStart(5, '0')}.jpg`);

const isFont = (u) => u.startsWith('https://fonts.googleapis.com/') || u.startsWith('https://fonts.gstatic.com/');
const fontFile = (u) => path.join(FONT_DIR, require('crypto').createHash('sha1').update(u).digest('hex').slice(0, 16)
  + (u.includes('fonts.googleapis.com') ? '.css' : '.woff2'));

// ===== Một lượt Chrome: mở sân khấu, (khởi động), tua tới khung `from`, chụp tới khung `to`, đóng Chrome.
async function runSegment(state, from, to) {
  const browser = await puppeteer.launch({
    headless: true,
    userDataDir: path.join(JOB, 'profile'), // cache ảnh/font giữ lại giữa các đoạn và sau khi máy khởi động lại
    args: ['--no-sandbox', '--no-proxy-server', '--autoplay-policy=no-user-gesture-required', '--hide-scrollbars', '--mute-audio',
      // tiết kiệm RAM trên máy ảo: không dùng /dev/shm, không GPU, gộp tiến trình, tắt dịch vụ nền
      '--disable-dev-shm-usage', '--disable-gpu', '--renderer-process-limit=1', '--disable-site-isolation-trials',
      '--disable-extensions', '--disable-background-networking', '--disable-component-update', '--disable-sync',
      '--disable-default-apps', '--no-first-run', '--disable-features=Translate,MediaRouter,OptimizationHints'],
  });
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1080, height: 1920, deviceScaleFactor: HD });
    await page.evaluateOnNewDocument(virtualTime(state.base));

    // Chỉ cho nạp file local. Google Fonts trả từ font-cache/ (--tai-font: tải thật rồi lưu vào đó).
    const missing = new Set();
    await page.setRequestInterception(true);
    page.on('request', (r) => {
      const u = r.url();
      if (isFont(u)) {
        const f = fontFile(u);
        // CSS: lược các @font-face có file chữ chưa tải (bộ ký tự ngoài tiếng Việt) — Chrome sẽ không đòi file đó
        const body = !fs.existsSync(f) ? null : f.endsWith('.css')
          ? fs.readFileSync(f, 'utf8').replace(/(\/\*[^*]*\*\/\s*)?@font-face\s*{[^}]*}/g, (blk) => {
            const m = blk.match(/url\((https:\/\/fonts\.gstatic\.com\/[^)]+)\)/);
            return !m || fs.existsSync(fontFile(m[1])) ? blk : '';
          })
          : fs.readFileSync(f);
        if (body) return r.respond({ status: 200, body,
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
      // chỉ khung của trang local — khung trống/bị chặn (vd iframe bản đồ) gọi vào sẽ treo mãi
      for (const f of page.frames()) {
        if (f.url().startsWith('http://127.0.0.1')) await f.evaluate((m) => window.__vt && window.__vt.advance(m), ms).catch(() => {});
      }
    };
    const openStage = async () => {
      dbg('goto'); await page.goto(STAGE, { waitUntil: 'networkidle0', timeout: 90000 }); dbg('loaded');
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
    const waitImages = (f) => f.evaluate(() => Promise.race([ // ảnh lazy chưa nạp thì decode() chờ mãi — giới hạn 8 giây
      Promise.all([...document.images].map((im) => im.decode().catch(() => {}))), window.__vt.sleep(8000)])).catch(() => {});

    let frame = await openStage();
    // Vòng khởi động (1 lần cho cả lượt quay — cache nằm trong profile/): mở thiệp, cuộn hết để ảnh/font nạp.
    if (!state.warm || TAI_FONT) {
      log('Vong khoi dong: nap san anh/font...');
      const firstClick = CFG.timeline.find((s) => s.click);
      if (firstClick) await frame.evaluate((s) => { const el = document.querySelector(s); if (el) el.click(); }, firstClick.click).catch(() => {});
      for (let k = 0; k < 60; k++) await advance(DT);
      const H = await frame.evaluate(() => document.documentElement.scrollHeight);
      for (let y = 0; y <= H; y += 400) { await frame.evaluate((v) => window.scrollTo(0, v), y); await advance(DT); }
      await waitImages(frame);
      if (TAI_FONT) { await new Promise((r) => setTimeout(r, 1500)); console.log(`Da luu ${saved} file font moi vao font-cache/ — nho commit.`); return; }
      if (missing.size) {
        throw Object.assign(new Error(`Thiếu ${missing.size} file font trong font-cache/ (vd ${[...missing][0]}).\n`
          + `Nhờ chủ shop chạy trên máy có mạng: node video-mau-thiep/tai-font.js  rồi commit font-cache/.`), { fatal: true });
      }
      state.warm = true; saveState(state);
      frame = await openStage();
    }

    // ===== Chạy kịch bản: khung < from → TUA (không chụp, chỉ đợi trình duyệt vẽ để hiệu ứng cuộn kích hoạt đúng);
    // from ≤ khung < to → CHỤP ra frames/; tới `to` thì dừng.
    const cdp = await page.createCDPSession();
    const STOP = Symbol('stop');
    let n = 0, nhacMs = null, imagesReady = from === 0;
    const t0 = Date.now();
    const step = async () => {
      if (n >= to) throw STOP;
      await advance(DT);
      if (n < from) await frame.evaluate(() => window.__vt.paint()).catch(() => {});
      else {
        if (!imagesReady) { await waitImages(frame); imagesReady = true; }
        const { data } = await cdp.send('Page.captureScreenshot', { format: 'jpeg', quality: 90, optimizeForSpeed: true,
          clip: { x: 0, y: 0, width: 1080, height: 1920, scale: HD } }); // phải ghi scale thì Chrome mới chụp đúng độ phân giải --hd
        fs.writeFileSync(frameFile(n), Buffer.from(data, 'base64'));
      }
      n++;
    };
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
        if (n >= to) throw STOP;
        await frame.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), y0 + (y1 - y0) * ease(i / steps));
        await step();
      }
    };
    try {
      for (const st of CFG.timeline) {
        if (st.sleep) { for (let k = Math.ceil(st.sleep / DT - 1e-9); k > 0; k--) await step(); }
        else if (st.click) {
          await frame.evaluate((s) => { const el = document.querySelector(s); if (el) el.click(); }, st.click).catch(() => {});
          if (st.nhac && nhacMs === null) nhacMs = Math.round(n * DT);
        } else if (st.scroll) await scrollTo(`() => document.querySelector(${JSON.stringify(st.scroll)})`, st.ms);
        else if (st.scrollText) await scrollTo(`() => [...document.querySelectorAll(${JSON.stringify(st.scrollText[0])})].find((h) => h.textContent.includes(${JSON.stringify(st.scrollText[1])}))`, st.ms);
        else if (st.top) await scrollTo(null, st.top);
        else if (st.endcard) await page.evaluate(() => window.hienManKet());
      }
    } catch (e) { if (e !== STOP) throw e; }
    if (nhacMs !== null) state.nhacMs = nhacMs;
    return { ms: Math.round((Date.now() - t0) / Math.max(1, to - from)) };
  } finally {
    await browser.close().catch(() => {});
  }
}

(async () => {
  const srv = await startServer();
  const T_START = Date.now();
  try {
    fs.mkdirSync(FONT_DIR, { recursive: true });
    if (LAM_LAI) fs.rmSync(JOB, { recursive: true, force: true });
    fs.mkdirSync(FRAMES, { recursive: true });
    let state = fs.existsSync(STATE) ? JSON.parse(fs.readFileSync(STATE, 'utf8')) : null;
    if (state && state.key !== KEY) {
      console.log('Kich ban / tuy chon da doi so voi luot quay do — quay lai tu dau.');
      fs.rmSync(JOB, { recursive: true, force: true }); fs.mkdirSync(FRAMES, { recursive: true }); state = null;
    }
    const total = framePlan();
    if (!state) { state = { key: KEY, base: Date.now(), total, done: 0, warm: false, nhacMs: null }; saveState(state); }
    if (TAI_FONT) { await runSegment(state, 0, 0); fs.rmSync(JOB, { recursive: true, force: true }); return; }

    const per = Math.round(DOAN * FPS);
    if (state.done > 0) log(`Chay tiep: da xong ${state.done}/${total} khung (${(state.done / FPS).toFixed(1)}s)`);
    else log(`Bat dau: ${total} khung = ${(total / FPS).toFixed(1)}s, moi doan ${DOAN}s, hd=${HD}`);
    while (state.done < total) {
      const from = state.done;
      const to = total - (from + per) < per / 2 ? total : from + per; // phần thừa ngắn gộp vào đoạn cuối
      for (let lan = 1; ; lan++) {
        try {
          const r = await runSegment(state, from, to);
          state.done = to; saveState(state);
          log(`Doan ${(from / FPS).toFixed(1)}–${(to / FPS).toFixed(1)}s xong (${r.ms} ms/khung) — ${state.done}/${total}`);
          break;
        } catch (e) {
          log(`Doan ${(from / FPS).toFixed(1)}s loi lan ${lan}: ${e.message}`);
          if (e.fatal || lan >= 3) throw new Error(e.fatal ? e.message : 'Doan loi 3 lan — chay lai dung lenh cu de quay tiep tu doan nay.');
        }
      }
    }

    // ===== Đủ mọi đoạn → ghép video + nhạc 1 lần (Chrome đã đóng, chỉ còn ffmpeg; -threads 2 cho nhẹ RAM)
    const dur = total / FPS;
    const out = path.join(FOLDER, 'video', ID + '.mp4');
    const delay = state.nhacMs || 0;
    const ff = ['-y', '-framerate', String(FPS), '-i', path.join(FRAMES, 'f%05d.jpg')];
    if (CFG.nhac) ff.push('-i', path.join(OPS_ROOT, CFG.nhac).replace(path.join(OPS_ROOT, 'Templexa'), TEMPLEXA),
      '-af', `adelay=${delay}|${delay},volume=0.5,afade=t=out:st=${Math.max(0, dur - 2.5).toFixed(2)}:d=2.5`,
      '-c:a', 'aac', '-b:a', '160k', '-shortest');
    ff.push('-vf', 'scale=1080:1920:flags=lanczos,format=yuv420p', '-c:v', 'libx264', '-preset', 'medium', '-crf', '17',
      '-profile:v', 'high', '-threads', '2', '-r', String(FPS), '-movflags', '+faststart', out);
    log('Ghep video + nhac...');
    execFileSync('ffmpeg', ff, { stdio: 'pipe' });
    log(`XONG: ${out} (${dur.toFixed(1)}s, tong ${Math.round((Date.now() - T_START) / 1000)}s lan chay nay)`);
    fs.rmSync(JOB, { recursive: true, force: true }); // xong hẳn mới xoá ảnh tạm + tiến độ
  } finally {
    srv.close();
  }
})().catch((e) => { console.error('LOI:', e.message); process.exit(1); });

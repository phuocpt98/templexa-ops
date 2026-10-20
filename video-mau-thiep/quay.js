/**
 * quay.js — Quay video giới thiệu mẫu thiệp theo kịch bản.
 * Chạy: node quay.js
 * Cách làm: mở san-khau.html bằng Chrome (1080x1920), ghi hình màn hình,
 * tự bấm/cuộn trong iframe thiệp theo timeline, trộn nhạc của thiệp, xuất mp4 vào video/.
 */
const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { execFileSync } = require('child_process');
const puppeteer = require('/home/hatch/workspace/templexa/ops/Templexa/node_modules/puppeteer');

const OPS_ROOT = '/home/hatch/workspace/templexa/ops';
const FOLDER = path.join(OPS_ROOT, 'video-mau-thiep');
const PORT = 8791;

// ===== Cấu hình mẫu đang quay (viết theo file kịch bản trong kich-ban/) =====
const CFG = {
  id: 'gen-269-dusty-rose',
  nen: '/video-mau-thiep/nen/hoa-hong-pastel.jpg',
  thiep: '/Templexa/products/Invitation/Wedding/gen_269_dusty-rose-flatlay/index.html',
  dauHieuThiep: '/gen_269_dusty-rose-flatlay/', // nhận diện iframe thiệp (có dấu / thật, tránh trùng URL trang sân khấu)
  tieuDe: 'MẪU THIỆP CƯỚI ONLINE',
  viTriWeb: 'phai-duoi', // templexa.vn hiện 1 chỗ trên nền — chọn theo nền: trai-tren | phai-tren | trai-duoi | phai-duoi | giua-duoi
  gioiThieu: 'Mẫu thiệp cưới Dusty Rose — mở phong bì hoa khô, cánh hoa rơi, đếm ngược, album ảnh và xác nhận tham dự ngay trên thiệp.',
  nhac: path.join(OPS_ROOT, 'Templexa/products/shared/music/wedding/Beautiful In White.mp3'),
  treNhac: 2500, // nhạc bắt đầu khi mở phong bì (giây 2,5)
  // Timeline quay — vị trí các mục đã ĐO THẬT trên thiệp (doc cao 6141, màn cao 1330):
  // collage hero 18 · invite 771 · Timeline 2118 · đếm ngược 2769 · giftBtn 4016 · rsvpForm 4873
  timeline: [
    { sleep: 2500 },                          // phong bì đang đóng
    { click: '#envelope' },                   // mở thiệp
    { sleep: 3000 },                          // ngắm hero collage + hoa rơi
    { scroll: '#invite', ms: 4000 },          // thẻ mời
    { scrollText: ['h2', 'Timeline'], ms: 4000 },
    { scroll: '#count', ms: 4000 },           // Ngày chung đôi + đếm ngược
    { scroll: '#giftBtn', ms: 3500 },         // hộp quà
    { click: '#giftBtn' },                    // mở thẻ QR
    { sleep: 1500 },
    { scroll: '#rsvpForm', ms: 3000 },        // form xác nhận tham dự
    { sleep: 1000 },
    { top: 2800 },                           // quay về đầu trang (intro) — kéo thẳng về 0
    { endcard: true },                       // hiện chữ đè lên hình: TEMPLEXA — templexa.vn (chỉ 2 giây)
    { sleep: 2000 },
  ],
};

const MIME = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css',
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp',
  '.mp3': 'audio/mpeg', '.svg': 'image/svg+xml', '.json': 'application/json',
  '.woff': 'font/woff', '.woff2': 'font/woff2', '.gif': 'image/gif', '.ico': 'image/x-icon',
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function startServer() {
  return new Promise((resolve) => {
    const srv = http.createServer((req, res) => {
      try {
        const urlPath = decodeURIComponent(req.url.split('?')[0]);
        const file = path.join(OPS_ROOT, urlPath);
        if (!file.startsWith(OPS_ROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
          res.writeHead(404); res.end('not found'); return;
        }
        const ext = path.extname(file).toLowerCase();
        const headers = { 'Content-Type': MIME[ext] || 'application/octet-stream' };
        if (ext !== '.html') headers['Cache-Control'] = 'public, max-age=3600'; // vòng khởi động nạp 1 lần, lần quay thật dùng lại cho mượt
        res.writeHead(200, headers);
        fs.createReadStream(file).pipe(res);
      } catch (e) { res.writeHead(500); res.end('err'); }
    });
    srv.listen(PORT, '127.0.0.1', () => resolve(srv));
  });
}

(async () => {
  const srv = await startServer();
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'quay-'));
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--no-proxy-server', '--autoplay-policy=no-user-gesture-required', '--hide-scrollbars'],
    });
    const page = await browser.newPage();
    await page.setViewport({ width: 1080, height: 1920, deviceScaleFactor: 1 });

    // Chỉ cho nạp từ máy local (thiệp + ảnh + nhạc đều là file trong repo) —
    // chặn mọi đường ra mạng ngoài để không bị chờ đợi gây lag.
    await page.setRequestInterception(true);
    page.on('request', (r) => {
      const u = r.url();
      if (u.startsWith('http://127.0.0.1') || u.startsWith('data:') || u.startsWith('blob:') || u === 'about:blank') r.continue().catch(() => {});
      else r.abort().catch(() => {});
    });

    const qs = new URLSearchParams({ nen: CFG.nen, thiep: CFG.thiep, 'tieu-de': CFG.tieuDe, 'gioi-thieu': CFG.gioiThieu, 'vi-tri': CFG.viTriWeb });
    const resp = await page.goto(`http://127.0.0.1:${PORT}/video-mau-thiep/san-khau.html?${qs}`, { waitUntil: 'domcontentloaded', timeout: 60000 });
    console.log('San khau HTTP:', resp && resp.status());

    // Tìm iframe thiệp (thấy cổng phong bì là sẵn sàng)
    const findThiep = async () => {
      for (let i = 0; i < 60; i++) {
        const f = page.frames().find((fr) => fr.url().includes(CFG.dauHieuThiep));
        if (f) {
          const ok = await f.evaluate(() => !!document.getElementById('envelope')).catch(() => false);
          if (ok) return f;
        }
        await sleep(500);
      }
      return null;
    };
    let frame = await findThiep();
    if (!frame) throw new Error('Không thấy iframe thiệp / cổng phong bì');

    // ===== Vòng khởi động: mở thiệp, cuộn sẵn 1 vòng cho mọi tài nguyên nạp hết,
    // ===== rồi tải lại trang — lần quay thật chỉ thao tác trên thiệp đã "nóng" sẵn.
    console.log('Vong khoi dong: mo thiep, cuon san 1 vong...');
    await frame.evaluate(() => { const el = document.getElementById('envelope'); if (el) el.click(); }).catch(() => {});
    await sleep(2200);
    await frame.evaluate(() => new Promise((res) => {
      let y = 0; const h = document.documentElement.scrollHeight;
      const iv = setInterval(() => { y += 550; window.scrollTo(0, y); if (y >= h) { clearInterval(iv); window.scrollTo(0, 0); res(); } }, 110);
    })).catch(() => {});
    await sleep(500);
    await page.reload({ waitUntil: 'domcontentloaded', timeout: 60000 });
    frame = await findThiep();
    if (!frame) throw new Error('Sau vòng khởi động không thấy lại iframe thiệp');
    await sleep(1200); // đợi thiệp ổn định hẳn
    console.log('Khoi dong xong — quay that');

    // ===== Cuộn TRÔI LIÊN TỤC trong trang =====
    // Thiệp tự trượt đều bằng vòng lặp chạy theo từng khung hình (~60 bước/giây):
    // mỗi bước đo lại vị trí mục tiêu rồi trượt một đoạn tỉ lệ theo khoảng cách còn lại
    // (nhanh ở xa, chậm dần khi tới nơi) — chuyển động liền mạch như tay người vuốt.
    const smoothScrollInPage = (timFn, dur) => frame.evaluate((fnSrc, durMs) => new Promise((res) => {
      const tim = eval(fnSrc);
      const el = tim();
      if (!el) return res();
      const t0 = performance.now();
      const tick = () => {
        const remaining = el.getBoundingClientRect().top - 40; // đích: cách mép trên 40px
        if (Math.abs(remaining) < 6 || performance.now() - t0 > durMs) return res();
        let inc = remaining * 0.14;
        inc = Math.max(-55, Math.min(55, inc));
        window.scrollTo({ top: window.scrollY + inc, behavior: 'instant' });
        requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }), timFn, dur).catch(() => {});
    const scrollToSel = (sel, dur) => smoothScrollInPage(`() => document.querySelector(${JSON.stringify(sel)})`, dur);
    const scrollToText = (tag, txt, dur) => smoothScrollInPage(`() => [...document.querySelectorAll(${JSON.stringify(tag)})].find(h => h.textContent.includes(${JSON.stringify(txt)}))`, dur);

    // ===== Ghi hình =====
    const client = await page.createCDPSession();
    const frames = [];
    client.on('Page.screencastFrame', async ({ data, sessionId }) => {
      frames.push({ buf: Buffer.from(data, 'base64'), ts: Date.now() });
      await client.send('Page.screencastFrameAck', { sessionId }).catch(() => {});
    });
    await client.send('Page.startScreencast', { format: 'jpeg', quality: 82, maxWidth: 1080, maxHeight: 1920, everyNthFrame: 1 });
    console.log('Bat dau quay...');

    // ===== Timeline theo kịch bản (CFG.timeline) =====
    for (const step of CFG.timeline) {
      if (step.sleep) await sleep(step.sleep);
      else if (step.click) await frame.evaluate((s) => { const el = document.querySelector(s); if (el) el.click(); }, step.click).catch(() => {});
      else if (step.scroll) await scrollToSel(step.scroll, step.ms);
      else if (step.top) await frame.evaluate((dur) => new Promise((res) => {
        const startY = window.scrollY, t0 = performance.now();
        const iv = setInterval(() => {
          const p = Math.min(1, (performance.now() - t0) / dur);
          const e = 1 - Math.pow(1 - p, 3);
          window.scrollTo({ top: Math.round(startY * (1 - e)), behavior: 'instant' });
          if (p >= 1) { clearInterval(iv); res(); }
        }, 40);
      }), step.top).catch(() => {});
      else if (step.scrollText) await scrollToText(step.scrollText[0], step.scrollText[1], step.ms);
      else if (step.endcard) await page.evaluate(() => window.hienManKet());
    }

    await client.send('Page.stopScreencast');
    console.log('Quay xong:', frames.length, 'khung hình');

    // ===== Dựng video từ khung hình =====
    const fdir = path.join(tmp, 'frames');
    fs.mkdirSync(fdir);
    const lines = [];
    frames.forEach((f, i) => {
      const name = `f${String(i).padStart(5, '0')}.jpg`;
      fs.writeFileSync(path.join(fdir, name), f.buf);
      const next = frames[i + 1];
      let dur = next ? (next.ts - f.ts) / 1000 : 0.5;
      dur = Math.min(5.0, Math.max(0.02, dur)); // giữ đúng thời gian thật, kể cả đoạn đứng yên
      lines.push(`file '${name}'`, `duration ${dur.toFixed(3)}`);
    });
    lines.push(`file 'f${String(frames.length - 1).padStart(5, '0')}.jpg'`);
    const listFile = path.join(fdir, 'list.txt');
    fs.writeFileSync(listFile, lines.join('\n'));

    const silent = path.join(tmp, 'silent.mp4');
    // Máy quay chỉ bắt được ~7 khung/giây nên bồi thêm khung trung gian cho đủ 30 khung/giây,
    // video phát ra mới mượt (khâu này chạy nền khoảng 5 phút cho clip ~30 giây).
    execFileSync('ffmpeg', ['-y', '-f', 'concat', '-safe', '0', '-i', listFile,
      '-vf', 'minterpolate=fps=30:mi_mode=mci:mc_mode=aobmc:me_mode=bilat:vsbmc=1,format=yuv420p',
      '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '21', silent],
      { stdio: 'pipe' });
    console.log('Da dung video khong tieng (da boi khung 30fps)');

    const out = path.join(FOLDER, 'video', CFG.id + '.mp4');
    execFileSync('ffmpeg', ['-y', '-i', silent, '-i', CFG.nhac,
      '-map', '0:v:0', '-map', '1:a:0', '-c:v', 'copy',
      '-af', `adelay=${CFG.treNhac}|${CFG.treNhac},volume=0.5,afade=t=out:st=25.5:d=2.5`,
      '-shortest', out], { stdio: 'pipe' });
    console.log('XONG:', out);
  } finally {
    if (browser) await browser.close();
    srv.close();
    fs.rmSync(tmp, { recursive: true, force: true });
  }
})().catch((e) => { console.error('LOI:', e.message); process.exit(1); });

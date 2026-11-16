// Đo top từng h2.title của gen_313 sau khi mở thiệp.
const http = require('http');
const fs = require('fs');
const path = require('path');
const puppeteer = require(path.join(__dirname, '..', 'Templexa', 'node_modules', 'puppeteer'));
const TEMPLEXA = path.join(__dirname, '..', 'Templexa');
const PORT = 8793;
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.jpg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp', '.mp3': 'audio/mpeg', '.svg': 'image/svg+xml', '.woff2': 'font/woff2' };
(async () => {
  const srv = http.createServer((req, res) => {
    try {
      const p = path.join(TEMPLEXA, decodeURIComponent(req.url.split('?')[0]).replace(/^\//, ''));
      if (!fs.existsSync(p) || fs.statSync(p).isDirectory()) { res.writeHead(404); res.end(); return; }
      res.writeHead(200, { 'Content-Type': MIME[path.extname(p).toLowerCase()] || 'application/octet-stream' });
      fs.createReadStream(p).pipe(res);
    } catch (e) { res.writeHead(500); res.end(); }
  });
  await new Promise((r) => srv.listen(PORT, '127.0.0.1', r));
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-dev-shm-usage', '--disable-gpu', '--mute-audio'] });
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 414, height: 900 });
    await page.goto(`http://127.0.0.1:${PORT}/products/Invitation/Other/gen_313_thoi-noi-thien-binh-bap-benh-tren-may/index.html`, { waitUntil: 'networkidle2', timeout: 60000 }).catch(() => {});
    await new Promise((r) => setTimeout(r, 1500));
    await page.evaluate(() => { const el = document.querySelector('#openBtn'); if (el) el.click(); });
    await new Promise((r) => setTimeout(r, 5000));
    const out = await page.evaluate(() => {
      const sc = document.documentElement;
      const tops = [...document.querySelectorAll('h2.title')].map((h) => ({ t: h.textContent.trim(), top: Math.round(h.getBoundingClientRect().top + sc.scrollTop) }));
      const secs = [...document.querySelectorAll('section')].map((s, i) => ({ i, top: Math.round(s.getBoundingClientRect().top + sc.scrollTop), h: Math.round(s.getBoundingClientRect().height) }));
      return { scrollH: sc.scrollHeight, tops, secs };
    });
    console.log(JSON.stringify(out, null, 1));
  } finally { await browser.close(); srv.close(); }
})().catch((e) => { console.error('LOI:', e.message); process.exit(1); });

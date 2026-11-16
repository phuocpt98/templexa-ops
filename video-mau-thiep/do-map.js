// Đo bản đồ vị trí các mục của 1 thiệp (mở thiệp thật, bấm mở, đo top từng selector).
// Dùng: node do-map.js <duong-dan-thiep-tu-Templexa> <click-selector> <sel1,sel2,...>
// VD: node do-map.js products/Invitation/Wedding/gen_328_truc-dao-xanh-reu/index.html '#dkNutMo' '#SECTION_DAU,#SECTION_MOI,#SECTION_KET'
const http = require('http');
const fs = require('fs');
const path = require('path');
const puppeteer = require(path.join(__dirname, '..', 'Templexa', 'node_modules', 'puppeteer'));

const [rel, clickSel, selsRaw] = process.argv.slice(2);
const SELS = selsRaw.split(',');
const OPS = path.join(__dirname, '..');
const TEMPLEXA = path.join(OPS, 'Templexa');
const PORT = 8792;
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.jpg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp', '.mp3': 'audio/mpeg', '.svg': 'image/svg+xml', '.json': 'application/json', '.woff2': 'font/woff2' };

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
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-dev-shm-usage', '--disable-gpu', '--mute-audio', '--autoplay-policy=no-user-gesture-required'] });
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 414, height: 900 });
    await page.goto(`http://127.0.0.1:${PORT}/${rel}`, { waitUntil: 'networkidle2', timeout: 60000 }).catch(() => {});
    await new Promise((r) => setTimeout(r, 2000));
    const before = await page.evaluate((sels) => {
      const sc = document.documentElement.scrollHeight > document.body.scrollHeight ? document.documentElement : document.body;
      return { scrollH: sc.scrollHeight, clientH: sc.clientHeight, el: sels.map((s) => { const el = document.querySelector(s); return el ? Math.round(el.getBoundingClientRect().top + window.scrollY) : null; }) };
    }, SELS);
    console.log('TRUOC MO:', JSON.stringify(before));
    if (clickSel) {
      await page.evaluate((s) => { const el = document.querySelector(s); if (el) el.click(); }, clickSel);
      await new Promise((r) => setTimeout(r, 7000));
      const after = await page.evaluate((sels) => {
        const de = document.documentElement, bd = document.body;
        const sc = (bd.scrollHeight - bd.clientHeight > de.scrollHeight - de.clientHeight) ? bd : de;
        const out = {};
        sels.forEach((s) => { const el = document.querySelector(s); out[s] = el ? { top: Math.round(el.getBoundingClientRect().top + sc.scrollTop), h: Math.round(el.getBoundingClientRect().height) } : null; });
        return { scrollEl: sc === bd ? 'body' : 'documentElement', scrollH: sc.scrollHeight, clientH: sc.clientHeight, items: out };
      }, SELS);
      console.log('SAU MO:', JSON.stringify(after, null, 1));
    }
  } finally { await browser.close(); srv.close(); }
})().catch((e) => { console.error('LOI:', e.message); process.exit(1); });

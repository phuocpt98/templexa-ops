/**
 * tai-font.js — Tải sẵn Google Fonts của mọi mẫu thiệp public trong catalog vào font-cache/.
 *
 *   node video-mau-thiep/tai-font.js            (chạy trên máy CÓ mạng, rồi commit font-cache/)
 *
 * Mở từng thiệp (type invitation, isPublic !== false trong data.js; index.html hoặc code.html), ghi lại
 * link Google Fonts thiệp gọi tới, tải file CSS + file chữ của các bộ ký tự tiếng Việt cần (SUBSETS).
 * Bộ ký tự khác (Nga, Hy Lạp, Thái…) bỏ qua — quay.js tự lược khỏi CSS nên không báo thiếu.
 * Tên file trong font-cache/ = sha1(url) — phải khớp hàm fontFile() trong quay.js.
 * File đã có thì bỏ qua, nên chạy lại khi thêm mẫu mới chỉ tải phần thiếu.
 */
const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const FOLDER = __dirname;
const OPS_ROOT = path.join(FOLDER, '..');
const TEMPLEXA = [path.join(OPS_ROOT, 'Templexa'), path.join(OPS_ROOT, '..', 'Templexa')].find((p) => fs.existsSync(p));
if (!TEMPLEXA) { console.error('LOI: không thấy thư mục Templexa/'); process.exit(1); }
const puppeteer = require(path.join(TEMPLEXA, 'node_modules/puppeteer'));
const { products } = require(path.join(TEMPLEXA, 'scripts/lib/products-io.js')).load();

const FONT_DIR = path.join(FOLDER, 'font-cache');
const PORT = 8792;
const SUBSETS = ['latin', 'latin-ext', 'vietnamese', 'symbols'];
const fontFile = (u) => path.join(FONT_DIR, crypto.createHash('sha1').update(u).digest('hex').slice(0, 16)
  + (u.includes('fonts.googleapis.com') ? '.css' : '.woff2'));

function startServer() {
  return new Promise((resolve) => {
    const srv = http.createServer((req, res) => {
      const file = path.join(TEMPLEXA, decodeURIComponent(req.url.split('?')[0]));
      if (!file.startsWith(TEMPLEXA) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404); res.end(); return; }
      res.writeHead(200, { 'Content-Type': file.endsWith('.html') ? 'text/html; charset=utf-8' : file.endsWith('.css') ? 'text/css' : 'application/octet-stream' });
      fs.createReadStream(file).pipe(res);
    });
    srv.listen(PORT, '127.0.0.1', () => resolve(srv));
  });
}

(async () => {
  fs.mkdirSync(FONT_DIR, { recursive: true });
  const pages = products.filter((p) => p.type === 'invitation' && p.isPublic !== false && p.path)
    .map((p) => {
      const dir = p.path.replace(/^\.\//, '').replace(/\/?$/, '/');
      const f = ['index.html', 'code.html'].find((n) => fs.existsSync(path.join(TEMPLEXA, dir, n)));
      return f && '/' + dir + f;
    }).filter(Boolean);
  const srv = await startServer();
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const UA = await browser.userAgent();
  const cssUrls = new Set();
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 414, height: 900 });
    await page.setRequestInterception(true);
    page.on('request', (r) => {
      const u = r.url();
      if (u.startsWith('https://fonts.googleapis.com/')) cssUrls.add(u);
      if (u.startsWith('http://127.0.0.1') && ['document', 'stylesheet'].includes(r.resourceType())) r.continue().catch(() => {});
      else r.abort().catch(() => {});
    });
    for (const [i, u] of pages.entries()) {
      await page.goto(`http://127.0.0.1:${PORT}${encodeURI(decodeURI(u))}`, { waitUntil: 'domcontentloaded', timeout: 30000 }).catch(() => {});
      await new Promise((r) => setTimeout(r, 300));
      if ((i + 1) % 20 === 0) console.log(`  da quet ${i + 1}/${pages.length} thiep`);
    }
  } finally { await browser.close(); srv.close(); }
  console.log(`${pages.length} thiep → ${cssUrls.size} link Google Fonts`);

  let moi = 0, loi = 0;
  const get = async (u) => {
    const f = fontFile(u);
    if (fs.existsSync(f)) return fs.readFileSync(f);
    const res = await fetch(u, { headers: { 'User-Agent': UA } });
    if (!res.ok) throw new Error(res.status + ' ' + u);
    const buf = Buffer.from(await res.arrayBuffer());
    fs.writeFileSync(f, buf); moi++;
    return buf;
  };
  for (const css of cssUrls) {
    try {
      const text = (await get(css)).toString();
      const fonts = [...new Set([...text.matchAll(/\/\*\s*([\w-]+)\s*\*\/\s*@font-face\s*{[^}]*?url\((https:\/\/fonts\.gstatic\.com\/[^)]+)\)/g)]
        .filter((m) => SUBSETS.includes(m[1])).map((m) => m[2]))];
      for (let i = 0; i < fonts.length; i += 8) await Promise.all(fonts.slice(i, i + 8).map((f) => get(f).catch(() => { loi++; })));
    } catch (e) { loi++; console.log('  loi:', e.message); }
  }
  const all = fs.readdirSync(FONT_DIR);
  const mb = all.reduce((s, f) => s + fs.statSync(path.join(FONT_DIR, f)).size, 0) / 1048576;
  console.log(`Xong: tai moi ${moi} file, loi ${loi}. font-cache/ co ${all.length} file, ${mb.toFixed(1)} MB — nho commit.`);
})().catch((e) => { console.error('LOI:', e.message); process.exit(1); });

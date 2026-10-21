#!/usr/bin/env node
/* Chuyển thiệp đại lý dạng "builder" (code.js + view.js + USER_DATA, KHÔNG phải LadiPage) thành mẫu Templexa.
 *
 * Thiệp builder đã là HTML/CSS/JS thuần — giữ nguyên giao diện + JS gốc, chỉ thay phần dính máy chủ nhà cung cấp:
 *   - php/rsvp.php, php/message.php, widget ký tên → tpx-shim.js (lưu trên máy khách, localStorage)
 *   - ảnh trên builder.wedding.com → file trong máy (--map), QR mẫu → QR Facebook Page Templexa
 *   - font: chỉ giữ font trong assets/css/fonts.css (EDIT_FONTS là font của trình soạn, bỏ)
 *   - bỏ kyTen.js / readSignature.js / MessageBoxFunction.js (bản cũ, lỗi cú pháp + cần jQuery, không chạy)
 *   - head: title / description / og:image, dòng templexa.vn cuối thiệp, nhạc nền (USER_DATA.music)
 *
 * node scripts/builder/port.js <thư mục nguồn> --out <thư mục gen_…> --key tpx<id>
 *      [--music <mp3>] [--title "…"] [--desc "…"]
 *      [--map <tên file từ xa>=<đường dẫn ảnh trong máy>]…   (lặp được; đường dẫn tính từ cwd)
 *      [--css "<CSS thêm cuối head>"]
 */
'use strict';
const fs = require('fs');
const path = require('path');

const argv = process.argv.slice(2);
const SRC = path.resolve(argv[0] || '');
const opt = (k) => { const i = argv.indexOf(k); return i > 0 ? argv[i + 1] : null; };
const opts = (k) => argv.flatMap((a, i) => (a === k ? [argv[i + 1]] : []));
const OUT = opt('--out') && path.resolve(opt('--out'));
if (!fs.existsSync(path.join(SRC, 'index.html')) || !OUT) {
  console.error('Dùng: node scripts/builder/port.js <thư mục nguồn> --out <thư mục gen_…> --key tpx<id> [--music] [--map a=b] [--title] [--desc] [--css]');
  process.exit(1);
}
const KEY = opt('--key') || 'tpx';
const ROOT = path.resolve(__dirname, '../../../Templexa');
const QR_FB = path.join(ROOT, 'products/shared/images/icons/qr-facebook-templexa.webp');
const rel = (abs) => path.relative(OUT, abs).split(path.sep).join('/');
const NOTE = [];

let h = fs.readFileSync(path.join(SRC, 'index.html'), 'utf8');
fs.rmSync(path.join(OUT, 'assets'), { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });

// ---- USER_DATA (JSON trong <script>) — đọc ra để sửa, ghi lại đúng chỗ
function jsonAt(src, marker) {
  const i = src.indexOf(marker); if (i < 0) return null;
  const s = src.indexOf('{', i); let d = 0, q = false;
  for (let k = s; k < src.length; k++) {
    const c = src[k];
    if (q) { if (c === '\\') k++; else if (c === '"') q = false; continue; }
    if (c === '"') q = true; else if (c === '{') d++; else if (c === '}' && --d === 0) return { s, e: k + 1, v: JSON.parse(src.slice(s, k + 1)) };
  }
  return null;
}
// ---- QR của bên bán → QR Facebook Page
const qrPath = rel(QR_FB);
const qrIds = [...new Set([...h.matchAll(/id="(IMG_QR\w*)"/g)].map((m) => m[1]))];
h = h.replace(/https?:\/\/[^"')\s]*qr[^"')\s]*\.(svg|png|webp|jpe?g)/gi, qrPath);
if (qrIds.length) NOTE.push(`QR (${qrIds.join(', ')}) → QR Facebook Page Templexa.`);

// ---- ảnh trên máy chủ nhà cung cấp → ảnh trong máy
for (const m of opts('--map')) {
  const [name, local] = m.split('=');
  const to = rel(path.resolve(local));
  const re = new RegExp(`https?://[^"')\\s]*/${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'g');
  const n = (h.match(re) || []).length; h = h.replace(re, to);
  NOTE.push(`${name} → ${to} (${n} chỗ)`);
}

// ---- USER_DATA: đọc SAU khi thay chuỗi (vị trí trong h đã đổi)
const UD = jsonAt(h, 'window.USER_DATA = {"');
const ud = UD ? UD.v : {};
for (const k of Object.keys(ud.images || {})) if (/QR/i.test(k)) ud.images[k].url = qrPath;
// dữ liệu thử của chủ bản gốc (khách, lời chúc, xác nhận) — mẫu catalog để trống
['guests', 'guest_notes', 'messages', 'rsvpList'].forEach((k) => { if (Array.isArray(ud[k])) ud[k] = []; });
// ---- nhạc
const music = opt('--music');
// nhạc của bản gốc nằm trên máy chủ nhà cung cấp (/image/_shared_music/…) → không phát được → bỏ, dùng --music
const localSong = (u) => u && !/^(https?:)?\/\//.test(u) && !u.startsWith('/') && fs.existsSync(path.join(SRC, u.split('?')[0]));
const deadSongs = (ud.musicPlaylist || []).filter((x) => !localSong(x.url)).length + (ud.music && !localSong(ud.music) ? 1 : 0);
if (deadSongs) { ud.musicPlaylist = (ud.musicPlaylist || []).filter((x) => localSong(x.url)); if (ud.music && !localSong(ud.music)) delete ud.music; NOTE.push(`Bỏ ${deadSongs} bài nhạc nằm trên máy chủ gốc (không phát được).`); }
if (music && !(ud.musicPlaylist || []).length && !ud.music) {
  ud.music = rel(path.resolve(music)).split('/').map(encodeURIComponent).join('/').replace(/%2E%2E/g, '..');
  NOTE.push('Bản gốc không có nhạc — đã gắn ' + path.basename(music));
}
if (UD) h = h.slice(0, UD.s) + JSON.stringify(ud) + h.slice(UD.e);

// ---- biến trỏ về máy chủ nhà cung cấp
h = h.replace(/window\.BASE_PATH\s*=\s*'[^']*'/, "window.BASE_PATH = ''")
  .replace(/window\.EDIT_FONTS\s*=\s*\[[\s\S]*?\];/, 'window.EDIT_FONTS = [];')
  .replace(/var _WB_SIG_BASE="[^"]*"/, 'var _WB_SIG_BASE=""')
  .replace(/<script[^>]*src="assets\/js\/(kyTen|readSignature|MessageBoxFunction)\.js"[^>]*><\/script>\s*/g, '')
  .replace(/<link[^>]*href="assets\/css\/kyTen\.css"[^>]*>\s*/g, (m) => (fs.existsSync(path.join(SRC, 'assets/css/kyTen.css')) ? m : ''));
// shim chạy TRƯỚC view.js (thay fetch trước khi view.js gắn form)
h = h.replace(/<script src="assets\/js\/view\.js"><\/script>/, `<script>window.TPX_KEY = ${JSON.stringify(KEY)};</script>\n<script src="tpx-shim.js"></script>\n$&`);
fs.copyFileSync(path.join(__dirname, 'tpx-shim.js'), path.join(OUT, 'tpx-shim.js'));

// ---- head: tiêu đề, mô tả, ảnh chia sẻ (og-cover.jpg sinh sau bằng ảnh chụp)
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
const title = opt('--title') || (h.match(/<title>([\s\S]*?)<\/title>/) || [, 'Thiệp cưới online'])[1].replace(/\{\{\w+\}\}/g, 'Quý Khách').trim();
const desc = opt('--desc') || 'Thiệp cưới online — mẫu của Templexa.vn';
h = h.replace(/<title>[\s\S]*?<\/title>/, `<title>${esc(title)}</title>`)
  .replace(/<meta[^>]+(name="(description|robots|twitter:[^"]*)"|property="og:[^"]*")[^>]*>\s*/g, '')
  .replace(/<link[^>]+rel="canonical"[^>]*>\s*/g, '')
  .replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>\s*/g, '')
  .replace(/<\/title>/, `</title>\n<meta name="description" content="${esc(desc)}">\n<meta property="og:title" content="${esc(title)}">\n<meta property="og:description" content="${esc(desc)}">\n<meta property="og:type" content="website">\n<meta property="og:image" content="og-cover.jpg">`);

// ---- dòng thương hiệu cuối thiệp (section kết, không có thì section cuối)
const brand = '<a class="closing-brand" href="https://templexa.vn" target="_blank" rel="noopener">Thiệp online · <b>templexa.vn</b></a>';
const endSec = /<section[^>]*class="[^"]*SEC-End[^"]*"/.exec(h) || [...h.matchAll(/<section[\s>]/g)].pop();
if (endSec) { const e = h.indexOf('</section>', endSec.index); h = h.slice(0, e) + brand + h.slice(e); }
const extraCss = `.closing-brand{display:block;position:relative;z-index:2;padding:16px 0 20px;text-align:center;font:13px/1.4 system-ui,-apple-system,sans-serif;color:inherit;opacity:.7;text-decoration:none}
${qrIds.map((id) => `#${id} .ladi-image-background`).join(',')}${qrIds.length ? `{background-image:url('${qrPath}')!important;background-size:contain!important;background-position:center!important;background-color:#fff!important}` : ''}
${opt('--css') || ''}`;
h = h.replace('</head>', `<style id="tpx-style">\n${extraCss}\n</style>\n</head>`);

// ---- tài nguyên: css/js đủ; ảnh + font chỉ file được dùng
const copy = (r) => { const a = path.join(SRC, r), b = path.join(OUT, r); fs.mkdirSync(path.dirname(b), { recursive: true }); fs.copyFileSync(a, b); };
const ls = (d) => (fs.existsSync(path.join(SRC, d)) ? fs.readdirSync(path.join(SRC, d)) : []);
ls('assets/css').forEach((f) => { if (f !== 'kyTen.css' || h.includes('kyTen.css')) copy('assets/css/' + f); });
ls('assets/js').filter((f) => !/^(kyTen|readSignature|MessageBoxFunction)\.js$/.test(f)).forEach((f) => copy('assets/js/' + f));
const cssAll = ls('assets/css').map((f) => fs.readFileSync(path.join(SRC, 'assets/css', f), 'utf8')).join('\n');
const used = (name) => h.includes(name) || cssAll.includes(name);
let nImg = 0, nFont = 0, skipped = 0;
ls('assets/images').forEach((f) => { if (used(f)) { copy('assets/images/' + f); nImg++; } else skipped++; });
const fontsCss = fs.existsSync(path.join(SRC, 'assets/css/fonts.css')) ? fs.readFileSync(path.join(SRC, 'assets/css/fonts.css'), 'utf8') : '';
ls('assets/fonts').forEach((f) => { if (fontsCss.includes(f) || cssAll.replace(fontsCss, '').includes(f)) { copy('assets/fonts/' + f); nFont++; } else skipped++; });

const remote = [...new Set(h.match(/https?:\/\/[\w.-]*wedding\.com[^"')\s]*\.(webp|png|jpe?g|svg|gif)/g) || [])];
if (remote.length) NOTE.push('CÒN ảnh trên máy chủ gốc (không tải được → thêm --map): ' + remote.join(', '));
fs.writeFileSync(path.join(OUT, 'index.html'), h);
const kb = (d) => { let s = 0; const walk = (p) => fs.statSync(p).isDirectory() ? fs.readdirSync(p).forEach((x) => walk(path.join(p, x))) : (s += fs.statSync(p).size); walk(d); return Math.round(s / 1024); };
console.log(`✓ ${rel(path.join(OUT, 'index.html'))} — ${nImg} ảnh, ${nFont} font, bỏ ${skipped} file không dùng, tổng ${kb(OUT)}KB`);
NOTE.forEach((n) => console.log('  - ' + n));

#!/usr/bin/env node
/**
 * convert.js — Chuyển 1 thiệp LadiPage đã tải về (thư mục có index.html + assets/) thành thiệp HTML/CSS/JS thuần
 * của Templexa: 1 file index.html (CSS + JS nằm trong file), ảnh WebP, giữ nguyên bố cục điện thoại (420px)
 * VÀ máy tính (960px), hiệu ứng, popup, ẩn/hiện, đếm ngược, form, lưu bút, lời chúc, album, nhạc.
 *
 *   node scripts/ladi/convert.js <thư mục LadiPage> --out <Templexa/products/Invitation/.../gen_xxx> [tuỳ chọn]
 *     --key tpx315        khoá lưu lời chúc/chữ ký trong máy khách (mặc định: tên thư mục ra)
 *     --date 2026-11-01T09:10:00+07:00   ngày giờ cho đếm ngược (bản gốc thường để kiểu "trong ngày")
 *     --title "..."       <title> thiệp
 *     --work <thư mục>    nơi để báo cáo + ảnh so sánh (mặc định <thư mục LadiPage>/_convert)
 *     --no-compare        bỏ bước chụp so sánh
 *     --templexa          áp luật Templexa: QR → QR Facebook Page, nút gửi "Gửi lời chúc & xác nhận",
 *                         dòng templexa.vn cuối thiệp, og:image + cắt og-cover.jpg từ bìa khổ máy tính
 *     --desc "..."        meta description
 *     --music <file>      nhạc nền khi bản gốc không có (vd ../Templexa/products/shared/music/wedding/Sugar.mp3)
 *
 * Phần script KHÔNG tự chuyển được (khối HTML lạ, carousel, script riêng) → để chỗ trống có class `todo-ai`
 * và liệt kê trong <work>/REPORT.md — AI đọc báo cáo rồi viết lại từng mục. Quy trình: flows/16-chuyen-thiep-ladi.md
 */
const fs = require('fs');
const path = require('path');
const http = require('http');
const { execFileSync } = require('child_process');

const OPS = path.join(__dirname, '..', '..');
const TEMPLEXA = [path.join(OPS, 'Templexa'), path.join(OPS, '..', 'Templexa')].find((p) => fs.existsSync(p));
if (!TEMPLEXA) { console.error('LOI: không thấy thư mục Templexa/'); process.exit(1); }
const puppeteer = require(path.join(TEMPLEXA, 'node_modules/puppeteer'));
const sharp = require(path.join(TEMPLEXA, 'node_modules/sharp'));
const extractInPage = require('./extract.js');

const argv = process.argv.slice(2);
const opt = (k, d) => (argv.includes(k) ? argv[argv.indexOf(k) + 1] : d);
const VALUED = ['--out', '--key', '--date', '--title', '--work', '--desc', '--music'];
const SRC = path.resolve(argv.find((a, k) => !a.startsWith('--') && !VALUED.includes(argv[k - 1])) || '.');
const OUT = opt('--out') && path.resolve(opt('--out'));
if (!fs.existsSync(path.join(SRC, 'index.html')) || !OUT) {
  console.error('Dùng: node scripts/ladi/convert.js <thư mục LadiPage> --out <thư mục thiệp mới> [--key ..] [--date ..] [--title ..]');
  process.exit(1);
}
const KEY = opt('--key', path.basename(OUT).replace(/[^a-z0-9]/gi, '').slice(0, 12));
const WORK = path.resolve(opt('--work', path.join(SRC, '_convert')));
let DATE = opt('--date', '');
const TPX = argv.includes('--templexa');
const QR_FB = path.join(TEMPLEXA, 'products/shared/images/icons/qr-facebook-templexa.webp');
// chạy lại: dọn ảnh/font cũ do CHÍNH script sinh (nhận biết qua dòng chú thích đầu index.html)
const prev = path.join(OUT, 'index.html');
if (fs.existsSync(prev) && /scripts\/ladi\/convert\.js/.test(fs.readFileSync(prev, 'utf8').slice(0, 3000))) {
  ['images', 'fonts'].forEach((d) => fs.rmSync(path.join(OUT, d), { recursive: true, force: true }));
}
fs.mkdirSync(path.join(OUT, 'images'), { recursive: true });
fs.mkdirSync(WORK, { recursive: true });
let MW = 420, DW = 960;
const TODO = [];   // việc cho AI
const NOTE = [];   // ghi chú cho người duyệt

// ---------------------------------------------------------------- máy chủ tĩnh cho thư mục gốc
function serve(dir) {
  return new Promise((res) => {
    const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.gif': 'image/gif', '.woff2': 'font/woff2', '.woff': 'font/woff', '.otf': 'font/otf', '.ttf': 'font/ttf', '.mp3': 'audio/mpeg', '.wav': 'audio/wav' };
    const srv = http.createServer((q, r) => {
      const f = path.join(dir, decodeURIComponent(q.url.split('?')[0]));
      if (!f.startsWith(dir) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); r.end(); return; }
      r.writeHead(200, { 'Content-Type': MIME[path.extname(f).toLowerCase()] || 'application/octet-stream' });
      fs.createReadStream(f).pipe(r);
    });
    srv.listen(0, '127.0.0.1', () => res(srv));
  });
}

// ---------------------------------------------------------------- tiện ích CSS
const px = (v) => {
  const f = parseFloat(String(v));
  if (isNaN(f)) return v;
  return (Math.round(f * 10) / 10) + 'px';
};
const sid = (id) => {
  const m = String(id).match(/^([A-Z_]+?)(\d+)$/);
  const S = { HEADLINE: 'h', PARAGRAPH: 'p', IMAGE: 'i', BOX: 'b', GROUP: 'g', BUTTON: 'btn', SHAPE: 'sh', COUNTDOWN: 'cd', FORM: 'form', HTML_CODE: 'code', POPUP: 'pop', LIST_PARAGRAPH: 'lp', FRAME: 'fr' };
  return m ? (S[m[1]] || m[1].toLowerCase()) + m[2] : String(id).toLowerCase();
};
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const clean = (s) => String(s || '').replace(/(\s*<br\s*\/?>\s*)+$/i, '').replace(/&nbsp;/g, ' ').trim();
const TRANSPARENT = ['rgba(0, 0, 0, 0)', 'transparent', ''];

// ---------------------------------------------------------------- tài nguyên: ảnh → WebP, font, nhạc
const ASSET = new Map();   // đường dẫn gốc (tương đối thư mục SRC) → đường dẫn mới (tương đối OUT)
const urlToRel = (u) => {
  const m = String(u).match(/url\("?(.*?)"?\)/); const s = m ? m[1] : u;
  if (!s || s === 'none' || s.startsWith('data:')) return null;
  try { const p = new URL(s, 'http://x/').pathname; return decodeURIComponent(p.replace(/^\//, '')); } catch (e) { return null; }
};
function cleanName(rel) {
  let b = path.basename(rel).replace(/\.[^.]+$/, '');
  b = b.replace(/^s\d+x\d+_/, '').replace(/-\d{14}-[\w-]{5}$/, '').replace(/^ladi_/, '').replace(/^css_/, '');
  b = b.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  return b || 'anh';
}
const pending = new Map();  // tên mới → {rel, size}
const IDENT = new Map(), USED = new Set();
// LadiPage cắt sẵn nhiều bản theo cỡ khung (s768x317_…, s1440x691_…) và lúc chạy chọn bản hợp khung.
// Làm giống: trong các bản cùng ảnh, lấy bản có tỉ lệ gần khung nhất, đủ nét (≥ 1,5× khung nếu có).
function variant(rel, box) {
  const m = path.basename(rel).match(/^s(\d+)x(\d+)_(.+)$/);
  if (!m || !box || !box[0] || !box[1]) return rel;
  const dir = path.dirname(rel), rest = m[3];
  let list; try { list = fs.readdirSync(path.join(SRC, dir)); } catch (e) { return rel; }
  const want = box[0] / box[1];
  const cands = list.map((f) => { const k = f.match(/^s(\d+)x(\d+)_(.+)$/); return k && k[3] === rest ? { f, w: +k[1], h: +k[2] } : null; }).filter(Boolean);
  if (cands.length < 2) return rel;
  cands.sort((a, b) => Math.abs(Math.log((a.w / a.h) / want)) - Math.abs(Math.log((b.w / b.h) / want)) || a.w - b.w);
  const best = cands[0], same = cands.filter((c) => Math.abs(Math.log((c.w / c.h) / (best.w / best.h))) < 0.03);
  const big = same.find((c) => c.w >= box[0] * 1.5) || same[same.length - 1];
  return path.join(dir, big.f).replace(/\\/g, '/');
}
const REMOTE = new Map();   // url ngoài → tên file trong images/
function asset(u, sub, box) {
  const raw = (String(u).match(/url\("?(.*?)"?\)/) || [, u])[1];
  if (/^https?:\/\//.test(raw) && !/127\.0\.0\.1|localhost/.test(raw) && /\.(jpe?g|png|webp|gif)(\?|$)/i.test(raw)) {
    if (!REMOTE.has(raw)) { let name = cleanName(raw.split('?')[0]) + '.webp'; while (USED.has(name)) name = name.replace(/(-\d+)?\.webp$/, (m, k) => `-${k ? 1 - parseInt(k) : 2}.webp`); USED.add(name); REMOTE.set(raw, name); }
    return 'images/' + REMOTE.get(raw);
  }
  let rel = urlToRel(u);
  if (!rel) return null;
  if (TPX && /qr/i.test(path.basename(rel)) && fs.existsSync(QR_FB)) {   // QR của bên bán gốc → QR Facebook Page Templexa
    if (!asset.qrNoted) { NOTE.push('QR quà mừng của bản gốc đã thay bằng QR Facebook Page Templexa.'); asset.qrNoted = true; }
    return path.relative(OUT, QR_FB).split(path.sep).join('/');
  }
  // (không đoán bản sWxH theo tên — tên không phản ánh cỡ thật; lấy đúng file trình duyệt đã hiển thị khi đo)
  if (ASSET.has(rel)) return ASSET.get(rel);
  const file = path.join(SRC, rel);
  if (!fs.existsSync(file)) { NOTE.push(`Thiếu file ảnh gốc: ${rel}`); ASSET.set(rel, rel); return rel; }
  const ext = path.extname(rel).toLowerCase();
  // cùng 1 ảnh nhiều cỡ (s400x350_…, s800x800_…) → chung 1 file (giữ cỡ lớn nhất); ảnh KHÁC mà trùng tên gọn → thêm -2, -3
  const ident = rel;   // bản s768x317_… có thể là ảnh đã CẮT khác tỉ lệ → không gộp các cỡ
  let name = IDENT.get(ident);
  if (!name) {
    const base = (sub ? sub + '/' : '') + cleanName(rel); let k = 1;
    name = base + (ext === '.svg' ? '.svg' : '.webp');
    while (USED.has(name)) name = base + '-' + (++k) + (ext === '.svg' ? '.svg' : '.webp');
    USED.add(name); IDENT.set(ident, name);
  }
  const size = fs.statSync(file).size;
  const cur = pending.get(name);
  if (!cur || size > cur.size) pending.set(name, { rel, size });
  const out = 'images/' + name;
  ASSET.set(rel, out);
  return out;
}
async function writeAssets() {
  for (const [url, name] of REMOTE) {   // ảnh bản gốc để ở máy chủ ảnh ngoài (agy không tải về)
    try {
      const r = await fetch(url); if (!r.ok) throw new Error('HTTP ' + r.status);
      await sharp(Buffer.from(await r.arrayBuffer())).resize({ width: 1400, withoutEnlargement: true }).webp({ quality: 82 }).toFile(path.join(OUT, 'images', name));
      NOTE.push(`Ảnh ở máy chủ ngoài đã tải về: ${url} → images/${name}`);
    } catch (e) { NOTE.push(`Không tải được ảnh ngoài ${url}: ${e.message}`); }
  }
  for (const [name, { rel }] of pending) {
    const src = path.join(SRC, rel), dst = path.join(OUT, 'images', name);
    fs.mkdirSync(path.dirname(dst), { recursive: true });
    const ext = path.extname(rel).toLowerCase();
    try {
      if (ext === '.svg') fs.copyFileSync(src, dst);
      else if (ext === '.gif') {
        try { execFileSync('gif2webp', ['-quiet', '-lossy', '-q', '80', src, '-o', dst]); }
        catch (e) { await sharp(src, { animated: true }).webp({ quality: 80 }).toFile(dst); }
      } else {
        const meta = await sharp(src).metadata();
        let img = sharp(src);
        if ((meta.width || 0) > 1400) img = img.resize({ width: 1400 });
        await img.webp({ quality: 82, alphaQuality: 100 }).toFile(dst);
      }
    } catch (e) { NOTE.push(`Không đổi được ${rel}: ${e.message}`); }
  }
}

// ---------------------------------------------------------------- kiểu chữ → class dùng chung
const GOOGLE = ['Open Sans', 'Roboto', 'Sriracha', 'Dancing Script', 'Montserrat', 'Playfair Display', 'Great Vibes', 'Lora', 'Quicksand', 'Nunito', 'Pacifico', 'Lobster', 'Cormorant Garamond', 'Inter', 'Be Vietnam Pro', 'Noto Serif', 'Noto Sans', 'Mali', 'Itim', 'Pattaya', 'Charm', 'Baloo 2', 'Prata', 'Josefin Sans', 'Raleway', 'Lexend', 'Oswald', 'Merriweather', 'Alex Brush', 'Parisienne', 'Tangerine', 'Allura', 'Pinyon Script', 'Mulish', 'Arima', 'Comfortaa', 'Bungee', 'Paytone One', 'Nunito Sans', 'Libre Baskerville', 'EB Garamond', 'Crimson Text', 'Cinzel', 'Bodoni Moda', 'Italianno', 'Sacramento', 'Ephesis', 'Imperial Script', 'Corinthia', 'Updock', 'Ballet', 'Mea Culpa', 'Ole', 'Moon Dance', 'WindSong', 'Tinos', 'Philosopher', 'Yeseva One', 'Roboto Slab', 'Shantell Sans', 'Arimo', 'Cousine', 'Bitter', 'Kanit', 'Podkova', 'Alegreya', 'Spectral', 'Vollkorn', 'Signika', 'Saira', 'Barlow', 'Manrope', 'Work Sans', 'Lato', 'Source Sans 3', 'Encode Sans', 'Fira Sans', 'Exo 2', 'Jost', 'Petrona', 'Dosis', 'Hepta Slab', 'Taviraj', 'Trirong', 'Chakra Petch', 'Sarabun'];
const FAMILIES = new Map();  // tên font → {google, weights:Set, italic}
const typo = new Map();
function family(ff) { return String(ff).split(',')[0].replace(/["']/g, '').trim(); }
function tclass(st) {
  if (!st || !st['font-size']) return '';
  const fam = family(st['font-family']);
  const size = parseFloat(st['font-size']);
  const lhv = parseFloat(st['line-height']);
  const lh = isNaN(lhv) ? 1.6 : Math.round(lhv / size * 100) / 100;
  const bold = ['700', 'bold', '800', '900', '600'].includes(st['font-weight']);
  const ital = st['font-style'] === 'italic';
  const grad = /gradient/.test(st['background-image'] || '') && /text/.test(st['-webkit-background-clip'] || '');
  const f = FAMILIES.get(fam) || { weights: new Set(), italic: false }; f.weights.add(st['font-weight']); f.italic = f.italic || ital; FAMILIES.set(fam, f);
  const key = [fam, size, lh, st['font-weight'], ital, st.color, grad ? st['background-image'] : '', st['text-transform'], st['text-shadow'], st['text-align'], st['letter-spacing'], st['text-decoration-line']].join('|');
  if (typo.has(key)) return typo.get(key).name;
  const slug = fam.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 5) || 'f';
  const name = `t${typo.size + 1}-${slug}${Math.round(size)}${bold ? 'b' : ''}${ital ? 'i' : ''}`;
  const css = [`font-family:"${fam}",${/script|vibes|dancing|brush|pacifico|charm/i.test(fam) ? 'cursive' : 'sans-serif'}`, `font-size:${size}px`, `line-height:${lh}`, `font-weight:${st['font-weight']}`];
  if (ital) css.push('font-style:italic');
  css.push(`color:${st.color}`);
  if (st['text-transform'] !== 'none') css.push('text-transform:' + st['text-transform']);
  if (st['text-shadow'] !== 'none') css.push('text-shadow:' + st['text-shadow']);
  if (st['text-align'] && st['text-align'] !== 'center') css.push('text-align:' + (st['text-align'] === 'start' ? 'left' : st['text-align']));
  if (st['letter-spacing'] && st['letter-spacing'] !== 'normal') css.push('letter-spacing:' + st['letter-spacing']);
  if (st['text-decoration-line'] && st['text-decoration-line'] !== 'none') css.push('text-decoration:' + st['text-decoration-line']);
  if (grad) css.push(`background:${st['background-image']};-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent`);
  typo.set(key, { name, css: css.join(';') });
  return name;
}

function boxcss(st, opts = {}, box) {
  const css = [];
  if (!st) return css;
  if (!opts.skipbg && st['background-color'] && !TRANSPARENT.includes(st['background-color']) && !/rgba\(\d+, \d+, \d+, 0\)/.test(st['background-color'])) css.push('background-color:' + st['background-color']);
  if (!opts.skipbg && st['background-image'] && st['background-image'] !== 'none') {
    if (/gradient/.test(st['background-image'])) css.push('background-image:' + st['background-image']);
    else { const a = asset(st['background-image'], null, box); if (a) css.push(`background-image:url(${a});background-size:${st['background-size']};background-position:${st['background-position']};background-repeat:${st['background-repeat'] || 'no-repeat'}` + (st['background-attachment'] === 'fixed' ? ';background-attachment:fixed' : '')); }
  }
  const sides = ['top', 'right', 'bottom', 'left'].map((k) => [k, st[`border-${k}-width`], st[`border-${k}-style`] || st['border-top-style'], st[`border-${k}-color`] || st['border-top-color']]);
  const on = sides.filter(([, w, sty]) => w && w !== '0px' && sty && sty !== 'none');
  if (on.length === 4 && new Set(on.map((x) => x.slice(1).join(' '))).size === 1) css.push(`border:${on[0][1]} ${on[0][2]} ${on[0][3]}`);
  else on.forEach(([k, w, sty, c]) => css.push(`border-${k}:${w} ${sty} ${c}`));
  if (st['border-radius'] && st['border-radius'] !== '0px') css.push('border-radius:' + st['border-radius']);
  if (st['box-shadow'] && st['box-shadow'] !== 'none') css.push('box-shadow:' + st['box-shadow']);
  if (st.filter && st.filter !== 'none') css.push('filter:' + st.filter);
  if (st.opacity && st.opacity !== '1' && !opts.skipop) css.push('opacity:' + st.opacity);
  if (st['mix-blend-mode'] && st['mix-blend-mode'] !== 'normal') css.push('mix-blend-mode:' + st['mix-blend-mode']);
  const m = st['-webkit-mask-image'];
  if (m && m !== 'none' && (/^url\("?data:/.test(m) || /gradient/.test(m))) {   // mặt nạ SVG nhúng / gradient → giữ nguyên
    const ms = st['-webkit-mask-size'] || 'contain', mp = st['-webkit-mask-position'] || 'center';
    css.push(`-webkit-mask:${m} ${mp}/${ms} no-repeat;mask:${m} ${mp}/${ms} no-repeat`);
  } else if (m && m !== 'none') { const a = asset(m); if (a) css.push(`-webkit-mask:url(${a}) ${st['-webkit-mask-position'] || 'center'}/${st['-webkit-mask-size'] || 'contain'} no-repeat;mask:url(${a}) ${st['-webkit-mask-position'] || 'center'}/${st['-webkit-mask-size'] || 'contain'} no-repeat`); }
  return css;
}

// ---------------------------------------------------------------- sinh HTML + CSS
const rules = [], drules = [];
let DMAP = {};
function pos(n, text) {
  const [l, t, w, h] = n.pos;
  const c = [`left:${px(l)}`, `top:${px(t)}`, `width:${px(w)}`];
  if (!text) c.push(`height:${px(h)}`);
  return c;
}
function R(sel, n, fn) {
  const m = fn(n);
  if (/^#[a-z0-9]+$/.test(sel) && n.tf && !n.fix) m.push('transform:' + n.tf);   // xoay / nghiêng của thiết kế
  rules.push([sel, m]);
  const d0 = DMAP[n.id];
  if (d0) { const d = fn(d0).filter((x) => !m.includes(x)); if (d.length) drules.push([sel, d]); }
}
function tdiff(n) {
  const d = DMAP[n.id];
  if (!d || !d.st || !n.st || !d.st['font-size']) return;
  const a = n.st, b = d.st, out = [];
  if (a['font-size'] !== b['font-size']) out.push('font-size:' + px(b['font-size']));
  if (a['line-height'] !== b['line-height'] || a['font-size'] !== b['font-size']) {
    const r = parseFloat(b['line-height']) / parseFloat(b['font-size']); if (!isNaN(r)) out.push('line-height:' + Math.round(r * 100) / 100);
  }
  if (a['text-align'] !== b['text-align']) out.push('text-align:' + b['text-align']);
  if (out.length) drules.push(['#' + sid(n.id), out]);
}
const FIXED = [];
function fixedCss(n) {
  const [l, r, t, b, tf, zz] = n.fix;
  const z0 = parseInt(zz, 10), zi = isNaN(z0) ? 50 : z0 >= 1e6 ? 97 : Math.min(z0, 99);   // dưới popup (100); bìa z ≥ 99 nằm trên cửa (98)
  return ['position:fixed', `left:${l === 'auto' ? 'auto' : px(l)}`, `right:${r === 'auto' ? 'auto' : px(r)}`, `top:${t === 'auto' ? 'auto' : px(t)}`, `bottom:${b === 'auto' ? 'auto' : px(b)}`, `width:${px(n.pos[2])}`, `height:${px(n.pos[3])}`, `z-index:${zi}`].concat(tf && tf !== 'none' ? ['transform:' + tf] : []);
}

let SECNAME = {};
const idOf = (x) => SECNAME[x] || sid(x);
const TARGETS = new Set();   // phần tử là đích của nút ẩn/hiện
// Dịch script jQuery ngắn hay gặp trong thiệp đại lý → hành động (có trễ ms). Phần không hiểu trả về `rest`.
function parseScript(src, base = 0) {
  let t = src.replace(/&#34;/g, '"').replace(/&#39;/g, "'").replace(/&#62;/g, '>').replace(/&#60;/g, '<').replace(/&#123;/g, '{').replace(/&#125;/g, '}');
  const acts = [];
  const Q = `["']`;
  // setTimeout(() => { … }, N) — đếm cặp ngoặc để thân hàm có if { } lồng bên trong vẫn đúng
  for (let guard = 0; guard < 50; guard++) {
    const m = /setTimeout\(\s*(?:\(\)\s*=>|function\s*\(\)\s*)\s*\{/.exec(t); if (!m) break;
    let i = m.index + m[0].length, depth = 1;
    while (i < t.length && depth) { if (t[i] === '{') depth++; else if (t[i] === '}') depth--; i++; }
    const body = t.slice(m.index + m[0].length, i - 1);
    const tail = /^\s*,\s*(\d+)\s*\)\s*;?/.exec(t.slice(i));
    if (!tail) break;
    const r = parseScript(body, base + +tail[1]); acts.push(...r.acts);
    t = t.slice(0, m.index) + (r.rest ? ' ' + r.rest + ' ' : ' ') + t.slice(i + tail[0].length);
  }
  // biến gán bằng getElementById → thay thẳng bằng document.getElementById("ID"); bỏ lớp if (biến) { … }
  const vars = {};
  t = t.replace(/(?:const|let|var)\s+(\w+)\s*=\s*document\.getElementById\(\s*["']([\w-]+)["']\s*\)\s*;?/g, (m, v, id) => { vars[v] = id; return ' '; });
  for (const [v, id] of Object.entries(vars)) {
    t = t.replace(new RegExp(`if\\s*\\(\\s*${v}\\s*\\)\\s*\\{([\\s\\S]*?)\\}`, 'g'), '$1')
      .replace(new RegExp(`\\b${v}\\b(\\??\\.)`, 'g'), `document.getElementById("${id}")$1`);
  }
  // document.getElementById("X").style.setProperty("display", "block", …)
  t = t.replace(/document\.getElementById\(\s*["']([\w-]+)["']\s*\)\??\.style\.setProperty\(\s*["']display["']\s*,\s*["'](none|block|flex)["'][^)]*\)\s*;?/g, (m, id, d) => { acts.push(Object.assign({ t: d === 'none' ? 'hide' : 'show', ids: [idOf(id)] }, base ? { ms: base } : {})); return ' '; });
  // document.querySelectorAll(".x").forEach(el => { el.style.display = "none" })
  t = t.replace(/document\.querySelectorAll\(\s*["'](\.[\w-]+)["']\s*\)\.forEach\(\s*\(?(\w+)\)?\s*=>\s*\{?\s*\2\.style\.display\s*=\s*["'](none|block|flex|)["']\s*;?\s*\}?\s*\)\s*;?/g, (m, sel, v, d) => { acts.push(Object.assign({ t: d === 'none' ? 'hideSel' : 'showSel', sel }, base ? { ms: base } : {})); return ' '; });
  // document.getElementById("X").style.display = "none" | "block"
  t = t.replace(/document\.getElementById\(\s*["']([\w-]+)["']\s*\)\??\.style\.display\s*=\s*["'](none|block|flex)["']\s*;?/g, (m, id, d) => { acts.push(Object.assign({ t: d === 'none' ? 'hide' : 'show', ids: [idOf(id)] }, base ? { ms: base } : {})); return ' '; });
  const rules = [
    [new RegExp(`\\$\\(${Q}#([\\w-]+)${Q}\\)\\.(show|hide)\\(\\)`, 'g'), (m, id, k) => ({ t: k, ids: [idOf(id)] })],
    [new RegExp(`\\$\\(${Q}#([\\w-]+)${Q}\\)\\.attr\\(\\s*${Q}style${Q}\\s*,\\s*${Q}\\s*display:\\s*(block|flex|none)[^"']*${Q}\\s*\\)`, 'g'), (m, id, d) => ({ t: d === 'none' ? 'hide' : 'show', ids: [idOf(id)] })],
    [new RegExp(`\\$\\(${Q}#([\\w-]+)${Q}\\)\\.css\\(\\s*${Q}display${Q}\\s*,\\s*${Q}(block|flex|none)${Q}\\s*\\)`, 'g'), (m, id, d) => ({ t: d === 'none' ? 'hide' : 'show', ids: [idOf(id)] })],
    [new RegExp(`document\\.getElementById\\(${Q}([\\w-]+)${Q}\\)\\??\\.scrollIntoView\\([^)]*\\)`, 'g'), (m, id) => ({ t: 'section', id: idOf(id) })],
    [new RegExp(`\\$\\(${Q}(\\.[\\w-]+)${Q}\\)\\.(hide|show)\\(\\)`, 'g'), (m, sel, k) => ({ t: k === 'hide' ? 'hideSel' : 'showSel', sel })],
    [new RegExp(`\\$\\(${Q}#POPUP\\d+${Q}\\)\\.css\\([^)]*\\)`, 'g'), () => null],   // popup phủ màn — đã xử lý chung
    [/handleOpenDoor\(\)/g, () => null],                                                    // hàm không có trong bản gốc
    // hiệu ứng của bộ thư viện đại lý (code.js / weddingNN.js) → bản viết lại trong runtime
    [/runButterflyEffect\(\s*\{([^}]*)\}\s*\)/g, (m, o) => {
      const g = (k, d) => { const r = o.match(new RegExp(k + '\\s*:\\s*["\']?([^,"\'}]+)')); return r ? r[1].trim() : d; };
      return { t: 'fx', fx: 'butterfly', count: +g('count', 16), size: +g('size', 1), color: g('color', '#fff'), body: g('bodyColor', '#fff'), dur: +g('duration', 12000) };
    }],
    [new RegExp(`cuaAnh\\(\\s*${Q}([\\w-]+)${Q}[^)]*\\)`, 'g'), (m, id) => ({ t: 'reveal', id: idOf(id) })],
    [/runOpenEffects\(\)/g, () => ({ t: 'addClass', sel: '.effectOpen1,.effectOpen2,.effectOpen3,.effectOpen4', cls: 'run' })],   // phần bìa bay ra
    [/hineOpenCard\(\s*(\d*)\s*\)/g, (m, ms) => ({ t: 'hideSel', sel: '.UIopenCard', ms: +ms || 0 })],
    [/StartOpenDoor\(\s*(\d*)\s*\)/g, (m, ms) => ({ t: 'door', dur: +ms || 2000 })],   // 2 cánh cửa bìa trượt ra (configOpenDoor)
    [/(StartScroll|resetBorderedAnimation|enableScroll|disableScroll)\([^)]*\)/g, () => null],
    [/function\s+\w+\s*\(\)\s*\{\s*\}/g, () => null],
  ];
  for (const [rx, fn] of rules) t = t.replace(rx, (...a) => { const x = fn(...a); if (x) acts.push(base ? Object.assign(x, { ms: base }) : x); return ' '; });
  const rest = t.replace(/\/\/[^\n]*/g, '').replace(/[;\s]+/g, ' ').trim();
  return { acts, rest };
}
function actions(n) {
  const cs = n.ev && n.ev.cs; if (!cs) return '';
  const out = [];
  for (const c of cs) {
    if (!c.a) continue;   // hành động rỗng của LadiPage
    if (c.a === 'popup' && c.dw) out.push({ t: 'popup', id: sid(c.dw) });
    else if (c.a === 'collapse' && c.dw) out.push({ t: 'collapse', id: sid(c.dw) });
    else if (c.a === 'hidden_show' && c.dw) out.push({ t: 'toggle', id: sid(c.dw) });
    else if (c.a === 'hidden_show') {   // dE = ẩn, dD = hiện (phần, popup, nhóm)
      if ((c.dE || []).length) out.push({ t: 'hide', ids: c.dE.map(idOf), on: c.dr === 'hover' ? 'hover' : 'click' });
      if ((c.dD || []).length) out.push({ t: 'show', ids: c.dD.map(idOf), on: c.dr === 'hover' ? 'hover' : 'click' });
    } else if (c.a === 'set_style' && c.dw) {   // đổi kiểu khi rê chuột / bấm
      const css = Object.entries(c.dP || {}).map(([k, v]) => `${k}:${v}`); if (c.dS) css.push('background-color:' + c.dS);
      out.push({ t: 'style', id: idOf(c.dw), css: css.join(';'), on: c.dr === 'hover' ? 'hover' : 'click' });
    } else if (c.a === 'copy_clipboard') out.push({ t: 'copy', text: c.dw || '' });
    else if (c.a === 'dropbox' && c.dw) out.push({ t: 'dropbox', id: sid(c.dw), at: (c.dO && c.dO.dt) || 'bottom_left' });
    else if (c.a === 'section' && c.dw) out.push({ t: 'section', id: SECNAME[c.dw] || sid(c.dw) });
    else if (c.a === 'custom_script') {
      const src = c.event_custom_script || '';
      if (/clearCanvas/.test(src)) { out.push({ t: 'fn', fn: 'sig.clear' }); continue; }
      if (/previewSignature/.test(src)) { out.push({ t: 'fn', fn: 'sig.preview' }); continue; }
      if (/saveSignature/.test(src)) { out.push({ t: 'fn', fn: 'sig.save' }); continue; }
      const r = parseScript(src);
      r.acts.forEach((x) => out.push(x));
      if (r.rest) TODO.push(`#${sid(n.id)} có script riêng khi bấm — phần chưa dịch được: \`${r.rest.slice(0, 160)}\``);
    } else if (c.a === 'link' && c.dw) out.push({ t: 'link', href: c.dw });
    else TODO.push(`#${sid(n.id)} hành động "${c.a}" chưa hỗ trợ (${JSON.stringify(c).slice(0, 120)})`);
  }
  return out.length ? ` data-act='${JSON.stringify(out).replace(/'/g, '&#39;')}'` : '';
}
const animAttr = (n) => (n.anim ? ` data-a="${n.anim[0]} ${n.anim[2]} ${n.anim[1]} ${n.anim[3]}"` : '');
function extraClass(n) {
  const c = n.cls || ''; const out = [];
  if (/class_tenKhachMoi/.test(c)) out.push('guest-name');
  if (/photoBookImage/.test(c)) out.push('zoom');
  (c.match(/effect-[\w-]+/g) || []).forEach((e) => out.push('fx-' + e.slice(7)));
  if (/off_speaker/.test(c)) out.push('off_speaker');
  if (/on_speaker/.test(c)) out.push('on_speaker');
  if (/Signature_BTN_luu/.test(c)) out.push('sig-save');
  c.split(/\s+/).filter((k) => k && !/^(class_tenKhachMoi|photoBookImage|effect-|off_speaker|on_speaker|Signature_BTN)/.test(k)).forEach((k) => out.push(k));
  return out.length ? ' ' + out.join(' ') : '';
}

let WISHES = [];
const SIGS = [];
function snapAttrs(n) {
  const a = n.attrs || {}; let out = '';
  for (const [k, v] of Object.entries(a)) { if (k === 'class' || !v && v !== '') continue; out += ` ${k}="${esc(v)}"`; }
  if (n.vars) out += ` style="${esc(n.vars)}"`;
  return { cls: (a.class || '').trim(), attrs: out };
}
function fixSnap(raw) {
  return raw.replace(/<script(?![^>]*application\/json)[\s\S]*?<\/script>/g, '').replace(/<audio[\s\S]*?<\/audio>|<audio[^>]*\/?>/g, '').replace(/<link[^>]*rel=["']?stylesheet[^>]*>/gi, '')
    .replace(/(src|data-src)="([^"]+)"/g, (m, k, u) => { if (/^(https?:|data:)/.test(u) && !/127\.0\.0\.1/.test(u)) return m; const a = asset(u); return a ? `${k}="${a}"` : m; })
    .replace(/url\((&quot;|["'])?([^"')&]+)(&quot;|["'])?\)/g, (m, q, u) => { if (/^data:/.test(u)) return m; const a = asset(u); return a ? `url(${a})` : m; });
}
function htmlCode(n) {
  const raw = n.raw || ''; const s = sid(n.id);
  if (/previewContainer/.test(raw)) {
    let imgs = '';
    for (const m of raw.matchAll(/<img[^>]*src="([^"]+)"[^>]*style="([^"]*)"[^>]*>/g)) {
      const a = asset(m[1], 'signatures'); const top = (m[2].match(/top:\s*([\d.]+%)/) || [])[1]; const left = (m[2].match(/left:\s*([\d.]+%)/) || [])[1];
      const w = (m[2].match(/width:\s*([\d.]+%)/) || [])[1];
      if (a && top && left) imgs += `<img src="${a}" style="top:${top};left:${left}${w && w !== '15%' ? ';width:' + w : ''}" alt="" loading="lazy">`;
    }
    SIGS.push(s);
    return `<div class="el" id="${s}"${animAttr(n)}><div id="sigBoard">${imgs}</div></div>`;
  }
  if (/signatureCanvas/.test(raw)) {
    const w = (raw.match(/width="(\d+)"/) || [, 400])[1], h = (raw.match(/height="(\d+)"/) || [, 250])[1];
    const b = (raw.match(/<canvas[^>]*style="([^"]*)"/) || [, ''])[1];
    return `<div class="el sig-wrap" id="${s}"><canvas id="sigCanvas" width="${w}" height="${h}" style="${esc(b)}"></canvas></div>`;
  }
  if (/id="MessageBox"/.test(raw)) {
    for (const m of raw.matchAll(/<h4[^>]*>([\s\S]*?)<\/h4>\s*<p[^>]*>([\s\S]*?)<\/p>/g)) {
      const name = m[1].replace(/<[^>]+>/g, '').trim(), msg = m[2].replace(/<br\s*\/?>/g, '\n').replace(/<[^>]+>/g, '').trim();
      if (name && msg && name !== '--') WISHES.push([name, msg]);
    }
    const color = (raw.match(/#MessageBox\s*>\s*\*\s*\{\s*color:\s*([^;]+);/) || [, ''])[1];
    if (color) rules.push([`#${s} .wish p,#${s} .wish b`, [`color:${color.trim()}`]]);
    const empty = (raw.replace(/<style[\s\S]*?<\/style>/g, '').match(/<div[^>]*class="[^"]*(empty|placeholder|first)[^"]*"[^>]*>([\s\S]*?)<\/div>/i) || [])[2]
      || (WISHES.length ? '' : raw.replace(/<style[\s\S]*?<\/style>|<script[\s\S]*?<\/script>/g, '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim());
    return `<div class="el wishes" id="${s}"><div id="wishList"></div>${empty ? `<div class="wish wish-empty">${empty.replace(/<[^>]+>/g, ' ').trim()}</div>` : ''}</div>`;
  }
  if (/<iframe[^>]*google\.com\/maps/.test(raw)) {
    const src = (raw.match(/<iframe[^>]*src="([^"]+)"/) || [])[1];
    return `<div class="el map" id="${s}"><iframe src="${src}" title="Bản đồ" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe></div>`;
  }
  if (/audio_music|<audio/.test(raw)) return '';
  let snap = fixSnap(raw);
  const dRaw = DMAP[n.id] && DMAP[n.id].raw;   // widget tự xếp theo độ rộng màn → bản máy tính chụp riêng
  if (dRaw && fixSnap(dRaw) !== snap && /<img|background-image|style="[^"]*width/.test(dRaw)) snap = `<div class="snap-m">${snap}</div><div class="snap-d">${fixSnap(dRaw)}</div>`;
  const sa = snapAttrs(n);
  if (/class="countdown-item"/.test(snap)) {
    if (!DATE) NOTE.push(`Đếm ngược #${s} (widget) — truyền --date để đếm tới ngày cưới.`);
    return `<div class="el cd snap ${sa.cls}${extraClass(n)}" id="${s}"${sa.attrs}${DATE ? ` data-at="${DATE}"` : ''}${animAttr(n)}><div class="ladi-html-code">${snap}</div></div>`;
  }
  if (/wb-(msg|rsvp)-form|wb-sig-root|wb-tl|data-name="/.test(snap) || !/<(input|textarea|select|button|canvas)/.test(snap)) {
    return `<div class="el snap ${sa.cls}${extraClass(n)}" id="${s}"${sa.attrs}${animAttr(n)}><div class="ladi-html-code">${snap}</div></div>`;   // widget đã biết (runtime gắn thao tác) hoặc chỉ hiển thị
  }
  TODO.push(`#${s} khối HTML riêng (${raw.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 80) || 'không chữ'}) — đã chép nguyên vào thiệp, cần AI kiểm/viết lại (bỏ jQuery, đổi ảnh).`);
  return `<div class="el todo-ai" id="${s}">${snap}</div>`;
}

function countdown(n) {
  const s = sid(n.id);
  const cfg = n.ev || {};
  let at = DATE;
  if (!at && cfg.bX === 'endtime' && cfg.bT) at = new Date(cfg.bT).toISOString();
  if (!at) NOTE.push(`Đếm ngược #${s} của bản gốc là kiểu "${cfg.bX || '?'}" (đếm tới cuối mỗi ngày) — truyền --date để đếm tới ngày cưới.`);
  const items = (n.items || []).map((it, k) => {
    const cls = tclass(it.st);
    const c = [`left:${px(it.pos[0])}`, `top:${px(it.pos[1])}`, `width:${px(it.pos[2])}`, `height:${px(it.pos[3])}`].concat(boxcss(it.bg));
    rules.push([`#${s} .cd-i${k}`, c]);
    const d = DMAP[n.id] && DMAP[n.id].items && DMAP[n.id].items[k];
    if (d) {
      const dc = [`left:${px(d.pos[0])}`, `top:${px(d.pos[1])}`, `width:${px(d.pos[2])}`, `height:${px(d.pos[3])}`].filter((x) => !c.includes(x));
      if (d.st && d.st['font-size'] !== it.st['font-size']) dc.push('font-size:' + d.st['font-size'], 'line-height:' + d.st['line-height']);
      if (dc.length) drules.push([`#${s} .cd-i${k}`, dc]);
    }
    return `<div class="cd-i cd-i${k} ${cls}" data-cd="${it.type}">00</div>`;
  }).join('');
  if (n.layout === 'flex') rules.push([`#${s}`, ['display:flex', 'justify-content:space-between']]);
  return `<div class="el cd" id="${s}"${at ? ` data-at="${at}"` : ''}${animAttr(n)}>${items}</div>`;
}

let FORM_POPUP = {};
function form(n) {
  const s = sid(n.id); let html = '';
  for (const it of n.items || []) {
    const fs_ = sid(it.id);
    const c = [`left:${px(it.pos[0])}`, `top:${px(it.pos[1])}`, `width:${px(it.pos[2])}`, `height:${px(it.pos[3])}`];
    if (it.button !== undefined) {
      rules.push([`#${fs_}`, c.concat([`background-color:${it.bb['background-color']}`]).concat(boxcss(it.bst, { skipbg: true }))]);
      let label = clean(it.button);
      if (TPX) label = /[a-zà-ỹ]/.test(label.replace(/<[^>]+>/g, '')) ? 'Gửi lời chúc &amp; xác nhận' : 'GỬI LỜI CHÚC &amp; XÁC NHẬN';   // luật Templexa: 1 nút
      html += `<button type="submit" class="f-btn ${tclass(it.st)}" id="${fs_}"><span>${label}</span></button>`;
    } else {
      rules.push([`#${fs_}`, c.concat(boxcss(it.bg)).concat(it.cst && parseFloat(it.cst['border-top-width']) > 0 ? [`border:${it.cst['border-top-width']} ${it.cst['border-top-style']} ${it.cst['border-top-color']}`, `border-radius:${it.cst['border-radius']}`] : [])]);
      if (it.st && it.st['font-size']) rules.push([`#${fs_} .f-ctl,#${fs_} label`, [`font-size:${it.st['font-size']}`, `color:${it.st.color}`, `font-family:${it.st['font-family']}`]]);
      const inner = it.html
        .replace(/class="[^"]*ladi-form-control[^"]*"/g, 'class="f-ctl"')
        .replace(/<div class="ladi-form-checkbox-item"><input([^>]*)><span[^>]*>([^<]*)<\/span><\/div>/g, '<label><input$1>$2</label>')
        .replace(/ class="ladi-[^"]*"/g, '').replace(/ data-(checked|selected)="[^"]*"/g, '').replace(/ tabindex="\d+"/g, '');
      html += `<div class="f-item" id="${fs_}">${inner}</div>`;
    }
    const d = DMAP[it.id] || null;
    if (d) {
      const dc = [`left:${px(d.pos[0])}`, `top:${px(d.pos[1])}`, `width:${px(d.pos[2])}`, `height:${px(d.pos[3])}`].filter((x) => !c.includes(x));
      if (dc.length) drules.push([`#${fs_}`, dc]);
    }
  }
  let pop = '';
  try {
    const cfg = JSON.parse(String((n.ev || {})['option.dynamic_form_config'] || '{}').replace(/&#123;/g, '{').replace(/&#125;/g, '}').replace(/&#34;/g, '"'));
    const a = (cfg.default_actions || []).find((x) => x.id_open_popup); if (a) pop = sid(a.id_open_popup);
  } catch (e) {}
  return `<form class="el lp-form" id="${s}" autocomplete="off"${pop ? ` data-popup="${pop}"` : ''}>${html}</form>`;
}

function emit(n) {
  const s = sid(n.id), t = n.type;
  const a = animAttr(n) + actions(n), x = extraClass(n);
  const hid = n.disp === 'none' ? (TARGETS.has(n.id) ? ' collapse-target' : (/speaker/.test(n.cls || '') ? '' : ' hid')) : '';
  if (n.fix) {
    FIXED.push(s); rules.push([`#${s}`, fixedCss(n)]);
    if (DMAP[n.id] && DMAP[n.id].fix) drules.push([`#${s}`, fixedCss(DMAP[n.id]).filter((y) => !fixedCss(n).includes(y))]);
  }
  if (t === 'ladi-group') {
    if (!n.fix) R(`#${s}`, n, (z) => pos(z));
    return `<div class="el${x}${hid}" id="${s}"${a}>${(n.kids || []).map(emit).join('')}</div>`;
  }
  if (!n.fix) {
    if (/headline|paragraph/.test(t)) R(`#${s}`, n, (z) => pos(z, true));
    else if (!['ladi-countdown', 'ladi-form'].includes(t) || true) R(`#${s}`, n, (z) => pos(z));
  }
  if (/headline|paragraph/.test(t)) {
    tdiff(n);
    const op = parseFloat(n.eop) < 1 ? ` style="--op:${n.eop}"` : '';
    return `<div class="el t ${tclass(n.st)}${x}${hid}" id="${s}"${a}>${op ? `<span${op} class="op">` : ''}${clean(n.html)}${op ? '</span>' : ''}</div>`;
  }
  if (t === 'ladi-button') {
    R(`#${s}`, n, (z) => [`background-color:${z.bb['background-color']}`].concat(boxcss(z.bb, { skipbg: true })).concat(boxcss(z.bst, { skipbg: true })));
    tdiff(n);
    return `<div class="el btn ${tclass(n.st)}${x}${hid}" id="${s}"${a}><span>${clean(n.html)}</span></div>`;
  }
  if (t === 'ladi-box' || t === 'ladi-frame') {
    R(`#${s}`, n, (z) => boxcss(z.st).concat(parseFloat(z.eop) < 1 && !z.anim ? [`opacity:${z.eop}`] : []));
    if (parseFloat(n.eop) < 1 && n.anim) NOTE.push(`#${s} mờ ${n.eop} và có hiệu ứng — kiểm độ mờ sau hiệu ứng.`);
    if (t === 'ladi-frame') TODO.push(`#${s} là khung "frame" của LadiPage — kiểm lại hiển thị.`);
    if (n.raw) {   // hộp có nội dung do script gốc chèn — chụp lại, đếm ngược thì gắn chạy
      const cd = /countdown-item|cd-day/.test(n.raw);
      return `<div class="el snap${cd ? ' cd' : ''}${x}${hid}" id="${s}"${cd && DATE ? ` data-at="${DATE}"` : ''}${a}><div class="ladi-box" style="${esc(n.innerStyle || '')}">${fixSnap(n.raw)}</div></div>`;
    }
    return `<div class="el${x}${hid}" id="${s}"${a}></div>`;
  }
  if (t === 'ladi-image') {
    R(`#${s}`, n, (z) => boxcss(z.st, { skipbg: true }).concat(['overflow:hidden']));
    const url = asset(n.img[0], null, [parseFloat(n.img[3]), parseFloat(n.img[4])]);
    R(`#${s} i`, n, (z) => {
      const [, l, tp, w, h, bs, bp] = z.img; const u = asset(z.img[0], null, [parseFloat(w), parseFloat(h)]) || url;
      if (!u) return ['display:none'];   // ảnh không có nguồn (script gốc gắn sau / để trống)
      const fit = bs && bs !== 'auto' && bs !== 'cover' ? `${bp || '0 0'}/${bs}` : `${bp && bp !== '0% 0%' ? bp : '0 0'}/cover`;   // điểm lấy nét riêng của ảnh (bản v2)
      // luôn ghi đúng cỡ lớp ảnh như LadiPage (khung có viền thì viền che bớt ảnh, không co ảnh lại)
      const op = parseFloat(z.eop);   // độ mờ của cả phần tử → gắn vào lớp ảnh để hiệu ứng xuất hiện không ghi đè
      return [`left:${px(l)}`, `top:${px(tp)}`, `width:${px(w)}`, `height:${px(h)}`, `background:url(${u}) ${fit} no-repeat`].concat(op < 1 ? [`opacity:${op}`] : []);
    });
    return `<div class="el im${x}${hid}" id="${s}"${a}><i></i></div>`;
  }
  if (t === 'ladi-line') {
    R(`#${s} i`, n, (z) => { const [l, tp, w, h] = z.line.box; const b = z.line.b;
      return [`left:${px(l)}`, `top:${px(tp)}`, `width:${px(w)}`, `height:${px(h)}`].concat(['border-top', 'border-right', 'border-bottom', 'border-left'].filter((k) => !/^0px/.test(b[k])).map((k) => `${k}:${b[k]}`)); });
    return `<div class="el ln${x}${hid}" id="${s}"${a}><i></i></div>`;
  }
  if (t === 'ladi-shape') return `<div class="el shape${x}${hid}" id="${s}"${a}>${n.svg.replace(/<metadata>[\s\S]*?<\/metadata>/g, '').replace(/\s+/g, ' ')}</div>`;
  if (t === 'ladi-gallery' && n.gal) {
    const g = n.gal; const ev = n.ev || {};
    const imgs = g.items.map((u) => asset(u)).filter(Boolean);
    const slides = imgs.map((u, i) => `<div class="gal-s${i ? '' : ' on'}" style="background-image:url(${u})"></div>`).join('');
    const thumbs = imgs.map((u, i) => `<div class="gal-t${i ? '' : ' on'}" style="background-image:url(${u})"></div>`).join('');
    const geo = (z) => { const q = z.gal; const c = [];
      if (q.view) c.push([`#${s} .gal-v`, [`left:${px(q.view[0])}`, `top:${px(q.view[1])}`, `width:${px(q.view[2])}`, `height:${px(q.view[3])}`, `border-radius:${q.viewSt['border-radius'] || 0}`]]);
      if (q.ctrl) c.push([`#${s} .gal-c`, [`left:${px(q.ctrl[0])}`, `top:${px(q.ctrl[1])}`, `width:${px(q.ctrl[2])}`, `height:${px(q.ctrl[3])}`]]);
      if (q.thumb) c.push([`#${s} .gal-t`, [`width:${px(q.thumb[2])}`, `height:${px(q.thumb[3])}`, `margin-right:${px(Math.max(0, q.thumbGap - q.thumb[2]))}`].concat(boxcss(q.thumbSt, { skipbg: true }))]);
      return c; };
    geo(n).forEach((r) => rules.push(r));
    rules.push([`#${s} .gal-s`, [`background-size:${g.itemSize || 'cover'}`]]);
    const d = DMAP[n.id]; if (d && d.gal) geo(d).forEach(([sel, c]) => { const m = (rules.find((r) => r[0] === sel) || [, []])[1]; const dd = c.filter((x) => !m.includes(x)); if (dd.length) drules.push([sel, dd]); });
    return `<div class="el gal" id="${s}"${ev.ah ? ` data-auto="${(+ev.ae || 4) * 1000}"` : ''}${animAttr(n)}><div class="gal-v">${slides}<button class="gal-a gal-prev" type="button" aria-label="Ảnh trước">‹</button><button class="gal-a gal-next" type="button" aria-label="Ảnh sau">›</button></div><div class="gal-c"><div class="gal-tr">${thumbs}</div></div></div>`;
  }
  if (t === 'ladi-countdown') return countdown(n);
  if (t === 'ladi-form') return form(n);
  if (t === 'ladi-html-code') return htmlCode(n);
  if (/^IMAGE/.test(n.id)) {   // ảnh bị thư viện gốc dựng lại lúc chạy (vd timelineSlide) — giữ khung, runtime lo phần chạy
    const u = ((n.raw || '').match(/url\((?:&quot;|["'])?([^"')&]+)/) || [])[1];
    R(`#${s}`, n, (z) => ['overflow:hidden']);
    if (u) rules.push([`#${s} i`, ['inset:0', `background:url(${asset(u)}) center/cover no-repeat`]]);
    return `<div class="el im${x}${hid}" id="${s}"${a}><i></i></div>`;
  }
  TODO.push(`#${s} loại "${t}" chưa hỗ trợ (carousel/gallery/video/tabs…) — đã chép nguyên, AI viết lại.`);
  return `<div class="el todo-ai" id="${s}">${(n.raw || '').replace(/<script[\s\S]*?<\/script>/g, '')}</div>`;
}

function secHid(m, d) {   // ẩn sẵn ở cả 2 khổ → hid; chỉ điện thoại → hid-m; chỉ máy tính → hid-d
  const hm = m.disp === 'none', hd = d ? d.disp === 'none' : hm;
  return hm && hd ? ' hid' : hm ? ' hid-m' : hd ? ' hid-d' : '';
}
function section(sec, idx, DSEC) {
  const name = 'sec' + (idx + 1);
  const firstText = (function find(ns) { for (const k of ns) { if (k.html && k.html.replace(/<[^>]+>/g, '').trim()) return k.html.replace(/<[^>]+>/g, '').trim(); const r = k.kids && find(k.kids); if (r) return r; } return ''; })(sec.kids);
  const bgOf = (x) => {
    const b = x.bg || {}; const c = [`height:${px(x.h)}`];
    if (!TRANSPARENT.includes(b['background-color']) && !/, 0\)$/.test(b['background-color'] || '')) c.push('background-color:' + b['background-color']);
    return c;
  };
  const m = bgOf(sec); rules.unshift([`#${name}`, m]);
  const d = DSEC[sec.id]; if (d) { const dd = bgOf(d).filter((x) => !m.includes(x)); if (dd.length) drules.unshift([`#${name}`, dd]); }
  let body = '';
  const imgBg = (x, wide) => { const b = x.bg || {}; if (!b['background-image'] || b['background-image'] === 'none') return null; return boxcss({ 'background-image': b['background-image'], 'background-size': b['background-size'], 'background-position': b['background-position'], 'background-repeat': b['background-repeat'], 'background-attachment': b['background-attachment'], filter: b.filter, opacity: b.opacity }, {}, [wide, parseFloat(x.h)]); };
  const bi = imgBg(sec, MW);
  if (bi && bi.length) {
    rules.push([`#${name} > .sec-bg`, bi]); body += '<div class="sec-bg"></div>';
    if (d) { const db = (imgBg(d, 1440) || []).filter((x) => !bi.includes(x)); if (db.length) drules.push([`#${name} > .sec-bg`, db]); }
  }
  const ov = sec.ov && boxcss(sec.ov);
  if (ov && ov.length) { rules.push([`#${name} > .sec-ov`, ov]); body += '<div class="sec-ov"></div>'; }
  body += sec.kids.map(emit).join('');
  return `\n<!-- ===== ${name}: ${esc(firstText.slice(0, 50))} ===== -->\n<section class="sec${secHid(sec, DSEC[sec.id])}" id="${name}">${body}</section>\n`;
}

function popup(p) {
  const s = sid(p.id);
  const [w, h] = p.box;
  const bg = boxcss(p.bg);
  rules.push([`#${s} .pop-box`, [`width:${px(w)}`, `height:${px(h)}`]]);
  if (bg.length) rules.push([`#${s} .pop-bg`, bg]);   // nền popup là lớp riêng (bộ lọc mờ… không ảnh hưởng nội dung)
  const fullPop = /height(?:&#34;|\\")\s*,\s*(?:&#34;|\\")100%/.test(JSON.stringify((p.ev || {}).cs || []));
  const d = !fullPop && DMAP[p.id]; if (d && d.box) { const dc = [`width:${px(d.box[0])}`, `height:${px(d.box[1])}`].filter((x) => !rules[rules.length - 1][1].includes(x)); if (dc.length) drules.push([`#${s} .pop-box`, dc]); }
  const ev = p.ev || {}; const scr = JSON.stringify(ev.cs || []);
  const full = /height(?:&#34;|\\")\s*,\s*(?:&#34;|\\")100%/.test(scr);
  const drop = /^DROPBOX/.test(p.id);
  const openAt = ev.cd ? ` data-open="${(+ev.cc || 0) * 1000}"` : '';
  const ov = (String(ev.U || '').match(/background-color:\s*([^;]+)/) || [])[1];
  if (ov) rules.push([`#${s}`, [`background:${ov}`]]);
  if (full) rules.push([`#${s} .pop-box`, ['height:100vh']]);
  return `<div class="pop${full ? ' pop-full' : ''}${drop ? ' dropbox' : ''}" id="${s}"${openAt} hidden><div class="pop-box">${bg.length ? '<div class="pop-bg"></div>' : ''}${(p.kids || []).map(emit).join('')}${full || drop ? '' : '<button class="pop-x" type="button" aria-label="Đóng">×</button>'}</div></div>\n`;
}

// ---------------------------------------------------------------- chạy
(async () => {
  const srv = await serve(SRC);
  const base = `http://127.0.0.1:${srv.address().port}/index.html`;
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const measure = async (w, h) => {
    const pg = await browser.newPage();
    await pg.setRequestInterception(true);
    pg.on('request', (r) => (r.url().startsWith('http://127.0.0.1') || r.url().startsWith('data:') ? r.continue() : r.abort()).catch(() => {}));
    await pg.setViewport({ width: w, height: h });
    await pg.goto(base, { waitUntil: 'networkidle2', timeout: 90000 }).catch(() => {});
    await new Promise((r) => setTimeout(r, 1500));
    const data = await pg.evaluate(extractInPage);
    await pg.close();
    return data;
  };
  console.log('Đo khổ điện thoại...'); const M = await measure(420, 860);
  MW = M.mw || 420; DW = M.dw || 960;
  if (MW !== 420) NOTE.push(`Khung điện thoại của bản gốc rộng ${MW}px (khác 420).`);
  console.log(`Đo khổ máy tính (khung ${DW}px)...`); const D = await measure(Math.max(1280, DW + 80), 800);
  fs.writeFileSync(path.join(WORK, 'measure.json'), JSON.stringify({ M, D }));
  const walk = function* (ns) { for (const n of ns) { yield n; if (n.kids) yield* walk(n.kids); } };
  for (const x of D.sections) for (const n of walk(x.kids)) DMAP[n.id] = n;
  for (const p of D.popups) { DMAP[p.id] = p; for (const n of walk(p.kids || [])) DMAP[n.id] = n; }
  const DSEC = {}; D.sections.forEach((x) => { DSEC[x.id] = x; });
  Object.values(M.eventData || {}).forEach((e) => (e.cs || []).forEach((c) => { if (['collapse', 'hidden_show'].includes(c.a) && c.dw) TARGETS.add(c.dw); }));
  // gồm cả phần ẩn sẵn (hiện khi bấm nút); phần ẩn ở CẢ 2 khổ mà không thao tác/script nào nhắc tới → người xem không
  // bao giờ thấy (vd "Selfie cùng chúng mình" của wedding4) → bỏ
  const evTxt = JSON.stringify(M.eventData || {});
  const dead = M.sections.filter((x) => x.disp === 'none' && (!DSEC[x.id] || DSEC[x.id].disp === 'none') && !evTxt.includes(`"${x.id}"`) && !evTxt.includes(x.id + '\\"') && !new RegExp(x.id + '\\b').test(evTxt));
  if (dead.length) NOTE.push(`Bỏ ${dead.length} phần luôn ẩn, không nút nào mở: ${dead.map((x) => x.id).join(', ')}.`);
  const visible = M.sections.filter((x) => !dead.includes(x));
  if (!DATE) {   // tự tìm ngày cưới trong chữ của thiệp (ngày xuất hiện nhiều nhất) cho đếm ngược
    const all = []; const tw0 = (ns) => ns.forEach((k) => { if (k.html) all.push(k.html.replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ')); if (k.kids) tw0(k.kids); });
    visible.forEach((x, i) => { const n0 = all.length; tw0(x.kids); if (i < 2) for (let k = n0; k < all.length; k++) all[k] = (all[k] + ' | ').repeat(3); });   // ngày ở bìa nặng gấp 3
    const txt = all.join(' | ').replace(/\s*([.\/•·-])\s*/g, '$1').replace(/(\d)\s+(?=\d)/g, '$1');
    const cnt = {};
    for (const m of txt.matchAll(/\b(\d{1,2})[.\/•·-](\d{1,2})[.\/•·-](20\d{2})\b/g)) { const k = `${m[3]}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}`; cnt[k] = (cnt[k] || 0) + 1; }
    for (const m of txt.matchAll(/ngày\s*(\d{1,2})\s*tháng\s*(\d{1,2})\s*năm\s*(20\d{2})/gi)) { const k = `${m[3]}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}`; cnt[k] = (cnt[k] || 0) + 2; }
    const best = Object.entries(cnt).sort((a, b) => b[1] - a[1])[0];
    if (best && +best[0].slice(5, 7) <= 12) {
      const tm = txt.match(/\b(\d{1,2})\s*(?:giờ|g|h|:)\s*(\d{2})\b/i);
      DATE = `${best[0]}T${tm ? tm[1].padStart(2, '0') + ':' + tm[2] : '11:00'}:00+07:00`;
      NOTE.push(`Đếm ngược tự lấy ngày ${DATE} từ chữ trong thiệp — sai thì chạy lại với --date.`);
    }
  }
  visible.forEach((x, i) => { SECNAME[x.id] = 'sec' + (i + 1); });

  let body = visible.map((x, i) => section(x, i, DSEC)).join('');
  if (TPX) {
    const last = visible[visible.length - 1]; const bgc = (last.bg && last.bg['background-color']) || '';
    const rgb = (bgc.match(/\d+/g) || [255, 255, 255]).map(Number);
    const dark = !/, 0\)$/.test(bgc) && (rgb[0] * 0.299 + rgb[1] * 0.587 + rgb[2] * 0.114) < 140 || !!(last.bg && last.bg['background-image'] && last.bg['background-image'] !== 'none');
    const k = body.lastIndexOf('</section>');
    body = body.slice(0, k) + `<a class="closing-brand${dark ? ' on-dark' : ''}" href="https://templexa.vn" target="_blank" rel="noopener">Thiệp online · <b>templexa.vn</b></a>` + body.slice(k);
  }
  const pops = M.popups.map(popup).join('');

  // font
  let fontLink = '', fontFace = '';
  const google = [];
  const faceOf = (fam) => M.fontFaces.filter((x) => new RegExp('font-family:\\s*"?' + fam.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '"?\\s*;').test(x.css));
  for (const [fam, f] of FAMILIES) {
    const faces = faceOf(fam);
    let ok = false;
    for (const fc of faces) {
      let css = fc.css, good = true;
      css = css.replace(/url\("?([^")]+)"?\)/g, (m, u) => {
        let rel; try { rel = decodeURIComponent(new URL(u, fc.base).pathname.replace(/^\//, '')); } catch (e) { good = false; return m; }
        const src = path.join(SRC, rel);
        if (!fs.existsSync(src)) { good = false; return m; }
        fs.mkdirSync(path.join(OUT, 'fonts'), { recursive: true });
        const fn = path.basename(rel); fs.copyFileSync(src, path.join(OUT, 'fonts', fn));
        return `url(fonts/${fn})`;
      });
      if (good) { fontFace += css.replace(/\s+/g, ' ') + '\n'; ok = true; }
    }
    if (!ok) {   // thiệp này không kèm file → tìm @font-face cùng tên ở các thiệp khác cùng thư mục cha
      for (const dir of fs.readdirSync(path.dirname(SRC))) {
        const files = [path.join(path.dirname(SRC), dir, 'index.html')];
        try { fs.readdirSync(path.join(path.dirname(SRC), dir, 'assets/css')).forEach((f) => files.push(path.join(path.dirname(SRC), dir, 'assets/css', f))); } catch (e) {}
        for (const f of files) {
          if (!fs.existsSync(f) || !/\.(css|html)$/.test(f)) continue;
          const txt = fs.readFileSync(f, 'utf8');
          for (const m of txt.matchAll(/@font-face\s*\{[^}]*\}/g)) {
            if (!new RegExp('font-family:\\s*["\']?' + fam.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '["\']?\\s*;').test(m[0])) continue;
            let good = true;
            const css = m[0].replace(/url\(["']?([^"')]+)["']?\)/g, (mm, u) => {
              const src = path.resolve(path.dirname(f), u.split('?')[0]);
              if (!fs.existsSync(src)) { good = false; return mm; }
              fs.mkdirSync(path.join(OUT, 'fonts'), { recursive: true });
              fs.copyFileSync(src, path.join(OUT, 'fonts', path.basename(src)));
              return `url(fonts/${path.basename(src)})`;
            });
            if (good) { fontFace += css.replace(/\s+/g, ' ') + '\n'; ok = true; }
          }
          if (ok) break;
        }
        if (ok) { NOTE.push(`Font "${fam}" lấy từ thiệp ${dir} (thiệp này không kèm file).`); break; }
      }
    }
    if (ok) { if (!GOOGLE.includes(fam)) NOTE.push(`Font riêng "${fam}" chép kèm thiệp (fonts/) — kiểm bản quyền font trước khi bán.`); continue; }
    if (GOOGLE.includes(fam)) {
      const ws = [...f.weights].map(Number).filter((w) => w >= 100).sort();
      const list = [...new Set(ws.length ? ws : [400])];
      const axes = f.italic ? 'ital,wght@' + list.map((w) => '0,' + w).concat(list.map((w) => '1,' + w)).join(';') : 'wght@' + list.join(';');
      google.push('family=' + fam.replace(/ /g, '+') + ':' + axes);
    } else NOTE.push(`Font "${fam}" không có file kèm và không có trên Google Fonts — chọn font thay thế.`);
  }
  if (google.length) fontLink = `<link rel="preconnect" href="https://fonts.googleapis.com">\n<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n<link href="https://fonts.googleapis.com/css2?${google.join('&')}&display=swap" rel="stylesheet">`;
  // nhạc
  let audio = '';
  if (M.audio.length) {
    const rel = urlToRel(M.audio[0]); const src = rel && path.join(SRC, rel);
    if (src && fs.existsSync(src)) {
      const dst = path.join(OUT, 'nhac-nen.mp3');
      if (/\.mp3$/i.test(src)) fs.copyFileSync(src, dst);
      else { try { execFileSync('ffmpeg', ['-loglevel', 'error', '-y', '-i', src, '-codec:a', 'libmp3lame', '-b:a', '160k', dst]); } catch (e) { NOTE.push('Không đổi được nhạc sang mp3: ' + e.message); } }
      audio = '<audio id="bgm" loop preload="auto" src="nhac-nen.mp3"></audio>';
    }
  }
  if (!audio && opt('--music')) {
    const mf = path.resolve(opt('--music'));
    if (fs.existsSync(mf)) { audio = `<audio id="bgm" loop preload="auto" src="${path.relative(OUT, mf).split(path.sep).map(encodeURIComponent).join('/')}"></audio>`; NOTE.push('Bản gốc không có nhạc — đã gắn ' + path.basename(mf) + ' (phát ở lần chạm đầu tiên).'); }
  }
  if (!audio) NOTE.push('Bản gốc không có nhạc nền — thêm từ products/shared/music/ (cờ --music).');

  // cửa bìa (configOpenDoor của bộ đại lý): 2 cánh nền gradient + ảnh, phủ màn tới khi bấm mở (StartOpenDoor)
  let door = '';
  {
    const src = fs.readFileSync(path.join(SRC, 'index.html'), 'utf8');
    const m = /configOpenDoor\(\s*\{([\s\S]*?)\}\s*\)/.exec(src);
    if (m && /StartOpenDoor\(/.test(src)) {
      const g = (k) => { const r = new RegExp(k + '\\s*:\\s*["\'`]([^"\'`]*)["\'`]').exec(m[1]); return r ? r[1].trim() : ''; };
      const bg = g('background') || '#fff', il = g('imageLeft') && asset(g('imageLeft')), ir = g('imageRight') && asset(g('imageRight'));
      const panel = (side, img) => `<div class="door-p door-${side}" style="--img:${img ? `url(${img})` : 'none'}"></div>`;
      door = `<div id="door" style="--bg:${esc(bg)}">${panel('l', il)}${panel('r', ir)}</div>`;
      NOTE.push('Bìa có 2 cánh cửa (configOpenDoor) — đã dựng lại, mở khi bấm nút mở thiệp.');
    }
  }

  // hiệu ứng nền (effect-*) từ StyleWedding.css
  let fx = '';
  const sw = ['assets/css/StyleWedding.css'].map((f) => path.join(SRC, f)).find((f) => fs.existsSync(f));
  if (sw) {
    const css = fs.readFileSync(sw, 'utf8');
    const used = new Set(); body.replace(/fx-([\w-]+)/g, (m, k) => used.add(k));
    for (const k of used) {
      const r = css.match(new RegExp('\\.effect-' + k + '\\s*\\{([^}]*)\\}'));
      if (!r) { NOTE.push('Không thấy CSS cho hiệu ứng effect-' + k); continue; }
      let decl = r[1].replace(/url\("?([^")]+)"?\)/g, (m, u) => { const a = asset(path.join('assets/css', u).replace(/\\/g, '/')); return a ? `url(${a})` : m; });
      const an = (decl.match(/animation:\s*([\w-]+)/) || [])[1];
      const kf = an && css.match(new RegExp('@keyframes\\s+' + an + '\\s*\\{[\\s\\S]*?\\}\\s*\\}'));
      fx += `.fx-${k}{${decl.replace(/-webkit-[^;]+;/g, '').replace(/\s+/g, ' ').trim()};pointer-events:none}\n` + (kf ? kf[0].replace(/\s+/g, ' ') + '\n' : '');
    }
  }

  let vendor = (M.vendorCss || '').replace(/url\((["']?)([^"')]+)\1\)/g, (m, q, u) => {
    if (/^data:/.test(u)) return m; const a = asset(u.startsWith('http') ? u : 'assets/css/' + u); return a ? `url(${a})` : m;
  });
  await writeAssets();

  // keyframes cần dùng
  const usedAnim = new Set(); (body + pops).replace(/data-a="([\w-]+)/g, (m, k) => usedAnim.add(k));
  const kfs = [...usedAnim].map((k) => (M.keyframes[k] || '').replace(/-webkit-transform:[^;]*;\s*/g, '').replace(/\s+/g, ' ')).filter(Boolean).join('\n');

  const css = (list) => list.map(([sel, c]) => `${sel}{${c.join(';')}}`).join('\n');
  // nền trang của bản gốc (body hoặc .ladi-wraper) → body
  for (const pb of (M.pageBg || []).filter(Boolean).reverse()) {
    const c = boxcss(pb, {}, [MW, 900]).filter((x) => !/^(border|opacity)/.test(x));
    if (c.length) { rules.unshift(['body', c.concat(pb['background-attachment'] === 'fixed' ? ['background-attachment:fixed'] : [])]); break; }
  }
  const tpl = fs.readFileSync(path.join(__dirname, 'base.html'), 'utf8');
  const runtime = fs.readFileSync(path.join(__dirname, 'runtime.js'), 'utf8');
  const html = tpl
    .replace('{{TITLE}}', () => esc(opt('--title', M.title || 'Thiệp online')))
    .replace('{{FONTS}}', () => fontLink + (TPX ? `\n<meta property="og:image" content="https://templexa.vn/${path.relative(TEMPLEXA, path.join(OUT, 'og-cover.jpg')).split(path.sep).join('/')}">` : ''))
    .replace(/<meta name="description" content="[^"]*">/, () => `<meta name="description" content="${esc(opt('--desc', opt('--title', M.title || 'Thiệp online')))}">`)
    .replace('/*FONTFACE*/', () => fontFace)
    .replace('/*TYPO*/', () => [...typo.values()].map((t) => `.${t.name}{${t.css}}`).join('\n'))
    .replace('/*LAYOUT*/', () => css(rules))
    .replace('/*DESKTOP*/', () => css(drules))
    .replace('/*FX*/', () => fx + (vendor ? '\n/* ===== CSS riêng của thiệp gốc (widget, hiệu ứng) ===== */\n' + vendor : ''))
    .replace('/*KEYFRAMES*/', () => kfs)
    .replace('<!--BODY-->', () => body)
    .replace('<!--POPUPS-->', () => door + pops + (audio ? '\n' + audio : ''))
    .replace(/\{\{MW\}\}/g, () => MW).replace(/\{\{DW\}\}/g, () => DW).replace(/\{\{DW2\}\}/g, () => DW / 2)
    .replace('/*CARD*/', () => `window.CARD=${JSON.stringify({ key: KEY, mw: MW, date: DATE || null })};\nwindow.WISHES=${JSON.stringify(WISHES)};`)
    .replace('/*RUNTIME*/', () => runtime);
  fs.writeFileSync(path.join(OUT, 'index.html'), html);
  console.log(`✓ ${path.relative(process.cwd(), path.join(OUT, 'index.html'))} — ${Math.round(html.length / 1024)}KB, ${pending.size} ảnh, ${visible.length} phần, ${M.popups.length} popup`);

  // ------------------------------------------------------------ so sánh ảnh chụp gốc ↔ mới
  const cmp = [];
  if (!argv.includes('--no-compare')) {
    const srvOut = await serve(TEMPLEXA);
    const outUrl = `http://127.0.0.1:${srvOut.address().port}/` + path.relative(TEMPLEXA, path.join(OUT, 'index.html')).split(path.sep).map(encodeURIComponent).join('/');
    const shot = async (url, w, h, file, local) => {
      const pg = await browser.newPage();
      if (local) { await pg.setRequestInterception(true); pg.on('request', (r) => (/^(http:\/\/127\.0\.0\.1|data:)/.test(r.url()) || /fonts\.(googleapis|gstatic)/.test(r.url()) ? r.continue() : r.abort()).catch(() => {})); }
      await pg.setViewport({ width: w, height: h });
      await pg.goto(url, { waitUntil: 'networkidle2', timeout: 90000 }).catch(() => {});
      // trạng thái "đã mở thiệp" cho cả 2 bản: bỏ khoá cuộn, đóng popup/phong bì, hiện mọi phần (so được toàn trang)
      await pg.evaluate((deadIds) => {
        deadIds.forEach((id) => { const x = document.getElementById(id); if (x) x.remove(); });   // phần đã bỏ (luôn ẩn) — không ép hiện ở bản gốc
        const st = document.createElement('style');
        st.textContent = 'html,body{overflow:visible!important;height:auto!important;position:static!important}#SECTION_POPUP .ladi-container>.ladi-element{display:none!important}.pop,#door,#BGcurtain{display:none!important}';
        document.head.appendChild(st);
        [document.documentElement, document.body].forEach((e) => { e.classList.remove('no-scroll', 'BGlock-scroll'); ['position', 'overflow', 'height', 'top'].forEach((k) => e.style.setProperty(k, k === 'position' ? 'static' : k === 'top' ? 'auto' : k === 'height' ? 'auto' : 'visible', 'important')); });
        document.querySelectorAll('.ladi-wraper > .ladi-section').forEach((x) => { if (getComputedStyle(x).display === 'none') x.style.setProperty('display', 'block', 'important'); });
        document.querySelectorAll('.sec').forEach((x) => { if (getComputedStyle(x).display === 'none') x.style.setProperty('display', 'block', 'important'); });
      }, dead.map((x) => x.id));
      await new Promise((r) => setTimeout(r, 600));
      const H = await pg.evaluate(() => document.documentElement.scrollHeight);
      for (let y = 0; y < H; y += 300) { await pg.evaluate((v) => scrollTo(0, v), y); await new Promise((r) => setTimeout(r, 120)); }
      await new Promise((r) => setTimeout(r, 7000)); await pg.evaluate(() => scrollTo(0, 0)); await new Promise((r) => setTimeout(r, 400));
      await pg.screenshot({ path: file, fullPage: true }); await pg.close(); return H;
    };
    fs.mkdirSync(path.join(WORK, 'compare'), { recursive: true });
    for (const [tag, w, h] of [['mobile', 420, 860], ['desktop', 1280, 800]]) {
      const a = path.join(WORK, 'compare', `${tag}-goc.png`), b = path.join(WORK, 'compare', `${tag}-moi.png`);
      const ha = await shot(base, w, h, a, true), hb = await shot(outUrl, w, h, b, true);
      const ma = await sharp(a).metadata(), mb = await sharp(b).metadata();
      const W = Math.min(ma.width, mb.width), HH = Math.min(ma.height, mb.height);
      const band = 600, bad = [];
      for (let y = 0; y + 50 < HH; y += band) {
        const hh = Math.min(band, HH - y);
        const ra = await sharp(a).extract({ left: 0, top: y, width: W, height: hh }).resize(60, Math.max(1, Math.round(hh / 10))).raw().toBuffer();
        const rb = await sharp(b).extract({ left: 0, top: y, width: W, height: hh }).resize(60, Math.max(1, Math.round(hh / 10))).raw().toBuffer();
        let s = 0; for (let k = 0; k < ra.length; k++) s += Math.abs(ra[k] - rb[k]);
        const score = Math.round(s / ra.length * 10) / 10;
        if (score > 12) bad.push(`y ${y}–${y + hh}: lệch ${score}`);
      }
      cmp.push(`- **${tag}** cao gốc ${ha}px / mới ${hb}px${ha !== hb ? ' ⚠️ KHÁC' : ''}; vùng lệch nhiều (điểm >12, thường do hiệu ứng đang chạy lúc chụp): ${bad.length ? bad.join('; ') : 'không có'}`);
      // ảnh ghép cạnh nhau để người xem
      const pieces = Math.ceil(HH / 1500);
      for (let k = 0; k < pieces; k++) {
        const y = k * 1500, hh = Math.min(1500, HH - y);
        const L = await sharp(a).extract({ left: 0, top: y, width: W, height: hh }).toBuffer();
        const Rr = await sharp(b).extract({ left: 0, top: y, width: W, height: hh }).toBuffer();
        const both = await sharp({ create: { width: W * 2 + 10, height: hh, channels: 3, background: '#fff' } })
          .composite([{ input: L, left: 0, top: 0 }, { input: Rr, left: W + 10, top: 0 }]).png().toBuffer();
        await sharp(both).resize({ width: Math.min(1400, W * 2 + 10) }).jpeg({ quality: 70 }).toFile(path.join(WORK, 'compare', `${tag}-${String(k + 1).padStart(2, '0')}.jpg`));
      }
    }
    srvOut.close();
    if (TPX) {
      const dm = path.join(WORK, 'compare', 'desktop-moi.png'); const meta = await sharp(dm).metadata();
      // chọn vùng 1200×630 "nhiều hình" nhất trong 3000px đầu (bỏ qua nền trống sau phong bì)
      let bestY = 0, bestS = -1;
      for (let y = 0; y + 630 <= Math.min(meta.height, 6000); y += 150) {
        const st = await sharp(dm).extract({ left: Math.max(0, Math.round((meta.width - 1200) / 2)), top: y, width: Math.min(1200, meta.width), height: 630 }).stats();
        const sc = st.channels.slice(0, 3).reduce((a, c) => a + c.stdev, 0);
        if (sc > bestS * 1.15) { bestS = sc; bestY = y; }
      }
      await sharp(dm).extract({ left: Math.max(0, Math.round((meta.width - 1200) / 2)), top: bestY, width: Math.min(1200, meta.width), height: Math.min(630, meta.height) })
        .resize(1200, 630, { fit: 'cover' }).jpeg({ quality: 86 }).toFile(path.join(OUT, 'og-cover.jpg'));
      NOTE.push('og-cover.jpg cắt từ đầu trang khổ máy tính — mở xem có đủ mặt + tên không.');
    }
    for (const t of ['mobile', 'desktop']) for (const k of ['goc', 'moi']) fs.rmSync(path.join(WORK, 'compare', `${t}-${k}.png`), { force: true });
  }
  await browser.close(); srv.close();

  // ------------------------------------------------------------ báo cáo
  const texts = [];
  const tw = (ns) => ns.forEach((n) => { if (n.html) { const t = n.html.replace(/<br\s*\/?>/g, ' / ').replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').trim(); if (t) texts.push(`| #${sid(n.id)} | ${t.replace(/\|/g, '/').slice(0, 120)} |`); } if (n.kids) tw(n.kids); });
  visible.forEach((x) => tw(x.kids)); M.popups.forEach((p) => tw(p.kids || []));
  const rep = `# Báo cáo chuyển thiệp LadiPage

- Gốc: \`${SRC}\`
- Ra: \`${OUT}/index.html\` (key lưu máy khách: \`${KEY}\`)
- ${visible.length} phần, ${M.popups.length} popup, ${pending.size} ảnh WebP, ${WISHES.length} lời chúc mẫu, ${SIGS.length ? 'có' : 'không có'} lưu bút ký tên

## So sánh ảnh chụp (gốc trái — mới phải: \`compare/*.jpg\`)
${cmp.join('\n') || '- (bỏ qua)'}

## CẦN AI LÀM (${TODO.length})
${TODO.map((t) => '- [ ] ' + t).join('\n') || '- Không có — script đã chuyển hết.'}

## Ghi chú
${NOTE.map((t) => '- ' + t).join('\n') || '- (không)'}

## Việc người duyệt làm sau khi chuyển
- [ ] Ảnh có logo/QR/tên bên khác? (QR quà mừng thường là của bên bán gốc — thay)
- [ ] Đổi nội dung mẫu (tên, ngày, địa chỉ) nếu cần — bảng chữ bên dưới
- [ ] Nút xác nhận: theo luật Templexa 1 nút "Gửi lời chúc & xác nhận"; thêm dòng \`templexa.vn\` cuối thiệp
- [ ] \`<title>\`, \`<meta description>\`, og:image; thêm vào data.js (catalog.js) + chụp ảnh catalog

## Bảng chữ trong thiệp
| Phần tử | Chữ |
|---|---|
${texts.join('\n')}
`;
  fs.writeFileSync(path.join(WORK, 'REPORT.md'), rep);
  console.log(`✓ Báo cáo: ${path.join(WORK, 'REPORT.md')} — cần AI: ${TODO.length} mục`);
})().catch((e) => { console.error('LOI:', e.stack || e.message); process.exit(1); });

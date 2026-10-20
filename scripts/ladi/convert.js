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
const VALUED = ['--out', '--key', '--date', '--title', '--work'];
const SRC = path.resolve(argv.find((a, k) => !a.startsWith('--') && !VALUED.includes(argv[k - 1])) || '.');
const OUT = opt('--out') && path.resolve(opt('--out'));
if (!fs.existsSync(path.join(SRC, 'index.html')) || !OUT) {
  console.error('Dùng: node scripts/ladi/convert.js <thư mục LadiPage> --out <thư mục thiệp mới> [--key ..] [--date ..] [--title ..]');
  process.exit(1);
}
const KEY = opt('--key', path.basename(OUT).replace(/[^a-z0-9]/gi, '').slice(0, 12));
const WORK = path.resolve(opt('--work', path.join(SRC, '_convert')));
const DATE = opt('--date', '');
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
function asset(u, sub, box) {
  let rel = urlToRel(u);
  if (!rel) return null;
  rel = variant(rel, box);
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
  const w = st['border-top-width'];
  if (w && w !== '0px' && st['border-top-style'] && st['border-top-style'] !== 'none') css.push(`border:${w} ${st['border-top-style']} ${st['border-top-color']}`);
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
  const m = fn(n); rules.push([sel, m]);
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
  const [l, r, t, b] = n.fix;
  return ['position:fixed', `left:${l === 'auto' ? 'auto' : px(l)}`, `right:${r === 'auto' ? 'auto' : px(r)}`, `top:${t === 'auto' ? 'auto' : px(t)}`, `bottom:${b === 'auto' ? 'auto' : px(b)}`, `width:${px(n.pos[2])}`, `height:${px(n.pos[3])}`, 'z-index:50'];
}

let SECNAME = {};
const TARGETS = new Set();   // phần tử là đích của nút ẩn/hiện
function actions(n) {
  const cs = n.ev && n.ev.cs; if (!cs) return '';
  const out = [];
  for (const c of cs) {
    if (c.a === 'popup' && c.dw) out.push({ t: 'popup', id: sid(c.dw) });
    else if (c.a === 'collapse' && c.dw) out.push({ t: 'collapse', id: sid(c.dw) });
    else if (c.a === 'hidden_show' && c.dw) out.push({ t: 'toggle', id: sid(c.dw) });
    else if (c.a === 'section' && c.dw) out.push({ t: 'section', id: SECNAME[c.dw] || sid(c.dw) });
    else if (c.a === 'custom_script') {
      const s = c.event_custom_script || '';
      if (/clearCanvas/.test(s)) out.push({ t: 'fn', fn: 'sig.clear' });
      else if (/previewSignature/.test(s)) out.push({ t: 'fn', fn: 'sig.preview' });
      else if (/saveSignature/.test(s)) out.push({ t: 'fn', fn: 'sig.save' });
      else TODO.push(`#${sid(n.id)} có script riêng khi bấm — viết lại: \`${s.replace(/\s+/g, ' ').slice(0, 160)}\``);
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
  return out.length ? ' ' + out.join(' ') : '';
}

let WISHES = [];
const SIGS = [];
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
    return `<div class="el wishes" id="${s}"><div id="wishList"></div></div>`;
  }
  if (/<iframe[^>]*google\.com\/maps/.test(raw)) {
    const src = (raw.match(/<iframe[^>]*src="([^"]+)"/) || [])[1];
    return `<div class="el map" id="${s}"><iframe src="${src}" title="Bản đồ" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe></div>`;
  }
  if (/audio_music|<audio/.test(raw)) return '';
  TODO.push(`#${s} khối HTML riêng (${raw.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 80) || 'không chữ'}) — đã chép nguyên vào thiệp, cần AI kiểm/viết lại (bỏ jQuery, đổi ảnh).`);
  return `<div class="el todo-ai" id="${s}">${raw.replace(/<script[\s\S]*?<\/script>/g, '')}</div>`;
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
      html += `<button type="submit" class="f-btn ${tclass(it.st)}" id="${fs_}"><span>${clean(it.button)}</span></button>`;
    } else {
      rules.push([`#${fs_}`, c.concat(boxcss(it.bg))]);
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
    return `<div class="el${x}${hid}" id="${s}"${a}></div>`;
  }
  if (t === 'ladi-image') {
    R(`#${s}`, n, (z) => boxcss(z.st, { skipbg: true }).concat(['overflow:hidden']));
    const url = asset(n.img[0], null, [parseFloat(n.img[3]), parseFloat(n.img[4])]);
    R(`#${s} i`, n, (z) => {
      const [, l, tp, w, h] = z.img; const u = asset(z.img[0], null, [parseFloat(w), parseFloat(h)]) || url;
      // luôn ghi đúng cỡ lớp ảnh như LadiPage (khung có viền thì viền che bớt ảnh, không co ảnh lại)
      const op = parseFloat(z.eop);   // độ mờ của cả phần tử → gắn vào lớp ảnh để hiệu ứng xuất hiện không ghi đè
      return [`left:${px(l)}`, `top:${px(tp)}`, `width:${px(w)}`, `height:${px(h)}`, `background:url(${u}) 0 0/cover no-repeat`].concat(op < 1 ? [`opacity:${op}`] : []);
    });
    return `<div class="el im${x}${hid}" id="${s}"${a}><i></i></div>`;
  }
  if (t === 'ladi-line') {
    R(`#${s} i`, n, (z) => { const [l, tp, w, h] = z.line.box; const b = z.line.b;
      return [`left:${px(l)}`, `top:${px(tp)}`, `width:${px(w)}`, `height:${px(h)}`].concat(['border-top', 'border-right', 'border-bottom', 'border-left'].filter((k) => !/^0px/.test(b[k])).map((k) => `${k}:${b[k]}`)); });
    return `<div class="el ln${x}${hid}" id="${s}"${a}><i></i></div>`;
  }
  if (t === 'ladi-shape') return `<div class="el shape${x}${hid}" id="${s}"${a}>${n.svg.replace(/<metadata>[\s\S]*?<\/metadata>/g, '').replace(/\s+/g, ' ')}</div>`;
  if (t === 'ladi-countdown') return countdown(n);
  if (t === 'ladi-form') return form(n);
  if (t === 'ladi-html-code') return htmlCode(n);
  TODO.push(`#${s} loại "${t}" chưa hỗ trợ (carousel/gallery/video/tabs…) — đã chép nguyên, AI viết lại.`);
  return `<div class="el todo-ai" id="${s}">${(n.raw || '').replace(/<script[\s\S]*?<\/script>/g, '')}</div>`;
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
  return `\n<!-- ===== ${name}: ${esc(firstText.slice(0, 50))} ===== -->\n<section class="sec" id="${name}">${body}</section>\n`;
}

function popup(p) {
  const s = sid(p.id);
  const [w, h] = p.box;
  const bg = boxcss(p.bg);
  rules.push([`#${s} .pop-box`, [`width:${px(w)}`, `height:${px(h)}`].concat(bg)]);
  const d = DMAP[p.id]; if (d && d.box) { const dc = [`width:${px(d.box[0])}`, `height:${px(d.box[1])}`].filter((x) => !rules[rules.length - 1][1].includes(x)); if (dc.length) drules.push([`#${s} .pop-box`, dc]); }
  return `<div class="pop" id="${s}" hidden><div class="pop-box">${(p.kids || []).map(emit).join('')}<button class="pop-x" type="button" aria-label="Đóng">×</button></div></div>\n`;
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
  const visible = M.sections.filter((x) => x.disp !== 'none');
  visible.forEach((x, i) => { SECNAME[x.id] = 'sec' + (i + 1); });

  let body = visible.map((x, i) => section(x, i, DSEC)).join('');
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
  if (!audio) NOTE.push('Bản gốc không có nhạc nền — thêm từ products/shared/music/.');

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

  await writeAssets();

  // keyframes cần dùng
  const usedAnim = new Set(); (body + pops).replace(/data-a="([\w-]+)/g, (m, k) => usedAnim.add(k));
  const kfs = [...usedAnim].map((k) => (M.keyframes[k] || '').replace(/-webkit-transform:[^;]*;\s*/g, '').replace(/\s+/g, ' ')).filter(Boolean).join('\n');

  const css = (list) => list.map(([sel, c]) => `${sel}{${c.join(';')}}`).join('\n');
  const tpl = fs.readFileSync(path.join(__dirname, 'base.html'), 'utf8');
  const runtime = fs.readFileSync(path.join(__dirname, 'runtime.js'), 'utf8');
  const html = tpl
    .replace('{{TITLE}}', () => esc(opt('--title', M.title || 'Thiệp online')))
    .replace('{{FONTS}}', () => fontLink)
    .replace('/*FONTFACE*/', () => fontFace)
    .replace('/*TYPO*/', () => [...typo.values()].map((t) => `.${t.name}{${t.css}}`).join('\n'))
    .replace('/*LAYOUT*/', () => css(rules))
    .replace('/*DESKTOP*/', () => css(drules))
    .replace('/*FX*/', () => fx)
    .replace('/*KEYFRAMES*/', () => kfs)
    .replace('<!--BODY-->', () => body)
    .replace('<!--POPUPS-->', () => pops + (audio ? '\n' + audio : ''))
    .replace(/\{\{MW\}\}/g, () => MW).replace(/\{\{DW\}\}/g, () => DW).replace(/\{\{DW2\}\}/g, () => DW / 2)
    .replace('/*CARD*/', () => `window.CARD=${JSON.stringify({ key: KEY, mw: MW })};\nwindow.WISHES=${JSON.stringify(WISHES)};`)
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

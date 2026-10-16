#!/usr/bin/env node
/**
 * shortlink.js — Tạo đường dẫn gửi khách: templexa.vn/<wedding|event|birthday>/<slug>/
 *
 *   node scripts/shortlink.js <job> --title "Tiêu đề khi share" --desc "Mô tả khi share"
 *                            [--card <key>] [--type wedding|event|birthday] [--slug <slug>] [--update]
 *
 * Làm 2 việc:
 *   1. Thêm entry vào <type>/config.js (slug → thiệp trong products/ + OG meta)
 *   2. Tạo <type>/<slug>/index.html (iframe loader) bằng cách copy loader có sẵn cùng loại rồi thay
 *      title / description / og:* / twitter:* — Zalo/Facebook không chạy JS nên OG phải ghi thẳng vào file.
 * Trang luôn có noindex; _headers đã chặn index /wedding/* /event/* /birthday/*.
 * --update: slug đã có → ghi đè entry + meta (dùng khi đổi tiêu đề/ảnh share).
 * Ảnh share dùng og-cover.jpg của thiệp → chạy og-cover.js trước hoặc sau đều được.
 */
const fs = require('fs');
const path = require('path');
const C = require('./lib/core');

const { pos, opt } = C.parseArgs();
const j = C.loadJob(pos[0]);
const card = C.getCard(j, opt.card);
const type = opt.type || card.shortlink?.type || j.kind;
const VAR = { wedding: 'WEDDING', event: 'EVENT', birthday: 'BIRTHDAY' }[type];
if (!VAR) C.die('--type phải là wedding | event | birthday');
const slug = C.slugify(opt.slug || card.shortlink?.slug || (j.slug + (card.key !== 'main' ? '-' + card.key : '')));
const title = opt.title || card.share?.title, desc = opt.desc || card.share?.description;
if (!title || !desc) C.die('Thiếu --title và --desc (chữ hiện khi gửi link qua Zalo/Facebook).');

const typeDir = path.join(C.TPX, type);
const cfgPath = path.join(typeDir, 'config.js');
let cfg = fs.readFileSync(cfgPath, 'utf8');
const exists = new RegExp(`\\n\\s*'${slug}'\\s*:`).test(cfg);
if (exists && !opt.update) C.die(`Slug "${slug}" đã có trong ${type}/config.js — chọn --slug khác hoặc thêm --update.`);

const q = s => s.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
const src = '../../' + card.folder.replace(/^\.\//, '') + card.entry;
const img = '../../' + card.folder.replace(/^\.\//, '') + 'og-cover.jpg';
const block = `    // ${j.customer}${card.label ? ' · ' + card.label : ''} — job ${j.id}\n    '${slug}': {\n        src: '${src}',\n        title: '${q(title)}',\n        description: '${q(desc)}',\n        image: '${img}',\n    },\n`;
if (exists) {
    cfg = cfg.replace(new RegExp(`(\\n\\s*// [^\\n]*\\n)?\\s*'${slug}'\\s*:\\s*\\{[\\s\\S]*?\\n\\s*\\},?\\n`), '\n' + block);
} else {
    const end = cfg.lastIndexOf('};');
    if (end < 0) C.die('Không đọc được cấu trúc ' + type + '/config.js');
    cfg = cfg.slice(0, end).replace(/\s*$/, '\n\n') + block + cfg.slice(end);
}
fs.writeFileSync(cfgPath, cfg);

// Loader: copy từ 1 loader cùng loại đang chạy tốt (mới nhất)
const dir = path.join(typeDir, slug);
const sample = fs.readdirSync(typeDir, { withFileTypes: true })
    .filter(d => d.isDirectory() && d.name !== slug && fs.existsSync(path.join(typeDir, d.name, 'index.html')))
    .map(d => path.join(typeDir, d.name, 'index.html'))
    .sort((a, b) => fs.statSync(b).mtimeMs - fs.statSync(a).mtimeMs)[0];
if (!sample) C.die('Không có loader mẫu trong ' + type + '/ để copy');
let html = fs.readFileSync(exists && fs.existsSync(path.join(dir, 'index.html')) ? path.join(dir, 'index.html') : sample, 'utf8');
const esc = s => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
const url = `https://templexa.vn/${type}/${slug}/`;
const imgAbs = `https://templexa.vn/${card.folder.replace(/^\.\//, '')}og-cover.jpg?v=${Date.now().toString(36)}`;
const setMeta = (attr, k, v) => {
    const re = new RegExp(`(<meta\\s+${attr}="${k}"\\s+content=")[^"]*(")`);
    html = re.test(html) ? html.replace(re, `$1${esc(v)}$2`) : html.replace('</head>', `    <meta ${attr}="${k}" content="${esc(v)}">\n</head>`);
};
html = html.replace(/<title>[\s\S]*?<\/title>/, `<title>${esc(title)}</title>`);
setMeta('name', 'description', desc);
setMeta('property', 'og:title', title); setMeta('property', 'og:description', desc);
setMeta('property', 'og:image', imgAbs); setMeta('property', 'og:url', url);
setMeta('name', 'twitter:title', title); setMeta('name', 'twitter:description', desc); setMeta('name', 'twitter:image', imgAbs);
if (!/name="robots"/.test(html)) html = html.replace('<head>', '<head>\n<meta name="robots" content="noindex, nofollow">');
html = html.replace(/(\.\.\/config\.js)(\?v=[\w-]+)?/, `$1?v=${C.today().replace(/-/g, '')}`);
fs.mkdirSync(dir, { recursive: true });
fs.writeFileSync(path.join(dir, 'index.html'), html);

card.share = { title, description: desc };
card.shortlink = { type, slug, url };
C.stepDone(j, 'shortlink:' + card.key, url);
C.ok(`${exists ? 'Cập nhật' : 'Tạo'} link khách: ${url}`);
if (!fs.existsSync(C.abs(card.folder + 'og-cover.jpg'))) console.log('! Chưa có og-cover.jpg — chạy: node scripts/og-cover.js ' + j.id + (j.cards.length > 1 ? ' --card ' + card.key : ''));
if (j.guests) console.log('  Khách có danh sách: link riêng từng người = ' + url + '?id=<mã khách>');

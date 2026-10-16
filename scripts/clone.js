#!/usr/bin/env node
/**
 * clone.js — Copy thiệp mẫu (theo mã #id trong data.js) thành thư mục thiệp riêng cho khách.
 *
 *   node scripts/clone.js <job>                                  # dùng job.from, key "main"
 *   node scripts/clone.js <job> --from 241 --key nha-trai --label "Nhà trai" --suffix nha-trai
 *
 * Kết quả: products/Invitation/<Wedding|Other>/khach_<slug>[-suffix]/  (cùng cấp với mẫu gốc →
 * đường dẫn ../../../shared/… trong HTML vẫn đúng). Thêm 1 phần tử vào job.cards.
 *
 * KHÔNG copy: shots/, qr/, og-cover.jpg, prompt.txt, guests.*, data.json — những thứ thuộc về mẫu gốc.
 * KHÔNG BAO GIỜ sửa thư mục mẫu gốc.
 */
const fs = require('fs');
const path = require('path');
const C = require('./lib/core');

const { pos, opt } = C.parseArgs();
const j = C.loadJob(pos[0]);
const fromId = Number(opt.from || j.from);
if (!fromId) C.die('Chưa biết mẫu gốc — thêm --from <id> hoặc job.js set ' + j.id + ' from=<id>');
const P = C.findProduct(fromId);
if (!P) C.die('Không có sản phẩm #' + fromId + ' trong data.js');
if (P.type !== 'invitation') C.die('#' + fromId + ' không phải thiệp (type=' + P.type + ')');

const key = opt.key || (j.cards?.length ? null : 'main');
if (!key) C.die('Job đã có thiệp — thiệp thứ 2 trở đi phải đặt --key (vd nha-gai, ban-b).');
if ((j.cards || []).some(c => c.key === key)) C.die('Job đã có thiệp key "' + key + '"');

const srcEntry = C.abs(P.demoUrl);
const srcDir = path.dirname(srcEntry);
if (!fs.existsSync(srcEntry)) C.die('Không thấy file mẫu ' + P.demoUrl);
// Giữ cùng cấp thư mục với mẫu gốc (Wedding/xxx hoặc Other/xxx; mẫu có biến thể vX/ thì lên 1 cấp)
let parent = path.dirname(srcDir);
while (!/Invitation[\\/](Wedding|Other)$/.test(parent) && parent.length > C.TPX.length) parent = path.dirname(parent);
const name = 'khach_' + j.slug + (opt.suffix ? '-' + C.slugify(opt.suffix) : (key !== 'main' ? '-' + C.slugify(key) : ''));
const dest = path.join(parent, name);
if (fs.existsSync(dest)) C.die('Thư mục đã tồn tại: ' + C.rel(dest));
if (path.relative(parent, srcDir).includes(path.sep)) console.log('! Mẫu nằm sâu hơn 1 cấp (' + C.rel(srcDir) + ') — kiểm lại đường dẫn ../ trong HTML sau khi clone.');

const SKIP = new Set(['shots', 'qr', 'og-cover.jpg', 'prompt.txt', 'guests.js', 'guests.json', 'data.json', 'wedding-data.json', '.DS_Store']);
function copy(s, d) {
    fs.mkdirSync(d, { recursive: true });
    for (const e of fs.readdirSync(s, { withFileTypes: true })) {
        if (SKIP.has(e.name) || /^verify-/.test(e.name)) continue;
        const a = path.join(s, e.name), b = path.join(d, e.name);
        if (e.isDirectory()) copy(a, b); else fs.copyFileSync(a, b);
    }
}
copy(srcDir, dest);

// Ảnh khách để riêng 1 thư mục, không lẫn ảnh mẫu
const photoDir = ['photos', 'customer', 'anh-khach'].find(d => !fs.existsSync(path.join(dest, d)));
fs.mkdirSync(path.join(dest, photoDir));

// Hồ sơ thiệp nằm cạnh code (tra cứu lại sau này, giống data.json của khach_37)
fs.writeFileSync(path.join(dest, 'data.json'), JSON.stringify({
    job: j.id, customer: j.customer, occasion: j.occasion, sides: j.sides, templateId: fromId,
    sheetId: j.sheetId || null, info: j.info, createdAt: C.today(),
}, null, 2) + '\n');

const card = { key, label: opt.label || (key === 'main' ? '' : key), from: fromId, folder: C.rel(dest) + '/', entry: path.basename(srcEntry), photoDir, share: {}, shortlink: {} };
j.cards = (j.cards || []).concat(card);
if (j.status === 'cho-thong-tin') j.status = 'dang-lam';
C.stepDone(j, 'clone:' + key, `#${fromId} ${P.name} → ${card.folder}`);

// Gợi ý những chỗ phải thay
const html = fs.readFileSync(path.join(dest, card.entry), 'utf8');
const imgs = [...new Set((html.match(/(?:src=|url\()["']?((?!https?:|data:|\.\.\/)[^"')\s]+\.(?:webp|jpe?g|png))/g) || []).map(m => m.replace(/^(src=|url\()["']?/, '')))];
C.ok(`Clone #${fromId} → ${card.folder}${card.entry}`);
console.log(`  Ảnh khách: chạy  node scripts/to-webp.js ${j.id}${j.cards.length > 1 ? ' --card ' + key : ''}  → ${card.folder}${photoDir}/`);
console.log(`  Ảnh mẫu đang dùng trong ${card.entry} (${imgs.length}) — thay bằng ${photoDir}/anh_N.webp:\n    ` + imgs.join('\n    '));

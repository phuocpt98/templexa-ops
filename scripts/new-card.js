#!/usr/bin/env node
/**
 * new-card.js — Tạo thư mục trống cho thiệp THIẾT KẾ MỚI (không theo mẫu có sẵn).
 *
 *   node scripts/new-card.js <job> [--key main] [--label "..."] [--suffix nha-gai]
 *
 * Tạo products/Invitation/<Wedding|Other>/khach_<slug>/ với photos/ + data.json, thêm vào job.cards.
 * Sau đó AI viết index.html theo skills/thiep (phần "Thiết kế mới").
 */
const fs = require('fs');
const path = require('path');
const C = require('./lib/core');

const { pos, opt } = C.parseArgs();
const j = C.loadJob(pos[0]);
const key = opt.key || (j.cards?.length ? null : 'main');
if (!key) C.die('Job đã có thiệp — thiệp thứ 2 trở đi phải đặt --key.');
if ((j.cards || []).some(c => c.key === key)) C.die('Job đã có thiệp key "' + key + '"');

const sub = ['wedding', 'dam-ngo', 'an-hoi'].includes(j.occasion) ? 'Wedding' : 'Other';
const name = 'khach_' + j.slug + (opt.suffix ? '-' + C.slugify(opt.suffix) : (key !== 'main' ? '-' + C.slugify(key) : ''));
const dest = path.join(C.TPX, 'products', 'Invitation', sub, name);
if (fs.existsSync(dest)) C.die('Thư mục đã tồn tại: ' + C.rel(dest));
fs.mkdirSync(path.join(dest, 'photos'), { recursive: true });
fs.writeFileSync(path.join(dest, 'data.json'), JSON.stringify({
    job: j.id, customer: j.customer, occasion: j.occasion, sides: j.sides, templateId: null,
    sheetId: j.sheetId || null, info: j.info, createdAt: C.today(),
}, null, 2) + '\n');

j.cards = (j.cards || []).concat({ key, label: opt.label || '', from: null, folder: C.rel(dest) + '/', entry: 'index.html', photoDir: 'photos', share: {}, shortlink: {} });
if (j.status === 'cho-thong-tin') j.status = 'dang-lam';
C.stepDone(j, 'new-card:' + key, C.rel(dest));
C.ok('Tạo ' + C.rel(dest) + '/ — viết index.html theo skills/thiep/SKILL.md (Thiết kế mới)');

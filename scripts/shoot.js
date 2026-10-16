#!/usr/bin/env node
/**
 * shoot.js — Chụp 3 ảnh dọc (cover = phong bì, open = màn đầu sau khi mở, sec-1 = màn kế tiếp)
 * cho thiệp trong job, dùng scripts/shoot-mobile.js của Templexa.
 *
 *   node scripts/shoot.js <job> [--card <key>]
 *
 * Ảnh ra: <thư mục thiệp>/shots/{cover,open,sec-1}.webp — dùng cho catalog (catalog.js add).
 * BẮT BUỘC mở xem open.webp: phải là màn chính sạch, không cắt chữ, không popup che.
 * Phong bì không tự mở được → thiệp cần nút mở có id="openBtn" hoặc class .envelope.
 */
const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const C = require('./lib/core');

const { pos, opt } = C.parseArgs();
const j = C.loadJob(pos[0]);
const card = C.getCard(j, opt.card);
const page = card.folder + card.entry;
const r = spawnSync('node', ['scripts/shoot-mobile.js', '--url', page], { cwd: C.TPX, stdio: 'inherit' });
if (r.status !== 0) C.die('Chụp lỗi (mã ' + r.status + ')');
const shots = path.join(C.abs(card.folder), 'shots');
const files = fs.existsSync(shots) ? fs.readdirSync(shots).filter(f => f.endsWith('.webp')) : [];
if (!files.length) C.die('Không thấy ảnh trong ' + C.rel(shots));
C.stepDone(j, 'shoot:' + card.key, files.join(', '));
C.ok('Ảnh: ' + files.map(f => C.rel(path.join(shots, f))).join('  ') + '\n  → MỞ XEM open.webp trước khi đưa lên catalog');

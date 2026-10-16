#!/usr/bin/env node
/**
 * og-cover.js — Ảnh hiện khi gửi link qua Zalo/Facebook/Messenger (og-cover.jpg 1200×630).
 *
 *   node scripts/og-cover.js <job> [--card <key>]                       # tự chọn cách bên dưới
 *   node scripts/og-cover.js <job> --photo photos/anh_3.webp [--pos attention|top|center]
 *   node scripts/og-cover.js <job> --html                               # chụp og-cover.html trong thư mục thiệp
 *
 * Cách chọn:
 *   - Thư mục thiệp có og-cover.html (bố cục chữ + ảnh, đẹp nhất) → chụp trang đó bằng build-og-cover.js.
 *   - Không có → cắt 1 ảnh (--photo, mặc định ảnh bìa job.photos.hero hoặc anh_1) về 1200×630,
 *     tự tìm vùng có mặt người (--pos attention).
 * Luôn xuất JPG (Zalo chưa đọc WebP ở og:image). Xem lại ảnh trước khi gửi khách.
 * Muốn thiệp mẫu đã có og-cover.html: copy từ thư mục mẫu gốc, sửa chữ/ảnh, rồi chạy --html.
 */
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const C = require('./lib/core');

const { pos, opt } = C.parseArgs();
const j = C.loadJob(pos[0]);
const card = C.getCard(j, opt.card);
const dir = C.abs(card.folder);
const out = path.join(dir, 'og-cover.jpg');
const htmlPage = path.join(dir, 'og-cover.html');

(async () => {
    if (opt.html || (!opt.photo && fs.existsSync(htmlPage))) {
        if (!fs.existsSync(htmlPage)) C.die('Không có og-cover.html trong ' + card.folder);
        execFileSync('node', ['scripts/build-og-cover.js', '--page', path.relative(C.TPX, htmlPage), '--out', path.relative(C.TPX, out)], { cwd: C.TPX, stdio: 'inherit' });
    } else {
        const sharp = C.reqT('sharp');
        let photo = opt.photo || (j.photos && j.photos.hero) || path.join(card.photoDir || 'photos', 'anh_1.webp');
        const cands = [path.join(dir, photo), path.join(C.jobDir(j.id), photo), path.resolve(photo)];
        photo = cands.find(f => fs.existsSync(f));
        if (!photo) C.die('Không thấy ảnh ' + (opt.photo || 'bìa') + ' — chỉ định --photo <đường dẫn trong thư mục thiệp>');
        const position = { attention: sharp.strategy.attention, top: 'top', center: 'centre' }[opt.pos || 'attention'];
        await sharp(photo).rotate().resize(1200, 630, { fit: 'cover', position }).jpeg({ quality: 85, mozjpeg: true }).toFile(out);
    }
    C.stepDone(j, 'og-cover:' + card.key, C.rel(out));
    C.ok('og-cover.jpg → ' + C.rel(out) + ' — MỞ XEM LẠI ảnh này trước khi gửi link');
    if (card.shortlink?.url) console.log('  Link đã share trước đó có thể bị Zalo/Facebook lưu ảnh cũ — chạy lại shortlink.js --update để đổi ?v=.');
})().catch(e => C.die(e.message));

#!/usr/bin/env node
/**
 * to-webp.js — Chuyển ảnh khách gửi → WebP đúng cỡ, đặt tên anh_1.webp, anh_2.webp…
 *
 *   node scripts/to-webp.js <job> [--card <key>]       # input/ (cả thư mục con) → <thư mục thiệp>/<photoDir>/
 *   node scripts/to-webp.js <job> --src input/album --dest photos --width 1600 --quality 80 --start 1
 *   node scripts/to-webp.js <job> --files "input/a.jpg,input/b.png"   # chỉ vài ảnh, theo đúng thứ tự
 *   node scripts/to-webp.js --dir <thư mục bất kỳ> --out <thư mục ra>  # dùng ngoài job
 *
 * - Tự xoay theo EXIF, không phóng to ảnh nhỏ, giữ tỉ lệ (cạnh dài ≤ --width).
 * - HEIC/HEIF (ảnh iPhone): đổi sang JPG trước bằng heif-convert (Linux) hoặc sips (macOS).
 * - Ghi bảng tra photos.md trong job: tên mới ← tên gốc, ngang/dọc, kích thước — để chọn ảnh bìa,
 *   đặt object-position cho đúng mặt.
 * - Bỏ qua ảnh "thông tin" (tên file có: thong-tin, info, thiep-giay, qr, bill) — chỉ để đọc.
 */
const fs = require('fs');
const path = require('path');
const os = require('os');
const { execFileSync } = require('child_process');
const C = require('./lib/core');
const sharp = C.reqT('sharp');

const { pos, opt } = C.parseArgs();
const IMG = /\.(jpe?g|png|webp|heic|heif|tiff?|bmp)$/i;
const INFO = /(thong[-_ ]?tin|info|thiep[-_ ]?giay|\bqr\b|bill|chuyen[-_ ]?khoan)/i;
const width = Number(opt.width || 1600), quality = Number(opt.quality || 80);

let job = null, srcFiles, outDir;
if (opt.dir) {
    srcFiles = walk(path.resolve(opt.dir));
    outDir = path.resolve(opt.out || opt.dir);
} else {
    job = C.loadJob(pos[0]);
    const jd = C.jobDir(job.id);
    srcFiles = opt.files ? String(opt.files).split(',').map(f => path.join(jd, f.trim())) : walk(path.join(jd, opt.src || 'input'));
    const card = (job.cards || []).length ? C.getCard(job, opt.card) : null;
    const cardDir = card ? C.abs(card.folder) : null;
    const d = opt.dest || card?.photoDir || 'photos';
    outDir = path.isAbsolute(d) ? d : cardDir ? path.join(cardDir, d) : path.join(jd, 'webp');
}

function walk(d) {
    if (!fs.existsSync(d)) C.die('Không có thư mục ' + d);
    return fs.readdirSync(d, { withFileTypes: true }).flatMap(e => e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)])
        .filter(f => IMG.test(f)).sort((a, b) => a.localeCompare(b, 'vi', { numeric: true }));
}

function heicToJpg(f) {
    const out = path.join(os.tmpdir(), path.parse(f).name + '-' + Date.now() + '.jpg');
    try {
        if (process.platform === 'darwin') execFileSync('sips', ['-s', 'format', 'jpeg', f, '--out', out], { stdio: 'ignore' });
        else execFileSync('heif-convert', [f, out], { stdio: 'ignore' });
        return out;
    } catch { throw new Error('không đổi được HEIC (Linux: sudo apt install libheif-examples)'); }
}

(async () => {
    fs.mkdirSync(outDir, { recursive: true });
    let n = Number(opt.start || 1);
    while (fs.existsSync(path.join(outDir, `anh_${n}.webp`)) && !opt.start) n++;
    const rows = [];
    for (const f of srcFiles) {
        if (!opt.files && INFO.test(path.basename(f))) { console.log('· bỏ qua ảnh thông tin: ' + path.basename(f)); continue; }
        try {
            const src = /\.hei[cf]$/i.test(f) ? heicToJpg(f) : f;
            const name = `anh_${n++}.webp`;
            const info = await sharp(src).rotate().resize({ width, height: width, fit: 'inside', withoutEnlargement: true })
                .webp({ quality }).toFile(path.join(outDir, name));
            const shape = info.height > info.width * 1.1 ? 'dọc' : info.width > info.height * 1.1 ? 'ngang' : 'vuông';
            rows.push(`| ${name} | ${path.basename(f)} | ${shape} | ${info.width}×${info.height} | ${Math.round(info.size / 1024)}KB |`);
            console.log(`✓ ${name} ← ${path.basename(f)} (${shape} ${info.width}×${info.height})`);
        } catch (e) { console.error('✗ ' + path.basename(f) + ' — ' + e.message); }
    }
    if (!rows.length) C.die('Không có ảnh nào được chuyển.');
    const table = `\n## ${C.now()} → ${C.rel(outDir)}\n\n| Ảnh mới | Tên gốc | Hướng | Cỡ | Dung lượng |\n|---|---|---|---|---|\n${rows.join('\n')}\n`;
    if (job) {
        fs.appendFileSync(path.join(C.jobDir(job.id), 'photos.md'), table);
        C.log(job, `chuyển ${rows.length} ảnh → ${C.rel(outDir)} (bảng tra: photos.md)`);
        C.ok(`${rows.length} ảnh → ${C.rel(outDir)} · bảng tra: jobs/${job.id}/photos.md`);
    } else C.ok(rows.length + ' ảnh → ' + outDir);
})();

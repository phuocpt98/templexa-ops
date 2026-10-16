#!/usr/bin/env node
/**
 * cut-icons.js — Tách nền ảnh AI tạo → icon / hoạ tiết NỀN TRONG SUỐT, tự cắt từng món trong ảnh lưới.
 * Chạy hoàn toàn trên máy (sharp), không gọi dịch vụ ngoài.
 *
 *   node scripts/cut-icons.js <ảnh.png> --out <thư mục> [--names a,b,c] [--prefix icon]
 *        [--bg auto|green|magenta|white|#RRGGBB] [--tol 60] [--size 800] [--pad 8]
 *        [--min 2000] [--gap 24] [--holes] [--keep-holes] [--png] [--single]
 *
 * Cách hoạt động (khác script cũ cut-element-grid.js — script cũ xoá MỌI điểm trắng nên đục thủng
 * cánh hoa trắng, lòng vòng tròn trắng):
 *   1. Đoán màu nền từ 4 góc (hoặc --bg).
 *   2. LOANG TỪ MÉP ẢNH vào trong: chỉ điểm cùng màu nền VÀ nối liền với mép mới bị xoá.
 *      → phần trắng nằm bên trong hình được giữ nguyên.
 *      Nền xanh/hồng (chroma): mặc định xoá cả "lỗ" kín bên trong (vd lòng vòng hoa) vì tranh
 *      không có màu đó. Nền trắng: giữ lỗ, trừ khi thêm --holes.
 *   3. Viền mềm: điểm gần màu nền được trong suốt một phần (khử răng cưa); nền xanh/hồng còn
 *      khử ám màu ở viền (despill).
 *   4. Tách từng món (vùng liền nhau), gộp mảnh gần nhau trong khoảng --gap px, bỏ mảnh vụn < --min px².
 *   5. Mỗi món: cắt sát + chừa --pad px, thu cạnh dài về --size px, xuất WebP có alpha (+ PNG nếu --png).
 *   6. Ghi _preview.png: mọi món trên nền caro + đỏ — MỞ XEM để kiểm viền trước khi dùng.
 *
 * --single: coi cả ảnh là 1 món (không tách) — dùng cho khung viền, vòng hoa có nhiều mảnh rời.
 * Thứ tự xuất: trái → phải, trên → dưới (đặt --names theo đúng thứ tự đó).
 */
const fs = require('fs');
const path = require('path');
const C = require('./lib/core');
const sharp = C.reqT('sharp');

const { pos, opt } = C.parseArgs();
const input = pos[0];
if (!input || !opt.out) { console.log(fs.readFileSync(__filename, 'utf8').split('*/')[0]); process.exit(input ? 1 : 0); }
const OUT = path.resolve(opt.out);
const TOL = Number(opt.tol || 60), SIZE = Number(opt.size || 800), PAD = Number(opt.pad ?? 8);
const MIN = Number(opt.min || 2000), GAP = Number(opt.gap || 24);
const NAMES = opt.names ? String(opt.names).split(',').map(s => s.trim()).filter(Boolean) : [];
const PREFIX = opt.prefix || 'icon';

const PRESET = { green: [0, 255, 0], magenta: [255, 0, 255], white: [255, 255, 255] };
const hex = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));

(async () => {
    const { data, info } = await sharp(input).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    const W = info.width, H = info.height, N = W * H;
    const px = i => [data[i * 4], data[i * 4 + 1], data[i * 4 + 2]];

    // 1. màu nền
    let bg;
    if (opt.bg && opt.bg !== 'auto') bg = PRESET[opt.bg] || (opt.bg.startsWith('#') ? hex(opt.bg) : null);
    if (!bg) {
        const s = [];
        for (const [x0, y0] of [[0, 0], [W - 8, 0], [0, H - 8], [W - 8, H - 8]])
            for (let y = y0; y < y0 + 8; y++) for (let x = x0; x < x0 + 8; x++) s.push(px(y * W + x));
        bg = [0, 1, 2].map(c => s.map(p => p[c]).sort((a, b) => a - b)[s.length >> 1]);
    }
    const sat = Math.max(...bg) - Math.min(...bg);
    const chroma = sat > 120; // nền xanh/hồng thuần
    const dist = i => { const p = px(i); return Math.sqrt((p[0] - bg[0]) ** 2 + (p[1] - bg[1]) ** 2 + (p[2] - bg[2]) ** 2); };
    console.log(`Nền: rgb(${bg.join(',')})${chroma ? ' — chroma' : ''} · dung sai ${TOL}`);

    // 2. loang từ mép
    const D = new Float32Array(N);
    for (let i = 0; i < N; i++) D[i] = dist(i);
    const isBg = new Uint8Array(N), stack = [];
    const push = i => { if (!isBg[i] && D[i] <= TOL) { isBg[i] = 1; stack.push(i); } };
    for (let x = 0; x < W; x++) { push(x); push((H - 1) * W + x); }
    for (let y = 0; y < H; y++) { push(y * W); push(y * W + W - 1); }
    while (stack.length) {
        const i = stack.pop(), x = i % W, y = (i / W) | 0;
        if (x > 0) push(i - 1); if (x < W - 1) push(i + 1); if (y > 0) push(i - W); if (y < H - 1) push(i + W);
    }
    const holes = opt['keep-holes'] ? false : (opt.holes || chroma);
    if (holes) for (let i = 0; i < N; i++) if (D[i] <= TOL * 0.6) isBg[i] = 1;

    // 3. alpha mềm ở viền + khử ám màu
    const out = Buffer.from(data);
    for (let i = 0; i < N; i++) {
        let a;
        if (isBg[i]) a = 0;
        else {
            let nearBg = false;
            const x = i % W, y = (i / W) | 0;
            for (let dy = -1; dy <= 1 && !nearBg; dy++) for (let dx = -1; dx <= 1; dx++) {
                const xx = x + dx, yy = y + dy;
                if (xx >= 0 && yy >= 0 && xx < W && yy < H && isBg[yy * W + xx]) { nearBg = true; break; }
            }
            a = nearBg ? Math.max(0, Math.min(1, (D[i] - TOL) / TOL)) : 1;
            if (nearBg && a < 0.15) a = 0;
            if (chroma && nearBg) {           // despill: kéo kênh màu nền về mức 2 kênh còn lại
                const o = i * 4, k = bg.indexOf(Math.max(...bg));
                const others = [0, 1, 2].filter(c => c !== k).map(c => out[o + c]);
                if (bg.filter(v => v > 200).length === 1) out[o + k] = Math.min(out[o + k], Math.max(...others));
                else { const lo = bg.indexOf(Math.min(...bg)); for (const c of [0, 1, 2]) if (c !== lo) out[o + c] = Math.min(out[o + c], Math.max(out[o + lo], (out[o] + out[o + 1] + out[o + 2]) / 3)); }
            }
        }
        out[i * 4 + 3] = Math.round(a * data[i * 4 + 3]);
    }

    // 4. tách món
    let boxes = [];
    if (opt.single) boxes.push(bbox([...Array(N).keys()].filter(i => out[i * 4 + 3] > 8)));
    else {
        const lab = new Int32Array(N).fill(-1);
        for (let s = 0; s < N; s++) {
            if (lab[s] !== -1 || out[s * 4 + 3] <= 8) continue;
            const comp = [s]; lab[s] = boxes.length;
            for (let k = 0; k < comp.length; k++) {
                const i = comp[k], x = i % W, y = (i / W) | 0;
                for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
                    const xx = x + dx, yy = y + dy, j = yy * W + xx;
                    if (xx >= 0 && yy >= 0 && xx < W && yy < H && lab[j] === -1 && out[j * 4 + 3] > 8) { lab[j] = boxes.length; comp.push(j); }
                }
            }
            boxes.push(bbox(comp));
        }
        // bỏ hạt nhiễu TRƯỚC khi gộp, để chấm bẩn không dính vào món bên cạnh
        boxes = boxes.filter(b => b.n >= Math.max(60, MIN * 0.03));
        // gộp mảnh gần nhau (lá rời quanh bông hoa…)
        let merged = true;
        while (merged) {
            merged = false;
            for (let a = 0; a < boxes.length && !merged; a++) for (let b = a + 1; b < boxes.length; b++) {
                const A = boxes[a], B = boxes[b];
                if (A.x0 - GAP <= B.x1 && B.x0 - GAP <= A.x1 && A.y0 - GAP <= B.y1 && B.y0 - GAP <= A.y1) {
                    boxes[a] = { x0: Math.min(A.x0, B.x0), y0: Math.min(A.y0, B.y0), x1: Math.max(A.x1, B.x1), y1: Math.max(A.y1, B.y1), n: A.n + B.n };
                    boxes.splice(b, 1); merged = true; break;
                }
            }
        }
        boxes = boxes.filter(b => b.n >= MIN);
        // xếp theo hàng: món nào chồng chiều dọc với hàng đang xét thì cùng hàng, trong hàng xếp trái → phải
        boxes.sort((a, b) => (a.y0 + a.y1) - (b.y0 + b.y1));
        const rows = [];
        for (const b of boxes) {
            const r = rows.find(r => b.y0 < r.y1 && b.y1 > r.y0 && (Math.min(b.y1, r.y1) - Math.max(b.y0, r.y0)) > 0.3 * Math.min(b.y1 - b.y0, r.y1 - r.y0));
            if (r) { r.items.push(b); r.y0 = Math.min(r.y0, b.y0); r.y1 = Math.max(r.y1, b.y1); } else rows.push({ y0: b.y0, y1: b.y1, items: [b] });
        }
        boxes = rows.sort((a, b) => a.y0 - b.y0).flatMap(r => r.items.sort((a, b) => a.x0 - b.x0));
    }
    function bbox(list) {
        let x0 = W, y0 = H, x1 = 0, y1 = 0;
        for (const i of list) { const x = i % W, y = (i / W) | 0; if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
        return { x0, y0, x1, y1, n: list.length };
    }
    if (!boxes.length) C.die('Không tách được món nào — thử tăng/giảm --tol hoặc chỉ định --bg.');
    if (NAMES.length && NAMES.length !== boxes.length) console.log(`! Tách được ${boxes.length} món nhưng --names có ${NAMES.length} tên — kiểm _preview.png`);

    // 5. xuất
    fs.mkdirSync(OUT, { recursive: true });
    const full = sharp(out, { raw: { width: W, height: H, channels: 4 } });
    const tiles = [];
    for (let k = 0; k < boxes.length; k++) {
        const b = boxes[k];
        const name = (NAMES[k] || `${PREFIX}-${String(k + 1).padStart(2, '0')}`).replace(/\.\w+$/, '');
        const left = Math.max(0, b.x0 - PAD), top = Math.max(0, b.y0 - PAD);
        const width = Math.min(W - left, b.x1 - b.x0 + 1 + PAD * 2), height = Math.min(H - top, b.y1 - b.y0 + 1 + PAD * 2);
        const buf = await full.clone().extract({ left, top, width, height })
            .resize({ width: SIZE, height: SIZE, fit: 'inside', withoutEnlargement: true }).png().toBuffer();
        const meta = await sharp(buf).metadata();
        await sharp(buf).webp({ quality: 90, alphaQuality: 100 }).toFile(path.join(OUT, name + '.webp'));
        if (opt.png) fs.writeFileSync(path.join(OUT, name + '.png'), buf);
        tiles.push({ name, buf, w: meta.width, h: meta.height });
        console.log(`✓ ${name}.webp  ${meta.width}×${meta.height}`);
    }

    // 6. ảnh kiểm tra trên nền caro
    const cell = 260, cols = Math.min(4, tiles.length), rows = Math.ceil(tiles.length / cols);
    const checker = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${cols * cell}" height="${rows * (cell + 24)}"><defs><pattern id="c" width="20" height="20" patternUnits="userSpaceOnUse"><rect width="20" height="20" fill="#fff"/><rect width="10" height="10" fill="#d9d9d9"/><rect x="10" y="10" width="10" height="10" fill="#d9d9d9"/></pattern></defs><rect width="100%" height="100%" fill="url(#c)"/>${tiles.map((t, i) => `<rect x="${(i % cols) * cell + 1}" y="${Math.floor(i / cols) * (cell + 24) + 1}" width="${cell - 2}" height="${cell - 2}" fill="none" stroke="#e11d48" stroke-dasharray="4 4"/><text x="${(i % cols) * cell + 8}" y="${Math.floor(i / cols) * (cell + 24) + cell + 17}" font-family="sans-serif" font-size="14" fill="#111">${i + 1}. ${t.name}</text>`).join('')}</svg>`);
    const comps = await Promise.all(tiles.map(async (t, i) => ({
        input: await sharp(t.buf).resize({ width: cell - 20, height: cell - 20, fit: 'inside' }).png().toBuffer(),
        left: (i % cols) * cell + 10, top: Math.floor(i / cols) * (cell + 24) + 10,
    })));
    await sharp(checker).composite(comps).png().toFile(path.join(OUT, '_preview.png'));
    C.ok(`${tiles.length} món → ${OUT}  ·  MỞ XEM ${path.join(OUT, '_preview.png')} (viền xanh/trắng sót, bị thủng, bị cắt mất?)`);
})().catch(e => C.die(e.message));

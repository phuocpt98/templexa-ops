#!/usr/bin/env node
/**
 * qr.js — Mã QR mở link thiệp (để in lên thiệp giấy, gửi kèm tin nhắn).
 *
 *   node scripts/qr.js <job> [--card <key>]            # 1 QR chung → <thư mục thiệp>/qr/qr-chung.png
 *   node scripts/qr.js <job> --guests                   # + 1 QR/khách (đọc guests.json trong thư mục thiệp)
 *   node scripts/qr.js <job> --color "#7A1F2B" --size 600
 *
 * Có --guests thì sinh thêm qr/index.html (lưới QR + tên) để in hoặc gửi khách tự cắt.
 * QR chuyển khoản mừng cưới KHÔNG làm ở đây — đó là ảnh QR ngân hàng khách gửi, đặt vào photos/.
 */
const fs = require('fs');
const path = require('path');
const C = require('./lib/core');
const QR = C.reqT('qrcode');

const { pos, opt } = C.parseArgs();
const j = C.loadJob(pos[0]);
const card = C.getCard(j, opt.card);
const url = card.shortlink?.url;
if (!url) C.die('Thiệp chưa có link khách — chạy shortlink.js trước.');
const dir = path.join(C.abs(card.folder), 'qr');
fs.mkdirSync(dir, { recursive: true });
const o = { width: Number(opt.size || 500), margin: 2, color: { dark: opt.color || '#000000', light: '#FFFFFF' } };

(async () => {
    await QR.toFile(path.join(dir, 'qr-chung.png'), url, o);
    let n = 0;
    if (opt.guests) {
        const gf = path.join(C.abs(card.folder), 'guests.json');
        if (!fs.existsSync(gf)) C.die('Không có guests.json trong ' + card.folder);
        let g = JSON.parse(fs.readFileSync(gf, 'utf8'));
        if (!Array.isArray(g)) g = Array.isArray(g.guests) ? g.guests : Object.entries(g).map(([id, v]) => Object.assign({ id }, typeof v === 'object' ? v : { name: v }));
        const cells = [];
        for (const x of g) {
            const id = x.id ?? x.code ?? x.ma;
            if (id === undefined) continue;
            const file = `qr-${C.slugify(String(id))}.png`;
            await QR.toFile(path.join(dir, file), url + '?id=' + encodeURIComponent(id), o);
            cells.push(`<figure><img src="${file}" alt=""><figcaption>${String(x.name || x.ten || x.title || id).replace(/</g, '&lt;')}</figcaption></figure>`);
            n++;
        }
        fs.writeFileSync(path.join(dir, 'index.html'), `<!doctype html><html lang="vi"><head><meta charset="utf-8"><meta name="robots" content="noindex, nofollow"><title>QR khách mời — ${j.customer}</title>
<style>body{font-family:system-ui,sans-serif;margin:24px}main{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}figure{margin:0;text-align:center;break-inside:avoid}img{width:180px;height:180px}figcaption{font-size:14px}</style></head>
<body><h1>QR khách mời — ${j.customer}</h1><main>${cells.join('\n')}</main></body></html>\n`);
    }
    C.stepDone(j, 'qr:' + card.key, 'qr-chung' + (n ? ' + ' + n + ' QR khách' : ''));
    C.ok('QR → ' + C.rel(dir) + '/qr-chung.png' + (n ? ` + ${n} QR khách (in: ${C.rel(dir)}/index.html)` : ''));
})();

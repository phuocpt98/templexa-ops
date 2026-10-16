#!/usr/bin/env node
/**
 * catalog.js — Đưa thiệp lên catalog (data.js) và chỉnh thứ tự hiển thị.
 *
 * ĐƯA LÊN CATALOG (sau khi đã chụp ảnh bằng shoot.js):
 *   node scripts/catalog.js add <job> [--card <key>] --name "Tên hiển thị" [--label "Nhãn ngắn"] [--desc "..."]
 *                               [--style luxury] [--event graduation] [--hide]
 *   - Thiệp làm THEO MẪU (card.from) → gắn làm "Thiệp đã làm từ mẫu này" dưới mẫu gốc:
 *       entry isPublic:false + templateOf:<mẫu gốc>, thêm {kind:'sample'} vào variants của mẫu gốc.
 *   - Thiệp THIẾT KẾ MỚI → entry public bình thường (cần --style nếu là thiệp cưới, --event).
 *   - Mặc định khoe thiệp khách. Chỉ khi chủ shop bảo ẩn (job.showInCatalog=false hoặc --hide) mới không gắn.
 *
 * THỨ TỰ HIỂN THỊ (trong cùng loại thiệp, catalog xếp: priority nhỏ → featured → mới cập nhật → id lớn):
 *   node scripts/catalog.js order --list [--category wedding|other] [--event graduation] [--top 20]
 *   node scripts/catalog.js order <id> top      # ghim lên đầu (featured = true)
 *   node scripts/catalog.js order <id> normal   # bỏ ghim, về thứ tự thường (priority 0)
 *   node scripts/catalog.js order <id> bottom   # đẩy xuống cuối (priority 100)
 *   node scripts/catalog.js order <id> fresh    # đưa lên đầu nhóm thường bằng cách đặt updatedAt = hôm nay (hiện nhãn NEW 30 ngày)
 *
 * Sau mỗi lần sửa: tự chạy build:products-md, và build:landing + build:sitemap nếu catalog công khai thay đổi.
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const C = require('./lib/core');

const { pos, opt } = C.parseArgs();
const cmd = pos.shift();
const io = C.products();

if (cmd === 'add') add();
else if (cmd === 'order') order();
else { console.log(fs.readFileSync(__filename, 'utf8').split('*/')[0]); process.exit(cmd ? 1 : 0); }

function build(publicChanged) {
    const run = s => execSync('npm run --silent ' + s, { cwd: C.TPX, stdio: 'inherit' });
    run('build:products-md');
    if (publicChanged) { run('build:landing'); run('build:sitemap'); }
}

function add() {
    const j = C.loadJob(pos[0]);
    const card = C.getCard(j, opt.card);
    if (card.entryId) C.die('Thiệp đã có trong catalog: #' + card.entryId);
    const hide = opt.hide || j.showInCatalog === false;
    const base = card.folder;
    const shot = n => base + 'shots/' + n + '.webp';
    for (const n of ['open', 'cover', 'sec-1']) if (!fs.existsSync(C.abs(shot(n)))) C.die('Thiếu ' + shot(n) + ' — chạy shoot.js trước.');
    if (!opt.name) C.die('Thiếu --name "Tên hiển thị" (vd "Thư Mời Tốt Nghiệp UEL — Bản Trang Trọng")');

    const { products: P, src } = io.load();
    let master = card.from ? P.find(p => p.id === card.from) : null;
    while (master && master.templateOf) master = P.find(p => p.id === master.templateOf) || master; // gắn vào mẫu gốc thật
    const isSample = !!master && !hide;
    if (!master && !hide && !opt.style && ['wedding', 'dam-ngo', 'an-hoi'].includes(j.occasion))
        C.die('Thiệp cưới thiết kế mới cần --style traditional|modern|minimalist|luxury|floral|vintage');

    const id = Math.max(...P.map(p => p.id)) + 1;
    const entry = {
        id, name: opt.name, slug: C.slugify(opt.name) + (P.some(p => p.slug === C.slugify(opt.name)) ? '-' + id : ''),
        description: opt.desc || (master ? `Thiệp thật làm cho khách từ mẫu ${master.name}.` : opt.name),
        category: ['wedding', 'dam-ngo', 'an-hoi'].includes(j.occasion) ? 'wedding' : 'other',
        type: 'invitation',
        style: opt.style || (master ? master.style : ''),
        event: opt.event || (j.occasion === 'day-thang' ? 'thoi-noi' : j.occasion) || '',
        tags: [...new Set([...(master ? master.tags.slice(0, 6) : []), 'thiep-khach'])],
        price: '',
        images: [shot('open'), shot('cover'), shot('sec-1')],
        thumbnail: shot('open'), mobileView: shot('open'),
        path: base, demoUrl: base + card.entry,
        variants: [],
        ...(master ? { templateOf: master.id } : {}),
        features: master ? master.features.slice(0, 3) : [],
        status: '', featured: false, priority: 0,
        downloads: 0, rating: 4.9, showInSlider: false,
        isPublic: !isSample && !hide,
        updatedAt: C.today(),
    };
    P.push(entry);
    if (isSample) {
        if (!Array.isArray(master.variants) || !master.variants.length)
            master.variants = [{ id: master.id, thumbnail: master.mobileView || master.thumbnail, demoUrl: master.demoUrl, label: 'Mẫu gốc', kind: 'master' }];
        master.variants.push({ id, thumbnail: entry.mobileView, demoUrl: entry.demoUrl, label: opt.label || card.label || j.customer, kind: 'sample' });
    }
    io.save(P, src);
    execSync('node --check assets/js/data.js', { cwd: C.TPX });
    card.entryId = id;
    C.stepDone(j, 'catalog:' + card.key, isSample ? `#${id} gắn dưới mẫu #${master.id}` : hide ? `#${id} ẩn` : `#${id} public`);
    build(!isSample && !hide);
    C.ok(isSample ? `#${id} hiện trong mục "Thiệp đã làm từ mẫu này" của #${master.id} (thiep-online.html?pid=${master.id})`
        : hide ? `#${id} đã thêm nhưng ẨN (chủ shop yêu cầu)` : `#${id} public — xem thiep-online.html?pid=${id}`);
}

function order() {
    const { products: P, src } = io.load();
    if (opt.list) {
        const sorted = P.filter(p => p.type === 'invitation' && p.isPublic !== false)
            .filter(p => !opt.category || p.category === opt.category).filter(p => !opt.event || p.event === opt.event)
            .sort((a, b) => (a.priority || 0) - (b.priority || 0) || (!!b.featured - !!a.featured)
                || (Date.parse(b.updatedAt || 0) - Date.parse(a.updatedAt || 0)) || b.id - a.id);
        sorted.slice(0, Number(opt.top || 20)).forEach((p, i) => console.log(
            `${String(i + 1).padStart(3)}. #${p.id} ${p.featured ? '📌' : '  '} ${p.priority ? '[p' + p.priority + '] ' : ''}${p.name}  · ${p.updatedAt || ''}`));
        console.log(`(${sorted.length} thiệp public${opt.event ? ' · event ' + opt.event : ''}${opt.category ? ' · ' + opt.category : ''}; status bestseller/trending/hot cũng ảnh hưởng thứ tự)`);
        return;
    }
    const p = P.find(x => x.id === Number(pos[0]));
    if (!p) C.die('Không có #' + pos[0]);
    if (p.isPublic === false) C.die('#' + p.id + ' đang ẩn (là thiệp khách gắn dưới mẫu hoặc chưa public) — thứ tự chỉ áp cho thiệp hiện trên catalog.');
    const act = pos[1];
    if (act === 'top') p.featured = true;
    else if (act === 'normal') { p.featured = false; p.priority = 0; }
    else if (act === 'bottom') { p.featured = false; p.priority = 100; }
    else if (act === 'fresh') p.updatedAt = C.today();
    else C.die('Hành động phải là: top | normal | bottom | fresh');
    io.save(P, src);
    build(true);
    C.ok(`#${p.id} → ${act}`);
}

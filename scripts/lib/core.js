/**
 * core.js — Hàm dùng chung cho mọi script trong templexa-ops.
 *
 *  - Tìm thư mục code Templexa (biến TEMPLEXA_DIR → ./Templexa → ../Templexa)
 *  - Mượn module (sharp, puppeteer, qrcode) từ node_modules của Templexa,
 *    nên templexa-ops KHÔNG cần npm install riêng.
 *  - Đọc/ghi job.json, ghi log, sinh lại jobs/JOBS.md
 */
const fs = require('fs');
const path = require('path');
const { createRequire } = require('module');

const OPS = path.resolve(__dirname, '..', '..');
const JOBS_DIR = path.join(OPS, 'jobs');

function findTemplexa() {
    const cands = [process.env.TEMPLEXA_DIR, path.join(OPS, 'Templexa'), path.join(OPS, '..', 'Templexa')].filter(Boolean);
    for (const c of cands) {
        if (fs.existsSync(path.join(c, 'assets', 'js', 'data.js'))) return path.resolve(c);
    }
    die('Không tìm thấy code Templexa. Chạy ./setup.sh hoặc đặt biến TEMPLEXA_DIR.');
}
const TPX = findTemplexa();
const reqT = createRequire(path.join(TPX, 'package.json'));

// ---------- tiện ích chung ----------
function die(msg) { console.error('✗ ' + msg); process.exit(1); }
function ok(msg) { console.log('✓ ' + msg); }
function today() { return new Date(Date.now() + 7 * 3600e3).toISOString().slice(0, 10); } // giờ VN
function now() { return new Date(Date.now() + 7 * 3600e3).toISOString().slice(0, 16).replace('T', ' '); }

/** "Lê Thuận Hưng" → "le-thuan-hung" */
function slugify(s) {
    return String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D')
        .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

/** Đọc tham số dạng: lệnh <vị trí...> --khoa giatri --co */
function parseArgs(argv = process.argv.slice(2)) {
    const pos = [], opt = {};
    for (let i = 0; i < argv.length; i++) {
        const a = argv[i];
        if (a.startsWith('--')) {
            const k = a.slice(2), n = argv[i + 1];
            if (n === undefined || n.startsWith('--')) opt[k] = true; else { opt[k] = n; i++; }
        } else pos.push(a);
    }
    return { pos, opt };
}

// ---------- job ----------
function jobDir(id) { return path.join(JOBS_DIR, id); }

/** Tìm job theo mã, slug, tên khách hoặc link khách. Trả về id hoặc null. */
function resolveJob(q) {
    if (!q) return null;
    if (fs.existsSync(path.join(jobDir(q), 'job.json'))) return q;
    const key = slugify(q.replace(/^https?:\/\/[^/]+/, '').replace(/\/(index\.html)?$/, '').split('/').pop());
    const hits = listJobs().filter(j => [j.id, j.slug, slugify(j.customer || ''),
        ...(j.cards || []).flatMap(c => [c.shortlink?.slug, c.folder && path.basename(c.folder)])]
        .filter(Boolean).some(v => slugify(v) === key || slugify(v).includes(key)));
    if (hits.length === 1) return hits[0].id;
    if (hits.length > 1) die('Có nhiều job khớp "' + q + '": ' + hits.map(h => h.id).join(', ') + ' — ghi rõ mã job.');
    return null;
}

function loadJob(q) {
    const id = resolveJob(q);
    if (!id) die('Không tìm thấy job "' + q + '". Xem jobs/JOBS.md hoặc chạy: node scripts/job.js list');
    const j = JSON.parse(fs.readFileSync(path.join(jobDir(id), 'job.json'), 'utf8'));
    j.id = id;
    return j;
}

function saveJob(j) {
    j.updatedAt = now();
    fs.writeFileSync(path.join(jobDir(j.id), 'job.json'), JSON.stringify(j, null, 2) + '\n');
    writeIndex();
}

function log(j, msg) {
    fs.appendFileSync(path.join(jobDir(j.id), 'log.md'), `- ${now()} · ${msg}\n`);
}

/** Đánh dấu 1 bước trong job.steps là xong */
function stepDone(j, step, note) {
    j.steps = j.steps || {};
    j.steps[step] = now();
    log(j, 'xong bước `' + step + '`' + (note ? ' — ' + note : ''));
    saveJob(j);
}

function listJobs() {
    if (!fs.existsSync(JOBS_DIR)) return [];
    return fs.readdirSync(JOBS_DIR).filter(d => !d.startsWith('_') && fs.existsSync(path.join(JOBS_DIR, d, 'job.json')))
        .map(d => Object.assign(JSON.parse(fs.readFileSync(path.join(JOBS_DIR, d, 'job.json'), 'utf8')), { id: d }));
}

const STATUS_LABEL = {
    'cho-thong-tin': '⏳ chờ thông tin', 'dang-lam': '🔨 đang làm', 'cho-duyet': '👀 chờ duyệt',
    'sua': '✏️ đang sửa', 'xong': '✅ xong', 'huy': '✖ huỷ',
};
const STATUS_ORDER = ['sua', 'dang-lam', 'cho-thong-tin', 'cho-duyet', 'xong', 'huy'];

/** Sinh lại jobs/JOBS.md từ toàn bộ job.json — KHÔNG sửa tay file đó */
function writeIndex() {
    const jobs = listJobs().sort((a, b) =>
        STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status) || String(a.deadline || '9999').localeCompare(String(b.deadline || '9999')));
    const archived = fs.existsSync(path.join(JOBS_DIR, '_archive'))
        ? fs.readdirSync(path.join(JOBS_DIR, '_archive')).filter(d => !d.startsWith('.')) : [];
    const links = j => (j.cards || []).filter(c => c.shortlink?.url).map(c => `[${c.key}](${c.shortlink.url})`).join(' · ');
    const rows = jobs.map(j => `| \`${j.id}\` | ${j.customer || ''} | ${j.occasion || j.kind || ''} | ${j.mode || ''}${j.from ? ' #' + j.from : ''} | ${links(j)} | ${STATUS_LABEL[j.status] || j.status} | ${j.deadline || ''} | ${j.waitingFor || ''} |`);
    const md = `# Mục lục job

> FILE SINH TỰ ĐỘNG bởi \`scripts/job.js\` — không sửa tay. Sắp xếp: đang sửa → đang làm → chờ thông tin → chờ duyệt → xong; trong cùng trạng thái, hạn gần lên trước.
> Tìm job theo link/tên: \`node scripts/job.js find "<link hoặc tên>"\`

| Mã job | Khách | Loại | Cách làm | Link khách | Trạng thái | Hạn | Đang chờ |
|---|---|---|---|---|---|---|---|
${rows.join('\n') || '| | | | | | | | |'}

**Đã lưu trữ (${archived.length}):** ${archived.map(a => '`' + a + '`').join(' · ') || '—'}
`;
    fs.writeFileSync(path.join(JOBS_DIR, 'JOBS.md'), md);
}

/** Lấy thiệp trong job theo key (mặc định thiệp đầu tiên). Job có thể có nhiều thiệp: bản A/B, nhà trai/nhà gái. */
function getCard(j, key) {
    const cards = j.cards || [];
    if (!cards.length) die('Job ' + j.id + ' chưa có thiệp nào — chạy clone.js (theo mẫu) hoặc new-card.js (thiết kế mới) trước.');
    if (!key) {
        if (cards.length > 1) die('Job có ' + cards.length + ' thiệp (' + cards.map(c => c.key).join(', ') + ') — thêm --card <key>.');
        return cards[0];
    }
    const c = cards.find(x => x.key === key);
    if (!c) die('Không có thiệp key "' + key + '". Có: ' + cards.map(x => x.key).join(', '));
    return c;
}

// ---------- data.js ----------
function products() { return reqT(path.join(TPX, 'scripts', 'lib', 'products-io.js')); }
function findProduct(id) {
    const P = products().load().products;
    return P.find(p => p.id === Number(id));
}
/** './products/…/' → đường dẫn tuyệt đối */
function abs(rel) { return path.join(TPX, String(rel).replace(/^\.?\//, '')); }
function rel(absPath) { return './' + path.relative(TPX, absPath).split(path.sep).join('/'); }

module.exports = {
    OPS, JOBS_DIR, TPX, reqT, die, ok, today, now, slugify, parseArgs,
    jobDir, resolveJob, getCard, loadJob, saveJob, log, stepDone, listJobs, writeIndex, STATUS_LABEL,
    products, findProduct, abs, rel,
};

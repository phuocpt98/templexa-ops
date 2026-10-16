#!/usr/bin/env node
/**
 * job.js — Quản lý job (mỗi thiệp = 1 job = 1 thư mục trong jobs/).
 *
 *   node scripts/job.js new "<tên khách>" --kind wedding|event|birthday --occasion <dịp> --mode clone|new|edit
 *                       [--from <id mẫu>] [--deadline YYYY-MM-DD] [--slug <slug>]
 *   node scripts/job.js list                       # in bảng các job đang mở
 *   node scripts/job.js find "<link | tên | slug>" # link khách gửi → ra mã job
 *   node scripts/job.js show <job>                 # in job.json + 10 dòng log cuối
 *   node scripts/job.js set <job> info.groom="Nguyễn Văn A" deadline=2026-11-02 guests=false
 *   node scripts/job.js check <job>                # liệt kê thông tin CÒN THIẾU (câu phải hỏi user)
 *   node scripts/job.js status <job> <cho-thong-tin|dang-lam|cho-duyet|sua|xong|huy> ["ghi chú"]
 *   node scripts/job.js archive <job>              # lưu trữ: giữ job.json/log/feedback, XOÁ input/
 *   node scripts/job.js index                      # sinh lại jobs/JOBS.md
 *
 * <job> nhận mã job, slug, tên khách hoặc link khách.
 */
const fs = require('fs');
const path = require('path');
const C = require('./lib/core');

const KINDS = ['wedding', 'event', 'birthday'];
const OCCASIONS = ['wedding', 'dam-ngo', 'an-hoi', 'birthday', 'thoi-noi', 'day-thang', 'graduation', 'anniversary', 'reunion', 'gio-to', 'confession', 'holiday', 'other'];
const MODES = ['clone', 'new', 'edit'];

const { pos, opt } = C.parseArgs();
const cmd = pos.shift();
const cmds = { new: cmdNew, list: cmdList, find: cmdFind, show: cmdShow, set: cmdSet, check: cmdCheck, status: cmdStatus, archive: cmdArchive, index: () => { C.writeIndex(); C.ok('jobs/JOBS.md'); } };
if (!cmds[cmd]) { console.log(fs.readFileSync(__filename, 'utf8').split('*/')[0]); process.exit(cmd ? 1 : 0); }
cmds[cmd]();

function cmdNew() {
    const customer = pos[0];
    if (!customer) C.die('Thiếu tên khách: job.js new "<tên khách>" ...');
    for (const [k, list] of [['kind', KINDS], ['occasion', OCCASIONS], ['mode', MODES]]) {
        if (opt[k] && !list.includes(opt[k])) C.die(`--${k} phải là: ${list.join(' | ')}`);
    }
    const slug = opt.slug ? C.slugify(opt.slug) : C.slugify(customer);
    const id = C.today() + '_' + slug;
    if (fs.existsSync(C.jobDir(id))) C.die('Job đã tồn tại: ' + id);
    const occasion = opt.occasion || null;
    const j = {
        customer, slug,
        kind: opt.kind || (occasion ? (['wedding', 'dam-ngo', 'an-hoi'].includes(occasion) ? 'wedding' : occasion === 'birthday' ? 'birthday' : 'event') : null),
        occasion,
        mode: opt.mode || null,
        from: opt.from ? Number(opt.from) : null,
        sides: null,                // wedding: "doi" | "nha-trai" | "nha-gai" | "rieng-2-nha" (2 thiệp riêng)
        deadline: opt.deadline || null,
        status: 'cho-thong-tin',
        waitingFor: '',
        info: {},                   // nội dung thiệp: tên, cha mẹ, ngày giờ, địa điểm, lời mời... (xem flows/01)
        photos: null,               // { count, hero: "input/…", notes } — null = chưa hỏi
        music: null,                // "giu-mau" | đường dẫn mp3
        gift: null,                 // { bank, account, holder, qrImage } | false = không có
        guests: null,               // true (có danh sách ?id=) | false
        sheetId: null,              // "khach_37" | false = chưa có
        showInCatalog: true,        // mặc định khoe thiệp — chỉ false khi chủ shop bảo ẩn
        cards: [],                  // mỗi thiệp: { key, label, from, folder, photoDir, entryId,
                                    //   share: {title, description}, shortlink: {type, slug, url} }
        steps: {},
        createdAt: C.now(),
    };
    fs.mkdirSync(path.join(C.jobDir(id), 'input'), { recursive: true });
    fs.writeFileSync(path.join(C.jobDir(id), 'log.md'), `# Nhật ký — ${customer}\n\n`);
    fs.copyFileSync(path.join(C.OPS, 'templates', 'feedback.md'), path.join(C.jobDir(id), 'feedback.md'));
    j.id = id;
    C.log(j, 'tạo job');
    C.saveJob(j);
    C.ok('Tạo job ' + id);
    printMissing(j);
}

function cmdList() {
    const jobs = C.listJobs().filter(j => !['xong', 'huy'].includes(j.status));
    if (!jobs.length) return console.log('Không có job nào đang mở.');
    for (const j of jobs) console.log(`${j.id.padEnd(36)} ${(C.STATUS_LABEL[j.status] || j.status).padEnd(16)} ${j.customer}${j.deadline ? '  · hạn ' + j.deadline : ''}${j.waitingFor ? '  · chờ: ' + j.waitingFor : ''}`);
}

function cmdFind() {
    const id = C.resolveJob(pos.join(' '));
    if (!id) {
        console.log('Không có job nào khớp. Nếu là việc mới → tạo job: node scripts/job.js new "<tên khách>" ...');
        process.exit(2);
    }
    console.log(id);
}

function cmdShow() {
    const j = C.loadJob(pos[0]);
    console.log(JSON.stringify(j, null, 2));
    const lines = fs.readFileSync(path.join(C.jobDir(j.id), 'log.md'), 'utf8').trim().split('\n');
    console.log('\n— Log gần nhất —\n' + lines.slice(-10).join('\n'));
    const fb = fs.readFileSync(path.join(C.jobDir(j.id), 'feedback.md'), 'utf8');
    const open = (fb.match(/^- \[ \].*/gm) || []);
    if (open.length) console.log('\n— Feedback chưa xử lý (' + open.length + ') —\n' + open.join('\n'));
}

/** set <job> a.b=giá trị … — giá trị true/false/null/số/JSON được tự hiểu */
function cmdSet() {
    const j = C.loadJob(pos.shift());
    for (const pair of pos) {
        const i = pair.indexOf('=');
        if (i < 0) C.die('Sai cú pháp "' + pair + '" — dùng khoa=giatri');
        const keys = pair.slice(0, i).split('.'), raw = pair.slice(i + 1);
        let val = raw;
        try { val = JSON.parse(raw); } catch { /* giữ chuỗi */ }
        let o = j;
        for (const k of keys.slice(0, -1)) o = (o[k] = (o[k] && typeof o[k] === 'object') ? o[k] : {});
        o[keys[keys.length - 1]] = val;
        C.log(j, `set ${keys.join('.')} = ${raw}`);
    }
    C.saveJob(j);
    C.ok('Đã cập nhật ' + j.id);
    printMissing(j);
}

function cmdCheck() { const miss = printMissing(C.loadJob(pos[0])); process.exit(miss.length ? 3 : 0); }

function cmdStatus() {
    const j = C.loadJob(pos[0]);
    const st = pos[1];
    if (!C.STATUS_LABEL[st]) C.die('Trạng thái phải là: ' + Object.keys(C.STATUS_LABEL).join(' | '));
    if (st === 'dang-lam' && missing(j).length) C.die('Chưa đủ thông tin, không được chuyển sang "đang làm". Chạy: job.js check ' + j.id);
    j.status = st;
    if (st !== 'cho-thong-tin') j.waitingFor = pos[2] || '';
    C.log(j, 'trạng thái → ' + st + (pos[2] ? ' — ' + pos[2] : ''));
    C.saveJob(j);
    C.ok(j.id + ' → ' + C.STATUS_LABEL[st]);
}

function cmdArchive() {
    const j = C.loadJob(pos[0]);
    if (!['xong', 'huy'].includes(j.status) && !opt.force) C.die('Job chưa xong (' + j.status + '). Thêm --force nếu chắc chắn.');
    const dest = path.join(C.JOBS_DIR, '_archive', j.id);
    fs.mkdirSync(dest, { recursive: true });
    for (const f of ['job.json', 'log.md', 'feedback.md']) {
        const src = path.join(C.jobDir(j.id), f);
        if (fs.existsSync(src)) fs.copyFileSync(src, path.join(dest, f));
    }
    fs.appendFileSync(path.join(dest, 'log.md'), `- ${C.now()} · lưu trữ, đã xoá input/\n`);
    fs.rmSync(C.jobDir(j.id), { recursive: true, force: true });
    C.writeIndex();
    C.ok('Đã lưu trữ ' + j.id + ' → jobs/_archive/ (ảnh gốc trong input/ đã xoá)');
}

// ---------- kiểm tra đủ thông tin ----------
/** Trả về danh sách câu hỏi còn thiếu. null = CHƯA HỎI; false/"" = đã hỏi, trả lời "không". */
function missing(j) {
    const q = [];
    const unset = v => v === null || v === undefined;
    if (!j.mode) q.push('Tạo thiệp MỚI, làm THEO MẪU có sẵn, hay SỬA thiệp đã có? (mode: new | clone | edit)');
    if (!j.kind || !j.occasion) q.push('Thiệp cho dịp gì? (cưới · dạm ngõ · ăn hỏi · sinh nhật · thôi nôi · đầy tháng · tốt nghiệp · kỷ niệm · họp lớp · giỗ · khác)');
    if (j.mode === 'clone' && !j.from) q.push('Làm theo mẫu nào? (mã #id hoặc link mẫu trên templexa.vn)');
    if (j.mode === 'edit') {
        if (!(j.cards || []).length) q.push('Sửa thiệp nào? (link khách hoặc tên khách)');
        return q; // sửa thì chỉ cần biết thiệp nào — nội dung sửa nằm trong feedback.md
    }
    const i = j.info || {};
    const isWedding = ['wedding', 'dam-ngo', 'an-hoi'].includes(j.occasion);
    if (isWedding) {
        if (unset(j.sides)) q.push('Thiệp ĐÔI (1 thiệp đủ 2 nhà), chỉ nhà trai, chỉ nhà gái, hay 2 thiệp RIÊNG cho 2 nhà? (sides: doi | nha-trai | nha-gai | rieng-2-nha)');
        if (!i.groom) q.push('Họ tên chú rể');
        if (!i.bride) q.push('Họ tên cô dâu');
        if (unset(i.groomParents) && j.sides !== 'nha-gai') q.push('Tên bố mẹ nhà trai (+ địa chỉ nhà trai)');
        if (unset(i.brideParents) && j.sides !== 'nha-trai') q.push('Tên bố mẹ nhà gái (+ địa chỉ nhà gái)');
    } else if (!i.honoree) {
        q.push('Tên người/nhân vật chính của thiệp (vd tên bé, tên tân cử nhân, tên công ty…)');
    }
    if (!i.date) q.push('Ngày tổ chức (dương lịch; nếu cưới/giỗ thì cả âm lịch)');
    if (!i.time) q.push('Giờ tổ chức');
    if (!i.venue) q.push('Địa điểm (tên nơi tổ chức) + địa chỉ');
    if (unset(i.mapUrl)) q.push('Link Google Maps của địa điểm (hoặc "không có")');
    if (unset(j.photos)) q.push('Ảnh: gửi ảnh vào chat/link Drive; ảnh nào làm ảnh bìa? (hoặc "dùng ảnh mẫu")');
    if (isWedding && unset(j.gift)) q.push('QR mừng cưới: ngân hàng + số tài khoản + tên chủ TK (hoặc ảnh QR), hay không cần?');
    if (unset(j.guests)) q.push('Có danh sách khách mời để in tên từng người trên thiệp (?id=) không?');
    if (unset(j.sheetId)) q.push('sheet_id nhận RSVP/lời chúc (vd khach_38) — chưa có thì trả lời "chưa"');
    if (unset(j.music)) q.push('Nhạc nền: giữ nhạc của mẫu hay đổi bài khác?');
    return q;
}

function printMissing(j) {
    const q = missing(j);
    if (j.status === 'cho-thong-tin') {
        j.waitingFor = q.length ? q.length + ' câu hỏi' : '';
        C.saveJob(j);
    }
    if (!q.length) C.ok('Đủ thông tin — có thể chuyển "đang làm": job.js status ' + j.id + ' dang-lam');
    else console.log('\nCÒN THIẾU ' + q.length + ' thông tin — PHẢI HỎI USER (hỏi gộp 1 lần, đánh số):\n' + q.map((x, n) => `  ${n + 1}. ${x}`).join('\n'));
    return q;
}

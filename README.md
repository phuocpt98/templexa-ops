# templexa-ops — bộ vận hành làm thiệp

Thư mục này chứa **cách làm việc** (flow, skill, script, sổ job). **Code website** nằm ở repo `Templexa` riêng.
Dùng chung cho: AI trên cloud (Muse), Claude trên máy chủ shop, nhân viên.

```
templexa-ops/
├── README.md            ← bạn đang đọc
├── AGENT.md             ← LUẬT cho AI — đọc trước mọi việc
├── setup.sh             ← cài trên máy mới: clone Templexa, cài thư viện, kiểm công cụ
├── Templexa/            ← code website (setup.sh clone về; trên máy chủ shop dùng ../Templexa)
│
├── flows/               ← các bước làm, đọc theo số
│   ├── 00-nhan-viec.md      link/tên → tìm job hoặc tạo job mới; lưu file user gửi
│   ├── 01-hoi-thong-tin.md  bộ câu hỏi bắt buộc — thiếu là phải hỏi
│   ├── 10-tao-thiep.md      nhánh git → clone/new → ảnh → đổi nội dung → chụp kiểm → xem thử
│   ├── 15-tao-anh.md        Muse tự tạo ảnh/video: thông số, prompt mẫu, tách nền bằng cut-icons.js
│   ├── 16-chuyen-thiep-ladi.md  thiệp đại lý LadiPage → mẫu Templexa thuần (scripts/ladi/convert.js + REPORT cho AI)
│   ├── 20-sua-thiep.md      góp ý qua trang sua-thiep.html → feedback.md → sửa → duyệt
│   ├── 30-xuat-ban.md       ảnh share → link khách → QR → catalog → duyệt → lên templexa.vn · thứ tự catalog
│   └── 90-dong-job.md       lưu trữ, xoá ảnh gốc
│
├── skills/thiep/        ← 1 skill cho mọi loại thiệp (thay 7 skill gen-* cũ)
│   ├── SKILL.md             A. theo mẫu · B. thiết kế mới · C. danh sách khách · D. sửa · luật cứng · checklist
│   └── refs/                tài liệu thiết kế + bài học (wedding-*.md), profiles/ cho bé/sinh nhật/kỷ niệm, legacy-*.md
│
├── video-mau-thiep/     ← quay video dọc giới thiệu mẫu thiệp: SKILL.md · kich-ban/<id>.json · quay.js · nen/ · font-cache/
│
├── scripts/             ← mỗi việc 1 lệnh (cách dùng ghi ở đầu mỗi file)
│   ├── job.js               new · list · find · show · set · check · status · archive · index
│   ├── fetch.js             tải link (cả Google Drive) vào input/, tự giải nén zip/rar/7z
│   ├── to-webp.js           ảnh khách → photos/anh_N.webp + bảng tra photos.md (HEIC iPhone được)
│   ├── clone.js             copy mẫu #id → khach_<slug>/ (không đụng mẫu gốc)
│   ├── new-card.js          thư mục trống cho thiệp thiết kế mới
│   ├── og-cover.js          ảnh share 1200×630
│   ├── shortlink.js         link khách /wedding|event|birthday/<slug>/ + OG + noindex
│   ├── qr.js                QR mở thiệp (chung + từng khách)
│   ├── shoot.js             chụp 3 ảnh dọc cover/open/sec-1
│   ├── cut-icons.js         tách nền ảnh AI tạo (nền xanh #00FF00 / trắng) → icon trong suốt, tự cắt ảnh lưới
│   ├── catalog.js           đưa lên catalog (gắn dưới mẫu gốc / public) · thứ tự hiển thị
│   └── lib/core.js          hàm dùng chung (tự tìm Templexa, mượn sharp/puppeteer của nó)
│
├── templates/feedback.md
└── jobs/
    ├── JOBS.md              mục lục (tự sinh — không sửa tay)
    ├── <yyyy-mm-dd>_<slug>/
    │   ├── job.json         thông tin đã chốt + bước nào xong
    │   ├── input/           mọi thứ user gửi
    │   ├── photos.md        bảng tra ảnh đã chuyển
    │   ├── log.md           nhật ký (script tự ghi)
    │   └── feedback.md      yêu cầu sửa [ ] / [x]
    └── _archive/            job đã xong (không còn input/)
```

## Một vòng làm thiệp (tóm tắt)
```bash
node scripts/job.js new "Lê Thuận Hưng" --occasion graduation --mode clone --from 299   # 00
node scripts/job.js check <job>      # → hỏi user những câu còn thiếu, ghi bằng job.js set   # 01
cd Templexa && git switch -c job-<slug> && cd ..                                          # 10
node scripts/fetch.js <job> <link ảnh>        # hoặc lưu ảnh vào jobs/<job>/input/
node scripts/clone.js <job>
node scripts/to-webp.js <job>
#   … đổi nội dung theo skills/thiep/SKILL.md …
node scripts/shoot.js <job>
node scripts/og-cover.js <job>                                                            # 30
node scripts/shortlink.js <job> --title "…" --desc "…"
node scripts/catalog.js add <job> --name "…" --label "…"
cd Templexa && git add -A && git commit -m "…" && npm run deploy   # tự pull → push → deploy xem thử
#   … chủ shop duyệt → merge main → npm run deploy -- --prod …
node scripts/job.js status <job> xong && node scripts/job.js archive <job>               # 90
```

## Cài đặt
- **Cloud (Muse):** giải nén / clone thư mục này → `chmod +x setup.sh && ./setup.sh` → `cd Templexa && npx wrangler login`.
  Cần quyền đọc/ghi repo `Templexa` trên GitHub (SSH key hoặc token) — cấp 1 lần.
- **Máy chủ shop:** thư mục này nằm cạnh `Templexa/` trong `templexa-project/` — không cần clone thêm.
  Claude dùng được skill qua `.claude/skills/thiep` (symlink tới `skills/thiep`).

## Deploy an toàn
Cloudflare không tự kéo code từ GitHub — máy nào chạy deploy thì đẩy code trên máy đó. Vì vậy **chỉ deploy bằng `npm run deploy`** (trong `Templexa/`): lệnh bắt buộc commit trước, rồi tự pull → push → deploy (GitHub luôn giống bản đang chạy), nhánh khác main → bản xem thử `https://<nhánh>.templexa.pages.dev`, main + `--prod` → templexa.vn.

## Công cụ góp ý sửa thiệp
`https://templexa.vn/sua-thiep.html?u=<link thiệp>` — thiệp trong khung điện thoại, bấm / kéo vùng / chuột phải để chọn chỗ cần sửa, ghi muốn sửa gì, **Copy gửi** → dán vào chat. Chi tiết: `flows/20-sua-thiep.md`.

## Chưa làm
- Dọn 7 skill cũ trong `.claude/skills/` và script thừa trong `Templexa/scripts/`.

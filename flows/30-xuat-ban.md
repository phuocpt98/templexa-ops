# 30 · Xuất bản: ảnh share → link khách → QR → catalog → lên thật

Mỗi bước có `[--card <key>]` khi job có nhiều thiệp — làm lần lượt từng thiệp.

## 1. Ảnh khi share link (og-cover.jpg 1200×630)
```bash
node scripts/og-cover.js <job>                             # có og-cover.html (copy từ mẫu) thì chụp trang đó, không thì cắt ảnh bìa
node scripts/og-cover.js <job> --photo photos/anh_3.webp   # chọn ảnh khác
```
Mở xem `og-cover.jpg` — mặt người không bị cắt, chữ (nếu có) đúng tên.

## 2. Link gửi khách
```bash
node scripts/shortlink.js <job> --title "Lê Thuận Hưng — Lễ Tốt Nghiệp UEL 2026" --desc "Trân trọng kính mời … 24/10/2026, 11:00 …"
```
- Ra `https://templexa.vn/<wedding|event|birthday>/<slug>/`. Đổi slug: `--slug`. Sửa tiêu đề/ảnh sau này: thêm `--update`.
- `--title` ≤ 60 ký tự, `--desc` 1–2 câu: ai mời, dịp gì, ngày giờ, ở đâu — đây là chữ hiện trên Zalo/Facebook.
- Có danh sách khách: link từng người = link + `?id=<mã khách>`.

## 3. QR mở thiệp (tuỳ chọn — khi khách in thiệp giấy)
```bash
node scripts/qr.js <job> [--guests] [--color "#7A1F2B"]
```

## 4. Đưa lên catalog (mặc định LUÔN làm — khách muốn khoe)
```bash
node scripts/catalog.js add <job> --name "Thư Mời Tốt Nghiệp UEL — Bản Trang Trọng" --label "UEL · Phụ huynh"
```
- Theo mẫu → tự gắn vào mục "Thiệp đã làm từ mẫu này" dưới mẫu gốc (ẩn khỏi lưới, hiện trong popup mẫu gốc).
- Thiết kế mới → thành mẫu public riêng (thiệp cưới thêm `--style luxury|modern|…`).
- Chủ shop dặn ẩn → `--hide`.
- `--name` KHÔNG ghi tên riêng khách nếu là thiết kế mới (nó thành mẫu cho người khác chọn); với thiệp theo mẫu thì ghi được.

## 5. Gửi duyệt
1. Commit + `npm run deploy` (preview, tự pull + push) như flows/10 bước 5.
2. Gửi user: link khách trên preview `https://job-<slug>.templexa.pages.dev/<event|wedding|birthday>/<slug>/` + ảnh `shots/open.webp`.
3. `node scripts/job.js status <job> cho-duyet "đã gửi link preview"`.
4. Có góp ý → ghi `feedback.md`, status `sua`, sửa, quay lại bước 5.

## 6. Lên templexa.vn (CHỈ khi chủ shop đồng ý)
```bash
cd Templexa
git switch main && git pull
git merge job-<slug>            # xung đột ở config.js/data.js: giữ CẢ HAI phía (2 entry khác nhau)
npm run deploy -- --prod        # tự pull → push main → deploy templexa.vn
cd ..
node scripts/job.js status <job> xong "đã lên templexa.vn"
```
Gửi khách link `https://templexa.vn/<…>/<slug>/` (không còn chữ `job-…pages.dev`).

## Thứ tự hiển thị trên catalog (chủ shop yêu cầu)
```bash
node scripts/catalog.js order --list --event graduation      # xem thứ tự hiện tại
node scripts/catalog.js order 299 top                         # ghim lên đầu
node scripts/catalog.js order 299 normal | bottom | fresh
```
Chỉ áp cho thiệp đang hiện trên lưới (không áp cho thiệp khách gắn dưới mẫu). Sau đó commit + deploy như trên.

# 10 · Dựng thiệp

Điều kiện: job ở trạng thái `dang-lam` (đã qua flows/01). Mọi lệnh `node scripts/…` chạy trong `templexa-ops/`.

## Bước 0 — Nhánh git riêng cho job
```bash
cd Templexa && git switch main && git pull && git switch -c job-<slug> && cd ..
```
(`<slug>` = phần sau dấu `_` trong mã job, vd `2026-10-20_le-thuan-hung` → `job-le-thuan-hung`.)

## Bước 1 — Tạo thư mục thiệp
| Trường hợp | Lệnh |
|---|---|
| Theo mẫu có sẵn | `node scripts/clone.js <job>` |
| Thiết kế mới | `node scripts/new-card.js <job>` |
| **2 thiệp** (2 nhà, hoặc 2 phiên bản như bản phụ huynh + bản bạn bè) | Chạy 2 lần với `--key`: `clone.js <job> --key nha-trai --label "Nhà trai"` rồi `clone.js <job> --key nha-gai --label "Nhà gái"` (mỗi thiệp có thể `--from` mẫu khác nhau) |

Thư mục tạo ra: `Templexa/products/Invitation/<Wedding|Other>/khach_<slug>[-key]/`. Từ đây trở đi job có nhiều thiệp thì mọi lệnh thêm `--card <key>`.

## Bước 2 — Ảnh khách
```bash
node scripts/to-webp.js <job> [--card <key>]
```
→ ảnh vào `<thư mục thiệp>/photos/anh_1.webp…`, bảng tra `jobs/<job>/photos.md` (tên gốc, ngang/dọc). Xem ảnh để chọn ảnh bìa, ảnh nào hợp khung nào.

## Bước 3 — Đổi nội dung thiệp
Làm theo **`skills/thiep/SKILL.md`**:
- Theo mẫu → mục "A. Làm theo mẫu": thay tên, ngày, giờ, địa điểm, bản đồ, ảnh, nhạc, RSVP/sheet, QR mừng cưới, tiêu đề trang.
- Thiết kế mới → mục "B. Thiết kế mới".
- Có danh sách khách → mục "C. Danh sách khách ?id=".
- Cần hoạ tiết / ảnh nền / video mới → tự tạo theo `flows/15-tao-anh.md` (thông số + tách nền bằng `cut-icons.js`).

## Bước 4 — Tự kiểm tra trước khi cho user xem
```bash
node scripts/shoot.js <job> [--card <key>]
```
**Mở xem** `shots/open.webp`, `cover.webp`, `sec-1.webp`: đúng tên, đúng ngày, ảnh không cắt mặt, chữ không tràn/xuống dòng giữa tên, không còn chữ/ảnh của mẫu gốc. Sai → sửa → chụp lại. Rồi chạy checklist cuối `skills/thiep/SKILL.md`.

## Bước 5 — Commit + xem thử
```bash
cd Templexa && git add -A && git commit -m "<slug>: dựng thiệp" && git push -u origin job-<slug> && npm run deploy && cd ..
```
→ link xem thử `https://job-<slug>.templexa.pages.dev/products/Invitation/…/khach_<slug>/` — mở bằng trình duyệt kiểm thêm 1 lần trên điện thoại (chiều ngang 390px).

Tiếp: `30-xuat-ban.md`.

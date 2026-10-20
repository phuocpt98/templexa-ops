# Kịch bản quay — gen_269_dusty-rose-flatlay

- **Mẫu:** Thiệp cưới "Minh & Linh — 23.05.2026" (gen_269_dusty-rose-flatlay)
- **Đường dẫn thiệp:** `Templexa/products/Invitation/Wedding/gen_269_dusty-rose-flatlay/index.html`
- **Phong cách thiệp:** hồng dusty rose, phong bì hoa khô, tông pastel lãng mạn.
- **Nền sân khấu:** `nen/hoa-hong-pastel.jpg` (hoa hồng + hoa khô tông dusty, hợp style thiệp).
- **Nhạc:** chính nhạc của thiệp — `Beautiful In White.mp3` (`Templexa/products/shared/music/wedding/`).

## Đã đọc thiệp — thiệp hoạt động thế nào

- Mở đầu là **cổng phong bì** (`#envelope`, "Chạm để mở thiệp"): bấm vào → phong bì mở,
  nhạc tự phát, hiệu ứng **cánh hoa rơi** (`#petals`) chạy xuyên suốt.
- Các mục theo thứ tự cuộn: lời mời + tên khách → **đếm ngược** (`#count`) →
  "Ngày chung đôi" (thời gian, địa điểm, nút Xem chỉ đường, Thêm vào lịch) →
  **album collage** (`#collage`) → **Timeline** → **hộp quà** (`#giftBtn` bấm mở thẻ QR `#giftCard`) →
  **form xác nhận tham dự** "Bạn sẽ đến chứ?" (`#rsvpForm`) → lời chúc (`#wishes`).
- Có nút đĩa nhạc (`#vinylBtn`) bật/tắt nhạc.

## Bản đồ thiệp (đã đo thật — trang cao 6141, màn điện thoại cao 1330)

- `#collage` **18** — cảnh hero ngay đầu trang (phong bì mở + hoa + đĩa nhạc) — chính là cảnh mở đầu, KHÔNG phải album ở giữa.
- `#invite` **771** — thẻ mời (ngày giờ, địa điểm).
- `h2 Timeline` **2118**.
- `h2 Ngày chung đôi` **2676** + `#count` đếm ngược **2769**.
- `#giftBtn` **4016** — bấm mở thẻ QR `#giftCard`.
- `h2 Bạn sẽ đến chứ?` **4709** + `#rsvpForm` **4873**, `#wishes` **5438**.

## Timeline quay (tổng ~30 giây)

| Giây | Hành động |
|---|---|
| 0,0–2,5 | Đứng yên: điện thoại hiện phong bì đang đóng trên nền hoa hồng. Chữ đầu clip: "MẪU THIỆP CƯỚI ONLINE" |
| 2,5 | **Bấm mở phong bì** (`#envelope`) |
| 2,5–5,5 | Đợi phong bì mở (khoảng 2 giây) + ngắm cảnh hero, cánh hoa rơi |
| 5,5–9,5 | Cuộn chậm đến **thẻ mời** (`#invite`) |
| 9,5–13,5 | Cuộn đến **Timeline** |
| 13,5–17,5 | Cuộn đến **Ngày chung đôi + đếm ngược** (`#count`) |
| 17,5–21,0 | Cuộn đến **hộp quà** (`#giftBtn`) |
| 21,0 | **Bấm `#giftBtn`** mở thẻ QR, dừng 1,5 giây |
| 22,5–25,5 | Cuộn đến **form xác nhận tham dự** (`#rsvpForm`), dừng 1 giây |
| 25,5–28,5 | **Cuộn ngược về đầu trang** (intro) |
| 28,5–30,5 | Chữ kết hiện **đè lên hình** (không đổi nền): TEMPLEXA — templexa.vn + câu giới thiệu, chỉ 2 giây |

## Quy định trình bày (đã chốt với user 20/10)

- Trước khi quay thật có **vòng khởi động**: mở thiệp, cuộn sẵn 1 vòng cho tài nguyên nạp hết, tải lại trang rồi mới quay — cuộn cho mượt, không lag.
- Mọi thứ nạp từ **file local** trong repo; chặn hết đường ra mạng ngoài lúc quay.
- Chữ **templexa.vn hiện đúng 1 chỗ** trên nền sân khấu, vị trí chọn tuỳ nền (mẫu này: góc dưới-phải). Cấu hình ở `"viTriWeb"` trong `kich-ban/gen-269-dusty-rose.json`.
- Ảnh trong điện thoại phải **bo tròn theo khung**, không tràn góc vuông (ép bằng clip-path trong `san-khau.html`).

## Câu giới thiệu mẫu (màn kết + caption khi đăng)

"Mẫu thiệp cưới Dusty Rose — mở phong bì hoa khô, cánh hoa rơi, có đếm ngược, album ảnh và khách xác nhận tham dự ngay trên thiệp."

## Ghi chú kỹ thuật

- Cuộn bằng `window.scrollTo` mượt (requestAnimationFrame) trong iframe, tốc độ ~ đều, dừng đúng các mốc trên.
- Màn kết là lớp phủ trong `san-khau.html` (không nằm trong thiệp), bật bằng tham số thời gian ở `quay.js`.

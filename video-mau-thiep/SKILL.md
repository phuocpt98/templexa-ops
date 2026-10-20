# FLOW: Video giới thiệu mẫu thiệp (Reels dọc 9:16)

Luồng sản xuất video dọc giới thiệu từng mẫu thiệp của templexa.vn, đăng Page Facebook / Reels / TikTok.
Mọi tài sản nằm trong folder này (`templexa-ops/video-mau-thiep/`).

## Cấu trúc

- `SKILL.md` — file này: mô tả flow.
- `muc-luc.md` — danh sách mẫu ĐÃ quay: ngày quay, nền đã dùng, tên video, trạng thái đăng + link bài.
- `san-khau.html` — sân khấu quay: nền cảnh + điện thoại hơi nghiêng + iframe thiệp thật + màn kết templexa.vn.
- `nen/` — kho ảnh nền theo phong cách (gen sẵn, thêm dần khi cần style mới).
- `kich-ban/` — mỗi mẫu 1 file kịch bản chi tiết, viết TRƯỚC khi quay (xem mẫu `kich-ban/gen-269-dusty-rose.md`).
- `quay.js` — script quay tự động (puppeteer): chạy đúng kịch bản, xuất mp4 vào `video/`.
- `video/` — folder đích chứa video thành phẩm (đã gitignore; đăng xong có thể xoá, lịch sử nằm ở `muc-luc.md`).

## Quy trình mỗi mẫu

1. **Đọc thiệp trước** (bắt buộc): mở file thiệp thật, ghi lại:
   cách mở thiệp (bấm vào đâu), hiệu ứng (hoa rơi, đĩa nhạc...), các mục theo thứ tự,
   nhạc nền của thiệp, tông màu/phong cách.
2. **Viết kịch bản** vào `kich-ban/<id-mau>.md`: chọn nền trong `nen/` hợp style,
   timeline từng đoạn (giây nào bấm gì, đợi hiệu ứng nào, cuộn đến mục nào, dừng bao lâu),
   câu giới thiệu mẫu, nội dung màn kết, thời lượng dự kiến (~25–30 giây).
3. **Quay**: chạy `node quay.js <id-mau>` — script mở `san-khau.html` (1080×1920),
   nạp nền + thiệp theo kịch bản, tự bấm/cuộn/chờ, ghi hình, trộn nhạc của thiệp,
   xuất `video/<id-mau>.mp4`.
4. **Ghi mục lục**: thêm dòng vào `muc-luc.md` (ngày, mẫu, nền, video, trạng thái "chờ duyệt").
5. **Duyệt & đăng**: user duyệt video → đăng Page bằng connector facebook → cập nhật mục lục "đã đăng + link".

## Thông số chuẩn

- Video: 1080×1920, mp4 (H.264), 25–30 giây.
- Điện thoại trên sân khấu: nghiêng nhẹ ~4°, có đổ bóng, bo góc.
- Màn kết: thiệp cuộn về phần mở đầu, chữ TEMPLEXA + templexa.vn + câu giới thiệu hiện **đè lên hình trong 2 giây** (không chuyển sang nền tối).
- Dấu ấn **templexa.vn hiện đúng 1 chỗ** trên nền sân khấu; vị trí chọn theo từng nền (góc trên-trái / trên-phải / dưới-trái / dưới-phải / giữa-dưới), đặt ở `CFG.viTriWeb`.
- Trước lượt quay thật luôn có **vòng khởi động** (mở thiệp + cuộn sẵn 1 vòng + tải lại) để tài nguyên nạp hết, cuộn không lag. Mọi tài nguyên nạp từ file local; lúc quay chặn hết đường ra mạng ngoài.
- Ảnh trong điện thoại phải bo tròn theo khung (clip-path ở `san-khau.html`), không tràn góc vuông.
- Âm thanh: dùng chính nhạc nền của thiệp (file trong `Templexa/products/shared/music/...`),
  trộn bằng ffmpeg, nhỏ dần ở cuối.

## Kinh nghiệm kỹ thuật (rút ra từ bản quay thử gen_269)

- **Phải đo bản đồ thiệp trước khi viết timeline**: vị trí các mục không theo thứ tự đoán —
  vd gen_269: `#collage` là cảnh hero ở ĐẦU trang (không phải album giữa trang), đếm ngược ở ~2769/6141.
  Đo bằng cách mở thiệp, bấm mở, đọc `getBoundingClientRect().top + scrollY` của từng mục tiêu.
- **Cuộn TRÔI LIÊN TỤC trong trang** (đã cài trong `quay.js`): vòng lặp theo từng khung hình,
  mỗi bước đo lại vị trí mục tiêu rồi trượt một đoạn tỉ lệ theo khoảng cách còn lại (nhanh ở xa,
  chậm dần khi tới nơi), dùng `scrollTo({behavior:'instant'})`. KHÔNG dùng cuộn theo nấc bánh xe —
  chuyển động rời nấc làm video giật. Đo vị trí bằng `getBoundingClientRect()` trực tiếp nên
  vẫn đúng dù thiệp có thu nhỏ nội dung (transform scale).
- **Bồi khung lên 30 khung/giây khi dựng** (ffmpeg minterpolate): máy quay chỉ bắt được ~7 khung/giây
  nên phải suy thêm khung trung gian, nếu không video phát ra bị giật dù cuộn đã mượt.
  Khâu này chạy nền ~5 phút cho clip 30 giây — cứ để máy chạy, không cần chờ tay.
- Ghép khung hình ghi hình phải giữ **đúng thời gian thật** giữa các khung (không nén đoạn đứng yên).
- Bấm các nút trong thiệp bằng `el.click()` trong iframe — tránh click của puppeteer tự cuộn nhảy cóc.
- Nhận diện iframe thiệp bằng dấu hiệu có dấu `/` thật (vd `/gen_269_dusty-rose-flatlay/`) —
  URL trang sân khấu cũng chứa tên mẫu trong tham số, dễ bắt nhầm khung chính.

## Quy ước đặt tên

- File kịch bản và video: `<id-mau>.md` / `<id-mau>.mp4`, id lấy theo folder thiệp (vd `gen-269-dusty-rose`).
- Ảnh nền: tên theo phong cách, không dấu (vd `hoa-hong-pastel.jpg`).

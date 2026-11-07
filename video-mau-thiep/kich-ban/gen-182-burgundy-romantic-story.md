# Kịch bản quay — gen_182 Burgundy Romantic Story (Hoàng Nam & Minh Anh)

- Mẫu: "Thiệp Cưới Burgundy Romantic Story — Hoàng Nam & Minh Anh" (folder gen_182_burgundy-romantic-story, file code.html, Lễ Vu Quy Thứ Bảy 20.05.2030 09:00–11:00 nhà gái). Tông đỏ burgundy + vàng gold, font Playfair Display (tiêu đề) + Sacramento (tên script) + Nunito, có hiệu ứng hoa rơi/lucide.
- Cách mở thiệp: phong bì `#envelope`, nút "Mở Thiệp" `#envelopeOpenBtn` — bấm là mở thiệp + bật nhạc (bgMusic.volume 0.3). Ngủ ~4 giây cho hero hiện đủ (Hoàng Nam & Minh Anh · 20 . 05 . 2030 · 3 chương chuyện tình).
- Nhạc nền của thiệp: `shared/music/wedding/A Thousand Years.mp3` (dài 285 giây, đủ video). Lưu ý: thẻ `<audio preload="auto">` nên Chrome tải nhạc nền ngay khi mở trang, request mp3 giữ ~20 giây rồi mới xong — `networkidle0` của quay.js vẫn qua được (đã kiểm chứng).
- Font: Playfair Display + Nunito + Sacramento — CHƯA có trong font-cache lúc viết kịch bản (đo bản đồ báo thiếu CSS Google Fonts) → đã tải bổ sung bằng `quay.js --tai-font` đêm 08/11 (máy đã vào được fonts.googleapis.com).
- Nền sân khấu: nen/phong-burgundy-nem.jpg (MỚI gen đêm 08/11: phòng tiệc burgundy, rèm nhung đỏ rượu 2 bên, nến vàng + hồng đỏ 2 góc dưới, giữa trống êm). Dấu templexa.vn: giua-duoi (sàn gỗ giữa-dưới trống, chữ trắng nổi).
- Bản đồ vị trí (đo thật ở bề rộng 414px sau khi bấm mở thiệp): hero=0, countdown=3160, weddingCalendar=3648, story=4143, event=4933, gallery=5969, rsvp=7558, guestbook=8125, giftbox=8702. Trang cao ~9929px.
- Lưu ý: đếm ngược chạy đúng tới 20.05.2030 (chưa qua). Bỏ qua weddingCalendar (lịch tháng 5/2030, nhỏ) và guestbook (form lời chúc) trong timeline.
- Điểm nhấn trong video: bìa phong bì đỏ burgundy + nút Mở Thiệp → hero tên Hoàng Nam & Minh Anh → đếm ngược → chuyện tình 3 chương → lễ Vu Quy → album ảnh cưới → RSVP → hộp mừng cưới.
- Thời lượng dự kiến: ~28 giây.

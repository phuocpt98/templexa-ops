# Kịch bản quay — gen_327 Thiệp Cưới Nhật Báo Tình Yêu (Thành Đạt & Ngọc Hân)

- Mẫu: "Thiệp Cưới Nhật Báo Tình Yêu — Báo Xưa Sài Gòn" (folder gen_327_nhat-bao-tinh-yeu, file index.html; lễ Vu Quy 15.12.2026, lễ Thành Hôn 27.12.2026 18:00 tại Nhà hàng Hương Xưa – Sảnh Bến Thành, 68 Đồng Khởi, Quận 1, TP. Hồ Chí Minh). Tông báo xưa Sài Gòn: nền gạch bông, font Anton + Bungee + Old Standard TT + Playball (tự host trong assets/fonts, không cần font-cache).
- Cách mở thiệp: bìa tờ báo `#sgCua`, nút "Đọc tin vui" `#sgNutMo` (class Btn_opencard + Btn_openMusic) — bấm là mở tờ báo + bật nhạc.
- Nhạc nền của thiệp: `products/shared/music/wedding/Mot Doi.mp3` (dài 328 giây, đủ video).
- Nền sân khấu: nen/phong-bao-xua-sai-gon.jpg (MỚI gen đêm 10/11: sân quán cà phê Sài Gòn xưa, tường vàng sepia + báo cũ + phin cà phê góc dưới-trái + gạch bông, giữa trống êm). Dấu templexa.vn: trai-duoi (vùng bàn gỗ tối góc dưới-trái, chữ trắng nổi).
- Bản đồ vị trí (đo thật ở bề rộng 414px sau khi bấm mở thiệp): SECTION_DAU=0, SECTION_MOI=1447, SECTION_HAIHO=2763, SECTION_NGHILE=3781, SECTION_LICH=4648, SECTION_DEMNGUOC=5582, SECTION_TIMELINE=6315, SECTION_BANDO=6991, SECTION_CHUYEN=7820, SECTION_ALBUM=9416, SECTION_KYTEN=10858, SECTION_XACNHAN=11872, SECTION_LOICHUC=12760, SECTION_QR=13913, SECTION_KET=14712. Trang cao ~15676px.
- Lưu ý: #SECTION_BANDO có iframe Google Maps (Nhà hàng Hương Xưa, 68 Đồng Khởi) — lúc quay chặn mạng nên khung bản đồ vỡ (như các mẫu trước, ~2s); tên + địa chỉ nhà hàng vẫn hiện phía trên khung nên vẫn giữ mục này với dwell ngắn 2000ms. Đếm ngược (radio) chạy đúng tới 27.12.2026 18:00. Bỏ qua SECTION_HAIHO, SECTION_LICH, SECTION_KYTEN, SECTION_XACNHAN, SECTION_LOICHUC, SECTION_QR trong timeline (trang dài, chỉ lấy điểm nhấn).
- Điểm nhấn trong video: bìa tờ báo "Nhật Báo Tình Yêu" + nút Đọc tin vui → báo hỷ/lời mời → rạp hạnh phúc → radio đếm ngược → trình tự buổi tiệc → bản đồ → chuyện tình phố cũ → album phim → kết.
- Thời lượng dự kiến: ~29,5 giây.

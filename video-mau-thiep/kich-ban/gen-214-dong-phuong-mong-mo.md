# Kịch bản quay — gen_214 Thiệp Cưới Đông Phương Mộng Mơ (Minh Khang & Thuỳ Linh)

- Mẫu: "Thiệp Cưới Đông Phương Mộng Mơ — Việt Phục" (folder gen_214_dong-phuong-mong-mo, file index.html; Lễ Vu Quy CN 14.06.2026 09:00 tư gia nhà gái, Tiệc Cưới CN 15.06.2026 17:30 Nhà hàng Tiệc Cưới ABC). Tông Đông Phương: sen vàng, áo dài Việt phục, font Great Vibes + Playfair Display + Be Vietnam Pro (đã có trong font-cache).
- Cách mở thiệp: bìa phong bì `#envelope` (ảnh trăng tròn + sen), nút "Chạm sen khai thiệp" `.btn-lotus-wrap` (onclick openInvitation) — bấm là mở cuộn 2 cánh + bật nhạc. Lưu ý: bấm thẳng `#envelope` KHÔNG mở được, phải bấm `.btn-lotus-wrap`.
- Nhạc nền của thiệp: `products/shared/music/wedding/A Thousand Years.mp3` (dài 285 giây, đủ video).
- Nền sân khấu: nen/dinh-lang-sen-som.jpg (MỚI gen đêm 11/11: sân đình làng cổ buổi sớm, mái ngói cong 2 góc trên + ao sen hồng góc dưới-trái, sương nhẹ, giữa trống êm). Dấu templexa.vn: phai-duoi (vùng sân đất góc dưới-phải, chữ trắng nổi).
- Bản đồ vị trí (đo thật ở bề rộng 414px sau khi bấm mở thiệp): #hero=0 (cao 800 = đúng 1 màn hình), #family=800, #couple=1167, #events=1705, #gallery=2423, #closing=3208. Trang cao ~3943px. Không có đếm ngược, không có iframe bản đồ (nút "Xem Bản Đồ" chỉ là link).
- Lưu ý: các mục dùng `.reveal` + IntersectionObserver (threshold 0.12) — cuộn tới là hiện. Bìa hero đúng 1 màn hình nên đoạn mở cần sleep đủ 3,5s cho cuộn 2 cánh trượt hết + hero hiện rõ.
- Điểm nhấn trong video: bìa sen "Chạm sen khai thiệp" → phụ huynh 2 bên → cô dâu chú rể + câu quote → 2 lễ Vu Quy/Tiệc Cưới → album → lời cảm ơn → kết.
- Thời lượng dự kiến: ~27,5 giây.

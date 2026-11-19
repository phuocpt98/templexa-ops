# gen-323-do-song-hy-truyen-thong — bản quay CHẬM (auto-scroll liên tục) + quy trình mới

Thiệp: gen_323 Thiệp Cưới Đỏ Song Hỷ Truyền Thống — Minh Khôi & Bảo Châu,
tiệc 27/12/2026 11:00. Tông đỏ — vàng kim, rồng phượng trên cửa, chữ Hỷ,
đồng xu may mắn QR. Có lời ngỏ, hai bên gia đình, thư mời, câu chuyện tình
yêu (timeline), nghi lễ, lịch cưới, đếm ngược, bản đồ, album, khung ký tên,
xác nhận tham dự, lời chúc, hộp mừng cưới QR và lời cảm ơn. Mở bằng nút
`#w23NutMo` ("Mở thiệp", cửa 2 cánh `#w23Cua`).

- Bản đồ vị trí (đo ở bề rộng điện thoại 414px, sau khi mở thiệp): trang cao
  10881px, cuộn tối đa 9981px. Đầu thiệp 0 → Hai Bên Gia Đình 1128 → Thư
  Mời 1929 → Nghi Lễ 2898 → Lịch Cưới 3575 → Đếm Ngược 4144 → Câu Chuyện
  4674 → Bản Đồ 5260 → Album 5918 → Ký Tên 6606 → Xác Nhận 7565 → Lời
  Chúc 8528 → Mừng Cưới QR 9435 → Cảm Ơn 10085.
- Mở thiệp, dừng 6 giây ngắm ảnh hero (cửa mở ~2,25s như họ thiệp W23 —
  khung hero chụp ở giữa đoạn dừng nên phải đợi đủ), rồi MỘT đoạn cuộn duy
  nhất `"cham": true` dài 50 giây từ đầu tới `#SECTION_KET` — không nhảy
  từng mục, không dừng giữa chừng.
- Kết: GIỮ NGUYÊN ở cuối thiệp (mục Cảm Ơn), màn kết TEMPLEXA + templexa.vn
  (chữ to) mờ dần đè lên rồi hết video.
- Nhạc thương hiệu: `"nhacVideo": "Beautiful In White"`, `"nhacTu": 85` —
  phát từ điệp khúc (xoay vòng: đêm 18/11 cưới dùng Lễ Đường, 17/11
  A Thousand Years, 16/11 Một Đời, 14/11 Perfect; Beautiful In White lần
  cuối đêm 13/11 gen_221).
- Ảnh bìa hero: quay.js tự chụp khung hero + chữ TEMPLEXA to →
  `video/gen-323-do-song-hy-truyen-thong-cover.jpg`, chèn 1 giây đầu video
  mờ dần.
- Nền sân khấu MỚI gen đêm 19/11: `nen/phong-do-song-hy.jpg` (phòng tiệc
  đỏ truyền thống, rèm lụa đỏ 2 bên, đèn lồng đỏ 2 góc trên, mẫu đơn đỏ +
  vàng kim 2 góc dưới, giữa trống êm). Dấu templexa.vn ở `giua-duoi`
  (giữa-dưới: tường kem trơn, 2 góc dưới đều bận hoa).
- Tổng ~62,5 giây (1 giây đầu là ảnh bìa mờ dần đè lên timeline).
- Font thiệp tự host trong `assets/fonts/` (Playfair Display / Cormorant
  Garamond / Great Vibes + Noto Serif TC cho chữ 囍) nên không cần
  font-cache. Nhạc riêng của mẫu: `music/wedding/Vay Cuoi.mp3` (chỉ tham
  chiếu — video dùng nhạc thương hiệu).
- Đếm ngược chạy đúng tới 27/12/2026 11:00 (38 ngày lúc quay).
- Lượt quay: đêm 19/11 quay --hd 2, đủ 1845 khung (61,5s), không lỗi đoạn
  nào sau lần thử lại đoạn 0s (lỗi chụp 1 lần rồi tự quay tiếp); 1200–
  1936 ms/khung. Video 1080×1920 30fps, ~9,7 Mbps, 76,2 MB; nhạc
  Beautiful In White từ 85s (3–9s mean −22,2 dB, cuối −21,5 dB, fade rõ);
  ảnh bìa hero + 1s đầu; kiểm khung 0/5/12/25/40/55/60s đều nét, đúng mục,
  dấu TV chuẩn (Great Vibes: Minh Khôi, Bảo Châu; lịch cưới tháng 12/2026;
  màn kết TEMPLEXA đè lên mục Cảm Ơn).
- LƯU Ý: cửa mẫu này mở CHẬM (~8s mới mở hẳn: khung 5s còn đóng, 8s đang
  mở, 12s mở hẳn) nên ảnh bìa chụp ở 5,5s hiện tranh rồng phượng + "LỄ
  THÀNH HÔN" lúc cửa còn đóng — vẫn đẹp, đúng visual đặc trưng của mẫu,
  nhưng lần sau mẫu cửa mở chậm nên tăng sleep sau click lên 9–10s để ảnh
  bìa bắt đúng hero đã mở.

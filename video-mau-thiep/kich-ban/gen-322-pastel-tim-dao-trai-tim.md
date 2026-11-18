# gen-322-pastel-tim-dao-trai-tim — bản quay CHẬM (auto-scroll liên tục) + quy trình mới

Thiệp: gen_322 Thiệp Cưới Pastel Tím Đào — Ảnh Trái Tim, Bướm Bay — Minh
Nguyệt & Hoàng Long, Lễ Thành Hôn 20.12.2026 10:00. Tông pastel tím–đào,
ảnh trái tim, bướm bay, đĩa nhạc xoay. Mẫu LadiPage: mở bằng nút `#btn68`
"ẤN MỞ THIỆP" (sec5, cửa mở 2s + hiệu ứng bướm 13s), rồi các mục: Save
The Date + lịch tháng 12 (sec3), Cô Dâu/Chú Rể + đĩa nhạc (sec4), thư
mời (sec6, có bản đồ Google Maps + nút "Xem bản đồ"/"ẩn bản đồ"), đếm
ngược (sec7), ký tên (sec8), album (sec9), RSVP (sec10), lời nhắn
(sec11), QR mừng cưới (sec12), Thank You (sec13). Nội dung demo của mẫu
lẫn vài ngày/địa điểm khác nhau (hero 20.12, thư mời ghi 18.09.2026, đếm
ngược tới 20.12.2026 10:00) — giữ nguyên như mẫu, đếm ngược chạy đúng
tới 20.12.2026 (hiện 32 ngày 08 giờ lúc đo).

- Bản đồ vị trí (đo ở bề rộng điện thoại 414px, sau khi mở thiệp): trang
  cao 12883px, cuộn tối đa 12008px. Hero sec2 0 → Save The Date sec3 970
  → Cô Dâu/Chú Rể sec4 2294 → thẻ mở sec5 3700 → thư mời + bản đồ sec6
  4796 → đếm ngược sec7 6457 → ký tên sec8 7026 → album sec9 7932 →
  RSVP sec10 9852 → lời nhắn sec11 10749 → QR sec12 11775 → Thank You
  sec13 12197. sec1/sec14 ẩn sẵn.
- Mở thiệp, dừng 9 giây ngắm ảnh hero (cửa mở 2s, hiệu ứng vào hero dài
  nhất flipInY 6s — khung hero chụp ở giữa đoạn dừng, ~4,5s sau click),
  rồi MỘT đoạn cuộn duy nhất `"cham": true` dài 60 giây từ đầu tới
  `#sec13` — trang dài 12883px nên 60s vẫn nhanh hơn nhịp chuẩn
  (~203px/giây), nhưng dài hơn nữa thì video vượt 80 giây / 100 MB.
- Kết: GIỮ NGUYÊN ở cuối thiệp (mục Thank You), màn kết TEMPLEXA +
  templexa.vn (chữ to) mờ dần đè lên rồi hết video.
- Nhạc thương hiệu: `"nhacVideo": "Lễ Đường"`, `"nhacTu": 50` — phát từ
  điệp khúc (xoay vòng: đêm 17/11 cưới dùng A Thousand Years, 16/11 Một
  Đời; nhạc riêng của mẫu là file nhac-nen.mp3 local, chỉ còn là tham
  chiếu trong kịch bản).
- Ảnh bìa hero: quay.js tự chụp khung hero + chữ TEMPLEXA to →
  `video/gen-322-pastel-tim-dao-trai-tim-cover.jpg`, chèn 1 giây đầu video
  mờ dần.
- Nền sân khấu MỚI gen đêm 18/11: `nen/vuon-tim-dao-buom-bay.jpg` (vườn
  hoa tím đào pastel buổi sáng, hồng đào + lavender ôm 2 bên và 2 góc
  dưới, bướm bay, giữa trống êm). Dấu templexa.vn ở `giua-duoi` (giữa
  dưới: nền ở đó nhạt, chữ trắng + bóng đọc được).
- Font: mẫu tự host toàn bộ font trong thư mục `fonts/` của nó (không
  gọi Google Fonts) nên không phụ thuộc font-cache.
- Lưu ý: khung bản đồ Google Maps ở sec6 lúc quay được thay bằng ảnh đại
  diện cố định (quay.js trả vendor/map-placeholder.jpg); tên + địa chỉ
  vẫn hiện quanh khung. Thiệp có `<audio preload="auto">` (nhac-nen.mp3)
  nhưng quay.js đã dùng domcontentloaded + vòng poll nên không kẹt
  networkidle0 (bài học gen_182).
- Tổng ~74,5 giây (1 giây đầu là ảnh bìa mờ dần đè lên timeline).
- Lượt quay: đêm 18/11 quay --hd 2, đủ 2235 khung, 74,5s, 91,5 MB,
  ~9,7 Mbps; máy khởi động lại giữa chừng ở 1800/2235 (SIGTERM) — chạy
  lại đúng lệnh cũ nối tiếp xong; đoạn 60s lỗi chụp 2 lần (screenshot
  timeout / target closed) rồi tự quay tiếp xong; nhạc Lễ Đường từ 50s
  (3–9s −18,7 dB); đếm ngược chạy đúng tới 20.12.2026 10:00 (hiện 32
  ngày 08 giờ lúc quay); khung bản đồ ở sec6 hiện ảnh đại diện cố định;
  kiểm khung 0/12/25/40/55/70/73s đều nét, đúng mục, dấu TV chuẩn
  (khung 25s có một ô ảnh sec4 đang mờ dần vào — thoáng qua lúc cuộn,
  không phải lỗi); ảnh bìa hero chụp đúng ảnh cưới vòm lá + chữ
  TEMPLEXA; Drive đã mở công khai anyone-with-link 18/11.

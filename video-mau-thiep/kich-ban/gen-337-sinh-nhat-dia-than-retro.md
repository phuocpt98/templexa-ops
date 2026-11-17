# gen-337-sinh-nhat-dia-than-retro — bản quay CHẬM (auto-scroll liên tục) + quy trình mới

Thiệp: gen_337 Thiệp Sinh Nhật 30 — Đĩa Than Retro — Hoàng Long tròn 30
tuổi, tiệc 18:30 Thứ Bảy 19/12/2026 tại Quán Đĩa Than 1979 — Tầng thượng,
46 Hàng Bông, Hoàn Kiếm, Hà Nội. Tông cam – vàng – nâu retro thập niên 70,
tia nắng, đĩa than xoay. Có cửa bìa đĩa than ("Bạn có một lời mời đặc
biệt"), nút play "Mở thiệp" mở 2,9s, phần đầu Happy Birthday, thư mời,
dress code retro 70s–80s, đếm ngược, bản đồ, album, hồi âm (vé vào cửa),
lời chúc, cảm ơn. Mở bằng nút `#dtNutMo` (class Btn_opencard +
Btn_openMusic: vừa mở thiệp vừa phát nhạc).

- Bản đồ vị trí (đo ở bề rộng điện thoại 414px, sau khi mở thiệp): trang
  cao 5972px, cuộn tối đa ~5076px. Phần Đầu 0 → Thư Mời 955 → Đếm Ngược
  1996 → Địa Điểm 2653 → Xác Nhận 3441 → Lời Chúc 4197 → Cảm Ơn 5194.
  Mục Album `#SECTION_ALBUM` ẨN sẵn trong mẫu (class tmx-an,
  display:none — gallery V2 render rỗng) nên không có trong đoạn cuộn,
  giống gen_330.
- Mở thiệp, dừng 6,5 giây ngắm ảnh hero (cửa mở 2,9s mới hết hẳn — khung
  hero chụp ở giữa đoạn dừng nên phải đợi đủ), rồi MỘT đoạn cuộn duy nhất
  `"cham": true` dài 45 giây từ đầu tới `#SECTION_KET` — không nhảy từng
  mục, không dừng giữa chừng. Trang ngắn (5972px) nên 45s vẫn đủ chậm để
  đọc (~113px/giây).
- Kết: GIỮ NGUYÊN ở cuối thiệp (mục Cảm Ơn), màn kết TEMPLEXA + templexa.vn
  (chữ to) mờ dần đè lên rồi hết video.
- Nhạc thương hiệu: `"nhacVideo": "Nụ cười 18-20"`, `"nhacTu": 80` — phát
  từ điệp khúc (xoay vòng: đêm 16/11 sinh nhật dùng Khúc hát mừng sinh
  nhật remix, 15/11 Nụ cười 18-20 cho gen_334; nhạc riêng của mẫu này cũng
  là Khúc hát mừng sinh nhật remix nên đổi bài cho khỏi lặp).
- Ảnh bìa hero: quay.js tự chụp khung hero + chữ TEMPLEXA to →
  `video/gen-337-sinh-nhat-dia-than-retro-cover.jpg`, chèn 1 giây đầu video
  mờ dần.
- Nền sân khấu MỚI gen đêm 17/11: `nen/phong-retro-dia-than.jpg` (phòng
  retro 70s, tường kem trơn ở giữa, cửa sổ gỗ + tia nắng cam góc trên-phải,
  mâm đĩa than + chồng đĩa vinyl góc dưới-phải, sofa da góc dưới-trái, giữa
  trống êm). Dấu templexa.vn ở `trai-duoi` (góc dưới-trái: sofa da nâu đậm,
  đủ tối cho chữ trắng).
- Lưu ý: đếm ngược chạy đúng tới 19/12/2026 18:30 (còn ~32 ngày lúc quay);
  khung bản đồ Google Maps lúc quay được thay bằng ảnh đại diện cố định
  (quay.js trả vendor/map-placeholder.jpg); tên + địa chỉ Quán Đĩa Than
  1979 vẫn hiện phía trên khung.
- Tổng ~58 giây (1 giây đầu là ảnh bìa mờ dần đè lên timeline).
- Lượt quay: đêm 17/11 quay --hd 2, đủ 1710 khung, không lỗi đoạn nào
  (946–1233 ms/khung); ảnh hero chụp ở 5,7s.
- Lượt HD 2 (17/11): 57,0s, 69,9 MB, 1080×1920 30fps, ~9,8 Mbps; nhạc
  Nụ cười 18-20 từ 80s (3–9s mean −21,8 dB); đếm ngược chạy đúng tới
  19/12/2026 18:30 (hiện 32 ngày 22 giờ lúc quay); khung bản đồ hiện ảnh
  đại diện cố định, tên + địa chỉ Quán Đĩa Than 1979 vẫn hiện phía trên
  khung; kiểm khung 0/10/25/40/50/56s đều nét, đúng mục, dấu TV chuẩn
  (Fraunces: Hoàng Long, Sắp Bật Nhạc Rồi!; Lobster: Cảm ơn bạn!); màn kết
  TEMPLEXA đè lên mục Cảm Ơn.

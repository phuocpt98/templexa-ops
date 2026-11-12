# gen-331-thoi-noi-do-choi-sac-mau — bản quay CHẬM (auto-scroll liên tục) + quy trình mới

Thiệp: gen_331 Thôi Nôi Đồ Chơi Sắc Màu — Bé Minh Khôi tròn 1 tuổi, tiệc
20/12/2026 11:00 (nhằm 11/11 Bính Ngọ), Nhà hàng Hoa Sen, Số 12 Nguyễn Huệ,
Quận 1, TP.HCM. Chủ đề đồ chơi sắc màu tông vàng: chong chóng, tháp vòng, khối
gỗ, bóng; có trò chơi bốc đồ đoán bé chọn món gì, hành trình 12 tháng yêu
thương, đếm ngược, bản đồ, album, hồi âm người lớn – trẻ em, sổ lời chúc, hộp
quà mừng bé QR. Mở bằng cửa `#tnCua`, nút `#tnNutMo`.

- Bản đồ vị trí (đo ở bề rộng điện thoại 414px, sau khi mở thiệp): trang cao
  8509px, cuộn tối đa 7609px. Cửa 0 → Lời Mời 657 → Về Bé 1518 → Hành Trình
  12 Tháng 2266 → Bốc Đồ 3376 → Đếm Ngược 4024 → Bản Đồ 4482 → Album (ẩn, cao
  0px) → Xác Nhận 5113 → Lời Chúc 5793 → QR 7098 → Cảm Ơn 7829.
- Mở thiệp, dừng 6 giây ngắm ảnh hero (cửa mở sau 2,7s mới hết hẳn — khung hero
  chụp ở giữa đoạn dừng nên phải đợi đủ), rồi MỘT đoạn cuộn duy nhất `"cham":
  true` dài 55 giây từ đầu tới `#SECTION_KET` — không nhảy từng mục, không
  dừng giữa chừng.
- Kết: GIỮ NGUYÊN ở cuối thiệp (mục Cảm Ơn), màn kết TEMPLEXA + templexa.vn
  (chữ to) mờ dần đè lên rồi hết video.
- Nhạc thương hiệu: `"nhacVideo": "Khúc hát mừng sinh nhật (remix)"`,
  `"nhacTu": 15` — phát từ điệp khúc (trùng nhạc gốc của thiệp, nhưng đây là bài
  brand rotation đêm nay; "Nụ cười 18-20" đã dùng đêm 12/11 cho gen_332).
- Ảnh bìa hero: quay.js tự chụp khung hero + chữ TEMPLEXA to →
  `video/gen-331-thoi-noi-do-choi-sac-mau-cover.jpg`, chèn 1 giây đầu video mờ dần.
- Nền sân khấu MỚI gen đêm 13/11: `nen/phong-choi-do-choi-vang.jpg` (phòng chơi
  tông vàng ấm, chong chóng + xe gỗ + khối gỗ góc dưới-trái, tháp vòng + bóng +
  thỏ bông góc dưới-phải, giữa trống êm). Dấu templexa.vn ở `phai-tren` (tường
  vàng trơn góc trên-phải).
- Tổng ~67,5 giây (1 giây đầu là ảnh bìa mờ dần đè lên timeline).
- Lưu ý: đếm ngược chạy đúng tới 20/12/2026 11:00. Khung bản đồ Google Maps
  (Nhà hàng Hoa Sen) → quay.js trả ảnh bản đồ đại diện cố định, tên + địa chỉ
  vẫn hiện phía dưới khung. Font tự host trong thiệp (Baloo 2 / Quicksand /
  Dancing Script ở assets/fonts) nên không cần font-cache. Mục Bốc Đồ chỉ lướt
  qua trong đoạn cuộn, không bấm chơi.
- Lượt HD: quay --hd 2, đủ 1995 khung (66,5s); máy khởi động lại giữa chừng ở
  khung ~1405/1995 (đoạn 45–50s đang quay dở) — chạy lại đúng lệnh cũ nối tiếp
  từ 1350/1995, không mất đoạn nào; nhạc Khúc hát mừng sinh nhật remix từ 15s
  (3–8s mean −18,1 dB, fade cuối rõ); kiểm khung 3/15/30/41/45/55/65s đều nét,
  đúng mục, dấu TV chuẩn; khung bản đồ hiện ảnh đại diện cố định có ghim đỏ,
  tên + địa chỉ Nhà hàng Hoa Sen vẫn hiện phía dưới khung; màn kết đè lên mục
  Cảm Ơn.

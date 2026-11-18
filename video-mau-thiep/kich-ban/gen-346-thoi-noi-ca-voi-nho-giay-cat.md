# gen-346-thoi-noi-ca-voi-nho-giay-cat — bản quay CHẬM (auto-scroll liên tục) + quy trình mới

Thiệp: gen_346 Thôi Nôi Bé Dương — Chuyến Xe Đi Tìm Đại Dương (Cá Voi
Nhỏ) — bé Chu Thiên Dương tròn 1 tuổi, tiệc 11:00 Chủ nhật 06/12/2026
tại Nhà hàng Hoa Sữa, 25 Đường Hoa Sữa, Ba Đình, Hà Nội. Tông xanh
dương–teal giấy cắt: phong bì cá voi, bìa hero thủy thủ + cá voi giấy,
hành trình xe chạy đi tìm đại dương (4 chặng, cuộn để xe chạy), cột mốc
1 năm của bé, lưới 12 ảnh, tiệc + đếm ngược, RSVP, lời kết "Hẹn gặp cả
nhà nhé!". Mở bằng nút `#openBtn` trên phong bì `#envelope` (mờ dần
0,6s rồi ẩn hẳn).

- Bản đồ vị trí (đo ở bề rộng điện thoại 414px, sau khi mở thiệp): trang
  cao 8193px, cuộn tối đa 7318px. Bìa hero 0 → Hành trình `#journey` 630
  (cao 430vh, sticky — xe chạy dọc đường theo vị trí cuộn, 4 chặng hiện
  lần lượt) → Cột mốc + lưới ảnh `#cot-moc` 4393 → Tiệc `#tiec` 5838 →
  RSVP `#rsvp` 6675 → Lời kết `#loi-ket` 7501.
- Mở thiệp, dừng 6,5 giây ngắm ảnh hero (phong bì mờ hết sau 0,7s; khung
  hero chụp ở giữa đoạn dừng, ~3,25s sau click), rồi MỘT đoạn cuộn duy
  nhất `"cham": true` dài 55 giây từ đầu tới `#loi-ket` — không nhảy
  từng mục, không dừng giữa chừng (~136px/giây, đủ chậm để đọc; đoạn
  hành trình sticky tự chạy xe theo cuộn).
- Kết: GIỮ NGUYÊN ở cuối thiệp (mục Lời kết), màn kết TEMPLEXA +
  templexa.vn (chữ to) mờ dần đè lên rồi hết video.
- Nhạc thương hiệu: `"nhacVideo": "Khúc hát mừng sinh nhật remix"`,
  `"nhacTu": 15` — phát từ điệp khúc (xoay vòng: đêm 17/11 sinh nhật
  dùng Nụ cười 18-20, 16/11 Khúc hát mừng sinh nhật remix cho gen_313).
  Thiệp không có file nhạc riêng (âm thanh sóng + piano là Web Audio,
  mặc định tắt) nên kịch bản không ghi `"nhac"`.
- Ảnh bìa hero: quay.js tự chụp khung hero + chữ TEMPLEXA to →
  `video/gen-346-thoi-noi-ca-voi-nho-giay-cat-cover.jpg`, chèn 1 giây đầu
  video mờ dần.
- Nền sân khấu MỚI gen đêm 18/11: `nen/dai-duong-ca-voi-giay-cat.jpg`
  (đại dương giấy cắt xanh dương pastel, cá voi giấy góc trên-trái, mây
  giấy + chim, sóng giấy ở dưới, giữa trống êm). Dấu templexa.vn ở
  `giua-duoi` (giữa dưới: trên sóng giấy xanh nhạt, chữ trắng + bóng đọc
  được).
- Font: Baloo 2 + Mali qua Google Fonts — file CSS đã có trong
  font-cache (b245765c781a647e.css); đã kiểm tra đủ subset vietnamese,
  đồng thời tải bổ sung 5 file woff2 còn thiếu (devanagari/thai) vào
  font-cache đêm 18/11. Patrick Hand tự host trong thiệp.
- Lưu ý: thiệp KHÔNG có iframe bản đồ (chỉ nút link "Chỉ đường" ra
  Google Maps) nên không lo khung vỡ. Lưới 12 ảnh của bé là ảnh giữ chỗ
  demo ("Ảnh 1"–"Ảnh 12", có fallback assets/photo-be.jpg) — đó là trạng
  thái mẫu gốc, giữ nguyên. Đếm ngược chạy đúng tới 06/12/2026 11:00
  (hiện 18 ngày 09 giờ lúc đo).
- Tổng ~67 giây (1 giây đầu là ảnh bìa mờ dần đè lên timeline).
- Lượt quay: đêm 18/11 quay --hd 2, đủ 2010 khung, 67,0s, 80,5 MB,
  ~9,4 Mbps, không lỗi đoạn nào (995–1118 ms/khung); ảnh hero chụp ở
  5,7s; nhạc Khúc hát mừng sinh nhật remix từ 15s (3–9s −18,0 dB); đếm
  ngược chạy đúng tới 06/12/2026 11:00 (hiện 18 ngày 09 giờ lúc quay);
  hành trình sticky chạy xe đúng 4 chặng theo cuộn; kiểm khung
  0/10/25/40/55/65s đều nét, đúng mục, dấu TV chuẩn (Baloo 2/Mali);
  màn kết TEMPLEXA đè lên mục Lời kết; Drive đã mở công khai
  anyone-with-link 18/11.

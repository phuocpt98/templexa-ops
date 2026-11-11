# gen-332-thoi-noi-rung-xanh-thu-nho — bản quay CHẬM (auto-scroll liên tục) + quy trình mới

Thiệp: gen_332 Thôi Nôi Rừng Xanh Thú Nhỏ (bé Bảo Ngọc tròn 1 tuổi, tiệc
11:00 Chủ Nhật 20/12/2026). Mở bằng cánh cửa rừng `#tnCua`, nút `#tnNutMo`
("Mở thiệp"). Các mục: lời mời → về bé → hành trình → lễ bốc đồ → đếm ngược →
bản đồ → album (ẩn) → hồi âm → lời chúc → QR mừng → cảm ơn.

- Bản đồ vị trí (đo ở bề rộng điện thoại 414px, sau khi mở thiệp): trang cao
  8177px, cuộn tối đa 7281px. SECTION_DAU 0 → SECTION_MOI 657 → SECTION_VEBE
  1518 → SECTION_HANHTRINH 2266 → SECTION_BOCDO 3376 → SECTION_DEMNGUOC 4004 →
  SECTION_BANDO 4462 → SECTION_XACNHAN 5094 → SECTION_LOICHUC 5774 →
  SECTION_QR 6766 → SECTION_KET 7497.
- Mở thiệp, dừng 6 giây ngắm ảnh hero (cửa mở mất 2,7s mới xong hẳn — khung hero
  chụp ở giữa đoạn dừng nên phải đợi đủ), rồi MỘT đoạn cuộn duy nhất `"cham": true`
  dài 55 giây từ đầu tới `#SECTION_KET` — không nhảy từng mục, không dừng giữa chừng.
- Kết: GIỮ NGUYÊN ở cuối thiệp (mục Cảm Ơn), màn kết TEMPLEXA + templexa.vn
  (chữ to) mờ dần đè lên rồi hết video.
- Nhạc thương hiệu: `"nhacVideo": "Nụ cười 18-20"`, `"nhacTu": 80` — phát từ
  điệp khúc thay cho nhạc của thiệp (Happy Birthday EN).
- Ảnh bìa hero: quay.js tự chụp khung hero + chữ TEMPLEXA to → `video/gen-332-thoi-noi-rung-xanh-thu-nho-cover.jpg`,
  chèn 1 giây đầu video mờ dần.
- Nền sân khấu: `nen/la-xanh-tropical.jpg` (lá nhiệt đới xanh — hợp chủ đề rừng
  xanh; lần dùng gần nhất 27/10 gen_335). Dấu templexa.vn ở `giua-duoi`.
- Tổng 66,5 giây (1 giây đầu là ảnh bìa mờ dần đè lên timeline). File 81,9 MB ở ~9,7 Mbps,
  vừa giới hạn 100 MB của Instagram/Threads.
- Lưu ý: khung bản đồ Google Maps ở SECTION_BANDO lúc quay hiện ảnh đại diện cố
  định (quay.js trả vendor/map-placeholder.jpg) — tên + địa chỉ vẫn hiện ngoài khung.
  Đếm ngược chạy đúng tới 20/12/2026.

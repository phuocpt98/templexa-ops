# gen-328-truc-dao-xanh-reu — bản quay CHẬM (auto-scroll liên tục) + quy trình mới

Thiệp: gen_328 Thiệp Cưới Trúc Đào — Xanh Rêu Ấn Son — Quang Huy & Bảo
Ngọc, tiệc 20/12/2026 11:00 (âm lịch tháng 11 Bính Ngọ). Tông xanh rêu lá
trúc, hoa đào: ấn son mở cánh cửa 2 cánh để mở thiệp. Có lời ngỏ, hai bên gia
đình, thư mời, chuyện tình Trúc Đào, nghi lễ, lịch cưới, đếm ngược, lịch
trình, bản đồ, album ảnh, khung trúc ký tên, xác nhận tham dự, lời chúc, bao
lì xì mừng cưới QR và lời cảm ơn. Mở bằng nút `#dkNutMo` ("Mở thiệp", cửa mở
1,8s + trễ 0,45s ≈ 2,25s mới hết hẳn).

- Bản đồ vị trí (đo ở bề rộng điện thoại 414px, sau khi mở thiệp): trang cao
  14344px, cuộn tối đa 13444px. Đầu thiệp 0 → Lời Ngỏ 934 → Hai Bên Gia Đình
  1778 → Thư Mời 2622 → Chuyện Tình 3784 (dài 2247px) → Nghi Lễ 6064 → Lịch
  Cưới 6832 → Đếm Ngược 7529 → Lịch Trình 8031 → Bản Đồ 8629 → Album 9247 →
  Ký Tên 9951 → Xác Nhận 10938 → Lời Chúc 12008 → Mừng Cưới QR 13017 → Cảm
  Ơn 13744.
- Mở thiệp, dừng 6 giây ngắm ảnh hero (cửa mở ~2,25s mới hết hẳn — khung
  hero chụp ở giữa đoạn dừng nên phải đợi đủ), rồi MỘT đoạn cuộn duy nhất
  `"cham": true` dài 55 giây từ đầu tới `#SECTION_KET` — không nhảy từng mục,
  không dừng giữa chừng.
- Kết: GIỮ NGUYÊN ở cuối thiệp (mục Cảm Ơn), màn kết TEMPLEXA + templexa.vn
  (chữ to) mờ dần đè lên rồi hết video.
- Nhạc thương hiệu: `"nhacVideo": "Một Đời"`, `"nhacTu": 70` — phát từ điệp
  khúc (xoay vòng: đêm 14/11 cưới dùng Perfect, 13/11 Beautiful In White,
  12/11 Lễ Đường; Một Đời lần cuối đêm 10/11 gen_327).
- Ảnh bìa hero: quay.js tự chụp khung hero + chữ TEMPLEXA to →
  `video/gen-328-truc-dao-xanh-reu-cover.jpg`, chèn 1 giây đầu video mờ dần.
- Nền sân khấu MỚI gen đêm 16/11: `nen/vuon-truc-xanh-reu.jpg` (vườn trúc
  xanh rêu buổi sớm, lá trúc + hoa đào hồng nhạt ôm 2 bên, sương nhẹ, lối đá
  rêu góc dưới, giữa trống êm). Dấu templexa.vn ở `phai-duoi` (góc dưới-phải:
  thân trúc + rêu, nền tối vừa đủ cho chữ trắng).
- Tổng ~67,5 giây (1 giây đầu là ảnh bìa mờ dần đè lên timeline).
- Lượt quay: đêm 16/11 quay --hd 2 lỗi chụp 3 lần ở đoạn 0s (capture timeout
  ở khung ~100) → lùi --hd 1.5 --lam-lai, quay được tới 1050/1995 thì đoạn
  35s lỗi chụp 3 lần (timeout, Target closed) → lùi --hd 1 --lam-lai, đủ
  1995 khung (66,5s), không lỗi đoạn nào (530–1558 ms/khung, đoạn cuối
  ~1,2–1,5s/khung). Giữa chừng máy khởi động lại 1 lần (19:02, SIGTERM) ở
  lượt 1.5x — chạy lại đúng lệnh cũ nối tiếp từ 450/1995.
- Lượt HD 1 (16/11): 66,5s, 83,5 MB, 1080×1920 30fps, ~9,9 Mbps; nhạc Một Đời
  từ 70s (3–9s mean −20,2 dB); đếm ngược hiện 34 ngày 15 giờ tới 20.12.2026
  11:00; bản đồ mẫu là nút "MỞ CỬA XEM BẢN ĐỒ" (không phải iframe nên không
  vỡ khung), địa chỉ Nhà hàng Đồng Khánh, 86 Nguyễn Sinh Cung, Huế; kiểm
  khung 0/10/25/40/44/55/65s đều nét, đúng mục, dấu TV chuẩn (Imperial
  Script: Bảo Ngọc, Nhằm ngày 11 tháng 11 năm Bính Ngọ); màn kết TEMPLEXA
  đè lên mục Cảm Ơn. Font tự host trong thiệp (Playfair Display / Imperial
  Script ở assets/fonts) nên không cần font-cache. Mục Ký Tên chỉ lướt qua
  trong đoạn cuộn, không bấm ký.

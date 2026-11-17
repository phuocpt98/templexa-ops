# gen-314-sage-viet-phuc — bản quay CHẬM (auto-scroll liên tục) + quy trình mới

Thiệp: gen_314 Thiệp Cưới Sage Việt Phục — Lưu Bút Ký Tên — Ngọc Đức &
Hồng Nhung, lễ thành hôn 09:10 Thứ Bảy 01/11/2025 (âm lịch 12/09 Ất Tỵ),
ảnh cưới Việt phục đỏ & váy trắng (Hương Ly Studio). Tông xanh sage, hoa
sen vàng. Có bìa ảnh cưới toàn màn hình, cô dâu chú rể, save the date +
thiệp mời 2 nhà (cơm thân mật 17:00 31/11/2025 — ngày 31/11 không có thật,
đó là chữ demo của mẫu), lịch lễ nạp tài 30/10 + thành hôn 01/11, đếm
ngược, lưu bút ký tên tay, album 20 ảnh, RSVP, lời chúc, hộp quà QR, bản
đồ, lời cảm ơn. KHÔNG có phong bì — thiệp mở sẵn ở bìa hero; nhạc bắt đầu
khi bấm nút nhạc `#g96` (hoặc bất kỳ cú bấm/chạm/cuộn đầu tiên nào).

- Bản đồ vị trí (đo ở bề rộng điện thoại 414px, sau khi bấm nút nhạc):
  trang cao 13287px, cuộn tối đa ~12400px. Bìa hero 0 → Cô Dâu Chú Rể 747
  → Thiệp Mời 2079 → Nhớ Ngày Đó 3465 → Lịch Lễ 3778 → Đếm Ngược 4788 →
  Lưu Bút 4998 → Album 5892 (dài 3638px) → RSVP 9531 → Lời Chúc 10404 →
  Quà Mừng 11048 → Bản Đồ 12129 → Cảm Ơn 12499.
- Bấm nút nhạc `#g96`, dừng 7 giây ngắm ảnh hero (tên cô dâu chú rể
  bounceIn 6s — khung hero chụp ở giữa đoạn dừng nên tên đã hiện gần đủ),
  rồi MỘT đoạn cuộn duy nhất `"cham": true` dài 55 giây từ đầu tới
  `#thanks` — không nhảy từng mục, không dừng giữa chừng.
- Kết: GIỮ NGUYÊN ở cuối thiệp (mục Cảm Ơn), màn kết TEMPLEXA + templexa.vn
  (chữ to) mờ dần đè lên rồi hết video.
- Nhạc thương hiệu: `"nhacVideo": "A Thousand Years"`, `"nhacTu": 55` —
  phát từ điệp khúc (xoay vòng: đêm 16/11 cưới dùng Một Đời, 14/11 Perfect,
  13/11 Beautiful In White, 12/11 Lễ Đường; A Thousand Years lần cuối đêm
  11/11 gen_214).
- Ảnh bìa hero: quay.js tự chụp khung hero + chữ TEMPLEXA to →
  `video/gen-314-sage-viet-phuc-cover.jpg`, chèn 1 giây đầu video mờ dần.
- Nền sân khấu MỚI gen đêm 17/11: `nen/san-vuon-sage-viet-phuc.jpg` (vườn
  sage buổi sớm, lá trúc ôm bên trái + sen hồng bên phải, sương nhẹ, lối đá
  rêu góc dưới-trái, giữa trống êm). Dấu templexa.vn ở `phai-duoi` (góc
  dưới-phải: lá sen xanh đậm, đủ tối cho chữ trắng).
- Lưu ý: đếm ngược hiện 00 vì lễ 01/11/2025 đã qua (chấp nhận theo quy
  ước); khung bản đồ Google Maps lúc quay được thay bằng ảnh đại diện cố
  định (quay.js trả vendor/map-placeholder.jpg); mục Lưu Bút chỉ lướt qua
  trong đoạn cuộn, không bấm ký tên.
- Tổng ~68,5 giây (1 giây đầu là ảnh bìa mờ dần đè lên timeline).
- Lượt quay: đêm 17/11 quay --hd 2 lỗi chụp 3 lần ở đoạn 60s (captureScreenshot
  timeout / Unable to capture screenshot) → lùi --hd 1.5 --lam-lai, quay tới
  600/2025 thì máy khởi động lại (SIGTERM) — chạy lại đúng lệnh --hd 1.5
  (KHÔNG --lam-lai) nối tiếp từ 600/2025, đủ 2025 khung, không lỗi đoạn nào
  (500–1032 ms/khung, đoạn cuối ~1s/khung).
- Lượt HD 1.5 (17/11): 67,5s, 86,4 MB, 1080×1920 30fps, ~10,1 Mbps; nhạc
  A Thousand Years từ 55s (3–9s mean −19,8 dB); đếm ngược hiện 00 vì lễ
  01/11/2025 đã qua; khung bản đồ hiện ảnh đại diện cố định, tên + địa chỉ
  vẫn hiện phía trên khung; kiểm khung 0/5/15/30/45/55/65s đều nét, đúng
  mục, dấu TV chuẩn (Dancing Script: Ngọc Đức, Hồng Nhung; Sriracha: Lưu
  Bút); màn kết TEMPLEXA đè lên mục Cảm Ơn.

# gen-218-silk-veil-ethereal — bản quay CHẬM (auto-scroll liên tục) + quy trình mới

Thiệp: gen_218 Thiệp Cưới Silk Veil — Ethereal Dreamy — Hoàng Minh & Thùy
Linh, Chủ Nhật 15/06/2026. Phong cách mơ màng ethereal: voan lụa, typography
mist reveal, sợi tơ lụa trôi, polaroid rải rác, palette lavender mist. Mở
bằng phong bì `#envelope` (bấm là mờ dần 1,8s, biến mất sau 2s, hero hiện
chữ mist reveal). Không có đếm ngược, không có bản đồ. Nhạc gốc của thiệp:
A Thousand Years — video dùng nhạc thương hiệu thay thế (xem dưới).

- Bản đồ vị trí (đo ở bề rộng điện thoại 414px, sau khi mở thiệp): trang cao
  6249px, cuộn tối đa 5449px. Hero 0 → Intro 825 → Ảnh đôi 1094 → Gia đình
  (#familyGrid) 1620 → Ảnh đơn 1804 → Timeline 2359 → Ảnh đôi 3540 → Thẻ sự
  kiện (#eventStack) 4066 → Dress code 4481 → Album polaroid (#galleryScatter)
  5073 → Cảm ơn (.closing) 5737.
- Mở thiệp, dừng 3,5 giây ngắm ảnh hero (phong bì mờ hết sau 2s, chữ hero
  mist reveal ~2s — khung hero chụp ở giữa đoạn dừng nên phải đợi đủ), rồi
  MỘT đoạn cuộn duy nhất `"cham": true` dài 45 giây từ đầu tới `.closing`
  (trang ngắn hơn gen_331 nên 45s thay vì 55s) — không nhảy từng mục, không
  dừng giữa chừng.
- Kết: GIỮ NGUYÊN ở cuối thiệp (mục Cảm Ơn), màn kết TEMPLEXA + templexa.vn
  (chữ to) mờ dần đè lên rồi hết video.
- Nhạc thương hiệu: `"nhacVideo": "Perfect"`, `"nhacTu": 35` — phát từ điệp
  khúc (bài Perfect chưa dùng trong các lô gần đây; đêm 13/11 cưới dùng
  Beautiful In White, đêm 12/11 dùng Lễ Đường). Font Cormorant Infant /
  Quicksand / Great Vibes đã có trong font-cache (css2 sha1 f851fc8da187a60b).
- Ảnh bìa hero: quay.js tự chụp khung hero + chữ TEMPLEXA to →
  `video/gen-218-silk-veil-ethereal-cover.jpg`, chèn 1 giây đầu video mờ dần.
- Nền sân khấu MỚI gen đêm 14/11: `nen/phong-lavender-mo-mang.jpg` (phòng
  voan lụa tím lavender mơ màng, rèm voan 2 bên, hồng trắng + lavender 2 góc
  dưới, giữa trống êm). Dấu templexa.vn ở `trai-tren` (tường voan trơn góc
  trên-trái).
- Tổng ~55 giây (1 giây đầu là ảnh bìa mờ dần đè lên timeline).
- Lưu ý: ngày cưới 15/06/2026 đã qua nhưng thiệp không có đếm ngược nên
  không hiện 00. Thiệp không có iframe bản đồ nên không lo khung vỡ.
- Lượt HD: quay --hd 2, đủ 1620 khung (54,0s), 66,8 MB, 1080×1920 30fps,
  ~9,7 Mbps; đoạn 50s lỗi chụp 2 lần (Target closed / Internal error) rồi tự
  quay tiếp xong, không mất khung nào; nhạc Perfect từ 35s (3–8s mean −19,4
  dB, fade cuối rõ); kiểm khung 0/3/10/20/30/40/50/53s đều nét, đúng mục,
  dấu TV chuẩn; màn kết đè lên mục Cảm Ơn + polaroid.

# gen-313-thoi-noi-thien-binh-bap-benh-tren-may — bản quay CHẬM (auto-scroll liên tục) + quy trình mới

Thiệp: gen_313 Thiệp Thôi Nôi Cung Thiên Bình — Bập Bênh Trên Mây — bé Bông
(Phạm Gia Bảo) tròn 1 tuổi, tiệc Chủ Nhật 03/10/2027 10:00–12:30, Nhà hàng Mây
Ngàn — 18 Nguyễn Văn Hưởng, Thảo Điền, TP. Thủ Đức. Bố Phạm Quốc Huy, mẹ Lê
Ngọc Trâm. Bấm "Thả tim" để mở (bập bênh trên mây ở bìa chỉ là hình bìa, biến
mất sau khi mở). Có đếm ngược bằng bóng bay, bảng cân đo một năm của bé
(3,1 kg → 9,6 kg, 50 cm → 76 cm, răng sữa, từ biết nói), những cánh diều của
Bông (3/6/9/12 tháng), lời mời của bố mẹ, trò chơi chiếc cân bốc đồ, thông
tin buổi tiệc + lịch 10/2027, album bong bóng, hồi âm và lời chúc. Mở bằng
nút `#openBtn` (bìa mờ dần ~1s rồi gỡ hẳn).

- Bản đồ vị trí (đo ở bề rộng điện thoại 414px, sau khi mở thiệp): trang cao
  7363px, cuộn tối đa 6463px. Hero 32 → Đếm Ngược 720 → Cân Đo Một Năm 1010
  → Cánh Diều 1810 → Lời Mời 2533 → Chiếc Cân Bốc Đồ 3076 (mục #items 3425)
  → Thông Tin Tiệc 3929 → Album Bong Bóng 5066 → Thổi Bong Bóng Chúc 5804 →
  Hồi Âm 5917 → Lời Chúc 6479 → Cảm Ơn 7191.
- Mở thiệp, dừng 6,5 giây ngắm ảnh hero (bấm mở lúc 2,5s → tim bay 0,7s →
  bìa mờ dần 0,8s từ ~4,5s, hết hẳn ~5,3s — khung hero chụp ở giữa đoạn dừng
  lúc 5,75s nên sạch), rồi MỘT đoạn cuộn duy nhất `"cham": true` dài
  45 giây từ đầu tới `#closingThanks` — không nhảy từng mục, không dừng giữa
  chừng. Trang ngắn (7363px) nên 45 giây đủ chậm để đọc.
- Kết: GIỮ NGUYÊN ở cuối thiệp (mục Cảm Ơn), màn kết TEMPLEXA + templexa.vn
  (chữ to) mờ dần đè lên rồi hết video.
- Nhạc thương hiệu: `"nhacVideo": "Khúc hát mừng sinh nhật (remix)"`,
  `"nhacTu": 15` — phát từ điệp khúc (xoay vòng: đêm 14/11 sự kiện dùng Nụ
  cười 18-20, đêm 13/11 dùng Khúc hát mừng sinh nhật remix).
- Ảnh bìa hero: quay.js tự chụp khung hero + chữ TEMPLEXA to →
  `video/gen-313-thoi-noi-thien-binh-bap-benh-tren-may-cover.jpg`, chèn 1 giây
  đầu video mờ dần.
- Nền sân khấu MỚI gen đêm 16/11: `nen/bau-troi-bap-benh-may.jpg` (bầu trời
  mây pastel hồng–tím buổi sớm, bập bênh gỗ trên mây góc dưới-trái, cán cân
  vàng góc trên-phải, sao giấy + khinh khí cầu nhỏ, giữa trống êm). Dấu
  templexa.vn ở `trai-tren` (góc trên-trái: trời mây trơn).
- Tổng ~58 giây (1 giây đầu là ảnh bìa mờ dần đè lên timeline).
- Lưu ý: đếm ngược chạy đúng tới 03/10/2027 10:00 (321 ngày lúc quay thử).
  Khung bản đồ Google Maps (Nhà hàng Mây Ngàn) → quay.js trả ảnh bản đồ đại
  diện cố định có ghim đỏ, tên + địa chỉ + nút Chỉ đường vẫn hiện đúng. Font
  Google (Itim / Nunito / Quicksand) đã có trong font-cache. Mục Chiếc Cân
  Bốc Đồ chỉ lướt qua trong đoạn cuộn, không bấm chơi.
- Lượt quay: đêm 16/11 quay --hd 2, đủ 1710 khung (57s), không lỗi đoạn nào
  (845–998 ms/khung). 57s, 70 MB, 1080×1920 30fps, ~9,7 Mbps; nhạc Khúc hát
  mừng sinh nhật remix từ 15s (3–9s mean −18,0 dB); đếm ngược hiện 321 ngày
  06 giờ tới 03.10.2027 10:00; kiểm khung 0/10/25/40/50/56s đều nét, đúng
  mục, dấu TV chuẩn; màn kết TEMPLEXA đè lên mục Cảm Ơn.
- LƯU Ý KỸ THUẬT (đêm 16/11): thiệp mở bằng animation WAAPI
  (`element.animate(...).onfinish`) — đồng hồ ảo của quay.js tua animation
  bằng pause + đặt currentTime nên `onfinish` không bao giờ chạy, bìa không
  mở (thử 8s: bìa đứng yên tới 7,5s). Đã vá ở tầng pipeline: `quay.js`
  `advance()` gọi `an.finish()` 1 lần khi animation chạm mốc kết thúc (đã
  kiểm chứng bằng test WAAPI riêng). Sau vá, thử lại 8s: bìa mờ dần xong lúc
  ~5,3s, hero sạch ở 7,5s, đếm ngược 321 ngày 08:32:50 đúng tới 03/10/2027.

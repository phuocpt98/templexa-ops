# gen-338-sinh-nhat-day-bien-be-tom — bản quay CHẬM (auto-scroll liên tục) + quy trình mới

Thiệp: gen_338 Thiệp Sinh Nhật Đáy Biển — Bé Tôm tròn 6 tuổi, tiệc
27/12/2026 09:30. Tông xanh dương pastel, tàu ngầm vàng, san hô, sao biển,
bong bóng. Có lời mời, đếm ngược, bản đồ, album, xác nhận tham dự (số người
đi cùng), lời chúc và lời cảm ơn. Mở bằng nút `#ddNutMo` ("Mở thiệp",
cửa `#ddCua`).

- Bản đồ vị trí (đo ở bề rộng điện thoại 414px, sau khi mở thiệp): trang cao
  7015px, cuộn tối đa 6115px. Đầu thiệp 0 → Thư Mời 1079 → Đếm Ngược 2172
  → Bản Đồ 2685 → Album 3461 → Xác Nhận 4195 → Lời Chúc 5164 → Cảm Ơn
  6167. Trang ngắn nên đoạn cuộn chậm 40 giây là đủ đọc.
- Mở thiệp, dừng 6,5 giây ngắm ảnh hero, rồi MỘT đoạn cuộn duy nhất
  `"cham": true` dài 40 giây từ đầu tới `#SECTION_KET` — không nhảy từng
  mục, không dừng giữa chừng.
- Kết: GIỮ NGUYÊN ở cuối thiệp (mục Cảm Ơn), màn kết TEMPLEXA + templexa.vn
  (chữ to) mờ dần đè lên rồi hết video.
- Nhạc thương hiệu: `"nhacVideo": "Nụ cười 18-20"`, `"nhacTu": 80` — phát
  từ điệp khúc (xoay vòng: đêm 18/11 bé dùng Khúc hát mừng sinh nhật remix,
  17/11 Nụ cười 18-20, 16/11 Khúc hát mừng sinh nhật remix).
- Ảnh bìa hero: quay.js tự chụp khung hero + chữ TEMPLEXA to →
  `video/gen-338-sinh-nhat-day-bien-be-tom-cover.jpg`, chèn 1 giây đầu
  video mờ dần.
- Nền sân khấu MỚI gen đêm 19/11: `nen/day-bien-tau-ngam.jpg` (đáy biển
  pastel xanh dương nhạt, tàu ngầm vàng góc trên-trái, san hô hồng + sao
  biển 2 góc dưới, tia nắng + bong bóng, giữa trống êm). Dấu templexa.vn ở
  `phai-tren` (góc trên-phải trống, tàu ngầm ở góc trên-trái).
- Tổng ~53 giây (1 giây đầu là ảnh bìa mờ dần đè lên timeline).
- Font thiệp tự host trong `assets/fonts/` (Baloo 2 / Nunito / Sriracha)
  nên không cần font-cache. Nhạc riêng của mẫu:
  `music/festive-holiday/happy-birthday-en.mp3` (chỉ tham chiếu — video
  dùng nhạc thương hiệu).
- Đếm ngược chạy đúng tới 27/12/2026 09:30 (38 ngày 13 giờ lúc quay).
- Lượt quay: đêm 19/11 quay --hd 2 lỗi chụp 3 lần ở đoạn 0s (captureScreenshot
  timeout, RAM còn ~384MB) → lùi --hd 1.5 --lam-lai, đủ 1560 khung (52s),
  không lỗi đoạn nào; 811–1628 ms/khung. Video 1080×1920 30fps, ~9,7 Mbps,
  64,2 MB; nhạc Nụ cười 18-20 từ 80s (3–9s mean −21,8 dB, cuối −22,6 dB,
  fade rõ); ảnh bìa hero + 1s đầu; kiểm khung 0/5/12/20/30/40/50s đều nét,
  đúng mục, dấu TV chuẩn (Baloo 2: Bé Tôm, Sắp Tới Giờ Lặn!; đếm ngược hiện
  38 ngày 13 giờ; khung bản đồ hiện ảnh đại diện cố định có ghim đỏ, tên +
  địa chỉ Nhà hàng Hải Âu Xanh vẫn hiện phía trên khung; màn kết TEMPLEXA
  đè lên mục Cảm Ơn).

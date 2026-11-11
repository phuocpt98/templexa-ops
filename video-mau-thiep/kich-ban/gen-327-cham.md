# gen-327-cham — bản quay CHẬM (auto-scroll liên tục) + quy trình mới

Thiệp: gen_327 Nhật Báo Tình Yêu (Thành Đạt & Ngọc Hân). Cùng thiệp, nền với
bản đã đăng 10/11 — đổi cách quay và nhạc: lướt chậm liên tục từ trên xuống dưới,
nhạc thương hiệu phát từ điệp khúc, ảnh bìa hero + 1 giây đầu.

- Mở thiệp, dừng 3,5 giây ngắm ảnh hero, rồi MỘT đoạn cuộn duy nhất `"cham": true`
  (quay.js: nội suy tuyến tính, tốc độ đều, không ease) dài 55 giây từ đầu tới mục Kết —
  không nhảy từng mục, không dừng giữa chừng. Mỗi khung chỉ nhích vài px, người xem
  kịp đọc theo từng chút một. Thiệp dài thì tăng ms cuộn theo chiều dài trang
  (55s với thiệp này vẫn hơi nhanh — user tạm chấp nhận 11/11).
- Kết: GIỮ NGUYÊN ở cuối thiệp (mục cảm ơn), KHÔNG cuộn ngược lên hero như kiểu cũ —
  màn kết TEMPLEXA + templexa.vn (chữ to) mờ dần đè lên khung cảm ơn rồi hết video.
  (Màn kết là lớp phủ cố định trong san-khau.html nên hiện được trên bất kỳ vị trí cuộn nào.)
- Nhạc thương hiệu: `"nhacVideo": "Một Đời"`, `"nhacTu": 70` — phát từ điệp khúc
  thay cho nhạc của thiệp (xem bảng mốc điệp khúc trong SKILL.md).
- Ảnh bìa hero: quay.js tự chụp khung hero + chữ TEMPLEXA to → `video/gen-327-cham-cover.jpg`,
  chèn 1 giây đầu video mờ dần.
- Tổng ~64 giây (bản cũ 29,5 giây). File ~70–80 MB ở 10 Mbps, vừa giới hạn 100 MB
  của Instagram/Threads.

Bản đầy đủ 64 giây đã quay xong 11/11, user xem: vẫn hơi nhanh vì thiệp dài quá —
TẠM CHẤP NHẬN, chưa chốt có đăng lại thay bản cũ đang chạy 1,9k view không.
File này giờ là kịch bản mẫu cho quy trình mới (áp từ lô đêm 12/11).

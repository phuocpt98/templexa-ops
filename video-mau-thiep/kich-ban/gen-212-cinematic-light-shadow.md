# gen-212-cinematic-light-shadow — bản quay CHẬM (auto-scroll liên tục) + quy trình mới

Thiệp: gen_212 Cinematic Light Shadow Editorial (Văn Minh & Thanh Linh, Chủ Nhật
15/06/2026). Phong cách điện ảnh: ảnh studio tông beige, chương tối kể chuyện tình
2020–2026. Mở bằng phong bì `#envelope`, nút `#envelopeOpenBtn`.

- Bản đồ vị trí (đo ở bề rộng điện thoại 414px, sau khi mở thiệp): trang cao
  10267px, cuộn tối đa 9371px. Hero 0 → intro 926 → Gia Đình 3102 → Lễ Cưới 5042
  → chương tối Chuyện Tình Yêu 5979 → Khoảnh Khắc 7486/8820 → closing 9773.
- Mở thiệp, dừng 6 giây ngắm ảnh hero (phong bì cần 1,5s loading + 1,2s mờ dần mới
  hết hẳn — khung hero chụp ở giữa đoạn dừng nên phải đợi đủ 5,2s), rồi MỘT đoạn
  cuộn duy nhất `"cham": true` dài 60 giây từ đầu tới `.closing` — không nhảy từng
  mục, không dừng giữa chừng.
- Kết: GIỮ NGUYÊN ở cuối thiệp (mục closing "With Love"), màn kết TEMPLEXA +
  templexa.vn (chữ to) mờ dần đè lên rồi hết video.
- Nhạc thương hiệu: `"nhacVideo": "Lễ Đường"`, `"nhacTu": 50` — phát từ điệp khúc
  thay cho nhạc của thiệp (A Thousand Years).
- Ảnh bìa hero: quay.js tự chụp khung hero + chữ TEMPLEXA to → `video/gen-212-cinematic-light-shadow-cover.jpg`,
  chèn 1 giây đầu video mờ dần.
- Nền sân khấu: `nen/phong-cuoi-am.jpg` (phòng cưới ấm, rèm voan + hồng + nến —
  hợp tông beige điện ảnh của thiệp; lần dùng gần nhất 29/10 gen_279). Dấu
  templexa.vn ở `trai-tren` (tường trơn góc trên-trái).
- Tổng 71,5 giây (1 giây đầu là ảnh bìa mờ dần đè lên timeline). File 88,7 MB ở ~9,8 Mbps,
  vừa giới hạn 100 MB của Instagram/Threads.
- Lưu ý: tiệc 15/06/2026 đã qua nên đếm ngược (nếu có) hiện 00 — chấp nhận theo
  quy ước. Thiệp dùng lucide từ CDN — quay.js đã vendor hoá sẵn.
- Lượt HD: máy khởi động lại giữa chừng ở khung 1950/2145 (đoạn 65s lỗi detached Frame
  1 lần rồi SIGTERM) — chạy lại đúng lệnh cũ nối tiếp xong, đủ 2145 khung, không mất đoạn nào.

# gen-334-thoi-noi-nhat-bao-be-yeu — bản quay CHẬM (auto-scroll liên tục) + quy trình mới

Thiệp: gen_334 Thôi Nôi Nhật Báo Bé Yêu — bé Minh An tròn 1 tuổi, tiệc
20/12/2026 11:00, Nhà hàng Hoa Sen, Số 12 Nguyễn Huệ, Quận 1, TP.HCM. Chủ đề
tờ báo xưa: bấm "Đọc báo ngay" để mở. Có lời mời dự tiệc, đôi nét về bé (tên
ở nhà, ngày sinh 20/12/2025, cân nặng, bố mẹ), hành trình 12 tháng yêu
thương, trò chơi bốc đồ đoán bé chọn món gì, đếm ngược, bản đồ, album ảnh,
hồi âm người lớn – trẻ em, sổ lời chúc và hộp quà mừng bé QR. Mở bằng cửa
`#tnCua`, nút `#tnNutMo`.

- Bản đồ vị trí (đo ở bề rộng điện thoại 414px, sau khi mở thiệp): trang cao
  8468px, cuộn tối đa 7668px. Cửa 0 → Lời Mời 905 → Về Bé 1788 → Hành Trình
  12 Tháng 2542 → Bốc Đồ 3649 → Đếm Ngược 4269 → Bản Đồ 4724 → Album (ẩn, cao
  0px) → Xác Nhận 5356 → Lời Chúc 6027 → QR 7009 → Cảm Ơn 7736.
- Mở thiệp, dừng 6 giây ngắm ảnh hero (cửa mở sau 2,7s mới hết hẳn — khung
  hero chụp ở giữa đoạn dừng nên phải đợi đủ), rồi MỘT đoạn cuộn duy nhất
  `"cham": true` dài 55 giây từ đầu tới `#SECTION_KET` — không nhảy từng mục,
  không dừng giữa chừng.
- Kết: GIỮ NGUYÊN ở cuối thiệp (mục Cảm Ơn), màn kết TEMPLEXA + templexa.vn
  (chữ to) mờ dần đè lên rồi hết video.
- Nhạc thương hiệu: `"nhacVideo": "Nụ cười 18-20"`, `"nhacTu": 80` — phát từ
  điệp khúc (xoay vòng: đêm 13/11 sự kiện dùng Khúc hát mừng sinh nhật remix,
  đêm 12/11 dùng Nụ cười 18-20).
- Ảnh bìa hero: quay.js tự chụp khung hero + chữ TEMPLEXA to →
  `video/gen-334-thoi-noi-nhat-bao-be-yeu-cover.jpg`, chèn 1 giây đầu video
  mờ dần.
- Nền sân khấu MỚI gen đêm 14/11: `nen/phong-bao-xua-be-yeu.jpg` (góc phòng
  báo xưa ấm áp, chồng báo cũ + nôi gỗ góc dưới-trái, máy bay giấy + hoa khô
  góc dưới-phải, tường kem trơn ở giữa, giữa trống êm). Dấu templexa.vn ở
  `trai-tren` (tường kem trơn góc trên-trái).
- Tổng ~67,5 giây (1 giây đầu là ảnh bìa mờ dần đè lên timeline).
- Lưu ý: đếm ngược chạy đúng tới 20/12/2026 11:00. Khung bản đồ Google Maps
  (Nhà hàng Hoa Sen) → quay.js trả ảnh bản đồ đại diện cố định, tên + địa chỉ
  vẫn hiện phía trên khung. Font tự host trong thiệp (Playfair Display / Lora
  ở assets/fonts) nên không cần font-cache. Mục Bốc Đồ chỉ lướt qua trong
  đoạn cuộn, không bấm chơi. Album ẩn nên bỏ qua trong timeline.
- Lượt quay: đêm 14/11 quay --hd 2 lỗi chụp 3 lần ở đoạn 0s (Target closed / Internal error) → file chỉ 8s/6,3 MB; đêm 15/11 quay lại từ đầu `--hd 1.5 --lam-lai`, đủ 1995 khung (66,5s), không lỗi đoạn nào.
- Lượt HD 1.5 (15/11): 66,5s, 82,5 MB, 1080×1920 30fps, ~9,9 Mbps; nhạc Nụ cười 18-20 từ 80s (3–9s mean −21,8 dB); đếm ngược hiện 35 ngày 16 giờ tới 20.12.2026 11:00; khung bản đồ hiện ảnh đại diện cố định có ghim đỏ; kiểm khung 0/10/25/40/55/65s đều nét, đúng mục, dấu TV chuẩn; màn kết TEMPLEXA đè lên mục Cảm Ơn.

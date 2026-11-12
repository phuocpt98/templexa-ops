# gen-327-remix — bản REMIX (đổi nền + đổi nhạc) + quy trình mới

Thiệp: gen_327 Nhật Báo Tình Yêu (Thành Đạt & Ngọc Hân, lễ Thành Hôn 27.12.2026).
Bản gốc đã đăng 10/11 đang chạy ~2k view trên Facebook — bản remix này đăng thành
bài MỚI, bản gốc giữ nguyên, không ghi đè. Chiến thuật remix user chốt 11/11:
mẫu hot thì đổi nền + đổi nhạc + đổi text bài đăng một chút rồi quay lại.

Đổi so với bản `gen-327-cham.json` (cuộn chậm 64s, nền báo xưa + nhạc Một Đời):
- Nền: `nen/phong-nhat-washi.jpg` — phòng Nhật, cửa sổ giấy shoji bên trái,
  tường trơn kem ở giữa, bình trúc + lan góc dưới-phải. Giữa khung trống êm,
  điện thoại nổi bật.
- Nhạc thương hiệu: `"nhacVideo": "Lễ Đường" (Kai Đinh)`, `"nhacTu": 50` — phát
  từ điệp khúc, thay cho Một Đời (70s) của bản cham. `"nhac"` gốc vẫn để
  Mot Doi.mp3 làm tham chiếu (video không dùng nhạc thiệp).
- Dấu templexa.vn: đổi `viTriWeb` từ `trai-duoi` sang `phai-tren` — góc dưới-trái
  của nền washi là bậu gỗ sáng + chân cửa shoji, chữ trắng khó đọc; góc trên-phải
  là tường trơn không vật cản, chữ trắng + bóng đổ đọc rõ nhất.

Còn lại giữ nguyên như `gen-327-cham.json`:
- Mở thiệp, dừng 3,5 giây ngắm ảnh hero, rồi MỘT đoạn cuộn duy nhất
  `"cham": true` (nội suy tuyến tính, tốc độ đều, không ease) dài 55 giây từ đầu
  tới mục Kết — không nhảy từng mục, không dừng giữa chừng.
- Kết: GIỮ NGUYÊN ở cuối thiệp (mục cảm ơn), KHÔNG cuộn ngược lên hero —
  màn kết TEMPLEXA + templexa.vn mờ dần đè lên khung cảm ơn rồi hết video.
- Ảnh bìa hero: quay.js tự chụp khung hero + chữ TEMPLEXA to →
  `video/gen-327-remix-cover.jpg`, chèn 1 giây đầu video mờ dần.
- Tổng ~64 giây (2,5 + 3,5 + 55 + 3 giây màn kết). File ~70–80 MB ở 10 Mbps,
  vừa giới hạn 100 MB của Instagram/Threads.

Ngày quay: 12/11/2026. Trạng thái: chờ duyệt — KHÔNG đăng trước khi user duyệt.

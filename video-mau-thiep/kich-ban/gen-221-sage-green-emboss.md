# gen-221-sage-green-emboss — bản quay CHẬM (auto-scroll liên tục) + quy trình mới

Thiệp: gen_221 Sage Green Emboss — Giấy Hoa Nổi (Văn Minh Khang & Thị Khánh Vy,
15/08/2026; Bữa Cơm Thân Mật 14/08 18:00, Lễ Vu Quy 15/08 08:30). Phong cách giấy
emboss hoa nổi — nền giấy kem hoạ tiết in nổi, ảnh xếp hình trái tim, góc
botanical eucalyptus, điểm nhấn sage green. Mở bằng phong bì `#envelope-screen`
(`onclick="openEnvelope()"`).

- Bản đồ vị trí (đo ở bề rộng điện thoại 414px, sau khi mở thiệp): trang cao
  5294px, cuộn tối đa 4394px. Hero 0 → Gia Đình 821 → banner 1266 → Bữa Cơm
  Thân Mật 1456 → Lễ Vu Quy 2103 → Đếm Ngược 2567 → RSVP 2825 → Album 3458 →
  Cảm Ơn 4802.
- Mở thiệp, dừng 6 giây ngắm ảnh hero (phong bì mờ dần 800ms + ảnh tim stagger
  vào ~1–2s), rồi MỘT đoạn cuộn duy nhất `"cham": true` dài 45 giây từ đầu tới
  `#thankyou` — không nhảy từng mục, không dừng giữa chừng. Trang ngắn (5294px)
  nên rút từ 55s xuống 45s theo quy tắc "tăng ms theo chiều dài trang".
- Kết: GIỮ NGUYÊN ở cuối thiệp (mục Cảm Ơn), màn kết TEMPLEXA + templexa.vn
  (chữ to) mờ dần đè lên rồi hết video.
- Nhạc thương hiệu: `"nhacVideo": "Beautiful In White"`, `"nhacTu": 85` — phát
  từ điệp khúc thay cho nhạc của thiệp (A Thousand Years).
- Ảnh bìa hero: quay.js tự chụp khung hero + chữ TEMPLEXA to →
  `video/gen-221-sage-green-emboss-cover.jpg`, chèn 1 giây đầu video mờ dần.
- Nền sân khấu: `nen/vuon-sage-hoa-trang.jpg` (vườn sage buổi sáng, hoa trắng ôm
  4 góc, giữa trống êm — hợp tông sage green; lần dùng gần nhất 05/11 gen_308).
  Dấu templexa.vn ở `giua-duoi` (dải dưới-giữa tương đối trống).
- Tổng ~57,5 giây (1 giây đầu là ảnh bìa mờ dần đè lên timeline).
- Lưu ý: tiệc 15/08/2026 đã qua nên đếm ngược hiện 00 — chấp nhận theo quy ước.
  Thiệp dùng lucide từ unpkg — quay.js đã vendor hoá sẵn. Không có iframe Google
  Maps (chỉ link Chỉ đường) nên không lo khung bản đồ vỡ.
- Font: Dancing Script / Cormorant Upright / Playfair Display / EB Garamond /
  Be Vietnam Pro / Great Vibes — link css2 của mẫu chưa có trong font-cache nên
  đã tải tay đêm 13/11 bằng curl (đúng quy ước sha1: `a832f69fee642d18.css` + 24
  file woff2 subset latin/latin-ext/vietnamese/symbols mới, 9 file đã có sẵn).
  Ghi chú: `tai-font.js` quét cả catalog quá chậm trên máy này; `quay.js
  --tai-font` không tải được vì Chrome chạy với `--no-proxy-server` nên không
  ra được fonts.googleapis.com (curl ngoài shell thì được).
- Lượt HD: quay --hd 2, đủ 1695 khung (56,5s); đoạn 50s lỗi chụp 1 lần
  (Protocol error: Target closed) rồi tự quay tiếp xong, không mất đoạn nào;
  nhạc Beautiful In White từ 85s (mean −21,4 dB, 3–8s −22,3 dB, fade cuối rõ);
  kiểm khung 3/12/25/38/50/55s đều nét, đúng mục, dấu TV chuẩn; màn kết đè lên
  mục Cảm Ơn.

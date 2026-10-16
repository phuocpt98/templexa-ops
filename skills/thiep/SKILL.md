---
name: thiep
description: Dựng hoặc sửa nội dung MỘT thiệp online (cưới, dạm ngõ, ăn hỏi, sinh nhật, thôi nôi/đầy tháng, tốt nghiệp, kỷ niệm, họp lớp, giỗ, sự kiện) cho khách của Templexa — theo mẫu có sẵn hoặc thiết kế mới. Dùng sau khi đã có job (flows/00–01) và thư mục thiệp (clone.js / new-card.js).
---

# Skill THIỆP — một skill cho mọi loại thiệp

Thay cho 7 skill cũ (`gen-wedding`, `gen-wedding-pro`, `gen-baby-pro`, `gen-birthday-pro`, `gen-anniversary-pro`, `order-wedding`, `gen-qr`). Bản gốc để tra cứu khi cần: `refs/legacy-*.md`.

**Trước khi viết code:** đã có job đủ thông tin (`job.js check` sạch) và thư mục thiệp (`clone.js` hoặc `new-card.js`). Thông tin thiệp lấy từ `job.json` → `info`, ảnh ở `<thư mục thiệp>/photos/` (bảng tra `jobs/<job>/photos.md`). Thư mục thiệp cũng có `data.json` — cập nhật nếu thông tin đổi.

Bản đồ tài liệu tham khảo trong `refs/`:
| File | Đọc khi |
|---|---|
| `wedding-design-rules.md` | Chọn bảng màu, font hỗ trợ tiếng Việt, bố cục mềm |
| `wedding-sections.md` | Cần HTML/CSS mẫu cho từng section (phong bì, hero, countdown, love story, RSVP, gallery…) |
| `wedding-constraints.md` | Ảnh responsive, tải font, giới hạn theo gói |
| `wedding-lessons.md` | **Bài học thực tế** — lỗi hay gặp, đọc lướt trước mỗi thiệp mới |
| `wedding-process-b.md` | Danh sách khách `?id=` (guests.js) chi tiết |
| `profiles/baby.md` · `birthday.md` · `anniversary.md` | Thiệp bé / sinh nhật người lớn / kỷ niệm: section, màu, font, hiệu ứng riêng |

---

## A. Làm theo mẫu (mode `clone`) — việc phổ biến nhất

Mục tiêu: **giữ nguyên thiết kế**, chỉ thay nội dung + ảnh. Không "cải tiến" giao diện khi khách không yêu cầu.

1. **Đọc hết `index.html`** (hoặc `code.html`) của thư mục thiệp. Ghi ra danh sách mọi chỗ chứa nội dung của mẫu: tên, ngày, giờ, địa điểm, lời mời, tên trường/công ty, câu chuyện, chú thích ảnh, `<title>`, `<meta description>`.
2. **Thay chữ** — dùng tìm-thay trên TOÀN file, kể cả trong `<script>` (countdown, lịch, lời chúc mẫu) và CSS (`content:`):
   | Mục | Lưu ý |
   |---|---|
   | Tên | Thay mọi dạng: họ tên đầy đủ, tên gọi, IN HOA, không dấu (nếu mẫu có chữ ký kiểu script không dấu) |
   | Ngày giờ | Mọi định dạng `24.10.2026` · `24/10/2026` · `Thứ Bảy` · `October 24` · countdown `new Date('2026-10-24T11:00:00+07:00')` · lịch tháng (khoanh đúng ngày) · nút "Thêm vào lịch" |
   | Âm lịch | Cưới/giỗ: ghi kèm "(nhằm ngày … tháng … năm …)" |
   | Địa điểm | Tên + địa chỉ + iframe Google Maps (`https://www.google.com/maps?q=<địa chỉ mã hoá>&output=embed`) + nút chỉ đường (`info.mapUrl`) |
   | Bố mẹ | Chỉ "Ông … / Bà …" — KHÔNG thêm "Thân phụ/Thân mẫu" vì đã có nhãn Nhà trai/Nhà gái |
   | Mẫu có tên random | Mẫu gen đôi khi lấy tên từ `shared/wedding/names.js` — thiệp khách phải **ghi cứng** tên khách, bỏ đoạn random |
3. **Thay ảnh** — `clone.js` đã in danh sách ảnh mẫu đang dùng. Thay từng chỗ bằng `photos/anh_N.webp`, cả trong CSS `url(...)`. Ảnh dọc cắt khung ngang → đặt `object-position: center 20%…35%` theo vị trí mặt (xem ảnh). Thiếu ảnh → dùng lặp ảnh đẹp nhất, **không** để ảnh người mẫu.
4. **Nhạc** — `music="giu-mau"` thì giữ; đổi bài thì chọn trong `Templexa/products/shared/music/<thể loại>/` (đường dẫn `../../../shared/music/...`).
5. **RSVP + lời chúc** — có `sheetId`: đảm bảo có `<script src="../../../shared/wedding/wishes-api.js"></script>`, hằng `SHEET = '<sheetId>'`, form gửi `sheetsAPI.post(SHEET, {A: tên, B: …})`, lời chúc đọc `sheetsAPI.get(SHEET)`. Chưa có (`false`) → để form chạy chế độ local của mẫu, ghi vào log "chờ sheetId".
6. **QR mừng cưới** (`gift`): ảnh QR ngân hàng khách gửi → `photos/qr-mung-cuoi.webp`; hoặc ghi ngân hàng + số TK + tên chủ TK vào thẻ quà. Không có → ẩn cả section quà, đừng để số TK của mẫu.
7. **Thiệp riêng 2 nhà** (`sides=rieng-2-nha`): 2 thư mục (key `nha-trai`, `nha-gai`) — khác nhau ở thứ tự tên (nhà nào đứng trước), địa chỉ, giờ lễ (Vu Quy / Thành Hôn), lời mời.
8. `<title>` + `<meta name="description">` của file thiệp theo tên khách; thêm `<meta name="robots" content="noindex, nofollow">` nếu chưa có.

## B. Thiết kế mới (mode `new`)

Chỉ làm khi khách không chọn mẫu nào. Quy trình rút gọn từ `gen-wedding-pro`:

1. **Spec thiết kế trước, code sau**: từ ảnh/URL/mô tả khách gửi → bảng màu (hex), font (PHẢI hỗ trợ tiếng Việt — xem `wedding-design-rules.md`), kiểu phong bì, hiệu ứng, thứ tự section. **Gửi spec cho user xác nhận** trước khi code.
2. Dịp không phải cưới → đọc `refs/profiles/<baby|birthday|anniversary>.md` lấy section/màu/font/hiệu ứng riêng. Tốt nghiệp, họp lớp, giỗ: lấy cảm hứng từ các mẫu cùng `event` đang có (`catalog.js order --list --event <dịp>`).
3. Section tối thiểu: phong bì (mở bằng `#openBtn` hoặc `.envelope`) · hero (tên + ngày + ảnh) · thông tin chính · thời gian & địa điểm + bản đồ · album · đếm ngược · RSVP + lời chúc · lời cảm ơn + dòng `templexa.vn`. Nhạc nền luôn có.
4. Tái dùng thư viện `Templexa/products/shared/wedding/` (`styles.css`, `scripts.js`, `README.md`) và ảnh trang trí trong `products/shared/wedding-data.js` (lọc theo tag) — đừng tự vẽ lại thứ đã có. Thiếu thì tự tạo theo `flows/15-tao-anh.md` (lưu vào `<thư mục thiệp>/images/`).
5. Thư viện ngoài cho phép: Google Fonts, Anime.js v4 (`createTimeline`, `stagger` — KHÔNG cú pháp v3). Không thêm gì khác.
6. Tự chấm sau khi chụp (`shoot.js`): màu hài hoà, chữ rõ thứ bậc, ảnh không cắt mặt, phong bì đẹp, dấu tiếng Việt không lỗi. Chưa ổn → sửa, tối đa 2 vòng, rồi mới gửi user.

## C. Danh sách khách `?id=` (khi `guests=true`)

- Khách gửi Excel/CSV → đọc → tạo `guests.json` (`{ "sheetId": …, "baseUrl": "<link khách>?id=", "guests": [{ id, name, title, self, note }] }`) và `guests.js` (`var GUEST_LIST = [...]`) trong thư mục thiệp. `title` = cách gọi khách trong câu mời, `self` = người mời tự xưng.
- Thiệp đọc `?id=` → tra `GUEST_LIST` → hiện "Kính mời <name>" + đổi xưng hô. Không có id → câu mời chung. Vẫn nhận `?ten=Tên+Khách` cho khách ngoài danh sách. Mẫu tham khảo: `products/Invitation/Other/khach_37_tot-nghiep-trang-trong/` (guests.js + đoạn script đầu trang).
- QR từng khách: `node scripts/qr.js <job> --guests`.

## D. Sửa thiệp (mode `edit`, hoặc khách góp ý)

- Góp ý thường đến từ trang `sua-thiep.html` (flows/20): mỗi dòng có `File:`, vị trí `[phần › selector]`, chữ đang hiện, tên ảnh — tìm bằng chữ đang hiện trước, selector để xác nhận.
- Đọc `feedback.md` → làm từng dòng `[ ]`, xong đổi `[x]` + ghi ngắn đã sửa gì.
- Yêu cầu mơ hồ ("chỗ này xấu", "đổi màu đẹp hơn") → hỏi lại kèm ảnh chụp vùng đó + 2–3 phương án cụ thể.
- Chỉ sửa đúng chỗ được yêu cầu. Sửa xong chụp lại (`shoot.js`) và gửi ảnh trước/sau.

---

## LUẬT CỨNG — mọi thiệp

1. **Dòng thương hiệu cuối thiệp** (section cuối): `<a class="closing-brand" href="https://templexa.vn" target="_blank" rel="noopener">Thiệp online · <b>templexa.vn</b></a>` — chữ nhỏ, màu phụ, opacity ~0.7. Không ghi "Templexa" suông.
2. **RSVP chỉ 1 nút gửi** — gộp gửi lời chúc + xác nhận tham dự (`Gửi lời chúc & xác nhận`). Mẫu tham khảo có 2 nút thì bỏ nút thứ hai.
3. **Tên không gãy dòng giữa tên**: tên nằm 1 dòng dùng `font-size: clamp(1.4rem, 6vw, 3rem); white-space: nowrap;` — kiểm cả màn 320px. Tên quá dài → ngắt dòng ở dấu `&` hoặc giữa họ và tên, cân đối 2 dòng.
4. **Ảnh trang trí nền trắng** (`shared/wedding-elements/`) lộ viền vuông trên nền màu → ưu tiên SVG inline, không được thì `mask-image: radial-gradient(...)`. Ảnh `heritage-elements/` có nền trong suốt sẵn.
5. **Không để sót nội dung mẫu**: tìm lại tên/ngày/địa điểm của mẫu gốc trong file (grep) — phải ra 0 kết quả.
6. **Không sửa thư mục mẫu gốc, không sửa `products/shared/`** — cần component mới thì viết trong file thiệp.
7. Đường dẫn tài nguyên chung luôn tương đối `../../../shared/...` (thư mục thiệp nằm ở `products/Invitation/<Wedding|Other>/<tên>/`).

## Checklist trước khi báo user
- [ ] Đúng chính tả tên, ngày (cả thứ trong tuần khớp ngày), giờ, địa điểm — đối chiếu `job.json`
- [ ] Không còn chữ/ảnh của mẫu gốc (luật 5)
- [ ] Countdown chạy, lịch khoanh đúng ngày, bản đồ đúng chỗ
- [ ] Nhạc phát sau khi mở phong bì
- [ ] RSVP 1 nút; có sheetId thì gửi thử 1 lần ("TEST — xoá") và thấy dòng mới
- [ ] Dòng `templexa.vn` cuối thiệp
- [ ] `shots/open.webp` sạch, không cắt chữ/mặt (mở xem bằng mắt)
- [ ] Mở trên khổ 390px: không cuộn ngang, tên không gãy

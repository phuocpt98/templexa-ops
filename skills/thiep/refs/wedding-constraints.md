# Wedding Constraints — Ràng buộc & Pricing
> Extracted from gen-wedding.md — used as reference by /gen-wedding command

## Ràng buộc chung

- KHÔNG đọc nội dung file ảnh
- KHÔNG thêm dependency ngoài Tailwind CDN, Google Fonts CDN, Lucide Icons CDN
- Mỗi `code.html` phải self-contained, mở được trực tiếp trong browser
- **LUÔN có nhạc nền** — không bao giờ bỏ qua
- **LUÔN có countdown** đến ngày cưới
- **LUÔN có ít nhất 1 hiệu ứng đặc biệt** (hoa rơi/confetti/sparkles/hearts)
- **LUÔN có RSVP form**
- **LUÔN có Love Story timeline**
- Animations smooth, chuyên nghiệp — dùng `cubic-bezier(0.16, 1, 0.3, 1)`
- Font phải hỗ trợ tiếng Việt tốt cho body text
- Ảnh Unsplash phải wedding-themed, không dùng ảnh generic
- Nếu gen nhiều mẫu → mỗi mẫu phải có palette + font + hiệu ứng KHÁC NHAU

## Ràng buộc ảnh — Responsive & Mobile (QUAN TRỌNG)

Ảnh mobile (440x956) dùng làm thumbnail trên trang products — hero view phải đẹp ở cả desktop và mobile.

**Lỗi thường gặp — CẦN TRÁNH:**

1. **Ảnh bị cắt do co kích thước** (KHÔNG chấp nhận):
   - Container có `overflow: hidden` + chiều cao cố định (`height: 300px`) → ảnh lớn bị cắt mất phần quan trọng
   - **Fix**: dùng `object-fit: contain` thay `cover` cho ảnh quan trọng (portrait, couple)
   - **Fix**: dùng `object-position: top` hoặc `center` để kiểm soát phần hiển thị khi dùng `cover`
   - **Fix**: dùng `aspect-ratio` thay `height` cố định → ảnh co giãn đúng tỷ lệ

2. **Ảnh bị vỡ bố cục trên mobile**:
   - Desktop: 2 ảnh cạnh nhau → Mobile: phải stack dọc hoặc thu nhỏ tỷ lệ, KHÔNG để tràn viewport
   - Ảnh absolute position (rotate, overlap) → kiểm tra không bị cắt bởi parent `overflow: hidden` trên mobile
   - **Fix**: media query `@media (max-width: 480px)` cho layout ảnh

3. **Quy tắc CSS cho ảnh trong thiệp:**
   ```css
   /* ✅ Ảnh responsive an toàn */
   img { max-width: 100%; height: auto; }

   /* ✅ Ảnh hero / banner */
   .hero-img { width: 100%; height: 100%; object-fit: cover; object-position: center top; }

   /* ✅ Ảnh portrait couple — giữ nguyên tỷ lệ */
   .couple-img { width: 100%; max-height: 500px; object-fit: contain; }

   /* ✅ Gallery — grid responsive */
   .gallery-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 8px; }
   .gallery-grid img { width: 100%; aspect-ratio: 1; object-fit: cover; border-radius: 8px; }

   /* ❌ TRÁNH — ảnh cố định kích thước */
   .bad { width: 400px; height: 300px; overflow: hidden; } /* → bị cắt trên mobile */
   ```

4. **Kiểm tra trước khi chụp screenshot**: Hero section phải hiển thị đủ tên cặp đôi + ảnh chính + ngày cưới ở viewport 440px wide.

## Ràng buộc font — Load đúng (QUAN TRỌNG)

**Lỗi thường gặp**: Font Google chưa load xong khi chụp screenshot → hiển thị font fallback.

1. **Luôn thêm `&display=swap`** trong Google Fonts URL
2. **Trong Puppeteer — chờ font load xong:**
   ```javascript
   await page.goto(filePath, { waitUntil: 'networkidle0', timeout: 30000 });
   await page.evaluate(() => document.fonts.ready);
   await new Promise(r => setTimeout(r, 1000));
   ```
3. **Font fallback chain:**
   ```css
   font-family: 'Great Vibes', 'Dancing Script', cursive;
   font-family: 'Cormorant Garamond', 'Playfair Display', serif;
   font-family: 'Quicksand', 'Nunito', sans-serif;
   ```
4. **Preload font heading script quan trọng nhất:**
   ```html
   <link rel="preload" href="https://fonts.gstatic.com/s/greatvibes/v18/RWmMoKWR9v4ksMfaWd_JN-XCg6UKDXlq.woff2" as="font" type="font/woff2" crossorigin>
   ```

## Bảng giá — Phân biệt tính năng theo gói

Khi gen thiệp, xác định gói từ yêu cầu user. Nếu không nói rõ → mặc định **Premium**.

| Tính năng | Basic (150k) | Premium (199k) | Custom (liên hệ) |
|-----------|:---:|:---:|:---:|
| Chọn mẫu có sẵn | ✅ | ✅ | ✅ |
| Thay tên, ngày, địa điểm, ảnh | ✅ | ✅ | ✅ |
| Phong bì mở thiệp + nhạc nền | ✅ | ✅ | ✅ |
| Countdown đếm ngược | ✅ | ✅ | ✅ |
| Love Story, Gallery + Lightbox | ✅ | ✅ | ✅ |
| Hiệu ứng hoa rơi / sparkles | ✅ | ✅ | ✅ |
| RSVP xác nhận tham dự | ✅ | ✅ | ✅ |
| Gửi lời chúc (Google Sheets) | ✅ | ✅ | ✅ |
| Google Maps + QR mừng cưới | ✅ | ✅ | ✅ |
| Thêm vào lịch (.ics) | ✅ | ✅ | ✅ |
| Responsive mobile | ✅ | ✅ | ✅ |
| Mã QR chia sẻ thiệp (1 mã chung) | ✅ | ✅ | ✅ |
| Video YouTube (lazy load) | ✅ | ✅ | ✅ |
| Group Animations | ✅ | ✅ | ✅ |
| Chỉnh sửa | 1 lần | 3 lần | Không giới hạn |
| **Lời chúc bay (floating bubbles)** | ❌ | ✅ | ✅ |
| **Cá nhân hoá khách mời (?id=)** | ❌ | ✅ | ✅ |
| **Mã QR riêng từng khách** | ❌ | ✅ | ✅ |
| **Custom nhẹ trên mẫu có sẵn** | ❌ | ✅ | ✅ |
| **Thiết kế giao diện RIÊNG 100%** | ❌ | ❌ | ✅ |
| **Hiệu ứng & animation độc quyền** | ❌ | ❌ | ✅ |
| **Bảng màu, font, layout tuỳ ý** | ❌ | ❌ | ✅ |
| **Video/nhạc riêng** | ❌ | ❌ | ✅ |
| **Chỉnh sửa không giới hạn** | ❌ | ❌ | ✅ |
| **Tư vấn 1:1 + hỗ trợ đến ngày cưới** | ❌ | ❌ | ✅ |

**Quy tắc áp dụng khi gen:**
- `"basic"` / `"gói cơ bản"` / `"150k"` → bỏ floating wishes, bỏ guests.js, QR chỉ 1 mã chung
- `"premium"` / `"đầy đủ"` / `"199k"` hoặc không nói gì → thêm tất cả: floating wishes, guests.js (nếu có CSV), QR riêng
- `"custom"` / `"thiết kế riêng"` → toàn bộ + thiết kế từ đầu

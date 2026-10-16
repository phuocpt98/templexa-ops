
Gen thiệp **thôi nôi / đầy tháng / sinh nhật bé** chất lượng cao.
**Kế thừa TOÀN BỘ workflow 4 phase từ `/gen-wedding-pro`** (Design Intelligence → Gen → Quality Verify ≥70% → Delivery).

Argument: $ARGUMENTS — mô tả yêu cầu, URL/ảnh tham khảo, hoặc folder khách (ảnh bé, tên bé, ngày sinh, ngày tổ chức).

---

## Khác biệt với `/gen-wedding-pro`

### 1. Loại sự kiện

| Loại | Mốc | Đặc trưng |
|---|---|---|
| **Đầy tháng** | 1 tháng tuổi | Lễ cúng truyền thống, "mẹ tròn con vuông" |
| **Thôi nôi** | 1 năm tuổi | Lễ chọn nghề, mâm vật phẩm, chúc tương lai |
| **Sinh nhật bé** | 2-10 tuổi | Theme nhân vật, hoạt hình, vui nhộn |

User PHẢI nói rõ loại nào → skill tự chọn template phù hợp.

### 2. Sections bắt buộc (8+, thay envelope wedding)

1. **Envelope/Splash** — ảnh bé tròn xinh, tên bé, "Nhấn để mở"
2. **Hero** — ảnh bé chính + tên + ngày tổ chức + đếm ngược
3. **Bé là ai** — info card: tên đầy đủ, biệt danh, ngày sinh, cung hoàng đạo, con giáp (cho thôi nôi/đầy tháng)
4. **Bố mẹ** — "Cha: Ông... / Mẹ: Bà..." (KHÔNG ghi chú "thân phụ/thân mẫu")
5. **Lời chúc / Mâm chọn nghề** (thôi nôi: 8-12 vật phẩm với ý nghĩa)
6. **Album ảnh bé** — gallery 6-12 ảnh cute (có overlap, rotation nhẹ ±2deg)
7. **Thông tin lễ** — địa điểm, thời gian, dress code
8. **RSVP form** — số người lớn + số trẻ em + món ăn dị ứng (đặc thù)
9. **Lời cảm ơn**

### 3. Palette gợi ý (pastel, mềm)

| Theme | Primary | Accent | Bg |
|---|---|---|---|
| **Bé trai pastel** | `#A8D8EA` (sky) | `#AA96DA` (lavender) | `#FFFFFC` |
| **Bé gái pastel** | `#FFC1CC` (rose) | `#FFE5B4` (peach) | `#FFF9F4` |
| **Neutral milk** | `#E8DDB5` (cream) | `#C9ADA7` (mauve) | `#FFFCF7` |
| **Mint sage** | `#B5D7C2` | `#F4C2A1` | `#FCFAF5` |
| **Sunny pop** (sinh nhật) | `#FFD93D` | `#FF6B6B` | `#FFF8E1` |

### 4. Font gợi ý

- **Heading**: Fredoka, Quicksand, Comfortaa (round, friendly — KHÔNG serif quá formal)
- **Script accent**: Caveat, Sacramento (cho tên bé / ngày sinh)
- **Body**: Quicksand, Nunito (300-400)

### 5. Effects gợi ý

- ⭐ Stars twinkling, 🎈 balloons floating, ☁️ clouds drifting
- 🐰 Bunny hopping, 🌈 rainbow, 🦋 butterflies
- KHÔNG dùng petals/sparkles "cưới" — không hợp baby

### 6. Decoration elements

- Bear, bunny, balloon, star, moon, cloud, rainbow icons (SVG inline)
- Polka dots, stripes background patterns nhẹ
- Watercolor splashes pastel
- Borders bo tròn nhiều (border-radius 24-40px)

### 7. Animation gợi ý (Anime.js v4)

- Balloon float up + rotate nhẹ (loop)
- Bear/bunny bounce (spring physics)
- Confetti reveal khi mở envelope
- Number countdown style "tuổi bé" hoành tráng cho sinh nhật

### 8. Ràng buộc thay đổi

| Item | gen-wedding-pro | gen-baby-pro |
|---|---|---|
| Love Story timeline | BẮT BUỘC | **THAY** bằng "Hành trình của bé" (tháng 1, 3, 6, 9, 12) |
| Tên random source | `products/shared/wedding/names.js` | Generate inline list 20 tên bé Việt phổ biến (An, Bảo, Khanh, Linh, Minh, Nhi...) hoặc tạo `shared/baby/names.js` nếu chưa có |
| Nhạc | Lãng mạn cưới | **THAY** bằng nhạc nhẹ vui (lullaby, music box, piano cute) |
| RSVP fields | tên + số khách + lời chúc | + **số trẻ em** + **dị ứng món ăn** |
| isPublic mặc định | false | false |

### 9. Output

- Folder: `products/Invitation/Other/{slug}/`
- `data.js` entry: `category: "other"`, `type: "invitation"`, tags: `["baby", "thôi-nôi"|"đầy-tháng"|"sinh-nhật-bé", "pastel", ...]`
- products.md cập nhật

---

## Phase 1-4: theo `/gen-wedding-pro`

Chạy nguyên 4 phase của `/gen-wedding-pro`:
- **Phase 1** — Design Intelligence (extract spec từ ảnh/URL nếu có)
- **Phase 2** — Gen HTML với spec + sections baby ở trên + Anime.js v4 nếu cần
- **Phase 3** — Quality Verify (puppeteer screenshot, score ≥70%, sửa max 2 lần)
- **Phase 4** — Delivery (chụp official, WebP, data.js, products.md, QR)

Áp dụng tất cả **kinh nghiệm thực chiến** trong `/gen-wedding-pro` (mask-image webp shared, opacity decoration 0.8-1.0, divider object-position, tên responsive clamp...).

## Tham chiếu

- Workflow base: `/gen-wedding-pro` SKILL.md
- Anime.js v4 syntax rules: `/gen-wedding-pro` PHASE 2B
- Quality verify checklist: `/gen-wedding-pro` PHASE 3B
- Thư viện wedding shared (reuse css/scripts): `products/shared/wedding/`

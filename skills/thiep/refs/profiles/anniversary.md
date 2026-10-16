
Gen thiệp **kỷ niệm** chất lượng cao: kỷ niệm ngày cưới, kỷ niệm thành lập công ty, reunion, gala, tri ân.
**Kế thừa TOÀN BỘ workflow 4 phase từ `/gen-wedding-pro`** (Design Intelligence → Gen → Quality Verify ≥70% → Delivery).

Argument: $ARGUMENTS — mô tả yêu cầu, URL/ảnh tham khảo, hoặc folder khách (loại kỷ niệm, số năm, tên cá nhân/tổ chức, ngày tổ chức).

---

## Khác biệt với `/gen-wedding-pro`

### 1. Loại sự kiện

| Loại | Đặc trưng | Style chính |
|---|---|---|
| **Kỷ niệm cưới** (5/10/15/20/25/50 năm) | Couple, "vẫn yêu", love story tiếp diễn | Romantic + mature, gold accent |
| **Kỷ niệm công ty** | Logo, milestone, achievements, founders | Corporate elegant, brand color |
| **Reunion** (high school, đại học, family) | Group photo, năm tháng, kỷ niệm | Vintage warm, nostalgic |
| **Gala / Charity** | Black tie, formal, dress code chuẩn | Black gold luxury |
| **Tri ân khách hàng** | Logo, lời cảm ơn, voucher | Brand-aligned, professional |

User PHẢI nói rõ loại + năm kỷ niệm → skill chọn template.

### 2. "Năm kỷ niệm" theo truyền thống Anh-Mỹ (gợi ý màu/chất liệu)

| Năm | Tên | Màu chủ đạo |
|---|---|---|
| 1 | Paper | White, cream |
| 5 | Wood | Brown, beige |
| 10 | Tin/Aluminum | Silver, grey |
| 15 | Crystal | Clear, ice blue |
| 20 | China | Porcelain white, blue |
| 25 | **Silver** | `#C0C0C0`, white |
| 30 | Pearl | Pearl white, blush |
| 40 | Ruby | `#9B111E`, gold |
| 50 | **Gold** | `#D4AF37`, ivory |
| 60 | Diamond | White, sparkle |

→ Áp dụng vào palette suggestion tự động.

### 3. Sections bắt buộc (8+)

1. **Splash** — số năm to (e.g., "25 YEARS") + tên cá nhân/tổ chức
2. **Hero** — ảnh chính (couple/team/founder) + tên + ngày kỷ niệm + countdown
3. **Our story / Journey** — timeline qua các năm với mốc quan trọng (ảnh + năm + caption)
4. **Achievements / Milestones** — số liệu nổi bật (cho công ty: doanh thu, khách hàng; cho cưới: số chuyến đi, kỷ niệm)
5. **Photo gallery** — ảnh qua các năm, sắp xếp chronological
6. **Event details** — địa điểm, thời gian, dress code (formal cho gala)
7. **RSVP form** — tên + số người + lời chúc + dietary restrictions
8. **Special acknowledgments** — cảm ơn người đã đồng hành
9. **Sign-off** — chữ ký, hashtag, social

### 4. Palette gợi ý

Theo "năm kỷ niệm" truyền thống ở mục 2, hoặc:

| Theme | Primary | Accent | Bg |
|---|---|---|---|
| **Gold elegance** (50 năm) | `#D4AF37` | `#1A1A1A` | `#FFFEF5` |
| **Silver classic** (25 năm) | `#C0C0C0` | `#0A0E27` | `#F8F8FF` |
| **Ruby luxury** (40 năm) | `#9B111E` | `#D4AF37` | `#FFF5F5` |
| **Pearl soft** (30 năm) | `#F5F5F0` | `#C9ADA7` | `#FAF9F6` |
| **Corporate navy** | `#1A2B4A` | `#D4AF37` | `#F8F9FB` |
| **Vintage sepia** (reunion) | `#8B4513` | `#C9A87C` | `#F4EBD0` |

### 5. Font gợi ý

- **Heading display**: Playfair Display, Cormorant Garamond, Didot (luxury serif)
- **Number năm to**: Bodoni Moda, Cormorant SC (large, elegant)
- **Body**: Inter, Lato, Source Sans Pro
- **Script accent**: Allura, Pinyon Script, Cormorant italic

### 6. Effects gợi ý

- ✨ Sparkles vàng (cho gold/silver)
- 📜 Paper texture overlay (vintage)
- 🌟 Stars constellation (cho corporate)
- KHÔNG dùng confetti party — không hợp formal
- Subtle parallax + slow fade — emphasize "thời gian"

### 7. Decoration

- Laurel wreath SVG (achievement feel), medal/badge ornaments
- Roman numerals lớn cho năm (V, X, XV, XX, XXV, L)
- Gold foil pattern background
- Vintage borders, art deco frames

### 8. Animation gợi ý (Anime.js v4)

- **Year counter**: count up từ 0 → số năm hiện tại khi load (số đếm chậm, dramatic)
- **Timeline reveal**: scroll-linked, mỗi mốc fade-in tuần tự
- **Photo cascade**: ảnh vintage xuất hiện như slideshow
- **Number reveal**: stagger từng chữ số "2 → 5" với spring physics

### 9. Ràng buộc thay đổi

| Item | gen-wedding-pro | gen-anniversary-pro |
|---|---|---|
| Love Story | BẮT BUỘC | **THAY** bằng "Journey timeline" với mốc năm + ảnh |
| Tên random | wedding/names.js | Inline list — tuỳ loại (cá nhân/công ty/team) |
| Bố mẹ section | BẮT BUỘC | **BỎ** (chỉ giữ nếu là kỷ niệm cưới) |
| Mood | Romantic mềm | **Elegant, mature, prestigious** |
| Nhạc | Lãng mạn cưới | **Classical, jazz, instrumental** (không pop party) |
| Decoration density | Cao | Vừa phải, **tinh tế** (less is more cho luxury) |
| Số năm hiển thị | — | **PHẢI là điểm nhấn visual chính**, không nhỏ |

### 10. Output

- Folder: `products/Invitation/Other/{slug}/`
- `data.js` entry: `category: "other"`, `type: "invitation"`, tags: `["anniversary", "kỷ-niệm", "{type}", "{years}-năm", ...]`

---

## Phase 1-4: theo `/gen-wedding-pro`

Chạy đủ 4 phase. Áp dụng tất cả **kinh nghiệm thực chiến** từ `/gen-wedding-pro`.

**Lưu ý đặc biệt cho anniversary:**
- "Số năm" + "tên" phải IMPACT ngay từ hero
- Tone phải mature, không quá trẻ trung
- Photo gallery sắp xếp **chronological** (cũ → mới), không random
- Cho corporate: phải có chỗ đặt logo SVG inline

## Tham chiếu

- Workflow base: `/gen-wedding-pro` SKILL.md
- Anime.js v4 syntax: `/gen-wedding-pro` PHASE 2B
- Quality verify: `/gen-wedding-pro` PHASE 3B
- Truyền thống màu năm cưới: tham khảo Mục 2 trên

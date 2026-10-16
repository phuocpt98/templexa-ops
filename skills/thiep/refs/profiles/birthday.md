
Gen thiệp **sinh nhật người lớn** chất lượng cao (từ teen 16, 18, 20, 25, 30, 40, 50, 60+...).
**Kế thừa TOÀN BỘ workflow 4 phase từ `/gen-wedding-pro`** (Design Intelligence → Gen → Quality Verify ≥70% → Delivery).

Argument: $ARGUMENTS — mô tả yêu cầu, URL/ảnh tham khảo, hoặc folder khách (tên nhân vật chính, tuổi, ngày tổ chức, theme).

---

## Khác biệt với `/gen-wedding-pro`

### 1. Loại sự kiện

| Mốc tuổi | Style gợi ý |
|---|---|
| **Sweet 16 / 18** | Pastel dreamy, glitter, balloon |
| **20-30** | Modern neon, vibrant pop, party mood |
| **30-40** | Elegant sophisticated, gold black, minimalist |
| **50-60+** | Classic gold, vintage, family warmth |
| **Milestone** (25/50/75) | Luxury gold black, "milestone" badge nổi bật |

User PHẢI nói rõ tuổi + theme mong muốn → skill chọn template phù hợp.

### 2. Sections bắt buộc (8+)

1. **Splash/Envelope** — "You're Invited" / "Bạn được mời" + tên + tuổi
2. **Hero** — ảnh nhân vật chính + tên + **số tuổi to nổi bật** + countdown
3. **About the birthday person** — tiểu sử ngắn, sở thích, achievement, fun facts
4. **Through the years** — timeline ảnh qua các năm (5-10 ảnh, có năm)
5. **Party details** — địa điểm, thời gian, dress code, theme
6. **What to bring / wishlist** (tuỳ chọn) — gợi ý quà, hoặc "no gifts please"
7. **RSVP form** — tên + số người + lời chúc + dị ứng món ăn
8. **Gallery** — kỷ niệm vui
9. **Lời cảm ơn / hashtag** — `#TenNguoi40` cho social

### 3. Palette gợi ý

| Theme | Primary | Accent | Bg |
|---|---|---|---|
| **Neon party** | `#FF006E` (hot pink) | `#3A86FF` (electric blue) | `#0A0E27` (deep navy) |
| **Gold luxury** | `#D4AF37` | `#1A1A1A` | `#FFFEF5` |
| **Pastel dream** | `#FFB5C5` | `#B5DEFF` | `#FFF9F4` |
| **Vintage warm** | `#C9A87C` | `#8B4513` | `#F4EBD0` |
| **Tropical pop** | `#FFD93D` | `#06D6A0` | `#FFF8E1` |
| **Black tie** | `#0A0A0A` | `#D4AF37` | `#1A1A1A` (dark mode) |

### 4. Font gợi ý

- **Heading display**: Bebas Neue, Anton, Oswald (bold party feel) HOẶC Playfair Display, Cormorant (luxury)
- **Number tuổi to**: Bebas Neue, Archivo Black, Oswald — size **clamp(6rem, 20vw, 12rem)**
- **Body**: Inter, Quicksand, Manrope
- **Script accent**: Great Vibes, Allura (cho "Happy Birthday")

### 5. Effects gợi ý

- 🎉 Confetti rain (continuous), 🎈 balloons floating
- ✨ Sparkles glitter, 🪩 disco ball (cho party)
- 🎂 Cake với candles flicker animation
- KHÔNG dùng petals/hearts cưới — không hợp

### 6. Decoration

- Balloon clusters SVG, party hats, streamers, confetti shapes
- Candles, cake icons
- Number tuổi treated như poster art (huge, gradient, layered shadow)

### 7. Animation gợi ý (Anime.js v4)

- **Number reveal**: số tuổi count up từ 0 → tuổi thật khi load
- **Confetti burst**: anime.js stagger particles từ giữa
- **Balloon physics**: float up + sway loop
- **Cake candles**: flicker với CSS keyframes random delay
- **Photo timeline cascade**: ảnh xuất hiện theo năm, stagger 100ms

### 8. Ràng buộc thay đổi

| Item | gen-wedding-pro | gen-birthday-pro |
|---|---|---|
| Love Story timeline | BẮT BUỘC | **THAY** bằng "Through the years" với năm/cột mốc |
| Tên random | wedding/names.js | Inline list 30 tên Việt cả nam nữ + tuổi random 18-60 |
| Nhạc | Lãng mạn | **Upbeat party** (pop, disco, jazz tuỳ theme) |
| Mood | Soft, organic | **Bold, energetic** (hoặc elegant tuỳ tuổi) |
| Bố mẹ section | BẮT BUỘC | **BỎ** — không liên quan |
| Couple names | "A & B" | **Single name** — chỉ 1 nhân vật chính |
| Decoration density | Cao | **Rất cao** (party feel) |

### 9. Output

- Folder: `products/Invitation/Other/{slug}/`
- `data.js` entry: `category: "other"`, `type: "invitation"`, tags: `["birthday", "sinh-nhật", "{theme}", "{age-milestone}", ...]`

---

## Phase 1-4: theo `/gen-wedding-pro`

Chạy đủ 4 phase. Áp dụng tất cả **kinh nghiệm thực chiến** từ `/gen-wedding-pro`.

**Lưu ý đặc biệt cho birthday:**
- Số tuổi phải LÀ ĐIỂM NHẤN VISUAL — không nhỏ, không ẩn
- Confetti effect không được lag (giới hạn ~50 particles)
- Mobile: tên + tuổi vẫn phải đọc rõ ở 320px

## Tham chiếu

- Workflow base: `/gen-wedding-pro` SKILL.md
- Anime.js v4 syntax: `/gen-wedding-pro` PHASE 2B
- Quality verify: `/gen-wedding-pro` PHASE 3B

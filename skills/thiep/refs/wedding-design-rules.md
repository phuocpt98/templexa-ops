# Wedding Design Rules — Phong cách & Visual System
> Extracted from gen-wedding.md — used as reference by /gen-wedding command

## Bảng màu cưới — Chọn 1 palette phù hợp

| Phong cách | Primary | Secondary | Accent | Background | Text |
|------------|---------|-----------|--------|------------|------|
| **Classic Gold** | `#B8860B` | `#D4AF37` | `#FFD700` | `#FFFEF5` ivory | `#2C1810` |
| **Blush Pink** | `#E8A0BF` | `#F5C6D0` | `#C77DA3` | `#FFF5F7` | `#4A2040` |
| **Sage Green** | `#9CAF88` | `#B5C4A1` | `#6B8F5B` | `#F5F7F2` | `#2D3B25` |
| **Navy & Gold** | `#1B2A4A` | `#D4AF37` | `#FFD700` | `#F8F9FA` | `#1B2A4A` |
| **Dusty Rose** | `#D4A5A5` | `#E8C4C4` | `#B07575` | `#FDF6F6` | `#5C3D3D` |
| **Terracotta** | `#C67B5C` | `#E8A98A` | `#A0522D` | `#FFF8F0` | `#3D2B1F` |
| **Lavender** | `#9B8EC4` | `#C4B7D9` | `#7B68AE` | `#F8F5FF` | `#3D2D5C` |
| **Burgundy** | `#722F37` | `#A4343A` | `#D4AF37` | `#FFF9F5` | `#2C1015` |
| **Dark Luxury** | `#0D0D0D` | `#1A1A2E` | `#D4AF37` | `#0D0D0D` | `#F5F0E8` |
| **Tropical** | `#2D8B6F` | `#F4A460` | `#FF6B6B` | `#FFFEF8` | `#1A3C34` |

## Font combos cho thiệp cưới

**ƯU TIÊN font mềm mại, thanh lịch** — tạo cảm giác lãng mạn, nhẹ nhàng.
**Kết hợp nhiều font** trong 1 thiệp: heading script/serif + body sans + accent italic.
**TRÁNH font cứng, nặng** (Impact, Arial Black, Roboto Condensed...).

**⚠️ QUAN TRỌNG — Font tiếng Việt:**
- **KHÔNG dùng `Cinzel`, `Cinzel Decorative`** — KHÔNG hỗ trợ dấu tiếng Việt (ă, ơ, ư, ê, ô, đ...)
- **KHÔNG dùng `Italiana`** — tương tự không hỗ trợ đầy đủ
- Font script (`Great Vibes`, `Dancing Script`, `Sacramento`, `Alex Brush`) — **chỉ dùng cho tên KHÔNG DẤU**
- **ƯU TIÊN font hỗ trợ tiếng Việt**: `Cormorant Garamond`, `Playfair Display`, `EB Garamond`, `Be Vietnam Pro`, `Quicksand`, `Nunito`, `Lora`
- `--font-heading` **BẮT BUỘC** dùng font hỗ trợ tiếng Việt (section title luôn có tiếng Việt)

| Combo | Heading (script/serif) | Body (sans) | Accent (italic/light) | Vibe |
|-------|----------------------|-------------|----------------------|------|
| **Soft Romantic** | `Cormorant Garamond` | `Quicksand` | `Cormorant Garamond italic` | Mềm mại, lãng mạn |
| **Dreamy** | `Great Vibes` | `Nunito` | `Lora italic` | Mộng mơ, bay bổng |
| **Elegant Serif** | `Playfair Display` | `Lora` | `Playfair Display italic` | Sang trọng, tinh tế |
| **Modern Soft** | `Italiana` | `Quicksand` | `Cormorant Garamond italic` | Hiện đại, mềm |
| **Classic Grace** | `Playfair Display` | `EB Garamond` | `Cormorant Garamond italic` | Cổ điển, quý phái |
| **Gentle** | `Dancing Script` | `Be Vietnam Pro` | `Be Vietnam Pro italic` | Nhẹ nhàng, tươi |
| **Luxury Silk** | `Cormorant SC` | `Raleway` | `Cormorant Garamond italic` | Cao cấp, mượt mà |
| **Warm** | `Sacramento` | `Nunito` | `Lora italic` | Ấm áp, thân mật |
| **Airy** | `Alex Brush` | `Quicksand` | `EB Garamond italic` | Thoáng, nhẹ |
| **Vietnamese** | `Great Vibes` | `Be Vietnam Pro` | `Be Vietnam Pro italic` | Lãng mạn + đọc tốt tiếng Việt |

**Font gợi ý theo vị trí:**

| Vị trí | Font gợi ý | Weight |
|--------|-----------|--------|
| Tên cặp đôi | Script: `Great Vibes`, `Sacramento`, `Alex Brush`, `Dancing Script` | 400 |
| Tiêu đề section | Serif: `Cormorant Garamond`, `Playfair Display`, `EB Garamond` (⚠️ KHÔNG dùng Cinzel) | 500-600 |
| Body text | Sans: `Quicksand`, `Nunito`, `Be Vietnam Pro` | 400-500 |
| Quote / thư tay | Serif italic: `Cormorant Garamond italic`, `Lora italic` | 400i |
| Label nhỏ | Sans light: `Quicksand 300`, `Raleway 300` | 300 |
| Ngày tháng | Serif: `Cormorant Garamond`, `EB Garamond` | 400 |

**Quy tắc font:**
- **Tối thiểu 2 font, khuyến khích 3**: heading script + body sans + accent serif italic
- **Dùng `font-display: swap`** trong Google Fonts URL
- **Font-size dùng `clamp()`** — responsive tự nhiên
- **Tránh font quá nặng** (>100KB) — ảnh hưởng tốc độ load trên mobile

**Font hỗ trợ tiếng Việt tốt nhất:**
- Body: `Be Vietnam Pro`, `Quicksand`, `Nunito`, `Montserrat`, `Lora`
- Heading serif: `Cormorant Garamond`, `Playfair Display`, `EB Garamond`
- Script (chỉ cho tên không dấu): `Great Vibes`, `Dancing Script`, `Sacramento`, `Alex Brush`

**⛔ TUYỆT ĐỐI KHÔNG dùng cho text có dấu:** `Cinzel`, `Cinzel Decorative`, `Italiana`, `Allura`, `Tangerine`

**Google Fonts URL mẫu (3 font):**
```html
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=Quicksand:wght@300;400;500;600;700&family=Great+Vibes&display=swap" rel="stylesheet">
```

## Phong cách thiết kế — Quy tắc bắt buộc

Thiệp cưới phải có cảm giác **organic, mềm mại, đa tầng** — KHÔNG được cứng, grid đều, khô khan.

### Layout — So le, đa tầng (BẮT BUỘC)

| Quy tắc | Cách làm |
|---------|---------|
| **Ảnh overlap** | 2 ảnh cạnh nhau phải chồng nhẹ (margin âm -20px~-30px), xoay nhẹ (-2deg/1.5deg) |
| **Cards so le** | Nếu có 2+ cards, card thứ 2 offset (translateX 8px hoặc margin-top 20-30px), xoay nhẹ |
| **Padding không đều** | Section quote/story: padding LỚN (5-7rem). Section info: padding NHỎ (2-3.5rem). Tạo rhythm |
| **Decorative dividers** | Giữa sections: ornament line + icon (❦, ✿, ♡). KHÔNG để sections sát nhau trống trơn |
| **Background texture** | Body có subtle radial-gradient spots (blush/rose, opacity cực thấp 0.03-0.05) |
| **Ảnh fade edge** | Ảnh lớn (hero/big photo) có gradient fade ở bottom (::after overlay) |
| **Curved dividers** | Ít nhất 1-2 section dùng clip-path ellipse/wave thay vì cắt thẳng |
| **Gift cards xoay** | Card 1: rotate(-1deg), card 2: rotate(0.5deg) + margin-top offset |
| **Ảnh peek dưới phong bì** | 2 ảnh nhỏ (110x80px) lấp ló dưới envelope, xoay -8deg/+6deg, viền trắng, shadow |
| **Sử dụng ảnh nhiều hơn** | Không chỉ hero + gallery — rải ảnh ở letter, love story, between sections |
| **Ảnh nền mờ sections** | Dùng ảnh couple làm bg mờ cho story/quote + lịch (opacity 6-8%, blur 2-3px, overlay 85-88%) |

### Font — Mềm mại, phân cấp rõ (BẮT BUỘC)

| Element | Font | Weight | Style |
|---------|------|--------|-------|
| Tên cặp đôi | **Script** (Great Vibes, Dancing Script, Alex Brush) | 400 | Size lớn clamp(3rem, 10vw, 5rem) |
| Section title | **Serif italic** (Cormorant Garamond italic, Playfair italic) | 500-600 | Thanh lịch |
| Body text | **Sans light** (Quicksand 300, Nunito 300, Be Vietnam Pro 300) | 300-400 | Nhẹ nhàng |
| Label/subtitle | Sans | 300-400 | Size NHỎ (0.6rem), letter-spacing RỘNG (0.3-0.4em), uppercase |
| Quote/thư tay | Serif italic | 400i | Mềm mại, cảm xúc |

**KHÔNG** dùng font-weight 600-700 cho body text. **KHÔNG** dùng font-size đều nhau.

### Decorative — Thêm chiều sâu (BẮT BUỘC)

- **Ornament dividers** giữa sections: thin line + floral symbol (❦ ✿ ♡ ❊)
- **Quote block**: border-radius lớn (20-24px), shadow mềm, dấu ngoặc kép `"` decorative (::before/::after)
- **Cards**: KHÔNG border cứng — dùng soft shadow + optional gradient line phía trên (::before)
- **Hero**: subtle radial-gradient glow (::before pseudo, opacity 0.1-0.2)
- **Scroll reveal**: translateY NHỎ (15-20px), duration DÀI (0.8-1s), easing mềm

### Sử dụng ảnh — rải khắp thiệp

| Vị trí | Cách dùng |
|--------|-----------|
| Hero / Big photo | Ảnh lớn full-width, gradient fade bottom |
| **Dưới phong bì (peek)** | 2 ảnh nhỏ xoay nghiêng lấp ló dưới envelope — polaroid style |
| **Love story** | Mỗi mốc kèm 1 ảnh nhỏ hoặc ảnh minh họa |
| **Giữa sections** | Ảnh strip/banner full-width, height 200px, object-fit cover |
| **Fly-in / Avatar đôi** | 2 ảnh chú rể + cô dâu overlap nhau, xoay nhẹ |
| Gallery slider | 6 ảnh slider hoặc grid |
| **Thank you / Footer** | Ảnh nền full-width + overlay text |
| **Quote block** | Ảnh nhỏ tròn kèm quote (optional) |

**Pattern: Ảnh peek dưới phong bì:**
```html
<div class="letter-peek-photos">
    <div class="letter-peek-photo"><img src="./couple_5.webp" alt=""></div>
    <div class="letter-peek-photo"><img src="./couple_3.webp" alt=""></div>
</div>
```
```css
.letter-peek-photos {
    position: absolute; bottom: -45px; left: 50%;
    transform: translateX(-50%);
    width: 280px; height: 90px; z-index: 0; pointer-events: none;
}
.letter-peek-photo {
    position: absolute; width: 110px; height: 80px;
    border-radius: 6px; overflow: hidden;
    box-shadow: 0 3px 15px rgba(0,0,0,0.1); border: 3px solid white;
}
.letter-peek-photo:nth-child(1) { left: 15px; bottom: 0; transform: rotate(-8deg); }
.letter-peek-photo:nth-child(2) { right: 15px; bottom: 5px; transform: rotate(6deg); }
```

### CSS patterns

```css
/* Ảnh overlap + xoay */
.fly-img:first-child { margin-right: -25px; transform: rotate(-2deg); }
.fly-img:last-child { margin-left: -25px; margin-top: 30px; transform: rotate(1.5deg); }

/* Cards so le */
.info-card:nth-child(2) { transform: translateX(8px); }
.gift-card:first-child { transform: rotate(-1deg); }
.gift-card:last-child { transform: rotate(0.5deg); margin-top: 10px; }

/* Background texture */
body::before {
    content: ''; position: fixed; inset: 0; z-index: -1; pointer-events: none;
    background: radial-gradient(circle at 20% 30%, rgba(232,180,162,0.04), transparent 50%),
                radial-gradient(circle at 80% 70%, rgba(212,135,143,0.03), transparent 50%);
}

/* Ornament divider */
.section-ornament {
    text-align: center; padding: 1.5rem 0;
    color: var(--blush); font-size: 0.8rem; letter-spacing: 0.5em;
}
.section-ornament::before, .section-ornament::after {
    content: ''; display: inline-block;
    width: 40px; height: 1px; background: var(--blush);
    vertical-align: middle; margin: 0 12px;
}

/* Section padding rhythm */
.section--breathe { padding: clamp(5rem, 12vw, 7rem) 1.5rem; }
.section--compact { padding: clamp(2rem, 5vw, 3.5rem) 1.5rem; }

/* Curved section divider */
.section-curved::before {
    content: ''; position: absolute; top: -30px; left: 0; right: 0;
    height: 60px; background: inherit;
    clip-path: ellipse(55% 100% at 50% 100%);
}
```

## Tham khảo mẫu 179 (`gen_179_blue-romantic-wedding`)

Mẫu 179 là reference design cho phong cách organic. Khi gen mẫu mới, đọc code.html của 179 để tham khảo:
- CSS patterns: overlap, rotation, ornament, rhythm
- HTML structure: section-ornament dividers, wrapper classes
- Font combination: Great Vibes + Cormorant Garamond italic + Quicksand light

# Wedding Sections — HTML Gen Details
> Extracted from gen-wedding.md — used as reference by /gen-wedding command

## Cấu trúc bắt buộc

```html
<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Thiệp Cưới - Tên Chú Rể & Tên Cô Dâu</title>
    <meta name="description" content="Thiệp mời đám cưới...">
    <!-- Google Fonts — chọn combo phù hợp -->
    <!-- Lucide Icons CDN -->
    <script src="https://unpkg.com/lucide@latest"></script>
    <!-- Tailwind CDN (optional) hoặc inline CSS -->
    <style>/* all styles inline */</style>
</head>
<body>
    <!-- 8+ sections bắt buộc -->
    <script>lucide.createIcons();</script>
    <script>/* Countdown + IntersectionObserver + Music + Effects */</script>
</body>
</html>
```

## Sections bắt buộc — Tối thiểu 8 sections

| # | Section | Bắt buộc | Nội dung |
|---|---------|----------|----------|
| 1 | **Header/Nav** | ✅ | Tên cặp đôi + nav links (scroll to section) + initials monogram |
| 2 | **Hero / Save the Date** | ✅ | Tên cô dâu & chú rể (font script/serif lớn), ngày cưới, decorative elements, ký hiệu "&" hoặc "♥", background ảnh hoặc gradient |
| 3 | **Countdown** | ✅ | Đếm ngược realtime đến ngày cưới (ngày, giờ, phút, giây), JS cập nhật mỗi giây |
| 4 | **Love Story Timeline** | ✅ | 3–5 mốc quan trọng (gặp nhau, hẹn hò, cầu hôn, đính hôn...), layout timeline dọc với connecting line, mỗi mốc có ngày + tiêu đề + mô tả ngắn |
| 5 | **Thông tin lễ cưới** | ✅ | Tuỳ loại thiệp (xem bảng bên dưới) |
| 6 | **Gallery ảnh** | ✅ | Grid 3–2–1 cột responsive, 6–9 ảnh Unsplash wedding, hover overlay effect, (optional: lightbox click zoom) |
| 7 | **RSVP** | ✅ | Form xác nhận: Họ tên, SĐT, Số khách (dropdown 1–5), Lời nhắn (textarea), Nút gửi. Form KHÔNG cần backend — chỉ UI |
| 8 | **Lời chúc / Wishes** | ✅ | Nếu có `sheet_id`: form gửi + danh sách + **floating bubbles** bay lên. Nếu không: lời chúc tĩnh |
| 9 | **Tờ lịch tháng** | ✅ | Lịch tháng đánh dấu ngày cưới + chú thích sự kiện. 3 variant: classic/elegant/minimal |
| 10 | **Bản đồ / Google Maps** | Có nếu có địa chỉ/link | Embed iframe + nút "Mở Google Maps" + "Chỉ đường". Thiệp đôi: 2 map cards |
| 11 | **Footer** | ✅ | Tên cặp đôi + ngày cưới + hearts animation + "Made with ♥" |

## Section "Thông tin lễ cưới" — Phân biệt theo loại thiệp

**A. Thiệp đơn — Nhà trai** (mặc định):
- Chỉ hiển thị **1 card**: **Lễ Thành Hôn** (tiệc cưới bên nhà trai)
- Tiêu đề section: "Lễ Thành Hôn" hoặc "Tiệc Cưới"
- Nội dung card: icon, ngày giờ, địa điểm nhà hàng/tiệc, địa chỉ
- Có thể thêm dòng "Trân trọng kính mời" với tên bố mẹ chú rể
- Hero/header có thể ghi: "Nhà trai trân trọng kính mời"

**B. Thiệp đơn — Nhà gái:**
- Chỉ hiển thị **1 card**: **Lễ Vu Quy** (tiệc bên nhà gái)
- Tiêu đề section: "Lễ Vu Quy"
- Nội dung card: icon, ngày giờ, địa điểm nhà gái/tiệc, địa chỉ
- Có thể thêm dòng "Trân trọng kính mời" với tên bố mẹ cô dâu
- Hero/header có thể ghi: "Nhà gái trân trọng kính mời"

**C. Thiệp đôi** (khi user yêu cầu "thiệp đôi"):
- Hiển thị **2 cards** cạnh nhau (grid 2 cột, responsive 1 cột trên mobile):
  - Card 1: **Lễ Vu Quy** — ngày giờ, địa điểm nhà gái, địa chỉ, tên bố mẹ cô dâu
  - Card 2: **Lễ Thành Hôn** — ngày giờ, địa điểm tiệc cưới, địa chỉ, tên bố mẹ chú rể
- Có thể thêm section **"Gia Đình Hai Bên"** giới thiệu bố mẹ cả 2 nhà (trước hoặc sau thông tin lễ)
- Hero hiển thị đầy đủ: tên cả 2 bên, "Trân trọng kính mời"

| Loại | Cards lễ cưới | Tên bố mẹ | Hero text |
|------|--------------|-----------|-----------|
| Đơn — Nhà trai | 1 (Lễ Thành Hôn) | Chỉ bố mẹ chú rể | "Nhà trai trân trọng kính mời" |
| Đơn — Nhà gái | 1 (Lễ Vu Quy) | Chỉ bố mẹ cô dâu | "Nhà gái trân trọng kính mời" |
| Đôi | 2 (Vu Quy + Thành Hôn) | Cả 2 bên | "Trân trọng kính mời" |

## Sections tuỳ chọn

| Section | Khi nào thêm |
|---------|-------------|
| **Dresscode** | User yêu cầu, hoặc theme formal |
| **Registry / Mừng cưới** | User yêu cầu |
| **Bản đồ** | User cung cấp địa chỉ cụ thể |
| **Video** | User cung cấp link YouTube |
| **Letter / Thư Ngỏ** | Phong bì toggle: mở → thư trượt ra + hearts bay. Đóng → thư trượt xuống chậm 1.8s biến mất sau thân. Thân phủ kín (top→bottom, z2) che thư (z1). 4 style. CSS mục 20 + JS mục 17 |
| **Bridesmaids & Groomsmen** | User yêu cầu |

## Envelope / Phần mở thiệp — Trang trí cầu kỳ (BẮT BUỘC)

Phần mở thiệp KHÔNG được để thô/đơn giản. LUÔN trang trí đầy đủ:

| Thành phần | Bắt buộc | Mô tả |
|------------|----------|-------|
| **Card frame** | ✅ | Glass-morphism card với `backdrop-filter: blur(16px)`, bo tròn 20-24px |
| **Viền đôi** | ✅ | `::before` solid border + `::after` dashed border bên trong card |
| **Corner ornaments** | ✅ | 4 góc có ❦ hoặc ✿ (ẩn trên mobile nhỏ) |
| **Ảnh nền blur** | ✅ | Ảnh couple blur 6px + overlay gradient phía sau |
| **Botanical deco** | ✅ | 4-6 emoji lá/hoa bay lơ lửng nền (🌿🍃☘️🌸), opacity 0.1-0.15 |
| **Hiệu ứng mở** | ✅ | Chọn 1 trong 3: **Ribbon bow** (nơ cởi ra, mục 20b) / **Padlock** (ổ khoá + chìa cắm xoay bật, mục 20c) / **Button** (nút đơn giản — chỉ dùng khi cần). Ưu tiên Ribbon bow hoặc Padlock |
| **Stagger animation** | ✅ | Mỗi element xuất hiện lần lượt (delay 0.15-0.2s giữa các element) |
| **Ảnh peek** | Tuỳ chọn | 2 ảnh nhỏ lấp ló dưới card, xoay nghiêng polaroid-style |

**Tuỳ chỉnh ribbon bow theo palette:**
```css
.ribbon-bow { --bow-color: var(--accent); --bow-color-dark: var(--accent-dark); --bow-glow: var(--accent-glow); }
```

## Decorative Animations — Trang trí vùng trống (BẮT BUỘC)

**LUÔN thêm 4-8 hiệu ứng trang trí** vào các vùng trống trong thiệp.
CSS-only từ `styles.css` mục 21 — chỉ cần `<span class="deco ...">` trong parent `position:relative`.

```html
<span class="deco deco-front deco-heart-beat deco-md deco-rose-color" style="top:10%;right:-20px;"></span>
```

**Vị trí bắt buộc đặt deco:**
- Bên cạnh tên cặp đôi (hero) → `deco-heart-beat` hoặc `deco-hearts-double`
- Giữa 2 ảnh bay vào → `deco-heart-float`
- Cạnh info card lễ cưới → `deco-rings` hoặc `deco-rose`
- Background thư tay → `deco-petals deco-back deco-faint`

**Modifiers:** `deco-front/back` (z-index), `deco-xs/sm/md/lg/xl` (size), `deco-rose-color/gold-color/...` (màu), `deco-faint/subtle/soft` (opacity)

Chi tiết: `README.md` mục 18.

## Countdown JS — BẮT BUỘC

```javascript
function updateCountdown() {
    const weddingDate = new Date('YYYY-MM-DDTHH:00:00').getTime();
    const now = new Date().getTime();
    const diff = weddingDate - now;

    if (diff <= 0) {
        document.querySelector('.countdown').innerHTML = '<p class="text-2xl">🎉 Hôn lễ đã diễn ra! 🎉</p>';
        return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    document.getElementById('days').textContent = String(days).padStart(2, '0');
    document.getElementById('hours').textContent = String(hours).padStart(2, '0');
    document.getElementById('minutes').textContent = String(minutes).padStart(2, '0');
    document.getElementById('seconds').textContent = String(seconds).padStart(2, '0');
}
updateCountdown();
setInterval(updateCountdown, 1000);
```

## Hiệu ứng đặc biệt — BẮT BUỘC ít nhất 1

**A. Hoa rơi (Falling Petals) — cho classic/romantic/garden:**
```javascript
function createPetal() {
    const petal = document.createElement('div');
    petal.classList.add('petal');
    petal.style.left = Math.random() * 100 + 'vw';
    petal.style.animationDuration = (Math.random() * 3 + 4) + 's';
    petal.style.opacity = Math.random() * 0.6 + 0.2;
    petal.style.fontSize = (Math.random() * 10 + 12) + 'px';
    petal.innerHTML = ['🌸', '🩷', '💮', '🏵️'][Math.floor(Math.random() * 4)];
    document.body.appendChild(petal);
    setTimeout(() => petal.remove(), 7000);
}
setInterval(createPetal, 800);
```
```css
.petal { position: fixed; top: -20px; z-index: 9999; pointer-events: none; animation: fall linear forwards; }
@keyframes fall { to { transform: translateY(110vh) rotate(720deg); opacity: 0; } }
```

**B. Confetti (cho fun/tropical/modern):**
```javascript
function createConfetti() {
    const confetti = document.createElement('div');
    confetti.classList.add('confetti');
    confetti.style.left = Math.random() * 100 + 'vw';
    confetti.style.background = ['#FFD700', '#FF69B4', '#87CEEB', '#98FB98', '#DDA0DD'][Math.floor(Math.random() * 5)];
    confetti.style.animationDuration = (Math.random() * 2 + 3) + 's';
    document.body.appendChild(confetti);
    setTimeout(() => confetti.remove(), 5000);
}
setInterval(createConfetti, 300);
```
```css
.confetti { position: fixed; top: -10px; width: 8px; height: 8px; z-index: 9999; pointer-events: none; animation: confetti-fall linear forwards; }
@keyframes confetti-fall { to { transform: translateY(110vh) rotate(1080deg); opacity: 0; } }
```

**C. Sparkles / Lấp lánh (cho luxury/elegant/dark):**
```javascript
function createSparkle() {
    const sparkle = document.createElement('div');
    sparkle.classList.add('sparkle');
    sparkle.style.left = Math.random() * 100 + 'vw';
    sparkle.style.top = Math.random() * 100 + 'vh';
    sparkle.innerHTML = '✨';
    sparkle.style.fontSize = (Math.random() * 8 + 8) + 'px';
    document.body.appendChild(sparkle);
    setTimeout(() => sparkle.remove(), 2000);
}
setInterval(createSparkle, 500);
```
```css
.sparkle { position: fixed; z-index: 9999; pointer-events: none; animation: sparkle-fade 2s ease-out forwards; }
@keyframes sparkle-fade { 0% { opacity: 0; transform: scale(0); } 50% { opacity: 1; transform: scale(1); } 100% { opacity: 0; transform: scale(0.5); } }
```

**D. Hearts floating (cho romantic/blush):**
```javascript
function createHeart() {
    const heart = document.createElement('div');
    heart.classList.add('floating-heart');
    heart.style.left = Math.random() * 100 + 'vw';
    heart.innerHTML = ['❤️', '💕', '💗', '💖'][Math.floor(Math.random() * 4)];
    heart.style.fontSize = (Math.random() * 10 + 10) + 'px';
    heart.style.animationDuration = (Math.random() * 3 + 4) + 's';
    document.body.appendChild(heart);
    setTimeout(() => heart.remove(), 7000);
}
setInterval(createHeart, 1000);
```

**Bảng gợi ý hiệu ứng theo phong cách:**

| Phong cách | Hiệu ứng chính | Hiệu ứng phụ |
|------------|----------------|---------------|
| Classic/Gold | Sparkles ✨ | — |
| Romantic/Blush | Hoa rơi 🌸 | Hearts 💕 |
| Rustic/Garden | Hoa rơi 🌸 | Lá rơi 🍃 |
| Modern/Minimalist | Sparkles nhẹ | — |
| Dark Luxury | Sparkles ✨ | Gold particles |
| Tropical/Fun | Confetti 🎊 | — |
| Boho/Vintage | Hoa rơi 🌸 | — |

## Nhạc nền — Code HTML (BẮT BUỘC)

```html
<button id="musicToggle" class="music-toggle" aria-label="Toggle music">
    <i data-lucide="volume-2" class="music-icon-on"></i>
    <i data-lucide="volume-x" class="music-icon-off"></i>
</button>
<audio id="bgMusic" loop preload="auto">
    <source src="../../../shared/music/{thể-loại}/{tên-file}.mp3" type="audio/mpeg">
</audio>
```

```css
.music-toggle {
    position: fixed; bottom: 24px; right: 24px;
    width: 48px; height: 48px; border-radius: 50%; border: none;
    background: var(--accent, #D4AF37); color: white; cursor: pointer;
    z-index: 1000; display: flex; align-items: center; justify-content: center;
    box-shadow: 0 4px 15px rgba(0,0,0,0.2); transition: transform 0.2s, box-shadow 0.2s;
}
.music-toggle:hover { transform: scale(1.1); box-shadow: 0 6px 20px rgba(0,0,0,0.3); }
.music-toggle .music-icon-off { display: none; }
.music-toggle.muted .music-icon-on { display: none; }
.music-toggle.muted .music-icon-off { display: block; }
```

```javascript
const musicBtn = document.getElementById('musicToggle');
const bgMusic = document.getElementById('bgMusic');
if (musicBtn && bgMusic) {
    bgMusic.volume = 0.3;
    let musicStarted = false;
    musicBtn.addEventListener('click', () => {
        if (!musicStarted) { bgMusic.play(); musicStarted = true; }
        else if (bgMusic.paused) { bgMusic.play(); musicBtn.classList.remove('muted'); }
        else { bgMusic.pause(); musicBtn.classList.add('muted'); }
    });
}
```

## Google Sheets API (nếu có sheet_id)

`wishes-api.js` là cổng giao tiếp thuần — chỉ cung cấp `sheetsAPI.post()` và `sheetsAPI.get()`.
Logic nghiệp vụ nằm trong `<script>` của `code.html`.

**Load script TRƯỚC script chính:**
```html
<script src="../../../shared/wedding/wishes-api.js"></script>
<script>
document.addEventListener('DOMContentLoaded', () => {
    const WISHES_SHEET = '<SHEET_ID_LOI_CHUC>';
    const RSVP_SHEET = '<SHEET_ID_RSVP>';
    // sheetsAPI.get(WISHES_SHEET).then(rows => { /* render, mỗi row có .A, .B, .C */ });
    // sheetsAPI.post(WISHES_SHEET, { A: name, B: message, C: time }).then(() => { /* reload */ });
    // sheetsAPI.post(RSVP_SHEET, { A: name, B: phone, C: guests, D: message, E: time });
});
</script>
```

**Quy tắc:**
- KHÔNG copy nội dung `wishes-api.js` vào code.html — luôn dùng `<script src>`
- Relative path: `../../../shared/wedding/wishes-api.js`
- Mỗi form có thể dùng sheet_id riêng hoặc chung
- Nếu user KHÔNG muốn → form UI-only (localStorage hoặc tĩnh)

## Floating Wishes — Bong bóng lời chúc bay lên

**2 mode:**
- **Local mode** (gen mẫu, không có sheet_id): dùng `initFloatingWishesLocal()` từ `scripts.js` mục 14b. Data: `DEFAULT_LOCAL_WISHES`. Form gửi → localStorage. LUÔN thêm khi gen mẫu (trừ gói Basic).
- **API mode** (gen theo khách, có sheet_id): dùng `initFloatingWishes()` từ `scripts.js` mục 14. Load từ `sheetsAPI.get()`.

**Nút toggle (BẮT BUỘC khi có floating wishes):**
```html
<!-- Đặt TRƯỚC nút nhạc -->
<button id="wishesToggle" class="wishes-toggle" aria-label="Toggle wishes">
    <i data-lucide="message-circle" class="wishes-icon-on"></i>
    <i data-lucide="message-circle-off" class="wishes-icon-off"></i>
</button>
```
Vị trí: `bottom: 80px, right: 24px` (trên nút nhạc `bottom: 24px`).

**Nền bong bóng:** `background: rgba(255, 182, 193, 0.3); backdrop-filter: blur(10px);`

**Màu chữ random 5 màu** qua class `fw-c1`→`fw-c5`: đỏ, xanh dương, tím, trắng, nâu.

CSS + JS chi tiết: `styles.css` mục 17 + `scripts.js` mục 14 + `README.md`

## Section Tờ Lịch Tháng (BẮT BUỘC)

```html
<section class="cal-section" id="calendar-month">
    <div class="section-heading">
        <p class="section-subtitle">Save The Date</p>
        <h2 class="section-title">Ngày Trọng Đại</h2>
    </div>
    <div id="weddingCalendar"></div>
</section>
```

```javascript
initCalendarMonth({
    containerId: 'weddingCalendar',
    month: <THÁNG_CƯỚI>,
    year: <NĂM_CƯỚI>,
    variant: '<classic|elegant|minimal>',
    accentColor: '<MÀU_ACCENT>',
    events: [
        { day: <NGÀY>, color: '<MÀU>', label: '<GIỜ> — <SỰ KIỆN>' },
    ]
});
```

**Chọn variant:** Traditional/Red → `classic` | Classic/Gold/Luxury → `elegant` | Modern/Minimal → `minimal`

CSS: `styles.css` mục 19 | JS: `scripts.js` mục 16 | Snippets: `README.md` mục 16

## Section Video YouTube (nếu user cung cấp link)

```html
<section class="video-section" id="video">
    <div class="section-heading">
        <p class="section-subtitle">Video</p>
        <h2 class="section-title">Kỷ Niệm Của Chúng Tôi</h2>
    </div>
    <div class="video-wrapper" data-video-id="VIDEO_ID">
        <img src="https://img.youtube.com/vi/VIDEO_ID/maxresdefault.jpg" alt="Video">
        <div class="video-play-btn">
            <svg viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
        </div>
    </div>
</section>
```

**Parse VIDEO_ID:** `youtube.com/watch?v=XXX` → `XXX` | `youtu.be/XXX` → `XXX`

```javascript
document.querySelectorAll('.video-wrapper[data-video-id]').forEach(function (w) {
    w.addEventListener('click', function () {
        var id = w.dataset.videoId;
        w.innerHTML = '<iframe src="https://www.youtube.com/embed/' + id + '?autoplay=1&rel=0" allow="accelerometer;autoplay;clipboard-write;encrypted-media;gyroscope;picture-in-picture" allowfullscreen></iframe>';
        w.style.cursor = 'default';
    }, { once: true });
});
```

CSS: `styles.css` mục 18 + `README.md` mục 15.

## Section Bản đồ — Google Maps

**3 loại URL:**

| URL | Mục đích | Format |
|-----|----------|--------|
| **Embed URL** | Nhúng iframe | `https://www.google.com/maps/embed?pb=...` |
| **Open URL** | Nút "Mở Google Maps" | `https://maps.google.com/?q=TÊN+ĐỊA+ĐIỂM` |
| **Direction URL** | Nút "Chỉ đường" | `https://www.google.com/maps/dir/?api=1&destination=ĐỊA+CHỈ+ENCODE` |

**Xử lý input:**

| User đưa gì | Embed iframe | Nút Mở Maps |
|-------------|-------------|-------------|
| Link embed (`/maps/embed?pb=...`) | Dùng trực tiếp | Tạo từ địa chỉ text |
| Link Google Maps thường | HỎI link embed hoặc tạo `?q=` | Dùng link gốc |
| Chỉ địa chỉ text | HỎI hoặc dùng `?q=` + `&output=embed` | `maps.google.com/?q=` + encode |

**HTML — Thiệp đơn (1 map):**
```html
<section id="map" class="map-section">
    <div class="section-heading">
        <p class="section-subtitle">Địa Điểm</p>
        <h2 class="section-title">Bản Đồ</h2>
    </div>
    <div class="map-wrapper">
        <iframe src="{EMBED_URL}" allowfullscreen="" loading="lazy"></iframe>
    </div>
    <div class="map-address">
        <i data-lucide="map-pin"></i>
        <span>{TÊN ĐỊA ĐIỂM}, {ĐỊA CHỈ}</span>
    </div>
    <div class="map-actions">
        <a href="{OPEN_URL}" target="_blank" rel="noopener" class="map-btn map-open-btn">
            <i data-lucide="external-link"></i> Mở Google Maps
        </a>
        <a href="{DIRECTION_URL}" target="_blank" rel="noopener" class="map-btn map-direction-btn">
            <i data-lucide="navigation"></i> Chỉ đường
        </a>
    </div>
</section>
```

**Thiệp đôi (2 maps):** Dùng `.map-grid` với 2 `.map-card`. Xem `README.md` mục 11.

CSS: `styles.css` mục 11.

## Animations bắt buộc

**A. Hero — stagger slide up:**
```css
.hero-title { animation: slide-up-hero 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.2s both; }
.hero-subtitle { animation: slide-up-hero 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.4s both; }
.hero-date { animation: slide-up-hero 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.6s both; }
@keyframes slide-up-hero {
    from { opacity: 0; transform: translateY(30px); }
    to { opacity: 1; transform: translateY(0); }
}
```

**B. Scroll reveal — IntersectionObserver (BẮT BUỘC):**
```javascript
document.addEventListener('DOMContentLoaded', () => {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) entry.target.classList.add('is-visible');
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
    document.querySelectorAll('[class*="animate-"]').forEach(el => observer.observe(el));
});
```

**C.** Hover — cards lift, images zoom, buttons glow

**D. Heartbeat:**
```css
@keyframes heartbeat {
    0%, 100% { transform: scale(1); }
    25% { transform: scale(1.15); }
    50% { transform: scale(1); }
    75% { transform: scale(1.1); }
}
```

## Ảnh mẫu cho thiệp cưới

**ƯU TIÊN dùng ảnh từ thư viện local** `products/shared/images/wedding/` — ảnh cặp đôi châu Á.
**KHÔNG dùng ảnh cặp đôi phương Tây** trừ khi user yêu cầu.

**Bước chọn ảnh:**
1. Đọc `products/shared/images/wedding/README.md` → xem danh sách bộ ảnh
2. Chọn bộ ảnh phù hợp tông màu:

| Palette thiệp | Bộ ảnh gợi ý | Folder |
|---------------|-------------|--------|
| Classic Gold, Blush Pink, Dusty Rose, Lavender | Hàn Quốc studio trắng kem | `korean-studio-white/` |
| Sage Green, Rustic | Vườn, ngoài trời | `korean-outdoor-nature/` |
| Traditional Red | Truyền thống đỏ | `chinese-traditional-red/` |
| Dark Luxury, Navy & Gold | Studio tối | `dark-luxury-studio/` |
| Tropical | Biển, nhiệt đới | `beach-tropical/` |

3. Dùng relative path: `../../../shared/images/wedding/{bộ-ảnh}/{file}.jpg`
4. Fallback: Unsplash với keyword `korean wedding couple`, `asian bride groom`

**Bộ ảnh `korean-studio-white/` — 6 ảnh:**

| File | Mô tả | Dùng cho |
|------|--------|----------|
| `cinelove_1.jpg` | Chính diện, nền kem, hoa | Hero, big photo |
| `cinelove_2.jpg` | Close-up lãng mạn | Letter, love story |
| `cinelove_3.jpg` | Close-up (variant 2) | Gallery |
| `cinelove_4.jpg` | Toàn thân, vui tươi | Avatar đôi, gallery |
| `cinelove_5.jpg` | Cận mặt, cười | Gallery, thank you |
| `cinelove_6.jpg` | Cận mặt, dịu dàng | Gallery, thank you bg |

**Quy tắc ảnh:**
- Ảnh phải có MẪU NGƯỜI — không dùng ảnh phong cảnh/hoa/venue làm ảnh chính
- Ưu tiên cặp đôi châu Á (Hàn/Trung/Việt)

## Icons Lucide phù hợp thiệp cưới

```
heart, heart-handshake, calendar, clock, map-pin, mail, phone,
gem, crown, sparkles, star, camera, image, music, gift,
glass-water, cake-slice, users, user-check, message-circle, send, check-circle
```

## Group Animations — Hiệu ứng nhóm items

| Class parent | Tên | Mô tả |
|-------------|-----|-------|
| `group-fade-in-all` | Fade In All | Tất cả items fade in, stagger delay |
| `group-slide-up-all` | Slide Up All | Tất cả items slide lên, stagger |
| `group-scale-in-all` | Scale In All | Tất cả items scale nhỏ → lớn, stagger |
| `group-flip-in-all` | Flip In All | Tất cả items flip rotateX vào, stagger |
| `group-slide-up-mix` | Slide Up Mix | Mỗi item random hướng |
| `group-fade-in-mix` | Fade In Mix | Mỗi item random hiệu ứng |

```html
<div class="group-slide-up-all">
    <div class="group-item">Card 1</div>
    <div class="group-item">Card 2</div>
</div>
```

**JS bắt buộc:**
```javascript
document.querySelectorAll('[class*="group-"] .group-item').forEach(function(el, i) {
    el.style.setProperty('--i', i);
});
var mixClasses = ['mix-fade-up', 'mix-slide-left', 'mix-slide-right', 'mix-scale', 'mix-flip', 'mix-blur'];
document.querySelectorAll('.group-fade-in-mix .group-item, .group-slide-up-mix .group-item').forEach(function(el) {
    el.classList.add(mixClasses[Math.floor(Math.random() * mixClasses.length)]);
});
```

**IntersectionObserver cho group (observe parent):**
```javascript
var groupObserver = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
        if (entry.isIntersecting) entry.target.classList.add('is-visible');
    });
}, { threshold: 0.1 });
document.querySelectorAll('[class*="group-"]').forEach(function(el) {
    groupObserver.observe(el);
});
```

| Section | Group animation gợi ý |
|---------|----------------------|
| Gallery | `group-fade-in-mix` hoặc `group-scale-in-all` |
| Love Story Timeline | `group-slide-up-all` |
| Event Cards | `group-fade-in-all` |
| Guestbook wishes | `group-slide-up-all` |
| Gift Box cards | `group-scale-in-all` |

## Lưu ý dùng ảnh shared assets

**Ảnh webp từ `products/shared/` thường có nền trắng/nhạt không transparent.** Khi đặt lên nền màu sẽ lộ viền.

**Giải pháp:**
1. **SVG inline** cho corners/dividers — KHÔNG bao giờ bị lộ viền
2. Nếu buộc dùng webp → fade 4 cạnh:
```css
.env-chibi, .env-divider, .hero-chibi, .closing-chibi, .divider-img, .event-flower, .family-sep img {
    -webkit-mask-image: radial-gradient(ellipse 75% 75% at center, black 45%, transparent 95%);
    mask-image: radial-gradient(ellipse 75% 75% at center, black 45%, transparent 95%);
}
```

**Tên bố mẹ trong section Gia Đình:** Chỉ ghi "Ông/Bà + Họ tên". KHÔNG ghi "Thân phụ", "Thân mẫu" — thừa vì đã có label.

**Tên couple responsive:** `font-size: clamp(1.4rem, 6vw, 3rem)` + `white-space: nowrap`. Min ~1.4rem cho màn 320px.

---
name: gen-wedding
description: "Gen thiệp cưới HTML + nhạc nền + prompt.txt + thêm entry vào data.js. Hoặc gen theo khách từ folder có prompt.txt đã điền."
---

Gen thiệp cưới HTML + nhạc nền + prompt.txt + thêm entry vào data.js. Hoặc gen theo khách từ folder có prompt.txt đã điền.

Argument: $ARGUMENTS — mô tả yêu cầu thiệp cưới, hoặc đường dẫn folder khách.

**2 chế độ:**
- **Gen mẫu** (mặc định): tạo `code.html` + `prompt.txt` → mẫu trống cho khách chọn. Screenshots chụp sau khi user kiểm tra và xác nhận OK
- **Gen theo khách**: đọc folder khách (có `prompt.txt` đã điền + ảnh) → gen thiệp với thông tin khách

**2 loại thiệp:**
- **Thiệp đơn** (mặc định): 1 bên — nhà trai HOẶC nhà gái. 1 sự kiện (Lễ Vu Quy hoặc Lễ Thành Hôn).
- **Thiệp đôi**: Đủ thông tin CẢ 2 nhà. Section lễ cưới có 2 cards với địa điểm/thời gian khác nhau.

Ví dụ:
- `"thiệp cưới Minh & Lan, 15/06/2026, classic gold"` → thiệp đơn (mặc định)
- `"thiệp đôi Minh & Lan, 15/06/2026, blush pink"` → thiệp đôi
- `"thiệp nhà gái Lan, 15/06/2026, sage green"` → thiệp đơn bên nhà gái
- `"3 mẫu thiệp cưới: rustic garden, modern minimalist, luxury dark"`
- Kèm ảnh mockup: `"gen theo ảnh này, đổi tông hồng pastel"`
- **Gen theo khách**: `"gen theo khách, folder: products/Web/Invitation/khach_minh_lan/"`
- **Gen theo khách**: `"customise mẫu #177 từ folder khach_abc"`

---

## Khác biệt so với /gen-landing

| Đặc điểm | /gen-landing | /gen-wedding |
|-----------|-------------|-------------|
| Nhạc nền | Chỉ khi user yêu cầu | **LUÔN CÓ** (mặc định folder `wedding/` hoặc `romantic/`) |
| Category | Mặc định `onepage` | Mặc định `invitation` |
| Sections | Generic | Wedding-specific (countdown, love story, RSVP, gallery, lời chúc) |
| Hiệu ứng | Standard | **Thêm hoa rơi / confetti / sparkles** |
| Bảng màu | Theo chủ đề | Wedding palettes (gold, blush, sage, navy...) |
| Font | Generic | Serif/script elegant (Playfair Display, Cormorant Garamond, Great Vibes...) |
| Tên mặc định | Cô Dâu & Chú Rể | Random từ `products/shared/wedding/names.js` |
| Loại thiệp | Không có | **Thiệp đơn** (mặc định) hoặc **Thiệp đôi** |

---

## Quy trình

### Bước 1: Parse yêu cầu

Từ `$ARGUMENTS`, xác định **chế độ**:
- Keywords: `"gen theo khách"`, `"folder khách"`, `"customise"`, `"customize"`, `"từ folder"` → **Quy trình B**
  > 📖 Chi tiết Quy trình B: xem `.claude/refs/wedding-process-b.md`
- Ngược lại → **Gen mẫu** (tiếp tục bên dưới)

Xác định thêm:
- **Số lượng mẫu** (mặc định 1)
- **Loại thiệp**: `"thiệp đôi"` / `"đủ 2 nhà"` → đôi | `"thiệp nhà trai"` → đơn nhà trai | `"thiệp nhà gái"` → đơn nhà gái | không nói gì → đơn nhà trai
- **Tên cặp đôi**: nếu user cung cấp thì dùng, nếu không → **BẮT BUỘC** random từ `products/shared/wedding/names.js`:
  - `.display` (chỉ tên, VD: "Minh") → ký hiệu `&` ở hero, monogram
  - `.displayDT` (đệm + tên, VD: "Văn Minh") → hero tên lớn, envelope, thông tin lễ, couple section
  - `.full` (họ đệm tên) → thông tin gia đình, sidebar
  - **KHÔNG hardcode "Minh & Ngọc" hay bất kỳ tên cố định nào**
- **Ngày cưới** (nếu có → dùng cho countdown, nếu không → ngày mẫu trong tương lai)
- **Phong cách/theme** (classic gold, rustic, modern, blush pink, dark luxury, tropical...)
- **Google Sheets API**:
  - Gen mẫu → **MẶC ĐỊNH UI-ONLY + FLOATING LOCAL**: dùng `initFloatingWishesLocal()`. KHÔNG load `wishes-api.js`. KHÔNG hỏi sheet_id.
  - Gen theo khách (Quy trình B) → kiểm tra prompt.txt có `sheet_id` không → nếu có thêm API
  - User chủ động cung cấp `sheet_id` → thêm API dù là gen mẫu
- **Google Maps**: có link → thêm section bản đồ | có địa chỉ text nhưng không có link → **HỎI USER** xin link embed | không có → bỏ qua
- **Danh sách khách mời**: có `khach_moi.csv` → convert sang `guests.js` + thêm personalization
  > 📖 Chi tiết guest personalization: xem `.claude/refs/wedding-process-b.md` (Bước 5c)
- Có ảnh đính kèm → phân tích layout, màu sắc, phong cách từ ảnh

### Bước 1a: Research mẫu tham khảo (tuỳ chọn)

Nếu user cung cấp **URL tham khảo** hoặc **mã mẫu có sẵn** (`"style giống #179"`, `"tham khảo cinelove.me/7"`):

1. **Mở URL bằng agent-browser** (hoặc đọc file HTML nếu là mẫu local):
   - Navigate đến URL → scroll toàn trang
   - Chụp screenshot từng section (mobile viewport 390px)
   - Lấy snapshot DOM structure

2. **Phân tích design** — rút ra:
   - **Layout**: section order, grid/flex, spacing rhythm, overlap patterns
   - **Color palette**: dominant colors, accent, background tones
   - **Typography**: font families, sizes, weights, letter-spacing
   - **Effects/Animations**: scroll reveal, particles, parallax, transitions
   - **Decorative elements**: dividers, frames, icons, botanical overlays
   - **Envelope style**: cách mở thiệp (wax seal, ribbon, card flip, gate...)

3. **Output**: design spec tóm tắt → dùng làm input cho Bước 5 (gen HTML)

**Nếu KHÔNG có URL tham khảo** → bỏ qua bước này, dùng style preset hoặc sáng tạo mới.

> 📖 Bài học thiết kế từ các mẫu trước: xem `.claude/refs/wedding-lessons.md`

### Bước 1b: Chiến lược song song (khi ≥ 2 mẫu)

**1 mẫu** → chạy tuần tự. **2–5 mẫu** → spawn song song bằng Agent tool (tất cả trong cùng 1 message):

**Chuẩn bị chung trước khi spawn:**
1. Đọc thư viện wedding: `styles.css`, `scripts.js`, `wishes-api.js`, `README.md` trong `products/shared/wedding/`
2. Đọc `products/shared/animations.css`
3. Đọc `assets/js/data.js` → tìm ID lớn nhất → phân ID cho từng mẫu
4. Liệt kê file nhạc trong `products/shared/music/wedding/` và `romantic/`

**Mỗi agent nhận:** ID, tên cặp đôi, ngày cưới, phong cách, nội dung wedding library, đường dẫn nhạc.
**Mỗi agent trả về:** `{ id, name, slug, description, category, type, tags, folder, features[], demoUrl }`
**KHÔNG chụp screenshot** — đợi user xác nhận.

Sau khi agents xong: merge entries vào `data.js`, cập nhật `products.md`, báo cáo + hỏi user kiểm tra.

> Tối đa **5 agents đồng thời**. Nếu > 5 mẫu → chia batch.

### Bước 2: Đọc thư viện wedding + animation

Đọc **4 file**:
1. `products/shared/wedding/styles.css` — CSS components
2. `products/shared/wedding/scripts.js` — JS components
3. `products/shared/wedding/wishes-api.js` — transport layer (KHÔNG copy vào code.html, dùng `<script src>`)
4. `products/shared/wedding/README.md` — HTML snippets + layout patterns

Và đọc `products/shared/animations.css` để chọn scroll animations.

**Ưu tiên copy từ thư viện** thay vì viết mới. Nếu tạo component mới → thêm vào thư viện sau (Bước 9).

### Bước 2b: Chọn ảnh trang trí từ catalog

`products/shared/wedding-data.js` là **catalog duy nhất** cho toàn bộ ảnh trang trí —
`WEDDING_DATA.backgrounds` / `.icons` / `.elements`, mỗi item có `tags` + `usage` để lọc.
Đừng tự đi `ls` từng folder ảnh, cũng đừng vẽ lại bằng CSS thứ catalog đã có sẵn.

```bash
node -e "
const fs=require('fs'),vm=require('vm');
const ctx={}; vm.createContext(ctx);
vm.runInContext(fs.readFileSync('products/shared/wedding-data.js','utf8'), ctx);
const D=ctx.WEDDING_DATA;
// Đổi 'gold' thành tag cần tìm: heritage, floral, watercolor, corner, divider, frame...
D.elements.items.filter(e=>e.tags.includes('gold'))
  .forEach(e=>console.log(D.elements.basePath+e.file, '|', e.tags.join(',')));
"
```

Hai bộ element:

| Folder | Nội dung | Hợp với |
|--------|----------|---------|
| `wedding-elements/` | Hoa lá watercolor, khung, vòng hoa, chibi, art deco | Thiệp cưới hiện đại, pastel, botanical |
| `heritage-elements/` | Vàng kim truyền thống Việt: rồng, hạc chầu rùa, vân mây, hồi văn, sen, lư hương, trống đồng, câu đối, cuốn thư | Giỗ tổ, lễ họ, tân gia, khánh thành, **thiệp cưới tông đỏ/vàng cổ điển** |

⚠ Ảnh `heritage-elements/` có **alpha thật** → đặt lên nền màu bất kỳ không lộ viền, KHÔNG cần `mask-image`.
Ảnh cũ trong `wedding-elements/` nhiều cái nền trắng → vẫn cần `mask-image` (xem wedding-lessons.md).

Xem trực quan cả bộ: mở `thu-vien-hieu-ung.html`.

### Bước 3: Tìm ID tiếp theo

Đọc `assets/js/data.js` → tìm `id:` lớn nhất → ID mới = max + 1.

### Bước 3b: Dòng thương hiệu cuối thiệp (BẮT BUỘC)

Section cuối (Closing / Cảm ơn) **luôn** có link `templexa.vn` — ghi hẳn đường dẫn, không ghi "Templexa" suông:

```html
<a class="closing-brand" href="https://templexa.vn" target="_blank" rel="noopener">Thiệp cưới online · <b>templexa.vn</b></a>
```
Biến thể: `Made with love · templexa.vn` · `Thiết kế bởi templexa.vn`. Chữ nhỏ, chữ hoa giãn cách, màu phụ, opacity ~0.7. Chi tiết: `/gen-wedding-pro` mục 4D-bis.

### Bước 4: Chọn nhạc nền (BẮT BUỘC)

**Thiệp cưới LUÔN có nhạc nền.**

| Phong cách thiệp | Folder nhạc | Gợi ý bài |
|------------------|-------------|-----------|
| Classic, elegant, gold | `wedding/` | A Thousand Years, Beautiful In White |
| Romantic, blush, pastel | `romantic/` | Endless Love, Only Love |
| Modern, minimalist | `wedding/` | Sugar |
| Rustic, garden, boho | `romantic/` | Everyday I Love You |
| Dark luxury, dramatic | `wedding/` | A Thousand Years |
| Tropical, fun | `wedding/` | Sugar |

```bash
ls products/shared/music/wedding/*.mp3
ls products/shared/music/romantic/*.mp3
```

**Relative path từ code.html:**
```
products/Web/Invitation/{folder}/code.html → ../../../shared/music/{loại}/{file}.mp3
```

### Bước 5: Gen HTML thiệp cưới

Tạo folder `products/Web/Invitation/gen_{id}_{keywords}/` → tạo `code.html` self-contained.

**Yêu cầu tối thiểu:** 8 sections, countdown realtime, ít nhất 1 hiệu ứng đặc biệt, nhạc nền, RSVP form, love story timeline, floating wishes (gói Premium+).

> 📖 Chi tiết sections, HTML snippets, CSS patterns, effects code: xem `.claude/refs/wedding-sections.md`
> 📖 Bảng màu, font rules, design patterns, CSS organic layout: xem `.claude/refs/wedding-design-rules.md`
> 📖 Ràng buộc ảnh responsive, font load, bảng giá theo gói: xem `.claude/refs/wedding-constraints.md`

### Bước 5b: Tạo `prompt.txt` (CHỈ khi gen mẫu)

Sau khi gen `code.html`, tạo `prompt.txt` trong cùng folder — form điền thông tin cho khách.
Phân tích `code.html` vừa gen để sinh bảng ảnh ĐỘNG (số lượng anh_doi_*, anh_gallery_* đúng thực tế).

> 📖 Template đầy đủ + quy tắc sinh bảng ảnh: xem `.claude/refs/wedding-prompt-template.md`

### Bước 5c: Xử lý danh sách khách mời (nếu có)

Nếu có `khach_moi.csv` → parse → sinh `guests.js` → thêm personalization vào `code.html`.

> 📖 Chi tiết parse CSV, guests.js format, JS personalization: xem `.claude/refs/wedding-process-b.md` (Bước 5c)

### Bước 6: Chụp ảnh tự động bằng Puppeteer

**KHÔNG chụp ngay.** Sau khi gen xong → hỏi user kiểm tra trước:
> "Mẫu đã gen xong. Bạn kiểm tra và cho mình biết khi nào OK để chụp ảnh màn hình nhé!"

Khi user xác nhận → chụp desktop (2–5 viewport 1280x800) + mobile (440x956 @3x) → convert WebP → cập nhật `images[]` trong `data.js`.

> 📖 Puppeteer scripts đầy đủ (desktop, mobile, WebP convert): xem `.claude/refs/wedding-screenshot.md`

### Bước 7: Thêm entry vào `data.js`

Chèn trước `];` đóng mảng PRODUCTS:

```javascript
    {
        id: <auto_increment>,
        name: 'Thiệp Cưới - <Tên Chú Rể> & <Tên Cô Dâu>',
        slug: 'thiep-cuoi-<slug>',
        description: 'Thiệp mời đám cưới <phong cách>...',
        category: 'wedding',            // 'wedding' | 'other' (dạm ngõ/ăn hỏi vẫn 'wedding', phân biệt bằng event)
        type: 'invitation',
        style: '<traditional|modern|minimalist|luxury|floral|vintage>',
        event: '<wedding|dam-ngo|an-hoi|...>',
        tags: ['wedding', '<đơn|đôi>', '<phong cách>'],
        price: '',
        images: ['./<folder>/screen_1.webp', './<folder>/screen_2.webp'],
        thumbnail: './<folder>/screen_1.webp',
        mobileView: '',                 // gán sau khi chạy shoot:mobile (bên dưới)
        path: './<folder>/',
        demoUrl: './<folder>/code.html',
        variants: [],                   // chỉ điền nếu mẫu có nhiều phiên bản (xem fact 5 — mỗi phiên bản là 1 entry riêng, variants:false)
        features: ['Đếm ngược ngày cưới realtime', 'Nhạc nền lãng mạn', 'Hiệu ứng hoa rơi / sparkles'],
        status: '',                     // KHÔNG dùng 'new' — badge NEW tự tính từ updatedAt (isNewProduct)
        featured: false,
        priority: 0,
        downloads: <random 1-10>,
        rating: <random 4.7-4.9>,
        showInSlider: false,
        isPublic: false,
        updatedAt: '<YYYY-MM-DD>',
    },
```

Sau khi entry đã có trong `data.js`, chụp ảnh mobile + chọn `mobileView` (KHÔNG còn `assets/data/invitation.json` — đã xoá, mọi dữ liệu thiệp nằm inline trong `data.js`):

```bash
npm run shoot:mobile -- --ids <id>
```

Script xuất `<folder>/shots/{cover,open,sec-N,full}.webp` + `manifest.json` (KHÔNG tự sửa `data.js`). Chọn ảnh đẹp nhất (thường `cover.webp` hoặc `open.webp`) → gán vào `mobileView`, thêm các shot dọc phù hợp vào `images[]`, rồi chạy `npm run build:sitemap`.

- **Priority** luôn `0` khi gen mới (chỉ là bucket, không phải thứ tự hiển thị chi tiết — `100` chỉ dành cho mẫu legacy cũ). **Tags** luôn bao gồm `'wedding'`.
- Sửa `data.js` bằng tay dễ lệch định dạng — có thể dùng `scripts/lib/products-io.js` (`load()`/`save()`) khi sửa bằng script.

### Bước 8: Cập nhật `products/products.md`

Cập nhật bảng tổng hợp + danh sách chi tiết.

### Bước 9: Cập nhật thư viện (nếu có component/animation mới)

- Animation mới → `products/shared/animations.css`
- CSS component mới → `products/shared/wedding/styles.css`
- JS function mới → `products/shared/wedding/scripts.js`
- HTML snippet mới → `products/shared/wedding/README.md`

### Bước 9b: Gen mã QR (nếu user cung cấp base URL)

1. Tạo folder `qr/` trong folder sản phẩm
2. Gen `qr_chung.png` (link không có `?id`)
3. Nếu có `guests.js` + gói Premium/Custom → gen QR riêng từng khách
4. Tạo `qr-preview.html` (grid 3 cột để in)

Dùng `npm qrcode` (đã cài sẵn). Chi tiết: xem skill `/gen-qr`.

### Bước 10: Báo cáo

```
✅ Đã tạo <N> thiệp cưới:

| # | ID | Tên | Phong cách | Nhạc | Demo |
|---|----|-----|-----------|------|------|
| 1 | 177 | Thiệp Cưới - Minh & Lan | Classic Gold | A Thousand Years | [Xem](demoUrl) |

🎵 Nhạc nền: <tên bài> (folder: wedding/)
🌸 Hiệu ứng: hoa rơi + sparkles
⏱️ Countdown: <ngày cưới>
💌 RSVP form: có
📝 prompt.txt: có — khách điền thông tin để customise

📸 **Chưa chụp screenshot** — bạn kiểm tra mẫu và cho mình biết khi nào OK để chụp ảnh nhé!
```

---

## Song song — Quy tắc

- **1 mẫu** → tuần tự, KHÔNG spawn agent
- **2–5 mẫu** → spawn song song, mỗi mẫu 1 agent (cùng 1 message)
- **> 5 mẫu** → chia batch 5
- Tối đa **5 agents đồng thời**
- Mỗi agent tự hoàn thành: HTML + prompt.txt (KHÔNG chụp screenshot)
- `data.js`, `products.md`, `animations.css` cập nhật tập trung sau khi tất cả agents xong
- Phân ID trước khi spawn

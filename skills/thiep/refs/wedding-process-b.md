# Wedding Process B — Gen theo khách hàng + Guest List
> Extracted from gen-wedding.md — used as reference by /gen-wedding command

## Khi nào dùng Quy trình B

User bảo một trong các dạng:
- `"gen thiệp theo khách, folder: products/Web/Invitation/khach_minh_lan/"`
- `"gen thiệp cưới từ folder khách: ..."`
- `"customise mẫu #177 theo folder: ..."`
- Keywords: `"gen theo khách"`, `"folder khách"`, `"customise"`, `"customize"`, `"từ folder"`

## Cấu trúc folder khách

Khách (hoặc user) chuẩn bị folder chứa:

```
khach_ten_co_dau_chu_re/
├── prompt.txt          ← đã điền thông tin (copy từ mẫu gốc)
├── anh_bia.jpg         ← ảnh khách gửi (tuỳ chọn)
├── anh_doi_1.jpg       ← ảnh couple (tuỳ chọn)
├── anh_doi_2.jpg
├── anh_gallery_1.jpg   ← ảnh gallery (tuỳ chọn)
├── anh_gallery_2.jpg
├── anh_qr.jpg          ← QR mừng cưới (tuỳ chọn)
└── ...
```

## Quy trình chi tiết

### Bước B1: Đọc folder khách

1. `ls` folder → liệt kê tất cả file
2. Đọc `prompt.txt` → parse thông tin:
   - **Mã mẫu** → tìm folder mẫu gốc (VD: `#177` → `products/Web/Invitation/gen_177_xxx/`)
   - **Thông tin cặp đôi**: tên chú rể, cô dâu, ngày cưới, giờ
   - **Thông tin gia đình**: bố mẹ 2 bên
   - **Thông tin lễ cưới**: ngày giờ, địa điểm, địa chỉ
   - **Love story**: các mốc (ngày, tiêu đề, mô tả)
   - **Google Sheets**: sheet_id cho lời chúc, sheet_id cho RSVP (nếu có)
   - **Tuỳ chọn**: nhạc, lời chúc, dresscode, link maps, video, ghi chú
3. Liệt kê ảnh khách gửi → map với tên file quy ước

### Bước B2: Đọc mẫu gốc

1. Tìm mẫu gốc theo mã mẫu trong `prompt.txt`
2. Đọc `code.html` của mẫu gốc → làm base template
3. Nếu không tìm thấy mẫu → thông báo lỗi, hỏi user

### Bước B3: Gen code.html cho khách

Dựa trên `code.html` mẫu gốc, **thay thế** nội dung:

| Nội dung | Thay bằng | Nếu trống |
|----------|-----------|-----------|
| Tên chú rể & cô dâu | Tên từ prompt | Giữ tên mẫu |
| Ngày cưới + countdown | Ngày từ prompt | Giữ ngày mẫu |
| Giờ làm lễ | Giờ từ prompt | Giữ giờ mẫu |
| Tên bố mẹ | Tên từ prompt | Giữ mẫu hoặc bỏ dòng |
| Địa điểm lễ cưới | Địa điểm từ prompt | Giữ mẫu |
| Love story | Các mốc từ prompt | Giữ nội dung mẫu |
| Ảnh Unsplash | → `./anh_bia.jpg` ... | Giữ ảnh Unsplash mẫu |
| Nhạc nền | File nhạc khách chọn | Giữ nhạc mẫu |
| Lời chúc / quote | Nội dung khách | Giữ mẫu |
| Sheet ID (wishes) | sheet_id từ prompt | Giữ mẫu hoặc form UI-only |
| Sheet ID (RSVP) | sheet_id từ prompt | Giữ mẫu hoặc form UI-only |
| Link Google Maps | Link từ prompt | Bỏ hoặc giữ mẫu |
| Video YouTube | Link từ prompt | Bỏ section |

**Quy tắc thay ảnh:**
- Quét folder khách → tìm file ảnh match tên quy ước (`anh_bia.*`, `anh_doi_1.*`, ...)
- Nếu có → thay URL Unsplash → relative path `./anh_bia.jpg`
- Nếu không có → **giữ nguyên ảnh Unsplash** của mẫu
- Hỗ trợ cả `.jpg`, `.jpeg`, `.png`, `.webp`

```
Ví dụ thay thế trong code.html:
- src="https://images.unsplash.com/photo-xxx?w=1920" → src="./anh_bia.jpg"
- src="https://images.unsplash.com/photo-yyy?w=600"  → src="./anh_doi_1.jpg"
```

### Bước B4: Ghi file

1. Ghi `code.html` vào folder khách (OVERWRITE nếu đã có)
2. **KHÔNG chụp screenshot ngay** — hỏi user kiểm tra trước (giống Bước 6)
3. Khi user xác nhận OK → chạy Puppeteer chụp screenshot desktop + mobile + convert WebP

### Bước B5: Thêm vào data.js

Thêm entry mới (KHÔNG thay thế mẫu gốc):

```javascript
    {
        id: <auto_increment>,
        name: 'Thiệp Cưới - <Tên Chú Rể> & <Tên Cô Dâu>',
        slug: 'thiep-cuoi-<slug>',
        description: 'Thiệp mời đám cưới của <tên>...',
        category: 'wedding',            // 'wedding' | 'other'
        type: 'invitation',
        style: '<traditional|modern|minimalist|luxury|floral|vintage>',
        event: '<wedding|dam-ngo|an-hoi|...>',
        tags: ['wedding', 'custom', '<phong-cách>'],
        // tag 'custom' để phân biệt với mẫu gốc
        price: '',
        images: ['./<folder-khách>/screen_1.webp', ...],
        thumbnail: './<folder-khách>/screen_1.webp',
        mobileView: '',                 // gán sau khi chạy shoot:mobile
        path: './<folder-khách>/',
        demoUrl: './<folder-khách>/code.html',
        variants: [],
        features: [...],   // copy từ mẫu gốc
        status: '',                     // KHÔNG dùng 'new' — badge NEW tự tính từ updatedAt
        featured: false,
        priority: 0,
        downloads: <random 1-10>,
        rating: <random 4.7-4.9>,
        showInSlider: false,
        isPublic: false,
        updatedAt: '<YYYY-MM-DD>',
    },
```

Sau khi entry đã có trong `data.js`, chạy `npm run shoot:mobile -- --ids <id>` → chọn ảnh đẹp nhất gán vào `mobileView` (giống Bước 7). KHÔNG còn `assets/data/invitation.json` — mọi dữ liệu thiệp nằm inline trong `data.js`.

### Bước B6: Báo cáo

```
✅ Đã gen thiệp cưới cho khách:

| Thông tin | Giá trị |
|-----------|---------|
| Mẫu gốc | #{id_mẫu} — {tên mẫu} |
| Cặp đôi | {tên chú rể} & {tên cô dâu} |
| Ngày cưới | {dd/mm/yyyy} |
| Ảnh khách | {N} ảnh (thay thế {M} vị trí) |
| Ảnh mẫu | Giữ {K} vị trí (khách không gửi) |
| Nhạc | {tên bài} |
| Folder | {đường dẫn} |
| Demo | [Xem]({demoUrl}) |

📸 **Chưa chụp screenshot** — bạn kiểm tra mẫu và cho mình biết khi nào OK để chụp ảnh nhé!
```

## Ràng buộc Quy trình B

- **KHÔNG xoá/sửa mẫu gốc** — luôn tạo file mới trong folder khách
- **KHÔNG copy ảnh** — dùng relative path đến ảnh trong folder khách
- Nếu khách không điền field → **giữ nguyên nội dung mẫu**, không để trống
- Nếu khách không gửi ảnh nào → **giữ nguyên ảnh Unsplash** của mẫu
- **Nhạc**: nếu khách chọn nhạc khác → đổi relative path, nếu trống → giữ nhạc mẫu
- Tag `'custom'` trong entry data.js để phân biệt sản phẩm custom vs mẫu
- `prompt.txt` trong folder khách giữ nguyên (không xoá) — làm record thông tin

---

## Bước 5c: Xử lý danh sách khách mời (nếu có)

Nếu folder có file `khach_moi.csv` hoặc `khach_moi.xlsx`:

### 1. Đọc file → parse danh sách

**CSV** (ưu tiên, zero dependency):
```bash
node -e "
const fs = require('fs');
const lines = fs.readFileSync('khach_moi.csv', 'utf8').trim().split('\n');
const header = lines[0].split(',').map(h => h.trim());
const idCol = header.findIndex(h => /^(id|stt)$/i.test(h));
const nameCol = header.findIndex(h => /^(tên|ten|name)$/i.test(h));
const msgCol = header.findIndex(h => /^(lời mời|loi moi|message)$/i.test(h));

const guests = [];
for (var i = 1; i < lines.length; i++) {
    var cols = lines[i].split(',').map(c => c.trim());
    if (!cols[nameCol]) continue;
    guests.push({
        id: parseInt(cols[idCol]) || i,
        name: cols[nameCol],
        message: cols[msgCol] || 'Trân trọng kính mời'
    });
}
console.log('var GUEST_LIST = ' + JSON.stringify(guests, null, 4) + ';');
"
```

**XLSX**: yêu cầu user export CSV từ Excel/Google Sheets. Nếu chỉ có xlsx → dùng `npx xlsx-cli` hoặc đọc thủ công.

### 2. Sinh file `guests.js` trong cùng folder sản phẩm

```javascript
var GUEST_LIST = [
    { id: 1, name: "Anh Nguyễn Văn A", message: "Nhà trai trân trọng kính mời" },
    { id: 2, name: "Chị Trần Thị B", message: "Kính mời" },
    // ...
];
```

### 3. Thêm vào code.html (nếu chưa có)

**HTML** — thêm `.guest-name-display` sau `.envelope-invite-text` và `.hero-invite-label`:
```html
<p class="envelope-invite-text guest-invite-text">Nhà trai trân trọng kính mời</p>
<p class="guest-name-display"></p>

<p class="hero-invite-label guest-invite-text">Nhà Trai Trân Trọng Kính Mời</p>
<p class="guest-name-display"></p>
```

**Script** — load `guests.js` TRƯỚC script chính:
```html
<script src="./guests.js"></script>
```

**JS** — thêm IIFE vào đầu DOMContentLoaded (TRƯỚC initEnvelope):
```javascript
// === GUEST PERSONALIZATION ===
(function () {
    if (typeof GUEST_LIST === 'undefined' || !Array.isArray(GUEST_LIST)) return;
    var params = new URLSearchParams(window.location.search);
    var rawId = params.get('id');
    if (rawId === null) return;
    var guestId = parseInt(rawId, 10);
    var guest = null;
    for (var i = 0; i < GUEST_LIST.length; i++) {
        if (GUEST_LIST[i].id === guestId) { guest = GUEST_LIST[i]; break; }
    }
    var nameEls = document.querySelectorAll('.guest-name-display');
    var inviteEls = document.querySelectorAll('.guest-invite-text');
    if (guest) {
        if (guest.message) {
            for (var j = 0; j < inviteEls.length; j++) inviteEls[j].textContent = guest.message;
        }
        for (var k = 0; k < nameEls.length; k++) {
            nameEls[k].textContent = guest.name;
            nameEls[k].style.display = 'block';
        }
    } else {
        for (var m = 0; m < inviteEls.length; m++) inviteEls[m].textContent = 'Trân trọng kính mời quý khách';
        for (var n = 0; n < nameEls.length; n++) nameEls[n].style.display = 'none';
    }
})();
```

**CSS** — thêm `.guest-name-display` (xem `products/shared/wedding/styles.css` mục 16b)

### 4. Báo cáo — in danh sách link cho từng khách

```
📋 Link thiệp cho từng khách:
  1. Anh Nguyễn Văn A → code.html?id=1
  2. Chị Trần Thị B   → code.html?id=2
  ...
```

### Quy tắc

- **Không có file khách** → bỏ qua hoàn toàn, không tạo guests.js
- **File CSV phải UTF-8** (tiếng Việt có dấu)
- **Columns linh hoạt**: chấp nhận `ID/id/STT`, `Tên/ten/Name`, `Lời mời/loi_moi/Message`
- **Không có `?id`** → giữ nguyên text mẫu (không thay đổi gì)
- **`?id` không hợp lệ** → hiện "Trân trọng kính mời quý khách"
- **guests.js** đặt cùng folder với code.html
- **Giữ file CSV gốc** trong folder (làm record)

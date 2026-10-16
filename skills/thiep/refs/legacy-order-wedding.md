---
name: order-wedding
description: Tạo thiệp cưới cho khách hàng mới — clone mẫu, convert ảnh, tuỳ biến thông tin, tạo đường dẫn. Dùng khi có order thiệp cưới mới từ khách.
---

# Order Wedding — Quy trình tạo thiệp cưới cho khách

Skill này xử lý ORDER thiệp cưới từ khách hàng (không phải gen mẫu mới). Clone mẫu có sẵn → tuỳ biến thông tin → tạo đường dẫn cho khách.

**KHÔNG thêm vào data.js** — thiệp khách không phải sản phẩm, chỉ tạo đường dẫn riêng.

---

## Input từ user

User sẽ cung cấp:
1. **Mẫu tham chiếu** — URL preview (`?id=XXX`) hoặc tên folder mẫu
2. **Ảnh cưới** — đặt sẵn trong `inputs/`
3. **Thông tin đám cưới** — qua 1 trong các cách:
   - Ảnh thiệp cưới giấy (file trong `inputs/`)
   - File text/json
   - Nhập trực tiếp trong chat
4. **Sheet ID** cho RSVP (vd: `khach_17`)
5. **Tuỳ chọn**: slug đường dẫn, nhạc nền, số tài khoản ngân hàng

---

## Quy trình — 7 bước

### Bước 1: Thu thập thông tin

1. **Đọc ảnh/file thông tin** → extract:
   - Tên chú rể (họ + tên)
   - Tên cô dâu (họ + tên)
   - Nhà trai: tên bố mẹ, địa chỉ
   - Nhà gái: tên bố mẹ, địa chỉ
   - Ngày cưới (dương lịch + âm lịch nếu có)
   - Giờ lễ
   - Địa điểm lễ cưới
   - Vai vế (con thứ mấy, nếu có)

2. **Xem tất cả ảnh cưới** trong `inputs/` → phân loại:
   - Ảnh cưới (để convert WebP) — portrait, studio, ngoại cảnh
   - Ảnh thông tin (KHÔNG convert, chỉ đọc lấy data) — user sẽ chỉ định
   - Ghi nhận object-position phù hợp cho từng ảnh (mặt ở đâu trong frame)

3. **Xác định mẫu nguồn** — tìm trong `data.js` theo ID hoặc folder name

4. **Tạo slug** từ tên couple: `khach_{ten-chu-re}-{ten-co-dau}` (kebab-case, không dấu)
   - Ví dụ: Minh Đáng & Diễm Phúc → `khach_dang-phuc`

### Bước 2: Tạo folder & convert ảnh

1. Tạo folder:
   ```
   products/Invitation/Wedding/{slug}/
   products/Invitation/Wedding/{slug}/customer/
   ```

2. Convert ảnh cưới → WebP:
   ```javascript
   sharp(src).resize({ width: 1600, withoutEnlargement: true }).webp({ quality: 80 }).toFile(dest)
   ```
   - Output: `customer/anh_1.webp`, `anh_2.webp`, ...
   - **KHÔNG convert ảnh thông tin** (thong_tin_thiep_cuoi.jpg, etc.)

### Bước 3: Lưu data đám cưới

Tạo file `products/Invitation/Wedding/{slug}/wedding-data.json`:

```json
{
  "groom": {
    "fullName": "Nguyễn Minh Đáng",
    "shortName": "Minh Đáng"
  },
  "bride": {
    "fullName": "Huỳnh Thị Diễm Phúc",
    "shortName": "Diễm Phúc"
  },
  "groomFamily": {
    "parents": ["Bà Nguyễn Thị Song"],
    "address": "Thôn Long Thạnh, Xã Tam Xuân, TP. Đà Nẵng"
  },
  "brideFamily": {
    "parents": ["Ông Huỳnh Văn Liêu", "Bà Phạm Thị Nga"],
    "address": "Thôn An Lương, Xã Tam Anh, TP. Đà Nẵng"
  },
  "wedding": {
    "date": "2026-08-02",
    "dayOfWeek": "Chủ Nhật",
    "time": "10:00",
    "lunarDate": "20/06 Bính Ngọ",
    "venue": "Tư Gia Nam",
    "address": "Thôn Long Thạnh, Xã Tam Xuân, TP. Đà Nẵng"
  },
  "sheetId": "khach_17",
  "wishesSheetId": "khach_17_luu_but",
  "templateId": 187,
  "slug": "khach_dang-phuc",
  "weddingSlug": "minh-dang-diem-phuc",
  "photos": 8,
  "createdAt": "2026-07-08"
}
```

### Bước 4: Clone & tuỳ biến thiệp

1. **Copy** `code.html` từ mẫu nguồn → `{slug}/code.html`

2. **Replace toàn cục** (replace_all):
   - Tên chú rể cũ → tên chú rể mới
   - Tên cô dâu cũ → tên cô dâu mới

3. **Replace từng phần**:
   | Mục | Cần thay |
   |-----|---------|
   | `<title>` | Tên couple mới |
   | `<meta description>` | Mô tả + ngày cưới |
   | Envelope date | `DD . MM . YYYY` |
   | Hero date | `DD Tháng MM, YYYY` |
   | Hero venue | Địa điểm |
   | Family cards | Tên bố mẹ, địa chỉ, tên cô dâu chú rể |
   | Event cards | Ngày, giờ, địa điểm (Vu Quy + Thành Hôn) |
   | Countdown target | `new Date('YYYY-MM-DDTHH:mm:ss')` |
   | Calendar | `month: X, year: YYYY, events:[{day: D}]` |
   | Gift cards | Tên chủ tài khoản (placeholder nếu chưa có STK) |
   | Thank you names | Tên couple |
   | Watermark base64 | Encode `Templexa|{slug}|{date}|phuocpt98` |
   | Love story | Cập nhật nội dung phù hợp (placeholder OK) |

4. **Replace ảnh** — thay TẤT CẢ ảnh `korean-studio-*` hoặc ảnh mẫu → `customer/anh_X.webp`:
   - Envelope peek photos
   - Family card photos (chú rể / cô dâu)
   - Photo strips (2 strips × 3 ảnh)
   - Countdown background (CSS url)
   - Love story background + photos
   - Calendar background (CSS url)
   - Fly section photos
   - Gallery (tất cả ảnh)
   - RSVP background (CSS url)
   - Wishes photo accent
   - Thank you background (CSS url)
   - Giữ nguyên shared icons: chibi, double-happiness, cherry-blossom, etc.

5. **Wire RSVP + Wishes** vào Google Sheets:
   - Thêm `<script src="../../../shared/wedding/wishes-api.js"></script>` trước `</body>`
   - RSVP submit → `sheetsAPI.post(SHEET_ID, { A: name, B: phone, C: guests, D: message, E: time })`
   - Wishes submit → `sheetsAPI.post(WISHES_SHEET, { A: name, B: message, C: time })`
   - Wishes load → `sheetsAPI.get(WISHES_SHEET)` hiện realtime

### Bước 5: Tạo og-cover.jpg

```javascript
sharp('customer/anh_X.webp')  // Chọn ảnh đẹp nhất (user chỉ định hoặc tự chọn)
  .extract({ top: Math.round(height * 0.15), ... })  // Crop từ 15% top (hoặc theo user)
  .resize({ width: 1200, height: 630, fit: 'cover', position: 'top' })
  .jpeg({ quality: 85 })
  .toFile('{slug}/og-cover.jpg')
```

### Bước 6: Tạo đường dẫn khách

1. **Tạo folder** `wedding/{wedding-slug}/`
   - Slug format: `{ten-chu-re}-{ten-co-dau}` (kebab-case, không dấu, không "khach_")
   - Ví dụ: `wedding/minh-dang-diem-phuc/`

2. **Tạo `index.html`** — copy cấu trúc từ `wedding/thanh-tung-hoai-thu/index.html`:
   - Cập nhật `<title>`, OG meta (title, description, image, url)
   - `og:image` → link tới `og-cover.jpg`
   - Giữ nguyên script iframe loader + `config.js`

3. **Thêm entry vào `wedding/config.js`**:
   ```javascript
   '{wedding-slug}': {
       src: '../../products/Invitation/Wedding/{slug}/code.html',
       title: '{Tên Chú Rể} & {Tên Cô Dâu} — Wedding Invitation',
       description: 'Trân trọng kính mời bạn đến dự lễ thành hôn — {ngày} tại {địa điểm}',
       image: '../../products/Invitation/Wedding/{slug}/og-cover.jpg',
   },
   ```

### Bước 7: Dọn dẹp

1. **Xoá tất cả file trong `inputs/`** (ảnh gốc + ảnh thông tin):
   ```bash
   rm inputs/*.jpg inputs/*.png inputs/*.jpeg 2>/dev/null
   ```
   - Giữ lại folder `new/` (trống, sẵn sàng cho order tiếp)

2. **Báo cáo** cho user:
   ```
   Thiệp cưới đã tạo xong!
   
   | Mục | Chi tiết |
   |-----|---------|
   | Folder | products/Invitation/Wedding/{slug}/ |
   | Mẫu gốc | ID XXX — Tên mẫu |
   | Chú rể | Họ tên đầy đủ |
   | Cô dâu | Họ tên đầy đủ |
   | Ngày cưới | DD/MM/YYYY — HH:mm |
   | Địa điểm | Tên + địa chỉ |
   | Ảnh | X ảnh WebP |
   | RSVP | sheet_id |
   | Đường dẫn | templexa.vn/wedding/{wedding-slug}/ |
   | Data | wedding-data.json đã lưu |
   
   Cần bổ sung:
   - STK ngân hàng (nếu placeholder)
   - Love story (nếu muốn tuỳ chỉnh)
   - Kiểm tra thiệp trước khi gửi khách
   ```

---

## Cấu trúc output

```
products/Invitation/Wedding/{slug}/
├── code.html              # Thiệp HTML (clone + tuỳ biến)
├── og-cover.jpg           # Ảnh preview share link (1200x630)
├── wedding-data.json      # Data đám cưới (JSON)
└── customer/
    ├── anh_1.webp         # Ảnh cưới WebP
    ├── anh_2.webp
    └── ...

wedding/{wedding-slug}/
└── index.html             # Iframe loader + OG meta
```

---

## Lưu ý quan trọng

- **KHÔNG thêm vào `data.js`** — thiệp khách, không phải sản phẩm
- **KHÔNG đổi folder mẫu gốc** — chỉ clone, không sửa
- **Luôn xoá `inputs/`** sau khi hoàn tất
- **Luôn tạo `wedding-data.json`** — để tra cứu lại thông tin sau này
- **Gift cards**: nếu chưa có STK → để placeholder `XXXX`, báo user bổ sung
- **Love story**: dùng nội dung mẫu, báo user tuỳ chỉnh nếu muốn
- **object-position**: xem ảnh thực tế để set phù hợp (mặt ở đâu trong frame)
- **Nhạc nền**: mặc định giữ nhạc mẫu, user có thể đổi
- Task này phù hợp **Sonnet** (cơ học, quy trình rõ ràng) — đề xuất user `/model sonnet`

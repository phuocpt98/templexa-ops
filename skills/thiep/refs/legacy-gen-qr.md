---
name: gen-qr
description: "Gen mã QR link tới thiệp cưới / landing page. Output: ảnh PNG trong folder `qr/` của sản phẩm."
---

Gen mã QR link tới thiệp cưới / landing page. Output: ảnh PNG trong folder `qr/` của sản phẩm.

Argument: $ARGUMENTS — link thiệp + (tuỳ chọn) đường dẫn guests.js hoặc folder sản phẩm.

Ví dụ:
- `"https://domain.com/thiep.html"` → 1 QR chung
- `"https://domain.com/thiep.html --guests products/Web/Invitation/gen_178_.../guests.js"` → QR cho từng khách
- `"products/Web/Invitation/gen_178_.../ https://domain.com/thiep.html"` → auto detect guests.js trong folder

---

## Quy trình

### Bước 1: Parse yêu cầu

Từ `$ARGUMENTS`, xác định:
- **Base URL**: link thiệp (bắt buộc)
- **Folder sản phẩm**: nếu có → tạo `qr/` trong folder đó
- **Guests file**: nếu có `guests.js` → gen QR cho từng khách

### Bước 2: Tạo folder `qr/`

```bash
mkdir -p <folder-sản-phẩm>/qr
```

### Bước 3: Gen QR

**A. QR đơn** (không có guests.js):

```javascript
node -e "
const QRCode = require('qrcode');
const url = '<BASE_URL>';
const folder = '<FOLDER>/qr';
QRCode.toFile(folder + '/qr_chung.png', url, {
    width: 400,
    margin: 2,
    color: { dark: '#000000', light: '#FFFFFF' }
}, (err) => {
    if (err) console.error(err);
    else console.log('QR chung → ' + folder + '/qr_chung.png');
});
"
```

**B. QR hàng loạt** (có guests.js):

```javascript
node -e "
const QRCode = require('qrcode');
const fs = require('fs');
const path = require('path');

const baseUrl = '<BASE_URL>';
const folder = '<FOLDER>/qr';
const guestsFile = '<FOLDER>/guests.js';

// Load guests
const guestsCode = fs.readFileSync(guestsFile, 'utf8');
eval(guestsCode); // defines GUEST_LIST

// Hàm chuyển tên → slug (dùng cho tên file)
function slugify(str) {
    return str.toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd').replace(/Đ/g, 'D')
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/^_|_$/g, '');
}

(async () => {
    // QR chung (không có ?id)
    await QRCode.toFile(path.join(folder, 'qr_chung.png'), baseUrl, {
        width: 400, margin: 2,
        color: { dark: '#000000', light: '#FFFFFF' }
    });
    console.log('qr_chung.png');

    // QR cho từng khách
    for (const guest of GUEST_LIST) {
        const url = baseUrl + (baseUrl.includes('?') ? '&' : '?') + 'id=' + guest.id;
        const filename = 'qr_' + guest.id + '_' + slugify(guest.name) + '.png';
        await QRCode.toFile(path.join(folder, filename), url, {
            width: 400, margin: 2,
            color: { dark: '#000000', light: '#FFFFFF' }
        });
        console.log(filename + ' → ' + guest.name);
    }

    console.log('Done! ' + (GUEST_LIST.length + 1) + ' QR codes');
})();
"
```

### Bước 4: Tạo file preview (tuỳ chọn, khi có guests)

Tạo `qr-preview.html` trong folder sản phẩm — bảng in QR:

```html
<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <title>QR Codes — Thiệp Cưới</title>
    <style>
        body { font-family: 'Be Vietnam Pro', Arial, sans-serif; padding: 2rem; }
        .qr-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 2rem; }
        .qr-item { text-align: center; page-break-inside: avoid; }
        .qr-item img { width: 200px; height: 200px; }
        .qr-name { font-weight: 600; margin: 0.5rem 0 0.25rem; }
        .qr-link { font-size: 0.7rem; color: #999; word-break: break-all; }
        @media print { .no-print { display: none; } }
    </style>
</head>
<body>
    <h1>Mã QR — Thiệp Cưới</h1>
    <p class="no-print">In trang này (Ctrl+P) để lấy QR cho từng khách mời.</p>
    <div class="qr-grid">
        <!-- QR chung -->
        <div class="qr-item">
            <img src="./qr/qr_chung.png" alt="QR chung">
            <p class="qr-name">Link chung</p>
            <p class="qr-link">{BASE_URL}</p>
        </div>
        <!-- QR từng khách — gen bằng JS -->
    </div>
</body>
</html>
```

Gen nội dung HTML đầy đủ với danh sách khách từ `guests.js`.

### Bước 5: Báo cáo

```
✅ Đã tạo mã QR:

📁 Folder: <folder>/qr/
📊 Số lượng: <N> mã QR (1 chung + <N-1> khách mời)

| # | File | Khách | Link |
|---|------|-------|------|
| 0 | qr_chung.png | (chung) | <BASE_URL> |
| 1 | qr_1_nguyen_van_a.png | Anh Nguyễn Văn A | <BASE_URL>?id=1 |
| 2 | qr_2_tran_thi_b.png | Chị Trần Thị B | <BASE_URL>?id=2 |

📄 Preview: <folder>/qr-preview.html (mở để in)
```

---

## Ràng buộc

- Dùng npm `qrcode` — chạy offline, miễn phí
- Output PNG 400x400px (đủ in rõ)
- Tên file: `qr_chung.png`, `qr_{id}_{slug_tên}.png`
- Folder: luôn tạo `qr/` trong folder sản phẩm
- Không cần internet — chạy hoàn toàn local
- `qr-preview.html` chỉ tạo khi có guests (QR hàng loạt)

## Tích hợp với /gen-wedding

Khi gen thiệp xong, nếu user cung cấp base URL:
- Tự động gen QR chung
- Nếu có `guests.js` → gen QR cho từng khách
- Thêm vào báo cáo cuối

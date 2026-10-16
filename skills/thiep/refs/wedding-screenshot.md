# Wedding Screenshot — Puppeteer Workflow
> Extracted from gen-wedding.md — used as reference by /gen-wedding command

## Quy trình chụp ảnh

**KHÔNG chụp screenshot ngay sau khi gen HTML.**

1. Sau khi gen xong `code.html` + `prompt.txt` + thêm entry `data.js` → **HỎI USER**:
   > "Mẫu đã gen xong. Bạn kiểm tra và cho mình biết khi nào OK để chụp ảnh màn hình nhé!"
2. **Đợi user xác nhận** (user nói "ok", "chụp đi", "gen ảnh", "screenshot"...)
3. Nếu user yêu cầu **sửa** → sửa xong → hỏi lại: "Đã sửa xong. Bạn kiểm tra lại, OK thì mình chụp ảnh nhé?"
4. **Lặp lại** bước 2–3 cho đến khi user xác nhận OK
5. Khi user xác nhận → chạy Puppeteer chụp screenshot (desktop + mobile) + convert WebP + cập nhật `images[]` trong `data.js`

## Bước 6: Chụp desktop (2–5 viewport 1280x800)

```javascript
node -e "
const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  const folder = '<đường dẫn folder sản phẩm>';
  const filePath = 'file://' + process.cwd() + '/' + folder + '/code.html';

  await page.setViewport({ width: 1280, height: 800 });
  await page.goto(filePath, { waitUntil: 'networkidle0', timeout: 30000 });
  await page.evaluate(() => document.fonts.ready);
  await new Promise(r => setTimeout(r, 2000));

  const pageHeight = await page.evaluate(() => document.body.scrollHeight);
  let numShots = Math.min(5, Math.max(2, Math.ceil(pageHeight / 800)));
  const names = ['screen.png', 'anh_1.png', 'anh_2.png', 'anh_3.png', 'anh_4.png'];

  for (let i = 0; i < numShots; i++) {
    const scrollY = i === 0 ? 0 : Math.floor((pageHeight - 800) * (i / (numShots - 1)));
    await page.evaluate((y) => window.scrollTo(0, y), scrollY);
    await new Promise(r => setTimeout(r, 800));
    await page.screenshot({ path: folder + '/' + names[i], type: 'png' });
  }

  await browser.close();
  console.log('Done! ' + pageHeight + 'px, ' + numShots + ' screenshots');
})();
"
```

## Bước 6a: Chụp mobile (iPhone 17 Pro Max)

Chụp 1 ảnh mobile — chỉ initial viewport (hero view), không scroll:

```javascript
node -e "
const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  const folder = '<đường dẫn folder sản phẩm>';
  const filePath = 'file://' + process.cwd().replace(/\\\\/g, '/') + '/' + folder + '/code.html';

  // iPhone 17 Pro Max: 440x956 @3x → output 1320x2868px
  await page.setViewport({ width: 440, height: 956, deviceScaleFactor: 3 });
  await page.goto(filePath, { waitUntil: 'networkidle0', timeout: 30000 });
  await page.evaluate(() => document.fonts.ready);
  await new Promise(r => setTimeout(r, 2000));

  await page.screenshot({ path: folder + '/mobile.png', type: 'png' });
  await browser.close();
  console.log('Mobile screenshot done!');
})();
"
```

**Lưu ý:**
- `mobile.png` sẽ tự convert thành `mobile.webp` ở Bước 6b
- `deviceScaleFactor: 3` cho ảnh sắc nét (Retina 3x)
- Thiệp có animation phong bì — wait 2s thường đủ. Nếu vẫn bị chặn, thêm `await page.click('body')` trước khi chụp

## Bước 6b: Chuyển PNG → WebP + Xoá PNG gốc

```javascript
node -e "
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
const folder = '<folder>';
const pngs = fs.readdirSync(folder).filter(f => f.endsWith('.png'));
(async () => {
  for (const file of pngs) {
    const input = path.join(folder, file);
    const output = path.join(folder, file.replace('.png', '.webp'));
    await sharp(input).webp({ quality: 80 }).toFile(output);
    fs.unlinkSync(input);
    console.log(file + ' → ' + file.replace('.png', '.webp'));
  }
  console.log('Done! Converted ' + pngs.length + ' files.');
})();
"
```

# 15 · Tự tạo ảnh / video cho thiệp

Dùng **công cụ tạo ảnh/video có sẵn của bạn (Muse)**. KHÔNG gọi dịch vụ ngoài, KHÔNG dùng skill `/gen-image`, `/gen-image-gemini` (của máy chủ shop). Mọi bước xử lý sau khi tạo (tách nền, cắt, nén) chạy bằng script trên máy.

**Trước khi tạo mới, tìm đồ có sẵn:** `Templexa/products/shared/wedding-data.js` (lọc theo tag) + `Templexa/thu-vien-hieu-ung.html`. Có sẵn thì dùng, không tạo lại.

**Lưu ở đâu:** ảnh tạo cho 1 thiệp → `<thư mục thiệp>/images/` (đặt tên kebab-case không dấu: `goc-hoa-trai-tren.webp`). KHÔNG lưu vào `products/shared/`. File gốc AI tạo ra → `jobs/<job>/input/gen/` để làm lại khi cần. Ghi vào log: `node scripts/job.js set <job> notes.anh="đã tạo 6 hoạ tiết góc, prompt ở input/gen/prompts.txt"` (lưu prompt đã dùng vào `input/gen/prompts.txt`).

---

## A. Icon / hoạ tiết KHÔNG NỀN (góc hoa, nhành lá, nơ, huy hiệu, con dấu…)

Công cụ tạo ảnh thường **không xuất được nền trong suốt thật** và tự cắt rất kém → luôn tạo trên **nền phẳng 1 màu**, rồi để `cut-icons.js` tách nền.

### Thông số bắt buộc ghi vào prompt
| Mục | Giá trị |
|---|---|
| Cỡ | Vuông **2048×2048** (hoặc lớn nhất công cụ cho), tỉ lệ 1:1 |
| Định dạng | **PNG** (không JPG — nén JPG làm bẩn viền, tách nền ra răng cưa) |
| Nền | **Xanh lá thuần `#00FF00`**, phẳng tuyệt đối. Nếu hoạ tiết CÓ MÀU XANH LÁ (lá cây, sage) → dùng **hồng thuần `#FF00FF`** |
| Bố cục 1 món | Đặt giữa, chừa lề ≥ **12%** mỗi cạnh, không chạm mép |
| Bố cục nhiều món | Lưới **3×3** (hoặc 2×2), mỗi món nằm giữa ô riêng, cách nhau ≥ **120px** nền trống, không chồng nhau |
| Cấm | bóng đổ, bóng phản chiếu, mặt đất/sàn, viền khung ảnh, chữ, watermark, nền gradient, hạt bụi/kim tuyến rơi ra ngoài hình, vệt màu nước loang ra mép |
| Nét | Viền hình rõ, liền mạch (crisp edges); màu nước được nhưng **mép ngoài gọn** |
| Màu | Lấy đúng mã màu của thiệp (biến `:root` trong index.html), ghi hex vào prompt |

### Prompt mẫu (tiếng Anh cho công cụ hiểu chính xác)
```
A 3x3 grid of 9 separate decorative elements for a Vietnamese wedding invitation:
[1] top-left corner of watercolor peonies, [2] small single peony, [3] horizontal divider of leaves, ...
Style: soft watercolor, palette #7A1F2B burgundy, #C9A24B gold, #F7F2EA cream.
Each element centered in its own cell with at least 120px of empty background between elements, none overlapping.
Background: perfectly flat solid pure chroma green #00FF00, no gradient, no texture.
No shadows, no reflections, no ground, no frame, no text, no watermark, no particles outside the objects.
Crisp clean outer edges. Elements must not contain any green color.
Square 2048x2048, PNG.
```

### Tách nền
(`Templexa/` = thư mục code; trên máy chủ shop là `../Templexa/`.)
```bash
node scripts/cut-icons.js jobs/<job>/input/gen/sheet-1.png --out Templexa/<thư mục thiệp>/images \
     --names goc-tren-trai,hoa-nho,vach-ngan,...      # theo thứ tự trái→phải, trên→dưới
```
- **Bắt buộc mở `_preview.png`** (nền caro) kiểm: còn viền xanh? bị thủng? mất chi tiết mảnh (tua, nhuỵ)? 2 món dính nhau?
  | Thấy | Sửa |
  |---|---|
  | Viền xanh/hồng sót | tăng `--tol 80` |
  | Mất nét mảnh, viền bị ăn | giảm `--tol 40` |
  | Lá rời bị tách thành món riêng | tăng `--gap 60` |
  | 2 món bị gộp làm 1 | giảm `--gap 8`, hoặc tạo lại với khoảng cách lớn hơn |
  | Khung viền/vòng hoa nhiều mảnh rời | thêm `--single` |
  | Nền trắng, lòng khung cần trong suốt | `--bg white --holes` |
- Xoá `_preview.png` khỏi thư mục thiệp sau khi xem (không deploy file này).
- Cỡ xuất mặc định cạnh dài 800px (`--size`). Hoạ tiết nhỏ (icon ≤ 80px trên thiệp) dùng `--size 300` cho nhẹ.

### Mẹo khi KHÔNG cần tách nền
Hoạ tiết màu nước đặt trên nền thiệp **sáng** (kem/trắng): tạo trên **nền trắng thuần `#FFFFFF`**, giữ nguyên nền, CSS dùng `mix-blend-mode: multiply;` → nền trắng tự biến mất, giữ được độ loang màu nước đẹp hơn mọi cách tách nền. Không dùng được trên nền tối.

---

## B. Ảnh nền / ảnh minh hoạ (có nền)

| Loại | Cỡ tạo | Xuất ra thiệp |
|---|---|---|
| Nền toàn màn điện thoại | **1080×1920** (9:16) | `to-webp.js --dir … --width 1080` |
| Nền section ngang / desktop | **1920×1080** (16:9) | `--width 1600` |
| Texture lặp (giấy, vải, hoa văn chìm) | **1024×1024**, ghi "seamless tileable pattern" | `--width 1024`, CSS `background-repeat` |
| Ảnh minh hoạ trong thiệp | 1536×1536 hoặc 1024×1536 | `--width 1200` |

- Nền có chữ đè lên: yêu cầu "large empty calm area in the center / top third for text", độ tương phản thấp.
- Không có người thật, logo, chữ trong ảnh nền.
- Chuyển WebP: `node scripts/to-webp.js --dir jobs/<job>/input/gen/nen --out Templexa/<thư mục thiệp>/images --width 1080` (tự đổi tên `anh_N` — đổi lại tên có nghĩa nếu cần).

---

## C. Video (hạn chế — chỉ khi thật cần)

| Mục | Giá trị |
|---|---|
| Tỉ lệ / cỡ | Dọc **720×1280** (9:16) |
| Thời lượng | **4–8 giây**, **lặp được** (khung đầu ≈ khung cuối) |
| Âm thanh | Không (thiệp đã có nhạc nền) |
| Nội dung | Chuyển động chậm, nhẹ: hoa rơi, ánh nến, khói mờ, sóng nước — không cắt cảnh |
| File | MP4 H.264, **≤ 3MB** |

Nén + ảnh chờ (nếu máy có ffmpeg):
```bash
ffmpeg -i in.mp4 -vf "scale=720:-2,fps=24" -an -c:v libx264 -crf 28 -preset slow -movflags +faststart out.mp4
ffmpeg -i out.mp4 -frames:v 1 -q:v 3 poster.jpg   # rồi to-webp poster
```
Dùng trong thiệp: `<video autoplay muted loop playsinline preload="metadata" poster="images/poster.webp" src="images/nen.mp4"></video>` — luôn có `poster` và `muted playsinline` (iPhone mới tự chạy).

---

## Kiểm tra cuối
- Chụp lại thiệp (`shoot.js`) và nhìn: hoạ tiết không lộ ô vuông, không viền xanh, không mờ nhoè vì phóng to quá cỡ.
- Tổng dung lượng ảnh mới thêm cho 1 thiệp nên < 1.5MB (xem: `du -sh <thư mục thiệp>/images`).

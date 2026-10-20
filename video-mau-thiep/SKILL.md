# FLOW: Video giới thiệu mẫu thiệp (Reels dọc 9:16)

Luồng sản xuất video dọc giới thiệu từng mẫu thiệp của templexa.vn, đăng Page Facebook / Reels / TikTok.
Mọi tài sản nằm trong folder này (`templexa-ops/video-mau-thiep/`).

## Cấu trúc

- `SKILL.md` — file này: mô tả flow.
- `muc-luc.md` — danh sách mẫu ĐÃ quay: ngày quay, nền đã dùng, tên video, trạng thái đăng + link bài.
- `san-khau.html` — sân khấu quay: nền cảnh + điện thoại hơi nghiêng + iframe thiệp thật + màn kết templexa.vn.
- `nen/` — kho ảnh nền theo phong cách (gen sẵn, thêm dần khi cần style mới).
- `kich-ban/` — mỗi mẫu 2 file viết TRƯỚC khi quay: `<id>.md` (ghi chép cho người đọc: thiệp hoạt động thế nào, bản đồ vị trí) + `<id>.json` (kịch bản máy chạy). Mẫu: `gen-269-dusty-rose.md/.json`.
- `quay.js` — script quay tự động (puppeteer): đọc `kich-ban/<id>.json`, xuất mp4 vào `video/`. KHÔNG sửa code cho từng mẫu.
- `font-cache/` — Google Fonts của MỌI mẫu thiệp public trong catalog (bộ chữ latin/latin-ext/vietnamese/symbols, ~9MB, lưu trong git). Lúc quay chỉ đọc từ đây, không ra mạng. Thiệp không phải sửa gì — chỉ `quay.js` trả font từ cache thay cho Google.
- `tai-font.js` — tải lại font cho cả catalog (chạy trên máy có mạng khi có mẫu mới, rồi commit `font-cache/`).
- `video/` — folder đích chứa video thành phẩm (đã gitignore; đăng xong có thể xoá, lịch sử nằm ở `muc-luc.md`).

## Quy trình mỗi mẫu

1. **Đọc thiệp trước** (bắt buộc): mở file thiệp thật, ghi lại:
   cách mở thiệp (bấm vào đâu), hiệu ứng (hoa rơi, đĩa nhạc...), các mục theo thứ tự,
   nhạc nền của thiệp, tông màu/phong cách.
2. **Viết kịch bản** vào `kich-ban/<id-mau>.md`: chọn nền trong `nen/` hợp style,
   timeline từng đoạn (giây nào bấm gì, đợi hiệu ứng nào, cuộn đến mục nào, dừng bao lâu),
   câu giới thiệu mẫu, nội dung màn kết, thời lượng dự kiến (~25–30 giây).
3. **Quay**: `node video-mau-thiep/quay.js <id-mau> --giay 8` để thử nhanh, xem vài khung; ổn thì
   `node video-mau-thiep/quay.js <id-mau> --hd` (bản đăng, ~2 phút). Script mở `san-khau.html` (1080×1920),
   nạp nền + thiệp, chạy timeline, chụp từng khung, trộn nhạc, xuất `video/<id-mau>.mp4`.
   - Báo **thiếu font** (mẫu mới thêm sau lần tải font gần nhất) → nhắn chủ shop chạy `node video-mau-thiep/tai-font.js`
     trên máy có mạng và push `font-cache/` (máy Muse không vào được fonts.googleapis.com). Không tự quay bằng font thay thế.
   - Trước khi gửi duyệt: trích 6–8 khung (`ffmpeg -ss <giây> -i video/<id>.mp4 -frames:v 1 x.png`) mở xem —
     đúng font, đúng mục, chữ nét, màn kết đủ chữ.
4. **Ghi mục lục**: thêm dòng vào `muc-luc.md` (ngày, mẫu, nền, video, trạng thái "chờ duyệt").
5. **Duyệt & đăng**: user duyệt video → đăng Page bằng connector facebook → cập nhật mục lục "đã đăng + link".

## Thông số chuẩn

- Video: 1080×1920, 30 khung/giây (đổi bằng `--fps 24` nếu cần), mp4 (H.264 crf 17 + AAC), 25–30 giây. Bản đăng luôn quay `--hd`.
- Điện thoại trên sân khấu: nghiêng nhẹ ~4°, có đổ bóng, bo góc.
- Màn kết: thiệp cuộn về phần mở đầu, chữ TEMPLEXA + templexa.vn + câu giới thiệu hiện **đè lên hình trong 2 giây** (không chuyển sang nền tối).
- Dấu ấn **templexa.vn hiện đúng 1 chỗ** trên nền sân khấu; vị trí chọn theo từng nền (góc trên-trái / trên-phải / dưới-trái / dưới-phải / giữa-dưới), đặt ở `"viTriWeb"` trong `kich-ban/<id>.json`.
- Trước lượt quay thật luôn có **vòng khởi động** (mở thiệp + cuộn sẵn 1 vòng + tải lại) để tài nguyên nạp hết. Mọi tài nguyên nạp từ file local + `font-cache/`; lúc quay chặn hết đường ra mạng ngoài.
- Thiệp trong điện thoại render ở bề rộng điện thoại thật (`rong`, mặc định 414px) rồi phóng lên khung — giao diện mobile đúng như khách thấy.
- Ảnh trong điện thoại phải bo tròn theo khung (clip-path ở `san-khau.html`), không tràn góc vuông.
- Âm thanh: dùng chính nhạc nền của thiệp (file trong `Templexa/products/shared/music/...`),
  trộn bằng ffmpeg, nhỏ dần ở cuối.

## Kịch bản máy chạy (`kich-ban/<id>.json`)

```json
{
  "thiep": "Templexa/products/Invitation/Wedding/gen_269_dusty-rose-flatlay/index.html",
  "nen": "nen/hoa-hong-pastel.jpg",
  "nhac": "Templexa/products/shared/music/wedding/Beautiful In White.mp3",
  "cho": "#envelope",              // phần tử phải có thì mới coi là thiệp đã tải xong
  "tieuDe": "MẪU THIỆP CƯỚI ONLINE",
  "viTriWeb": "phai-duoi",         // trai-tren | phai-tren | trai-duoi | phai-duoi | giua-duoi
  "gioiThieu": "…câu màn kết…",
  "timeline": [
    { "sleep": 2500 },                         // đứng yên (ms)
    { "click": "#envelope", "nhac": true },    // bấm; "nhac": nhạc bắt đầu từ lúc này
    { "scroll": "#invite", "ms": 3500 },       // cuộn tới phần tử (cách mép trên 40px)
    { "scrollText": ["h2", "Timeline"], "ms": 3500 },  // cuộn tới thẻ chứa chữ
    { "top": 2500 },                           // cuộn về đầu trang
    { "endcard": true }, { "sleep": 2500 }     // màn kết đè lên hình
  ]
}
```
Tổng thời lượng = cộng các `sleep` + `ms`. Nhạc tự nhỏ dần 2,5 giây cuối, theo độ dài thật của video.
Muốn đổi bề rộng điện thoại: thêm `"rong": 390`.

## Kinh nghiệm kỹ thuật

- **Quay theo đồng hồ ảo, không ghi màn hình** (từ 20/10/2026 — bản ghi màn hình cũ bị mờ và giật):
  `quay.js` đóng băng setTimeout/setInterval/requestAnimationFrame/Date/animation CSS trong mọi khung,
  mỗi khung đẩy đúng 1/30 giây rồi chụp 1 ảnh. Cuộn tính theo công thức (nhanh dần–chậm dần), nên dù
  máy chậm, video vẫn đủ 30 khung đều nhau. KHÔNG dùng lại screencast + minterpolate (bồi khung làm nhoè chữ).
- `--hd` vẽ trang ở 2× rồi thu nhỏ bằng lanczos: viền ảnh/chữ trên điện thoại nghiêng 4° hết răng cưa.
- Đếm ngược chạy theo ngày thật lúc quay — mẫu có ngày đã qua sẽ hiện 00, chấp nhận (chủ shop chốt 20/10, không giả ngày).
- **Đo bản đồ thiệp trước khi viết timeline**: vị trí các mục không theo thứ tự đoán —
  vd gen_269: `#collage` là cảnh hero ở ĐẦU trang. Đo bằng `getBoundingClientRect().top + scrollY` sau khi mở thiệp.
- Bấm nút trong thiệp bằng `el.click()` trong iframe (đã cài trong `quay.js`).

## Quy ước đặt tên

- File kịch bản và video: `<id-mau>.md` / `<id-mau>.mp4`, id lấy theo folder thiệp (vd `gen-269-dusty-rose`).
- Ảnh nền: tên theo phong cách, không dấu (vd `hoa-hong-pastel.jpg`).

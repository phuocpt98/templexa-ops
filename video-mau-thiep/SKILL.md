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
   `node video-mau-thiep/quay.js <id-mau> --hd` (bản đăng). Script mở `san-khau.html` (1080×1920),
   nạp nền + thiệp, chạy timeline, chụp từng khung, trộn nhạc, xuất `video/<id-mau>.mp4`.
   - **Quay theo đoạn, chạy tiếp được**: video chia đoạn (mặc định 5 giây, `"doan"` trong kịch bản hoặc `--doan 8`),
     mỗi đoạn mở 1 Chrome mới rồi đóng — RAM luôn thấp. Tiến độ + ảnh từng khung ở `video/.job-<id>/`
     (`log.txt` ghi từng đoạn xong lúc nào, bao nhiêu ms/khung). **Máy khởi động lại / Chrome sập → chạy LẠI ĐÚNG
     LỆNH CŨ** là quay tiếp từ đoạn dở; đủ đoạn mới ghép video + nhạc. Đổi `--doan` giữa chừng được (phần đã quay giữ nguyên).
     Muốn bỏ tiến độ, quay lại từ đầu: thêm `--lam-lai`. Đổi kịch bản/`--hd`/`--fps` thì tự quay lại từ đầu.
   - Chọn độ dài đoạn theo lịch khởi động lại của máy: đoạn phải xong trước khi máy bị khởi động lại
     (xem `ms/khung` trong log: 5 giây = 150 khung × ms/khung + ~15 giây mở Chrome và tua lại).
   - Báo **thiếu font** (mẫu mới thêm sau lần tải font gần nhất) → nhắn chủ shop chạy `node video-mau-thiep/tai-font.js`
     trên máy có mạng và push `font-cache/` (máy Muse không vào được fonts.googleapis.com). Không tự quay bằng font thay thế.
   - Trước khi gửi duyệt: trích 6–8 khung (`ffmpeg -ss <giây> -i video/<id>.mp4 -frames:v 1 x.png`) mở xem —
     đúng font, đúng mục, chữ nét, màn kết đủ chữ.
4. **Ghi mục lục + lên Drive**: thêm dòng vào `muc-luc.md` (ngày, mẫu, nền, video, trạng thái "chờ duyệt"),
   tải video vào thư mục Drive **"video thiệp"** (https://drive.google.com/drive/folders/1gLuYo8xbVTaYrNQszrR29qLcORLp4Utm) để user duyệt/lấy dùng.
5. **Duyệt & đăng**: user duyệt video → đăng Page "Thiệp online Templexa" dạng Reel bằng connector facebook
   (dùng chính file master ~10 Mbps — Facebook nén từ nguồn giàu dữ liệu sẽ nét hơn) → cập nhật mục lục "đã đăng + link".

## Thông số chuẩn

- Video: 1080×1920, 30 khung/giây (đổi bằng `--fps 24` nếu cần), mp4 (H.264 đích **~10 Mbps** + AAC 160k — chủ shop chốt 21/10: master giàu dữ liệu, nét hơn hẳn mức ~3,5 Mbps của bản crf cũ khi đăng Facebook/Drive), 25–30 giây. Bản đăng luôn quay `--hd`.
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
- `--hd` vẽ trang ở 2× (2160×3840) rồi thu nhỏ bằng lanczos: viền ảnh/chữ trên điện thoại nghiêng 4° hết răng cưa.
  Chụp bằng CDP `Page.captureScreenshot` PHẢI có `clip.scale = HD`, không thì Chrome chỉ trả 1080×1920 (đã dính 20/10).
- **Mối nối giữa các đoạn**: đoạn sau mở thiệp rồi tua lại kịch bản không chụp tới đúng khung ngắt. `quay.js` cố định
  `Math.random` và mốc giờ (lưu trong `state.json`) cho mọi đoạn → hoa rơi, đếm ngược, vị trí cuộn khớp y hệt; không sửa thiệp.
  Còn lệch nhỏ ở thứ chạy theo giờ thật của trình duyệt (vd đĩa nhạc #269 quay theo sự kiện nhạc phát → nhảy góc nhẹ ở mối nối) — chấp nhận.
- **RAM máy ảo** (Muse 20/10: 8GB chung, trống ~0,9GB, `/tmp` là ổ RAM 512MB): ảnh khung ghi ra `video/.job-<id>/` trên
  ổ đĩa, KHÔNG dùng `/tmp`; Chrome đóng hẳn rồi mới chạy ffmpeg (`-threads 2`) để hai thứ không chiếm RAM cùng lúc.
- Đếm ngược chạy theo ngày thật lúc quay — mẫu có ngày đã qua sẽ hiện 00, chấp nhận (chủ shop chốt 20/10, không giả ngày).
- **Đo bản đồ thiệp trước khi viết timeline**: vị trí các mục không theo thứ tự đoán —
  vd gen_269: `#collage` là cảnh hero ở ĐẦU trang. Đo bằng `getBoundingClientRect().top + scrollY` sau khi mở thiệp.
- Bấm nút trong thiệp bằng `el.click()` trong iframe (đã cài trong `quay.js`).
- **Mẫu cuộn bằng `body` thay vì cửa sổ** (phát hiện ở gen_198, 21/10): hàm cuộn của `quay.js` tự nhận diện
  phần tử cuộn thật (body hay cửa sổ) rồi mới cuộn — đừng đơn giản hoá về cuộn cửa sổ, mẫu kiểu này sẽ đứng yên cả video.

## Quy ước đặt tên

- File kịch bản và video: `<id-mau>.md` / `<id-mau>.mp4`, id lấy theo folder thiệp (vd `gen-269-dusty-rose`).
- Ảnh nền: tên theo phong cách, không dấu (vd `hoa-hong-pastel.jpg`).

## Ảnh nền sân khấu — đa dạng bối cảnh (user dặn 21/10)

Đừng video nào cũng nền hoa lá flatlay. Bối cảnh được SÁNG TẠO tự do — trong phòng, trên giường, trên mây có hoa, quán cà phê, bãi biển... — không cần ý nghĩa, CHỈ CẦN ĐẸP và giữa khung đủ trống êm để điện thoại nổi bật. Xoay vòng giữa các nền, thiếu style thì gen thêm nền mới vào `nen/`. Hiện có thêm: `phong-cuoi-am.jpg` (góc phòng rèm trắng, nến + hồng), `giuong-trang-hoa.jpg` (giường trắng rải cánh hoa), `may-troi-hoa.jpg` (trời mây pastel, hoa anh đào).

## RAM khi quay (user dặn 21/10)

Máy ảo yếu (8GB): TRƯỚC KHI QUAY phải đóng mọi cửa sổ trình duyệt cloud đang mở để dồn RAM cho Chrome quay — trình duyệt treo mở là một nguyên nhân quay gãy đoạn/timeout. Quay xong không tự mở lại trình duyệt.

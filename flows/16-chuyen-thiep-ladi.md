# 16 · Chuyển thiệp đại lý (LadiPage tải về) thành mẫu Templexa

Dùng khi chủ shop đưa thư mục thiệp mua quyền đại lý (vd `~/Documents/project/personal/thiep_agy/wedding2/` — có
`index.html` + `assets/`, trong code có `ladipagev4.min.js`, `ladi-section`). Mục tiêu: **giống 100% bản gốc** cả
điện thoại lẫn máy tính, nhưng code thuần, nhẹ, không jQuery/LadiPage, ảnh WebP.

Thiệp KHÔNG phải LadiPage (không có `ladi-section`, dùng `code.js`/`view.js`/`configTemplate.js` — vd SinhNhat3/4,
ThoiNoi1–4, weddingA1) → chưa có script, AI đọc và dựng lại theo `skills/thiep` mục B.

## 1. Chạy script (cơ học — vài phút)

```bash
cd templexa-ops
node scripts/ladi/convert.js <thư mục LadiPage> --out ../Templexa/products/Invitation/Wedding/gen_<id>_<ten> \
     [--date 2026-11-01T09:10:00+07:00] [--title "Tên A & Tên B — Thiệp cưới …"]
```
Script tự làm:
- Đo trang ở khung điện thoại (420px) và khung máy tính (đọc từ trang gốc: 960 hoặc 1200px) → sinh 1 file `index.html`
  (CSS + JS trong file): toạ độ, cỡ chữ, khung, hiệu ứng (`data-a`), nền tràn ngang ở máy tính.
- Ảnh → `images/*.webp` (chọn đúng bản cắt theo khung như LadiPage), ảnh động GIF → WebP động, font kèm theo → `fonts/`,
  nhạc → `nhac-nen.mp3`.
- Thành phần tự chuyển: popup, nút ẩn/hiện (collapse), cuộn tới phần, đếm ngược, form xác nhận (+ popup cảm ơn),
  lưu bút ký tên (canvas + chữ ký mẫu), hộp lời chúc, bản đồ, album bấm phóng to (`photoBookImage`), nút nhạc
  (`on_speaker`/`off_speaker`), tên khách (`class_tenKhachMoi` → `?name=`), hiệu ứng nền `effect-*`.
- Chụp bản gốc ↔ bản mới ở cả 2 khổ, ghép ảnh so sánh `compare/*.jpg`, chấm điểm lệch từng đoạn.
- Viết `<thư mục LadiPage>/_convert/REPORT.md`: kết quả so sánh, **CẦN AI LÀM**, ghi chú, bảng chữ trong thiệp.

## 2. AI làm phần còn lại (đọc REPORT.md)
- **CẦN AI LÀM**: khối HTML riêng (`todo-ai`, viền đỏ đứt trên thiệp), loại phần tử chưa hỗ trợ (carousel, gallery,
  video…), script riêng khi bấm → viết lại bằng JS thuần trong file, xoá class `todo-ai`.
- **So sánh**: chiều cao 2 bản phải bằng nhau; vùng "lệch nhiều" → mở `compare/<khổ>-NN.jpg` xem bằng mắt. Lệch do
  bản gốc đang chạy hiệu ứng lúc chụp thì bỏ qua; lệch thật (vị trí, ảnh, chữ) → sửa `convert.js` nếu là lỗi chung
  (để thiệp sau khỏi dính), sửa tay `index.html` nếu chỉ riêng thiệp này.
- Kiểm thao tác ở khổ 390px: nút nhạc, ẩn/hiện khung ký tên → ký → Xem thử → Lưu, gửi form → popup cảm ơn, bấm QR,
  bấm ảnh album, tên khách `?name=`.

## 3. Việc theo chủ shop (đã chốt cho mẫu #314)
- Ảnh cưới mẫu đi kèm bộ đại lý: **giữ nguyên, kể cả logo studio** (studio tài trợ ảnh để tăng hiển thị).
- **QR quà mừng của bên bán gốc → thay** bằng QR Facebook Page Templexa (`products/shared/images/icons/qr-facebook-templexa.webp`).
- Chữ, tên, ngày của bản gốc là dữ liệu mẫu → giữ nguyên (sửa lỗi rõ ràng như ngày không tồn tại thì báo chủ shop).
- Theo luật Templexa: 1 nút "Gửi lời chúc & xác nhận", dòng `templexa.vn` cuối thiệp, `<title>`/description/og:image.
- Thêm vào catalog: `node scripts/catalog.js …` (data.js), chụp ảnh `shoot.js`, `og-cover.jpg` 1200×630 (cắt từ bìa khổ máy tính
  thường đủ mặt + tên).

## Kinh nghiệm (từ #314 và thử wedding2/wedding4)
- LadiPage giấu phần tử chờ hiệu ứng (`ladi-animation-hidden`, opacity 0) và nạp ảnh chậm (`lazyload`) → script bỏ cả 2
  trước khi đo, không thì ảnh ra `url(none)` và độ mờ sai.
- Ảnh trong khung có viền: lớp ảnh giữ đúng cỡ LadiPage, để viền che bớt — co ảnh vào trong viền sẽ lộ thêm cảnh.
- Ảnh tên `sWxH_…` là các bản cắt sẵn theo khung, có thể khác tỉ lệ → không gộp, chọn bản hợp tỉ lệ khung.
- Ô đếm ngược xếp bằng flex → lấy vị trí thật trên màn hình, không lấy `left/top` CSS.
- Đếm ngược của bản gốc hay để kiểu "trong ngày" (`daily`) → truyền `--date` để đếm tới ngày cưới.
- Nền ảnh khổ máy tính có thể `background-attachment: fixed` (đứng yên khi cuộn).
- Phần tử ẩn sẵn (biểu tượng loa đang phát…) không phải lúc nào cũng là khu ẩn/hiện — chỉ đích của nút collapse/hidden_show mới là.

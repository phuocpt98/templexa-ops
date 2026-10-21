# Nghiên cứu thị trường — slide cưới "ảnh cuộn" trên TikTok

> Thu thập ngày 21/10/2026 để bàn về nghiệp vụ mới: **làm slide cưới trình chiếu bằng HTML** (flows/17, skill `slide-cuoi`).
> Nguồn chính: video TikTok chủ shop gửi — https://vt.tiktok.com/ZSgStqSjr/

## 1. Video nguồn

| Mục | Thông tin |
|---|---|
| Kênh | **@hn.wedding** — tên hiển thị "Slide Cưới Giá Rẻ" |
| Đăng ngày | 17/7/2025 |
| Thời lượng | 2 phút 48 giây |
| Tương tác (tại 21/10/2026) | 290 lượt thích · 87 bình luận · 220 lượt lưu · 354 lượt chia sẻ |
| Caption | "Nghe đồn mẫu này đang là bestseller của shop 😚 Giá siêu hạt dẻ" |
| Hashtag | #wedding #slidechibi #videochibi #backgroundchieutv #slidecuoigiare #videocuoi |
| Từ khóa shop dùng | mẫu ảnh cuộn đám cưới · video chibi cho đám cưới · background chiếu TV · slide cưới giá rẻ · video cưới độc đáo |
| Nhạc nền | "original sound" của kênh — không xác định được tên bài cụ thể |

Shop này bán một **danh mục** quanh tiệc cưới: slide cưới giá rẻ, slide chibi, video chibi đám cưới,
background chiếu TV, và cả thiệp cưới online giá rẻ — tức là đối thủ/đồng nghiệp trực tiếp của Templexa.

## 2. Phân tích mẫu slide trong video (mẫu "ảnh cuộn" — bestseller của shop)

- Là **file video** dựng sẵn theo mẫu, cá nhân hoá bằng ảnh + tên của khách.
- Cặp đôi demo: **Huy Hoàng & Thanh Ngân**.
- Phong cách: nền **trắng/kem**, thanh lịch, tối giản — hợp thị hiếu thiệp cưới hiện nay.
- Bố cục: ảnh xếp **collage 1–3 ảnh mỗi khung**, ảnh dọc và ngang đan xen; ảnh **cuộn/trượt nhẹ nhàng**, chuyển cảnh mượt.
- Chữ trên slide (script tiếng Anh, font viết tay):
  - "Just married"
  - Tên cặp đôi viết script
  - "Time has know our story" (nguyên văn trong video)
  - "I LOVE YOU FOR YOU"
  - "From now until forever"
  - "Love is a song that never ends"
- Có **slide lịch**: lịch tháng 7/2025, ngày 14 được đánh dấu **trái tim đỏ** (ngày cưới của cặp demo).

## 3. Đối chiếu: format này làm bằng HTML được không? — Được, và có chỗ hơn video

| Yếu tố trong video | Làm bằng HTML |
|---|---|
| Collage 1–3 ảnh/khung, dọc/ngang đan xen | CSS grid/flex + `object-fit: cover` — dễ |
| Ảnh cuộn/trượt, chuyển cảnh mượt | CSS animation (trôi nhẹ kiểu Ken Burns, crossfade) — dễ |
| Chữ script tiếng Anh | Google Fonts (Dancing Script…) — dễ |
| Slide lịch + tim đỏ ngày cưới | HTML/CSS thuần; thiệp Templexa đã có sẵn section lịch — bê sang |
| Nhạc nền | `<audio>` lặp vòng; cần 1 click mở đầu (chính sách trình duyệt) |
| Chiếu lên TV/màn LED | Mở link trên trình duyệt, toàn màn hình 16:9 |

**Điểm HTML hơn video:**
- Sửa phút chót: đổi ảnh/sai tên → sửa 1 chỗ, link cũ mở lại là đúng. Video phải render + gửi lại file.
- Nhẹ: ~vài MB so với file video vài trăm MB; không lo nhà hàng không có phần mềm mở đúng định dạng.
- Tương tác được: QR cho khách gửi lời chúc hiện lên màn hình chờ (ý tưởng mở rộng trong skill).
- Bán kèm thiệp online: cùng một bộ ảnh khách đã gửi làm thiệp → upsell tự nhiên.

**Điểm phải xử lý khi bán HTML thay video:**
- Cần thiết bị có trình duyệt tại sảnh (laptop của nhà hàng/cặp đôi) — kèm hướng dẫn chiếu + **bản zip offline dự phòng** (mở file local khi mất mạng).
- Autoplay có nhạc cần 1 click "Bắt đầu trình chiếu" — thiết kế thành tính năng (màn hình bìa chờ), không phải lỗi.
- Mô hình giao sản phẩm khác: shop video giao file (khách giữ vĩnh viễn); mình giao link → cần chốt chính sách giữ/khoá link sau ngày cưới.

## 4. Đề xuất ban đầu cho Templexa (để bàn tiếp)

1. Thêm nghiệp vụ **"Slide trình chiếu online"** vào vận hành: flows/17 + skill `slide-cuoi` (đã tạo cùng đợt nghiên cứu này).
2. Mẫu đầu tiên: `skills/slide-cuoi/demo/gen_slide_01_anh-cuon-trang-kem/` — dựng lại đúng phong cách video (nền kem, collage ảnh cuộn, chữ script, slide lịch) bằng ảnh thiệp Đại Vũ & Bích Thuỷ để xem thực tế.
3. Định vị bán kèm: khách đặt thiệp → chào thêm slide chiếu cùng phong cách; khách chỉ đặt slide vẫn làm độc lập.
4. Câu hỏi mở cần chốt trước job đầu tiên:
   - Giá bán + có tách gói (chỉ slide / thiệp + slide) không?
   - Thư mục sản phẩm trong repo: đề xuất `Templexa/products/Slideshow/` — cần chủ shop duyệt (AGENT.md mục 3 chưa có khu này).
   - Có làm slide lời chúc trực tiếp (QR) ngay từ đầu hay để giai đoạn 2?
   - Chính sách link sau ngày cưới: giữ làm kỷ niệm hay khoá?

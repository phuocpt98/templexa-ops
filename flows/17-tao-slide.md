# 17 · Tạo slide cưới trình chiếu (HTML thay video)

Dùng khi khách đặt **slide trình chiếu tại tiệc** (chiếu lên TV / màn LED / máy chiếu ở nhà hàng) nhưng làm bằng
**trang HTML** thay vì thuê dựng file video. Sản phẩm giao cho khách là **1 link** — mở trên trình duyệt là chiếu
được, sửa ảnh/chữ phút chót không phải render lại như video.

Luồng chung vẫn theo job: `00` nhận việc → `01` hỏi thông tin → flow này (dựng slide) → `20` sửa theo góp ý →
`30` xuất bản → `90` đóng job. Khác thiệp ở bộ câu hỏi và khâu xuất bản (xem dưới).

## 1. Hỏi thông tin riêng cho slide (bổ sung vào flows/01)

| Câu hỏi | Vì sao |
|---|---|
| Chiếu ở đâu, màn gì (TV nhà hàng, màn LED, máy chiếu)? Tỉ lệ 16:9 hay khác? | Khổ thiết kế mặc định 16:9; màn LED lạ tỉ lệ thì phải biết trước |
| Bao nhiêu ảnh? Có video ngắn chèn vào không? | Quyết định số slide, thời lượng |
| Nhạc nền bài gì (hoặc để shop chọn)? | Giống thiệp: chọn trong `products/shared/music/` hoặc skill `yt-mp3` |
| Phong cách mẫu nào (xem catalog `gen_slide_*`)? | Mặc định theo mẫu, giống mode clone của thiệp |
| Chữ trên slide: tên + ngày cưới + câu chữ muốn hiện? | Câu script tiếng Anh theo mẫu, tên/ngày là của khách |
| Thời lượng mong muốn (lặp vòng liên tục hay chạy 1 lượt rồi dừng ở slide kết)? | Tiệc thường chiếu lặp vòng trước giờ làm lễ |

## 2. Dựng slide — theo `skills/slide-cuoi/SKILL.md`

1. Nhánh git riêng cho job (như flows/10 bước 0).
2. Ảnh khách vào `jobs/<job>/input/` (fetch.js / user gửi) → chọn ảnh, chuyển WebP như thiệp (`to-webp.js` dùng chung được — ảnh slide nằm trong thư mục slide của khách, xem skill).
3. Copy mẫu `gen_slide_*` → thư mục khách, thay: tên, ngày, ảnh, nhạc, câu chữ. **Không sửa mẫu gốc.**
4. Chụp kiểm khổ **1920×1080** và **1366×768** (khổ ngang — khác thiệp là khổ dọc): từng slide một, xem bằng mắt (ảnh không cắt mặt, chữ không tràn, lịch khoanh đúng ngày).
5. Gửi user xem thử bằng link deploy nhánh (như thiệp) + ảnh chụp các slide chính.

> Vị trí thư mục sản phẩm trong `Templexa/`: đề xuất `products/Slideshow/khach_<slug>/` và mẫu `products/Slideshow/gen_slide_<id>_<tên>/` — **job slide đầu tiên phải được chủ shop duyệt vị trí này** rồi ghi chốt vào skill (AGENT.md mục 3 chưa có khu Slideshow).

## 3. Xuất bản (khác flows/30 ở phần giao khách)

- Lên templexa.vn như thiệp (merge main → `npm run deploy -- --prod` khi chủ shop đồng ý). Slide khách cũng `noindex`.
- Giao khách kèm **hướng dẫn chiếu** (viết sẵn trong skill, mục "Giao khách"):
  mở link trên laptop/TV → bấm nút **Bắt đầu trình chiếu** (1 click để vào toàn màn hình + có nhạc) → để tự chạy.
- **Bản dự phòng offline**: đóng gói thư mục slide (HTML + ảnh + nhạc) thành file zip gửi khách lưu USB — mất mạng ở nhà hàng vẫn mở chiếu được bằng trình duyệt. Làm sẵn trước ngày tiệc, đừng đợi khách hỏi.
- Sau ngày cưới: hỏi khách có muốn giữ link làm kỷ niệm hay khoá link (ghi vào job).

## 4. Demo tham khảo

Mẫu thử đầu tiên: `skills/slide-cuoi/demo/gen_slide_01_anh-cuon-trang-kem/index.html` — dựng theo mẫu slide
"ảnh cuộn" đang bán chạy trên TikTok (nghiên cứu: `skills/slide-cuoi/refs/nghien-cuu-thi-truong.md`).

---
name: slide-cuoi
description: Dựng SLIDE CƯỚI TRÌNH CHIẾU bằng HTML (thay file video) cho khách của Templexa — chiếu toàn màn hình 16:9 trên TV/màn LED/máy chiếu tại tiệc: ảnh cuộn dạng collage, chữ script, slide lịch đánh dấu ngày cưới, nhạc nền, tự chạy vòng lặp. Dùng sau khi đã có job (flows/00–01) và làm theo flows/17.
---

# Skill SLIDE CƯỚI — trình chiếu bằng HTML thay video

Ý tưởng sản phẩm: các shop đang bán **file video slide ảnh cưới** (mẫu "ảnh cuộn" là bestseller trên TikTok —
xem `refs/nghien-cuu-thi-truong.md`). Templexa làm cùng format đó bằng **1 trang HTML**: khách mở link là chiếu,
shop sửa ảnh/chữ phút chót không cần render, và bán kèm thiệp online rất tự nhiên.

**Demo gốc để clone/học cấu trúc:** `demo/gen_slide_01_anh-cuon-trang-kem/index.html` (1 file HTML duy nhất,
assets cạnh bên: `photos/`, `fonts/`, `nhac-nen.mp3`; ảnh chụp các slide ở `demo/.../preview/`). Mở thử bằng server tĩnh rồi bấm "Bắt đầu trình chiếu".

---

## A. Cấu trúc slide chuẩn (theo mẫu ảnh cuộn đang bán chạy)

Thứ tự mặc định — mỗi slide hiện **5–6 giây**, chuyển cảnh mờ dần (crossfade) + ảnh trôi/phóng chậm rất nhẹ:

| # | Slide | Nội dung |
|---|---|---|
| 1 | Mở đầu | Câu script ("Just married") + tên cặp đôi + ngày cưới, nền kem/trắng, 1 ảnh nhỏ hoặc không ảnh |
| 2..n | Collage ảnh | 1–3 ảnh mỗi khung, ảnh dọc/ngang đan xen, chèn câu script ngắn giữa các cụm (vd "Love is a song that never ends") |
| giữa | Lịch | Lịch tháng cưới, ngày cưới đánh dấu trái tim đỏ |
| cuối | Kết | "From now until forever" + tên cặp đôi + dòng thương hiệu `templexa.vn` nhỏ ở góc |

- Tổng thời lượng 1 vòng: **2–3 phút** (~25–35 slide với 10–15 ảnh, mỗi ảnh xuất hiện 2 lần ở 2 bố cục khác nhau cũng được).
- Chạy **vòng lặp** mặc định (chiếu chờ khách trước giờ làm lễ); khách yêu cầu 1 lượt thì dừng ở slide kết.

## B. Thông số kỹ thuật — KHÔNG ĐƯỢC SAI

1. **Khổ 16:9 tuyệt đối**: sân khấu (stage) luôn tỉ lệ 16:9, căn giữa màn hình, phần thừa để nền tối. Thiết kế ở 1920×1080, kiểm thêm 1366×768. Mọi kích thước trong slide tính theo `cqw`/container hoặc theo chiều cao stage — **không dùng `vw` trực tiếp** (màn tỉ lệ lạ sẽ vỡ bố cục).
2. **Màn hình bắt đầu bắt buộc**: trang mở lên hiện slide bìa + nút **Bắt đầu trình chiếu**. 1 click đó làm 3 việc: vào toàn màn hình (requestFullscreen), phát nhạc (trình duyệt chặn autoplay có tiếng — không có click này là slide câm), bắt đầu tự chạy. Đừng cố lách autoplay.
3. **Điều khiển cho người chiếu**: `Space`/click = slide tiếp · `←` `→` = lui/tới · phím số `1–9` = nhảy tới slide · `P` = dừng/chạy · `F` = toàn màn hình · `M` = tắt/bật nhạc. Hiện thanh tiến trình mảnh ở cạnh dưới.
4. **Preload toàn bộ ảnh + nhạc** trước khi cho bấm bắt đầu (hiện % tải trên nút). Ảnh WebP, mỗi ảnh ≤ ~300KB, tổng trang ≤ ~10MB — chiếu ở nhà hàng mạng yếu vẫn mượt.
5. **Không cắt mặt**: ảnh nào đưa vào khung dọc/ngang khác tỉ lệ gốc thì đo vị trí mặt trước (như flow cắt ảnh polaroid của thiệp), đặt `object-position` theo mặt, chụp kiểm từng slide.
6. **Font**: câu script tiếng Anh dùng font script (vd Dancing Script). **Tên cặp đôi và chữ tiếng Việt phải dùng font hỗ trợ dấu tiếng Việt đã kiểm chứng** (Playfair Display, Quicksand, Patrick Hand… — Caveat/Comfortaa rớt dấu, cấm dùng cho chữ Việt, xem bài học ở skill thiệp). **Font phải TỰ CHỨA trong thư mục slide** (file woff2 + `@font-face` local, subset latin + vietnamese) — KHÔNG link Google Fonts: bản offline mất mạng là mất font, và thực tế đã gặp trình duyệt không tải được CDN font dù mạng vẫn có. Demo gen_slide_01 đã tự chứa sẵn 2 font, copy theo là xong.
7. **Nhạc**: lấy trong `Templexa/products/shared/music/wedding/` (đường dẫn tương đối khi slide đã vào repo) hoặc bài khách gửi qua skill `yt-mp3`. Lặp nhạc (loop) theo vòng slide.
8. **Dòng thương hiệu**: slide kết có `templexa.vn` nhỏ, mờ (opacity ~0.6) ở góc dưới — như luật dòng cuối thiệp.

## C. Dựng slide cho khách (theo mẫu — việc phổ biến nhất)

1. Đã có job + đủ thông tin (flows/17 mục 1). Nhánh git riêng như flows/10.
2. Thư mục slide của khách (vị trí đề xuất, chờ chủ shop chốt ở job đầu tiên): `Templexa/products/Slideshow/khach_<slug>/`; mẫu ở `Templexa/products/Slideshow/gen_slide_<id>_<tên>/`. Copy mẫu → thư mục khách, **không sửa mẫu gốc** (đúng luật AGENT.md mục 3).
3. Thay nội dung: tên, ngày cưới (cả slide lịch — khoanh đúng ngày, đúng thứ), ảnh (giữ đúng thứ tự khách muốn), nhạc, câu chữ. Tìm lại tên/ngày của mẫu/demo trong file — phải ra 0 kết quả (trừ câu script chung).
4. Chụp kiểm **từng slide** ở 1920×1080 (puppeteer; dùng phím số nhảy slide rồi chụp). Gửi user: link xem thử (deploy nhánh) + ảnh các slide chính.
5. Xuất bản + giao khách theo flows/17 mục 3 (kèm bản zip offline dự phòng).

## D. Giao khách — đoạn hướng dẫn gửi kèm link (gửi nguyên văn, thay link)

> Slide trình chiếu của anh/chị đây ạ: <link>
> Cách chiếu: mở link bằng trình duyệt trên laptop/TV ở sảnh → bấm nút "Bắt đầu trình chiếu" → slide tự chạy lặp vòng kèm nhạc.
> Phím tắt khi chiếu: Space = chuyển slide, P = tạm dừng, M = tắt nhạc.
> Em gửi kèm file dự phòng (USB): giải nén, mở file index.html là chiếu được kể cả khi mất mạng.

## E. Ý tưởng mở rộng (chưa làm — bàn với chủ shop trước)

- **Slide lời chúc trực tiếp**: khách mời quét QR trên slide chờ → lời chúc hiện lên màn hình (tái dùng hệ thống lời chúc của thiệp — sheetsAPI). Video không làm được, đây là điểm hơn hẳn để bán.
- Mẫu chibi / slide cho bé (thôi nôi, sinh nhật) — đối thủ bán cả dòng này.
- Gói bán kèm: thiệp online + slide chiếu cùng bộ ảnh, đồng bộ phong cách.

## Checklist trước khi báo user
- [ ] Đúng tên, đúng ngày cưới (slide lịch khoanh đúng ngày/thứ), đúng thứ tự ảnh khách chốt
- [ ] Không còn tên/ngày/ảnh của mẫu hoặc demo (grep = 0)
- [ ] Chụp đủ mọi slide ở 1920×1080: không cắt mặt, chữ không tràn, không vỡ bố cục ở 1366×768
- [ ] Bấm bắt đầu → toàn màn hình + nhạc phát + tự chuyển slide + lặp vòng trơn tru
- [ ] Phím tắt hoạt động (Space, ←/→, số, P, M, F)
- [ ] Tổng dung lượng trang ≤ ~10MB, preload xong mới cho chiếu
- [ ] Có file zip offline dự phòng + đoạn hướng dẫn giao khách
- [ ] Dòng `templexa.vn` ở slide kết

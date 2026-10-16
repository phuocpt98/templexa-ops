# Wedding Prompt Template — prompt.txt for Customers
> Extracted from gen-wedding.md — used as reference by /gen-wedding command

## Quy trình tạo prompt.txt

Sau khi gen `code.html`, tạo file `prompt.txt` trong **cùng folder** với `code.html`.
File này là **form điền thông tin** cho khách hàng khi họ chọn mẫu.

1. **Phân tích `code.html` vừa gen** → xác định:
   - Mẫu có bao nhiêu vị trí ảnh (hero, love story, gallery, QR...)
   - Loại thiệp (đơn/đôi) → quyết định section thông tin gia đình & lễ cưới
   - Có những section tuỳ chọn nào (dresscode, video, bản đồ...)
   - Có bao nhiêu mốc love story
2. **Sinh bảng ảnh ĐỘNG** — tuỳ theo mẫu cụ thể, không hardcode
3. **Ghi file** `prompt.txt` vào folder

## Template prompt.txt

```
═══════════════════════════════════════════════════
  THÔNG TIN ĐẶT THIỆP CƯỚI
  Mã mẫu: #{id}
  Tên mẫu: {tên mẫu}
  Phong cách: {classic gold / blush pink / ...}
  Loại thiệp: {đơn nhà trai / đơn nhà gái / đôi}
═══════════════════════════════════════════════════

Vui lòng điền đầy đủ thông tin bên dưới rồi gửi lại.
Mục có dấu (*) là bắt buộc.
Để trống = giữ nội dung mẫu.

───────────────────────────────────────────────────
1. THÔNG TIN CẶP ĐÔI
───────────────────────────────────────────────────
Tên chú rể (*):
Tên cô dâu (*):
Ngày cưới (*): (dd/mm/yyyy)
Giờ làm lễ:

───────────────────────────────────────────────────
2. THÔNG TIN GIA ĐÌNH
───────────────────────────────────────────────────
{Nếu thiệp đơn nhà trai:}
[Nhà trai]
Bố chú rể:
Mẹ chú rể:

{Nếu thiệp đơn nhà gái:}
[Nhà gái]
Bố cô dâu:
Mẹ cô dâu:

{Nếu thiệp đôi → hiện CẢ 2 block:}
[Nhà trai]
Bố chú rể:
Mẹ chú rể:

[Nhà gái]
Bố cô dâu:
Mẹ cô dâu:

───────────────────────────────────────────────────
3. THÔNG TIN LỄ CƯỚI
───────────────────────────────────────────────────
{Nếu thiệp đơn nhà trai → chỉ block Lễ Thành Hôn}
{Nếu thiệp đơn nhà gái → chỉ block Lễ Vu Quy}
{Nếu thiệp đôi → cả 2 block}

[Lễ Vu Quy]
Ngày giờ:
Tên địa điểm:
Địa chỉ:

[Lễ Thành Hôn]
Ngày giờ:
Tên địa điểm:
Địa chỉ:

───────────────────────────────────────────────────
4. LOVE STORY — CÂU CHUYỆN TÌNH YÊU
───────────────────────────────────────────────────
(Mẫu này có {N} mốc. Để trống = giữ nội dung mẫu)

Mốc 1:
  Ngày (tháng/năm):
  Tiêu đề (VD: "Lần đầu gặp nhau"):
  Mô tả ngắn:

Mốc 2:
  Ngày:
  Tiêu đề:
  Mô tả ngắn:

Mốc 3:
  Ngày:
  Tiêu đề:
  Mô tả ngắn:

{Thêm/bớt mốc tuỳ ý — AI sẽ tự điều chỉnh}

───────────────────────────────────────────────────
5. ẢNH CẦN CHUẨN BỊ
───────────────────────────────────────────────────
Đặt tên file ảnh ĐÚNG theo bảng bên dưới,
bỏ vào CÙNG folder với file prompt này.
Định dạng: JPG hoặc PNG đều được.
Ảnh không bắt buộc — nếu không có sẽ dùng ảnh mặc định.

{BẢNG NÀY SINH ĐỘNG — tuỳ mẫu cụ thể}

| STT | Tên file            | Hiển thị ở                | Kích thước gợi ý  | Bắt buộc |
|-----|---------------------|---------------------------|--------------------|----------|
|  1  | anh_bia.jpg         | Hero — ảnh nền chính      | 1920x1080          | Có (*)   |
|  2  | anh_doi_1.jpg       | Love Story — mốc 1        | 600x400            | Không    |
|  3  | anh_doi_2.jpg       | Love Story — mốc 2        | 600x400            | Không    |
|  4  | anh_doi_3.jpg       | Love Story — mốc 3        | 600x400            | Không    |
|  5  | anh_gallery_1.jpg   | Gallery — hàng 1 trái     | 500x500            | Không    |
|  6  | anh_gallery_2.jpg   | Gallery — hàng 1 giữa     | 500x500            | Không    |
|  7  | anh_gallery_3.jpg   | Gallery — hàng 1 phải     | 500x500            | Không    |
|  8  | anh_gallery_4.jpg   | Gallery — hàng 2 trái     | 500x500            | Không    |
|  9  | anh_gallery_5.jpg   | Gallery — hàng 2 giữa     | 500x500            | Không    |
| 10  | anh_gallery_6.jpg   | Gallery — hàng 2 phải     | 500x500            | Không    |
| 11  | anh_qr.jpg          | Mừng cưới — mã QR         | 300x300            | Không    |

{Số lượng anh_doi_* = số mốc love story trong mẫu}
{Số lượng anh_gallery_* = số ảnh gallery trong mẫu}
{anh_qr chỉ có nếu mẫu có section mừng cưới/registry}

───────────────────────────────────────────────────
6. GOOGLE SHEETS — GỬI DỮ LIỆU
───────────────────────────────────────────────────
(Mẫu này có các form gửi dữ liệu qua Google Sheets.
 Mỗi form cần 1 sheet_id riêng. Liên hệ Templexa để được cấp.)

{Sinh ĐỘNG — tuỳ mẫu có form nào}

Sheet ID — Lời chúc:
  Cột: A=Tên, B=Lời chúc, C=Thời gian

Sheet ID — Xác nhận tham dự (RSVP):
  Cột: A=Tên, B=SĐT, C=Số khách, D=Lời nhắn, E=..., F=Thời gian

(Để trống = form chỉ hiển thị, không gửi dữ liệu)

───────────────────────────────────────────────────
7. DANH SÁCH KHÁCH MỜI — CÁ NHÂN HOÁ THIỆP
───────────────────────────────────────────────────
(Để trống = không cá nhân hoá, tất cả khách xem chung 1 thiệp)

File danh sách khách: khach_moi.csv
  Đặt file CSV vào CÙNG folder với prompt này.
  Có thể export từ Excel hoặc Google Sheets.

  Định dạng bảng (3 cột):
  | ID | Tên              | Lời mời                              |
  |----|------------------|--------------------------------------|
  | 1  | Anh Nguyễn Văn A | Nhà trai trân trọng kính mời         |
  | 2  | Chị Trần Thị B   | Kính mời                             |
  | 3  | Cô Lê Thị C      | Gia đình trân trọng kính mời         |

  Sau khi gen xong, mỗi khách sẽ nhận link riêng:
  https://domain.com/thiep.html?id=1 → Hiện tên "Anh Nguyễn Văn A"
  https://domain.com/thiep.html?id=2 → Hiện tên "Chị Trần Thị B"
  Mở thiệp không có ?id → Hiện "quý khách" (mặc định)

───────────────────────────────────────────────────
8. TUỲ CHỌN THÊM
───────────────────────────────────────────────────
Nhạc nền (để trống = giữ nhạc mẫu):
Lời chúc / quote đặc biệt:
Dresscode (nếu có):

[Bản đồ Google Maps]
Link Google Maps (embed hoặc thường):
  Cách lấy: vào Google Maps → tìm địa điểm → Chia sẻ → Nhúng bản đồ → Copy link
  Hoặc copy link từ thanh địa chỉ trình duyệt
  (Nếu để trống: sẽ dùng link tìm kiếm tự động từ địa chỉ ở mục 3)

{Nếu thiệp đôi → 2 link riêng:}
Link Maps — Lễ Vu Quy:
Link Maps — Lễ Thành Hôn:

Link video YouTube:
Ghi chú thêm:

═══════════════════════════════════════════════════
  SAU KHI ĐIỀN XONG
  1. Đặt file ảnh + prompt.txt vào 1 folder
  2. Gửi lại folder cho Templexa
  3. Chúng tôi sẽ hoàn thiện thiệp trong 24h
═══════════════════════════════════════════════════
```

## Quy tắc sinh bảng ảnh

| Vị trí trong code.html | Tên file prompt | Mô tả vị trí |
|-------------------------|-----------------|---------------|
| Hero background / ảnh chính | `anh_bia.jpg` | Hero — ảnh nền chính |
| Love Story mốc N | `anh_doi_N.jpg` | Love Story — mốc N |
| Gallery vị trí N | `anh_gallery_N.jpg` | Gallery — hàng X vị trí Y |
| QR code mừng cưới | `anh_qr.jpg` | Mừng cưới — mã QR |
| Ảnh cô dâu chú rể riêng | `anh_chan_dung.jpg` | Section giới thiệu |
| Ảnh venue/địa điểm | `anh_dia_diem.jpg` | Thông tin lễ cưới |
| Dresscode illustration | `anh_dresscode.jpg` | Dresscode |

**Đếm chính xác từ `code.html`:**
- Đếm số `<img>` trong section love story → số `anh_doi_*`
- Đếm số `<img>` trong section gallery → số `anh_gallery_*`
- Kiểm tra có section QR/registry không → có/không `anh_qr`

# 01 · Hỏi đủ thông tin trước khi làm

**Luật:** chưa đủ thông tin → KHÔNG dựng thiệp. `node scripts/job.js check <job>` liệt kê đúng những câu còn thiếu — hỏi gộp **1 lần**, đánh số, giọng thân thiện.

## Bộ câu hỏi (script tự lọc theo loại thiệp)

| # | Câu hỏi | Ghi vào job bằng |
|---|---|---|
| 1 | Tạo mới, làm theo mẫu, hay sửa thiệp cũ? | `mode=clone` / `new` / `edit` |
| 2 | Dịp gì? | `occasion=wedding` … (xem flows/00) |
| 3 | Theo mẫu nào? (mã hoặc link) | `from=299` |
| 4 | **Cưới:** thiệp đôi / chỉ nhà trai / chỉ nhà gái / 2 thiệp riêng 2 nhà? | `sides=doi` / `nha-trai` / `nha-gai` / `rieng-2-nha` |
| 5 | **Cưới:** họ tên chú rể, cô dâu | `info.groom="…"` `info.bride="…"` |
| 6 | **Cưới:** bố mẹ + địa chỉ 2 nhà | `info.groomParents="Ông … · Bà …"` `info.groomAddress="…"` (tương tự bride) |
| 6' | **Sự kiện:** tên nhân vật chính | `info.honoree="…"` (+ `info.title`, `info.school`, `info.age`… tuỳ dịp) |
| 7 | Ngày (dương + âm nếu cưới/giỗ), giờ | `info.date=2026-11-02` `info.lunarDate="13/09 Bính Ngọ"` `info.time=10:00` |
| 8 | Địa điểm + địa chỉ, link Google Maps | `info.venue="…"` `info.address="…"` `info.mapUrl="…"` (không có → `false`) |
| 9 | Lời mời / xưng hô đặc biệt (nếu có) | `info.invitation="…"` |
| 10 | Ảnh + ảnh nào làm bìa | gửi vào `input/`; `photos='{"hero":"photos/anh_3.webp"}'` (dùng ảnh mẫu → `photos=false`) |
| 11 | **Cưới:** QR / số tài khoản mừng cưới | `gift='{"bank":"VCB","account":"…","holder":"…"}'` (không cần → `false`) |
| 12 | Danh sách khách in tên riêng (?id=)? | `guests=true` / `false` |
| 13 | sheet_id nhận RSVP / lời chúc | `sheetId="khach_38"` (chưa có → `false`, làm tiếp, bổ sung sau) |
| 14 | Nhạc nền giữ mẫu hay đổi? | `music="giu-mau"` hoặc đường dẫn mp3 |
| 15 | Hạn giao | `deadline=2026-10-30` |
| — | Có khoe trên catalog? | **Không hỏi** — mặc định khoe. Chỉ khi chủ shop dặn ẩn: `showInCatalog=false` |

Ví dụ ghi nhiều câu một lúc:
```bash
node scripts/job.js set <job> info.groom="Nguyễn Văn Minh" info.bride="Trần Thu Lan" sides=doi info.date=2026-11-02 info.time=10:00 sheetId=false
```
Giá trị `true/false/null/số/{…}` được hiểu tự động; chữ có khoảng trắng để trong ngoặc kép.

## Khi user gửi ẢNH thiệp giấy / ảnh chụp thông tin
Đọc ảnh, tự điền những gì đọc được, rồi **gửi lại bảng tóm tắt để user xác nhận** (tên, ngày, giờ, địa điểm). Sai một chữ trong tên là phải làm lại cả thiệp.

## Đủ rồi
`job.js check` báo "Đủ thông tin" → `node scripts/job.js status <job> dang-lam` → sang `10-tao-thiep.md`.

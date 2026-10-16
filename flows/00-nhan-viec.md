# 00 · Nhận việc

```
User nhắn ──► có link / tên khách? ──► job.js find ──► CÓ job  ──► job.js show → làm tiếp bước dở
                                                   └► KHÔNG có ──► tạo job mới (dưới đây)
```

## Tạo job mới
1. Hỏi tối thiểu để đặt tên job: **tên khách** (hoặc tên cặp đôi / tên bé / tên sự kiện).
2. Nếu tin nhắn đã nói rõ thì điền luôn, không hỏi lại:
   ```bash
   node scripts/job.js new "Lê Thuận Hưng" --occasion graduation --mode clone --from 299 --deadline 2026-10-24
   ```
   | Tham số | Giá trị |
   |---|---|
   | `--occasion` | `wedding` · `dam-ngo` · `an-hoi` · `birthday` · `thoi-noi` · `day-thang` · `graduation` · `anniversary` · `reunion` · `gio-to` · `confession` · `holiday` · `other` |
   | `--mode` | `clone` = làm theo mẫu có sẵn · `new` = thiết kế mới · `edit` = sửa thiệp đã có |
   | `--from` | mã mẫu (#id) khi `clone` — user gửi link `thiep-online.html?pid=299` thì id = 299 |
   | `--kind` | tự suy từ dịp: cưới → `wedding`, sinh nhật → `birthday`, còn lại → `event` (quyết định link `/wedding/`, `/event/`, `/birthday/`) |
3. Lệnh in ra **danh sách câu còn thiếu** → sang `01-hoi-thong-tin.md`.

## Lưu mọi thứ user gửi vào `input/`
- Ảnh/file gửi trong chat → lưu thẳng vào `jobs/<job>/input/`.
- Link Drive / link tải → `node scripts/fetch.js <job> <link1> <link2>` (tự giải nén zip/rar).
- Tin nhắn chứa thông tin (lời mời, tên bố mẹ…) dài → lưu thành `input/chat-<ngày>.txt` để sau đọc lại.
- Ảnh chụp màn hình góp ý sửa → `input/sua-<số>.png` + 1 dòng trong `feedback.md`.

## Job SỬA thiệp đã có (mode `edit`)
- Thiệp làm trước khi có hệ thống job (chưa có job): tạo job `--mode edit`, rồi gắn thiệp vào:
  `node scripts/job.js set <job> 'cards=[{"key":"main","folder":"./products/Invitation/Wedding/khach_xxx/","entry":"index.html","photoDir":"photos","from":null,"share":{},"shortlink":{"type":"wedding","slug":"xxx","url":"https://templexa.vn/wedding/xxx/"}}]'`
  (folder lấy từ `Templexa/wedding|event|birthday/config.js` theo slug trong link).
- Ghi từng yêu cầu sửa vào `feedback.md` → làm theo `flows/20-sua-thiep.md` (bước 2 — sắp có).

## Trạng thái job
| Trạng thái | Khi nào |
|---|---|
| `cho-thong-tin` | Còn câu chưa trả lời (mặc định khi tạo) |
| `dang-lam` | Đủ thông tin, đang dựng |
| `cho-duyet` | Đã gửi link xem thử, chờ khách/chủ shop duyệt |
| `sua` | Khách góp ý, đang sửa |
| `xong` | Đã lên templexa.vn, khách nhận link |
| `huy` | Khách huỷ |

Đổi bằng: `node scripts/job.js status <job> <trạng thái> "ghi chú"`. JOBS.md tự cập nhật, xếp việc gấp lên trước.

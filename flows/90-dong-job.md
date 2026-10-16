# 90 · Đóng job, giải phóng dung lượng

Khi khách đã nhận link và **qua ngày tổ chức** (hoặc chủ shop bảo đóng):

```bash
node scripts/job.js status <job> xong     # nếu chưa
node scripts/job.js archive <job>
```
- Giữ lại trong `jobs/_archive/<job>/`: `job.json` (toàn bộ thông tin đã chốt), `log.md`, `feedback.md`.
- **Xoá** `input/` (ảnh gốc nặng, zip, ảnh chụp màn hình). Ảnh đã chuyển WebP nằm trong thư mục thiệp ở `Templexa/` nên thiệp vẫn chạy bình thường.
- Nhánh git `job-<slug>` đã merge thì xoá: `cd Templexa && git branch -d job-<slug> && git push origin --delete job-<slug>`.

Khách quay lại xin sửa sau khi đã lưu trữ → copy `jobs/_archive/<job>/` về `jobs/<job>/`, tạo lại `input/`, `job.js status <job> sua`.

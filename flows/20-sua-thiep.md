# 20 · Sửa thiệp theo góp ý

## Người góp ý (nhân viên / khách / chủ shop) — dùng công cụ "Sửa thiệp"
Mở: **`https://templexa.vn/sua-thiep.html?u=<link thiệp>`**
(vd `https://templexa.vn/sua-thiep.html?u=/event/thuan-hung-grad-2026/`; bản xem thử thì thay `templexa.vn` bằng `job-<slug>.templexa.pages.dev`). Trang không có link ở đâu trên web, không lên Google.

| Muốn | Làm |
|---|---|
| Chọn 1 chỗ | Bấm **🎯 Chọn chỗ sửa** (phím **P**) → rê chuột, chỗ nào sáng viền cam thì **bấm** |
| Chọn cả 1 khối | **Kéo chuột** khoanh vùng — hoặc chọn xong bấm **⬆ Khối lớn hơn** (phím ↑ khi đang rê) |
| Chọn nhanh không cần bật chế độ | **Chuột phải** vào chỗ đó → "Chọn chỗ này để sửa" (thiệp chặn chuột phải cũng được) |
| Điện thoại | Bật chế độ chọn rồi **chạm nhẹ**; vuốt vẫn cuộn thiệp bình thường |
| Thiệp có phong bì | Tắt chế độ chọn → bấm mở thiệp như khách → bật lại |
| Xem lại chỗ đã chọn | Nút **👁 Xem** — thiệp cuộn tới và nháy khung số |

Mỗi chỗ chọn → ghi **muốn sửa thế nào** vào ô bên phải → **📋 Copy gửi** → dán vào chat cho Muse/Claude. Phiếu tự lưu trên trình duyệt (tải lại trang không mất).

Đoạn copy có dạng:
```
Sửa thiệp: https://templexa.vn/event/thuan-hung-tot-nghiep/
File: products/Invitation/Other/khach_37_tot-nghiep-trang-trong/index.html
- [ ] (16/10 · 1) [#hero "THƯ MỜI" › #hero > h1.rv.d1] "THƯ MỜI" → Đổi thành "Thư mời thân thương"
- [ ] (16/10 · 2) [#gallery › div.item (thứ 3/8)] · ảnh: photos/anh_5.webp → ảnh bị cắt mặt, kéo xuống
```

## Người sửa (Muse / Claude)
1. Link trong đoạn dán → `node scripts/job.js find "<link>"` → ra job (chưa có job → tạo `--mode edit`, gắn thiệp theo flows/00).
2. Dán nguyên các dòng `- [ ] …` vào cuối `jobs/<job>/feedback.md` → `node scripts/job.js status <job> sua`.
3. `cd Templexa && git switch main && git pull && git switch -c job-<slug>-sua-<số>` (hoặc nhánh job cũ nếu chưa merge).
4. Mỗi dòng: dòng `File:` = file cần sửa; `[...]` = vị trí (phần › selector, "thứ 3/8" = phần tử thứ 3 trong 8 cái khớp); `"..."` = chữ đang hiện; `ảnh:` = file ảnh đang dùng. Tìm bằng chữ đang hiện trước (grep), selector để xác nhận đúng chỗ.
5. Sửa đúng yêu cầu, không sửa lan. Yêu cầu mơ hồ → hỏi lại kèm 2–3 phương án (skills/thiep mục D).
6. Xong dòng nào đổi `[ ]` → `[x]` + ghi ngắn "đã …". Chụp lại `shoot.js`, commit, `npm run deploy` (preview — tự pull + push), gửi link + ảnh trước/sau.
7. Đồng ý → merge main → `npm run deploy -- --prod` → `job.js status <job> xong`.

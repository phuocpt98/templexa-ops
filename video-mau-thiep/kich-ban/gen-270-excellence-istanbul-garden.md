# Kịch bản quay — gen_270 Excellence Istanbul Garden (Weekend cưới Vũng Tàu)

- Mẫu: "Thiệp Cưới Hoàng Anh & Hải Âu — 19–20.03.2027" (folder gen_270_excellence-istanbul-garden, file index.html). Phong cách garden weekend: tông ngà ivory + sage, rèm trắng đung đưa, cột đá, du thuyền + khách sạn Imperial Vũng Tàu. Hai ngày: tiệc chào mừng trên du thuyền 19/03 + lễ cưới 20/03/2027.
- Cách mở thiệp: KHÔNG có phong bì — hero mở thẳng (ảnh vườn + tên cặp đôi chữ Dancing Script). Nhạc "A Thousand Years" bật ở lần chạm đầu tiên (pointerdown/keydown); trong kịch bản bấm `.hero` chỉ để đánh dấu mốc nhạc (el.click() không kích hoạt pointerdown nên nhạc trang không tự bật — âm thanh video do ffmpeg trộn file mp3). Nút nhạc góc phải-dưới giữ trạng thái mặc định suốt video.
- Nhạc nền của thiệp: A Thousand Years (products/shared/music/wedding/).
- Font: Cormorant Garamond + Dancing Script (đã có trong font-cache). Lưu ý: Dancing Script dùng cho tên "Hoàng Anh & Hải Âu" — kiểm tra khung hình sau khi quay xem dấu tiếng Việt có rớt font không (subset vietnamese của Dancing Script trên Google Fonts chỉ chứa glyph dấu).
- Nền sân khấu: nen/vuon-bien-hoang-hon.jpg (MỚI gen đêm 01/11: sân vườn ven biển Địa Trung Hải lúc hoàng hôn, rèm trắng, cột đá, cây ô-liu + hồng trắng, biển xa — giữa khung trống êm). Dấu templexa.vn: giua-duoi (giữa-dưới, nền đá sáng, tránh chậu hồng hai góc dưới).
- Bản đồ vị trí (đo thật ở bề rộng 414px): .hero=0, .countdown=896, .celebrations=1331, #weekend=2896, .dress=4870, .stay=5628, .gift=6827, .rsvp=7272, .closing=8447. Trang cao ~8853px.
- Điểm nhấn trong video: hero vườn + tên cặp đôi → đếm ngược → 2 sự kiện (du thuyền Marina / khách sạn Imperial) → lịch trình 2 ngày với rèm lắc → dress code 2 ngày → 3 khách sạn gợi ý → form RSVP + lời chúc → cuộn về đầu → màn kết.
- Thời lượng dự kiến: ~29,5 giây.

# Kịch bản quay — gen_306 Sinh nhật bé Chuột Đèn Lồng Trăng Rằm (Bé Tép)

- Mẫu: "Sinh Nhật Bé Tép — Đèn Lồng Trăng Rằm" (folder gen_306_sinh-nhat-be-chuot-den-long-trang, file index.html, tiệc 10:00 CN 13.12.2026, Nhà hàng Sen Vàng — 45 Lê Văn Sỹ, Phú Nhuận, TP.HCM). Phong cách đêm trăng rằm: nền xanh đêm, trăng vàng, đèn lồng đỏ bay (canvas), chuột con ôm đèn lồng. Bé Nguyễn Minh Châu (Bé Tép) tròn 1 tuổi, sinh 14.12.2025.
- Cách mở thiệp: phong bì `#envelope` toàn màn hình (trăng + chuột + nút "Mở thiệp") — bấm vào phong bì là mở, nhạc bật ngay lúc bấm; phong bì ẩn hẳn sau ~1 giây, ngủ ~2,6 giây cho hero + đếm ngược ổn định.
- Nhạc nền của thiệp: file riêng của mẫu `assets/nhac-nen.mp3` (không phải nhạc shared/).
- Font: Mali + Nunito + Patrick Hand (đã có trong font-cache).
- Nền sân khấu: nen/dem-trang-den-long.jpg (MỚI gen đêm 01/11: trời đêm xanh thẫm, trăng rằm vàng lớn, đèn lồng đỏ bay — giữa khung trống êm). Dấu templexa.vn: trai-tren (góc trên-trái trời đêm tối, chữ trắng nổi, tránh trăng ở giữa-trên).
- Bản đồ vị trí (đo thật ở bề rộng 414px sau khi bấm mở phong bì): #hero=0, #be-la-ai=802, #loi-moi=1231, #tiec=1706, .map-frame=2228, #album=2515, #rsvp=3185, #loi-chuc=3913, #thanks=4421. Trang cao ~4872px.
- Lưu ý bản đồ: mục #tiec có iframe Google Maps (.map-frame) — lúc quay mạng ngoài bị chặn nên khung bản đồ vỡ/trống (ô trắng + icon ảnh lỗi), chỉ dừng ở #tiec ~2,4 giây rồi cuộn tiếp (như gen_336 đêm 31/10), tên + địa chỉ nhà hàng vẫn hiện ở hàng thông tin phía trên khung bản đồ.
- SỰ CỐ lượt quay HD đầu (đêm 01/11): video chỉ dài 15,6s thay vì 25,6s — nhạc riêng của mẫu `assets/nhac-nen.mp3` chỉ dài 12,24 giây, ffmpeg `-shortest` cắt video theo độ dài nhạc. ĐÃ FIX ở tầng pipeline: `quay.js` thêm `-stream_loop -1` cho input nhạc (nhạc ngắn thì lặp cho đủ video, nhạc dài không đổi) — đã kiểm chứng bằng test ffmpeg trước khi quay lại. Quay lại từ đầu sau fix.
- Điểm nhấn trong video: phong bì trăng + chuột mở ra → hero ảnh bé + đếm ngược → bé là ai (6 ô thông tin) → lời mời bố mẹ → thông tin tiệc (giờ/địa điểm/trang phục) → album 4 ảnh → form RSVP + sổ lời chúc → cảm ơn → cuộn về đầu → màn kết.
- Thời lượng dự kiến: ~28,6 giây.

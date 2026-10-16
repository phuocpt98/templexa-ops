# Bài Học Thiệp Cưới

> Tích lũy từ mỗi lần gen thiệp — dùng làm reference cho /gen-wedding và /gen-wedding-pro.
> Thêm bài học mới sau mỗi thiệp PRO hoặc khi nhận feedback.

---

## Nguyên tắc chống lặp

- Mỗi thiệp phải có **ít nhất 2 điểm khác biệt rõ ràng** so với thiệp gần nhất (layout, color palette, envelope style, animation type, typography pairing)
- Xem lại 3 thiệp gần nhất trước khi bắt đầu — liệt kê những gì đã dùng → tránh lặp
- Thử kỹ thuật mới mỗi lần: nếu lần trước dùng wax seal → lần này thử ribbon/card flip/polaroid
- Hero section là ấn tượng đầu tiên — **đầu tư sáng tạo nhất** cho hero + envelope

## Quy trình đã chứng minh hiệu quả

1. Xem ảnh → phân tích mood/color/style → đề xuất 3 style cho user chọn
2. Brainstorm TỪNG SECTION (dùng brainstormer agent) — không chỉ envelope
3. User chọn → implement
4. Screenshot (Puppeteer + Python HTTP server)
5. Thêm data.js (isPublic: false mặc định) + ghi bài học

---

## Thiệp #211 — Viết & Trang Hoa (Blush Romantic)

- Envelope wax seal + corner ornaments + blurred photo bg → ấn tượng mạnh
- Hero full-viewport với ảnh cưới nền dark + tên script lớn → sang trọng
- Dùng backgrounds floral overlay (wreath + corner dual) → thêm chiều sâu cho couple section
- Cupid icons 2 bên ảnh → điểm nhấn dễ thương
- Gallery aspect-ratio 4/5 + max-height 70vh → vừa màn mobile

## Thiệp #215 — Song Hỷ (Double Happiness)

- **Brainstorm trước khi code** — dùng brainstormer agent tạo 5-7 ý tưởng envelope → user chọn → kết quả WOW hơn tự nghĩ
- Chữ 囍 tách đôi (clip-path inset split) → hiệu ứng ĐỘC, gắn chặt chủ đề
- Ánh sáng vàng tràn khe giữa khi tách → thêm drama (div width 2px→100vw, radial-gradient gold)
- Gold confetti 20 particles CSS → cảm giác lễ hội
- Font Ma Shan Zheng cho chữ Hán decorative → đúng theme truyền thống
- Palette đỏ+vàng+đen → hoàn toàn khác blush/pastel → tránh lặp palette
- **Thiết kế THEO ảnh**: bộ ảnh nền đỏ + Song Hỷ 3D → thiệp đỏ vàng. Không ép ảnh vào template sẵn
- Envelope animation là yếu tố quyết định ấn tượng — đầu tư brainstorm kỹ

## Thiệp #217 — Garden Gate (Cổng Vườn Xanh)

- Brainstorm TỪNG SECTION (không chỉ envelope) → mỗi section có hiệu ứng riêng → chất lượng cao hơn
- Cổng sắt uốn 3D perspective rotateY → ý tưởng tốt, nhưng CSS shapes cổng sắt hơi thô → cần SVG inline hoặc background image cho phần phức tạp
- Hạt bồ công anh (dandelion seeds) thay petals/hearts → unique ambient, nhẹ nhàng
- Polaroid clothesline + pendulum swing → cute, phù hợp outdoor
- Garden path stepping stones xen kẽ trái/phải → love story hay
- Biển chỉ đường gỗ + chim đậu → chi tiết nhỏ nhưng tạo charm
- Đom đóm (fireflies) thay confetti → romantic, khác biệt
- Dresscode + Timeline bữa tiệc = 2 section mới hữu ích
- **CSS shapes phức tạp (cổng, cột) dễ thô nếu chỉ border/pseudo → dùng SVG inline hoặc background image**

## Thiệp #221 — Sage Green Emboss Paper (clone wedinvite.online/thiep1)

**Quy trình mới áp dụng thành công:**
- agent-browser mở URL tham khảo → screenshot từng section → phân tích design spec → clone layout
- Gemini gen nền giấy embossed (prompt tiếng Việt) → convert WebP → dùng làm background

**Bài học layout:**
- **Khung chữ nhật**: body nền trắng + `.invitation-frame` max-width centered với nền giấy → giống thiệp thật
- **Hero fit 1 màn**: bỏ `min-height: 100vh`, dùng `padding-top: 10vh`, giảm font/spacing để fit 844px
- **`.corners` div với `inset: 0`** trong flex container → kéo section ra cực lớn. Fix: bỏ hoặc thêm `height: 0; overflow: visible`
- **`#hero > * { position: relative }` blanket rule** → gây spacing sai. Chỉ set z-index cho element cần thiết

**Bài học ảnh corner:**
- Ảnh corner có khoảng trắng thừa → flip `scaleX(-1)` trông giống nhau. **PHẢI trim trước** bằng `magick -trim +repage`
- Ảnh PNG từ Gemini có checkered pattern **baked vào pixels** (không phải alpha thật) → không xoá nền tự động được. Dùng ảnh có sẵn trong thư viện hoặc gen lại với prompt rõ ràng "white background, NO transparency grid"
- Corner 4 góc: TL giữ gốc, TR `scaleX(-1)`, BL `scaleY(-1)`, BR `scale(-1,-1)` — **hoặc đảo ngược** tuỳ hướng hoa muốn (hướng vào trong hay ra ngoài)
- `env-corner` sát mép: dùng `top/left/right/bottom: -10px`

**Bài học animation:**
- Mỗi section NÊN có animation riêng (không dùng chung 1 `reveal` fade-up)
- Các variant hiệu quả: `reveal-left/right` (family 2 cột), `reveal-pop` (gallery stagger), `reveal-bounce` (countdown boxes), `reveal-flip` (ngày 3D), `reveal-zoom` (ảnh cinematic), `reveal-glow` (text blur→clear), `shimmer-text` (golden sweep)
- Stagger delay: 80-120ms giữa các item gallery, 100-300ms giữa countdown boxes
- Heart collage: `nth-child` CSS bị lệch nếu có element khác (SVG, img) trước các `.heart-item` → đặt decoration SAU items

**Bài học Gemini prompt nền giấy:**
- Prompt tiếng Việt hiệu quả, dễ chỉnh biến thể
- Keyword quan trọng: "mật độ THƯA/VỪA/DÀY", "relief NHẸ/RÕ", "khoảng cách RỘNG/VỪA"
- Prompt 1 gen quá đậm → thêm "chỉ 4-5 bông" + "relief RẤT NHẸ" để fix
- Luôn nói "Không có chữ, không có người, không có khung viền" ở cuối

## Thiệp #247 — Giỗ Tổ Họ Đỗ (3 bản: Sắc Phong / Hoành Phi / Kim Tối Giản)

**Bài học font:**
- **Cinzel LỖI glyph tiếng Việt** với `ư`/`ơ` — chữ "Ngược", "Chương", "Dương" bị fallback giữa chữ, gãy nét.
  Dùng **Playfair Display** thay thế (đủ dấu, cùng mood serif trang trọng).
- Danh sách font đã xác nhận đủ dấu tiếng Việt: Playfair Display, Cormorant Garamond, Be Vietnam Pro,
  Dancing Script, Quicksand, Nunito. **Great Vibes THIẾU dấu** — chỉ dùng cho chữ không dấu.
- **Cormorant Garamond mặc định dùng oldstyle numerals** → "18" hiện thành "ı8", "10:00" thành "ıo:oo".
  Bắt buộc ép khi hiển thị số (ngày, giờ, countdown):
  `font-variant-numeric: lining-nums; font-feature-settings: "lnum" 1;`

**Bài học element AI gen (bộ `heritage-elements`):**
- Prompt lưới 3×3 cho AI gen ảnh hiệu quả — 9 element/lần, nhất quán style, tiết kiệm công
- Cắt bằng `scripts/cut-element-grid.js`. Ba cạm bẫy đã vấp:
  1. **Tách nền theo độ sáng làm thủng element** — vàng nhạt `#F5E6B8` sáng 245, gần bằng nền trắng.
     → Phải lọc theo **chroma** (max−min RGB): trắng ≈0, vàng ≥40. Chỉ pixel *vừa sáng vừa trung tính* mới là nền.
  2. **Lưới cứng cắt cụt element** — đôi rồng rộng hơn 1/3 ảnh, bị xén hai bên.
  3. **Gộp theo bbox làm dính cả hàng** — góc chữ L có bbox rộng, chồng bbox element bên cạnh dù không chạm pixel.
     → Giải pháp đúng: **gán component theo tâm về ô lưới, rồi hợp bbox** — vừa gộp đúng mảnh rời
     (rồng + viên ngọc, dải dọc 3 thanh), vừa cho tràn biên ô.
- Element có **alpha thật** thì không cần `mask-image` vá víu → luôn ưu tiên gen bộ mới thay vì tái dùng ảnh nền trắng

**Bài học chống "thô và khô":**
- Feedback "thô/khô" thường KHÔNG phải thiếu hoa văn mà **thiếu chất liệu**. Chữa theo thứ tự:
  1. **Grain giấy** — SVG `feTurbulence` overlay opacity 0.04–0.08
  2. **Vàng phải là gradient ánh kim** (bronze→gold→champagne→gold→bronze) + shimmer chậm 6–10s,
     KHÔNG dùng một mã hex phẳng
  3. **Đường kẻ dùng `linear-gradient(90deg, transparent, gold, transparent)`** — tan dần hai đầu,
     mềm hơn hẳn `border` đặc
  4. **Bóng đổ nhiều lớp** (3 lớp: 1–2px, 8–24px, 24–64px) → cảm giác giấy dày thật
  5. Trên nền tối: `filter: drop-shadow(0 0 12px rgba(gold,.25))` cho element → ánh vàng toả, rất sang
- Mật độ trang trí phải **theo concept**: bản tối giản chỉ 4–6 element; bản cổ điển/nền đen dùng đậm.
  Nhồi hoa văn vào bản tối giản = phá concept, không phải chữa lỗi.

**Bài học chạy nhiều agent song song:**
- Agent song song **đè screenshot của nhau** do trùng tên file + trùng cổng HTTP server trong scratchpad chung.
  → Khi spawn, cấp sẵn cho mỗi agent: **prefix tên file riêng** (`v1sp-`, `v2hp-`, `v3-`) và **cổng riêng** (8791/8793/…)

**Bài học biến thể nội dung:**
- Nhiều thiệp chỉ khác 1–2 dòng (chi họ, nhánh, đơn vị) → **1 file + URL param** (`?chi=bac-ninh` + map object),
  KHÔNG nhân bản file. Thêm nhánh mới chỉ cần thêm key vào map.

## Review Checklist

- [ ] Responsive mobile (max-width: 420px)
- [ ] Envelope decoration đủ cầu kỳ
- [ ] Font pairing đúng mood
- [ ] Animations smooth, prefers-reduced-motion
- [ ] ≥2 điểm khác biệt so với 3 thiệp gần nhất
- [ ] Corner images trimmed (không thừa whitespace)
- [ ] Hero fit 1 màn mobile (không scroll để thấy tên)
- [ ] Mỗi section có animation riêng (không chung reveal)
- [ ] Ảnh trang trí không có checkered/nền trắng lộ

## Thiệp #271 — Bích Ngọc Trai (clone ziuwedding: vophong + phongbi + mxm)

**Bài học font (SỬA lại ghi chú cũ ở #247):**
- **Great Vibes ĐÃ có subset `vietnamese`** trên Google Fonts và render đủ dấu ("Chú rể", "Cô dâu") —
  ghi chú "Great Vibes THIẾU dấu" ở mục #247 đã lỗi thời. Vẫn nên kiểm chứng bằng cách render thật
  thay vì tin danh sách cũ.
- Cách kiểm tra nhanh subset: `curl -H "User-Agent: <UA Chrome>" "https://fonts.googleapis.com/css2?family=X" | grep vietnamese`.
  **Bắt buộc gửi UA trình duyệt** — UA mặc định của curl trả CSS không có comment subset → grep luôn ra 0, dễ kết luận sai.
- Font script đủ dấu đã render-verify: **Pinyon Script** (copperplate mảnh, sang — hợp navy/luxury),
  **Italianno**, **Great Vibes**, **Dancing Script**, **Charm**.
  Pinyon Script khớp nhất với chữ script trên thiệp LadiPage thương mại (1FTV Askilon / Imperial Script).

**Bài học thu hoạch element từ site tham khảo:**
- `scripts/mirror-site.js` bắt được TOÀN BỘ ảnh element gốc của trang LadiPage → nguồn element
  chất lượng cao, **alpha thật**, tốt hơn hẳn gen mới. Luôn mirror trước khi nghĩ đến gen ảnh.
- Dựng **contact sheet** (sharp composite lên nền xám xanh) để xem một lượt cả bộ + kiểm alpha —
  nhanh hơn mở từng file rất nhiều.
- Trang "phong bì" và trang thiệp thật thường là **2 URL riêng** (`/vophongbixanhduong` → link sang
  `/phongbixanhduong`). Click không mở được thì soi `<a href>` trong DOM, đừng cố click mãi.

**Bài học bong bóng lời chúc (floating wishes):**
- `position: fixed; bottom: 70px` **che tiêu đề section** ở gần như mọi màn — lỗi nặng, phát hiện qua screenshot.
  Chữa: `bottom: 9px`, tối đa **2** bong bóng, và **tắt hẳn khi hero / closing đang trong viewport**
  (IntersectionObserver, thêm class `.muted { opacity: 0 }`) — tên cô dâu chú rể không bao giờ bị che.

**Bài học ảnh nền hero/closing full-bleed:**
- Ảnh cưới studio nền TRẮNG + veil navy nhạt → chữ trắng chìm hẳn. Veil phải **đậm và bắt đầu sớm**:
  `linear-gradient(to bottom, transparent 18%, .26 42%, .72 68%, .97 100%)`. Bản đầu dùng `.55 62%` là quá nhạt.
- **Hạt hiệu ứng (petal/sparkle) đè lên MẶT người trong ảnh** trông như vết bẩn ở ảnh chụp tĩnh.
  Giữ `opacity ≤ .35` + `filter: blur(1px)` + size 5–11px → đọc ra bokeh chứ không ra đốm trắng.

**Bài học vặt:**
- `build-og-cover.js` **không có `--help`** — gọi kèm cờ lạ là nó chạy luôn target mặc định (gen_247),
  ghi đè file của sản phẩm khác. Đọc docstring trước, đừng dò bằng `--help`.
- `apply-shots.js` tự set luôn `thumbnail` = ảnh main → không cần og-cover.jpg riêng cho thiệp mới.

## Thiệp #272 — Mối Duyên Sen (clone ziuwedding: moiduyenvangg + moiduyenvang1)

**Bài học z-index trang trí — LỖI ĐÃ VẤP:**
- `.deco { position: absolute }` **không có z-index** thì ảnh trang trí **vẽ ĐÈ LÊN chữ** của section
  (element absolute luôn nằm trên element static cùng stacking context). Bông sen che mất chữ
  "Hãy xác nhận sự có mặt…" — chỉ phát hiện qua screenshot.
- Chữa đúng: `.deco { z-index: 0 }` **+** `#section > *:not(.deco) { position: relative; z-index: 1 }`.
  `position: relative` không kèm offset **không đổi layout** nên an toàn — khác với bài học #221
  (ở đó lỗi là do `.corners { inset: 0 }` trong flex container, không phải do `position: relative`).
- Quy tắc chung: mục "Trang trí mọi section" trong skill phải đi kèm z-index, nếu không sẽ che chữ.

**Bài học ảnh element thừa nền trong suốt:**
- `tassel-pink.webp` gốc **450×450 nhưng nội dung chỉ 59×399** → đặt `width: 13%` thì tua rua thật
  chỉ rộng ~6px, gần như vô hình. Tưởng ảnh hỏng, thực ra là thừa vùng trong suốt.
- **Luôn `sharp().trim({threshold:1})` element sau khi harvest**, và so `trim.width/height` với gốc:
  ```js
  const m = await sharp(f).metadata();
  const t = await sharp(f).trim({threshold:1}).metadata();
  if (t.width < m.width*0.9 || t.height < m.height*0.9) → cần trim
  ```
  Chạy quét cả bộ một lượt, rẻ hơn nhiều so với dò từng ảnh khi bố cục đã sai.
- Sau khi trim, tỉ lệ ảnh đổi hẳn (0.148 dọc) → phải đặt lại `width`/`top` chứ không giữ số cũ.

**Bài học font cho tông truyền thống Việt:**
- Bộ **Italianno + Cormorant Garamond + Quicksand** đủ dấu tiếng Việt, hợp tông sen/áo dài,
  và khác hẳn bộ của #271 (Pinyon + Playfair + Be Vietnam Pro) → thoả quy tắc chống lặp.
- **Cormorant Garamond oldstyle numerals**: đã ép `font-variant-numeric: lining-nums` +
  `font-feature-settings: "lnum" 1` cho MỌI chỗ có số (ngày, giờ, countdown, số tài khoản).
  Kiểm chứng bằng screenshot **deviceScaleFactor: 3** — ở 1x dấu nặng của "Ngọ" trông như mất,
  thực ra chỉ là artefact độ phân giải. **Đừng sửa "lỗi" dấu khi chưa zoom kiểm tra.**

**Bài học chọn ảnh khi clone site tham khảo:**
- Ảnh trong trang tham khảo là **ảnh cưới thật của khách người ta** → KHÔNG tái sử dụng.
  Chỉ lấy element trang trí (hoa văn, phong bì, dấu sáp, hoạ tiết), ảnh người phải lấy từ
  `products/shared/images/wedding/<bộ>/`.
- Khi bộ ảnh thư viện lệch tông với ref (ref xanh/hồng, thư viện kem/vàng) → **hỏi user** chọn:
  giữ palette ref, hay kéo palette theo ảnh. Đừng tự quyết, vì đây là điểm nhìn thấy ngay.

**Bài học bố cục hay (giữ lại dùng tiếp):**
- **Countdown lồng trong phong bì mở** (ảnh `envelope-pink-open` + thẻ giấy xé mép `mask-image`
  đặt `top: 6%` nhô lên khỏi miệng phong bì) → đọc ra như tấm thiệp đang được rút ra. Rất ấn tượng,
  hơn hẳn 4 ô countdown rời.

## Thiệp #273 — Mây Hồng Chibi (clone ziuwedding: mauhong)

**LỖI NẶNG ĐÃ VẤP — trim ảnh thư viện SAU khi thiệp đã dựng:**
- Chạy audit trim cho CẢ `navy-elements` + `lotus-elements` trong lúc làm thiệp mới → đổi tỉ lệ
  hàng chục element mà **#271 và #272 đang phụ thuộc** → CSS `width`/`top` của 2 thiệp đã ship sai hết.
- Phải `git checkout` navy-elements và re-harvest lotus-elements từ mirror để khôi phục.
- **Quy tắc: chỉ trim ảnh TẠI LÚC HARVEST, trước khi viết CSS.** Thiệp đã dựng xong thì ảnh của nó
  là *đóng băng* — muốn sửa phải kiểm tra lại toàn bộ thiệp đang dùng ảnh đó.
- Trước khi đụng bất cứ file nào trong `products/shared/images/`, hỏi: *thiệp nào đang dùng?*
  ```bash
  grep -rl "tên-file.webp" products/Invitation/ products/Web/
  ```

**LỖI API — `.trim().metadata()` trả kích thước GỐC:**
- `await sharp(f).trim({threshold:1}).metadata()` **KHÔNG** phản ánh kết quả trim → audit ở #272
  báo "không có ảnh nào thừa viền" trong khi thực tế rất nhiều ảnh thừa.
- Cách đúng: render ra buffer rồi mới đo.
  ```js
  const buf = await sharp(f).trim({threshold:1}).webp().toBuffer();
  const t = await sharp(buf).metadata();   // đây mới là kích thước sau trim
  ```

**LỖI TÊN ĐÔI TRÀN KHUNG (quy tắc "Tên couple responsive" chưa đủ):**
- `white-space: nowrap` + `clamp(2rem, 9.5vw, 2.9rem)` vẫn **tràn** với "Minh Khang & Minh Châu".
- Đo thật thay vì đoán: **Great Vibes rộng ≈ 10.3× cỡ chữ** cho chuỗi tên đôi tiếng Việt.
  ```js
  probe.style.cssText='position:absolute;visibility:hidden;white-space:nowrap;font-size:100px;font-family:...';
  const per100 = probe.getBoundingClientRect().width;   // → cỡ chữ tối đa = (khung - padding - 8) / per100 * 100
  ```
  Suy ra clamp an toàn: `clamp(1.45rem, 8vw, 2.3rem)`.
- **Thêm lưới an toàn JS `fitNames()`** — thiệp là template, khách sẽ đổi sang tên dài hơn.
  Đã test: tên 41 ký tự tự co từ 34.4px → 20.4px, vẫn vừa khung.
- ⚠️ **`scrollWidth` của element BLOCK luôn ≥ `clientWidth`** → vòng lặp thu nhỏ chạy tới đáy (co còn 11px).
  Element đo bề rộng chữ **bắt buộc `display: inline-block`**, rồi so `getBoundingClientRect().width`.

**Bài học layout hay (giữ lại):**
- **Viên thuốc tràn mép** (`float: right` + `border-radius: 999px 0 0 999px`, không padding ngoài)
  cho nhãn sự kiện — trái/phải xen kẽ → nhịp rất động, hợp thiệp trẻ trung.
- **Lịch tháng đánh dấu ngày cưới bằng trái tim SVG** (`::before` inline SVG stroke) — dựng bằng JS
  từ `new Date()` nên không bao giờ sai thứ; tuần bắt đầu Thứ Hai: `lead = (firstDay + 6) % 7`.
- **Thiệp nhà gái 2 mốc** (Lễ Vu Quy + tiệc nhà gái) — catalog trước đó chỉ có thiệp 1 mốc nhà trai.

## Thiệp #274 — Xám Mực (clone 100% ziuwedding: tuanhien1)

**Nền ảnh chạy suốt thiệp — ĐỪNG dùng div `position: fixed`:**
- Concept: MỘT tấm ảnh cưới làm nền cố định cho toàn bộ thiệp + lớp phủ tối, chữ trắng.
- Làm bằng `<div class="bg-fixed">` (position:fixed, z-index:-2) thì **`scripts/shoot-mobile.js`
  quét và XOÁ** nó vì tưởng là overlay → `open.webp` và `sec-1.webp` ra nền xám trơn, mất sạch ảnh.
  Log của script có ghi rõ: `overlay:fx>removed:3`.
- Cách đúng: đặt nền bằng **CSS `background-image` trên `.card-frame`**, phủ tối bằng
  `linear-gradient` chồng lớp trong cùng thuộc tính:
  ```css
  background-image: linear-gradient(rgba(40,40,40,.62),rgba(40,40,40,.62)), url(anh.webp);
  background-attachment: fixed, fixed;
  ```
  Script không xoá được background CSS. iOS Safari không hỗ trợ `attachment:fixed` → tự lùi về
  `scroll`, ảnh vẫn hiện đủ, chỉ mất hiệu ứng đứng yên. Chấp nhận được.
- **Luôn mở `shots/*.webp` ra xem sau khi chạy `shoot:mobile`** — đừng tin log "→ 3 ảnh".

**Đo bề rộng chữ: probe span KHÔNG chính xác, phải đo element thật:**
- Ước lượng bằng probe `font-size:100px` cho ra hệ số **15.36×**, thực tế đo trên element là **16.03×**
  → chênh 4%, đủ để tiêu đề tràn thành 2 dòng dù tính toán bảo "vừa".
- Cách đo đúng số dòng và bề rộng thật:
  ```js
  const rg = document.createRange(); rg.selectNodeContents(el);
  const soDong = rg.getClientRects().length;          // đếm dòng CHUẨN
  // bề rộng 1 dòng: bọc nội dung trong <span style="white-space:nowrap"> rồi đo span
  ```
- Probe chỉ để ước lượng nhanh; **chốt bằng số dòng thật** trước khi kết luận đã fix.

**Cảnh báo đo đạc: `!!TRÀN` giả do đang chạy transition:**
- Thêm class `in-view` rồi đo ngay lập tức → element vẫn đang ở giữa transition
  `translateX(±34px)` của scroll-reveal → `scrollWidth` báo tràn ngang trong khi thật ra không tràn.
- Phải **đợi hết transition (~2.2s)** rồi mới đo, và kiểm tra bằng *có cuộn ngang được không*
  (`window.scrollTo(9999,y)` rồi đọc `scrollX`) chứ không chỉ nhìn `scrollWidth`.

**Lỗi tràn ngang THẬT ở ô grid:**
- `.gift-grid` 2 cột: ô con mặc định `min-width: auto` nên số tài khoản dài đẩy cột rộng ra,
  tràn khung ở màn 320px. Fix: `min-width: 0` cho ô grid + `overflow-wrap: anywhere` cho chuỗi số.
  → Nên áp mặc định cho MỌI grid 2 cột có nội dung là chuỗi dài không dấu cách.

**Font khớp mẫu gốc:**
- Mẫu LadiPage này dùng **Prata + Tinos + Open Sans** — đều là Google Fonts CÓ subset `vietnamese`
  → clone được 1:1, không phải thay thế. Luôn kiểm tra font gốc của mẫu trước khi đi tìm font tương đương.

### Bổ sung #274 — nền ảnh full-width (feedback user)

**Lỗi 1 — nền chỉ nằm trong cột thiệp → web hở 2 mép đen:**
- Đặt `background-image` lên `.card-frame` (max-width 480px) thì trên desktop 1440px
  hai bên là màu nền đặc. Mẫu gốc phủ ảnh **toàn bộ viewport**.
- Fix: đưa nền lên **`<body>`** + `background-size: auto 100%` + `repeat-x`.
  Cột thiệp làm tối hai bên bằng `box-shadow: 0 0 0 100vmax rgba(18,18,18,.3)`
  (giữa sáng – hai bên trầm, đúng mẫu), tắt shadow ở `@media (max-width:480px)`.

**Lỗi 2 — nền web bị phóng to mờ:**
- Nguyên nhân: ảnh nguồn `korean-studio-gray/couple_1.webp` chỉ **599×799**, bị kéo lên
  cao bằng viewport (900px+) → vỡ nét. **Luôn kiểm tra độ phân giải ảnh trước khi dùng làm nền full-screen.**
- Fix đúng cách (theo yêu cầu user): **ghép 3 ảnh dọc thành 1 ảnh nền** bằng sharp
  (`products/.../assets/bg-triptych.webp`, 2100×1200 — mỗi panel 700×1200), chọn ảnh nguồn
  cao ≥1200px để phép resize là THU NHỎ. Mobile ≤480px đổi sang `bg-single.webp` qua media query.
- Chọn 3 dáng **khác hẳn nhau** (ôm / bồng / đứng) — 2 ảnh cùng dáng đặt cạnh nhau trông như lỗi lặp.

**⚠️ Watermark hãng ảnh khác:**
- `modern-romantic/couple_3.webp` có **watermark "玫瑰星座STUDIO"** burn-in ở đáy ảnh.
  Đã loại khỏi #274. **Vẫn còn dùng ở gen_184, gen_194, gen_202** — cần rà lại.
- Trước khi dùng ảnh thư viện làm nền lớn: cắt dải đáy ~18% xem có watermark không
  (`sharp(f).extract({top: h-0.18h, ...})`), vùng này là chỗ watermark hay nằm.

## Thiệp #275 — Cổng Hoa Kiểu Pháp (gen lại từ tham khảo SPA build)

**Nhận diện SPA build khi được đưa "mẫu tham khảo":**
- File `index.html` chỉ có `<div id="root"></div>`, toàn bộ giao diện do JS dựng lúc chạy.
  Kiểm nhanh: `sed -n '/<body>/,/<\/body>/p' index.html` — nếu rỗng thì là SPA.
- Bundle đã minify (745KB / 309 dòng) → **không sửa được nội dung**: tên cô dâu chú rể, ngày,
  địa điểm nằm sâu trong JS. Không dùng lại được cho khách. Chỉ có giá trị làm **tham khảo design**.
- Kiểm thương hiệu/bên thứ ba trước khi định dùng lại:
  `grep -oic "<tên brand>\|lovable\|gpt-engineer\|typekit" script.js index.html`
- **Font Adobe Typekit (`use.typekit.net/...`) khoá theo domain** — chạy ở `file://` hoặc localhost
  vẫn ra font đúng nên rất dễ tưởng ổn, nhưng lên domain thật sẽ bị từ chối. Đừng kết luận
  "font chạy được" chỉ vì test local.
- ⚠️ Mình từng đoán sai: tưởng `file://` sẽ trắng trang do CORS ES module — thực tế nhúng bằng
  `<script defer src>` thường nên chạy bình thường. **Chạy thử rồi hãy kết luận.**

**Gen lại bản của mình thay vì bê nguyên:**
- Trích design spec (1 tông màu `#3A5542` + kem, 2 font), rồi **gen asset riêng bằng `/gen-image`**:
  cổng hoa màu nước, dấu sáp khắc chữ lồng, lư hoa, nhành hoa góc. 4 ảnh, tổng 676KB sau khi
  resize về đúng cỡ hiển thị (gốc 1.2MB) — so với 49MB của bản build.
- Kết quả: 1 file HTML thuần 888KB cả assets, sửa nội dung trực tiếp được.

**Font kiểu Pháp cổ điển đủ dấu tiếng Việt:**
- `mrs-eaves` (Adobe) → thay bằng **EB Garamond**; `parfumerie-script` → **Pinyon Script**.
  Cả hai đều có subset `vietnamese`. Ép `lining-nums` ở `:root` cho toàn bộ số.

**RSVP gửi Google Sheet — số liệu thực đo:**
- `sheetsAPI.post(sheetId, {A,B,C,D})` từ trình duyệt **resolve sau ~6.2s**
  (`{"status":"success"}`). Phải để timeout chờ ≥ 8s khi test, nếu chỉ đợi 6s sẽ tưởng bị treo.
- `curl` POST thẳng mất ~31s vì đi theo chuỗi redirect và trả HTML — **đừng dùng curl để kết luận
  API hỏng**; kiểm bằng `GET ?sheet_id=...` xem dòng đã vào sheet chưa mới chắc.
- UX bắt buộc: disable nút + đổi chữ "Đang gửi…" trong lúc chờ, và `.catch()` phải lưu tạm
  vào localStorage để người gửi không mất lời chúc khi rớt mạng.

### Bổ sung #275 — dùng lại asset gốc của mẫu tham khảo

**Video có chữ burn-in — PHẢI soi từng giây trước khi dùng:**
- `hero-video` của mẫu gốc in sẵn "Diana & Richard / JULY 23 / Peninsula Hotel Istanbul"
  từ giây ~4.6, và monogram chữ cái của họ từ ~3.5s. Dùng nguyên = đưa tên khách người khác
  vào thiệp của khách mình.
- Cách soi: `ffmpeg -ss <t> -i v.mp4 -frames:v 1 out.jpg` ở nhiều mốc, ghép contact sheet rồi xem.
  Cắt đúng cửa sổ sạch: `ffmpeg -ss A -t B -i ...`.
- ⚠ `-frames:v 1` với video range-limited có thể lỗi `Non full-range YUV is non-standard`
  → thêm `-pix_fmt yuvj420p`.

**Nén media gốc (số liệu thật):**
- Video hero gốc **18 Mbps** (thừa ~15 lần) → `-crf 27 -preset slow` còn ~1/7 dung lượng.
- **Intro gốc là HEVC** → Chrome/Firefox nhiều máy không phát. **Luôn transcode về H.264**
  (`-c:v libx264 -profile:v main -pix_fmt yuv420p`) + `-movflags +faststart`.
- Nhạc 320kbps → 128kbps: 5.2MB → 2.3MB, tai thường không phân biệt trên loa điện thoại.
- 16 PNG trang trí 8.9MB → **2.2MB WebP** (trim ngay lúc harvest).

**LỖI CSS đã vấp — blanket rule đè `position`:**
- Rule `section > *:not(.deco){position:relative;z-index:1}` có specificity **(0,1,1)**,
  đè mất `.hero-vid{position:absolute}` **(0,1,0)** → video tụt thành khối thường,
  chỉ chiếm 693px giữa section thay vì phủ nền.
  → Scope bằng ID: `#hero .hero-vid{...}` (1,1,0) mới thắng.
- Blanket rule đó **chỉ áp cho con trực tiếp**. Khối lồng sâu (`.dc-c` trong `.dc-grid`)
  không được nâng z-index → phải liệt kê riêng:
  `.ev-card,.dc-c,.gift-c,.tl,.form{position:relative;z-index:1}`
- Thẻ nền `rgba(255,255,255,.6)` để ảnh trang trí **lộ xuyên qua** làm chữ khó đọc —
  không phải lỗi z-index. Nền thẻ nằm trên ảnh trang trí nên cần **≥ .84** mới đủ tương phản.

**Font gốc không dùng được cho tiếng Việt:**
- `parfumerie-script` (Adobe) **không có glyph tiếng Việt** — "Vạn/Ngọc" gãy nét, dấu chồng lên nhau.
  `mrs-eaves` thì rơi về serif hệ thống. Kiểm bằng cách render thật rồi so với `font-family: serif`.
- Thay bằng **EB Garamond + Pinyon Script** — cùng mood, đủ dấu, miễn phí.

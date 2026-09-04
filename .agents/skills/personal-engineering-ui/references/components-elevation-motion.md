# Component, elevation, motion và CSS

## 1. Chống card soup

Không phải mọi block đều cần card. Featured article, lab có ảnh, profile và search dialog có thể dùng card. Recent notes, archive, activity và metadata list nên ưu tiên divider hoặc list row.

Không lặp card + badge + uppercase label + title + description + action icon với cùng radius và spacing. Mỗi loại nội dung cần treatment phù hợp với vai trò của nó.

## 2. Surface, shadow và radius

Card quan trọng nên đẹp nhờ surface, layered shadow, spacing và typography; không dùng border kín làm outline chính.

Light mode tham khảo:

```css
--shadow-card-rest:
  0 1px 2px rgb(29 32 39 / 0.04),
  0 8px 24px rgb(29 32 39 / 0.06);

--shadow-card-hover:
  0 2px 4px rgb(29 32 39 / 0.05),
  0 14px 36px rgb(29 32 39 / 0.09);
```

Dark mode tham khảo:

```css
--shadow-card-rest:
  0 1px 2px rgb(0 0 0 / 0.26),
  0 10px 26px rgb(0 0 0 / 0.22);

--shadow-card-hover:
  0 2px 4px rgb(0 0 0 / 0.30),
  0 16px 38px rgb(0 0 0 / 0.30);
```

Shadow phải mềm, nhiều layer và opacity thấp. Không dùng giant shadow, glow hoặc cùng một elevation cho mọi component.

### Feature card theo theme và SAA-C03 Exam Practice

Feature card phải khai báo surface, text, metadata, tile và CTA theo từng theme; không hard-code một dark surface rồi dùng cho cả light và dark mode.

- Light mode dùng white, cream hoặc light warm gray. Tạo chiều sâu bằng một contact shadow rất nhẹ kết hợp ambient shadow rộng hơn, opacity thấp; không dùng mảng charcoal lớn để tạo hierarchy.
- Dark mode được dùng charcoal hoặc near-black. Tile bên trong sáng hơn outer surface một chút để tách lớp mà không cần border gắt.
- SAA-C03 Exam Practice giữ composition compact và grid `2 × 2` trên desktop. Không kéo trở lại thành giant hero hoặc bốn hàng dọc.
- Mỗi domain tile phải có context theo thứ tự `index + semantic dot + DOMAIN n`; index không được đứng trơ trọi như placeholder.
- Màu domain chỉ xuất hiện ở dot nhỏ. Không tô nền tile theo từng domain, không glow và không biến cụm này thành dashboard nhiều màu.
- Elevation của domain tile luôn thấp hơn container chính; hover chỉ nâng `1px` và tăng shadow nhẹ.

Radius tham khảo:

```text
Control và service tag    8–10px
Article tag                5–7px
Post và profile card     12–16px
Large media              14–18px
```

Chỉ dùng pill radius khi hình dạng pill có ý nghĩa. Không dùng radius 20–30px cho mọi thứ.

## 3. Service/topic tag

Service/topic tag thuộc editorial topic shelf, không phải generic Material chip hay dashboard filter.

- Natural width, consistent height và wrap thành nhiều hàng.
- Padding dọc khoảng 6–8px, ngang khoảng 9–12px.
- Icon, label và count cách nhau khoảng 7–8px.
- Monospace 11–12px hoặc sans nhỏ nếu hợp hierarchy.
- Surface neutral, border cực nhẹ hoặc không border.
- Tint giữa các service chỉ khác rất nhẹ và saturation thấp.
- Count muted hơn label.

Ngoại lệ: service/topic tag được dùng emoji nhỏ ở đầu. Emoji không được lớn hoặc nổi hơn label.

Hover chỉ nâng khoảng `translateY(-1px)`, tăng shadow nhẹ và thêm accent tint rất nhỏ trong 150–180ms. Active state dùng accent-soft, không neon và không đổi cả tag thành màu bão hòa.

## 4. Article tag

Article tag như `VPC`, `S3`, `SAA-C03` phải khác service/topic tag:

- nhỏ hơn, neutral hơn và low contrast;
- không emoji;
- padding khoảng 4–7px;
- radius khoảng 5–7px;
- dùng filled surface nhẹ hoặc outline gần như không thấy;
- không dùng màu riêng cho từng tag;
- chỉ đổi accent rất nhẹ khi hover.

Article tag hỗ trợ metadata và không được tranh attention với title.

## 5. Button, link và action indicator

Primary button dùng accent tiết chế và shadow rất nhỏ. Secondary action ưu tiên text, ghost hoặc neutral surface; không dùng viền dày.

CTA trong article/list thường là text link. Nếu cần arrow hoặc external-link indicator, dùng SVG/PNG asset thật từ hệ icon thống nhất; không dùng ký tự Unicode hoặc text để giả icon. Không phải row hay section nào cũng cần action indicator.

## 6. Profile action

GitHub và LinkedIn là hai compact button cùng hàng, cùng visual weight và dùng brand icon phù hợp. CV là text link căn giữa ở dòng riêng, có underline tinh tế và khoảng cách riêng; CV không được dùng cùng treatment với social button.

## 7. Header elevation

Sticky header phải gắn với trang. Dùng surface solid hoặc hơi translucent, border-bottom nhẹ và shadow rất nhỏ nếu cần:

```css
position: sticky;
top: 0;
box-shadow:
  0 1px 0 rgb(29 32 39 / 0.03),
  0 8px 20px rgb(29 32 39 / 0.025);
```

Backdrop blur nhẹ được phép. Cấm outer radius lớn, khoảng hở quanh header, glassmorphism rõ và shadow khiến header giống floating card.

## 8. Hover và motion

Motion phải nhỏ, mượt và có mục đích:

```text
Micro hover       150–180ms
Card elevation    180–240ms
Image hover       350–500ms
Menu/dropdown     180–260ms
```

Cho phép `translateY(-1px)` đến `translateY(-2px)`, image scale khoảng `1.01–1.02`, color shift nhẹ, shadow tăng nhẹ hoặc icon asset dịch 2–3px.

Không dùng bounce, spring mạnh, rotate, glow, parallax, scale lớn hoặc animation chạy liên tục. Không animate mọi paragraph. Luôn tôn trọng `prefers-reduced-motion`; hover không được là cách duy nhất biểu đạt state và `focus-visible` phải rõ.

## 9. Icon asset

- Không dùng ký tự Unicode để giả navigation icon, arrow, chevron, external-link hoặc interaction.
- UI icon nhỏ dùng một SVG family, ưu tiên `currentColor`.
- Icon nổi bật có thể dùng transparent PNG hoặc CDN asset ổn định; centralize URL/reference.
- Không mix ngẫu nhiên filled, outline, emoji và nhiều family.
- Emoji chỉ được xuất hiện trong service/topic tag.

## 10. CSS architecture

`globals.css` chỉ chứa reset, base style, theme variable, design token và rule thực sự global. Component-specific CSS phải tách theo architecture hiện tại, ví dụ:

```text
src/styles/
  tokens.css
  header.css
  sidebar-left.css
  sidebar-right.css
  homepage.css
  tags.css
  footer.css
```

Hoặc colocate CSS với component nếu project đã theo cách đó. Ưu tiên CSS class rõ nghĩa, explicit style và reusable token. Centralize colors, shadow, radius, spacing và transition duration.

Tránh inline style hàng loạt, giant style object trong TSX, selector quá sâu, duplicated color/shadow, arbitrary spacing và utility soup khó đọc. Không over-engineer thành một design system lớn nếu project chưa cần.

## 11. Thứ tự ưu tiên khi làm giao diện “sang”

1. Typography.
2. Hierarchy.
3. Spacing.
4. Surface và elevation.
5. Icon nhất quán.
6. Motion nhỏ.
7. Decoration sau cùng.

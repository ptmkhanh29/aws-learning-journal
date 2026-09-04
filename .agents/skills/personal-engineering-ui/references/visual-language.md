# Visual Language

## 1. Tính cách

Visual language mặc định: **Editorial Engineering Notebook**.

Cảm giác mong muốn:
- personal engineering journal;
- technical nhưng dễ đọc;
- modern indie developer;
- quiet confidence;
- có chi tiết riêng khi nhìn kỹ.

Không được trông giống:
- SaaS landing page;
- admin dashboard;
- corporate documentation portal;
- AWS Console clone;
- generic Tailwind template.

## 2. Surface và background

Light mode:
- dùng warm off-white/paper thay vì pure white;
- surface card sáng hơn nền một chút;
- text near-black, không bắt buộc `#000`;
- có thể dùng technical grid/noise rất nhẹ 2–4% contrast.

Direction tham khảo, không phải mã màu bắt buộc:

```text
background  #F5F5F1
surface     #FAFAF7
text        #171B19
muted       #6E756F
border      #DADDD7
accent      #167C73
```

Dark mode:
- deep charcoal, có thể hơi green-tinted;
- không pure black nếu không có chủ ý;
- surface tách nền bằng luminance + shadow/overlay tinh tế;
- ảnh có thể giảm brightness nhẹ để không chói.

Direction tham khảo:

```text
background  #0E1311
surface     #121815
text        #E9ECE9
muted       #89918C
border      #252D29
accent      #5DC5B7
```

## 3. Grid / texture

Grid là signature detail, không phải background decoration lớn.

- line/grid mảnh, low contrast;
- chỉ đủ thấy khi quan sát, không cạnh tranh với text;
- tránh checker/grid contrast cao;
- tránh noise nặng gây cảm giác ảnh JPEG bẩn.

Có thể dùng grid ở:
- page background;
- hero/feature area;
- lab architecture canvas;
- empty space giữa các module.

## 4. Iconography

Hard rule: **không dùng emoji làm UI icon**.

UI icon:
- SVG;
- một icon family duy nhất cho interface;
- 16/18/20px là mặc định;
- stroke khoảng 1.5–1.75;
- `currentColor` nếu có thể;
- monochrome mặc định.

AWS service icons được phép là family riêng.

Nếu dùng CDN trong prototype:
- dùng một nguồn ổn định cho UI icons;
- không lấy từng icon từ domain khác nhau;
- khi production, ưu tiên self-host/copy asset nhỏ vào `public/icons` để giảm dependency runtime.

## 5. Color discipline

- một accent chính + neutral system;
- AWS icon có thể giữ brand color nhưng không biến toàn trang thành bảng màu AWS;
- tag không cần mỗi service một màu;
- hover/active dùng variation của accent, không dùng rainbow.

## 6. Imagery

Ưu tiên:
- architecture sketch;
- notebook thật;
- terminal/code/lab screenshot có chủ đích;
- diagrams;
- môi trường kỹ thuật có dấu vết cá nhân.

Hạn chế stock photo kiểu laptop + coffee + notebook nếu không liên quan trực tiếp đến nội dung.

# Ngôn ngữ thị giác

## 1. Bản sắc

AWS Learning Journal là blog học AWS cá nhân, engineering notebook, kho kiến thức và portfolio. Visual identity phải calm, neutral-first, premium, editorial, human-authored và technical nhưng dễ đọc.

Giao diện cần gợi cảm giác: “Đây là blog kỹ thuật và sổ tay học tập của một kỹ sư thật.” Tránh mọi tín hiệu của SaaS landing page, dashboard, admin panel, AWS Console clone, docs template, component-library demo hoặc website startup generic.

## 2. Nguyên tắc human-authored

Không lặp một công thức component ở mọi section, đặc biệt là chuỗi card + badge + uppercase label + title + description + arrow với cùng radius và spacing.

Không phải section nào cũng cần card, badge, background riêng, border, button, arrow hoặc uppercase monospace. Dùng typography, whitespace, divider, alignment và khác biệt nhẹ giữa từng loại nội dung để tạo nhịp tự nhiên. Mỗi block chỉ nên có một visual anchor chính.

## 3. Hệ màu neutral-first

Phần lớn giao diện dùng white, cream, near-black, charcoal và gray. Không ép một accent màu duy nhất lên link, active state, header và button. Hierarchy chính đến từ typography, luminance, spacing và surface.

Hướng tham khảo cho light mode:

```text
background      #F4F3EF
surface         #FBFAF7
surface-muted   #ECEEF0
text            #1B1C1F
muted           #656970
separator       #DFE1E4
accent          #62708F
accent-soft     #E6E9F0
```

Hướng tham khảo cho dark mode:

```text
background      #111214
surface         #181A1E
surface-muted   #22252B
text            #EFEDE8
muted           #ADB0B7
separator       #2B2E34
accent          #929FBD
accent-soft     #292F3E
```

Đây là direction, không phải mã màu bắt buộc. Giữ contrast đủ đọc lâu và phân cấp surface bằng luminance tinh tế. Semantic micro-color được dùng cho domain dot, status dot, topic tag, focus ring và màu brand của GitHub/LinkedIn. Không dùng teal, xanh lá, coral, đỏ, cam mạnh, ochre/gold hoặc nâu làm brand color chủ đạo. Dark mode không được ngả nâu hoặc cam.

AWS service/topic tag có thể dùng các tint cực nhẹ, nhưng tổng thể vẫn phải đọc như một hệ neutral thống nhất; không tạo rainbow chips.

## 4. Background và texture

Dùng background sạch, warm neutral và tonal variation nhẹ. Có thể thêm noise cực nhẹ nếu thực sự giúp chất liệu, nhưng phải gần như không nhận thấy.

Cấm square grid, graph-paper, checker hoặc technical grid phủ toàn trang. Background không được cạnh tranh với nội dung.

## 5. Icon và asset

Rule chung: không dùng emoji làm UI icon. Ngoại lệ duy nhất là emoji nhỏ đứng trước label trong AWS service/topic tag; emoji chỉ là chi tiết phụ.

- Icon điều hướng và interaction dùng asset thật, ưu tiên một SVG family với `currentColor`.
- Logo AWS Learning Journal là custom SVG mark tối giản, monochrome-friendly và rõ ở 28–40px; không dùng icon library generic, AWS logo chính thức, mascot hoặc cloud cliché làm logo.
- Không dùng ký tự Unicode để giả arrow, external-link, chevron hoặc action indicator.
- Icon nhỏ thường ở 16–20px, stroke và weight nhất quán.
- Icon nổi bật có thể dùng transparent PNG hoặc asset từ CDN ổn định; centralize URL/reference thay vì rải rác.
- AWS service icon được phép là một family riêng nhưng không được tạo color noise.

## 6. Hình ảnh

Ưu tiên ảnh hoặc illustration có dấu vết cá nhân: architecture sketch, lab screenshot, terminal/code có chủ đích, notebook thật hoặc diagram. Hạn chế stock photo chung chung kiểu laptop, cà phê và bàn làm việc nếu không liên quan trực tiếp đến nội dung.

## 7. Visual reference

Reference chính là **morethan-log** để học cảm giác personal blog, content-first, left navigation, main feed và right profile. Reference phụ là premium technical UI, chỉ dùng để học shadow, surface, spacing, density và hover polish.

AWS Learning Journal phải có thiết kế riêng. Không copy chính xác branding, layout hoặc component của reference.

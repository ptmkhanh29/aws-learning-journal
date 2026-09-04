---
name: personal-engineering-ui
description: Thiết kế, review và triển khai UI dành riêng cho AWS Learning Journal. Dùng khi task liên quan visual direction, typography, layout, header, sidebar, homepage, tag, card, profile, footer, dark mode, responsive hoặc CSS của project này.
---

# UI cho AWS Learning Journal

Đây là skill UI riêng của **AWS Learning Journal**: blog học AWS cá nhân, engineering notebook, learning journal và portfolio của một kỹ sư. Toàn bộ hướng dẫn phải dùng tiếng Việt; chỉ giữ thuật ngữ kỹ thuật bằng tiếng Anh khi giúp tránh mơ hồ.

## Mục tiêu

Tạo giao diện calm, neutral-first, premium, personal, editorial, human-authored và technical nhưng không mang cảm giác dashboard. Người xem phải nhận ra đây là sổ tay được một kỹ sư thật viết, sắp đặt và chăm chút.

## Quy trình

1. Đọc screenshot, source và visual hierarchy hiện tại trước khi đề xuất hoặc sửa UI.
2. Giữ architecture, data flow, route, auth, behavior và content structure không liên quan.
3. Không tự redesign ngoài visual language đã khóa nếu người dùng chỉ yêu cầu refine.
4. Chỉ đọc các reference liên quan theo bảng định tuyến bên dưới.
5. Khi code, dùng CSS token và class có nghĩa; tách component-specific CSS khỏi `globals.css`.
6. Trước khi hoàn tất, dùng `references/review-checklist.md` để rà lại phạm vi đã làm.

## Rule không được thương lượng

- Neutral chiếm phần lớn giao diện; accent duy nhất là muted slate blue hoặc dusty indigo và chỉ xuất hiện tiết chế.
- Không dùng teal, xanh lá, coral, đỏ, cam mạnh, ochre/gold hoặc nâu làm brand color chủ đạo.
- Không dùng square grid, graph-paper hay technical grid phủ background.
- Không lặp công thức card + badge + uppercase label + title + description + arrow ở mọi section.
- Desktop header đúng một hàng, `sticky`, gắn với trang, search nằm đúng tâm và không có hình thức floating pill/card.
- Left sidebar là blog navigation; active state nhẹ, không có thick left border hay vertical accent bar.
- Homepage content-first: intro gọn, topic shelf, journal, notes, labs.
- Không dùng emoji làm UI icon, ngoại trừ emoji nhỏ trong AWS service/topic tag.
- Không dùng ký tự Unicode để giả icon hoặc arrow; dùng asset thật hoặc một SVG family thống nhất.
- Profile có identity căn giữa, GitHub và LinkedIn cùng hàng, CV là text link căn giữa.
- Feature card phải theme-aware: light mode không dùng giant dark panel; dark surface không được hard-code làm surface chung cho cả hai theme.
- `globals.css` chỉ chứa reset, base, theme variable, token và rule thực sự global.

## Định tuyến reference

- Đọc `references/visual-language.md` khi làm mood, màu, background, human-authored principle, icon, imagery hoặc visual reference.
- Đọc `references/typography-hierarchy.md` khi làm typography, copy, hierarchy, metadata hoặc content density.
- Đọc `references/layout-responsive.md` khi làm header, 3-column layout, sidebar, topic shelf, profile, footer, sticky behavior hoặc responsive.
- Đọc `references/components-elevation-motion.md` khi làm card, service tag, article tag, button, shadow, elevation, hover, motion, icon asset hoặc CSS architecture.
- Đọc `references/review-checklist.md` khi review screenshot/source và trước khi chốt implementation.

## Phạm vi đầu ra

Có thể critique, viết spec, tạo prompt hoặc triển khai code cho AWS Learning Journal. Mọi đầu ra phải giữ cảm giác blog kỹ thuật cá nhân; không được đẩy giao diện về SaaS, dashboard, admin panel, docs template, AWS Console clone hoặc component-library demo.

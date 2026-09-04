---
name: personal-engineering-ui
description: Thiết kế, review và triển khai UI cho personal engineering blog / technical knowledge journal theo phong cách editorial, technical, cá nhân và sang. Dùng khi cần redesign hoặc đánh giá giao diện, typography, hierarchy, density, grid, spacing, sidebar/header, tag filter, post/lab cards, icon SVG, shadow/elevation, hover/motion, light/dark mode, responsive; hoặc khi cần tạo design spec, prompt cho Codex, hay code UI cho AWS Learning Journal và các website kỹ thuật có cùng visual language.
---

# Personal Engineering UI

## Mục tiêu

Thiết kế giao diện có chất riêng của một kỹ sư: editorial + engineering notebook + technical blog. Ưu tiên nội dung, khả năng đọc, sự tinh tế và cảm giác cá nhân; tránh biến website thành SaaS landing page, admin dashboard, AWS Console clone hoặc template blog vô danh.

Ngôn ngữ hướng dẫn của skill là tiếng Việt. Giữ nguyên các thuật ngữ kỹ thuật quen thuộc bằng tiếng Anh khi chúng chính xác hơn, ví dụ `hover`, `shadow`, `elevation`, `grid`, `tag`, `responsive`, `Server Component`.

## Quy trình bắt buộc

1. Xác định vai trò trang: homepage, listing, article, lab, search, auth/admin hay profile.
2. Nếu có screenshot hoặc source hiện tại, đọc cấu trúc và visual hierarchy trước khi đề xuất thay đổi.
3. Giữ nguyên architecture và behavior không liên quan; redesign UI không được tùy tiện đổi data flow, auth, route hoặc stack.
4. Áp dụng các rule trong các tài liệu tham chiếu bên dưới.
5. Nếu người dùng đang chốt direction, ưu tiên phác layout/spec rõ ràng trước khi code.
6. Nếu code, dùng token/variable có hệ thống; không hard-code spacing, radius, shadow và transition ngẫu nhiên ở từng component.
7. Trước khi hoàn tất, chạy checklist trong `references/review-checklist.md`.

## Visual identity cốt lõi

Luôn hướng tới:

- personal, technical, editorial, precise;
- đẹp và sang nhưng không luxury phô trương;
- có personality nhưng không gimmicky;
- medium density, content-first;
- subtle technical details: grid nhẹ, mono metadata, architecture sketch, code/diagram accents;
- motion nhỏ, mượt, có mục đích;
- hierarchy rõ hơn decoration.

Không dùng:

- emoji làm UI icon;
- glassmorphism đại trà;
- gradient neon/cyberpunk;
- shadow dày kiểu floating dashboard;
- card viền kín khắp nơi;
- nhiều font/icon family không thống nhất;
- CTA marketing kiểu “Get started today” nếu không có lý do sản phẩm;
- section quá cao nhưng ít nội dung.

## Layout contract cho AWS Learning Journal

Khi làm project AWS Learning Journal, coi các rule sau là hard constraints trừ khi người dùng yêu cầu đổi:

- Desktop header đúng **một hàng**, không wrap.
- Header rộng hơn content container bên dưới.
- Search bar nằm **đúng tâm thị giác** của header, không chỉ nằm giữa khoảng trống còn lại.
- Bên trái header: SVG logo + tên website.
- Bên phải header: Log in, Sign up, light/dark, VI/EN.
- Left sidebar thiên về content navigation tự nhiên của blog: Journal, Notes, Labs, Tips, Docs, Practice; sau đó mới tới Collections/Topics.
- Không dùng danh sách dài EC2/S3/VPC/RDS như navigation chính ở sidebar.
- Main column bắt đầu bằng bộ lọc tag đẹp: S3, EC2, VPC, IAM, RDS, Lambda, Route 53... rồi mới đến `Latest from the Journal`.
- Right sidebar có About/Profile, GitHub, **CV**, `Now/Currently studying`, current focus và activity nhỏ.
- Public UI không được có cảm giác SaaS dashboard.

## Cách dùng tài liệu tham chiếu

- Đọc `references/visual-language.md` khi chọn mood, màu, texture, icon và phong cách tổng thể.
- Đọc `references/typography-hierarchy.md` khi làm text, type scale, metadata, hierarchy và content density.
- Đọc `references/layout-responsive.md` khi dựng header, sidebar, grid, spacing và breakpoint.
- Đọc `references/components-elevation-motion.md` khi làm card, tag, button, shadow, hover, motion, light/dark elevation.
- Đọc `references/review-checklist.md` khi review screenshot/source hoặc trước khi chốt implementation.

## Output mong đợi

Tùy yêu cầu, có thể tạo một trong các dạng sau:

- **UI critique**: chỉ ra vấn đề hierarchy, density, spacing, typography, personality và interaction; ưu tiên vấn đề có impact cao.
- **Markdown layout/spec**: vẽ layout gần tỷ lệ thật, ghi width/gutter/behavior rõ ràng.
- **Codex prompt**: mô tả mục tiêu, hard constraints, file/architecture boundary, acceptance criteria và phần không được đổi.
- **Implementation**: code theo stack hiện tại, reusable component, token hóa visual system, mock/API-first nếu backend chưa sẵn sàng.
- **Design QA**: so sánh kết quả với rule của skill và liệt kê vi phạm cụ thể.

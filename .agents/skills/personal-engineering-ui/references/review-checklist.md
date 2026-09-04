# Checklist review UI

Dùng checklist này khi review screenshot/source và trước khi chốt implementation. Chỉ kiểm tra phần nằm trong phạm vi task; không tự mở rộng thành một vòng redesign mới.

## Bản sắc và human-authored

- [ ] Giao diện có giống blog kỹ thuật và sổ tay học tập của một kỹ sư thật không?
- [ ] Có còn cảm giác SaaS, dashboard, admin panel, docs template hoặc component-library demo không?
- [ ] Có còn pattern AI-generated lặp lại: card, badge, uppercase label, title, description và arrow ở mọi section không?
- [ ] Mỗi loại content có treatment phù hợp thay vì dùng cùng một component recipe không?
- [ ] Decoration có phục vụ hierarchy và nội dung không?

## Màu và background

- [ ] Hệ màu có neutral-first không?
- [ ] Accent có phải muted slate blue hoặc dusty indigo và được dùng tiết chế không?
- [ ] Có còn teal, xanh lá, coral, đỏ, cam mạnh, ochre/gold hoặc nâu làm brand color chủ đạo không?
- [ ] Dark mode có near-black/charcoal surface, text trắng kem và đọc lâu thoải mái không?
- [ ] Có square grid, graph-paper hoặc technical grid phủ background không?
- [ ] Service tint có đủ nhẹ để tránh rainbow effect không?

## Typography, copy và density

- [ ] Display, body và monospace có vai trò riêng không?
- [ ] Monospace và uppercase có bị lạm dụng không?
- [ ] Mỗi block có một visual anchor chính không?
- [ ] Metadata và CTA có lùi xuống so với title không?
- [ ] Copy tiếng Việt và English có tự nhiên, mang giọng cá nhân không?
- [ ] Content có xuất hiện sớm và không có khoảng trắng chết hoặc giant hero không?

## Header

- [ ] Desktop header có đúng một hàng không?
- [ ] Header có `sticky` nhưng vẫn gắn với document flow không?
- [ ] Header có tránh floating pill/card, outer radius lớn và shadow lớn không?
- [ ] Search có nằm đúng tâm thị giác không?
- [ ] Header có rộng hơn content container không?
- [ ] Background sticky có đủ đục để content không va vào nhau không?

## Left sidebar

- [ ] Sidebar có ưu tiên Nhật ký, Ghi chú, Labs, Mẹo, Tài liệu và Ôn tập không?
- [ ] AWS services có được giữ chủ yếu ở tag/filter/metadata thay vì navigation chính không?
- [ ] Active nav có subtle background hoặc text emphasis không?
- [ ] Có thick left border, vertical accent bar, outline mạnh hoặc nav item dạng card không?

## Topic shelf và tag

- [ ] “Mình đang ghi chép về” có giống editorial topic shelf thay vì dashboard filter panel không?
- [ ] Topic shelf có compact, curated, đủ hierarchy và không phải card dài trống trải không?
- [ ] Service tag có natural width, consistent height và wrap đẹp không?
- [ ] Icon, label và count có khoảng cách cân đối không?
- [ ] Emoji có nhỏ và chỉ xuất hiện trong service/topic tag không?
- [ ] Article tag có nhỏ, neutral, low contrast, không emoji và không tranh attention với title không?

## Card, elevation và motion

- [ ] Có tránh border kín trên mọi card không?
- [ ] Feature card có theme-aware, dùng surface sáng trong light mode và surface charcoal riêng trong dark mode không?
- [ ] SAA-C03 Exam Practice có giữ grid desktop 2 × 2 và label `index + dot + DOMAIN n` thay vì index đứng trơ trọi không?
- [ ] Featured article và profile có layered shadow mềm, opacity thấp không?
- [ ] Content thường có được giữ flat/editorial khi phù hợp không?
- [ ] Hover chỉ nâng khoảng 1–2px, tăng shadow hoặc đổi màu nhẹ không?
- [ ] Có tránh bounce, glow, rotate, scale lớn và animation liên tục không?
- [ ] Có tôn trọng `prefers-reduced-motion` không?

## Profile và footer

- [ ] Profile identity gồm label, avatar, tên và vai trò đã căn giữa chưa?
- [ ] Bio có readable alignment không?
- [ ] GitHub và LinkedIn đã cùng hàng, compact và cùng visual weight chưa?
- [ ] CV có phải text link căn giữa, có underline và không phải button chưa?
- [ ] Footer có hierarchy, mô tả tự nhiên, navigation, social, copyright và VI/EN chưa?
- [ ] Footer có tránh corporate layout và khoảng trắng vô nghĩa không?

## Icon và asset

- [ ] Có dùng ký tự Unicode để giả arrow, external-link, chevron hoặc interaction icon không?
- [ ] UI icon có cùng một SVG family, size và weight nhất quán không?
- [ ] Asset nổi bật có được centralize URL/reference không?
- [ ] Có mix ngẫu nhiên emoji, filled icon, outline icon và nhiều family không?

## Responsive và chất lượng CSS

- [ ] Desktop ba cột, tablet hai cột và mobile một cột có hoạt động hợp lý không?
- [ ] Mobile header có pattern riêng thay vì ép desktop layout không?
- [ ] Có horizontal overflow không?
- [ ] Touch target quan trọng có đủ lớn không?
- [ ] `globals.css` có chỉ giữ reset, base, theme variable, token và rule global không?
- [ ] Component-specific CSS đã được tách file hợp lý chưa?
- [ ] Có lạm dụng inline style, giant style object, selector sâu hoặc utility soup không?
- [ ] Color, shadow, radius, spacing và transition có được centralize thành token không?
- [ ] UI change có giữ architecture, data flow và behavior ngoài phạm vi không?

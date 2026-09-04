# UI Review Checklist

Dùng checklist này trước khi chốt design hoặc code.

## Identity
- [ ] Nhìn vào có cảm giác personal technical blog / engineering journal không?
- [ ] Có personality riêng hay vẫn giống template/SaaS?
- [ ] Decoration có phục vụ visual language hay chỉ thêm cho “đẹp”? 

## Typography & hierarchy
- [ ] Có một visual anchor rõ ở mỗi block?
- [ ] Display/body/mono có vai trò riêng?
- [ ] Metadata nhỏ hơn title đủ rõ?
- [ ] Body line-height và measure có đọc lâu được?

## Density & spacing
- [ ] Trang có quá nhiều khoảng trắng chết không?
- [ ] Spacing có theo scale nhất quán?
- [ ] Một viewport desktop có đủ content để cảm giác là blog không?

## Layout
- [ ] Header desktop đúng một hàng?
- [ ] Search nằm đúng tâm?
- [ ] Header rộng hơn content?
- [ ] Sidebar trái là content navigation, không phải danh sách AWS service?
- [ ] Main có tag filter trước latest journal nếu là homepage?
- [ ] Right sidebar có About + GitHub + CV + current focus?

## Cards & elevation
- [ ] Post card có tránh border kín nặng nề?
- [ ] Shadow mềm, nhiều layer, opacity thấp?
- [ ] Hover chỉ nâng 1–2px, không phô?
- [ ] Không mọi block đều bị đóng thành card?
- [ ] Dark mode elevation vẫn nhìn tự nhiên?

## Motion
- [ ] Transition 140–240ms cho micro interaction?
- [ ] Image motion chậm hơn text/control?
- [ ] Không bounce/parallax/scale lớn?
- [ ] Có `prefers-reduced-motion`?

## Icons
- [ ] Không emoji UI?
- [ ] UI icons cùng SVG family?
- [ ] Stroke/size thống nhất?
- [ ] AWS service icons không làm trang quá nhiều màu?

## Responsive
- [ ] Desktop/tablet/mobile có chiến lược riêng?
- [ ] Không horizontal overflow?
- [ ] Touch target đủ lớn?
- [ ] Sidebar chuyển menu/drawer hợp lý?
- [ ] Search vẫn dễ dùng trên mobile?

## Engineering quality
- [ ] Không hard-code visual token ngẫu nhiên khắp component?
- [ ] Có reusable component/token cho shadow, radius, transition, spacing?
- [ ] UI change không phá architecture/data flow không liên quan?
- [ ] Mock data không bị hard-code trực tiếp vào page nếu project đang theo API/repository-first?

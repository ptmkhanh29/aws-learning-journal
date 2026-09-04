# Layout, cấu trúc và responsive

## 1. Khung desktop

Homepage giữ cấu trúc ba cột:

```text
Left sidebar   190–210px
Gutter          28–32px
Main           650–700px
Gutter          28–32px
Right sidebar  220–250px
```

Với viewport khoảng 1440px, header container nên rộng khoảng 1320–1360px và content container khoảng 1160–1200px. Header rộng hơn content để thoáng, còn body vẫn tập trung như một blog.

## 2. Header là rule cứng

Desktop header phải:

- đúng một hàng và không wrap;
- `sticky` trong document flow với `top: 0` hoặc giải pháp tương đương;
- bên trái là logo và tên AWS Learning Journal;
- search nằm đúng tâm thị giác của toàn header;
- bên phải là login, signup, theme và VI/EN;
- cao khoảng 60–68px;
- không phải floating pill hoặc floating card;
- không có outer radius lớn, shadow lớn hoặc khoảng hở khiến header tách khỏi trang.

Mô hình grid phù hợp:

```text
|          1fr          |    search 480–560px    |          1fr          |
| logo + tên website    |    geometric center    | login signup theme VI |
```

Không dùng `flex: 1` cho search nếu cụm action bên phải làm search lệch tâm. Sticky header dùng surface đủ đục để content bên dưới không va vào nhau; chỉ dùng backdrop blur nhẹ, border-bottom nhẹ hoặc shadow rất nhỏ.

## 3. Left sidebar

Left sidebar là blog navigation.

Primary:

- Nhật ký
- Ghi chú
- Labs
- Mẹo
- Tài liệu
- Ôn tập

Secondary gồm Bộ sưu tập và Chủ đề. Không biến sidebar thành danh sách dài EC2, S3, VPC, RDS hoặc Lambda; AWS services chủ yếu nằm trong tag, filter và metadata.

Active state dùng background tint nhẹ, text mạnh hơn hoặc underline tinh tế. Cấm thick left border, vertical accent bar đậm, outline mạnh và nav item dạng card.

## 4. Main content

Homepage phải content-first, không có giant hero kiểu landing page. Flow mặc định:

```text
Intro cá nhân gọn
Topic/service shelf
Nhật ký gần đây
Ghi chú gần đây
Lab gần đây
Nội dung phụ nếu có
```

Content phải xuất hiện sớm. Không tăng chiều cao section chỉ để tạo cảm giác “premium”.

### Topic shelf “Mình đang ghi chép về”

Đây là editorial topic shelf, không phải dashboard filter panel. Có thể gồm title, một mô tả ngắn, count nhỏ và các service/topic tag.

- Composition compact, curated và có hierarchy rõ.
- Tag có natural width và wrap thành nhiều hàng.
- Dùng subtle surface, spacing và shadow nhẹ nếu cần.
- Không dùng card dài trống trải, border nặng hoặc một hàng tag kéo ngang.

## 5. Right sidebar và profile

Right sidebar giữ About/Profile, Now, nội dung đang học và current focus. Profile phải giống phần giới thiệu tác giả, không giống user profile widget.

Identity block căn giữa theo thứ tự:

```text
GIỚI THIỆU
Avatar
Minh Khanh
DevOps · Cloud Architecture
```

Bio có thể left-align để dễ đọc. GitHub và LinkedIn là hai compact button cùng hàng và cùng visual weight. CV nằm riêng bên dưới, căn giữa, là text link có underline đẹp; không biến CV thành button.

## 6. Footer

Footer là một section hoàn chỉnh, không phải hàng link generic với khoảng trắng lớn. Cần có hierarchy rõ giữa:

- AWS Learning Journal và mô tả tự nhiên;
- navigation;
- GitHub, LinkedIn và CV;
- copyright và VI/EN.

Có thể dùng background variation và divider nhẹ. Tránh corporate footer, card hóa từng nhóm hoặc căn mọi thứ thành ba cột cứng nhắc nếu nội dung không cần.

## 7. Spacing

Dùng scale thống nhất: `4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80`.

```text
Icon với label          8px
Tag với tag             8px
Metadata với title      8px
Title với excerpt      12px
Card padding        20–24px
Column gutter       28–32px
Section lớn         48–72px
```

Không tạo spacing tùy tiện nếu không có lý do composition rõ ràng.

## 8. Tablet và mobile

Tablet khoảng 768–1199px ưu tiên hai cột: left sidebar và main. Right sidebar chuyển thành profile module dưới main hoặc vị trí hợp lý khác. Header có thể thu search trước khi đưa action vào menu compact.

Mobile dưới khoảng 768px dùng một cột. Sidebar chuyển vào drawer/menu; header đổi pattern thay vì ép desktop layout. Search vẫn dễ dùng, tag wrap tự nhiên, không horizontal overflow, reading width thoải mái và touch target quan trọng tối thiểu khoảng 40–44px.

## 9. Sticky behavior

Left navigation và right profile/current focus có thể `sticky` nếu chiều cao không vượt viewport. Tránh nhiều sticky layer cạnh tranh. Header luôn là sticky layer chính và phải hòa vào trang thay vì nổi thành card.

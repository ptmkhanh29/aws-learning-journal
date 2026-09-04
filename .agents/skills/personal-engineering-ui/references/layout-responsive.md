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

## 2. Header là editorial masthead

Desktop header phải:

- được xem như masthead mở đầu cho một personal engineering journal, không phải application toolbar, SaaS navbar hoặc hàng control từ component library;
- đúng một hàng và không wrap;
- `sticky` trong document flow với `top: 0` hoặc giải pháp tương đương;
- bên trái là brand lockup có visual presence đủ mạnh gồm custom logo mark cùng tên AWS Learning Journal và subtitle cá nhân ở tầng thứ hai;
- search nằm đúng tâm thị giác của toàn header;
- bên phải theo thứ tự là language dropdown, theme và một action auth gộp;
- language dropdown dùng globe icon, current locale và popover nhỏ có active state rõ; phải đóng khi chọn ngôn ngữ, click ngoài hoặc nhấn Escape và hỗ trợ keyboard;
- language cùng theme tạo thành utility group; auth là primary header action và luôn đứng cuối cùng;
- label auth là `Đăng nhập / Đăng ký` trong tiếng Việt và `Log in / Sign up` trong tiếng Anh; không tách Login/Signup thành hai nút trên desktop;
- cao khoảng 68–76px;
- dùng neutral surface và subtle elevation: trạng thái đầu trang gần phẳng, trạng thái đã scroll mới tăng divider/shadow rất nhẹ để tách khỏi content;
- không phải floating pill hoặc floating card;
- không có outer radius lớn, shadow lớn hoặc khoảng hở khiến header tách khỏi trang;
- không bọc mọi control bằng cùng một radius, border hoặc surface; hierarchy phải đến từ typography, proximity và contrast;
- luôn có optical alignment pass riêng cho logo/title, search icon/text/shortcut, language, theme icon và auth icon/label.

Trên mobile, masthead vẫn giữ brand hai tầng. Ưu tiên thu nhỏ logo, title và subtitle; subtitle phải nằm trên một dòng, có ellipsis khi thiếu chỗ, không được bị xóa. Chỉ dùng tên rút gọn như `Nhật ký AWS` hoặc `AWS Journal` ở viewport rất hẹp, nhưng vẫn phải giữ subtitle.

Mô hình grid phù hợp:

```text
|          1fr          |    search 480–560px    |          1fr          |
| logo + brand 2 tầng   |    geometric center    | language · theme   auth |
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

Secondary ưu tiên Bộ sưu tập: Chiêm nghiệm, Cheat sheets, Kiến trúc và Troubleshooting khi hữu ích. Không lặp nhóm Chủ đề nếu topic tags trong main đã giải quyết discovery; không biến sidebar thành danh sách dài EC2, S3, VPC, RDS hoặc Lambda.

Active state dùng background tint nhẹ, text mạnh hơn hoặc underline tinh tế. Cấm thick left border, vertical accent bar đậm, outline mạnh và nav item dạng card.

Mỗi primary item trong nhóm Khám phá được phép có một semantic micro-color riêng ở icon và active/hover tint cực nhẹ để tăng khả năng nhận diện. Text vẫn neutral và màu phải low-saturation. Nhóm Bộ sưu tập là secondary hierarchy: icon/line và text giữ neutral, spacing/type nhẹ hơn, không chia màu riêng từng mục.

## 4. Main content

Homepage phải content-first, không có giant hero kiểu landing page. Flow mặc định:

```text
SAA-C03 Exam Practice
Topic/service tags
Featured Journal / Gần đây mình viết gì
Recent Notes
Recent Lab
Nội dung phụ nếu có
```

Exam Practice là main feature đầu tiên, không có giant intro hero. Desktop giữ grid domain `2 × 2`, nhưng mỗi domain là editorial entry trong cùng feature surface, không phải card con nặng. Index, dot và `DOMAIN n` là metadata nhỏ; title domain mới là visual anchor. Không dùng KPI, progress hoặc giant number.

Mobile cũng giữ grid domain `2 × 2`, không chuyển thành bốn hàng dọc. Cho phép dùng title và topics rút gọn theo viewport như `Secure Architectures`, `High-Performing`, `IAM · KMS` hoặc `Compute · DB`; question count vẫn phải còn. Intro, padding và type scale được giảm có chủ đích để toàn bộ feature không chiếm gần hết first viewport.

Content phải xuất hiện sớm. Không tăng chiều cao section chỉ để tạo cảm giác “premium”.

### Topic/service tags

Đây là secondary navigation đặt trực tiếp dưới Exam Practice, không phải một section hoặc dashboard filter panel.

- Show tất cả tag trong một horizontal rail duy nhất; tag có natural width, không wrap và không tạo nhiều hàng trên homepage.
- Rail hỗ trợ swipe/scroll ngang tự nhiên, ẩn scrollbar về mặt thị giác khi phù hợp và có thể dùng chevron trái/phải nhỏ từ cùng SVG icon family. Không autoplay, pagination dots hoặc carousel library nặng.
- Có thể dùng fade trung tính rất nhẹ ở cạnh rail để báo hiệu còn nội dung; fade không được có màu hoặc che focus state.
- Không thêm heading lớn, description, tổng count, shadow container hoặc card riêng.
- Màu chỉ là semantic micro-color nhỏ, không được tranh attention với Exam Practice hoặc article title.

### Section rhythm

Không dùng cùng một `SectionHeading` recipe cho mọi section. Exam Practice là feature block; topic tags là inline strip; Featured Journal là editorial media card; Recent Notes là typographic list; Recent Lab là media/content composition khác Featured Journal.

## 5. Right sidebar và profile

Right sidebar giữ About/Profile, Now, nội dung đang học và current focus. Profile phải giống phần giới thiệu tác giả, không giống user profile widget; outer profile card/shadow không bắt buộc và nên bỏ khi typography cùng whitespace đã đủ.

Identity block căn giữa theo thứ tự:

```text
GIỚI THIỆU
Avatar
Minh Khanh
DevOps · Cloud Architecture
```

Bio có thể left-align để dễ đọc. GitHub và LinkedIn là hai compact button cùng hàng và cùng visual weight. CV nằm riêng bên dưới, căn giữa, là text link có underline đẹp; không biến CV thành button.

## 6. Footer

Footer là personal editorial closing section, không phải hàng link generic hoặc grid ba cột đối xứng kiểu template. Composition bất đối xứng được khuyến khích: statement và identity của người viết giữ phần lớn không gian, navigation/social là phần phụ. Cần có hierarchy rõ giữa:

- AWS Learning Journal và personal closing statement tự nhiên;
- navigation;
- GitHub, LinkedIn và CV;
- `BUILD · BREAK · WRITE`, chữ ký `— Minh Khanh`;
- copyright và language.

Có thể dùng background variation, divider nhẹ và một custom logo watermark opacity rất thấp làm art detail duy nhất. Personal statement giữ khoảng 24–30px trên desktop, nhỏ hơn heading chính của nội dung; footer phải compact và không được trở thành second hero. Personality đến từ wording, composition, signature, spacing và typography, không đến từ giant headline. Tránh corporate footer, card hóa từng nhóm hoặc căn mọi thứ thành ba cột cứng nhắc nếu nội dung không cần.

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

Chỉ có hai mode navigation: desktop dùng left sidebar persistent; mobile và narrow tablet dùng một right off-canvas drawer. Breakpoint phải theo khả năng chứa nội dung và đồng bộ giữa hamburger với việc ẩn sidebar, không được có trạng thái trung gian vừa hiện desktop sidebar vừa hiện mobile navigation.

Mobile/narrow-tablet drawer là hard rule:

- drawer `position: fixed`, bắt đầu từ `top: 0`, neo `right: 0`, cao `100dvh` và phủ lên cả header;
- drawer rộng khoảng `82–88vw`, có `max-width` khoảng `340–360px`, để lộ một phần page phía trái;
- trạng thái đóng dùng `translateX(100%)`, trạng thái mở dùng `translateX(0)` với transition ease-out khoảng `200–260ms`;
- page phía sau có dim backdrop và blur cực nhẹ; click backdrop hoặc nhấn Escape phải đóng drawer;
- khóa body scroll khi drawer mở, nhưng drawer tự scroll khi nội dung dài;
- navigation là flat vertical list, mỗi item một dòng; không dùng grid hai cột, nested accordion hoặc dropdown full-width trong document flow;
- không có interaction `Mở sổ tay của mình` và không giữ duplicate mobile navigation;
- drawer chỉ có custom logo mark, tên AWS Learning Journal và close button; không lặp subtitle của masthead. Auth nằm ngay sau brand, rồi mới đến Khám phá, Bộ sưu tập và language ở gần cuối;
- theme chỉ nằm ở mobile header, không duplicate trong drawer; mobile header đóng giữ brand cùng theme, search và hamburger;
- primary navigation trong drawer dùng cùng semantic micro-color hierarchy với desktop; Collections giữ neutral;
- active item dùng background tint cực nhẹ, không dùng thick border hay accent bar;
- desktop vẫn giữ left sidebar persistent và không hiển thị hamburger.

Ở mobile, content chính dùng một cột, search vẫn dễ dùng, topic rail scroll ngang trong container của nó mà không làm document overflow, reading width thoải mái và touch target quan trọng tối thiểu khoảng 40–44px.

## 9. Sticky behavior

Left navigation và right profile/current focus có thể `sticky` nếu chiều cao không vượt viewport. Tránh nhiều sticky layer cạnh tranh. Header luôn là sticky layer chính và phải hòa vào trang thay vì nổi thành card.

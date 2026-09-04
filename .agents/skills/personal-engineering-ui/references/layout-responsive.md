# Layout, Grid, Spacing & Responsive

## 1. Desktop frame

Với viewport khoảng 1440px:

```text
Header container: 1320–1360px
Content container: 1160–1200px
```

Header rộng hơn content để tạo cảm giác utility bar thoáng, trong khi body vẫn tập trung như blog.

## 2. Header desktop

Hard rules:
- đúng một hàng;
- không wrap;
- brand trái;
- search nằm đúng tâm header;
- actions phải;
- height khoảng 60–68px.

Mô hình grid nên gần:

```text
|          1fr          |    search 480–560px    |          1fr          |
| logo + site name      |    geometric center    | login signup theme VI |
```

Không đặt search theo kiểu `flex: 1` khiến nó lệch vì cụm action phải dài hơn cụm brand trái.

## 3. Content desktop

Gợi ý ba cột:

```text
Left sidebar   190–210px
Gutter          28–32px
Main           650–700px
Gutter          28–32px
Right sidebar  220–250px
```

Left sidebar:

```text
EXPLORE
Journal
Notes
Labs
Tips
Docs
Practice

COLLECTIONS
Reflections
Cheat sheets
Architecture
Troubleshooting
Quick reads

TOPICS
Networking
Storage
Compute
Databases
Security
```

Không đưa danh sách dài AWS service vào navigation chính.

Main column mở đầu bằng tag filter:

```text
BROWSE THE NOTEBOOK
S3 · 12   EC2 · 09   VPC · 14   IAM · 07
RDS · 05  Route 53 · 06  More +

LATEST FROM THE JOURNAL
...
```

Right sidebar:

```text
ABOUT
Avatar
Name
Role / short bio
GitHub
View CV

NOW
AWS SAA-C03
Current focus

ACTIVITY
notes / labs / reflections
```

## 4. Spacing scale

Dùng scale thống nhất:

```text
4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80
```

Ví dụ:

```text
icon ↔ label             8px
tag ↔ tag                8px
meta ↔ title             8px
title ↔ excerpt         12px
card padding            20–24px
column gutter           28–32px
major section           48–72px
```

Không tạo spacing ngẫu nhiên kiểu 17/27/39px nếu không có lý do rõ.

## 5. Tablet

Khoảng 768–1199px:
- ưu tiên 2 cột: sidebar + main;
- right sidebar chuyển thành compact profile module dưới main hoặc trên listing tùy trang;
- header có thể thu hẹp search nhưng vẫn cố giữ một hàng nếu đủ chỗ;
- trước khi wrap desktop header thành hai hàng, chuyển một số actions vào menu compact.

## 6. Mobile

Dưới khoảng 768px:
- một cột main;
- sidebar vào drawer/menu;
- header đổi pattern, không ép layout desktop;
- brand + search/menu icon cùng hàng;
- search có thể mở overlay/palette;
- tag wrap tự nhiên;
- không horizontal overflow;
- card padding thường 16–20px;
- touch target tối thiểu khoảng 40–44px cho icon/button quan trọng.

## 7. Sticky behavior

Có thể sticky:
- left navigation;
- right profile/current focus;

Nhưng:
- không sticky nếu chiều cao module vượt viewport;
- tránh nhiều sticky layer cạnh tranh;
- header sticky phải có surface/blur/shadow cực nhẹ để tách content khi scroll.

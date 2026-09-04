# Typography, Text & Hierarchy

## 1. Ba vai trò typography

Dùng ba vai trò rõ ràng:

1. **Display/Heading Sans**: title, H1/H2, featured post.
2. **Readable Sans**: body, excerpt, UI copy.
3. **Monospace**: metadata kỹ thuật, date, content type, tag count, code/terminal.

Không để mono chiếm body dài.

## 2. Type scale desktop

Scale mặc định:

| Role | Size | Weight | Line-height |
|---|---:|---:|---:|
| Display/Hero | 44–52px | 600–700 | 1.00–1.08 |
| Page H1 | 36–42px | 620–680 | 1.08–1.15 |
| Section H2 | 24–28px | 600–650 | 1.15–1.25 |
| Card/Post title | 18–22px | 550–620 | 1.25–1.35 |
| Body | 15–16px | 400–450 | 1.55–1.70 |
| Small body | 13–14px | 400–450 | 1.45–1.60 |
| Meta mono | 11–12px | 500–600 | 1.35–1.50 |

Mobile giảm có chủ đích, không scale cơ học toàn bộ hệ thống.

Ví dụ:

```text
Desktop H1  40px
Tablet H1   34px
Mobile H1   30px
```

## 3. Hierarchy mẫu

Thứ tự ưu tiên:

```text
EYEBROW / TYPE / DATE

Title

Short description / excerpt

Metadata / tags

CTA
```

Ví dụ:

```text
REFLECTION · SEP 03 · 7 MIN READ

I finally understood
VPC Endpoints properly

For weeks I had the wrong mental model
for Gateway Endpoints.

VPC · S3 · SAA-C03

Read entry →
```

Một component chỉ nên có **một primary visual anchor**. Thường là title hoặc ảnh, không phải đồng thời title + badge + button + gradient.

## 4. Tone của text

Ưu tiên personal technical writing:

Tốt:
- “I finally understood why Gateway Endpoints feel different.”
- “Notes from what I learned, built, misunderstood, and fixed.”

Tránh marketing:
- “Master AWS faster.”
- “Unlock your cloud potential.”
- “Get started today.”

Label UI ngắn và có nhịp:

```text
LATEST NOTES
REFLECTION
SEP 03 · 7 MIN READ
Read note →
Nothing here yet.
```

## 5. Density

Mặc định là **medium density**.

Guideline:

```text
Section → Section        48–72px
Heading → Content        20–28px
Row → Row                18–24px
Label → Title             8px
Title → Description      10–12px
Description → Tags       14–16px
```

Một màn hình desktop nên thường nhìn thấy khoảng 1.5–2 content blocks. Tránh section cao 400–500px chỉ để hiển thị vài dòng text.

## 6. Long-form article

- measure body khoảng 62–75 ký tự mỗi dòng;
- paragraph spacing 0.9–1.2em;
- heading không quá sát đoạn trước;
- code block đủ contrast, không neon;
- caption và metadata dùng muted tone;
- callout chỉ dùng khi có ý nghĩa, không đóng hộp mọi đoạn.

# Components, Elevation, Shadow & Motion

## 1. Nguyên tắc card

Không phải mọi block đều cần card.

Dùng card cho:
- featured post;
- post preview có image;
- lab preview;
- profile/about;
- search result nổi bật;
- special callout.

Dùng divider/list row cho:
- recent notes;
- archive;
- compact activity;
- simple metadata lists.

### Post card mặc định

Đối với post card quan trọng, ưu tiên **surface + shadow**, không dùng border kín làm outline chính.

Light mode direction:

```css
--shadow-card-rest:
  0 1px 2px rgba(16, 24, 20, 0.05),
  0 8px 24px rgba(16, 24, 20, 0.06);

--shadow-card-hover:
  0 2px 4px rgba(16, 24, 20, 0.06),
  0 14px 36px rgba(16, 24, 20, 0.10);
```

Dark mode direction:

```css
--shadow-card-rest:
  0 1px 2px rgba(0, 0, 0, 0.26),
  0 10px 26px rgba(0, 0, 0, 0.22);

--shadow-card-hover:
  0 2px 4px rgba(0, 0, 0, 0.30),
  0 16px 38px rgba(0, 0, 0, 0.30);
```

Các giá trị là baseline, có thể tinh chỉnh theo background thực tế.

### Shadow quality rules

- shadow phải mềm, rộng, opacity thấp;
- tránh một shadow đen duy nhất với opacity cao;
- dùng 2 layer nhỏ + lớn để có depth tự nhiên;
- không để mọi component cùng elevation;
- shadow không được làm card giống modal đang nổi khỏi trang.

## 2. Radius

Baseline:

```text
small controls/tag      8–10px
post/card              12–16px
large media            14–18px
pill                    999px chỉ khi thực sự cần pill
```

Không dùng radius 20–30px cho tất cả mọi thứ.

## 3. Post card hover

Hover nên sang và nhỏ:

```css
transform: translateY(-2px);
box-shadow: var(--shadow-card-hover);
transition:
  transform 180ms cubic-bezier(.2,.7,.2,1),
  box-shadow 220ms cubic-bezier(.2,.7,.2,1),
  background-color 180ms ease;
```

Nếu card có image:

```css
image transform: scale(1.012–1.02);
transition: transform 350–500ms cubic-bezier(.2,.7,.2,1);
```

Không scale cả card 1.05. Không bounce.

Có thể thêm micro-detail:
- arrow CTA dịch 2–3px sang phải;
- metadata accent đổi nhẹ;
- subtle highlight gradient 2–4% chỉ khi phù hợp.

## 4. Tags / filter chips

Tag cần technical/editorial hơn Material chip.

Ví dụ label:

```text
VPC · 14
S3 · 12
EC2 · 09
```

Style baseline:
- mono 11–12px;
- padding 7–10px ngang, 5–7px dọc;
- background surface nhẹ;
- border rất subtle hoặc không border nếu shadow/surface đủ phân tách;
- radius 8–10px, không bắt buộc pill.

Hover:
- translateY(-1px) tùy context;
- background +3–5% contrast;
- text/accent mạnh hơn;
- 140–180ms.

Active:
- accent surface rõ nhưng không neon;
- count vẫn muted hơn label.

## 5. Button

Primary:
- solid accent;
- shadow rất nhỏ nếu cần;
- hover sáng/tối hơn nhẹ + translateY(-1px);
- active translateY(0) hoặc scale 0.99.

Secondary:
- text/ghost/surface;
- không viền dày.

CTA trong article/list thường nên là text link + arrow thay vì button lớn.

## 6. Header elevation

Header không cần shadow khi ở top nếu background đã tách tốt.

Khi sticky/scrolled:

```css
box-shadow: 0 1px 0 rgba(..., .05), 0 8px 24px rgba(..., .04);
```

Có thể dùng backdrop blur nhẹ nếu background translucent, nhưng tránh glassmorphism rõ rệt.

## 7. Motion system

Duration baseline:

```text
micro hover       140–180ms
card elevation    180–240ms
image hover       350–500ms
menu/dropdown     180–260ms
page reveal       300–500ms
```

Easing ưu tiên smooth/non-bouncy:

```css
cubic-bezier(.2,.7,.2,1)
ease-out
```

Tránh:
- spring/bounce cho navigation chính;
- animation liên tục chỉ để trang “sống”;
- parallax mạnh;
- rotate/scale lớn khi hover;
- stagger quá dài khiến user phải chờ.

## 8. Entrance animation

Có thể dùng cho featured content hoặc page section:

```text
opacity 0 → 1
translateY 6–10px → 0
300–420ms
```

Stagger nhỏ 30–60ms giữa các item nếu cần.

Không animate mọi paragraph.

## 9. Accessibility / reduced motion

Luôn hỗ trợ:

```css
@media (prefers-reduced-motion: reduce) {
  /* bỏ translate/scale/reveal không cần thiết */
}
```

Hover không được là cách duy nhất biểu đạt state; focus-visible phải rõ.

## 10. “Sang” nghĩa là gì trong skill này

“Sang” không đồng nghĩa với nhiều shadow/blur/gradient.

Ưu tiên theo thứ tự:
1. typography đẹp;
2. hierarchy rõ;
3. spacing chuẩn;
4. surface/elevation tự nhiên;
5. icon thống nhất;
6. motion nhỏ và mượt;
7. decoration sau cùng.

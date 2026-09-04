# Design direction

## Product character

Khanh Phan là personal technical blog, engineering notebook và knowledge garden. Giao diện cần calm, technical, editorial, có dấu vết của người viết thật; không giống admin dashboard, commercial LMS, AWS Console clone, SaaS landing page hoặc component-kit demo.

Source of truth chi tiết cho UI là `.agents/skills/personal-engineering-ui`. File này chỉ tóm tắt direction chung của repository.

## Layout và hierarchy

- Header desktop `sticky`, đúng một hàng, logo bên trái, search nằm đúng tâm, auth/theme/language bên phải; bề mặt phẳng và chỉ có separation rất nhẹ khi sticky.
- Homepage desktop dùng composition ba cột: blog navigation bên trái, main content ở giữa và author/context sidebar bên phải.
- Left sidebar ngắn, dễ scan và không lặp topic taxonomy đã có trong main.
- Right sidebar là author profile cùng current focus theo lối editorial; không mặc định dùng outer user card.
- Mobile dùng một cột; navigation chuyển thành right off-canvas drawer, masthead vẫn giữ brand hai tầng và topic tags nằm trong horizontal rail một hàng.

Homepage flow:

```text
SAA-C03 Exam Practice
Topic/service tags
Featured Journal
Recent Notes
Recent Lab
```

Không dùng giant personal hero. Exam Practice là feature chính nhưng phải compact, không giống LMS/dashboard; cả desktop lẫn mobile giữ bốn domain theo grid `2 × 2` dưới dạng editorial entries trong một surface, với copy mobile rút gọn khi cần. Topic tags là inline secondary navigation, show tất cả trong horizontal rail một hàng và không có section/card riêng.

Mỗi loại nội dung có rhythm riêng: Exam Practice là feature block, Featured Journal là editorial media card, Notes là typographic list, Lab là media/content composition khác Journal. Tránh lặp cùng công thức heading + link + divider hoặc card + badge + title + description + arrow.

## Visual system

- Typeface: Geist cho interface và reading; Geist Mono chỉ cho ngày, count và technical metadata thực sự.
- Palette neutral-first: white, cream, warm/light gray, near-black; dark mode dùng near-black, charcoal, gray và soft white.
- Không ép một brand accent xuyên suốt. Chỉ dùng semantic micro-color cho domain/status dots, topic tags, focus và màu brand GitHub/LinkedIn.
- Depth đến từ tonal surface, layered shadow mềm và whitespace. Không card hóa mọi block, không nested card soup, không decorative border thừa.
- Image mang tính editorial: lab, architecture sketch, notebook hoặc working context có chủ đích; tránh stock photo generic và AWS branding imitation.
- Motion nhỏ, có mục đích và tôn trọng `prefers-reduced-motion`.

Footer kết thúc như một personal engineering journal, không như startup template; có thể dùng `BUILD · BREAK · WRITE` làm project signature nhỏ.

## Themes, localization và accessibility

Light và dark giữ cùng hierarchy nhưng có surface/shadow tương ứng. Script trước hydration áp dụng saved/system theme bằng key `aws-journal:prefs:v1` để tránh flash.

English và Vietnamese dùng chung route/component structure dưới `/en` và `/vi`, được sizing cho Vietnamese text expansion. Mọi control có keyboard focus rõ; search hỗ trợ Escape và focus đúng; semantic link/button/dialog được giữ nguyên.

## Implementation boundary

Phase hiện tại chỉ gồm frontend UI, local mock data và local interaction state. Authentication, database, API, AWS integration, Cloudflare services, analytics, CMS và deployment chưa được triển khai.

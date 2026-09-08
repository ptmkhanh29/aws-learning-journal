# Data and domain model

## Purpose and status

Tài liệu này là source of truth cho logical data/domain design của Khanh Phan AWS Learning Journal.

- docs/DESIGN.md sở hữu UI/UX direction.
- docs/DATA_MODEL.md sở hữu data, domain và backend model.
- Repository hiện vẫn là frontend prototype dùng mock data; tài liệu này không khẳng định database, API, Cognito hay AWS resource nào đã được triển khai.
- Practice là mô hình sơ bộ và chưa phải implementation contract.

Target architecture dự kiến gồm Next.js frontend và server runtime/AWS Lambda, CloudFront, Amazon S3, Amazon DynamoDB, Amazon Cognito User Pool với Google federation, CloudWatch, ACM và Route 53.

## Design sequence

Logical entity không đồng nghĩa với DynamoDB table. Các entity trong tài liệu này mô tả business concepts và không yêu cầu mỗi entity có một table riêng.

~~~text
Business requirements
        ↓
Logical entities
        ↓
Relationships
        ↓
Constraints and invariants
        ↓
Access patterns
        ↓
DynamoDB PK / SK / GSI
        ↓
Physical implementation
~~~

DynamoDB physical design chỉ được quyết định sau khi access patterns, traffic shape, consistency và failure behavior được review. Candidate mapping ở cuối tài liệu chỉ minh họa một hướng có thể thử.

## Shared conventions

- ID là opaque string do ứng dụng cấp; UUID/ULID cụ thể được quyết định ở implementation.
- Timestamp là UTC instant theo ISO 8601. Date-only dùng định dạng YYYY-MM-DD.
- Supported locale là vi và en, khớp src/lib/i18n.ts.
- Enum trong tài liệu dùng UPPER_SNAKE_CASE.
- Nullable chỉ được dùng khi absence có nghĩa nghiệp vụ rõ ràng.
- Counter là denormalized aggregate, không phải nguồn sự thật duy nhất.
- URL của binary asset là delivery concern. Logical fields có hậu tố Url giữ tương thích với prototype; physical storage nên lưu S3 object key/reference và tạo URL/CDN URL khi đọc.

## Domain overview

| Domain | Responsibility | Main entities |
| --- | --- | --- |
| Auth | Application profile và authorization metadata; authentication do Cognito sở hữu | User |
| Content | Bài viết, bản dịch, taxonomy, series, lab metadata và revision | Post, PostTranslation, Topic, PostTopic, Series, SeriesTranslation, SeriesPost, LabMetadata, PostRevision |
| Interaction | Comment, like, bookmark, share và counters | Comment, PostLike, Bookmark, PostShare, PostStats, PostViewsDaily |
| Practice | SAA-C03 questions, attempts và progress; preliminary | PracticeQuestion, PracticeQuestionTranslation, PracticeOption, PracticeAttempt, UserPracticeProgress |

## Content identity and bilingual strategy

### One content identity

Journal, Note và Lab dùng chung Post identity:

- PostType = JOURNAL | NOTE | LAB.
- Reflection trong mock journal trở thành Post(type=JOURNAL).
- Một journal timeline row mang type note hoặc lab là projection/link tới Post NOTE hoặc LAB tương ứng, không tạo một Post thứ hai.
- Lab-specific fields nằm trong LabMetadata.
- Practice không phải Post và không trộn với blog interaction.

### Slug and URL decision for V1

V1 dùng canonicalSlug không localized:

- canonicalSlug là immutable sau khi tạo và unique toàn site.
- Cùng một slug được dùng cho cả vi và en, phù hợp route hiện tại.
- URL bài viết là /{locale}/{section}/{canonicalSlug}; section được suy ra từ Post.type: journal, notes hoặc labs.
- Ví dụ: /vi/notes/s3-storage-classes và /en/notes/s3-storage-classes cùng trỏ tới một Post, sau đó chọn PostTranslation theo locale.
- Series dùng cùng nguyên tắc với Series.canonicalSlug.

Localized slug trong PostTranslation hoặc SeriesTranslation được intentionally deferred. Nếu bổ sung sau này, cần redirect history và invariant unique theo (locale, slug).

### Translation resolution and fallback

- Canonical Post/Series identity tồn tại độc lập với translation.
- Route gốc hiện redirect sang /en, nên EN là entry locale mặc định của V1; lựa chọn này không biến EN thành fallback cho content.
- Public detail page chỉ render khi có translation đúng locale được yêu cầu.
- Không silently render nội dung VI bên trong URL /en hoặc ngược lại.
- Nếu EN chưa có, EN listing mặc định không hiển thị bài đó. Direct request trả trạng thái translation unavailable/404 và có thể đưa link rõ ràng sang bản VI.
- Admin view có thể hiển thị trạng thái missing translation để hoàn thiện trước khi publish locale đó.
- UI dictionary vẫn có thể có fallback riêng; fallback UI label không thay đổi content rule bên trên.
- Một Post có thể PUBLISHED nhưng điều đó không làm mọi locale trở thành public. Một locale chỉ public khi đồng thời thỏa `Post.status = PUBLISHED`, `Post.visibility = PUBLIC` và `PostTranslation(locale).status = READY`.

### Content lifecycle

- Normal authoring flow là DRAFT → PUBLISHED → ARCHIVED; một ARCHIVED Post không xuất hiện trong public queries.
- Post chưa từng publish ở trạng thái DRAFT có `publishedAt = null`.
- Lần chuyển đầu tiên sang PUBLISHED đặt `publishedAt` thành thời điểm publish đầu tiên. Đây là first publication timestamp, không phải thời điểm publish gần nhất.
- Khi chuyển sang ARCHIVED, giữ nguyên `publishedAt` nếu Post đã từng publish; không reset về null.
- Republish từ ARCHIVED cần một explicit admin action và re-validation của translation readiness, nhưng vẫn giữ original `publishedAt`. `republishedAt`, nếu sau này cần, là một feature riêng ngoài V1.
- `updatedAt` phản ánh lần chỉnh sửa metadata hoặc content gần nhất và không thay thế ý nghĩa của `publishedAt`.
- “Delete” trong V1 admin product language nên mặc định là archive. Hard delete, cascade cleanup và retention policy là destructive operations được deferred tới khi có backup/audit requirements.
- `publishedAt` là canonical first publication instant và không bị duplicate theo translation. Locale-specific readiness do PostTranslation.status quản lý.

## Logical relationship diagram

~~~mermaid
erDiagram
    USER ||--o{ POST : writes
    POST ||--o{ POST_TRANSLATION : translated_as
    POST ||--o| LAB_METADATA : has_when_lab
    POST ||--o{ POST_REVISION : keeps

    POST ||--o{ POST_TOPIC : classified_as
    TOPIC ||--o{ POST_TOPIC : contains

    SERIES ||--o{ SERIES_TRANSLATION : translated_as
    SERIES ||--o{ SERIES_POST : contains
    POST ||--o{ SERIES_POST : appears_in

    POST ||--o{ COMMENT : receives
    USER ||--o{ COMMENT : writes
    COMMENT ||--o{ COMMENT : has_replies

    POST ||--o{ POST_LIKE : receives
    USER ||--o{ POST_LIKE : creates
    USER ||--o{ BOOKMARK : saves
    POST ||--o{ BOOKMARK : saved_as
    POST ||--o{ POST_SHARE : shared
    USER o|--o{ POST_SHARE : may_trigger

    POST ||--|| POST_STATS : has
    POST ||--o{ POST_VIEWS_DAILY : tracks

    PRACTICE_QUESTION ||--o{ PRACTICE_QUESTION_TRANSLATION : translated_as
    PRACTICE_QUESTION ||--|{ PRACTICE_OPTION : offers
    PRACTICE_QUESTION ||--o{ PRACTICE_ATTEMPT : answered_in
    USER ||--o{ PRACTICE_ATTEMPT : makes
    USER ||--o{ USER_PRACTICE_PROGRESS : accumulates
~~~

## Auth model

### Cognito and application boundary

Amazon Cognito User Pool sở hữu:

- authentication và Google identity federation;
- user-pool sub và identity attributes;
- ID token, access token, refresh token, JWT signing;
- sign-in, token refresh/revocation và auth lifecycle.

Application data store sở hữu:

- mapping User.cognitoSub tới application User.id;
- displayName, avatarUrl và application metadata;
- role/status projection phục vụ business logic;
- content, interaction và practice data.

Application database không lưu password, passwordHash, Google secret, Cognito refresh token hoặc một session implementation thay thế Cognito.

### Authentication versus authorization

- Authentication trả lời “user này là ai” bằng Cognito và verified JWT.
- Authorization trả lời “user này được làm gì” bằng backend policy.
- Access Token là token mặc định cho protected API calls. Backend tối thiểu phải verify JWT signature, issuer (`iss`), expiration (`exp`), `token_use = access`, Cognito App Client `client_id`, và required scope/group nếu endpoint yêu cầu.
- Với admin endpoint, backend phải verify `cognito:groups` có `ADMIN` và đồng thời kiểm tra `User.status = ACTIVE` theo V1 policy.
- ID Token chủ yếu phục vụ identity/display information. Nếu nhận ID Token, backend phải verify JWT signature, issuer (`iss`), expiration (`exp`), `token_use = id` và audience (`aud`).
- Không dùng ID Token làm security boundary cho admin mutation API.
- Frontend hide/show button chỉ là UX. Mọi admin mutation phải được kiểm tra lại ở server.

~~~text
POST /admin/posts
        ↓
verify Cognito JWT
        ↓
authenticated?
        ↓
check ADMIN authorization
        ↓
allowed / forbidden
~~~

- 401: thiếu token, token invalid, expired hoặc không xác thực được.
- 403: token hợp lệ nhưng user không có quyền hoặc account không ACTIVE.

### V1 role decision

| Option | Benefit | Cost / risk |
| --- | --- | --- |
| Cognito Group ADMIN | Quyền có trong verified access-token claim; không cần database read chỉ để nhận biết admin | Thay đổi group chỉ phản ánh sau khi token được làm mới; backend vẫn phải kiểm tra claim |
| DynamoDB User.role | Role thay đổi ở application store và có thể kiểm tra cùng User.status | Privileged request cần read/cache và phải xử lý stale cache |

V1 chọn Cognito Group ADMIN làm authoritative source cho privileged authorization. User.role vẫn tồn tại như projection phục vụ admin listing và UI, nhưng `User.role = ADMIN` một mình không đủ để authorize. Backend admin mutation phải yêu cầu verified Access Token, `ADMIN` trong `cognito:groups` và `User.status = ACTIVE`. Khi thu hồi quyền khẩn cấp, remove group/disable Cognito user và kết thúc session; không chỉ đổi UI state.

Không tạo Admin table riêng. Cognito Identity Pool cũng chưa cần cho V1 nếu browser chỉ gọi application backend thay vì gọi trực tiếp S3/DynamoDB.

## Entities

### User

| Field | Logical Type | Required | Notes |
| --- | --- | ---: | --- |
| id | string | yes | Application user ID |
| cognitoSub | string | yes | Maps to immutable Cognito User Pool sub |
| email | string | yes | Normalized lowercase email; not the primary identity |
| displayName | string | yes | Application display name |
| avatarUrl | string | no | Logical media reference; physical form may be an S3 object key |
| role | enum | yes | USER or ADMIN; projection of the V1 Cognito group decision |
| status | enum | yes | ACTIVE or BANNED |
| createdAt | timestamp | yes | Creation instant |
| updatedAt | timestamp | yes | Last application-profile update |

### Post

| Field | Logical Type | Required | Notes |
| --- | --- | ---: | --- |
| id | string | yes | Canonical content identity |
| type | enum | yes | JOURNAL, NOTE or LAB |
| authorId | string | yes | References User.id; author must be authorized |
| canonicalSlug | string | yes | Immutable, global V1 slug |
| coverImageUrl | string | no | Logical media reference; preferably backed by an S3 object key |
| status | enum | yes | DRAFT, PUBLISHED or ARCHIVED |
| visibility | enum | yes | PUBLIC or PRIVATE |
| publishedAt | timestamp | no | Null trước lần publish đầu tiên; được đặt một lần khi publish lần đầu và giữ nguyên khi ARCHIVED hoặc republish |
| createdAt | timestamp | yes | Creation instant |
| updatedAt | timestamp | yes | Last metadata or content update across the Post identity |

### PostTranslation

| Field | Logical Type | Required | Notes |
| --- | --- | ---: | --- |
| postId | string | yes | References Post.id |
| locale | enum | yes | vi or en |
| status | enum | yes | DRAFT or READY; gates locale-specific public rendering |
| title | string | yes | Localized title |
| excerpt | string | yes | Localized list/SEO summary |
| content | rich text/document | yes | Localized body; storage format deferred |
| readingMinutes | integer | no | Locale-specific estimate; must be non-negative |
| createdAt | timestamp | yes | Translation creation instant |
| updatedAt | timestamp | yes | Translation update instant |

The unique key is (postId, locale). No localized slug is stored in V1.

### Topic

Topic là taxonomy/category, không có reading order.

| Field | Logical Type | Required | Notes |
| --- | --- | ---: | --- |
| id | string | yes | Topic identity |
| slug | string | yes | Immutable, global V1 topic slug |
| name | localized text | yes | vi/en labels; matches current labelVi/labelEn concept |
| description | localized text | no | Optional VI/EN taxonomy description |
| iconUrl | string | no | Logical media reference |
| sortOrder | integer | yes | Display order; not content reading order |
| createdAt | timestamp | yes | Creation instant |
| updatedAt | timestamp | yes | Last update |

V1 giữ trực tiếp các localized value field vi/en trên Topic vì taxonomy nhỏ và metadata nhẹ. Post và Series có content/description lớn hơn cùng translation lifecycle riêng nên dùng translation entity. Nếu Topic sau này cần localized slug, independent translation status hoặc nhiều locale hơn, model có thể migrate sang TopicTranslation; V1 chưa tạo entity này.

### PostTopic

| Field | Logical Type | Required | Notes |
| --- | --- | ---: | --- |
| postId | string | yes | References Post.id |
| topicId | string | yes | References Topic.id |
| createdAt | timestamp | yes | Classification instant |

The unique key is (postId, topicId).

### Series

| Field | Logical Type | Required | Notes |
| --- | --- | ---: | --- |
| id | string | yes | Canonical series identity |
| canonicalSlug | string | yes | Immutable, global V1 slug |
| authorId | string | yes | References User.id |
| coverImageUrl | string | no | Logical media reference |
| status | enum | yes | DRAFT, PUBLISHED or ARCHIVED |
| createdAt | timestamp | yes | Creation instant |
| updatedAt | timestamp | yes | Last update |

### SeriesTranslation

| Field | Logical Type | Required | Notes |
| --- | --- | ---: | --- |
| seriesId | string | yes | References Series.id |
| locale | enum | yes | vi or en |
| status | enum | yes | DRAFT or READY |
| title | string | yes | Localized series title |
| description | string | yes | Localized summary |
| createdAt | timestamp | yes | Creation instant |
| updatedAt | timestamp | yes | Last update |

The unique key is (seriesId, locale). No localized slug is stored in V1.

### SeriesPost

| Field | Logical Type | Required | Notes |
| --- | --- | ---: | --- |
| seriesId | string | yes | References Series.id |
| postId | string | yes | References Post.id |
| position | positive integer | yes | Reading order within this series |
| createdAt | timestamp | yes | Membership creation instant |

Both (seriesId, postId) and (seriesId, position) are unique. Một Post có thể thuộc nhiều Series; vì vậy Post không có seriesId.

### Public series read policy for V1

V1 chọn partial exposure theo locale để hành vi đơn giản và predictable. Public read của một Series phải:

1. Resolve Series bằng `seriesId` hoặc immutable `canonicalSlug`.
2. Yêu cầu `Series.status = PUBLISHED`.
3. Resolve đúng `SeriesTranslation(locale)` và yêu cầu `status = READY`.
4. Lấy SeriesPost theo `position` tăng dần.
5. Chỉ trả Post thỏa public locale rule: `Post.status = PUBLISHED`, `Post.visibility = PUBLIC` và `PostTranslation(locale).status = READY`.

Không silently fallback VI ↔ EN. Nếu Series có 7 Post nhưng chỉ 5 Post hợp lệ ở EN, public read EN expose đúng 5 Post đó và giữ relative order theo `position`; position gap không được compact thành thay đổi membership.

### Topic versus Series

| Dimension | Topic | Series |
| --- | --- | --- |
| Meaning | Taxonomy/category | Curated ordered collection |
| Example | AWS, VPC, DevOps | 7 ngày làm chủ AWS |
| Post relationship | Many-to-many through PostTopic | Many-to-many through SeriesPost |
| Order | sortOrder only orders topic display | position defines article reading order |
| Membership intent | Classification and discovery | Guided sequence |
| Translation | Localized value fields on Topic in V1 | SeriesTranslation |

### LabMetadata

| Field | Logical Type | Required | Notes |
| --- | --- | ---: | --- |
| postId | string | yes | Unique reference to Post.id; Post.type must be LAB |
| difficulty | enum | yes | INTRO or INTERMEDIATE in current prototype |
| labStatus | enum | yes | COMPLETE, REVISIT or PLANNED |
| services | string list | yes | AWS service identifiers/names used by the lab |
| updatedAt | timestamp | yes | Last metadata update |

PostTopic remains the normalized discovery taxonomy. services preserves lab-specific display/context and can later reference a canonical service registry if one is introduced.

### PostRevision

Optional/future; not required for V1.

| Field | Logical Type | Required | Notes |
| --- | --- | ---: | --- |
| id | string | yes | Revision identity |
| postId | string | yes | References Post.id |
| revisionNumber | positive integer | yes | Monotonic within a post |
| createdBy | string | yes | References User.id |
| createdAt | timestamp | yes | Snapshot instant |
| snapshot | document | yes | Canonical and translated snapshot; exact format deferred |

The unique key is (postId, revisionNumber).

### Comment

| Field | Logical Type | Required | Notes |
| --- | --- | ---: | --- |
| id | string | yes | Comment identity |
| postId | string | yes | References Post.id |
| userId | string | yes | References User.id |
| parentId | string | no | Null for root; otherwise references a root Comment on the same post |
| content | string | conditional | Required except for a retained DELETED tombstone |
| status | enum | yes | VISIBLE, PENDING, HIDDEN or DELETED |
| createdAt | timestamp | yes | Creation instant |
| updatedAt | timestamp | yes | Edit/moderation instant |

V1 supports root comments and one reply level. Root có `parentId = null`. Nếu `parentId != null`, parent phải tồn tại, có cùng `postId` và có `parentId = null`. A reply to another reply is rejected; it is not silently converted into deeper nesting. HIDDEN and DELETED rows can remain as thread tombstones, but their content is not publicly rendered.

### PostLike

| Field | Logical Type | Required | Notes |
| --- | --- | ---: | --- |
| postId | string | yes | References Post.id |
| userId | string | yes | References User.id |
| createdAt | timestamp | yes | Like instant |

The unique key is (postId, userId). Unlike removes/toggles this relationship. Physical writes must be conditional and idempotent.

### Bookmark

| Field | Logical Type | Required | Notes |
| --- | --- | ---: | --- |
| userId | string | yes | References User.id |
| postId | string | yes | References Post.id |
| createdAt | timestamp | yes | Save instant; used for ordering |

The unique key is (userId, postId).

### PostShare

| Field | Logical Type | Required | Notes |
| --- | --- | ---: | --- |
| id | string | yes | Share event identity/idempotency key |
| postId | string | yes | References Post.id |
| userId | string | no | Null for anonymous visitor |
| platform | enum | yes | FACEBOOK, X, LINKEDIN, COPY_LINK or OTHER |
| createdAt | timestamp | yes | Website share-trigger instant |

shareCount means the number of share actions triggered from this website. It does not claim that a social network accepted or published a repost.

### PostStats

| Field | Logical Type | Required | Notes |
| --- | --- | ---: | --- |
| postId | string | yes | One-to-one with Post |
| viewCount | non-negative integer | yes | Aggregate accepted views |
| likeCount | non-negative integer | yes | Aggregate active PostLike rows |
| commentCount | non-negative integer | yes | Aggregate VISIBLE comments/replies |
| shareCount | non-negative integer | yes | Aggregate accepted PostShare events |
| updatedAt | timestamp | yes | Last aggregate update |

PostStats is a denormalized read model for fast homepage/detail rendering. Interaction records remain the source for reconciliation. Social counters may be eventually consistent.

Counter changes follow state transitions, not request count:

| Counter | Accepted transition/event | Effect |
| --- | --- | ---: |
| likeCount | Not liked → liked | +1 |
| likeCount | Liked → liked retry | +0 |
| likeCount | Liked → unliked | -1 |
| likeCount | Already unliked → unlike retry | +0 |
| commentCount | PENDING → VISIBLE | +1 |
| commentCount | VISIBLE → HIDDEN | -1 |
| commentCount | VISIBLE → DELETED | -1 |
| commentCount | HIDDEN → VISIBLE | +1 |
| commentCount | Retry cùng transition | +0 |
| shareCount | Accepted unique share event | +1 |
| shareCount | Retry cùng idempotency key | +0 |
| viewCount and PostViewsDaily.viewCount | Accepted unique view event theo V1 dedup policy | +1 cho cả hai |

Transaction, stream và reconciliation strategy chưa được chọn ở phase này. Dù implementation sau này dùng cơ chế nào, cùng một logical transition/idempotency key không được double count và counter không được âm.

### PostViewsDaily

| Field | Logical Type | Required | Notes |
| --- | --- | ---: | --- |
| postId | string | yes | References Post.id |
| date | date | yes | UTC date in YYYY-MM-DD |
| viewCount | non-negative integer | yes | Accepted views for the date |
| updatedAt | timestamp | yes | Last counter update |

The unique key is (postId, date). V1 does not store a permanent row for every page view. Future dedup may use a short-lived anonymous viewer/session identifier plus TTL and a time window. Raw IP addresses must not be retained long-term solely to count views.

## Practice domain — preliminary / not finalized

Practice entities are intentionally isolated from Post, Comment, PostLike and other blog interactions. Current prototype proves the concepts of SAA-C03 domains, question/options, correct answer, bilingual explanation, answered/accuracy/review totals, domain scores and recurring mistakes; it does not yet prove a final persistence design.

### PracticeQuestion

| Field | Logical Type | Required | Notes |
| --- | --- | ---: | --- |
| id | string | yes | Canonical question identity |
| domainCode | string/enum | yes | SAA-C03 domain/config identifier |
| status | enum | yes | DRAFT, PUBLISHED or ARCHIVED |
| difficulty | enum | no | Preliminary; exact scale deferred |
| correctOptionId | string | yes | References an option belonging to this question |
| createdAt | timestamp | yes | Creation instant |
| updatedAt | timestamp | yes | Last canonical update |

### PracticeQuestionTranslation

| Field | Logical Type | Required | Notes |
| --- | --- | ---: | --- |
| questionId | string | yes | References PracticeQuestion.id |
| locale | enum | yes | vi or en |
| scenario | string | yes | Localized question prompt |
| explanation | string | yes | Localized answer explanation |
| updatedAt | timestamp | yes | Last translation update |

The unique key is (questionId, locale).

### PracticeOption

| Field | Logical Type | Required | Notes |
| --- | --- | ---: | --- |
| id | string | yes | Stable option identity |
| questionId | string | yes | References PracticeQuestion.id |
| position | positive integer | yes | Stable display order |
| text | localized text | yes | Provisional vi/en value object; may become a translation entity after Practice review |

Both (questionId, id) and (questionId, position) are unique. Exactly one current option must match correctOptionId.

### PracticeAttempt

| Field | Logical Type | Required | Notes |
| --- | --- | ---: | --- |
| id | string | yes | Attempt identity/idempotency key |
| userId | string | yes | References User.id |
| questionId | string | yes | References PracticeQuestion.id |
| selectedOptionId | string | yes | Must belong to the question |
| isCorrect | boolean | yes | Immutable result captured at answer time |
| answeredAt | timestamp | yes | Attempt instant |
| durationMs | non-negative integer | no | Optional client-reported duration |

Retake semantics and whether every answer or only latest answer is retained remain deferred.

### UserPracticeProgress

| Field | Logical Type | Required | Notes |
| --- | --- | ---: | --- |
| userId | string | yes | References User.id |
| domainCode | string/enum | yes | SAA-C03 domain/config identifier |
| answeredCount | non-negative integer | yes | Denormalized accepted attempts |
| correctCount | non-negative integer | yes | Denormalized correct attempts |
| reviewCount | non-negative integer | yes | Questions currently flagged/requiring review |
| scorePercent | number 0..100 | yes | Derived/cache value; formula deferred |
| updatedAt | timestamp | yes | Last aggregate update |

The unique key is (userId, domainCode). Recurring mistakes are derived from attempts and question/domain/topic metadata until evidence justifies a separate entity.

## Data invariants

1. User.cognitoSub is unique and immutable.
2. V1 treats normalized User.email as unique among application users, but cognitoSub remains the identity key. Any future multi-provider account-linking policy must re-review this rule.
3. User.role never grants backend access by itself; V1 privileged authorization requires a verified Access Token, `ADMIN` in `cognito:groups` and a current `User.status = ACTIVE` check.
4. Post.id is immutable. Post.canonicalSlug, Topic.slug and Series.canonicalSlug are immutable and unique within their respective global slug namespace.
5. A Post has at most one PostTranslation per locale. A locale is public only when `Post.status = PUBLISHED`, `Post.visibility = PUBLIC` and `PostTranslation(locale).status = READY`; there is no implicit VI ↔ EN fallback.
6. `publishedAt = null` means the Post has never been published. First publication sets `publishedAt`; ARCHIVED and republished posts retain that original value. `updatedAt` records the latest metadata/content update independently.
7. Only ADMIN may create, edit, publish, archive or otherwise mutate content/taxonomy/series.
8. PostTopic is unique by (postId, topicId).
9. SeriesPost is unique by both (seriesId, postId) and (seriesId, position); position is positive.
10. A Post may appear in multiple Series; Post does not own a single seriesId.
11. A public Series locale requires `Series.status = PUBLISHED` and `SeriesTranslation(locale).status = READY`; it exposes only member Posts that satisfy the same locale public rule, preserving their relative SeriesPost.position order.
12. LabMetadata exists only for Post.type=LAB and is unique by postId.
13. Root Comment has `parentId = null`. A reply parent must exist, share the reply's postId and itself have `parentId = null`; V1 reply depth is at most one.
14. PostLike is unique by (postId, userId). Like and unlike transitions are idempotent.
15. Bookmark is unique by (userId, postId).
16. Post, Topic and Series slug lookup sentinels are unique; their creation must be conditional. A GSI alone is not a uniqueness constraint.
17. Comment, like, share and view counter effects follow accepted state transitions/events and idempotency keys; retries never double count. HIDDEN/DELETED comments do not inflate commentCount.
18. No PostStats, PostViewsDaily or UserPracticeProgress counter may be negative.
19. PostStats has exactly one logical row per Post and may be rebuilt/reconciled from source events/relationships.
20. PostViewsDaily is unique by (postId, date); raw IP is not a durable view identity.
21. Practice options belong to their question, have unique positions and include exactly one correctOptionId.
22. PracticeAttempt data never updates blog interaction counters.

## Access patterns

Frequency is an initial low-traffic estimate for a personal technical blog: High means per page/session, Medium means routine navigation/interaction, Low means occasional author/admin work.

Trong bảng dưới đây, “public Post/locale” luôn là cùng một rule: `Post.status = PUBLISHED`, `Post.visibility = PUBLIC` và exact `PostTranslation(locale).status = READY`.

| ID | Access pattern | Actor | Known input | Data required | Sort/order | Consistency requirement | Expected frequency |
| --- | --- | --- | --- | --- | --- | --- | --- |
| AP01 | Get published post by slug and locale | Anonymous/User | canonicalSlug, locale | Post, exact-locale READY PostTranslation, PostStats, topics | none | Eventual public read acceptable; require the locale public rule | High |
| AP02 | Get latest published posts | Anonymous/User | locale, optional cursor/limit | Exact-locale public Post summaries | publishedAt descending | Eventual after publish acceptable; query the requested locale directly | High |
| AP03 | Get posts by topic | Anonymous/User | topicId/slug, locale, optional cursor/limit | Exact-locale public Post summaries | publishedAt descending | Eventual acceptable; no fallback or read-large-then-filter path | Medium |
| AP04 | Get posts in a series | Anonymous/User | seriesId/slug, locale, optional cursor/limit | READY SeriesTranslation and eligible exact-locale Posts | SeriesPost.position ascending | Eventual public read acceptable; apply V1 partial-exposure policy | Medium |
| AP05 | Get published series containing a post | Anonymous/User | postId, locale, optional cursor/limit | Exact-locale READY Series summaries and position | SeriesPost.position ascending | Eventual acceptable; no locale fallback | Low |
| AP06 | Get comments of post | Anonymous/User | postId, cursor | Public root comments and author summaries | createdAt ascending or product-selected direction | Eventual acceptable; exclude non-visible | Medium |
| AP07 | Get replies of a comment | Anonymous/User | postId, rootCommentId, cursor | Visible direct replies | createdAt ascending | Eventual acceptable | Medium |
| AP08 | Check whether current user liked a post | User | authenticated userId, postId | Boolean/edge | none | Strongly correct user state preferred | Medium |
| AP09 | Like or unlike idempotently | User | authenticated userId, postId, operation/idempotency context | Edge result and counter effect | none | Conditional write; duplicate retry must not double-count | Medium |
| AP10 | Get bookmarks of user | User | authenticated userId, locale, optional cursor/limit | Bookmark edges and exact-locale public Post summaries | createdAt descending | Read-your-write preferred for edges; no locale fallback | Medium |
| AP11 | Check bookmark state | User | authenticated userId, postId | Boolean/edge | none | Strongly correct user state preferred | Medium |
| AP12 | Get PostStats | Anonymous/User | postId | Four display counters | none | Eventual acceptable | High |
| AP13 | Increment view counter | Anonymous/User | postId, date, optional short-lived dedup key | Updated aggregate intent | none | Atomic non-negative increment; retries need dedup policy | High |
| AP14 | Record share and increment shareCount | Anonymous/User | postId, platform, optional userId, idempotency key | PostShare and aggregate effect | none | Idempotent event; counter may converge eventually | Low |
| AP15 | Admin list drafts | Admin | verified admin context, locale, optional cursor/limit | Draft metadata and translation readiness | updatedAt descending | Eventual listing acceptable; admin authorization is verified independently | Low |
| AP16 | Admin get posts by status | Admin | verified admin context, status, optional locale/cursor/limit | Post metadata and translation readiness | updatedAt descending | Eventual listing; mutation target and ACTIVE status re-read by primary ID | Low |
| AP17 | Get User by Cognito sub | Backend | verified cognitoSub | Unique User profile/status mapping | none | Unique primary lookup required; account creation must be idempotent | High |
| AP18 | Verify admin authorization | Backend | verified Access Token claims, mapped userId | `ADMIN` Cognito group membership and current ACTIVE status | none | Security-sensitive; status uses primary-key read, never a stale GSI as sole authority | Medium |
| AP19 | Get translated content by locale | Anonymous/User/Admin | entity ID, locale | Exact translation | none | No silent locale fallback; public actors also require the public locale rule | High |
| AP20 | Get recent posts for homepage | Anonymous/User | locale, small limit, optional cursor | Mixed JOURNAL/NOTE/LAB summaries, exact-locale READY translations and stats | publishedAt descending | Eventual acceptable; query the requested locale directly | High |

Before physical design, review pagination, expected item sizes, hot-key risk, write amplification, locale publication behavior, comment volume, counter retry semantics and admin traffic.

## DynamoDB physical design — deferred

This section is candidate only, not an implementation contract. Các mapping chỉ kiểm tra logical model có thể support access patterns mà không yêu cầu Scan không cần thiết. Final decisions thuộc `docs/DYNAMODB_DESIGN.md`, bao gồm table count, single-table/multi-table choice, exact PK/SK format, GSIs, transactions, conditional writes, retries, counters, Streams, TTL, pagination, hot-partition handling và consistency behavior.

### Illustrative item families

| Candidate PK | Candidate SK | Logical purpose |
| --- | --- | --- |
| USER#id | PROFILE | User |
| USER#id | BOOKMARK#createdAt#postId | Bookmark list |
| USER#id | ATTEMPT#answeredAt#attemptId | PracticeAttempt history |
| USER#id | PRACTICE_PROGRESS#domainCode | UserPracticeProgress |
| POST#id | META | Post |
| POST#id | LOCALE#vi or LOCALE#en | PostTranslation |
| POST#id | STATS | PostStats |
| POST#id | VIEW#YYYY-MM-DD | PostViewsDaily |
| POST#id | TOPIC#topicId | PostTopic forward edge |
| POST#id | SERIES#seriesId | SeriesPost reverse edge for AP05 |
| POST#id | LIKE#USER#userId | PostLike uniqueness/check |
| POST#id | COMMENT#createdAt#commentId | Root Comment |
| POST#id | COMMENT#rootId#REPLY#createdAt#commentId | Direct reply |
| POST#id | SHARE#createdAt#shareId | PostShare |
| TOPIC#id | META | Topic |
| TOPIC#id#LOCALE#locale | POST#publishedAt#postId | Eligible locale-specific Topic-to-post materialized edge for AP03 |
| SERIES#id | META | Series |
| SERIES#id | LOCALE#vi or LOCALE#en | SeriesTranslation |
| SERIES#id | POSITION#0001#postId | Ordered SeriesPost edge |
| QUESTION#id | META | PracticeQuestion |
| QUESTION#id | LOCALE#vi or LOCALE#en | PracticeQuestionTranslation |
| QUESTION#id | OPTION#0001#optionId | PracticeOption |
| LOOKUP#POST_SLUG#canonicalSlug | TARGET | Resolves to POST#id; conditional uniqueness sentinel |
| LOOKUP#TOPIC_SLUG#slug | TARGET | Resolves to TOPIC#id; conditional uniqueness sentinel |
| LOOKUP#SERIES_SLUG#canonicalSlug | TARGET | Resolves to SERIES#id; conditional uniqueness sentinel |
| LOOKUP#COGNITO#sub | USER#id | Conditional uniqueness/primary lookup sentinel for AP17 |

Duplicate/materialized edge items increase write and storage cost but can avoid scans and runtime joins. Whether those copies are justified depends on real traffic and consistency requirements.

V1 candidate chọn lookup sentinel cho Post, Topic và Series slug. Creation phải dùng conditional uniqueness; GSI alone không enforce unique constraint. Vì các slug này immutable trong V1 nên không cần rename flow. Exact transaction strategy giữa sentinel và entity sẽ được finalize trong `docs/DYNAMODB_DESIGN.md`.

### Candidate GSIs

| Candidate index | Partition key | Sort key | Access patterns | Notes |
| --- | --- | --- | --- | --- |
| GSI_PUBLISHED | PUBLISHED#locale | publishedAt#POST#postId | AP02, AP20 | Sparse per-locale projection; only entries satisfying the public locale rule |
| GSI_POST_STATUS | STATUS#status | updatedAt#postId | AP15, AP16 | Admin-only sparse index; exact projection decided after CMS requirements |

`GSI_PUBLISHED_PK = PUBLISHED#<locale>` và `GSI_PUBLISHED_SK = <publishedAt>#POST#<postId>`. Ví dụ: `PUBLISHED#vi` / `2026-09-09T01:00:00Z#POST#123` và `PUBLISHED#en` / `2026-09-08T20:00:00Z#POST#456`. Mỗi locale chỉ được project khi `Post.status = PUBLISHED`, `Post.visibility = PUBLIC` và `PostTranslation(locale).status = READY`, nên AP02/AP20 query trực tiếp đúng locale thay vì đọc một partition chung rồi filter nhiều item.

Với traffic thấp của V1, hai logical partition `PUBLISHED#vi` và `PUBLISHED#en` là acceptable. Time bucket hoặc hash bucket chỉ được review nếu traffic sau này tạo hot-key risk; V1 không implement sharding.

AP03 can use locale-specific Topic materialized edges containing only Posts that satisfy the public locale rule. AP04 uses the Series partition ordered by padded position, then applies the documented partial-exposure checks by primary entity/translation keys. AP05 uses a reverse edge under the Post partition and returns only published, READY exact-locale Series. These are candidates, not proof that a GSI is unnecessary.

Strongly consistent reads are not available on GSIs, so security-sensitive mutation flows must not assume an index is the sole fresh source of truth. Exact transaction, conditional-write and stream/reconciliation strategy remains deferred.

## AWS storage boundary

| Store | Owns | Does not own |
| --- | --- | --- |
| DynamoDB | Structured application records, relationships, counters, object references and metadata | Binary images/files |
| Amazon S3 | Cover images, post images, avatars, uploads and attachments | Relational/domain state or authorization decisions |

Physical records should prefer an S3 object key/reference and derive a CloudFront/S3 delivery URL rather than treating a temporary signed URL as durable identity. Store content type, size and other required metadata alongside the reference when the upload design is finalized.

Binary blobs in DynamoDB would consume item size and read/write capacity unnecessarily; object storage also has storage, request, retrieval and delivery costs that must be reviewed before selecting storage classes, lifecycle or CloudFront behavior. Encryption at rest/in transit, least-privilege access, Block Public Access, logging and retention are deployment concerns to define before implementation.

## Cognito boundary

| Cognito | Application data store |
| --- | --- |
| sub, verified identity attributes and Google federation link | cognitoSub mapping |
| Authentication challenges and provider lifecycle | displayName, avatarUrl and application metadata |
| ID/access/refresh token issuance and signing | role projection, status and business authorization data |
| Token refresh/revocation and managed-login session | Content, interaction and practice ownership |

No password/session schema is duplicated in DynamoDB. Google provider secrets, token material and JWT signing keys are not application User fields.

## Current mock data mapping

No code migration is included in this phase.

| Current source | Current concept | Future logical model |
| --- | --- | --- |
| src/data/journal.ts | Timeline entries with note/lab/reflection type | Reflection → Post(type=JOURNAL) + PostTranslation; note/lab rows become timeline projections of their canonical Post |
| src/data/notes.ts | Note slug, localized title/summary, service/domain/tags, date/minutes | Post(type=NOTE) + PostTranslation + PostTopic |
| src/data/labs.ts | Lab slug, localized copy, services, status, difficulty, image | Post(type=LAB) + PostTranslation + LabMetadata + PostTopic |
| src/data/home.ts notebookFilters | Topic IDs/slugs, VI/EN labels, counts and icons | Topic; counts are derived catalogue/read-model values |
| src/data/home.ts navigation/profile | UI navigation and author presentation | Remains UI/site configuration; do not force all fields into User |
| src/data/aws-services.ts | Service groups, learning state and mock note counts | Topic/content aggregates; LearningState remains deferred because no durable requirement is proven |
| src/data/exam-practice.ts | Four SAA-C03 domain navigation entries and question totals | Preliminary domain configuration/read model, not four database tables |
| src/data/practice.ts demoQuestion | Bilingual scenario, options, correct answer and explanation | PracticeQuestion + PracticeQuestionTranslation + PracticeOption |
| src/data/practice.ts stats/domainScores/mistakes | Answer totals, score and recurring mistakes | UserPracticeProgress plus derived results from PracticeAttempt |
| src/lib/i18n.ts and src/app/[locale] | en/vi shared component/route structure | Locale enum, exact-locale translation lookup and shared canonical identity |
| Current localStorage auth flag | Frontend-only signed-in presentation | Replaced in a future phase by Cognito auth lifecycle; not migrated as user/session data |
| Future ordered collections | Not present in mock data | Series + SeriesTranslation + SeriesPost |

## Assumptions

- Đây là personal technical blog/learning platform với traffic ban đầu thấp và số admin rất nhỏ.
- vi và en là toàn bộ locale set của V1; mở rộng locale cần review slug, fallback và index design.
- Public content chủ yếu đọc nhiều hơn ghi; admin/content writes ít.
- Counters chấp nhận eventual consistency nhưng mutation edges phải idempotent.
- Comments yêu cầu authenticated User trong logical V1; anonymous comments không nằm trong scope.
- Current mock dates và counts là illustrative, không phải records cần migrate nguyên trạng.
- Search, SEO redirects, media upload workflow, moderation workflow và content body format cần requirement riêng trước implementation.

## Intentionally deferred

- Final DynamoDB table count, single-table/multi-table choice, PK/SK/GSI names and capacity mode.
- Infrastructure, AWS SDK, API routes, Lambda handlers, Cognito resources và Google provider setup.
- Transaction/conditional-write implementation, streams, retries, reconciliation jobs và counter repair.
- Localized slugs, redirect history và translation publishing workflow chi tiết.
- Full CMS, PostRevision snapshot format và rollback behavior.
- Practice retake rules, scoring formula, flag/review lifecycle, question versioning và option translation normalization.
- View dedup/anti-spam beyond a possible short-lived TTL window.
- Search index, analytics warehouse, recommendation engine và activity feed.

## Non-goals

Không tự thêm followers, messaging, notifications, teams, organizations, complex RBAC, recommendation engine, activity feed hoặc full analytics warehouse. Model ưu tiên simple, clear, AWS-friendly, extensible và low-cost cho một personal technical blog.

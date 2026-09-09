# DynamoDB physical design V1

## Purpose and status

Tài liệu này chốt physical database design V1 từ logical model và AP01-AP20 trong `docs/DATA_MODEL.md`, đồng thời bổ sung AP21 cho Topic catalog cần thiết để render navigation hiện tại. Đây là implementation contract cho repository/data-access layer ở phase kế tiếp; không mô tả resource đã được tạo.

Các business invariant, lifecycle và authorization rule vẫn do `DATA_MODEL.md` sở hữu. Những item duplicate bên dưới chỉ là read model/materialized edge để phục vụ DynamoDB Query, không thay đổi business semantics.

## Table Strategy

V1 dùng **một DynamoDB single-table** cho Auth application profile, Content, Interaction và Practice preliminary.

| Setting | V1 decision |
| --- | --- |
| Logical table name | `aws-learning-journal` |
| Environment names | `aws-learning-journal-dev`, `aws-learning-journal-prod` |
| Billing mode | `PROVISIONED` trên DynamoDB Standard |
| Primary key | Composite key: `PK` (String), `SK` (String) |
| Secondary indexes | 2 GSIs: `GSI1_PUBLISHED`, `GSI2_POST_STATUS` |
| TTL attribute | `expiresAt` (Number, Unix epoch seconds), chỉ có trên ephemeral items |
| Encryption | DynamoDB encryption at rest bằng AWS owned key cho V1 |
| Point-in-time recovery | Bật ở production; dev có thể tắt để giảm chi phí |
| Deletion protection | Bật ở production; dev tắt để cho phép teardown có chủ đích |
| Tags | Tối thiểu `Application=aws-learning-journal`, `Environment=dev` hoặc `Environment=prod`, `Owner=khanh`, `DataClassification=application` |

### Why one table

- AP01-AP21 chủ yếu là key lookup, bounded item collection và ordered list đã biết trước; chúng phù hợp với một composite-key table.
- Content và interaction cần atomic transaction cùng PostStats. Một table giữ transaction, backup, IAM và environment boundary dễ vận hành.
- Traffic V1 thấp, read-heavy và admin writes ít. Tách table theo entity sẽ tăng resource/configuration overhead nhưng không cải thiện access pattern.
- Materialized edges giải quyết many-to-many Topic/Series và public locale views mà không cần SQL-style joins hoặc Scan.

Single-table ở đây không có nghĩa mọi dữ liệu nằm trong một item. Mỗi aggregate có item collection riêng; large content và binary media nằm ở S3.

Practice vẫn ở cùng table trong V1 nhưng mapping được đánh dấu provisional. Chỉ tách Practice thành table riêng khi nó có ít nhất một boundary thật: ownership/deployment độc lập, retention/backup khác, throughput lớn và không tương quan với blog, hoặc schema/access patterns đã ổn định riêng. Tách sớm chỉ tạo thêm repository, policy và operational surface.

## Key and Attribute Conventions

- Dùng delimiter `#` duy nhất. ID do ứng dụng sinh không được chứa `#`; slug được normalize lowercase trước khi tạo key.
- Entity partition dùng `ENTITY#<id>`: `USER#`, `POST#`, `TOPIC#`, `SERIES#`, `QUESTION#`, `ATTEMPT#`. Comment source thuộc Post collection vì mọi comment access/reconciliation đều biết `postId`.
- Root entity item dùng `SK = META`. Các record theo locale dùng `TRANSLATION#<locale>` với locale lowercase `vi|en`.
- Timestamp trong key là UTC ISO 8601 fixed-width, ví dụ `2026-09-09T01:02:03.456Z`. Date-only là `YYYY-MM-DD`.
- Position là số nguyên dương zero-padded 6 chữ số: `POSITION#000001`. V1 từ chối position vượt miền 6 chữ số thay vì tạo sort order sai.
- Mọi item có `entityType` UPPER_SNAKE_CASE. Field logical `Post.type` được lưu là `postType` để không xung đột ý nghĩa với discriminator.
- GSI attributes chỉ tồn tại trên item tham gia sparse index. Không ghi `null`; publish/unpublish dùng add/remove attributes.
- Key names viết hoa (`PK`, `SK`, `GSI1PK`, `GSI1SK`, `GSI2PK`, `GSI2SK`); business attributes dùng camelCase.

Các prefix chuẩn:

| Purpose | PK | SK |
| --- | --- | --- |
| Entity metadata | `ENTITY#<id>` | `META` |
| Translation | `ENTITY#<id>` | `TRANSLATION#<locale>` |
| Post stats | `POST#<postId>` | `STATS` |
| Comment source | `POST#<postId>` | `COMMENT_SOURCE#<commentId>` |
| Ordered series member | `SERIES#<seriesId>` | `POSITION#<000000>#POST#<postId>` |
| Root public comment | `POST#<postId>` | `COMMENT#ROOT#<createdAt>#<commentId>` |
| Public reply | `POST#<postId>` | `COMMENT#REPLY#<rootId>#<createdAt>#<commentId>` |
| Like | `POST#<postId>` | `LIKE#USER#<userId>` |
| Bookmark lookup | `USER#<userId>` | `BOOKMARK_LOOKUP#POST#<postId>` |
| Bookmark chronology | `USER#<userId>` | `BOOKMARK#<createdAt>#POST#<postId>` |
| Slug uniqueness | `UNIQUE#<ENTITY>_SLUG#<slug>` | `LOCK` |
| Topic catalog | `CATALOG#TOPICS` | `ORDER#<000000>#TOPIC#<topicId>` |

## Table Layout Diagram

```text
USER#u1
├── META
├── BOOKMARK_LOOKUP#POST#p1
├── BOOKMARK#2026-09-09T01:00:00.000Z#POST#p1
├── PRACTICE_ATTEMPT#...                         (provisional edge)
└── PRACTICE_PROGRESS#domain-01                 (provisional)

POST#p1
├── META
├── TRANSLATION#vi
├── TRANSLATION#en
├── LAB_METADATA
├── STATS
├── VIEW_DAILY#2026-09-09
├── TOPIC#t1
├── SERIES#s1                                    (reverse source edge)
├── LIKE#USER#u1
├── SHARE#EVENT#<idempotencyKey>
├── COMMENT_SOURCE#c1                            (moderation source)
├── COMMENT#ROOT#<time>#c1                      (public projection)
└── COMMENT#REPLY#c1#<time>#c2                  (public projection)

TOPIC#t1#LOCALE#vi
└── PUBLISHED#<time>#POST#p1                    (public summary edge)

CATALOG#TOPICS
├── ORDER#000010#TOPIC#t1                      (small Topic navigation projection)
└── ORDER#000020#TOPIC#t2

SERIES#s1
├── META
├── TRANSLATION#vi
└── POSITION#000001#POST#p1                     (source membership)

SERIES#s1#LOCALE#vi
└── POSITION#000001#POST#p1                     (eligible public edge)

POST#p1#LOCALE#vi
└── SERIES_POSITION#000001#SERIES#s1            (eligible reverse edge)

QUESTION#q1                                      (all provisional)
├── META
├── TRANSLATION#vi
├── OPTION#000001#OPTION#o1
└── OPTION_ID#o1                                 (uniqueness lock)
```

Lookup/idempotency partitions nằm cùng table nhưng ngoài các entity collection trên: `UNIQUE#...`, `COGNITO#...`, `VIEW_DEDUP#...`, `ATTEMPT#...`.

## GSI Design

V1 chốt đúng hai GSI. Cả hai dùng eventual consistency theo giới hạn của GSI.

| Index | Keys | Items carrying keys | AP | Projection | Sparse/write effect |
| --- | --- | --- | --- | --- | --- |
| `GSI1_PUBLISHED` | `GSI1PK`, `GSI1SK` | Public-ready `POST_TRANSLATION` only | AP02, AP20 | `INCLUDE`: `entityType`, `postId`, `locale`, `canonicalSlug`, `postType`, `publishedAt`, `title`, `excerpt`, `readingMinutes`, `coverImageKey` | Một index write cho mỗi locale public; remove index keys khi locale không còn eligible |
| `GSI2_POST_STATUS` | `GSI2PK`, `GSI2SK` | Mọi `POST` META | AP15, AP16 | `INCLUDE`: `entityType`, `postId`, `canonicalSlug`, `postType`, `authorId`, `status`, `visibility`, `publishedAt`, `updatedAt`, `coverImageKey` | Một index write khi Post metadata/status/updatedAt đổi |

Exact values:

```text
GSI1PK = PUBLISHED#<locale>
GSI1SK = <publishedAt>#POST#<postId>

GSI2PK = POST_STATUS#<status>
GSI2SK = <updatedAt>#POST#<postId>
```

`GSI1_PUBLISHED` nằm trên translation item vì một Post có thể READY ở VI nhưng DRAFT ở EN. Item đó duplicate một số Post metadata nhỏ để query trả đủ summary mà không đọc Post META từng row. Stats không nằm trong projection; AP20 dùng một `BatchGetItem` cho `POST#id/STATS` của page nhỏ, tránh mọi counter update phải fan out sang hai translation items.

`GSI2_POST_STATUS` nằm trên Post META. Admin query lấy translation readiness bằng một bounded `BatchGetItem` cho `TRANSLATION#<locale>`; authorization và mutation target luôn được kiểm tra lại bằng primary item, không dựa vào GSI.

Không dùng GSI cho slug, Cognito, Topic, Series, Comment hoặc Bookmark. Direct sentinel/item và materialized edge rẻ hơn, rõ uniqueness hơn và giữ GSI count nhỏ.

## Entity to Item Mapping

`Required`/`Optional` bên dưới nói về physical attributes ngoài `PK`, `SK`, `entityType`.

| Logical entity / physical item | PK / SK | Required | Optional | GSI | Authority |
| --- | --- | --- | --- | --- | --- |
| User | `USER#<id>` / `META` | `userId`, `cognitoSub`, normalized `email`, `displayName`, `role`, `status`, `createdAt`, `updatedAt` | `avatarObjectKey` | none | Source of truth cho application profile/status; Cognito vẫn sở hữu authentication/group |
| Post | `POST#<id>` / `META` | `postId`, `postType`, `authorId`, `canonicalSlug`, `status`, `visibility`, `createdAt`, `updatedAt` | `coverImageKey`, `publishedAt` | GSI2 keys | Source of truth |
| PostTranslation | `POST#<id>` / `TRANSLATION#<locale>` | `postId`, `locale`, `status`, `title`, `excerpt`, `bodyS3ObjectKey`, `bodyContentType`, `createdAt`, `updatedAt` | `readingMinutes`, `bodyVersionId`, `bodyETag`, `bodyBytes`, duplicated `canonicalSlug`, `postType`, `publishedAt`, `coverImageKey`; GSI1 keys only if public | GSI1 sparse | Translation fields/source pointer are truth; duplicated Post fields and index projection are materialized |
| Topic | `TOPIC#<id>` / `META` | `topicId`, `slug`, `name.vi`, `name.en`, `sortOrder`, `createdAt`, `updatedAt` | `description.vi`, `description.en`, `iconObjectKey` | none | Source of truth |
| Topic catalog edge | `CATALOG#TOPICS` / `ORDER#<sortOrder6>#TOPIC#<topicId>` | `topicId`, `slug`, `name.vi`, `name.en`, `sortOrder` | `iconObjectKey` | none | Small materialized projection for AP21; no published-post counter in V1 |
| PostTopic | `POST#<postId>` / `TOPIC#<topicId>` | `postId`, `topicId`, `createdAt` | none | none | Source relationship; conditional put enforces pair uniqueness |
| Topic public edge | `TOPIC#<topicId>#LOCALE#<locale>` / `PUBLISHED#<publishedAt>#POST#<postId>` | post summary fields and `projectionVersion` | `coverImageKey`, `readingMinutes` | none | Materialized; never includes body |
| Series | `SERIES#<id>` / `META` | `seriesId`, `canonicalSlug`, `authorId`, `status`, `createdAt`, `updatedAt` | `coverImageKey` | none | Source of truth |
| SeriesTranslation | `SERIES#<id>` / `TRANSLATION#<locale>` | `seriesId`, `locale`, `status`, `title`, `description`, `createdAt`, `updatedAt` | none | none | Source of truth |
| SeriesPost ordered | `SERIES#<seriesId>` / `POSITION#<position6>#POST#<postId>` | `seriesId`, `postId`, `position`, `createdAt` | none | none | Source membership/order |
| SeriesPost reverse | `POST#<postId>` / `SERIES#<seriesId>` | `seriesId`, `postId`, `position`, `createdAt` | none | none | Materialized reverse edge and uniqueness guard for `(seriesId, postId)` |
| Series public member | `SERIES#<seriesId>#LOCALE#<locale>` / `POSITION#<position6>#POST#<postId>` | eligible Post summary, `position`, `projectionVersion` | `coverImageKey`, `readingMinutes` | none | Materialized exact-locale public view |
| Series public reverse | `POST#<postId>#LOCALE#<locale>` / `SERIES_POSITION#<position6>#SERIES#<seriesId>` | eligible Series summary, `position`, `projectionVersion` | `coverImageKey` | none | Materialized AP05 view |
| LabMetadata | `POST#<postId>` / `LAB_METADATA` | `postId`, `difficulty`, `labStatus`, `services`, `updatedAt` | none | none | Source; only valid for LAB Post |
| Comment | `POST#<postId>` / `COMMENT_SOURCE#<commentId>` | `commentId`, `postId`, `userId`, `status`, `createdAt`, `updatedAt`, `version` | `parentId`, `content` (absent only on DELETED tombstone) | none | Source of truth/moderation state; queryable by Post for reconciliation |
| Comment public edge | `POST#<postId>` / root or reply key shown above | `commentId`, `userId`, `createdAt`, `updatedAt`, `renderState` | `parentId`, `content` only when VISIBLE | none | Materialized public row; HIDDEN/PENDING absent, DELETED may be sanitized tombstone; author profile is BatchGet, not copied |
| PostLike | `POST#<postId>` / `LIKE#USER#<userId>` | `postId`, `userId`, `createdAt` | none | none | Source relationship and uniqueness record |
| Bookmark lookup | `USER#<userId>` / `BOOKMARK_LOOKUP#POST#<postId>` | `userId`, `postId`, `createdAt` | none | none | Source relationship/direct-check item |
| Bookmark chronology | `USER#<userId>` / `BOOKMARK#<createdAt>#POST#<postId>` | `userId`, `postId`, `createdAt` | none | none | Materialized list edge; no content snapshot |
| PostShare | `POST#<postId>` / `SHARE#EVENT#<idempotencyKey>` | `shareId`, `postId`, `platform`, `createdAt` | `userId` | none | Permanent accepted-event source; no history AP |
| PostStats | `POST#<postId>` / `STATS` | `postId`, four non-negative counters, `updatedAt` | none | none | Denormalized aggregate, reconstructable |
| PostViewsDaily | `POST#<postId>` / `VIEW_DAILY#<YYYY-MM-DD>` | `postId`, `date`, `viewCount`, `updatedAt` | none | none | Durable daily aggregate; source for view reconciliation |
| View dedup | `VIEW_DEDUP#POST#<postId>` / `VIEWER#<digest>` | `postId`, `viewerDigest`, `windowStartedAt`, `expiresAt` | none | none | Ephemeral idempotency guard, not analytics history |
| PracticeQuestion | `QUESTION#<id>` / `META` | `questionId`, `domainCode`, `status`, `correctOptionId`, `createdAt`, `updatedAt` | `difficulty` | none | Provisional source |
| PracticeQuestionTranslation | `QUESTION#<id>` / `TRANSLATION#<locale>` | `questionId`, `locale`, `scenario`, `explanation`, `updatedAt` | none | none | Provisional source |
| PracticeOption | `QUESTION#<id>` / `OPTION#<position6>#OPTION#<id>` | `optionId`, `questionId`, `position`, `text.vi`, `text.en` | none | none | Provisional source; paired with `OPTION_ID#<id>` lock to enforce both unique constraints |
| PracticeAttempt | `ATTEMPT#<id>` / `META` | attempt logical fields | `durationMs` | none | Provisional immutable/idempotent source; optional user chronology edge under `USER#id` |
| UserPracticeProgress | `USER#<id>` / `PRACTICE_PROGRESS#<domainCode>` | logical counters/score and `updatedAt` | none | none | Provisional denormalized aggregate |

Lookup items are also first-class records:

| Purpose | PK / SK | Attributes |
| --- | --- | --- |
| Post slug | `UNIQUE#POST_SLUG#<slug>` / `LOCK` | `entityType=UNIQUE_POST_SLUG`, `targetPostId`, `createdAt` |
| Topic slug | `UNIQUE#TOPIC_SLUG#<slug>` / `LOCK` | `targetTopicId`, `createdAt` |
| Series slug | `UNIQUE#SERIES_SLUG#<slug>` / `LOCK` | `targetSeriesId`, `createdAt` |
| Cognito sub | `COGNITO#<sub>` / `USER` | `targetUserId`, `createdAt` |
| Normalized email | `UNIQUE#USER_EMAIL#<email>` / `LOCK` | `targetUserId`, `createdAt` |

## Sample Items

```json
{
  "PK": "POST#p_123",
  "SK": "META",
  "entityType": "POST",
  "postId": "p_123",
  "canonicalSlug": "dynamodb-consistency",
  "postType": "NOTE",
  "authorId": "u_123",
  "status": "PUBLISHED",
  "visibility": "PUBLIC",
  "coverImageKey": "media/posts/p_123/cover.webp",
  "publishedAt": "2026-09-09T01:00:00.000Z",
  "createdAt": "2026-09-08T10:00:00.000Z",
  "updatedAt": "2026-09-09T01:00:00.000Z",
  "GSI2PK": "POST_STATUS#PUBLISHED",
  "GSI2SK": "2026-09-09T01:00:00.000Z#POST#p_123"
}
```

```json
{
  "PK": "POST#p_123",
  "SK": "TRANSLATION#vi",
  "entityType": "POST_TRANSLATION",
  "postId": "p_123",
  "locale": "vi",
  "status": "READY",
  "title": "DynamoDB consistency bằng ngôn ngữ đơn giản",
  "excerpt": "Điều eventual và strongly consistent read đảm bảo.",
  "bodyS3ObjectKey": "content/posts/p_123/vi/body.md",
  "bodyContentType": "text/markdown; charset=utf-8",
  "bodyVersionId": "example-version-id",
  "readingMinutes": 5,
  "canonicalSlug": "dynamodb-consistency",
  "postType": "NOTE",
  "publishedAt": "2026-09-09T01:00:00.000Z",
  "GSI1PK": "PUBLISHED#vi",
  "GSI1SK": "2026-09-09T01:00:00.000Z#POST#p_123",
  "createdAt": "2026-09-08T10:05:00.000Z",
  "updatedAt": "2026-09-09T01:00:00.000Z"
}
```

```json
{
  "PK": "POST#p_123",
  "SK": "STATS",
  "entityType": "POST_STATS",
  "postId": "p_123",
  "viewCount": 42,
  "likeCount": 3,
  "commentCount": 2,
  "shareCount": 1,
  "updatedAt": "2026-09-09T02:00:00.000Z"
}
```

```json
{
  "PK": "TOPIC#t_dynamodb#LOCALE#vi",
  "SK": "PUBLISHED#2026-09-09T01:00:00.000Z#POST#p_123",
  "entityType": "TOPIC_POST_PUBLIC",
  "topicId": "t_dynamodb",
  "postId": "p_123",
  "locale": "vi",
  "canonicalSlug": "dynamodb-consistency",
  "postType": "NOTE",
  "title": "DynamoDB consistency bằng ngôn ngữ đơn giản",
  "excerpt": "Điều eventual và strongly consistent read đảm bảo.",
  "publishedAt": "2026-09-09T01:00:00.000Z",
  "projectionVersion": "2026-09-09T01:00:00.000Z"
}
```

```json
{
  "PK": "CATALOG#TOPICS",
  "SK": "ORDER#000010#TOPIC#t_dynamodb",
  "entityType": "TOPIC_CATALOG",
  "topicId": "t_dynamodb",
  "slug": "dynamodb",
  "name": {
    "vi": "DynamoDB",
    "en": "DynamoDB"
  },
  "iconObjectKey": "media/topics/dynamodb.svg",
  "sortOrder": 10
}
```

```json
{
  "PK": "USER#u_123",
  "SK": "BOOKMARK_LOOKUP#POST#p_123",
  "entityType": "BOOKMARK",
  "userId": "u_123",
  "postId": "p_123",
  "createdAt": "2026-09-09T03:00:00.000Z"
}
```

```json
{
  "PK": "POST#p_123",
  "SK": "COMMENT_SOURCE#c_123",
  "entityType": "COMMENT",
  "commentId": "c_123",
  "postId": "p_123",
  "userId": "u_123",
  "parentId": null,
  "content": "Ví dụ comment",
  "status": "VISIBLE",
  "version": 1,
  "createdAt": "2026-09-09T03:10:00.000Z",
  "updatedAt": "2026-09-09T03:10:00.000Z"
}
```

```json
{
  "PK": "VIEW_DEDUP#POST#p_123",
  "SK": "VIEWER#8f4c...",
  "entityType": "VIEW_DEDUP",
  "postId": "p_123",
  "viewerDigest": "8f4c...",
  "windowStartedAt": "2026-09-09T03:15:00.000Z",
  "expiresAt": 1788927300
}
```

## Public Projection Lifecycle

Public eligibility luôn là conjunction: Post `PUBLISHED`, Post `PUBLIC`, exact translation `READY`. Khi eligibility hoặc summary đổi, cùng admin use case phải đồng bộ:

1. Post META và translation source fields.
2. Add/remove `GSI1PK/GSI1SK` cùng duplicated summary trên translation item.
3. Put/delete Topic public edges cho từng PostTopic và locale liên quan.
4. Put/delete Series public member/reverse edges khi cả Series locale và Post locale đều eligible.

VI READY nhưng EN DRAFT chỉ tạo `PUBLISHED#vi` và VI materialized edges. Unpublish, archive, đổi visibility sang PRIVATE hoặc READY về DRAFT phải remove GSI1 keys và xóa public edges; source relationships vẫn giữ.

V1 thực hiện projection maintenance đồng bộ trong `TransactWriteItems` của admin publish/readiness/membership operation vì fan-out hiện nhỏ. Repository phải tính desired projection idempotently từ source state. Nếu một Post có fan-out vượt transaction service limit trong tương lai, không split mù quáng làm lộ partial state; khi đó cần projection workflow có trạng thái/rebuild riêng. V1 không thêm workflow đó.

Topic edge duplicate title, excerpt, slug, type, publish time, cover key và reading time để AP03 không N+1. Nó không duplicate body. Series public edges duplicate summary tương tự để AP04/AP05 vừa đúng locale/public state vừa paginate ổn định, thay vì query membership rồi FilterExpression. Summary edit gây write amplification theo số Topic/Series, được chấp nhận vì admin writes hiếm.

Topic catalog edge là projection riêng cho navigation/admin picker, không phụ thuộc Post publication. Create/update/reorder Topic phải đồng bộ Topic META và catalog edge trong cùng transaction; nếu `sortOrder` đổi thì xóa old-key edge và put new-key edge. Published-post count chưa có requirement đủ chắc chắn nên không nằm trong edge hoặc tạo counter ở V1; nếu UI cần sau này, nó là derived/future decision cần access-pattern review riêng.

## Access Pattern Mapping AP01-AP21

`Base` nghĩa là table primary index. `SC` là strongly consistent read; `EC` là eventually consistent read. GSI chỉ hỗ trợ EC.

| AP | Operation | Index/Table | PK | SK condition / steps | Projection | Consistency | Pagination |
| --- | --- | --- | --- | --- | --- | --- | --- |
| AP01 | Published Post by slug + locale | Base | `UNIQUE#POST_SLUG#slug`, then `POST#id` | `GetItem LOCK`; `BatchGet` META, `TRANSLATION#locale`, STATS; `Query begins_with(SK,"TOPIC#")`, optional BatchGet Topic META | Full detail refs, stats, topic IDs | EC acceptable; application rechecks public rule | none; typically 1 Get + 1 BatchGet + 1 Query (+ Topic BatchGet) plus 1 S3 Get for body |
| AP02 | Latest published posts | GSI1 | `PUBLISHED#locale` | `Query`, no filter, `ScanIndexForward=false` | GSI1 summary projection | EC | LEK cursor |
| AP03 | Posts by topic | Base | resolve `UNIQUE#TOPIC_SLUG#slug` if needed, then `TOPIC#id#LOCALE#locale` | `begins_with(SK,"PUBLISHED#")`, `ScanIndexForward=false` | Summary edge | EC | LEK cursor |
| AP04 | Posts in series | Base | resolve slug; `SERIES#id` for META/translation, then `SERIES#id#LOCALE#locale` | `Get/BatchGet` META + translation; `Query begins_with(SK,"POSITION#")`, forward | Eligible summary edge | EC | LEK cursor; no post-query eligibility filter |
| AP05 | Published series containing Post | Base | `POST#id#LOCALE#locale` | `Query begins_with(SK,"SERIES_POSITION#")`, forward | Eligible Series summary + member position | EC | LEK cursor |
| AP06 | Root comments | Base | `POST#id` | `Query begins_with(SK,"COMMENT#ROOT#")`, ascending; one BatchGet User META for distinct `userId` values | Public comment edge + current author summaries | EC comments; EC user display profile | LEK cursor, `ScanIndexForward=true` |
| AP07 | Replies | Base | `POST#id` | `Query begins_with(SK,"COMMENT#REPLY#rootId#")`, forward; one BatchGet User META | Public reply edge + current author summaries | EC | LEK cursor |
| AP08 | Check like | Base | `POST#id` | `GetItem LIKE#USER#userId` | keys/existence | SC | none |
| AP09 | Like/unlike | Base transaction | `POST#id` | Conditional Put/Delete like edge + atomic STATS update | edge + counter | Atomic transaction | none |
| AP10 | User bookmarks | Base | `USER#id` | `Query begins_with(SK,"BOOKMARK#")`, reverse; BatchGet current Post META + translations for page IDs | edges then current exact-locale summaries | SC for edges and current primary records | LEK cursor; fill loop described below |
| AP11 | Check bookmark | Base | `USER#id` | `GetItem BOOKMARK_LOOKUP#POST#postId` | keys/existence | SC | none |
| AP12 | Get PostStats | Base | `POST#id` | `GetItem STATS` | four counters | EC for display | none |
| AP13 | Increment accepted view | Base transaction | dedup + `POST#id` | Conditional Put dedup; Update STATS; Update `VIEW_DAILY#date` | dedup and counters | Atomic accepted event | none |
| AP14 | Accept share | Base transaction | `POST#id` | Conditional Put `SHARE#EVENT#key`; Update STATS | event + counter | Atomic accepted event | none |
| AP15 | Admin drafts | GSI2 + Base | `POST_STATUS#DRAFT` | Query reverse by updatedAt; BatchGet requested translations | Post metadata + readiness | EC listing; authorization independent | LEK cursor |
| AP16 | Admin posts by status | GSI2 + Base | `POST_STATUS#status` | Query reverse; BatchGet translations as needed | Post metadata + readiness | EC listing; SC re-read before mutation | LEK cursor |
| AP17 | User by Cognito sub | Base | `COGNITO#sub`, then `USER#id` | `GetItem USER`, then `GetItem USER#id/META` | mapping + profile/status | SC, including bootstrap conflict checks | none |
| AP18 | Verify admin authorization | Cognito JWT + Base | `USER#id` | Verify access-token ADMIN group outside DB; `GetItem META` for ACTIVE | User status only from DynamoDB | SC primary read | none |
| AP19 | Translation by entity ID + locale | Base | `POST#id`, `SERIES#id` or `QUESTION#id` | `GetItem TRANSLATION#locale`; public Post/Series also read META and validate public rule | exact translation, body pointer for Post | EC public; SC optional admin edit precondition | none |
| AP20 | Homepage recent posts | GSI1 + Base | `PUBLISHED#locale` | Query reverse with small limit; one BatchGet `POST#id/STATS` | summaries + stats | EC | LEK cursor |
| AP21 | List Topics by sortOrder | Base | `CATALOG#TOPICS` | `Query begins_with(SK,"ORDER#")`, forward; no Scan | `topicId`, slug, localized name, icon key, sortOrder | EC; source Topic META remains mutation truth | LEK cursor, `ScanIndexForward=true` |

AP10 không duplicate public content vào bookmark vì snapshot có thể stale và vô tình expose content đã PRIVATE/ARCHIVED. Repository query bookmark edges theo batches, BatchGet current META/translation, bỏ item không còn public exact-locale và tiếp tục đến khi đủ client limit, hết dữ liệu, hoặc chạm server work cap. Cursor phải trỏ tới bookmark edge cuối cùng đã **consume**, nên page có thể ngắn/empty nhưng không lặp hoặc bỏ qua edge. Đây là V1 trade-off cho personal collection nhỏ; nếu bookmark volume lớn mới cần dedicated user-visible projection.

AP22 `List Published Series` chưa được UI/product V1 yêu cầu. V1 explicitly defer access pattern này và không tạo GSI hoặc global Series catalog chỉ để phục vụ discoverability giả định. AP04 vẫn resolve direct Series bằng id/slug; AP05 vẫn tìm eligible Series chứa một Post. Khi product cần trang browse Series, phải chốt input, locale, sort order, pagination và publication semantics trước khi thêm physical mapping.

## Like and Bookmark Idempotency

### Like

V1 chọn synchronous transaction:

- Like: conditionally Put `POST#id / LIKE#USER#id` khi item chưa tồn tại và Update `STATS.likeCount + 1`.
- Retry like khi edge đã tồn tại: transaction condition fail, backend strong-read edge và trả `liked=true`; counter không đổi.
- Unlike: conditionally Delete edge khi tồn tại và Update `likeCount - 1` với condition current counter `> 0`.
- Retry unlike khi edge không tồn tại: trả `liked=false`; counter không đổi.

Không dùng Stream cho V1 vì nó thêm retry/DLQ/reconciliation path và làm user state/counter lệch tạm thời không cần thiết ở traffic hiện tại.

### Bookmark

Create/delete bookmark dùng transaction hai item: lookup source và chronological edge. Cả hai Put có not-exists condition. Delete trước hết SC-read lookup để lấy exact `createdAt`, rồi conditional-delete cả hai. Retry create/delete được phân loại bằng lookup source; không Scan và không GSI. Chi phí là 2 writes cho mỗi transition, đổi lại AP10 và AP11 đều trực tiếp và strongly readable.

## Share and View Semantics

### Share

`PostShare.id`/idempotency key được canonicalize và giới hạn độ dài trước khi đưa vào key. `SHARE#EVENT#key` được giữ **permanent**, không TTL, vì nó là source event để chống retry mãi mãi và reconcile `shareCount`. V1 không có share-history API và không thêm GSI/time-ordered copy. Transaction conditional Put event + increment `shareCount` đúng một lần. Anonymous share chỉ thiếu `userId`; không tạo fingerprint theo dõi người dùng.

### View

V1 dùng dedup window **1 giờ**. Một giờ loại reload/back-forward và nhiều request trong cùng phiên đọc, nhưng vẫn cho một người quay lại sau đó được tính là lượt đọc mới. 24 giờ dễ undercount các lần quay lại học trong ngày; 30 phút dễ count lại một phiên đọc dài.

Viewer identity ưu tiên random first-party cookie/session identifier rồi HMAC ở server thành `viewerDigest`; authenticated user có thể dùng HMAC của user ID. Không lưu raw IP lâu dài. Cookie bị xóa, browser khác hoặc bot có thể tạo lượt mới, nên đây là UX counter chứ không phải unique-human analytics.

Flow là một `TransactWriteItems` ba action:

1. Put/replace dedup item với condition item chưa tồn tại **hoặc** `expiresAt <= now`; đặt expiration mới `now + 3600`.
2. Atomic increment `POST#id/STATS.viewCount`.
3. Atomic `if_not_exists + 1` cho `POST#id/VIEW_DAILY#date`.

Nếu dedup condition fail, toàn transaction rollback và request là no-op. Application kiểm tra timestamp trong condition thay vì chờ TTL xóa item, vì TTL deletion asynchronous. Popular post có thể làm partition dedup/stats nóng; V1 chưa shard.

## Counter Strategy

V1 chọn **synchronous transactions**, không DynamoDB Streams:

| Counter | Durable reconciliation source | Write behavior |
| --- | --- | --- |
| `likeCount` | Active PostLike edges | edge + stats transaction |
| `commentCount` | Comment source status | state/public-edge + stats transaction |
| `shareCount` | Permanent PostShare events | event + stats transaction |
| `viewCount` | Sum of PostViewsDaily aggregates | dedup + total + daily transaction |

PostStats là denormalized read model. Accepted mutation trả thành công chỉ sau khi source effect và counter commit atomically. Display reads có thể EC; ngay sau mutation backend có thể trả result đã tính hoặc SC-read STATS nếu product cần.

Reconciliation job chưa implement nhưng contract rõ: Query từng Post collection theo prefix `LIKE#`, `COMMENT_SOURCE#`, `SHARE#EVENT#` và `VIEW_DAILY#`; recompute likes từ active edges, comments từ VISIBLE source rows, shares từ unique events, views từ daily aggregates; conditionally replace counters theo observed version/time. Failure trước commit không có effect, transaction failure rollback toàn bộ, retry transient error giữ cùng key/expected state.

### Comment moderation and counter

Comment source có integer `version`. Mỗi transition transaction condition là `status == expectedStatus AND version == expectedVersion`, sau đó increment version:

| Transition | Public edge | `commentCount` |
| --- | --- | ---: |
| PENDING -> VISIBLE | Put visible root/reply projection | +1 |
| VISIBLE -> HIDDEN | Delete public projection | -1 |
| VISIBLE -> DELETED | Delete projection, hoặc Update/replace cùng item thành sanitized root tombstone nếu visible replies cần anchor | -1 |
| HIDDEN -> VISIBLE | Put visible projection | +1 |
| same retry | No new transition | 0 |

Decrement stats có condition `commentCount > 0`; không cho âm. Reply creation còn phải verify parent bằng SC read và transaction condition: parent source tồn tại, cùng `postId`, `parentId` absent/null và parent không phải invalid deleted target. `PENDING`/`HIDDEN` không có public edge. DELETED tombstone edge, nếu cần giữ thread shape, chỉ có ID/time/`renderState=TOMBSTONE`, không content/author details và không được count như visible comment.

## Transaction Boundaries

Mỗi `TransactWriteItems` phải tuân thủ ba service constraint: tối đa 100 actions, tổng kích thước các item trong transaction không quá 4 MB, và không có hai transaction actions cùng target một item. Repository phải build/estimate action plan và serialized item-size budget trước khi commit; request vượt một trong các limit bị reject trước khi gọi DynamoDB, không được split mù quáng thành các transaction làm lộ partial state.

Các operation dùng `TransactWriteItems`:

- Bootstrap User: Cognito sentinel + normalized-email sentinel + User META, tất cả conditional not-exists.
- Đổi User email: Put sentinel mới + Update User META + Delete sentinel cũ với expected-owner conditions.
- Create Post: slug sentinel + Post META + zeroed PostStats.
- Create Topic: slug sentinel + Topic META + Topic catalog edge.
- Update Topic metadata: Update Topic META + Update cùng catalog edge; nếu reorder thì mỗi Topic bị ảnh hưởng dùng một Update META + Delete old catalog edge + Put new catalog edge, với expected-version/owner conditions.
- Create Series: slug sentinel + entity META.
- Create/delete PostTopic: source edge và relevant bounded public Topic projections.
- Add/move/remove SeriesPost: ordered forward edge + reverse edge + relevant locale public edges; conditions giữ unique post và position.
- Publish/unpublish/archive/change visibility/change translation readiness: source updates + sparse index attributes + relevant public projections.
- Like/unlike: edge + PostStats.
- Bookmark/unbookmark: lookup + chronological edge.
- Accept share: unique event + PostStats.
- Accept view: dedup + PostStats + PostViewsDaily.
- Create VISIBLE comment hoặc moderation transition làm thay đổi public visibility: Comment source + public edge + PostStats.
- Create PracticeOption/Attempt và progress update nếu Practice contract sau này giữ mapping provisional này.

### V1 projection fan-out guard

Admin publish/unpublish/archive, translation-readiness, Topic create/update/reorder/membership và Series create/membership/publication operation phải estimate trước cả action count lẫn aggregate item bytes của source writes, public projections và catalog edges. Operation chỉ commit khi plan nằm trong giới hạn transaction. Topic reorder được bound theo số Topic thực sự đổi; Post/Series projection fan-out được bound theo số locale và relationship edge cần đồng bộ.

Nếu source update và add/remove GSI attributes cùng nằm trên một `POST_TRANSLATION` item, chúng phải được combine thành một `Update` action duy nhất. Không tạo `ConditionCheck` riêng rồi `Update` cùng item; condition source/version phải nằm trên chính Update action. GSI maintenance do DynamoDB thực hiện từ attribute change và không phải một transaction action riêng.

Nếu fan-out vượt guard, V1 trả domain/operational error và yêu cầu giảm scope hoặc thiết kế lại workflow; không commit một phần. Projection workflow nhiều phase, async rebuild hoặc Streams chỉ được cân nhắc ở version sau khi có evidence.

Không transaction cho independent profile edit, draft body-pointer update, ordinary Get/Query, hay stats display. Transaction chỉ dùng khi failure một nửa sẽ phá invariant, uniqueness, idempotency hoặc counter correctness.

S3 upload và DynamoDB không có cross-service transaction. Backend upload immutable/new S3 version trước, sau đó conditional-update body pointer trong DynamoDB. Nếu pointer update fail, object/version chưa tham chiếu là orphan có thể cleanup sau; không overwrite object đang được published pointer trỏ tới.

## Conditional Writes

| Concern | Pseudo-condition |
| --- | --- |
| Slug/Cognito/email uniqueness | sentinel `attribute_not_exists(PK)` trong cùng create transaction |
| PostTranslation uniqueness | `attribute_not_exists(PK) AND attribute_not_exists(SK)` |
| PostTopic uniqueness | source edge not exists |
| Series `(seriesId, position)` | ordered forward key not exists |
| Series `(seriesId, postId)` | reverse key not exists; transaction cùng forward edge |
| Like create/delete | edge absent for Put; edge present for Delete |
| Bookmark create/delete | lookup and list absent for Put; expected `createdAt` for Delete |
| Share retry | event item absent |
| View dedup | absent or stored `expiresAt <= now` |
| Optimistic edit/moderation | `version == expectedVersion` and current state == expected state |
| Counter decrement | relevant counter `> 0` |
| First publish time | set `publishedAt` only if absent; republish retains value |
| Projection update | source expected status/version and deterministic `projectionVersion` |

Logical conditional failures are domain outcomes (`already liked`, `slug conflict`, stale edit), không được blind retry. Với ambiguous network result, retry cùng request identity/expected condition để condition phân biệt commit đã xảy ra.

## TTL

Chỉ `VIEW_DEDUP` dùng `expiresAt` trong V1. Không TTL Post, User, Comment, Like, Bookmark, Share, Stats, daily views, Series hoặc Practice records. Share idempotency permanent vì event là reconciliation source.

DynamoDB TTL xóa asynchronous và có thể trễ. Application luôn kiểm tra `expiresAt` trong conditional write/read; không giả định item biến mất đúng giây hết hạn. Nếu sau này có temporary operation locks, chúng có thể dùng cùng attribute nhưng correctness vẫn phải dựa trên timestamp condition, không dựa vào deletion.

## Pagination

Mọi list dùng DynamoDB `LastEvaluatedKey` (LEK), không offset. Backend serialize toàn bộ LEK cần thiết thành opaque, versioned, tamper-resistant cursor và bind nó với operation/index/partition/locale/direction. Client chỉ round-trip cursor, không parse hoặc tự tạo key.

| AP | Direction |
| --- | --- |
| AP02, AP03, AP10, AP15, AP16, AP20 | newest first, `ScanIndexForward=false` |
| AP04, AP05 | padded position ascending, `ScanIndexForward=true` |
| AP06, AP07 | createdAt ascending in V1, `ScanIndexForward=true` |
| AP21 | Topic sortOrder ascending, `ScanIndexForward=true` |

AP10 fill-loop cursor rule được mô tả ở access mapping. AP04/AP05 không filter source membership sau pagination; locale eligibility đã được materialize, nên không có page rỗng giả hoặc position reorder. Query response chưa có LEK nghĩa là hết dữ liệu; không suy luận từ số item nhỏ hơn limit.

## Consistency

| Operation | Consistency |
| --- | --- |
| Public Post/Series detail and translations | EC, nhưng luôn validate cùng public-locale rule |
| Published/topic/series/home listing | EC; GSI1 và public projections có publish propagation delay ngắn |
| Topic catalog | EC materialized projection; admin mutation conditions use Topic META |
| PostStats display | EC |
| Like/bookmark state check | SC primary-key GetItem |
| Bookmark list edges/current visibility | SC preferred cho read-your-write; BatchGet primary records can request SC |
| Cognito sub mapping and User ACTIVE check | SC primary-key reads |
| Admin mutation precondition/current version | SC primary-key read plus conditional write |
| Admin status listing | EC GSI2; never sole authorization/mutation truth |
| Accepted counter transition | Transactional atomic write; subsequent EC read may lag |
| Slug lookup | EC đủ cho public immutable slug; create conflict do conditional transaction, không do read |

Security-sensitive authorization gồm verified Cognito Access Token/group và SC User META status. Không dùng GSI result hoặc User.role projection làm sole authority.

## Item Size and S3 Boundary

DynamoDB item limit là 400 KB, tính cả attribute names và values. `PostTranslation.content` có thể tiến gần/vượt giới hạn khi có Markdown dài, embedded metadata hoặc future revisions. V1 chốt:

- Body là UTF-8 Markdown object trong Amazon S3 General Purpose; DynamoDB chỉ lưu pointer/metadata.
- Target budget cho DynamoDB metadata/summary item là dưới 100 KB; list edges phải nhỏ hơn nhiều và tuyệt đối không copy body.
- Production bucket bật Versioning. `bodyVersionId` pin exact published object version; rollback đổi pointer có điều kiện. Dev có thể không version nếu chấp nhận mất lịch sử.
- S3 object keys, không signed URL, là durable identity. Delivery URL/presigned URL/CloudFront URL được derive khi đọc.

Database-side field strategy:

| Asset | Durable field/example |
| --- | --- |
| Post body | `bodyS3ObjectKey = content/posts/<postId>/<locale>/body.md`, optional `bodyVersionId`, `bodyETag`, `bodyBytes` |
| Cover | `coverImageKey = media/posts/<postId>/cover.webp` |
| Inline image | Markdown references stable logical key under `media/posts/<postId>/inline/<assetId>.<ext>` |
| Avatar | `avatarObjectKey = media/users/<userId>/avatar.webp` |
| Attachment | Separate lightweight `MEDIA#<assetId>` item under Post only when filename/contentType/size/access metadata must be queried; object key `media/posts/<postId>/attachments/<assetId>/<filename>` |

S3 read thêm một object request cho detail page; CloudFront có thể cache body/media sau này. Write flow có upload + Dynamo pointer update và orphan cleanup như transaction section. Storage, request, retrieval và delivery đều có chi phí, nên V1 dùng general-purpose bucket/default frequently-accessed class; không thêm lifecycle archive khi chưa có access/retention evidence.

Deployment phải dùng encryption at rest, TLS in transit, Block Public Access, least-privilege IAM và private S3 origin qua CloudFront/OAC nếu có CDN. Production nên audit bằng CloudTrail data events theo phạm vi/cost phù hợp, access logs/CloudWatch metrics và encrypted log destinations. Không lưu bucket URL hoặc temporary signed URL trong DynamoDB.

## Capacity and Cost

V1 chọn `PROVISIONED` trên DynamoDB Standard để ưu tiên sử dụng AWS Free Tier lâu dài. Theo AWS pricing được review ngày 2026-09-09, Free Tier gồm tổng 25 RCU và 25 WCU mỗi tháng cho DynamoDB Standard tables dùng provisioned capacity, tính theo Region/payer account. Capacity của base table và từng GSI được provision riêng và đều góp vào budget.

Initial production allocation:

| Resource | RCU | WCU | Rationale |
| --- | ---: | ---: | --- |
| Base table | 8 | 6 | Primary-key reads, transactions và interaction writes |
| `GSI1_PUBLISHED` | 6 | 6 | Public listing read-heavy; WCU đủ theo base-table write envelope |
| `GSI2_POST_STATUS` | 2 | 6 | Admin reads hiếm; WCU không thấp hơn base để tránh index back-pressure |
| **Production total** | **16** | **18** | Dưới 25/25, còn headroom cho dev/adjustment |

Nếu `dev` và `prod` cùng tồn tại lâu dài trong cùng Region/payer account, initial dev allocation là 1 RCU + 1 WCU cho base table và cho mỗi GSI. Combined initial budget khi đó là 19 RCU + 21 WCU. Mọi table/GSI khác trong cùng Free Tier scope cũng phải được cộng vào budget; không giả định quota dành riêng cho application này.

Auto scaling mặc định **tắt** ở V1 để không vô tình provision vượt Free Tier. Chỉ bật khi đã có billing guardrail gồm AWS Budget/cost alert phù hợp, owner nhận cảnh báo và max-capacity được review rõ. Không đặt auto-scaling maximum vượt remaining 25/25 budget chỉ để tránh throttling.

CloudWatch phải theo dõi riêng base table và từng GSI qua `ConsumedReadCapacityUnits`, `ConsumedWriteCapacityUnits`, `ProvisionedReadCapacityUnits`, `ProvisionedWriteCapacityUnits`, `ReadThrottleEvents` và `WriteThrottleEvents`. Review định kỳ và sau traffic spike để right-size thủ công. Nếu metrics cho thấy burst/throttling lặp lại, traffic khó dự đoán hoặc tổng chi phí thực tế hợp lý hơn, có thể chuyển sang on-demand sau một cost/traffic review có ghi nhận; Free Tier không được coi là lý do giữ provisioned khi reliability không còn đạt yêu cầu.

AWS Free Tier/pricing có thể thay đổi theo thời điểm/account nên phải verify lại trước deploy. Chi phí V1 còn gồm table/index storage, transactional requests, backups/PITR, S3 storage/requests và CloudFront nếu dùng; provisioned capacity nằm trong 25/25 không đồng nghĩa toàn bộ stack miễn phí.

## Cost and Write Amplification

| Operation | Intentional writes |
| --- | --- |
| Like/unlike | 1 edge + 1 stats update |
| Bookmark/unbookmark | 1 direct lookup + 1 chronological edge |
| Share | 1 permanent idempotent event + 1 stats update |
| View | 1 TTL dedup + 1 total stats + 1 daily aggregate |
| Comment visibility transition | 1 source update + public edge put/delete + stats when count changes |
| Topic create/update/reorder | Topic META + catalog edge; reorder uses delete old edge + put new edge per changed Topic |
| Topic publication | 1 materialized summary per eligible topic/locale |
| Series membership/publication | forward + reverse source edges, plus eligible forward/reverse public locale edges |
| Published/admin index | GSI write when participating item/indexed attributes change |

Duplication được chấp nhận để AP02-AP07/AP20 dùng Query trực tiếp, đúng locale và paginate đúng. Không duplicate body, counters vào listing projections hoặc bookmark content. Admin summary edits có fan-out nhưng rất hiếm so với public reads.

## Hot Partition Risk

- `PUBLISHED#vi` và `PUBLISHED#en` tập trung GSI reads/writes, nhưng V1 traffic thấp nên chấp nhận. Chỉ review time/hash buckets khi metrics cho thấy throttling hoặc sustained high request rate.
- `POST#<popularPost>` tập trung stats, likes, comments và daily updates. Một viral post ở quy mô lớn có thể làm hot key; future options là sharded counters, buffered aggregation hoặc asynchronous stream, không implement V1.
- `VIEW_DEDUP#POST#id` cũng tập trung theo post. Có thể thêm digest shard vào PK khi traffic thực chứng minh cần.
- `CATALOG#TOPICS` là một partition chung nhưng Topic set V1 nhỏ, navigation reads bounded và writes rất hiếm; chỉ redesign nếu CloudWatch chứng minh hot-key risk.
- Topic/Series content partition chỉ nóng nếu một taxonomy/collection có traffic rất lớn; page-limited Query và small summaries giảm impact.

Không pre-shard ở V1 vì nó làm read/counter reconciliation và pagination phức tạp trước khi có nhu cầu.

## Backup and Recovery

- Production: bật PITR, deletion protection và S3 Versioning; cân nhắc scheduled/on-demand backup trước migration/destructive maintenance theo RPO/RTO sau này.
- Dev: isolated table, deletion protection off, PITR optional; seed data có thể tái tạo. Không restore/seed vào production ngoài controlled process.
- Backup/restore test phải xác nhận cả DynamoDB records và S3 body versions; backup một bên không tạo complete application recovery point.
- AWS owned key là đủ cho V1 low-ops; chuyển customer-managed KMS key chỉ khi có compliance, cross-account control hoặc key lifecycle requirement rõ ràng.

## Local and Environment Strategy

- Local: DynamoDB Local cho integration tests cần Query/transaction behavior; mocked repository cho unit tests. Test key builders/cursors/conditions bằng fixtures giống item catalog này.
- AWS dev: `aws-learning-journal-dev` và dev S3 bucket riêng, synthetic/non-sensitive data.
- Production: `aws-learning-journal-prod`, IAM role, backups và storage tách biệt.
- Local/dev tuyệt đối không trỏ production table. Table name/resource identifiers đi qua environment configuration, không hard-code trong domain model.

## Error and Retry Model

| Failure | Backend behavior |
| --- | --- |
| `ConditionalCheckFailedException` | Domain conflict/idempotent no-op/stale version; classify bằng operation context, không blind retry |
| `TransactionCanceledException` | Inspect cancellation reasons; conflict/condition không retry như transient, ambiguous/transient retry cùng idempotency inputs |
| Throttling | Exponential backoff với jitter, bounded attempts; preserve same key/condition |
| Transient AWS/network error | Retry SDK-standard backoff; với ambiguous write result, reuse idempotency key và verify primary source item |
| Validation/oversized item | Permanent developer/domain error; log safely, không retry |

Logs không chứa raw IP, JWT, signed URL hoặc full post/comment body. Metrics nên phân biệt conditional domain outcomes với service failures để không tạo false alarms.

## Recommended Implementation Order

1. Base table contract với provisioned capacity/billing guardrails, key builders, item discriminator và opaque cursor codec.
2. User bootstrap: Cognito/email sentinels và SC ACTIVE lookup.
3. Post META, PostTranslation body pointer, PostStats và exact-locale detail read.
4. Slug uniqueness cho Post/Topic/Series.
5. Topic catalog edge, AP21 Query và transactional create/update/reorder guard.
6. `GSI1_PUBLISHED`, publish/unpublish projection và AP02/AP20.
7. PostTopic source + Topic public locale edges.
8. Series source membership, uniqueness và two-way public locale edges; không implement deferred AP22 catalog.
9. Like transaction và reconciliation query.
10. Bookmark dual items và filtered pagination loop.
11. Comment source/public projection, moderation transitions và counter.
12. Share event và view dedup/daily counters.
13. `GSI2_POST_STATUS` và admin listing/read-before-write.
14. CloudWatch capacity/throttling metrics, backup/recovery tests và throttling/idempotency fault tests.
15. Revisit and finalize Practice, rồi mới implement provisional items.

## Final V1 Decisions

| Decision | Final choice |
| --- | --- |
| DynamoDB table count | 1 table per environment |
| Modeling | Single-table, access-pattern driven |
| Capacity | `PROVISIONED` Standard; prod 16 RCU/18 WCU total, prod + persistent dev 19 RCU/21 WCU initial budget |
| Primary keys | String `PK` + `SK`, `#` delimiter, 6-digit positions |
| GSIs | Exactly 2: published-by-locale and admin-post-status |
| Public Topic/Series/Comment reads | Materialized edge collections, no Scan/filter-heavy pagination |
| Topic catalog | `CATALOG#TOPICS` ordered materialized edges for AP21; no post-count field/counter in V1 |
| Series catalog | AP22 List Published Series deferred; no hypothetical GSI/catalog |
| Slug uniqueness | Primary-key sentinel + entity in conditional transaction |
| Cognito lookup | Direct `COGNITO#sub/USER` sentinel; no GSI |
| Bookmark | Direct lookup source + chronological materialized item in transaction |
| Counters | Synchronous transactions; no Streams in V1 |
| TTL | Only one-hour view dedup items |
| Content body | UTF-8 Markdown in versioned S3; pointer/metadata in DynamoDB |
| Pagination | Opaque LEK cursor; never offset |
| Consistency | EC public/index/stats reads; SC identity, user state and mutation checks |
| Backup | PITR + deletion protection for prod; S3 Versioning for bodies |

AP01-AP21 đều được map, không access pattern chính nào dùng `Scan`. AP22 được defer có chủ đích vì product/UI V1 chưa yêu cầu.

## Open Questions

Các core DynamoDB decisions không còn deferred. Những requirement chưa đủ để khóa schema/behavior:

- Practice retake/scoring/review semantics, question versioning và option translation normalization.
- Search/full-text search và SEO redirect history nếu sau này có localized slug.
- PostRevision retention, snapshot granularity và rollback audit policy.
- Exact media upload validation/retention và moderation product workflow beyond V1 states.
- Formal production RPO/RTO và audit retention duration.
- AP22 List Published Series: chỉ thiết kế khi UI/product chốt locale, sort order và pagination requirement.

## Non-goals

V1 không thêm OpenSearch, ElastiCache/Redis, RDS, Kinesis, Kafka, EventBridge architecture lớn, Step Functions, CQRS framework, event sourcing, DAX hoặc multi-region active-active. Những thành phần này chỉ được review khi access patterns, scale hoặc recovery requirement mới chứng minh nhu cầu.

## AWS References

- [DynamoDB Developer Guide](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Introduction.html)
- [DynamoDB constraints](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Constraints.html)
- [DynamoDB read consistency](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/HowItWorks.ReadConsistency.html)
- [DynamoDB TTL](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/TTL.html)
- [DynamoDB capacity modes](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/HowItWorks.BillingModes.html)
- [DynamoDB pricing and Free Tier](https://aws.amazon.com/dynamodb/pricing/)
- [DynamoDB provisioned capacity mode](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/provisioned-capacity-mode.html)
- [DynamoDB transaction constraints](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Constraints.html#limits-dynamodb-transactions)
- [Amazon S3 security best practices](https://docs.aws.amazon.com/AmazonS3/latest/userguide/security-best-practices.html)
- [Amazon S3 Versioning](https://docs.aws.amazon.com/AmazonS3/latest/userguide/Versioning.html)

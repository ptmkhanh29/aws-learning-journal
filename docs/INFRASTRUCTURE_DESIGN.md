# Infrastructure design V1

## Purpose and status

Tài liệu này là source of truth cho AWS infrastructure architecture V1 của AWS Learning Journal. Nó nối các contract ở tầng application với bước triển khai Terraform tiếp theo:

```text
DATA_MODEL + DYNAMODB_DESIGN + API_DESIGN
                    |
                    v
          INFRASTRUCTURE_DESIGN
                    |
                    v
             TERRAFORM_DESIGN
                    |
                    v
          Terraform implementation
```

Repository hiện vẫn là Next.js frontend prototype dùng mock data và mock authentication. Chưa có backend, Terraform state hay AWS resource nào được triển khai. Tài liệu này chốt target architecture, không phải bằng chứng runtime.

Ranh giới ownership:

- `DATA_MODEL.md` sở hữu business semantics và invariants.
- `DYNAMODB_DESIGN.md` sở hữu item mapping, keys, indexes, transaction và capacity allocation.
- `API_DESIGN.md` sở hữu HTTP routes, DTO, auth classes và error contract.
- Tài liệu này sở hữu deployment topology, service boundaries, security, operations và cost posture.
- `TERRAFORM_DESIGN.md` sở hữu layout, state và workflow dùng để biểu diễn kiến trúc bằng Terraform.

Mục tiêu là một study case production-like nhưng vẫn phù hợp với personal technical journal: serverless, ít fixed cost, có least-privilege boundary rõ và đủ cụ thể để bước Terraform không phải quyết định lại architecture.

## 1. Architecture overview

```text
Browser
  |
  +---- https://example.com/*
  |          |
  |       Route 53
  |          |
  |       CloudFront
  |          |
  |          +---- default, /_next/static/* ---> private frontend S3 bucket
  |          |
  |          +---- /media/* -----------------> private content/media S3 bucket
  |
  +---- https://api.example.com/api/v1/*
  |          |
  |       Route 53
  |          |
  |       API Gateway HTTP API
  |          |
  |       JWT Authorizer <-------------------- Cognito User Pool
  |          |                                      ^
  |          |                                      |
  |          |                                Google federation
  |          |
  |          +---- public-content Lambda -----+
  |          +---- user-profile Lambda -------+---- DynamoDB
  |          +---- interactions Lambda -------+
  |          +---- admin-content Lambda ------+---- private content/media S3
  |
  +---- https://auth.example.com/* ---------- Cognito Managed Login

API Gateway, Lambda, DynamoDB, CloudFront and S3
  +---- metrics/logs/alarms -----------------> CloudWatch
```

CloudFront là public entry point cho frontend và public media. API dùng Regional HTTP API ở một subdomain cùng registrable site, không đi qua application CloudFront distribution trong V1. Cách tách này giữ `SameSite=Lax` view-cookie contract của `API_DESIGN.md`, đồng thời tránh phải chuyển tiếp Authorization, cookies và mọi mutation method qua CloudFront khi V1 không cần edge API caching.

Backend có đúng bốn capability groups đã chốt trong `API_DESIGN.md`. Không có browser-to-DynamoDB, browser-to-S3 bằng AWS credentials, EC2, container, RDS, cache cluster hay private network trong request path.

## 2. Public entry point

### Route 53

Route 53 sở hữu public hosted zone và các record theo environment:

| Name | Target |
| --- | --- |
| `example.com` và optional `www.example.com` | Alias A/AAAA tới application CloudFront distribution |
| `api.example.com` | Alias tới API Gateway Regional custom domain |
| `auth.example.com` | Alias/CNAME tới Cognito custom-domain CloudFront target |
| ACM validation records | DNS validation cho certificate tương ứng |

Hosted zone có thể dùng chung ở account/domain level, nhưng application records vẫn do đúng environment root quản lý. Dev dùng subdomain riêng như `dev.example.com`, `api-dev.example.com` và `auth-dev.example.com`; không trỏ dev record vào prod resource.

### ACM

- Certificate cho CloudFront viewer và Cognito custom domain nằm ở `us-east-1`.
- Certificate cho API Gateway Regional custom domain nằm cùng Region với HTTP API.
- Certificate dùng DNS validation và được Terraform theo dõi, nhưng private key do ACM quản lý.

### CloudFront

Application distribution có hai S3 origins. Cả hai là S3 REST origins, không phải S3 website endpoints, nên có thể dùng Origin Access Control (OAC) và giữ bucket private.

| Behavior | Origin | Methods | Cache | Request policy |
| --- | --- | --- | --- | --- |
| Default `*` | Frontend S3 | `GET`, `HEAD`, `OPTIONS` | HTML ngắn; versioned assets dài | Không forward cookies/query không cần thiết |
| `/_next/static/*` | Frontend S3 | `GET`, `HEAD` | Aggressive, immutable artifact names | Tối thiểu |
| `/media/*` | Content/media S3 | `GET`, `HEAD`, `OPTIONS` | Aggressive cho versioned object keys | Chỉ CORS headers cần thiết |

Mọi behavior redirect HTTP sang HTTPS và bật compression. Một CloudFront Function nhỏ ở viewer-request xử lý contract của static export: `/` redirect sang `/en/`, còn extensionless/trailing-slash route được map tới object `index.html` tương ứng. Không dùng blanket 403/404 fallback về homepage vì cách đó che mất asset lỗi và biến URL không tồn tại thành `200` giả.

V1 không có `/api/*` behavior trên distribution này. Request flow được chốt rõ:

```text
https://example.com/*
    -> Route 53
    -> CloudFront
    -> private frontend/media S3 origin

https://api.example.com/api/v1/*
    -> Route 53
    -> API Gateway Regional HTTP API
    -> Lambda
```

Nếu một phase sau đưa API qua CloudFront, phase đó phải review lại cache policy, `Authorization`, query strings, cookies, `Host`, allowed methods, CORS và invalidation. Đây không phải một toggle mặc định của V1.

## 3. Frontend deployment

V1 deploy Next.js dưới dạng static export vào một private S3 frontend bucket, sau đó phân phối qua CloudFront.

Quyết định này dựa trên source hiện tại:

- App Router hiện có một tập route hữu hạn dưới `/en` và `/vi`.
- Locale routes đã có `generateStaticParams()`.
- Page data đến từ local TypeScript modules; không có request-time `cookies()`, `headers()`, Route Handlers, Server Actions hay server-side authentication.
- Client Components chỉ xử lý theme, navigation, filters, practice và mock auth qua browser state. Các component này vẫn hoạt động trong static export.
- Không có requirement hiện tại cần một always-on Next.js server.

Build chạy `next build` với target `output: "export"` và tạo immutable deployment artifact từ thư mục `out/`. Bước implementation frontend sau tài liệu này phải xử lý ba compatibility items đã thấy trong source, nhưng task hiện tại không sửa code:

1. Cấu hình static export và chọn trailing-slash convention thống nhất với CloudFront Function URI mapping.
2. Thay root Server Component redirect hiện tại bằng edge redirect hoặc một static-compatible entry.
3. Dùng `next/image` ở chế độ `unoptimized` cho các SVG/WebP đã tối ưu sẵn, hoặc cung cấp image loader riêng. V1 chọn `unoptimized` để không thêm một image service chỉ cho prototype assets.

Public content từ API có thể được fetch ở client. Với content detail routes theo canonical slug, build phải xuất danh sách route đã publish. Publish content mới vì vậy cần một frontend rebuild/deploy trước khi URL mới tồn tại. Đây là trade-off được chấp nhận cho V1 vì số lượng content và tần suất publish thấp. Nếu yêu cầu preview, publish tức thời, ISR hoặc request-time SEO trở thành quan trọng, chuyển frontend sang một Next.js runtime-capable hosting model là một architecture change có review, không ghép thêm Lambda vào bốn backend groups.

Frontend artifact deployment:

```text
source commit
  -> install + lint + typecheck + next build
  -> out/ artifact + digest
  -> upload immutable assets first
  -> upload HTML/manifests last
  -> targeted CloudFront invalidation for changed HTML only
  -> smoke test /en, /vi and one deep route
```

Static browser configuration như API base URL, Cognito User Pool ID, App Client ID, auth domain và supported locales được cung cấp tại build time. `NEXT_PUBLIC_*` values là public by definition; không đặt secret vào frontend environment hoặc artifact. Dev và prod được build riêng vì static values được baked vào output.

## 4. API Gateway

V1 dùng một Amazon API Gateway HTTP API cho mỗi environment với namespace `/api/v1`. Endpoint matrix, payloads và error contract giữ nguyên theo `API_DESIGN.md`; infrastructure không thêm hay đổi product endpoint.

Routes map theo capability owner, không theo một Lambda cho mỗi endpoint:

- Public Post/Topic/Series reads tới `public-content`.
- `/me` và lazy User bootstrap tới `user-profile`.
- Comments, likes, bookmarks, shares và views tới `interactions`.
- Admin content, taxonomy, series và upload presign tới `admin-content`.

Mỗi route dùng Lambda proxy integration. Gateway chịu trách nhiệm method/path routing, JWT authorizer attachment, CORS, stage throttling, access logs và request ID. Lambda chịu trách nhiệm validation, authorization sau authentication, business rules, DTO mapping và safe error envelope. Binary upload đi thẳng Browser -> S3 bằng presigned URL; không đi qua HTTP API.

CORS giữ đúng contract hiện tại:

- `allowCredentials=true` vì view dedup dùng first-party same-site cookie.
- Production chỉ cho exact frontend origins như `https://example.com` và `https://www.example.com` nếu `www` thực sự phục vụ app.
- Dev chỉ cho các origin được khai báo, ban đầu gồm `http://localhost:3000`.
- Methods: `GET`, `POST`, `PUT`, `PATCH`, `DELETE`, `OPTIONS`.
- Headers: `Authorization`, `Content-Type`, `Idempotency-Key`, `X-Correlation-Id`.
- `OPTIONS` không yêu cầu JWT.

Initial route throttles giữ các mức trong `API_DESIGN.md`: read routes rộng hơn, interaction writes hẹp hơn, admin mutations/uploads hẹp nhất. Đây là protection cho Lambda và provisioned DynamoDB, không phải entitlement cho client. API access logs ở dạng structured JSON, có request ID, route, status, integration latency và response length nhưng không ghi Authorization header, JWT, cookie hoặc request body.

## 5. Cognito authentication

Mỗi environment có Cognito User Pool, public browser App Client, Resource Server và Managed Login domain riêng. Production dùng `auth.example.com`; dev có thể bắt đầu bằng Cognito prefix domain rồi chuyển sang `auth-dev.example.com` khi cần kiểm chứng full DNS flow.

Browser dùng authorization code grant với PKCE. App Client không có client secret. Google là external identity provider theo contract hiện tại; callback/logout URLs là exact environment URLs.

```text
Browser -> Cognito Managed Login -> Google
Browser <- authorization code
Browser -> Cognito token endpoint with PKCE verifier
Browser <- ID Token + Access Token + Refresh Token
Browser -> API Gateway with Access Token
```

App Client cho phép đúng scope set đã chốt:

```text
openid
email
profile
aws.cognito.signin.user.admin
aws-learning-journal/access
```

Authentication và authorization là hai boundary khác nhau:

| Concern | Owner |
| --- | --- |
| Xác minh identity, federation, password/session lifecycle và token issuance | Cognito User Pool |
| Kiểm tra signature, issuer, audience/client ID, time claims và required API scope | API Gateway JWT Authorizer |
| Kiểm tra `token_use=access`, User mapping/status, `ADMIN` group và domain rules | Lambda/application |

Protected routes dùng Access Token và yêu cầu `aws-learning-journal/access`. ID Token chỉ phục vụ identity presentation, không phải API credential. Admin operation yêu cầu token hợp lệ, `cognito:groups` chứa `ADMIN` và strongly consistent DynamoDB read xác nhận `User.status=ACTIVE`.

Không tạo Cognito Identity Pool. Browser không cần temporary AWS credentials vì mọi privileged operation đi qua API; direct S3 upload dùng short-lived presigned URL do `admin-content` cấp.

## 6. Lambda architecture

V1 có đúng bốn independently deployable functions hoặc function packages:

| Group | Boundary | Lý do tách |
| --- | --- | --- |
| `public-content` | Public reads và S3 Markdown delivery | Read-only posture, traffic và cacheability khác mutation |
| `user-profile` | `/me`, Cognito-sub mapping, lazy bootstrap | Identity bootstrap cần quyền User/sentinel hẹp và Cognito token flow riêng |
| `interactions` | Comment, like, bookmark, share, view, counters | Write-heavy, idempotency và throttling profile riêng |
| `admin-content` | Content lifecycle, translations, taxonomy, series, upload presign | Privileged writes và S3 write authority cần blast radius riêng |

Một function cho mỗi route sẽ tạo 38 packages, roles, log groups và deployment units trước khi traffic chứng minh nhu cầu. Một lambdalith duy nhất lại trộn public read với admin write permissions. Bốn groups giữ deployment/IAM boundary rõ mà vẫn dễ vận hành cho một maintainer.

Mỗi group có artifact, memory, timeout, reserved concurrency và log group riêng. Timeout luôn được set, ngắn hơn HTTP API integration limit, và downstream SDK timeout ngắn hơn Lambda timeout. Provisioned concurrency không bật ở V1; occasional cold start được chấp nhận để tránh idle cost. Reserved concurrency chỉ thêm khi cần bảo vệ DynamoDB hoặc chặn một group chiếm hết regional concurrency.

Shared package có thể chứa validation, DTO, auth context, cursor, idempotency và logging. Group không gọi group khác synchronously. Một future async workflow chỉ được thêm khi có use case cần retry/fan-out thực sự.

## 7. DynamoDB

Physical schema không được lặp lại ở đây. `DYNAMODB_DESIGN.md` là source of truth cho `PK`/`SK`, item families, two GSIs, AP01-AP21, transactions và consistency.

Infrastructure contract:

| Setting | V1 choice |
| --- | --- |
| Table count | Một table riêng cho mỗi environment |
| Billing mode | DynamoDB Standard `PROVISIONED` |
| Production capacity | Base `8 RCU/6 WCU`; GSI1 `6/6`; GSI2 `2/6`; total `16 RCU/18 WCU` |
| Persistent dev capacity | `1 RCU/1 WCU` cho base và mỗi GSI |
| GSIs | Chính xác `GSI1_PUBLISHED` và `GSI2_POST_STATUS` |
| TTL | Number attribute `expiresAt`, chỉ cho ephemeral view/upload idempotency items |
| Encryption | DynamoDB encryption at rest với AWS owned key |
| Production protection | PITR và deletion protection bật |
| Development protection | Deletion protection tắt; PITR optional |

`PAY_PER_REQUEST` thường hợp lý cho workload khó dự đoán, nhưng không phải V1 choice của repository này. Physical design đã chọn provisioned capacity để giữ một workload nhỏ, ổn định trong budget đã review và để học capacity behavior của base table cùng GSIs. Auto scaling mặc định tắt. Chuyển sang on-demand chỉ sau khi CloudWatch cho thấy burst/throttling lặp lại hoặc cost/reliability thực tế tốt hơn; infrastructure document không override capacity owner.

Terraform tạo table, key schema, exactly two GSIs, TTL setting, capacity, encryption, PITR, deletion protection, tags và alarms. Terraform không tạo Post, User, Topic, counters hay seed data.

Backup/recovery của production gồm PITR và S3 Versioning. Restore DynamoDB tạo table mới, chạy consistency/smoke checks, rồi cập nhật same-environment configuration có review; không restore đè mù vào active table. Trước migration hoặc destructive maintenance, tạo on-demand backup khi RPO/RTO review yêu cầu. Một recovery point hoàn chỉnh phải xét cả DynamoDB pointers và S3 object versions.

## 8. S3

Mỗi deployed environment dùng các private buckets có lifecycle khác nhau:

| Bucket role | Data | Access path |
| --- | --- | --- |
| Frontend artifact | `out/` HTML, JS, CSS, fonts và static images | CloudFront OAC read only; deployment role write |
| Content/media | Markdown bodies, covers, inline media, topic/series assets, avatars, attachments | Lambda read/write theo prefix; CloudFront OAC chỉ đọc publishable media |
| Access logs | Production CloudFront standard access logs | Log delivery write; operator/read-only audit access |

Tách frontend và content bucket tránh một frontend deploy xóa nhầm durable content. Log bucket tách riêng để bucket policy và retention không trộn với application objects. Dev có thể không tạo access-log bucket nếu CloudFront dev distribution chưa được bật.

High-level key convention:

```text
frontend:       <deployment files exactly as emitted by out/>
post body:      content/posts/<postId>/<locale>/body.md
post media:     media/posts/<postId>/<kind>/<assetId>.<ext>
topic media:    media/topics/<topicId>/icon/<assetId>.<ext>
series media:   media/series/<seriesId>/cover/<assetId>.<ext>
user avatar:    media/users/<userId>/avatar.<ext>
attachment:     media/posts/<postId>/attachments/<assetId>/<filename>
```

Controls áp dụng cho mọi bucket:

- Block Public Access bật đầy đủ; Object Ownership là Bucket owner enforced.
- Bucket policy deny non-TLS requests.
- SSE-S3 là baseline V1; dùng customer-managed KMS khi compliance, cross-account control hoặc key lifecycle yêu cầu.
- CloudFront OAC luôn ký request và bucket policy scope theo exact distribution ARN/account.
- Production content bucket bật Versioning. Frontend artifact bucket không dùng versioning làm release mechanism; artifact digest và deployment history sở hữu rollback.
- Lifecycle chỉ xóa incomplete multipart uploads, expired frontend releases và log objects theo retention đã chốt. Không archive content sang Glacier khi chưa có access/retention evidence.

S3 upload CORS chỉ áp dụng content/media bucket, exact frontend origins, `PUT`/`HEAD` và exact signed headers. Presigned URL thừa hưởng permission của `admin-content`, có expiry ngắn và key do backend derive. Bucket không public vì có CORS.

## 9. IAM design

Mỗi Lambda group có execution role riêng. Trust policy chỉ cho `lambda.amazonaws.com` assume role; permissions tách theo purpose và scope vào same-environment resources. Deployment roles tách khỏi runtime roles.

| Principal | DynamoDB | S3 | Other |
| --- | --- | --- | --- |
| `public-content` | `GetItem`, `BatchGetItem`, `Query` trên table/GSI1 | `GetObject` trên publishable content/media prefixes | Exact config parameters, own logs |
| `user-profile` | SC reads và bounded conditional/transaction writes cho User/sentinels | Không có | Own logs; Cognito `GetUser` dùng caller Access Token, không cần admin IAM API |
| `interactions` | Reads và conditional/transaction writes cho interaction/idempotency/counter paths | Không có write | Exact signing parameters, own logs |
| `admin-content` | Source/projection reads, GSI2 Query và bounded content transactions | `GetObject`, metadata validation và `PutObject` trên owned prefixes | Exact config/secrets, own logs |
| Frontend deploy role | Không có | Write/delete chỉ frontend artifact bucket | CloudFront invalidation cho exact distribution |

Không role nào dùng cặp `Action: "*"`, `Resource: "*"`. Table permissions scope vào table ARN và index ARN cần thiết; S3 permissions scope bucket plus prefixes. `dynamodb:LeadingKeys` được dùng khi key family ổn định và operation hỗ trợ, nhưng application validation/conditions vẫn bắt buộc vì IAM không thể biểu diễn toàn bộ single-table entity invariants.

Resource policies:

- Lambda invoke permission scope theo exact API execution ARN và environment.
- OAC bucket allow dùng CloudFront service principal với exact distribution `AWS:SourceArn` và `AWS:SourceAccount` khi supported.
- Log delivery chỉ ghi vào exact log prefix.
- Terraform apply role chỉ có control-plane actions cần cho managed resources và `iam:PassRole` trên exact application roles/path, không pass arbitrary account roles.

## 10. VPC decision

Lambda chạy ngoài VPC trong V1.

Backend chỉ gọi DynamoDB, S3, Cognito và AWS control/data endpoints managed. Không có RDS, ElastiCache, private ALB, EC2 service, EFS mount hoặc private on-premises dependency. Đưa Lambda vào VPC không làm các public managed endpoints tự động private hơn; nó thêm subnet, security group, ENI path và thường buộc phải quyết định NAT Gateway hoặc VPC endpoints.

Không dùng VPC giúp:

- tránh NAT Gateway fixed cost và data-processing cost;
- giảm networking resources và failure modes;
- giữ cold-start/network path đơn giản;
- tránh vận hành route table, endpoint policies và IP capacity khi không có private target.

VPC chỉ được thêm khi một dependency thật sự yêu cầu private connectivity, chẳng hạn RDS/ElastiCache, private service, EFS, corporate network qua VPN/Direct Connect hoặc egress inspection bắt buộc. Khi đó phải review subnet/AZ design, endpoints, DNS, security groups, NAT requirement, cost và deployment impact trước khi attach Lambda.

## 11. Observability

V1 dùng native service metrics cùng structured CloudWatch logs. Không dựng OpenTelemetry collector, SIEM, tracing platform hay high-cardinality custom metric layer.

| Surface | Baseline |
| --- | --- |
| Lambda | Invocations, error rate, Duration p99, Throttles, ConcurrentExecutions; structured JSON logs |
| API Gateway | Count, `4XX`, `5XX`, Latency, IntegrationLatency; structured access logs |
| DynamoDB | Consumed/provisioned read/write capacity, read/write throttle events, system errors cho table và từng GSI |
| CloudFront | Requests, `4xxErrorRate`, `5xxErrorRate`, origin latency; production standard access logs |
| S3 | Request/error visibility khi cần; CloudTrail management events, scoped data events sau cost/security review |
| Cognito | Control-plane audit qua CloudTrail; auth error/throttle visibility theo feature availability |

Log groups được Terraform tạo trước với retention 7 ngày ở dev và 30 ngày ở prod. Log data không chứa JWT, Authorization header, cookies, presigned query strings, raw HMAC values, full body/comment content hoặc secret. API Gateway request ID được propagate vào Lambda log và safe error response.

Production alarm set ban đầu:

- Lambda error rate và Throttles theo group.
- API Gateway sustained `5XX`; `4XX` được dashboard trước để tránh auth/input noise.
- DynamoDB `ReadThrottleEvents` và `WriteThrottleEvents` cho base table và GSIs.
- CloudFront sustained abnormal `5xxErrorRate`, tách khỏi expected viewer `4xx`.
- Optional S3 missing-object signal từ application error metric nếu lỗi này lặp lại.

Alarms dùng M-of-N evaluation và khai báo `treatMissingData` rõ. Error-count metrics coi missing là not breaching; heartbeat mới coi missing là breaching. Threshold cuối cùng được tune bằng dev/load evidence, không copy một con số enterprise vào workload nhỏ.

## 12. Environment strategy

V1 có `dev` và `prod`; không dùng chung application data hoặc identity resources.

Naming convention:

```text
<application>-<resource>-<environment>

aws-learning-journal-api-dev
aws-learning-journal-public-content-prod
aws-learning-journal-frontend-dev
aws-learning-journal-content-prod
```

Minimum tags: `Application=aws-learning-journal`, `Environment=dev|prod`, `ManagedBy=Terraform`.

| Resource | Isolation |
| --- | --- |
| DynamoDB, content/frontend S3, Lambda, API Gateway, Cognito, log groups, config/secrets | Tách hoàn toàn dev/prod |
| CloudFront | Prod luôn có; dev chỉ tạo khi cần AWS edge integration test và dùng distribution riêng |
| Route 53 public hosted zone | Có thể dùng chung vì thuộc domain, nhưng records có owner/environment rõ |
| ACM | Certificate/SAN theo domain/environment; không share private material thủ công |
| Terraform state và apply role | Tách key/root/permissions; prod có approval gate |

Dev dùng synthetic/non-sensitive data và không được trỏ vào prod table/bucket/User Pool. Local development dùng mock repository hoặc DynamoDB Local theo contract hiện tại, không lấy production identifiers làm default.

## 13. Configuration and secrets

| Class | Examples | Destination |
| --- | --- | --- |
| Public/static frontend config | API base URL, User Pool ID, App Client ID, auth domain, locale list | Build-time environment, baked vào static artifact |
| Non-secret Lambda config | Region, table/bucket names, log level, limits | Lambda environment variables từ Terraform outputs |
| Sensitive values | Google OAuth client secret, cursor/view HMAC keys | SSM Parameter Store Standard `SecureString` |

V1 không có database password, private API key hoặc AWS access key trong application. Secrets Manager chưa cần vì current secrets nhỏ, low-rotation và không có managed rotation integration. Chuyển một secret sang Secrets Manager khi automatic rotation, richer lifecycle, cross-service integration hoặc audit requirement chứng minh giá trị.

Runtime role chỉ đọc exact parameter ARNs cần thiết. Không đặt secret vào frontend variables, committed `.tfvars`, Terraform source, Lambda source, build logs hoặc error responses. `sensitive=true` chỉ che CLI output, không tự xóa plaintext khỏi Terraform state; Google provider binding giữ boundary out-of-band đã mô tả trong `TERRAFORM_DESIGN.md`.

## 14. Security baseline

- HTTPS only ở frontend, API, auth domain và service-to-service calls.
- CloudFront redirect HTTP sang HTTPS và gắn response headers policy cho HSTS, content type, framing và referrer controls; CSP được tune theo exact frontend dependencies.
- S3 Block Public Access, Bucket owner enforced, TLS-only bucket policy, encryption at rest và OAC.
- Cognito public client không có secret; authorization code with PKCE, exact callback URLs, `state` và OIDC `nonce`.
- API Gateway JWT authorizer xác thực Access Token/scope; Lambda kiểm tra `token_use`, group, current User status và resource-level authorization.
- One runtime role per Lambda group, scoped deployment roles và no broad `iam:PassRole`.
- Không hard-code hay phát hành long-lived AWS credentials. CI sau này dùng OIDC/assumed role.
- API/Lambda/CloudFront logs có retention và access control; sensitive headers/body không được log.
- Prod DynamoDB có PITR/deletion protection; content S3 có Versioning; Terraform state dùng private encrypted backend với locking và restricted roles.

AWS WAF không nằm trong V1 vì hiện chưa có abuse, compliance hoặc public-launch risk yêu cầu fixed rule cost/operations. Shield Standard là baseline AWS-provided cho eligible resources. WAF hoặc Shield Advanced chỉ được thêm sau một threat/cost review cụ thể.

## 15. Cost awareness

| Service | Charging model | Low-traffic impact | Cost concern |
| --- | --- | --- | --- |
| Route 53 | Hosted-zone recurring charge, domain registration/renewal, DNS queries | Có minimum recurring cost dù app ít traffic | Nhiều hosted zones, health checks và domain renewals |
| ACM | Public certificates dùng với integrated AWS services không tạo application compute charge | Thấp | Certificate sai Region tạo rework; imported/private CA có cost model khác |
| CloudFront | Requests, data transfer, functions, invalidations/log delivery theo usage | Thấp khi traffic thấp, không cần always-on server | Cache misses, large transfer, broad invalidations, verbose logs |
| API Gateway HTTP API | Requests và data transfer theo usage | Gần như usage-based | Retry storm, public abuse, payload size |
| Lambda | Invocations, duration, memory và optional concurrency features | Gần như usage-based khi không có provisioned concurrency | Slow functions, excessive logs, provisioned concurrency idle cost |
| DynamoDB | Provisioned RCU/WCU, storage, backups và transactional work | Capacity là committed baseline; storage/PITR vẫn tính riêng | Base + GSI capacity, hot keys, write amplification, PITR |
| S3 | Storage, requests, lifecycle transitions/retrieval và transfer | Không có server idle cost | Old frontend releases, versions, logs, incomplete uploads |
| Cognito | Active users và optional feature plans | Thấp với ít active users | Paid threat protection, M2M and messaging-related features |
| CloudWatch | Log ingestion/storage, custom metrics, alarms, dashboards | Có thể tăng dù traffic nhỏ nếu log quá nhiều | Unlimited retention, high-cardinality metrics, noisy access logs |
| SSM Parameter Store | Tier/API usage theo selected parameter features | Standard low-volume use phù hợp V1 | Advanced parameters hoặc high API volume |

Fixed/minimum recurring cost chính của V1 là Route 53 hosted zone/domain và provisioned DynamoDB capacity ngoài mọi account-specific credit/Free Tier. Phần còn lại chủ yếu tăng theo requests, storage, transfer, logs hoặc enabled features.

V1 tránh NAT Gateway, always-on EC2, always-on RDS, ALB, cache cluster, provisioned Lambda concurrency, multi-Region replicas và paid edge security subscription vì không có requirement tương ứng. AWS pricing và Free Tier thay đổi theo Region, payer account và thời điểm; verify lại ngay trước Terraform implementation. Thiết kế này cost-conscious, không cam kết free.

## 16. Failure scenarios

| Failure | Architecture behavior |
| --- | --- |
| Lambda error/timeout | Chỉ capability group tương ứng bị ảnh hưởng; HTTP API trả safe error/5xx, request ID nối access log với Lambda log |
| Lambda throttle | Gateway nhận integration failure/429 path; client bounded retry với jitter; reserved concurrency được review nếu một group gây starvation |
| DynamoDB throttle/service issue | SDK bounded retry; writes giữ cùng idempotency key/conditions; backend fail closed thay vì partial emulation |
| Broken backend deployment | Versioned Lambda artifact/hash cho phép rollback; smoke test `/api/v1/health` và representative routes trước khi coi deploy thành công |
| Broken frontend deployment | Upload assets trước HTML, giữ previous artifact manifest, rollback bằng previous artifact; targeted invalidation sau restore |
| CloudFront stale cache | Versioned asset names tránh stale JS/CSS; HTML TTL ngắn và targeted invalidation khi cần |
| S3 object missing | Frontend asset trả real 404; missing Markdown/media thành safe API/UI error, không fallback sang unrelated object |
| Cognito unavailable/token invalid | Public content vẫn đọc được; login/refresh/protected routes fail; invalid token trả 401, authorization failure trả 403 |

V1 không thêm active-active Region hoặc custom disaster-recovery control plane. Managed service resilience cộng với PITR, Versioning và artifact rollback là đủ cho current RPO/RTO chưa formalize.

## 17. Deployment flow

Dependency order V1:

```text
Terraform state bootstrap and apply roles
    -> Route 53 hosted-zone ownership + ACM certificates/validation
    -> DynamoDB + S3 buckets + log groups
    -> IAM runtime roles + Lambda artifacts/functions
    -> Cognito User Pool, Resource Server, App Client and domain
    -> API Gateway routes, integrations, JWT authorizer and access logs
    -> frontend static build with environment outputs
    -> frontend artifact upload
    -> CloudFront OAC, origins, behaviors and function
    -> Route 53 frontend/API/auth records
    -> smoke tests + alarms/budget verification
```

Một số resources có thể được Terraform graph tạo song song, nhưng operational rollout giữ các gates trên. Lambda artifact được build/test bên ngoài Terraform và referenced bằng immutable digest. Frontend cũng được build ngoài Terraform; Terraform sở hữu bucket/distribution/policies, deployment workflow sở hữu artifact bytes.

Prod dùng reviewed saved plan, protected environment approval và same artifact promotion khi có thể. Không dùng casual `-auto-approve`, không rebuild secret-dependent bytes trong `terraform apply`, và không coi resource creation thành đủ nếu end-to-end smoke test chưa chạy.

## 18. Terraform implementation boundary

Terraform dự kiến quản lý:

- Route 53 records và public hosted-zone ownership đã chốt.
- ACM certificates và DNS validation.
- CloudFront distributions, origins, OAC, cache/origin/response policies, CloudFront Function association và optional access-log destination.
- Frontend, content/media và production access-log S3 buckets, policies, encryption, versioning/lifecycle settings.
- API Gateway HTTP APIs, stages, routes, integrations, CORS, JWT authorizer, throttles và access logs.
- Cognito User Pools, Resource Servers, public App Clients, domains, groups và non-secret Google provider contract.
- Four Lambda functions, versions/configuration, permissions, explicit log groups và runtime IAM roles.
- DynamoDB tables, exactly two GSIs, provisioned capacity, TTL, encryption, PITR and deletion protection.
- SSM parameter metadata/ARN boundaries, CloudWatch alarms/dashboard và AWS Budget notifications theo `TERRAFORM_DESIGN.md`.

Terraform không quản lý:

- DynamoDB application/runtime items, users, content, counters hoặc seed data.
- Cognito end users, passwords, sessions hoặc social identities.
- Secret plaintext; Google binding dùng controlled post-apply boundary hiện đã document.
- Frontend `out/` bytes, Lambda compiled ZIP contents hoặc local build artifacts. Terraform chỉ nhận artifact identity/hash khi contract yêu cầu.
- Uploaded Markdown/media objects và manually generated local artifacts.
- Runtime cache entries, log events hoặc CloudWatch metric data.

## 19. Architecture decisions

| Decision | Choice | Reason |
| --- | --- | --- |
| Backend style | API Gateway HTTP API + Lambda | Đủ routing/JWT/CORS cho 38 routes, ít config/cost hơn REST API features không dùng |
| Lambda boundary | Four capability groups | Cân bằng least privilege, deployability và maintenance; tránh 38 micro-functions lẫn one broad lambdalith |
| Frontend hosting | Next.js static export -> private S3 -> CloudFront | Source hiện static/mock và không cần request-time server; tránh always-on runtime |
| Public entry | CloudFront cho frontend/media; Regional API subdomain direct | Giữ same-site auth/view cookie nhưng không thêm edge API forwarding/caching complexity |
| Database model | One DynamoDB single table per environment | Giữ physical access-pattern design đã chốt, không tạo table-per-entity |
| DynamoDB billing | `PROVISIONED`, prod total `16 RCU/18 WCU` | Giữ reviewed Free Tier-oriented capacity contract; đổi mode chỉ từ metrics/cost evidence |
| Object storage | Separate private frontend and content/media S3 buckets | Tách deployment lifecycle khỏi durable content, vẫn không có public bucket |
| Browser AWS access | No Identity Pool; presigned upload only | Browser không cần general AWS credentials; upload authority bị giới hạn theo request/key |
| Network | Lambda outside VPC | Không có private dependency; tránh NAT, ENI và routing cost/complexity |
| Environments | Isolated dev/prod data, identity, state and roles | Ngăn test/misconfiguration ảnh hưởng production; giữ plan/apply boundary rõ |
| Secrets | SSM Standard SecureString by default | Phù hợp small low-rotation secrets; không trả Secrets Manager cost/complexity khi chưa cần rotation |
| Security additions | WAF/Shield Advanced deferred | Chưa có threat/compliance requirement đủ để thêm paid operational surface |

## Assumptions and next step

Các assumption bắt buộc để chốt V1:

- Content volume và publish frequency vẫn nhỏ, nên rebuild static routes khi có slug mới là chấp nhận được.
- Public application dùng một registrable domain; frontend, API và auth nằm trên các host cùng site.
- Một primary AWS Region đủ cho V1; formal RPO/RTO và multi-Region chưa được yêu cầu.
- Current four Lambda groups và 38 API routes vẫn là frozen V1 application contract.
- DynamoDB provisioned capacity decision trong `DYNAMODB_DESIGN.md` có ưu tiên cao hơn generic on-demand default.

Bước tiếp theo là tạo Terraform infrastructure skeleton/foundation theo `TERRAFORM_DESIGN.md`: bootstrap remote state, provider/version constraints, coarse application module và isolated `dev`/`prod` roots. Bước đó chưa được thực hiện trong task này.

## Authoritative references

- [Next.js static export guide](https://nextjs.org/docs/app/guides/static-exports)
- [Route 53 alias to CloudFront](https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/routing-to-cloudfront-distribution.html)
- [CloudFront OAC for private S3 origins](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/private-content-restricting-access-to-s3.html)
- [CloudFront managed cache policies](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/using-managed-cache-policies.html)
- [CloudFront certificate requirements](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/cnames-and-https-requirements.html)
- [API Gateway HTTP APIs](https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api.html)
- [HTTP API JWT authorizers](https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api-jwt-authorizer.html)
- [HTTP API CORS](https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api-cors.html)
- [Cognito app clients and OAuth grants](https://docs.aws.amazon.com/cognito/latest/developerguide/user-pool-settings-client-apps.html)
- [S3 security best practices](https://docs.aws.amazon.com/AmazonS3/latest/userguide/security-best-practices.html)
- [DynamoDB point-in-time recovery](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Point-in-time-recovery.html)
- [AWS IAM best practices](https://docs.aws.amazon.com/IAM/latest/UserGuide/best-practices.html)

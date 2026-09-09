# Terraform design V1

## Purpose and status

Tài liệu này định nghĩa cách target architecture trong `AWS_ARCHITECTURE.md` sẽ được biểu diễn, kiểm tra và deploy bằng Terraform. Nó tập trung vào repository layout, state, environment isolation, variables/outputs, ownership, secrets và workflow; không lặp lại business, persistence hay HTTP contract.

Đây là design contract trước implementation. Chưa có Terraform configuration, state backend, CI workflow hay AWS resource nào được tạo trong phase này.

## Why Terraform

Terraform phù hợp với mục tiêu học AWS/DevOps của project vì:

- Infrastructure được mô hình hóa rõ bằng resource graph và provider schema.
- `plan` tạo infrastructure diff có thể review trước khi thay đổi AWS.
- `validate`, state và import tạo workflow IaC nhất quán từ local đến CI.
- HashiCorp AWS provider có phạm vi resource rộng và documentation trưởng thành.
- HCL/Terraform là kỹ năng IaC có thể mang sang project/cloud workflow khác.

AWS CDK cũng là lựa chọn tốt, đặc biệt cho team muốn dùng ngôn ngữ ứng dụng và construct ecosystem. V1 chọn Terraform vì explicit plan/apply workflow và learning goal của repository, không phải vì CDK không phù hợp.

## Chosen repository structure

V1 chọn **hai environment root độc lập và một coarse-grained application module**. Không tạo module riêng cho từng Lambda, IAM policy hay AWS service.

```text
infra/
└── terraform/
    ├── bootstrap/
    │   ├── versions.tf
    │   ├── providers.tf
    │   ├── backend.tf
    │   ├── state.tf
    │   ├── budget.tf
    │   ├── variables.tf
    │   ├── outputs.tf
    │   └── terraform.tfvars.example
    ├── modules/
    │   └── application/
    │       ├── versions.tf
    │       ├── variables.tf
    │       ├── locals.tf
    │       ├── dynamodb.tf
    │       ├── s3.tf
    │       ├── cognito.tf
    │       ├── lambda.tf
    │       ├── api_gateway.tf
    │       ├── iam.tf
    │       ├── monitoring.tf
    │       ├── cloudfront.tf
    │       ├── acm.tf
    │       ├── route53_records.tf
    │       └── outputs.tf
    └── environments/
        ├── dev/
        │   ├── versions.tf
        │   ├── providers.tf
        │   ├── backend.tf
        │   ├── backend.hcl.example
        │   ├── variables.tf
        │   ├── main.tf
        │   ├── outputs.tf
        │   └── terraform.tfvars.example
        └── prod/
            ├── versions.tf
            ├── providers.tf
            ├── backend.tf
            ├── backend.hcl.example
            ├── variables.tf
            ├── main.tf
            ├── route53_zone.tf
            ├── outputs.tf
            └── terraform.tfvars.example
```

Why this is the smallest justified module boundary:

- `dev` and `prod` must be separate Terraform roots/state, not workspace variants.
- The application resources are structurally the same, so copying all service resources twice would immediately create drift.
- One application module keeps service files flat and easy to navigate. It does not introduce service-level nesting or generic abstractions.
- `bootstrap` has a different account-foundation lifecycle and owns only remote-state infrastructure plus the account cost budget required before the first persistent environment.

Do not add child modules under `application/` until actual duplication, independent ownership or reuse appears. File boundaries organize one resource graph; they are not deployment boundaries.

## Terraform and provider version policy

Proposed V1 baseline, verified against official Terraform/Registry pages on 2026-09-09:

| Component | Constraint | Reason |
| --- | --- | --- |
| Terraform CLI | `~> 1.16.0` | Pin the selected minor line while accepting compatible patch/security fixes; includes current S3 lockfile-era behavior |
| AWS provider | `hashicorp/aws ~> 6.60` | Pin the selected provider minor line instead of silently adopting future schema-breaking minors/major versions |

Each environment root commits `.terraform.lock.hcl`, which records exact resolved provider checksums. Dev and prod lock files should resolve to the same version; an intentional provider upgrade updates both in one reviewed change. Do not use unbounded `>=` or `latest` constraints.

Before Phase 0 implementation, recheck supported Terraform and AWS provider releases, changelogs and resource schemas. If the verified baseline changes, update this document and both roots together rather than silently changing constraints during apply.

The primary `hashicorp/aws` provider takes `aws_region` from environment configuration. A second aliased provider targets `us-east-1` for CloudFront and Cognito custom-domain ACM certificates:

```text
aws                 -> application Region
aws.us_east_1       -> us-east-1 certificate resources
```

The root passes both providers explicitly to the application module, whose `required_providers` declaration lists the `aws.us_east_1` configuration alias. API Gateway's Regional custom-domain certificate remains on the primary provider because it must be in the same Region as the HTTP API. No provider contains hard-coded access keys.

## State strategy

Terraform state can contain resource IDs, configuration and sensitive values. It is operationally sensitive even when every resource is low cost.

### Backend decision

Persistent roots use the native Terraform **S3 backend with S3 lockfiles**:

```text
backend = S3
encryption = enabled
use_lockfile = true
DynamoDB lock table = not used
```

Current HashiCorp S3 backend documentation supports opt-in locking with `use_lockfile = true` and marks DynamoDB-based locking deprecated. V1 therefore does not create a DynamoDB lock table just for Terraform. Reverify this backend behavior and the selected CLI version before implementation.

Backend configuration is partial because Terraform backend blocks cannot use ordinary input variables. Each root initializes with its reviewed `backend.hcl` derived from a safe committed `.example`; credentials are never placed in backend config.

### State layout and access

Bootstrap creates one globally unique, dedicated state bucket, for example:

```text
aws-learning-journal-tfstate-<account-id>-<region>
```

Exact state objects are separate:

```text
bootstrap/terraform.tfstate
environments/dev/terraform.tfstate
environments/prod/terraform.tfstate
```

Each state has its adjacent `.tflock` object. Isolation is enforced with exact key/prefix IAM:

- Dev role can read/write only the dev state and lock object.
- Prod role can read/write only the prod state and lock object.
- Bootstrap role can access only bootstrap state plus state-bucket administration required by that root.
- `s3:DeleteObject` is granted for the relevant lock object, not for ordinary state deletion.

State bucket controls:

- All S3 Block Public Access settings enabled.
- Bucket owner enforced; ACLs disabled.
- Versioning enabled for recovery from accidental state overwrite/deletion.
- Server-side encryption and TLS-only bucket policy.
- Restricted bucket/list/object permissions; no public or application-runtime access.
- Optional access logging/CloudTrail data events only after their security value and extra cost are reviewed.
- No lifecycle rule that expires current state. Noncurrent-version retention may be bounded only after a recovery policy is defined.

Never commit `terraform.tfstate`, state backups, crash logs, generated plan files or a populated backend file containing machine/account-specific sensitive data. `.terraform/` is ignored; `.terraform.lock.hcl` is committed.

## State bootstrap

The state backend cannot be used before its bucket exists. `bootstrap/` is intentionally minimal:

1. Initialize bootstrap with local state on a trusted developer machine.
2. Plan/apply only the hardened state bucket, its access controls and the account-level cost budget/notifications.
3. Configure the bootstrap S3 backend and run an explicit state migration to `bootstrap/terraform.tfstate`.
4. Verify bucket versioning, encryption, public-access block, IAM and lock acquisition.
5. Initialize `dev` and later `prod` against their exact backend keys.

Bootstrap does not create application tables, Lambdas, APIs, DNS or general IAM abstractions. The budget is included here because it is an account-level prerequisite rather than an environment workload. Its state bucket is not destroyed as part of normal environment teardown; recovery/removal is a separately reviewed operation.

## Dev/prod isolation

V1 does not rely on Terraform workspaces. Commands always run from either `environments/dev` or `environments/prod`, each with its own backend key, variable file and apply role.

| Boundary | Dev | Prod |
| --- | --- | --- |
| State | `environments/dev/terraform.tfstate` | `environments/prod/terraform.tfstate` |
| AWS role | Dev plan/apply role | Separate protected prod plan/apply role |
| Names/tags | `*-dev`, `Environment=dev` | `*-prod`, `Environment=prod` |
| Data protection | Tear-down friendly; PITR optional | DynamoDB deletion protection/PITR and S3 Versioning |
| Apply gate | Developer-approved after plan | Reviewed saved plan plus manual environment approval |

The same AWS account may host both environments in V1, but policies use exact environment ARNs and state keys. A dev Lambda cannot read prod data; a dev CI job cannot assume the prod apply role. Separate accounts may be adopted later without changing application semantics.

The production root owns the shared Route 53 public hosted zone because it is not duplicated per environment. Dev receives the hosted-zone ID as a non-secret root input and owns only its dev DNS records. Bootstrap owns the account-level AWS Budget so the guardrail exists before dev. These exceptions are explicit so ownership is not split between states.

## Variables

Variables describe environment differences, not arbitrary customization.

| Category | Examples | Policy |
| --- | --- | --- |
| Identity | `app_name`, `environment`, `aws_region` | Typed, validated; `environment` accepts only `dev` or `prod` |
| Domains | apex domain, API/auth subdomains, hosted-zone ID | Non-secret; production values explicit |
| Frontend/auth | exact allowed frontend origins, Cognito callback/logout URLs | Lists with HTTPS validation except loopback dev URLs |
| DynamoDB | one capacity object for base/GSI RCU/WCU | Defaults match `DYNAMODB_DESIGN.md`; aggregate validation remains below `25 RCU / 25 WCU` for V1 |
| Lambda | artifact locations/hashes, memory, timeout, optional reserved concurrency | Small explicit defaults; no provisioned concurrency by default |
| Logging | dev/prod retention days, log level | Default `7` dev, `30` prod; no unlimited retention |
| Storage | bucket/key prefix policy, upload size/content types | Backend-controlled; no public bucket switch |
| Feature boundary | enable custom domains after real DNS values exist | No flag may change business/API semantics |

The capacity object begins with:

| Target | RCU | WCU |
| --- | ---: | ---: |
| Base table | 8 | 6 |
| `GSI1_PUBLISHED` | 6 | 6 |
| `GSI2_POST_STATUS` | 2 | 6 |
| **Total** | **16** | **18** |

Implement validation/checks so a normal V1 plan cannot raise either aggregate above 24 without a deliberate architecture/billing-guardrail change. DynamoDB auto scaling is off by default.

Each environment includes `terraform.tfvars.example` with safe placeholders only, for example fake domains, Region and callback URLs. Real non-secret environment values may be supplied through a non-secret reviewed variable file or CI environment. Secret values never appear in committed examples or real committed `tfvars`.

## Outputs

Root outputs provide deployment integration values, not an inventory dump:

- API endpoint/custom-domain URL.
- Cognito User Pool ID and public App Client ID.
- Cognito issuer/managed-login domain.
- S3 content/media bucket name and CloudFront delivery domain.
- DynamoDB table name.
- CloudFront distribution ID/domain.
- Environment/frontend configuration object containing only public values.

Do not output Google OAuth secret, HMAC/signing values, presigned URLs, provider credentials or state-bucket contents. `sensitive = true` only redacts normal CLI/UI display; it does not remove a value from state. Therefore avoid secret outputs rather than relying on the flag.

## Naming and tags

Application resources use:

```text
aws-learning-journal-<resource>-<env>
```

S3/global names add account/Region uniqueness only where required. Shared locals define:

```text
name_prefix = aws-learning-journal
environment = dev | prod
name         = <name_prefix>-<resource>-<environment>
```

Common tags:

| Tag | Value |
| --- | --- |
| `Application` | `aws-learning-journal` |
| `Environment` | `dev` or `prod` |
| `ManagedBy` | `Terraform` |
| `Owner` | `khanh`, only if the AWS account convention uses an owner tag |

Names are derived in locals rather than independently typed for each resource.

## Terraform resource ownership

| Resource family | Terraform owner | Notes |
| --- | --- | --- |
| Remote state bucket/lock objects policy | `bootstrap/state.tf` | Application roots never manage their own backend bucket |
| Account-level AWS Budget/notifications | `bootstrap/budget.tf` | Exists before the first application environment |
| DynamoDB table, two GSIs, TTL, capacity, PITR/protection | `modules/application/dynamodb.tf` | Must match `DYNAMODB_DESIGN.md`; no item/data seeding |
| Content/media S3 bucket, policy, CORS, versioning | `modules/application/s3.tf` | One bucket per environment; state bucket is separate |
| Cognito User Pool, app client, domain, groups | `modules/application/cognito.tf` | Google secret boundary described below |
| Four Lambda groups and invoke permissions | `modules/application/lambda.tf` | Prepared artifacts only |
| Runtime IAM roles/policies | `modules/application/iam.tf` | One role/group; scoped environment resources |
| API Gateway HTTP API, routes, integrations, JWT authorizer, CORS/stage | `modules/application/api_gateway.tf` | `/api/v1/*`; operations health route is separate from product matrix |
| CloudWatch log groups, alarms and dashboard | `modules/application/monitoring.tf` | Explicit retention and low-noise alarm set |
| CloudFront distribution, OAC, policies | `modules/application/cloudfront.tf` | One persistent production distribution; dev edge is disabled by default |
| Environment ACM certificates/validation | `modules/application/acm.tf` | Uses primary and `aws.us_east_1` providers correctly |
| Environment DNS records | `modules/application/route53_records.tf` | Zone ID passed by root |
| Public hosted zone | `environments/prod/route53_zone.tf` | Deliberately single-owner shared resource; dev owns only dev records |

Terraform owns resource configuration, not application data. DynamoDB items, Markdown/media objects, Cognito users and secret values are never modeled as ordinary Terraform resources.

## Terraform IAM and authentication

Do not use AWS root credentials or hard-coded provider credentials.

Local workflow:

- Authenticate with an AWS CLI named profile/SSO when available.
- Assume the environment-specific Terraform role using short-lived credentials.
- Use caller identity/account checks before plan/apply.

CI workflow:

- Use the CI platform's OIDC federation to assume an AWS role.
- Restrict the trust policy by repository, branch/ref, workflow and protected environment claims.
- Use separate dev and prod roles; prod assumption requires the protected environment/manual approval.
- Do not create a long-lived CI IAM user or store `AWS_ACCESS_KEY_ID`/`AWS_SECRET_ACCESS_KEY` as repository secrets.

The Terraform apply role needs only the service control-plane actions and `iam:PassRole` for exact application execution-role ARNs. It must not pass arbitrary account roles. Backend state permissions are scoped to the environment state/lock paths. A future read-only plan role may be narrower, but it must still refresh all managed resources; generate the exact policy from a reviewed Terraform plan/provider operations during implementation rather than guessing wildcard permissions.

## Secret handling

V1 secret destination is SSM Parameter Store Standard-tier `SecureString` under environment paths such as `/aws-learning-journal/dev/...` and `/aws-learning-journal/prod/...`. Runtime roles read only their exact parameter ARNs. Secrets Manager is reserved for requirements such as managed rotation or service integration that Parameter Store does not meet.

Terraform rules:

- Never commit secret plaintext in HCL, `.tfvars`, backend files or Lambda/frontend environment configuration.
- A `sensitive` variable/output hides normal display but **the plaintext can still be present in plan/state**.
- Do not read a SecureString value into Terraform merely to pass it to another resource; that moves the value into state.
- Prefer seeding/rotating application HMAC secrets with a separate controlled secret-bootstrap operation, then give Lambda runtime access by parameter ARN/path.
- Plan files are sensitive artifacts; restrict access and delete them according to CI retention policy after apply.

Google federation has a specific limitation: the current `aws_cognito_identity_provider` resource accepts Google's `client_secret` inside ordinary `provider_details`; the reviewed provider documentation does not expose a confirmed write-only argument for that field. V1 therefore chooses a deliberate boundary:

1. Terraform owns the User Pool, public app client, domain, callback URLs, groups and the non-secret expected Google-provider contract.
2. A controlled post-apply operation creates/updates the Google identity-provider binding using the secret read from SSM SecureString without printing it or committing it.
3. The operation uses read-modify-write semantics and a protected temporary input mechanism; it is recorded in deployment evidence.
4. Drift checks verify the provider exists and its non-secret settings match the contract.

This is the one explicit IaC ownership exception, chosen to keep the Google secret out of Terraform state. Revisit it only if the pinned AWS provider offers a verified write-only/ephemeral path or the team accepts the documented encrypted-state exposure. Do not silently pass the secret through `TF_VAR` and assume `sensitive=true` removes it from state.

## Lambda packaging boundary

Terraform is not the application compiler or dependency packager.

```text
backend source
  -> install/build/test in an isolated build job
  -> produce immutable ZIP artifacts for four Lambda groups
  -> calculate artifact digest
  -> publish/store artifact under a versioned identity
  -> Terraform references artifact and source_code_hash
  -> Lambda update
```

The same reviewed artifact promoted to prod is preferable to rebuilding different bytes. Terraform consumes artifact location/version/hash as inputs. `source_code_hash` or the provider's equivalent update trigger ensures code changes are visible in the plan. Do not use local-exec/provisioners for a complex compile pipeline.

## Developer workflow

Run from the selected environment root:

```text
terraform fmt -check -recursive
terraform init -backend-config=<reviewed environment backend config>
terraform validate
terraform plan -out=<ephemeral reviewed plan>
terraform show <plan>
terraform apply <same reviewed plan>
```

For local development, `terraform fmt` without `-check` may format the files before review. Rules:

- Always initialize against the expected backend and verify AWS account/role/environment.
- Review creates, replacements, destroys, capacity increases, policy broadening and public exposure before apply.
- Apply the saved plan that was reviewed; regenerate/re-review if configuration, state or credentials changed.
- Never use casual `-auto-approve` for prod.
- Do not run prod apply from an unreviewed local branch.

## Future CI/CD

No workflow is implemented in this phase. Target behavior:

PR checks:

- `terraform fmt -check -recursive`.
- `terraform init -backend=false` where possible for static validation, then `terraform validate`.
- Terraform/security/static checks when selected and pinned.
- Environment plan using OIDC and read/apply-safe permissions; publish a sanitized plan summary without secret values.

Main/protected deployment:

- Build/test the four Lambda artifacts once and record hashes.
- Generate a fresh environment plan.
- Require reviewed plan and protected-environment approval for prod.
- Apply that exact saved plan with the environment role.
- Run post-apply infrastructure smoke tests and retain deployment evidence.

Frontend hosting/deployment remains a separate workflow until the Next.js origin is finalized.

## Safe destroy and lifecycle

Dev is intentionally destroyable after a reviewed plan. It may retain a bucket only when object/version deletion is intentionally handled; developers must not weaken prod safeguards merely to make one command convenient.

Prod rules:

- DynamoDB deletion protection and PITR enabled.
- S3 Versioning enabled; bucket deletion requires an explicit, separately reviewed data-retention/emptying procedure.
- `terraform destroy` is not a normal deployment operation.
- Consider `prevent_destroy` for the production table, data bucket, hosted zone and state bucket, but understand the trade-off: it blocks legitimate Terraform destroy/replacement only while the lifecycle rule remains in configuration; it is not a substitute for AWS deletion protection, backups, IAM or review.
- Replacement plans for stateful resources are blocking until backup, migration, recovery and DNS impact are reviewed.

The state bucket is never destroyed from an application root. Material deletion requires exact target verification, recoverability review and explicit authorization.

## Drift and import

Terraform configuration and state are the source of truth for managed infrastructure. AWS Console is for inspection/debugging, not routine mutation.

If an emergency manual change occurs:

1. Record the reason and exact resource.
2. Decide whether the intended state is the Terraform configuration or the emergency configuration.
3. Reconcile with a reviewed code change/import/state operation.
4. Run a refresh-only/normal plan and confirm no unexplained drift remains.

Do not edit state JSON manually. Use supported `terraform state` commands only with a backup and review.

If an existing AWS resource must be adopted, use Terraform import blocks or `terraform import`, then make configuration match the observed resource before any normal apply. V1 preference remains creating application infrastructure through Terraform from the start. The manually bound Cognito Google provider follows its explicit secret boundary rather than pretending Terraform owns it.

## Cost safety

Terraform defaults and validation should make accidental expensive resources difficult:

- DynamoDB initial aggregate is `16 RCU / 18 WCU`; validations keep the V1 budget below 25/25 and auto scaling is disabled initially.
- No Lambda provisioned concurrency; reserved concurrency is added only as a downstream-protection decision.
- CloudWatch log retention is explicit and custom metric cardinality is reviewed.
- No VPC/NAT Gateway because V1 Lambda dependencies do not require a VPC.
- No OpenSearch, RDS, Redis/ElastiCache, DAX, Kinesis, Step Functions or multi-Region resources.
- Production PITR, S3 retained versions, Route 53, ACM-related dependencies, CloudFront and log delivery are visible cost-review items.
- Account budget notifications at `$1`, `$5` and `$10` are created before or with the first persistent application environment.

Every plan review asks: did capacity, retention, replication, logging, data transfer, number of environments or a paid protection feature change? Terraform plan is not a cost estimate, so verify current AWS pricing/Free Tier and use billing dashboards after apply.

## Terraform non-goals

V1 does not use:

- Per-service/per-Lambda generic enterprise modules.
- Terragrunt or Terraform Cloud.
- Custom providers.
- Multi-account landing-zone abstractions.
- Multi-Region provider matrices beyond the required `us-east-1` ACM alias.
- Terraform-managed application data, Cognito users, uploaded objects or secret plaintext.
- Local-exec as a substitute for application build/deployment design.

Abstract only after duplicated code, independent lifecycle or another real consumer proves the need.

## Implementation phases

| Phase | Scope | Deployable/testable exit condition |
| ---: | --- | --- |
| 0 | Bootstrap remote-state bucket, lockfile behavior, IAM authentication and version pins | Lock/recovery test passes; dev/prod state keys inaccessible to the wrong role |
| 1 | DynamoDB table/two GSIs/TTL/capacity plus private S3 content bucket | `terraform apply` succeeds in dev; table settings and bucket security checks match contracts |
| 2 | Four scoped IAM execution roles, explicit log groups and Lambda skeleton artifacts | Each function invokes and writes safe correlated logs; permissions fail closed outside its scope |
| 3 | API Gateway HTTP API, integrations, CORS, stage/access logs and `/api/v1/health` | Health request reaches the `public-content` Lambda's operations branch and returns `200` |
| 4 | Cognito User Pool/client/domain/JWT authorizer plus controlled Google IdP secret binding | PKCE login yields Access Token; protected route accepts valid scope and rejects wrong token/group |
| 5 | CloudWatch dashboard/basic alarms and AWS Budget notifications | Test fault/threshold path is observable without noisy alert fan-out |
| 6 | CloudFront/OAC, ACM and Route 53 records after frontend origin/domain decision | HTTPS frontend/media works; `api.<domain>` remains same-site and routes to Regional HTTP API |

Each phase produces a reviewable plan and leaves dev in a coherent state. Prod is not created merely to test local development.

## First infrastructure milestone

The first end-to-end milestone is:

```text
terraform apply dev
GET /api/v1/health
  -> API Gateway HTTP API
  -> public-content Lambda (operations branch; no fifth Lambda group)
  -> 200
```

`GET /api/v1/health` is an **OPERATIONS / NON-BUSINESS** smoke-test endpoint. It does not read DynamoDB business data and is not added to the 38-route authoritative product endpoint matrix in `API_DESIGN.md`. It returns only minimal service/build status and no environment secrets. If the implementation later needs deeper dependency checks, create an authenticated operational diagnostic rather than making the public health route expensive or revealing.

## Architecture consistency check

| Contract | Result |
| --- | --- |
| Gateway | API Gateway HTTP API; no REST API |
| API namespace | `/api/v1/*`; health explicitly non-business |
| Lambda ownership | Exactly four capability groups |
| DynamoDB | One Standard PROVISIONED table/environment, exactly two named GSIs, existing capacity budget |
| Authentication | Cognito User Pool + Google, authorization code with PKCE, Access Token |
| Authorization | JWT authorizer plus Lambda ADMIN group/business rules and SC `User.status=ACTIVE` |
| S3 boundary | Markdown/media object storage, backend-owned keys, direct presigned binary upload |
| Environments | Independent roots/state/roles/names for dev and prod |
| Cost intent | Free Tier conscious with explicit budgets, retention and expensive-service exclusions |

No Terraform choice in this document changes the business semantics in `DATA_MODEL.md`, physical mappings/transactions in `DYNAMODB_DESIGN.md`, or product routes/DTOs in `API_DESIGN.md`.

## Final Terraform decisions

| Concern | V1 decision |
| --- | --- |
| Layout | Two environment roots + one coarse application module + minimal bootstrap root |
| Versioning | Terraform `~> 1.16.0`, AWS provider `~> 6.60`, committed lock files; reverify before Phase 0 |
| Backend | Hardened S3 backend with `use_lockfile=true`; no deprecated DynamoDB lock table |
| Environment isolation | Separate dev/prod state keys, variables, IAM roles and apply gates; no workspaces |
| Secrets | SSM SecureString, out-of-band secret values; explicit Google IdP binding exception to avoid Terraform-state plaintext |
| Artifacts | Build outside Terraform; deploy immutable ZIP plus hash |
| Prod safety | Reviewed saved plan, manual approval, data-service protections and no routine destroy |
| First milestone | Dev apply plus non-business `GET /api/v1/health` smoke test |

## Authoritative references

- [Terraform S3 backend and native lockfile](https://developer.hashicorp.com/terraform/language/backend/s3)
- [Terraform backends, state and locking](https://developer.hashicorp.com/terraform/language/state/backends)
- [Terraform sensitive, ephemeral and write-only data](https://developer.hashicorp.com/terraform/language/manage-sensitive-data)
- [HashiCorp AWS provider](https://registry.terraform.io/providers/hashicorp/aws/latest/docs)
- [`aws_cognito_identity_provider` resource](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/cognito_identity_provider)
- [AWS IAM best practices](https://docs.aws.amazon.com/IAM/latest/UserGuide/best-practices.html)
- [CloudFront certificate Region requirements](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/cnames-and-https-requirements.html)
- [API Gateway Regional custom-domain certificate requirements](https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-regional-api-custom-domain-create.html)

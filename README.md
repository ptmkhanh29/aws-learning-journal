# Khanh Phan

A bilingual personal technical blog for engineering notes, experiments, labs, troubleshooting, and things Khanh builds and learns.

## Current phase

- Product state: Frontend UX Prototype
- Data: Mock only
- Authentication: Mock only, stored locally for UI review
- Backend: Not implemented
- Frontend artifact: Static export configured; `npm run build` produces `out/`
- AWS deployment: Not implemented

## Stack

Next.js App Router, React, TypeScript, Tailwind CSS, and Phosphor Icons. Pages are Server Components by default. Client Components are limited to theme, navigation, search, filters, practice, and fake authentication interactions.

## Run locally

Node.js 20.9 or newer is required.

```bash
npm install
npm run dev
```

Open `http://localhost:3000/en` or `http://localhost:3000/vi`.

## Build the static deployment artifact

```bash
npm run build
```

Upload the generated `out/` directory to the private frontend S3 origin. The `.next/` directory is build workspace data, not the deployment artifact.

The selected deployment approach is GitHub Actions on pushes/merges to the protected branch: run `npm ci`, lint and build, then upload `out/` to S3 and invalidate the CloudFront HTML paths. AWS authentication will use GitHub OIDC to assume a scoped IAM role; long-lived AWS access keys are not part of the design. The workflow itself is intentionally deferred to the next implementation step.

## Prototype routes

Both `/en` and `/vi` contain matching routes for Journal, Notes, AWS, Labs, Practice, About, Login, and Signup. The sample article is at `/en/notes/s3-storage-classes`; the interactive question is at `/en/practice/demo`.

## Design documents

- [Visual direction](docs/DESIGN.md)
- [Logical data/domain model](docs/DATA_MODEL.md)
- [DynamoDB physical design](docs/DYNAMODB_DESIGN.md)
- [API design](docs/API_DESIGN.md)
- [Infrastructure design](docs/INFRASTRUCTURE_DESIGN.md)
- [Terraform design](docs/TERRAFORM_DESIGN.md)

# 03 GitHub Actions frontend CI/CD

## Goal

Deploy the frontend from a commit on `main` to the private S3 bucket.

## What we build

```text
push or merge to main
      |
      v
GitHub Actions
      |
      v
npm ci
      |
      v
npm run lint
      |
      v
npm run build
      |
      v
out/
      |
      v
OIDC AssumeRole
      |
      v
aws s3 sync
      |
      v
private frontend S3 bucket
```

This step proves the path from source commit to S3. It does not create CloudFront or invalidate an edge cache.

The ownership boundary is defined in [Selected CI/CD deployment approach](../TERRAFORM_DESIGN.md#selected-cicd-deployment-approach).

## Hands-on actions

- Add a frontend deployment workflow triggered by the approved `main` flow.
- Use a supported Node.js version and install from `package-lock.json` with `npm ci`.
- Require lint and static build to pass before AWS authentication and upload.
- Assume the deployment role from step 02 through GitHub OIDC.
- Sync `out/` to the exact frontend bucket without sending ACL headers.
- Keep bucket and role identifiers in environment configuration, not application source.

## Verification

- A failed install, lint, or build stops before AWS deployment.
- A successful run uses an assumed-role session rather than stored access keys.
- S3 contains `index.html`, locale routes, images, and `_next/static/` from the same build.
- Files removed from the intended release are handled by an explicit, reviewed sync policy.

## Expected result

A push or merge to `main` can build the current source and place the resulting `out/` artifact in the private frontend bucket.

## Status

Not started.

## Next step

[04 CloudFront and OAC](04_CLOUDFRONT.md)

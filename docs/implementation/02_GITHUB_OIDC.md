# 02 GitHub OIDC and IAM

## Goal

Allow GitHub Actions to authenticate to AWS with short-lived credentials.

## What we build

```text
GitHub Actions
      |
      v
GitHub OIDC
      |
      v
AWS IAM deployment role
```

The IAM trust policy will restrict role assumption to the intended GitHub repository and protected branch or environment. The permissions policy will be limited to deployment operations on the exact frontend S3 bucket. CloudFront invalidation permission is added when that deployment behavior is introduced after step 04.

The repository will not store long-lived credentials such as:

```text
AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY
```

See [Terraform IAM and authentication](../TERRAFORM_DESIGN.md#terraform-iam-and-authentication) and [IAM design](../INFRASTRUCTURE_DESIGN.md#9-iam-design) for the wider role boundaries.

## Hands-on actions

- Create or adopt the GitHub OIDC provider in the AWS account.
- Create a dedicated frontend deployment role.
- Scope the trust policy to the repository and deployment ref or environment claims.
- Scope S3 permissions to the bucket created in step 01.
- Expose only the role ARN and non-secret deployment identifiers to GitHub Actions.

Exact Terraform resources and IAM policies will be written in this step after the bucket and environment naming are available.

## Verification

- An authorized GitHub context can assume the role.
- A different repository or ref cannot assume it.
- The temporary session can inspect or deploy only within its defined frontend scope.
- No long-lived AWS access key is stored in GitHub secrets.

## Expected result

GitHub Actions has a short-lived, least-privilege authentication path to AWS. No frontend artifact is uploaded yet.

## Status

Not started.

## Next step

[03 GitHub Actions frontend CI/CD](03_FRONTEND_CICD.md)

## AWS reference

- [Identity-provider controls for shared OIDC providers](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles_providers_oidc_secure-by-default.html)

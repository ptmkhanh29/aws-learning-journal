# 04 CloudFront and OAC

## Goal

Serve the private frontend bucket over HTTPS through CloudFront.

## What we build

```text
Internet
   |
   v
CloudFront
   |
   v
Origin Access Control
   |
   v
private frontend S3 bucket
```

CloudFront uses the regular S3 bucket endpoint, not S3 Static Website Hosting. OAC signs origin requests, and the bucket policy grants read access only to the CloudFront service principal for the exact distribution.

The distribution also needs the static-export URI behavior documented in the [CloudFront section](../INFRASTRUCTURE_DESIGN.md#cloudfront): `/` redirects to `/en/`, while trailing-slash and extensionless routes map to their `index.html` objects. Unknown assets must return a real error instead of falling back to the homepage.

## Hands-on actions

- Provision the CloudFront distribution and OAC with Terraform.
- Attach the private S3 bucket as a regular S3 origin.
- Restrict the bucket policy to the distribution ARN.
- Redirect viewer HTTP requests to HTTPS.
- Add the reviewed URI rewrite or redirect function for the static export.
- Configure separate cache behavior for immutable `/_next/static/*` assets and shorter-lived HTML.
- After CloudFront works, extend the deployment workflow with targeted invalidation when required.

## Verification

- The CloudFront domain serves `/`, `/en/`, `/vi/`, and a representative deep route over HTTPS.
- Static chunks and images load through CloudFront.
- Direct anonymous access to the S3 origin is denied.
- Missing assets return an error and are not rewritten to the homepage.
- A new frontend deployment becomes visible according to the cache and invalidation policy.

## Expected result

The static frontend is publicly reachable through CloudFront while the S3 bucket remains private.

## Status

Not started.

## Next step

05 Networking and VPC. Detailed scope will be written after the frontend delivery path is verified.

## AWS reference

- [Restricting access to an S3 origin with CloudFront OAC](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/private-content-restricting-access-to-s3.html)

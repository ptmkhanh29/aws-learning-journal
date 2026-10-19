# Hands-on implementation roadmap

The architecture documents explain what the system should become and why those choices were made. This directory records how the project is built, one verifiable step at a time.

Each step has a narrow outcome. A step is complete only when its verification section passes; planned work is not described as deployed infrastructure.

## Roadmap

| Step | Scope | Status |
| --- | --- | --- |
| [00](00_LOCAL_APP.md) | Local application baseline | Completed |
| [01](01_FRONTEND_S3.md) | Frontend S3 bucket | Next |
| [02](02_GITHUB_OIDC.md) | GitHub OIDC and IAM | Not started |
| [03](03_FRONTEND_CICD.md) | GitHub Actions frontend CI/CD | Not started |
| [04](04_CLOUDFRONT.md) | CloudFront and OAC | Not started |
| 05 | Networking and VPC | Planned |
| 06 | Backend deployment | Planned |
| 07 | API integration | Planned |
| 08 | Database | Planned |
| 09 | Monitoring and logging | Planned |

The later steps are placeholders for sequencing. Their detailed scope will be written when the preceding infrastructure exists and can be inspected.

## Design references

- [AWS system architecture](../AWS_ARCHITECTURE.md)
- [Infrastructure design](../INFRASTRUCTURE_DESIGN.md)
- [Terraform design](../TERRAFORM_DESIGN.md)
- [API design](../API_DESIGN.md)
- [DynamoDB design](../DYNAMODB_DESIGN.md)

output "frontend_bucket_name" {
  description = "Name of the dev frontend artifact bucket."
  value       = module.application.frontend_bucket_name
}

output "frontend_bucket_arn" {
  description = "ARN of the dev frontend artifact bucket."
  value       = module.application.frontend_bucket_arn
}

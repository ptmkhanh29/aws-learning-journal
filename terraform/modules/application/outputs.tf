output "frontend_bucket_name" {
  description = "Name of the frontend artifact bucket."
  value       = aws_s3_bucket.frontend.bucket
}

output "frontend_bucket_arn" {
  description = "ARN of the frontend artifact bucket."
  value       = aws_s3_bucket.frontend.arn
}

variable "environment" {
  description = "Deployment environment name used for resource tags."
  type        = string
}

variable "frontend_bucket_name" {
  description = "Globally unique name for the frontend artifact bucket."
  type        = string
}

variable "aws_region" {
  description = "AWS Region for the dev environment."
  type        = string
  default     = "ap-southeast-1"
}

variable "frontend_bucket_name" {
  description = "Globally unique name for the dev frontend artifact bucket."
  type        = string
}

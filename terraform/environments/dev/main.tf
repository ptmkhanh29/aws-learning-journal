module "application" {
  source = "../../modules/application"

  environment          = "dev"
  frontend_bucket_name = var.frontend_bucket_name
}

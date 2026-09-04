const tagToneByLabel: Record<string, string> = {
  aws: "aws",
  s3: "storage",
  ebs: "storage",
  vpc: "network",
  dns: "network",
  "route 53": "network",
  alb: "network",
  nlb: "network",
  cloudfront: "network",
  "api gateway": "network",
  cloudflare: "cloudflare",
  wordpress: "wordpress",
  devops: "devops",
  security: "security",
  iam: "security",
  kms: "security",
  ec2: "compute",
  lambda: "compute",
  serverless: "compute",
  rds: "database",
  dynamodb: "database",
  resilience: "devops",
  cloudwatch: "devops",
  sqs: "devops",
};

function toneForTag(label: string) {
  const normalized = label.trim().toLowerCase();
  if (normalized.includes("saa") || normalized.includes("sap") || normalized.includes("cert")) return "certification";
  return tagToneByLabel[normalized] ?? "neutral";
}

export function Tag({ children }: { children: string }) {
  return <span className={`tag tag-${toneForTag(children)}`}>{children}</span>;
}

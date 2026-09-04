import type { LocalizedText } from "@/lib/i18n";

export type LearningState = "comfortable" | "learning" | "not-studied";
export type ServiceGroup = { domain: LocalizedText; noteCount: number; services: { name: string; state: LearningState; noteCount: number }[] };

export const serviceGroups: ServiceGroup[] = [
  { domain: { en: "Compute", vi: "Điện toán" }, noteCount: 18, services: [{ name: "EC2", state: "comfortable", noteCount: 8 }, { name: "Lambda", state: "learning", noteCount: 5 }, { name: "ECS", state: "learning", noteCount: 3 }, { name: "Auto Scaling", state: "comfortable", noteCount: 2 }] },
  { domain: { en: "Storage", vi: "Lưu trữ" }, noteCount: 24, services: [{ name: "S3", state: "comfortable", noteCount: 14 }, { name: "EBS", state: "learning", noteCount: 6 }, { name: "EFS", state: "learning", noteCount: 4 }, { name: "FSx", state: "not-studied", noteCount: 0 }] },
  { domain: { en: "Networking", vi: "Mạng" }, noteCount: 31, services: [{ name: "VPC", state: "learning", noteCount: 13 }, { name: "Route 53", state: "comfortable", noteCount: 8 }, { name: "CloudFront", state: "learning", noteCount: 6 }, { name: "Direct Connect", state: "not-studied", noteCount: 2 }, { name: "Transit Gateway", state: "not-studied", noteCount: 2 }] },
  { domain: { en: "Database", vi: "Cơ sở dữ liệu" }, noteCount: 15, services: [{ name: "RDS", state: "comfortable", noteCount: 7 }, { name: "Aurora", state: "learning", noteCount: 4 }, { name: "DynamoDB", state: "learning", noteCount: 4 }] },
  { domain: { en: "Security", vi: "Bảo mật" }, noteCount: 12, services: [{ name: "IAM", state: "learning", noteCount: 8 }, { name: "KMS", state: "learning", noteCount: 3 }, { name: "Organizations", state: "not-studied", noteCount: 1 }] },
];

import type { LocalizedText } from "@/lib/i18n";

export type Note = {
  slug: string;
  title: LocalizedText;
  summary: LocalizedText;
  service: string;
  domain: LocalizedText;
  date: string;
  tags: string[];
  minutes: number;
};

export const notes: Note[] = [
  { slug: "s3-storage-classes", title: { en: "S3 Storage Classes: a decision model", vi: "S3 Storage Classes: mô hình ra quyết định" }, summary: { en: "A practical way to choose between frequent, infrequent, and archival access without memorizing a matrix.", vi: "Cách chọn frequent, infrequent và archival access mà không cần học thuộc một ma trận." }, service: "S3", domain: { en: "Storage", vi: "Lưu trữ" }, date: "Sep 03", tags: ["S3", "SAA-C03"], minutes: 8 },
  { slug: "alb-vs-nlb", title: { en: "ALB vs NLB without the feature checklist", vi: "Phân biệt ALB và NLB không cần học thuộc checklist" }, summary: { en: "Start with protocol, routing awareness, and connection behavior. The product choice follows.", vi: "Bắt đầu từ protocol, khả năng hiểu request và hành vi connection. Lựa chọn sẽ rõ hơn." }, service: "ELB", domain: { en: "Networking", vi: "Mạng" }, date: "Sep 01", tags: ["ALB", "NLB"], minutes: 6 },
  { slug: "route-53-routing-policies", title: { en: "Route 53 routing policies by intent", vi: "Route 53 routing policy theo mục đích" }, summary: { en: "Latency, failover, weighted, and geolocation organized around the question each policy answers.", vi: "Latency, failover, weighted và geolocation được nhóm theo câu hỏi mà mỗi policy giải quyết." }, service: "Route 53", domain: { en: "Networking", vi: "Mạng" }, date: "Aug 29", tags: ["DNS", "Resilience"], minutes: 7 },
  { slug: "dynamodb-consistency", title: { en: "DynamoDB consistency in plain language", vi: "DynamoDB consistency bằng ngôn ngữ đơn giản" }, summary: { en: "What eventually consistent and strongly consistent reads guarantee, plus the limits worth remembering.", vi: "Điều eventual và strongly consistent read đảm bảo, cùng những giới hạn đáng nhớ." }, service: "DynamoDB", domain: { en: "Database", vi: "Cơ sở dữ liệu" }, date: "Aug 27", tags: ["DynamoDB"], minutes: 5 },
  { slug: "iam-policy-evaluation", title: { en: "How IAM policy evaluation actually resolves", vi: "IAM policy evaluation thực sự được phân giải thế nào" }, summary: { en: "A compact mental model for explicit deny, identity policies, resource policies, and permission boundaries.", vi: "Mental model gọn cho explicit deny, identity policy, resource policy và permission boundary." }, service: "IAM", domain: { en: "Security", vi: "Bảo mật" }, date: "Aug 23", tags: ["IAM", "Security"], minutes: 10 },
  { slug: "lambda-concurrency", title: { en: "Reserved and provisioned concurrency are not opposites", vi: "Reserved và provisioned concurrency không phải hai lựa chọn đối lập" }, summary: { en: "One protects capacity and sets a ceiling. The other prepares execution environments for predictable latency.", vi: "Một cơ chế bảo vệ capacity và đặt trần. Cơ chế kia chuẩn bị execution environment để latency ổn định." }, service: "Lambda", domain: { en: "Compute", vi: "Điện toán" }, date: "Aug 19", tags: ["Lambda", "Serverless"], minutes: 8 },
];

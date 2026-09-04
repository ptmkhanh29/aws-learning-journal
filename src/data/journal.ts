import type { LocalizedText } from "@/lib/i18n";

export type JournalEntry = {
  slug: string;
  date: string;
  month: LocalizedText;
  title: LocalizedText;
  excerpt: LocalizedText;
  type: "note" | "lab" | "reflection";
  tags: string[];
  minutes: number;
};

export const journalEntries: JournalEntry[] = [
  {
    slug: "vpc-endpoints-finally-clicked",
    date: "03",
    month: { en: "September 2026", vi: "Tháng 9, 2026" },
    title: { en: "I finally understood VPC Endpoints properly", vi: "Cuối cùng tôi đã hiểu đúng về VPC Endpoint" },
    excerpt: { en: "One SAA question exposed the gap between memorizing the diagram and understanding where the traffic actually goes.", vi: "Một câu hỏi SAA cho tôi thấy khoảng cách giữa việc nhớ sơ đồ và hiểu luồng traffic thực sự đi đâu." },
    type: "reflection",
    tags: ["VPC", "S3", "SAA-C03"],
    minutes: 6,
  },
  {
    slug: "alb-auto-scaling-multi-az",
    date: "01",
    month: { en: "September 2026", vi: "Tháng 9, 2026" },
    title: { en: "Lab: ALB, Auto Scaling, and Multi-AZ", vi: "Lab: ALB, Auto Scaling và Multi-AZ" },
    excerpt: { en: "I rebuilt the path from Route 53 to healthy targets, then deliberately broke one availability zone.", vi: "Tôi dựng lại đường đi từ Route 53 tới healthy target, sau đó chủ động làm hỏng một availability zone." },
    type: "lab",
    tags: ["EC2", "ALB", "RDS"],
    minutes: 9,
  },
  {
    slug: "ebs-multi-attach-mistake",
    date: "29",
    month: { en: "August 2026", vi: "Tháng 8, 2026" },
    title: { en: "Where I kept getting EBS Multi-Attach wrong", vi: "Điểm tôi luôn hiểu sai về EBS Multi-Attach" },
    excerpt: { en: "The feature is narrower than the name suggests. Writing the constraints down made the exam traps obvious.", vi: "Tính năng này hẹp hơn tên gọi của nó. Viết rõ các giới hạn giúp tôi nhận ra bẫy đề thi." },
    type: "note",
    tags: ["EBS", "EC2"],
    minutes: 5,
  },
  {
    slug: "route-53-failover-notes",
    date: "24",
    month: { en: "August 2026", vi: "Tháng 8, 2026" },
    title: { en: "Health checks changed how I read Route 53 questions", vi: "Health check đã thay đổi cách tôi đọc câu hỏi Route 53" },
    excerpt: { en: "I stopped treating routing policies as a vocabulary quiz and started tracing failure signals.", vi: "Tôi ngừng xem routing policy như bài kiểm tra từ vựng và bắt đầu lần theo tín hiệu lỗi." },
    type: "reflection",
    tags: ["Route 53", "Resilience"],
    minutes: 7,
  },
];

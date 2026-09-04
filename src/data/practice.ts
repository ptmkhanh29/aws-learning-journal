import type { LocalizedText } from "@/lib/i18n";

export const practiceStats = { answered: 324, accuracy: 74, review: 38 };
export const domainScores = [
  { label: { en: "Secure Architectures", vi: "Kiến trúc bảo mật" }, score: 81 },
  { label: { en: "Resilient Architectures", vi: "Kiến trúc phục hồi" }, score: 73 },
  { label: { en: "High-Performing Architectures", vi: "Kiến trúc hiệu năng cao" }, score: 68 },
  { label: { en: "Cost-Optimized Architectures", vi: "Kiến trúc tối ưu chi phí" }, score: 62 },
] satisfies { label: LocalizedText; score: number }[];

export const recurringMistakes = ["S3 Gateway Endpoint", "Route 53 Failover", "Aurora Global Database", "NAT Gateway vs NAT Instance"];

export const demoQuestion = {
  scenario: {
    en: "A company runs private EC2 instances that must access objects in S3 without using a NAT gateway or traversing the public internet. Which solution is the most cost-effective?",
    vi: "Một công ty có các EC2 instance private cần truy cập object trong S3 mà không dùng NAT gateway hoặc đi qua public internet. Giải pháp nào tối ưu chi phí nhất?",
  },
  options: [
    { id: "a", text: { en: "Create an interface VPC endpoint for S3 in every subnet.", vi: "Tạo interface VPC endpoint cho S3 trong mọi subnet." } },
    { id: "b", text: { en: "Create a gateway VPC endpoint for S3 and update the route tables.", vi: "Tạo gateway VPC endpoint cho S3 và cập nhật route table." } },
    { id: "c", text: { en: "Attach an internet gateway and assign public IP addresses.", vi: "Gắn internet gateway và cấp public IP address." } },
    { id: "d", text: { en: "Place a NAT instance in each private subnet.", vi: "Đặt một NAT instance trong mỗi private subnet." } },
  ],
  correct: "b",
  explanation: {
    en: "An S3 gateway endpoint has no hourly charge and adds a route to the selected route tables. The traffic stays on the AWS network.",
    vi: "S3 gateway endpoint không có phí theo giờ và thêm route vào các route table đã chọn. Traffic được giữ trong mạng AWS.",
  },
};

import type { LocalizedText } from "@/lib/i18n";

export type HomeNavItem = {
  label: LocalizedText;
  href: string;
  icon?: "home" | "journal" | "notes" | "labs" | "aws" | "practice" | "cloudflare" | "wordpress" | "devops";
  active?: boolean;
};

export type HomeNavGroup = {
  label: LocalizedText;
  items: HomeNavItem[];
};

export const homeNavigation: HomeNavGroup[] = [
  {
    label: { en: "Explore", vi: "Khám phá" },
    items: [
      { label: { en: "Home", vi: "Trang chủ" }, href: "/", icon: "home" },
      { label: { en: "Journal", vi: "Nhật ký" }, href: "/journal", icon: "journal" },
      { label: { en: "Notes", vi: "Ghi chú" }, href: "/notes", icon: "notes" },
      { label: { en: "Labs", vi: "Labs" }, href: "/labs", icon: "labs" },
    ],
  },
  {
    label: { en: "Topics", vi: "Chủ đề" },
    items: [
      { label: { en: "AWS", vi: "AWS" }, href: "/aws", icon: "aws" },
      { label: { en: "AWS Practice", vi: "Ôn tập AWS" }, href: "/practice", icon: "practice" },
      { label: { en: "Cloudflare", vi: "Cloudflare" }, href: "/notes", icon: "cloudflare", active: false },
      { label: { en: "WordPress", vi: "WordPress" }, href: "/notes", icon: "wordpress", active: false },
      { label: { en: "DevOps", vi: "DevOps" }, href: "/labs", icon: "devops", active: false },
    ],
  },
  {
    label: { en: "Collections", vi: "Bộ sưu tập" },
    items: [
      { label: { en: "Reflections", vi: "Chiêm nghiệm" }, href: "/journal", active: false },
      { label: { en: "Cheat sheets", vi: "Cheat sheets" }, href: "/notes", active: false },
      { label: { en: "Troubleshooting", vi: "Xử lý sự cố" }, href: "/journal", active: false },
    ],
  },
];

export type NotebookTopic = {
  id: string;
  slug: string;
  labelVi: string;
  labelEn: string;
  count: number;
  icon: "network" | "storage" | "compute" | "security" | "database" | "dns" | "function" | "cdn" | "table" | "queue" | "monitoring";
  tone: "cyan" | "yellow" | "orange" | "lavender" | "blue" | "mint" | "amber" | "aqua" | "lilac" | "green" | "slate";
};

// Illustrative content totals for the mock topic catalogue; supplied by the API later.
export const notebookFilters: NotebookTopic[] = [
  { id: "topic-vpc", slug: "vpc", labelVi: "VPC", labelEn: "VPC", count: 14, icon: "network", tone: "cyan" },
  { id: "topic-s3", slug: "s3", labelVi: "S3", labelEn: "S3", count: 12, icon: "storage", tone: "yellow" },
  { id: "topic-ec2", slug: "ec2", labelVi: "EC2", labelEn: "EC2", count: 9, icon: "compute", tone: "orange" },
  { id: "topic-iam", slug: "iam", labelVi: "IAM", labelEn: "IAM", count: 7, icon: "security", tone: "lavender" },
  { id: "topic-rds", slug: "rds", labelVi: "RDS", labelEn: "RDS", count: 5, icon: "database", tone: "blue" },
  { id: "topic-route53", slug: "route-53", labelVi: "Route 53", labelEn: "Route 53", count: 6, icon: "dns", tone: "mint" },
  { id: "topic-lambda", slug: "lambda", labelVi: "Lambda", labelEn: "Lambda", count: 8, icon: "function", tone: "amber" },
  { id: "topic-cloudfront", slug: "cloudfront", labelVi: "CloudFront", labelEn: "CloudFront", count: 4, icon: "cdn", tone: "aqua" },
  { id: "topic-dynamodb", slug: "dynamodb", labelVi: "DynamoDB", labelEn: "DynamoDB", count: 5, icon: "table", tone: "lilac" },
  { id: "topic-sqs", slug: "sqs", labelVi: "SQS", labelEn: "SQS", count: 3, icon: "queue", tone: "green" },
  { id: "topic-cloudwatch", slug: "cloudwatch", labelVi: "CloudWatch", labelEn: "CloudWatch", count: 4, icon: "monitoring", tone: "slate" },
];

export const homeProfile = {
  name: "Khanh Phan",
  direction: "DevOps · Cloud Architecture",
  bio: {
    en: "I write down what I’m learning, what I build, where it broke, and how my engineering mental model changed.",
    vi: "Mình ghi lại những gì đang học, đang xây, những chỗ từng làm sai và cách mental model kỹ thuật thay đổi.",
  } satisfies LocalizedText,
  certification: "AWS SAA-C03",
  focus: ["VPC", "Route 53", "Resilient architectures"],
};

export const homeCopy = {
  en: {
    latest: "What I’ve been writing lately",
    recentNotes: "A few recent notes",
    recentLab: "What I built lately",
    allEntries: "See all entries",
    allNotes: "See all notes",
    allLabs: "See all labs",
    about: "About",
    now: "Now",
    studying: "I’m currently studying",
    focus: "What I’m focusing on",
    github: "GitHub",
    cv: "View CV",
    read: "Read entry",
    viewLab: "View lab",
    navigation: "Notebook navigation",
    complete: "Complete",
    minRead: "min read",
  },
  vi: {
    latest: "Gần đây mình viết gì",
    recentNotes: "Mấy ghi chú gần đây",
    recentLab: "Lab mình vừa làm",
    allEntries: "Xem tất cả bài viết",
    allNotes: "Xem tất cả ghi chú",
    allLabs: "Xem tất cả labs",
    about: "Giới thiệu",
    now: "Hiện tại",
    studying: "Hiện tại mình đang học",
    focus: "Đang tập trung vào",
    github: "GitHub",
    cv: "Xem CV",
    read: "Đọc bài",
    viewLab: "Xem lab",
    navigation: "Điều hướng sổ tay",
    complete: "Hoàn thành",
    minRead: "phút đọc",
  },
} as const;

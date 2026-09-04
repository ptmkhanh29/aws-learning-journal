import type { LocalizedText } from "@/lib/i18n";

export type HomeNavItem = {
  label: LocalizedText;
  href: string;
  icon?: "journal" | "notes" | "labs" | "tips" | "docs" | "practice";
};

export type HomeNavGroup = {
  label: LocalizedText;
  items: HomeNavItem[];
};

export const homeNavigation: HomeNavGroup[] = [
  {
    label: { en: "Explore", vi: "Khám phá" },
    items: [
      { label: { en: "Journal", vi: "Nhật ký" }, href: "/journal", icon: "journal" },
      { label: { en: "Notes", vi: "Ghi chú" }, href: "/notes", icon: "notes" },
      { label: { en: "Labs", vi: "Labs" }, href: "/labs", icon: "labs" },
      { label: { en: "Tips", vi: "Mẹo" }, href: "/notes", icon: "tips" },
      { label: { en: "Docs", vi: "Tài liệu" }, href: "/aws", icon: "docs" },
      { label: { en: "Practice", vi: "Ôn tập" }, href: "/practice", icon: "practice" },
    ],
  },
  {
    label: { en: "Collections", vi: "Bộ sưu tập" },
    items: [
      { label: { en: "Reflections", vi: "Chiêm nghiệm" }, href: "/journal" },
      { label: { en: "Cheat sheets", vi: "Cheat sheets" }, href: "/notes" },
      { label: { en: "Architecture", vi: "Kiến trúc" }, href: "/labs" },
      { label: { en: "Troubleshooting", vi: "Xử lý sự cố" }, href: "/journal" },
      { label: { en: "Quick reads", vi: "Đọc nhanh" }, href: "/notes" },
    ],
  },
  {
    label: { en: "Topics", vi: "Chủ đề" },
    items: [
      { label: { en: "Networking", vi: "Mạng" }, href: "/aws" },
      { label: { en: "Storage", vi: "Lưu trữ" }, href: "/aws" },
      { label: { en: "Compute", vi: "Điện toán" }, href: "/aws" },
      { label: { en: "Databases", vi: "Cơ sở dữ liệu" }, href: "/aws" },
      { label: { en: "Security", vi: "Bảo mật" }, href: "/aws" },
    ],
  },
];

export type NotebookTopic = {
  label: string;
  count: number;
  emoji: string;
  tone: "cyan" | "yellow" | "orange" | "lilac" | "blue" | "mint" | "amber";
};

export const notebookFilters: NotebookTopic[] = [
  { label: "VPC", count: 14, emoji: "🌐", tone: "cyan" },
  { label: "S3", count: 12, emoji: "🪣", tone: "yellow" },
  { label: "EC2", count: 9, emoji: "🖥️", tone: "orange" },
  { label: "IAM", count: 7, emoji: "🔐", tone: "lilac" },
  { label: "RDS", count: 5, emoji: "🗄️", tone: "blue" },
  { label: "Route 53", count: 6, emoji: "🧭", tone: "mint" },
  { label: "Lambda", count: 8, emoji: "⚡", tone: "amber" },
  { label: "CloudFront", count: 4, emoji: "🌍", tone: "blue" },
  { label: "DynamoDB", count: 5, emoji: "🧩", tone: "lilac" },
  { label: "SQS", count: 3, emoji: "📬", tone: "mint" },
  { label: "CloudWatch", count: 4, emoji: "📈", tone: "cyan" },
];

export const homeProfile = {
  name: "Minh Khanh",
  direction: "DevOps · Cloud Architecture",
  bio: {
    en: "I write down what I’m learning, where I got it wrong, and how I rebuilt my mental model of the cloud.",
    vi: "Tôi ghi lại những gì mình học, những chỗ từng hiểu sai và cách mình sửa lại mental model về cloud.",
  } satisfies LocalizedText,
  certification: "AWS SAA-C03",
  focus: ["VPC", "Route 53", "Resilient architectures"],
};

export const homeCopy = {
  en: {
    eyebrow: "Notes from my cloud journey",
    title: "A small place for what I’m learning about AWS.",
    intro: "I keep the useful notes, honest mistakes, and little breakthroughs here.",
    browse: "Topics on my desk",
    browseIntro: "A few services that keep showing up in my notes and labs.",
    topicCount: "11 topics",
    latest: "What I’ve been writing lately",
    recentNotes: "A few recent notes",
    recentLab: "What I built lately",
    allEntries: "See all entries",
    allNotes: "See all notes",
    allLabs: "See all labs",
    about: "About",
    profileNote: "learning, then writing it down",
    now: "Now",
    studying: "I’m currently studying",
    focus: "What I’m focusing on",
    github: "GitHub",
    cv: "View CV",
    read: "Read entry",
    viewLab: "View lab",
    navigation: "Notebook navigation",
    openNavigation: "Browse my notebook",
    complete: "Complete",
    minRead: "min read",
  },
  vi: {
    eyebrow: "Ghi chép trên hành trình cloud",
    title: "Một góc nhỏ để mình ghi lại những điều đang học về AWS.",
    intro: "Ở đây có ghi chú hữu ích, những lần hiểu sai và vài khoảnh khắc mình chợt hiểu ra.",
    browse: "Mình đang ghi chép về",
    browseIntro: "Một vài chủ đề mình gặp lại nhiều trong lúc học và làm lab.",
    topicCount: "11 chủ đề",
    latest: "Gần đây mình viết gì",
    recentNotes: "Mấy ghi chú gần đây",
    recentLab: "Lab mình vừa làm",
    allEntries: "Xem tất cả bài viết",
    allNotes: "Xem tất cả ghi chú",
    allLabs: "Xem tất cả labs",
    about: "Giới thiệu",
    profileNote: "học rồi ghi lại",
    now: "Hiện tại",
    studying: "Hiện tại mình đang học",
    focus: "Đang tập trung vào",
    github: "GitHub",
    cv: "Xem CV",
    read: "Đọc bài",
    viewLab: "Xem lab",
    navigation: "Điều hướng sổ tay",
    openNavigation: "Mở sổ tay của mình",
    complete: "Hoàn thành",
    minRead: "phút đọc",
  },
} as const;

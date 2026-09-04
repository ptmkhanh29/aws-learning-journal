import type { LocalizedText } from "@/lib/i18n";

export type ExamPracticeDomain = {
  id: string;
  slug: string;
  domainNumber: string;
  title: LocalizedText;
  description: LocalizedText;
  topics: string[];
  questionCount: number;
  href: string;
  tone: "secure" | "resilient" | "performance" | "cost";
};

export const examPracticeDomains: ExamPracticeDomain[] = [
  {
    id: "domain-01",
    slug: "secure-architectures",
    domainNumber: "01",
    title: { en: "Design Secure Architectures", vi: "Design Secure Architectures" },
    description: { en: "Identity, encryption, and policy decisions", vi: "Danh tính, mã hóa và quyết định policy" },
    topics: ["IAM", "KMS", "Encryption", "Policies"],
    questionCount: 64,
    href: "/practice?domain=secure-architectures",
    tone: "secure",
  },
  {
    id: "domain-02",
    slug: "resilient-architectures",
    domainNumber: "02",
    title: { en: "Design Resilient Architectures", vi: "Design Resilient Architectures" },
    description: { en: "Availability, recovery, and decoupling", vi: "Tính sẵn sàng, phục hồi và decoupling" },
    topics: ["Multi-AZ", "DR", "Decoupling", "HA"],
    questionCount: 78,
    href: "/practice?domain=resilient-architectures",
    tone: "resilient",
  },
  {
    id: "domain-03",
    slug: "high-performing-architectures",
    domainNumber: "03",
    title: { en: "Design High-Performing Architectures", vi: "Design High-Performing Architectures" },
    description: { en: "Choosing the right compute, data, and network path", vi: "Chọn đúng compute, data và network path" },
    topics: ["Compute", "Storage", "Database", "Networking"],
    questionCount: 72,
    href: "/practice?domain=high-performing-architectures",
    tone: "performance",
  },
  {
    id: "domain-04",
    slug: "cost-optimized-architectures",
    domainNumber: "04",
    title: { en: "Design Cost-Optimized Architectures", vi: "Design Cost-Optimized Architectures" },
    description: { en: "Pricing choices, scaling, and storage tiers", vi: "Lựa chọn pricing, scaling và storage tier" },
    topics: ["Pricing", "Scaling", "Storage tiers"],
    questionCount: 56,
    href: "/practice?domain=cost-optimized-architectures",
    tone: "cost",
  },
];

export const examPracticeCopy = {
  en: {
    eyebrow: "SAA-C03 EXAM PRACTICE",
    title: "Practice by domain, reason through every answer.",
    description: "I reorganized this question set around the four SAA-C03 domains. The goal is to understand why an answer works, not just remember it.",
    domainLabel: "DOMAIN",
    questions: "mock questions",
    cta: "Practice by domain",
  },
  vi: {
    eyebrow: "LUYỆN THI SAA-C03",
    title: "Luyện theo domain, hiểu rõ từng đáp án.",
    description: "Mình đã phân loại lại bộ câu hỏi luyện thi theo 4 domain của SAA-C03. Mục tiêu là hiểu vì sao đúng, không chỉ nhớ đáp án.",
    domainLabel: "DOMAIN",
    questions: "câu hỏi mẫu",
    cta: "Luyện theo 4 domain",
  },
} as const;

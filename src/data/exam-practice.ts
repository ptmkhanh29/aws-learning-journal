import type { LocalizedText } from "@/lib/i18n";

export type ExamPracticeDomain = {
  id: string;
  domainNumber: string;
  title: LocalizedText;
  mobileTitle: LocalizedText;
  topics: string[];
  mobileTopics: string[];
  questionCount: number;
  href: string;
  tone: "secure" | "resilient" | "performance" | "cost";
};

export const examPracticeDomains: ExamPracticeDomain[] = [
  {
    id: "domain-01",
    domainNumber: "01",
    title: { en: "Design Secure Architectures", vi: "Design Secure Architectures" },
    mobileTitle: { en: "Secure Architectures", vi: "Secure Architectures" },
    topics: ["IAM", "KMS", "Encryption", "Policies"],
    mobileTopics: ["IAM", "KMS"],
    questionCount: 64,
    href: "/practice?domain=secure-architectures",
    tone: "secure",
  },
  {
    id: "domain-02",
    domainNumber: "02",
    title: { en: "Design Resilient Architectures", vi: "Design Resilient Architectures" },
    mobileTitle: { en: "Resilient Architectures", vi: "Resilient Architectures" },
    topics: ["Multi-AZ", "DR", "Decoupling", "HA"],
    mobileTopics: ["Multi-AZ", "DR"],
    questionCount: 78,
    href: "/practice?domain=resilient-architectures",
    tone: "resilient",
  },
  {
    id: "domain-03",
    domainNumber: "03",
    title: { en: "Design High-Performing Architectures", vi: "Design High-Performing Architectures" },
    mobileTitle: { en: "High-Performing", vi: "High-Performing" },
    topics: ["Compute", "Storage", "Database", "Networking"],
    mobileTopics: ["Compute", "DB"],
    questionCount: 72,
    href: "/practice?domain=high-performing-architectures",
    tone: "performance",
  },
  {
    id: "domain-04",
    domainNumber: "04",
    title: { en: "Design Cost-Optimized Architectures", vi: "Design Cost-Optimized Architectures" },
    mobileTitle: { en: "Cost-Optimized", vi: "Cost-Optimized" },
    topics: ["Pricing", "Scaling", "Storage tiers"],
    mobileTopics: ["Pricing", "Scaling"],
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
    questionsShort: "questions",
  },
  vi: {
    eyebrow: "LUYỆN THI SAA-C03",
    title: "Luyện theo domain, hiểu rõ từng đáp án.",
    description: "Mình đã phân loại lại bộ câu hỏi luyện thi theo 4 domain của SAA-C03. Mục tiêu là hiểu vì sao đúng, không chỉ nhớ đáp án.",
    domainLabel: "DOMAIN",
    questions: "câu hỏi mẫu",
    questionsShort: "câu",
  },
} as const;

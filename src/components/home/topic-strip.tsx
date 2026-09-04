import Link from "next/link";
import type { Locale } from "@/lib/i18n";
import type { NotebookTopic } from "@/data/home";

export function TopicStrip({ locale, topics }: { locale: Locale; topics: NotebookTopic[] }) {
  return (
    <nav className="topic-strip" aria-label={locale === "vi" ? "Chủ đề AWS gần đây" : "Recent AWS topics"}>
      <span className="topic-strip-label">{locale === "vi" ? "Chủ đề" : "Topics"}</span>
      <div className="notebook-filters">
        {topics.map((topic) => (
          <Link className={`service-filter tone-${topic.tone}`} href={`/${locale}/aws`} key={topic.label}>
            <span className="service-emoji" aria-hidden="true">{topic.emoji}</span>
            <span>{topic.label}</span>
            <small>{String(topic.count).padStart(2, "0")}</small>
          </Link>
        ))}
      </div>
    </nav>
  );
}

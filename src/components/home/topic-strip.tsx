import Link from "next/link";
import { Archive, ChartLine, Cpu, Database, Globe, GlobeHemisphereWest, HashStraight, Lightning, Path, Queue, ShieldCheck, Table } from "@phosphor-icons/react/dist/ssr";
import type { Locale } from "@/lib/i18n";
import type { NotebookTopic } from "@/data/home";
import { EditorialSectionHeading } from "@/components/common/editorial-section-heading";

const topicIcons = {
  network: Globe,
  storage: Archive,
  compute: Cpu,
  security: ShieldCheck,
  database: Database,
  dns: Path,
  function: Lightning,
  cdn: GlobeHemisphereWest,
  table: Table,
  queue: Queue,
  monitoring: ChartLine,
};

export function TopicStrip({ locale, topics }: { locale: Locale; topics: NotebookTopic[] }) {
  return (
    <nav className="topic-strip" aria-label={locale === "vi" ? "Chủ đề" : "Topics"}>
      <EditorialSectionHeading
        compact
        title={locale === "vi" ? "Chủ đề" : "Topics"}
        icon={<HashStraight size={17} weight="regular" />}
      />
      <div className="topic-rail-shell">
        <div className="notebook-filters">
          {topics.map((topic) => {
            const Icon = topicIcons[topic.icon];
            const label = locale === "vi" ? topic.labelVi : topic.labelEn;
            return (
              <Link
                className={`service-filter tone-${topic.tone}`}
                href={`/${locale}/aws`}
                key={topic.id}
                aria-label={`${label}, ${topic.count} ${locale === "vi" ? "bài viết" : "posts"}`}
              >
                <Icon size={14} weight="regular" aria-hidden="true" />
                <span className="service-filter-label">{label}</span>
                <span className="service-filter-count" aria-hidden="true">{String(topic.count).padStart(2, "0")}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

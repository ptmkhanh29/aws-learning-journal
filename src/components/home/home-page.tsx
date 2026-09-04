import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  GithubLogo,
  LinkedinLogo,
  NotePencil,
  PencilSimpleLine,
  Target,
  TerminalWindow,
} from "@phosphor-icons/react/dist/ssr";
import { homeCopy, homeProfile, notebookFilters } from "@/data/home";
import { examPracticeCopy, examPracticeDomains } from "@/data/exam-practice";
import { journalEntries, type JournalEntry } from "@/data/journal";
import { labs } from "@/data/labs";
import { notes } from "@/data/notes";
import { text, type Locale } from "@/lib/i18n";
import { Tag } from "@/components/common/tag";
import { EditorialSectionHeading } from "@/components/common/editorial-section-heading";
import { TopicStrip } from "@/components/home/topic-strip";
import { NotebookNavigationGroups } from "@/components/layout/notebook-navigation";

function NotebookNavigation({ locale }: { locale: Locale }) {
  const copy = homeCopy[locale];

  return (
    <aside className="home-left" aria-label={copy.navigation}>
      <NotebookNavigationGroups locale={locale} />
    </aside>
  );
}

function EntryMeta({ entry, locale }: { entry: JournalEntry; locale: Locale }) {
  const copy = homeCopy[locale];
  return (
    <div className="home-entry-meta">
      <span>{entry.type}</span>
      <span>{entry.month[locale].split(" ")[0]} {entry.date}</span>
      <span>{entry.minutes} {copy.minRead}</span>
    </div>
  );
}

function FeaturedEntry({ entry, locale }: { entry: JournalEntry; locale: Locale }) {
  const copy = homeCopy[locale];
  return (
    <article className="featured-entry">
      <Link className="featured-entry-media" href={`/${locale}/journal`} aria-label={text(entry.title, locale)}>
        <Image
          src="/images/journal-desk.webp"
          alt=""
          width={1536}
          height={1024}
          preload
          sizes="(max-width: 780px) calc(100vw - 32px), (max-width: 1180px) calc(100vw - 270px), 660px"
        />
      </Link>
      <div className="featured-entry-body">
        <EntryMeta entry={entry} locale={locale} />
        <h3><Link href={`/${locale}/journal`}>{text(entry.title, locale)}</Link></h3>
        <p>{text(entry.excerpt, locale)}</p>
        <div className="featured-entry-footer">
          <div className="tag-row">{entry.tags.map((tag) => <Tag key={tag}>{tag}</Tag>)}</div>
          <Link href={`/${locale}/journal`}>{copy.read}<ArrowRight size={15} weight="regular" aria-hidden="true" /></Link>
        </div>
      </div>
    </article>
  );
}

function SectionAction({ href, label }: { href: string; label: string }) {
  return <Link className="home-section-action" href={href}>{label}<ArrowRight size={15} weight="regular" aria-hidden="true" /></Link>;
}

function ExamPracticeFeature({ locale }: { locale: Locale }) {
  const copy = examPracticeCopy[locale];
  return (
    <section className="exam-practice-feature" aria-labelledby="exam-practice-title">
      <div className="exam-practice-intro">
        <p className="exam-practice-eyebrow"><Target size={14} weight="regular" aria-hidden="true" />{copy.eyebrow}</p>
        <h1 id="exam-practice-title">{copy.title}</h1>
        <p className="exam-practice-description">{copy.description}</p>
      </div>
      <div className="exam-domain-list">
        {examPracticeDomains.map((domain) => (
          <Link className="exam-domain-row" href={`/${locale}${domain.href}`} key={domain.id}>
            <span className="exam-domain-index">
              <span>{domain.domainNumber}</span>
              <i className={`exam-domain-dot tone-${domain.tone}`} aria-hidden="true" />
              <span>{copy.domainLabel} {Number(domain.domainNumber)}</span>
            </span>
            <span className="exam-domain-copy">
              <strong>
                <span className="exam-domain-title-desktop">{text(domain.title, locale)}</span>
                <span className="exam-domain-title-mobile">{text(domain.mobileTitle, locale)}</span>
              </strong>
              <small>
                <span className="exam-domain-topics-desktop">{domain.topics.join(" · ")}</span>
                <span className="exam-domain-topics-mobile">{domain.mobileTopics.join(" · ")}</span>
              </small>
            </span>
            <span className="exam-question-count">
              {domain.questionCount} <span className="exam-question-label-desktop">{copy.questions}</span><span className="exam-question-label-mobile">{copy.questionsShort}</span>
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

function ProfileSidebar({ locale }: { locale: Locale }) {
  const copy = homeCopy[locale];
  return (
    <aside className="home-right">
      <section className="profile-card">
        <p className="side-label">{copy.about}</p>
        <div className="profile-avatar-wrap">
          <Image className="profile-image" src="/images/minh-khanh-profile.svg" width={220} height={220} alt="Khanh Phan" />
        </div>
        <div className="profile-identity">
          <h2 className="profile-name">{homeProfile.name}</h2>
          <p className="profile-role">{homeProfile.direction}</p>
        </div>
        <p className="profile-bio">{text(homeProfile.bio, locale)}</p>
        <div className="profile-social-actions">
          <a className="profile-social-button profile-social-github" href="https://github.com/" target="_blank" rel="noreferrer"><GithubLogo size={16} weight="fill" aria-hidden="true" />{copy.github}</a>
          <a className="profile-social-button profile-social-linkedin" href="https://www.linkedin.com/" target="_blank" rel="noreferrer"><LinkedinLogo size={16} weight="fill" aria-hidden="true" />LinkedIn</a>
        </div>
        <Link className="profile-cv-link" href={`/${locale}/about#cv`}>{copy.cv}</Link>
      </section>
      <section className="now-block">
        <p className="side-label">{copy.now}</p>
        <div className="now-status"><span aria-hidden="true" /><div><small>{copy.studying}</small><strong>{homeProfile.certification}</strong></div></div>
        <div className="focus-list"><small>{copy.focus}</small>{homeProfile.focus.map((item) => <span key={item}>{item}</span>)}</div>
      </section>
    </aside>
  );
}

export function HomePage({ locale }: { locale: Locale }) {
  const copy = homeCopy[locale];
  const featuredLab = labs[0];
  return (
    <div className="home-page">
      <div className="home-shell">
        <NotebookNavigation locale={locale} />
        <main className="home-main">
          <ExamPracticeFeature locale={locale} />
          <TopicStrip locale={locale} topics={notebookFilters} />

          <section className="home-content-section latest-section">
            <EditorialSectionHeading
              title={copy.latest}
              icon={<PencilSimpleLine size={21} weight="regular" />}
            />
            <FeaturedEntry entry={journalEntries[0]} locale={locale} />
            <SectionAction href={`/${locale}/journal`} label={copy.allEntries} />
          </section>

          <section className="home-content-section notes-section">
            <EditorialSectionHeading
              title={copy.recentNotes}
              icon={<NotePencil size={21} weight="regular" />}
            />
            <div className="home-notes-list">
              {notes.slice(0, 4).map((note) => (
                <article key={note.slug}>
                  <div><p>{note.service} · {note.minutes} {copy.minRead}</p><h3><Link href={note.slug === "s3-storage-classes" ? `/${locale}/notes/${note.slug}` : `/${locale}/notes`}>{text(note.title, locale)}</Link></h3></div>
                  <time>{note.date}</time>
                </article>
              ))}
            </div>
            <SectionAction href={`/${locale}/notes`} label={copy.allNotes} />
          </section>

          <section className="home-content-section lab-section">
            <EditorialSectionHeading
              title={copy.recentLab}
              icon={<TerminalWindow size={21} weight="regular" />}
            />
            <article className="home-lab-card">
              <div className="home-lab-media"><Image src={featuredLab.image ?? "/images/network-lab.webp"} alt="" width={1536} height={1024} sizes="(max-width: 780px) calc(100vw - 32px), 660px" /></div>
              <div className="home-lab-copy">
                <div className="lab-status"><span />{copy.complete}<time>{featuredLab.date}</time></div>
                <h3><Link href={`/${locale}/labs`}>{text(featuredLab.title, locale)}</Link></h3>
                <div className="home-lab-details">
                  <p>{text(featuredLab.description, locale)}</p>
                  <div className="home-lab-links"><div className="tag-row">{featuredLab.services.map((service) => <Tag key={service}>{service}</Tag>)}</div><Link href={`/${locale}/labs`}>{copy.viewLab}<ArrowRight size={15} weight="regular" aria-hidden="true" /></Link></div>
                </div>
              </div>
            </article>
            <SectionAction href={`/${locale}/labs`} label={copy.allLabs} />
          </section>
        </main>
        <ProfileSidebar locale={locale} />
      </div>
    </div>
  );
}

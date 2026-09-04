import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  BookOpenText,
  CaretRight,
  FileText,
  Flask,
  GithubLogo,
  Lightbulb,
  LinkedinLogo,
  NotePencil,
  Target,
} from "@phosphor-icons/react/dist/ssr";
import { homeCopy, homeNavigation, homeProfile, notebookFilters, type HomeNavItem } from "@/data/home";
import { examPracticeCopy, examPracticeDomains } from "@/data/exam-practice";
import { journalEntries, type JournalEntry } from "@/data/journal";
import { labs } from "@/data/labs";
import { notes } from "@/data/notes";
import { text, type Locale } from "@/lib/i18n";
import { Tag } from "@/components/common/tag";
import { TopicStrip } from "@/components/home/topic-strip";

const navigationIcons = {
  journal: BookOpenText,
  notes: NotePencil,
  labs: Flask,
  tips: Lightbulb,
  docs: FileText,
  practice: Target,
};

function NavigationItem({ item, locale }: { item: HomeNavItem; locale: Locale }) {
  const Icon = item.icon ? navigationIcons[item.icon] : null;
  return (
    <Link href={`/${locale}${item.href}`}>
      {Icon ? <Icon size={17} weight="regular" aria-hidden="true" /> : <span className="nav-index" aria-hidden="true" />}
      <span>{text(item.label, locale)}</span>
    </Link>
  );
}

function NotebookNavigation({ locale }: { locale: Locale }) {
  const copy = homeCopy[locale];
  const content = homeNavigation.map((group) => (
    <section className="home-nav-group" key={group.label.en}>
      <h2>{text(group.label, locale)}</h2>
      <nav aria-label={text(group.label, locale)}>
        {group.items.map((item) => <NavigationItem item={item} locale={locale} key={item.label.en} />)}
      </nav>
    </section>
  ));

  return (
    <aside className="home-left" aria-label={copy.navigation}>
      <div className="desktop-home-nav">{content}</div>
      <details className="mobile-home-nav">
        <summary>{copy.openNavigation}<CaretRight size={16} aria-hidden="true" /></summary>
        <div>{content}</div>
      </details>
    </aside>
  );
}

function SectionHeading({ title, href, link }: { title: string; href: string; link: string }) {
  return (
    <div className="home-section-heading">
      <h2>{title}</h2>
      <Link href={href}>{link}</Link>
    </div>
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
          <Link href={`/${locale}/journal`}>{copy.read}<ArrowRight size={15} aria-hidden="true" /></Link>
        </div>
      </div>
    </article>
  );
}

function JournalPreview({ entry, locale }: { entry: JournalEntry; locale: Locale }) {
  return (
    <article className="journal-preview">
      <EntryMeta entry={entry} locale={locale} />
      <h3><Link href={`/${locale}/journal`}>{text(entry.title, locale)}</Link></h3>
    </article>
  );
}

function ExamPracticeFeature({ locale }: { locale: Locale }) {
  const copy = examPracticeCopy[locale];
  return (
    <section className="exam-practice-feature" aria-labelledby="exam-practice-title">
      <div className="exam-practice-intro">
        <p className="exam-practice-eyebrow">{copy.eyebrow}</p>
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
              <strong>{text(domain.title, locale)}</strong>
              <small>{domain.topics.join(" · ")}</small>
            </span>
            <span className="exam-question-count">{domain.questionCount} {copy.questions}</span>
          </Link>
        ))}
      </div>
      <div className="exam-practice-footer">
        <Link className="exam-practice-cta" href={`/${locale}/practice`}>
          {copy.cta}<ArrowRight size={16} aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}

function ProfileSidebar({ locale }: { locale: Locale }) {
  const copy = homeCopy[locale];
  return (
    <aside className="home-right">
      <section className="profile-card">
        <div className="profile-heading">
          <p className="side-label">{copy.about}</p>
          <span>{copy.profileNote}</span>
        </div>
        <div className="profile-avatar-wrap">
          <Image className="profile-image" src="/images/minh-khanh-profile.svg" width={220} height={220} alt="Minh Khanh" />
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
        <Link className="profile-cv-link" href={`/${locale}/about#cv`}>{copy.cv}<ArrowUpRight size={14} aria-hidden="true" /></Link>
      </section>
      <section className="now-block">
        <p className="side-label">{copy.now}</p>
        <div className="now-status"><span aria-hidden="true" /><div><small>{copy.studying}</small><strong>{homeProfile.certification}</strong></div></div>
        <div className="focus-list"><small>{copy.focus}</small>{homeProfile.focus.map((item) => <span key={item}>{item}</span>)}</div>
      </section>
      <div className="sidebar-note" aria-hidden="true"><span>01</span><i /><span>BUILD · BREAK · WRITE</span></div>
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
            <SectionHeading title={copy.latest} link={copy.allEntries} href={`/${locale}/journal`} />
            <FeaturedEntry entry={journalEntries[0]} locale={locale} />
            <div className="journal-preview-list">{journalEntries.slice(1, 3).map((entry) => <JournalPreview key={entry.slug} entry={entry} locale={locale} />)}</div>
          </section>

          <section className="home-content-section">
            <SectionHeading title={copy.recentNotes} link={copy.allNotes} href={`/${locale}/notes`} />
            <div className="home-notes-list">
              {notes.slice(0, 4).map((note, index) => (
                <article key={note.slug}>
                  <span className="note-number">{String(index + 1).padStart(2, "0")}</span>
                  <div><p>{note.service} · {note.minutes} {copy.minRead}</p><h3><Link href={note.slug === "s3-storage-classes" ? `/${locale}/notes/${note.slug}` : `/${locale}/notes`}>{text(note.title, locale)}</Link></h3></div>
                  <time>{note.date}</time>
                </article>
              ))}
            </div>
          </section>

          <section className="home-content-section">
            <SectionHeading title={copy.recentLab} link={copy.allLabs} href={`/${locale}/labs`} />
            <article className="home-lab-card">
              <div className="home-lab-media"><Image src={featuredLab.image ?? "/images/network-lab.webp"} alt="" width={1536} height={1024} sizes="(max-width: 780px) calc(100vw - 32px), 660px" /></div>
              <div className="home-lab-copy">
                <div className="lab-status"><span />{copy.complete}<time>{featuredLab.date}</time></div>
                <h3>{text(featuredLab.title, locale)}</h3>
                <p>{text(featuredLab.description, locale)}</p>
                <div className="featured-entry-footer"><div className="tag-row">{featuredLab.services.map((service) => <Tag key={service}>{service}</Tag>)}</div><Link href={`/${locale}/labs`}>{copy.viewLab}</Link></div>
              </div>
            </article>
          </section>
        </main>
        <ProfileSidebar locale={locale} />
      </div>
    </div>
  );
}

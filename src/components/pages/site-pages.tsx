import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BookOpenText, Flask, Target } from "@phosphor-icons/react/dist/ssr";
import { journalEntries, type JournalEntry } from "@/data/journal";
import { labs } from "@/data/labs";
import { serviceGroups, type LearningState } from "@/data/aws-services";
import { domainScores, practiceStats, recurringMistakes } from "@/data/practice";
import { dictionary, text, type Locale } from "@/lib/i18n";
import { Tag } from "@/components/common/tag";
import { PageIntro } from "@/components/common/page-intro";
import { NotesExplorer } from "@/components/notes/notes-explorer";
import { PracticeDemo } from "@/components/practice/practice-demo";
import { AuthForm } from "@/components/auth/auth-form";

function SectionHeading({ title, link, href }: { title: string; link?: string; href?: string }) {
  return <div className="section-heading"><h2>{title}</h2>{link && href ? <Link href={href}>{link}<ArrowRight size={17} /></Link> : null}</div>;
}

function JournalRow({ entry, locale, compact = false }: { entry: JournalEntry; locale: Locale; compact?: boolean }) {
  const d = dictionary[locale];
  return <article className={`journal-row ${compact ? "compact" : ""}`}><time>{entry.month[locale].split(" ")[0]} {entry.date}</time><div><div className="entry-type">{entry.type}</div><h3>{text(entry.title, locale)}</h3>{compact ? null : <p>{text(entry.excerpt, locale)}</p>}<div className="entry-footer"><div className="tag-row">{entry.tags.map((tag) => <Tag key={tag}>{tag}</Tag>)}</div><Link href={`/${locale}/journal`}>{d.read}<ArrowRight size={16} /></Link></div></div></article>;
}

export function JournalPage({ locale }: { locale: Locale }) {
  const vi = locale === "vi";
  return <div className="content-shell page-space"><PageIntro kicker={vi ? "Dòng thời gian học tập" : "Learning timeline"} title={vi ? "Nhật ký" : "Journal"} description={vi ? "Tôi đã học như thế nào, vướng ở đâu và điều gì làm kiến thức trở nên rõ ràng." : "How I learned, where I got stuck, and what finally made the idea clear."} /><div className="timeline">{[...new Set(journalEntries.map((entry) => entry.month[locale]))].map((month) => <section key={month}><h2>{month}</h2><div>{journalEntries.filter((entry) => entry.month[locale] === month).map((entry) => <JournalRow key={entry.slug} entry={entry} locale={locale} />)}</div></section>)}</div></div>;
}

export function NotesPage({ locale }: { locale: Locale }) {
  const vi = locale === "vi";
  return <div className="content-shell page-space"><PageIntro kicker={vi ? "Kiến thức đã chắt lọc" : "Distilled knowledge"} title={vi ? "Ghi chú" : "Notes"} description={vi ? "Sau khi thử, sai và đọc lại, đây là cách tôi đang hiểu các dịch vụ và quyết định kiến trúc AWS." : "After testing, missing, and reading again, this is how I currently understand AWS services and architecture decisions."} /><NotesExplorer locale={locale} /></div>;
}

const stateLabels: Record<LearningState, Record<Locale, string>> = { comfortable: { en: "Comfortable", vi: "Đã khá chắc" }, learning: { en: "Learning", vi: "Đang học" }, "not-studied": { en: "Not studied", vi: "Chưa học" } };
export function AwsPage({ locale }: { locale: Locale }) {
  const vi = locale === "vi";
  return <div className="content-shell page-space"><PageIntro kicker={vi ? "Bản đồ kiến thức" : "Knowledge map"} title="AWS" description={vi ? "Một mục lục sống cho các dịch vụ tôi đã gặp. Trạng thái chỉ phản ánh mức tự tin hiện tại, không phải điểm số." : "A living index of services I have met. Each state reflects current confidence, not a grade."} /><div className="state-legend">{(["comfortable", "learning", "not-studied"] as LearningState[]).map((state) => <span key={state} className={`state ${state}`}><i />{stateLabels[state][locale]}</span>)}</div><div className="service-map">{serviceGroups.map((group) => <section key={group.domain.en}><div className="service-heading"><h2>{text(group.domain, locale)}</h2><span>{group.noteCount} {vi ? "ghi chú" : "notes"}</span></div><div className="service-list">{group.services.map((service) => <div key={service.name}><span>{service.name}</span><span className={`state ${service.state}`}><i />{stateLabels[service.state][locale]}</span><small>{service.noteCount}</small></div>)}</div></section>)}</div></div>;
}

export function LabsPage({ locale }: { locale: Locale }) {
  const vi = locale === "vi";
  const status = { complete: vi ? "Hoàn thành" : "Complete", revisit: vi ? "Cần làm lại" : "Revisit", planned: vi ? "Đã lên kế hoạch" : "Planned" };
  return <div className="content-shell page-space"><PageIntro kicker={vi ? "Học bằng cách xây" : "Learn by building"} title={vi ? "Labs" : "Labs"} description={vi ? "Những bài thực hành nhỏ dùng để kiểm chứng mental model, không phải portfolio hoàn hảo." : "Small builds used to test a mental model, not polished portfolio pieces."} /><div className="labs-list">{labs.map((lab, index) => <article key={lab.slug} className={index === 0 ? "lab-feature" : "lab-row"}>{lab.image ? <Image src={lab.image} alt="" width={1536} height={1024} sizes="(max-width: 800px) 100vw, 45vw" /> : null}<div><div className="lab-meta"><span>{status[lab.status]}</span><span>{lab.date}</span></div><h2>{text(lab.title, locale)}</h2><p>{text(lab.description, locale)}</p><div className="tag-row">{lab.services.map((service) => <Tag key={service}>{service}</Tag>)}</div></div></article>)}</div></div>;
}

export function AboutPage({ locale }: { locale: Locale }) {
  const vi = locale === "vi";
  return <div className="article-shell page-space"><PageIntro kicker={vi ? "Về project này" : "About this project"} title={vi ? "Một khu vườn kiến thức đang lớn dần." : "A knowledge garden that is still growing."} description={vi ? "Tôi tạo website này để biến quá trình học AWS thành những ghi chú có thể quay lại, sửa và nối với nhau." : "I made this site to turn AWS study into notes I can revisit, correct, and connect over time."} /><div className="about-body"><section><h2>{vi ? "Tại sao viết công khai" : "Why write in public"}</h2><p>{vi ? "Một câu trả lời đúng không cho thấy tôi đã hiểu đúng. Viết lại bằng lời của mình buộc tôi phải nhìn thấy các khoảng trống và giả định mơ hồ." : "A correct answer does not prove I understood the reason. Rewriting it in my own words exposes gaps and vague assumptions."}</p></section><section><h2>{vi ? "Hiện tại" : "Right now"}</h2><dl><div><dt>{vi ? "Mục tiêu" : "Target"}</dt><dd>AWS SAA-C03</dd></div><div><dt>{vi ? "Trọng tâm" : "Focus"}</dt><dd>VPC, S3, resilience</dd></div><div><dt>Stack</dt><dd>Next.js, TypeScript, Tailwind CSS</dd></div></dl></section><section><h2>{vi ? "Một nguyên tắc" : "One rule"}</h2><blockquote>{vi ? "Nếu không thể giải thích bằng một sơ đồ đơn giản, tôi vẫn chưa hiểu đủ rõ." : "If I cannot explain it with a simple diagram, I do not understand it clearly enough yet."}</blockquote></section></div></div>;
}

export function ArticlePage({ locale }: { locale: Locale }) {
  const vi = locale === "vi";
  return <article className="article-shell article-page"><nav className="breadcrumbs" aria-label="Breadcrumb"><Link href={`/${locale}/aws`}>AWS</Link><span>/</span><Link href={`/${locale}/notes`}>{vi ? "Lưu trữ" : "Storage"}</Link><span>/</span><span>S3</span></nav><header className="article-header"><h1>{vi ? "S3 Storage Classes: mô hình ra quyết định" : "S3 Storage Classes: a decision model"}</h1><p>{vi ? "Ghi chú từ quá trình ôn SAA-C03" : "Notes from my SAA-C03 practice"}</p><div><time>Sep 03, 2026</time><span>{vi ? "8 phút đọc" : "8 min read"}</span></div></header><Image className="article-image" src="/images/storage-study.webp" alt={vi ? "Các hộp lưu trữ gợi nhắc nhiều tầng truy cập dữ liệu" : "Archive boxes suggesting different tiers of data access"} width={1536} height={1024} priority sizes="(max-width: 900px) 100vw, 820px" /><div className="article-prose"><p>{vi ? "Trước đây tôi chọn storage class bằng cách tìm một từ khóa trong đề bài. Cách đó hoạt động cho tới khi hai đáp án đều có vẻ hợp lý." : "I used to choose a storage class by spotting one keyword in the question. That worked until two answers looked equally reasonable."}</p><h2>{vi ? "Mental model" : "Mental model"}</h2><p>{vi ? "Hãy bắt đầu bằng ba câu hỏi: dữ liệu được đọc bao lâu một lần, lần đọc đầu tiên phải nhanh tới mức nào và bạn sẵn sàng cam kết lưu tối thiểu trong bao lâu?" : "Start with three questions: how often is the data read, how quickly must the first read begin, and how long can you commit to storing it?"}</p><div className="callout"><strong>{vi ? "Điều tôi luôn hiểu sai" : "What I kept getting wrong"}</strong><p>{vi ? "Standard-IA không chỉ đơn giản là S3 rẻ hơn. Bạn đổi chi phí lưu trữ thấp hơn để lấy retrieval fee và minimum storage duration." : "Standard-IA is not simply cheaper S3. Lower storage cost comes with retrieval charges and a minimum storage duration."}</p></div><h2>{vi ? "Khi nào Glacier hợp lý" : "When Glacier makes sense"}</h2><p>{vi ? "Glacier hợp lý khi retrieval là một sự kiện có kế hoạch hoặc hiếm gặp. Instant Retrieval dành cho dữ liệu archive nhưng vẫn cần millisecond access. Flexible Retrieval và Deep Archive chấp nhận thời gian chờ dài hơn để giảm chi phí." : "Glacier makes sense when retrieval is planned or rare. Instant Retrieval covers archive data that still needs millisecond access. Flexible Retrieval and Deep Archive trade longer waits for lower cost."}</p><h2>{vi ? "Ghi chú cho đề thi" : "Exam note"}</h2><pre><code>{`access frequency -> retrieval time -> retention period -> retrieval cost`}</code></pre><p>{vi ? "Nếu đề bài nhấn mạnh mẫu truy cập không dự đoán được, Intelligent-Tiering thường đáng xem xét. Nhưng hãy kiểm tra phí monitoring và điều kiện của từng tier trước khi chọn." : "If the question stresses an unpredictable access pattern, Intelligent-Tiering is worth checking. Still verify monitoring charges and tier conditions before choosing it."}</p></div></article>;
}

export function PracticePage({ locale }: { locale: Locale }) {
  const vi = locale === "vi";
  return <div className="content-shell page-space"><PageIntro kicker={vi ? "Tự kiểm tra" : "Self-check"} title={vi ? "Ôn tập" : "Practice"} description={vi ? "Một góc nhỏ để nhận ra những điểm yếu lặp lại. Đây không phải exam engine hay bảng xếp hạng." : "A small place to notice recurring weak spots. It is not an exam engine or a leaderboard."} /><section className="practice-summary"><div className="practice-lead"><Target size={30} /><strong>{practiceStats.accuracy}%</strong><span>{vi ? "độ chính xác qua" : "accuracy across"} {practiceStats.answered} {vi ? "câu hỏi" : "questions"}</span><Link className="button" href={`/${locale}/practice/demo`}>{vi ? "Tiếp tục ôn" : "Continue practice"}<ArrowRight size={18} /></Link></div><div className="practice-small-stats"><div><strong>{practiceStats.review}</strong><span>{vi ? "câu cần xem lại" : "questions to review"}</span></div><div><strong>4</strong><span>{vi ? "chủ đề hay nhầm" : "recurring topics"}</span></div></div></section><section className="practice-domains"><SectionHeading title={vi ? "Theo domain" : "By domain"} /><div>{domainScores.map((domain) => <div key={domain.label.en}><span>{text(domain.label, locale)}</span><strong>{domain.score}%</strong><i style={{ width: `${domain.score}%` }} /></div>)}</div></section><section className="mistakes"><SectionHeading title={vi ? "Những điều tôi hay nhầm" : "Things I keep getting wrong"} /><div>{recurringMistakes.map((item, index) => <div key={item}><span>{String(index + 1).padStart(2, "0")}</span><strong>{item}</strong><Link href={`/${locale}/notes`}>{vi ? "Ôn lại" : "Review"}<ArrowRight size={15} /></Link></div>)}</div></section></div>;
}

export function PracticeDemoPage({ locale }: { locale: Locale }) {
  const vi = locale === "vi";
  return <div className="article-shell page-space"><PageIntro kicker={vi ? "Bản demo tương tác" : "Interactive prototype"} title={vi ? "Câu hỏi luyện tập" : "Practice question"} description={vi ? "Chọn một đáp án để xem trạng thái phản hồi và phần giải thích mẫu." : "Choose an answer to review the response state and sample explanation."} /><PracticeDemo locale={locale} /></div>;
}

export function AuthPage({ locale, mode }: { locale: Locale; mode: "login" | "signup" }) {
  const vi = locale === "vi";
  const signup = mode === "signup";
  return <div className="auth-page"><div className="auth-copy"><p className="kicker">{vi ? "Prototype frontend" : "Frontend prototype"}</p><h1>{signup ? (vi ? "Tạo một tài khoản demo." : "Create a demo account.") : (vi ? "Trở lại nhật ký." : "Return to the journal.")}</h1><p>{vi ? "Form này chỉ cho phép review trạng thái giao diện đã đăng nhập. Không có backend hoặc authentication thật." : "This form exists only to review the signed-in interface. There is no backend or real authentication."}</p><AuthForm locale={locale} mode={mode} /><p className="auth-switch">{signup ? (vi ? "Đã có tài khoản?" : "Already have an account?") : (vi ? "Chưa có tài khoản?" : "New here?")} <Link href={`/${locale}/${signup ? "login" : "signup"}`}>{signup ? (vi ? "Đăng nhập" : "Log in") : (vi ? "Tạo tài khoản" : "Create one")}</Link></p></div><aside className="auth-aside"><BookOpenText size={34} /><blockquote>{vi ? "Ghi lại điều mình hiểu sai cũng quan trọng như lưu điều mình đã hiểu đúng." : "Keeping track of what I misunderstood matters as much as recording what I got right."}</blockquote><div><Flask size={18} /><span>{vi ? "Mock data, không gửi thông tin" : "Mock data, nothing is submitted"}</span></div></aside></div>;
}

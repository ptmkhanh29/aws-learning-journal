import Link from "next/link";
import { FileText, GithubLogo, LinkedinLogo } from "@phosphor-icons/react/dist/ssr";
import { dictionary, type Locale } from "@/lib/i18n";
import { BrandMark } from "@/components/layout/brand-mark";

export function Footer({ locale }: { locale: Locale }) {
  const d = dictionary[locale];
  const vi = locale === "vi";
  const exploreLinks = [
    { label: d.nav.journal, href: "journal" },
    { label: d.nav.notes, href: "notes" },
    { label: d.nav.labs, href: "labs" },
  ];
  const topicLinks = [
    { label: "AWS", href: "aws" },
    { label: "Cloudflare", href: "notes" },
    { label: "WordPress", href: "notes" },
    { label: "DevOps", href: "labs" },
  ];
  return (
    <footer className="site-footer" id="site-footer">
      <div className="footer-inner">
        <section className="footer-closing">
          <Link href={`/${locale}`} className="footer-brand"><BrandMark className="footer-brand-mark" /><span>{d.siteName}</span></Link>
          <p className="footer-statement">{d.footerLine}</p>
          <span className="footer-signature">BUILD · BREAK · WRITE</span>
        </section>
        <div className="footer-links">
          <section className="footer-navigation">
            <h2>{vi ? "Khám phá" : "Explore"}</h2>
            <nav aria-label={vi ? "Khám phá" : "Explore"}>
              {exploreLinks.map((item) => <Link key={item.href} href={`/${locale}/${item.href}`}>{item.label}</Link>)}
            </nav>
          </section>
          <section className="footer-navigation">
            <h2>{vi ? "Chủ đề" : "Topics"}</h2>
            <nav aria-label={vi ? "Chủ đề" : "Topics"}>
              {topicLinks.map((item) => <Link key={item.label} href={`/${locale}/${item.href}`}>{item.label}</Link>)}
            </nav>
          </section>
          <section className="footer-socials">
            <h2>{vi ? "Kết nối" : "Elsewhere"}</h2>
            <a href="https://github.com/" target="_blank" rel="noreferrer"><GithubLogo size={16} weight="fill" aria-hidden="true" />GitHub</a>
            <a href="https://www.linkedin.com/" target="_blank" rel="noreferrer"><LinkedinLogo size={16} weight="fill" aria-hidden="true" />LinkedIn</a>
            <Link href={`/${locale}/about#cv`}><FileText size={16} weight="regular" aria-hidden="true" />CV</Link>
          </section>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© 2026 Khanh Phan</span>
        <Link href={`/${locale === "en" ? "vi" : "en"}`}>{locale === "en" ? "Tiếng Việt" : "English"}</Link>
      </div>
    </footer>
  );
}

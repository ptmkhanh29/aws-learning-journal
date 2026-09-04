import Link from "next/link";
import { FileText, GithubLogo, LinkedinLogo } from "@phosphor-icons/react/dist/ssr";
import { dictionary, type Locale } from "@/lib/i18n";

export function Footer({ locale }: { locale: Locale }) {
  const d = dictionary[locale];
  const vi = locale === "vi";
  const links = [
    { label: d.nav.journal, href: "journal" },
    { label: d.nav.notes, href: "notes" },
    { label: d.nav.labs, href: "labs" },
    { label: vi ? "Mẹo" : "Tips", href: "notes" },
    { label: vi ? "Tài liệu" : "Docs", href: "aws" },
    { label: d.nav.practice, href: "practice" },
  ];
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-intro">
          <Link href={`/${locale}`} className="footer-brand">{d.siteName}</Link>
          <p>{d.footerLine}</p>
        </div>
        <div className="footer-navigation">
          <p>{vi ? "Đọc tiếp" : "Keep reading"}</p>
          <nav aria-label={vi ? "Điều hướng cuối trang" : "Footer navigation"}>
            {links.map((item) => <Link key={`${item.href}-${item.label}`} href={`/${locale}/${item.href}`}>{item.label}</Link>)}
          </nav>
        </div>
        <div className="footer-socials">
          <p>{vi ? "Kết nối" : "Elsewhere"}</p>
          <a href="https://github.com/" target="_blank" rel="noreferrer"><GithubLogo size={16} weight="fill" aria-hidden="true" />GitHub</a>
          <a href="https://www.linkedin.com/" target="_blank" rel="noreferrer"><LinkedinLogo size={16} weight="fill" aria-hidden="true" />LinkedIn</a>
          <Link href={`/${locale}/about#cv`}><FileText size={16} aria-hidden="true" />CV</Link>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© 2026 Minh Khanh</span>
        <Link href={`/${locale === "en" ? "vi" : "en"}`}>{locale === "en" ? "Tiếng Việt" : "English"}</Link>
      </div>
    </footer>
  );
}

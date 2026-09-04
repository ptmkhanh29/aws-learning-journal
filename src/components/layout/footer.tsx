import Link from "next/link";
import { dictionary, type Locale } from "@/lib/i18n";

export function Footer({ locale }: { locale: Locale }) {
  const d = dictionary[locale];
  const links = ["journal", "notes", "labs", "aws", "practice"] as const;
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div><Link href={`/${locale}`} className="footer-brand">{d.siteName}</Link><p>{d.footerLine}</p></div>
        <nav aria-label={locale === "en" ? "Footer navigation" : "Điều hướng cuối trang"}>
          {links.map((item) => <Link key={item} href={`/${locale}/${item}`}>{d.nav[item]}</Link>)}
          <a href="https://github.com/" target="_blank" rel="noreferrer">GitHub</a>
        </nav>
        <div className="footer-meta"><span>© 2026</span><Link href={`/${locale === "en" ? "vi" : "en"}`}>{locale === "en" ? "Tiếng Việt" : "English"}</Link></div>
      </div>
    </footer>
  );
}

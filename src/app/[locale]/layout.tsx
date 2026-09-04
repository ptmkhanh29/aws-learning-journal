import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { localeFrom, type LocalePageProps } from "@/lib/page";

export function generateStaticParams() { return [{ locale: "en" }, { locale: "vi" }]; }

export default async function LocaleLayout({ children, params }: LocalePageProps & { children: React.ReactNode }) {
  const locale = await localeFrom(params);
  return <div lang={locale} className="site-frame"><Header locale={locale} /><main id="main-content">{children}</main><Footer locale={locale} /></div>;
}

import { AboutPage } from "@/components/pages/site-pages";
import { localeFrom, type LocalePageProps } from "@/lib/page";

export default async function Page({ params }: LocalePageProps) { return <AboutPage locale={await localeFrom(params)} />; }

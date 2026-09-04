import { PracticePage } from "@/components/pages/site-pages";
import { localeFrom, type LocalePageProps } from "@/lib/page";

export default async function Page({ params }: LocalePageProps) { return <PracticePage locale={await localeFrom(params)} />; }

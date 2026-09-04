import { HomePage } from "@/components/home/home-page";
import { localeFrom, type LocalePageProps } from "@/lib/page";

export default async function Page({ params }: LocalePageProps) { return <HomePage locale={await localeFrom(params)} />; }

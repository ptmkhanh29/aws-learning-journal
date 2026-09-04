import { AuthPage } from "@/components/pages/site-pages";
import { localeFrom, type LocalePageProps } from "@/lib/page";

export default async function Page({ params }: LocalePageProps) { return <AuthPage locale={await localeFrom(params)} mode="signup" />; }

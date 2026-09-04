import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/lib/i18n";

export type LocalePageProps = { params: Promise<{ locale: string }> };

export async function localeFrom(params: LocalePageProps["params"]): Promise<Locale> {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return locale;
}

"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CaretDown, List, MagnifyingGlass, Moon, Sun, X } from "@phosphor-icons/react";
import { dictionary, pathForLocale, type Locale } from "@/lib/i18n";

const PREFS_KEY = "aws-journal:prefs:v1";
const AUTH_KEY = "aws-journal:auth:v1";
type SearchItem = { title: Record<Locale, string>; type: Record<Locale, string>; href: string; keywords: string };
const searchItems: SearchItem[] = [
  { title: { en: "S3 Storage Classes", vi: "Các lớp lưu trữ S3" }, type: { en: "Note", vi: "Ghi chú" }, href: "/notes/s3-storage-classes", keywords: "s3 storage glacier archive" },
  { title: { en: "VPC Gateway Endpoint", vi: "VPC Gateway Endpoint" }, type: { en: "Journal", vi: "Nhật ký" }, href: "/journal", keywords: "vpc endpoint private s3" },
  { title: { en: "ALB vs NLB", vi: "Phân biệt ALB và NLB" }, type: { en: "Note", vi: "Ghi chú" }, href: "/notes", keywords: "load balancer networking" },
  { title: { en: "Route 53 Failover", vi: "Route 53 Failover" }, type: { en: "Practice", vi: "Ôn tập" }, href: "/practice", keywords: "dns health check failover" },
  { title: { en: "Multi-AZ Architecture", vi: "Kiến trúc Multi-AZ" }, type: { en: "Lab", vi: "Thực hành" }, href: "/labs", keywords: "ec2 alb rds resilience" },
];

function JournalLogo() {
  return (
    <svg className="brand-logo" viewBox="0 0 36 36" role="img" aria-label="AWS Learning Journal logo">
      <rect x="3.5" y="3.5" width="29" height="29" rx="8" fill="var(--accent-soft)" stroke="currentColor" strokeWidth="1.6" />
      <path d="M10.5 12.5h7.2c4.5 0 7.8 2.4 7.8 6.8v5.2M10.5 12.5v12M10.5 24.5h7.7c4.3 0 7.3-2.1 7.3-5.2" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M14 8.5h8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="25.5" cy="24.5" r="2.2" fill="var(--accent-2)" />
    </svg>
  );
}

function ThemeToggle({ label }: { label: string }) {
  function toggleTheme() {
    const current = document.documentElement.dataset.theme === "dark" ? "dark" : "light";
    const theme = current === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
    try { const prefs = JSON.parse(localStorage.getItem(PREFS_KEY) || "{}"); localStorage.setItem(PREFS_KEY, JSON.stringify({ ...prefs, theme })); } catch {}
  }
  return <button className="icon-button theme-toggle" type="button" onClick={toggleTheme} aria-label={label}><Sun className="theme-sun" size={19} aria-hidden="true" /><Moon className="theme-moon" size={19} aria-hidden="true" /></button>;
}

function SearchDialog({ locale, open, onClose }: { locale: Locale; open: boolean; onClose: () => void }) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const d = dictionary[locale];
  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === "Escape") onClose(); };
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [open, onClose]);
  const results = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase(locale);
    return normalized ? searchItems.filter((item) => `${item.title[locale]} ${item.keywords}`.toLocaleLowerCase(locale).includes(normalized)) : searchItems;
  }, [locale, query]);
  if (!open) return null;
  return (
    <div className="dialog-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className="search-dialog" role="dialog" aria-modal="true" aria-labelledby="search-title">
        <div className="search-field"><MagnifyingGlass size={21} aria-hidden="true" /><label className="sr-only" htmlFor="global-search" id="search-title">{d.search}</label><input ref={inputRef} id="global-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder={locale === "en" ? "Search notes, labs, and questions" : "Tìm ghi chú, lab và câu hỏi"} /><button type="button" className="icon-button" onClick={onClose} aria-label={d.close}><X size={18} /></button></div>
        <div className="search-results" aria-live="polite">
          {results.length ? results.map((item) => <Link key={item.href + item.title.en} href={`/${locale}${item.href}`} onClick={onClose}><span>{item.title[locale]}</span><small>{item.type[locale]}</small></Link>) : <div className="empty-search"><MagnifyingGlass size={28} /><p>{d.noResults}</p></div>}
        </div>
        <p className="search-hint">{locale === "en" ? "Press Esc to close" : "Nhấn Esc để đóng"}</p>
      </section>
    </div>
  );
}

function AccountControl({ locale }: { locale: Locale }) {
  const [signedIn, setSignedIn] = useState(false);
  const [open, setOpen] = useState(false);
  const d = dictionary[locale];
  useEffect(() => {
    const sync = () => { try { setSignedIn(localStorage.getItem(AUTH_KEY) === "signed-in"); } catch {} };
    sync(); window.addEventListener("aws-journal-auth", sync); window.addEventListener("storage", sync);
    return () => { window.removeEventListener("aws-journal-auth", sync); window.removeEventListener("storage", sync); };
  }, []);
  if (!signedIn) return <div className="auth-links"><Link href={`/${locale}/login`}>{d.login}</Link><Link className="button button-small" href={`/${locale}/signup`}>{d.signup}</Link></div>;
  return <div className="account-menu"><button type="button" className="account-trigger" aria-expanded={open} onClick={() => setOpen((value) => !value)}><span className="avatar">KP</span><CaretDown size={14} /></button>{open ? <div className="account-popover">{[d.profile, d.progress, d.saved, d.wrong, d.settings].map((item) => <button key={item} type="button">{item}</button>)}<button type="button" onClick={() => { try { localStorage.removeItem(AUTH_KEY); } catch {} window.dispatchEvent(new Event("aws-journal-auth")); setOpen(false); }}>{d.signout}</button></div> : null}</div>;
}

export function Header({ locale }: { locale: Locale }) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const d = dictionary[locale];
  const nextLocale: Locale = locale === "en" ? "vi" : "en";
  const nav = ["journal", "notes", "labs", "aws", "practice", "about"] as const;
  const searchPlaceholder = locale === "en" ? "Search notes, labs, and questions" : "Tìm ghi chú, lab và câu hỏi";
  useEffect(() => {
    const openSearch = (event: KeyboardEvent) => {
      const target = event.target;
      const isTyping = target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || (target instanceof HTMLElement && target.isContentEditable);
      if (event.key !== "/" || isTyping || event.metaKey || event.ctrlKey || event.altKey) return;
      event.preventDefault();
      setSearchOpen(true);
    };
    document.addEventListener("keydown", openSearch);
    return () => document.removeEventListener("keydown", openSearch);
  }, []);
  return <>
    <header className="site-header">
      <div className="header-inner">
        <Link href={`/${locale}`} className="site-brand">
          <JournalLogo />
          <span className="brand-name-full">{d.siteName}</span>
          <span className="brand-name-mobile">{locale === "en" ? "AWS Journal" : "Nhật ký AWS"}</span>
        </Link>
        <button className="header-search-trigger" type="button" onClick={() => setSearchOpen(true)} aria-label={d.search}>
          <MagnifyingGlass size={18} aria-hidden="true" />
          <span>{searchPlaceholder}</span>
          <kbd>/</kbd>
        </button>
        <div className="header-actions">
          <div className="desktop-auth"><AccountControl locale={locale} /></div>
          <ThemeToggle label={d.theme} />
          <Link className="language-link" href={pathForLocale(pathname, nextLocale)} hrefLang={nextLocale}>{locale === "en" ? "VI" : "EN"}</Link>
          <button className="icon-button mobile-search-button" type="button" onClick={() => setSearchOpen(true)} aria-label={d.search}><MagnifyingGlass size={19} aria-hidden="true" /></button>
          <button className="icon-button mobile-menu-button" type="button" onClick={() => setMobileOpen((value) => !value)} aria-label={d.menu} aria-expanded={mobileOpen}>{mobileOpen ? <X size={21} /> : <List size={22} />}</button>
        </div>
      </div>
      {mobileOpen ? <div className="mobile-drawer"><nav aria-label="Mobile navigation">{nav.map((item) => <Link key={item} href={`/${locale}/${item}`} onClick={() => setMobileOpen(false)}>{d.nav[item]}</Link>)}</nav><div className="mobile-drawer-bottom"><Link href={pathForLocale(pathname, nextLocale)}>{locale === "en" ? "Tiếng Việt" : "English"}</Link><AccountControl locale={locale} /></div></div> : null}
    </header>
    <SearchDialog locale={locale} open={searchOpen} onClose={() => setSearchOpen(false)} />
  </>;
}

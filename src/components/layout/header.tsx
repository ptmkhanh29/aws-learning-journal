"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CaretDown, Check, GlobeHemisphereWest, List, MagnifyingGlass, MoonStars, SunDim, UserCircle, X } from "@phosphor-icons/react";
import { dictionary, pathForLocale, type Locale } from "@/lib/i18n";
import { NotebookNavigationGroups } from "@/components/layout/notebook-navigation";
import { BrandMark } from "@/components/layout/brand-mark";

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

function useDocumentScrollLock(locked: boolean) {
  useEffect(() => {
    if (!locked) return;
    const previousBodyOverflow = document.body.style.overflow;
    const previousBodyPaddingRight = document.body.style.paddingRight;
    const previousHtmlOverflow = document.documentElement.style.overflow;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    if (scrollbarWidth > 0) document.body.style.paddingRight = `${scrollbarWidth}px`;

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.body.style.paddingRight = previousBodyPaddingRight;
      document.documentElement.style.overflow = previousHtmlOverflow;
    };
  }, [locked]);
}

function ThemeToggle({ label }: { label: string }) {
  function toggleTheme() {
    const current = document.documentElement.dataset.theme === "dark" ? "dark" : "light";
    const theme = current === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
    try { const prefs = JSON.parse(localStorage.getItem(PREFS_KEY) || "{}"); localStorage.setItem(PREFS_KEY, JSON.stringify({ ...prefs, theme })); } catch {}
  }
  return <button className="icon-button theme-toggle" type="button" onClick={toggleTheme} aria-label={label} title={label}><span className="theme-glyph" aria-hidden="true"><SunDim className="theme-sun" size={20} weight="regular" /><MoonStars className="theme-moon" size={19} weight="regular" /></span></button>;
}

function LanguageControl({ locale, pathname, onNavigate }: { locale: Locale; pathname: string; onNavigate?: () => void }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuId = useId();
  const label = locale === "en" ? "Choose language" : "Chọn ngôn ngữ";
  const options = [
    { locale: "en" as const, code: "US", label: "English" },
    { locale: "vi" as const, code: "VN", label: "Tiếng Việt" },
  ];

  useEffect(() => {
    if (!open) return;
    const closeOnOutsideClick = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      event.stopImmediatePropagation();
      setOpen(false);
      triggerRef.current?.focus();
    };
    document.addEventListener("pointerdown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape, true);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape, true);
    };
  }, [open]);

  const focusMenuItem = (position: "first" | "last") => {
    window.requestAnimationFrame(() => {
      const items = rootRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]');
      if (!items?.length) return;
      items[position === "first" ? 0 : items.length - 1].focus();
    });
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (!open || !["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    const items = Array.from(rootRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]') || []);
    if (!items.length) return;
    const currentIndex = items.indexOf(document.activeElement as HTMLElement);
    if (event.key === "Home") items[0].focus();
    else if (event.key === "End") items[items.length - 1].focus();
    else if (event.key === "ArrowDown") items[(currentIndex + 1 + items.length) % items.length].focus();
    else items[(currentIndex - 1 + items.length) % items.length].focus();
  };

  return (
    <div
      className="language-selector"
      ref={rootRef}
      onKeyDown={handleKeyDown}
      onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false); }}
    >
      <button
        ref={triggerRef}
        className="language-trigger"
        type="button"
        aria-label={`${label}: ${options.find((option) => option.locale === locale)?.label}`}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((value) => !value)}
        onKeyDown={(event) => {
          if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
          event.preventDefault();
          setOpen(true);
          focusMenuItem(event.key === "ArrowDown" ? "first" : "last");
        }}
      >
        <GlobeHemisphereWest size={17} weight="regular" aria-hidden="true" />
        <span>{locale === "vi" ? "VI" : "EN"}</span>
        <CaretDown size={12} weight="bold" aria-hidden="true" />
      </button>
      {open ? (
        <div className="language-menu" id={menuId} role="menu" aria-label={label}>
          {options.map((option, index) => (
            <Link
              key={option.locale}
              role="menuitem"
              tabIndex={index === 0 ? 0 : -1}
              href={pathForLocale(pathname, option.locale)}
              hrefLang={option.locale}
              aria-current={locale === option.locale ? "page" : undefined}
              onClick={() => { setOpen(false); onNavigate?.(); }}
            >
              <span className="language-country" aria-hidden="true">{option.code}</span>
              <span>{option.label}</span>
              {locale === option.locale ? <Check size={15} weight="bold" aria-hidden="true" /> : <span aria-hidden="true" />}
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  );
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
    <div className="dialog-backdrop" role="presentation" onPointerDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className="search-dialog" id="global-search-dialog" role="dialog" aria-modal="true" aria-labelledby="search-title">
        <div className="search-field"><MagnifyingGlass size={21} aria-hidden="true" /><label className="sr-only" htmlFor="global-search" id="search-title">{d.search}</label><input ref={inputRef} id="global-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder={locale === "en" ? "Search notes, labs, and questions" : "Tìm ghi chú, lab và câu hỏi"} /><button type="button" className="icon-button" onClick={onClose} aria-label={d.close}><X size={18} /></button></div>
        <div className="search-results" aria-live="polite">
          {results.length ? results.map((item) => <Link key={item.href + item.title.en} href={`/${locale}${item.href}`} onClick={onClose}><span>{item.title[locale]}</span><small>{item.type[locale]}</small></Link>) : <div className="empty-search"><MagnifyingGlass size={28} /><p>{d.noResults}</p></div>}
        </div>
        <p className="search-hint">{locale === "en" ? "Press Esc to close" : "Nhấn Esc để đóng"}</p>
      </section>
    </div>
  );
}

function AccountControl({ locale, onNavigate }: { locale: Locale; onNavigate?: () => void }) {
  const [signedIn, setSignedIn] = useState(false);
  const [open, setOpen] = useState(false);
  const d = dictionary[locale];
  useEffect(() => {
    const sync = () => { try { setSignedIn(localStorage.getItem(AUTH_KEY) === "signed-in"); } catch {} };
    sync(); window.addEventListener("aws-journal-auth", sync); window.addEventListener("storage", sync);
    return () => { window.removeEventListener("aws-journal-auth", sync); window.removeEventListener("storage", sync); };
  }, []);
  if (!signedIn) return <Link className="auth-entry" href={`/${locale}/login`} onClick={onNavigate}><UserCircle size={19} weight="regular" aria-hidden="true" /><span>{d.authEntry}</span></Link>;
  return <div className="account-menu"><button type="button" className="account-trigger" aria-label={locale === "en" ? "Open account menu" : "Mở menu tài khoản"} aria-expanded={open} onClick={() => setOpen((value) => !value)}><span className="avatar">KP</span><CaretDown size={14} aria-hidden="true" /></button>{open ? <div className="account-popover">{[d.profile, d.progress, d.saved, d.wrong, d.settings].map((item) => <button key={item} type="button">{item}</button>)}<button type="button" onClick={() => { try { localStorage.removeItem(AUTH_KEY); } catch {} window.dispatchEvent(new Event("aws-journal-auth")); setOpen(false); }}>{d.signout}</button></div> : null}</div>;
}

export function Header({ locale }: { locale: Locale }) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const mobileMenuButtonRef = useRef<HTMLButtonElement>(null);
  const mobileDrawerRef = useRef<HTMLElement>(null);
  const mobileCloseButtonRef = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();
  const d = dictionary[locale];
  const searchPlaceholder = locale === "en" ? "Search notes, labs, and questions" : "Tìm ghi chú, lab và câu hỏi";
  useDocumentScrollLock(mobileOpen || searchOpen);
  useEffect(() => {
    const updateScrolledState = () => setScrolled(window.scrollY > 8);
    updateScrolledState();
    window.addEventListener("scroll", updateScrolledState, { passive: true });
    return () => window.removeEventListener("scroll", updateScrolledState);
  }, []);
  useEffect(() => {
    const openSearch = (event: KeyboardEvent) => {
      const target = event.target;
      const isTyping = target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || (target instanceof HTMLElement && target.isContentEditable);
      if (event.key !== "/" || mobileOpen || isTyping || event.metaKey || event.ctrlKey || event.altKey) return;
      event.preventDefault();
      setSearchOpen(true);
    };
    document.addEventListener("keydown", openSearch);
    return () => document.removeEventListener("keydown", openSearch);
  }, [mobileOpen]);
  useEffect(() => {
    const desktopQuery = window.matchMedia("(min-width: 1141px)");
    const closeAtDesktop = (event: MediaQueryListEvent) => { if (event.matches) setMobileOpen(false); };
    desktopQuery.addEventListener("change", closeAtDesktop);
    return () => desktopQuery.removeEventListener("change", closeAtDesktop);
  }, []);
  useEffect(() => {
    if (!mobileOpen) return;

    const focusFrame = window.requestAnimationFrame(() => mobileCloseButtonRef.current?.focus());
    const handleDrawerKeyboard = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setMobileOpen(false);
        window.requestAnimationFrame(() => mobileMenuButtonRef.current?.focus());
        return;
      }
      if (event.key !== "Tab" || !mobileDrawerRef.current) return;

      const focusable = Array.from(mobileDrawerRef.current.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'));
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (!mobileDrawerRef.current.contains(document.activeElement)) {
        event.preventDefault();
        first.focus();
      } else if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", handleDrawerKeyboard);

    return () => {
      window.cancelAnimationFrame(focusFrame);
      document.removeEventListener("keydown", handleDrawerKeyboard);
    };
  }, [mobileOpen]);

  const closeMobileDrawer = (restoreFocus = true) => {
    setMobileOpen(false);
    if (restoreFocus) window.requestAnimationFrame(() => mobileMenuButtonRef.current?.focus());
  };

  return <>
    <header className={`site-header${scrolled ? " is-scrolled" : ""}`}>
      <div className="header-inner">
        <Link href={`/${locale}`} className="site-brand">
          <BrandMark className="header-brand-mark" />
          <span className="brand-copy">
            <span className="brand-title">{d.siteName}</span>
            <span className="brand-subtitle">{d.tagline}</span>
          </span>
        </Link>
        <button className="header-search-trigger" type="button" onClick={() => setSearchOpen(true)} aria-label={d.search} aria-haspopup="dialog" aria-expanded={searchOpen} aria-controls="global-search-dialog">
          <span className="search-icon-frame" aria-hidden="true"><MagnifyingGlass size={18} weight="regular" /></span>
          <span>{searchPlaceholder}</span>
          <kbd>/</kbd>
        </button>
        <div className="header-actions">
          <div className="header-utilities">
            <LanguageControl locale={locale} pathname={pathname} />
            <ThemeToggle label={d.theme} />
          </div>
          <div className="desktop-auth"><AccountControl locale={locale} /></div>
          <button className="icon-button mobile-search-button" type="button" onClick={() => setSearchOpen(true)} aria-label={d.search} aria-haspopup="dialog" aria-expanded={searchOpen} aria-controls="global-search-dialog"><MagnifyingGlass size={19} aria-hidden="true" /></button>
          <button ref={mobileMenuButtonRef} className="icon-button mobile-menu-button" type="button" onClick={() => setMobileOpen(true)} aria-label={d.menu} aria-expanded={mobileOpen} aria-controls="mobile-navigation-drawer"><List size={21} aria-hidden="true" /></button>
        </div>
      </div>
    </header>
    <div className={`mobile-nav-layer${mobileOpen ? " is-open" : ""}`} aria-hidden={!mobileOpen}>
      <div className="mobile-nav-backdrop" aria-hidden="true" onClick={() => closeMobileDrawer()} />
      <aside ref={mobileDrawerRef} className="mobile-drawer" id="mobile-navigation-drawer" role="dialog" aria-modal="true" aria-labelledby="mobile-navigation-title">
        <div className="mobile-drawer-header">
          <Link className="mobile-drawer-brand" href={`/${locale}`} onClick={() => closeMobileDrawer(false)}>
            <BrandMark className="drawer-brand-mark" />
            <span className="mobile-drawer-brand-copy" id="mobile-navigation-title">{d.siteName}</span>
          </Link>
          <button ref={mobileCloseButtonRef} className="icon-button mobile-drawer-close" type="button" onClick={() => closeMobileDrawer()} aria-label={d.close}><X size={20} aria-hidden="true" /></button>
        </div>
        <div className="mobile-drawer-body">
          <div className="mobile-drawer-account">
            <AccountControl locale={locale} onNavigate={() => closeMobileDrawer()} />
          </div>
          <NotebookNavigationGroups locale={locale} className="mobile-drawer-navigation" onNavigate={() => closeMobileDrawer()} />
        </div>
      </aside>
    </div>
    <SearchDialog locale={locale} open={searchOpen} onClose={() => setSearchOpen(false)} />
  </>;
}

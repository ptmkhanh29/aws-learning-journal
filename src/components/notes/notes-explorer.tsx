"use client";

import { useDeferredValue, useState } from "react";
import Link from "next/link";
import { MagnifyingGlass } from "@phosphor-icons/react";
import { notes } from "@/data/notes";
import { text, type Locale } from "@/lib/i18n";
import { Tag } from "@/components/common/tag";

export function NotesExplorer({ locale }: { locale: Locale }) {
  const [query, setQuery] = useState("");
  const [service, setService] = useState("All");
  const deferredQuery = useDeferredValue(query.trim().toLocaleLowerCase(locale));
  const services = ["All", ...new Set(notes.map((note) => note.service))];
  const filtered = notes.filter((note) => {
    const matchesService = service === "All" || note.service === service;
    const haystack = `${text(note.title, locale)} ${text(note.summary, locale)} ${note.tags.join(" ")}`.toLocaleLowerCase(locale);
    return matchesService && haystack.includes(deferredQuery);
  });
  return (
    <section aria-label={locale === "en" ? "Note collection" : "Bộ ghi chú"}>
      <div className="filter-bar">
        <label className="filter-search"><MagnifyingGlass size={18} aria-hidden="true" /><span className="sr-only">{locale === "en" ? "Filter notes" : "Lọc ghi chú"}</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={locale === "en" ? "Filter notes" : "Lọc ghi chú"} /></label>
        <div className="filter-options" aria-label={locale === "en" ? "Filter by service" : "Lọc theo dịch vụ"}>{services.map((item) => <button type="button" key={item} className={service === item ? "selected" : undefined} onClick={() => setService(item)}>{item === "All" && locale === "vi" ? "Tất cả" : item}</button>)}</div>
      </div>
      {filtered.length ? <div className="notes-grid">{filtered.map((note) => <article className="note-row" key={note.slug}><div className="note-meta"><span>{note.service}</span><span>{text(note.domain, locale)}</span><span>{note.date}</span></div><h2>{note.slug === "s3-storage-classes" ? <Link href={`/${locale}/notes/${note.slug}`}>{text(note.title, locale)}</Link> : text(note.title, locale)}</h2><p>{text(note.summary, locale)}</p><div className="tag-row">{note.tags.map((tag) => <Tag key={tag}>{tag}</Tag>)}</div></article>)}</div> : <div className="empty-state"><MagnifyingGlass size={30} /><h2>{locale === "en" ? "No matching notes" : "Không có ghi chú phù hợp"}</h2><p>{locale === "en" ? "Try another service or a shorter search phrase." : "Hãy thử dịch vụ khác hoặc từ khóa ngắn hơn."}</p><button type="button" className="text-button" onClick={() => { setQuery(""); setService("All"); }}>{locale === "en" ? "Clear filters" : "Xóa bộ lọc"}</button></div>}
    </section>
  );
}

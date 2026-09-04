"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Article, BookOpenText, Cloud, Flask, GlobeHemisphereWest, House, NotePencil, Target, TerminalWindow } from "@phosphor-icons/react";
import { homeNavigation } from "@/data/home";
import { text, type Locale } from "@/lib/i18n";

const navigationIcons = {
  home: House,
  journal: BookOpenText,
  notes: NotePencil,
  labs: Flask,
  aws: Cloud,
  practice: Target,
  cloudflare: GlobeHemisphereWest,
  wordpress: Article,
  devops: TerminalWindow,
};

const navigationAssets: Partial<Record<keyof typeof navigationIcons, string>> = {
  aws: "/images/topics/aws.png",
  practice: "/images/topics/aws-certification.png",
  cloudflare: "/images/topics/cloudflare.png",
  wordpress: "/images/topics/wordpress.png",
  devops: "/images/topics/devops.png",
};

export function NotebookNavigationGroups({ locale, onNavigate, className = "" }: { locale: Locale; onNavigate?: () => void; className?: string }) {
  const pathname = usePathname();

  return (
    <div className={`notebook-navigation-groups ${className}`.trim()}>
      {homeNavigation.map((group) => (
        <section className="home-nav-group" key={group.label.en}>
          <h2>{text(group.label, locale)}</h2>
          <nav aria-label={text(group.label, locale)}>
            {group.items.map((item) => {
              const Icon = item.icon ? navigationIcons[item.icon] : null;
              const asset = item.icon ? navigationAssets[item.icon] : undefined;
              const href = `/${locale}${item.href}`;
              const isHome = item.href === "/";
              const routeMatches = isHome ? pathname === `/${locale}` || pathname === `/${locale}/` : pathname === href || pathname.startsWith(`${href}/`);
              const isActive = item.active !== false && routeMatches;

              return (
                <Link
                  className={Icon ? "primary-nav-item" : "collection-nav-item"}
                  data-nav-tone={item.icon}
                  href={href}
                  aria-current={isActive ? "page" : undefined}
                  onClick={onNavigate}
                  key={item.label.en}
                >
                  {asset ? <Image className="nav-asset-icon" src={asset} width={20} height={20} alt="" aria-hidden="true" /> : Icon ? <Icon size={17} weight="regular" aria-hidden="true" /> : <span className="nav-index" aria-hidden="true" />}
                  <span>{text(item.label, locale)}</span>
                </Link>
              );
            })}
          </nav>
        </section>
      ))}
    </div>
  );
}

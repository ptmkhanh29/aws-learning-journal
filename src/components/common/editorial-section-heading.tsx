import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";

type EditorialSectionHeadingProps = {
  title: string;
  icon: ReactNode;
  action?: { href: string; label: string };
  compact?: boolean;
};

export function EditorialSectionHeading({ title, icon, action, compact = false }: EditorialSectionHeadingProps) {
  return (
    <header className={`editorial-section-heading${compact ? " is-compact" : ""}${action ? " has-action" : ""}`}>
      <div className="editorial-section-title">
        <span className="editorial-section-icon" aria-hidden="true">{icon}</span>
        <h2>{title}</h2>
      </div>
      <span className="editorial-section-rule" aria-hidden="true" />
      {action ? <Link href={action.href}>{action.label}<ArrowRight size={15} weight="regular" aria-hidden="true" /></Link> : null}
    </header>
  );
}

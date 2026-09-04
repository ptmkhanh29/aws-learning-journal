export function BrandMark({ className = "" }: { className?: string }) {
  return (
    <svg className={`brand-mark ${className}`.trim()} viewBox="0 0 32 32" fill="none" aria-hidden="true" focusable="false">
      <path d="M7 5v22M7 16 16 6M7 16l9 10" />
      <path d="M19 27V5h4.2c3.2 0 5.6 2.15 5.6 5.35s-2.4 5.4-5.6 5.4H19" />
      <path d="M7 16h12" />
    </svg>
  );
}

import Link from 'next/link';

export function BackNavigation({ fallbackHref }: { readonly fallbackHref: string }) {
  const sharedControlClassName =
    'inline-flex h-9 items-center justify-center rounded-full text-text-secondary transition duration-200 hover:-translate-y-px hover:text-text-primary';

  return (
    <div
      className="inline-flex items-center gap-1.5 rounded-full border p-1.5 shadow-[0_18px_45px_rgba(0,0,0,0.28)] backdrop-blur-md"
      style={{
        borderColor: 'color-mix(in srgb, var(--border) 78%, white 8%)',
        backgroundColor: 'color-mix(in srgb, var(--background-elevated) 88%, transparent)',
        boxShadow: 'inset 0 1px 0 color-mix(in srgb, white 12%, transparent)',
      }}
    >
      <Link
        href={fallbackHref}
        className={`${sharedControlClassName} min-w-24 gap-2.5 px-3.5 font-mono text-[10px] uppercase tracking-[0.24em]`}
      >
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-3.5 w-3.5" aria-hidden="true">
          <path d="M10 13L5 8l5-5" />
        </svg>
        Back
      </Link>
      <span
        className="h-5 w-px shrink-0"
        aria-hidden="true"
        style={{ backgroundColor: 'color-mix(in srgb, var(--border) 78%, transparent)' }}
      />
      <Link
        href="/"
        aria-label="Home"
        className={`${sharedControlClassName} w-9 shrink-0`}
      >
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-3.5 w-3.5" aria-hidden="true">
          <path d="M2.5 7.25 8 2.75l5.5 4.5" />
          <path d="M4.25 6.5v6.75h7.5V6.5" />
        </svg>
      </Link>
    </div>
  );
}
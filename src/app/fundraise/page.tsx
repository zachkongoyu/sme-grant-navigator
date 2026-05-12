import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Fundraise | Thunder',
  description: 'AI-powered tools to help you raise grant and investor funding.',
};

const GRANT_TOOLS = [
  {
    href: '/eligibility',
    label: 'Eligibility Check',
    description: 'Verify you meet every criterion before writing a word.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-4 w-4" aria-hidden="true">
        <path d="M9 12l2 2 4-4" /><circle cx="12" cy="12" r="10" />
      </svg>
    ),
    credits: '1 credit',
    live: true,
  },
  {
    href: '/schemes',
    label: 'Browse Schemes',
    description: 'See all open government funding schemes available to you.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-4 w-4" aria-hidden="true">
        <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="9" y="3" width="6" height="4" rx="1" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M9 12h6M9 16h4" strokeLinecap="round" />
      </svg>
    ),
    credits: 'Free',
    live: true,
  },
  {
    href: '/draft',
    label: 'Draft Application',
    description: 'AI writes your grant application for the chosen scheme.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-4 w-4" aria-hidden="true">
        <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
      </svg>
    ),
    credits: '3 credits',
    live: true,
  },
];

const INVESTOR_TOOLS = [
  {
    href: '/fundraise/one-pager',
    label: 'One-Pager',
    description: '400-word investor summary: problem, solution, traction, ask.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-4 w-4" aria-hidden="true">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" strokeLinecap="round" strokeLinejoin="round" />
        <polyline points="14 2 14 8 20 8" strokeLinecap="round" strokeLinejoin="round" />
        <line x1="16" y1="13" x2="8" y2="13" strokeLinecap="round" />
        <line x1="16" y1="17" x2="8" y2="17" strokeLinecap="round" />
        <polyline points="10 9 9 9 8 9" strokeLinecap="round" />
      </svg>
    ),
    credits: '1 credit',
    live: true,
  },
  {
    href: '/fundraise/pitch-deck',
    label: 'Pitch Deck Script',
    description: '10-slide investor pitch with AI-computed financial projections.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-4 w-4" aria-hidden="true">
        <rect x="2" y="3" width="20" height="14" rx="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M8 21h8M12 17v4" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M7 10l3 3 4-4 3 2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    credits: '1 credit',
    live: true,
  },
  {
    href: '/fundraise/investor-email',
    label: 'Investor Email',
    description: 'Personalised cold email under 125 words referencing their thesis.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-4 w-4" aria-hidden="true">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" strokeLinecap="round" strokeLinejoin="round" />
        <polyline points="22,6 12,13 2,6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    credits: '1 credit',
    live: true,
  },
  {
    href: '/fundraise/data-room',
    label: 'Data Room Checklist',
    description: 'Prioritised due diligence document checklist for your stage & sector.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-4 w-4" aria-hidden="true">
        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M9 14l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    credits: '1 credit',
    live: true,
  },
];

export default function FundraisePage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
      <div className="mb-10">
        <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.28em] text-text-tertiary">Thunder</p>
        <h1 className="text-3xl font-semibold tracking-tight">Fundraising tools</h1>
        <p className="mt-3 text-sm leading-6 text-text-secondary">
          AI tools for both paths to funding — non-dilutive grants and equity investment. No extra packages to install.
        </p>
      </div>

      {/* ── Grant funding ── */}
      <section className="mb-10">
        <p className="mb-4 font-mono text-[10px] uppercase tracking-[0.24em] text-text-tertiary">Grant funding</p>
        <div className="space-y-2">
          {GRANT_TOOLS.map((tool) => (
            <Link
              key={tool.href}
              href={tool.href}
              className="group flex items-center gap-4 rounded-xl border border-border bg-surface px-5 py-4 transition hover:border-accent/40 hover:bg-surface-hover"
            >
              <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-surface-hover text-text-secondary transition-colors group-hover:text-accent">
                {tool.icon}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-text-primary">{tool.label}</p>
                <p className="mt-0.5 text-xs text-text-tertiary">{tool.description}</p>
              </div>
              <span className="shrink-0 font-mono text-[10px] text-text-tertiary">{tool.credits}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Investor funding ── */}
      <section>
        <p className="mb-4 font-mono text-[10px] uppercase tracking-[0.24em] text-text-tertiary">Investor funding</p>
        <div className="space-y-2">
          {INVESTOR_TOOLS.map((tool) => (
            <Link
              key={tool.href}
              href={tool.href}
              className="group flex items-center gap-4 rounded-xl border border-border bg-surface px-5 py-4 transition hover:border-accent/40 hover:bg-surface-hover"
            >
              <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-surface-hover text-text-secondary transition-colors group-hover:text-accent">
                {tool.icon}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-text-primary">{tool.label}</p>
                <p className="mt-0.5 text-xs text-text-tertiary">{tool.description}</p>
              </div>
              <span className="shrink-0 font-mono text-[10px] text-text-tertiary">{tool.credits}</span>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}

import type { Metadata } from 'next';
import { GeistMono } from 'geist/font/mono';
import { GeistSans } from 'geist/font/sans';
import { Suspense } from 'react';
import Script from 'next/script';
import Link from 'next/link';
import { Analytics } from '@vercel/analytics/next';

import { NavigationProgress } from '@/components/NavigationProgress';
import { ThemeToggle } from '@/components/ThemeToggle';
import { AuthButton } from '@/components/AuthButton';
import { CreditBadge } from '@/components/CreditBadge';

import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://www.thunderhk.ai'),
  title: 'Thunder | AI Grant Drafting Platform',
  description: 'Thunder helps SMEs turn company context into grant-ready drafts, starting with Easy BUD in Hong Kong.',
  openGraph: {
    title: 'Thunder | AI Grant Drafting Platform',
    description: 'Thunder helps SMEs turn company context into grant-ready drafts, starting with Easy BUD in Hong Kong.',
    siteName: 'Thunder',
    type: 'website',
    locale: 'en_HK',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Thunder | AI Grant Drafting Platform',
    description: 'Thunder helps SMEs turn company context into grant-ready drafts, starting with Easy BUD in Hong Kong.',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body
        className={`${GeistSans.variable} ${GeistMono.variable} flex min-h-screen flex-col bg-background text-text-primary antialiased`}
      >
        <Script
          id="theme-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: `(() => {
  try {
    const key = 'thunder.theme';
    const saved = localStorage.getItem(key);
    const isValid = saved === 'light' || saved === 'dark';
    const system = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    document.documentElement.dataset.theme = isValid ? saved : system;
  } catch {
    document.documentElement.dataset.theme = 'dark';
  }
})();` }}
        />
        <Suspense fallback={null}>
          <NavigationProgress />
        </Suspense>
        <div className="fixed top-4 right-4 z-50 flex items-center gap-3">
          <CreditBadge />
          <AuthButton />
        </div>
        <div className="flex-1">
          {children}
        </div>

        {/* ── Footer ── */}
        <footer className="border-t border-border py-8">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 sm:px-6">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-tertiary">
              Thunder © {new Date().getFullYear()}
            </p>
            <nav className="flex flex-wrap gap-5" aria-label="Footer">
              {[
                { href: '/showcase', label: 'Showcase' },
                { href: '/privacy', label: 'Privacy' },
                { href: '/terms', label: 'Terms' },
                { href: '/reimbursement', label: 'Reimbursement' },
                { href: '/rest-api', label: 'Developers' },
              ].map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className="font-mono text-[10px] uppercase tracking-[0.14em] text-text-tertiary transition hover:text-accent"
                >
                  {label}
                </Link>
              ))}
            </nav>
          </div>
        </footer>

        <div className="fixed bottom-4 right-4 z-50">
          <ThemeToggle />
        </div>
        <Analytics />
      </body>
    </html>
  );
}
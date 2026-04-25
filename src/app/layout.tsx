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

import './globals.css';

export const metadata: Metadata = {
  title: 'Thunder | Easy BUD Application Generator',
  description: 'AI-generated Easy BUD application drafts for Hong Kong SMEs.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <Script id="theme-init" strategy="beforeInteractive">{`(() => {
  try {
    const key = 'sme-grant-navigator.theme';
    const saved = localStorage.getItem(key);
    const isValid = saved === 'light' || saved === 'dark';
    const system = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    document.documentElement.dataset.theme = isValid ? saved : system;
  } catch {
    document.documentElement.dataset.theme = 'dark';
  }
})();`}</Script>
      </head>
      <body
        className={`${GeistSans.variable} ${GeistMono.variable} min-h-screen bg-background text-text-primary antialiased`}
      >
        <Suspense fallback={null}>
          <NavigationProgress />
        </Suspense>
        <div className="fixed top-4 right-4 z-50">
          <AuthButton />
        </div>
        {children}

        {/* ── Footer ── */}
        <footer className="border-t border-border py-8">
          <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-4 px-4 sm:px-6">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-tertiary">
              Thunder © {new Date().getFullYear()}
            </p>
            <nav className="flex flex-wrap gap-5" aria-label="Footer">
              {[
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
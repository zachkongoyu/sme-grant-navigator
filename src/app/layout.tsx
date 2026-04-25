import type { Metadata } from 'next';
import { GeistMono } from 'geist/font/mono';
import { GeistSans } from 'geist/font/sans';
import { Suspense } from 'react';
import Script from 'next/script';
import { Analytics } from '@vercel/analytics/next';

import { NavigationProgress } from '@/components/NavigationProgress';
import { ThemeToggle } from '@/components/ThemeToggle';
import { AuthButton } from '@/components/AuthButton';

import './globals.css';

export const metadata: Metadata = {
  title: 'Thunder',
  description: 'AI-powered draft generation and grant eligibility guidance for Hong Kong SMEs.',
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
        <div className="fixed bottom-4 right-4 z-50">
          <ThemeToggle />
        </div>
        <Analytics />
      </body>
    </html>
  );
}
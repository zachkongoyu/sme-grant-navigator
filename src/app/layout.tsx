import type { Metadata } from 'next';
import { GeistMono } from 'geist/font/mono';
import { GeistSans } from 'geist/font/sans';

import { ThemeToggle } from '@/components/ThemeToggle';

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
        <script
          dangerouslySetInnerHTML={{
            __html: `(() => {
  try {
    const key = 'sme-grant-navigator.theme';
    const saved = localStorage.getItem(key);
    const isValid = saved === 'light' || saved === 'dark';
    const system = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    document.documentElement.dataset.theme = isValid ? saved : system;
  } catch {
    document.documentElement.dataset.theme = 'dark';
  }
})();`,
          }}
        />
      </head>
      <body
        className={`${GeistSans.variable} ${GeistMono.variable} min-h-screen bg-background text-text-primary antialiased`}
      >
        {children}
        <ThemeToggle />
      </body>
    </html>
  );
}
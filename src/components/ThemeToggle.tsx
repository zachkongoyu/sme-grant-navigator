'use client';

import { useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

const STORAGE_KEY = 'sme-grant-navigator.theme';

function getSystemTheme(): Theme {
  if (typeof window === 'undefined') {
    return 'dark';
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
}

function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
}

interface ThemeToggleProps {
  readonly className?: string;
}

export function ThemeToggle({ className = '' }: ThemeToggleProps) {
  const [theme, setTheme] = useState<Theme>('dark');

  useEffect(() => {
    const savedTheme = window.localStorage.getItem(STORAGE_KEY);
    const nextTheme = savedTheme === 'light' || savedTheme === 'dark'
      ? (savedTheme as Theme)
      : getSystemTheme();

    setTheme(nextTheme);
    applyTheme(nextTheme);
  }, []);

  function toggleTheme() {
    const nextTheme: Theme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    applyTheme(nextTheme);
    window.localStorage.setItem(STORAGE_KEY, nextTheme);
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`fixed right-5 top-5 z-50 inline-flex h-11 w-11 items-center justify-center rounded-full border border-border bg-surface-elevated text-text-primary shadow-ambient transition hover:scale-[1.03] hover:border-accent/60 ${className}`}
      style={{ position: 'fixed', top: '1.25rem', right: '1.25rem', bottom: 'auto', left: 'auto' }}
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      {theme === 'dark' ? (
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2.2M12 19.8V22M4.9 4.9l1.5 1.5M17.6 17.6l1.5 1.5M2 12h2.2M19.8 12H22M4.9 19.1l1.5-1.5M17.6 6.4l1.5-1.5" />
        </svg>
      ) : (
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 12.8A8.8 8.8 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />
        </svg>
      )}
    </button>
  );
}

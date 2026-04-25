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
  // Start null to avoid server/client mismatch. Resolved after first paint.
  const [theme, setTheme] = useState<Theme | null>(null);

  useEffect(() => {
    const savedTheme = window.localStorage.getItem(STORAGE_KEY);
    if (savedTheme === 'light' || savedTheme === 'dark') {
      setTheme(savedTheme);
      return;
    }
    const domTheme = document.documentElement.dataset.theme;
    if (domTheme === 'light' || domTheme === 'dark') {
      setTheme(domTheme as Theme);
      return;
    }
    setTheme(getSystemTheme());
  }, []);

  function toggleTheme() {
    const nextTheme: Theme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    applyTheme(nextTheme);
    window.localStorage.setItem(STORAGE_KEY, nextTheme);
  }

  const isDark = theme !== 'light';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`inline-flex h-11 w-11 items-center justify-center rounded-full border border-border bg-surface text-text-primary transition hover:border-border-strong ${className}`}
      aria-label={theme == null ? 'Toggle theme' : `Switch to ${isDark ? 'light' : 'dark'} mode`}
      title={theme == null ? 'Toggle theme' : `Switch to ${isDark ? 'light' : 'dark'} mode`}
      suppressHydrationWarning
    >
      {!isDark ? (
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

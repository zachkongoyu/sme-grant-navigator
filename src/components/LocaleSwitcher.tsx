'use client';

import React from 'react';
import { useLocale } from '@/lib/i18n/I18nProvider';

export function LocaleSwitcher() {
  const { locale, setLocale } = useLocale();

  return (
    <button
      type="button"
      onClick={() => setLocale(locale === 'zh' ? 'en' : 'zh')}
      className="rounded-lg border border-border bg-surface px-2.5 py-1.5 text-xs font-medium text-text-secondary transition hover:border-accent hover:text-accent"
    >
      {locale === 'zh' ? 'EN' : '中'}
    </button>
  );
}

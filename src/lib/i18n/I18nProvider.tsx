'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { NextIntlClientProvider } from 'next-intl';

const I18nContext = createContext<{
  locale: string;
  setLocale: (l: string) => void;
}>({ locale: 'zh', setLocale: () => {} });

export function useLocale() {
  return useContext(I18nContext);
}

export function I18nProvider({
  children,
  messages,
}: {
  children: React.ReactNode;
  messages: Record<string, unknown>;
}) {
  // Always start with default locale during SSR/hydration to avoid mismatch
  const [locale, setLocaleState] = useState('zh');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('thunder.locale');
    if (saved === 'en' || saved === 'zh') {
      setLocaleState(saved);
    }
  }, []);

  const setLocale = useCallback((l: string) => {
    setLocaleState(l);
    localStorage.setItem('thunder.locale', l);
  }, []);

  // During SSR and initial hydration, always render with default locale
  // After hydration, switch to saved locale
  const effectiveLocale = mounted ? locale : 'zh';

  return (
    <I18nContext.Provider value={{ locale: effectiveLocale, setLocale }}>
      <NextIntlClientProvider locale={effectiveLocale} messages={messages[effectiveLocale] ?? {}}>
        {children}
      </NextIntlClientProvider>
    </I18nContext.Provider>
  );
}

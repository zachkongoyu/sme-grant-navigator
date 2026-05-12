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
  messages: Record<string, Record<string, string>>;
}) {
  const [locale, setLocaleState] = useState('zh');

  useEffect(() => {
    const saved = localStorage.getItem('thunder.locale');
    if (saved === 'en' || saved === 'zh') {
      setLocaleState(saved);
    }
  }, []);

  const setLocale = useCallback((l: string) => {
    setLocaleState(l);
    localStorage.setItem('thunder.locale', l);
  }, []);

  return (
    <I18nContext.Provider value={{ locale, setLocale }}>
      <NextIntlClientProvider locale={locale} messages={messages[locale] ?? {}}>
        {children}
      </NextIntlClientProvider>
    </I18nContext.Provider>
  );
}

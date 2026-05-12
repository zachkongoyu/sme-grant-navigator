'use client';

import React from 'react';
import { I18nProvider } from '@/lib/i18n/I18nProvider';
import zh from '../../messages/zh.json';
import en from '../../messages/en.json';

const messages = { zh, en };

export default function I18nWrapper({ children }: { children: React.ReactNode }) {
  return <I18nProvider messages={messages}>{children}</I18nProvider>;
}

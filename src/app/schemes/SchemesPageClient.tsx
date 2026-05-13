'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import type { Scheme } from '@/types';
import SchemesList from './SchemesList';

interface SchemesPageClientProps {
  readonly initialSchemes: ReadonlyArray<Scheme>;
}

export default function SchemesPageClient({ initialSchemes }: SchemesPageClientProps) {
  const t = useTranslations();

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden bg-background text-text-primary">
      <div className="mx-auto max-w-4xl px-6 py-12">

        {/* Header */}
        <div className="border-b border-border pb-8">
          <h1 className="text-3xl font-semibold tracking-tight">
            {t('schemes.title')}
          </h1>
          <p className="mt-2 text-sm text-text-secondary">
            {t('schemes.subtitle')}
          </p>
        </div>

        <SchemesList schemes={initialSchemes} />
      </div>
    </div>
  );
}

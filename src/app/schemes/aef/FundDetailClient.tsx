'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import type { Scheme } from '@/types';
import type { SchemeSection, SchemeMetadata, SchemeFieldTranslation } from '@/lib/supabase/scheme-details';
import { formatFundingAmount } from '@/lib/schemes/presentation';
import { useLocale } from '@/lib/i18n/I18nProvider';
import { CollapsibleSection } from '@/components/CollapsibleSection';
import MetadataTabs from './MetadataTabs';
import InvestmentStage from './InvestmentStage';
import SectionEditor from './SectionEditor';

interface FundDetailClientProps {
  scheme: Scheme;
  sectionsByLocale: Record<string, ReadonlyArray<SchemeSection>>;
  metadata: ReadonlyArray<SchemeMetadata>;
  fieldTranslationsByLocale: Record<string, ReadonlyArray<SchemeFieldTranslation>>;
}

function getFieldTranslation(
  fieldTranslations: ReadonlyArray<SchemeFieldTranslation>,
  field: string,
  fallback: string,
): string {
  return fieldTranslations.find((ft) => ft.field === field)?.value ?? fallback;
}

function getMetadataValue(
  metadata: ReadonlyArray<SchemeMetadata>,
  fieldKey: string,
): string | undefined {
  return metadata.find((m) => m.field_key === fieldKey)?.value;
}

export default function FundDetailClient({
  scheme,
  sectionsByLocale,
  metadata,
  fieldTranslationsByLocale,
}: FundDetailClientProps) {
  const t = useTranslations();
  const { locale } = useLocale();
  const [isEditing, setIsEditing] = useState(false);

  const sections = sectionsByLocale[locale] ?? sectionsByLocale['zh'] ?? [];
  const fieldTranslations = fieldTranslationsByLocale[locale] ?? fieldTranslationsByLocale['zh'] ?? [];

  const name = getFieldTranslation(fieldTranslations, 'name', scheme.name);
  const administrator = getFieldTranslation(fieldTranslations, 'administrator', scheme.administrator ?? '');
  const jurisdiction = getFieldTranslation(fieldTranslations, 'jurisdiction', scheme.jurisdiction);
  const fundSize = formatFundingAmount(scheme.maxFunding, scheme.currency);

  const difficultyValue = getMetadataValue(metadata, 'difficulty');
  const difficultyNumber = difficultyValue ? parseInt(difficultyValue, 10) : 0;

  const stageValue = getMetadataValue(metadata, 'investment_stage');
  const fundTypeValue = getMetadataValue(metadata, 'fund_type');

  const difficultyLabelMap: Record<number, string> = {
    1: t('fundDetail.difficultyVeryEasy'),
    2: t('fundDetail.difficultyEasy'),
    3: t('fundDetail.difficultyMedium'),
    4: t('fundDetail.difficultyHard'),
    5: t('fundDetail.difficultyVeryHard'),
  };
  const difficultyLabel = difficultyValue ? (difficultyLabelMap[difficultyNumber] ?? '—') : '—';

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden bg-background text-text-primary">
      <div className="mx-auto max-w-2xl px-6 py-12">

        {/* Back button */}
        <div className="mb-6">
          <Link
            href="/schemes"
            className="inline-flex items-center gap-1.5 text-sm text-text-tertiary transition hover:text-text-primary"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
              <path d="M15 18l-6-6 6-6" />
            </svg>
            {t('fundDetail.backToList')}
          </Link>
        </div>

        {/* Hero */}
        <div className="border-b border-border pb-8">
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-text-tertiary">
            {jurisdiction} · {administrator}
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-[-0.04em] leading-tight">
            {name}
          </h1>

          {/* Key stats inline */}
          <div className="mt-6 grid grid-cols-2 gap-6">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-tertiary">{t('fundDetail.fundSize')}</p>
              <p className="mt-1 font-mono text-xl font-semibold text-text-primary">{fundSize}</p>
            </div>
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-tertiary">{t('fundDetail.fundType')}</p>
              <p className="mt-1 font-mono text-xl font-semibold text-text-primary">
                {fundTypeValue ? t(`fundType.${fundTypeValue}` as any) : '—'}
              </p>
            </div>
            <div className="col-span-2">
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-tertiary">{t('fundDetail.investmentStage')}</p>
              <div className="mt-1">
                <InvestmentStage activeStage={stageValue} />
              </div>
            </div>
          </div>
        </div>

        {/* Right-rail: actions + links */}
        <div className="py-8 border-b border-border grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Official links */}
          {scheme.links.length > 0 && (
            <div className="rounded-xl border border-border bg-surface p-4">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-text-tertiary">{t('fundDetail.officialPortal')}</p>
              <ul className="mt-3 space-y-2">
                {scheme.links.map((link) => (
                  <li key={link.url}>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1.5 text-sm underline underline-offset-4 transition"
                      style={{ color: 'var(--accent)' }}
                    >
                      {link.label}
                      <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-2.5 w-2.5 shrink-0 opacity-60">
                        <path d="M2 10L10 2M5 2h5v5" />
                      </svg>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Right column: difficulty + save */}
          <div className="flex flex-col gap-4">
            {/* Application difficulty */}
            <div className="flex items-center justify-between rounded-lg border border-border bg-surface px-4 py-3">
              <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-text-tertiary">{t('fundDetail.applicationDifficulty')}</span>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <span
                    key={i}
                    className="inline-block h-2 w-2 rounded-full"
                    style={{
                      backgroundColor: i <= difficultyNumber ? '#f97316' : 'var(--border)',
                    }}
                  />
                ))}
                <span className="ml-1.5 text-xs font-medium text-text-primary">{difficultyLabel}</span>
              </div>
            </div>

            {/* Save action (dummy) */}
            <button
              type="button"
              className="w-full rounded-lg border border-border bg-surface px-4 py-3 font-mono text-[10px] uppercase tracking-[0.14em] transition hover:border-accent hover:text-accent"
            >
              <span className="flex items-center justify-center gap-2 text-base normal-case tracking-normal">
                <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.7">
                  <path d="M6 4.5a1.5 1.5 0 0 1 1.5-1.5h9A1.5 1.5 0 0 1 18 4.5V21l-6-3-6 3V4.5Z" />
                </svg>
                <span>{t('fundDetail.saveFund')}</span>
              </span>
            </button>
          </div>
        </div>

        {/* Edit toggle */}
        <div className="mt-4 flex items-center justify-end">
          <button
            type="button"
            onClick={() => setIsEditing((v) => !v)}
            className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-text-secondary transition hover:border-accent hover:text-accent"
          >
            {isEditing ? 'Cancel Edit' : 'Edit Sections'}
          </button>
        </div>

        {/* Structured content — loaded from DB */}
        <div className="mt-8 space-y-0">
          {isEditing ? (
            <SectionEditor
              schemeId={scheme.id}
              sections={sections}
              locale={locale}
              onSaved={() => window.location.reload()}
              onCancel={() => setIsEditing(false)}
            />
          ) : (
            sections.map((section) => (
              <CollapsibleSection
                key={section.section_key}
                title={section.title}
                defaultOpen={section.section_key === 'overview'}
              >
              {section.is_list ? (
                <ol className="list-decimal list-inside space-y-3 text-sm leading-7 text-text-secondary">
                  {section.content.split('|').map((item, i) => {
                    const trimmed = item.trim();
                    // Check if item has a bold prefix like "Label: content" or "Label：content"
                    const zhColonIndex = trimmed.indexOf('：');
                    const enColonIndex = trimmed.indexOf(':');
                    const colonIndex = zhColonIndex !== -1
                      ? (enColonIndex !== -1 ? Math.min(zhColonIndex, enColonIndex) : zhColonIndex)
                      : enColonIndex;
                    if (colonIndex > 0) {
                      const label = trimmed.slice(0, colonIndex + 1);
                      const rest = trimmed.slice(colonIndex + 1);
                      return (
                        <li key={i}>
                          <span className="font-medium text-text-primary">{label}</span>
                          {rest}
                        </li>
                      );
                    }
                    return <li key={i}>{trimmed}</li>;
                  })}
                </ol>
              ) : (
                <div className="space-y-4 text-sm leading-7 text-text-secondary">
                  {section.content.split('|').map((paragraph, i) => (
                    <p key={i}>{paragraph.trim()}</p>
                  ))}
                </div>
              )}
            </CollapsibleSection>
          )))}
        </div>

        {/* Metadata tags */}
        <MetadataTabs metadata={metadata} />
      </div>
    </div>
  );
}

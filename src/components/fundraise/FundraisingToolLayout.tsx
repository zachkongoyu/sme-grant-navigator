'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';

import { CopyButton } from '@/components/CopyButton';

interface FundraisingToolLayoutProps {
  title: string;
  description: string;
  creditCost: number;
  fieldsSlot?: ReactNode;
  inputSlot: ReactNode;
  /** Used for the Regenerate button in the output section. */
  generating?: boolean;
  onGenerate?: () => void;
  result: string | null;
  onDownloadPdf?: () => void;
  pdfLoading?: boolean | undefined;
  /** Override copy value — defaults to result */
  copyValue?: string | undefined;
  errorMsg?: string | undefined;
}

export function FundraisingToolLayout({
  title,
  description,
  creditCost,
  fieldsSlot,
  inputSlot,
  generating,
  onGenerate,
  result,
  onDownloadPdf,
  pdfLoading,
  copyValue,
  errorMsg,
}: FundraisingToolLayoutProps) {
  return (
    <div className="relative min-h-screen bg-background">
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
        {/* Header */}
        <div className="mb-8 flex flex-col items-center gap-2 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-text-secondary">
              {creditCost} {creditCost === 1 ? 'credit' : 'credits'} per generation
            </span>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h1>
          <p className="max-w-sm text-sm leading-6 text-text-secondary">{description}</p>
        </div>

        {/* Extra fields above card */}
        {fieldsSlot && <div className="mb-4">{fieldsSlot}</div>}

        {/* Input card */}
        <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
          {inputSlot}
          {errorMsg && (
            <div className="border-t border-border px-5 py-3">
              <p className="text-sm" style={{ color: '#ef4444' }}>{errorMsg}</p>
            </div>
          )}
        </div>

        {/* Output */}
        {result && (
          <div className="mt-6">
            {/* Action row */}
            <div className="mb-4 space-y-3 rounded-xl border border-border bg-surface p-4">
              <div className="flex items-center gap-2">
                {onDownloadPdf && (
                  <button
                    type="button"
                    onClick={onDownloadPdf}
                    disabled={pdfLoading}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm text-text-secondary transition hover:border-accent hover:text-accent disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-3.5 w-3.5 shrink-0" aria-hidden="true">
                      <path d="M8 2v8M5 7l3 3 3-3" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M2.5 12.5h11" strokeLinecap="round" />
                    </svg>
                    {pdfLoading ? 'Generating PDF…' : 'Download PDF'}
                  </button>
                )}
                <CopyButton
                  value={copyValue ?? result}
                  label="Copy"
                  className={onDownloadPdf ? 'flex-1 justify-center' : 'w-full justify-center'}
                />
              </div>
              <p className="text-center font-mono text-[10px] text-text-tertiary">
                AI-generated. Verify all claims before sending to investors.
              </p>
            </div>

            {/* Rendered output */}
            <div
              className="overflow-hidden rounded-xl border border-border bg-surface"
            >
              <div className="px-5 py-4">
                <MarkdownOutput text={result} />
              </div>
            </div>

            {/* Regenerate */}
            {onGenerate && (
              <div className="mt-6 flex items-center justify-center">
                <button
                  type="button"
                  onClick={onGenerate}
                  disabled={generating}
                  className="text-sm text-text-tertiary transition hover:text-text-secondary disabled:opacity-40"
                >
                  Regenerate
                </button>
              </div>
            )}
          </div>
        )}

        {/* Credits link */}
        <p className="mt-8 text-center text-xs text-text-tertiary">
          Need more credits?{' '}
          <Link href="/billing" className="underline underline-offset-4 hover:text-text-secondary transition-colors">
            Top up here
          </Link>
        </p>
      </div>
    </div>
  );
}

// ── Simple markdown renderer ──────────────────────────────────────────────────

function MarkdownOutput({ text }: { text: string }) {
  const lines = text.split('\n');

  return (
    <div className="space-y-1">
      {lines.map((line, i) => {
        if (line.startsWith('# ')) {
          return (
            <p key={i} className="pt-2 text-base font-bold text-text-primary">
              {stripInlineMarkers(line.slice(2))}
            </p>
          );
        }
        if (line.startsWith('## ')) {
          return (
            <p key={i} className="pt-4 pb-0.5 font-mono text-[10px] uppercase tracking-[0.18em] text-text-tertiary first:pt-0">
              {stripInlineMarkers(line.slice(3))}
            </p>
          );
        }
        if (line.startsWith('### ')) {
          return (
            <p key={i} className="pt-3 text-sm font-semibold text-text-primary">
              {stripInlineMarkers(line.slice(4))}
            </p>
          );
        }
        if (line.startsWith('- ') || line.startsWith('* ')) {
          return (
            <div key={i} className="flex gap-2">
              <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-text-tertiary" aria-hidden="true" />
              <p className="text-sm leading-6 text-text-secondary">{stripInlineMarkers(line.slice(2))}</p>
            </div>
          );
        }
        if (/^\d+\.\s/.test(line)) {
          const match = line.match(/^(\d+)\.\s(.*)/);
          if (match) {
            return (
              <div key={i} className="flex gap-2">
                <span className="mt-0.5 shrink-0 font-mono text-[10px] text-text-tertiary">{match[1]}.</span>
                <p className="text-sm leading-6 text-text-secondary">{stripInlineMarkers(match[2] ?? '')}</p>
              </div>
            );
          }
        }
        if (line.startsWith('**') && line.endsWith('**') && line.length > 4) {
          return (
            <p key={i} className="pt-2 text-sm font-semibold text-text-primary">
              {line.slice(2, -2)}
            </p>
          );
        }
        if (line.startsWith('---') || line.startsWith('___')) {
          return <hr key={i} className="my-3 border-border" />;
        }
        if (line.trim() === '') {
          return <div key={i} className="h-2" />;
        }
        return (
          <p key={i} className="text-sm leading-6 text-text-secondary">
            {stripInlineMarkers(line)}
          </p>
        );
      })}
    </div>
  );
}

function stripInlineMarkers(text: string): string {
  // Strip **bold** and *italic* markers, leaving the text
  return text.replace(/\*\*(.+?)\*\*/g, '$1').replace(/\*(.+?)\*/g, '$1');
}

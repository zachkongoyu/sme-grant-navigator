'use client';

import { useState } from 'react';

import type { Scheme } from '@/types';

interface CopySchemeContextProps {
  readonly scheme: Scheme;
  readonly corpus: string | null;
}

function buildContext(scheme: Scheme, corpus: string | null): string {
  const cap =
    scheme.fundingCap === null
      ? 'Varies'
      : new Intl.NumberFormat('en-HK', {
          style: 'currency',
          currency: scheme.currency ?? 'HKD',
          maximumFractionDigits: 0,
        }).format(scheme.fundingCap);

  const duration =
    scheme.durationMonths === null ? 'Varies' : `${scheme.durationMonths} months`;

  const lines: string[] = [
    `## Grant Scheme: ${scheme.name}`,
    '',
    `**Status:** ${scheme.status.replace('-', ' ')}`,
    `**Category:** ${scheme.category}`,
    `**Max Funding:** ${cap}`,
    `**Duration:** ${duration}`,
    '',
    `### Description`,
    scheme.shortDescription,
  ];

  if (corpus) {
    lines.push('', '---', '', corpus);
  }

  if (scheme.links.length > 0) {
    lines.push('', '### Official References');
    for (const link of scheme.links) lines.push(`- [${link.label}](${link.url})`);
  }

  return lines.join('\n');
}

export function CopySchemeContext({ scheme, corpus }: CopySchemeContextProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(buildContext(scheme, corpus));
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }

  const capDisplay = scheme.fundingCap === null
    ? 'Varies'
    : `HK$${(scheme.fundingCap / 1000).toFixed(0)}K`;
  const preview = `## Grant Scheme: ${scheme.name}\n**Status:** ${scheme.status.replace('-', ' ')} · **Max Funding:** ${capDisplay}\n...`;

  return (
    <div className="space-y-3">
      {/* Prompt preview */}
      <div className="rounded-lg border border-border bg-background-elevated px-3 py-2.5 font-mono text-[11px] leading-5 text-text-tertiary select-none">
        {preview}
      </div>

      {/* Copy button */}
      <button
        type="button"
        onClick={handleCopy}
        className={`flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition ${
          copied
            ? 'border border-success/40 bg-success/10 text-success'
            : 'border border-accent/40 bg-(--accent) text-(--accent-foreground) hover:opacity-90'
        }`}
      >
        {copied ? (
          <>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4 shrink-0" aria-hidden="true">
              <path d="M20 6L9 17l-5-5" />
            </svg>
            Copied
          </>
        ) : (
          <>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-4 w-4 shrink-0" aria-hidden="true">
              <rect x="9" y="9" width="13" height="13" rx="2" />
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
            </svg>
            Copy prompt
          </>
        )}
      </button>
    </div>
  );
}

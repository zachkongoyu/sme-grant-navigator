'use client';

import { useState } from 'react';

import type { FundContent } from '@/lib/schemes/content';
import type { Scheme } from '@/types';

interface CopyFundContextProps {
  readonly scheme: Scheme;
  readonly fundContent: FundContent | null;
}

function buildContext(scheme: Scheme, fundContent: FundContent | null): string {
  const cap =
    scheme.fundingCap === null
      ? 'Varies'
      : new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
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

  if (fundContent) {
    lines.push('', '### Objective', fundContent.objective);

    if (fundContent.targetRecipients.length > 0) {
      lines.push('', '### Who Can Apply');
      for (const r of fundContent.targetRecipients) lines.push(`- ${r}`);
    }

    lines.push('', `**Administered by:** ${fundContent.administeringBody}`);

    if (fundContent.notes && fundContent.notes.length > 0) {
      lines.push('', '### Notes');
      for (const n of fundContent.notes) lines.push(`- ${n}`);
    }

    const { tel, email, website } = fundContent.contact;
    if (tel || email || website) {
      lines.push('', '### Contact');
      if (tel) lines.push(`- Tel: ${tel}`);
      if (email) lines.push(`- Email: ${email}`);
      if (website) lines.push(`- Website: ${website}`);
    }
  }

  if (scheme.links.length > 0) {
    lines.push('', '### Official References');
    for (const link of scheme.links) lines.push(`- [${link.label}](${link.url})`);
  }

  return lines.join('\n');
}

export function CopyFundContext({ scheme, fundContent }: CopyFundContextProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(buildContext(scheme, fundContent));
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }

  const preview = `## Grant Scheme: ${scheme.name}\n**Status:** ${scheme.status.replace('-', ' ')} · **Max Funding:** ${scheme.fundingCap === null ? 'Varies' : `${scheme.currency ?? '$'}${(scheme.fundingCap / 1000000).toFixed(1)}M`}\n...`;

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
            : 'border border-accent/40 bg-accent text-background hover:opacity-90'
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

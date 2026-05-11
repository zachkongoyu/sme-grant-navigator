'use client';

import type { Scheme } from '@/types';
import { CopyButton } from '@/components/CopyButton';

interface CopySchemeContextProps {
  readonly scheme: Scheme;
  readonly corpus: string | null;
}

function buildContext(scheme: Scheme, corpus: string | null): string {
  const cap =
    scheme.maxFunding === null
      ? 'Varies'
      : new Intl.NumberFormat('en-HK', {
          style: 'currency',
          currency: scheme.currency ?? 'HKD',
          maximumFractionDigits: 0,
        }).format(scheme.maxFunding);

  const deadline = scheme.nextDeadline
    ? new Date(scheme.nextDeadline).toLocaleDateString('en-HK')
    : 'Rolling';

  const lines: string[] = [
    `## Grant Scheme: ${scheme.name}`,
    '',
    `**Status:** ${scheme.status.replace('-', ' ')}`,
    `**Administrator:** ${scheme.administrator ?? '—'}`,
    `**Jurisdiction:** ${scheme.jurisdiction}`,
    `**Max Funding:** ${cap}`,
    `**Next Deadline:** ${deadline}`,
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
  const capDisplay = scheme.maxFunding === null
    ? 'Varies'
    : `HK$${(scheme.maxFunding / 1000).toFixed(0)}K`;
  const preview = `## Grant Scheme: ${scheme.name}\n**Status:** ${scheme.status.replace('-', ' ')} · **Max Funding:** ${capDisplay}\n...`;

  return (
    <div className="space-y-3">
      {/* Prompt preview */}
      <div className="rounded-lg border border-border bg-background-elevated px-3 py-2.5 font-mono text-[11px] leading-5 text-text-tertiary select-none">
        {preview}
      </div>

      <CopyButton
        variant="primary"
        value={buildContext(scheme, corpus)}
        label="Copy prompt"
        className="w-full justify-center"
      />
    </div>
  );
}

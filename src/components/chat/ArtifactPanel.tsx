'use client';

import { useState } from 'react';
import Link from 'next/link';

import type { Artifact, ChecklistPayload, DraftPayload, ShortlistItem } from './types';

interface ArtifactPanelProps {
  readonly artifact: Artifact | null;
  readonly sessionId: string;
  readonly paid: boolean;
  readonly onClose: () => void;
}

export function ArtifactPanel({ artifact, sessionId, paid, onClose }: ArtifactPanelProps) {
  if (!artifact) return null;

  return (
    <div className="flex h-full flex-col border-l border-border bg-surface">
      <div className="flex items-center gap-3 border-b border-border px-3 py-3">
        <button
          type="button"
          onClick={onClose}
          className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-text-tertiary hover:bg-surface-hover hover:text-text-primary transition-colors"
          aria-label="Close panel"
        >
          ×
        </button>
        <div>
          <p className="font-mono text-[10px] uppercase tracking-widest text-text-tertiary">
            {artifact.kind}
          </p>
          <p className="text-sm font-medium text-text-primary">{artifact.title}</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {artifact.kind === 'shortlist' && (
          <ShortlistContent items={artifact.payload as ShortlistItem[]} />
        )}
        {artifact.kind === 'draft' && (
          <DraftContent payload={artifact.payload as DraftPayload} sessionId={sessionId} paid={paid} />
        )}
        {artifact.kind === 'checklist' && (
          <ChecklistContent payload={artifact.payload as ChecklistPayload} />
        )}
        {artifact.kind === 'note' && (
          <pre className="whitespace-pre-wrap font-mono text-xs text-text-secondary">
            {JSON.stringify(artifact.payload, null, 2)}
          </pre>
        )}
      </div>
    </div>
  );
}

// ── Shortlist ──────────────────────────────────────────────────────────────────

function formatCurrency(amount: number | null, currency: string | null): string {
  if (amount === null) return 'Varies';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency ?? 'HKD',
    maximumFractionDigits: 0,
  }).format(amount);
}

function ShortlistContent({ items }: { items: ShortlistItem[] }) {
  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <li key={item.id} className="rounded-lg border border-border bg-background-elevated p-4">
          <div className="flex items-start justify-between gap-2">
            <p className="font-medium text-text-primary">{item.name}</p>
            <span className="shrink-0 font-mono text-xs text-text-tertiary">
              {formatCurrency(item.fundingCap, item.currency)}
            </span>
          </div>
          <p className="mt-1 text-sm leading-5 text-text-secondary">{item.shortDescription}</p>
          <Link
            href={`/funds/${item.id}`}
            className="mt-2 inline-flex font-mono text-xs text-text-tertiary hover:text-accent transition-colors underline underline-offset-4"
          >
            View scheme →
          </Link>
        </li>
      ))}
    </ul>
  );
}

// ── Draft ──────────────────────────────────────────────────────────────────────

const FREE_SECTIONS = 2;

function DraftContent({
  payload,
  sessionId,
  paid,
}: {
  payload: DraftPayload;
  sessionId: string;
  paid: boolean;
}) {
  const [loading, setLoading] = useState(false);
  const sections = payload.text.split(/\n(?=#{1,3} )/);
  const visibleSections = paid ? sections : sections.slice(0, FREE_SECTIONS);
  const locked = !paid && sections.length > FREE_SECTIONS;

  async function handleUnlock() {
    setLoading(true);
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId }),
      });
      const data = (await res.json()) as { url?: string; error?: string };
      if (res.status === 401) {
        window.location.href = `/auth/signin?next=/chat/${sessionId}`;
        return;
      }
      if (data.url) {
        window.location.href = data.url;
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <p className="rounded-md border border-warning/30 bg-warning/5 px-3 py-2 font-mono text-xs text-warning">
        AI-generated draft — review all content before submitting. Not a guarantee of approval.
      </p>
      {visibleSections.map((section, i) => {
        const lines = section.trim().split('\n');
        const heading = (lines[0] ?? '').replace(/^#{1,3} /, '');
        const body = lines.slice(1).join('\n').trim();

        return (
          <div key={i} className="rounded-lg border border-border bg-background-elevated p-4">
            <p className="mb-2 font-medium text-text-primary">{heading}</p>
            <pre className="whitespace-pre-wrap text-sm leading-relaxed text-text-secondary">
              {body}
            </pre>
          </div>
        );
      })}

      {locked && (
        <div className="rounded-lg border border-border bg-background-elevated p-5 text-center">
          <p className="text-sm font-medium text-text-primary">
            {sections.length - FREE_SECTIONS} more section{sections.length - FREE_SECTIONS !== 1 ? 's' : ''} in the full draft
          </p>
          <p className="mt-1 text-xs text-text-tertiary">
            One-time payment — $299
          </p>
          <button
            type="button"
            onClick={handleUnlock}
            disabled={loading}
            className="mt-4 rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-white transition hover:bg-accent/90 disabled:opacity-50"
          >
            {loading ? 'Redirecting…' : 'Unlock full draft'}
          </button>
        </div>
      )}
    </div>
  );
}

// ── Checklist ─────────────────────────────────────────────────────────────────

function ChecklistContent({ payload }: { payload: ChecklistPayload }) {
  return (
    <div className="space-y-6">
      <ChecklistSection
        title="Needed now — for application submission"
        items={payload.now}
        accentClass="text-accent"
      />
      <ChecklistSection
        title="Needed later — for reimbursement claim"
        items={payload.later}
        accentClass="text-text-tertiary"
      />
    </div>
  );
}

function ChecklistSection({
  title,
  items,
  accentClass,
}: {
  title: string;
  items: ChecklistPayload['now'];
  accentClass: string;
}) {
  return (
    <div>
      <p className={`mb-3 font-mono text-[10px] uppercase tracking-widest ${accentClass}`}>
        {title}
      </p>
      <ul className="space-y-2">
        {items.map((item) => (
          <li key={item.id} className="flex items-start gap-3">
            <span className="mt-0.5 h-4 w-4 shrink-0 rounded border border-border bg-background-elevated" />
            <div>
              <p className="text-sm text-text-primary">{item.label}</p>
              {item.note && (
                <p className="mt-0.5 font-mono text-xs text-text-tertiary">{item.note}</p>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}


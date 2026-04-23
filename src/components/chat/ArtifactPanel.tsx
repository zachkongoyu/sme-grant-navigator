import Link from 'next/link';

import type { Artifact, ChecklistPayload, DraftPayload, ShortlistItem } from './types';

interface ArtifactPanelProps {
  readonly artifact: Artifact | null;
  readonly onClose: () => void;
}

export function ArtifactPanel({ artifact, onClose }: ArtifactPanelProps) {
  if (!artifact) return null;

  return (
    <div className="flex h-full flex-col border-l border-border bg-surface">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-widest text-text-tertiary">
            {artifact.kind}
          </p>
          <p className="text-sm font-medium text-text-primary">{artifact.title}</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-text-tertiary hover:bg-surface-hover hover:text-text-primary transition-colors"
          aria-label="Close panel"
        >
          ×
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {artifact.kind === 'shortlist' && (
          <ShortlistContent items={artifact.payload as ShortlistItem[]} />
        )}
        {artifact.kind === 'draft' && (
          <DraftContent payload={artifact.payload as DraftPayload} />
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

function formatHKD(amount: number | null): string {
  if (amount === null) return 'Varies';
  return new Intl.NumberFormat('en-HK', {
    style: 'currency',
    currency: 'HKD',
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
              {formatHKD(item.fundingCap)}
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

function DraftContent({ payload }: { payload: DraftPayload }) {
  // Render the markdown draft as formatted text sections.
  // Replace with a proper markdown renderer (react-markdown) post-MVP.
  const sections = payload.text.split(/\n(?=#{1,3} )/);

  return (
    <div className="space-y-4">
      <p className="rounded-md border border-warning/30 bg-warning/5 px-3 py-2 font-mono text-xs text-warning">
        AI-generated draft — review all content before submitting. Not a guarantee of approval.
      </p>
      {sections.map((section, i) => {
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


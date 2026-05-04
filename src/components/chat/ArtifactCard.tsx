import Link from 'next/link';

import type { Artifact, ShortlistItem } from './types';

interface ArtifactCardProps {
  readonly artifact: Artifact;
  readonly onOpen: (artifact: Artifact) => void;
}

export function ArtifactCard({ artifact, onOpen }: ArtifactCardProps) {
  return (
    <button
      type="button"
      onClick={() => onOpen(artifact)}
      className="group mt-2 flex w-full items-start gap-3 rounded-lg border border-border bg-surface p-4 text-left transition-colors hover:border-border-strong hover:bg-surface-hover"
    >
      <ArtifactIcon kind={artifact.kind} />
      <div className="min-w-0 flex-1">
        <p className="font-mono text-xs uppercase tracking-widest text-text-tertiary">
          {artifact.kind}
        </p>
        <p className="mt-0.5 truncate text-sm font-medium text-text-primary">{artifact.title}</p>
        {artifact.kind === 'shortlist' && (
          <ShortlistPreview items={artifact.payload as ShortlistItem[]} />
        )}
      </div>
      <ChevronIcon />
    </button>
  );
}

function ShortlistPreview({ items }: { items: ShortlistItem[] }) {
  return (
    <ul className="mt-2 space-y-1">
      {items.slice(0, 3).map((item) => (
        <li key={item.id} className="flex items-center gap-2">
          <span className="h-1 w-1 shrink-0 rounded-full bg-text-tertiary" />
          <Link
            href={`/schemes/${item.id}`}
            className="truncate text-xs text-text-secondary hover:text-accent transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            {item.name}
          </Link>
        </li>
      ))}
    </ul>
  );
}

function ArtifactIcon({ kind }: { kind: Artifact['kind'] }) {
  return (
    <span className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-border bg-background-elevated text-text-tertiary">
      {kind === 'shortlist' ? '≡' : kind === 'draft' ? '✎' : kind === 'checklist' ? '✓' : '◦'}
    </span>
  );
}

function ChevronIcon() {
  return (
    <svg
      viewBox="0 0 16 16"
      className="mt-1 h-4 w-4 shrink-0 text-text-tertiary transition-transform group-hover:translate-x-0.5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 4l4 4-4 4" />
    </svg>
  );
}

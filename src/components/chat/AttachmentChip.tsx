'use client';

import { type AttachmentFile, type LinkAttachment } from './types';

interface AttachmentChipProps {
  readonly item: AttachmentFile | LinkAttachment;
  readonly onRemove: () => void;
}

export function AttachmentChip({ item, onRemove }: AttachmentChipProps) {
  const label =
    item.kind === 'file'
      ? `${item.name} · ${formatBytes(item.size)}`
      : item.url;

  return (
    <span className="inline-flex h-7 max-w-55 items-center gap-1.5 truncate rounded-md border border-border bg-surface-hover px-2 font-mono text-xs text-text-secondary">
      {item.kind === 'file' ? (
        <FileIcon />
      ) : (
        <LinkIcon />
      )}
      <span className="truncate">{label}</span>
      <button
        type="button"
        onClick={onRemove}
        className="ml-0.5 shrink-0 text-text-tertiary hover:text-text-primary transition-colors"
        aria-label={`Remove ${label}`}
      >
        ×
      </button>
    </span>
  );
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function FileIcon() {
  return (
    <svg viewBox="0 0 16 16" className="h-3 w-3 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M9 1H3a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V6L9 1z" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9 1v5h5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function LinkIcon() {
  return (
    <svg viewBox="0 0 16 16" className="h-3 w-3 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M6.5 9.5a3.5 3.5 0 0 0 5 0l2-2a3.5 3.5 0 0 0-5-5l-1 1" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9.5 6.5a3.5 3.5 0 0 0-5 0l-2 2a3.5 3.5 0 0 0 5 5l1-1" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

'use client';

import { useRef, useState, type ClipboardEvent, type MutableRefObject, type ReactNode } from 'react';

import type { Attachment, AttachmentFile, LinkAttachment } from '@/types';
import { AttachmentChip } from '@/components/chat/AttachmentChip';

export interface ContextComposerProps {
  value: string;
  onChange: (value: string) => void;
  attachments: Attachment[];
  onAttachmentsChange: (attachments: Attachment[]) => void;
  /**
   * Ref to a Map that holds the actual File objects keyed by attachment id.
   * Create this in the parent (`useRef<Map<string, File>>(new Map())`) and
   * pass it in so the parent can read real files when building FormData.
   */
  fileMapRef: MutableRefObject<Map<string, File>>;
  placeholder?: string;
  rows?: number;
  /** Shows a `{len} / {counterMax} chars` counter; falls back to hint text when empty. */
  counterMax?: number;
  /**
   * Adds a `border-t border-border` separator at the top of the composer.
   * Set to `true` when other form fields appear above the composer in the same card.
   */
  bordered?: boolean;
  /**
   * Optional label shown inside the composer area, above the textarea.
   * Uses the same mono / uppercase style as other field labels.
   */
  label?: ReactNode;
  labelSuffix?: ReactNode;
  /** Rendered on the right side of the toolbar (e.g. a submit button). */
  submitSlot?: ReactNode;
}

export function ContextComposer({
  value,
  onChange,
  attachments,
  onAttachmentsChange,
  fileMapRef,
  placeholder,
  rows = 8,
  counterMax,
  bordered = false,
  label,
  labelSuffix,
  submitSlot,
}: ContextComposerProps) {
  const [linkInputVisible, setLinkInputVisible] = useState(false);
  const [linkDraft, setLinkDraft] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  function addFiles(fileList: FileList | File[]) {
    const list = Array.from(fileList);
    const newItems: AttachmentFile[] = list.map((f) => {
      const id = crypto.randomUUID();
      fileMapRef.current.set(id, f);
      return { kind: 'file', id, name: f.name, size: f.size, mime: f.type };
    });
    onAttachmentsChange([...attachments, ...newItems]);
  }

  function removeAttachment(id: string) {
    fileMapRef.current.delete(id);
    onAttachmentsChange(attachments.filter((a) => a.id !== id));
  }

  function addLink() {
    const url = linkDraft.trim();
    if (!url) return;
    onAttachmentsChange([...attachments, { kind: 'link', id: crypto.randomUUID(), url }]);
    setLinkDraft('');
    setLinkInputVisible(false);
  }

  function handlePaste(e: ClipboardEvent<HTMLTextAreaElement>) {
    const pasted = e.clipboardData.getData('text').trim();
    if (/^https?:\/\/\S+$/.test(pasted)) {
      e.preventDefault();
      onAttachmentsChange([...attachments, { kind: 'link', id: crypto.randomUUID(), url: pasted }]);
    }
  }

  return (
    <div className={bordered ? 'border-t border-border' : undefined}>
      {label && (
        <div className="px-5 pt-5 pb-0">
          <label className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-tertiary">
            {label}
            {labelSuffix ? <>{' '}{labelSuffix}</> : null}
          </label>
        </div>
      )}
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onPaste={handlePaste}
        placeholder={placeholder}
        rows={rows}
        className={`w-full resize-none bg-transparent px-5 pb-3 text-sm leading-7 text-text-primary placeholder:text-text-tertiary focus:outline-none${label ? ' pt-2' : ' pt-5'}`}
      />
      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-1.5 border-t border-border px-5 py-3">
          {attachments.map((a) => (
            <AttachmentChip key={a.id} item={a} onRemove={() => removeAttachment(a.id)} />
          ))}
        </div>
      )}
      {linkInputVisible && (
        <div className="flex gap-2 border-t border-border px-5 py-3">
          <input
            autoFocus
            type="url"
            value={linkDraft}
            onChange={(e) => setLinkDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') { e.preventDefault(); addLink(); }
              if (e.key === 'Escape') { setLinkInputVisible(false); setLinkDraft(''); }
            }}
            placeholder="https://…"
            className="h-8 flex-1 rounded-md border border-border bg-background px-3 font-mono text-xs text-text-primary placeholder:text-text-tertiary focus:border-accent focus:outline-none"
          />
          <button
            type="button"
            onClick={addLink}
            className="h-8 rounded-md border border-border px-3 font-mono text-xs text-text-secondary hover:border-accent hover:text-accent transition-colors"
          >
            Add
          </button>
          <button
            type="button"
            onClick={() => { setLinkInputVisible(false); setLinkDraft(''); }}
            className="h-8 rounded-md px-3 font-mono text-xs text-text-tertiary hover:text-text-primary transition-colors"
          >
            Cancel
          </button>
        </div>
      )}
      <div className="flex items-center justify-between border-t border-border px-5 py-3">
        <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-text-tertiary hover:bg-surface-hover hover:text-text-primary transition-colors"
          aria-label="Attach file"
        >
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-3.5 w-3.5" aria-hidden="true">
            <path d="M13.5 7.5l-6 6a3.5 3.5 0 0 1-5-5l6.5-6.5a2 2 0 0 1 2.8 2.8l-6.5 6.5a.5.5 0 0 1-.7-.7L10 4.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <button
          type="button"
          onClick={() => setLinkInputVisible((v) => !v)}
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-text-tertiary hover:bg-surface-hover hover:text-text-primary transition-colors"
          aria-label="Add link"
        >
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-3.5 w-3.5" aria-hidden="true">
            <path d="M6.5 9.5a3.5 3.5 0 0 0 5 0l2-2a3.5 3.5 0 0 0-5-5l-1 1" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M9.5 6.5a3.5 3.5 0 0 0-5 0l-2 2a3.5 3.5 0 0 0 5 5l1-1" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <span className="ml-1 font-mono text-[10px] text-text-tertiary">
          {value.length > 0 && counterMax
            ? `${value.length.toLocaleString()} / ${counterMax.toLocaleString()} chars`
            : 'Drop files or paste a URL'}
        </span>
        </div>
        {submitSlot}
      </div>
      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        accept=".pdf,.docx,.xlsx,.xls,.csv,.tsv,.md,.txt"
        onChange={(e) => { if (e.target.files) addFiles(e.target.files); e.target.value = ''; }}
      />
    </div>
  );
}

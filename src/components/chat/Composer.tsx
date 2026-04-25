'use client';

import { useEffect, useRef, useState, type ChangeEvent, type DragEvent, type KeyboardEvent } from 'react';

import type { Attachment, AttachmentFile, LinkAttachment } from './types';
import { AttachmentChip } from './AttachmentChip';

interface ComposerProps {
  readonly onSend: (text: string, attachments: ReadonlyArray<Attachment>) => void;
  readonly isStreaming: boolean;
  readonly onStop: () => void;
  /** 'chat' (default): bottom-anchored with border-t. 'hero': no chrome, standalone card. */
  readonly variant?: 'chat' | 'hero';
  /** When seq increments, the textarea is filled with text. */
  readonly prefill?: { text: string; seq: number };
}

export function Composer({ onSend, isStreaming, onStop, variant = 'chat', prefill }: ComposerProps) {
  const [text, setText] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [linkInputVisible, setLinkInputVisible] = useState(false);
  const [linkValue, setLinkValue] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const appliedPrefillSeq = useRef(-1);

  useEffect(() => {
    const { text: prefillText, seq } = prefill ?? { text: '', seq: -1 };
    if (seq > appliedPrefillSeq.current && prefillText) {
      appliedPrefillSeq.current = seq;
      setText(prefillText);
      setTimeout(() => {
        autoResize();
        textareaRef.current?.focus();
      }, 0);
    }
  }, [prefill]);

  const canSend = (text.trim().length > 0 || attachments.length > 0) && !isStreaming;

  function autoResize() {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, window.innerHeight * 0.4)}px`;
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if ((e.key === 'Enter' && !e.shiftKey) || (e.key === 'Enter' && (e.metaKey || e.ctrlKey))) {
      e.preventDefault();
      if (canSend) submit();
    }
  }

  function submit() {
    onSend(text.trim(), attachments);
    setText('');
    setAttachments([]);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  }

  function removeAttachment(id: string) {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  }

  function addFiles(files: FileList | File[]) {
    const newAttachments: AttachmentFile[] = Array.from(files).map((file) => ({
      kind: 'file',
      id: crypto.randomUUID(),
      name: file.name,
      size: file.size,
      mime: file.type,
    }));
    setAttachments((prev) => [...prev, ...newAttachments]);
  }

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    if (e.target.files) addFiles(e.target.files);
    e.target.value = '';
  }

  function addLink() {
    const url = linkValue.trim();
    if (!url) return;
    const link: LinkAttachment = { kind: 'link', id: crypto.randomUUID(), url };
    setAttachments((prev) => [...prev, link]);
    setLinkValue('');
    setLinkInputVisible(false);
  }

  function handlePaste(e: React.ClipboardEvent<HTMLTextAreaElement>) {
    const items = Array.from(e.clipboardData.items);

    // Pasted image → attachment
    const imageItem = items.find((i) => i.type.startsWith('image/'));
    if (imageItem) {
      const file = imageItem.getAsFile();
      if (file) {
        e.preventDefault();
        addFiles([file]);
        return;
      }
    }

    // Pasted URL → link chip
    const text = e.clipboardData.getData('text');
    if (isUrl(text)) {
      e.preventDefault();
      const link: LinkAttachment = { kind: 'link', id: crypto.randomUUID(), url: text };
      setAttachments((prev) => [...prev, link]);
      return;
    }
  }

  function handleDragOver(e: DragEvent) {
    e.preventDefault();
    setIsDragging(true);
  }

  function handleDragLeave() {
    setIsDragging(false);
  }

  function handleDrop(e: DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files.length > 0) {
      addFiles(e.dataTransfer.files);
    }
  }

  const outerClass =
    variant === 'hero'
      ? `py-0 transition-colors ${isDragging ? 'bg-surface rounded-lg' : ''}`
      : `transition-colors ${isDragging ? 'opacity-80' : ''}`;

  return (
    <div
      className={outerClass}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="mx-auto max-w-3xl">
        {attachments.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-1.5">
            {attachments.map((a) => (
              <AttachmentChip key={a.id} item={a} onRemove={() => removeAttachment(a.id)} />
            ))}
          </div>
        )}

        {linkInputVisible && (
          <div className="mb-2 flex gap-2">
            <input
              autoFocus
              type="url"
              value={linkValue}
              onChange={(e) => setLinkValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') addLink();
                if (e.key === 'Escape') setLinkInputVisible(false);
              }}
              placeholder="https://..."
              className="h-8 flex-1 rounded-md border border-border bg-background-elevated px-3 font-mono text-xs text-text-primary placeholder:text-text-tertiary focus:border-accent focus:outline-none"
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
              onClick={() => setLinkInputVisible(false)}
              className="h-8 rounded-md px-3 font-mono text-xs text-text-tertiary hover:text-text-primary transition-colors"
            >
              Cancel
            </button>
          </div>
        )}

        <div className="rounded-lg border border-border bg-background-elevated focus-within:border-accent transition-colors">
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => { setText(e.target.value); autoResize(); }}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            placeholder="Tell me about your company and what you're trying to fund…"
            rows={3}
            className="w-full resize-none bg-transparent px-4 pt-3 pb-2 text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none"
          />

          <div className="flex items-center justify-between px-3 pb-3">
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex h-7 w-7 items-center justify-center rounded-md text-text-tertiary hover:bg-surface-hover hover:text-text-primary transition-colors"
                title="Attach files"
              >
                <PaperclipIcon />
              </button>
              <button
                type="button"
                onClick={() => setLinkInputVisible((v) => !v)}
                className="inline-flex h-7 w-7 items-center justify-center rounded-md text-text-tertiary hover:bg-surface-hover hover:text-text-primary transition-colors"
                title="Add link"
              >
                <LinkIcon />
              </button>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] text-text-tertiary">
                Enter to send · Shift+Enter for newline
              </span>
              {isStreaming ? (
                <button
                  type="button"
                  onClick={onStop}
                  className="inline-flex h-7 items-center gap-1.5 rounded-md border border-border px-3 font-mono text-xs text-text-secondary hover:border-danger hover:text-danger transition-colors"
                >
                  Stop
                </button>
              ) : (
                <button
                  type="button"
                  onClick={submit}
                  disabled={!canSend}
                  className="inline-flex h-7 items-center gap-1.5 rounded-md bg-accent px-3 font-mono text-xs text-accent-foreground hover:opacity-90 disabled:opacity-40 disabled:pointer-events-none transition-opacity"
                >
                  Send
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".pdf,.docx,.xlsx,.csv,.pptx,.txt,.md,image/*"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
}

function isUrl(str: string): boolean {
  try {
    const url = new URL(str.trim());
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

function PaperclipIcon() {
  return (
    <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M13.5 7.5l-6.5 6.5a4 4 0 0 1-5.66-5.66L8 1.66a2.5 2.5 0 0 1 3.54 3.54L5 11.66a1 1 0 0 1-1.41-1.41L9.5 4.34" />
    </svg>
  );
}

function LinkIcon() {
  return (
    <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6.5 9.5a3.5 3.5 0 0 0 5 0l2-2a3.5 3.5 0 0 0-5-5l-1 1" />
      <path d="M9.5 6.5a3.5 3.5 0 0 0-5 0l-2 2a3.5 3.5 0 0 0 5 5l1-1" />
    </svg>
  );
}

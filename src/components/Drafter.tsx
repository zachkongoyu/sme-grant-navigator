'use client';

import { useRef, useState, useCallback, type ChangeEvent, type DragEvent, type ReactNode } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Link from 'next/link';

import type { Scheme, AttachmentFile, LinkAttachment } from '@/types';
import {
  downloadDraftPdf,
  readDraftEventStream,
  streamDraftGeneration,
} from '@/lib/api/draft-client';
import { AttachmentChip } from '@/components/chat/AttachmentChip';
import { BackNavigation } from '@/components/navigation';
import { StatusChip } from '@/components/StatusChip';
import { CopyButton } from '@/components/CopyButton';

interface DrafterProps {
  readonly scheme: Scheme;
  readonly backHref: string;
  readonly headerControls?: ReactNode;
}

type Stage = 'compose' | 'streaming' | 'done' | 'error';

/**
 * Returns true if the model declined to draft because the request is off-topic.
 * Keyed on the phrase the system prompt instructs it to use.
 */
function isRejection(text: string): boolean {
  const t = text.trimStart().toLowerCase();
  return t.startsWith('i can only help draft');
}

/** Extends AttachmentFile with a raw File reference (never uploaded separately). */
interface DraftFileAttachment extends AttachmentFile {
  file: File;
}

type DraftAttachment = DraftFileAttachment | LinkAttachment;

export function Drafter({ scheme, backHref, headerControls }: DrafterProps) {
  const [context, setContext] = useState('');
  const [draft, setDraft] = useState('');
  const [stage, setStage] = useState<Stage>('compose');
  const [errorMsg, setErrorMsg] = useState('');
  const [noticeMsg, setNoticeMsg] = useState('');
  const [attachments, setAttachments] = useState<DraftAttachment[]>([]);
  const [linkInputVisible, setLinkInputVisible] = useState(false);
  const [linkValue, setLinkValue] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [followUp, setFollowUp] = useState('');
  const [history, setHistory] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([]);
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [pdfEmail, setPdfEmail] = useState('');
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfError, setPdfError] = useState('');
  const abortRef = useRef<AbortController | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function removeAttachment(id: string) {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  }

  async function addFiles(files: FileList | File[]) {
    const list = Array.from(files);
    if (list.length === 0) return;

    const newItems: DraftFileAttachment[] = list.map((f) => ({
      kind: 'file',
      id: crypto.randomUUID(),
      name: f.name,
      size: f.size,
      mime: f.type,
      file: f,
    }));
    setAttachments((prev) => [...prev, ...newItems]);
  }

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    if (e.target.files) void addFiles(e.target.files);
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
    const imageItem = items.find((i) => i.type.startsWith('image/'));
    if (imageItem) {
      const file = imageItem.getAsFile();
      if (file) { e.preventDefault(); void addFiles([file]); return; }
    }
    const pastedText = e.clipboardData.getData('text');
    if (isUrl(pastedText)) {
      e.preventDefault();
      const link: LinkAttachment = { kind: 'link', id: crypto.randomUUID(), url: pastedText };
      setAttachments((prev) => [...prev, link]);
    }
  }

  function handleDragOver(e: DragEvent) { e.preventDefault(); setIsDragging(true); }
  function handleDragLeave() { setIsDragging(false); }
  function handleDrop(e: DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files.length > 0) void addFiles(e.dataTransfer.files);
  }

  const isUploading = false;
  const canGenerate = context.trim().length > 0 || attachments.length > 0;

  const generate = useCallback(async () => {
    if (!canGenerate) return;
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;

    setDraft('');
    setStage('streaming');
    setErrorMsg('');

    const files = attachments
      .filter((a): a is DraftFileAttachment => a.kind === 'file')
      .map((a) => a.file);

    const urls = attachments
      .filter((a): a is LinkAttachment => a.kind === 'link')
      .map((a) => a.url);

    try {
      const reader = await streamDraftGeneration(
        scheme.id,
        { userContext: context, files, urls },
        ctrl.signal,
      );
      const fullDraft = await readDraftEventStream(reader, (chunk) => {
        setDraft((prev) => prev + chunk);
      });

      if (isRejection(fullDraft)) {
        setDraft('');
        setNoticeMsg(fullDraft.trim());
        setStage('compose');
      } else {
        setStage('done');
        setHistory([
          { role: 'user' as const, content: context },
          { role: 'assistant' as const, content: fullDraft },
        ]);
      }
    } catch (err) {
      if ((err as Error)?.name === 'AbortError') return;
      setErrorMsg((err as Error)?.message ?? 'Generation failed');
      setStage('error');
    }
  }, [context, attachments, scheme.id, canGenerate]);

  const revise = useCallback(async () => {
    const msg = followUp.trim();
    if (!msg) return;
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;

    const currentHistory = history;
    setFollowUp('');
    setDraft('');
    setStage('streaming');

    try {
      const reader = await streamDraftGeneration(
        scheme.id,
        { userContext: msg, history: currentHistory },
        ctrl.signal,
      );
      const fullDraft = await readDraftEventStream(reader, (chunk) => {
        setDraft((prev) => prev + chunk);
      });

      if (isRejection(fullDraft)) {
        setDraft('');
        setNoticeMsg(fullDraft.trim());
        setStage('done');
      } else {
        setStage('done');
        setHistory((prev) => [
          ...prev,
          { role: 'user' as const, content: msg },
          { role: 'assistant' as const, content: fullDraft },
        ]);
      }
    } catch (err) {
      if ((err as Error)?.name === 'AbortError') return;
      setErrorMsg((err as Error)?.message ?? 'Revision failed');
      setStage('error');
    }
  }, [followUp, history, scheme.id]);

  const reset = useCallback(() => {
    abortRef.current?.abort();
    setDraft('');
    setStage('compose');
    setErrorMsg('');
    setNoticeMsg('');
    setAttachments([]);
    setLinkInputVisible(false);
    setLinkValue('');
    setFollowUp('');
    setHistory([]);
  }, []);

  const downloadPdf = useCallback(async () => {
    if (!isValidEmail(pdfEmail)) return;
    setPdfLoading(true);
    setPdfError('');
    try {
      const blob = await downloadDraftPdf(scheme.id, draft, pdfEmail);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${scheme.id}-draft.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      setShowPdfModal(false);
      setPdfEmail('');
    } catch (error) {
      setPdfError((error as Error).message || 'PDF export failed. Please try again.');
    } finally {
      setPdfLoading(false);
    }
  }, [pdfEmail, draft, scheme.id]);

  const capDisplay = scheme.maxFunding
    ? `HK$${(scheme.maxFunding / 1000).toFixed(0)}K`
    : 'Varies';

  // ── Compose / error ──────────────────────────────────────────────────────
  if (stage === 'compose' || stage === 'error') {
    return (
      <div
        className={`relative min-h-screen transition-opacity ${isDragging ? 'opacity-60' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {/* Back nav */}
        <div className="absolute top-6 left-6">
          <BackNavigation fallbackHref={backHref} />
        </div>
        <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        {headerControls && (
          <div className="mb-6 flex justify-center">
            {headerControls}
          </div>
        )}
        <div className="mb-8 text-center">
          <div className="mb-3 flex items-center justify-center gap-2">
            <StatusChip variant="beta" />
            <div className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-text-secondary">
              {scheme.jurisdiction} · Up to {capDisplay}
            </span>
            </div>
          </div>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            {scheme.name}
          </h1>
          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-text-secondary">
            Paste your company background, project goals, and budget. Thunder writes the complete application — with{' '}
            <code className="rounded bg-surface-hover px-1 py-px text-xs text-text-primary">[TODO]</code>{' '}
            gaps where your input is required.
          </p>
        </div>

        {/* Input card */}
        <div className="rounded-2xl border border-border bg-surface overflow-hidden">
          {/* Drop zone / textarea */}
          <div className="relative">
            <textarea
              value={context}
              onChange={(e) => { setContext(e.target.value); setNoticeMsg(''); }}
              onPaste={handlePaste}
              placeholder={`Describe your company and project…\n\nE.g. Acme Ltd, 12-person HK food manufacturer. Apply for Easy BUD to fund market research in the GBA (Activity 4.1, ~HK$60K) and a Chinese e-catalogue (Activity 4.5, ~HK$90K). First-time BUD applicant.`}
              rows={10}
              className="w-full resize-none bg-transparent px-5 pt-5 pb-3 text-sm leading-7 text-text-primary placeholder:text-text-tertiary focus:outline-none"
            />
            {isDragging && (
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-t-2xl border-2 border-dashed border-accent bg-accent/5">
                <span className="font-mono text-xs uppercase tracking-widest text-accent">Drop files here</span>
              </div>
            )}
          </div>

          {/* Attachment chips */}
          {attachments.length > 0 && (
            <div className="flex flex-wrap gap-1.5 border-t border-border px-5 py-3">
              {attachments.map((a) => (
                <span key={a.id} className="relative">
                  <AttachmentChip item={a} onRemove={() => removeAttachment(a.id)} />
                </span>
              ))}
            </div>
          )}

          {/* Link input row */}
          {linkInputVisible && (
            <div className="flex gap-2 border-t border-border px-5 py-3">
              <input
                autoFocus
                type="url"
                value={linkValue}
                onChange={(e) => setLinkValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') addLink();
                  if (e.key === 'Escape') setLinkInputVisible(false);
                }}
                placeholder="https://…"
                className="h-8 flex-1 rounded-md border border-border bg-background px-3 font-mono text-xs text-text-primary placeholder:text-text-tertiary focus:border-accent focus:outline-none"
              />
              <button type="button" onClick={addLink}
                className="h-8 rounded-md border border-border px-3 font-mono text-xs text-text-secondary hover:border-accent hover:text-accent transition-colors">
                Add
              </button>
              <button type="button" onClick={() => setLinkInputVisible(false)}
                className="h-8 rounded-md px-3 font-mono text-xs text-text-tertiary hover:text-text-primary transition-colors">
                Cancel
              </button>
            </div>
          )}

          {/* Bottom toolbar */}
          <div className="flex items-center justify-between border-t border-border bg-background px-4 py-3">
            <div className="flex items-center gap-1">
              <button type="button" onClick={() => fileInputRef.current?.click()}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-text-tertiary hover:bg-surface-hover hover:text-text-primary transition-colors"
                title="Attach files (.pdf, .docx, .csv…)">
                <PaperclipIcon />
              </button>
              <button type="button" onClick={() => setLinkInputVisible((v) => !v)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-text-tertiary hover:bg-surface-hover hover:text-text-primary transition-colors"
                title="Add a link">
                <LinkIcon />
              </button>
              <span className="ml-2 font-mono text-[10px] text-text-tertiary">
                Drop files or paste a URL
              </span>
            </div>

            <button
              type="button"
              onClick={generate}
              disabled={!canGenerate}
              className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition hover:opacity-90 disabled:cursor-not-allowed"
              style={canGenerate ? { backgroundColor: 'var(--accent)', color: 'var(--accent-foreground)' } : { backgroundColor: 'var(--border)', color: 'var(--text-tertiary)' }}
            >
              <SparkleIcon />
              {isUploading ? 'Processing…' : 'Generate'}
            </button>
          </div>
        </div>

        <p className="mt-2 text-center font-mono text-[10px] text-text-tertiary">
          By generating you agree to our{' '}
          <Link href="/privacy" className="underline hover:text-text-secondary transition-colors">privacy notice</Link>
        </p>

        {noticeMsg && (
          <p className="mt-4 rounded-xl border border-warning/30 bg-warning/8 px-4 py-3 text-sm text-warning">
            {noticeMsg}
          </p>
        )}

        {stage === 'error' && (
          <p className="mt-4 rounded-xl border border-danger/30 bg-danger/8 px-4 py-3 text-sm text-danger">
            {errorMsg}
          </p>
        )}

        <input ref={fileInputRef} type="file" multiple
          accept=".pdf,.docx,.xlsx,.csv,.pptx,.txt,.md,image/*"
          className="hidden" onChange={handleFileChange} />
      </div>
    </div>
    );
  }

  // ── Streaming — neutral thinking state ──────────────────────────────────
  if (stage === 'streaming') {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        {/* Scheme pill */}
        <div className="mb-8 text-center">
          <div className="mb-3 flex items-center justify-center gap-2">
            <StatusChip variant="beta" />
            <div className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-text-secondary">
              {scheme.name} · Evaluating brief…
            </span>
            </div>
          </div>
        </div>

        {draft.length === 0 ? (
          /* Skeleton while waiting for first token */
          <div className="space-y-3 rounded-2xl border border-border bg-surface p-6">
            {[72, 55, 88, 60, 40].map((w, i) => (
              <div key={i} className="h-3 animate-pulse rounded-full bg-surface-hover" style={{ width: `${w}%` }} />
            ))}
          </div>
        ) : (
          /* Streamed text preview — shown as it arrives */
          <div className="rounded-2xl border border-border bg-surface px-6 py-5 text-sm leading-7 text-text-secondary">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{draft}</ReactMarkdown>
          </div>
        )}

        <button
          type="button"
          onClick={() => { abortRef.current?.abort(); setStage('compose'); setDraft(''); }}
          className="mt-6 flex w-full items-center justify-center rounded-xl py-2.5 text-sm text-text-tertiary transition hover:text-text-primary"
        >
          Cancel generation
        </button>
      </div>
    );
  }

  // ── Done — two-panel document view ───────────────────────────────────────
  return (
    <>
      {showPdfModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-2xl border border-border bg-background p-6 shadow-xl">
            <h2 className="mb-1 text-sm font-semibold text-text-primary">Download PDF</h2>
            <p className="mb-4 text-xs text-text-secondary">
              Enter your email — we&apos;ll use it to send you updates about your application.
            </p>
            <input
              type="email"
              value={pdfEmail}
              onChange={(e) => setPdfEmail(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && isValidEmail(pdfEmail)) void downloadPdf(); }}
              placeholder="you@company.com"
              autoFocus
              className="mb-3 h-9 w-full rounded-lg border border-border bg-surface px-3 font-mono text-sm text-text-primary placeholder:text-text-tertiary focus:border-accent focus:outline-none"
            />
            {pdfError && (
              <p className="mb-3 rounded-lg border border-danger/30 bg-danger/8 px-3 py-2 text-xs text-danger">{pdfError}</p>
            )}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => void downloadPdf()}
                disabled={!isValidEmail(pdfEmail) || pdfLoading}
                className="flex-1 rounded-xl py-2 text-sm font-semibold transition hover:opacity-90 disabled:cursor-not-allowed"
                style={isValidEmail(pdfEmail) && !pdfLoading
                  ? { backgroundColor: 'var(--accent)', color: 'var(--accent-foreground)' }
                  : { backgroundColor: 'var(--border)', color: 'var(--text-tertiary)' }}
              >
                {pdfLoading ? 'Generating…' : 'Download PDF'}
              </button>
              <button
                type="button"
                onClick={() => { setShowPdfModal(false); setPdfError(''); }}
                className="rounded-xl border border-border px-4 py-2 text-sm text-text-secondary transition hover:text-text-primary"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[280px_1fr]">

      {/* Left rail — source summary */}
      <aside className="space-y-4 lg:sticky lg:top-16 lg:self-start">
        {/* Scheme badge */}
        <div className="rounded-xl border border-border bg-surface p-4">
          <div className="mb-1 flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            <span className="font-mono text-[10px] uppercase tracking-widest text-text-tertiary">{scheme.jurisdiction}</span>
          </div>
          <p className="text-sm font-semibold leading-snug text-text-primary">{scheme.name}</p>
          <p className="mt-0.5 font-mono text-xs text-text-tertiary">Up to {capDisplay}</p>
        </div>

        {/* Your input summary */}
        <div className="rounded-xl border border-border bg-surface p-4">
          <p className="mb-2 font-mono text-[10px] uppercase tracking-widest text-text-tertiary">Your input</p>
          <p className="line-clamp-6 text-xs leading-5 text-text-secondary">{context}</p>
          {attachments.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1">
              {attachments.map((a) => (
                <span key={a.id} className="inline-flex max-w-40 items-center gap-1 truncate rounded-md border border-border px-2 py-0.5 font-mono text-[10px] text-text-tertiary">
                  {a.kind === 'file' ? <MiniFileIcon /> : <MiniLinkIcon />}
                  <span className="truncate">{a.kind === 'file' ? a.name : a.url}</span>
                </span>
              ))}
            </div>
          )}
        </div>

        {stage === 'done' && (
          <div className="space-y-2">
            <CopyButton value={draft} label="Copy draft" className="w-full justify-center" />
            <button type="button" onClick={() => { setPdfError(''); setShowPdfModal(true); }}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-surface py-2.5 text-sm text-text-secondary transition hover:border-accent hover:text-accent">
              <DownloadIcon />
              Download PDF
            </button>
            <button type="button" onClick={reset}
              className="flex w-full items-center justify-center rounded-xl py-2.5 text-sm text-text-tertiary transition hover:text-text-primary">
              Reset draft
            </button>
          </div>
        )}
      </aside>

      {/* Right — document output */}
      <div className="min-w-0">
        {/* Document header bar */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <StatusChip variant="beta" compact />
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-success">
              <span className="h-1.5 w-1.5 rounded-full bg-success" />
              Draft ready
            </span>
            <span className="font-mono text-[10px] text-text-tertiary">
              {new Date().toLocaleDateString('en-HK', { year: 'numeric', month: 'short', day: 'numeric' })}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <CopyButton value={draft} label="Copy draft" size="compact" className="hidden sm:flex" />
            <button type="button" onClick={() => { setPdfError(''); setShowPdfModal(true); }}
              className="hidden sm:inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-1.5 font-mono text-xs text-text-secondary hover:border-accent hover:text-accent transition-colors">
              <DownloadIcon />
              Download PDF
            </button>
            <button type="button" onClick={reset}
              className="hidden sm:inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-mono text-xs text-text-tertiary hover:text-text-primary transition-colors">
              Reset draft
            </button>
          </div>
        </div>

        {/* Streaming skeleton — shown while first tokens arrive */}
        {draft.length === 0 && (
          <div className="space-y-3 rounded-2xl border border-border bg-surface p-6">
            {[80, 65, 90, 55, 75].map((w, i) => (
              <div key={i} className="h-3 animate-pulse rounded-full bg-surface-hover" style={{ width: `${w}%` }} />
            ))}
          </div>
        )}

        {/* Document body */}
        {draft.length > 0 && (
          <article className="prose prose-sm prose-invert max-w-none rounded-2xl border border-border bg-surface px-6 py-6 prose-headings:font-semibold prose-headings:tracking-tight prose-a:text-accent prose-code:rounded prose-code:bg-surface-hover prose-code:px-1 prose-table:text-xs">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{draft}</ReactMarkdown>
          </article>
        )}

        {/* Mobile actions */}
        <div className="mt-4 flex gap-3 sm:hidden">
          <CopyButton value={draft} label="Copy draft" className="flex-1 justify-center" />
          <button type="button" onClick={reset}
            className="flex-1 rounded-xl border border-border bg-surface py-2.5 text-sm text-text-tertiary transition hover:text-text-primary">
            Reset draft
          </button>
        </div>

        {/* Refine this draft */}
        <div className="mt-6 rounded-2xl border border-border bg-surface overflow-hidden">
          <div className="px-5 pt-4 pb-1">
            <p className="mb-2 font-mono text-[10px] uppercase tracking-widest text-text-tertiary">
              Refine this draft
            </p>
            <textarea
              value={followUp}
              onChange={(e) => setFollowUp(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey) && followUp.trim()) revise();
              }}
              placeholder={`Ask for changes… e.g.\n"Make the executive summary shorter"\n"Add a risk mitigation section"\n"Translate the cover letter to Traditional Chinese"`}
              rows={4}
              className="w-full resize-none bg-transparent pb-2 text-sm leading-6 text-text-primary placeholder:text-text-tertiary focus:outline-none"
            />
          </div>
          <div className="flex items-center justify-between border-t border-border bg-background px-4 py-3">
            <span className="font-mono text-[10px] text-text-tertiary">⌘ Enter to send</span>
            <button
              type="button"
              onClick={revise}
              disabled={!followUp.trim()}
              className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition hover:opacity-90 disabled:cursor-not-allowed"
              style={followUp.trim() ? { backgroundColor: 'var(--accent)', color: 'var(--accent-foreground)' } : { backgroundColor: 'var(--border)', color: 'var(--text-tertiary)' }}
            >
              <SparkleIcon />
              Revise draft
            </button>
          </div>
        </div>
      </div>
    </div>
    </>
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

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function SparkleIcon() {
  return (
    <svg viewBox="0 0 16 16" className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M8 1.5 9.06 5.44a2 2 0 0 0 1.5 1.5L14.5 8l-3.94 1.06a2 2 0 0 0-1.5 1.5L8 14.5l-1.06-3.94a2 2 0 0 0-1.5-1.5L1.5 8l3.94-1.06a2 2 0 0 0 1.5-1.5L8 1.5Z" />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M8 2v8M5 7l3 3 3-3" />
      <path d="M2 12v1.5A1.5 1.5 0 0 0 3.5 15h9a1.5 1.5 0 0 0 1.5-1.5V12" />
    </svg>
  );
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

function MiniFileIcon() {
  return (
    <svg viewBox="0 0 12 12" className="h-2.5 w-2.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 1H2.5A.5.5 0 0 0 2 1.5v9a.5.5 0 0 0 .5.5h7a.5.5 0 0 0 .5-.5V4L7 1z" />
      <path d="M7 1v3h3" />
    </svg>
  );
}

function MiniLinkIcon() {
  return (
    <svg viewBox="0 0 12 12" className="h-2.5 w-2.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 7a2.5 2.5 0 0 0 3.5 0l1.5-1.5A2.5 2.5 0 0 0 6.5 2L5.5 3" />
      <path d="M7 5a2.5 2.5 0 0 0-3.5 0L2 6.5A2.5 2.5 0 0 0 5.5 10l1-1" />
    </svg>
  );
}

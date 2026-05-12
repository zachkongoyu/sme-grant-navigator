'use client';

import { useEffect, useRef, useState } from 'react';

import type { Attachment, AttachmentFile, LinkAttachment } from '@/types';
import { BILLING } from '@/config/billing';
import { FundraisingToolLayout } from '@/components/fundraise/FundraisingToolLayout';
import { ContextComposer } from '@/components/ui/ContextComposer';
import { GenerateButton } from '@/components/ui/GenerateButton';

const STAGES = ['Pre-idea', 'Pre-seed', 'Seed', 'Series A', 'Series B+'];
const SECTORS = [
  'Fintech', 'AI / ML', 'Healthtech', 'Edtech', 'Proptech',
  'Logistics', 'E-commerce', 'SaaS / B2B', 'Consumer', 'Deep Tech', 'Other',
];

function InlineSelect({ label, placeholder, value, onChange, options }: {
  label: string; placeholder: string; value: string;
  onChange: (v: string) => void; options: string[];
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function onDown(e: PointerEvent) { if (!ref.current?.contains(e.target as Node)) setOpen(false); }
    document.addEventListener('pointerdown', onDown);
    return () => document.removeEventListener('pointerdown', onDown);
  }, []);
  return (
    <div ref={ref} className="relative flex items-center gap-4 py-3">
      <span className="w-20 shrink-0 font-mono text-[10px] uppercase tracking-[0.2em] text-text-tertiary">{label}</span>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex flex-1 items-center justify-between text-sm focus:outline-none"
      >
        <span className={value ? 'text-text-primary' : 'text-text-tertiary'}>{value || placeholder}</span>
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6"
          className={`h-3 w-3 shrink-0 text-text-tertiary transition-transform ${open ? 'rotate-180' : ''}`}>
          <path d="M4 6l4 4 4-4" />
        </svg>
      </button>
      {open && (
          <ul className="absolute left-24 top-full z-20 min-w-40 overflow-hidden rounded-xl border border-border bg-surface py-1 shadow-xl">
          {options.map((option) => (
            <li key={option}
              onPointerDown={() => { onChange(option); setOpen(false); }}
              className={`cursor-pointer px-4 py-2 text-sm transition hover:bg-[color-mix(in_srgb,var(--accent)_8%,transparent)] ${
                option === value ? 'text-accent' : 'text-text-primary'
              }`}
            >{option}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function DataRoomClient() {
  const [stage, setStage] = useState('');
  const [sector, setSector] = useState('');
  const [contextText, setContextText] = useState('');
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [resultMeta, setResultMeta] = useState<{ stage: string; sector: string } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | undefined>();
  const [pdfLoading, setPdfLoading] = useState(false);

  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const fileMapRef = useRef<Map<string, File>>(new Map());

  const canGenerate = stage.length > 0 && sector.length > 0;

  async function handleGenerate() {
    if (!canGenerate) return;
    setGenerating(true);
    setErrorMsg(undefined);
    setResult(null);
    try {
      const form = new FormData();
      form.append('stage', stage);
      form.append('sector', sector);
      form.append('contextText', contextText);
      attachments
        .filter((a): a is AttachmentFile => a.kind === 'file')
        .forEach((a) => { const f = fileMapRef.current.get(a.id); if (f) form.append('files', f); });
      attachments
        .filter((a): a is LinkAttachment => a.kind === 'link')
        .forEach((a) => form.append('urls', a.url));
      const res = await fetch('/api/fundraise/data-room', { method: 'POST', body: form });
      const data = await res.json() as { content?: string; error?: string };
      if (!res.ok) {
        setErrorMsg(data.error ?? 'Generation failed. Please try again.');
        return;
      }
      setResult(data.content ?? '');
      setResultMeta({ stage, sector });
    } catch {
      setErrorMsg('Network error. Please try again.');
    } finally {
      setGenerating(false);
    }
  }

  async function handleDownloadPdf() {
    if (!result) return;
    setPdfLoading(true);
    try {
      const res = await fetch('/api/fundraise/data-room/pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: result, stage: resultMeta?.stage ?? stage, sector: resultMeta?.sector ?? sector }),
      });
      if (!res.ok) throw new Error('PDF generation failed');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'thunder-data-room-checklist.pdf';
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setPdfLoading(false);
    }
  }

  return (
    <FundraisingToolLayout
      title="Data Room Checklist"
      description="Prioritised due diligence checklist for your stage and sector. HIGH / MEDIUM / LOW priority with investor rationale for each item."
      creditCost={BILLING.creditCost.dataRoomChecklist}
      generating={generating}
      onGenerate={() => void handleGenerate()}
      result={result}
      onDownloadPdf={() => void handleDownloadPdf()}
      pdfLoading={pdfLoading}
      errorMsg={errorMsg}
      fieldsSlot={
        <div className="divide-y divide-border">
          <InlineSelect label="Stage" placeholder="Select stage…" value={stage} onChange={setStage} options={STAGES} />
          <InlineSelect label="Sector" placeholder="Select sector…" value={sector} onChange={setSector} options={SECTORS} />
        </div>
      }
      inputSlot={
        <ContextComposer
          label="Company context"
          labelSuffix={<span className="font-normal normal-case text-text-tertiary">(optional — improves tailoring)</span>}
          value={contextText}
          onChange={setContextText}
          attachments={attachments}
          onAttachmentsChange={setAttachments}
          fileMapRef={fileMapRef}
          placeholder="What you do, your business model, any regulatory considerations…"
          rows={5}
          submitSlot={
            <GenerateButton
              label="Generate checklist"
              loading={generating}
              disabled={!canGenerate}
              onClick={() => void handleGenerate()}
            />
          }
        />
      }
    />
  );
}
'use client';

import { useRef, useState } from 'react';

import type { Attachment, AttachmentFile, LinkAttachment } from '@/types';
import { BILLING } from '@/config/billing';
import { FundraisingToolLayout } from '@/components/fundraise/FundraisingToolLayout';
import { ContextComposer } from '@/components/ui/ContextComposer';
import { GenerateButton } from '@/components/ui/GenerateButton';

export function PitchDeckClient() {
  const [contextText, setContextText] = useState('');
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | undefined>();
  const [pdfLoading, setPdfLoading] = useState(false);

  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const fileMapRef = useRef<Map<string, File>>(new Map());

  const canGenerate = contextText.trim().length > 0 || attachments.length > 0;

  async function handleGenerate() {
    if (!canGenerate) return;
    setGenerating(true);
    setErrorMsg(undefined);
    setResult(null);
    try {
      const form = new FormData();
      form.append('contextText', contextText);
      attachments
        .filter((a): a is AttachmentFile => a.kind === 'file')
        .forEach((a) => { const f = fileMapRef.current.get(a.id); if (f) form.append('files', f); });
      attachments
        .filter((a): a is LinkAttachment => a.kind === 'link')
        .forEach((a) => form.append('urls', a.url));
      const res = await fetch('/api/fundraise/pitch-deck', { method: 'POST', body: form });
      const data = await res.json() as { content?: string; error?: string };
      if (!res.ok) {
        setErrorMsg(data.error ?? 'Generation failed. Please try again.');
        return;
      }
      setResult(data.content ?? '');
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
      const res = await fetch('/api/fundraise/pitch-deck/pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: result }),
      });
      if (!res.ok) throw new Error('PDF generation failed');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'thunder-pitch-deck-script.pdf';
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setPdfLoading(false);
    }
  }

  return (
    <FundraisingToolLayout
      title="Pitch Deck Script"
      description="10-slide narrative script with speaker notes."
      creditCost={BILLING.creditCost.pitchDeck}
      generating={generating}
      onGenerate={() => void handleGenerate()}
      result={result}
      onDownloadPdf={() => void handleDownloadPdf()}
      pdfLoading={pdfLoading}
      errorMsg={errorMsg}
      inputSlot={
        <ContextComposer
          value={contextText}
          onChange={setContextText}
          attachments={attachments}
          onAttachmentsChange={setAttachments}
          fileMapRef={fileMapRef}
          placeholder="What you do, who you serve, your traction so far, team background…"
          rows={9}
          counterMax={3_000}
          submitSlot={
            <GenerateButton
              label="Generate pitch deck"
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
'use client';

import { useRef, useState } from 'react';

import type { Attachment, AttachmentFile, LinkAttachment } from '@/types';
import { BILLING } from '@/config/billing';
import { FundraisingToolLayout } from '@/components/fundraise/FundraisingToolLayout';
import { ContextComposer } from '@/components/ui/ContextComposer';
import { GenerateButton } from '@/components/ui/GenerateButton';

const PLACEHOLDER = `E.g. Acme Ltd — 8-person Hong Kong fintech building a B2B invoice financing platform for SMEs. We help small suppliers get paid in 24h instead of 60 days by letting them sell invoices at a small discount. 120 beta customers, HKD 2.4M funded in first 3 months. Raising HKD 8M seed to grow sales team and expand to Singapore. Founders: CEO (ex-HSBC, 12 yrs trade finance) and CTO (ex-Google).`;

export default function OnePagerPage() {
  const [companyContext, setCompanyContext] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const fileMapRef = useRef<Map<string, File>>(new Map());
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | undefined>();
  const [pdfLoading, setPdfLoading] = useState(false);

  async function handleGenerate() {
    if (!companyContext.trim() && attachments.length === 0) return;
    setGenerating(true);
    setErrorMsg(undefined);
    setResult(null);
    try {
      const form = new FormData();
      form.append('companyContext', companyContext);
      attachments
        .filter((a): a is AttachmentFile => a.kind === 'file')
        .forEach((a) => { const f = fileMapRef.current.get(a.id); if (f) form.append('files', f); });
      attachments
        .filter((a): a is LinkAttachment => a.kind === 'link')
        .forEach((a) => form.append('urls', a.url));
      const res = await fetch('/api/fundraise/one-pager', { method: 'POST', body: form });
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
      const res = await fetch('/api/fundraise/one-pager/pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: result }),
      });
      if (!res.ok) throw new Error('PDF generation failed');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'thunder-one-pager.pdf';
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setPdfLoading(false);
    }
  }

  return (
    <FundraisingToolLayout
      title="Investor One-Pager"
      description="A 400-word investor summary covering problem, solution, traction, team, and ask. Copy or download as PDF."
      creditCost={BILLING.creditCost.onePager}
      generating={generating}
      onGenerate={() => void handleGenerate()}
      result={result}
      onDownloadPdf={() => void handleDownloadPdf()}
      pdfLoading={pdfLoading}
      errorMsg={errorMsg}
      inputSlot={
        <ContextComposer
          value={companyContext}
          onChange={setCompanyContext}
          attachments={attachments}
          onAttachmentsChange={setAttachments}
          fileMapRef={fileMapRef}
          placeholder={PLACEHOLDER}
          rows={9}
          counterMax={10_000}
          submitSlot={
            <GenerateButton
              label="Generate one-pager"
              loading={generating}
              disabled={!companyContext.trim() && attachments.length === 0}
              onClick={() => void handleGenerate()}
            />
          }
        />
      }
    />
  );
}

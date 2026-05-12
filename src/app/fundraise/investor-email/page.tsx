'use client';

import { useRef, useState } from 'react';

import type { Attachment, AttachmentFile, LinkAttachment } from '@/types';
import { BILLING } from '@/config/billing';
import { FundraisingToolLayout } from '@/components/fundraise/FundraisingToolLayout';
import { ContextComposer } from '@/components/ui/ContextComposer';
import { GenerateButton } from '@/components/ui/GenerateButton';

export default function InvestorEmailPage() {
  const [investorName, setInvestorName] = useState('');
  const [investorFirm, setInvestorFirm] = useState('');
  const [investorThesis, setInvestorThesis] = useState('');
  const [companyContext, setCompanyContext] = useState('');
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | undefined>();

  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const fileMapRef = useRef<Map<string, File>>(new Map());

  const canGenerate = investorName.trim().length > 0 && (companyContext.trim().length > 0 || attachments.length > 0);

  async function handleGenerate() {
    if (!canGenerate) return;
    setGenerating(true);
    setErrorMsg(undefined);
    setResult(null);
    try {
      const form = new FormData();
      form.append('investorName', investorName);
      form.append('investorFirm', investorFirm);
      form.append('investorThesis', investorThesis);
      form.append('companyContext', companyContext);
      attachments
        .filter((a): a is AttachmentFile => a.kind === 'file')
        .forEach((a) => { const f = fileMapRef.current.get(a.id); if (f) form.append('files', f); });
      attachments
        .filter((a): a is LinkAttachment => a.kind === 'link')
        .forEach((a) => form.append('urls', a.url));
      const res = await fetch('/api/fundraise/investor-email', { method: 'POST', body: form });
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

  return (
    <FundraisingToolLayout
      title="Investor Email"
      description="A personalised cold email under 125 words. Two sentences specifically reference the investor's thesis or portfolio."
      creditCost={BILLING.creditCost.investorEmail}
      generating={generating}
      onGenerate={() => void handleGenerate()}
      result={result}
      errorMsg={errorMsg}
      fieldsSlot={
        <div className="divide-y divide-border">
          <div className="flex items-center gap-4 py-3">
            <span className="w-20 shrink-0 font-mono text-[10px] uppercase tracking-[0.2em] text-text-tertiary">Name <span className="text-red-400">*</span></span>
            <input
              type="text"
              value={investorName}
              onChange={(e) => setInvestorName(e.target.value)}
              placeholder="e.g. Sarah Chen"
              className="flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none"
            />
          </div>
          <div className="flex items-center gap-4 py-3">
            <span className="w-20 shrink-0 font-mono text-[10px] uppercase tracking-[0.2em] text-text-tertiary">Firm</span>
            <input
              type="text"
              value={investorFirm}
              onChange={(e) => setInvestorFirm(e.target.value)}
              placeholder="e.g. Sequoia Capital"
              className="flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none"
            />
          </div>
          <div className="flex items-center gap-4 py-3">
            <span className="w-20 shrink-0 font-mono text-[10px] uppercase tracking-[0.2em] text-text-tertiary">Thesis</span>
            <input
              type="text"
              value={investorThesis}
              onChange={(e) => setInvestorThesis(e.target.value)}
              placeholder="e.g. B2B fintech in SEA, backed Wise and Airwallex"
              className="flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none"
            />
          </div>
        </div>
      }
      inputSlot={
        <ContextComposer
          label="Your company"
          labelSuffix={<span className="text-red-400">*</span>}
          value={companyContext}
          onChange={setCompanyContext}
          attachments={attachments}
          onAttachmentsChange={setAttachments}
          fileMapRef={fileMapRef}
          placeholder="What you do, who you serve, traction, raise amount and use of funds…"
          rows={6}
          submitSlot={
            <GenerateButton
              label="Generate email"
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

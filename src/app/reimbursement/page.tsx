import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Reimbursement Guide | Easy BUD | Thunder',
  description: 'Step-by-step guide to claiming your Easy BUD reimbursement after project completion.',
};

export default function ReimbursementPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-semibold tracking-tight">Easy BUD Reimbursement Guide</h1>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-text-secondary">
        After your project completes, you claim the government&apos;s matching share by submitting a reimbursement package through HKPC. Here is what that looks like.
      </p>

      <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_260px]">

        {/* Main steps */}
        <div>
          <div className="space-y-8">
            {[
              {
                step: '01',
                heading: 'Complete your project',
                body: 'All approved activities must be completed within the approved project period. Do not claim for work outside the approved scope or dates.',
              },
              {
                step: '02',
                heading: 'Collect payment evidence',
                body: 'For every expense: obtain an official receipt + proof of payment (bank statement or equivalent). Invoices alone are not sufficient — you need both.',
              },
              {
                step: '03',
                heading: 'Obtain deliverable evidence',
                body: 'Screenshots, samples, photos, or files demonstrating that each activity was actually carried out. E.g. market research report, screenshots of e-catalogue live on website, invoice from exhibition organiser.',
              },
              {
                step: '04',
                heading: 'Complete the reimbursement form',
                body: 'Download the prescribed reimbursement form from the HKPC BUD portal. Fill in actual costs (must not exceed approved amounts). Attach all evidence.',
              },
              {
                step: '05',
                heading: 'Submit within the deadline',
                body: 'Submit your reimbursement claim within 3 months of the project end date. Late submissions are typically not accepted.',
              },
              {
                step: '06',
                heading: 'HKPC review',
                body: 'HKPC reviews the claim, may request additional documentation, and then disburses the government matching share to your bank account.',
              },
            ].map(({ step, heading, body }) => (
              <div key={step} className="flex gap-5">
                <span className="mt-0.5 font-mono text-[11px] uppercase tracking-[0.2em] text-accent shrink-0 w-6">{step}</span>
                <div>
                  <p className="text-sm font-medium text-text-primary">{heading}</p>
                  <p className="mt-1 text-sm leading-6 text-text-secondary">{body}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 rounded-xl border border-warning/30 bg-warning/5 p-5">
            <p className="text-sm font-medium text-text-primary">Common rejection reasons</p>
            <ul className="mt-3 space-y-1.5 text-sm leading-6 text-text-secondary">
              <li>• Missing payment proof (bank statement / credit card slip)</li>
              <li>• Service provider not registered in Hong Kong</li>
              <li>• Activities completed outside approved dates</li>
              <li>• Deliverables do not match approved activity description</li>
              <li>• Claim submitted more than 3 months after project end</li>
            </ul>
          </div>

          <p className="mt-8 text-xs leading-6 text-text-tertiary">
            This guide is for informational purposes only. Always refer to the official HKPC BUD programme guidelines and your approval letter for binding requirements.{' '}
            <a href="https://www.hkpc.org/en/industry-solutions/productivity-services/bud-fund" target="_blank" rel="noreferrer" className="text-accent underline underline-offset-4">
              Official BUD portal →
            </a>
          </p>
        </div>

        {/* Sticky sidebar — key numbers */}
        <aside className="space-y-4 lg:sticky lg:top-16 lg:self-start">
          <div className="rounded-xl border border-border bg-surface p-5">
            <p className="mb-4 font-mono text-[10px] uppercase tracking-widest text-text-tertiary">Key numbers</p>
            <dl className="space-y-4">
              {[
                { label: 'Matching ratio', value: '50%', note: 'Government matches your spend' },
                { label: 'Max grant', value: 'HK$150K', note: 'Per applicant (Easy BUD)' },
                { label: 'Claim deadline', value: '3 months', note: 'After project end date' },
                { label: 'Audit fee cap', value: 'HK$5K', note: 'For projects over HK$50K' },
                { label: 'Payment mode', value: '25%', note: 'Post-completion reimbursement' },
              ].map(({ label, value, note }) => (
                <div key={label}>
                  <dt className="font-mono text-[10px] uppercase tracking-[0.14em] text-text-tertiary">{label}</dt>
                  <dd className="mt-0.5 text-xl font-semibold tracking-tight text-text-primary">{value}</dd>
                  <p className="mt-0.5 text-xs text-text-tertiary">{note}</p>
                </div>
              ))}
            </dl>
          </div>

          <div className="rounded-xl border border-border bg-surface p-5">
            <p className="mb-3 font-mono text-[10px] uppercase tracking-widest text-text-tertiary">Documents needed</p>
            <ul className="space-y-2 text-xs leading-5 text-text-secondary">
              {[
                'Official receipts for every expense',
                'Bank statement / payment proof',
                'Deliverable evidence per activity',
                'Completed reimbursement form',
                'Audited accounts (if required)',
                'Final project report',
              ].map((doc) => (
                <li key={doc} className="flex items-start gap-2">
                  <span className="mt-0.5 text-accent">·</span>
                  {doc}
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </main>
  );
}

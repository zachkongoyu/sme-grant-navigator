import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Terms of Use | Thunder',
};

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <Link href="/" className="font-mono text-xs uppercase tracking-[0.14em] text-text-tertiary transition hover:text-accent">← Home</Link>
      <h1 className="mt-6 text-2xl font-semibold tracking-tight">Terms of Use</h1>
      <p className="mt-2 font-mono text-xs text-text-tertiary">Last updated: May 2025</p>

      <div className="mt-6 space-y-6 text-sm leading-7 text-text-secondary">
        <section>
          <h2 className="text-sm font-medium text-text-primary">Use of the service</h2>
          <p className="mt-2">Thunder provides AI-generated application drafts as a starting point. All drafts must be reviewed and verified by you before submission to any funding body. You are solely responsible for the accuracy of any application you submit.</p>
        </section>
        <section>
          <h2 className="text-sm font-medium text-text-primary">No guarantee</h2>
          <p className="mt-2">Thunder does not guarantee that any draft produced by the service will result in a successful application. Grant approvals are at the sole discretion of the relevant funding bodies.</p>
        </section>
        <section>
          <h2 className="text-sm font-medium text-text-primary">Acceptable use</h2>
          <p className="mt-2">Do not use Thunder to submit false or misleading applications. Do not attempt to reverse-engineer, scrape, or abuse the service.</p>
        </section>
        <section>
          <h2 className="text-sm font-medium text-text-primary">Liability</h2>
          <p className="mt-2">To the extent permitted by law, Thunder is not liable for any losses arising from reliance on AI-generated content. Always consult a qualified professional for legal or financial advice.</p>
        </section>
        <section>
          <h2 className="text-sm font-medium text-text-primary">Contact</h2>
          <p className="mt-2"><a href="mailto:hello@thunderhk.ai" className="text-accent underline underline-offset-4">hello@thunderhk.ai</a></p>
        </section>
      </div>
    </main>
  );
}

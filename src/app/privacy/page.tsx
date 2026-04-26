import type { Metadata } from 'next';

import { BackNavigation } from '@/components/navigation/BackNavigation/index';

export const metadata: Metadata = {
  title: 'Privacy Policy | Thunder',
};

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <BackNavigation fallbackHref="/" />
      <h1 className="mt-6 text-2xl font-semibold tracking-tight">Privacy Policy</h1>
      <p className="mt-2 font-mono text-xs text-text-tertiary">Last updated: May 2025</p>

      <div className="mt-6 space-y-6 text-sm leading-7 text-text-secondary">
        <section>
          <h2 className="text-sm font-medium text-text-primary">What we collect</h2>
          <p className="mt-2">When you use the drafter, the text you enter is sent to our LLM provider (OpenRouter / Anthropic) to generate your draft. We do not store the content of your drafts. We may collect anonymous usage metrics (pages visited, draft generated yes/no) via server-side logs.</p>
        </section>
        <section>
          <h2 className="text-sm font-medium text-text-primary">Account data</h2>
          <p className="mt-2">If you create an account, we store your email address and any bookmarks you save. We use Supabase for authentication and data storage. We do not sell your data.</p>
        </section>
        <section>
          <h2 className="text-sm font-medium text-text-primary">Third-party services</h2>
          <p className="mt-2">We use OpenRouter (LLM routing), Supabase (database + auth), and Stripe (payments). Each has its own privacy policy governing data they process.</p>
        </section>
        <section>
          <h2 className="text-sm font-medium text-text-primary">Contact</h2>
          <p className="mt-2">Questions? <a href="mailto:hello@thunderhk.ai" className="text-accent underline underline-offset-4">hello@thunderhk.ai</a></p>
        </section>
      </div>
    </main>
  );
}

import type { Metadata } from 'next';

import { BackNavigation } from '@/components/navigation';
import { StatusChip } from '@/components/StatusChip';

export const metadata: Metadata = {
  title: 'MCP Server | Thunder',
  description:
    "Connect Claude, Cursor, or any MCP-compatible agent directly to Thunder's workflows and grant data — coming soon.",
};

export default function McpPage() {
  return (
    <main className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
      <div className="absolute top-6 left-6">
        <BackNavigation fallbackHref="/" />
      </div>
      <StatusChip variant="soon" />
      <h1 className="mt-3 text-2xl font-semibold tracking-tight">MCP Server</h1>
      <p className="mt-3 max-w-sm text-sm leading-6 text-text-secondary">
        Connect Claude, Cursor, or any MCP-compatible agent directly to Thunder&apos;s workflows, scheme context, and drafting infrastructure — launching after the first product surface ships.
      </p>
      <a
        href="mailto:hello@thunderhk.ai?subject=MCP+server+waitlist"
        className="mt-6 rounded-lg border border-accent/30 px-5 py-2.5 text-sm text-accent transition hover:bg-accent/8"
      >
        Join the waitlist
      </a>
    </main>
  );
}


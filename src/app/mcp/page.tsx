import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'MCP Server | Thunder',
  description:
    "Connect Claude, Cursor, or any MCP-compatible agent directly to Thunder's grant scheme database — coming soon.",
};

export default function McpPage() {
  return (
    <main className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
      <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-text-tertiary">Coming soon</span>
      <h1 className="mt-3 text-2xl font-semibold tracking-tight">MCP Server</h1>
      <p className="mt-3 max-w-sm text-sm leading-6 text-text-secondary">
        Connect Claude, Cursor, or any MCP-compatible agent directly to Thunder's scheme database and drafter — launching after the Easy BUD drafter ships.
      </p>
      <a
        href="mailto:hello@thunderhk.ai?subject=MCP+server+waitlist"
        className="mt-6 rounded-lg border border-accent/30 px-5 py-2.5 text-sm text-accent transition hover:bg-accent/8"
      >
        Join the waitlist
      </a>
      <Link href="/" className="mt-4 font-mono text-xs uppercase tracking-[0.14em] text-text-tertiary transition hover:text-accent">
        ← Home
      </Link>
    </main>
  );
}


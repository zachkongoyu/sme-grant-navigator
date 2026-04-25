import type { Metadata } from 'next';
import Link from 'next/link';

import { McpConversation } from '@/components/McpConversation';

export const metadata: Metadata = {
  title: 'MCP Server | Thunder',
  description:
    "Connect Claude, Cursor, or any MCP-compatible agent directly to Thunder's grant scheme database.",
};

const TOOLS = [
  {
    name: 'list_schemes',
    description: 'Returns all schemes with name, status, category, and funding cap.',
    input: '{ filter?: { status: "active" | "all" } }',
  },
  {
    name: 'get_scheme',
    description: 'Full detail for one scheme — objectives, eligibility, contacts, guidance.',
    input: '{ id: string }',
  },
  {
    name: 'match_schemes',
    description: 'Ranks schemes by fit for a business profile. Returns top matches with reasoning.',
    input: '{ industry: string, employees: number, ownership: number, projectType?: string }',
  },
  {
    name: 'draft_application',
    description: 'Generates a structured application draft for a scheme given business context.',
    input: '{ schemeId: string, context: string }',
  },
];

const CLIENTS = [
  'Claude Desktop',
  'Cursor',
  'GitHub Copilot',
  'OpenAI Agents SDK',
  'Windsurf',
  'Any MCP host',
];


export default function McpPage() {
  return (
    <main className="min-h-screen bg-background text-text-primary">

      {/* ── Nav ── */}
      <div className="border-b border-border">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-[0.14em] text-text-tertiary transition hover:text-accent"
          >
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-3 w-3" aria-hidden="true">
              <path d="M10 13L5 8l5-5" />
            </svg>
            Home
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/rest-api" className="font-mono text-[10px] uppercase tracking-[0.14em] text-text-tertiary transition hover:text-text-primary">
              REST API →
            </Link>
            <span className="inline-flex items-center rounded-full border border-warning/40 bg-warning/10 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-warning">
              Coming soon
            </span>
          </div>
        </div>
      </div>

      {/* ── Hero ── */}
      <div className="border-b border-border bg-surface">
        <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-text-tertiary">Agent Integration</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">
            Zero glue code.
            <br />
            <span className="text-accent">Your agent calls what it needs.</span>
          </h1>
          <p className="mt-4 max-w-xl text-base leading-7 text-text-secondary">
            Thunder exposes its grant database as MCP tools. Connect once — then Claude, Cursor, or any
            MCP-compatible model can discover schemes, check eligibility, and draft applications on its own.
          </p>

          {/* vs REST callout */}
          <div className="mt-6 inline-flex items-start gap-4 rounded-xl border border-border bg-background px-5 py-4">
            <div className="text-center">
              <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-text-tertiary">REST API</p>
              <p className="mt-1 text-xs text-text-secondary">You write the call</p>
            </div>
            <div className="mt-1 font-mono text-xs text-text-tertiary">→</div>
            <div className="text-center">
              <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-accent">MCP</p>
              <p className="mt-1 text-xs text-text-secondary">The model writes the call</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">

        {/* ── Live conversation demo ── */}
        <section className="mb-14">
          <h2 className="mb-1 font-mono text-[10px] uppercase tracking-[0.24em] text-text-tertiary">What it looks like</h2>
          <p className="mb-5 text-sm text-text-secondary">No integration code. The model reasons about which tool to call.</p>

          <McpConversation />
        </section>

        {/* ── Tools ── */}
        <section className="mb-14">
          <h2 className="mb-1 font-mono text-[10px] uppercase tracking-[0.24em] text-text-tertiary">Available Tools</h2>
          <p className="mb-5 text-sm text-text-secondary">Four tools cover the full grant-navigation workflow.</p>
          <div className="grid gap-3 sm:grid-cols-2">
            {TOOLS.map((tool) => (
              <div key={tool.name} className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-4">
                <code className="font-mono text-sm font-bold text-accent">{tool.name}</code>
                <p className="text-xs leading-5 text-text-secondary">{tool.description}</p>
                <div className="rounded-lg bg-surface-hover px-3 py-2">
                  <code className="font-mono text-[11px] text-text-tertiary">{tool.input}</code>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Connect in 60s ── */}
        <section className="mb-14">
          <h2 className="mb-1 font-mono text-[10px] uppercase tracking-[0.24em] text-text-tertiary">Connect in 60 seconds</h2>
          <p className="mb-5 text-sm text-text-secondary">One config block. Works the same way in Claude Desktop, Cursor, and Windsurf.</p>

          <div className="overflow-hidden rounded-xl border border-border bg-surface">
            <div className="flex items-center gap-2 border-b border-border bg-surface-hover px-4 py-2.5">
              <span className="h-2 w-2 rounded-full bg-danger/60" />
              <span className="h-2 w-2 rounded-full bg-warning/60" />
              <span className="h-2 w-2 rounded-full bg-success/60" />
              <span className="ml-2 font-mono text-[10px] uppercase tracking-[0.14em] text-text-tertiary">claude_desktop_config.json</span>
            </div>
            <pre className="overflow-x-auto p-5 font-mono text-xs leading-6 text-text-primary">{`{
  "mcpServers": {
    "thunder": {
      "url": "https://mcp.thunder.hk",
      "apiKey": "YOUR_THUNDER_KEY"
    }
  }
}`}</pre>
          </div>
        </section>

        {/* ── Compatible clients ── */}
        <section className="mb-14">
          <h2 className="mb-4 font-mono text-[10px] uppercase tracking-[0.24em] text-text-tertiary">Compatible Clients</h2>
          <div className="flex flex-wrap gap-2">
            {CLIENTS.map((c) => (
              <span key={c} className="rounded-full border border-border px-3 py-1.5 font-mono text-xs text-text-secondary">
                {c}
              </span>
            ))}
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="flex flex-col gap-5 overflow-hidden rounded-2xl border border-accent/20 bg-accent/5 px-8 py-8 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-base font-semibold text-text-primary">Join the early access list</p>
            <p className="mt-1 text-sm text-text-secondary">
              Tell us what you're building and we'll send you a key when the server goes live.
            </p>
          </div>
          <a
            href="mailto:mcp@thunder.hk?subject=MCP%20Early%20Access"
            className="shrink-0 inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-background transition hover:opacity-90"
          >
            Request access →
          </a>
        </section>
      </div>
    </main>
  );
}

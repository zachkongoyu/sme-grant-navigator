'use client';

import { useState } from 'react';

type Lang = 'curl' | 'python' | 'node';

interface Endpoint {
  method: 'GET' | 'POST';
  path: string;
  description: string;
  phase: string;
  requests: Record<Lang, string>;
  response: string;
}

const ENDPOINTS: Endpoint[] = [
  {
    method: 'GET',
    path: '/v1/schemes',
    description: 'List all schemes with name, category, status, and funding cap',
    phase: 'v1',
    requests: {
      curl: `curl https://api.thunder.hk/v1/schemes \\
  -H "Authorization: Bearer $THUNDER_KEY"`,
      python: `import httpx

resp = httpx.get(
    "https://api.thunder.hk/v1/schemes",
    headers={"Authorization": f"Bearer {THUNDER_KEY}"},
)
schemes = resp.json()`,
      node: `const res = await fetch("https://api.thunder.hk/v1/schemes", {
  headers: { Authorization: \`Bearer \${process.env.THUNDER_KEY}\` },
});
const schemes = await res.json();`,
    },
    response: `[
  {
    "id": "easy-bud",
    "name": "Easy BUD — General Support Programme",
    "status": "active",
    "fundingCap": 700000,
    "category": "Brand & Upgrade"
  },
  {
    "id": "itf",
    "name": "Innovation and Technology Fund",
    "status": "active",
    "fundingCap": 6000000,
    "category": "R&D"
  }
]`,
  },
  {
    method: 'GET',
    path: '/v1/schemes/:id',
    description: 'Full scheme detail — objectives, eligibility, contacts, guidance',
    phase: 'v1',
    requests: {
      curl: `curl https://api.thunder.hk/v1/schemes/easy-bud \\
  -H "Authorization: Bearer $THUNDER_KEY"`,
      python: `resp = httpx.get(
    "https://api.thunder.hk/v1/schemes/easy-bud",
    headers={"Authorization": f"Bearer {THUNDER_KEY}"},
)
scheme = resp.json()`,
      node: `const res = await fetch("https://api.thunder.hk/v1/schemes/easy-bud", {
  headers: { Authorization: \`Bearer \${process.env.THUNDER_KEY}\` },
});
const scheme = await res.json();`,
    },
    response: `{
  "id": "easy-bud",
  "name": "Easy BUD — General Support Programme",
  "status": "active",
  "fundingCap": 700000,
  "currency": "HKD",
  "category": "Brand & Upgrade",
  "eligibility": {
    "minLocalOwnership": 0.5,
    "maxEmployees": 100
  },
  "contacts": [
    { "email": "bud@hkpc.org", "phone": "+852 2788 5088" }
  ],
  "updatedAt": "2026-04-01T00:00:00Z"
}`,
  },
  {
    method: 'POST',
    path: '/v1/match',
    description: 'Rank schemes by fit for a given business profile',
    phase: 'v2',
    requests: {
      curl: `curl -X POST https://api.thunder.hk/v1/match \\
  -H "Authorization: Bearer $THUNDER_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "industry": "logistics",
    "employees": 12,
    "ownership": 1.0
  }'`,
      python: `resp = httpx.post(
    "https://api.thunder.hk/v1/match",
    headers={"Authorization": f"Bearer {THUNDER_KEY}"},
    json={
        "industry": "logistics",
        "employees": 12,
        "ownership": 1.0,
    },
)
matches = resp.json()`,
      node: `const res = await fetch("https://api.thunder.hk/v1/match", {
  method: "POST",
  headers: {
    Authorization: \`Bearer \${process.env.THUNDER_KEY}\`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ industry: "logistics", employees: 12, ownership: 1.0 }),
});
const matches = await res.json();`,
    },
    response: `{
  "matches": [
    {
      "schemeId": "easy-bud",
      "score": 0.94,
      "reason": "Qualifies on headcount and ownership."
    },
    {
      "schemeId": "itf",
      "score": 0.61,
      "reason": "Eligible, but R&D focus is a weak fit."
    }
  ]
}`,
  },
  {
    method: 'POST',
    path: '/v1/draft',
    description: 'Generate a structured application draft for a scheme',
    phase: 'v2',
    requests: {
      curl: `curl -X POST https://api.thunder.hk/v1/draft \\
  -H "Authorization: Bearer $THUNDER_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "schemeId": "easy-bud",
    "context": "We are a 12-person logistics startup..."
  }'`,
      python: `resp = httpx.post(
    "https://api.thunder.hk/v1/draft",
    headers={"Authorization": f"Bearer {THUNDER_KEY}"},
    json={
        "schemeId": "easy-bud",
        "context": "We are a 12-person logistics startup...",
    },
)
draft = resp.json()`,
      node: `const res = await fetch("https://api.thunder.hk/v1/draft", {
  method: "POST",
  headers: {
    Authorization: \`Bearer \${process.env.THUNDER_KEY}\`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    schemeId: "easy-bud",
    context: "We are a 12-person logistics startup...",
  }),
});
const draft = await res.json();`,
    },
    response: `{
  "schemeId": "easy-bud",
  "sections": {
    "projectTitle": "Route Optimisation & Market Expansion",
    "objectives": [
      "Develop a branded customer portal for SME shippers",
      "Launch targeted marketing campaign across GBA markets"
    ],
    "budget": {
      "total": 700000,
      "breakdown": [
        { "item": "Brand design & UX", "amount": 180000 },
        { "item": "Digital marketing", "amount": 320000 },
        { "item": "Product development", "amount": 200000 }
      ]
    }
  }
}`,
  },
];

const LANGS: { id: Lang; label: string }[] = [
  { id: 'curl', label: 'curl' },
  { id: 'python', label: 'Python' },
  { id: 'node', label: 'Node.js' },
];

// ── Syntax-highlighted JSON renderer ─────────────────────────────────────────
function highlightJson(raw: string): React.ReactNode[] {
  return raw.split('\n').map((line, i) => {
    const parts: React.ReactNode[] = [];
    const tokenRe = /("(?:[^"\\]|\\.)*")(\s*:\s*)("(?:[^"\\]|\\.)*"|[\d.]+|true|false|null)/g;
    let lastIdx = 0;
    let m: RegExpExecArray | null;

    while ((m = tokenRe.exec(line)) !== null) {
      if (m.index > lastIdx) parts.push(<span key={`p${i}-pre${m.index}`}>{line.slice(lastIdx, m.index)}</span>);
      parts.push(<span key={`p${i}-k${m.index}`} style={{ color: 'var(--accent)' }}>{m[1]}</span>);
      parts.push(<span key={`p${i}-c${m.index}`} style={{ color: 'var(--text-tertiary)' }}>{m[2]}</span>);
      const isStr = m[3].startsWith('"');
      parts.push(
        <span key={`p${i}-v${m.index}`} style={{ color: isStr ? 'var(--success)' : 'var(--warning)' }}>
          {m[3]}
        </span>
      );
      lastIdx = m.index + m[0].length;
    }

    if (lastIdx < line.length) {
      const tail = line.slice(lastIdx);
      const standaloneStr = /^(\s*)("(?:[^"\\]|\\.)*")(,?)$/.exec(tail);
      if (standaloneStr) {
        parts.push(<span key={`p${i}-sa`}>{standaloneStr[1]}</span>);
        parts.push(<span key={`p${i}-ss`} style={{ color: 'var(--success)' }}>{standaloneStr[2]}</span>);
        parts.push(<span key={`p${i}-sc`} style={{ color: 'var(--text-tertiary)' }}>{standaloneStr[3]}</span>);
      } else {
        parts.push(<span key={`p${i}-tail`}>{tail}</span>);
      }
    }

    return parts;
  });
}

// ── CodeBlock with line numbers ───────────────────────────────────────────────
function CodeBlock({ code, isJson = false }: { code: string; isJson?: boolean }) {
  const lines = code.split('\n');
  const highlighted = isJson ? highlightJson(code) : null;

  return (
    <div className="flex overflow-x-auto">
      <div
        className="select-none border-r border-border px-3 py-4 text-right font-mono text-[11px] leading-6"
        style={{ color: 'var(--text-tertiary)', opacity: 0.4, minWidth: '2.6rem' }}
        aria-hidden="true"
      >
        {lines.map((_, i) => (
          <div key={i}>{i + 1}</div>
        ))}
      </div>
      <pre className="flex-1 overflow-x-auto px-4 py-4 font-mono text-xs leading-6 text-text-primary">
        {isJson && highlighted
          ? highlighted.map((lineParts, i) => <div key={i}>{lineParts}</div>)
          : lines.map((line, i) => <div key={i}>{line || '\u00a0'}</div>)}
      </pre>
    </div>
  );
}

// ── Method badge ──────────────────────────────────────────────────────────────
function MethodBadge({ method }: { method: 'GET' | 'POST' }) {
  return (
    <span
      className={`inline-flex w-10 shrink-0 items-center justify-center rounded px-1 py-0.5 font-mono text-[9px] font-bold uppercase tracking-[0.08em] ${
        method === 'GET' ? 'bg-success/10 text-success' : 'bg-accent/10 text-accent'
      }`}
    >
      {method}
    </span>
  );
}

// ── Demo panel — always visible, shows selected endpoint ─────────────────────
function DemoPanel({
  ep,
  lang,
  setLang,
}: {
  ep: Endpoint;
  lang: Lang;
  setLang: (l: Lang) => void;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-border">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-border bg-surface px-4 py-3">
        <MethodBadge method={ep.method} />
        <code className="font-mono text-sm text-text-primary">{ep.path}</code>
        <span className="ml-auto hidden text-xs text-text-secondary sm:block">{ep.description}</span>
      </div>

      {/* Request + Response */}
      <div className="grid lg:grid-cols-2">
        {/* Request */}
        <div className="border-b border-border lg:border-b-0 lg:border-r">
          <div className="flex items-center gap-px border-b border-border bg-border">
            {LANGS.map((l) => (
              <button
                key={l.id}
                onClick={() => setLang(l.id)}
                className={`px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.12em] transition ${
                  l.id === lang
                    ? 'bg-surface text-text-primary'
                    : 'bg-surface-hover text-text-tertiary hover:bg-surface'
                }`}
              >
                {l.label}
              </button>
            ))}
            <span className="ml-auto px-3 font-mono text-[9px] uppercase tracking-[0.12em] text-text-tertiary">
              request
            </span>
          </div>
          <CodeBlock code={ep.requests[lang]} />
        </div>

        {/* Response */}
        <div>
          <div className="flex items-center justify-between border-b border-border bg-surface-hover px-4 py-1.5">
            <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-text-tertiary">response</span>
            <span className="font-mono text-[10px] tracking-[0.08em] text-success">200 OK</span>
          </div>
          <CodeBlock code={ep.response} isJson />
        </div>
      </div>
    </div>
  );
}

// ── Endpoint list — sidebar ───────────────────────────────────────────────────
function EndpointList({
  selected,
  onSelect,
}: {
  selected: Endpoint;
  onSelect: (ep: Endpoint) => void;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-border divide-y divide-border">
      {ENDPOINTS.map((ep) => {
        const isActive = ep.path === selected.path;
        return (
          <button
            key={ep.path}
            onClick={() => onSelect(ep)}
            className={`flex w-full items-center gap-2 px-3 py-2.5 text-left transition ${
              isActive ? 'bg-surface' : 'hover:bg-surface'
            }`}
          >
            <MethodBadge method={ep.method} />
            <code
              className={`font-mono text-xs ${isActive ? 'text-accent' : 'text-text-primary'}`}
            >
              {ep.path}
            </code>
            {ep.phase === 'v2' && (
              <span className="ml-auto shrink-0 rounded-full border border-border px-1.5 py-0.5 font-mono text-[8px] uppercase tracking-[0.1em] text-text-tertiary">
                v2
              </span>
            )}
            {isActive && ep.phase !== 'v2' && (
              <svg
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="ml-auto h-3 w-3 shrink-0 text-accent"
              >
                <path d="M6 4l4 4-4 4" />
              </svg>
            )}
          </button>
        );
      })}
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────
export function ApiExplorer() {
  const [lang, setLang] = useState<Lang>('curl');
  const [selected, setSelected] = useState<Endpoint>(ENDPOINTS[0]);

  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:gap-6">
      {/* Left: endpoint list */}
      <div className="lg:w-56 lg:shrink-0">
        <p className="mb-2 font-mono text-[9px] uppercase tracking-[0.24em] text-text-tertiary">
          Endpoints
        </p>
        <EndpointList selected={selected} onSelect={setSelected} />
      </div>

      {/* Right: demo panel */}
      <div className="min-w-0 flex-1">
        <DemoPanel ep={selected} lang={lang} setLang={setLang} />
      </div>
    </div>
  );
}

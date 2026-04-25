'use client';

import { useState } from 'react';

type Lang = 'curl' | 'python' | 'node';

const SAMPLES: Record<Lang, string> = {
  curl: `# 1. Get your key at thunder.hk/settings
export THUNDER_KEY="sk_live_..."

# 2. List all schemes
curl https://api.thunder.hk/v1/schemes \\
  -H "Authorization: Bearer $THUNDER_KEY"

# 3. Get a specific scheme
curl https://api.thunder.hk/v1/schemes/easy-bud \\
  -H "Authorization: Bearer $THUNDER_KEY"`,

  python: `import httpx

THUNDER_KEY = "sk_live_..."
BASE = "https://api.thunder.hk/v1"
headers = {"Authorization": f"Bearer {THUNDER_KEY}"}

# List all schemes
schemes = httpx.get(f"{BASE}/schemes", headers=headers).json()

# Get a specific scheme
scheme = httpx.get(f"{BASE}/schemes/easy-bud", headers=headers).json()
print(scheme["name"])`,

  node: `const KEY = process.env.THUNDER_KEY;
const BASE = "https://api.thunder.hk/v1";
const headers = { Authorization: \`Bearer \${KEY}\` };

// List all schemes
const schemes = await fetch(\`\${BASE}/schemes\`, { headers }).then(r => r.json());

// Get a specific scheme
const scheme = await fetch(\`\${BASE}/schemes/easy-bud\`, { headers }).then(r => r.json());
console.log(scheme.name);`,
};

const LANGS: { id: Lang; label: string }[] = [
  { id: 'curl', label: 'curl' },
  { id: 'python', label: 'Python' },
  { id: 'node', label: 'Node.js' },
];

export function QuickStartBlock() {
  const [lang, setLang] = useState<Lang>('curl');

  return (
    <div className="overflow-hidden rounded-xl border border-border">
      {/* Tab bar */}
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
          quick start
        </span>
      </div>
      {/* Code */}
      <pre className="overflow-x-auto bg-surface px-5 py-4 font-mono text-xs leading-6 text-text-primary">
        {SAMPLES[lang]}
      </pre>
    </div>
  );
}

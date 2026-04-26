# Thunder — AI Grant Navigator

Draft your Easy BUD application this weekend. Hong Kong's HK$150,000 grant for SMEs — free draft, no HK$10,000 consultant.

## What it does

Thunder is an Easy BUD grant application generator. Describe your company and project goals, and Thunder writes the complete application draft — with `[TODO]` markers where your input is required. The draft streams in full, free of charge. The only gate is an email address to download the PDF.

## Schemes

Schemes are stored in Supabase and served at runtime. A static fallback in `src/lib/schemes/index.ts` is used when the database is unreachable. Add new schemes via the Supabase dashboard or migrations.

## Tech stack

- **Frontend**: Next.js + Tailwind CSS (Geist design system)
- **AI**: OpenRouter (streaming)
- **DB**: Supabase (sessions, attachments, RLS)
- **Auth**: Anonymous sessions (v1); email capture at PDF export only
- **Payments**: Deferred — PDF export gated behind email, not payment, for launch

## Getting started

```bash
npm install
cp .env.example .env.local   # fill in SUPABASE_URL, SUPABASE_ANON_KEY, OPENROUTER_API_KEY
npm run dev
```

## Project structure

```
src/
├── app/
│   ├── page.tsx                    # Hero composer (landing)
│   ├── chat/[sessionId]/page.tsx   # Chat + artifact panel
│   ├── funds/page.tsx              # Scheme browser
│   ├── funds/[schemeId]/page.tsx   # Scheme detail
│   └── api/
│       ├── chat/route.ts           # LLM streaming, session history
│       ├── sessions/               # Supabase-backed session CRUD
│       └── uploads/route.ts        # Attachment text extraction
├── components/
│   └── chat/
│       ├── ArtifactPanel.tsx       # Shortlist / draft / checklist renderers
│       ├── ChatLayout.tsx
│       └── Composer.tsx
└── lib/
    ├── llm.ts                      # OpenRouter client
    ├── prompts/system.ts           # Agent system prompt
    └── schemes/                    # Scheme catalog (registry + per-scheme files)
```

## Risks and Mitigations

- **Liability from rejected applications** → Frame output as "draft for human review," add prominent disclaimers, surface the reviewed tier for risk-averse buyers
- **Rule changes** → Maintain a single source-of-truth rules file per scheme. Supabase `updated_at` tracks staleness.

## License

MIT

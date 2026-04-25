# Thunder — AI Grant Navigator

Draft your Easy BUD application this weekend. Hong Kong's HK$100,000 grant for SMEs — free draft, no HK$10,000 consultant.

## What it does

Thunder guides users through three phases:

**Discover → Qualify → Draft**

The agent identifies relevant schemes from the catalog, asks focused qualifying questions, and produces a structured application draft — sections, checklists, and supporting text — ready to review and submit.

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

# Thunder — UI Refactor & User Journey Spec

> Audience: implementer agent.
> Scope: front-end UI, theming, and user journey only. Backend/APIs stay mocked.
> Constraint: do not change anything explicitly listed in **Keep**.

---

## 0. Product Position (one line)

Thunder is the AI-native control surface for fund applications across startups, SMEs, and enterprises. Users talk to it. They drop in messy context. The agent does the rest.

---

## 1. Keep (do not regress)

1. **Font**: Geist family. Geist Sans for UI, Geist Mono for labels/metadata, Geist Pixel for the wordmark only.
2. **Long fund list on the landing page**: dense, scrollable, filterable. Keep the marquee strip and the `SchemeBrowser` table-style listing.

Everything else is on the table.

---

## 2. Kill / Replace

| Remove | Reason |
|---|---|
| Multi-field structured intake form on `/apply` | Users hate ten boxes. Replace with one conversational surface. |
| Hard-coded eligibility scoring (`/match` flags + score) | Eligibility is per-scheme, per-context. Defer to agent. |
| `sessionStorage` / `localStorage`-backed flow state | Will be replaced by server-owned conversation state. For now, in-memory only. |
| Reimbursement explainer modal as a route gate | Surface as inline agent message instead. |
| Custom color tokens that don't match Vercel's geist theme | Replace with Vercel/geist palette (see §4). |
| Mock-feeling buttons like "Generate Draft (API pending)" | Replace with proper disabled/affordance states inside the chat. |

---

## 3. Target User Journey (AI-native)

### 3.1 Surfaces

There are exactly **three** primary surfaces:

1. **`/`** — Landing. **The composer is the hero**: a real, working `<Composer/>` is centered above the fold. Below it: suggestion chips, the marquee, and the dense fund list. There is **no separate "Start with Thunder" CTA** — submitting the composer creates a session and navigates to `/chat/[sessionId]` with the first message already in flight.
2. **`/chat`** — Single conversational workspace. The whole product lives here.
3. **`/funds/[schemeId]`** — Reference page for any one scheme. Linkable from chat citations and from the landing list.

`/apply` and `/match` are removed. Redirect both to `/chat`.

**No QuickStats.** Dashboard-style counters (`N schemes · M categories · ...`) are removed from the landing page. The fund list itself is the evidence.

### 3.2 The chat surface (`/chat`)

This is the product. Layout:

```
┌─────────────────────────────────────────────────────────────┐
│  Top bar: Thunder wordmark · "New session" · theme toggle   │
├──────────────┬──────────────────────────────────────────────┤
│              │                                              │
│  Sessions    │   Conversation thread (messages + artifacts) │
│  (left rail, │                                              │
│   collapsi-  │                                              │
│   ble; hidden│                                              │
│   on mobile) │                                              │
│              │                                              │
│              ├──────────────────────────────────────────────┤
│              │   Composer (multi-modal input, see §3.3)     │
└──────────────┴──────────────────────────────────────────────┘
```

- The **conversation thread** renders three message kinds:
  - `user` — text bubble, attachment chips below if any.
  - `assistant` — markdown, with optional **inline citations** to `/funds/[schemeId]` and **artifact cards** (e.g. "Draft v1 — Easy BUD", "Eligibility note", "Document checklist").
  - `system` — quiet, mono, single line (e.g. "Session created", "3 files attached").
- Artifact cards are clickable and open a right-side **Artifact panel** (slide-over on mobile, split-pane on ≥`lg`). Closing returns to full-width chat.
- **No proactive eligibility scoring.** The agent decides what to ask, what to flag, what to draft.

### 3.3 Composer — the "one box for everything"

A single bottom-anchored composer. One text area. Attachments are first-class.

Affordances inside the composer:

- **Text area** (autoresize, max ~40vh).
- **Attach files** button — accepts PDF, DOCX, XLSX, CSV, PPTX, TXT, MD, images. Multi-file. Drag & drop onto the chat is also valid.
- **Add link** button — opens an inline mini-input that appends a URL chip.
- **Paste handling**:
  - Pasted URL → auto-becomes a link chip.
  - Pasted image → becomes an attachment chip.
  - Pasted long text → stays as text in the box.
- **Submit**: Enter sends. Shift+Enter newline. Cmd/Ctrl+Enter also sends.
- **Stop generation** button replaces the send button while a response streams.

Attachments above the text area render as a horizontal chip row:

```
[ pitch-deck.pdf · 2.3 MB ⨯ ]  [ company-profile.xlsx ⨯ ]  [ https://... ⨯ ]
```

No required fields. No validation gates. The agent asks for what it actually needs.

### 3.4 First-time flow (cold start)

1. User lands on `/`. The first interactive element they see is the composer itself, with placeholder text:
   > "Tell me about your company and what you want to fund. Paste anything — text, PDFs, decks, links."
2. Below the composer: 4 suggestion chips that prefill the box (e.g. `Series A SaaS, 12 staff`, `Hardware R&D`, `E-commerce expansion`, `Upload pitch deck`).
3. User types (or clicks a chip, or drops a file) and hits send.
4. On submit: the client generates a `sessionId`, fires `POST /api/chat` with the first message, and `router.push('/chat/[sessionId]')`. The chat page mounts with the user's message already rendered and the assistant response streaming in. **There is no intermediate empty-state greeting.**
5. Assistant replies with: a short read-back, the **shortlist** of relevant schemes (as artifact cards linking to `/funds/[schemeId]`), and the **next single question** it needs answered.
6. Loop: user answers → agent refines shortlist → agent produces a **Draft artifact** when ready.

#### Landing layout (ASCII reference)

```
┌──────────────────────────────────────────────────────────────────┐
│  THUNDER                                          [theme] [Chat] │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│              Fund applications, done by an agent.                │  text-4xl, tracking -0.02em
│              Drop in your context. Get a draft.                  │  text-secondary
│                                                                  │
│      ┌────────────────────────────────────────────────────┐     │
│      │  Tell me about your company and what you want to   │     │  shared <Composer/>
│      │  fund. Paste anything — text, PDFs, links.         │     │  autoresize, max ~40vh
│      │                                                    │     │
│      │  [📎 Attach]  [🔗 Link]              [→ Send]      │     │
│      └────────────────────────────────────────────────────┘     │
│                                                                  │
│      [ Series A SaaS, 12 staff ]  [ Hardware R&D ]              │  suggestion chips
│      [ E-commerce expansion ]    [ Upload pitch deck ]          │  prefill the composer
│                                                                  │
│                          ─── 47 schemes ───                     │  mono divider
│                                                                  │
│   ┌─ marquee: BUD · TVP · ITF · CreateSmart · HKSTP · ... ─┐   │
│                                                                  │
│   ┌────────────────────────────────────────────────────────┐    │
│   │  Browse all schemes (SchemeBrowser, unchanged dense)   │    │
│   └────────────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────────────┘
```

### 3.5 Returning flow

- Sessions persist in the left rail (mock store for now: in-memory + URL-addressable id `/chat/[sessionId]`).
- Each session shows: title (auto-named from first message), last activity, and a single "delete" affordance on hover.

### 3.6 Fund detail (`/funds/[schemeId]`)

- Stays as a clean reference page.
- Add an **"Use this in chat"** button at the top — opens `/chat` (current or new session) and prepends a system message: `Context: scheme = <name>`.
- Remove any scoring/eligibility widgets here; only show authoritative scheme content.

---

## 4. Visual System — Vercel / Geist theme

Match Vercel's product surfaces (`vercel.com`, Vercel Dashboard, `geist-ui` reference). The look is: high-contrast neutrals, hairline borders, generous whitespace, no decorative gradients, motion is subtle.

### 4.1 Color tokens (CSS variables, both themes)

Define in `globals.css`. Use these names and only these.

**Dark (default)**

| Token | Value |
|---|---|
| `--background` | `#000000` |
| `--background-elevated` | `#0a0a0a` |
| `--surface` | `#111111` |
| `--surface-hover` | `#1a1a1a` |
| `--border` | `#2e2e2e` |
| `--border-strong` | `#454545` |
| `--text-primary` | `#ededed` |
| `--text-secondary` | `#a1a1a1` |
| `--text-tertiary` | `#717171` |
| `--accent` | `#ffffff` (Vercel uses pure white as the "brand" accent on dark) |
| `--accent-foreground` | `#000000` |
| `--success` | `#0070f3` *(Vercel blue, used sparingly)* |
| `--warning` | `#f5a623` |
| `--danger` | `#e5484d` |

**Light**

| Token | Value |
|---|---|
| `--background` | `#ffffff` |
| `--background-elevated` | `#fafafa` |
| `--surface` | `#ffffff` |
| `--surface-hover` | `#f4f4f4` |
| `--border` | `#ebebeb` |
| `--border-strong` | `#d4d4d4` |
| `--text-primary` | `#0a0a0a` |
| `--text-secondary` | `#666666` |
| `--text-tertiary` | `#8f8f8f` |
| `--accent` | `#000000` |
| `--accent-foreground` | `#ffffff` |
| `--success` | `#0070f3` |
| `--warning` | `#f5a623` |
| `--danger` | `#e5484d` |

Update `tailwind.config.ts` `theme.extend.colors` to map these tokens. Remove existing custom palette names not listed here.

### 4.2 Typography

- Sans: `Geist Sans` (already loaded). Weights used: 400, 500, 600.
- Mono: `Geist Mono`. Use for labels, metadata, code, and key counters.
- Display: `Geist Pixel` reserved for the **THUNDER** wordmark only.
- Sizes (rem-based, Vercel-ish):
  - `text-xs` 12 / 16
  - `text-sm` 14 / 20
  - `text-base` 16 / 24
  - `text-lg` 18 / 28
  - `text-xl` 20 / 28
  - `text-2xl` 24 / 32
  - `text-3xl` 30 / 36
  - `text-4xl` 36 / 40
- Tracking: `-0.02em` on display sizes (`text-2xl`+). Default elsewhere.

### 4.3 Geometry

- Radius: `--radius: 8px`. Buttons, inputs, cards all use `rounded-lg`. Chips use `rounded-md`. Avoid `rounded-2xl` and pill shapes except for status dots.
- Borders: 1px hairline using `--border`. Hover state lifts to `--border-strong`. No drop shadows in dark; `shadow-sm` allowed in light only on elevated surfaces.
- Spacing scale: stick to Tailwind defaults. Section vertical rhythm: 64px (`py-16`) on landing, 24px (`py-6`) inside chat.
- Focus ring: 2px outer ring in `--accent` with 2px offset against `--background`.

### 4.4 Components (canonical)

- **Button**
  - `primary`: bg `--accent`, text `--accent-foreground`. Hover: 90% opacity. Disabled: 40% opacity, no hover.
  - `secondary`: transparent bg, 1px `--border`, text `--text-primary`. Hover: bg `--surface-hover`.
  - `ghost`: transparent, no border, text `--text-secondary` → `--text-primary` on hover.
  - Sizes: `sm` (h-8, px-3, text-sm), `md` (h-9, px-4, text-sm), `lg` (h-10, px-5, text-base).
- **Input / Textarea**: bg `--background-elevated`, 1px `--border`, focus border `--accent`, no inner shadow.
- **Card**: bg `--surface`, 1px `--border`, padding `p-6`, no shadow in dark.
- **Chip / Tag**: `rounded-md`, `h-6`, `px-2`, mono `text-xs`, bg `--surface-hover`, border `--border`.
- **Toast** (for non-blocking notices): bottom-right, dark surface, hairline border.

### 4.5 Motion

- Durations: `150ms` for hover/focus, `200ms` for slide-overs, `300ms` for streaming text fade-in.
- Easing: `cubic-bezier(0.16, 1, 0.3, 1)` (Vercel-ish ease-out).
- No bouncing, no spring overshoots, no animated gradients.

### 4.6 Theme toggle

Keep the toggle. Default to **dark**. Persist user preference (localStorage is fine here — it's UI preference, not flow state). Hydrate without flashing: render the toggle button neutrally on the server and resolve theme post-mount.

---

## 5. Information architecture changes

```
/                       → Landing (hero + fund list, single CTA → /chat)
/chat                   → New session
/chat/[sessionId]       → Existing session (mock id for now)
/funds                  → Directory (existing, restyled)
/funds/[schemeId]       → Scheme detail (restyled, "Use this in chat" CTA)
/apply  (REMOVED)       → 308 redirect to /chat
/match  (REMOVED)       → 308 redirect to /chat
```

---

## 6. Mock backend contract (front-end can build against this today)

All routes return JSON. All are **mocked** in `src/app/api/**` with in-memory data. No persistence required.

### 6.1 `POST /api/chat`
Request:
```ts
{
  sessionId: string;        // client-generated uuid; created on first message
  message: {
    text: string;
    links: string[];
    attachmentIds: string[];
  };
}
```
Response: **streaming** (Server-Sent Events or `ReadableStream`) of:
```ts
{ type: 'token', value: string }
{ type: 'artifact', value: { id: string; kind: 'shortlist'|'draft'|'checklist'|'note'; title: string; payload: unknown } }
{ type: 'done' }
```

### 6.2 `POST /api/uploads`
- Accepts `multipart/form-data`.
- Returns `{ attachmentId: string, name: string, size: number, mime: string }[]`.
- Mock: just echo metadata. Do not store the bytes.

### 6.3 `GET /api/sessions` and `GET /api/sessions/[id]`
- Returns session list / full transcript.
- Mock: in-memory `Map`.

The implementer agent must build the UI against this contract so swapping in a real backend later is a no-op for the front end.

---

## 7. Concrete file-level changes

> Implementer: do these in the order listed. Each step should leave the app in a working state.

1. **Theme tokens**
   - Rewrite `src/app/globals.css` color variables per §4.1.
   - Update `tailwind.config.ts` to expose: `background`, `background-elevated`, `surface`, `surface-hover`, `border`, `border-strong`, `text-primary`, `text-secondary`, `text-tertiary`, `accent`, `accent-foreground`, `success`, `warning`, `danger`.
   - Delete unused custom color names.

2. **Primitives**
   - Add `src/components/ui/Button.tsx`, `Input.tsx`, `Textarea.tsx`, `Card.tsx`, `Chip.tsx` per §4.4. No third-party UI kit.

3. **Routing cleanup**
   - Delete `src/app/apply/`.
   - Delete `src/app/match/`.
   - Add redirects in `next.config.js`:
     ```js
     async redirects() {
       return [
         { source: '/apply', destination: '/chat', permanent: true },
         { source: '/match', destination: '/chat', permanent: true },
       ];
     }
     ```

4. **Chat surface**
   - Create `src/app/chat/page.tsx` (new session) and `src/app/chat/[sessionId]/page.tsx`.
   - Create `src/components/chat/`:
     - `ChatLayout.tsx` (left rail + thread + composer + optional artifact panel)
     - `MessageList.tsx`
     - `Message.tsx` (kinds: user / assistant / system)
     - `Composer.tsx` (single text area + attach + link + paste handling per §3.3). **This component is shared between `/` and `/chat`** — it must accept an `onSubmit` prop so the landing page can intercept the first message, mint a `sessionId`, and navigate to `/chat/[sessionId]` while the chat page submits in place.
     - `AttachmentChip.tsx`, `LinkChip.tsx`
     - `ArtifactCard.tsx`, `ArtifactPanel.tsx`
   - State: local React state only for now; one `useChat` hook that talks to `/api/chat` (mocked in §6). The hook accepts an optional `seedMessage` so the chat page can hydrate from a message submitted on `/`.

5. **Mock API**
   - Add `src/app/api/chat/route.ts` returning a streamed canned response that includes one `shortlist` artifact built from the existing scheme registry.
   - Add `src/app/api/uploads/route.ts` returning echoed metadata.
   - Add `src/app/api/sessions/route.ts` and `src/app/api/sessions/[id]/route.ts` backed by an in-memory `Map`.

6. **Landing**
   - Restyle `src/app/page.tsx` to the new tokens. Keep the marquee and the long fund list (`SchemeBrowser`).
   - **Embed the shared `<Composer/>` as the hero.** No "Start with Thunder" button. On submit: generate a `sessionId` (uuid), stash the pending message in a module-level `Map` (or `sessionStorage` keyed by id is acceptable here since it's a one-shot handoff, not flow state), and `router.push(\`/chat/${sessionId}\`)`. The chat page reads the pending message and submits it on mount.
   - Add 4 **suggestion chips** under the composer that, when clicked, prefill the composer's text area (do not auto-submit).
   - **Delete `src/components/QuickStats.tsx`** and remove its import from `src/app/page.tsx`.
   - Remove any pricing/empty sections that are placeholder.

7. **Fund detail**
   - Restyle `src/app/funds/[schemeId]/page.tsx` to the new tokens.
   - Add an **"Use this in chat"** button that links to `/chat?scheme=<schemeId>` (the chat page reads the query param and seeds a `system` message).

8. **Theme toggle**
   - Keep `ThemeToggle.tsx`. Ensure no hydration mismatch: render a neutral button on the server, resolve theme in `useEffect` (or via `useSyncExternalStore`), persist in `localStorage`.

9. **Decommission**
   - Delete `src/lib/eligibility.ts` (already gone — confirm).
   - Delete any imports referencing the removed routes.
   - Remove `BusinessProfile`-shaped UI types from `src/types/index.ts` only if unused after the chat refactor; otherwise leave for the future agent backend.

---

## 8. Acceptance criteria

A reviewer should be able to verify each item by inspection or one click.

1. `/` shows: a one-line headline, an **embedded working composer** as the hero, 4 suggestion chips, the marquee, and the full fund list. There is **no** "Start with Thunder" button and **no** QuickStats counter row.
2. Submitting the composer on `/` navigates to `/chat/[sessionId]` with the user's message already rendered in the thread and the assistant response streaming in — **no intermediate click, no empty greeting state**.
3. `/chat` (no session id) renders the same composer with an empty thread; submitting behaves identically.
4. Sending a message streams back a mocked assistant response **and** at least one shortlist artifact card linking to a real `/funds/[schemeId]` page.
5. The same `<Composer/>` component instance is used on `/` and inside `/chat` (verify by import path).
6. `/apply` and `/match` redirect to `/chat`.
7. There is **no** structured intake form anywhere in the user journey.
8. There is **no** proactive eligibility score, flag list, or checklist rendered before the agent decides to surface one.
9. Dark theme is default. Toggling to light and back does not flash, does not throw a hydration warning, and persists across reloads.
10. All colors used in the app come from the §4.1 token set. No raw hex values in components.
11. Geist Sans is the body font, Geist Mono is used for labels/metadata, Geist Pixel is used **only** for the THUNDER wordmark.
12. `npm run lint` is clean. `npm run build` succeeds. No console errors on `/`, `/chat`, `/funds`, `/funds/[schemeId]`.

---

## 9. Out of scope (do not do now)

- Real authentication.
- Real LLM calls.
- Real file storage.
- Stripe / paywall.
- PDF export of drafts.
- Multi-tenant data model.

These will be wired after the UI and the mock contract are stable.

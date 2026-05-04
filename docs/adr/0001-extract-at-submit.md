# ADR 0001 — Extract attachments at submit time (extract-at-submit)

**Status:** Accepted  
**Date:** 2025-07-11

## Context

The original attachment pipeline used a two-step approach:

1. **Pre-extract** — when the user attached a file, the client immediately POSTed it to `/api/extract`, received back extracted text, and stored that text in component state alongside the attachment chip.
2. **Submit** — when the user submitted the form, the pre-extracted text strings were serialised to JSON and sent to the draft/eligibility API.

This created several problems:

- **Orphaned state** — if the user attached a file and then edited their context or navigated away, the extracted text sat in memory with no associated action, and a failed upload left the chip UI in an inconsistent state.
- **Duplicate round-trips** — every attach triggered a network call even if the user never submitted.
- **Scattered extraction logic** — the eligibility route had its own `request.json()` parsing; the draft route had inline `isPrivateUrl()` and `fetchLinkText()` implementations that duplicated SSRF guards; `/api/extract` was a third divergent path.
- **No URL support in eligibility** — adding URL fetch to eligibility would have required a third implementation of the SSRF guard.

## Decision

Replace the pre-extract pattern with **extract-at-submit**:

- Attachments (files + URLs) are held client-side as lightweight metadata objects (`AttachmentFile` / `LinkAttachment`) with raw `File` references stored in a `useRef` Map.
- At submit time, the client sends a `multipart/form-data` request containing `userContext`, `files[]`, and `urls[]` directly to the relevant API route.
- All extraction (PDF/DOCX/XLSX/text parsing and Jina AI Reader URL fetching) happens server-side in `src/lib/attachments/extract.ts`, which is shared by both the eligibility and draft routes.
- The legacy `/api/extract` endpoint is deleted.

## Consequences

**Good:**
- Single extraction path — SSRF guard and file parser live in one file.
- Simpler client state — no `uploading` flag, no async side-effects on `addFiles`.
- URL fetch added to eligibility for free.
- Warnings about oversized/failed attachments flow back to the client as a `warnings: string[]` field on the result event.
- `canGenerate` for Drafter now allows attaching files without requiring text in the context textarea.

**Trade-off:**
- Extraction happens synchronously during generation; very large files add latency to the generation request rather than being pre-processed. Given the 10 MB file limit and 5-file cap this is acceptable.
- Jina AI Reader is an external dependency for URL content. If it is unavailable, URLs produce a soft warning and the rest of the request proceeds.

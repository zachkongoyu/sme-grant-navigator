import { type NextRequest, NextResponse } from 'next/server';

import type { LlmMessage } from '@/lib/llm';
import { streamChat } from '@/lib/llm';
import { buildSystemPrompt } from '@/lib/prompts/chat';
import { listSchemes } from '@/lib/schemes';
import type { Scheme } from '@/types';
import { getSupabase } from '@/lib/supabase';
import { getAuthUser } from '@/lib/auth';
import type { ShortlistItem } from '@/types';
import {
  createArtifactEvent,
  createDoneEvent,
  createTokenEvent,
  encodeSseEvent,
} from '@/components/chat/stream-events';

const CHAT_ENABLED = process.env.ENABLE_CHAT === 'true';

const MAX_ATTACHMENT_CHARS = 20_000;

function deriveTitle(text: string): string {
  return text.slice(0, 60).trim() + (text.length > 60 ? '\u2026' : '');
}

/**
 * Extract scheme IDs mentioned in the assistant's response.
 * Match either the scheme id or the human-readable scheme name.
 * Falls back to top-3 open schemes if none are found.
 */
function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function extractMentionedSchemeIds(
  assistantText: string,
  schemes: ReadonlyArray<Scheme>,
): string[] {
  const mentioned = schemes
    .filter((scheme) => {
      const idPattern = new RegExp(`\\b${escapeRegExp(scheme.id).replace(/-/g, '[- ]')}\\b`, 'i');
      const namePattern = new RegExp(escapeRegExp(scheme.name), 'i');

      return idPattern.test(assistantText) || namePattern.test(assistantText);
    })
    .map((scheme) => scheme.id);

  if (mentioned.length > 0) return mentioned.slice(0, 3);

  return schemes
    .filter((s) => s.status === 'open')
    .slice(0, 3)
    .map((s) => s.id);
}

function buildShortlistPayload(
  schemeIds: ReadonlyArray<string>,
  schemes: ReadonlyArray<Scheme>,
): ShortlistItem[] {
  return schemeIds
    .map((id) => schemes.find((scheme) => scheme.id === id))
    .filter((s): s is NonNullable<typeof s> => s !== undefined)
    .map((s) => ({
      id: s.id,
      name: s.name,
      shortDescription: s.shortDescription,
      fundingCap: s.fundingCap,
      currency: s.currency,
    }));
}

/**
 * Decide which artifacts to emit based on the message and response content.
 */
function selectArtifacts(
  userText: string,
  assistantText: string,
  userMessageCount: number,
): { shortlist: boolean; draft: boolean; checklist: boolean } {
  const u = userText.toLowerCase();
  const a = assistantText.toLowerCase();

  const wantsDraft =
    /\bdraft\b|write.*application|generate.*application|create.*application/.test(u) ||
    // Response has 4+ sections and a budget table — treat as a draft
    (assistantText.split(/^#{1,3} /m).length >= 4 && a.includes('budget'));

  const wantsChecklist =
    /\bdocument|checklist|what.*need|what do i need|prepare|required doc/.test(u);

  // Emit shortlist on the first 2 exchanges while orientation is happening
  const emitShortlist = userMessageCount <= 2 && !wantsDraft;

  return { shortlist: emitShortlist, draft: wantsDraft, checklist: wantsChecklist };
}

export async function POST(request: NextRequest) {
  if (!CHAT_ENABLED) return NextResponse.json(null, { status: 404 });

  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = (await request.json()) as {
    sessionId: string;
    message: { text: string; links: string[]; attachmentIds: string[] };
  };
  const { sessionId, message } = body;

  if (!sessionId || typeof sessionId !== 'string') {
    return Response.json({ error: 'sessionId is required' }, { status: 400 });
  }

  if (!message || typeof message.text !== 'string' || !Array.isArray(message.attachmentIds)) {
    return Response.json({ error: 'Invalid message payload' }, { status: 400 });
  }

  const supabase = getSupabase();

  const schemes = await listSchemes();

  // Load session message history
  const { data: session } = await supabase
    .from('sessions')
    .select('messages, title, user_id')
    .eq('id', sessionId)
    .single();

  // Reject if this session belongs to a different authenticated user.
  if (session?.user_id != null && session.user_id !== user?.id) {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  }

  type StoredMessage = { role: 'user' | 'assistant'; content: string };
  const history: StoredMessage[] = (session?.messages as StoredMessage[] | null) ?? [];

  // Fetch extracted text from any attachments (scoped to this session to prevent
  // cross-session attachment reads).
  let attachmentContext = '';
  if (message.attachmentIds.length > 0) {
    const { data: attachments } = await supabase
      .from('attachments')
      .select('name, extracted_text')
      .in('id', message.attachmentIds)
      .eq('session_id', sessionId);

    const withText = attachments?.filter((a) => a.extracted_text) ?? [];
    if (withText.length > 0) {
      const rawContext = withText
        .map((a) => `--- ${a.name} ---\n${a.extracted_text}`)
        .join('\n\n');
      // Cap attachment context to prevent context-window exhaustion.
      attachmentContext =
        rawContext.length > MAX_ATTACHMENT_CHARS
          ? rawContext.slice(0, MAX_ATTACHMENT_CHARS) + '\n[Attachment content truncated]'
          : rawContext;
    }
  }

  const userContent = attachmentContext
    ? `${message.text}\n\n<attachments>\n${attachmentContext}\n</attachments>`
    : message.text;

  const llmMessages: LlmMessage[] = [
    { role: 'system', content: buildSystemPrompt(schemes) },
    ...history,
    { role: 'user', content: userContent },
  ];

  const userMessageCount = history.filter((m) => m.role === 'user').length + 1;

  const stream = new ReadableStream({
    async start(controller) {
      let fullText = '';

      try {
        const abortController = new AbortController();
        request.signal.addEventListener('abort', () => abortController.abort());

        // Phase 1 — stream tokens to the client
        for await (const token of streamChat(llmMessages, undefined, abortController.signal)) {
          fullText += token;
          controller.enqueue(encodeSseEvent(createTokenEvent(token)));
        }

        // Phase 2 — emit artifact cards
        const { shortlist, draft, checklist } = selectArtifacts(
          message.text,
          fullText,
          userMessageCount,
        );

        if (shortlist) {
          const schemeIds = extractMentionedSchemeIds(fullText, schemes);
          controller.enqueue(
            encodeSseEvent(createArtifactEvent({
                id: `shortlist-${sessionId}-${Date.now()}`,
                kind: 'shortlist',
                title: 'Matching Schemes',
                payload: buildShortlistPayload(schemeIds, schemes),
              })),
          );
        }

        if (draft) {
          controller.enqueue(
            encodeSseEvent(createArtifactEvent({
                id: `draft-${sessionId}-${Date.now()}`,
                kind: 'draft',
                title: 'Application Draft',
                payload: { text: fullText },
              })),
          );
        }

        if (checklist) {
          controller.enqueue(
            encodeSseEvent(createArtifactEvent({
                id: `checklist-${sessionId}-${Date.now()}`,
                kind: 'checklist',
                title: 'Required Documents',
                payload: {
                  now: [{ id: 'generic', label: 'Confirm required documents with the administering body' }],
                  later: [],
                },
              })),
          );
        }

        // Persist the updated conversation
        const updatedMessages: StoredMessage[] = [
          ...history,
          { role: 'user', content: userContent },
          { role: 'assistant', content: fullText },
        ];

        await supabase.from('sessions').upsert({
          id: sessionId,
          // Preserve existing owner; only set user_id when creating a new session.
          user_id: session?.user_id ?? user?.id ?? null,
          title: !session ? deriveTitle(message.text) : (session.title ?? 'Session'),
          messages: updatedMessages,
          updated_at: new Date().toISOString(),
        });
      } catch (err) {
        console.error('Chat stream error:', err);
      } finally {
        controller.enqueue(encodeSseEvent(createDoneEvent()));
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}


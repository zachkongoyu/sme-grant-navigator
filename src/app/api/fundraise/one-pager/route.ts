import { type NextRequest, NextResponse } from 'next/server';

import { getAuthUser } from '@/lib/auth';
import { validateLlmConfiguration, defaultModel, maxTokens } from '@/lib/llm';
import { chatCompletions } from '@/lib/llm/openrouter';
import { buildOnePagerSystemPrompt, buildOnePagerUserMessage } from '@/lib/prompts/one-pager';
import { createClient } from '@/lib/supabase/server';
import { BILLING } from '@/config/billing';

export async function POST(request: NextRequest) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    validateLlmConfiguration();
  } catch {
    return NextResponse.json({ error: 'LLM not configured' }, { status: 503 });
  }

  const supabase = await createClient();
  const { data: deducted, error: deductError } = await supabase.rpc('deduct_credit', {
    p_user_id: user.id,
    p_amount: BILLING.creditCost.onePager,
  });
  if (deductError) {
    return NextResponse.json({ error: 'Failed to verify credit balance' }, { status: 500 });
  }
  if (!deducted) {
    return NextResponse.json({ error: 'Insufficient credits. Top up to continue.' }, { status: 402 });
  }

  let body: { companyContext: string };
  try {
    body = (await request.json()) as { companyContext: string };
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const { companyContext } = body;
  if (!companyContext?.trim()) {
    return NextResponse.json({ error: 'companyContext is required' }, { status: 400 });
  }

  const response = await chatCompletions({
    model: defaultModel(),
    messages: [
      { role: 'system', content: buildOnePagerSystemPrompt() },
      { role: 'user', content: buildOnePagerUserMessage(companyContext.slice(0, 10_000)) },
    ],
    stream: false,
    max_tokens: maxTokens(),
  });

  const json = await response.json() as { choices: [{ message: { content: string } }] };
  const content = json.choices[0]?.message?.content ?? '';

  return NextResponse.json({ content });
}

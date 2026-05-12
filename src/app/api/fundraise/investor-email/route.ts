import { type NextRequest, NextResponse } from 'next/server';

import { getAuthUser } from '@/lib/auth';
import { validateLlmConfiguration, defaultModel, maxTokens } from '@/lib/llm';
import { chatCompletions } from '@/lib/llm/openrouter';
import { buildInvestorEmailSystemPrompt, buildInvestorEmailUserMessage } from '@/lib/prompts/investor-email';
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
    p_amount: BILLING.creditCost.investorEmail,
  });
  if (deductError) {
    return NextResponse.json({ error: 'Failed to verify credit balance' }, { status: 500 });
  }
  if (!deducted) {
    return NextResponse.json({ error: 'Insufficient credits. Top up to continue.' }, { status: 402 });
  }

  let body: { investorName: string; investorFirm: string; investorThesis: string; companyContext: string };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const { investorName, investorFirm, investorThesis, companyContext } = body;
  if (!investorName?.trim() || !companyContext?.trim()) {
    return NextResponse.json({ error: 'investorName and companyContext are required' }, { status: 400 });
  }

  const response = await chatCompletions({
    model: defaultModel(),
    messages: [
      { role: 'system', content: buildInvestorEmailSystemPrompt() },
      {
        role: 'user',
        content: buildInvestorEmailUserMessage(
          investorName.trim(),
          investorFirm.trim(),
          investorThesis.trim(),
          companyContext.slice(0, 5_000),
        ),
      },
    ],
    stream: false,
    max_tokens: 512,
  });

  const json = await response.json() as { choices: [{ message: { content: string } }] };
  const content = json.choices[0]?.message?.content ?? '';

  return NextResponse.json({ content });
}

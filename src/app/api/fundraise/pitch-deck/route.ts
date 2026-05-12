import { type NextRequest, NextResponse } from 'next/server';

import { getAuthUser } from '@/lib/auth';
import { validateLlmConfiguration, defaultModel, maxTokens } from '@/lib/llm';
import { chatCompletions } from '@/lib/llm/openrouter';
import { hasRawContextInput } from '@/lib/context/input';
import { buildPitchDeckSystemPrompt, buildPitchDeckUserMessage } from '@/lib/prompts/pitch-deck';
import { createClient } from '@/lib/supabase/server';
import { BILLING } from '@/config/billing';

import { buildFundraiseCompanyContext, createFundraiseContextInputError, handleFundraiseExternalError } from '../shared';

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
    p_amount: BILLING.creditCost.pitchDeck,
  });
  if (deductError) {
    return NextResponse.json({ error: 'Failed to verify credit balance' }, { status: 500 });
  }
  if (!deducted) {
    return NextResponse.json({ error: 'Insufficient credits. Top up to continue.' }, { status: 402 });
  }

  const formData = await request.formData();
  const rawContextText = formData.get('contextText');
  const contextText = typeof rawContextText === 'string' ? rawContextText.trim() : '';
  const fileCount = formData.getAll('files').filter((entry) => entry instanceof File).length;
  const urlCount = formData.getAll('urls').filter((entry) => typeof entry === 'string' && entry.trim().length > 0).length;
  if (!hasRawContextInput(formData)) {
    console.warn('[fundraise.pitch-deck] missing raw context input', {
      hasContextText: contextText.length > 0,
      fileCount,
      urlCount,
    });
    return NextResponse.json({ error: 'company context is required' }, { status: 400 });
  }

  const companyContext = await buildFundraiseCompanyContext(formData, {
    maxContextChars: 3_000,
    maxAttachmentChars: 30_000,
  });
  const currentMrr = Number(formData.get('currentMrr')) || 0;
  const monthlyBurn = Number(formData.get('monthlyBurn')) || 0;
  const assumedGrowthPct = Number(formData.get('assumedGrowthPct')) || 0;
  if (!companyContext?.trim()) {
    console.warn('[fundraise.pitch-deck] empty merged companyContext after extraction', {
      contextTextLength: contextText.length,
      fileCount,
      urlCount,
    });
    return createFundraiseContextInputError();
  }

  try {
    const response = await chatCompletions({
      model: defaultModel(),
      messages: [
        { role: 'system', content: buildPitchDeckSystemPrompt() },
        {
          role: 'user',
          content: buildPitchDeckUserMessage(
            companyContext,
            currentMrr,
            monthlyBurn,
            assumedGrowthPct,
          ),
        },
      ],
      stream: false,
      max_tokens: maxTokens(),
    });

    const json = await response.json() as { choices: [{ message: { content: string } }] };
    const content = json.choices[0]?.message?.content ?? '';

    return NextResponse.json({ content });
  } catch (error) {
    return handleFundraiseExternalError('fundraise.pitch-deck', error);
  }
}

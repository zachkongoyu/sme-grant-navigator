import { type NextRequest, NextResponse } from 'next/server';

import { getAuthUser } from '@/lib/auth';
import { validateLlmConfiguration, defaultModel, maxTokens } from '@/lib/llm';
import { chatCompletions } from '@/lib/llm/openrouter';
import { buildInvestorEmailSystemPrompt, buildInvestorEmailUserMessage } from '@/lib/prompts/investor-email';
import { createClient } from '@/lib/supabase/server';
import { BILLING } from '@/config/billing';

import { buildFundraiseCompanyContext, handleFundraiseExternalError } from '../shared';

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

  const formData = await request.formData();
  const investorNameRaw = formData.get('investorName');
  const investorFirmRaw = formData.get('investorFirm');
  const investorThesisRaw = formData.get('investorThesis');
  const investorName = typeof investorNameRaw === 'string' ? investorNameRaw : '';
  const investorFirm = typeof investorFirmRaw === 'string' ? investorFirmRaw : '';
  const investorThesis = typeof investorThesisRaw === 'string' ? investorThesisRaw : '';
  const companyContext = await buildFundraiseCompanyContext(formData, {
    maxContextChars: 5_000,
    maxAttachmentChars: 30_000,
  });
  if (!investorName?.trim() || !companyContext?.trim()) {
    return NextResponse.json({ error: 'investor name and company context are required' }, { status: 400 });
  }

  try {
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
            companyContext,
          ),
        },
      ],
      stream: false,
      max_tokens: 512,
    });

    const json = await response.json() as { choices: [{ message: { content: string } }] };
    const content = json.choices[0]?.message?.content ?? '';

    return NextResponse.json({ content });
  } catch (error) {
    return handleFundraiseExternalError('fundraise.investor-email', error);
  }
}

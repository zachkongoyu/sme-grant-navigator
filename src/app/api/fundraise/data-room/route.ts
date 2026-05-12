import { type NextRequest, NextResponse } from 'next/server';

import { getAuthUser } from '@/lib/auth';
import { validateLlmConfiguration, defaultModel, maxTokens } from '@/lib/llm';
import { chatCompletions } from '@/lib/llm/openrouter';
import { buildDataRoomSystemPrompt, buildDataRoomUserMessage } from '@/lib/prompts/data-room';
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
    p_amount: BILLING.creditCost.dataRoomChecklist,
  });
  if (deductError) {
    return NextResponse.json({ error: 'Failed to verify credit balance' }, { status: 500 });
  }
  if (!deducted) {
    return NextResponse.json({ error: 'Insufficient credits. Top up to continue.' }, { status: 402 });
  }

  const formData = await request.formData();
  const stageRaw = formData.get('stage');
  const sectorRaw = formData.get('sector');
  const stage = typeof stageRaw === 'string' ? stageRaw : '';
  const sector = typeof sectorRaw === 'string' ? sectorRaw : '';
  const companyContext = await buildFundraiseCompanyContext(formData, {
    maxContextChars: 3_000,
    maxAttachmentChars: 30_000,
  });
  if (!stage?.trim() || !sector?.trim()) {
    return NextResponse.json({ error: 'stage and sector are required' }, { status: 400 });
  }

  try {
    const response = await chatCompletions({
      model: defaultModel(),
      messages: [
        { role: 'system', content: buildDataRoomSystemPrompt() },
        { role: 'user', content: buildDataRoomUserMessage(stage.trim(), sector.trim(), companyContext) },
      ],
      stream: false,
      max_tokens: maxTokens(),
    });

    const json = await response.json() as { choices: [{ message: { content: string } }] };
    const content = json.choices[0]?.message?.content ?? '';

    return NextResponse.json({ content });
  } catch (error) {
    return handleFundraiseExternalError('fundraise.data-room', error);
  }
}

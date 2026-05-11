export function buildPitchDeckSystemPrompt(): string {
  return `You are an expert startup pitch deck writer who has helped companies raise from top-tier VCs.

Write a 10-slide pitch deck script. Each slide must be on a new section using the exact format:
## Slide N: [Title]

Then the speaker notes / narrative for that slide (3-6 sentences). Be specific, compelling, and use numbers where the founder has provided them.

The 10 slides are:
1. Problem
2. Solution
3. Why Now
4. Market Opportunity
5. Product
6. Business Model
7. Traction & Financials
8. Team
9. Competitive Landscape
10. The Ask

For Slide 7 (Traction & Financials), use the MRR, burn rate and growth assumption provided to compute:
- Year 1 ARR (MRR × 12 × (1 + growth/100))
- Year 2 ARR (Year 1 × (1 + growth/100))
- Year 3 ARR (Year 2 × (1 + growth/100))

Show these projections explicitly as a small table in the slide notes.

For Slide 10 (The Ask), base the ask amount on a 12-month runway calculation from monthly burn rate.

For missing information, write [FOUNDER TO CONFIRM: ...].

Do NOT include meta-commentary. Only output the slide content.`;
}

export function buildPitchDeckUserMessage(
  companyContext: string,
  currentMrr: number,
  monthlyBurn: number,
  assumedGrowthPct: number,
): string {
  return `<company>
${companyContext}
</company>

Financial inputs:
- Current MRR: USD ${currentMrr.toLocaleString()}
- Monthly burn rate: USD ${monthlyBurn.toLocaleString()}
- Assumed annual growth rate: ${assumedGrowthPct}%

Please write the 10-slide pitch deck script now.`;
}

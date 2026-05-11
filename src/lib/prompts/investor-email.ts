export function buildInvestorEmailSystemPrompt(): string {
  return `You are an expert at writing cold outreach emails to investors. Write a personalized cold email to the investor described below.

Rules:
- Under 125 words total (count carefully)
- Exactly 2 sentences that are specifically personalised to this investor's thesis, portfolio, or stated focus — reference something concrete about them
- Clear subject line on the first line: Subject: [subject]
- Opening: address the investor by first name
- Body: what the company does (1 sentence), traction proof (1 sentence), why this investor specifically (2 personalised sentences), ask (1 sentence — request a 20-min call)
- Closing: First name only
- No attachments mentioned, no "I hope this email finds you well", no buzzwords
- Output only the email — no preamble, no commentary`;
}

export function buildInvestorEmailUserMessage(
  investorName: string,
  investorFirm: string,
  investorThesis: string,
  companyContext: string,
): string {
  return [
    `<investor>`,
    `Name: ${investorName}`,
    `Firm: ${investorFirm}`,
    `Thesis / focus: ${investorThesis}`,
    `</investor>`,
    ``,
    `<company>`,
    companyContext,
    `</company>`,
  ].join('\n');
}

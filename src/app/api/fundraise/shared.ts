import { NextResponse } from 'next/server';

import { extractFiles, extractUrlsFromText, fetchUrls } from '@/lib/attachments/extract';

interface FundraiseContextOptions {
  readonly maxContextChars: number;
  readonly maxAttachmentChars: number;
}

export async function buildFundraiseCompanyContext(
  formData: FormData,
  { maxContextChars, maxAttachmentChars }: FundraiseContextOptions,
): Promise<string> {
  const contextTextRaw = formData.get('contextText') ?? formData.get('companyContextText') ?? formData.get('companyContext');
  const fileEntries = formData.getAll('files');
  const urlEntries = formData.getAll('urls');

  const contextText = typeof contextTextRaw === 'string' ? contextTextRaw : '';
  const safeContext = contextText.slice(0, maxContextChars);
  const files = fileEntries.filter((entry): entry is File => entry instanceof File);
  const urls = urlEntries.filter((entry): entry is string => typeof entry === 'string');
  const inlineUrls = extractUrlsFromText(safeContext);
  const allUrls = [...new Set([...inlineUrls, ...urls])];

  const { results: extractedFiles } = await extractFiles(files);
  const { results: fetchedUrls } = await fetchUrls(allUrls);

  const contextParts: string[] = [];
  for (const extractedFile of extractedFiles) {
    if (extractedFile.text) {
      contextParts.push(`--- ${extractedFile.name} ---\n${extractedFile.text}`);
    }
  }
  for (const fetchedUrl of fetchedUrls) {
    if (fetchedUrl.text) {
      contextParts.push(`--- Link: ${fetchedUrl.url} ---\n${fetchedUrl.text}`);
    }
  }

  let attachmentRaw = contextParts.join('\n\n');
  if (attachmentRaw.length > maxAttachmentChars) {
    attachmentRaw = attachmentRaw.slice(0, maxAttachmentChars) + '\n[Attachment content truncated]';
  }

  return attachmentRaw
    ? `${safeContext}\n\n<attachments>\n${attachmentRaw}\n</attachments>`
    : safeContext;
}

export function handleFundraiseExternalError(feature: string, error: unknown) {
  if (error instanceof Error) {
    console.error(`[${feature}] ${error.message}`);
  } else {
    console.error(`[${feature}]`, error);
  }

  return NextResponse.json({ error: 'Generation failed. Please try again.' }, { status: 500 });
}
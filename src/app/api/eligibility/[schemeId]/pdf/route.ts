import { type NextRequest, NextResponse } from 'next/server';
import { renderToBuffer } from '@react-pdf/renderer';

import { getScheme } from '@/lib/schemes';
import type { EligibilityCheckResult } from '@/lib/api/eligibility-client';
import { createEligibilityPdf } from './EligibilityPdf';

interface PdfRequestBody {
  result: EligibilityCheckResult;
  userContext: string;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ schemeId: string }> },
) {
  const { schemeId } = await params;

  let body: PdfRequestBody;
  try {
    body = (await request.json()) as PdfRequestBody;
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const { result, userContext } = body;

  if (!result) {
    return NextResponse.json({ error: 'result is required' }, { status: 400 });
  }

  if (!userContext || userContext.trim().length === 0) {
    return NextResponse.json({ error: 'userContext is required' }, { status: 400 });
  }

  const scheme = await getScheme(schemeId);
  if (!scheme) {
    return NextResponse.json({ error: 'Scheme not found' }, { status: 404 });
  }

  const generatedAt = new Date().toLocaleDateString('en-HK', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const buffer = await renderToBuffer(
    createEligibilityPdf({
      schemeName: scheme.name,
      schemeId,
      userContext,
      result,
      generatedAt,
    }),
  );
  const pdfBytes = new Uint8Array(buffer);

  return new NextResponse(pdfBytes, {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${schemeId}-eligibility.pdf"`,
      'Content-Length': String(pdfBytes.byteLength),
    },
  });
}

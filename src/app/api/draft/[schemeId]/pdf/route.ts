import { type NextRequest, NextResponse } from 'next/server';
import { renderToBuffer } from '@react-pdf/renderer';

import { getScheme } from '@/lib/schemes';
import { createDraftPdf } from './DraftPdf';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface PdfRequestBody {
  draftMarkdown: string;
  email: string;
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

  const { draftMarkdown, email } = body;

  if (!email || !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: 'Valid email address required' }, { status: 400 });
  }

  if (!draftMarkdown || draftMarkdown.trim().length === 0) {
    return NextResponse.json({ error: 'draftMarkdown is required' }, { status: 400 });
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
    createDraftPdf({ schemeName: scheme.name, draftMarkdown, generatedAt }),
  );
  const pdfBytes = new Uint8Array(buffer);

  return new NextResponse(pdfBytes, {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${schemeId}-draft.pdf"`,
      'Content-Length': String(pdfBytes.byteLength),
    },
  });
}

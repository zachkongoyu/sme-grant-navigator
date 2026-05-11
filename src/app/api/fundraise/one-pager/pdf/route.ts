import { type NextRequest, NextResponse } from 'next/server';
import { renderToBuffer } from '@react-pdf/renderer';

import { createOnePagerPdf } from './OnePagerPdf';

interface PdfRequestBody {
  content: string;
}

export async function POST(request: NextRequest) {
  let body: PdfRequestBody;
  try {
    body = (await request.json()) as PdfRequestBody;
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const { content } = body;
  if (!content?.trim()) {
    return NextResponse.json({ error: 'content is required' }, { status: 400 });
  }

  const generatedAt = new Date().toLocaleDateString('en-HK', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const buffer = await renderToBuffer(createOnePagerPdf({ content, generatedAt }));
  const pdfBytes = new Uint8Array(buffer);

  return new NextResponse(pdfBytes, {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="thunder-one-pager.pdf"',
    },
  });
}

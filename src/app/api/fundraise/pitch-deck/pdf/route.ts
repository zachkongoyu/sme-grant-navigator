import { type NextRequest, NextResponse } from 'next/server';
import { renderToBuffer } from '@react-pdf/renderer';

import { createPitchDeckPdf } from './PitchDeckPdf';

export async function POST(request: NextRequest) {
  let body: { content: string };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  if (!body.content?.trim()) {
    return NextResponse.json({ error: 'content is required' }, { status: 400 });
  }

  const generatedAt = new Date().toLocaleDateString('en-HK', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const buffer = await renderToBuffer(
    createPitchDeckPdf({ content: body.content, generatedAt }),
  );
  const pdfBytes = new Uint8Array(buffer);

  return new NextResponse(pdfBytes, {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="thunder-pitch-deck-script.pdf"',
    },
  });
}

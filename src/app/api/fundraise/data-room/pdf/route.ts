import { type NextRequest, NextResponse } from 'next/server';
import { renderToBuffer } from '@react-pdf/renderer';

import { createDataRoomPdf } from './DataRoomPdf';

interface PdfRequestBody {
  content: string;
  stage: string;
  sector: string;
}

export async function POST(request: NextRequest) {
  let body: PdfRequestBody;
  try {
    body = (await request.json()) as PdfRequestBody;
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const { content, stage, sector } = body;
  if (!content?.trim()) {
    return NextResponse.json({ error: 'content is required' }, { status: 400 });
  }

  const generatedAt = new Date().toLocaleDateString('en-HK', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const buffer = await renderToBuffer(
    createDataRoomPdf({
      content,
      stage: stage ?? '',
      sector: sector ?? '',
      generatedAt,
    }),
  );
  const pdfBytes = new Uint8Array(buffer);

  return new NextResponse(pdfBytes, {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="thunder-data-room-checklist.pdf"',
    },
  });
}

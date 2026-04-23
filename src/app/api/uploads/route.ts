import { type NextRequest } from 'next/server';

import { getSupabase } from '@/lib/supabase';

/**
 * Attempt to require an optional package without failing the build if it's absent.
 * Install the packages for full extraction support:
 *   npm install pdf-parse mammoth
 *   npm install --save-dev @types/pdf-parse @types/mammoth
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function tryRequire(id: string): any {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require(id);
  } catch {
    return null;
  }
}

async function extractText(buffer: Buffer, mime: string, name: string): Promise<string> {
  try {
    if (mime === 'application/pdf' || name.endsWith('.pdf')) {
      const pdfParse = tryRequire('pdf-parse');
      if (pdfParse) {
        const result = await (pdfParse.default ?? pdfParse)(buffer);
        return result.text as string;
      }
    }

    if (
      mime === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      name.endsWith('.docx')
    ) {
      const mammoth = tryRequire('mammoth');
      if (mammoth) {
        const result = await mammoth.extractRawText({ buffer });
        return result.value as string;
      }
    }

    if (
      mime.startsWith('text/') ||
      mime === 'application/json' ||
      name.endsWith('.csv') ||
      name.endsWith('.tsv') ||
      name.endsWith('.md')
    ) {
      return buffer.toString('utf-8');
    }

    return '';
  } catch (err) {
    console.warn(`Text extraction failed for ${name} (${mime}):`, err);
    return '';
  }
}

export async function POST(request: NextRequest) {
  const supabase = getSupabase();
  const formData = await request.formData();
  const sessionId = formData.get('sessionId');
  const files = formData.getAll('files');

  if (!sessionId || typeof sessionId !== 'string') {
    return Response.json({ error: 'sessionId is required' }, { status: 400 });
  }

  const results: { attachmentId: string; name: string; size: number; mime: string }[] = [];

  for (const file of files) {
    if (!(file instanceof File)) continue;

    const attachmentId = crypto.randomUUID();
    const storagePath = `${sessionId}/${attachmentId}/${file.name}`;
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // TODO: Upload raw bytes to Supabase Storage (disabled for MVP — storage_path is null).
    // const { error: uploadError } = await supabase.storage
    //   .from('attachments')
    //   .upload(storagePath, buffer, { contentType: file.type, upsert: false });
    // if (uploadError) {
    //   console.error('Storage upload error:', uploadError);
    //   return Response.json({ error: `Failed to upload ${file.name}` }, { status: 500 });
    // }

    const extractedText = await extractText(buffer, file.type, file.name);

    const { error: dbError } = await supabase.from('attachments').insert({
      id: attachmentId,
      session_id: sessionId,
      name: file.name,
      mime: file.type,
      size: file.size,
      storage_path: null,
      extracted_text: extractedText || null,
    });

    if (dbError) {
      console.error('Attachment DB insert error:', dbError);
      return Response.json({ error: `Failed to save ${file.name} metadata` }, { status: 500 });
    }

    results.push({ attachmentId, name: file.name, size: file.size, mime: file.type });
  }

  return Response.json(results);
}



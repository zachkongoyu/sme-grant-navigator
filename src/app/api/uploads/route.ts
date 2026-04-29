import { type NextRequest } from 'next/server';

import { getSupabase } from '@/lib/supabase';
import { getAuthUser } from '@/lib/auth';

// Route segment config.
// maxDuration: max execution time in seconds (for slow PDF extraction).
// dynamic: opt out of static caching so auth/session checks always run.
export const maxDuration = 30;
export const dynamic = 'force-dynamic';
// Note: Next.js Route Handler body size is controlled by the platform/infra
// layer. Per-file size enforcement is done in the POST handler below.

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

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB
const MAX_FILES_PER_REQUEST = 5;

export async function POST(request: NextRequest) {
  const supabase = getSupabase();
  const user = await getAuthUser();

  const formData = await request.formData();
  const sessionId = formData.get('sessionId');
  const files = formData.getAll('files');

  if (!sessionId || typeof sessionId !== 'string') {
    return Response.json({ error: 'sessionId is required' }, { status: 400 });
  }

  // Verify the session exists and belongs to the caller.
  const { data: session } = await supabase
    .from('sessions')
    .select('user_id')
    .eq('id', sessionId)
    .single();

  if (!session) {
    return Response.json({ error: 'Session not found' }, { status: 404 });
  }

  if (session.user_id != null && session.user_id !== user?.id) {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  }

  if (files.length > MAX_FILES_PER_REQUEST) {
    return Response.json(
      { error: `Maximum ${MAX_FILES_PER_REQUEST} files per request` },
      { status: 400 },
    );
  }

  const results: { attachmentId: string; name: string; size: number; mime: string }[] = [];

  for (const file of files) {
    if (!(file instanceof File)) continue;

    // Fast pre-reject on the client-reported size to avoid buffering obviously
    // oversized files. Confirmed below against the actual buffered byteLength.
    if (file.size > MAX_FILE_SIZE_BYTES) {
      return Response.json(
        { error: `${file.name} exceeds the 10 MB file size limit` },
        { status: 400 },
      );
    }

    const attachmentId = crypto.randomUUID();
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Verify the actual buffered size — file.size is client-reported and untrustworthy.
    if (buffer.byteLength > MAX_FILE_SIZE_BYTES) {
      return Response.json(
        { error: `${file.name} exceeds the 10 MB file size limit` },
        { status: 400 },
      );
    }

    const extractedText = await extractText(buffer, file.type, file.name);

    const { error: dbError } = await supabase.from('attachments').insert({
      id: attachmentId,
      session_id: sessionId,
      name: file.name,
      mime: file.type,
      size: buffer.byteLength,
      storage_path: null,
      extracted_text: extractedText || null,
    });

    if (dbError) {
      console.error('Attachment DB insert error:', dbError);
      return Response.json({ error: `Failed to save ${file.name} metadata` }, { status: 500 });
    }

    results.push({ attachmentId, name: file.name, size: buffer.byteLength, mime: file.type });
  }

  return Response.json(results);
}



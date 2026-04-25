import { type NextRequest } from 'next/server';

export const maxDuration = 30;
export const dynamic = 'force-dynamic';

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
const MAX_FILES_PER_REQUEST = 5;

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

export interface ExtractedFile {
  id: string;
  name: string;
  size: number;
  mime: string;
  text: string;
}

export async function POST(request: NextRequest): Promise<Response> {
  const formData = await request.formData();
  const files = formData.getAll('files');

  if (!Array.isArray(files) || files.length === 0) {
    return Response.json({ error: 'No files provided' }, { status: 400 });
  }

  if (files.length > MAX_FILES_PER_REQUEST) {
    return Response.json(
      { error: `Max ${MAX_FILES_PER_REQUEST} files per request` },
      { status: 400 },
    );
  }

  const results: ExtractedFile[] = [];

  for (const entry of files) {
    if (!(entry instanceof File)) {
      return Response.json({ error: 'Invalid file entry' }, { status: 400 });
    }

    if (entry.size > MAX_FILE_SIZE_BYTES) {
      return Response.json(
        { error: `File "${entry.name}" exceeds the 5 MB limit` },
        { status: 400 },
      );
    }

    const buffer = Buffer.from(await entry.arrayBuffer());
    const text = await extractText(buffer, entry.type, entry.name);
    results.push({ id: crypto.randomUUID(), name: entry.name, size: entry.size, mime: entry.type, text });
  }

  return Response.json(results);
}

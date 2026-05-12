/**
 * Shared server-side attachment extraction utility.
 * Called at submit time by the eligibility and draft API routes.
 */

import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

/* eslint-disable @typescript-eslint/no-require-imports */

/**
 * Scan free-form text for https?:// URLs and return a deduped list.
 * Used by API routes to transparently enrich inline-URL references without
 * requiring the user to explicitly attach them.
 */
export function extractUrlsFromText(text: string): string[] {
  const seen = new Set<string>();
  const results: string[] = [];
  const re = /https?:\/\/[^\s<>"'\)\]\}]+/gi;
  let match: RegExpExecArray | null;
  while ((match = re.exec(text)) !== null) {
    // Strip trailing punctuation that is unlikely to be part of the URL
    const url = match[0].replace(/[.,;:!?]+$/, '');
    if (!seen.has(url)) {
      seen.add(url);
      results.push(url);
    }
  }
  return results;
}

export const MAX_FILE_SIZE   = 10 * 1024 * 1024;  // 10 MB
export const MAX_FILE_COUNT  = 5;
export const MAX_URL_COUNT   = 3;
export const MAX_FILE_CHARS  = 100_000;
export const MAX_URL_CHARS   = 30_000;
const LINK_FETCH_TIMEOUT_MS  = 5_000;
const PDF_WORKER_SRC = pathToFileURL(
  join(process.cwd(), 'node_modules', 'pdfjs-dist', 'legacy', 'build', 'pdf.worker.mjs'),
).href;

export interface ExtractedFile {
  id: string;
  name: string;
  size: number;
  mime: string;
  text: string;
}

export interface FetchedUrl {
  url: string;
  text: string;
}

export interface ExtractionWarning {
  source: string;
  message: string;
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/** Soft-require an optional module; returns null if unavailable. */
function tryRequire(id: string): unknown {
  try {
    return require(id) as unknown;
  } catch {
    return null;
  }
}

async function extractTextFromBuffer(
  buffer: Buffer,
  mime: string,
  name: string,
): Promise<string> {
  const lowerName = name.toLowerCase();

  // PDF
  if (mime === 'application/pdf' || lowerName.endsWith('.pdf')) {
    const { PDFParse } = await import('pdf-parse');
    PDFParse.setWorker(PDF_WORKER_SRC);
    const parser = new PDFParse({ data: buffer });

    try {
      const result = await parser.getText();
      console.warn('[pdf-parse] text length', {
        name,
        textLength: result.text?.length ?? 0,
      });
      return result.text ?? '';
    } catch (error) {
      console.error('[pdf-parse] getText failed', {
        name,
        mime,
        error: error instanceof Error ? error.stack ?? error.message : error,
      });
      throw error;
    } finally {
      await parser.destroy().catch(() => undefined);
    }
  }

  // DOCX
  if (
    mime === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    lowerName.endsWith('.docx')
  ) {
    const mammoth = tryRequire('mammoth') as {
      extractRawText: (opts: { buffer: Buffer }) => Promise<{ value: string }>;
    } | null;
    if (!mammoth) return '';
    const result = await mammoth.extractRawText({ buffer });
    return result.value ?? '';
  }

  // XLSX / XLS
  if (
    mime === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
    mime === 'application/vnd.ms-excel' ||
    lowerName.endsWith('.xlsx') ||
    lowerName.endsWith('.xls')
  ) {
    const XLSX = tryRequire('xlsx') as typeof import('xlsx') | null;
    if (!XLSX) return '';
    const wb = XLSX.read(buffer, { type: 'buffer' });
    return wb.SheetNames.map((sheetName) => {
      const ws = wb.Sheets[sheetName];
      if (!ws) return '';
      const csv = XLSX.utils.sheet_to_csv(ws);
      return `Sheet: ${sheetName}\n${csv}`;
    }).join('\n\n');
  }

  // CSV / TSV / plain text / markdown
  if (
    mime.startsWith('text/') ||
    lowerName.endsWith('.csv') ||
    lowerName.endsWith('.tsv') ||
    lowerName.endsWith('.md') ||
    lowerName.endsWith('.txt')
  ) {
    return new TextDecoder('utf-8', { fatal: false }).decode(buffer);
  }

  return '';
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Guard against SSRF: rejects localhost, loopback, link-local, and RFC-1918 addresses.
 * Returns true if the URL should be blocked.
 */
export function isPrivateUrl(urlStr: string): boolean {
  try {
    const url = new URL(urlStr);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return true;
    const host = url.hostname.toLowerCase();
    if (host === 'localhost' || host === '::1' || host === '[::1]') return true;
    const parts = host.match(/^(\d+)\.(\d+)\.(\d+)\.(\d+)$/);
    if (parts) {
      const [a, b] = [Number(parts[1]), Number(parts[2])];
      if (a === 10) return true;
      if (a === 127) return true;
      if (a === 169 && b === 254) return true;
      if (a === 172 && b >= 16 && b <= 31) return true;
      if (a === 192 && b === 168) return true;
      if (a === 0) return true;
    }
    return false;
  } catch {
    return true;
  }
}

/**
 * Extract text from uploaded File objects.
 * Supports PDF, DOCX, XLSX/XLS, CSV, TSV, plain text, and Markdown.
 */
export async function extractFiles(
  files: File[],
): Promise<{ results: ExtractedFile[]; warnings: ExtractionWarning[] }> {
  const results: ExtractedFile[] = [];
  const warnings: ExtractionWarning[] = [];

  const limited = files.slice(0, MAX_FILE_COUNT);

  for (const file of limited) {
    if (file.size > MAX_FILE_SIZE) {
      warnings.push({
        source: file.name,
        message: `File too large (max ${MAX_FILE_SIZE / 1024 / 1024} MB)`,
      });
      continue;
    }

    try {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      let text = await extractTextFromBuffer(buffer, file.type, file.name);

      if (text.length > MAX_FILE_CHARS) {
        text = text.slice(0, MAX_FILE_CHARS);
        warnings.push({ source: file.name, message: 'Content truncated to fit context limit' });
      }

      results.push({
        id: crypto.randomUUID(),
        name: file.name,
        size: file.size,
        mime: file.type,
        text,
      });
    } catch (err) {
      warnings.push({
        source: file.name,
        message: `Could not extract text: ${(err as Error).message}`,
      });
    }
  }

  if (files.length > MAX_FILE_COUNT) {
    warnings.push({
      source: 'upload',
      message: `Only the first ${MAX_FILE_COUNT} files were processed`,
    });
  }

  return { results, warnings };
}

/**
 * Fetch URL content via Jina AI Reader (https://r.jina.ai/).
 * SSRF-guarded; returns plain text with a hard size limit.
 */
export async function fetchUrls(
  urls: string[],
): Promise<{ results: FetchedUrl[]; warnings: ExtractionWarning[] }> {
  const results: FetchedUrl[] = [];
  const warnings: ExtractionWarning[] = [];

  const limited = urls.slice(0, MAX_URL_COUNT);

  for (const rawUrl of limited) {
    if (isPrivateUrl(rawUrl)) {
      warnings.push({ source: rawUrl, message: 'URL not allowed (private or invalid)' });
      continue;
    }

    const jinaUrl = `https://r.jina.ai/${rawUrl}`;
    const ctrl = new AbortController();
    const timeout = setTimeout(() => ctrl.abort(), LINK_FETCH_TIMEOUT_MS);

    try {
      const res = await fetch(jinaUrl, {
        signal: ctrl.signal,
        headers: {
          Accept: 'text/plain',
          'X-Return-Format': 'text',
        },
      });

      if (!res.ok) {
        warnings.push({ source: rawUrl, message: `Could not fetch URL (HTTP ${res.status})` });
        continue;
      }

      let text = await res.text();

      if (text.length > MAX_URL_CHARS) {
        text = text.slice(0, MAX_URL_CHARS);
        warnings.push({ source: rawUrl, message: 'URL content truncated to fit context limit' });
      }

      results.push({ url: rawUrl, text });
    } catch (err) {
      if ((err as Error)?.name === 'AbortError') {
        warnings.push({ source: rawUrl, message: 'URL fetch timed out' });
      } else {
        warnings.push({
          source: rawUrl,
          message: `Could not fetch URL: ${(err as Error).message}`,
        });
      }
    } finally {
      clearTimeout(timeout);
    }
  }

  if (urls.length > MAX_URL_COUNT) {
    warnings.push({
      source: 'urls',
      message: `Only the first ${MAX_URL_COUNT} URLs were processed`,
    });
  }

  return { results, warnings };
}

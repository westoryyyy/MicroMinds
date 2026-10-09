/**
 * MicroMinds Dummy Provider Server
 * Port: 3002
 *
 * Exposes 4 provider endpoints for local E2E testing:
 *
 *   POST /provider/json-formatter   — formats JSON with sorting + indentation
 *   POST /provider/text-extractor   — extracts words, sentences, char count from text
 *   POST /provider/url-metadata     — fetches og:title, og:description from a URL
 *   POST /provider/flaky            — intentionally fails (500 or wrong schema)
 *
 * All endpoints validate their input and return the exact schema
 * registered in the listings seed.
 */
import express, { Request, Response, NextFunction } from 'express';

const app = express();
app.use(express.json());

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3002;

// ── Logging middleware ────────────────────────────────────────────────────────
app.use((req: Request, _res: Response, next: NextFunction) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// ── 1. JSON Formatter ─────────────────────────────────────────────────────────
/**
 * Input:  { data: object, indent?: number, sortKeys?: boolean }
 * Output: { formatted: string, keyCount: number, byteSize: number }
 */
app.post('/provider/json-formatter', (req: Request, res: Response) => {
  const { data, indent = 2, sortKeys = false } = req.body as {
    data?: unknown;
    indent?: number;
    sortKeys?: boolean;
  };

  if (data === undefined || data === null) {
    return res.status(400).json({ error: 'Missing required field: data' });
  }

  try {
    const processed = sortKeys ? sortObjectKeys(data) : data;
    const formatted = JSON.stringify(processed, null, Math.min(indent, 8));
    const keyCount = countKeys(data);
    const byteSize = Buffer.byteLength(formatted, 'utf8');

    return res.status(200).json({
      formatted,
      keyCount,
      byteSize,
    });
  } catch (err) {
    return res.status(500).json({ error: String(err) });
  }
});

function sortObjectKeys(obj: unknown): unknown {
  if (Array.isArray(obj)) return obj.map(sortObjectKeys);
  if (obj !== null && typeof obj === 'object') {
    return Object.keys(obj as Record<string, unknown>)
      .sort()
      .reduce((acc: Record<string, unknown>, key) => {
        acc[key] = sortObjectKeys((obj as Record<string, unknown>)[key]);
        return acc;
      }, {});
  }
  return obj;
}

function countKeys(obj: unknown): number {
  if (Array.isArray(obj)) return obj.reduce((sum, v) => sum + countKeys(v), 0);
  if (obj !== null && typeof obj === 'object') {
    const keys = Object.keys(obj as Record<string, unknown>);
    return keys.length + keys.reduce((sum, k) => sum + countKeys((obj as Record<string, unknown>)[k]), 0);
  }
  return 0;
}

// ── 2. Text Extractor ─────────────────────────────────────────────────────────
/**
 * Input:  { text: string, extractEmails?: boolean }
 * Output: {
 *   wordCount: number, sentenceCount: number, charCount: number,
 *   uniqueWords: number, emails: string[]
 * }
 */
app.post('/provider/text-extractor', (req: Request, res: Response) => {
  const { text, extractEmails = false } = req.body as {
    text?: string;
    extractEmails?: boolean;
  };

  if (typeof text !== 'string' || text.trim().length === 0) {
    return res.status(400).json({ error: 'Missing or empty required field: text' });
  }

  const words = text.trim().split(/\s+/).filter(Boolean);
  const sentences = text.split(/[.!?]+/).map((s) => s.trim()).filter(Boolean);
  const charCount = text.length;
  const uniqueWords = new Set(words.map((w) => w.toLowerCase().replace(/[^a-z0-9]/g, ''))).size;
  const emails = extractEmails
    ? [...text.matchAll(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g)].map((m) => m[0])
    : [];

  return res.status(200).json({
    wordCount: words.length,
    sentenceCount: sentences.length,
    charCount,
    uniqueWords,
    emails,
  });
});

// ── 3. URL Metadata Fetcher ───────────────────────────────────────────────────
/**
 * Input:  { url: string }
 * Output: { url: string, title: string, description: string, statusCode: number }
 *
 * Fetches the page and extracts <title> and og:description.
 * Falls back gracefully if the page is unreachable.
 */
app.post('/provider/url-metadata', async (req: Request, res: Response) => {
  const { url } = req.body as { url?: string };

  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'Missing required field: url' });
  }

  // Basic URL validation
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(url);
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      return res.status(400).json({ error: 'Only http/https URLs are supported' });
    }
  } catch {
    return res.status(400).json({ error: `Invalid URL: ${url}` });
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(parsedUrl.toString(), {
      signal: controller.signal,
      headers: { 'User-Agent': 'MicroMinds-URLBot/1.0' },
    });
    clearTimeout(timeout);

    const html = await response.text();
    const title = extractTag(html, '<title>', '</title>') ?? parsedUrl.hostname;
    const description =
      extractMeta(html, 'og:description') ??
      extractMeta(html, 'description') ??
      `Page at ${parsedUrl.hostname}`;

    return res.status(200).json({
      url: parsedUrl.toString(),
      title: title.trim().slice(0, 200),
      description: description.trim().slice(0, 500),
      statusCode: response.status,
    });
  } catch (err: unknown) {
    // Still return 200 with fallback data — provider is reachable, URL might not be
    const msg = err instanceof Error ? err.message : String(err);
    return res.status(200).json({
      url: parsedUrl.toString(),
      title: parsedUrl.hostname,
      description: `Could not fetch page: ${msg}`,
      statusCode: 0,
    });
  }
});

function extractTag(html: string, open: string, close: string): string | null {
  const start = html.toLowerCase().indexOf(open.toLowerCase());
  if (start === -1) return null;
  const end = html.toLowerCase().indexOf(close.toLowerCase(), start);
  if (end === -1) return null;
  return html.slice(start + open.length, end).replace(/<[^>]+>/g, '').trim();
}

function extractMeta(html: string, name: string): string | null {
  const patterns = [
    new RegExp(`<meta[^>]+(?:name|property)=["']${name}["'][^>]+content=["']([^"']+)["']`, 'i'),
    new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+(?:name|property)=["']${name}["']`, 'i'),
  ];
  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match?.[1]) return match[1];
  }
  return null;
}

// ── 4. Flaky Provider ─────────────────────────────────────────────────────────
/**
 * Input:  { mode?: "server-error" | "wrong-schema" | "random" }
 * Intentionally fails:
 *   - mode="server-error"  → HTTP 500
 *   - mode="wrong-schema"  → HTTP 200 but missing required fields
 *   - mode="random"        → alternates between the two on each call
 *   - default              → alternates
 *
 * Registered schema_output: { result: string, score: number }
 * So wrong-schema returns { result: string } (missing score)
 */
let flakyCalls = 0;
app.post('/provider/flaky', (req: Request, res: Response) => {
  const { mode = 'random' } = req.body as { mode?: string };
  flakyCalls++;

  const useServerError =
    mode === 'server-error' ||
    (mode === 'random' && flakyCalls % 2 === 1);

  if (useServerError) {
    console.log(`[Flaky] Call #${flakyCalls}: returning 500`);
    return res.status(500).json({
      error: 'Simulated provider failure',
      callNumber: flakyCalls,
    });
  }

  // Wrong schema: missing required 'score' field
  console.log(`[Flaky] Call #${flakyCalls}: returning wrong schema (missing score)`);
  return res.status(200).json({
    result: 'This response is missing the required score field',
    // score is intentionally omitted
    callNumber: flakyCalls,
  });
});

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', provider: 'dummy', timestamp: new Date().toISOString() });
});

// ── Start ─────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀 MicroMinds Dummy Provider running on http://localhost:${PORT}`);
  console.log(`\nEndpoints:`);
  console.log(`  POST http://localhost:${PORT}/provider/json-formatter`);
  console.log(`  POST http://localhost:${PORT}/provider/text-extractor`);
  console.log(`  POST http://localhost:${PORT}/provider/url-metadata`);
  console.log(`  POST http://localhost:${PORT}/provider/flaky`);
  console.log(`   GET http://localhost:${PORT}/health\n`);
});

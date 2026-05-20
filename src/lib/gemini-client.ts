// Client-side Gemini API utility — called directly from browser to bypass server IP restrictions

const GEMINI_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';

// Models tried in order; next is used when current is unavailable (503) or rate-limited (429)
const MODEL_PRIORITY = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-2.0-flash-lite'];

function getApiKey(): string {
  const key = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  if (!key) throw new Error('Gemini API key not configured (NEXT_PUBLIC_GEMINI_API_KEY)');
  return key;
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/** Thrown when all retries for one model are exhausted — triggers fallback to the next model */
class RetryExhaustedError extends Error {
  constructor(status: number, retries: number) {
    const label = status === 429 ? 'Rate limit' : 'Service unavailable';
    super(`${label} — Gemini is still busy after ${retries} retries. Please try again in a minute.`);
    this.name = 'RetryExhaustedError';
  }
}

/**
 * Fetch with automatic retry on 503 (high demand) and 429 (rate limit).
 * Throws RetryExhaustedError when all retries are spent so callers can fall back to another model.
 */
async function fetchWithRetry(
  url: string,
  init: RequestInit,
  maxRetries = 4,
): Promise<Response> {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const res = await fetch(url, init);

    if (res.ok) return res;

    // Retryable statuses: 503 (high demand) and 429 (rate limit)
    if (res.status === 503 || res.status === 429) {
      if (attempt === maxRetries) throw new RetryExhaustedError(res.status, maxRetries);

      // Determine wait time: prefer server hint, else exponential backoff
      let delayMs: number | null = null;

      // 1) Check Retry-After header
      const retryAfterHeader = res.headers.get('Retry-After');
      if (retryAfterHeader) {
        const secs = parseInt(retryAfterHeader, 10);
        if (!isNaN(secs) && secs > 0) delayMs = secs * 1000;
      }

      // 2) Parse retryDelay from JSON body (Google's retryInfo detail)
      if (delayMs === null) {
        try {
          const body = await res.clone().json();
          const details: Array<{ retryDelay?: string }> = body?.error?.details ?? [];
          for (const d of details) {
            if (d.retryDelay) {
              const secs = parseInt(d.retryDelay, 10);
              if (!isNaN(secs) && secs > 0) { delayMs = secs * 1000; break; }
            }
          }
        } catch { /* non-JSON body — ignore */ }
      }

      // 3) Fallback: longer base for 429 (rate limit needs ~60 s), shorter for 503
      if (delayMs === null) {
        const base = res.status === 429 ? 15000 : 3000;
        delayMs = base * Math.pow(2, attempt);
      }

      // Enforce a minimum of 10 s to avoid pointless instant retries
      delayMs = Math.max(delayMs, 10000);

      console.warn(`Gemini ${res.status} on attempt ${attempt + 1}/${maxRetries + 1} — retrying in ${delayMs / 1000}s…`);
      await sleep(delayMs);
      continue;
    }

    // Non-retryable error — throw immediately
    const errText = await res.text().catch(() => '');
    throw new Error(`Gemini API error: ${res.status} — ${errText.slice(0, 300)}`);
  }

  throw new Error('Gemini request failed after retries');
}

/** Call Gemini with an image or PDF (base64) and a text prompt */
export async function callGeminiVision({
  mimeType,
  base64Data,
  fileUri,
  prompt,
  temperature = 0.1,
  maxOutputTokens = 65536,
}: {
  mimeType?: string;
  base64Data?: string;
  fileUri?: string;
  prompt: string;
  temperature?: number;
  maxOutputTokens?: number;
}): Promise<{ text: string; finishReason: string }> {
  const apiKey = getApiKey();

  const filePart = fileUri
    ? { file_data: { mime_type: mimeType || 'application/pdf', file_uri: fileUri } }
    : { inline_data: { mime_type: mimeType, data: base64Data } };

  const requestBody = {
    contents: [{ parts: [{ text: prompt }, filePart] }],
    generationConfig: { temperature, maxOutputTokens },
  };

  let lastErr: Error | null = null;

  for (const model of MODEL_PRIORITY) {
    try {
      const url = `${GEMINI_BASE}/${model}:generateContent?key=${apiKey}`;
      const res = await fetchWithRetry(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      if (model !== MODEL_PRIORITY[0]) console.warn(`Gemini fallback succeeded with model: ${model}`);

      const data = await res.json();
      const text: string = data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
      const finishReason: string = data.candidates?.[0]?.finishReason ?? 'STOP';

      if (!text) throw new Error('Gemini returned an empty response.');
      return { text, finishReason };
    } catch (err: any) {
      if (err.name === 'RetryExhaustedError') {
        lastErr = err;
        console.warn(`Model ${model} exhausted — trying next fallback…`);
        continue;
      }
      throw err;
    }
  }

  // All Gemini models exhausted — try OpenAI as final fallback (images only; PDFs not supported)
  if (mimeType?.startsWith('image/') && base64Data) {
    console.warn('All Gemini models failed — falling back to OpenAI GPT-4o…');
    const oaiRes = await fetch('/api/ai/openai-fallback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, base64Data, mimeType }),
    });
    if (oaiRes.ok) {
      const oaiData = await oaiRes.json();
      if (oaiData.text) return { text: oaiData.text, finishReason: oaiData.finishReason ?? 'stop' };
    }
  }

  throw lastErr ?? new Error('All AI models failed. Please try again later.');
}

/** Call Gemini with a text-only prompt */
export async function callGeminiText(
  prompt: string,
  options?: { temperature?: number; maxOutputTokens?: number }
): Promise<string> {
  const apiKey = getApiKey();

  const requestBody = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: options?.temperature ?? 0.3,
      maxOutputTokens: options?.maxOutputTokens ?? 8192,
    },
  };

  let lastErr: Error | null = null;

  for (const model of MODEL_PRIORITY) {
    try {
      const url = `${GEMINI_BASE}/${model}:generateContent?key=${apiKey}`;
      const res = await fetchWithRetry(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      if (model !== MODEL_PRIORITY[0]) console.warn(`Gemini fallback succeeded with model: ${model}`);

      const data = await res.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
    } catch (err: any) {
      if (err.name === 'RetryExhaustedError') {
        lastErr = err;
        console.warn(`Model ${model} exhausted — trying next fallback…`);
        continue;
      }
      throw err;
    }
  }

  // All Gemini models exhausted — try OpenAI as final fallback
  console.warn('All Gemini models failed — falling back to OpenAI GPT-4o…');
  const oaiRes = await fetch('/api/ai/openai-fallback', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt }),
  });
  if (oaiRes.ok) {
    const oaiData = await oaiRes.json();
    if (oaiData.text) return oaiData.text;
  }

  throw lastErr ?? new Error('All AI models failed. Please try again later.');
}

// Client-side Gemini API utility — called directly from browser to bypass server IP restrictions

const GEMINI_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

function getApiKey(): string {
  const key = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  if (!key) throw new Error('Gemini API key not configured (NEXT_PUBLIC_GEMINI_API_KEY)');
  return key;
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Fetch with automatic retry on 503 (high demand) and 429 (rate limit).
 * Retries up to `maxRetries` times with exponential backoff.
 */
async function fetchWithRetry(
  url: string,
  init: RequestInit,
  maxRetries = 4,
): Promise<Response> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const res = await fetch(url, init);

    if (res.ok) return res;

    // Retryable statuses: 503 (high demand) and 429 (rate limit)
    if (res.status === 503 || res.status === 429) {
      const errText = await res.text().catch(() => '');
      const isLast = attempt === maxRetries;

      if (isLast) {
        const label = res.status === 429 ? 'Rate limit' : 'Service unavailable';
        lastError = new Error(`${label} — Gemini is still busy after ${maxRetries} retries. Please try again in a minute.`);
        break;
      }

      // Exponential backoff: 3s, 6s, 12s, 24s
      const delayMs = 3000 * Math.pow(2, attempt);
      console.warn(`Gemini ${res.status} on attempt ${attempt + 1}/${maxRetries + 1} — retrying in ${delayMs / 1000}s…`);
      await sleep(delayMs);
      continue;
    }

    // Non-retryable error — throw immediately
    const errText = await res.text().catch(() => '');
    throw new Error(`Gemini API error: ${res.status} — ${errText.slice(0, 300)}`);
  }

  throw lastError ?? new Error('Gemini request failed after retries');
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

  const body = {
    contents: [{ parts: [{ text: prompt }, filePart] }],
    generationConfig: { temperature, maxOutputTokens },
  };

  const res = await fetchWithRetry(`${GEMINI_URL}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const data = await res.json();
  const text: string = data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
  const finishReason: string = data.candidates?.[0]?.finishReason ?? 'STOP';

  if (!text) throw new Error('Gemini returned an empty response.');
  return { text, finishReason };
}

/** Call Gemini with a text-only prompt */
export async function callGeminiText(
  prompt: string,
  options?: { temperature?: number; maxOutputTokens?: number }
): Promise<string> {
  const apiKey = getApiKey();

  const body = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: options?.temperature ?? 0.3,
      maxOutputTokens: options?.maxOutputTokens ?? 8192,
    },
  };

  const res = await fetchWithRetry(`${GEMINI_URL}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
}

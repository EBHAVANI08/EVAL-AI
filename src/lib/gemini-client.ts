// Client-side Gemini API utility — called directly from browser to bypass server IP restrictions

const GEMINI_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

function getApiKey(): string {
  const key = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  if (!key) throw new Error('Gemini API key not configured (NEXT_PUBLIC_GEMINI_API_KEY)');
  return key;
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

  const res = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    if (res.status === 429) throw new Error('Rate limit reached. Please wait and try again.');
    throw new Error(`Gemini API error: ${res.status} — ${errText.slice(0, 200)}`);
  }

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

  const res = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    if (res.status === 429) throw new Error('Rate limit reached. Please wait and try again.');
    throw new Error(`Gemini API error: ${res.status} — ${errText.slice(0, 200)}`);
  }

  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
}

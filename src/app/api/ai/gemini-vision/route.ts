import { NextRequest, NextResponse } from 'next/server';

const GEMINI_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

// Statuses that are safe to retry (transient server or rate-limit errors)
const RETRYABLE = new Set([429, 500, 502, 503, 504]);

async function callGeminiWithRetry(
  apiKey: string,
  body: object,
  maxRetries = 3
): Promise<Response> {
  let lastRes: Response | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    let res: Response;
    try {
      res = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
    } catch (networkErr) {
      // Network-level failure — retry
      if (attempt === maxRetries) throw networkErr;
      await new Promise((r) => setTimeout(r, Math.pow(2, attempt + 1) * 1000));
      continue;
    }

    if (!RETRYABLE.has(res.status)) return res;

    lastRes = res;
    if (attempt === maxRetries) break;

    // Respect Retry-After for 429; exponential backoff for 5xx (2s, 4s, 8s)
    const retryAfter = res.headers.get('Retry-After');
    const waitMs = retryAfter
      ? parseInt(retryAfter, 10) * 1000
      : Math.pow(2, attempt + 1) * 1000;

    console.warn(`Gemini returned ${res.status} — retrying in ${waitMs}ms (attempt ${attempt + 1}/${maxRetries})`);
    await new Promise((r) => setTimeout(r, waitMs));
  }

  return lastRes!;
}

export async function POST(request: NextRequest) {
  try {
    const { mimeType, base64Data, fileUri, prompt } = await request.json();

    if (!prompt || (!base64Data && !fileUri)) {
      return NextResponse.json(
        { error: 'Missing required fields: prompt and either base64Data or fileUri' },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'GEMINI_API_KEY is not configured' },
        { status: 400 }
      );
    }

    // Use file_data (File API URI) for PDFs, inline_data for images
    const filePart = fileUri
      ? { file_data: { mime_type: mimeType || 'application/pdf', file_uri: fileUri } }
      : { inline_data: { mime_type: mimeType, data: base64Data } };

    const body = {
      contents: [
        {
          parts: [{ text: prompt }, filePart],
        },
      ],
      generationConfig: { temperature: 0.1, maxOutputTokens: 65536 },
    };

    const res = await callGeminiWithRetry(apiKey, body);

    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      if (res.status === 429) {
        return NextResponse.json(
          { error: 'Gemini rate limit reached. Please wait 30–60 seconds and try again.' },
          { status: 429 }
        );
      }
      if (res.status === 500 || res.status === 503) {
        return NextResponse.json(
          { error: 'Gemini server error. The image may be too large or complex — try a smaller/clearer image and retry.' },
          { status: 502 }
        );
      }
      return NextResponse.json(
        { error: `Gemini API error: ${res.status}`, details: errText },
        { status: res.status }
      );
    }

    const data = await res.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
    const finishReason: string = data.candidates?.[0]?.finishReason ?? 'STOP';

    if (!text) {
      return NextResponse.json(
        { error: 'Gemini returned an empty response. Please try again.' },
        { status: 502 }
      );
    }

    return NextResponse.json({ text, finishReason });
  } catch (err: any) {
    console.error('gemini-vision route error:', err);
    return NextResponse.json(
      { error: err.message || 'Internal error' },
      { status: 500 }
    );
  }
}

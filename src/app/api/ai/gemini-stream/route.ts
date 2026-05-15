import { NextRequest } from 'next/server';

const GEMINI_STREAM_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:streamGenerateContent?alt=sse';

export async function POST(request: NextRequest) {
  try {
    const { mimeType, base64Data, fileUri, prompt } = await request.json();

    if (!prompt || (!base64Data && !fileUri)) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'GEMINI_API_KEY not configured' }), { status: 400 });
    }

    const filePart = fileUri
      ? { file_data: { mime_type: mimeType || 'application/pdf', file_uri: fileUri } }
      : { inline_data: { mime_type: mimeType, data: base64Data } };

    const body = {
      contents: [{ parts: [{ text: prompt }, filePart] }],
      generationConfig: { temperature: 0.1, maxOutputTokens: 65536 },
    };

    const res = await fetch(`${GEMINI_STREAM_URL}&key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!res.ok || !res.body) {
      const errText = await res.text().catch(() => '');
      const status = res.status === 429 ? 429 : 502;
      return new Response(JSON.stringify({ error: `Gemini error ${res.status}: ${errText}` }), { status });
    }

    // Pipe Gemini's SSE stream straight to the client
    return new Response(res.body, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        'X-Accel-Buffering': 'no',
      },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || 'Internal error' }), { status: 500 });
  }
}

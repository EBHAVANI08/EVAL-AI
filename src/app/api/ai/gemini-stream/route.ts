import { NextRequest, NextResponse } from 'next/server';

const GEMINI_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

export async function POST(request: NextRequest) {
  try {
    const { mimeType, base64Data, fileUri, prompt } = await request.json();

    if (!prompt || (!base64Data && !fileUri)) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'GEMINI_API_KEY not configured' }, { status: 400 });
    }

    const filePart = fileUri
      ? { file_data: { mime_type: mimeType || 'application/pdf', file_uri: fileUri } }
      : { inline_data: { mime_type: mimeType, data: base64Data } };

    const body = {
      contents: [{ parts: [{ text: prompt }, filePart] }],
      generationConfig: { temperature: 0.1, maxOutputTokens: 65536 },
    };

    const res = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      if (res.status === 429) {
        return NextResponse.json({ error: 'Rate limit reached. Please wait and try again.' }, { status: 429 });
      }
      return NextResponse.json({ error: `Gemini API error: ${res.status}`, details: errText }, { status: res.status });
    }

    const data = await res.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
    const finishReason: string = data.candidates?.[0]?.finishReason ?? 'STOP';

    if (!text) {
      return NextResponse.json({ error: 'Gemini returned an empty response.' }, { status: 502 });
    }

    return NextResponse.json({ text, finishReason });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal error' }, { status: 500 });
  }
}

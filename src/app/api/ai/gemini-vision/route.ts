import { NextRequest, NextResponse } from 'next/server';

const OPENAI_URL = 'https://api.openai.com/v1/chat/completions';

async function callOpenAIWithRetry(apiKey: string, body: object, maxRetries = 3): Promise<Response> {
  let lastRes: Response | null = null;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    let res: Response;
    try {
      res = await fetch(OPENAI_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify(body),
      });
    } catch (networkErr) {
      if (attempt === maxRetries) throw networkErr;
      await new Promise((r) => setTimeout(r, Math.pow(2, attempt + 1) * 1000));
      continue;
    }
    if (![429, 500, 502, 503, 504].includes(res.status)) return res;
    lastRes = res;
    if (attempt === maxRetries) break;
    const retryAfter = res.headers.get('Retry-After');
    const waitMs = retryAfter ? parseInt(retryAfter, 10) * 1000 : Math.pow(2, attempt + 1) * 1000;
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

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'OPENAI_API_KEY is not configured' }, { status: 400 });
    }

    const imageContent = base64Data
      ? { type: 'image_url', image_url: { url: `data:${mimeType || 'application/pdf'};base64,${base64Data}`, detail: 'high' } }
      : { type: 'image_url', image_url: { url: fileUri, detail: 'high' } };

    const body = {
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: [{ type: 'text', text: prompt }, imageContent],
        },
      ],
      max_tokens: 16384,
      temperature: 0.1,
    };

    const res = await callOpenAIWithRetry(apiKey, body);

    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      if (res.status === 429) {
        return NextResponse.json(
          { error: 'Rate limit reached. Please wait and try again.' },
          { status: 429 }
        );
      }
      return NextResponse.json(
        { error: `OpenAI API error: ${res.status}`, details: errText },
        { status: res.status }
      );
    }

    const data = await res.json();
    const text = data.choices?.[0]?.message?.content ?? '';
    const finishReason: string = data.choices?.[0]?.finish_reason ?? 'stop';

    if (!text) {
      return NextResponse.json({ error: 'OpenAI returned an empty response.' }, { status: 502 });
    }

    return NextResponse.json({ text, finishReason });
  } catch (err: any) {
    console.error('gemini-vision route error:', err);
    return NextResponse.json({ error: err.message || 'Internal error' }, { status: 500 });
  }
}

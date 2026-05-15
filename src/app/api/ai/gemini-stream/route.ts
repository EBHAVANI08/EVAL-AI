import { NextRequest } from 'next/server';

const OPENAI_URL = 'https://api.openai.com/v1/chat/completions';

export async function POST(request: NextRequest) {
  try {
    const { mimeType, base64Data, fileUri, prompt } = await request.json();

    if (!prompt || (!base64Data && !fileUri)) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'OPENAI_API_KEY not configured' }), { status: 400 });
    }

    const imageContent = base64Data
      ? { type: 'image_url', image_url: { url: `data:${mimeType || 'application/pdf'};base64,${base64Data}`, detail: 'high' } }
      : { type: 'image_url', image_url: { url: fileUri, detail: 'high' } };

    const body = {
      model: 'gpt-4o',
      messages: [{ role: 'user', content: [{ type: 'text', text: prompt }, imageContent] }],
      max_tokens: 16384,
      temperature: 0.1,
      stream: true,
    };

    const res = await fetch(OPENAI_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify(body),
    });

    if (!res.ok || !res.body) {
      const errText = await res.text().catch(() => '');
      const status = res.status === 429 ? 429 : 502;
      return new Response(JSON.stringify({ error: `OpenAI error ${res.status}: ${errText}` }), { status });
    }

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

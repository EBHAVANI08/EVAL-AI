import { NextRequest, NextResponse } from 'next/server';

/**
 * OpenAI fallback route — called when all Gemini models are exhausted.
 * Supports text-only and image inputs (JPEG/PNG/WebP).
 * PDFs are not supported by OpenAI chat completions and return 422.
 */
export async function POST(request: NextRequest) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'OpenAI API key not configured (OPENAI_API_KEY)' }, { status: 400 });
  }

  const { prompt, base64Data, mimeType } = await request.json();

  if (!prompt) {
    return NextResponse.json({ error: 'Missing required field: prompt' }, { status: 400 });
  }

  // Build message content
  let content: unknown;
  if (base64Data && mimeType?.startsWith('image/')) {
    content = [
      { type: 'text', text: prompt },
      { type: 'image_url', image_url: { url: `data:${mimeType};base64,${base64Data}` } },
    ];
  } else if (base64Data && mimeType === 'application/pdf') {
    // OpenAI chat completions do not support inline PDF — skip to error so caller can handle gracefully
    return NextResponse.json(
      { error: 'OpenAI fallback does not support PDF inputs. Please try again later.' },
      { status: 422 },
    );
  } else {
    content = prompt;
  }

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [{ role: 'user', content }],
      max_tokens: 8192,
    }),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    return NextResponse.json(
      { error: `OpenAI error: ${res.status}`, details: errText.slice(0, 300) },
      { status: res.status },
    );
  }

  const data = await res.json();
  const text: string = data.choices?.[0]?.message?.content ?? '';
  const finishReason: string = data.choices?.[0]?.finish_reason ?? 'stop';

  if (!text) {
    return NextResponse.json({ error: 'OpenAI returned an empty response.' }, { status: 502 });
  }

  return NextResponse.json({ text, finishReason });
}

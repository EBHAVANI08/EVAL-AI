import { NextRequest, NextResponse } from 'next/server';

const GEMINI_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

export async function POST(request: NextRequest) {
  try {
    const { question, subject, class: cls, board, marks, style, language } = await request.json();

    if (!question) {
      return NextResponse.json({ error: 'question is required' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'GEMINI_API_KEY not configured' }, { status: 400 });
    }

    const prompt = `You are an expert ${board || 'CBSE'} teacher writing model answers for students.

Generate a detailed, well-structured model answer for the following question.

Question: ${question}
Subject: ${subject || 'General'}
Class: ${cls || 'Unknown'}
Marks: ${marks || 'Not specified'}
Answer Style: ${style || 'CBSE Standard (Points)'}
Language: ${language || 'English'}

Requirements:
- Write a complete, exam-ready model answer
- Use clear headings and numbered points where appropriate
- Include ALL key points needed for full marks
- For diagram questions or "Diagram + Notes" style: describe the diagram in a clearly labeled section with all parts, arrows, and labels listed as bullet points (do NOT use ASCII art)
- Match detail level to marks weightage
- Follow ${board || 'CBSE'} conventions for answer writing
- For numerical questions, show complete step-by-step working
- Write in ${language || 'English'}

Return ONLY valid JSON (no markdown fences) in this exact format:
{
  "modelAnswer": "The complete formatted model answer text with proper structure",
  "keyPoints": ["Key point 1 that must be mentioned", "Key point 2", "Key point 3"],
  "markingScheme": [
    {"point": "What earns marks here", "marks": 1}
  ],
  "tips": "Exam tips for writing this answer effectively",
  "estimatedTime": "X minutes"
}`;

    const body = {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.3, maxOutputTokens: 8192 },
    };

    const res = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      if (res.status === 429) {
        return NextResponse.json(
          { error: 'Rate limit reached. Please wait 30-60 seconds and try again.' },
          { status: 429 }
        );
      }
      return NextResponse.json(
        { error: `Gemini API error: ${res.status}`, details: errText },
        { status: res.status }
      );
    }

    const data = await res.json();
    let text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';

    // Strip all markdown code fences (handles ```json, ```, etc.)
    text = text
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim();

    let parsed: any;
    try {
      parsed = JSON.parse(text);
    } catch {
      // Try extracting JSON object from surrounding text
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          parsed = JSON.parse(jsonMatch[0]);
        } catch {
          parsed = null;
        }
      }
      if (!parsed) {
        parsed = {
          modelAnswer: text,
          keyPoints: [],
          markingScheme: [],
          tips: '',
          estimatedTime: '',
        };
      }
    }

    // Ensure modelAnswer is a plain string (not accidentally nested JSON)
    if (parsed.modelAnswer && typeof parsed.modelAnswer === 'object') {
      parsed.modelAnswer = JSON.stringify(parsed.modelAnswer, null, 2);
    }

    return NextResponse.json(parsed);
  } catch (err: any) {
    console.error('generate-answer error:', err);
    return NextResponse.json({ error: err.message || 'Internal error' }, { status: 500 });
  }
}

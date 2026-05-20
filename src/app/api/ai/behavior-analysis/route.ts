import { NextRequest, NextResponse } from 'next/server';

/**
 * Gemini Handwriting + Learning Behavior Analysis
 *
 * Analyzes scanned answer sheet images to extract:
 * - Handwriting features (baseline, slant, pressure, spacing, zones)
 * - Personality/behavioral signals (framed as indicators, not clinical facts)
 * - Emotional state signals (stress, confidence, hesitation)
 * - Learning behavior insights (subject + grade + answer patterns combined)
 *
 * DISCLAIMER: Graphology-based inferences are observational signals only.
 * Outputs must be framed as indicators, not diagnostic conclusions.
 */

const GEMINI_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';
const MODELS = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-2.0-flash-lite'];

async function callGeminiWithFallback(apiKey: string, body: object): Promise<any> {
  for (const model of MODELS) {
    const url = `${GEMINI_BASE}/${model}:generateContent?key=${apiKey}`;
    let lastStatus = 0;
    for (let attempt = 0; attempt <= 3; attempt++) {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (res.ok) return res.json();
      lastStatus = res.status;
      if (res.status !== 429 && res.status !== 503) break;
      if (attempt < 3) {
        let delay = 10000 * Math.pow(2, attempt);
        try {
          const errBody = await res.clone().json();
          const details = errBody?.error?.details ?? [];
          for (const d of details) {
            if (d.retryDelay) { const s = parseInt(d.retryDelay, 10); if (s > 0) { delay = s * 1000; break; } }
          }
        } catch { /* ignore */ }
        await new Promise((r) => setTimeout(r, delay));
      }
    }
    if (lastStatus !== 429 && lastStatus !== 503) break;
  }
  throw new Error('All Gemini models failed for behavior analysis');
}

function gradeContextHint(gradeLevel: string): string {
  const g = parseInt(gradeLevel.replace(/\D/g, ''), 10) || 0;
  if (g <= 5) return 'Primary school student: focus on letter formation, spacing consistency, and writing maturity';
  if (g <= 8) return 'Middle school student: focus on paragraph organization, concept clarity in answers, diagram usage';
  if (g <= 10) return 'Secondary student: focus on answer structure, key-point selection, time management signals';
  return 'Senior secondary student: focus on analytical depth, multi-step reasoning signals, exam strategy indicators';
}

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'GEMINI_API_KEY not configured' }, { status: 400 });
    }

    const {
      images,        // base64 image strings (up to 4 pages)
      mimeType,      // e.g. "image/jpeg"
      subject,
      gradeLevel,
      evaluationSummary,   // { totalQ, avgScorePercent, flaggedCount, hardCount, avgConfidence }
      questionBehaviors,   // QuestionBehavior[] from local computation
    } = await request.json();

    if (!images?.length) {
      return NextResponse.json({ error: 'No images provided for handwriting analysis' }, { status: 400 });
    }

    const evalCtx = evaluationSummary ?? {};
    const hint = gradeContextHint(gradeLevel ?? '');

    const prompt = `You are an educational psychologist and handwriting analyst reviewing a student's handwritten answer sheet.

⚠️ IMPORTANT FRAMING:
All your outputs MUST be framed as "signals" or "indicators" — not clinical facts or personality diagnoses.
Use language like: "suggests", "may indicate", "signal observed", "pattern consistent with".
Never state anything as absolute fact about the student's personality or emotional state.

═══════════════════════════════════════════════════════════
CONTEXT
═══════════════════════════════════════════════════════════
Subject: ${subject ?? 'Unknown'}
Grade Level: ${gradeLevel ?? 'Unknown'}
${hint}
Evaluation summary: ${evalCtx.totalQ ?? '?'} questions evaluated,
  avg score ${evalCtx.avgScorePercent ?? '?'}%,
  ${evalCtx.flaggedCount ?? 0} flagged questions,
  ${evalCtx.hardCount ?? 0} marked as difficult,
  avg AI confidence ${evalCtx.avgConfidence ?? '?'}%

Question behavior summary (from scoring):
${Array.isArray(questionBehaviors) ? questionBehaviors.slice(0, 10).map((q: any) =>
  `  Q.${q.qNo}: ${q.difficulty} difficulty, answer ${q.answerLengthStatus} (${q.ocrWordCount} words vs expected ${q.expectedWordRange?.min}–${q.expectedWordRange?.max})`
).join('\n') : 'Not provided'}

═══════════════════════════════════════════════════════════
ANALYSIS TASKS
═══════════════════════════════════════════════════════════

Carefully examine ALL provided handwriting images and perform the following analysis:

TASK 1 — HANDWRITING FEATURE EXTRACTION
Measure and estimate these features from the visual handwriting:

1. Baseline angle: Do lines rise (↗), fall (↘), stay straight (→), or wave?
   Estimate slope: e.g. +5° (rising), -3° (falling), 0° (straight)

2. Slant angle: Do letters lean left (\\), stand straight (|), or lean right (/)?
   Classify: left / slight-left / straight / slight-right / right

3. Pen pressure: How dark/heavy are the strokes?
   Classify: light / medium / heavy. Estimate intensity 0–100.

4. Letter size: How tall are the letters on average?
   Classify: small / medium / large. Variance: low / moderate / high

5. Word spacing: How much space between words?
   Classify: narrow / moderate / wide

6. Line spacing: Distance between lines. Consistency?
   Classify spacing: tight / moderate / wide. Consistency: consistent / inconsistent

7. Margins: Left margin (narrow/regular/wide), right margin (regular/irregular)

8. Writing zones: Which letter zones dominate?
   Upper zone (h, l, t, b, k, f) — ideas, imagination
   Middle zone (a, e, o, n, m) — everyday reality
   Lower zone (g, y, j, p, q) — physical/action
   Estimate percentages. Dominant zone: upper / middle / lower / balanced

9. Corrections & scratches: How frequent? Where concentrated?
   Frequency: low / moderate / high
   Pattern: none / scattered / concentrated-start / concentrated-end

10. Stroke rhythm: Is writing smooth and flowing or jerky?
    Consistency: fluid / moderate / irregular
    Flow pattern: consistent / varies-by-section / declining

TASK 2 — PERSONALITY SIGNALS (framed as observable indicators only)
Based on handwriting features, identify these personality signals.
For each, provide a score 0–100 (signal strength) and one-line indicator text.

Traits to assess:
- Expressiveness (right slant + large size + high pressure → higher signal)
- Organization (consistent spacing + regular margins + structured zones → higher)
- Analytical Thinking (small size + tight spacing + middle zone + low variance → higher)
- Confidence (stable baseline + consistent pressure + few corrections → higher)
- Social Openness (moderate-to-wide word spacing + right slant → higher)
- Creativity (upper zone dominance + varied letter size + fluid rhythm → higher)
- Determination (heavy pressure + rising baseline → higher)
- Attention to Detail (small letter size + narrow spacing + neat corrections → higher)

Classify overall styles:
- communicationStyle: expressive / reserved / analytical / mixed
- thinkingStyle: logical / emotional / intuitive / analytical-emotional / mixed
- workStyle: organized / spontaneous / structured-with-creative-bursts / mixed
- socialStyle: introvert / balanced / extrovert

TASK 3 — EMOTIONAL & BEHAVIORAL SIGNALS
Detect emotional patterns from visual handwriting features:

Stress signals (look for):
  - Shaky or trembling strokes
  - Inconsistent pressure
  - Cramped writing in certain sections
  - Heavy corrections or crossed-out sections
  → Rate stress level: low / moderate / high

Confidence signals (look for):
  - Stable, even baseline
  - Smooth, flowing strokes
  - Consistent letter size
  - Few corrections
  → Rate confidence level: low / medium / high

Hesitation signals (look for):
  - Frequent restarts / rewriting
  - Fragmented stroke flow
  - Extra pressure at start of answers
  - Incomplete words or sentences
  → Rate hesitation level: low / low-moderate / moderate / high

Overall emotional tone (one phrase): e.g. "focused-with-moderate-stress", "confident-and-fluid", "anxious-and-rushed"

TASK 4 — LEARNING BEHAVIOR INSIGHTS
Combine handwriting signals with the evaluation context above to generate:

1. Subject-specific insight (1–2 sentences about how the student engages with ${subject ?? 'this subject'})
2. Answer pattern observation (1 sentence about writing behavior relative to question difficulty)
3. Study style indicators (2–3 bullet points about likely learning approach)
4. Exam strategy observation (1 sentence about how they manage time/energy across the exam)
5. Grade-appropriate observations (2–3 points for ${gradeLevel ?? 'this grade level'})

═══════════════════════════════════════════════════════════
OUTPUT FORMAT — return ONLY valid JSON, no markdown fences:
═══════════════════════════════════════════════════════════
{
  "handwritingFeatures": {
    "baselineAngle": { "value": 4, "direction": "rising", "label": "+4° (slightly rising)" },
    "slant": { "value": "slight-right", "label": "Slight Right Lean" },
    "pressure": { "value": "medium", "intensity": 55, "label": "Medium Pressure" },
    "letterSize": { "value": "medium", "variance": "low", "label": "Medium, Consistent" },
    "wordSpacing": { "value": "moderate", "label": "Moderate Spacing" },
    "lineSpacing": { "value": "moderate", "consistency": "consistent", "label": "Moderate, Consistent" },
    "margins": { "left": "regular", "right": "regular", "label": "Regular Margins" },
    "writingZones": { "dominant": "middle", "upperPercent": 20, "middlePercent": 65, "lowerPercent": 15 },
    "corrections": { "frequency": "low", "pattern": "scattered", "label": "Few Corrections" },
    "strokeRhythm": { "consistency": "moderate", "flowPattern": "consistent", "label": "Moderately Fluid" }
  },
  "personalityProfile": {
    "traits": [
      { "name": "Expressiveness", "score": 68, "signal": "moderate-high", "indicator": "Slight right slant and medium pressure suggest comfortable emotional expression" },
      { "name": "Organization", "score": 72, "signal": "moderate-high", "indicator": "Consistent line spacing and regular margins indicate organized thinking" },
      { "name": "Analytical Thinking", "score": 65, "signal": "moderate", "indicator": "Medium letter size with low variance suggests focus without excessive detail-orientation" },
      { "name": "Confidence", "score": 60, "signal": "moderate", "indicator": "Generally stable baseline with minor pressure fluctuations in complex sections" },
      { "name": "Social Openness", "score": 70, "signal": "moderate-high", "indicator": "Moderate word spacing suggests comfortable social engagement" },
      { "name": "Creativity", "score": 55, "signal": "moderate", "indicator": "Balanced zone usage without strong upper zone dominance" },
      { "name": "Determination", "score": 63, "signal": "moderate", "indicator": "Medium pressure maintained throughout most of the sheet" },
      { "name": "Attention to Detail", "score": 58, "signal": "moderate", "indicator": "Medium letter size — detail focus is moderate rather than high" }
    ],
    "communicationStyle": "mixed",
    "thinkingStyle": "analytical-emotional",
    "workStyle": "organized",
    "socialStyle": "balanced"
  },
  "emotionalSignals": {
    "stressIndicators": {
      "level": "moderate",
      "signals": ["Slight pressure increase in final section may signal time pressure", "A few correction clusters in difficult questions"]
    },
    "confidenceIndicators": {
      "level": "medium",
      "signals": ["Stable baseline in early questions suggests initial confidence", "Pressure consistency drops slightly in hard topics"]
    },
    "hesitationIndicators": {
      "level": "low-moderate",
      "signals": ["Occasional sentence restarts in long-answer questions"]
    },
    "overallEmotionalTone": "moderately-focused"
  },
  "learningBehaviorInsights": {
    "subjectSpecific": "Student shows stronger engagement with conceptual questions, with writing becoming more pressured and less organized in calculation-heavy sections.",
    "answerPatterns": "Answer length is generally appropriate, with slight over-explanation in 2-mark questions suggesting uncertainty about what constitutes a complete answer.",
    "studyStyleIndicators": ["Likely a verbal/written learner who benefits from summarization exercises", "May benefit from visual concept maps for complex topics", "Shows structured thinking — structured revision plans likely suit this student"],
    "examStrategy": "Strong start with visible fatigue signals in the later section — time management practice recommended.",
    "gradeAppropriateObservations": ["Answer structure meets grade expectations", "Key-point identification needs strengthening for exam preparation", "Diagram usage could be developed further for science topics"]
  }
}`;

    // Build image parts (max 4 pages to keep token usage reasonable)
    const imageParts = (images as string[]).slice(0, 4).map((b64: string) => ({
      inline_data: { mime_type: mimeType ?? 'image/jpeg', data: b64 },
    }));

    const geminiBody = {
      contents: [{ parts: [{ text: prompt }, ...imageParts] }],
      generationConfig: { temperature: 0.2, maxOutputTokens: 8192 },
    };

    const data = await callGeminiWithFallback(apiKey, geminiBody);
    const raw: string = data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';

    // Extract JSON from response
    const jsonStart = raw.indexOf('{');
    const jsonEnd = raw.lastIndexOf('}');
    if (jsonStart === -1 || jsonEnd === -1) {
      return NextResponse.json({ error: 'Gemini returned non-JSON response', raw: raw.slice(0, 200) }, { status: 502 });
    }

    const parsed = JSON.parse(raw.slice(jsonStart, jsonEnd + 1));

    return NextResponse.json({
      handwritingFeatures: parsed.handwritingFeatures ?? null,
      personalityProfile: parsed.personalityProfile ?? null,
      emotionalSignals: parsed.emotionalSignals ?? null,
      learningBehaviorInsights: parsed.learningBehaviorInsights ?? null,
    });
  } catch (err: any) {
    console.error('behavior-analysis route error:', err);
    return NextResponse.json({ error: err.message || 'Internal error' }, { status: 500 });
  }
}

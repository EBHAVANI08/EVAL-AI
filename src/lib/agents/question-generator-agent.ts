/* ─────────────────────────────────────────────────────────────────────────────
   Question Generator Agent — Agent 3 of 7
   Calls Gemini with a strict academic boundary prompt and returns raw JSON paper.
───────────────────────────────────────────────────────────────────────────── */
import type { AgentInput, AgentResult } from './types';

const MODELS = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-2.0-flash-lite'];

function buildPrompt(input: AgentInput): string {
  const {
    boardCode, curriculum, curriculumVersion, grade, gradeNum,
    domain, domainId, subjectId, subject, chapters, topics,
    examType, difficulty, duration, totalMarks, numQuestions,
    bloomsLevels, questionDistribution, examTitle, schoolName,
    includeNCERT, includeScheme, extractedContent,
  } = input;

  const chaptersText = chapters.join(', ');
  const topicsText   = topics?.length
    ? `\n\nTopics (MANDATORY — generate ONLY from these):\n${topics.join(', ')}`
    : '';
  const isMathSci = /math|chemistry|physics/i.test(subject);

  const sectionHint = questionDistribution || (() => {
    if (gradeNum <= 5) return `2 sections:\n  Section A: MCQ/Fill × 1 mark\n  Section B: Short Answer × 2 marks`;
    if (gradeNum <= 8) return `3 sections:\n  Section A: MCQ × 1m, Section B: Short × 2m, Section C: Answer × 3m`;
    return `4 sections (standard ${boardCode} pattern):\n  Section A: 20 × 1 mark (MCQ+Assertion)\n  Section B: 5 × 2 marks (VSA)\n  Section C: 6 × 3 marks (SA)\n  Section D: 4 × 5 marks (LA/Case)\n  Adjust to reach ${numQuestions}Q and ${totalMarks} marks.`;
  })();

  const answerGuide = isMathSci
    ? `For numerical/derivation questions, use "answerSteps" array — each step as a separate string.`
    : `For long answers use full paragraphs, 5-10 lines.`;

  const streamBoundary = domain ? `
══════════════════ STRICT ACADEMIC BOUNDARY ══════════════════
Board               : ${boardCode}
Curriculum          : ${curriculum}
Curriculum Version  : ${curriculumVersion}
Grade               : ${grade}
Stream              : ${domain}
Subject             : ${subject}
Subject ID          : ${subjectId}
Chapters            : ${chaptersText}${topicsText}

ABSOLUTE RULES:
❌ Do NOT use content from any subject other than: ${subject}
❌ Banned subjects for this stream: ${
  domain === 'Science' ? 'Accountancy, Business Studies, Economics, History, Political Science, Geography, Sociology' :
  domain === 'Commerce' ? 'Physics, Chemistry, Biology, History, Political Science, Geography, Sociology' :
  domain === 'Humanities' ? 'Physics, Chemistry, Biology, Accountancy, Business Studies, Economics' :
  'N/A'
}
✅ Every question MUST be from: ${subject} — Chapters: ${chaptersText}
${topics?.length ? `✅ Every question MUST be from one of these TOPICS: ${topics.join(', ')}` : ''}
══════════════════════════════════════════════════════════════` : `
RULES: ALL questions from Subject: ${subject}, Chapters: ${chaptersText}${topicsText}`;

  const qIdPrefix = subjectId.replace(/_/g,'').slice(0, 12);

  return `You are an expert ${boardCode} exam paper setter with full answer key.

Board               : ${boardCode}
Curriculum Version  : ${curriculumVersion}
Grade               : ${grade}
${domain ? `Stream              : ${domain}` : ''}
Subject             : ${subject} (ID: ${subjectId})
Chapters            : ${chaptersText}
${topics?.length ? `Topics (MANDATORY)  : ${topics.join(', ')}` : ''}
Exam Type           : ${examType}
Difficulty          : ${difficulty}
Duration            : ${duration}
Total Marks         : ${totalMarks}
Title               : ${examTitle}
${schoolName ? `School              : ${schoolName}` : ''}
${extractedContent ? `\nReference Material & Learning Outcomes:\n${extractedContent}\n` : ''}

LEARNING OUTCOMES MANDATE:
Every single question MUST align strictly with standard NCERT Learning Outcomes for the provided topics. You MUST determine the specific Learning Outcome tested by the question and output its ID or description in the "learningOutcomeIds" array.

QUESTION DISTRIBUTION:
${sectionHint}

BLOOM'S LEVELS: ${bloomsLevels.join(', ')}
${answerGuide}
${includeNCERT ? 'Add ncertRef field to each question.' : ''}
${includeScheme ? 'Add a marking scheme section at end.' : ''}

DIFFICULTY SCORES: Easy=1-35, Medium=36-65, Hard=66-100

${streamBoundary}

Return ONLY valid JSON:
{
  "metadata": {
    "boardCode": "${boardCode}",
    "curriculum": "${curriculum}",
    "curriculumVersion": "${curriculumVersion}",
    "academicYear": "${curriculumVersion}",
    "grade": "${grade}",
    "domain": ${JSON.stringify(domain ?? null)},
    "domainId": ${JSON.stringify(domainId ?? null)},
    "subject": "${subject}",
    "subjectId": "${subjectId}",
    "chapters": ${JSON.stringify(chapters)},
    "topics": ${JSON.stringify(topics ?? [])},
    "totalMarks": ${totalMarks},
    "duration": "${duration}",
    "difficulty": "${difficulty}",
    "examTitle": "${examTitle}",
    "examType": "${examType}",
    "schoolName": "${schoolName ?? ''}",
    "instructions": ["All questions are compulsory.", "Marks are shown in brackets.", "Draw diagrams wherever required."]
  },
  "sections": [{
    "name": "A",
    "label": "Multiple Choice Questions",
    "instructions": "Each question carries 1 mark.",
    "questions": [{
      "questionId": "${qIdPrefix}_Q001",
      "qNo": 1,
      "type": "mcq",
      "questionText": "...",
      "options": ["(A) ...", "(B) ...", "(C) ...", "(D) ..."],
      "maxMarks": 1,
      "chapter": "exact chapter name",
      "topic": "exact topic name or null",
      "learningOutcomeIds": [],
      "bloomsLevel": "Remember",
      "difficulty": "Easy",
      "difficultyScore": 20,
      "sourceType": "AI_GENERATED",
      "status": "draft",
      "tags": ["keyword1", "keyword2"],
      "answer": "(B) ...",
      "answerSteps": []
    }]
  }]
}

RULES:
1. MCQ: exactly 4 options (A)(B)(C)(D)
2. bloomsLevel: Remember|Understand|Apply|Analyze|Evaluate|Create
3. answer REQUIRED on every question
4. answerSteps: array (empty if not steps-based)
5. questionId: unique, increment Q001→Q002→...
6. chapter: EXACTLY matches one of the listed chapters
7. difficultyScore: Easy=1-35, Medium=36-65, Hard=66-100
8. sourceType: "AI_GENERATED", status: "draft"
9. tags: 2-4 searchable keywords
10. Sum of maxMarks = ${totalMarks}
Return ONLY JSON — no markdown, no explanation.`;
}

export async function runQuestionGeneratorAgent(input: AgentInput): Promise<AgentResult> {
  const start = Date.now();
  const agentName = 'QuestionGeneratorAgent';

  const prompt = buildPrompt(input);
  const parts: any[] = [{ text: prompt }];

  if (Array.isArray(input.filePayloads) && input.filePayloads.length > 0) {
    for (const fp of input.filePayloads.slice(0, 3)) {
      if (fp.fileUri)    parts.push({ file_data:    { mime_type: fp.mimeType, file_uri: fp.fileUri } });
      else if (fp.base64Data) parts.push({ inline_data: { mime_type: fp.mimeType, data: fp.base64Data } });
    }
  }

  for (const model of MODELS) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${input.apiKey}`;
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts }],
          generationConfig: { temperature: 0.4, maxOutputTokens: 65536 },
        }),
      });
      if (!res.ok) continue;

      const data   = await res.json();
      const raw: string = data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
      const start_ = raw.indexOf('{');
      const end_   = raw.lastIndexOf('}');
      if (start_ === -1 || end_ === -1) continue;

      const paper = JSON.parse(raw.slice(start_, end_ + 1).replace(/,\s*([}\]])/g, '$1'));
      return {
        agent: agentName, status: 'passed', durationMs: Date.now() - start,
        output: { paper, model },
      };
    } catch { continue; }
  }

  return { agent: agentName, status: 'failed', durationMs: Date.now() - start, error: 'All models failed' };
}

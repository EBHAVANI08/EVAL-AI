/**
 * Behavior Analysis Types & Local Computation Utilities
 *
 * IMPORTANT: All outputs are framed as signals/indicators, not clinical facts.
 * Graphology-based inferences are observational patterns, not validated personality diagnoses.
 */

// ─── Core Types ─────────────────────────────────────────────────────────────

export interface HandwritingFeatures {
  baselineAngle: {
    value: number;           // degrees, positive = rising
    direction: 'rising' | 'falling' | 'straight' | 'wavy';
    label: string;
  };
  slant: {
    value: 'left' | 'slight-left' | 'straight' | 'slight-right' | 'right';
    label: string;
  };
  pressure: {
    value: 'light' | 'medium' | 'heavy';
    intensity: number;       // 0–100
    label: string;
  };
  letterSize: {
    value: 'small' | 'medium' | 'large';
    variance: 'low' | 'moderate' | 'high';
    label: string;
  };
  wordSpacing: {
    value: 'narrow' | 'moderate' | 'wide';
    label: string;
  };
  lineSpacing: {
    value: 'tight' | 'moderate' | 'wide';
    consistency: 'consistent' | 'inconsistent';
    label: string;
  };
  margins: {
    left: 'narrow' | 'regular' | 'wide';
    right: 'regular' | 'irregular';
    label: string;
  };
  writingZones: {
    dominant: 'upper' | 'middle' | 'lower' | 'balanced';
    upperPercent: number;
    middlePercent: number;
    lowerPercent: number;
  };
  corrections: {
    frequency: 'low' | 'moderate' | 'high';
    pattern: 'scattered' | 'concentrated-start' | 'concentrated-end' | 'none';
    label: string;
  };
  strokeRhythm: {
    consistency: 'fluid' | 'moderate' | 'irregular';
    flowPattern: 'consistent' | 'varies-by-section' | 'declining';
    label: string;
  };
}

export interface PersonalitySignal {
  name: string;
  score: number;           // 0–100 (signal strength, NOT a validated score)
  signal: 'low' | 'moderate-low' | 'moderate' | 'moderate-high' | 'high';
  indicator: string;       // human-readable explanation of WHY this signal was detected
}

export interface PersonalityProfile {
  traits: PersonalitySignal[];
  communicationStyle: 'expressive' | 'reserved' | 'analytical' | 'mixed';
  thinkingStyle: 'logical' | 'emotional' | 'intuitive' | 'analytical-emotional' | 'mixed';
  workStyle: 'organized' | 'spontaneous' | 'structured-with-creative-bursts' | 'mixed';
  socialStyle: 'introvert' | 'balanced' | 'extrovert';
}

export interface EmotionalSignals {
  stressIndicators: {
    level: 'low' | 'moderate' | 'high';
    signals: string[];
  };
  confidenceIndicators: {
    level: 'low' | 'medium' | 'high';
    signals: string[];
  };
  hesitationIndicators: {
    level: 'low' | 'low-moderate' | 'moderate' | 'high';
    signals: string[];
  };
  overallEmotionalTone: string;
}

export interface QuestionBehavior {
  qNo: string;
  section: string;
  difficulty: 'easy' | 'medium' | 'hard';
  answerLengthStatus: 'appropriate' | 'over-explained' | 'under-answered';
  ocrWordCount: number;
  expectedWordRange: { min: number; max: number };
  performanceCategory: 'strong' | 'moderate' | 'weak';
}

export interface SubjectBehavior {
  easyTopics: string[];
  mediumTopics: string[];
  difficultTopics: string[];
  avgScore: number;
  avgConfidence: number;
  diagramUsageRate: number;
  answerLengthPattern: 'concise' | 'verbose' | 'inconsistent' | 'appropriate';
  strengthAreas: string[];
  weaknessAreas: string[];
}

export interface LearningBehaviorInsights {
  subjectSpecific: string;
  answerPatterns: string;
  studyStyleIndicators: string[];
  examStrategy: string;
  gradeAppropriateObservations: string[];
}

export interface BehaviorAnalysis {
  generatedAt: string;
  gradeLevel: string;
  subject: string;

  // Handwriting features (from Gemini visual analysis)
  handwritingFeatures: HandwritingFeatures | null;

  // Personality signals (from Gemini — framed as indicators only)
  personalityProfile: PersonalityProfile | null;

  // Emotional state signals
  emotionalSignals: EmotionalSignals | null;

  // Per-question computed locally
  questionBehaviors: QuestionBehavior[];

  // Subject-level computed locally
  subjectBehavior: SubjectBehavior;

  // Learning behavior (combined analysis)
  learningBehaviorInsights: LearningBehaviorInsights | null;

  // High-level summary
  overallInsights: {
    strengths: string[];
    growthAreas: string[];
    behavioralPatterns: string[];
    recommendations: string[];
    riskFlags: string[];
  };

  // Historical trend (populated when historical evals exist)
  trend: {
    evaluationsAnalyzed: number;
    recentScores: number[];
    improvementRate: number;
    consistencyScore: number;
  } | null;
}

// ─── Word Count → Expected Length Mapping ───────────────────────────────────

/** Returns expected word count range for a question based on marks */
export function expectedWordRange(maxMarks: number): { min: number; max: number } {
  if (maxMarks <= 0) return { min: 0, max: 0 };
  if (maxMarks === 1) return { min: 8, max: 30 };
  if (maxMarks === 2) return { min: 30, max: 70 };
  if (maxMarks === 3) return { min: 50, max: 100 };
  if (maxMarks === 4) return { min: 80, max: 150 };
  if (maxMarks === 5) return { min: 120, max: 220 };
  return { min: maxMarks * 25, max: maxMarks * 50 };
}

// ─── Local Computation ───────────────────────────────────────────────────────

interface EvalQuestion {
  qNo: string;
  section: string;
  ocrText: string;
  maxMarks: number;
  aiScore: number;
  aiConfidence: number;
  semanticSimilarity?: number;
  hasDiagram?: boolean;
  questionText?: string;
  aiReasoning?: string;
}

interface StudentInfo {
  name?: string;
  rollNo?: string;
  class?: string;
  subject?: string;
}

function wordCount(text: string): number {
  if (!text || text === '[No answer]') return 0;
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function difficulty(q: EvalQuestion): 'easy' | 'medium' | 'hard' {
  const scoreRatio = q.maxMarks > 0 ? q.aiScore / q.maxMarks : 0;
  const sem = q.semanticSimilarity ?? 70;
  const conf = q.aiConfidence ?? 70;

  const score =
    (scoreRatio >= 0.8 ? 2 : scoreRatio >= 0.5 ? 1 : 0) +
    (sem >= 80 ? 2 : sem >= 60 ? 1 : 0) +
    (conf >= 85 ? 2 : conf >= 70 ? 1 : 0);

  if (score >= 5) return 'easy';
  if (score >= 2) return 'medium';
  return 'hard';
}

function answerLengthStatus(q: EvalQuestion): 'appropriate' | 'over-explained' | 'under-answered' {
  const words = wordCount(q.ocrText);
  const range = expectedWordRange(q.maxMarks);
  if (words === 0 || range.max === 0) return 'appropriate';
  if (words > range.max * 1.6) return 'over-explained';
  if (words < range.min * 0.45 && q.aiScore < q.maxMarks) return 'under-answered';
  return 'appropriate';
}

function gradeObservations(gradeClass: string): string[] {
  const g = parseInt(gradeClass.replace(/\D/g, ''), 10) || 0;
  if (g <= 5) return [
    'Focus on sentence construction and writing maturity',
    'Handwriting development is a key indicator at this grade',
    'Answer completeness more important than structure',
  ];
  if (g <= 8) return [
    'Concept understanding is the primary signal at this grade',
    'Answer structure and paragraph formation expected',
    'Diagram usage indicates visual learning strength',
  ];
  if (g <= 10) return [
    'Exam strategy and key-point selection are critical',
    'Time management signals visible in answer length patterns',
    'Ability to summarize indicates board exam readiness',
  ];
  return [
    'Critical thinking and analytical depth expected',
    'Answer length precision reflects exam strategy',
    'Multi-step reasoning in science/maths is a key signal',
    'Confidence in long-answer format affects final performance',
  ];
}

/** Compute behavior metrics locally from evaluation data — no API call needed */
export function computeBehaviorMetrics(
  questions: EvalQuestion[],
  studentInfo: StudentInfo,
  historicalScores?: number[],
): Omit<BehaviorAnalysis, 'handwritingFeatures' | 'personalityProfile' | 'emotionalSignals' | 'learningBehaviorInsights'> {
  const questionBehaviors: QuestionBehavior[] = questions.map((q) => ({
    qNo: q.qNo,
    section: q.section ?? '',
    difficulty: difficulty(q),
    answerLengthStatus: answerLengthStatus(q),
    ocrWordCount: wordCount(q.ocrText),
    expectedWordRange: expectedWordRange(q.maxMarks),
    performanceCategory:
      q.maxMarks > 0 && q.aiScore / q.maxMarks >= 0.75
        ? 'strong'
        : q.maxMarks > 0 && q.aiScore / q.maxMarks >= 0.5
          ? 'moderate'
          : 'weak',
  }));

  // Subject-level aggregates
  const totalQ = questions.length;
  const avgScore = totalQ > 0
    ? Math.round(questions.reduce((s, q) => s + (q.maxMarks > 0 ? (q.aiScore / q.maxMarks) * 100 : 0), 0) / totalQ)
    : 0;
  const avgConfidence = totalQ > 0
    ? Math.round(questions.reduce((s, q) => s + (q.aiConfidence ?? 70), 0) / totalQ)
    : 0;
  const diagramCount = questions.filter((q) => q.hasDiagram).length;

  const easy = questionBehaviors.filter((q) => q.difficulty === 'easy').map((q) => `Q.${q.qNo}`);
  const medium = questionBehaviors.filter((q) => q.difficulty === 'medium').map((q) => `Q.${q.qNo}`);
  const hard = questionBehaviors.filter((q) => q.difficulty === 'hard').map((q) => `Q.${q.qNo}`);

  const overExplained = questionBehaviors.filter((q) => q.answerLengthStatus === 'over-explained').length;
  const underAnswered = questionBehaviors.filter((q) => q.answerLengthStatus === 'under-answered').length;
  const answerLengthPattern =
    overExplained > totalQ * 0.4 ? 'verbose'
    : underAnswered > totalQ * 0.4 ? 'concise'
    : overExplained + underAnswered > totalQ * 0.5 ? 'inconsistent'
    : 'appropriate';

  const subjectBehavior: SubjectBehavior = {
    easyTopics: easy,
    mediumTopics: medium,
    difficultTopics: hard,
    avgScore,
    avgConfidence,
    diagramUsageRate: totalQ > 0 ? Math.round((diagramCount / totalQ) * 100) : 0,
    answerLengthPattern,
    strengthAreas: easy.slice(0, 4),
    weaknessAreas: hard.slice(0, 4),
  };

  // Risk flags
  const riskFlags: string[] = [];
  const flaggedQ = questions.filter((q) => q.aiConfidence < 70).length;
  if (flaggedQ / totalQ > 0.3) riskFlags.push('High proportion of low-confidence answers — handwriting clarity may need attention');
  if (underAnswered / totalQ > 0.4) riskFlags.push('Consistent under-answering — possible time pressure or incomplete recall');
  if (overExplained / totalQ > 0.4) riskFlags.push('Frequent over-explanation in short answers — difficulty identifying key points');
  if (hard.length > totalQ * 0.5) riskFlags.push('More than half the questions marked as difficult — focused revision recommended');
  if (avgConfidence < 65) riskFlags.push('Low average AI confidence — consider submitting clearer scans for better analysis');

  // Strengths & growth
  const strengths: string[] = [];
  const growthAreas: string[] = [];
  if (easy.length > 0) strengths.push(`Strong performance in ${easy.slice(0, 3).join(', ')}`);
  if (avgScore >= 70) strengths.push('Above-average conceptual understanding overall');
  if (diagramUsageRate(diagramCount, totalQ) > 30) strengths.push('Good use of diagrams to support explanations');
  if (avgScore < 60) growthAreas.push('Overall concept recall needs strengthening');
  if (hard.length > 0) growthAreas.push(`Focus revision on ${hard.slice(0, 3).join(', ')}`);
  if (answerLengthPattern === 'verbose') growthAreas.push('Practice summarizing answers to key points');
  if (answerLengthPattern === 'concise') growthAreas.push('Develop confidence in writing detailed explanations');

  // Trend
  let trend: BehaviorAnalysis['trend'] = null;
  if (historicalScores && historicalScores.length >= 2) {
    const first = historicalScores[0];
    const last = historicalScores[historicalScores.length - 1];
    const improvementRate = first > 0 ? Math.round(((last - first) / first) * 100) : 0;
    const mean = historicalScores.reduce((a, b) => a + b, 0) / historicalScores.length;
    const variance = historicalScores.reduce((s, v) => s + Math.pow(v - mean, 2), 0) / historicalScores.length;
    const stdDev = Math.sqrt(variance);
    trend = {
      evaluationsAnalyzed: historicalScores.length,
      recentScores: historicalScores,
      improvementRate,
      consistencyScore: Math.max(0, Math.round(100 - stdDev * 2)),
    };
  }

  return {
    generatedAt: new Date().toISOString(),
    gradeLevel: studentInfo.class ?? 'Unknown',
    subject: studentInfo.subject ?? 'Unknown',
    questionBehaviors,
    subjectBehavior,
    overallInsights: {
      strengths,
      growthAreas,
      behavioralPatterns: [
        answerLengthPattern !== 'appropriate'
          ? `Answer length pattern: ${answerLengthPattern}`
          : 'Answer length generally appropriate',
        `Difficulty distribution: ${easy.length} easy / ${medium.length} medium / ${hard.length} hard`,
      ].filter(Boolean),
      recommendations: buildRecommendations(answerLengthPattern, hard.length, avgScore, studentInfo.class ?? ''),
      riskFlags,
    },
    trend,
  };
}

function diagramUsageRate(count: number, total: number) {
  return total > 0 ? Math.round((count / total) * 100) : 0;
}

function buildRecommendations(
  lengthPattern: string,
  hardCount: number,
  avgScore: number,
  gradeClass: string,
): string[] {
  const recs: string[] = [];
  if (lengthPattern === 'verbose') recs.push('Practice writing 1-line summaries before each long answer');
  if (lengthPattern === 'concise') recs.push('Use structured templates (Point → Explanation → Example) for longer answers');
  if (hardCount > 0) recs.push('Focus revision on difficult topics using past paper questions');
  if (avgScore < 60) recs.push('Schedule subject-specific concept review sessions');
  recs.push('Time-based mock tests to improve answer pacing');

  const g = parseInt(gradeClass.replace(/\D/g, ''), 10) || 0;
  if (g >= 9) recs.push('Practice board-style answer writing with mark schemes');
  if (g >= 11) recs.push('Work on multi-step derivation problems for science and maths');

  return recs.slice(0, 5);
}

/** Compute grade-appropriate observations */
export function getGradeObservations(gradeClass: string): string[] {
  return gradeObservations(gradeClass);
}

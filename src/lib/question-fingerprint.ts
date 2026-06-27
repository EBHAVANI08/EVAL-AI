/* ─────────────────────────────────────────────────────────────────────────────
   Question Fingerprint Utility
   Generates a deterministic SHA-256 fingerprint for a question text.
   Used for duplicate detection and similarity scoring.
───────────────────────────────────────────────────────────────────────────── */
import crypto from 'crypto';

/**
 * Normalise question text before hashing.
 * - Lowercase
 * - Remove punctuation / whitespace differences
 * - Remove common filler words
 */
function normalise(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')  // remove punctuation
    .replace(/\s+/g, ' ')           // collapse whitespace
    .trim();
}

/**
 * Generate SHA-256 fingerprint of a question text.
 * Two questions with identical normalised text will have the same fingerprint.
 */
export function generateQuestionFingerprint(questionText: string): string {
  const normalised = normalise(questionText);
  return crypto.createHash('sha256').update(normalised, 'utf8').digest('hex');
}

/**
 * Compute a simple Jaccard-similarity score (0–100) between two question texts.
 * Used for near-duplicate detection when fingerprints don't match exactly.
 */
export function computeSimilarityScore(textA: string, textB: string): number {
  const wordsA = new Set(normalise(textA).split(' ').filter((w) => w.length > 2));
  const wordsB = new Set(normalise(textB).split(' ').filter((w) => w.length > 2));
  if (wordsA.size === 0 || wordsB.size === 0) return 0;

  let intersection = 0;
  wordsA.forEach((w) => { if (wordsB.has(w)) intersection++; });
  const union = wordsA.size + wordsB.size - intersection;
  return Math.round((intersection / union) * 100);
}

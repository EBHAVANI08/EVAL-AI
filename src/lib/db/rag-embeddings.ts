/* ─────────────────────────────────────────────────────────────────────────────
   RAG Embeddings Utility — Phase 8
   Handles text chunking and embedding generation via Google GenAI.
───────────────────────────────────────────────────────────────────────────── */

/**
 * Generate vector embeddings for a given text using text-embedding-004.
 */
export async function generateEmbedding(text: string, apiKey: string): Promise<number[]> {
  if (!apiKey) throw new Error('API key is required for embeddings');

  const url = `https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=${apiKey}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'models/text-embedding-004',
      content: { parts: [{ text }] },
    }),
  });

  if (!res.ok) {
    throw new Error(`Embedding failed: ${res.statusText}`);
  }

  const data = await res.json();
  return data.embedding?.values ?? [];
}

/**
 * Schema mapping for MongoDB Atlas Vector Search
 * Collection: `curriculum_chunks`
 * Index Name: `vector_index`
 * 
 * {
 *   "fields": [
 *     {
 *       "numDimensions": 768,
 *       "path": "embedding",
 *       "similarity": "cosine",
 *       "type": "vector"
 *     },
 *     { "path": "subjectId", "type": "filter" },
 *     { "path": "chapter", "type": "filter" },
 *     { "path": "topic", "type": "filter" }
 *   ]
 * }
 */
export interface CurriculumChunk {
  _id?: string;
  subjectId: string;
  chapter: string;
  topic: string;
  learningOutcomeId?: string;
  text: string;
  embedding: number[]; // 768 dimensions for text-embedding-004
}

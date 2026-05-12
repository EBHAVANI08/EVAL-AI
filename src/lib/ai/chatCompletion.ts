import { callAIEndpoint } from './aiClient';

const ENDPOINT_PATH = '/api/ai/chat-completion';

function getEndpointUrl() {
  const base = process.env.NEXT_PUBLIC_SITE_URL || '';
  return `${base}${ENDPOINT_PATH}`;
}

export async function getChatCompletion(
  provider: string,
  model: string,
  messages: object[],
  parameters: object = {}
) {
  return callAIEndpoint(ENDPOINT_PATH, {
    provider,
    model,
    messages,
    stream: false,
    parameters,
  });
}

export async function getStreamingChatCompletion(
  provider: string,
  model: string,
  messages: object[],
  onChunk: (chunk: any) => void,
  onComplete: () => void,
  onError: (error: Error) => void,
  parameters: object = {}
) {
  const ENDPOINT = getEndpointUrl();

  try {
    const response = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ provider, model, messages, stream: true, parameters }),
    });

    // Guard against HTML error pages
    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('application/json') && !contentType.includes('text/event-stream')) {
      throw new Error(`API returned non-JSON response (status ${response.status})`);
    }

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || `HTTP error: ${response.status}`);
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error('Response body is not readable');

    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const data = JSON.parse(line.slice(6));
            if (data.type === 'chunk' && data.chunk) {
              onChunk(data.chunk);
            } else if (data.type === 'done') onComplete();
            else if (data.type === 'error') {
              console.error('API Route Error:', {
                error: data.error,
                details: data.details,
              });
              onError(new Error(data.error));
            }
          } catch {
            // Skip invalid JSON
          }
        }
      }
    }
  } catch (error) {
    console.error('Streaming error:', error);
    onError(error instanceof Error ? error : new Error('Streaming error'));
  }
}

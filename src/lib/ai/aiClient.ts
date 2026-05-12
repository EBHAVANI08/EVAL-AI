const BASE_URL =
  typeof window !== 'undefined' ? '' : process.env.NEXT_PUBLIC_SITE_URL || '';

export async function callAIEndpoint(endpoint: string, payload: object) {
  const url = endpoint.startsWith('http') ? endpoint : `${BASE_URL}${endpoint}`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    // Guard against HTML error pages (e.g. 404 from wrong domain)
    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      throw new Error(`API returned non-JSON response (status ${response.status}). Check that the API route exists and the app URL is correct.`);
    }

    const data = await response.json();

    if (!response.ok || data.error) {
      console.error('API Route Error:', {
        error: data.error,
        details: data.details,
      });
      throw new Error(data.error || `Request failed: ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error('API request error:', error);
    throw error;
  }
}

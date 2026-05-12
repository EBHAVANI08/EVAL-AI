import { NextRequest, NextResponse } from 'next/server';

const UPLOAD_URL =
  'https://generativelanguage.googleapis.com/upload/v1beta/files';

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'GEMINI_API_KEY is not configured' }, { status: 400 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const mimeType = file.type || 'application/pdf';
    const fileBuffer = await file.arrayBuffer();
    const byteLength = fileBuffer.byteLength;

    // Step 1: initiate resumable upload
    const initRes = await fetch(`${UPLOAD_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'X-Goog-Upload-Protocol': 'resumable',
        'X-Goog-Upload-Command': 'start',
        'X-Goog-Upload-Header-Content-Length': String(byteLength),
        'X-Goog-Upload-Header-Content-Type': mimeType,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ file: { display_name: file.name || 'document' } }),
    });

    if (!initRes.ok) {
      const t = await initRes.text().catch(() => '');
      return NextResponse.json(
        { error: `File upload init failed: ${initRes.status}`, details: t },
        { status: 502 }
      );
    }

    const uploadUrl = initRes.headers.get('X-Goog-Upload-URL');
    if (!uploadUrl) {
      return NextResponse.json({ error: 'Gemini did not return an upload URL' }, { status: 502 });
    }

    // Step 2: upload the raw bytes
    const uploadRes = await fetch(uploadUrl, {
      method: 'POST',
      headers: {
        'Content-Length': String(byteLength),
        'X-Goog-Upload-Offset': '0',
        'X-Goog-Upload-Command': 'upload, finalize',
      },
      body: fileBuffer,
    });

    if (!uploadRes.ok) {
      const t = await uploadRes.text().catch(() => '');
      return NextResponse.json(
        { error: `File upload failed: ${uploadRes.status}`, details: t },
        { status: 502 }
      );
    }

    const data = await uploadRes.json();
    const fileUri: string | undefined = data.file?.uri;
    if (!fileUri) {
      return NextResponse.json({ error: 'No file URI returned from Gemini' }, { status: 502 });
    }

    return NextResponse.json({ fileUri, mimeType });
  } catch (err: any) {
    console.error('gemini-upload error:', err);
    return NextResponse.json({ error: err.message || 'Upload failed' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';

const BACKEND_API_URL = (process.env.BACKEND_API_URL || 'http://localhost:3001').replace(/\/$/, '');

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Forward the file to the backend API
    const backendFormData = new FormData();
    backendFormData.append('file', file);

    const authorization = request.headers.get('authorization');
    const headers = new Headers();
    if (authorization) headers.set('Authorization', authorization);

    const backendResponse = await fetch(`${BACKEND_API_URL}/api/analyze-log`, {
      method: 'POST',
      headers,
      body: backendFormData,
    });

    if (!backendResponse.ok) {
      const error = await backendResponse.json();
      throw new Error(error.error || 'Failed to process file');
    }

    const data = await backendResponse.json();
    return NextResponse.json(data);
  } catch (error: unknown) {
    console.error('Error processing file upload:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to process file';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

import { NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import path from 'path';

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

    const backendResponse = await fetch('http://localhost:3001/api/analyze-log', {
      method: 'POST',
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

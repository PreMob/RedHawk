import { NextRequest, NextResponse } from 'next/server';

// The backend URL where we send the request
const BACKEND_API_URL = process.env.BACKEND_API_URL || 'http://localhost:3001';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Make sure the target_url is provided
    if (!body.target_url) {
      return NextResponse.json(
        { error: 'Missing target_url parameter' },
        { status: 400 }
      );
    }

    // Forward the request to the backend
    const backendResponse = await fetch(`${BACKEND_API_URL}/api/scan/scan-url`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    // Get the response data
    const responseData = await backendResponse.json();

    // Return the response from the backend
    return NextResponse.json(responseData, {
      status: backendResponse.status,
    });
  } catch (error) {
    console.error('Error in URL scan route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 
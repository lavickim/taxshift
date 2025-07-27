import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL =
  process.env.JAVA_API_BASE_URL || 'http://localhost:8080/mshift-api';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // mshift-api의 키워드 시스템에 요청
    const response = await fetch(`${API_BASE_URL}/v2/keyword-system/classify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const result = await response.json();
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error calling classification API:', error);
    return NextResponse.json(
      { error: 'Failed to classify transaction' },
      { status: 500 }
    );
  }
}

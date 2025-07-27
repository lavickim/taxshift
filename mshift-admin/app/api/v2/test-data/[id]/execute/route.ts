import { NextRequest, NextResponse } from 'next/server';

const BACKEND_BASE_URL = process.env.BACKEND_URL || 'http://localhost:8080';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const response = await fetch(`${BACKEND_BASE_URL}/v2/test-data/${params.id}/execute`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: '단일 테스트 실행 실패', message: data.message || 'Unknown error' },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Single test execution API proxy error:', error);
    return NextResponse.json(
      { error: '서버 오류', message: 'Internal server error' },
      { status: 500 }
    );
  }
}
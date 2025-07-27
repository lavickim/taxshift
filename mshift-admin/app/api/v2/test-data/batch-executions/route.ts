import { NextRequest, NextResponse } from 'next/server';

const BACKEND_BASE_URL = process.env.BACKEND_URL || 'http://localhost:8080';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page') || '0';
    const size = searchParams.get('size') || '20';

    const params = new URLSearchParams({ page, size });

    const response = await fetch(`${BACKEND_BASE_URL}/v2/test-data/batch-executions?${params}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: '배치 실행 이력 조회 실패', message: data.message || 'Unknown error' },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Batch executions API proxy error:', error);
    return NextResponse.json(
      { error: '서버 오류', message: 'Internal server error' },
      { status: 500 }
    );
  }
}
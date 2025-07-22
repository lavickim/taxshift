import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8080';

export async function GET(request: NextRequest) {
  try {
    const response = await fetch(`${BACKEND_URL}/api/v2/accounting/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Backend response: ${response.status}`);
    }

    const data = await response.json();
    
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error('헬스체크 API 오류:', error);
    return NextResponse.json(
      { 
        status: 'unhealthy',
        service: 'accounting-engine', 
        error: '백엔드 서버 연결 실패',
        timestamp: Date.now()
      },
      { status: 500 }
    );
  }
}
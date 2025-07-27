import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL =
  process.env.BACKEND_URL || 'http://localhost:8080/mshift-api';

export async function GET(request: NextRequest) {
  try {
    const response = await fetch(
      `${BACKEND_URL}/api/v2/accounting/chart-of-accounts`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Backend response: ${response.status}`);
    }

    const data = await response.json();

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error('계정과목 조회 API 오류:', error);
    return NextResponse.json(
      { error: '계정과목 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

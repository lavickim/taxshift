import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL =
  process.env.BACKEND_URL || 'http://localhost:8080/mshift-api';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const response = await fetch(
      `${BACKEND_URL}/mshift-api/api/v2/accounting/process-transaction`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          message: data.message || '분개 처리 중 오류가 발생했습니다.',
          error: data,
        },
        { status: response.status }
      );
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error('거래→분개 처리 API 오류:', error);
    return NextResponse.json(
      {
        success: false,
        message: '서버 연결 오류가 발생했습니다.',
        error: error.message,
      },
      { status: 500 }
    );
  }
}

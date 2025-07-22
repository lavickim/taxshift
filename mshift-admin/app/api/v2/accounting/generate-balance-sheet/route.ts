import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8080';

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');
    const asOfDate = searchParams.get('asOfDate');

    if (!companyId || !asOfDate) {
      return NextResponse.json(
        { error: 'companyId와 asOfDate 파라미터가 필요합니다.' },
        { status: 400 }
      );
    }

    const params = new URLSearchParams({
      companyId,
      asOfDate
    });

    const response = await fetch(`${BACKEND_URL}/api/v2/accounting/generate-balance-sheet?${params}`, {
      method: 'POST',
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
    console.error('대차대조표 생성 API 오류:', error);
    return NextResponse.json(
      { error: '대차대조표 생성 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
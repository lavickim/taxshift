import { NextRequest, NextResponse } from 'next/server';

// 배치 상태 조회 (batch-test/route.ts에서 분리)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const batchId = searchParams.get('batchId');
    
    if (!batchId) {
      return NextResponse.json(
        { error: 'Batch ID is required' },
        { status: 400 }
      );
    }

    // 실제 구현에서는 Redis나 데이터베이스에서 상태를 조회
    // 현재는 간단히 메모리에서 조회
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/brands/batch-test?batchId=${batchId}`);
    
    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch batch status' },
        { status: 500 }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Error fetching batch status:', error);
    return NextResponse.json(
      { error: 'Failed to fetch batch status' },
      { status: 500 }
    );
  }
}
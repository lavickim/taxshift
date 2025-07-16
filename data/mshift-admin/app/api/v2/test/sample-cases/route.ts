import { NextRequest, NextResponse } from 'next/server';

const JAVA_API_BASE_URL = process.env.JAVA_API_BASE_URL || 'http://localhost:8080';

export async function GET(request: NextRequest) {
  try {
    console.log('GET /api/v2/test/sample-cases - 샘플 테스트 케이스 조회');
    
    const response = await fetch(`${JAVA_API_BASE_URL}/api/api/v2/test/sample-cases`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Java API 오류:', response.status, errorText);
      return NextResponse.json(
        { error: `백엔드 API 오류: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('샘플 테스트 케이스 조회 성공:', data.length, '개');
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('샘플 테스트 케이스 조회 실패:', error);
    return NextResponse.json(
      { error: '샘플 테스트 케이스를 조회하는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
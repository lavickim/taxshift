import { NextRequest, NextResponse } from 'next/server';

const JAVA_API_BASE_URL = process.env.JAVA_API_BASE_URL || 'http://localhost:8080';

export async function POST(request: NextRequest) {
  try {
    console.log('POST /api/v2/tag-mapping/refresh-cache - 캐시 새로고침');
    
    const response = await fetch(`${JAVA_API_BASE_URL}/api/api/v2/tag-mapping/refresh-cache`, {
      method: 'POST',
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

    const responseText = await response.text();
    console.log('캐시 새로고침 성공:', responseText);
    
    return NextResponse.json({ message: responseText });
  } catch (error) {
    console.error('캐시 새로고침 실패:', error);
    return NextResponse.json(
      { error: '캐시를 새로고침하는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
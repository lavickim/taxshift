import { NextRequest, NextResponse } from 'next/server';

const JAVA_API_BASE_URL = process.env.JAVA_API_BASE_URL || 'http://localhost:8080';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('POST /api/v2/tag-mapping/keyword-tag-mappings - 키워드-태그 매핑 생성:', body);

    // 요청 데이터 검증
    const { keywordGroupId, tagId, confidenceScore, priority, contextRules } = body;
    
    if (!keywordGroupId || !tagId) {
      return NextResponse.json(
        { error: '키워드 그룹 ID와 태그 ID는 필수입니다.' },
        { status: 400 }
      );
    }

    const response = await fetch(`${JAVA_API_BASE_URL}/api/api/v2/tag-mapping/keyword-tag-mappings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        keywordGroupId,
        tagId,
        confidenceScore: confidenceScore || 0.8,
        priority: priority || 1,
        contextRules: contextRules || null
      }),
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
    console.log('키워드-태그 매핑 생성 성공:', data);
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('키워드-태그 매핑 생성 실패:', error);
    return NextResponse.json(
      { error: '키워드-태그 매핑을 생성하는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
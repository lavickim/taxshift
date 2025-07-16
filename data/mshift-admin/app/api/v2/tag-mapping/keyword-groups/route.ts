import { NextRequest, NextResponse } from 'next/server';

const JAVA_API_BASE_URL = process.env.JAVA_API_BASE_URL || 'http://localhost:8080';

export async function GET(request: NextRequest) {
  try {
    console.log('GET /api/v2/tag-mapping-mgmt/keyword-groups - 키워드 그룹 목록 조회');
    
    const response = await fetch(`${JAVA_API_BASE_URL}/api/v2/tag-mapping-mgmt/keyword-groups`, {
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
    console.log('키워드 그룹 조회 성공:', data.length, '개');
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('키워드 그룹 조회 실패:', error);
    return NextResponse.json(
      { error: '키워드 그룹을 조회하는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('POST /api/v2/tag-mapping-mgmt/keyword-groups - 키워드 그룹 생성:', body);

    // 요청 데이터 검증
    const { groupName, primaryKeyword, synonyms, category, confidenceBase } = body;
    
    if (!groupName || !primaryKeyword || !category) {
      return NextResponse.json(
        { error: '필수 필드가 누락되었습니다.' },
        { status: 400 }
      );
    }

    const response = await fetch(`${JAVA_API_BASE_URL}/api/v2/tag-mapping-mgmt/keyword-groups`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        groupName,
        primaryKeyword,
        synonyms: synonyms || [],
        category,
        confidenceBase: confidenceBase || 0.7
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
    console.log('키워드 그룹 생성 성공:', data);
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('키워드 그룹 생성 실패:', error);
    return NextResponse.json(
      { error: '키워드 그룹을 생성하는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
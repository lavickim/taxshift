import { NextRequest, NextResponse } from 'next/server';

const JAVA_API_BASE_URL =
  process.env.JAVA_API_BASE_URL || 'http://localhost:8080/mshift-api';

export async function GET(request: NextRequest) {
  try {
    console.log(
      'GET /api/v2/tag-mapping-mgmt/tag-account-mappings - 태그-계정과목 매핑 목록 조회'
    );

    const response = await fetch(
      `${JAVA_API_BASE_URL}/v2/tag-mapping-mgmt/tag-account-mappings`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Java API 오류:', response.status, errorText);
      return NextResponse.json(
        { error: `백엔드 API 오류: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('태그-계정과목 매핑 조회 성공:', data.length, '개');

    return NextResponse.json(data);
  } catch (error) {
    console.error('태그-계정과목 매핑 조회 실패:', error);
    return NextResponse.json(
      { error: '태그-계정과목 매핑을 조회하는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log(
      'POST /api/v2/tag-mapping-mgmt/tag-account-mappings - 태그-계정과목 매핑 생성:',
      body
    );

    // 요청 데이터 검증
    const {
      tagId,
      accountCode,
      accountName,
      mappingCondition,
      isDefault,
      priority,
      confidenceBoost,
    } = body;

    if (!tagId || !accountCode || !accountName) {
      return NextResponse.json(
        { error: '태그 ID, 계정과목 코드, 계정과목명은 필수입니다.' },
        { status: 400 }
      );
    }

    const response = await fetch(
      `${JAVA_API_BASE_URL}/v2/tag-mapping-mgmt/tag-account-mappings`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tagId,
          accountCode,
          accountName,
          mappingCondition: mappingCondition || null,
          isDefault: isDefault || false,
          priority: priority || 1,
          confidenceBoost: confidenceBoost || 0,
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Java API 오류:', response.status, errorText);
      return NextResponse.json(
        { error: `백엔드 API 오류: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('태그-계정과목 매핑 생성 성공:', data);

    return NextResponse.json(data);
  } catch (error) {
    console.error('태그-계정과목 매핑 생성 실패:', error);
    return NextResponse.json(
      { error: '태그-계정과목 매핑을 생성하는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

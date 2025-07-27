import { NextRequest, NextResponse } from 'next/server';

const JAVA_API_BASE_URL =
  process.env.JAVA_API_BASE_URL || 'http://localhost:8080/mshift-api';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const body = await request.json();
    const id = resolvedParams.id;

    console.log(
      `PUT /api/v2/tag-mapping-mgmt/keyword-groups/${id} - 키워드 그룹 수정:`,
      body
    );

    // 요청 데이터 검증
    const {
      groupName,
      primaryKeyword,
      synonyms,
      category,
      confidenceBase,
      isActive,
    } = body;

    if (!groupName || !primaryKeyword || !category) {
      return NextResponse.json(
        { error: '필수 필드가 누락되었습니다.' },
        { status: 400 }
      );
    }

    const response = await fetch(
      `${JAVA_API_BASE_URL}/v2/tag-mapping-mgmt/keyword-groups/${id}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          groupName,
          primaryKeyword,
          synonyms: synonyms || [],
          category,
          confidenceBase: confidenceBase || 0.7,
          isActive: isActive !== undefined ? isActive : true,
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
    console.log('키워드 그룹 수정 성공:', data);

    return NextResponse.json(data);
  } catch (error) {
    console.error('키워드 그룹 수정 실패:', error);
    return NextResponse.json(
      { error: '키워드 그룹을 수정하는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const id = resolvedParams.id;
    console.log(
      `DELETE /api/v2/tag-mapping-mgmt/keyword-groups/${id} - 키워드 그룹 삭제`
    );

    const response = await fetch(
      `${JAVA_API_BASE_URL}/v2/tag-mapping-mgmt/keyword-groups/${id}`,
      {
        method: 'DELETE',
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

    // DELETE 요청은 보통 텍스트 응답을 반환
    const responseText = await response.text();
    console.log('키워드 그룹 삭제 성공:', responseText);

    return NextResponse.json({ message: responseText });
  } catch (error) {
    console.error('키워드 그룹 삭제 실패:', error);
    return NextResponse.json(
      { error: '키워드 그룹을 삭제하는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

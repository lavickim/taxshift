import { NextRequest, NextResponse } from 'next/server';

const JAVA_API_BASE_URL = process.env.JAVA_API_BASE_URL || 'http://localhost:8080/api';

/**
 * 요청 본문 검증
 */
function validateRequest(body: any): { isValid: boolean; error?: string } {
  if (!body || typeof body !== 'object') {
    return { isValid: false, error: '요청 본문이 올바르지 않습니다' };
  }

  if (!('text' in body)) {
    return { isValid: false, error: 'text 필드는 필수입니다' };
  }

  if (typeof body.text !== 'string') {
    return { isValid: false, error: 'text 필드는 문자열이어야 합니다' };
  }

  if (body.text.trim() === '') {
    return { isValid: false, error: 'text 필드는 비어있을 수 없습니다' };
  }

  return { isValid: true };
}

/**
 * POST /api/regex/match
 * 텍스트를 받아서 정규식 규칙으로 매칭하고 카테고리 분류 결과를 반환
 * Java API 서버를 통해 처리
 */
export async function POST(request: NextRequest) {
  try {
    // JSON 파싱
    let body;
    try {
      body = await request.json();
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          error: 'JSON 파싱 오류: 요청 본문이 유효한 JSON이 아닙니다'
        },
        { 
          status: 400,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    // 요청 유효성 검증
    const validation = validateRequest(body);
    if (!validation.isValid) {
      return NextResponse.json(
        {
          success: false,
          error: validation.error
        },
        { 
          status: 400,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    const { text, category } = body;

    // Java API로 요청 전송
    try {
      const response = await fetch(`${JAVA_API_BASE_URL}/rule-engine/match`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputText: text,
          category: category,
          returnAllMatches: true
        }),
      });

      if (!response.ok) {
        throw new Error(`Java API error: ${response.status}`);
      }

      const javaResult = await response.json();

      // 성공 응답 - 원본 Java API 응답을 그대로 전달
      return NextResponse.json(
        {
          success: true,
          response: javaResult
        },
        { 
          status: 200,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

    } catch (error) {
      console.error('Java API 호출 오류:', error);
      return NextResponse.json(
        {
          success: false,
          error: '규칙 엔진 서비스에 연결할 수 없습니다'
        },
        { 
          status: 503,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

  } catch (error) {
    console.error('예상치 못한 서버 오류:', error);
    return NextResponse.json(
      {
        success: false,
        error: '내부 서버 오류가 발생했습니다'
      },
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
}

/**
 * 지원하지 않는 HTTP 메서드에 대한 기본 응답
 */
export async function GET() {
  return NextResponse.json(
    {
      success: false,
      error: 'GET 메서드는 지원되지 않습니다. POST 요청을 사용해주세요.'
    },
    { 
      status: 405,
      headers: {
        'Content-Type': 'application/json',
        'Allow': 'POST',
      },
    }
  );
}

export async function PUT() {
  return NextResponse.json(
    {
      success: false,
      error: 'PUT 메서드는 지원되지 않습니다. POST 요청을 사용해주세요.'
    },
    { 
      status: 405,
      headers: {
        'Content-Type': 'application/json',
        'Allow': 'POST',
      },
    }
  );
}

export async function DELETE() {
  return NextResponse.json(
    {
      success: false,
      error: 'DELETE 메서드는 지원되지 않습니다. POST 요청을 사용해주세요.'
    },
    { 
      status: 405,
      headers: {
        'Content-Type': 'application/json',
        'Allow': 'POST',
      },
    }
  );
}
import { NextRequest, NextResponse } from 'next/server';
import { CsvRegexRuleEngine } from '@/lib/services/csv-regex-rule-engine';
import path from 'path';

// CSV 규칙 엔진 싱글톤 인스턴스
let ruleEngineInstance: CsvRegexRuleEngine | null = null;
let isEngineLoaded = false;

/**
 * 규칙 엔진 초기화 및 반환
 */
async function getRuleEngine(): Promise<CsvRegexRuleEngine> {
  if (!ruleEngineInstance || !isEngineLoaded) {
    ruleEngineInstance = CsvRegexRuleEngine.getInstance();
    
    try {
      await ruleEngineInstance.loadRules();
      isEngineLoaded = true;
    } catch (error) {
      console.error('규칙 엔진 로딩 실패:', error);
      throw new Error('규칙 엔진 초기화에 실패했습니다');
    }
  }
  
  return ruleEngineInstance;
}

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

    const { text } = body;

    // 규칙 엔진 가져오기
    let ruleEngine: CsvRegexRuleEngine;
    try {
      ruleEngine = await getRuleEngine();
    } catch (error) {
      console.error('규칙 엔진 초기화 오류:', error);
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

    // 패턴 매칭 실행
    let matchResult;
    try {
      matchResult = ruleEngine.matchPattern(text);
    } catch (error) {
      console.error('패턴 매칭 오류:', error);
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

    // 성공 응답
    return NextResponse.json(
      {
        success: true,
        data: {
          matched: matchResult.matched,
          category: matchResult.category,
          pattern: matchResult.pattern,
          confidence: matchResult.confidence,
          normalizedName: matchResult.normalizedName,
          description: matchResult.description,
          originalText: text
        }
      },
      { 
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

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
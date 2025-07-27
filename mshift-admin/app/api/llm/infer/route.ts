import { NextRequest, NextResponse } from 'next/server';

import { LLMInferenceService } from '@/lib/services/llm-inference';

// LLM 추론 API 엔드포인트 - Layer 3

export async function POST(req: NextRequest) {
  try {
    // 요청 본문 파싱
    const body = await req.json();

    // 입력 유효성 검사
    if (!body.text || typeof body.text !== 'string') {
      return NextResponse.json(
        {
          success: false,
          error: 'text 필드가 필요합니다 (문자열)',
        },
        { status: 400 }
      );
    }

    const text = body.text.trim();
    if (text.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: '빈 텍스트는 처리할 수 없습니다',
        },
        { status: 400 }
      );
    }

    if (text.length > 1000) {
      return NextResponse.json(
        {
          success: false,
          error: '텍스트는 1000자를 초과할 수 없습니다',
        },
        { status: 400 }
      );
    }

    // 컨텍스트 정보 추출 (선택적)
    const context = body.context
      ? {
          amount: body.context.amount ? Number(body.context.amount) : undefined,
          date: body.context.date || undefined,
          location: body.context.location || undefined,
        }
      : undefined;

    // LLM 추론 서비스 호출
    const llmService = LLMInferenceService.getInstance();
    const result = await llmService.inferCategory({
      text: text,
      originalText: text,
      context: context,
    });

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('LLM API 오류:', error);

    // GEMINI_API_KEY 관련 오류 체크
    if (error instanceof Error && error.message.includes('GEMINI_API_KEY')) {
      return NextResponse.json(
        {
          success: false,
          error: 'API 키 설정 오류가 발생했습니다',
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: '서버 내부 오류가 발생했습니다',
      },
      { status: 500 }
    );
  }
}

// 지원하지 않는 HTTP 메서드
export async function GET() {
  return NextResponse.json(
    {
      success: false,
      error: 'GET 메서드는 지원하지 않습니다. POST 메서드를 사용하세요.',
    },
    { status: 405 }
  );
}

// LLM 헬스체크 엔드포인트
export async function OPTIONS() {
  try {
    const llmService = LLMInferenceService.getInstance();
    const isHealthy = await llmService.healthCheck();
    const stats = llmService.getServiceStats();

    return NextResponse.json(
      {
        success: true,
        data: {
          healthy: isHealthy,
          stats: stats,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'LLM 헬스체크 실패',
      },
      { status: 500 }
    );
  }
}

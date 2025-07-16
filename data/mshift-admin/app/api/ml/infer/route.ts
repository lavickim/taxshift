import { NextRequest, NextResponse } from 'next/server';
import { MLInferenceService } from '@/lib/services/ml-inference';

// ML 추론 API 엔드포인트 - Layer 2 (Dummy Implementation)

export async function POST(req: NextRequest) {
  try {
    // 요청 본문 파싱
    const body = await req.json();
    
    // 입력 유효성 검사
    if (!body.text || typeof body.text !== 'string') {
      return NextResponse.json(
        { 
          success: false, 
          error: 'text 필드가 필요합니다 (문자열)' 
        },
        { status: 400 }
      );
    }

    const text = body.text.trim();
    if (text.length === 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: '빈 텍스트는 처리할 수 없습니다' 
        },
        { status: 400 }
      );
    }

    // ML 추론 서비스 호출
    const mlService = MLInferenceService.getInstance();
    const result = await mlService.inferCategory({
      text: text,
      originalText: text
    });

    if (!result.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: result.error 
        },
        { status: 500 }
      );
    }

    return NextResponse.json(result, { status: 200 });

  } catch (error) {
    console.error('ML API 오류:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: '서버 내부 오류가 발생했습니다' 
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
      error: 'GET 메서드는 지원하지 않습니다. POST 메서드를 사용하세요.' 
    },
    { status: 405 }
  );
} 
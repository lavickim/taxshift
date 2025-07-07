import { NextRequest, NextResponse } from 'next/server';

// 통합 거래 텍스트 분류 API - 전체 4레이어 파이프라인
// Cache (Layer 0) → Regex (Layer 1) → ML (Layer 2) → LLM (Layer 3)

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { text } = body;

    if (!text) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    // Simple classification logic (placeholder)
    const classification = {
      category: 'general',
      confidence: 0.8,
      tags: ['expense']
    };

    return NextResponse.json({
      success: true,
      classification
    });
  } catch (error) {
    console.error('Classification error:', error);
    return NextResponse.json(
      { error: 'Classification failed' },
      { status: 500 }
    );
  }
}

// 분류 통계 조회
export async function GET(req: NextRequest) {
  try {
    // 인증 체크
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { 
          success: false, 
          error: "인증이 필요합니다" 
        },
        { status: 401 }
      );
    }

    // 관리자 권한 체크 (특정 이메일만 허용)
    const allowedEmail = "lavic.kim@gmail.com";
    if (user.email !== allowedEmail) {
      return NextResponse.json(
        { 
          success: false, 
          error: "통계 조회 권한이 없습니다" 
        },
        { status: 403 }
      );
    }

    const classifier = TransactionClassifier.getInstance();
    const stats = classifier.getStats();
    const healthCheck = await classifier.healthCheck();

    return NextResponse.json({
      success: true,
      data: {
        stats,
        healthCheck,
        timestamp: new Date().toISOString()
      }
    }, { status: 200 });

  } catch (error) {
    console.error('통계 조회 API 오류:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: '통계 조회 중 오류가 발생했습니다' 
      },
      { status: 500 }
    );
  }
}

// 시스템 헬스 체크
export async function OPTIONS() {
  try {
    const classifier = TransactionClassifier.getInstance();
    const healthCheck = await classifier.healthCheck();

    return NextResponse.json({
      success: true,
      data: {
        healthy: healthCheck.overall,
        layers: healthCheck.layers,
        timestamp: new Date().toISOString()
      }
    }, { status: 200 });

  } catch (error) {
    console.error('헬스체크 API 오류:', error);
    return NextResponse.json({
      success: false,
      error: '헬스체크 실패'
    }, { status: 500 });
  }
}

// 지원하지 않는 HTTP 메서드
export async function PUT() {
  return NextResponse.json(
    { 
      success: false, 
      error: 'PUT 메서드는 지원하지 않습니다.' 
    },
    { status: 405 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { 
      success: false, 
      error: 'DELETE 메서드는 지원하지 않습니다.' 
    },
    { status: 405 }
  );
} 
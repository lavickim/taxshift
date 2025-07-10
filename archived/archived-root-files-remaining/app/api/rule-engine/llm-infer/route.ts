import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { text, prompt } = await req.json();

    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { success: false, error: '텍스트가 필요합니다' },
        { status: 400 }
      );
    }

    // 임시로 모의 LLM 응답 생성 (실제로는 Gemini API 호출)
    // TODO: 실제 LLM 서비스 통합
    const mockLLMResponse = generateMockLLMResponse(text);

    return NextResponse.json({
      success: true,
      ...mockLLMResponse
    });

  } catch (error) {
    console.error('LLM 추론 오류:', error);
    return NextResponse.json(
      { success: false, error: 'LLM 추론 중 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}

function generateMockLLMResponse(text: string) {
  const lowerText = text.toLowerCase();
  
  // 간단한 키워드 기반 모의 추론
  if (lowerText.includes('커피') || lowerText.includes('카페')) {
    return {
      primary: '업무 미팅 (카페)',
      primaryTag: '#접대비',
      primaryAccount: '접대비',
      secondary: '직원 복지 (음료)',
      secondaryTag: '#복리후생비',
      secondaryAccount: '복리후생비'
    };
  } else if (lowerText.includes('택시') || lowerText.includes('운송')) {
    return {
      primary: '업무 이동',
      primaryTag: '#교통비',
      primaryAccount: '여비교통비',
      secondary: '개인 이동',
      secondaryTag: '#개인경비',
      secondaryAccount: '개인경비'
    };
  } else if (lowerText.includes('식당') || lowerText.includes('음식')) {
    return {
      primary: '업무 회식',
      primaryTag: '#접대비',
      primaryAccount: '접대비',
      secondary: '직원 식사',
      secondaryTag: '#복리후생비',
      secondaryAccount: '복리후생비'
    };
  } else {
    return {
      primary: '일반 업무 지출',
      primaryTag: '#기타경비',
      primaryAccount: '잡비',
      secondary: '개인 지출',
      secondaryTag: '#개인경비',
      secondaryAccount: '개인경비'
    };
  }
} 
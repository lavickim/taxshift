import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/client';

export async function POST(req: NextRequest) {
  try {
    const { transaction, matchedRule, allRules } = await req.json();

    if (!transaction || !matchedRule) {
      return NextResponse.json(
        { success: false, error: '거래 내역과 매칭된 룰 정보가 필요합니다' },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: 'GEMINI_API_KEY가 설정되지 않았습니다' },
        { status: 500 }
      );
    }

    // 최근 피드백 데이터 가져오기 (패턴 분석용)
    const recentFeedbacks = await prisma.ruleEngineFeedback.findMany({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // 30일
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 100
    });

    // 룰 사용 통계 가져오기
    const ruleStats = await prisma.ruleEngine.findUnique({
      where: { id: matchedRule.id },
      select: {
        usageCount: true,
        positiveCount: true,
        negativeCount: true,
        lastUsed: true
      }
    });

    const prompt = `당신은 AI 회계/세무 전문가입니다. 다음 룰 엔진 테스트 결과를 분석하여 통찰력 있는 피드백을 제공해주세요.

테스트 정보:
- 거래 텍스트: "${transaction}"
- 매칭된 룰: "${matchedRule.keyword}"
- 분류된 태그: ${matchedRule.tag}
- 분류된 계정: ${matchedRule.account}
- 신뢰도: ${matchedRule.confidence}

룰 사용 통계:
- 총 사용 횟수: ${ruleStats?.usageCount || 0}회
- 긍정 피드백: ${ruleStats?.positiveCount || 0}회
- 부정 피드백: ${ruleStats?.negativeCount || 0}회
- 성공률: ${ruleStats?.usageCount ? Math.round((ruleStats.positiveCount / ruleStats.usageCount) * 100) : 0}%

최근 피드백 패턴:
${recentFeedbacks.slice(0, 5).map(f => `- "${f.transactionText}" → ${f.feedbackType}`).join('\n')}

다음 항목들을 포함하여 분석해주세요:

1. **매칭 정확도 평가**: 이 거래가 해당 룰과 얼마나 잘 매칭되는지
2. **개선 제안**: 더 나은 분류를 위한 구체적인 제안
3. **주의사항**: 세무/회계 관점에서 주의해야 할 점
4. **유사 거래 예시**: 같은 룰이 적용될 수 있는 다른 거래 예시
5. **신뢰도 조정 제안**: 현재 신뢰도가 적절한지, 조정이 필요한지

JSON 형식으로 응답:
{
  "accuracy": "높음/중간/낮음",
  "accuracyScore": 0-100,
  "accuracyReason": "매칭 정확도에 대한 상세 설명",
  "improvements": ["개선 제안 1", "개선 제안 2"],
  "warnings": ["주의사항 1", "주의사항 2"],
  "similarExamples": ["유사 거래 예시 1", "유사 거래 예시 2"],
  "confidenceAdjustment": {
    "current": ${matchedRule.confidence},
    "suggested": 제안하는 신뢰도,
    "reason": "조정 이유"
  },
  "alternativeClassification": {
    "tag": "대안 태그",
    "account": "대안 계정",
    "reason": "대안 제시 이유"
  },
  "insights": "전반적인 통찰과 추가 조언"
}`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1000,
            responseMimeType: "application/json",
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error('Gemini API 호출 실패');
    }

    const data = await response.json();
    const feedback = JSON.parse(data.candidates[0].content.parts[0].text);

    return NextResponse.json({
      success: true,
      feedback
    });

  } catch (error) {
    console.error('AI 피드백 생성 오류:', error);
    return NextResponse.json(
      { success: false, error: 'AI 피드백 생성 중 오류가 발생했습니다' },
      { status: 500 }
    );
  }
} 
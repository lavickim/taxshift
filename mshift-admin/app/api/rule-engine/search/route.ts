import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/client';

export async function POST(req: NextRequest) {
  try {
    const { transaction } = await req.json();

    if (!transaction || typeof transaction !== 'string') {
      return NextResponse.json(
        { success: false, error: '거래 텍스트가 필요합니다' },
        { status: 400 }
      );
    }

    // DB에서 룰 검색 - 키워드가 포함된 룰 찾기
    const normalizedText = transaction.toLowerCase();
    
    // 모든 활성 룰을 가져와서 클라이언트에서 필터링
    const allRules = await prisma.ruleEngine.findMany({
      where: {
        isActive: true
      },
      orderBy: [
        { confidence: 'desc' },
        { usageCount: 'desc' }
      ]
    });

    // 키워드가 포함된 룰 필터링
    const rules = allRules.filter(rule => 
      normalizedText.includes(rule.keyword.toLowerCase())
    );

    if (rules.length > 0) {
      const bestMatch = rules[0]; // 신뢰도가 가장 높은 룰 선택
      
      // 사용 횟수 증가
      await prisma.ruleEngine.update({
        where: { id: bestMatch.id },
        data: {
          usageCount: { increment: 1 },
          lastUsed: new Date()
        }
      });

      // 옵션 생성
      const options = bestMatch.secondaryTag && bestMatch.secondaryAccount ? [
        { text: '1순위', tag: bestMatch.primaryTag, account: bestMatch.primaryAccount },
        { text: '2순위', tag: bestMatch.secondaryTag, account: bestMatch.secondaryAccount }
      ] : undefined;
      
      return NextResponse.json({
        success: true,
        matches: [{
          id: bestMatch.id,
          keyword: bestMatch.keyword,
          confidence: bestMatch.confidence,
          question: bestMatch.question,
          tag: bestMatch.primaryTag,
          account: bestMatch.primaryAccount,
          options: options
        }],
        normalized: transaction // 정규화된 텍스트 추가
      });
    }

    return NextResponse.json({
      success: true,
      matches: []
    });

  } catch (error) {
    console.error('룰 검색 오류:', error);
    return NextResponse.json(
      { success: false, error: '룰 검색 중 오류가 발생했습니다' },
      { status: 500 }
    );
  }
} 
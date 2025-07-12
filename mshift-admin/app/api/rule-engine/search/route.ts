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

    // DB에서 룰 검색
    const normalizedText = transaction.toLowerCase();
    
    // 1. 먼저 정규식 룰 검색
    const regexRules = await prisma.regex_rules.findMany({
      where: {
        enabled: true
      },
      orderBy: {
        priority: 'desc'
      }
    });

    // 정규식 매칭 시도
    let regexMatches = [];
    for (const rule of regexRules) {
      try {
        const regex = new RegExp(rule.pattern, 'i');
        const match = transaction.match(regex);
        if (match) {
          regexMatches.push({
            id: `regex_${rule.id}`,
            pattern: rule.pattern,
            category: rule.category,
            description: rule.description,
            confidence: rule.confidence,
            matchedText: match[0],
            type: 'regex'
          });
        }
      } catch (error) {
        console.error(`Invalid regex pattern: ${rule.pattern}`, error);
      }
    }

    // 2. 키워드 룰 검색
    const keywordRules = await prisma.ruleEngine.findMany({
      where: {
        isActive: true
      },
      orderBy: [
        { confidence: 'desc' },
        { usageCount: 'desc' }
      ]
    });

    // 키워드가 포함된 룰 필터링
    const keywordMatches = keywordRules.filter(rule => 
      normalizedText.includes(rule.keyword.toLowerCase())
    ).map(rule => ({
      id: rule.id,
      keyword: rule.keyword,
      confidence: rule.confidence,
      tag: rule.primaryTag,
      account: rule.primaryAccount,
      type: 'keyword'
    }));

    // 모든 매칭 결과 결합
    const allMatches = [...regexMatches, ...keywordMatches];
    const rules = keywordRules.filter(rule => 
      normalizedText.includes(rule.keyword.toLowerCase())
    );

    if (allMatches.length > 0) {
      // 신뢰도 순으로 정렬
      allMatches.sort((a, b) => (b.confidence || 0) - (a.confidence || 0));
      
      // 키워드 룰 사용 횟수 증가 (정규식 룰은 제외)
      const keywordMatch = allMatches.find(match => match.type === 'keyword');
      if (keywordMatch && keywordMatch.id) {
        try {
          await prisma.ruleEngine.update({
            where: { id: keywordMatch.id },
            data: {
              usageCount: { increment: 1 },
              lastUsed: new Date()
            }
          });
        } catch (error) {
          console.error('Error updating usage count:', error);
        }
      }
      
      return NextResponse.json({
        success: true,
        matches: allMatches,
        normalized: transaction,
        matched: true
      });
    }

    return NextResponse.json({
      success: true,
      matches: [],
      matched: false
    });

  } catch (error) {
    console.error('룰 검색 오류:', error);
    return NextResponse.json(
      { success: false, error: '룰 검색 중 오류가 발생했습니다' },
      { status: 500 }
    );
  }
} 
import { NextRequest, NextResponse } from 'next/server';

import { PrismaClient } from '../../../../lib/generated/prisma';

const prisma = new PrismaClient();

// POST - 통합 regex rules 테스트
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text } = body;

    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: '테스트할 텍스트가 필요합니다.' },
        { status: 400 }
      );
    }

    // 활성화된 모든 규칙 조회 (우선순위 순)
    const rules = await prisma.regex_rules.findMany({
      where: {
        OR: [{ enabled: true }, { is_active: true }],
      },
      orderBy: [
        { pattern_type: 'asc' }, // BRAND first, then KEYWORD
        { priority: 'desc' },
        { confidence: 'desc' },
      ],
    });

    const matchedRules: any[] = [];
    let processedText = text;

    // 브랜드 패턴 먼저 처리 (정규식)
    const brandRules = rules.filter(r => r.pattern_type === 'BRAND');
    for (const rule of brandRules) {
      if (rule.pattern) {
        try {
          const regex = new RegExp(rule.pattern, 'gi');
          const matches = text.match(regex);

          if (matches) {
            matchedRules.push({
              id: rule.id.toString(),
              pattern: rule.pattern,
              pattern_type: rule.pattern_type,
              category: rule.category,
              description: rule.description,
              confidence: rule.confidence ? Number(rule.confidence) : null,
              matchedText: matches[0],
              replacement: rule.replacement,
            });

            // 대체 텍스트가 있으면 적용
            if (rule.replacement) {
              processedText = processedText.replace(regex, rule.replacement);
            }
          }
        } catch (regexError) {
          console.warn(`Invalid regex pattern: ${rule.pattern}`, regexError);
        }
      }
    }

    // 키워드 패턴 처리 (단순 문자열 매칭)
    const keywordRules = rules.filter(r => r.pattern_type === 'KEYWORD');
    for (const rule of keywordRules) {
      if (rule.keyword) {
        const lowerText = text.toLowerCase();
        const lowerKeyword = rule.keyword.toLowerCase();

        if (lowerText.includes(lowerKeyword)) {
          matchedRules.push({
            id: rule.id.toString(),
            keyword: rule.keyword,
            pattern_type: rule.pattern_type,
            category: rule.category,
            description: rule.description,
            confidence: rule.confidence ? Number(rule.confidence) : null,
            matchedText: rule.keyword,
            primary_tag: rule.primary_tag,
            primary_account: rule.primary_account,
            secondary_tag: rule.secondary_tag,
            secondary_account: rule.secondary_account,
            usage_count: rule.usage_count ? Number(rule.usage_count) : 0,
            success_rate: rule.success_rate ? Number(rule.success_rate) : null,
          });
        }
      }
    }

    // 사용 카운트 업데이트 (비동기로 실행하여 응답 속도 향상)
    if (matchedRules.length > 0) {
      const updatePromises = matchedRules.map(async matchedRule => {
        try {
          await prisma.regex_rules.update({
            where: { id: BigInt(matchedRule.id) },
            data: {
              usage_count: {
                increment: 1,
              },
              last_used: new Date(),
            },
          });
        } catch (error) {
          console.warn(
            `Failed to update usage count for rule ${matchedRule.id}:`,
            error
          );
        }
      });

      // 백그라운드에서 실행
      Promise.all(updatePromises).catch(console.error);
    }

    return NextResponse.json({
      success: true,
      data: {
        originalText: text,
        processedText: processedText,
        matched: matchedRules.length > 0,
        matchedRules: matchedRules,
        totalMatches: matchedRules.length,
      },
    });
  } catch (error) {
    console.error('통합 regex rules 테스트 오류:', error);
    return NextResponse.json(
      { error: '통합 regex rules 테스트 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

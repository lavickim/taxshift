import { NextRequest, NextResponse } from 'next/server';
import { CsvRegexRuleEngine } from '@/lib/services/csv-regex-rule-engine';

export interface RulesAllResponse {
  success: boolean;
  data: any[];
  totalCount: number;
  processingTime: number;
}

export interface RulesErrorResponse {
  error: string;
  code: string;
}

/**
 * GET /api/rules/all - 모든 정규식 룰 데이터 조회 API
 * 
 * 쿼리 파라미터 (선택):
 * - category: 특정 카테고리만 조회
 * - search: 패턴이나 설명에서 검색
 * 
 * 응답:
 * - 200: 조회 성공
 * - 500: 서버 내부 오류
 */
export async function GET(request: NextRequest): Promise<NextResponse<RulesAllResponse | RulesErrorResponse>> {
  const startTime = Date.now();
  
  try {
    // 쿼리 파라미터 파싱
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');

    // CsvRegexRuleEngine 인스턴스 가져오기
    const ruleEngine = CsvRegexRuleEngine.getInstance();
    
    // 규칙이 로드되지 않은 경우 로드 시도
    if (!ruleEngine.isLoaded()) {
      await ruleEngine.loadRules();
    }

    // 모든 룰 데이터 조회
    let allRules = ruleEngine.getRules();
    
    // 카테고리 필터링
    if (category) {
      allRules = ruleEngine.getRulesByCategory(category);
    }
    
    // 검색 필터링
    if (search) {
      allRules = ruleEngine.searchRules(search);
    }
    
    const processingTime = Date.now() - startTime;

    return NextResponse.json({
      success: true,
      data: allRules.map(rule => ({
        pattern: rule.pattern,
        replacement: rule.description, // 설명을 치환값으로 표시
        category: rule.category,
        priority: Math.round(rule.confidence * 100), // 신뢰도를 우선순위로 변환
        isActive: true, // CSV에서 로드된 규칙은 모두 활성 상태
        confidence: rule.confidence,
        normalizerType: rule.normalizerType
      })),
      totalCount: allRules.length,
      processingTime
    });

  } catch (error: any) {
    // 예상하지 못한 서버 에러
    console.error('Rules all data fetch error:', error);
    
    return NextResponse.json(
      {
        error: '정규식 룰 데이터 조회 중 오류가 발생했습니다',
        code: 'RULES_ALL_FETCH_ERROR'
      },
      { status: 500 }
    );
  }
} 
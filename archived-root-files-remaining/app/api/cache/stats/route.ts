import { NextRequest, NextResponse } from 'next/server';
import { TransactionCacheService } from '@/lib/services/transaction-cache';

export interface CacheStatsResponse {
  success: boolean;
  data: {
    totalEntries: number;
    oldestEntry: string | null;
    latestEntry: string | null;
    averageUniqueKeyLength: number;
    averageRawTextLength: number;
    uniqueKeyPatterns: Record<string, number>;
    entriesPerDay: Record<string, number>;
  };
  processingTime: number;
}

export interface CacheErrorResponse {
  error: string;
  code: string;
}

/**
 * GET /api/cache/stats - 캐시 통계 조회 API
 * 
 * 쿼리 파라미터 (선택):
 * - from: 시작 날짜 (YYYY-MM-DD 형식)
 * - to: 종료 날짜 (YYYY-MM-DD 형식)
 * 
 * 응답:
 * - 200: 통계 조회 성공
 * - 400: 잘못된 요청 (날짜 형식 오류)
 * - 500: 서버 내부 오류
 */
export async function GET(request: NextRequest): Promise<NextResponse<CacheStatsResponse | CacheErrorResponse>> {
  const startTime = Date.now();
  
  try {
    // 쿼리 파라미터에서 날짜 필터 옵션 확인
    const { searchParams } = new URL(request.url);
    const fromDate = searchParams.get('from');
    const toDate = searchParams.get('to');

    // 날짜 형식 검증
    let whereCondition: any = {};
    
    if (fromDate || toDate) {
      try {
        const dateFilter: any = {};
        
        if (fromDate) {
          const from = new Date(fromDate + 'T00:00:00.000Z');
          if (isNaN(from.getTime())) {
            throw new Error('Invalid from date');
          }
          dateFilter.gte = from;
        }
        
        if (toDate) {
          const to = new Date(toDate + 'T23:59:59.999Z');
          if (isNaN(to.getTime())) {
            throw new Error('Invalid to date');
          }
          dateFilter.lte = to;
        }
        
        whereCondition = {
          where: {
            createdAt: dateFilter
          }
        };
      } catch (dateError) {
        return NextResponse.json(
          {
            error: '잘못된 날짜 형식입니다',
            code: 'INVALID_DATE_FORMAT'
          },
          { status: 400 }
        );
      }
    }

    // TransactionCacheService 인스턴스 생성
    const cacheService = new TransactionCacheService();

    try {
      // 총 엔트리 수 조회
      const totalEntries = await cacheService.count();
      
      // 모든 캐시 데이터 조회 (필터 조건은 현재 지원하지 않음)
      const allCacheData = await cacheService.findAll();

      // 기본 통계 계산
      let oldestEntry: string | null = null;
      let latestEntry: string | null = null;
      let averageUniqueKeyLength = 0;
      let averageRawTextLength = 0;
      const uniqueKeyPatterns: Record<string, number> = {};
      const entriesPerDay: Record<string, number> = {};

      if (allCacheData.length > 0) {
        // 날짜 정렬을 위한 처리
        const sortedByDate = allCacheData.sort((a, b) => 
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
        
        oldestEntry = sortedByDate[0].createdAt.toISOString();
        latestEntry = sortedByDate[sortedByDate.length - 1].createdAt.toISOString();

        // 평균 길이 계산
        const totalUniqueKeyLength = allCacheData.reduce((sum, item) => sum + item.uniqueKey.length, 0);
        const totalRawTextLength = allCacheData.reduce((sum, item) => sum + item.rawText.length, 0);
        
        averageUniqueKeyLength = Math.round(totalUniqueKeyLength / allCacheData.length * 100) / 100;
        averageRawTextLength = Math.round(totalRawTextLength / allCacheData.length * 100) / 100;

        // uniqueKey 패턴 분석 (첫 번째 underscore 전의 부분을 카테고리로 간주)
        allCacheData.forEach(item => {
          const pattern = item.uniqueKey.split('_')[0];
          uniqueKeyPatterns[pattern] = (uniqueKeyPatterns[pattern] || 0) + 1;
        });

        // 일별 엔트리 수 계산
        allCacheData.forEach(item => {
          const dateKey = item.createdAt.toISOString().split('T')[0]; // YYYY-MM-DD 형식
          entriesPerDay[dateKey] = (entriesPerDay[dateKey] || 0) + 1;
        });
      }

      const processingTime = Date.now() - startTime;

      return NextResponse.json(
        {
          success: true,
          data: {
            totalEntries,
            oldestEntry,
            latestEntry,
            averageUniqueKeyLength,
            averageRawTextLength,
            uniqueKeyPatterns,
            entriesPerDay
          },
          processingTime
        },
        { status: 200 }
      );

    } catch (serviceError: any) {
      // TransactionCacheService에서 발생한 에러는 500으로 처리
      throw serviceError;
    }

  } catch (error: any) {
    // 예상하지 못한 서버 에러
    console.error('Cache stats error:', error);
    
    return NextResponse.json(
      {
        error: '캐시 통계 조회 중 오류가 발생했습니다',
        code: 'CACHE_STATS_ERROR'
      },
      { status: 500 }
    );
  }
} 
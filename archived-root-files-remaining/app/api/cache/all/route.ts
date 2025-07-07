import { NextRequest, NextResponse } from 'next/server';
import { TransactionCacheService } from '@/lib/services/transaction-cache';

export interface CacheAllResponse {
  success: boolean;
  data: any[];
  totalCount: number;
  processingTime: number;
}

export interface CacheErrorResponse {
  error: string;
  code: string;
}

/**
 * GET /api/cache/all - 모든 캐시 데이터 조회 API
 * 
 * 쿼리 파라미터 (선택):
 * - limit: 조회할 최대 개수 (기본값: 1000)
 * - offset: 건너뛸 개수 (기본값: 0)
 * 
 * 응답:
 * - 200: 조회 성공
 * - 500: 서버 내부 오류
 */
export async function GET(request: NextRequest): Promise<NextResponse<CacheAllResponse | CacheErrorResponse>> {
  const startTime = Date.now();
  
  try {
    // 쿼리 파라미터 파싱
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '1000');
    const offset = parseInt(searchParams.get('offset') || '0');

    // TransactionCacheService 인스턴스 생성
    const cacheService = new TransactionCacheService();

    // 모든 캐시 데이터 조회
    const allCacheData = await cacheService.findAll();
    
    // 페이지네이션 적용
    const paginatedData = allCacheData.slice(offset, offset + limit);
    
    const processingTime = Date.now() - startTime;

    return NextResponse.json({
      success: true,
      data: paginatedData.map(item => ({
        rawTextHash: item.rawTextHash,
        rawText: item.rawText,
        uniqueKey: item.uniqueKey,
        createdAt: item.createdAt.toISOString()
      })),
      totalCount: allCacheData.length,
      processingTime
    });

  } catch (error: any) {
    // 예상하지 못한 서버 에러
    console.error('Cache all data fetch error:', error);
    
    return NextResponse.json(
      {
        error: '캐시 데이터 조회 중 오류가 발생했습니다',
        code: 'CACHE_ALL_FETCH_ERROR'
      },
      { status: 500 }
    );
  }
} 
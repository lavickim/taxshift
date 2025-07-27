import { NextRequest, NextResponse } from 'next/server';

import { TransactionCacheService } from '@/lib/services/transaction-cache';

export interface CacheLookupResponse {
  hit: boolean;
  data: any | null;
  processingTime: number;
}

export interface CacheErrorResponse {
  error: string;
  code: string;
}

/**
 * GET /api/cache/lookup - 캐시 조회 API
 *
 * 쿼리 파라미터:
 * - hash: 조회할 해시값 (64자리 16진수)
 *
 * 응답:
 * - 200: 캐시 조회 성공 (HIT/MISS 모두 포함)
 * - 400: 잘못된 요청 (파라미터 누락, 잘못된 해시 형식)
 * - 500: 서버 내부 오류
 */
export async function GET(
  request: NextRequest
): Promise<NextResponse<CacheLookupResponse | CacheErrorResponse>> {
  const startTime = Date.now();

  try {
    // 쿼리 파라미터에서 해시 추출
    const { searchParams } = new URL(request.url);
    const hash = searchParams.get('hash');

    // 해시 파라미터 검증
    if (!hash) {
      return NextResponse.json(
        {
          error: 'hash 파라미터가 필요합니다',
          code: 'MISSING_HASH_PARAMETER',
        },
        { status: 400 }
      );
    }

    // TransactionCacheService 인스턴스 생성
    const cacheService = new TransactionCacheService();

    try {
      // 캐시 조회
      const cachedData = await cacheService.findByHash(hash);
      const processingTime = Date.now() - startTime;

      if (cachedData) {
        // 캐시 HIT
        return NextResponse.json({
          hit: true,
          data: {
            rawTextHash: cachedData.rawTextHash,
            rawText: cachedData.rawText,
            uniqueKey: cachedData.uniqueKey,
            createdAt: cachedData.createdAt.toISOString(),
          },
          processingTime,
        });
      } else {
        // 캐시 MISS
        return NextResponse.json({
          hit: false,
          data: null,
          processingTime,
        });
      }
    } catch (serviceError: any) {
      // TransactionCacheService에서 발생한 유효성 검증 에러
      if (serviceError.message?.includes('해시는 64자리 16진수여야 합니다')) {
        return NextResponse.json(
          {
            error: serviceError.message,
            code: 'INVALID_HASH_FORMAT',
          },
          { status: 400 }
        );
      }

      // 기타 서비스 에러는 500으로 처리
      throw serviceError;
    }
  } catch (error: any) {
    // 예상하지 못한 서버 에러
    console.error('Cache lookup error:', error);

    return NextResponse.json(
      {
        error: '캐시 조회 중 오류가 발생했습니다',
        code: 'CACHE_LOOKUP_ERROR',
      },
      { status: 500 }
    );
  }
}

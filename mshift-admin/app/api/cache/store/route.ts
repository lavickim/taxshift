import { NextRequest, NextResponse } from 'next/server';

import { TransactionCacheService } from '@/lib/services/transaction-cache';

export interface CacheStoreResponse {
  success: boolean;
  data: any;
  processingTime: number;
}

export interface CacheErrorResponse {
  error: string;
  code: string;
}

export interface CacheStoreRequest {
  rawTextHash: string;
  rawText: string;
  uniqueKey: string;
}

/**
 * POST /api/cache/store - 캐시 저장 API
 *
 * 쿼리 파라미터 (선택):
 * - upsert: true인 경우 이미 존재하는 해시에 대해 업데이트 수행
 *
 * 요청 본문:
 * - rawTextHash: 저장할 해시값 (64자리 16진수)
 * - rawText: 원본 텍스트
 * - uniqueKey: 고유 키
 *
 * 응답:
 * - 201: 새로운 캐시 생성 성공
 * - 200: upsert로 기존 캐시 업데이트 성공
 * - 400: 잘못된 요청 (필수 필드 누락, 잘못된 형식)
 * - 409: 중복된 해시 (upsert=false일 때)
 * - 500: 서버 내부 오류
 */
export async function POST(
  request: NextRequest
): Promise<NextResponse<CacheStoreResponse | CacheErrorResponse>> {
  const startTime = Date.now();

  try {
    // 쿼리 파라미터에서 upsert 옵션 확인
    const { searchParams } = new URL(request.url);
    const isUpsert = searchParams.get('upsert') === 'true';

    // 요청 본문 파싱

    let requestData: CacheStoreRequest;

    try {
      requestData = await request.json();
    } catch (parseError) {
      return NextResponse.json(
        {
          error: '잘못된 JSON 형식입니다',
          code: 'INVALID_JSON_FORMAT',
        },
        { status: 400 }
      );
    }

    // 필수 필드 검증

    const requiredFields = ['rawTextHash', 'rawText', 'uniqueKey'];
    for (const field of requiredFields) {
      if (!requestData[field as keyof CacheStoreRequest]) {
        return NextResponse.json(
          {
            error: `필수 필드가 누락되었습니다: ${field}`,
            code: 'MISSING_REQUIRED_FIELD',
          },
          { status: 400 }
        );
      }
    }

    // TransactionCacheService 인스턴스 생성
    const cacheService = new TransactionCacheService();

    try {
      let result;
      let statusCode = 201;

      if (isUpsert) {
        // upsert 모드: 생성 또는 업데이트
        result = await cacheService.upsert(
          requestData.rawTextHash,
          requestData,
          { uniqueKey: requestData.uniqueKey }
        );
        statusCode = 200; // upsert는 200으로 응답
      } else {
        // 생성 모드: 새로운 캐시만 생성
        result = await cacheService.create(requestData);
        statusCode = 201; // 새로 생성된 경우 201
      }

      const processingTime = Date.now() - startTime;

      return NextResponse.json(
        {
          success: true,
          data: {
            rawTextHash: result.rawTextHash,
            rawText: result.rawText,
            uniqueKey: result.uniqueKey,
            createdAt: result.createdAt.toISOString(),
          },
          processingTime,
        },
        { status: statusCode }
      );
    } catch (serviceError: any) {
      // TransactionCacheService에서 발생한 에러 처리
      if (serviceError.message?.includes('해시는 64자리 16진수여야 합니다')) {
        return NextResponse.json(
          {
            error: serviceError.message,
            code: 'INVALID_HASH_FORMAT',
          },
          { status: 400 }
        );
      }

      if (serviceError.message?.includes('rawText는 비어있을 수 없습니다')) {
        return NextResponse.json(
          {
            error: serviceError.message,
            code: 'INVALID_RAW_TEXT',
          },
          { status: 400 }
        );
      }

      if (serviceError.message?.includes('uniqueKey는 비어있을 수 없습니다')) {
        return NextResponse.json(
          {
            error: serviceError.message,
            code: 'INVALID_UNIQUE_KEY',
          },
          { status: 400 }
        );
      }

      if (serviceError.message?.includes('이미 존재하는 해시입니다')) {
        return NextResponse.json(
          {
            error: serviceError.message,
            code: 'DUPLICATE_HASH',
          },
          { status: 409 }
        );
      }

      // 기타 서비스 에러는 500으로 처리
      throw serviceError;
    }
  } catch (error: any) {
    // 예상하지 못한 서버 에러
    console.error('Cache store error:', error);

    return NextResponse.json(
      {
        error: '캐시 저장 중 오류가 발생했습니다',
        code: 'CACHE_STORE_ERROR',
      },
      { status: 500 }
    );
  }
}

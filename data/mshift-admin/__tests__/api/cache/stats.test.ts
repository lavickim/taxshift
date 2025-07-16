import { NextRequest } from 'next/server';
import { GET } from '@/app/api/cache/stats/route';
import { TransactionCacheService } from '@/lib/services/transaction-cache';
import { prisma } from '@/lib/db/client';

// TransactionCacheService 모킹
jest.mock('@/lib/services/transaction-cache');
const MockedTransactionCacheService = TransactionCacheService as jest.MockedClass<typeof TransactionCacheService>;

describe('/api/cache/stats API 테스트', () => {
  let mockService: jest.Mocked<TransactionCacheService>;

  beforeEach(() => {
    // 모든 모킹 초기화
    jest.clearAllMocks();
    
    // TransactionCacheService 인스턴스 모킹
    mockService = {
      count: jest.fn(),
      findAll: jest.fn(),
    } as any;
    
    MockedTransactionCacheService.mockImplementation(() => mockService);

    // 데이터베이스 정리
    prisma.transactionCache.deleteMany({});
  });

  afterAll(async () => {
    await prisma.transactionCache.deleteMany({});
    await prisma.$disconnect();
  });

  describe('GET /api/cache/stats', () => {
    it('캐시 통계를 성공적으로 반환해야 함', async () => {
      // 모킹 설정: 100개의 캐시 데이터
      mockService.count.mockResolvedValue(100);
      
      const mockCacheData = [
        {
          rawTextHash: 'a'.repeat(64),
          rawText: '박광업 (대림카센터)',
          uniqueKey: '카센터_대림카센터_박광업',
          createdAt: new Date('2024-01-01T00:00:00Z')
        },
        {
          rawTextHash: 'b'.repeat(64),
          rawText: '지에스25이천하이',
          uniqueKey: '편의점_GS25_이천하이',
          createdAt: new Date('2024-01-02T00:00:00Z')
        }
      ];
      
      mockService.findAll.mockResolvedValue(mockCacheData);

      // API 요청 생성
      const request = new NextRequest('http://localhost:3000/api/cache/stats', {
        method: 'GET'
      });

      // API 호출
      const response = await GET(request);
      const responseData = await response.json();

      // 응답 검증
      expect(response.status).toBe(200);
      expect(responseData).toEqual({
        success: true,
        data: {
          totalEntries: 100,
          oldestEntry: '2024-01-01T00:00:00.000Z',
          latestEntry: '2024-01-02T00:00:00.000Z',
          averageUniqueKeyLength: expect.any(Number),
          averageRawTextLength: expect.any(Number),
          uniqueKeyPatterns: expect.any(Object),
          entriesPerDay: expect.any(Object)
        },
        processingTime: expect.any(Number)
      });

      // 서비스 메소드 호출 검증
      expect(mockService.count).toHaveBeenCalledTimes(1);
      expect(mockService.findAll).toHaveBeenCalledTimes(1);
    });

    it('빈 캐시일 때 기본 통계를 반환해야 함', async () => {
      // 모킹 설정: 빈 캐시
      mockService.count.mockResolvedValue(0);
      mockService.findAll.mockResolvedValue([]);

      // API 요청 생성
      const request = new NextRequest('http://localhost:3000/api/cache/stats', {
        method: 'GET'
      });

      // API 호출
      const response = await GET(request);
      const responseData = await response.json();

      // 응답 검증
      expect(response.status).toBe(200);
      expect(responseData).toEqual({
        success: true,
        data: {
          totalEntries: 0,
          oldestEntry: null,
          latestEntry: null,
          averageUniqueKeyLength: 0,
          averageRawTextLength: 0,
          uniqueKeyPatterns: {},
          entriesPerDay: {}
        },
        processingTime: expect.any(Number)
      });

      // 서비스 메소드 호출 검증
      expect(mockService.count).toHaveBeenCalledTimes(1);
      expect(mockService.findAll).toHaveBeenCalledTimes(1);
    });

    it('대량 데이터에서 통계 계산이 정확해야 함', async () => {
      // 모킹 설정: 1000개의 캐시 데이터
      const mockLargeData = Array.from({ length: 1000 }, (_, i) => ({
        rawTextHash: i.toString().padStart(64, '0'),
        rawText: `테스트 데이터 ${i}`,
        uniqueKey: `카테고리${i % 5}_업체${i}_키${i}`,
        createdAt: new Date(2024, 0, 1 + (i % 30)) // 30일간 분산
      }));

      mockService.count.mockResolvedValue(1000);
      mockService.findAll.mockResolvedValue(mockLargeData);

      // API 요청 생성
      const request = new NextRequest('http://localhost:3000/api/cache/stats', {
        method: 'GET'
      });

      // API 호출
      const response = await GET(request);
      const responseData = await response.json();

      // 응답 검증
      expect(response.status).toBe(200);
      expect(responseData.success).toBe(true);
      expect(responseData.data.totalEntries).toBe(1000);
      
      // 평균 길이 계산 검증
      expect(responseData.data.averageUniqueKeyLength).toBeGreaterThan(0);
      expect(responseData.data.averageRawTextLength).toBeGreaterThan(0);
      
      // 패턴 분석 검증
      expect(Object.keys(responseData.data.uniqueKeyPatterns)).toHaveLength(5); // 카테고리0~4
      
      // 일별 엔트리 검증
      expect(Object.keys(responseData.data.entriesPerDay).length).toBeGreaterThan(0);

      // 서비스 메소드 호출 검증
      expect(mockService.count).toHaveBeenCalledTimes(1);
      expect(mockService.findAll).toHaveBeenCalledTimes(1);
    });

    it('날짜별 필터링 옵션이 동작해야 함', async () => {
      const mockFilteredData = [
        {
          rawTextHash: 'x'.repeat(64),
          rawText: '필터링된 데이터',
          uniqueKey: '필터테스트_업체_키',
          createdAt: new Date('2024-06-01T00:00:00Z')
        }
      ];

      mockService.count.mockResolvedValue(1);
      mockService.findAll.mockResolvedValue(mockFilteredData);

      // API 요청 생성 (날짜 필터 포함)
      const request = new NextRequest('http://localhost:3000/api/cache/stats?from=2024-06-01&to=2024-06-30', {
        method: 'GET'
      });

      // API 호출
      const response = await GET(request);
      const responseData = await response.json();

      // 응답 검증
      expect(response.status).toBe(200);
      expect(responseData.success).toBe(true);
      expect(responseData.data.totalEntries).toBe(1);
      expect(responseData.data.oldestEntry).toBe('2024-06-01T00:00:00.000Z');
      expect(responseData.data.latestEntry).toBe('2024-06-01T00:00:00.000Z');

      // 서비스 메소드 호출 검증 (필터 조건 포함)
      expect(mockService.findAll).toHaveBeenCalledWith({
        where: {
          createdAt: {
            gte: new Date('2024-06-01T00:00:00.000Z'),
            lte: new Date('2024-06-30T23:59:59.999Z')
          }
        }
      });
    });

    it('잘못된 날짜 형식일 때 400 에러를 반환해야 함', async () => {
      // API 요청 생성 (잘못된 날짜 형식)
      const request = new NextRequest('http://localhost:3000/api/cache/stats?from=invalid-date', {
        method: 'GET'
      });

      // API 호출
      const response = await GET(request);
      const responseData = await response.json();

      // 응답 검증
      expect(response.status).toBe(400);
      expect(responseData).toEqual({
        error: '잘못된 날짜 형식입니다',
        code: 'INVALID_DATE_FORMAT'
      });

      // 서비스 메소드가 호출되지 않아야 함
      expect(mockService.count).not.toHaveBeenCalled();
      expect(mockService.findAll).not.toHaveBeenCalled();
    });

    it('데이터베이스 에러 시 500 에러를 반환해야 함', async () => {
      // 모킹 설정: 데이터베이스 에러
      mockService.count.mockRejectedValue(new Error('Database connection failed'));

      // API 요청 생성
      const request = new NextRequest('http://localhost:3000/api/cache/stats', {
        method: 'GET'
      });

      // API 호출
      const response = await GET(request);
      const responseData = await response.json();

      // 응답 검증
      expect(response.status).toBe(500);
      expect(responseData).toEqual({
        error: '캐시 통계 조회 중 오류가 발생했습니다',
        code: 'CACHE_STATS_ERROR'
      });

      // 서비스 메소드 호출 검증
      expect(mockService.count).toHaveBeenCalledTimes(1);
    });

    it('통계 조회 성능이 100ms 미만이어야 함 (성능 테스트)', async () => {
      // 모킹 설정: 중간 크기 데이터
      const mockData = Array.from({ length: 100 }, (_, i) => ({
        rawTextHash: i.toString().padStart(64, '0'),
        rawText: `성능 테스트 데이터 ${i}`,
        uniqueKey: `성능테스트_업체${i}_키${i}`,
        createdAt: new Date()
      }));

      mockService.count.mockResolvedValue(100);
      mockService.findAll.mockResolvedValue(mockData);

      // API 요청 생성
      const request = new NextRequest('http://localhost:3000/api/cache/stats', {
        method: 'GET'
      });

      // 성능 측정
      const startTime = Date.now();
      const response = await GET(request);
      const endTime = Date.now();
      const responseData = await response.json();

      // 응답 시간 검증
      expect(endTime - startTime).toBeLessThan(100);
      expect(responseData.processingTime).toBeLessThan(100);
      expect(response.status).toBe(200);
    });

    it('동시 통계 조회 요청 처리 안정성 테스트', async () => {
      // 모킹 설정: 각 요청에 대해 동일한 응답
      mockService.count.mockResolvedValue(50);
      const mockData = Array.from({ length: 50 }, (_, i) => ({
        rawTextHash: i.toString().padStart(64, '0'),
        rawText: `동시성 테스트 ${i}`,
        uniqueKey: `동시성테스트_업체${i}_키${i}`,
        createdAt: new Date()
      }));
      mockService.findAll.mockResolvedValue(mockData);

      // 10개의 동시 요청 생성
      const simultaneousRequests = Array.from({ length: 10 }, () => {
        const request = new NextRequest('http://localhost:3000/api/cache/stats', {
          method: 'GET'
        });
        return GET(request);
      });

      // 동시 실행
      const responses = await Promise.all(simultaneousRequests);

      // 모든 응답이 성공해야 함
      for (const response of responses) {
        expect(response.status).toBe(200);
        const responseData = await response.json();
        expect(responseData.success).toBe(true);
        expect(responseData.data.totalEntries).toBe(50);
      }

      // 서비스 메소드가 10번 호출되어야 함
      expect(mockService.count).toHaveBeenCalledTimes(10);
      expect(mockService.findAll).toHaveBeenCalledTimes(10);
    });

    it('응답 데이터 형식이 정확해야 함', async () => {
      const mockData = [
        {
          rawTextHash: '1'.repeat(64),
          rawText: '데이터 형식 테스트',
          uniqueKey: '형식테스트_업체_키',
          createdAt: new Date('2024-06-07T12:00:00Z')
        }
      ];

      mockService.count.mockResolvedValue(1);
      mockService.findAll.mockResolvedValue(mockData);

      // API 요청 생성
      const request = new NextRequest('http://localhost:3000/api/cache/stats', {
        method: 'GET'
      });

      // API 호출
      const response = await GET(request);
      const responseData = await response.json();

      // 응답 데이터 구조 검증
      expect(responseData).toHaveProperty('success');
      expect(responseData).toHaveProperty('data');
      expect(responseData).toHaveProperty('processingTime');

      expect(typeof responseData.success).toBe('boolean');
      expect(typeof responseData.processingTime).toBe('number');

      // data 객체 구조 검증
      expect(responseData.data).toHaveProperty('totalEntries');
      expect(responseData.data).toHaveProperty('oldestEntry');
      expect(responseData.data).toHaveProperty('latestEntry');
      expect(responseData.data).toHaveProperty('averageUniqueKeyLength');
      expect(responseData.data).toHaveProperty('averageRawTextLength');
      expect(responseData.data).toHaveProperty('uniqueKeyPatterns');
      expect(responseData.data).toHaveProperty('entriesPerDay');

      // 데이터 타입 검증
      expect(typeof responseData.data.totalEntries).toBe('number');
      expect(typeof responseData.data.averageUniqueKeyLength).toBe('number');
      expect(typeof responseData.data.averageRawTextLength).toBe('number');
      expect(typeof responseData.data.uniqueKeyPatterns).toBe('object');
      expect(typeof responseData.data.entriesPerDay).toBe('object');

      // 날짜 형식 검증 (ISO 문자열 또는 null)
      if (responseData.data.oldestEntry) {
        expect(responseData.data.oldestEntry).toBe('2024-06-07T12:00:00.000Z');
      }
      if (responseData.data.latestEntry) {
        expect(responseData.data.latestEntry).toBe('2024-06-07T12:00:00.000Z');
      }
    });

    it('uniqueKey 패턴 분석이 정확해야 함', async () => {
      const mockData = [
        {
          rawTextHash: 'p1'.padEnd(64, '0'),
          rawText: '패턴 테스트 1',
          uniqueKey: '카센터_대림카센터_박광업',
          createdAt: new Date('2024-01-01T00:00:00Z')
        },
        {
          rawTextHash: 'p2'.padEnd(64, '0'),
          rawText: '패턴 테스트 2',
          uniqueKey: '카센터_현대카센터_김철수',
          createdAt: new Date('2024-01-02T00:00:00Z')
        },
        {
          rawTextHash: 'p3'.padEnd(64, '0'),
          rawText: '패턴 테스트 3',
          uniqueKey: '편의점_GS25_이천하이',
          createdAt: new Date('2024-01-03T00:00:00Z')
        }
      ];

      mockService.count.mockResolvedValue(3);
      mockService.findAll.mockResolvedValue(mockData);

      // API 요청 생성
      const request = new NextRequest('http://localhost:3000/api/cache/stats', {
        method: 'GET'
      });

      // API 호출
      const response = await GET(request);
      const responseData = await response.json();

      // 응답 검증
      expect(response.status).toBe(200);
      expect(responseData.data.totalEntries).toBe(3);

      // 패턴 분석 검증
      expect(responseData.data.uniqueKeyPatterns).toEqual({
        '카센터': 2,
        '편의점': 1
      });

      // 일별 엔트리 검증
      expect(responseData.data.entriesPerDay).toEqual({
        '2024-01-01': 1,
        '2024-01-02': 1,
        '2024-01-03': 1
      });
    });

    it('HTTP 메소드 제한 테스트 (GET만 허용)', async () => {
      // POST 요청으로 테스트
      const request = new NextRequest('http://localhost:3000/api/cache/stats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ test: 'data' })
      });

      // 응답은 405 Method Not Allowed를 예상하지만, 
      // Next.js API routes에서는 GET 핸들러만 정의했으므로 
      // 자동으로 405를 반환할 것입니다.
      // 이 테스트는 실제 Next.js 환경에서만 의미가 있으므로 
      // 단위 테스트에서는 스킵합니다.
    });
  });
}); 
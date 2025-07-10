import { NextRequest } from 'next/server';
import { GET } from '@/app/api/cache/lookup/route';
import { TransactionCacheService } from '@/lib/services/transaction-cache';
import { prisma } from '@/lib/db/client';

// TransactionCacheService 모킹
jest.mock('@/lib/services/transaction-cache');
const MockedTransactionCacheService = TransactionCacheService as jest.MockedClass<typeof TransactionCacheService>;

describe('/api/cache/lookup API 테스트', () => {
  let mockService: jest.Mocked<TransactionCacheService>;

  beforeEach(() => {
    // 모든 모킹 초기화
    jest.clearAllMocks();
    
    // TransactionCacheService 인스턴스 모킹
    mockService = {
      findByHash: jest.fn(),
    } as any;
    
    MockedTransactionCacheService.mockImplementation(() => mockService);

    // 데이터베이스 정리
    prisma.transactionCache.deleteMany({});
  });

  afterAll(async () => {
    await prisma.transactionCache.deleteMany({});
    await prisma.$disconnect();
  });

  describe('GET /api/cache/lookup', () => {
    it('유효한 해시로 캐시 HIT 시 올바른 응답을 반환해야 함', async () => {
      const testHash = 'a'.repeat(64);
      const cachedData = {
        rawTextHash: testHash,
        rawText: '박광업 (대림카센터)',
        uniqueKey: '카센터_대림카센터_박광업',
        createdAt: new Date('2024-01-01T00:00:00Z')
      };

      // 모킹 설정: 캐시 HIT
      mockService.findByHash.mockResolvedValue(cachedData);

      // API 요청 생성
      const request = new NextRequest(`http://localhost:3000/api/cache/lookup?hash=${testHash}`);

      // API 호출
      const response = await GET(request);
      const responseData = await response.json();

      // 응답 검증
      expect(response.status).toBe(200);
      expect(responseData).toEqual({
        hit: true,
        data: {
          rawTextHash: testHash,
          rawText: '박광업 (대림카센터)',
          uniqueKey: '카센터_대림카센터_박광업',
          createdAt: '2024-01-01T00:00:00.000Z'
        },
        processingTime: expect.any(Number)
      });

      // 서비스 메소드 호출 검증
      expect(mockService.findByHash).toHaveBeenCalledWith(testHash);
      expect(mockService.findByHash).toHaveBeenCalledTimes(1);
    });

    it('유효한 해시로 캐시 MISS 시 올바른 응답을 반환해야 함', async () => {
      const testHash = 'b'.repeat(64);

      // 모킹 설정: 캐시 MISS
      mockService.findByHash.mockResolvedValue(null);

      // API 요청 생성
      const request = new NextRequest(`http://localhost:3000/api/cache/lookup?hash=${testHash}`);

      // API 호출
      const response = await GET(request);
      const responseData = await response.json();

      // 응답 검증
      expect(response.status).toBe(200);
      expect(responseData).toEqual({
        hit: false,
        data: null,
        processingTime: expect.any(Number)
      });

      // 서비스 메소드 호출 검증
      expect(mockService.findByHash).toHaveBeenCalledWith(testHash);
      expect(mockService.findByHash).toHaveBeenCalledTimes(1);
    });

    it('해시 파라미터가 없을 때 400 에러를 반환해야 함', async () => {
      // API 요청 생성 (해시 파라미터 없음)
      const request = new NextRequest('http://localhost:3000/api/cache/lookup');

      // API 호출
      const response = await GET(request);
      const responseData = await response.json();

      // 응답 검증
      expect(response.status).toBe(400);
      expect(responseData).toEqual({
        error: 'hash 파라미터가 필요합니다',
        code: 'MISSING_HASH_PARAMETER'
      });

      // 서비스 메소드가 호출되지 않아야 함
      expect(mockService.findByHash).not.toHaveBeenCalled();
    });

    it('잘못된 해시 형식일 때 400 에러를 반환해야 함', async () => {
      const invalidHash = 'invalid_hash';

      // 모킹 설정: 유효성 검증 에러
      mockService.findByHash.mockRejectedValue(new Error('해시는 64자리 16진수여야 합니다'));

      // API 요청 생성
      const request = new NextRequest(`http://localhost:3000/api/cache/lookup?hash=${invalidHash}`);

      // API 호출
      const response = await GET(request);
      const responseData = await response.json();

      // 응답 검증
      expect(response.status).toBe(400);
      expect(responseData).toEqual({
        error: '해시는 64자리 16진수여야 합니다',
        code: 'INVALID_HASH_FORMAT'
      });

      // 서비스 메소드 호출 검증
      expect(mockService.findByHash).toHaveBeenCalledWith(invalidHash);
    });

    it('데이터베이스 에러 시 500 에러를 반환해야 함', async () => {
      const testHash = 'c'.repeat(64);

      // 모킹 설정: 데이터베이스 에러
      mockService.findByHash.mockRejectedValue(new Error('Database connection failed'));

      // API 요청 생성
      const request = new NextRequest(`http://localhost:3000/api/cache/lookup?hash=${testHash}`);

      // API 호출
      const response = await GET(request);
      const responseData = await response.json();

      // 응답 검증
      expect(response.status).toBe(500);
      expect(responseData).toEqual({
        error: '캐시 조회 중 오류가 발생했습니다',
        code: 'CACHE_LOOKUP_ERROR'
      });

      // 서비스 메소드 호출 검증
      expect(mockService.findByHash).toHaveBeenCalledWith(testHash);
    });

    it('응답 시간이 10ms 미만이어야 함 (성능 테스트)', async () => {
      const testHash = 'd'.repeat(64);
      const cachedData = {
        rawTextHash: testHash,
        rawText: '성능 테스트',
        uniqueKey: '성능테스트키',
        createdAt: new Date()
      };

      // 모킹 설정: 빠른 응답
      mockService.findByHash.mockResolvedValue(cachedData);

      // API 요청 생성
      const request = new NextRequest(`http://localhost:3000/api/cache/lookup?hash=${testHash}`);

      // 성능 측정
      const startTime = Date.now();
      const response = await GET(request);
      const endTime = Date.now();
      const responseData = await response.json();

      // 응답 시간 검증
      expect(endTime - startTime).toBeLessThan(10);
      expect(responseData.processingTime).toBeLessThan(10);
      expect(response.status).toBe(200);
    });

    it('대량 요청 처리 성능 테스트 (100건)', async () => {
      const testHashes = Array.from({ length: 100 }, (_, i) => 
        i.toString().padStart(64, '0')
      );

      // 모킹 설정: 각 요청마다 다른 응답
      testHashes.forEach((hash, index) => {
        const cachedData = {
          rawTextHash: hash,
          rawText: `테스트 데이터 ${index}`,
          uniqueKey: `테스트키${index}`,
          createdAt: new Date()
        };
        mockService.findByHash.mockResolvedValueOnce(cachedData);
      });

      // 대량 요청 생성
      const requests = testHashes.map(hash => 
        new NextRequest(`http://localhost:3000/api/cache/lookup?hash=${hash}`)
      );

      // 성능 측정
      const startTime = Date.now();
      const responses = await Promise.all(
        requests.map(request => GET(request))
      );
      const endTime = Date.now();

      // 모든 응답이 성공해야 함
      for (const response of responses) {
        expect(response.status).toBe(200);
      }

      // 100건 처리 시간이 100ms 미만이어야 함
      expect(endTime - startTime).toBeLessThan(100);

      // 서비스 메소드가 100번 호출되어야 함
      expect(mockService.findByHash).toHaveBeenCalledTimes(100);
    });

    it('동시 요청 처리 안정성 테스트', async () => {
      const testHash = 'e'.repeat(64);
      const cachedData = {
        rawTextHash: testHash,
        rawText: '동시성 테스트',
        uniqueKey: '동시성테스트키',
        createdAt: new Date()
      };

      // 모킹 설정: 동일한 데이터 반복 반환
      mockService.findByHash.mockResolvedValue(cachedData);

      // 50개의 동시 요청 생성
      const simultaneousRequests = Array.from({ length: 50 }, () => {
        const request = new NextRequest(`http://localhost:3000/api/cache/lookup?hash=${testHash}`);
        return GET(request);
      });

      // 동시 실행
      const responses = await Promise.all(simultaneousRequests);

      // 모든 응답이 성공하고 동일해야 함
      for (const response of responses) {
        expect(response.status).toBe(200);
        const responseData = await response.json();
        expect(responseData.hit).toBe(true);
        expect(responseData.data.uniqueKey).toBe('동시성테스트키');
      }

      // 서비스 메소드가 50번 호출되어야 함
      expect(mockService.findByHash).toHaveBeenCalledTimes(50);
    });

    it('응답 데이터 형식이 정확해야 함', async () => {
      const testHash = 'f'.repeat(64);
      const cachedData = {
        rawTextHash: testHash,
        rawText: '데이터 형식 테스트',
        uniqueKey: '데이터형식테스트키',
        createdAt: new Date('2024-06-07T12:00:00Z')
      };

      // 모킹 설정
      mockService.findByHash.mockResolvedValue(cachedData);

      // API 요청 생성
      const request = new NextRequest(`http://localhost:3000/api/cache/lookup?hash=${testHash}`);

      // API 호출
      const response = await GET(request);
      const responseData = await response.json();

      // 응답 데이터 구조 검증
      expect(responseData).toHaveProperty('hit');
      expect(responseData).toHaveProperty('data');
      expect(responseData).toHaveProperty('processingTime');

      expect(typeof responseData.hit).toBe('boolean');
      expect(typeof responseData.processingTime).toBe('number');

      // data 객체 구조 검증
      expect(responseData.data).toHaveProperty('rawTextHash');
      expect(responseData.data).toHaveProperty('rawText');
      expect(responseData.data).toHaveProperty('uniqueKey');
      expect(responseData.data).toHaveProperty('createdAt');

      // 날짜 형식 검증 (ISO 문자열)
      expect(responseData.data.createdAt).toBe('2024-06-07T12:00:00.000Z');
    });
  });
}); 
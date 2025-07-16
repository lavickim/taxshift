import { NextRequest } from 'next/server';
import { POST } from '@/app/api/cache/store/route';
import { TransactionCacheService } from '@/lib/services/transaction-cache';
import { prisma } from '@/lib/db/client';

// TransactionCacheService 모킹
jest.mock('@/lib/services/transaction-cache');
const MockedTransactionCacheService = TransactionCacheService as jest.MockedClass<typeof TransactionCacheService>;

describe('/api/cache/store API 테스트', () => {
  let mockService: jest.Mocked<TransactionCacheService>;

  beforeEach(() => {
    // 모든 모킹 초기화
    jest.clearAllMocks();
    
    // TransactionCacheService 인스턴스 모킹
    mockService = {
      create: jest.fn(),
      upsert: jest.fn(),
    } as any;
    
    MockedTransactionCacheService.mockImplementation(() => mockService);

    // 데이터베이스 정리
    prisma.transactionCache.deleteMany({});
  });

  afterAll(async () => {
    await prisma.transactionCache.deleteMany({});
    await prisma.$disconnect();
  });

  describe('POST /api/cache/store', () => {
    it('새로운 캐시 데이터를 성공적으로 저장해야 함', async () => {
      const testData = {
        rawTextHash: 'a'.repeat(64),
        rawText: '박광업 (대림카센터)',
        uniqueKey: '카센터_대림카센터_박광업'
      };

      const createdData = {
        ...testData,
        createdAt: new Date('2024-01-01T00:00:00Z')
      };

      // 모킹 설정: 성공적인 생성
      mockService.create.mockResolvedValue(createdData);

      // API 요청 생성
      const request = new NextRequest('http://localhost:3000/api/cache/store', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testData)
      });

      // API 호출
      const response = await POST(request);
      const responseData = await response.json();

      // 응답 검증
      expect(response.status).toBe(201);
      expect(responseData).toEqual({
        success: true,
        data: {
          rawTextHash: testData.rawTextHash,
          rawText: testData.rawText,
          uniqueKey: testData.uniqueKey,
          createdAt: '2024-01-01T00:00:00.000Z'
        },
        processingTime: expect.any(Number)
      });

      // 서비스 메소드 호출 검증
      expect(mockService.create).toHaveBeenCalledWith(testData);
      expect(mockService.create).toHaveBeenCalledTimes(1);
    });

    it('이미 존재하는 해시로 upsert 옵션 사용 시 업데이트해야 함', async () => {
      const testData = {
        rawTextHash: 'b'.repeat(64),
        rawText: '지에스25이천하이',
        uniqueKey: '편의점_GS25_이천하이'
      };

      const upsertedData = {
        ...testData,
        uniqueKey: '편의점_GS25_이천하이_업데이트됨',
        createdAt: new Date('2024-01-01T00:00:00Z')
      };

      // 모킹 설정: upsert 성공
      mockService.upsert.mockResolvedValue(upsertedData);

      // API 요청 생성 (upsert=true)
      const request = new NextRequest('http://localhost:3000/api/cache/store?upsert=true', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testData)
      });

      // API 호출
      const response = await POST(request);
      const responseData = await response.json();

      // 응답 검증
      expect(response.status).toBe(200);
      expect(responseData).toEqual({
        success: true,
        data: {
          rawTextHash: testData.rawTextHash,
          rawText: testData.rawText,
          uniqueKey: '편의점_GS25_이천하이_업데이트됨',
          createdAt: '2024-01-01T00:00:00.000Z'
        },
        processingTime: expect.any(Number)
      });

      // 서비스 메소드 호출 검증
      expect(mockService.upsert).toHaveBeenCalledWith(
        testData.rawTextHash,
        testData,
        { uniqueKey: testData.uniqueKey }
      );
      expect(mockService.upsert).toHaveBeenCalledTimes(1);
    });

    it('필수 필드가 누락된 경우 400 에러를 반환해야 함', async () => {
      const invalidData = {
        rawTextHash: 'c'.repeat(64),
        // rawText 누락
        uniqueKey: '테스트키'
      };

      // API 요청 생성
      const request = new NextRequest('http://localhost:3000/api/cache/store', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invalidData)
      });

      // API 호출
      const response = await POST(request);
      const responseData = await response.json();

      // 응답 검증
      expect(response.status).toBe(400);
      expect(responseData).toEqual({
        error: '필수 필드가 누락되었습니다: rawText',
        code: 'MISSING_REQUIRED_FIELD'
      });

      // 서비스 메소드가 호출되지 않아야 함
      expect(mockService.create).not.toHaveBeenCalled();
      expect(mockService.upsert).not.toHaveBeenCalled();
    });

    it('잘못된 JSON 형식인 경우 400 에러를 반환해야 함', async () => {
      // API 요청 생성 (잘못된 JSON)
      const request = new NextRequest('http://localhost:3000/api/cache/store', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: 'invalid json'
      });

      // API 호출
      const response = await POST(request);
      const responseData = await response.json();

      // 응답 검증
      expect(response.status).toBe(400);
      expect(responseData).toEqual({
        error: '잘못된 JSON 형식입니다',
        code: 'INVALID_JSON_FORMAT'
      });

      // 서비스 메소드가 호출되지 않아야 함
      expect(mockService.create).not.toHaveBeenCalled();
    });

    it('잘못된 해시 형식인 경우 400 에러를 반환해야 함', async () => {
      const testData = {
        rawTextHash: 'invalid_hash',
        rawText: '테스트',
        uniqueKey: '테스트키'
      };

      // 모킹 설정: 유효성 검증 에러
      mockService.create.mockRejectedValue(new Error('해시는 64자리 16진수여야 합니다'));

      // API 요청 생성
      const request = new NextRequest('http://localhost:3000/api/cache/store', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testData)
      });

      // API 호출
      const response = await POST(request);
      const responseData = await response.json();

      // 응답 검증
      expect(response.status).toBe(400);
      expect(responseData).toEqual({
        error: '해시는 64자리 16진수여야 합니다',
        code: 'INVALID_HASH_FORMAT'
      });

      // 서비스 메소드 호출 검증
      expect(mockService.create).toHaveBeenCalledWith(testData);
    });

    it('중복된 해시로 생성 시도 시 409 에러를 반환해야 함', async () => {
      const testData = {
        rawTextHash: 'd'.repeat(64),
        rawText: '중복 테스트',
        uniqueKey: '중복테스트키'
      };

      // 모킹 설정: 중복 에러
      mockService.create.mockRejectedValue(new Error('이미 존재하는 해시입니다'));

      // API 요청 생성
      const request = new NextRequest('http://localhost:3000/api/cache/store', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testData)
      });

      // API 호출
      const response = await POST(request);
      const responseData = await response.json();

      // 응답 검증
      expect(response.status).toBe(409);
      expect(responseData).toEqual({
        error: '이미 존재하는 해시입니다',
        code: 'DUPLICATE_HASH'
      });

      // 서비스 메소드 호출 검증
      expect(mockService.create).toHaveBeenCalledWith(testData);
    });

    it('데이터베이스 에러 시 500 에러를 반환해야 함', async () => {
      const testData = {
        rawTextHash: 'e'.repeat(64),
        rawText: '데이터베이스 에러 테스트',
        uniqueKey: '데이터베이스에러테스트키'
      };

      // 모킹 설정: 데이터베이스 에러
      mockService.create.mockRejectedValue(new Error('Database connection failed'));

      // API 요청 생성
      const request = new NextRequest('http://localhost:3000/api/cache/store', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testData)
      });

      // API 호출
      const response = await POST(request);
      const responseData = await response.json();

      // 응답 검증
      expect(response.status).toBe(500);
      expect(responseData).toEqual({
        error: '캐시 저장 중 오류가 발생했습니다',
        code: 'CACHE_STORE_ERROR'
      });

      // 서비스 메소드 호출 검증
      expect(mockService.create).toHaveBeenCalledWith(testData);
    });

    it('저장 성능이 10ms 미만이어야 함 (성능 테스트)', async () => {
      const testData = {
        rawTextHash: 'f'.repeat(64),
        rawText: '성능 테스트',
        uniqueKey: '성능테스트키'
      };

      const createdData = {
        ...testData,
        createdAt: new Date()
      };

      // 모킹 설정: 빠른 응답
      mockService.create.mockResolvedValue(createdData);

      // API 요청 생성
      const request = new NextRequest('http://localhost:3000/api/cache/store', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testData)
      });

      // 성능 측정
      const startTime = Date.now();
      const response = await POST(request);
      const endTime = Date.now();
      const responseData = await response.json();

      // 응답 시간 검증
      expect(endTime - startTime).toBeLessThan(10);
      expect(responseData.processingTime).toBeLessThan(10);
      expect(response.status).toBe(201);
    });

    it('대량 저장 요청 처리 성능 테스트 (50건)', async () => {
      const testDataArray = Array.from({ length: 50 }, (_, i) => ({
        rawTextHash: i.toString().padStart(64, '0'),
        rawText: `테스트 데이터 ${i}`,
        uniqueKey: `테스트키${i}`
      }));

      // 모킹 설정: 각 요청마다 다른 응답
      testDataArray.forEach((testData, index) => {
        const createdData = {
          ...testData,
          createdAt: new Date()
        };
        mockService.create.mockResolvedValueOnce(createdData);
      });

      // 대량 요청 생성
      const requests = testDataArray.map(testData => 
        new NextRequest('http://localhost:3000/api/cache/store', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(testData)
        })
      );

      // 성능 측정
      const startTime = Date.now();
      const responses = await Promise.all(
        requests.map(request => POST(request))
      );
      const endTime = Date.now();

      // 모든 응답이 성공해야 함
      for (const response of responses) {
        expect(response.status).toBe(201);
      }

      // 50건 처리 시간이 200ms 미만이어야 함
      expect(endTime - startTime).toBeLessThan(200);

      // 서비스 메소드가 50번 호출되어야 함
      expect(mockService.create).toHaveBeenCalledTimes(50);
    });

    it('동시 저장 요청 처리 안정성 테스트', async () => {
      const testDataArray = Array.from({ length: 20 }, (_, i) => ({
        rawTextHash: (100 + i).toString().padStart(64, '0'),
        rawText: `동시성 테스트 ${i}`,
        uniqueKey: `동시성테스트키${i}`
      }));

      // 모킹 설정: 각 요청에 대해 성공 응답
      testDataArray.forEach(testData => {
        const createdData = {
          ...testData,
          createdAt: new Date()
        };
        mockService.create.mockResolvedValueOnce(createdData);
      });

      // 20개의 동시 요청 생성
      const simultaneousRequests = testDataArray.map(testData => {
        const request = new NextRequest('http://localhost:3000/api/cache/store', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(testData)
        });
        return POST(request);
      });

      // 동시 실행
      const responses = await Promise.all(simultaneousRequests);

      // 모든 응답이 성공해야 함
      for (const response of responses) {
        expect(response.status).toBe(201);
        const responseData = await response.json();
        expect(responseData.success).toBe(true);
      }

      // 서비스 메소드가 20번 호출되어야 함
      expect(mockService.create).toHaveBeenCalledTimes(20);
    });

    it('응답 데이터 형식이 정확해야 함', async () => {
      const testData = {
        rawTextHash: '1'.repeat(64),
        rawText: '데이터 형식 테스트',
        uniqueKey: '데이터형식테스트키'
      };

      const createdData = {
        ...testData,
        createdAt: new Date('2024-06-07T12:00:00Z')
      };

      // 모킹 설정
      mockService.create.mockResolvedValue(createdData);

      // API 요청 생성
      const request = new NextRequest('http://localhost:3000/api/cache/store', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testData)
      });

      // API 호출
      const response = await POST(request);
      const responseData = await response.json();

      // 응답 데이터 구조 검증
      expect(responseData).toHaveProperty('success');
      expect(responseData).toHaveProperty('data');
      expect(responseData).toHaveProperty('processingTime');

      expect(typeof responseData.success).toBe('boolean');
      expect(typeof responseData.processingTime).toBe('number');

      // data 객체 구조 검증
      expect(responseData.data).toHaveProperty('rawTextHash');
      expect(responseData.data).toHaveProperty('rawText');
      expect(responseData.data).toHaveProperty('uniqueKey');
      expect(responseData.data).toHaveProperty('createdAt');

      // 날짜 형식 검증 (ISO 문자열)
      expect(responseData.data.createdAt).toBe('2024-06-07T12:00:00.000Z');
    });

    it('모든 필수 필드 검증 테스트', async () => {
      const testCases = [
        { field: 'rawTextHash', data: { rawText: '테스트', uniqueKey: '테스트키' } },
        { field: 'rawText', data: { rawTextHash: 'a'.repeat(64), uniqueKey: '테스트키' } },
        { field: 'uniqueKey', data: { rawTextHash: 'a'.repeat(64), rawText: '테스트' } },
      ];

      for (const testCase of testCases) {
        // API 요청 생성
        const request = new NextRequest('http://localhost:3000/api/cache/store', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(testCase.data)
        });

        // API 호출
        const response = await POST(request);
        const responseData = await response.json();

        // 응답 검증
        expect(response.status).toBe(400);
        expect(responseData.error).toContain(`필수 필드가 누락되었습니다: ${testCase.field}`);
        expect(responseData.code).toBe('MISSING_REQUIRED_FIELD');
      }

      // 서비스 메소드가 호출되지 않아야 함
      expect(mockService.create).not.toHaveBeenCalled();
    });
  });
}); 
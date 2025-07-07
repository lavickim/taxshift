import { TransactionCacheService } from '@/lib/services/transaction-cache';
import { prisma } from '@/lib/db/client';

describe('TransactionCacheService 클래스 테스트', () => {
  let service: TransactionCacheService;

  beforeEach(async () => {
    // 각 테스트 전에 서비스 인스턴스 생성 및 데이터 정리
    service = new TransactionCacheService();
    await prisma.transactionCache.deleteMany({});
  });

  afterAll(async () => {
    await prisma.transactionCache.deleteMany({});
    await prisma.$disconnect();
  });

  describe('create() - 캐시 데이터 생성', () => {
    it('새로운 거래 캐시를 생성할 수 있어야 함', async () => {
      const testData = {
        rawTextHash: 'a'.repeat(64),
        rawText: '박광업 (대림카센터)',
        uniqueKey: '카센터_대림카센터_박광업'
      };

      const created = await service.create(testData);

      expect(created.rawTextHash).toBe(testData.rawTextHash);
      expect(created.rawText).toBe(testData.rawText);
      expect(created.uniqueKey).toBe(testData.uniqueKey);
      expect(created.createdAt).toBeInstanceOf(Date);
    });

    it('중복된 해시로 생성 시도 시 에러를 던져야 함', async () => {
      const testData = {
        rawTextHash: 'b'.repeat(64),
        rawText: '지에스25이천하이',
        uniqueKey: '편의점_GS25_이천하이'
      };

      await service.create(testData);

      await expect(service.create(testData)).rejects.toThrow('이미 존재하는 해시입니다');
    });

    it('잘못된 해시 형식 시 에러를 던져야 함', async () => {
      const invalidData = {
        rawTextHash: 'invalid_hash', // 64자가 아님
        rawText: '테스트',
        uniqueKey: '테스트키'
      };

      await expect(service.create(invalidData)).rejects.toThrow('해시는 64자리 16진수여야 합니다');
    });

    it('빈 문자열 입력 시 에러를 던져야 함', async () => {
      const emptyData = {
        rawTextHash: 'c'.repeat(64),
        rawText: '', // 빈 문자열
        uniqueKey: '테스트키'
      };

      await expect(service.create(emptyData)).rejects.toThrow('rawText는 비어있을 수 없습니다');
    });
  });

  describe('findByHash() - 해시로 캐시 조회', () => {
    beforeEach(async () => {
      await service.create({
        rawTextHash: 'd'.repeat(64),
        rawText: '세븐일레븐 충주기업',
        uniqueKey: '편의점_세븐일레븐_충주기업'
      });
    });

    it('존재하는 해시로 데이터를 조회할 수 있어야 함', async () => {
      const hash = 'd'.repeat(64);
      const found = await service.findByHash(hash);

      expect(found).not.toBeNull();
      expect(found?.rawTextHash).toBe(hash);
      expect(found?.rawText).toBe('세븐일레븐 충주기업');
      expect(found?.uniqueKey).toBe('편의점_세븐일레븐_충주기업');
    });

    it('존재하지 않는 해시 조회 시 null을 반환해야 함', async () => {
      const nonExistentHash = 'f'.repeat(64);
      const found = await service.findByHash(nonExistentHash);

      expect(found).toBeNull();
    });

    it('잘못된 해시 형식 시 에러를 던져야 함', async () => {
      await expect(service.findByHash('invalid')).rejects.toThrow('해시는 64자리 16진수여야 합니다');
    });

    it('조회 성능이 50ms 미만이어야 함', async () => {
      const hash = 'd'.repeat(64);
      
      const startTime = Date.now();
      await service.findByHash(hash);
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(50);
    });
  });

  describe('findAll() - 모든 캐시 조회', () => {
    beforeEach(async () => {
      const testData = [
        {
          rawTextHash: 'e'.repeat(64),
          rawText: '(주)부자 충주(상)주',
          uniqueKey: '주유소_부자주유소_충주'
        },
        {
          rawTextHash: 'f'.repeat(64),
          rawText: '구글페이먼트코리아',
          uniqueKey: '온라인서비스_구글_결제'
        }
      ];

      for (const data of testData) {
        await service.create(data);
      }
    });

    it('모든 캐시 데이터를 조회할 수 있어야 함', async () => {
      const allCaches = await service.findAll();

      expect(allCaches).toHaveLength(2);
      expect(allCaches.some(cache => cache.rawText === '(주)부자 충주(상)주')).toBe(true);
      expect(allCaches.some(cache => cache.rawText === '구글페이먼트코리아')).toBe(true);
    });

    it('생성 순서대로 정렬되어 반환되어야 함', async () => {
      const allCaches = await service.findAll();

      expect(allCaches[0].createdAt.getTime()).toBeLessThanOrEqual(allCaches[1].createdAt.getTime());
    });
  });

  describe('count() - 데이터 개수 조회', () => {
    it('빈 테이블의 개수는 0이어야 함', async () => {
      const count = await service.count();
      expect(count).toBe(0);
    });

    it('데이터 추가 후 개수가 증가해야 함', async () => {
      await service.create({
        rawTextHash: '1'.repeat(64),
        rawText: '건강보험료',
        uniqueKey: '복리후생비_건강보험_회사부담분'
      });

      const count = await service.count();
      expect(count).toBe(1);
    });
  });

  describe('update() - 캐시 데이터 수정', () => {
    beforeEach(async () => {
      await service.create({
        rawTextHash: '2'.repeat(64),
        rawText: 'DNH*GODADDY#32131232131123',
        uniqueKey: '온라인서비스_GoDaddy_도메인'
      });
    });

    it('존재하는 캐시의 uniqueKey를 수정할 수 있어야 함', async () => {
      const hash = '2'.repeat(64);
      const newUniqueKey = '온라인서비스_GoDaddy_도메인_수정됨';

      const updated = await service.update(hash, { uniqueKey: newUniqueKey });

      expect(updated.uniqueKey).toBe(newUniqueKey);
      expect(updated.rawText).toBe('DNH*GODADDY#32131232131123'); // 원본 유지
    });

    it('존재하지 않는 해시 수정 시도 시 에러를 던져야 함', async () => {
      const nonExistentHash = 'a'.repeat(64);

      await expect(
        service.update(nonExistentHash, { uniqueKey: '새로운키' })
      ).rejects.toThrow('해당 해시의 캐시를 찾을 수 없습니다');
    });

    it('잘못된 해시 형식 시 에러를 던져야 함', async () => {
      await expect(
        service.update('invalid', { uniqueKey: '새로운키' })
      ).rejects.toThrow('해시는 64자리 16진수여야 합니다');
    });
  });

  describe('delete() - 캐시 데이터 삭제', () => {
    beforeEach(async () => {
      await service.create({
        rawTextHash: '3'.repeat(64),
        rawText: '김용훈',
        uniqueKey: '개인_김용훈_급여'
      });
    });

    it('존재하는 캐시를 삭제할 수 있어야 함', async () => {
      const hash = '3'.repeat(64);

      const deleted = await service.delete(hash);

      expect(deleted.rawTextHash).toBe(hash);

      // 삭제 확인
      const found = await service.findByHash(hash);
      expect(found).toBeNull();
    });

    it('존재하지 않는 해시 삭제 시도 시 에러를 던져야 함', async () => {
      const nonExistentHash = 'b'.repeat(64);

      await expect(service.delete(nonExistentHash)).rejects.toThrow('해당 해시의 캐시를 찾을 수 없습니다');
    });

    it('잘못된 해시 형식 시 에러를 던져야 함', async () => {
      await expect(service.delete('invalid')).rejects.toThrow('해시는 64자리 16진수여야 합니다');
    });
  });

  describe('deleteAll() - 모든 캐시 데이터 삭제', () => {
    beforeEach(async () => {
      await service.create({
        rawTextHash: '4'.repeat(64),
        rawText: '체크입금',
        uniqueKey: '입금_체크카드_미분류'
      });
      await service.create({
        rawTextHash: '5'.repeat(64),
        rawText: '테스트 데이터',
        uniqueKey: '테스트키'
      });
    });

    it('모든 캐시 데이터를 삭제할 수 있어야 함', async () => {
      const deleteResult = await service.deleteAll();

      expect(deleteResult.count).toBe(2);

      // 삭제 확인
      const count = await service.count();
      expect(count).toBe(0);
    });
  });

  describe('upsert() - 캐시 데이터 생성 또는 업데이트', () => {
    it('존재하지 않는 데이터는 새로 생성해야 함', async () => {
      const hash = '6'.repeat(64);
      const testData = {
        rawTextHash: hash,
        rawText: '새로운 거래',
        uniqueKey: '새로운키'
      };

      const upserted = await service.upsert(hash, testData, { uniqueKey: '업데이트키' });

      expect(upserted.rawTextHash).toBe(hash);
      expect(upserted.rawText).toBe('새로운 거래');
      expect(upserted.uniqueKey).toBe('새로운키'); // create된 값
    });

    it('이미 존재하는 데이터는 업데이트해야 함', async () => {
      const hash = '7'.repeat(64);
      
      // 먼저 데이터 생성
      await service.create({
        rawTextHash: hash,
        rawText: '기존 거래',
        uniqueKey: '기존키'
      });

      // upsert로 업데이트
      const upserted = await service.upsert(
        hash,
        { rawTextHash: hash, rawText: '새로운 거래', uniqueKey: '새로운키' },
        { uniqueKey: '업데이트된키' }
      );

      expect(upserted.rawTextHash).toBe(hash);
      expect(upserted.rawText).toBe('기존 거래'); // 원본 유지
      expect(upserted.uniqueKey).toBe('업데이트된키'); // update된 값
    });
  });

  describe('성능 테스트', () => {
    it('대량 데이터 처리 성능 테스트', async () => {
      // 100개의 테스트 데이터 생성
      const testData = Array.from({ length: 100 }, (_, i) => ({
        rawTextHash: i.toString().padStart(64, '0'),
        rawText: `테스트거래${i}`,
        uniqueKey: `테스트키${i}`
      }));

      const startTime = Date.now();
      
      // 대량 생성
      for (const data of testData) {
        await service.create(data);
      }

      const endTime = Date.now();
      
      // 100건 생성이 3초 미만이어야 함
      expect(endTime - startTime).toBeLessThan(3000);

      // 데이터 확인
      const count = await service.count();
      expect(count).toBe(100);
    });

    it('조회 성능 최적화 테스트', async () => {
      // 테스트 데이터 생성
      await service.create({
        rawTextHash: '8'.repeat(64),
        rawText: '성능 테스트',
        uniqueKey: '성능테스트키'
      });

      // 100번 조회 성능 측정
      const queries = Array.from({ length: 100 }, () => service.findByHash('8'.repeat(64)));
      
      const startTime = Date.now();
      await Promise.all(queries);
      const endTime = Date.now();

      // 100번 조회가 500ms 미만이어야 함 (평균 5ms)
      expect(endTime - startTime).toBeLessThan(500);
    });
  });

  describe('유효성 검증', () => {
    it('해시 형식 검증이 정확해야 함', async () => {
      const validHash = 'a'.repeat(64);
      const invalidHashes = [
        'short',                    // 너무 짧음
        'a'.repeat(63),            // 63자
        'a'.repeat(65),            // 65자
        'z'.repeat(64),            // 잘못된 16진수 (z는 16진수가 아님)
        'A'.repeat(64),            // 대문자 (소문자만 허용)
      ];

      // 유효한 해시는 통과
      expect(() => service['validateHash'](validHash)).not.toThrow();

      // 잘못된 해시들은 에러 발생
      for (const invalidHash of invalidHashes) {
        expect(() => service['validateHash'](invalidHash)).toThrow();
      }
    });

    it('입력 데이터 검증이 정확해야 함', async () => {
      const validData = {
        rawTextHash: 'a'.repeat(64),
        rawText: '유효한 텍스트',
        uniqueKey: '유효한키'
      };

      const invalidDataSets = [
        { ...validData, rawText: '' },           // 빈 rawText
        { ...validData, rawText: '   ' },        // 공백만 있는 rawText
        { ...validData, uniqueKey: '' },         // 빈 uniqueKey
        { ...validData, uniqueKey: '   ' },      // 공백만 있는 uniqueKey
      ];

      // 유효한 데이터는 통과
      expect(() => service['validateCreateData'](validData)).not.toThrow();

      // 잘못된 데이터들은 에러 발생
      for (const invalidData of invalidDataSets) {
        expect(() => service['validateCreateData'](invalidData)).toThrow();
      }
    });
  });
}); 
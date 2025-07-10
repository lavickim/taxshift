import { prisma } from '@/lib/db/client';

describe('TransactionCache 테이블 CRUD 테스트', () => {
  // 테스트 전 데이터 정리
  beforeEach(async () => {
    await prisma.transactionCache.deleteMany({});
  });

  // 테스트 후 정리
  afterAll(async () => {
    await prisma.transactionCache.deleteMany({});
    await prisma.$disconnect();
  });

  describe('CREATE - 캐시 데이터 생성', () => {
    it('새로운 거래 캐시를 생성할 수 있어야 함', async () => {
      const testData = {
        rawTextHash: 'a'.repeat(64), // 64자리 해시
        rawText: '박광업 (대림카센터)',
        uniqueKey: '카센터_대림카센터_박광업'
      };

      const created = await prisma.transactionCache.create({
        data: testData
      });

      expect(created.rawTextHash).toBe(testData.rawTextHash);
      expect(created.rawText).toBe(testData.rawText);
      expect(created.uniqueKey).toBe(testData.uniqueKey);
      expect(created.createdAt).toBeInstanceOf(Date);
    });

    it('동일한 해시로 중복 생성 시도 시 에러가 발생해야 함', async () => {
      const testData = {
        rawTextHash: 'b'.repeat(64),
        rawText: '지에스25이천하이',
        uniqueKey: '편의점_GS25_이천하이'
      };

      // 첫 번째 생성
      await prisma.transactionCache.create({ data: testData });

      // 동일한 해시로 중복 생성 시도
      await expect(
        prisma.transactionCache.create({ data: testData })
      ).rejects.toThrow();
    });
  });

  describe('READ - 캐시 데이터 조회', () => {
    beforeEach(async () => {
      // 테스트 데이터 준비
      await prisma.transactionCache.createMany({
        data: [
          {
            rawTextHash: 'c'.repeat(64),
            rawText: '세븐일레븐 충주기업',
            uniqueKey: '편의점_세븐일레븐_충주기업'
          },
          {
            rawTextHash: 'd'.repeat(64),
            rawText: '(주)부자 충주(상)주',
            uniqueKey: '주유소_부자주유소_충주'
          }
        ]
      });
    });

    it('해시로 단일 캐시 데이터를 조회할 수 있어야 함', async () => {
      const hash = 'c'.repeat(64);
      
      const found = await prisma.transactionCache.findUnique({
        where: { rawTextHash: hash }
      });

      expect(found).not.toBeNull();
      expect(found?.rawTextHash).toBe(hash);
      expect(found?.rawText).toBe('세븐일레븐 충주기업');
      expect(found?.uniqueKey).toBe('편의점_세븐일레븐_충주기업');
    });

    it('존재하지 않는 해시 조회 시 null을 반환해야 함', async () => {
      const nonExistentHash = 'z'.repeat(64);
      
      const found = await prisma.transactionCache.findUnique({
        where: { rawTextHash: nonExistentHash }
      });

      expect(found).toBeNull();
    });

    it('모든 캐시 데이터를 조회할 수 있어야 함', async () => {
      const allCaches = await prisma.transactionCache.findMany({
        orderBy: { createdAt: 'asc' }
      });

      expect(allCaches).toHaveLength(2);
      expect(allCaches[0].rawText).toBe('세븐일레븐 충주기업');
      expect(allCaches[1].rawText).toBe('(주)부자 충주(상)주');
    });

    it('캐시 데이터 개수를 조회할 수 있어야 함', async () => {
      const count = await prisma.transactionCache.count();
      expect(count).toBe(2);
    });
  });

  describe('UPDATE - 캐시 데이터 수정', () => {
    beforeEach(async () => {
      await prisma.transactionCache.create({
        data: {
          rawTextHash: 'e'.repeat(64),
          rawText: '구글페이먼트코리아',
          uniqueKey: '온라인서비스_구글_결제'
        }
      });
    });

    it('존재하는 캐시의 uniqueKey를 수정할 수 있어야 함', async () => {
      const hash = 'e'.repeat(64);
      const newUniqueKey = '온라인서비스_구글페이_결제시스템';

      const updated = await prisma.transactionCache.update({
        where: { rawTextHash: hash },
        data: { uniqueKey: newUniqueKey }
      });

      expect(updated.uniqueKey).toBe(newUniqueKey);
      expect(updated.rawText).toBe('구글페이먼트코리아'); // 다른 필드는 변경되지 않아야 함
    });

    it('존재하지 않는 캐시 수정 시도 시 에러가 발생해야 함', async () => {
      const nonExistentHash = 'y'.repeat(64);

      await expect(
        prisma.transactionCache.update({
          where: { rawTextHash: nonExistentHash },
          data: { uniqueKey: '새로운키' }
        })
      ).rejects.toThrow();
    });
  });

  describe('DELETE - 캐시 데이터 삭제', () => {
    beforeEach(async () => {
      await prisma.transactionCache.createMany({
        data: [
          {
            rawTextHash: 'f'.repeat(64),
            rawText: '건강보험료',
            uniqueKey: '복리후생비_건강보험_회사부담분'
          },
          {
            rawTextHash: 'g'.repeat(64),
            rawText: 'DNH*GODADDY#32131232131123',
            uniqueKey: '온라인서비스_GoDaddy_도메인'
          }
        ]
      });
    });

    it('해시로 특정 캐시 데이터를 삭제할 수 있어야 함', async () => {
      const hashToDelete = 'f'.repeat(64);

      const deleted = await prisma.transactionCache.delete({
        where: { rawTextHash: hashToDelete }
      });

      expect(deleted.rawTextHash).toBe(hashToDelete);

      // 삭제 확인
      const found = await prisma.transactionCache.findUnique({
        where: { rawTextHash: hashToDelete }
      });
      expect(found).toBeNull();

      // 다른 데이터는 여전히 존재해야 함
      const remaining = await prisma.transactionCache.count();
      expect(remaining).toBe(1);
    });

    it('존재하지 않는 캐시 삭제 시도 시 에러가 발생해야 함', async () => {
      const nonExistentHash = 'x'.repeat(64);

      await expect(
        prisma.transactionCache.delete({
          where: { rawTextHash: nonExistentHash }
        })
      ).rejects.toThrow();
    });

    it('모든 캐시 데이터를 삭제할 수 있어야 함', async () => {
      const deleteResult = await prisma.transactionCache.deleteMany({});
      
      expect(deleteResult.count).toBe(2);

      // 삭제 확인
      const count = await prisma.transactionCache.count();
      expect(count).toBe(0);
    });
  });

  describe('UPSERT - 캐시 데이터 생성 또는 업데이트', () => {
    it('존재하지 않는 데이터는 새로 생성해야 함', async () => {
      const hash = 'h'.repeat(64);
      const testData = {
        rawTextHash: hash,
        rawText: '김용훈',
        uniqueKey: '개인_김용훈_급여'
      };

      const upserted = await prisma.transactionCache.upsert({
        where: { rawTextHash: hash },
        create: testData,
        update: { uniqueKey: '업데이트된키' }
      });

      expect(upserted.rawTextHash).toBe(hash);
      expect(upserted.rawText).toBe('김용훈');
      expect(upserted.uniqueKey).toBe('개인_김용훈_급여'); // create된 값
    });

    it('이미 존재하는 데이터는 업데이트해야 함', async () => {
      const hash = 'i'.repeat(64);
      
      // 먼저 데이터 생성
      await prisma.transactionCache.create({
        data: {
          rawTextHash: hash,
          rawText: '체크입금',
          uniqueKey: '입금_체크카드_미분류'
        }
      });

      // upsert로 업데이트
      const upserted = await prisma.transactionCache.upsert({
        where: { rawTextHash: hash },
        create: {
          rawTextHash: hash,
          rawText: '새로운텍스트',
          uniqueKey: '새로운키'
        },
        update: { uniqueKey: '입금_체크카드_확인됨' }
      });

      expect(upserted.rawTextHash).toBe(hash);
      expect(upserted.rawText).toBe('체크입금'); // 원본 유지
      expect(upserted.uniqueKey).toBe('입금_체크카드_확인됨'); // update된 값
    });
  });

  describe('성능 및 인덱스 테스트', () => {
    it('대량 데이터 삽입 후 해시 조회 성능 테스트', async () => {
      // 1000개의 테스트 데이터 생성
      const testData = Array.from({ length: 1000 }, (_, i) => ({
        rawTextHash: i.toString().padStart(64, '0'),
        rawText: `테스트거래${i}`,
        uniqueKey: `테스트키${i}`
      }));

      await prisma.transactionCache.createMany({ data: testData });

      // 조회 성능 측정
      const startTime = Date.now();
      const found = await prisma.transactionCache.findUnique({
        where: { rawTextHash: '0'.repeat(59) + '00500' }
      });
      const endTime = Date.now();

      expect(found).not.toBeNull();
      expect(found?.uniqueKey).toBe('테스트키500');
      
      // 조회 시간이 100ms 미만이어야 함 (인덱스 성능 검증)
      expect(endTime - startTime).toBeLessThan(100);
    });
  });
}); 
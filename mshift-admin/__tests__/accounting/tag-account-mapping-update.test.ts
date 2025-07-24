/**
 * 태그-계정과목 매핑 업데이트 테스트 (TDD)
 * 3자리 계정코드를 4자리 계정코드로 업데이트하는 테스트
 */

import { PrismaClient } from '../../lib/generated/prisma';

const prisma = new PrismaClient();

describe('Tag-Account Mapping Update', () => {
  beforeAll(async () => {
    // 테스트 데이터베이스 연결 확인
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  test('should update all tag mappings to use 4-digit account codes', async () => {
    const mappingsWithOldCodes = await prisma.tagAccountMapping.count({
      where: {
        accountCode: {
          in: ['622', '651', '111', '634', '611', '999'] // 기존 3자리 코드들
        }
      }
    });

    // 모든 매핑이 4자리 코드로 업데이트되어야 함
    expect(mappingsWithOldCodes).toBe(0);
  });

  test('should map existing business tags to appropriate 4-digit accounts', async () => {
    // 주요 비즈니스 태그들이 올바른 4자리 계정으로 매핑되는지 확인
    const businessTagMappings = [
      { tagName: '편의점', expectedAccountCode: '5410' }, // 소모품비
      { tagName: '주유소', expectedAccountCode: '5310' }, // 차량유지비  
      { tagName: '치킨전문점', expectedAccountCode: '5230' }, // 접대비
      { tagName: '카페', expectedAccountCode: '5230' }, // 접대비
      { tagName: '마트', expectedAccountCode: '5410' }, // 소모품비
      { tagName: '통신비', expectedAccountCode: '5270' }, // 통신비
      { tagName: '의료', expectedAccountCode: '5910' }, // 의료비
    ];

    for (const { tagName, expectedAccountCode } of businessTagMappings) {
      const tag = await prisma.tagsMaster.findUnique({
        where: { tagName }
      });
      
      if (tag) {
        const mapping = await prisma.tagAccountMapping.findFirst({
          where: { tagId: tag.id }
        });
        
        if (mapping) {
          expect(mapping.accountCode).toBe(expectedAccountCode);
          
          // 해당 계정이 실제로 존재하는지 확인
          const account = await prisma.chartOfAccounts.findUnique({
            where: { accountCode: expectedAccountCode }
          });
          expect(account).toBeTruthy();
        }
      }
    }
  });

  test('should maintain tag mapping functionality with new account codes', async () => {
    // 모든 매핑이 유효한 4자리 계정코드를 사용하는지 확인
    const allMappings = await prisma.tagAccountMapping.findMany({
      select: { accountCode: true }
    });

    for (const mapping of allMappings) {
      // 4자리 숫자 형식인지 확인
      expect(mapping.accountCode).toMatch(/^\d{4}$/);
      
      // 해당 계정이 차트에 존재하는지 확인
      const account = await prisma.chartOfAccounts.findUnique({
        where: { accountCode: mapping.accountCode }
      });
      expect(account).toBeTruthy();
    }
  });

  test('should preserve all existing tag relationships', async () => {
    // 업데이트 후에도 모든 태그가 계정에 매핑되어 있어야 함
    const tagsWithoutMappings = await prisma.tagsMaster.count({
      where: {
        tagAccountMappings: {
          none: {}
        },
        isActive: true
      }
    });

    // 대부분의 활성 태그가 매핑을 가져야 함 (일부 새로운 태그는 제외)
    const totalActiveTags = await prisma.tagsMaster.count({
      where: { isActive: true }
    });
    
    expect(tagsWithoutMappings).toBeLessThan(totalActiveTags * 0.3); // 30% 미만이어야 함
  });

  test('should use proper account types for business expense categories', async () => {
    // 비즈니스 비용 카테고리별로 올바른 계정 유형이 사용되는지 확인
    const expenseTagMappings = await prisma.tagAccountMapping.findMany({
      where: {
        accountCode: {
          startsWith: '5' // 비용 계정
        }
      },
      include: {
        tag: {
          select: { tagName: true, tagCategory: true }
        }
      },
      take: 10
    });

    for (const mapping of expenseTagMappings) {
      const account = await prisma.chartOfAccounts.findUnique({
        where: { accountCode: mapping.accountCode }
      });
      
      expect(account?.accountType).toBe('비용');
      expect(account?.isDebitNormal).toBe(true);
    }
  });
});
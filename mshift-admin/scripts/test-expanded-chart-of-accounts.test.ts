#!/usr/bin/env ts-node

/**
 * 확장된 계정과목 테스트
 * TDD 원칙에 따라 200+ 계정과목 시스템을 테스트합니다.
 */

import { PrismaClient } from '../lib/generated/prisma';

const prisma = new PrismaClient();

describe('Expanded Chart of Accounts', () => {
  beforeAll(async () => {
    // 테스트 환경 설정
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  test('should have 200+ chart of accounts after expansion', async () => {
    const accountCount = await prisma.chartOfAccounts.count();
    expect(accountCount).toBeGreaterThanOrEqual(200);
  });

  test('should have proper account hierarchy structure', async () => {
    // 자산 계정 (1000번대) 최소 50개
    const assetAccounts = await prisma.chartOfAccounts.count({
      where: { accountType: '자산' }
    });
    expect(assetAccounts).toBeGreaterThanOrEqual(50);

    // 부채 계정 (2000번대) 최소 30개  
    const liabilityAccounts = await prisma.chartOfAccounts.count({
      where: { accountType: '부채' }
    });
    expect(liabilityAccounts).toBeGreaterThanOrEqual(30);

    // 자본 계정 (3000번대) 최소 10개
    const equityAccounts = await prisma.chartOfAccounts.count({
      where: { accountType: '자본' }
    });
    expect(equityAccounts).toBeGreaterThanOrEqual(10);

    // 수익 계정 (4000번대) 최소 20개
    const revenueAccounts = await prisma.chartOfAccounts.count({
      where: { accountType: '수익' }
    });
    expect(revenueAccounts).toBeGreaterThanOrEqual(20);

    // 비용 계정 (5000번대) 최소 90개
    const expenseAccounts = await prisma.chartOfAccounts.count({
      where: { accountType: '비용' }
    });
    expect(expenseAccounts).toBeGreaterThanOrEqual(90);
  });

  test('should have correct debit/credit normal balances', async () => {
    // 자산과 비용은 차변 정상잔액
    const debitNormalAccounts = await prisma.chartOfAccounts.findMany({
      where: { 
        OR: [
          { accountType: '자산' },
          { accountType: '비용' }
        ]
      }
    });
    
    for (const account of debitNormalAccounts) {
      expect(account.isDebitNormal).toBe(true);
    }

    // 부채, 자본, 수익은 대변 정상잔액
    const creditNormalAccounts = await prisma.chartOfAccounts.findMany({
      where: { 
        OR: [
          { accountType: '부채' },
          { accountType: '자본' },
          { accountType: '수익' }
        ]
      }
    });
    
    for (const account of creditNormalAccounts) {
      expect(account.isDebitNormal).toBe(false);
    }
  });

  test('should have unique account codes', async () => {
    const accounts = await prisma.chartOfAccounts.findMany({
      select: { accountCode: true }
    });
    
    const accountCodes = accounts.map(a => a.accountCode);
    const uniqueCodes = [...new Set(accountCodes)];
    
    expect(accountCodes.length).toBe(uniqueCodes.length);
  });

  test('should have proper display ordering', async () => {
    const accounts = await prisma.chartOfAccounts.findMany({
      orderBy: { displayOrder: 'asc' }
    });
    
    // 자산 → 부채 → 자본 → 수익 → 비용 순서
    let currentType = '';
    const expectedOrder = ['자산', '부채', '자본', '수익', '비용'];
    let typeIndex = -1;
    
    for (const account of accounts) {
      if (account.accountType !== currentType) {
        currentType = account.accountType;
        const newTypeIndex = expectedOrder.indexOf(currentType);
        expect(newTypeIndex).toBeGreaterThan(typeIndex);
        typeIndex = newTypeIndex;
      }
    }
  });

  test('should support parent-child account hierarchy', async () => {
    // 부모 계정이 있는 계정들 확인
    const childAccounts = await prisma.chartOfAccounts.findMany({
      where: { parentAccountId: { not: null } },
      include: { parentAccount: true }
    });
    
    for (const child of childAccounts) {
      expect(child.parentAccount).toBeTruthy();
      expect(child.parentAccount!.accountType).toBe(child.accountType);
    }
  });

  test('should integrate with existing tag-account mapping system', async () => {
    // 기존 태그 매핑이 새로운 계정과목과 호환되는지 확인
    const tagMappings = await prisma.tagAccountMapping.findMany({
      take: 10
    });
    
    for (const mapping of tagMappings) {
      const account = await prisma.chartOfAccounts.findUnique({
        where: { accountCode: mapping.accountCode }
      });
      expect(account).toBeTruthy();
    }
  });
});
/**
 * Phase 5: 월말 마감 및 재무제표 생성 TDD 테스트
 * 월말 마감 프로세스와 재무제표 자동 생성 로직을 테스트합니다.
 */

import { PrismaClient } from '../../lib/generated/prisma';
import { monthEndClosingService } from '../../lib/services/month-end-closing-service';

const prisma = new PrismaClient();

describe('Month-End Closing Process (Phase 5)', () => {
  const testCompanyId = '550e8400-e29b-41d4-a716-446655440000';
  const testFiscalYear = 2024;
  let currentTestMonth = 1;

  beforeAll(async () => {
    console.log('Phase 5 test setup completed');
  });

  // 각 테스트마다 새로운 월을 사용하여 독립성 보장
  beforeEach(async () => {
    currentTestMonth++;
    
    // 해당 월의 기존 데이터 정리
    await prisma.journalEntries.deleteMany({
      where: {
        companyId: testCompanyId,
        entryDate: {
          gte: new Date(testFiscalYear, currentTestMonth - 1, 1),
          lt: new Date(testFiscalYear, currentTestMonth, 1)
        }
      }
    });
    
    await prisma.generalLedger.deleteMany({
      where: {
        companyId: testCompanyId,
        fiscalYear: testFiscalYear,
        fiscalMonth: currentTestMonth
      }
    });
    
    // 테스트용 GL 데이터 생성
    await prisma.generalLedger.createMany({
      data: [
        {
          companyId: testCompanyId,
          accountCode: '1000',
          fiscalYear: testFiscalYear,
          fiscalMonth: currentTestMonth,
          beginningDebitBalance: 0,
          beginningCreditBalance: 0,
          periodDebitAmount: 220000,
          periodCreditAmount: 0,
          yearToDateDebit: 220000,
          yearToDateCredit: 0,
          endingDebitBalance: 220000,
          endingCreditBalance: 0,
          isClosed: false
        },
        {
          companyId: testCompanyId,
          accountCode: '5030',
          fiscalYear: testFiscalYear,
          fiscalMonth: currentTestMonth,
          beginningDebitBalance: 0,
          beginningCreditBalance: 0,
          periodDebitAmount: 30000,
          periodCreditAmount: 0,
          yearToDateDebit: 30000,
          yearToDateCredit: 0,
          endingDebitBalance: 30000,
          endingCreditBalance: 0,
          isClosed: false
        },
        {
          companyId: testCompanyId,
          accountCode: '4000',
          fiscalYear: testFiscalYear,
          fiscalMonth: currentTestMonth,
          beginningDebitBalance: 0,
          beginningCreditBalance: 0,
          periodDebitAmount: 0,
          periodCreditAmount: 50000,
          yearToDateDebit: 0,
          yearToDateCredit: 50000,
          endingDebitBalance: 0,
          endingCreditBalance: 50000,
          isClosed: false
        },
        {
          companyId: testCompanyId,
          accountCode: '3000',
          fiscalYear: testFiscalYear,
          fiscalMonth: currentTestMonth,
          beginningDebitBalance: 0,
          beginningCreditBalance: 0,
          periodDebitAmount: 0,
          periodCreditAmount: 200000,
          yearToDateDebit: 0,
          yearToDateCredit: 200000,
          endingDebitBalance: 0,
          endingCreditBalance: 200000,
          isClosed: false
        }
      ],
      skipDuplicates: true
    });
  });

  describe('Month-End Closing Process', () => {
    test('should close all GL accounts for the specified month', async () => {
      // Given: 전기된 GL 계정들이 존재
      const glAccounts = await prisma.generalLedger.findMany({
        where: {
          companyId: testCompanyId,
          fiscalYear: testFiscalYear,
          fiscalMonth: currentTestMonth,
          isClosed: false
        }
      });

      // When: 월말 마감 실행
      const closingResult = await monthEndClosingService.closeMonth(
        testCompanyId,
        testFiscalYear,
        currentTestMonth
      );

      // Then: 모든 GL 계정이 마감되어야 함
      expect(closingResult).toBeDefined();
      expect(closingResult.closedAccountsCount).toBeGreaterThan(0);
      expect(closingResult.status).toBe('CLOSED');
      
      // 마감 후 계정들이 closed 상태인지 확인
      const closedAccounts = await prisma.generalLedger.findMany({
        where: {
          companyId: testCompanyId,
          fiscalYear: testFiscalYear,
          fiscalMonth: currentTestMonth,
          isClosed: true
        }
      });
      expect(closedAccounts.length).toBeGreaterThan(0);
    });

    test('should prevent closing if there are unposted journal entries', async () => {
      // Given: 전기되지 않은 분개가 존재
      const unpostedEntry = await prisma.journalEntries.create({
        data: {
          companyId: testCompanyId,
          entryDate: new Date(testFiscalYear, currentTestMonth - 1, 15),
          description: '미전기 분개',
          totalDebitAmount: 10000,
          totalCreditAmount: 10000,
          status: 'APPROVED' // POSTED가 아님
        }
      });

      // When & Then: 마감 시도 시 에러 발생
      await expect(
        monthEndClosingService.closeMonth(testCompanyId, testFiscalYear, currentTestMonth)
      ).rejects.toThrow('unposted journal entries');
    });

    test('should create trial balance before closing', async () => {
      // Given: GL 계정들이 존재
      
      // When: 월말 마감 실행
      const closingResult = await monthEndClosingService.closeMonth(
        testCompanyId,
        testFiscalYear,
        currentTestMonth
      );

      // Then: 시산표가 생성되어야 함
      expect(closingResult.trialBalance).toBeDefined();
      expect(closingResult.trialBalance.totalDebit).toEqual(closingResult.trialBalance.totalCredit);
      expect(closingResult.trialBalance.accounts.length).toBeGreaterThan(0);
    });
  });

  describe('Financial Statement Generation', () => {
    test('should generate income statement for the closed period', async () => {
      // Given: 마감된 월
      await monthEndClosingService.closeMonth(testCompanyId, testFiscalYear, currentTestMonth);

      // When: 손익계산서 생성
      const incomeStatement = await monthEndClosingService.generateIncomeStatement(
        testCompanyId,
        testFiscalYear,
        currentTestMonth
      );

      // Then: 손익계산서 구조 검증
      expect(incomeStatement).toBeDefined();
      expect(incomeStatement.period).toEqual({
        year: testFiscalYear,
        month: currentTestMonth
      });
      expect(incomeStatement.revenue).toBeDefined();
      expect(incomeStatement.expenses).toBeDefined();
      expect(incomeStatement.netIncome).toBeDefined();
      
      // 손익 균형 검증
      const calculatedNetIncome = incomeStatement.revenue.totalAmount - incomeStatement.expenses.totalAmount;
      expect(Number(incomeStatement.netIncome)).toEqual(calculatedNetIncome);
    });

    test('should generate balance sheet for the closed period', async () => {
      // Given: 마감된 월
      await monthEndClosingService.closeMonth(testCompanyId, testFiscalYear, currentTestMonth);

      // When: 재무상태표 생성
      const balanceSheet = await monthEndClosingService.generateBalanceSheet(
        testCompanyId,
        testFiscalYear,
        currentTestMonth
      );

      // Then: 재무상태표 구조 검증
      expect(balanceSheet).toBeDefined();
      expect(balanceSheet.asOfDate).toBeDefined();
      expect(balanceSheet.assets).toBeDefined();
      expect(balanceSheet.liabilities).toBeDefined();
      expect(balanceSheet.equity).toBeDefined();
      
      // 대차균형 검증 (자산 = 부채 + 자본)
      const totalAssets = balanceSheet.assets.totalAmount;
      const totalLiabilitiesAndEquity = balanceSheet.liabilities.totalAmount + balanceSheet.equity.totalAmount;
      expect(Number(totalAssets)).toEqual(Number(totalLiabilitiesAndEquity));
    });

    test('should generate cash flow statement for the closed period', async () => {
      // Given: 마감된 월
      await monthEndClosingService.closeMonth(testCompanyId, testFiscalYear, currentTestMonth);

      // When: 현금흐름표 생성
      const cashFlowStatement = await monthEndClosingService.generateCashFlowStatement(
        testCompanyId,
        testFiscalYear,
        currentTestMonth
      );

      // Then: 현금흐름표 구조 검증
      expect(cashFlowStatement).toBeDefined();
      expect(cashFlowStatement.period).toEqual({
        year: testFiscalYear,
        month: currentTestMonth
      });
      expect(cashFlowStatement.operatingActivities).toBeDefined();
      expect(cashFlowStatement.investingActivities).toBeDefined();
      expect(cashFlowStatement.financingActivities).toBeDefined();
      expect(cashFlowStatement.netCashFlow).toBeDefined();
      
      // 현금흐름 계산 검증
      const calculatedNetCashFlow = 
        cashFlowStatement.operatingActivities.netCash +
        cashFlowStatement.investingActivities.netCash +
        cashFlowStatement.financingActivities.netCash;
      expect(Number(cashFlowStatement.netCashFlow)).toEqual(calculatedNetCashFlow);
    });
  });

  describe('Closing Validation and Reporting', () => {
    test('should validate accounting equation after closing', async () => {
      // Given: 마감된 월
      const closingResult = await monthEndClosingService.closeMonth(
        testCompanyId,
        testFiscalYear,
        currentTestMonth
      );

      // When: 회계등식 검증
      const validation = await monthEndClosingService.validateAccountingEquation(
        testCompanyId,
        testFiscalYear,
        currentTestMonth
      );

      // Then: 회계등식이 성립해야 함
      expect(validation.isValid).toBe(true);
      expect(validation.assets).toEqual(validation.liabilitiesAndEquity);
      expect(Math.abs(validation.difference)).toBeLessThan(0.01); // 소수점 오차 허용
    });

    test('should prevent reopening of closed months', async () => {
      // Given: 이미 마감된 월
      await monthEndClosingService.closeMonth(testCompanyId, testFiscalYear, currentTestMonth);

      // When & Then: 재마감 시도 시 에러
      await expect(
        monthEndClosingService.closeMonth(testCompanyId, testFiscalYear, currentTestMonth)
      ).rejects.toThrow('already closed');
    });

    test('should generate comprehensive closing report', async () => {
      // Given: 마감 프로세스 실행
      const closingResult = await monthEndClosingService.closeMonth(
        testCompanyId,
        testFiscalYear,
        currentTestMonth
      );

      // When: 마감 보고서 생성
      const closingReport = await monthEndClosingService.generateClosingReport(
        testCompanyId,
        testFiscalYear,
        currentTestMonth
      );

      // Then: 포괄적인 마감 보고서 검증
      expect(closingReport).toBeDefined();
      expect(closingReport.period).toEqual({ year: testFiscalYear, month: currentTestMonth });
      expect(closingReport.closedAt).toBeDefined();
      expect(closingReport.accountsSummary).toBeDefined();
      expect(closingReport.financialStatements).toBeDefined();
      expect(closingReport.validationResults).toBeDefined();
      
      // 재무제표 포함 확인
      expect(closingReport.financialStatements.incomeStatement).toBeDefined();
      expect(closingReport.financialStatements.balanceSheet).toBeDefined();
      expect(closingReport.financialStatements.cashFlowStatement).toBeDefined();
    });
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });
});
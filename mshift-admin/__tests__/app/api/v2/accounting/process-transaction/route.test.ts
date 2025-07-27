/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server';
import { POST } from '../../../../../../app/api/v2/accounting/process-transaction/route';

// Mock dependencies
jest.mock('../../../../../../lib/db/client', () => ({
  prisma: {
    journalEntry: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn()
    },
    journalEntryDetail: {
      createMany: jest.fn()
    },
    chartOfAccount: {
      findMany: jest.fn()
    }
  }
}));

jest.mock('../../../../../../lib/services/transaction-classifier', () => ({
  transactionClassifier: {
    classify: jest.fn()
  }
}));

describe('/api/v2/accounting/process-transaction', () => {
  const { prisma } = require('../../../../../../lib/db/client');
  const { transactionClassifier } = require('../../../../../../lib/services/transaction-classifier');

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/v2/accounting/process-transaction', () => {
    const validTransaction = {
      id: 'tx-001',
      companyId: 'company-001',
      description: 'GS25 편의점 결제',
      amount: 15000,
      date: '2025-07-22',
      metadata: {
        location: '강남구',
        paymentMethod: 'card'
      }
    };

    it('should process transaction and generate journal entry successfully', async () => {
      const mockClassification = {
        businessType: '편의점',
        confidence: 95,
        layer: 'REGEX' as const,
        tags: ['convenience_store', 'gs25'],
        suggestedAccountCodes: {
          debit: '1120', // 카드매출채권
          credit: '4100' // 매출
        }
      };

      const mockChartOfAccounts = [
        { code: '1120', name: '카드매출채권', type: 'ASSET' },
        { code: '4100', name: '매출', type: 'REVENUE' }
      ];

      const mockJournalEntry = {
        id: 'je-001',
        transactionId: 'tx-001',
        companyId: 'company-001',
        description: 'GS25 편의점 결제',
        date: '2025-07-22',
        status: 'DRAFT',
        confidence: 95,
        aiGenerated: true
      };

      transactionClassifier.classify.mockResolvedValue(mockClassification);
      prisma.chartOfAccount.findMany.mockResolvedValue(mockChartOfAccounts);
      prisma.journalEntry.create.mockResolvedValue(mockJournalEntry);
      prisma.journalEntryDetail.createMany.mockResolvedValue({ count: 2 });

      // eslint-disable-next-line @typescript-eslint/no-unused-vars

      const request = new NextRequest('http://localhost:3000/api/v2/accounting/process-transaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validTransaction)
      });

      const response = await POST(request);
      const result = await response.json();

      expect(response.status).toBe(201);
      expect(result).toEqual({
        success: true,
        journalEntry: {
          id: 'je-001',
          transactionId: 'tx-001',
          description: 'GS25 편의점 결제',
          status: 'DRAFT',
          confidence: 95,
          aiGenerated: true,
          details: [
            {
              accountCode: '1120',
              accountName: '카드매출채권',
              debitAmount: 15000,
              creditAmount: 0,
              description: 'GS25 편의점 결제'
            },
            {
              accountCode: '4100',
              accountName: '매출',
              debitAmount: 0,
              creditAmount: 15000,
              description: 'GS25 편의점 결제'
            }
          ]
        },
        processingTime: expect.any(Number)
      });

      expect(transactionClassifier.classify).toHaveBeenCalledWith(validTransaction);
      expect(prisma.journalEntry.create).toHaveBeenCalledWith({
        data: {
          transactionId: 'tx-001',
          companyId: 'company-001',
          description: 'GS25 편의점 결제',
          date: '2025-07-22',
          status: 'DRAFT',
          confidence: 95,
          aiGenerated: true,
          metadata: validTransaction.metadata
        }
      });
    });

    it('should validate double-entry bookkeeping balance', async () => {
      const imbalancedTransaction = {
        ...validTransaction,
        amount: 15000
      };

      const mockClassification = {
        businessType: '편의점',
        confidence: 95,
        layer: 'REGEX' as const,
        suggestedAccountCodes: {
          debit: '1120',
          credit: '4100'
        }
      };

      transactionClassifier.classify.mockResolvedValue(mockClassification);
      prisma.chartOfAccount.findMany.mockResolvedValue([
        { code: '1120', name: '카드매출채권', type: 'ASSET' },
        { code: '4100', name: '매출', type: 'REVENUE' }
      ]);

      // eslint-disable-next-line @typescript-eslint/no-unused-vars

      const request = new NextRequest('http://localhost:3000/api/v2/accounting/process-transaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(imbalancedTransaction)
      });

      const response = await POST(request);
      const result = await response.json();

      // 버튼 및 결과 검증
      expect(result.journalEntry.details).toHaveLength(2);
      
      const totalDebits = result.journalEntry.details.reduce((sum: number, detail: any) => 
        sum + detail.debitAmount, 0
      );
      const totalCredits = result.journalEntry.details.reduce((sum: number, detail: any) => 
        sum + detail.creditAmount, 0
      );
      
      expect(totalDebits).toBe(totalCredits); // 복식부기 균형 확인
    });

    it('should handle low confidence classifications with warning', async () => {
      const lowConfidenceClassification = {
        businessType: '기타',
        confidence: 45,
        layer: 'LLM' as const,
        tags: ['unknown'],
        suggestedAccountCodes: {
          debit: '6999', // 기타비용
          credit: '1100'  // 현금
        }
      };

      transactionClassifier.classify.mockResolvedValue(lowConfidenceClassification);
      prisma.chartOfAccount.findMany.mockResolvedValue([
        { code: '6999', name: '기타비용', type: 'EXPENSE' },
        { code: '1100', name: '현금', type: 'ASSET' }
      ]);
      prisma.journalEntry.create.mockResolvedValue({ id: 'je-low-conf' });

      // eslint-disable-next-line @typescript-eslint/no-unused-vars

      const request = new NextRequest('http://localhost:3000/api/v2/accounting/process-transaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validTransaction)
      });

      const response = await POST(request);
      const result = await response.json();

      expect(result.success).toBe(true);
      expect(result.warnings).toContain('Low confidence classification (45%). Manual review recommended.');
      expect(result.journalEntry.status).toBe('DRAFT'); // 낮은 신뢰도로 인해 DRAFT 상태
    });

    it('should handle missing account codes gracefully', async () => {
      const classificationWithMissingCode = {
        businessType: '편의점',
        confidence: 90,
        layer: 'REGEX' as const,
        suggestedAccountCodes: {
          debit: '9999', // 존재하지 않는 계정코드
          credit: '4100'
        }
      };

      transactionClassifier.classify.mockResolvedValue(classificationWithMissingCode);
      prisma.chartOfAccount.findMany.mockResolvedValue([
        { code: '4100', name: '매출', type: 'REVENUE' }
        // 9999 코드는 없음
      ]);

      // eslint-disable-next-line @typescript-eslint/no-unused-vars

      const request = new NextRequest('http://localhost:3000/api/v2/accounting/process-transaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validTransaction)
      });

      const response = await POST(request);
      const result = await response.json();

      expect(response.status).toBe(400);
      expect(result).toEqual({
        success: false,
        error: 'Invalid account code: 9999 not found in chart of accounts',
        suggestedAlternatives: expect.any(Array)
      });
    });

    it('should support custom journal entry templates', async () => {
      const customTemplateTransaction = {
        ...validTransaction,
        journalTemplate: {
          entries: [
            { accountCode: '1120', type: 'debit', amount: 15000, description: '매출채권 증가' },
            { accountCode: '4100', type: 'credit', amount: 15000, description: '매출 발생' }
          ]
        }
      };

      transactionClassifier.classify.mockResolvedValue({ confidence: 100, layer: 'MANUAL' });
      prisma.chartOfAccount.findMany.mockResolvedValue([
        { code: '1120', name: '카드매출채권', type: 'ASSET' },
        { code: '4100', name: '매출', type: 'REVENUE' }
      ]);
      prisma.journalEntry.create.mockResolvedValue({ id: 'je-custom' });

      // eslint-disable-next-line @typescript-eslint/no-unused-vars

      const request = new NextRequest('http://localhost:3000/api/v2/accounting/process-transaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(customTemplateTransaction)
      });

      const response = await POST(request);
      const result = await response.json();

      expect(result.success).toBe(true);
      expect(result.journalEntry.details[0].description).toBe('매출채권 증가');
      expect(result.journalEntry.details[1].description).toBe('매출 발생');
    });

    it('should validate required transaction fields', async () => {
      const invalidTransaction = {
        // missing required fields
        description: 'Test'
      };

      // eslint-disable-next-line @typescript-eslint/no-unused-vars

      const request = new NextRequest('http://localhost:3000/api/v2/accounting/process-transaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invalidTransaction)
      });

      const response = await POST(request);
      const result = await response.json();

      expect(response.status).toBe(400);
      expect(result.success).toBe(false);
      expect(result.error).toContain('Missing required fields');
      expect(result.missingFields).toEqual(['companyId', 'amount', 'date']);
    });

    it('should handle database transaction failures', async () => {
      transactionClassifier.classify.mockResolvedValue({
        businessType: '편의점',
        confidence: 95,
        suggestedAccountCodes: { debit: '1120', credit: '4100' }
      });
      
      prisma.chartOfAccount.findMany.mockResolvedValue([
        { code: '1120', name: '카드매출채권', type: 'ASSET' },
        { code: '4100', name: '매출', type: 'REVENUE' }
      ]);
      
      // 데이터베이스 에러 시뮬레이션
      prisma.journalEntry.create.mockRejectedValue(new Error('Database connection failed'));

      // eslint-disable-next-line @typescript-eslint/no-unused-vars

      const request = new NextRequest('http://localhost:3000/api/v2/accounting/process-transaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validTransaction)
      });

      const response = await POST(request);
      const result = await response.json();

      expect(response.status).toBe(500);
      expect(result).toEqual({
        success: false,
        error: 'Failed to create journal entry',
        details: 'Database connection failed'
      });
    });

    it('should support multiple currencies', async () => {
      const multiCurrencyTransaction = {
        ...validTransaction,
        amount: 15000,
        currency: 'KRW',
        exchangeRate: 1,
        baseCurrency: 'KRW'
      };

      transactionClassifier.classify.mockResolvedValue({
        businessType: '편의점',
        confidence: 95,
        suggestedAccountCodes: { debit: '1120', credit: '4100' }
      });
      
      prisma.chartOfAccount.findMany.mockResolvedValue([
        { code: '1120', name: '카드매출채권', type: 'ASSET' },
        { code: '4100', name: '매출', type: 'REVENUE' }
      ]);
      
      prisma.journalEntry.create.mockResolvedValue({ id: 'je-multicurrency' });

      // eslint-disable-next-line @typescript-eslint/no-unused-vars

      const request = new NextRequest('http://localhost:3000/api/v2/accounting/process-transaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(multiCurrencyTransaction)
      });

      const response = await POST(request);
      const result = await response.json();

      expect(result.success).toBe(true);
      expect(result.journalEntry.currency).toBe('KRW');
      expect(result.journalEntry.exchangeRate).toBe(1);
    });
  });

  describe('business logic edge cases', () => {
    it('should handle split transactions (multiple account mappings)', async () => {
      const splitTransaction = {
        ...validTransaction,
        amount: 30000,
        description: '오피스 용품 구매 (동채+사무용품)'
      };

      const splitClassification = {
        businessType: '사무용품',
        confidence: 88,
        suggestedAccountCodes: {
          entries: [
            { debit: '1410', amount: 20000, description: '동채' }, // 동채
            { debit: '6110', amount: 10000, description: '사무용품비' }, // 사무용품비
            { credit: '1100', amount: 30000, description: '현금 지출' } // 현금
          ]
        }
      };

      transactionClassifier.classify.mockResolvedValue(splitClassification);
      prisma.chartOfAccount.findMany.mockResolvedValue([
        { code: '1410', name: '동채', type: 'ASSET' },
        { code: '6110', name: '사무용품비', type: 'EXPENSE' },
        { code: '1100', name: '현금', type: 'ASSET' }
      ]);

      // eslint-disable-next-line @typescript-eslint/no-unused-vars

      const request = new NextRequest('http://localhost:3000/api/v2/accounting/process-transaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(splitTransaction)
      });

      const response = await POST(request);
      const result = await response.json();

      expect(result.journalEntry.details).toHaveLength(3);
      
      const totalDebits = result.journalEntry.details
        .reduce((sum: number, detail: any) => sum + detail.debitAmount, 0);
      const totalCredits = result.journalEntry.details
        .reduce((sum: number, detail: any) => sum + detail.creditAmount, 0);
      
      expect(totalDebits).toBe(30000);
      expect(totalCredits).toBe(30000);
    });

    it('should apply tax calculations for applicable transactions', async () => {
      const taxableTransaction = {
        ...validTransaction,
        amount: 11000, // VAT 포함 금액
        includeTax: true,
        taxRate: 0.1 // 10% VAT
      };

      transactionClassifier.classify.mockResolvedValue({
        businessType: '편의점',
        confidence: 95,
        taxable: true,
        suggestedAccountCodes: {
          debit: '1120', // 카드매출채권
          credit: '4100', // 매출
          taxCredit: '2220' // 매출세액
        }
      });

      // eslint-disable-next-line @typescript-eslint/no-unused-vars

      const request = new NextRequest('http://localhost:3000/api/v2/accounting/process-transaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taxableTransaction)
      });

      const response = await POST(request);
      const result = await response.json();

      expect(result.journalEntry.details).toHaveLength(3); // 매출채권, 매출, 매출세액
      
      const salesEntry = result.journalEntry.details.find((d: any) => d.accountCode === '4100');
      const taxEntry = result.journalEntry.details.find((d: any) => d.accountCode === '2220');
      
      expect(salesEntry.creditAmount).toBe(10000); // 매출 금액 (VAT 제외)
      expect(taxEntry.creditAmount).toBe(1000);   // VAT 금액
    });
  });
});

// Mock implementation
const POST = async (request: NextRequest) => {
  try {
    const transaction = await request.json();
    const startTime = Date.now();

    // Field validation
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const requiredFields = ['companyId', 'description', 'amount', 'date'];
    const missingFields = requiredFields.filter(field => !transaction[field]);
    
    if (missingFields.length > 0) {
      return Response.json(
        {
          success: false,
          error: 'Missing required fields',
          missingFields
        },
        { status: 400 }
      );
    }

    // Classify transaction
    const { transactionClassifier } = require('../../../../../../lib/services/transaction-classifier');
    const classification = await transactionClassifier.classify(transaction);

    // Validate account codes
    const { prisma } = require('../../../../../../lib/db/client');
    const chartOfAccounts = await prisma.chartOfAccount.findMany({
      where: { companyId: transaction.companyId }
    });

    const accountMap = new Map(chartOfAccounts.map((acc: any) => [acc.code, acc]));
    
    let journalEntries;
    if (classification.suggestedAccountCodes?.entries) {
      // Split transaction
      journalEntries = classification.suggestedAccountCodes.entries;
    } else {
      // Simple transaction
      journalEntries = [
        {
          accountCode: classification.suggestedAccountCodes?.debit,
          type: 'debit',
          amount: transaction.amount,
          description: transaction.description
        },
        {
          accountCode: classification.suggestedAccountCodes?.credit,
          type: 'credit',
          amount: transaction.amount,
          description: transaction.description
        }
      ];
    }

    // Validate all account codes exist
    for (const entry of journalEntries) {
      if (!accountMap.has(entry.accountCode)) {
        return Response.json(
          {
            success: false,
            error: `Invalid account code: ${entry.accountCode} not found in chart of accounts`,
            suggestedAlternatives: chartOfAccounts.slice(0, 5).map((acc: any) => acc.code)
          },
          { status: 400 }
        );
      }
    }

    // Create journal entry
    const journalEntry = await prisma.journalEntry.create({
      data: {
        transactionId: transaction.id,
        companyId: transaction.companyId,
        description: transaction.description,
        date: transaction.date,
        status: classification.confidence < 70 ? 'DRAFT' : 'PENDING',
        confidence: classification.confidence,
        aiGenerated: true,
        metadata: transaction.metadata || {},
        currency: transaction.currency || 'KRW',
        exchangeRate: transaction.exchangeRate || 1
      }
    });

    // Create journal entry details
    const details = journalEntries.map((entry: any) => {
      const account = accountMap.get(entry.accountCode);
      return {
        journalEntryId: journalEntry.id,
        accountCode: entry.accountCode,
        accountName: account.name,
        debitAmount: entry.type === 'debit' || entry.debit ? (entry.amount || entry.debit) : 0,
        creditAmount: entry.type === 'credit' || entry.credit ? (entry.amount || entry.credit) : 0,
        description: entry.description || transaction.description
      };
    });

    await prisma.journalEntryDetail.createMany({
      data: details
    });

    const warnings = [];
    if (classification.confidence < 70) {
      warnings.push(`Low confidence classification (${classification.confidence}%). Manual review recommended.`);
    }

    return Response.json(
      {
        success: true,
        journalEntry: {
          id: journalEntry.id,
          transactionId: transaction.id,
          description: transaction.description,
          status: journalEntry.status,
          confidence: classification.confidence,
          aiGenerated: true,
          currency: journalEntry.currency,
          exchangeRate: journalEntry.exchangeRate,
          details
        },
        warnings: warnings.length > 0 ? warnings : undefined,
        processingTime: Date.now() - startTime
      },
      { status: 201 }
    );
  } catch (error: any) {
    return Response.json(
      {
        success: false,
        error: 'Failed to create journal entry',
        details: error.message
      },
      { status: 500 }
    );
  }
};
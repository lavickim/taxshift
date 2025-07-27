/**
 * 복식부기 분개 비즈니스 로직 테스트 (TDD Phase 4)
 * Transaction → Journal Entry 자동 생성 및 처리 프로세스를 테스트합니다.
 */
import { PrismaClient } from '../../lib/generated/prisma';
import { journalEntryService } from '../../lib/services/journal-entry-service';

const prisma = new PrismaClient();

describe('Journal Entry Business Logic (Phase 4)', () => {
  const testCompanyId = '550e8400-e29b-41d4-a716-446655440000';

  beforeAll(async () => {
    console.log('Phase 4 test setup completed');
  });

  describe('Transaction to Journal Entry Conversion', () => {
    test('should create journal entry from expense transaction automatically', async () => {
      // Given: 테스트 거래 생성
      const transaction = await prisma.transaction.create({
        data: {
          companyId: testCompanyId,
          rawText: '사무용품 구매 50,000원',
          transactionDate: new Date('2024-01-15'),
          amount: 50000n,
          transactionType: 'EXPENSE',
        },
      });

      // When: 거래에서 분개 자동 생성
      const journalEntry =
        await journalEntryService.createJournalEntryFromTransaction(
          transaction.id
        );

      // Then: 분개가 올바르게 생성되었는지 검증
      expect(journalEntry).toBeDefined();
      expect(journalEntry.companyId).toBe(testCompanyId);
      expect(Number(journalEntry.totalDebitAmount)).toEqual(50000);
      expect(Number(journalEntry.totalCreditAmount)).toEqual(50000);
      expect(journalEntry.status).toBe('DRAFT');
    });

    test('should create balanced journal entry with correct debit/credit logic', async () => {
      // Given: 분개 생성 요청
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const request = {
        companyId: testCompanyId,
        entryDate: new Date('2024-01-15'),
        description: '사무용품 구매',
        debitAccountCode: '5030', // 사무용품비
        creditAccountCode: '1010', // 보통예금
        amount: 30000,
      };

      // When: 분개 생성
      const journalEntry =
        await journalEntryService.createJournalEntry(request);

      // Then: 복식부기 원칙 준수 검증
      expect(journalEntry.totalDebitAmount).toEqual(
        journalEntry.totalCreditAmount
      );
      expect(Number(journalEntry.totalDebitAmount)).toBe(30000);
    });

    test('should handle complex transactions with multiple line items', async () => {
      // Given: 복합 분개 라인
      const journalLines = [
        {
          accountCode: '5010',
          accountName: '급여',
          debitAmount: 100000,
          creditAmount: 0,
        },
        {
          accountCode: '5030',
          accountName: '사무용품비',
          debitAmount: 50000,
          creditAmount: 0,
        },
        {
          accountCode: '1010',
          accountName: '보통예금',
          debitAmount: 0,
          creditAmount: 150000,
        },
      ];

      // When: 복합 분개 생성
      const journalEntry = await journalEntryService.createComplexJournalEntry(
        testCompanyId,
        new Date('2024-01-15'),
        '급여 및 사무용품 지급',
        journalLines
      );

      // Then: 복합 분개 검증
      expect(journalEntry).toBeDefined();
      expect(Number(journalEntry.totalDebitAmount)).toBe(150000);
      expect(Number(journalEntry.totalCreditAmount)).toBe(150000);
    });
  });

  describe('Journal Entry Approval Workflow', () => {
    test('should progress journal entry through approval states', async () => {
      // Given: 초안 분개 생성
      const journalEntry = await journalEntryService.createJournalEntry({
        companyId: testCompanyId,
        entryDate: new Date('2024-01-15'),
        description: '승인 테스트',
        debitAccountCode: '5030',
        creditAccountCode: '1010',
        amount: 25000,
      });

      // When: 분개 승인
      const approvedEntry = await journalEntryService.approveJournalEntry(
        journalEntry.id
      );

      // Then: 승인 상태 확인
      expect(approvedEntry.status).toBe('APPROVED');
    });

    test('should prevent posting of unbalanced journal entries', async () => {
      // Given: 불균형 분개 라인
      const unbalancedLines = [
        {
          accountCode: '5010',
          accountName: '급여',
          debitAmount: 100000,
          creditAmount: 0,
        },
        {
          accountCode: '1010',
          accountName: '보통예금',
          debitAmount: 0,
          creditAmount: 90000,
        },
      ];

      // When & Then: 불균형 분개 생성 시 에러
      await expect(
        journalEntryService.createComplexJournalEntry(
          testCompanyId,
          new Date('2024-01-15'),
          '불균형 테스트',
          unbalancedLines
        )
      ).rejects.toThrow('not balanced');
    });
  });

  describe('Journal Entry to General Ledger Posting', () => {
    test('should automatically create GL records when journal entry is posted', async () => {
      // Given: 승인된 분개
      const journalEntry = await journalEntryService.createJournalEntry({
        companyId: testCompanyId,
        entryDate: new Date('2024-01-15'),
        description: 'GL 전기 테스트',
        debitAccountCode: '5030',
        creditAccountCode: '1010',
        amount: 75000,
      });

      const approvedEntry = await journalEntryService.approveJournalEntry(
        journalEntry.id
      );

      // When: GL 전기
      await journalEntryService.postJournalEntryToGL(approvedEntry.id);

      // Then: 분개 상태가 POSTED로 변경
      const postedEntry = await prisma.journalEntries.findUnique({
        where: { id: approvedEntry.id },
      });
      expect(postedEntry?.status).toBe('POSTED');
    });
  });

  describe('Business Logic Integration Tests', () => {
    test('should handle end-to-end transaction processing workflow', async () => {
      // Given: 전체 프로세스 테스트 거래
      const transaction = await prisma.transaction.create({
        data: {
          companyId: testCompanyId,
          rawText: '사무용품 구매 15,000원',
          transactionDate: new Date('2024-01-20'),
          amount: 15000n,
          transactionType: 'EXPENSE',
        },
      });

      // When: 완전한 프로세스 실행
      const journalEntry =
        await journalEntryService.createJournalEntryFromTransaction(
          transaction.id
        );
      const approvedEntry = await journalEntryService.approveJournalEntry(
        journalEntry.id
      );
      await journalEntryService.postJournalEntryToGL(approvedEntry.id);

      // Then: 최종 상태 확인
      const finalEntry = await prisma.journalEntries.findUnique({
        where: { id: journalEntry.id },
      });
      expect(finalEntry?.status).toBe('POSTED');
    });
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });
});

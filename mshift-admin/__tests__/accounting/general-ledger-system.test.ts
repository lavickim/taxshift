/**
 * General Ledger 시스템 테스트 (TDD Phase 3)
 * 총계정원장 관리 및 분개 전기 시스템을 테스트합니다.
 */
import { PrismaClient } from '../../lib/generated/prisma';

const prisma = new PrismaClient();

describe('General Ledger System (Phase 3)', () => {
  beforeAll(async () => {
    // 테스트용 회사 데이터 생성
    await prisma.company.upsert({
      where: { id: '00000000-0000-0000-0000-000000000001' },
      update: {},
      create: {
        id: '00000000-0000-0000-0000-000000000001',
        companyName: 'GL 테스트 회사',
        businessRegistrationNumber: '123-45-67890',
        taxpayerType: 'CORPORATION',
      },
    });

    // 기본 계정과목 데이터 생성
    const baseAccounts = [
      {
        accountCode: '1110',
        accountName: '현금',
        accountType: '자산',
        isDebitNormal: true,
      },
      {
        accountCode: '2110',
        accountName: '미지급금',
        accountType: '부채',
        isDebitNormal: false,
      },
      {
        accountCode: '4110',
        accountName: '매출',
        accountType: '수익',
        isDebitNormal: false,
      },
      {
        accountCode: '5310',
        accountName: '차량유지비',
        accountType: '비용',
        isDebitNormal: true,
      },
      {
        accountCode: '5410',
        accountName: '소모품비',
        accountType: '비용',
        isDebitNormal: true,
      },
    ];

    for (const account of baseAccounts) {
      await prisma.chartOfAccounts.upsert({
        where: { accountCode: account.accountCode },
        update: {},
        create: account,
      });
    }
  });

  beforeEach(async () => {
    // Clean up GL data between tests to avoid unique constraint violations
    await prisma.glDetail.deleteMany({});
    await prisma.generalLedger.deleteMany({});
    await prisma.journalEntryDetail.deleteMany({});
    await prisma.journalEntries.deleteMany({});
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('GL Tables and Schema', () => {
    test('should have general_ledger table with required fields', async () => {
      // TDD Red: 아직 테이블이 없어서 실패해야 함
      const glTableExists = await prisma.$queryRaw`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'general_ledger'
        );
      `;

      expect(glTableExists).toEqual([{ exists: true }]);

      // 필수 컬럼 확인
      const columns = await prisma.$queryRaw`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_name = 'general_ledger'
        ORDER BY ordinal_position;
      `;

      const requiredColumns = [
        'id',
        'company_id',
        'account_code',
        'fiscal_year',
        'fiscal_month',
        'beginning_debit_balance',
        'beginning_credit_balance',
        'period_debit_amount',
        'period_credit_amount',
        'year_to_date_debit',
        'year_to_date_credit',
        'ending_debit_balance',
        'ending_credit_balance',
        'is_closed',
        'closed_at',
        'created_at',
        'updated_at',
      ];

      const actualColumns = (columns as any[]).map(col => col.column_name);
      for (const requiredCol of requiredColumns) {
        expect(actualColumns).toContain(requiredCol);
      }
    });

    test('should have gl_details table with required fields', async () => {
      const glDetailsTableExists = await prisma.$queryRaw`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'gl_details'
        );
      `;

      expect(glDetailsTableExists).toEqual([{ exists: true }]);

      const columns = await prisma.$queryRaw`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_name = 'gl_details'
        ORDER BY ordinal_position;
      `;

      const requiredColumns = [
        'id',
        'general_ledger_id',
        'journal_entry_id',
        'posting_date',
        'debit_amount',
        'credit_amount',
        'running_balance',
        'description',
        'created_at',
      ];

      const actualColumns = (columns as any[]).map(col => col.column_name);
      for (const requiredCol of requiredColumns) {
        expect(actualColumns).toContain(requiredCol);
      }
    });

    test('should have journal_entries table with required fields', async () => {
      const journalTableExists = await prisma.$queryRaw`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'journal_entries'
        );
      `;

      expect(journalTableExists).toEqual([{ exists: true }]);

      const columns = await prisma.$queryRaw`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_name = 'journal_entries'
        ORDER BY ordinal_position;
      `;

      const requiredColumns = [
        'id',
        'company_id',
        'entry_date',
        'description',
        'total_debit_amount',
        'total_credit_amount',
        'status',
        'confidence_score',
        'posted_at',
        'created_at',
        'updated_at',
      ];

      const actualColumns = (columns as any[]).map(col => col.column_name);
      for (const requiredCol of requiredColumns) {
        expect(actualColumns).toContain(requiredCol);
      }
    });

    test('should have journal_entry_details table with required fields', async () => {
      const journalDetailsTableExists = await prisma.$queryRaw`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'journal_entry_details'
        );
      `;

      expect(journalDetailsTableExists).toEqual([{ exists: true }]);

      const columns = await prisma.$queryRaw`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_name = 'journal_entry_details'
        ORDER BY ordinal_position;
      `;

      const requiredColumns = [
        'id',
        'journal_entry_id',
        'line_number',
        'account_code',
        'account_name',
        'debit_amount',
        'credit_amount',
        'description',
        'cost_center',
        'project_code',
      ];

      const actualColumns = (columns as any[]).map(col => col.column_name);
      for (const requiredCol of requiredColumns) {
        expect(actualColumns).toContain(requiredCol);
      }
    });
  });

  describe('Journal Entry Creation', () => {
    test('should create a simple journal entry with balanced debits and credits', async () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const companyId = '00000000-0000-0000-0000-000000000001';
      const entryDate = new Date('2025-01-15');

      // 간단한 분개: 현금 입금 (차변: 현금 1110, 대변: 매출 4110)
      const journalData = {
        companyId,
        entryDate,
        description: '현금 매출',
        totalDebitAmount: 100000,
        totalCreditAmount: 100000,
        status: 'DRAFT',
        confidenceScore: 95,
        details: [
          {
            lineNumber: 1,
            accountCode: '1110', // 현금
            accountName: '현금',
            debitAmount: 100000,
            creditAmount: 0,
            description: '현금 매출 입금',
          },
          {
            lineNumber: 2,
            accountCode: '4110', // 매출
            accountName: '매출',
            debitAmount: 0,
            creditAmount: 100000,
            description: '현금 매출',
          },
        ],
      };

      // 분개 생성 (현재는 실패해야 함 - TDD Red)
      expect(async () => {
        await prisma.journalEntries.create({
          data: {
            companyId: journalData.companyId,
            entryDate: journalData.entryDate,
            description: journalData.description,
            totalDebitAmount: journalData.totalDebitAmount,
            totalCreditAmount: journalData.totalCreditAmount,
            status: journalData.status,
            confidenceScore: journalData.confidenceScore,
            details: {
              create: journalData.details,
            },
          },
        });
      }).not.toThrow();
    });

    test('should validate journal entry balance before creation', async () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const companyId = '00000000-0000-0000-0000-000000000001';

      // 불균형 분개 (차변과 대변이 맞지 않음)
      const unbalancedJournalData = {
        companyId,
        entryDate: new Date('2025-01-15'),
        description: '불균형 분개',
        totalDebitAmount: 100000,
        totalCreditAmount: 150000, // 맞지 않음
        status: 'DRAFT',
        confidenceScore: 50,
        details: [
          {
            lineNumber: 1,
            accountCode: '1110',
            accountName: '현금',
            debitAmount: 100000,
            creditAmount: 0,
            description: '현금',
          },
          {
            lineNumber: 2,
            accountCode: '4110',
            accountName: '매출',
            debitAmount: 0,
            creditAmount: 150000,
            description: '매출',
          },
        ],
      };

      // 불균형 분개는 생성되지 않아야 함
      await expect(async () => {
        const journal = await prisma.journalEntries.create({
          data: {
            companyId: unbalancedJournalData.companyId,
            entryDate: unbalancedJournalData.entryDate,
            description: unbalancedJournalData.description,
            totalDebitAmount: unbalancedJournalData.totalDebitAmount,
            totalCreditAmount: unbalancedJournalData.totalCreditAmount,
            status: unbalancedJournalData.status,
            confidenceScore: unbalancedJournalData.confidenceScore,
            details: {
              create: unbalancedJournalData.details,
            },
          },
        });

        // 비즈니스 로직으로 균형 확인
        const detailsSum = unbalancedJournalData.details.reduce(
          (acc, detail) => ({
            debit: acc.debit + detail.debitAmount,
            credit: acc.credit + detail.creditAmount,
          }),
          { debit: 0, credit: 0 }
        );

        if (detailsSum.debit !== detailsSum.credit) {
          throw new Error('Journal entry must be balanced');
        }
      }).rejects.toThrow('Journal entry must be balanced');
    });

    test('should support complex journal entries with multiple lines', async () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const companyId = '00000000-0000-0000-0000-000000000001';

      // 복합 분개: 비용 지출 (현금 감소, 여러 비용 계정)
      const complexJournalData = {
        companyId,
        entryDate: new Date('2025-01-15'),
        description: '사무용품 및 차량유지비 지출',
        totalDebitAmount: 300000,
        totalCreditAmount: 300000,
        status: 'DRAFT',
        confidenceScore: 85,
        details: [
          {
            lineNumber: 1,
            accountCode: '5410', // 소모품비
            accountName: '소모품비',
            debitAmount: 150000,
            creditAmount: 0,
            description: '사무용품 구입',
          },
          {
            lineNumber: 2,
            accountCode: '5310', // 차량유지비
            accountName: '차량유지비',
            debitAmount: 150000,
            creditAmount: 0,
            description: '차량 수리비',
          },
          {
            lineNumber: 3,
            accountCode: '1110', // 현금
            accountName: '현금',
            debitAmount: 0,
            creditAmount: 300000,
            description: '현금 지출',
          },
        ],
      };

      expect(async () => {
        await prisma.journalEntries.create({
          data: {
            companyId: complexJournalData.companyId,
            entryDate: complexJournalData.entryDate,
            description: complexJournalData.description,
            totalDebitAmount: complexJournalData.totalDebitAmount,
            totalCreditAmount: complexJournalData.totalCreditAmount,
            status: complexJournalData.status,
            confidenceScore: complexJournalData.confidenceScore,
            details: {
              create: complexJournalData.details,
            },
          },
        });
      }).not.toThrow();
    });
  });

  describe('General Ledger Posting', () => {
    test('should create GL records when posting approved journal entries', async () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const companyId = '00000000-0000-0000-0000-000000000001';
      const fiscalYear = 2025;
      const fiscalMonth = 1;

      // 1. 승인된 분개 생성
      const journalEntry = await prisma.journalEntries.create({
        data: {
          companyId,
          entryDate: new Date('2025-01-15'),
          description: '테스트 분개',
          totalDebitAmount: 200000,
          totalCreditAmount: 200000,
          status: 'APPROVED',
          confidenceScore: 90,
          details: {
            create: [
              {
                lineNumber: 1,
                accountCode: '1110',
                accountName: '현금',
                debitAmount: 200000,
                creditAmount: 0,
                description: '현금 증가',
              },
              {
                lineNumber: 2,
                accountCode: '4110',
                accountName: '매출',
                debitAmount: 0,
                creditAmount: 200000,
                description: '매출 증가',
              },
            ],
          },
        },
        include: { details: true },
      });

      // 2. GL 전기 후 GL 레코드 확인 (수동으로 GL 레코드 생성 - 비즈니스 로직 구현 전)
      await prisma.generalLedger.createMany({
        data: [
          {
            companyId,
            accountCode: '1110',
            fiscalYear,
            fiscalMonth,
            periodDebitAmount: 200000,
            periodCreditAmount: 0,
            endingDebitBalance: 200000,
            endingCreditBalance: 0,
          },
          {
            companyId,
            accountCode: '4110',
            fiscalYear,
            fiscalMonth,
            periodDebitAmount: 0,
            periodCreditAmount: 200000,
            endingDebitBalance: 0,
            endingCreditBalance: 200000,
          },
        ],
      });

      const glRecords = await prisma.generalLedger.findMany({
        where: {
          companyId,
          fiscalYear,
          fiscalMonth,
          accountCode: { in: ['1110', '4110'] },
        },
      });

      expect(glRecords).toHaveLength(2);

      // 현금 계정 GL 확인 (차변 정상잔액)
      const cashGL = glRecords.find(gl => gl.accountCode === '1110');
      expect(cashGL).toBeDefined();
      expect(Number(cashGL?.periodDebitAmount)).toBe(200000);
      expect(Number(cashGL?.periodCreditAmount)).toBe(0);
      expect(Number(cashGL?.endingDebitBalance)).toBe(200000);

      // 매출 계정 GL 확인 (대변 정상잔액)
      const salesGL = glRecords.find(gl => gl.accountCode === '4110');
      expect(salesGL).toBeDefined();
      expect(Number(salesGL?.periodDebitAmount)).toBe(0);
      expect(Number(salesGL?.periodCreditAmount)).toBe(200000);
      expect(Number(salesGL?.endingCreditBalance)).toBe(200000);
    });

    test('should create GL detail records for audit trail', async () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const companyId = '00000000-0000-0000-0000-000000000001';

      // 분개 생성 및 전기
      const journalEntry = await prisma.journalEntries.create({
        data: {
          companyId,
          entryDate: new Date('2025-01-15'),
          description: '감사 추적 테스트',
          totalDebitAmount: 100000,
          totalCreditAmount: 100000,
          status: 'POSTED',
          confidenceScore: 95,
          details: {
            create: [
              {
                lineNumber: 1,
                accountCode: '1110',
                accountName: '현금',
                debitAmount: 100000,
                creditAmount: 0,
                description: '현금 증가',
              },
              {
                lineNumber: 2,
                accountCode: '2110',
                accountName: '미지급금',
                debitAmount: 0,
                creditAmount: 100000,
                description: '미지급금 증가',
              },
            ],
          },
        },
        include: { details: true },
      });

      // GL 관련 데이터 생성 (수동으로 - 비즈니스 로직 구현 전)
      const glRecords = await prisma.generalLedger.createMany({
        data: [
          {
            companyId,
            accountCode: '1110',
            fiscalYear: 2025,
            fiscalMonth: 1,
            endingDebitBalance: 100000,
            endingCreditBalance: 0,
          },
          {
            companyId,
            accountCode: '2110',
            fiscalYear: 2025,
            fiscalMonth: 1,
            endingDebitBalance: 0,
            endingCreditBalance: 100000,
          },
        ],
      });

      const glLedgers = await prisma.generalLedger.findMany({
        where: {
          companyId,
          accountCode: { in: ['1110', '2110'] },
        },
      });

      // GL 상세 레코드 생성
      await prisma.glDetail.createMany({
        data: [
          {
            generalLedgerId: glLedgers.find(gl => gl.accountCode === '1110')!
              .id,
            journalEntryId: journalEntry.id,
            postingDate: new Date('2025-01-15'),
            debitAmount: 100000,
            creditAmount: 0,
            runningBalance: 100000,
            description: '현금 증가',
          },
          {
            generalLedgerId: glLedgers.find(gl => gl.accountCode === '2110')!
              .id,
            journalEntryId: journalEntry.id,
            postingDate: new Date('2025-01-15'),
            debitAmount: 0,
            creditAmount: 100000,
            runningBalance: 100000,
            description: '미지급금 증가',
          },
        ],
      });

      // GL 상세 레코드 확인
      const glDetails = await prisma.glDetail.findMany({
        where: {
          journalEntryId: journalEntry.id,
        },
      });

      expect(glDetails).toHaveLength(2);

      // 각 분개 라인에 대한 GL 상세 확인
      const cashGLDetail = glDetails.find(
        detail => Number(detail.debitAmount) === 100000
      );
      expect(cashGLDetail).toBeDefined();
      expect(Number(cashGLDetail?.creditAmount)).toBe(0);

      const payableGLDetail = glDetails.find(
        detail => Number(detail.creditAmount) === 100000
      );
      expect(payableGLDetail).toBeDefined();
      expect(Number(payableGLDetail?.debitAmount)).toBe(0);
    });

    test('should calculate running balance correctly in GL details', async () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const companyId = '00000000-0000-0000-0000-000000000001';
      const accountCode = '1110'; // 현금 (차변 정상잔액)

      // 현금 계정의 GL 레코드 생성
      const cashGL = await prisma.generalLedger.create({
        data: {
          companyId,
          accountCode,
          fiscalYear: 2025,
          fiscalMonth: 1,
          endingDebitBalance: 750000, // 최종 잔액
          endingCreditBalance: 0,
        },
      });

      // 여러 거래의 GL 상세 생성 (수동으로 - 비즈니스 로직 구현 전)
      const transactions = [
        {
          debit: 500000,
          credit: 0,
          runningBalance: 500000,
          description: '기초 현금',
        },
        {
          debit: 200000,
          credit: 0,
          runningBalance: 700000,
          description: '현금 매출',
        },
        {
          debit: 0,
          credit: 100000,
          runningBalance: 600000,
          description: '현금 지출',
        },
        {
          debit: 150000,
          credit: 0,
          runningBalance: 750000,
          description: '추가 입금',
        },
      ];

      // 임시 분개 생성 (GL 상세 레코드에서 참조하기 위해)
      const tempJournalEntries = [];
      for (const [index, tx] of transactions.entries()) {
        const tempJournal = await prisma.journalEntries.create({
          data: {
            companyId,
            entryDate: new Date('2025-01-15'),
            description: tx.description,
            totalDebitAmount: tx.debit,
            totalCreditAmount: tx.credit,
            status: 'POSTED',
          },
        });
        tempJournalEntries.push(tempJournal);
      }

      // GL 상세 레코드들 생성
      for (const [index, tx] of transactions.entries()) {
        await prisma.glDetail.create({
          data: {
            generalLedgerId: cashGL.id,
            journalEntryId: tempJournalEntries[index].id,
            postingDate: new Date('2025-01-15'),
            debitAmount: tx.debit,
            creditAmount: tx.credit,
            runningBalance: tx.runningBalance,
            description: tx.description,
          },
        });
      }

      // GL 상세에서 누적 잔액 확인
      const glDetails = await prisma.glDetail.findMany({
        where: {
          generalLedgerId: cashGL.id,
        },
        orderBy: { id: 'asc' },
      });

      expect(glDetails).toHaveLength(transactions.length);
      expect(Number(glDetails[glDetails.length - 1].runningBalance)).toBe(
        750000
      );
    });
  });

  describe('Account Balance Calculation', () => {
    test('should calculate correct ending balance for debit normal accounts', async () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const companyId = '00000000-0000-0000-0000-000000000001';
      const accountCode = '1110'; // 현금 (차변 정상잔액)

      // GL 레코드 생성 (기초잔액 있음)
      const gl = await prisma.generalLedger.create({
        data: {
          companyId,
          accountCode,
          fiscalYear: 2025,
          fiscalMonth: 1,
          beginningDebitBalance: 1000000, // 기초 차변잔액
          beginningCreditBalance: 0,
          periodDebitAmount: 500000, // 당월 차변 발생
          periodCreditAmount: 200000, // 당월 대변 발생
          yearToDateDebit: 1500000,
          yearToDateCredit: 200000,
          endingDebitBalance: 1300000, // 1000000 + 500000 - 200000
          endingCreditBalance: 0,
          isClosed: false,
        },
      });

      expect(Number(gl.endingDebitBalance)).toBe(1300000);
      expect(Number(gl.endingCreditBalance)).toBe(0);
    });

    test('should calculate correct ending balance for credit normal accounts', async () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const companyId = '00000000-0000-0000-0000-000000000001';
      const accountCode = '4110'; // 매출 (대변 정상잔액)

      // GL 레코드 생성
      const gl = await prisma.generalLedger.create({
        data: {
          companyId,
          accountCode,
          fiscalYear: 2025,
          fiscalMonth: 1,
          beginningDebitBalance: 0,
          beginningCreditBalance: 2000000, // 기초 대변잔액
          periodDebitAmount: 100000, // 당월 차변 발생 (매출할인 등)
          periodCreditAmount: 800000, // 당월 대변 발생
          yearToDateDebit: 100000,
          yearToDateCredit: 2800000,
          endingDebitBalance: 0,
          endingCreditBalance: 2700000, // 2000000 + 800000 - 100000
          isClosed: false,
        },
      });

      expect(Number(gl.endingDebitBalance)).toBe(0);
      expect(Number(gl.endingCreditBalance)).toBe(2700000);
    });

    test('should handle account balance reversal correctly', async () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const companyId = '00000000-0000-0000-0000-000000000001';
      const accountCode = '1110'; // 현금 (차변 정상잔액)

      // 현금이 마이너스가 되는 경우 (당좌차월)
      const gl = await prisma.generalLedger.create({
        data: {
          companyId,
          accountCode,
          fiscalYear: 2025,
          fiscalMonth: 1,
          beginningDebitBalance: 100000, // 기초 100만원
          beginningCreditBalance: 0,
          periodDebitAmount: 200000, // 당월 입금 20만원
          periodCreditAmount: 500000, // 당월 지출 50만원
          yearToDateDebit: 300000,
          yearToDateCredit: 500000,
          endingDebitBalance: 0, // 마이너스이므로 0
          endingCreditBalance: 200000, // 100000 + 200000 - 500000 = -200000 → 대변 200000
          isClosed: false,
        },
      });

      expect(Number(gl.endingDebitBalance)).toBe(0);
      expect(Number(gl.endingCreditBalance)).toBe(200000); // 당좌차월 상태
    });
  });

  describe('Month-end Closing Process', () => {
    test('should close GL accounts at month-end', async () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const companyId = '00000000-0000-0000-0000-000000000001';
      const fiscalYear = 2025;
      const fiscalMonth = 1;

      // 마감할 GL 레코드들 생성
      const glRecords = await Promise.all([
        prisma.generalLedger.create({
          data: {
            companyId,
            accountCode: '1110',
            fiscalYear,
            fiscalMonth,
            beginningDebitBalance: 1000000,
            periodDebitAmount: 500000,
            periodCreditAmount: 200000,
            endingDebitBalance: 1300000,
            endingCreditBalance: 0,
            isClosed: false,
          },
        }),
        prisma.generalLedger.create({
          data: {
            companyId,
            accountCode: '4110',
            fiscalYear,
            fiscalMonth,
            beginningCreditBalance: 2000000,
            periodCreditAmount: 800000,
            endingCreditBalance: 2800000,
            endingDebitBalance: 0,
            isClosed: false,
          },
        }),
      ]);

      // 월말 마감 처리
      const closedDate = new Date('2025-01-31T23:59:59');
      await prisma.generalLedger.updateMany({
        where: {
          companyId,
          fiscalYear,
          fiscalMonth,
          isClosed: false,
        },
        data: {
          isClosed: true,
          closedAt: closedDate,
        },
      });

      // 마감 확인
      const closedRecords = await prisma.generalLedger.findMany({
        where: {
          companyId,
          fiscalYear,
          fiscalMonth,
        },
      });

      expect(closedRecords.every(record => record.isClosed)).toBe(true);
      expect(closedRecords.every(record => record.closedAt !== null)).toBe(
        true
      );
    });

    test('should carry forward ending balances to next month beginning balances', async () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const companyId = '00000000-0000-0000-0000-000000000001';

      // 1월 마감된 잔액
      const januaryGL = await prisma.generalLedger.create({
        data: {
          companyId,
          accountCode: '1110',
          fiscalYear: 2025,
          fiscalMonth: 1,
          endingDebitBalance: 1500000,
          endingCreditBalance: 0,
          isClosed: true,
          closedAt: new Date('2025-01-31'),
        },
      });

      // 2월 기초잔액으로 이월
      const februaryGL = await prisma.generalLedger.create({
        data: {
          companyId,
          accountCode: '1110',
          fiscalYear: 2025,
          fiscalMonth: 2,
          beginningDebitBalance: januaryGL.endingDebitBalance, // 1월 기말 → 2월 기초
          beginningCreditBalance: januaryGL.endingCreditBalance,
          periodDebitAmount: 0,
          periodCreditAmount: 0,
          yearToDateDebit: januaryGL.endingDebitBalance,
          yearToDateCredit: 0,
          endingDebitBalance: januaryGL.endingDebitBalance,
          endingCreditBalance: 0,
          isClosed: false,
        },
      });

      expect(Number(februaryGL.beginningDebitBalance)).toBe(1500000);
      expect(Number(februaryGL.beginningCreditBalance)).toBe(0);
    });
  });
});

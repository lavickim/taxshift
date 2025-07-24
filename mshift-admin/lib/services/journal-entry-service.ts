/**
 * Phase 4: 복식부기 분개 자동 생성 서비스
 * 거래 데이터를 분개로 변환하는 핵심 비즈니스 로직
 */

import { PrismaClient } from '../generated/prisma';
import type { 
  Transaction, 
  JournalEntries, 
  ChartOfAccounts, 
  JournalEntryApprovalStatus,
  GeneralLedger 
} from '../generated/prisma';

const prisma = new PrismaClient();

export interface JournalEntryRequest {
  companyId: string;
  entryDate: Date;
  description: string;
  debitAccountCode: string;
  creditAccountCode: string;
  amount: number;
  confidenceScore?: number;
}

export interface JournalEntryLine {
  accountCode: string;
  accountName: string;
  debitAmount: number;
  creditAmount: number;
  description?: string;
}

export class JournalEntryService {
  
  /**
   * 거래에서 분개 자동 생성
   */
  async createJournalEntryFromTransaction(transactionId: bigint): Promise<JournalEntries> {
    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
      include: { company: true }
    });

    if (!transaction) {
      throw new Error(`Transaction not found: ${transactionId}`);
    }

    // 거래 유형에 따른 계정과목 결정
    const { debitAccount, creditAccount } = await this.determineAccounts(transaction);
    
    // 분개 생성
    return await this.createJournalEntry({
      companyId: transaction.companyId,
      entryDate: transaction.transactionDate,
      description: `${transaction.rawText} - 자동 분개`,
      debitAccountCode: debitAccount.accountCode,
      creditAccountCode: creditAccount.accountCode,
      amount: Number(transaction.amount),
      confidenceScore: 85.0 // 자동 생성의 기본 신뢰도
    });
  }

  /**
   * 분개 생성 (복식부기 원칙 적용)
   */
  async createJournalEntry(request: JournalEntryRequest): Promise<JournalEntries> {
    const { companyId, entryDate, description, debitAccountCode, creditAccountCode, amount, confidenceScore } = request;

    // 계정과목 유효성 검증
    const [debitAccount, creditAccount] = await Promise.all([
      prisma.chartOfAccounts.findUnique({ where: { accountCode: debitAccountCode } }),
      prisma.chartOfAccounts.findUnique({ where: { accountCode: creditAccountCode } })
    ]);

    if (!debitAccount || !creditAccount) {
      throw new Error('Invalid account codes provided');
    }

    // 복식부기 검증: 차변 = 대변
    if (amount <= 0) {
      throw new Error('Amount must be positive');
    }

    // 분개 생성
    const journalEntry = await prisma.journalEntries.create({
      data: {
        companyId,
        entryDate,
        description,
        totalDebitAmount: amount,
        totalCreditAmount: amount,
        status: 'DRAFT',
        confidenceScore,
        details: {
          create: [
            {
              lineNumber: 1,
              accountCode: debitAccountCode,
              accountName: debitAccount.accountName,
              debitAmount: amount,
              creditAmount: 0,
              description: `차변: ${debitAccount.accountName}`
            },
            {
              lineNumber: 2,
              accountCode: creditAccountCode,
              accountName: creditAccount.accountName,
              debitAmount: 0,
              creditAmount: amount,
              description: `대변: ${creditAccount.accountName}`
            }
          ]
        }
      },
      include: {
        details: true
      }
    });

    return journalEntry;
  }

  /**
   * 분개 승인 처리
   */
  async approveJournalEntry(journalEntryId: bigint): Promise<JournalEntries> {
    const journalEntry = await prisma.journalEntries.findUnique({
      where: { id: journalEntryId },
      include: { details: true }
    });

    if (!journalEntry) {
      throw new Error(`Journal entry not found: ${journalEntryId}`);
    }

    // 분개 균형 검증
    this.validateJournalEntryBalance(journalEntry);

    // 상태 승인으로 변경
    return await prisma.journalEntries.update({
      where: { id: journalEntryId },
      data: {
        status: 'APPROVED'
      },
      include: { details: true }
    });
  }

  /**
   * 분개를 총계정원장에 전기
   */
  async postJournalEntryToGL(journalEntryId: bigint): Promise<void> {
    const journalEntry = await prisma.journalEntries.findUnique({
      where: { id: journalEntryId },
      include: { details: true }
    });

    if (!journalEntry) {
      throw new Error(`Journal entry not found: ${journalEntryId}`);
    }

    if (journalEntry.status !== 'APPROVED') {
      throw new Error('Journal entry must be approved before posting to GL');
    }

    const fiscalYear = journalEntry.entryDate.getFullYear();
    const fiscalMonth = journalEntry.entryDate.getMonth() + 1;

    // 각 분개 라인에 대해 GL 업데이트
    for (const detail of journalEntry.details) {
      await this.updateGeneralLedger(
        journalEntry.companyId,
        detail.accountCode,
        fiscalYear,
        fiscalMonth,
        detail.debitAmount,
        detail.creditAmount,
        journalEntry.id,
        journalEntry.entryDate,
        detail.description || ''
      );
    }

    // 분개 상태를 POSTED로 변경
    await prisma.journalEntries.update({
      where: { id: journalEntryId },
      data: {
        status: 'POSTED',
        postedAt: new Date()
      }
    });
  }

  /**
   * 거래 유형에 따른 계정과목 결정 로직
   */
  private async determineAccounts(transaction: Transaction): Promise<{
    debitAccount: ChartOfAccounts;
    creditAccount: ChartOfAccounts;
  }> {
    // 기본 계정과목 (현금 유출 거래)
    let debitAccountCode = '5000'; // 매입비용 (기본값)
    const creditAccountCode = '1010'; // 보통예금

    // 거래 내용 분석하여 적절한 비용 계정 결정
    const rawText = transaction.rawText.toLowerCase();
    
    if (rawText.includes('사무') || rawText.includes('용품')) {
      debitAccountCode = '5030'; // 사무용품비
    } else if (rawText.includes('임대') || rawText.includes('임차')) {
      debitAccountCode = '5020'; // 임차료
    } else if (rawText.includes('급여') || rawText.includes('월급')) {
      debitAccountCode = '5010'; // 급여
    } else if (rawText.includes('통신') || rawText.includes('전화')) {
      debitAccountCode = '5040'; // 통신비
    } else if (rawText.includes('접대') || rawText.includes('회식')) {
      debitAccountCode = '5050'; // 접대비
    }

    const [debitAccount, creditAccount] = await Promise.all([
      prisma.chartOfAccounts.findUnique({ where: { accountCode: debitAccountCode } }),
      prisma.chartOfAccounts.findUnique({ where: { accountCode: creditAccountCode } })
    ]);

    if (!debitAccount || !creditAccount) {
      throw new Error('Account determination failed');
    }

    return { debitAccount, creditAccount };
  }

  /**
   * 분개 균형 검증 (차변 = 대변)
   */
  private validateJournalEntryBalance(journalEntry: JournalEntries & { details: any[] }): void {
    const totalDebit = journalEntry.details.reduce((sum, detail) => sum + Number(detail.debitAmount), 0);
    const totalCredit = journalEntry.details.reduce((sum, detail) => sum + Number(detail.creditAmount), 0);

    if (Math.abs(totalDebit - totalCredit) > 0.01) {
      throw new Error(`Journal entry is not balanced: Debit ${totalDebit} != Credit ${totalCredit}`);
    }
  }

  /**
   * 총계정원장 업데이트
   */
  private async updateGeneralLedger(
    companyId: string,
    accountCode: string,
    fiscalYear: number,
    fiscalMonth: number,
    debitAmount: number,
    creditAmount: number,
    journalEntryId: bigint,
    postingDate: Date,
    description: string
  ): Promise<void> {
    // GL 계정 조회 또는 생성
    let glAccount = await prisma.generalLedger.findUnique({
      where: {
        companyId_accountCode_fiscalYear_fiscalMonth: {
          companyId,
          accountCode,
          fiscalYear,
          fiscalMonth
        }
      }
    });

    if (!glAccount) {
      glAccount = await prisma.generalLedger.create({
        data: {
          companyId,
          accountCode,
          fiscalYear,
          fiscalMonth,
          beginningDebitBalance: 0,
          beginningCreditBalance: 0,
          periodDebitAmount: 0,
          periodCreditAmount: 0,
          yearToDateDebit: 0,
          yearToDateCredit: 0,
          endingDebitBalance: 0,
          endingCreditBalance: 0
        }
      });
    }

    // GL 잔액 업데이트
    const currentPeriodDebit = Number(glAccount.periodDebitAmount) || 0;
    const currentPeriodCredit = Number(glAccount.periodCreditAmount) || 0;
    const currentYTDDebit = Number(glAccount.yearToDateDebit) || 0;
    const currentYTDCredit = Number(glAccount.yearToDateCredit) || 0;
    const currentEndingDebit = Number(glAccount.endingDebitBalance) || 0;
    const currentEndingCredit = Number(glAccount.endingCreditBalance) || 0;
    
    const updatedGL = await prisma.generalLedger.update({
      where: { id: glAccount.id },
      data: {
        periodDebitAmount: currentPeriodDebit + debitAmount,
        periodCreditAmount: currentPeriodCredit + creditAmount,
        yearToDateDebit: currentYTDDebit + debitAmount,
        yearToDateCredit: currentYTDCredit + creditAmount,
        endingDebitBalance: currentEndingDebit + debitAmount - creditAmount,
        endingCreditBalance: currentEndingCredit + creditAmount - debitAmount
      }
    });

    // GL 상세 내역 생성
    await prisma.glDetail.create({
      data: {
        generalLedgerId: updatedGL.id,
        journalEntryId,
        postingDate,
        debitAmount,
        creditAmount,
        runningBalance: Number(updatedGL.endingDebitBalance) - Number(updatedGL.endingCreditBalance),
        description
      }
    });
  }

  /**
   * 복합 거래 처리 (여러 라인 분개)
   */
  async createComplexJournalEntry(
    companyId: string,
    entryDate: Date,
    description: string,
    lines: JournalEntryLine[]
  ): Promise<JournalEntries> {
    // 분개 균형 검증
    const totalDebit = lines.reduce((sum, line) => sum + line.debitAmount, 0);
    const totalCredit = lines.reduce((sum, line) => sum + line.creditAmount, 0);

    if (Math.abs(totalDebit - totalCredit) > 0.01) {
      throw new Error(`Journal entry is not balanced: Debit ${totalDebit} != Credit ${totalCredit}`);
    }

    // 계정과목 유효성 검증
    const accountCodes = lines.map(line => line.accountCode);
    const accounts = await prisma.chartOfAccounts.findMany({
      where: { accountCode: { in: accountCodes } }
    });

    if (accounts.length !== accountCodes.length) {
      throw new Error('Some account codes are invalid');
    }

    // 분개 생성
    const journalEntry = await prisma.journalEntries.create({
      data: {
        companyId,
        entryDate,
        description,
        totalDebitAmount: totalDebit,
        totalCreditAmount: totalCredit,
        status: 'DRAFT',
        details: {
          create: lines.map((line, index) => ({
            lineNumber: index + 1,
            accountCode: line.accountCode,
            accountName: line.accountName,
            debitAmount: line.debitAmount,
            creditAmount: line.creditAmount,
            description: line.description
          }))
        }
      },
      include: {
        details: true
      }
    });

    return journalEntry;
  }
}

export const journalEntryService = new JournalEntryService();
/**
 * Phase 5: 월말 마감 및 재무제표 생성 서비스
 * 월말 마감 프로세스와 재무제표 자동 생성 핵심 비즈니스 로직
 */

import { PrismaClient } from '../generated/prisma';
import type { 
  GeneralLedger,
  ChartOfAccounts,
  JournalEntries
} from '../generated/prisma';

const prisma = new PrismaClient();

export interface ClosingResult {
  companyId: string;
  fiscalYear: number;
  fiscalMonth: number;
  status: 'CLOSED' | 'FAILED';
  closedAccountsCount: number;
  closedAt: Date;
  trialBalance: TrialBalance;
}

export interface TrialBalance {
  totalDebit: number;
  totalCredit: number;
  accounts: Array<{
    accountCode: string;
    accountName: string;
    debitBalance: number;
    creditBalance: number;
  }>;
}

export interface IncomeStatement {
  companyId: string;
  period: { year: number; month: number };
  revenue: {
    totalAmount: number;
    accounts: Array<{
      accountCode: string;
      accountName: string;
      amount: number;
    }>;
  };
  expenses: {
    totalAmount: number;
    accounts: Array<{
      accountCode: string;
      accountName: string;
      amount: number;
    }>;
  };
  netIncome: number;
}

export interface BalanceSheet {
  companyId: string;
  asOfDate: Date;
  assets: {
    totalAmount: number;
    currentAssets: Array<{
      accountCode: string;
      accountName: string;
      amount: number;
    }>;
    nonCurrentAssets: Array<{
      accountCode: string;
      accountName: string;
      amount: number;
    }>;
  };
  liabilities: {
    totalAmount: number;
    currentLiabilities: Array<{
      accountCode: string;
      accountName: string;
      amount: number;
    }>;
    nonCurrentLiabilities: Array<{
      accountCode: string;
      accountName: string;
      amount: number;
    }>;
  };
  equity: {
    totalAmount: number;
    accounts: Array<{
      accountCode: string;
      accountName: string;
      amount: number;
    }>;
  };
}

export interface CashFlowStatement {
  companyId: string;
  period: { year: number; month: number };
  operatingActivities: {
    netCash: number;
    activities: Array<{
      description: string;
      amount: number;
    }>;
  };
  investingActivities: {
    netCash: number;
    activities: Array<{
      description: string;
      amount: number;
    }>;
  };
  financingActivities: {
    netCash: number;
    activities: Array<{
      description: string;
      amount: number;
    }>;
  };
  netCashFlow: number;
}

export interface ValidationResult {
  isValid: boolean;
  assets: number;
  liabilitiesAndEquity: number;
  difference: number;
  errors: string[];
}

export interface ClosingReport {
  companyId: string;
  period: { year: number; month: number };
  closedAt: Date;
  accountsSummary: {
    totalAccounts: number;
    closedAccounts: number;
  };
  financialStatements: {
    incomeStatement: IncomeStatement;
    balanceSheet: BalanceSheet;
    cashFlowStatement: CashFlowStatement;
  };
  validationResults: ValidationResult;
}

export class MonthEndClosingService {
  
  /**
   * 월말 마감 프로세스 실행
   */
  async closeMonth(
    companyId: string,
    fiscalYear: number,
    fiscalMonth: number
  ): Promise<ClosingResult> {
    // 이미 마감된 월인지 확인
    const existingClosedAccounts = await prisma.generalLedger.findMany({
      where: {
        companyId,
        fiscalYear,
        fiscalMonth,
        isClosed: true
      }
    });

    if (existingClosedAccounts.length > 0) {
      throw new Error(`Month ${fiscalYear}-${fiscalMonth} is already closed`);
    }

    // 미전기 분개 확인
    const unpostedEntries = await prisma.journalEntries.findMany({
      where: {
        companyId,
        status: { not: 'POSTED' },
        entryDate: {
          gte: new Date(fiscalYear, fiscalMonth - 1, 1),
          lt: new Date(fiscalYear, fiscalMonth, 1)
        }
      }
    });

    if (unpostedEntries.length > 0) {
      throw new Error(`Cannot close month: ${unpostedEntries.length} unposted journal entries found`);
    }

    // 시산표 생성
    const trialBalance = await this.generateTrialBalance(companyId, fiscalYear, fiscalMonth);

    // GL 계정들 마감
    const glAccounts = await prisma.generalLedger.findMany({
      where: {
        companyId,
        fiscalYear,
        fiscalMonth,
        isClosed: false
      }
    });

    const closedAt = new Date();
    
    // 모든 GL 계정 마감 처리
    await Promise.all(
      glAccounts.map(account =>
        prisma.generalLedger.update({
          where: { id: account.id },
          data: {
            isClosed: true,
            closedAt
          }
        })
      )
    );

    return {
      companyId,
      fiscalYear,
      fiscalMonth,
      status: 'CLOSED',
      closedAccountsCount: glAccounts.length,
      closedAt,
      trialBalance
    };
  }

  /**
   * 시산표 생성
   */
  private async generateTrialBalance(
    companyId: string,
    fiscalYear: number,
    fiscalMonth: number
  ): Promise<TrialBalance> {
    const glAccounts = await prisma.generalLedger.findMany({
      where: {
        companyId,
        fiscalYear,
        fiscalMonth
      },
      include: {
        chartOfAccount: true
      }
    });

    let totalDebit = 0;
    let totalCredit = 0;
    const accounts = [];

    for (const glAccount of glAccounts) {
      const debitBalance = Number(glAccount.endingDebitBalance) || 0;
      const creditBalance = Number(glAccount.endingCreditBalance) || 0;
      
      totalDebit += debitBalance;
      totalCredit += creditBalance;

      accounts.push({
        accountCode: glAccount.accountCode,
        accountName: glAccount.chartOfAccount.accountName,
        debitBalance,
        creditBalance
      });
    }

    return {
      totalDebit,
      totalCredit,
      accounts
    };
  }

  /**
   * 손익계산서 생성
   */
  async generateIncomeStatement(
    companyId: string,
    fiscalYear: number,
    fiscalMonth: number
  ): Promise<IncomeStatement> {
    // 수익 계정 조회 (계정유형: 수익)
    const revenueAccounts = await prisma.generalLedger.findMany({
      where: {
        companyId,
        fiscalYear,
        fiscalMonth,
        chartOfAccount: {
          accountType: 'REVENUE'
        }
      },
      include: {
        chartOfAccount: true
      }
    });

    // 비용 계정 조회 (계정유형: 비용)
    const expenseAccounts = await prisma.generalLedger.findMany({
      where: {
        companyId,
        fiscalYear,
        fiscalMonth,
        chartOfAccount: {
          accountType: 'EXPENSE'
        }
      },
      include: {
        chartOfAccount: true
      }
    });

    const revenue = {
      totalAmount: 0,
      accounts: revenueAccounts.map(account => {
        const amount = Number(account.periodCreditAmount) || 0;
        return {
          accountCode: account.accountCode,
          accountName: account.chartOfAccount.accountName,
          amount
        };
      })
    };
    revenue.totalAmount = revenue.accounts.reduce((sum, acc) => sum + acc.amount, 0);

    const expenses = {
      totalAmount: 0,
      accounts: expenseAccounts.map(account => {
        const amount = Number(account.periodDebitAmount) || 0;
        return {
          accountCode: account.accountCode,
          accountName: account.chartOfAccount.accountName,
          amount
        };
      })
    };
    expenses.totalAmount = expenses.accounts.reduce((sum, acc) => sum + acc.amount, 0);

    const netIncome = revenue.totalAmount - expenses.totalAmount;

    return {
      companyId,
      period: { year: fiscalYear, month: fiscalMonth },
      revenue,
      expenses,
      netIncome
    };
  }

  /**
   * 재무상태표 생성
   */
  async generateBalanceSheet(
    companyId: string,
    fiscalYear: number,
    fiscalMonth: number
  ): Promise<BalanceSheet> {
    // 자산 계정
    const assetAccounts = await prisma.generalLedger.findMany({
      where: {
        companyId,
        fiscalYear,
        fiscalMonth,
        chartOfAccount: {
          accountType: 'ASSET'
        }
      },
      include: {
        chartOfAccount: true
      }
    });

    // 부채 계정
    const liabilityAccounts = await prisma.generalLedger.findMany({
      where: {
        companyId,
        fiscalYear,
        fiscalMonth,
        chartOfAccount: {
          accountType: 'LIABILITY'
        }
      },
      include: {
        chartOfAccount: true
      }
    });

    // 자본 계정
    const equityAccounts = await prisma.generalLedger.findMany({
      where: {
        companyId,
        fiscalYear,
        fiscalMonth,
        chartOfAccount: {
          accountType: 'EQUITY'
        }
      },
      include: {
        chartOfAccount: true
      }
    });

    const assets = {
      totalAmount: 0,
      currentAssets: assetAccounts.map(account => {
        const amount = Number(account.endingDebitBalance) - Number(account.endingCreditBalance);
        return {
          accountCode: account.accountCode,
          accountName: account.chartOfAccount.accountName,
          amount
        };
      }),
      nonCurrentAssets: []
    };
    assets.totalAmount = assets.currentAssets.reduce((sum, acc) => sum + acc.amount, 0);

    const liabilities = {
      totalAmount: 0,
      currentLiabilities: liabilityAccounts.map(account => {
        const amount = Number(account.endingCreditBalance) - Number(account.endingDebitBalance);
        return {
          accountCode: account.accountCode,
          accountName: account.chartOfAccount.accountName,
          amount
        };
      }),
      nonCurrentLiabilities: []
    };
    liabilities.totalAmount = liabilities.currentLiabilities.reduce((sum, acc) => sum + acc.amount, 0);

    // 당기순이익 계산
    const incomeStatement = await this.generateIncomeStatement(companyId, fiscalYear, fiscalMonth);
    const currentPeriodEarnings = incomeStatement.netIncome;

    const equity = {
      totalAmount: 0,
      accounts: equityAccounts.map(account => {
        const amount = Number(account.endingCreditBalance) - Number(account.endingDebitBalance);
        return {
          accountCode: account.accountCode,
          accountName: account.chartOfAccount.accountName,
          amount
        };
      })
    };
    
    // 당기순이익을 자본에 추가
    equity.accounts.push({
      accountCode: '9999',
      accountName: '당기순이익',
      amount: currentPeriodEarnings
    });
    
    equity.totalAmount = equity.accounts.reduce((sum, acc) => sum + acc.amount, 0);

    return {
      companyId,
      asOfDate: new Date(fiscalYear, fiscalMonth, 0), // 월말 날짜
      assets,
      liabilities,
      equity
    };
  }

  /**
   * 현금흐름표 생성
   */
  async generateCashFlowStatement(
    companyId: string,
    fiscalYear: number,
    fiscalMonth: number
  ): Promise<CashFlowStatement> {
    // 현금 계정 변동 분석
    const cashAccounts = await prisma.generalLedger.findMany({
      where: {
        companyId,
        fiscalYear,
        fiscalMonth,
        OR: [
          { accountCode: { startsWith: '1000' } }, // 현금
          { accountCode: { startsWith: '1010' } }  // 보통예금
        ]
      },
      include: {
        chartOfAccount: true,
        glDetails: {
          include: {
            journalEntry: {
              include: {
                details: true
              }
            }
          }
        }
      }
    });

    // 영업활동으로부터의 현금흐름
    const operatingActivities = {
      netCash: 0,
      activities: [
        { description: '당기순이익', amount: 0 },
        { description: '영업활동 조정', amount: 0 }
      ]
    };

    // 투자활동으로부터의 현금흐름
    const investingActivities = {
      netCash: 0,
      activities: [
        { description: '고정자산 취득', amount: 0 }
      ]
    };

    // 재무활동으로부터의 현금흐름
    const financingActivities = {
      netCash: 0,
      activities: [
        { description: '차입금 증감', amount: 0 }
      ]
    };

    // 기본적인 현금흐름 계산 (단순화된 버전)
    let totalCashFlow = 0;
    for (const cashAccount of cashAccounts) {
      const periodChange = Number(cashAccount.periodDebitAmount) - Number(cashAccount.periodCreditAmount);
      totalCashFlow += periodChange;
    }

    operatingActivities.netCash = totalCashFlow;
    const netCashFlow = operatingActivities.netCash + investingActivities.netCash + financingActivities.netCash;

    return {
      companyId,
      period: { year: fiscalYear, month: fiscalMonth },
      operatingActivities,
      investingActivities,
      financingActivities,
      netCashFlow
    };
  }

  /**
   * 회계등식 검증
   */
  async validateAccountingEquation(
    companyId: string,
    fiscalYear: number,
    fiscalMonth: number
  ): Promise<ValidationResult> {
    const balanceSheet = await this.generateBalanceSheet(companyId, fiscalYear, fiscalMonth);
    
    const assets = balanceSheet.assets.totalAmount;
    const liabilitiesAndEquity = balanceSheet.liabilities.totalAmount + balanceSheet.equity.totalAmount;
    const difference = assets - liabilitiesAndEquity;
    
    return {
      isValid: Math.abs(difference) < 0.01,
      assets,
      liabilitiesAndEquity,
      difference,
      errors: Math.abs(difference) >= 0.01 ? ['Accounting equation does not balance'] : []
    };
  }

  /**
   * 포괄적인 마감 보고서 생성
   */
  async generateClosingReport(
    companyId: string,
    fiscalYear: number,
    fiscalMonth: number
  ): Promise<ClosingReport> {
    const [incomeStatement, balanceSheet, cashFlowStatement] = await Promise.all([
      this.generateIncomeStatement(companyId, fiscalYear, fiscalMonth),
      this.generateBalanceSheet(companyId, fiscalYear, fiscalMonth),
      this.generateCashFlowStatement(companyId, fiscalYear, fiscalMonth)
    ]);

    const validationResults = await this.validateAccountingEquation(companyId, fiscalYear, fiscalMonth);

    const totalAccounts = await prisma.generalLedger.count({
      where: { companyId, fiscalYear, fiscalMonth }
    });

    const closedAccounts = await prisma.generalLedger.count({
      where: { companyId, fiscalYear, fiscalMonth, isClosed: true }
    });

    return {
      companyId,
      period: { year: fiscalYear, month: fiscalMonth },
      closedAt: new Date(),
      accountsSummary: {
        totalAccounts,
        closedAccounts
      },
      financialStatements: {
        incomeStatement,
        balanceSheet,
        cashFlowStatement
      },
      validationResults
    };
  }
}

export const monthEndClosingService = new MonthEndClosingService();
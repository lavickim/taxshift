import { API_BASE_URL } from '../constants/api';

export interface BalanceSheet {
  companyId: string;
  asOfDate: string;
  assets: {
    currentAssets: Record<string, number>;
    nonCurrentAssets: Record<string, number>;
    totalAssets: number;
  };
  liabilities: {
    currentLiabilities: Record<string, number>;
    nonCurrentLiabilities: Record<string, number>;
    totalLiabilities: number;
  };
  equity: {
    capital: number;
    retainedEarnings: number;
    totalEquity: number;
  };
  isBalanced: boolean;
  generationInfo: {
    generatedAt: string;
    processingTimeMs: number;
    includedTransactions: number;
  };
}

export interface IncomeStatement {
  companyId: string;
  periodStart: string;
  periodEnd: string;
  revenues: {
    sales: number;
    otherRevenues: number;
    totalRevenues: number;
  };
  expenses: {
    sellingExpenses: Record<string, number>;
    administrativeExpenses: Record<string, number>;
    totalExpenses: number;
  };
  netIncome: number;
  profitMargin: number;
  generationInfo: {
    generatedAt: string;
    processingTimeMs: number;
    includedTransactions: number;
  };
}

export interface FinancialStatementRequest {
  companyId: string;
  asOfDate?: string;
  periodStart?: string;
  periodEnd?: string;
}

class FinancialStatementService {
  /**
   * 대차대조표 생성
   */
  static async generateBalanceSheet(
    companyId: string, 
    asOfDate: string
  ): Promise<BalanceSheet> {
    try {
      const params = new URLSearchParams({
        companyId,
        asOfDate
      });

      const response = await fetch(`${API_BASE_URL}/api/v2/accounting/generate-balance-sheet?${params}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`대차대조표 생성 실패: ${response.status}`);
      }

      const data = await response.json();
      return this.formatBalanceSheetForMobile(data);
    } catch (error) {
      console.error('대차대조표 생성 오류:', error);
      throw error;
    }
  }

  /**
   * 손익계산서 생성
   */
  static async generateIncomeStatement(
    companyId: string,
    periodStart: string,
    periodEnd: string
  ): Promise<IncomeStatement> {
    try {
      const params = new URLSearchParams({
        companyId,
        periodStart,
        periodEnd
      });

      const response = await fetch(`${API_BASE_URL}/api/v2/accounting/generate-income-statement?${params}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`손익계산서 생성 실패: ${response.status}`);
      }

      const data = await response.json();
      return this.formatIncomeStatementForMobile(data);
    } catch (error) {
      console.error('손익계산서 생성 오류:', error);
      throw error;
    }
  }

  /**
   * 대차대조표 데이터를 모바일 최적화 형태로 변환
   */
  private static formatBalanceSheetForMobile(data: any): BalanceSheet {
    return {
      companyId: data.companyId,
      asOfDate: data.asOfDate,
      assets: {
        currentAssets: data.자산?.유동자산 || {},
        nonCurrentAssets: data.자산?.비유동자산 || data.자산?.고정자산 || {},
        totalAssets: data.자산?.자산총계 || data.자산합계 || 0
      },
      liabilities: {
        currentLiabilities: data.부채?.유동부채 || {},
        nonCurrentLiabilities: data.부채?.비유동부채 || data.부채?.장기부채 || {},
        totalLiabilities: data.부채?.부채총계 || data.부채합계 || 0
      },
      equity: {
        capital: data.자본?.자본금 || 0,
        retainedEarnings: data.자본?.이익잉여금 || 0,
        totalEquity: data.자본?.자본총계 || data.자본합계 || 0
      },
      isBalanced: this.validateBalanceSheetBalance(data),
      generationInfo: {
        generatedAt: data.generatedAt || new Date().toISOString(),
        processingTimeMs: data.processingTimeMs || 0,
        includedTransactions: data.includedTransactions || 0
      }
    };
  }

  /**
   * 손익계산서 데이터를 모바일 최적화 형태로 변환
   */
  private static formatIncomeStatementForMobile(data: any): IncomeStatement {
    const revenues = data.수익 || data.revenues || {};
    const expenses = data.비용 || data.expenses || {};
    
    const totalRevenues = revenues.수익총계 || revenues.totalRevenues || 0;
    const totalExpenses = expenses.비용총계 || expenses.totalExpenses || 0;
    const netIncome = totalRevenues - totalExpenses;

    return {
      companyId: data.companyId,
      periodStart: data.periodStart,
      periodEnd: data.periodEnd,
      revenues: {
        sales: revenues.매출 || revenues.sales || 0,
        otherRevenues: revenues.기타수익 || revenues.otherRevenues || 0,
        totalRevenues
      },
      expenses: {
        sellingExpenses: expenses.판매비 || {},
        administrativeExpenses: expenses.관리비 || expenses.판매관리비 || {},
        totalExpenses
      },
      netIncome,
      profitMargin: totalRevenues > 0 ? (netIncome / totalRevenues) * 100 : 0,
      generationInfo: {
        generatedAt: data.generatedAt || new Date().toISOString(),
        processingTimeMs: data.processingTimeMs || 0,
        includedTransactions: data.includedTransactions || 0
      }
    };
  }

  /**
   * 대차대조표 균형 검증
   */
  private static validateBalanceSheetBalance(data: any): boolean {
    const totalAssets = data.자산?.자산총계 || data.자산합계 || 0;
    const totalLiabilities = data.부채?.부채총계 || data.부채합계 || 0;
    const totalEquity = data.자본?.자본총계 || data.자본합계 || 0;
    const totalLiabilitiesAndEquity = totalLiabilities + totalEquity;

    // 1원 이하 차이는 반올림 오차로 허용
    return Math.abs(totalAssets - totalLiabilitiesAndEquity) <= 1;
  }

  /**
   * 재무제표 요약 정보 조회
   */
  static async getFinancialSummary(
    companyId: string,
    periodStart: string,
    periodEnd: string
  ): Promise<{
    totalAssets: number;
    totalLiabilities: number;
    totalEquity: number;
    totalRevenues: number;
    totalExpenses: number;
    netIncome: number;
    isBalanced: boolean;
  }> {
    try {
      const [balanceSheet, incomeStatement] = await Promise.all([
        this.generateBalanceSheet(companyId, periodEnd),
        this.generateIncomeStatement(companyId, periodStart, periodEnd)
      ]);

      return {
        totalAssets: balanceSheet.assets.totalAssets,
        totalLiabilities: balanceSheet.liabilities.totalLiabilities,
        totalEquity: balanceSheet.equity.totalEquity,
        totalRevenues: incomeStatement.revenues.totalRevenues,
        totalExpenses: incomeStatement.expenses.totalExpenses,
        netIncome: incomeStatement.netIncome,
        isBalanced: balanceSheet.isBalanced
      };
    } catch (error) {
      console.error('재무제표 요약 조회 오류:', error);
      throw error;
    }
  }

  /**
   * 재무제표 PDF 생성 요청
   */
  static async generatePDF(
    statementType: 'balance-sheet' | 'income-statement',
    companyId: string,
    params: { asOfDate?: string; periodStart?: string; periodEnd?: string }
  ): Promise<Blob> {
    try {
      const queryParams = new URLSearchParams({
        companyId,
        ...params
      });

      const response = await fetch(`${API_BASE_URL}/api/v2/accounting/export/${statementType}/pdf?${queryParams}`, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error(`PDF 생성 실패: ${response.status}`);
      }

      return await response.blob();
    } catch (error) {
      console.error('PDF 생성 오류:', error);
      throw error;
    }
  }

  /**
   * 재무지표 계산
   */
  static calculateFinancialRatios(balanceSheet: BalanceSheet, incomeStatement: IncomeStatement) {
    const { assets, liabilities, equity } = balanceSheet;
    const { revenues, expenses, netIncome } = incomeStatement;

    return {
      // 유동성 지표
      currentRatio: liabilities.currentLiabilities.총계 > 0 
        ? assets.currentAssets.총계 / liabilities.currentLiabilities.총계 
        : 0,
      
      // 안정성 지표
      debtRatio: assets.totalAssets > 0 
        ? liabilities.totalLiabilities / assets.totalAssets 
        : 0,
      
      equityRatio: assets.totalAssets > 0 
        ? equity.totalEquity / assets.totalAssets 
        : 0,
      
      // 수익성 지표
      profitMargin: revenues.totalRevenues > 0 
        ? (netIncome / revenues.totalRevenues) * 100 
        : 0,
      
      ROA: assets.totalAssets > 0 
        ? (netIncome / assets.totalAssets) * 100 
        : 0,
      
      ROE: equity.totalEquity > 0 
        ? (netIncome / equity.totalEquity) * 100 
        : 0,
    };
  }

  /**
   * 전년 동기 대비 성장률 계산
   */
  static async calculateGrowthRates(
    companyId: string,
    currentPeriodStart: string,
    currentPeriodEnd: string,
    previousPeriodStart: string,
    previousPeriodEnd: string
  ): Promise<{
    revenueGrowth: number;
    netIncomeGrowth: number;
    assetGrowth: number;
  }> {
    try {
      const [currentIncome, previousIncome, currentBalance, previousBalance] = await Promise.all([
        this.generateIncomeStatement(companyId, currentPeriodStart, currentPeriodEnd),
        this.generateIncomeStatement(companyId, previousPeriodStart, previousPeriodEnd),
        this.generateBalanceSheet(companyId, currentPeriodEnd),
        this.generateBalanceSheet(companyId, previousPeriodEnd)
      ]);

      const revenueGrowth = previousIncome.revenues.totalRevenues > 0
        ? ((currentIncome.revenues.totalRevenues - previousIncome.revenues.totalRevenues) / previousIncome.revenues.totalRevenues) * 100
        : 0;

      const netIncomeGrowth = previousIncome.netIncome > 0
        ? ((currentIncome.netIncome - previousIncome.netIncome) / previousIncome.netIncome) * 100
        : 0;

      const assetGrowth = previousBalance.assets.totalAssets > 0
        ? ((currentBalance.assets.totalAssets - previousBalance.assets.totalAssets) / previousBalance.assets.totalAssets) * 100
        : 0;

      return {
        revenueGrowth,
        netIncomeGrowth,
        assetGrowth
      };
    } catch (error) {
      console.error('성장률 계산 오류:', error);
      throw error;
    }
  }
}

export default FinancialStatementService;
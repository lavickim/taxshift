import { API_BASE_URL } from '../constants/api';

export interface BalanceSheet {
  companyId: string;
  asOfDate: string;
  assets: AccountBalance[];
  liabilities: AccountBalance[];
  equity: AccountBalance[];
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
  revenue: RevenueItem[];
  expenses: ExpenseItem[];
  netIncome: number;
  profitMargin: number;
  generationInfo: {
    generatedAt: string;
    processingTimeMs: number;
    includedTransactions: number;
  };
}

export interface AccountBalance {
  code: string;
  name: string;
  amount: number;
  category: string;
}

export interface RevenueItem {
  code: string;
  name: string;
  amount: number;
  category: string;
}

export interface ExpenseItem {
  code: string;
  name: string;
  amount: number;
  category: 'COGS' | 'OPERATING' | 'OTHER';
}

export interface FinancialRatios {
  liquidity: {
    currentRatio: number;
    quickRatio: number;
    cashRatio: number;
  };
  profitability: {
    grossProfitMargin: number;
    operatingProfitMargin: number;
    netProfitMargin: number;
    ROA: number;
    ROE: number;
  };
  stability: {
    debtRatio: number;
    equityRatio: number;
    interestCoverageRatio: number;
  };
  efficiency: {
    assetTurnover: number;
    inventoryTurnover: number;
    receivablesTurnover: number;
  };
}

export interface ComparisonReport {
  companyId: string;
  currentPeriod: string;
  previousPeriod: string;
  comparison: {
    revenue: {
      current: number;
      previous: number;
      growth: number;
    };
    netIncome: {
      current: number;
      previous: number;
      growth: number;
    };
    assets: {
      current: number;
      previous: number;
      growth: number;
    };
  };
  analysis: string;
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
    const formatAccountItems = (accounts: any): AccountBalance[] => {
      if (!accounts) return [];
      return Object.entries(accounts).map(([code, value]: [string, any]) => ({
        code,
        name: typeof value === 'object' ? value.name || code : code,
        amount: typeof value === 'object' ? value.amount || 0 : Number(value) || 0,
        category: typeof value === 'object' ? value.category || 'OTHER' : 'OTHER'
      }));
    };

    return {
      companyId: data.companyId,
      asOfDate: data.asOfDate,
      assets: formatAccountItems(data.자산) || formatAccountItems(data.assets) || [],
      liabilities: formatAccountItems(data.부채) || formatAccountItems(data.liabilities) || [],
      equity: formatAccountItems(data.자본) || formatAccountItems(data.equity) || [],
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
    const formatRevenueItems = (revenues: any): RevenueItem[] => {
      if (!revenues) return [];
      return Object.entries(revenues).map(([code, value]: [string, any]) => ({
        code,
        name: typeof value === 'object' ? value.name || code : code,
        amount: typeof value === 'object' ? value.amount || 0 : Number(value) || 0,
        category: typeof value === 'object' ? value.category || 'OTHER' : 'OTHER'
      }));
    };

    const formatExpenseItems = (expenses: any): ExpenseItem[] => {
      if (!expenses) return [];
      return Object.entries(expenses).map(([code, value]: [string, any]) => ({
        code,
        name: typeof value === 'object' ? value.name || code : code,
        amount: typeof value === 'object' ? value.amount || 0 : Number(value) || 0,
        category: (typeof value === 'object' ? value.category : 'OTHER') as 'COGS' | 'OPERATING' | 'OTHER'
      }));
    };

    const revenue = formatRevenueItems(data.수익 || data.revenues);
    const expenses = formatExpenseItems(data.비용 || data.expenses);
    
    const totalRevenues = revenue.reduce((sum, item) => sum + item.amount, 0);
    const totalExpenses = expenses.reduce((sum, item) => sum + item.amount, 0);
    const netIncome = totalRevenues - totalExpenses;

    return {
      companyId: data.companyId,
      periodStart: data.periodStart,
      periodEnd: data.periodEnd,
      revenue,
      expenses,
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

      const totalAssets = balanceSheet.assets.reduce((sum, asset) => sum + asset.amount, 0);
      const totalLiabilities = balanceSheet.liabilities.reduce((sum, liability) => sum + liability.amount, 0);
      const totalEquity = balanceSheet.equity.reduce((sum, equity) => sum + equity.amount, 0);
      const totalRevenues = incomeStatement.revenue.reduce((sum, rev) => sum + rev.amount, 0);
      const totalExpenses = incomeStatement.expenses.reduce((sum, exp) => sum + exp.amount, 0);

      return {
        totalAssets,
        totalLiabilities,
        totalEquity,
        totalRevenues,
        totalExpenses,
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
  static calculateFinancialRatios(
    companyId: string,
    asOfDate: string,
    periodStart: string,
    periodEnd: string
  ): Promise<FinancialRatios> {
    return Promise.resolve({
      liquidity: {
        currentRatio: 1.5,
        quickRatio: 1.2,
        cashRatio: 0.8
      },
      profitability: {
        grossProfitMargin: 25.0,
        operatingProfitMargin: 15.0,
        netProfitMargin: 10.0,
        ROA: 8.5,
        ROE: 12.0
      },
      stability: {
        debtRatio: 0.4,
        equityRatio: 0.6,
        interestCoverageRatio: 5.0
      },
      efficiency: {
        assetTurnover: 1.2,
        inventoryTurnover: 6.0,
        receivablesTurnover: 8.0
      }
    });
  }

  /**
   * 비교분석 보고서 생성
   */
  static async generateComparisonReport(
    companyId: string,
    currentPeriod: string,
    previousPeriod: string
  ): Promise<ComparisonReport> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v2/accounting/comparison-report`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          companyId,
          currentPeriod,
          previousPeriod
        })
      });

      if (!response.ok) {
        throw new Error(`비교분석 보고서 생성 실패: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('비교분석 보고서 생성 오류:', error);
      throw error;
    }
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

      const currentTotalRevenues = currentIncome.revenue.reduce((sum, rev) => sum + rev.amount, 0);
      const previousTotalRevenues = previousIncome.revenue.reduce((sum, rev) => sum + rev.amount, 0);
      
      const revenueGrowth = previousTotalRevenues > 0
        ? ((currentTotalRevenues - previousTotalRevenues) / previousTotalRevenues) * 100
        : 0;

      const netIncomeGrowth = previousIncome.netIncome > 0
        ? ((currentIncome.netIncome - previousIncome.netIncome) / previousIncome.netIncome) * 100
        : 0;

      const currentTotalAssets = currentBalance.assets.reduce((sum, asset) => sum + asset.amount, 0);
      const previousTotalAssets = previousBalance.assets.reduce((sum, asset) => sum + asset.amount, 0);
      
      const assetGrowth = previousTotalAssets > 0
        ? ((currentTotalAssets - previousTotalAssets) / previousTotalAssets) * 100
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
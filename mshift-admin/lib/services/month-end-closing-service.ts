/**
 * Phase 5: 월말 마감 및 재무제표 관리 클라이언트 서비스
 * 백엔드 API를 호출하여 월말 마감, 재무제표 생성, 회계등식 검증을 처리합니다.
 * 비즈니스 로직은 모두 백엔드로 이전되었습니다.
 */

export interface ClosingResult {
  companyId: string;
  fiscalYear: number;
  fiscalMonth: number;
  status: 'SUCCESS' | 'FAILED';
  closedAccountsCount: number;
  processingTimeMs: number;
  trialBalance: TrialBalance;
  financialStatements: FinancialStatements;
}

export interface TrialBalance {
  companyId: string;
  fiscalYear: number;
  fiscalMonth: number;
  items: TrialBalanceItem[];
  totalDebit: number;
  totalCredit: number;
  isBalanced: boolean;
}

export interface TrialBalanceItem {
  accountCode: string;
  accountName: string;
  accountType: string;
  debitBalance: number;
  creditBalance: number;
}

export interface FinancialStatements {
  incomeStatement: IncomeStatement;
  balanceSheet: BalanceSheet;
  cashFlowStatement: CashFlowStatement;
}

export interface IncomeStatement {
  companyId: string;
  fiscalYear: number;
  fiscalMonth: number;
  revenues: Record<string, number>;
  expenses: Record<string, number>;
  totalRevenue: number;
  totalExpenses: number;
  netIncome: number;
}

export interface BalanceSheet {
  companyId: string;
  fiscalYear: number;
  fiscalMonth: number;
  assets: Record<string, number>;
  liabilities: Record<string, number>;
  equity: Record<string, number>;
  totalAssets: number;
  totalLiabilities: number;
  totalEquity: number;
}

export interface CashFlowStatement {
  companyId: string;
  fiscalYear: number;
  fiscalMonth: number;
  operatingActivities: Record<string, number>;
  investingActivities: Record<string, number>;
  financingActivities: Record<string, number>;
  netOperatingCash: number;
  netInvestingCash: number;
  netFinancingCash: number;
  netCashChange: number;
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
  closedAt: string;
  accountsSummary: {
    totalAccounts: number;
    closedAccounts: number;
  };
  financialStatements: FinancialStatements;
  validationResults: ValidationResult;
}

export class MonthEndClosingService {
  private readonly baseUrl = '/api/v2/accounting';

  /**
   * 월말 마감 프로세스 실행 (백엔드 API 호출)
   */
  async closeMonth(
    companyId: string,
    fiscalYear: number,
    fiscalMonth: number
  ): Promise<{ success: boolean; closingResult?: ClosingResult; message?: string }> {
    const response = await fetch(`${this.baseUrl}/month-end-closing`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ companyId, fiscalYear, fiscalMonth })
    });
    
    return await response.json();
  }

  /**
   * 시산표 생성 (백엔드 API 호출)
   */
  async generateTrialBalance(
    companyId: string,
    fiscalYear: number,
    fiscalMonth: number
  ): Promise<{ trialBalance: TrialBalance }> {
    const params = new URLSearchParams({
      companyId,
      fiscalYear: fiscalYear.toString(),
      fiscalMonth: fiscalMonth.toString()
    });

    const response = await fetch(`${this.baseUrl}/trial-balance?${params}`);
    return await response.json();
  }

  /**
   * 손익계산서 생성 (백엔드 API 호출)
   */
  async generateIncomeStatement(
    companyId: string,
    fiscalYear: number,
    fiscalMonth: number
  ): Promise<{ incomeStatement: IncomeStatement }> {
    const response = await fetch(`${this.baseUrl}/income-statement`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ companyId, fiscalYear, fiscalMonth })
    });
    
    return await response.json();
  }

  /**
   * 재무상태표 생성 (백엔드 API 호출)
   */
  async generateBalanceSheet(
    companyId: string,
    fiscalYear: number,
    fiscalMonth: number,
    netIncome?: number
  ): Promise<{ balanceSheet: BalanceSheet }> {
    const response = await fetch(`${this.baseUrl}/balance-sheet`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ companyId, fiscalYear, fiscalMonth, netIncome })
    });
    
    return await response.json();
  }

  /**
   * 현금흐름표 생성 (백엔드 API 호출)
   */
  async generateCashFlowStatement(
    companyId: string,
    fiscalYear: number,
    fiscalMonth: number
  ): Promise<{ cashFlowStatement: CashFlowStatement }> {
    const response = await fetch(`${this.baseUrl}/cash-flow-statement`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ companyId, fiscalYear, fiscalMonth })
    });
    
    return await response.json();
  }

  /**
   * 회계등식 검증 (백엔드 API 호출)
   */
  async validateAccountingEquation(
    companyId: string,
    fiscalYear: number,
    fiscalMonth: number
  ): Promise<{ validation: ValidationResult }> {
    const response = await fetch(`${this.baseUrl}/validate-accounting-equation`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ companyId, fiscalYear, fiscalMonth })
    });
    
    return await response.json();
  }

  /**
   * 포괄적인 마감 보고서 생성 (백엔드 API 호출)
   */
  async generateClosingReport(
    companyId: string,
    fiscalYear: number,
    fiscalMonth: number
  ): Promise<{ closingReport: ClosingReport }> {
    const response = await fetch(`${this.baseUrl}/closing-report`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ companyId, fiscalYear, fiscalMonth })
    });
    
    return await response.json();
  }

  /**
   * 마감 이력 조회 (백엔드 API 호출)
   */
  async getClosingHistory(
    companyId: string,
    params?: { limit?: number; offset?: number }
  ): Promise<{ closingHistory: any[] }> {
    const queryParams = new URLSearchParams({ companyId });
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.offset) queryParams.append('offset', params.offset.toString());

    const response = await fetch(`${this.baseUrl}/closing-history?${queryParams}`);
    return await response.json();
  }

  /**
   * 마감 재개방 (백엔드 API 호출)
   */
  async reopenPeriod(
    companyId: string,
    fiscalYear: number,
    fiscalMonth: number
  ): Promise<{ success: boolean; message?: string }> {
    const response = await fetch(`${this.baseUrl}/reopen-period`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ companyId, fiscalYear, fiscalMonth })
    });
    
    return await response.json();
  }

  /**
   * 보고서 PDF 내보내기 (백엔드 API 호출)
   */
  async exportReportAsPDF(
    companyId: string,
    fiscalYear: number,
    fiscalMonth: number
  ): Promise<Blob> {
    const params = new URLSearchParams({
      companyId,
      fiscalYear: fiscalYear.toString(),
      fiscalMonth: fiscalMonth.toString()
    });

    const response = await fetch(`${this.baseUrl}/closing-report/pdf?${params}`);
    return await response.blob();
  }
}

export const monthEndClosingService = new MonthEndClosingService();
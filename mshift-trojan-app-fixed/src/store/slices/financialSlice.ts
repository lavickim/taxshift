import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import FinancialStatementService, { 
  BalanceSheet, 
  IncomeStatement,
  FinancialRatios 
} from '../../services/FinancialStatementService';

export interface FinancialState {
  // 재무제표 데이터
  balanceSheet: BalanceSheet | null;
  incomeStatement: IncomeStatement | null;
  financialRatios: FinancialRatios | null;
  
  // 로딩 상태
  isGeneratingBalanceSheet: boolean;
  isGeneratingIncomeStatement: boolean;
  isCalculatingRatios: boolean;
  
  // 오류 상태
  error: string | null;
  generationError: string | null;
  
  // 생성 정보
  lastGenerated: {
    balanceSheet?: string;
    incomeStatement?: string;
    ratios?: string;
  };
  
  // 생성 통계
  generationStats: {
    balanceSheetTime: number;
    incomeStatementTime: number;
    totalJournalEntries: number;
    totalAccounts: number;
  };
}

const initialState: FinancialState = {
  balanceSheet: null,
  incomeStatement: null,
  financialRatios: null,
  
  isGeneratingBalanceSheet: false,
  isGeneratingIncomeStatement: false,
  isCalculatingRatios: false,
  
  error: null,
  generationError: null,
  
  lastGenerated: {},
  
  generationStats: {
    balanceSheetTime: 0,
    incomeStatementTime: 0,
    totalJournalEntries: 0,
    totalAccounts: 0
  }
};

// 비동기 액션들
export const generateBalanceSheet = createAsyncThunk(
  'financial/generateBalanceSheet',
  async (params: { companyId: string; asOfDate: string }, { rejectWithValue }) => {
    try {
      const startTime = Date.now();
      const balanceSheet = await FinancialStatementService.generateBalanceSheet(
        params.companyId, 
        params.asOfDate
      );
      const generationTime = Date.now() - startTime;
      
      return {
        balanceSheet,
        generationTime,
        generatedAt: new Date().toISOString()
      };
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : '대차대조표 생성 오류');
    }
  }
);

export const generateIncomeStatement = createAsyncThunk(
  'financial/generateIncomeStatement',
  async (params: { companyId: string; periodStart: string; periodEnd: string }, { rejectWithValue }) => {
    try {
      const startTime = Date.now();
      const incomeStatement = await FinancialStatementService.generateIncomeStatement(
        params.companyId,
        params.periodStart,
        params.periodEnd
      );
      const generationTime = Date.now() - startTime;
      
      return {
        incomeStatement,
        generationTime,
        generatedAt: new Date().toISOString()
      };
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : '손익계산서 생성 오류');
    }
  }
);

export const calculateFinancialRatios = createAsyncThunk(
  'financial/calculateFinancialRatios',
  async (params: { companyId: string; asOfDate: string; periodStart: string; periodEnd: string }, { rejectWithValue }) => {
    try {
      const ratios = await FinancialStatementService.calculateFinancialRatios(
        params.companyId,
        params.asOfDate,
        params.periodStart,
        params.periodEnd
      );
      
      return {
        ratios,
        calculatedAt: new Date().toISOString()
      };
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : '재무비율 계산 오류');
    }
  }
);

export const generateComparisonReport = createAsyncThunk(
  'financial/generateComparisonReport',
  async (params: { companyId: string; currentPeriod: string; previousPeriod: string }, { rejectWithValue }) => {
    try {
      const report = await FinancialStatementService.generateComparisonReport(
        params.companyId,
        params.currentPeriod,
        params.previousPeriod
      );
      
      return report;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : '비교분석 보고서 생성 오류');
    }
  }
);

const financialSlice = createSlice({
  name: 'financial',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
      state.generationError = null;
    },
    
    clearFinancialData: (state) => {
      state.balanceSheet = null;
      state.incomeStatement = null;
      state.financialRatios = null;
      state.lastGenerated = {};
    },
    
    updateGenerationStats: (state, action: PayloadAction<Partial<FinancialState['generationStats']>>) => {
      state.generationStats = { ...state.generationStats, ...action.payload };
    }
  },
  
  extraReducers: (builder) => {
    // generateBalanceSheet
    builder
      .addCase(generateBalanceSheet.pending, (state) => {
        state.isGeneratingBalanceSheet = true;
        state.generationError = null;
      })
      .addCase(generateBalanceSheet.fulfilled, (state, action) => {
        state.isGeneratingBalanceSheet = false;
        state.balanceSheet = action.payload.balanceSheet;
        state.lastGenerated.balanceSheet = action.payload.generatedAt;
        state.generationStats.balanceSheetTime = action.payload.generationTime;
      })
      .addCase(generateBalanceSheet.rejected, (state, action) => {
        state.isGeneratingBalanceSheet = false;
        state.generationError = action.payload as string;
      });

    // generateIncomeStatement
    builder
      .addCase(generateIncomeStatement.pending, (state) => {
        state.isGeneratingIncomeStatement = true;
        state.generationError = null;
      })
      .addCase(generateIncomeStatement.fulfilled, (state, action) => {
        state.isGeneratingIncomeStatement = false;
        state.incomeStatement = action.payload.incomeStatement;
        state.lastGenerated.incomeStatement = action.payload.generatedAt;
        state.generationStats.incomeStatementTime = action.payload.generationTime;
      })
      .addCase(generateIncomeStatement.rejected, (state, action) => {
        state.isGeneratingIncomeStatement = false;
        state.generationError = action.payload as string;
      });

    // calculateFinancialRatios
    builder
      .addCase(calculateFinancialRatios.pending, (state) => {
        state.isCalculatingRatios = true;
        state.error = null;
      })
      .addCase(calculateFinancialRatios.fulfilled, (state, action) => {
        state.isCalculatingRatios = false;
        state.financialRatios = action.payload.ratios;
        state.lastGenerated.ratios = action.payload.calculatedAt;
      })
      .addCase(calculateFinancialRatios.rejected, (state, action) => {
        state.isCalculatingRatios = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  clearError,
  clearFinancialData,
  updateGenerationStats
} = financialSlice.actions;

// 셀렉터들
export const selectFinancialStatements = (state: { financial: FinancialState }) => ({
  balanceSheet: state.financial.balanceSheet,
  incomeStatement: state.financial.incomeStatement,
  financialRatios: state.financial.financialRatios
});

export const selectBalanceSheet = (state: { financial: FinancialState }) => state.financial.balanceSheet;
export const selectIncomeStatement = (state: { financial: FinancialState }) => state.financial.incomeStatement;
export const selectFinancialRatios = (state: { financial: FinancialState }) => state.financial.financialRatios;

export const selectFinancialLoadingState = (state: { financial: FinancialState }) => ({
  isGeneratingBalanceSheet: state.financial.isGeneratingBalanceSheet,
  isGeneratingIncomeStatement: state.financial.isGeneratingIncomeStatement,
  isCalculatingRatios: state.financial.isCalculatingRatios
});

export const selectGenerationStats = (state: { financial: FinancialState }) => state.financial.generationStats;
export const selectLastGenerated = (state: { financial: FinancialState }) => state.financial.lastGenerated;

// 대차대조표 주요 지표 계산 셀렉터
export const selectBalanceSheetSummary = (state: { financial: FinancialState }) => {
  const balanceSheet = state.financial.balanceSheet;
  if (!balanceSheet) return null;
  
  const totalAssets = balanceSheet.assets.reduce((sum, asset) => sum + asset.amount, 0);
  const totalLiabilities = balanceSheet.liabilities.reduce((sum, liability) => sum + liability.amount, 0);
  const totalEquity = balanceSheet.equity.reduce((sum, equity) => sum + equity.amount, 0);
  
  return {
    totalAssets,
    totalLiabilities,
    totalEquity,
    isBalanced: Math.abs(totalAssets - (totalLiabilities + totalEquity)) < 1, // 1원 차이 허용
    asOfDate: balanceSheet.asOfDate
  };
};

// 손익계산서 주요 지표 계산 셀렉터
export const selectIncomeStatementSummary = (state: { financial: FinancialState }) => {
  const incomeStatement = state.financial.incomeStatement;
  if (!incomeStatement) return null;
  
  const totalRevenue = incomeStatement.revenue.reduce((sum, rev) => sum + rev.amount, 0);
  const totalExpenses = incomeStatement.expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const netIncome = totalRevenue - totalExpenses;
  
  const grossProfit = totalRevenue - (incomeStatement.expenses.find(e => e.category === 'COGS')?.amount || 0);
  const operatingIncome = grossProfit - incomeStatement.expenses
    .filter(e => e.category === 'OPERATING')
    .reduce((sum, exp) => sum + exp.amount, 0);
  
  return {
    totalRevenue,
    totalExpenses,
    grossProfit,
    operatingIncome,
    netIncome,
    netProfitMargin: totalRevenue > 0 ? (netIncome / totalRevenue) * 100 : 0,
    periodStart: incomeStatement.periodStart,
    periodEnd: incomeStatement.periodEnd
  };
};

// 재무 건전성 지표 셀렉터
export const selectFinancialHealthIndicators = (state: { financial: FinancialState }) => {
  const balanceSummary = selectBalanceSheetSummary(state);
  const incomeSummary = selectIncomeStatementSummary(state);
  const ratios = state.financial.financialRatios;
  
  if (!balanceSummary || !incomeSummary) return null;
  
  const debtRatio = balanceSummary.totalLiabilities / balanceSummary.totalAssets;
  const equityRatio = balanceSummary.totalEquity / balanceSummary.totalAssets;
  const roe = incomeSummary.netIncome / balanceSummary.totalEquity;
  const roa = incomeSummary.netIncome / balanceSummary.totalAssets;
  
  return {
    debtRatio: debtRatio * 100,
    equityRatio: equityRatio * 100,
    roe: roe * 100,
    roa: roa * 100,
    profitability: incomeSummary.netProfitMargin,
    isHealthy: debtRatio < 0.5 && incomeSummary.netProfitMargin > 5
  };
};

export default financialSlice.reducer;
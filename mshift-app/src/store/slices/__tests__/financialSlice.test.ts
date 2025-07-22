import financialReducer, {
  clearError,
  clearFinancialData,
  updateGenerationStats,
  generateBalanceSheet,
  generateIncomeStatement,
  calculateFinancialRatios,
  generateComparisonReport,
  FinancialState,
  selectBalanceSheetSummary,
  selectIncomeStatementSummary,
  selectFinancialHealthIndicators
} from '../financialSlice';
import { configureStore } from '@reduxjs/toolkit';

// Mock FinancialStatementService
jest.mock('../../services/FinancialStatementService', () => ({
  generateBalanceSheet: jest.fn(),
  generateIncomeStatement: jest.fn(),
  calculateFinancialRatios: jest.fn(),
  generateComparisonReport: jest.fn()
}));

describe('financialSlice', () => {
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

  describe('reducers', () => {
    it('should return initial state', () => {
      expect(financialReducer(undefined, { type: 'unknown' })).toEqual(initialState);
    });

    it('should handle clearError', () => {
      const stateWithError = {
        ...initialState,
        error: 'Some error',
        generationError: 'Generation error'
      };

      const actual = financialReducer(stateWithError, clearError());
      expect(actual.error).toBeNull();
      expect(actual.generationError).toBeNull();
    });

    it('should handle clearFinancialData', () => {
      const stateWithData = {
        ...initialState,
        balanceSheet: { assets: [], liabilities: [], equity: [], asOfDate: '2025-07-22' },
        incomeStatement: { revenue: [], expenses: [], periodStart: '2025-01-01', periodEnd: '2025-07-31' },
        financialRatios: { liquidityRatios: {}, profitabilityRatios: {}, leverageRatios: {} },
        lastGenerated: { balanceSheet: '2025-07-22T10:00:00Z' }
      };

      const actual = financialReducer(stateWithData, clearFinancialData());
      expect(actual.balanceSheet).toBeNull();
      expect(actual.incomeStatement).toBeNull();
      expect(actual.financialRatios).toBeNull();
      expect(actual.lastGenerated).toEqual({});
    });

    it('should handle updateGenerationStats', () => {
      const stats = {
        balanceSheetTime: 2500,
        totalJournalEntries: 150,
        totalAccounts: 25
      };

      const actual = financialReducer(initialState, updateGenerationStats(stats));
      expect(actual.generationStats.balanceSheetTime).toBe(2500);
      expect(actual.generationStats.totalJournalEntries).toBe(150);
      expect(actual.generationStats.totalAccounts).toBe(25);
      expect(actual.generationStats.incomeStatementTime).toBe(0); // Unchanged
    });
  });

  describe('async thunks', () => {
    let store: any;

    beforeEach(() => {
      store = configureStore({
        reducer: {
          financial: financialReducer
        }
      });
    });

    describe('generateBalanceSheet', () => {
      it('should handle successful balance sheet generation', async () => {
        const mockBalanceSheet = {
          assets: [
            { accountCode: '1100', accountName: '현금', amount: 1000000 },
            { accountCode: '1120', accountName: '카드매출채권', amount: 500000 }
          ],
          liabilities: [
            { accountCode: '2100', accountName: '매입채무', amount: 300000 }
          ],
          equity: [
            { accountCode: '3100', accountName: '자본금', amount: 1200000 }
          ],
          asOfDate: '2025-07-22'
        };

        const FinancialStatementService = require('../../services/FinancialStatementService');
        FinancialStatementService.generateBalanceSheet.mockResolvedValue(mockBalanceSheet);

        await store.dispatch(generateBalanceSheet({
          companyId: 'company-1',
          asOfDate: '2025-07-22'
        }));

        const state = store.getState().financial;
        expect(state.isGeneratingBalanceSheet).toBe(false);
        expect(state.balanceSheet).toEqual(mockBalanceSheet);
        expect(state.generationStats.balanceSheetTime).toBeGreaterThan(0);
        expect(state.lastGenerated.balanceSheet).toBeTruthy();
      });

      it('should handle balance sheet generation failure', async () => {
        const FinancialStatementService = require('../../services/FinancialStatementService');
        FinancialStatementService.generateBalanceSheet.mockRejectedValue(
          new Error('Balance sheet generation failed')
        );

        await store.dispatch(generateBalanceSheet({
          companyId: 'company-1',
          asOfDate: '2025-07-22'
        }));

        const state = store.getState().financial;
        expect(state.isGeneratingBalanceSheet).toBe(false);
        expect(state.generationError).toBe('Balance sheet generation failed');
        expect(state.balanceSheet).toBeNull();
      });

      it('should set loading state during generation', () => {
        const FinancialStatementService = require('../../services/FinancialStatementService');
        FinancialStatementService.generateBalanceSheet.mockImplementation(
          () => new Promise(resolve => setTimeout(resolve, 100))
        );

        store.dispatch(generateBalanceSheet({
          companyId: 'company-1',
          asOfDate: '2025-07-22'
        }));

        const state = store.getState().financial;
        expect(state.isGeneratingBalanceSheet).toBe(true);
        expect(state.generationError).toBeNull();
      });
    });

    describe('generateIncomeStatement', () => {
      it('should handle successful income statement generation', async () => {
        const mockIncomeStatement = {
          revenue: [
            { accountCode: '4100', accountName: '매출', amount: 5000000 },
            { accountCode: '4200', accountName: '기타수익', amount: 200000 }
          ],
          expenses: [
            { accountCode: '5100', accountName: '매출원가', amount: 3000000 },
            { accountCode: '6100', accountName: '판매비', amount: 800000 }
          ],
          periodStart: '2025-01-01',
          periodEnd: '2025-07-31'
        };

        const FinancialStatementService = require('../../services/FinancialStatementService');
        FinancialStatementService.generateIncomeStatement.mockResolvedValue(mockIncomeStatement);

        await store.dispatch(generateIncomeStatement({
          companyId: 'company-1',
          periodStart: '2025-01-01',
          periodEnd: '2025-07-31'
        }));

        const state = store.getState().financial;
        expect(state.isGeneratingIncomeStatement).toBe(false);
        expect(state.incomeStatement).toEqual(mockIncomeStatement);
        expect(state.generationStats.incomeStatementTime).toBeGreaterThan(0);
        expect(state.lastGenerated.incomeStatement).toBeTruthy();
      });

      it('should handle income statement generation failure', async () => {
        const FinancialStatementService = require('../../services/FinancialStatementService');
        FinancialStatementService.generateIncomeStatement.mockRejectedValue(
          new Error('Income statement generation failed')
        );

        await store.dispatch(generateIncomeStatement({
          companyId: 'company-1',
          periodStart: '2025-01-01',
          periodEnd: '2025-07-31'
        }));

        const state = store.getState().financial;
        expect(state.isGeneratingIncomeStatement).toBe(false);
        expect(state.generationError).toBe('Income statement generation failed');
        expect(state.incomeStatement).toBeNull();
      });
    });

    describe('calculateFinancialRatios', () => {
      it('should handle successful financial ratios calculation', async () => {
        const mockRatios = {
          liquidityRatios: {
            currentRatio: 2.5,
            quickRatio: 1.8,
            cashRatio: 0.5
          },
          profitabilityRatios: {
            grossProfitMargin: 0.35,
            operatingProfitMargin: 0.15,
            netProfitMargin: 0.12
          },
          leverageRatios: {
            debtToEquity: 0.3,
            debtToAssets: 0.2,
            interestCoverage: 8.5
          }
        };

        const FinancialStatementService = require('../../services/FinancialStatementService');
        FinancialStatementService.calculateFinancialRatios.mockResolvedValue(mockRatios);

        await store.dispatch(calculateFinancialRatios({
          companyId: 'company-1',
          asOfDate: '2025-07-22',
          periodStart: '2025-01-01',
          periodEnd: '2025-07-31'
        }));

        const state = store.getState().financial;
        expect(state.isCalculatingRatios).toBe(false);
        expect(state.financialRatios).toEqual(mockRatios);
        expect(state.lastGenerated.ratios).toBeTruthy();
      });

      it('should handle financial ratios calculation failure', async () => {
        const FinancialStatementService = require('../../services/FinancialStatementService');
        FinancialStatementService.calculateFinancialRatios.mockRejectedValue(
          new Error('Ratios calculation failed')
        );

        await store.dispatch(calculateFinancialRatios({
          companyId: 'company-1',
          asOfDate: '2025-07-22',
          periodStart: '2025-01-01',
          periodEnd: '2025-07-31'
        }));

        const state = store.getState().financial;
        expect(state.isCalculatingRatios).toBe(false);
        expect(state.error).toBe('Ratios calculation failed');
        expect(state.financialRatios).toBeNull();
      });
    });

    describe('generateComparisonReport', () => {
      it('should handle successful comparison report generation', async () => {
        const mockReport = {
          currentPeriod: { revenue: 5000000, expenses: 4000000, netIncome: 1000000 },
          previousPeriod: { revenue: 4500000, expenses: 3800000, netIncome: 700000 },
          changes: {
            revenueChange: 0.11,
            expensesChange: 0.05,
            netIncomeChange: 0.43
          }
        };

        const FinancialStatementService = require('../../services/FinancialStatementService');
        FinancialStatementService.generateComparisonReport.mockResolvedValue(mockReport);

        const result = await store.dispatch(generateComparisonReport({
          companyId: 'company-1',
          currentPeriod: '2025-07',
          previousPeriod: '2025-06'
        }));

        expect(result.payload).toEqual(mockReport);
      });
    });
  });

  describe('selectors', () => {
    const mockState = {
      financial: {
        balanceSheet: {
          assets: [
            { accountCode: '1100', accountName: '현금', amount: 1000000 },
            { accountCode: '1120', accountName: '카드매출채권', amount: 500000 }
          ],
          liabilities: [
            { accountCode: '2100', accountName: '매입채무', amount: 300000 }
          ],
          equity: [
            { accountCode: '3100', accountName: '자본금', amount: 1200000 }
          ],
          asOfDate: '2025-07-22'
        },
        incomeStatement: {
          revenue: [
            { accountCode: '4100', accountName: '매출', amount: 5000000 }
          ],
          expenses: [
            { accountCode: '5100', accountName: '매출원가', amount: 3000000, category: 'COGS' },
            { accountCode: '6100', accountName: '판매비', amount: 800000, category: 'OPERATING' }
          ],
          periodStart: '2025-01-01',
          periodEnd: '2025-07-31'
        },
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
      }
    };

    describe('selectBalanceSheetSummary', () => {
      it('should calculate balance sheet summary correctly', () => {
        const summary = selectBalanceSheetSummary(mockState);
        
        expect(summary).toEqual({
          totalAssets: 1500000,
          totalLiabilities: 300000,
          totalEquity: 1200000,
          isBalanced: true,
          asOfDate: '2025-07-22'
        });
      });

      it('should detect imbalanced sheet', () => {
        const imbalancedState = {
          ...mockState,
          financial: {
            ...mockState.financial,
            balanceSheet: {
              ...mockState.financial.balanceSheet,
              equity: [
                { accountCode: '3100', accountName: '자본금', amount: 1000000 } // 불균형
              ]
            }
          }
        };

        const summary = selectBalanceSheetSummary(imbalancedState);
        expect(summary?.isBalanced).toBe(false);
      });

      it('should return null when no balance sheet data', () => {
        const emptyState = {
          financial: { ...mockState.financial, balanceSheet: null }
        };

        const summary = selectBalanceSheetSummary(emptyState);
        expect(summary).toBeNull();
      });
    });

    describe('selectIncomeStatementSummary', () => {
      it('should calculate income statement summary correctly', () => {
        const summary = selectIncomeStatementSummary(mockState);
        
        expect(summary).toEqual({
          totalRevenue: 5000000,
          totalExpenses: 3800000,
          grossProfit: 2000000, // 5000000 - 3000000 (COGS)
          operatingIncome: 1200000, // 2000000 - 800000 (OPERATING)
          netIncome: 1200000, // 5000000 - 3800000
          netProfitMargin: 24, // (1200000 / 5000000) * 100
          periodStart: '2025-01-01',
          periodEnd: '2025-07-31'
        });
      });

      it('should handle zero revenue correctly', () => {
        const zeroRevenueState = {
          ...mockState,
          financial: {
            ...mockState.financial,
            incomeStatement: {
              ...mockState.financial.incomeStatement,
              revenue: []
            }
          }
        };

        const summary = selectIncomeStatementSummary(zeroRevenueState);
        expect(summary?.netProfitMargin).toBe(0);
      });

      it('should return null when no income statement data', () => {
        const emptyState = {
          financial: { ...mockState.financial, incomeStatement: null }
        };

        const summary = selectIncomeStatementSummary(emptyState);
        expect(summary).toBeNull();
      });
    });

    describe('selectFinancialHealthIndicators', () => {
      it('should calculate financial health indicators correctly', () => {
        const indicators = selectFinancialHealthIndicators(mockState);
        
        expect(indicators).toEqual({
          debtRatio: 20, // (300000 / 1500000) * 100
          equityRatio: 80, // (1200000 / 1500000) * 100
          roe: 100, // (1200000 / 1200000) * 100
          roa: 80, // (1200000 / 1500000) * 100
          profitability: 24,
          isHealthy: true // debtRatio < 50 && profitability > 5
        });
      });

      it('should identify unhealthy financial status', () => {
        const unhealthyState = {
          ...mockState,
          financial: {
            ...mockState.financial,
            balanceSheet: {
              ...mockState.financial.balanceSheet,
              liabilities: [
                { accountCode: '2100', accountName: '매입채무', amount: 800000 } // 높은 부채
              ]
            },
            incomeStatement: {
              ...mockState.financial.incomeStatement,
              revenue: [
                { accountCode: '4100', accountName: '매출', amount: 1000000 } // 낮은 수익
              ]
            }
          }
        };

        const indicators = selectFinancialHealthIndicators(unhealthyState);
        expect(indicators?.isHealthy).toBe(false);
      });

      it('should return null when missing data', () => {
        const incompleteState = {
          financial: { 
            ...mockState.financial, 
            balanceSheet: null 
          }
        };

        const indicators = selectFinancialHealthIndicators(incompleteState);
        expect(indicators).toBeNull();
      });
    });
  });
});
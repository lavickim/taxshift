import FinancialStatementService, { 
  BalanceSheet, 
  IncomeStatement, 
  FinancialRatios,
  ComparisonReport
} from '../FinancialStatementService';

// Mock API calls
global.fetch = jest.fn();
const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

describe('FinancialStatementService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('generateBalanceSheet', () => {
    it('should generate balance sheet successfully', async () => {
      // Given
      const companyId = 'company-001';
      const asOfDate = '2025-07-22';
      
      const mockApiResponse = {
        companyId,
        asOfDate,
        자산: {
          현금: 500000,
          보통예금: 1000000,
          매출채권: 300000
        },
        부채: {
          매입채무: 200000,
          단기차입금: 100000
        },
        자본: {
          자본금: 1000000,
          이익잉여금: 500000
        },
        generatedAt: '2025-07-22T10:00:00Z',
        processingTimeMs: 150,
        includedTransactions: 25
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockApiResponse
      } as Response);

      // When
      const balanceSheet = await FinancialStatementService.generateBalanceSheet(companyId, asOfDate);

      // Then
      expect(balanceSheet.companyId).toBe(companyId);
      expect(balanceSheet.asOfDate).toBe(asOfDate);
      expect(balanceSheet.assets).toHaveLength(3);
      expect(balanceSheet.liabilities).toHaveLength(2);
      expect(balanceSheet.equity).toHaveLength(2);
      expect(balanceSheet.isBalanced).toBe(true);
      expect(balanceSheet.generationInfo.generatedAt).toBe('2025-07-22T10:00:00Z');
      expect(balanceSheet.generationInfo.processingTimeMs).toBe(150);
      expect(balanceSheet.generationInfo.includedTransactions).toBe(25);
      
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining(`/api/v2/accounting/generate-balance-sheet?companyId=${companyId}&asOfDate=${asOfDate}`),
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          }
        })
      );
    });

    it('should handle API errors gracefully', async () => {
      // Given
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500
      } as Response);

      // When & Then
      await expect(
        FinancialStatementService.generateBalanceSheet('company-001', '2025-07-22')
      ).rejects.toThrow('대차대조표 생성 실패: 500');
    });
  });

  describe('generateIncomeStatement', () => {
    it('should generate income statement successfully', async () => {
      // Given
      const companyId = 'company-001';
      const periodStart = '2025-07-01';
      const periodEnd = '2025-07-31';
      
      const mockApiResponse = {
        companyId,
        periodStart,
        periodEnd,
        수익: {
          매출: 2000000,
          기타수익: 50000
        },
        비용: {
          매출원가: 1200000,
          판매관리비: 300000
        },
        generatedAt: '2025-07-22T10:00:00Z',
        processingTimeMs: 200,
        includedTransactions: 30
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockApiResponse
      } as Response);

      // When
      const incomeStatement = await FinancialStatementService.generateIncomeStatement(
        companyId, 
        periodStart, 
        periodEnd
      );

      // Then
      expect(incomeStatement.companyId).toBe(companyId);
      expect(incomeStatement.periodStart).toBe(periodStart);
      expect(incomeStatement.periodEnd).toBe(periodEnd);
      expect(incomeStatement.revenue).toHaveLength(2);
      expect(incomeStatement.expenses).toHaveLength(2);
      expect(incomeStatement.netIncome).toBe(550000); // 2050000 - 1500000
      expect(incomeStatement.profitMargin).toBeCloseTo(26.83); // 550000 / 2050000 * 100
      expect(incomeStatement.generationInfo.processingTimeMs).toBe(200);
      
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining(`/api/v2/accounting/generate-income-statement?companyId=${companyId}&periodStart=${periodStart}&periodEnd=${periodEnd}`),
        expect.objectContaining({
          method: 'POST'
        })
      );
    });
  });

  describe('getFinancialSummary', () => {
    it('should return financial summary successfully', async () => {
      // Given
      const mockBalanceSheet: BalanceSheet = {
        companyId: 'company-001',
        asOfDate: '2025-07-31',
        assets: [
          { code: '1100', name: '현금', amount: 500000, category: 'CURRENT' },
          { code: '1120', name: '보통예금', amount: 1000000, category: 'CURRENT' }
        ],
        liabilities: [
          { code: '2100', name: '매입채무', amount: 200000, category: 'CURRENT' }
        ],
        equity: [
          { code: '3100', name: '자본금', amount: 1000000, category: 'CAPITAL' },
          { code: '3200', name: '이익잉여금', amount: 300000, category: 'RETAINED' }
        ],
        isBalanced: true,
        generationInfo: {
          generatedAt: '2025-07-22T10:00:00Z',
          processingTimeMs: 150,
          includedTransactions: 25
        }
      };

      const mockIncomeStatement: IncomeStatement = {
        companyId: 'company-001',
        periodStart: '2025-07-01',
        periodEnd: '2025-07-31',
        revenue: [
          { code: '4100', name: '매출', amount: 2000000, category: 'SALES' }
        ],
        expenses: [
          { code: '5100', name: '매출원가', amount: 1200000, category: 'COGS' },
          { code: '6100', name: '판매비', amount: 300000, category: 'OPERATING' }
        ],
        netIncome: 500000,
        profitMargin: 25.0,
        generationInfo: {
          generatedAt: '2025-07-22T10:00:00Z',
          processingTimeMs: 200,
          includedTransactions: 30
        }
      };

      jest.spyOn(FinancialStatementService, 'generateBalanceSheet').mockResolvedValue(mockBalanceSheet);
      jest.spyOn(FinancialStatementService, 'generateIncomeStatement').mockResolvedValue(mockIncomeStatement);

      // When
      const summary = await FinancialStatementService.getFinancialSummary(
        'company-001',
        '2025-07-01',
        '2025-07-31'
      );

      // Then
      expect(summary.totalAssets).toBe(1500000);
      expect(summary.totalLiabilities).toBe(200000);
      expect(summary.totalEquity).toBe(1300000);
      expect(summary.totalRevenues).toBe(2000000);
      expect(summary.totalExpenses).toBe(1500000);
      expect(summary.netIncome).toBe(500000);
      expect(summary.isBalanced).toBe(true);
    });
  });

  describe('calculateFinancialRatios', () => {
    it('should return mock financial ratios', async () => {
      // When
      const ratios = await FinancialStatementService.calculateFinancialRatios(
        'company-001',
        '2025-07-31',
        '2025-07-01',
        '2025-07-31'
      );

      // Then
      expect(ratios).toEqual({
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
    });
  });

  describe('generateComparisonReport', () => {
    it('should generate comparison report successfully', async () => {
      // Given
      const mockResponse: ComparisonReport = {
        companyId: 'company-001',
        currentPeriod: '2025-07',
        previousPeriod: '2025-06',
        comparison: {
          revenue: {
            current: 2000000,
            previous: 1800000,
            growth: 11.11
          },
          netIncome: {
            current: 500000,
            previous: 450000,
            growth: 11.11
          },
          assets: {
            current: 1500000,
            previous: 1400000,
            growth: 7.14
          }
        },
        analysis: '매출과 순이익이 모두 증가하여 긍정적인 성장세를 보이고 있습니다.'
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      } as Response);

      // When
      const report = await FinancialStatementService.generateComparisonReport(
        'company-001',
        '2025-07',
        '2025-06'
      );

      // Then
      expect(report.companyId).toBe('company-001');
      expect(report.currentPeriod).toBe('2025-07');
      expect(report.previousPeriod).toBe('2025-06');
      expect(report.comparison.revenue.growth).toBe(11.11);
      expect(report.comparison.netIncome.growth).toBe(11.11);
      expect(report.comparison.assets.growth).toBe(7.14);
      expect(report.analysis).toContain('긍정적인 성장세');
      
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/v2/accounting/comparison-report'),
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            companyId: 'company-001',
            currentPeriod: '2025-07',
            previousPeriod: '2025-06'
          })
        })
      );
    });
  });

  describe('generatePDF', () => {
    it('should generate PDF blob successfully', async () => {
      // Given
      const mockBlob = new Blob(['mock pdf content'], { type: 'application/pdf' });
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        blob: async () => mockBlob
      } as Response);

      // When
      const pdfBlob = await FinancialStatementService.generatePDF(
        'balance-sheet',
        'company-001',
        { asOfDate: '2025-07-31' }
      );

      // Then
      expect(pdfBlob).toBe(mockBlob);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/v2/accounting/export/balance-sheet/pdf'),
        expect.objectContaining({
          method: 'GET'
        })
      );
    });
  });

  describe('calculateGrowthRates', () => {
    it('should calculate growth rates successfully', async () => {
      // Given
      const currentIncome: IncomeStatement = {
        companyId: 'company-001',
        periodStart: '2025-07-01',
        periodEnd: '2025-07-31',
        revenue: [{ code: '4100', name: '매출', amount: 2000000, category: 'SALES' }],
        expenses: [{ code: '5100', name: '매출원가', amount: 1200000, category: 'COGS' }],
        netIncome: 800000,
        profitMargin: 40.0,
        generationInfo: {
          generatedAt: '2025-07-22T10:00:00Z',
          processingTimeMs: 200,
          includedTransactions: 30
        }
      };

      const previousIncome: IncomeStatement = {
        companyId: 'company-001',
        periodStart: '2025-06-01',
        periodEnd: '2025-06-30',
        revenue: [{ code: '4100', name: '매출', amount: 1800000, category: 'SALES' }],
        expenses: [{ code: '5100', name: '매출원가', amount: 1100000, category: 'COGS' }],
        netIncome: 700000,
        profitMargin: 38.89,
        generationInfo: {
          generatedAt: '2025-06-22T10:00:00Z',
          processingTimeMs: 180,
          includedTransactions: 28
        }
      };

      const currentBalance = {
        companyId: 'company-001',
        asOfDate: '2025-07-31',
        assets: [{ code: '1100', name: '현금', amount: 1500000, category: 'CURRENT' }],
        liabilities: [],
        equity: [],
        isBalanced: true,
        generationInfo: {
          generatedAt: '2025-07-22T10:00:00Z',
          processingTimeMs: 150,
          includedTransactions: 25
        }
      };

      const previousBalance = {
        companyId: 'company-001',
        asOfDate: '2025-06-30',
        assets: [{ code: '1100', name: '현금', amount: 1400000, category: 'CURRENT' }],
        liabilities: [],
        equity: [],
        isBalanced: true,
        generationInfo: {
          generatedAt: '2025-06-22T10:00:00Z',
          processingTimeMs: 140,
          includedTransactions: 23
        }
      };

      jest.spyOn(FinancialStatementService, 'generateIncomeStatement')
        .mockResolvedValueOnce(currentIncome)
        .mockResolvedValueOnce(previousIncome);
      
      jest.spyOn(FinancialStatementService, 'generateBalanceSheet')
        .mockResolvedValueOnce(currentBalance)
        .mockResolvedValueOnce(previousBalance);

      // When
      const growthRates = await FinancialStatementService.calculateGrowthRates(
        'company-001',
        '2025-07-01',
        '2025-07-31',
        '2025-06-01',
        '2025-06-30'
      );

      // Then
      expect(growthRates.revenueGrowth).toBeCloseTo(11.11); // (2000000 - 1800000) / 1800000 * 100
      expect(growthRates.netIncomeGrowth).toBeCloseTo(14.29); // (800000 - 700000) / 700000 * 100
      expect(growthRates.assetGrowth).toBeCloseTo(7.14); // (1500000 - 1400000) / 1400000 * 100
    });
  });
});
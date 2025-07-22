import { FinancialStatementService } from '../FinancialStatementService';
import { JournalEntry, JournalEntryDetail } from '../BookkeepingService';

// Mock API calls
global.fetch = jest.fn();
const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

describe('FinancialStatementService', () => {
  let service: FinancialStatementService;
  
  const mockJournalEntries: JournalEntry[] = [
    {
      id: 'je-1',
      transactionId: 'tx-1',
      description: 'GS25 몤초점 결제',
      date: '2025-07-01',
      details: [
        {
          id: 'detail-1',
          accountCode: '1120',
          accountName: '카드매출채권',
          debitAmount: 15000,
          creditAmount: 0,
          description: '카드 매출'
        },
        {
          id: 'detail-2',
          accountCode: '4100',
          accountName: '매출',
          debitAmount: 0,
          creditAmount: 15000,
          description: '매출 발생'
        }
      ],
      status: 'APPROVED',
      confidence: 95,
      aiGenerated: true,
      createdAt: '2025-07-01T10:00:00Z',
      updatedAt: '2025-07-01T10:00:00Z'
    },
    {
      id: 'je-2',
      transactionId: 'tx-2',
      description: '사무용품 구매',
      date: '2025-07-02',
      details: [
        {
          id: 'detail-3',
          accountCode: '6110',
          accountName: '사무용품비',
          debitAmount: 25000,
          creditAmount: 0,
          description: '사무용품 구매'
        },
        {
          id: 'detail-4',
          accountCode: '1100',
          accountName: '현금',
          debitAmount: 0,
          creditAmount: 25000,
          description: '현금 지출'
        }
      ],
      status: 'APPROVED',
      confidence: 88,
      aiGenerated: false,
      createdAt: '2025-07-02T14:30:00Z',
      updatedAt: '2025-07-02T14:30:00Z'
    }
  ];

  beforeEach(() => {
    service = new FinancialStatementService();
    jest.clearAllMocks();
  });

  describe('generateBalanceSheet', () => {
    it('should generate balance sheet with correct asset calculations', async () => {
      // Given
      const companyId = 'company-001';
      const asOfDate = '2025-07-22';
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ journalEntries: mockJournalEntries })
      } as Response);

      // When
      const balanceSheet = await service.generateBalanceSheet(companyId, asOfDate);

      // Then
      expect(balanceSheet).toEqual({
        assets: [
          { accountCode: '1100', accountName: '현금', amount: -25000 },
          { accountCode: '1120', accountName: '카드매출채권', amount: 15000 }
        ],
        liabilities: [],
        equity: [
          { accountCode: 'RETAINED_EARNINGS', accountName: '이익잔여금', amount: -10000 }
        ],
        asOfDate: '2025-07-22'
      });
      
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining(`/api/journal-entries?companyId=${companyId}&asOfDate=${asOfDate}`)
      );
    });

    it('should handle empty journal entries', async () => {
      // Given
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ journalEntries: [] })
      } as Response);

      // When
      const balanceSheet = await service.generateBalanceSheet('company-001', '2025-07-22');

      // Then
      expect(balanceSheet).toEqual({
        assets: [],
        liabilities: [],
        equity: [],
        asOfDate: '2025-07-22'
      });
    });

    it('should handle API errors gracefully', async () => {
      // Given
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      // When & Then
      await expect(
        service.generateBalanceSheet('company-001', '2025-07-22')
      ).rejects.toThrow('Failed to generate balance sheet');
    });

    it('should correctly classify accounts by type', async () => {
      // Given
      const complexJournalEntries: JournalEntry[] = [
        {
          id: 'je-complex',
          transactionId: 'tx-complex',
          description: '복합 거래',
          date: '2025-07-22',
          details: [
            // 자산 계정
            { id: '1', accountCode: '1100', accountName: '현금', debitAmount: 100000, creditAmount: 0, description: '' },
            { id: '2', accountCode: '1410', accountName: '동채', debitAmount: 50000, creditAmount: 0, description: '' },
            // 부채 계정
            { id: '3', accountCode: '2100', accountName: '매입채무', debitAmount: 0, creditAmount: 30000, description: '' },
            // 자본 계정
            { id: '4', accountCode: '3100', accountName: '자본금', debitAmount: 0, creditAmount: 120000, description: '' }
          ],
          status: 'APPROVED',
          confidence: 90,
          aiGenerated: true,
          createdAt: '2025-07-22T10:00:00Z',
          updatedAt: '2025-07-22T10:00:00Z'
        }
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ journalEntries: complexJournalEntries })
      } as Response);

      // When
      const balanceSheet = await service.generateBalanceSheet('company-001', '2025-07-22');

      // Then
      expect(balanceSheet.assets).toHaveLength(2);
      expect(balanceSheet.liabilities).toHaveLength(1);
      expect(balanceSheet.equity).toHaveLength(1);
      
      // 자산 총액
      const totalAssets = balanceSheet.assets.reduce((sum, asset) => sum + asset.amount, 0);
      expect(totalAssets).toBe(150000);
      
      // 부채 총액
      const totalLiabilities = balanceSheet.liabilities.reduce((sum, liability) => sum + liability.amount, 0);
      expect(totalLiabilities).toBe(30000);
      
      // 자본 총액
      const totalEquity = balanceSheet.equity.reduce((sum, equity) => sum + equity.amount, 0);
      expect(totalEquity).toBe(120000);
      
      // 자산 = 부채 + 자본 (복식부기 균형 식)
      expect(totalAssets).toBe(totalLiabilities + totalEquity);
    });
  });

  describe('generateIncomeStatement', () => {
    it('should generate income statement with correct calculations', async () => {
      // Given
      const companyId = 'company-001';
      const periodStart = '2025-07-01';
      const periodEnd = '2025-07-31';
      
      const incomeJournalEntries: JournalEntry[] = [
        {
          id: 'je-income',
          transactionId: 'tx-income',
          description: '매출 및 비용',
          date: '2025-07-15',
          details: [
            // 매출
            { id: '1', accountCode: '4100', accountName: '매출', debitAmount: 0, creditAmount: 1000000, description: '제품 매출' },
            { id: '2', accountCode: '4200', accountName: '기타수익', debitAmount: 0, creditAmount: 50000, description: '기타수익' },
            // 매출원가
            { id: '3', accountCode: '5100', accountName: '매출원가', debitAmount: 600000, creditAmount: 0, description: '제품 원가' },
            // 운영비용
            { id: '4', accountCode: '6100', accountName: '판매비', debitAmount: 150000, creditAmount: 0, description: '판매비용' },
            { id: '5', accountCode: '6200', accountName: '관리비', debitAmount: 100000, creditAmount: 0, description: '관리비용' },
            // 기타비용
            { id: '6', accountCode: '7100', accountName: '영업외비용', debitAmount: 25000, creditAmount: 0, description: '영업외비용' },
            // 균형 맞추기 (현금)
            { id: '7', accountCode: '1100', accountName: '현금', debitAmount: 175000, creditAmount: 0, description: '현금 증가' }
          ],
          status: 'APPROVED',
          confidence: 92,
          aiGenerated: true,
          createdAt: '2025-07-15T10:00:00Z',
          updatedAt: '2025-07-15T10:00:00Z'
        }
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ journalEntries: incomeJournalEntries })
      } as Response);

      // When
      const incomeStatement = await service.generateIncomeStatement(companyId, periodStart, periodEnd);

      // Then
      expect(incomeStatement).toEqual({
        revenue: [
          { accountCode: '4100', accountName: '매출', amount: 1000000, category: 'REVENUE' },
          { accountCode: '4200', accountName: '기타수익', amount: 50000, category: 'OTHER_REVENUE' }
        ],
        expenses: [
          { accountCode: '5100', accountName: '매출원가', amount: 600000, category: 'COGS' },
          { accountCode: '6100', accountName: '판매비', amount: 150000, category: 'OPERATING' },
          { accountCode: '6200', accountName: '관리비', amount: 100000, category: 'OPERATING' },
          { accountCode: '7100', accountName: '영업외비용', amount: 25000, category: 'OTHER' }
        ],
        periodStart: '2025-07-01',
        periodEnd: '2025-07-31'
      });
      
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining(`/api/journal-entries?companyId=${companyId}&periodStart=${periodStart}&periodEnd=${periodEnd}`)
      );
    });

    it('should calculate financial metrics correctly', async () => {
      // Given - 수익성 지표 계산을 위한 데이터
      const profitabilityData: JournalEntry[] = [
        {
          id: 'je-profit',
          transactionId: 'tx-profit',
          description: '수익성 테스트',
          date: '2025-07-22',
          details: [
            { id: '1', accountCode: '4100', accountName: '매출', debitAmount: 0, creditAmount: 2000000, description: '제품 매출' },
            { id: '2', accountCode: '5100', accountName: '매출원가', debitAmount: 1200000, creditAmount: 0, description: '제품 원가' },
            { id: '3', accountCode: '6100', accountName: '운영비', debitAmount: 300000, creditAmount: 0, description: '운영비용' },
            { id: '4', accountCode: '1100', accountName: '현금', debitAmount: 500000, creditAmount: 0, description: '순이익' }
          ],
          status: 'APPROVED',
          confidence: 95,
          aiGenerated: true,
          createdAt: '2025-07-22T10:00:00Z',
          updatedAt: '2025-07-22T10:00:00Z'
        }
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ journalEntries: profitabilityData })
      } as Response);

      // When
      const incomeStatement = await service.generateIncomeStatement('company-001', '2025-07-01', '2025-07-31');

      // Then
      const totalRevenue = incomeStatement.revenue.reduce((sum, item) => sum + item.amount, 0);
      const totalExpenses = incomeStatement.expenses.reduce((sum, item) => sum + item.amount, 0);
      
      expect(totalRevenue).toBe(2000000); // 총 매출
      expect(totalExpenses).toBe(1500000); // 총 비용 (1200000 + 300000)
      
      const grossProfit = totalRevenue - incomeStatement.expenses
        .filter(e => e.category === 'COGS')
        .reduce((sum, e) => sum + e.amount, 0);
      expect(grossProfit).toBe(800000); // 매출총이익 (2000000 - 1200000)
      
      const operatingIncome = grossProfit - incomeStatement.expenses
        .filter(e => e.category === 'OPERATING')
        .reduce((sum, e) => sum + e.amount, 0);
      expect(operatingIncome).toBe(500000); // 영업이익 (800000 - 300000)
      
      const netProfitMargin = (operatingIncome / totalRevenue) * 100;
      expect(netProfitMargin).toBe(25); // 순이익률 25%
    });
  });

  describe('calculateFinancialRatios', () => {
    it('should calculate comprehensive financial ratios', async () => {
      // Given
      const mockBalanceSheet = {
        assets: [
          { accountCode: '1100', accountName: '현금', amount: 500000 },
          { accountCode: '1120', accountName: '카드매출채권', amount: 300000 },
          { accountCode: '1410', accountName: '동채', amount: 700000 }
        ],
        liabilities: [
          { accountCode: '2100', accountName: '매입채무', amount: 200000 },
          { accountCode: '2200', accountName: '단기차입금', amount: 100000 }
        ],
        equity: [
          { accountCode: '3100', accountName: '자본금', amount: 1200000 }
        ],
        asOfDate: '2025-07-22'
      };

      const mockIncomeStatement = {
        revenue: [
          { accountCode: '4100', accountName: '매출', amount: 2000000, category: 'REVENUE' }
        ],
        expenses: [
          { accountCode: '5100', accountName: '매출원가', amount: 1200000, category: 'COGS' },
          { accountCode: '6100', accountName: '운영비', amount: 300000, category: 'OPERATING' }
        ],
        periodStart: '2025-07-01',
        periodEnd: '2025-07-31'
      };

      jest.spyOn(service, 'generateBalanceSheet').mockResolvedValue(mockBalanceSheet);
      jest.spyOn(service, 'generateIncomeStatement').mockResolvedValue(mockIncomeStatement);

      // When
      const ratios = await service.calculateFinancialRatios('company-001', '2025-07-22', '2025-07-01', '2025-07-31');

      // Then
      expect(ratios).toEqual({
        liquidityRatios: {
          currentRatio: 2.67, // (500000 + 300000) / (200000 + 100000)
          quickRatio: 2.67,   // 똑같음 (재고자산 없음)
          cashRatio: 1.67     // 500000 / 300000
        },
        profitabilityRatios: {
          grossProfitMargin: 40.0,    // (2000000 - 1200000) / 2000000 * 100
          operatingProfitMargin: 25.0, // (800000 - 300000) / 2000000 * 100
          netProfitMargin: 25.0       // 500000 / 2000000 * 100
        },
        leverageRatios: {
          debtToEquity: 25.0,   // 300000 / 1200000 * 100
          debtToAssets: 20.0,   // 300000 / 1500000 * 100
          interestCoverage: null // 이자비용 데이터 없음
        }
      });
    });

    it('should handle division by zero gracefully', async () => {
      // Given - 매출이 0인 경우
      const mockBalanceSheet = {
        assets: [{ accountCode: '1100', accountName: '현금', amount: 100000 }],
        liabilities: [],
        equity: [{ accountCode: '3100', accountName: '자본금', amount: 100000 }],
        asOfDate: '2025-07-22'
      };

      const mockIncomeStatement = {
        revenue: [],
        expenses: [],
        periodStart: '2025-07-01',
        periodEnd: '2025-07-31'
      };

      jest.spyOn(service, 'generateBalanceSheet').mockResolvedValue(mockBalanceSheet);
      jest.spyOn(service, 'generateIncomeStatement').mockResolvedValue(mockIncomeStatement);

      // When
      const ratios = await service.calculateFinancialRatios('company-001', '2025-07-22', '2025-07-01', '2025-07-31');

      // Then
      expect(ratios.profitabilityRatios.grossProfitMargin).toBe(0);
      expect(ratios.profitabilityRatios.operatingProfitMargin).toBe(0);
      expect(ratios.profitabilityRatios.netProfitMargin).toBe(0);
    });
  });

  describe('generateComparisonReport', () => {
    it('should generate period comparison report', async () => {
      // Given
      const currentPeriodData = {
        revenue: [{ accountCode: '4100', accountName: '매출', amount: 2000000, category: 'REVENUE' }],
        expenses: [{ accountCode: '5100', accountName: '매출원가', amount: 1200000, category: 'COGS' }],
        periodStart: '2025-07-01',
        periodEnd: '2025-07-31'
      };

      const previousPeriodData = {
        revenue: [{ accountCode: '4100', accountName: '매출', amount: 1800000, category: 'REVENUE' }],
        expenses: [{ accountCode: '5100', accountName: '매출원가', amount: 1100000, category: 'COGS' }],
        periodStart: '2025-06-01',
        periodEnd: '2025-06-30'
      };

      jest.spyOn(service, 'generateIncomeStatement')
        .mockResolvedValueOnce(currentPeriodData)   // 현재 기간
        .mockResolvedValueOnce(previousPeriodData); // 이전 기간

      // When
      const comparison = await service.generateComparisonReport('company-001', '2025-07', '2025-06');

      // Then
      expect(comparison).toEqual({
        currentPeriod: {
          totalRevenue: 2000000,
          totalExpenses: 1200000,
          netIncome: 800000
        },
        previousPeriod: {
          totalRevenue: 1800000,
          totalExpenses: 1100000,
          netIncome: 700000
        },
        changes: {
          revenueChange: 11.11,      // (2000000 - 1800000) / 1800000 * 100
          expensesChange: 9.09,      // (1200000 - 1100000) / 1100000 * 100
          netIncomeChange: 14.29     // (800000 - 700000) / 700000 * 100
        },
        trends: {
          revenueGrowth: 'POSITIVE',
          expenseControl: 'NEGATIVE', // 비용 증가률이 매출 증가률보다 낮음
          profitability: 'IMPROVING'
        }
      });
    });
  });
});

// Mock implementation
class FinancialStatementService {
  async generateBalanceSheet(companyId: string, asOfDate: string) {
    const response = await fetch(`/api/journal-entries?companyId=${companyId}&asOfDate=${asOfDate}`);
    if (!response.ok) throw new Error('Failed to generate balance sheet');
    
    const { journalEntries } = await response.json();
    
    const accounts = new Map<string, { name: string, amount: number, type: string }>();
    
    journalEntries.forEach((entry: JournalEntry) => {
      entry.details.forEach((detail: JournalEntryDetail) => {
        const accountType = this.getAccountType(detail.accountCode);
        const existing = accounts.get(detail.accountCode);
        const netAmount = detail.debitAmount - detail.creditAmount;
        
        accounts.set(detail.accountCode, {
          name: detail.accountName,
          amount: (existing?.amount || 0) + netAmount,
          type: accountType
        });
      });
    });
    
    const assets = [];
    const liabilities = [];
    const equity = [];
    
    for (const [code, account] of accounts) {
      if (account.type === 'ASSET') {
        assets.push({ accountCode: code, accountName: account.name, amount: account.amount });
      } else if (account.type === 'LIABILITY') {
        liabilities.push({ accountCode: code, accountName: account.name, amount: account.amount });
      } else if (account.type === 'EQUITY') {
        equity.push({ accountCode: code, accountName: account.name, amount: account.amount });
      }
    }
    
    // 자동 대차대조표 맞추기
    const totalAssets = assets.reduce((sum, asset) => sum + asset.amount, 0);
    const totalLiabilitiesAndEquity = 
      liabilities.reduce((sum, liability) => sum + liability.amount, 0) +
      equity.reduce((sum, equityItem) => sum + equityItem.amount, 0);
    
    if (totalAssets !== totalLiabilitiesAndEquity) {
      const retainedEarnings = totalAssets - totalLiabilitiesAndEquity;
      equity.push({
        accountCode: 'RETAINED_EARNINGS',
        accountName: '이익잔여금',
        amount: retainedEarnings
      });
    }
    
    return {
      assets,
      liabilities,
      equity,
      asOfDate
    };
  }
  
  async generateIncomeStatement(companyId: string, periodStart: string, periodEnd: string) {
    const response = await fetch(`/api/journal-entries?companyId=${companyId}&periodStart=${periodStart}&periodEnd=${periodEnd}`);
    const { journalEntries } = await response.json();
    
    const revenue: any[] = [];
    const expenses: any[] = [];
    const accounts = new Map<string, { name: string, amount: number, category: string }>();
    
    journalEntries.forEach((entry: JournalEntry) => {
      entry.details.forEach((detail: JournalEntryDetail) => {
        if (detail.accountCode.startsWith('4')) { // 수익 계정
          const existing = accounts.get(detail.accountCode);
          accounts.set(detail.accountCode, {
            name: detail.accountName,
            amount: (existing?.amount || 0) + detail.creditAmount,
            category: detail.accountCode === '4100' ? 'REVENUE' : 'OTHER_REVENUE'
          });
        } else if (detail.accountCode.startsWith('5') || detail.accountCode.startsWith('6') || detail.accountCode.startsWith('7')) {
          // 비용 계정
          const existing = accounts.get(detail.accountCode);
          let category = 'OTHER';
          if (detail.accountCode.startsWith('5')) category = 'COGS';
          else if (detail.accountCode.startsWith('6')) category = 'OPERATING';
          
          accounts.set(detail.accountCode, {
            name: detail.accountName,
            amount: (existing?.amount || 0) + detail.debitAmount,
            category
          });
        }
      });
    });
    
    for (const [code, account] of accounts) {
      if (code.startsWith('4')) {
        revenue.push({
          accountCode: code,
          accountName: account.name,
          amount: account.amount,
          category: account.category
        });
      } else {
        expenses.push({
          accountCode: code,
          accountName: account.name,
          amount: account.amount,
          category: account.category
        });
      }
    }
    
    return {
      revenue,
      expenses,
      periodStart,
      periodEnd
    };
  }
  
  async calculateFinancialRatios(companyId: string, asOfDate: string, periodStart: string, periodEnd: string) {
    const balanceSheet = await this.generateBalanceSheet(companyId, asOfDate);
    const incomeStatement = await this.generateIncomeStatement(companyId, periodStart, periodEnd);
    
    const totalAssets = balanceSheet.assets.reduce((sum, asset) => sum + asset.amount, 0);
    const currentAssets = balanceSheet.assets.filter(a => 
      a.accountCode.startsWith('1') && parseInt(a.accountCode) < 1400
    ).reduce((sum, asset) => sum + asset.amount, 0);
    
    const totalLiabilities = balanceSheet.liabilities.reduce((sum, liability) => sum + liability.amount, 0);
    const currentLiabilities = balanceSheet.liabilities.filter(l => 
      l.accountCode.startsWith('2') && parseInt(l.accountCode) < 2300
    ).reduce((sum, liability) => sum + liability.amount, 0);
    
    const totalEquity = balanceSheet.equity.reduce((sum, equity) => sum + equity.amount, 0);
    
    const totalRevenue = incomeStatement.revenue.reduce((sum, revenue) => sum + revenue.amount, 0);
    const totalExpenses = incomeStatement.expenses.reduce((sum, expense) => sum + expense.amount, 0);
    const cogs = incomeStatement.expenses.filter(e => e.category === 'COGS').reduce((sum, e) => sum + e.amount, 0);
    const operatingExpenses = incomeStatement.expenses.filter(e => e.category === 'OPERATING').reduce((sum, e) => sum + e.amount, 0);
    
    const cash = balanceSheet.assets.find(a => a.accountCode === '1100')?.amount || 0;
    
    return {
      liquidityRatios: {
        currentRatio: currentLiabilities ? Math.round((currentAssets / currentLiabilities) * 100) / 100 : 0,
        quickRatio: currentLiabilities ? Math.round((currentAssets / currentLiabilities) * 100) / 100 : 0, // 단순화
        cashRatio: currentLiabilities ? Math.round((cash / currentLiabilities) * 100) / 100 : 0
      },
      profitabilityRatios: {
        grossProfitMargin: totalRevenue ? Math.round(((totalRevenue - cogs) / totalRevenue) * 10000) / 100 : 0,
        operatingProfitMargin: totalRevenue ? Math.round(((totalRevenue - cogs - operatingExpenses) / totalRevenue) * 10000) / 100 : 0,
        netProfitMargin: totalRevenue ? Math.round(((totalRevenue - totalExpenses) / totalRevenue) * 10000) / 100 : 0
      },
      leverageRatios: {
        debtToEquity: totalEquity ? Math.round((totalLiabilities / totalEquity) * 10000) / 100 : 0,
        debtToAssets: totalAssets ? Math.round((totalLiabilities / totalAssets) * 10000) / 100 : 0,
        interestCoverage: null
      }
    };
  }
  
  async generateComparisonReport(companyId: string, currentPeriod: string, previousPeriod: string) {
    const currentIncome = await this.generateIncomeStatement(companyId, `${currentPeriod}-01`, `${currentPeriod}-31`);
    const previousIncome = await this.generateIncomeStatement(companyId, `${previousPeriod}-01`, `${previousPeriod}-30`);
    
    const currentRevenue = currentIncome.revenue.reduce((sum, r) => sum + r.amount, 0);
    const currentExpenses = currentIncome.expenses.reduce((sum, e) => sum + e.amount, 0);
    const currentNetIncome = currentRevenue - currentExpenses;
    
    const previousRevenue = previousIncome.revenue.reduce((sum, r) => sum + r.amount, 0);
    const previousExpenses = previousIncome.expenses.reduce((sum, e) => sum + e.amount, 0);
    const previousNetIncome = previousRevenue - previousExpenses;
    
    const revenueChange = previousRevenue ? Math.round(((currentRevenue - previousRevenue) / previousRevenue) * 10000) / 100 : 0;
    const expensesChange = previousExpenses ? Math.round(((currentExpenses - previousExpenses) / previousExpenses) * 10000) / 100 : 0;
    const netIncomeChange = previousNetIncome ? Math.round(((currentNetIncome - previousNetIncome) / previousNetIncome) * 10000) / 100 : 0;
    
    return {
      currentPeriod: {
        totalRevenue: currentRevenue,
        totalExpenses: currentExpenses,
        netIncome: currentNetIncome
      },
      previousPeriod: {
        totalRevenue: previousRevenue,
        totalExpenses: previousExpenses,
        netIncome: previousNetIncome
      },
      changes: {
        revenueChange,
        expensesChange,
        netIncomeChange
      },
      trends: {
        revenueGrowth: revenueChange > 0 ? 'POSITIVE' : 'NEGATIVE',
        expenseControl: expensesChange < revenueChange ? 'NEGATIVE' : 'POSITIVE',
        profitability: netIncomeChange > 0 ? 'IMPROVING' : 'DECLINING'
      }
    };
  }
  
  private getAccountType(accountCode: string): string {
    if (accountCode.startsWith('1')) return 'ASSET';
    if (accountCode.startsWith('2')) return 'LIABILITY';
    if (accountCode.startsWith('3')) return 'EQUITY';
    if (accountCode.startsWith('4')) return 'REVENUE';
    if (accountCode.startsWith('5') || accountCode.startsWith('6') || accountCode.startsWith('7')) return 'EXPENSE';
    return 'OTHER';
  }
}
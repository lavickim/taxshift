import BookkeepingService, { JournalEntry, JournalEntryDetail } from '../BookkeepingService';

// Mock fetch globally
global.fetch = jest.fn();

// Mock API response helper
const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;

describe('BookkeepingService', () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  describe('validateJournalEntry', () => {
    it('should return balanced=true when debits equal credits', () => {
      const journalEntry: JournalEntry = {
        id: 'test-1',
        transactionId: 'tx-1',
        description: '테스트 분개',
        date: '2025-07-22',
        details: [
          {
            id: 'detail-1',
            accountCode: '1100',
            accountName: '현금',
            debitAmount: 100000,
            creditAmount: 0,
            description: '현금 입금'
          },
          {
            id: 'detail-2',
            accountCode: '4100',
            accountName: '매출',
            debitAmount: 0,
            creditAmount: 100000,
            description: '매출 발생'
          }
        ],
        status: 'DRAFT',
        confidence: 95,
        aiGenerated: true,
        createdAt: '2025-07-22T10:00:00Z',
        updatedAt: '2025-07-22T10:00:00Z'
      };

      const validation = BookkeepingService.validateJournalEntry(journalEntry);
      
      expect(validation.isValid).toBe(true);
      expect(validation.isBalanced).toBe(true);
      expect(validation.totalDebit).toBe(100000);
      expect(validation.totalCredit).toBe(100000);
      expect(validation.errors).toHaveLength(0);
    });

    it('should return balanced=false when debits do not equal credits', () => {
      const journalEntry: JournalEntry = {
        id: 'test-2',
        transactionId: 'tx-2',
        description: '테스트 불균형 분개',
        date: '2025-07-22',
        details: [
          {
            id: 'detail-1',
            accountCode: '1100',
            accountName: '현금',
            debitAmount: 150000,
            creditAmount: 0,
            description: '현금 입금'
          },
          {
            id: 'detail-2',
            accountCode: '4100',
            accountName: '매출',
            debitAmount: 0,
            creditAmount: 100000,
            description: '매출 발생'
          }
        ],
        status: 'DRAFT',
        confidence: 95,
        aiGenerated: true,
        createdAt: '2025-07-22T10:00:00Z',
        updatedAt: '2025-07-22T10:00:00Z'
      };

      const validation = BookkeepingService.validateJournalEntry(journalEntry);
      
      expect(validation.isValid).toBe(false);
      expect(validation.isBalanced).toBe(false);
      expect(validation.totalDebit).toBe(150000);
      expect(validation.totalCredit).toBe(100000);
      expect(validation.errors).toContain('대차평균이 맞지 않습니다 (차이: ₩50,000)');
    });

    it('should validate required fields', () => {
      const journalEntry: JournalEntry = {
        id: 'test-3',
        transactionId: 'tx-3',
        description: '',
        date: '2025-07-22',
        details: [
          {
            id: 'detail-1',
            accountCode: '',
            accountName: '현금',
            debitAmount: 100000,
            creditAmount: 0,
            description: ''
          }
        ],
        status: 'DRAFT',
        confidence: 95,
        aiGenerated: true,
        createdAt: '2025-07-22T10:00:00Z',
        updatedAt: '2025-07-22T10:00:00Z'
      };

      const validation = BookkeepingService.validateJournalEntry(journalEntry);
      
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('분개 적요가 비어있습니다');
      expect(validation.errors).toContain('계정과목 코드가 비어있습니다');
      expect(validation.errors).toContain('분개 상세 적요가 비어있습니다');
    });
  });

  describe('generateJournalEntry', () => {
    it('should generate journal entry from transaction data successfully', async () => {
      const mockResponse = {
        id: 'je-1',
        transactionId: 'tx-1',
        description: '카드 매출',
        date: '2025-07-22',
        details: [
          {
            id: 'detail-1',
            accountCode: '1120',
            accountName: '카드매출채권',
            debitAmount: 110000,
            creditAmount: 0,
            description: '카드 매출'
          },
          {
            id: 'detail-2',
            accountCode: '4100',
            accountName: '매출',
            debitAmount: 0,
            creditAmount: 100000,
            description: '매출 발생'
          },
          {
            id: 'detail-3',
            accountCode: '2210',
            accountName: '부가세예수금',
            debitAmount: 0,
            creditAmount: 10000,
            description: '부가세 예수'
          }
        ],
        status: 'DRAFT',
        confidence: 98,
        aiGenerated: true,
        createdAt: '2025-07-22T10:00:00Z',
        updatedAt: '2025-07-22T10:00:00Z'
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const transactionData = {
        transactionId: 'tx-1',
        amount: 110000,
        description: '카드 매출',
        merchantName: '테스트 상점',
        categoryCode: 'CARD_SALE',
        transactionDate: '2025-07-22'
      };

      const result = await BookkeepingService.generateJournalEntry(
        'company-1',
        transactionData
      );

      expect(result).toEqual(mockResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/v1/bookkeeping/journal-entries/generate'),
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            companyId: 'company-1',
            transactionData
          })
        })
      );
    });

    it('should handle API errors gracefully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ error: 'Internal Server Error' }),
      } as Response);

      const transactionData = {
        transactionId: 'tx-1',
        amount: 110000,
        description: '카드 매출',
        merchantName: '테스트 상점',
        categoryCode: 'CARD_SALE',
        transactionDate: '2025-07-22'
      };

      await expect(
        BookkeepingService.generateJournalEntry('company-1', transactionData)
      ).rejects.toThrow('Failed to generate journal entry');
    });
  });

  describe('getJournalEntries', () => {
    it('should fetch journal entries with filters', async () => {
      const mockJournalEntries = [
        {
          id: 'je-1',
          transactionId: 'tx-1',
          description: '테스트 분개 1',
          date: '2025-07-22',
          details: [],
          status: 'APPROVED',
          confidence: 98,
          aiGenerated: true,
          createdAt: '2025-07-22T10:00:00Z',
          updatedAt: '2025-07-22T10:00:00Z'
        },
        {
          id: 'je-2',
          transactionId: 'tx-2',
          description: '테스트 분개 2',
          date: '2025-07-22',
          details: [],
          status: 'DRAFT',
          confidence: 95,
          aiGenerated: true,
          createdAt: '2025-07-22T10:00:00Z',
          updatedAt: '2025-07-22T10:00:00Z'
        }
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          entries: mockJournalEntries,
          totalCount: 2,
          pageSize: 20,
          currentPage: 1
        }),
      } as Response);

      const result = await BookkeepingService.getJournalEntries('company-1', {
        status: 'DRAFT',
        page: 1,
        limit: 20
      });

      expect(result.entries).toHaveLength(2);
      expect(result.totalCount).toBe(2);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/v1/bookkeeping/journal-entries'),
        expect.objectContaining({
          method: 'GET',
        })
      );
    });
  });

  describe('approveJournalEntry', () => {
    it('should approve journal entry successfully', async () => {
      const mockApprovedEntry = {
        id: 'je-1',
        status: 'APPROVED',
        approvedAt: '2025-07-22T11:00:00Z',
        approvedBy: 'user-1'
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockApprovedEntry,
      } as Response);

      const result = await BookkeepingService.approveJournalEntry('je-1', 'user-1');

      expect(result).toEqual(mockApprovedEntry);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/v1/bookkeeping/journal-entries/je-1/approve'),
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            approvedBy: 'user-1'
          })
        })
      );
    });
  });

  describe('bulkApproveJournalEntries', () => {
    it('should approve multiple journal entries', async () => {
      const mockResult = {
        approvedCount: 3,
        failedCount: 0,
        failedEntries: []
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResult,
      } as Response);

      const result = await BookkeepingService.bulkApproveJournalEntries(
        ['je-1', 'je-2', 'je-3'],
        'user-1'
      );

      expect(result.approvedCount).toBe(3);
      expect(result.failedCount).toBe(0);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/v1/bookkeeping/journal-entries/bulk-approve'),
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            entryIds: ['je-1', 'je-2', 'je-3'],
            approvedBy: 'user-1'
          })
        })
      );
    });
  });

  describe('formatAmount', () => {
    it('should format Korean won amounts correctly', () => {
      expect(BookkeepingService.formatAmount(1000000)).toBe('₩1,000,000');
      expect(BookkeepingService.formatAmount(500)).toBe('₩500');
      expect(BookkeepingService.formatAmount(0)).toBe('₩0');
      expect(BookkeepingService.formatAmount(-50000)).toBe('-₩50,000');
    });
  });

  describe('formatDate', () => {
    it('should format dates correctly', () => {
      expect(BookkeepingService.formatDate('2025-07-22')).toBe('2025년 7월 22일');
      expect(BookkeepingService.formatDate('2025-01-01')).toBe('2025년 1월 1일');
      expect(BookkeepingService.formatDate('2025-12-31')).toBe('2025년 12월 31일');
    });
  });

  describe('getConfidenceLevel', () => {
    it('should return correct confidence levels', () => {
      expect(BookkeepingService.getConfidenceLevel(95)).toBe('높음');
      expect(BookkeepingService.getConfidenceLevel(85)).toBe('보통');
      expect(BookkeepingService.getConfidenceLevel(75)).toBe('보통');
      expect(BookkeepingService.getConfidenceLevel(65)).toBe('낮음');
      expect(BookkeepingService.getConfidenceLevel(50)).toBe('낮음');
    });
  });

  describe('getStatusColor', () => {
    it('should return correct status colors', () => {
      expect(BookkeepingService.getStatusColor('APPROVED')).toBe('#10B981');
      expect(BookkeepingService.getStatusColor('DRAFT')).toBe('#F59E0B');
      expect(BookkeepingService.getStatusColor('REJECTED')).toBe('#EF4444');
      expect(BookkeepingService.getStatusColor('INVALID' as any)).toBe('#6B7280');
    });
  });
});
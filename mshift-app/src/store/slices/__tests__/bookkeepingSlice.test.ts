import bookkeepingReducer, {
  setJournalEntries,
  addJournalEntry,
  updateJournalEntry,
  removeJournalEntry,
  setCurrentEntry,
  clearCurrentEntry,
  setFilter,
  clearError,
  generateJournalEntry,
  getJournalEntries,
  approveJournalEntry,
  updateJournalEntryAction,
  deleteJournalEntry,
  BookkeepingState
} from '../bookkeepingSlice';
import { configureStore } from '@reduxjs/toolkit';

// Mock BookkeepingService
jest.mock('../../services/BookkeepingService', () => ({
  generateJournalEntry: jest.fn(),
  getJournalEntries: jest.fn(),
  approveJournalEntry: jest.fn(),
  updateJournalEntry: jest.fn(),
  deleteJournalEntry: jest.fn(),
}));

describe('bookkeepingSlice', () => {
  const initialState: BookkeepingState = {
    journalEntries: [],
    currentEntry: null,
    isLoading: false,
    error: null,
    generationError: null,
    filter: {
      status: 'ALL',
      dateRange: null,
      confidenceRange: null,
      searchText: ''
    },
    lastGenerated: null,
    generationStats: {
      totalGenerated: 0,
      averageConfidence: 0,
      successRate: 0,
      lastProcessingTime: 0
    }
  };

  describe('reducers', () => {
    it('should return initial state', () => {
      expect(bookkeepingReducer(undefined, { type: 'unknown' })).toEqual(initialState);
    });

    it('should handle setJournalEntries', () => {
      const mockEntries = [
        {
          id: 'je-1',
          transactionId: 'tx-1',
          description: '테스트 분개',
          date: '2025-07-22',
          details: [],
          status: 'DRAFT' as const,
          confidence: 95,
          aiGenerated: true,
          createdAt: '2025-07-22T10:00:00Z',
          updatedAt: '2025-07-22T10:00:00Z'
        }
      ];

      const actual = bookkeepingReducer(initialState, setJournalEntries(mockEntries));
      expect(actual.journalEntries).toEqual(mockEntries);
    });

    it('should handle addJournalEntry', () => {
      const existingEntry = {
        id: 'je-1',
        transactionId: 'tx-1',
        description: '기존 분개',
        date: '2025-07-22',
        details: [],
        status: 'DRAFT' as const,
        confidence: 95,
        aiGenerated: true,
        createdAt: '2025-07-22T10:00:00Z',
        updatedAt: '2025-07-22T10:00:00Z'
      };

      const newEntry = {
        id: 'je-2',
        transactionId: 'tx-2',
        description: '새 분개',
        date: '2025-07-22',
        details: [],
        status: 'DRAFT' as const,
        confidence: 90,
        aiGenerated: true,
        createdAt: '2025-07-22T11:00:00Z',
        updatedAt: '2025-07-22T11:00:00Z'
      };

      const stateWithEntries = { ...initialState, journalEntries: [existingEntry] };
      const actual = bookkeepingReducer(stateWithEntries, addJournalEntry(newEntry));
      
      expect(actual.journalEntries).toHaveLength(2);
      expect(actual.journalEntries[0]).toEqual(newEntry); // 최신 항목이 맨 앞에
      expect(actual.journalEntries[1]).toEqual(existingEntry);
    });

    it('should handle updateJournalEntry', () => {
      const originalEntry = {
        id: 'je-1',
        transactionId: 'tx-1',
        description: '원래 분개',
        date: '2025-07-22',
        details: [],
        status: 'DRAFT' as const,
        confidence: 95,
        aiGenerated: true,
        createdAt: '2025-07-22T10:00:00Z',
        updatedAt: '2025-07-22T10:00:00Z'
      };

      const stateWithEntries = { ...initialState, journalEntries: [originalEntry] };
      
      const updatedEntry = {
        ...originalEntry,
        description: '수정된 분개',
        status: 'APPROVED' as const,
        updatedAt: '2025-07-22T12:00:00Z'
      };

      const actual = bookkeepingReducer(stateWithEntries, updateJournalEntry(updatedEntry));
      
      expect(actual.journalEntries[0]).toEqual(updatedEntry);
    });

    it('should handle removeJournalEntry', () => {
      const entry1 = {
        id: 'je-1',
        transactionId: 'tx-1',
        description: '분개 1',
        date: '2025-07-22',
        details: [],
        status: 'DRAFT' as const,
        confidence: 95,
        aiGenerated: true,
        createdAt: '2025-07-22T10:00:00Z',
        updatedAt: '2025-07-22T10:00:00Z'
      };

      const entry2 = {
        id: 'je-2',
        transactionId: 'tx-2',
        description: '분개 2',
        date: '2025-07-22',
        details: [],
        status: 'DRAFT' as const,
        confidence: 90,
        aiGenerated: true,
        createdAt: '2025-07-22T11:00:00Z',
        updatedAt: '2025-07-22T11:00:00Z'
      };

      const stateWithEntries = { ...initialState, journalEntries: [entry1, entry2] };
      const actual = bookkeepingReducer(stateWithEntries, removeJournalEntry('je-1'));
      
      expect(actual.journalEntries).toHaveLength(1);
      expect(actual.journalEntries[0]).toEqual(entry2);
    });

    it('should handle setCurrentEntry', () => {
      const entry = {
        id: 'je-1',
        transactionId: 'tx-1',
        description: '현재 분개',
        date: '2025-07-22',
        details: [],
        status: 'DRAFT' as const,
        confidence: 95,
        aiGenerated: true,
        createdAt: '2025-07-22T10:00:00Z',
        updatedAt: '2025-07-22T10:00:00Z'
      };

      const actual = bookkeepingReducer(initialState, setCurrentEntry(entry));
      expect(actual.currentEntry).toEqual(entry);
    });

    it('should handle clearCurrentEntry', () => {
      const stateWithCurrentEntry = {
        ...initialState,
        currentEntry: {
          id: 'je-1',
          transactionId: 'tx-1',
          description: '현재 분개',
          date: '2025-07-22',
          details: [],
          status: 'DRAFT' as const,
          confidence: 95,
          aiGenerated: true,
          createdAt: '2025-07-22T10:00:00Z',
          updatedAt: '2025-07-22T10:00:00Z'
        }
      };

      const actual = bookkeepingReducer(stateWithCurrentEntry, clearCurrentEntry());
      expect(actual.currentEntry).toBeNull();
    });

    it('should handle setFilter', () => {
      const filter = {
        status: 'APPROVED' as const,
        dateRange: { start: '2025-07-01', end: '2025-07-31' },
        confidenceRange: { min: 90, max: 100 },
        searchText: '매출'
      };

      const actual = bookkeepingReducer(initialState, setFilter(filter));
      expect(actual.filter).toEqual(filter);
    });

    it('should handle clearError', () => {
      const stateWithError = {
        ...initialState,
        error: 'Some error',
        generationError: 'Generation error'
      };

      const actual = bookkeepingReducer(stateWithError, clearError());
      expect(actual.error).toBeNull();
      expect(actual.generationError).toBeNull();
    });
  });

  describe('async thunks', () => {
    let store: any;

    beforeEach(() => {
      store = configureStore({
        reducer: {
          bookkeeping: bookkeepingReducer,
        },
      });
    });

    describe('generateJournalEntry', () => {
      it('should handle successful journal entry generation', async () => {
        const mockGeneratedEntry = {
          id: 'je-1',
          transactionId: 'tx-1',
          description: 'AI 생성 분개',
          date: '2025-07-22',
          details: [],
          status: 'DRAFT' as const,
          confidence: 98,
          aiGenerated: true,
          createdAt: '2025-07-22T10:00:00Z',
          updatedAt: '2025-07-22T10:00:00Z'
        };

        const BookkeepingService = require('../../services/BookkeepingService');
        BookkeepingService.generateJournalEntry.mockResolvedValue(mockGeneratedEntry);

        const transactionData = {
          transactionId: 'tx-1',
          amount: 100000,
          description: '카드 매출',
          merchantName: '테스트 상점',
          categoryCode: 'CARD_SALE',
          transactionDate: '2025-07-22'
        };

        await store.dispatch(generateJournalEntry({
          companyId: 'company-1',
          transactionData
        }));

        const state = store.getState().bookkeeping;
        expect(state.isLoading).toBe(false);
        expect(state.journalEntries).toContain(mockGeneratedEntry);
        expect(state.lastGenerated).toBe(mockGeneratedEntry.id);
      });

      it('should handle journal entry generation failure', async () => {
        const BookkeepingService = require('../../services/BookkeepingService');
        BookkeepingService.generateJournalEntry.mockRejectedValue(new Error('Generation failed'));

        const transactionData = {
          transactionId: 'tx-1',
          amount: 100000,
          description: '카드 매출',
          merchantName: '테스트 상점',
          categoryCode: 'CARD_SALE',
          transactionDate: '2025-07-22'
        };

        await store.dispatch(generateJournalEntry({
          companyId: 'company-1',
          transactionData
        }));

        const state = store.getState().bookkeeping;
        expect(state.isLoading).toBe(false);
        expect(state.generationError).toBe('Generation failed');
      });
    });

    describe('getJournalEntries', () => {
      it('should fetch journal entries successfully', async () => {
        const mockResponse = {
          entries: [
            {
              id: 'je-1',
              transactionId: 'tx-1',
              description: '분개 1',
              date: '2025-07-22',
              details: [],
              status: 'DRAFT' as const,
              confidence: 95,
              aiGenerated: true,
              createdAt: '2025-07-22T10:00:00Z',
              updatedAt: '2025-07-22T10:00:00Z'
            }
          ],
          totalCount: 1,
          pageSize: 20,
          currentPage: 1
        };

        const BookkeepingService = require('../../services/BookkeepingService');
        BookkeepingService.getJournalEntries.mockResolvedValue(mockResponse);

        await store.dispatch(getJournalEntries({
          companyId: 'company-1',
          filters: { status: 'DRAFT' }
        }));

        const state = store.getState().bookkeeping;
        expect(state.isLoading).toBe(false);
        expect(state.journalEntries).toEqual(mockResponse.entries);
      });
    });

    describe('approveJournalEntry', () => {
      it('should approve journal entry successfully', async () => {
        const mockApprovedEntry = {
          id: 'je-1',
          status: 'APPROVED' as const,
          approvedAt: '2025-07-22T11:00:00Z',
          approvedBy: 'user-1'
        };

        const BookkeepingService = require('../../services/BookkeepingService');
        BookkeepingService.approveJournalEntry.mockResolvedValue(mockApprovedEntry);

        // 초기 분개를 상태에 추가
        store.dispatch(setJournalEntries([{
          id: 'je-1',
          transactionId: 'tx-1',
          description: '승인할 분개',
          date: '2025-07-22',
          details: [],
          status: 'DRAFT' as const,
          confidence: 95,
          aiGenerated: true,
          createdAt: '2025-07-22T10:00:00Z',
          updatedAt: '2025-07-22T10:00:00Z'
        }]));

        await store.dispatch(approveJournalEntry({
          entryId: 'je-1',
          approvedBy: 'user-1'
        }));

        const state = store.getState().bookkeeping;
        expect(state.isLoading).toBe(false);
        expect(state.journalEntries[0].status).toBe('APPROVED');
      });
    });
  });
});
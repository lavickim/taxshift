import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import BookkeepingService, { 
  JournalEntry, 
  JournalEntryResponse, 
  TransactionToJournalRequest,
  ChartOfAccount 
} from '../../services/BookkeepingService';

export interface BookkeepingState {
  // 분개 관련 상태
  journalEntries: JournalEntry[];
  currentJournalEntry: JournalEntry | null;
  
  // 계정과목 관련 상태
  chartOfAccounts: ChartOfAccount[];
  
  // 로딩 상태
  isLoadingJournalEntries: boolean;
  isProcessingTransaction: boolean;
  isUpdatingJournalEntry: boolean;
  isLoadingChartOfAccounts: boolean;
  
  // 오류 상태
  error: string | null;
  processError: string | null;
  
  // 필터 및 페이지네이션
  filters: {
    status: 'ALL' | 'DRAFT' | 'CONFIRMED' | 'POSTED';
    startDate: string;
    endDate: string;
    companyId: string;
  };
  
  // 통계
  stats: {
    totalEntries: number;
    pendingReview: number;
    completedToday: number;
    errorEntries: number;
    totalAmount: number;
  };
}

const initialState: BookkeepingState = {
  journalEntries: [],
  currentJournalEntry: null,
  chartOfAccounts: [],
  
  isLoadingJournalEntries: false,
  isProcessingTransaction: false,
  isUpdatingJournalEntry: false,
  isLoadingChartOfAccounts: false,
  
  error: null,
  processError: null,
  
  filters: {
    status: 'ALL',
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    companyId: ''
  },
  
  stats: {
    totalEntries: 0,
    pendingReview: 0,
    completedToday: 0,
    errorEntries: 0,
    totalAmount: 0
  }
};

// 비동기 액션들
export const processTransaction = createAsyncThunk(
  'bookkeeping/processTransaction',
  async (request: TransactionToJournalRequest, { rejectWithValue }) => {
    try {
      const result = await BookkeepingService.generateJournalEntry(request);
      if (!result.success) {
        return rejectWithValue(result.message || '분개 생성 실패');
      }
      return result;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : '분개 생성 오류');
    }
  }
);

export const fetchJournalEntries = createAsyncThunk(
  'bookkeeping/fetchJournalEntries',
  async (params: { companyId: string; startDate: string; endDate: string }, { rejectWithValue }) => {
    try {
      return await BookkeepingService.getJournalEntries(params.companyId, params.startDate, params.endDate);
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : '분개 목록 조회 오류');
    }
  }
);

export const fetchJournalEntry = createAsyncThunk(
  'bookkeeping/fetchJournalEntry',
  async (journalEntryId: number, { rejectWithValue }) => {
    try {
      const entry = await BookkeepingService.getJournalEntry(journalEntryId);
      if (!entry) {
        return rejectWithValue('분개를 찾을 수 없습니다.');
      }
      return entry;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : '분개 조회 오류');
    }
  }
);

export const updateJournalEntry = createAsyncThunk(
  'bookkeeping/updateJournalEntry',
  async (params: { id: number; entry: Partial<JournalEntry> }, { rejectWithValue }) => {
    try {
      const result = await BookkeepingService.updateJournalEntry(params.id, params.entry);
      if (!result.success) {
        return rejectWithValue(result.message || '분개 수정 실패');
      }
      return result.journalEntry!;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : '분개 수정 오류');
    }
  }
);

export const confirmJournalEntry = createAsyncThunk(
  'bookkeeping/confirmJournalEntry',
  async (journalEntryId: number, { rejectWithValue }) => {
    try {
      const result = await BookkeepingService.confirmJournalEntry(journalEntryId);
      if (!result.success) {
        return rejectWithValue(result.message || '분개 승인 실패');
      }
      return result.journalEntry!;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : '분개 승인 오류');
    }
  }
);

export const fetchChartOfAccounts = createAsyncThunk(
  'bookkeeping/fetchChartOfAccounts',
  async (_, { rejectWithValue }) => {
    try {
      return await BookkeepingService.getChartOfAccounts();
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : '계정과목 조회 오류');
    }
  }
);

const bookkeepingSlice = createSlice({
  name: 'bookkeeping',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
      state.processError = null;
    },
    
    setCurrentJournalEntry: (state, action: PayloadAction<JournalEntry | null>) => {
      state.currentJournalEntry = action.payload;
    },
    
    updateFilters: (state, action: PayloadAction<Partial<BookkeepingState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    
    updateStats: (state, action: PayloadAction<Partial<BookkeepingState['stats']>>) => {
      state.stats = { ...state.stats, ...action.payload };
    },
    
    // 실시간 분개 추가 (웹소켓 등을 통한 실시간 업데이트)
    addJournalEntry: (state, action: PayloadAction<JournalEntry>) => {
      state.journalEntries.unshift(action.payload);
      state.stats.totalEntries += 1;
      if (action.payload.status === 'DRAFT') {
        state.stats.pendingReview += 1;
      }
    },
    
    // 분개 상태 업데이트
    updateJournalEntryInList: (state, action: PayloadAction<JournalEntry>) => {
      const index = state.journalEntries.findIndex(entry => entry.id === action.payload.id);
      if (index !== -1) {
        const oldEntry = state.journalEntries[index];
        state.journalEntries[index] = action.payload;
        
        // 상태 변경에 따른 통계 업데이트
        if (oldEntry.status === 'DRAFT' && action.payload.status !== 'DRAFT') {
          state.stats.pendingReview -= 1;
        }
        if (action.payload.status === 'POSTED') {
          state.stats.completedToday += 1;
        }
      }
    }
  },
  
  extraReducers: (builder) => {
    // processTransaction
    builder
      .addCase(processTransaction.pending, (state) => {
        state.isProcessingTransaction = true;
        state.processError = null;
      })
      .addCase(processTransaction.fulfilled, (state, action) => {
        state.isProcessingTransaction = false;
        if (action.payload.journalEntry) {
          state.journalEntries.unshift(action.payload.journalEntry);
          state.currentJournalEntry = action.payload.journalEntry;
          
          // 통계 업데이트
          state.stats.totalEntries += 1;
          if (action.payload.journalEntry.status === 'DRAFT') {
            state.stats.pendingReview += 1;
          }
          state.stats.totalAmount += action.payload.journalEntry.totalAmount;
        }
      })
      .addCase(processTransaction.rejected, (state, action) => {
        state.isProcessingTransaction = false;
        state.processError = action.payload as string;
      });

    // fetchJournalEntries
    builder
      .addCase(fetchJournalEntries.pending, (state) => {
        state.isLoadingJournalEntries = true;
        state.error = null;
      })
      .addCase(fetchJournalEntries.fulfilled, (state, action) => {
        state.isLoadingJournalEntries = false;
        state.journalEntries = action.payload;
        
        // 통계 계산
        const entries = action.payload;
        state.stats.totalEntries = entries.length;
        state.stats.pendingReview = entries.filter(e => e.status === 'DRAFT').length;
        state.stats.completedToday = entries.filter(e => 
          e.status === 'POSTED' && 
          new Date(e.updatedAt).toDateString() === new Date().toDateString()
        ).length;
        state.stats.errorEntries = 0; // 백엔드에서 오류 분개 정보를 제공할 때 업데이트
        state.stats.totalAmount = entries.reduce((sum, e) => sum + e.totalAmount, 0);
      })
      .addCase(fetchJournalEntries.rejected, (state, action) => {
        state.isLoadingJournalEntries = false;
        state.error = action.payload as string;
      });

    // fetchJournalEntry
    builder
      .addCase(fetchJournalEntry.pending, (state) => {
        state.error = null;
      })
      .addCase(fetchJournalEntry.fulfilled, (state, action) => {
        state.currentJournalEntry = action.payload;
      })
      .addCase(fetchJournalEntry.rejected, (state, action) => {
        state.error = action.payload as string;
      });

    // updateJournalEntry
    builder
      .addCase(updateJournalEntry.pending, (state) => {
        state.isUpdatingJournalEntry = true;
        state.error = null;
      })
      .addCase(updateJournalEntry.fulfilled, (state, action) => {
        state.isUpdatingJournalEntry = false;
        state.currentJournalEntry = action.payload;
        
        // 목록에서도 업데이트
        const index = state.journalEntries.findIndex(entry => entry.id === action.payload.id);
        if (index !== -1) {
          state.journalEntries[index] = action.payload;
        }
      })
      .addCase(updateJournalEntry.rejected, (state, action) => {
        state.isUpdatingJournalEntry = false;
        state.error = action.payload as string;
      });

    // confirmJournalEntry
    builder
      .addCase(confirmJournalEntry.pending, (state) => {
        state.error = null;
      })
      .addCase(confirmJournalEntry.fulfilled, (state, action) => {
        state.currentJournalEntry = action.payload;
        
        // 목록에서도 업데이트
        const index = state.journalEntries.findIndex(entry => entry.id === action.payload.id);
        if (index !== -1) {
          const oldStatus = state.journalEntries[index].status;
          state.journalEntries[index] = action.payload;
          
          // 통계 업데이트
          if (oldStatus === 'DRAFT' && action.payload.status !== 'DRAFT') {
            state.stats.pendingReview -= 1;
          }
          if (action.payload.status === 'POSTED') {
            state.stats.completedToday += 1;
          }
        }
      })
      .addCase(confirmJournalEntry.rejected, (state, action) => {
        state.error = action.payload as string;
      });

    // fetchChartOfAccounts
    builder
      .addCase(fetchChartOfAccounts.pending, (state) => {
        state.isLoadingChartOfAccounts = true;
        state.error = null;
      })
      .addCase(fetchChartOfAccounts.fulfilled, (state, action) => {
        state.isLoadingChartOfAccounts = false;
        state.chartOfAccounts = action.payload;
      })
      .addCase(fetchChartOfAccounts.rejected, (state, action) => {
        state.isLoadingChartOfAccounts = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  clearError,
  setCurrentJournalEntry,
  updateFilters,
  updateStats,
  addJournalEntry,
  updateJournalEntryInList
} = bookkeepingSlice.actions;

// 셀렉터들
export const selectJournalEntries = (state: { bookkeeping: BookkeepingState }) => state.bookkeeping.journalEntries;
export const selectCurrentJournalEntry = (state: { bookkeeping: BookkeepingState }) => state.bookkeeping.currentJournalEntry;
export const selectChartOfAccounts = (state: { bookkeeping: BookkeepingState }) => state.bookkeeping.chartOfAccounts;
export const selectBookkeepingStats = (state: { bookkeeping: BookkeepingState }) => state.bookkeeping.stats;
export const selectBookkeepingFilters = (state: { bookkeeping: BookkeepingState }) => state.bookkeeping.filters;

// 필터링된 분개 목록 셀렉터
export const selectFilteredJournalEntries = (state: { bookkeeping: BookkeepingState }) => {
  const { journalEntries, filters } = state.bookkeeping;
  
  return journalEntries.filter(entry => {
    if (filters.status !== 'ALL' && entry.status !== filters.status) {
      return false;
    }
    
    const entryDate = new Date(entry.entryDate);
    const startDate = new Date(filters.startDate);
    const endDate = new Date(filters.endDate);
    
    return entryDate >= startDate && entryDate <= endDate;
  });
};

// 계정과목 트리 구조 셀렉터
export const selectChartOfAccountsTree = (state: { bookkeeping: BookkeepingState }) => {
  const accounts = state.bookkeeping.chartOfAccounts;
  
  // 부모-자식 관계로 트리 구조 생성
  const tree: (ChartOfAccount & { children?: ChartOfAccount[] })[] = [];
  const accountMap = new Map<number, ChartOfAccount & { children: ChartOfAccount[] }>();
  
  // 먼저 모든 계정을 맵에 저장하고 children 배열 초기화
  accounts.forEach(account => {
    accountMap.set(account.id, { ...account, children: [] });
  });
  
  // 부모-자식 관계 설정
  accounts.forEach(account => {
    const accountWithChildren = accountMap.get(account.id);
    if (!accountWithChildren) return;
    
    if (account.parentAccountId) {
      const parent = accountMap.get(account.parentAccountId);
      if (parent) {
        parent.children.push(accountWithChildren);
      }
    } else {
      tree.push(accountWithChildren);
    }
  });
  
  // displayOrder로 정렬
  const sortByDisplayOrder = (items: (ChartOfAccount & { children?: ChartOfAccount[] })[]) => {
    items.sort((a, b) => a.displayOrder - b.displayOrder);
    items.forEach(item => {
      if (item.children && item.children.length > 0) {
        sortByDisplayOrder(item.children);
      }
    });
  };
  
  sortByDisplayOrder(tree);
  return tree;
};

export default bookkeepingSlice.reducer;
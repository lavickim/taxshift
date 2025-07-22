import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import BookkeepingHomeScreen from '../BookkeepingHomeScreen';
import bookkeepingReducer from '../../store/slices/bookkeepingSlice';

// Mock navigation
const mockNavigation = {
  navigate: jest.fn(),
  goBack: jest.fn(),
  setOptions: jest.fn(),
  addListener: jest.fn(),
  removeListener: jest.fn()
};

// Mock Redux store
const createMockStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      bookkeeping: bookkeepingReducer
    },
    preloadedState: {
      bookkeeping: {
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
          totalGenerated: 50,
          averageConfidence: 92,
          successRate: 85,
          lastProcessingTime: 2500
        },
        ...initialState
      }
    }
  });
};

const renderWithProvider = (component: React.ReactElement, store = createMockStore()) => {
  return render(
    <Provider store={store}>
      {component}
    </Provider>
  );
};

describe('BookkeepingHomeScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render dashboard correctly', () => {
    const { getByText } = renderWithProvider(
      <BookkeepingHomeScreen navigation={mockNavigation} />
    );
    
    expect(getByText('복식부기 엔진')).toBeTruthy();
    expect(getByText('AI 기반 자동 분개 처리')).toBeTruthy();
  });

  it('should display statistics correctly', () => {
    const mockStore = createMockStore({
      generationStats: {
        totalGenerated: 100,
        averageConfidence: 95,
        successRate: 90,
        lastProcessingTime: 1800
      }
    });

    const { getByText } = renderWithProvider(
      <BookkeepingHomeScreen navigation={mockNavigation} />,
      mockStore
    );
    
    expect(getByText('100')).toBeTruthy(); // Total generated
    expect(getByText('95%')).toBeTruthy(); // Average confidence
    expect(getByText('90%')).toBeTruthy(); // Success rate
  });

  it('should handle refresh functionality', async () => {
    const { getByTestId } = renderWithProvider(
      <BookkeepingHomeScreen navigation={mockNavigation} />
    );
    
    const refreshControl = getByTestId('refresh-control');
    fireEvent(refreshControl, 'onRefresh');
    
    // Should trigger refresh without errors
    await waitFor(() => {
      expect(refreshControl).toBeTruthy();
    });
  });

  it('should navigate to journal entry list when quick action is pressed', () => {
    const { getByTestId } = renderWithProvider(
      <BookkeepingHomeScreen navigation={mockNavigation} />
    );
    
    const viewAllButton = getByTestId('view-all-entries-button');
    fireEvent.press(viewAllButton);
    
    expect(mockNavigation.navigate).toHaveBeenCalledWith('JournalEntryList');
  });

  it('should navigate to quick entry creation', () => {
    const { getByTestId } = renderWithProvider(
      <BookkeepingHomeScreen navigation={mockNavigation} />
    );
    
    const quickEntryButton = getByTestId('quick-entry-button');
    fireEvent.press(quickEntryButton);
    
    expect(mockNavigation.navigate).toHaveBeenCalledWith('QuickJournalEntry');
  });

  it('should show loading state', () => {
    const mockStore = createMockStore({ isLoading: true });

    const { getByTestId } = renderWithProvider(
      <BookkeepingHomeScreen navigation={mockNavigation} />,
      mockStore
    );
    
    expect(getByTestId('loading-indicator')).toBeTruthy();
  });

  it('should display error state', () => {
    const mockStore = createMockStore({ 
      error: '데이터를 불러오는데 실패했습니다.' 
    });

    const { getByText } = renderWithProvider(
      <BookkeepingHomeScreen navigation={mockNavigation} />,
      mockStore
    );
    
    expect(getByText('데이터를 불러오는데 실패했습니다.')).toBeTruthy();
  });

  it('should show recent journal entries', () => {
    const mockEntries = [
      {
        id: 'je-1',
        transactionId: 'tx-1',
        description: '테스트 분개 1',
        date: '2025-07-22',
        details: [],
        status: 'DRAFT' as const,
        confidence: 95,
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
        status: 'APPROVED' as const,
        confidence: 88,
        aiGenerated: true,
        createdAt: '2025-07-22T11:00:00Z',
        updatedAt: '2025-07-22T11:00:00Z'
      }
    ];

    const mockStore = createMockStore({ journalEntries: mockEntries });

    const { getByText } = renderWithProvider(
      <BookkeepingHomeScreen navigation={mockNavigation} />,
      mockStore
    );
    
    expect(getByText('테스트 분개 1')).toBeTruthy();
    expect(getByText('테스트 분개 2')).toBeTruthy();
  });

  it('should handle period selection', () => {
    const { getByTestId } = renderWithProvider(
      <BookkeepingHomeScreen navigation={mockNavigation} />
    );
    
    const periodSelector = getByTestId('period-selector');
    fireEvent.press(periodSelector);
    
    // Should open period selection modal
    expect(getByTestId('period-selection-modal')).toBeTruthy();
  });

  it('should filter entries by period', () => {
    const mockEntries = [
      {
        id: 'je-1',
        transactionId: 'tx-1',
        description: '1월 분개',
        date: '2025-01-15',
        details: [],
        status: 'DRAFT' as const,
        confidence: 95,
        aiGenerated: true,
        createdAt: '2025-01-15T10:00:00Z',
        updatedAt: '2025-01-15T10:00:00Z'
      },
      {
        id: 'je-2',
        transactionId: 'tx-2',
        description: '7월 분개',
        date: '2025-07-22',
        details: [],
        status: 'APPROVED' as const,
        confidence: 88,
        aiGenerated: true,
        createdAt: '2025-07-22T11:00:00Z',
        updatedAt: '2025-07-22T11:00:00Z'
      }
    ];

    const mockStore = createMockStore({ 
      journalEntries: mockEntries,
      filter: {
        status: 'ALL',
        dateRange: {
          start: '2025-07-01',
          end: '2025-07-31'
        },
        confidenceRange: null,
        searchText: ''
      }
    });

    const { getByText, queryByText } = renderWithProvider(
      <BookkeepingHomeScreen navigation={mockNavigation} />,
      mockStore
    );
    
    expect(getByText('7월 분개')).toBeTruthy();
    expect(queryByText('1월 분개')).toBeNull();
  });

  it('should show financial statements quick access', () => {
    const { getByTestId } = renderWithProvider(
      <BookkeepingHomeScreen navigation={mockNavigation} />
    );
    
    const financialStatementsButton = getByTestId('financial-statements-button');
    fireEvent.press(financialStatementsButton);
    
    expect(mockNavigation.navigate).toHaveBeenCalledWith('FinancialStatements');
  });

  it('should display processing time correctly', () => {
    const mockStore = createMockStore({
      generationStats: {
        totalGenerated: 50,
        averageConfidence: 92,
        successRate: 85,
        lastProcessingTime: 3200 // 3.2 seconds
      }
    });

    const { getByText } = renderWithProvider(
      <BookkeepingHomeScreen navigation={mockNavigation} />,
      mockStore
    );
    
    expect(getByText('3.2초')).toBeTruthy();
  });

  it('should handle empty journal entries list', () => {
    const mockStore = createMockStore({ journalEntries: [] });

    const { getByText } = renderWithProvider(
      <BookkeepingHomeScreen navigation={mockNavigation} />,
      mockStore
    );
    
    expect(getByText('아직 생성된 분개가 없습니다')).toBeTruthy();
    expect(getByText('새로운 거래를 분개로 변환해보세요')).toBeTruthy();
  });

  it('should handle journal entry card press', () => {
    const mockEntry = {
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
    };

    const mockStore = createMockStore({ journalEntries: [mockEntry] });

    const { getByTestId } = renderWithProvider(
      <BookkeepingHomeScreen navigation={mockNavigation} />,
      mockStore
    );
    
    const entryCard = getByTestId('journal-entry-card-je-1');
    fireEvent.press(entryCard);
    
    expect(mockNavigation.navigate).toHaveBeenCalledWith('JournalEntryDetail', {
      entryId: 'je-1'
    });
  });

  it('should show confidence distribution chart', () => {
    const { getByTestId } = renderWithProvider(
      <BookkeepingHomeScreen navigation={mockNavigation} />
    );
    
    expect(getByTestId('confidence-chart')).toBeTruthy();
  });

  it('should handle theme changes', () => {
    const { getByTestId } = renderWithProvider(
      <BookkeepingHomeScreen navigation={mockNavigation} />
    );
    
    // Should render without theme-related errors
    const container = getByTestId('bookkeeping-home-container');
    expect(container).toBeTruthy();
  });
});
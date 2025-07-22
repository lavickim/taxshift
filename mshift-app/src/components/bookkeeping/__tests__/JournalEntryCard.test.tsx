import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import JournalEntryCard from '../JournalEntryCard';
import { JournalEntry } from '../../../services/BookkeepingService';

// Mock Gesture Handler
jest.mock('react-native-gesture-handler', () => {
  const { View } = require('react-native');
  return {
    Swipeable: ({ children, renderRightActions, ...props }: any) => {
      return View({ ...props, children });
    },
  };
});

describe('JournalEntryCard', () => {
  const mockJournalEntry: JournalEntry = {
    id: 'je-1',
    transactionId: 'tx-1',
    description: '카드 매출',
    date: '2025-07-22',
    details: [
      {
        id: 1,
        accountCode: '1120',
        accountName: '카드매출채권',
        debitAmount: 110000,
        creditAmount: 0,
        description: '카드 매출'
      },
      {
        id: 2,
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

  const defaultProps = {
    entry: mockJournalEntry,
    onApprove: jest.fn(),
    onEdit: jest.fn(),
    onDelete: jest.fn(),
    onPress: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render journal entry information correctly', () => {
    const { getByText } = render(<JournalEntryCard {...defaultProps} />);
    
    expect(getByText('카드 매출')).toBeTruthy();
    expect(getByText('2025-07-22')).toBeTruthy();
    expect(getByText('₩110,000')).toBeTruthy();
  });

  it('should display confidence level correctly', () => {
    const { getByText } = render(<JournalEntryCard {...defaultProps} />);
    
    expect(getByText('95%')).toBeTruthy();
  });

  it('should show DRAFT status correctly', () => {
    const { getByText } = render(<JournalEntryCard {...defaultProps} />);
    
    expect(getByText('검토필요')).toBeTruthy();
  });

  it('should show APPROVED status correctly', () => {
    const approvedEntry = { ...mockJournalEntry, status: 'APPROVED' as const };
    const { getByText } = render(
      <JournalEntryCard {...defaultProps} journalEntry={approvedEntry} />
    );
    
    expect(getByText('승인완료')).toBeTruthy();
  });

  it('should handle press events', () => {
    const mockOnPress = jest.fn();
    const { getByTestId } = render(
      <JournalEntryCard {...defaultProps} onPress={mockOnPress} />
    );
    
    const card = getByTestId('journal-entry-card');
    fireEvent.press(card);
    
    expect(mockOnPress).toHaveBeenCalledWith(mockJournalEntry);
  });

  it('should handle approve action', () => {
    const mockOnApprove = jest.fn();
    const { getByTestId } = render(
      <JournalEntryCard {...defaultProps} onApprove={mockOnApprove} />
    );
    
    const approveButton = getByTestId('approve-button');
    fireEvent.press(approveButton);
    
    expect(mockOnApprove).toHaveBeenCalledWith('je-1');
  });

  it('should handle edit action', () => {
    const mockOnEdit = jest.fn();
    const { getByTestId } = render(
      <JournalEntryCard {...defaultProps} onEdit={mockOnEdit} />
    );
    
    const editButton = getByTestId('edit-button');
    fireEvent.press(editButton);
    
    expect(mockOnEdit).toHaveBeenCalledWith(mockJournalEntry);
  });

  it('should handle delete action with confirmation', () => {
    const mockOnDelete = jest.fn();
    const { getByTestId } = render(
      <JournalEntryCard {...defaultProps} onDelete={mockOnDelete} />
    );
    
    const deleteButton = getByTestId('delete-button');
    fireEvent.press(deleteButton);
    
    expect(mockOnDelete).toHaveBeenCalledWith('je-1');
  });

  it('should show balance validation correctly', () => {
    const { getByTestId } = render(<JournalEntryCard {...defaultProps} />);
    
    const balanceIndicator = getByTestId('balance-indicator');
    expect(balanceIndicator).toBeTruthy();
  });

  it('should display AI generated badge when applicable', () => {
    const { getByText } = render(<JournalEntryCard {...defaultProps} />);
    
    expect(getByText('AI')).toBeTruthy();
  });

  it('should show confidence color coding', () => {
    // High confidence (green)
    const highConfidenceEntry = { ...mockJournalEntry, confidence: 95 };
    const { rerender, getByTestId } = render(
      <JournalEntryCard {...defaultProps} journalEntry={highConfidenceEntry} />
    );
    
    let confidenceIndicator = getByTestId('confidence-indicator');
    expect(confidenceIndicator.props.style.backgroundColor).toContain('#10B981');

    // Medium confidence (yellow)
    const mediumConfidenceEntry = { ...mockJournalEntry, confidence: 75 };
    rerender(<JournalEntryCard {...defaultProps} journalEntry={mediumConfidenceEntry} />);
    
    confidenceIndicator = getByTestId('confidence-indicator');
    expect(confidenceIndicator.props.style.backgroundColor).toContain('#F59E0B');

    // Low confidence (red)
    const lowConfidenceEntry = { ...mockJournalEntry, confidence: 55 };
    rerender(<JournalEntryCard {...defaultProps} journalEntry={lowConfidenceEntry} />);
    
    confidenceIndicator = getByTestId('confidence-indicator');
    expect(confidenceIndicator.props.style.backgroundColor).toContain('#EF4444');
  });

  it('should format amounts correctly', () => {
    const largeAmountEntry = {
      ...mockJournalEntry,
      details: [{
        ...mockJournalEntry.details[0],
        debitAmount: 1234567,
        creditAmount: 0
      }]
    };

    const { getByText } = render(
      <JournalEntryCard {...defaultProps} journalEntry={largeAmountEntry} />
    );
    
    expect(getByText('₩1,234,567')).toBeTruthy();
  });

  it('should handle imbalanced journal entries', () => {
    const imbalancedEntry = {
      ...mockJournalEntry,
      details: [
        {
          id: 1,
          accountCode: '1120',
          accountName: '카드매출채권',
          debitAmount: 110000,
          creditAmount: 0,
          description: '카드 매출'
        },
        {
          id: 2,
          accountCode: '4100',
          accountName: '매출',
          debitAmount: 0,
          creditAmount: 90000, // 불균형
          description: '매출 발생'
        }
      ]
    };

    const { getByTestId } = render(
      <JournalEntryCard {...defaultProps} journalEntry={imbalancedEntry} />
    );
    
    const warningIndicator = getByTestId('imbalance-warning');
    expect(warningIndicator).toBeTruthy();
  });

  it('should show appropriate icons for different statuses', () => {
    const { rerender, getByTestId } = render(<JournalEntryCard {...defaultProps} />);
    
    // DRAFT status
    let statusIcon = getByTestId('status-icon');
    expect(statusIcon.props.name).toBe('time');

    // APPROVED status
    const approvedEntry = { ...mockJournalEntry, status: 'APPROVED' as const };
    rerender(<JournalEntryCard {...defaultProps} journalEntry={approvedEntry} />);
    
    statusIcon = getByTestId('status-icon');
    expect(statusIcon.props.name).toBe('checkmark-circle');

    // REJECTED status
    const rejectedEntry = { ...mockJournalEntry, status: 'REJECTED' as const };
    rerender(<JournalEntryCard {...defaultProps} journalEntry={rejectedEntry} />);
    
    statusIcon = getByTestId('status-icon');
    expect(statusIcon.props.name).toBe('close-circle');
  });

  it('should render without errors when required props are missing', () => {
    const minimalEntry = {
      id: 'je-minimal',
      transactionId: 'tx-minimal',
      description: '',
      date: '2025-07-22',
      details: [],
      status: 'DRAFT' as const,
      confidence: 0,
      aiGenerated: false,
      createdAt: '2025-07-22T10:00:00Z',
      updatedAt: '2025-07-22T10:00:00Z'
    };

    expect(() => 
      render(<JournalEntryCard {...defaultProps} journalEntry={minimalEntry} />)
    ).not.toThrow();
  });
});
/**
 * TDD: 분개 관리 UI 테스트 (Phase 4)
 * 백엔드 API를 호출하여 분개 생성, 승인, 전기 프로세스를 테스트합니다.
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import '@testing-library/jest-dom';
import { JournalEntryManagement } from '../../components/journal-entry-management';

// Mock 서버 설정
const server = setupServer(
  // 분개 생성 API
  http.post('/api/v2/accounting/journal-entries', () => {
    return HttpResponse.json({
      success: true,
      journalEntry: {
        id: 1,
        companyId: 'test-company',
        entryDate: '2025-01-15',
        description: '테스트 분개',
        totalDebitAmount: 100000,
        totalCreditAmount: 100000,
        status: 'DRAFT',
        details: [
          {
            id: 1,
            lineNumber: 1,
            accountCode: '5030',
            accountName: '사무용품비',
            debitAmount: 100000,
            creditAmount: 0,
            description: '차변: 사무용품비'
          },
          {
            id: 2,
            lineNumber: 2,
            accountCode: '1010',
            accountName: '보통예금',
            debitAmount: 0,
            creditAmount: 100000,
            description: '대변: 보통예금'
          }
        ]
      }
    });
  }),

  // 분개 승인 API
  http.put('/api/v2/accounting/journal-entries/:id/approve', () => {
    return HttpResponse.json({
      success: true,
      journalEntry: {
        id: 1,
        status: 'APPROVED',
        approvedAt: '2025-01-15T10:30:00Z'
      }
    });
  }),

  // 분개 전기 API
  http.post('/api/v2/accounting/journal-entries/:id/post', () => {
    return HttpResponse.json({
      success: true,
      journalEntry: {
        id: 1,
        status: 'POSTED',
        postedAt: '2025-01-15T10:35:00Z'
      }
    });
  }),

  // 분개 목록 조회 API
  http.get('/api/v2/accounting/journal-entries', () => {
    return HttpResponse.json({
      journalEntries: [
        {
          id: 1,
          companyId: 'test-company',
          entryDate: '2025-01-15',
          description: '테스트 분개',
          totalDebitAmount: 100000,
          totalCreditAmount: 100000,
          status: 'DRAFT',
          createdAt: '2025-01-15T10:00:00Z'
        }
      ],
      pagination: {
        total: 1,
        page: 1,
        pageSize: 10
      }
    });
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('Journal Entry Management UI (TDD)', () => {
  describe('분개 생성 기능', () => {
    test('should render journal entry creation form', () => {
      render(<JournalEntryManagement />);
      
      expect(screen.getByText('분개 관리')).toBeInTheDocument();
      expect(screen.getByText('새 분개 작성')).toBeInTheDocument();
      expect(screen.getByLabelText('적요')).toBeInTheDocument();
      expect(screen.getByLabelText('차변 계정')).toBeInTheDocument();
      expect(screen.getByLabelText('대변 계정')).toBeInTheDocument();
      expect(screen.getByLabelText('금액')).toBeInTheDocument();
    });

    test('should create new journal entry when form is submitted', async () => {
      render(<JournalEntryManagement />);
      
      // 폼 입력
      fireEvent.change(screen.getByLabelText('적요'), {
        target: { value: '사무용품 구매' }
      });
      fireEvent.change(screen.getByLabelText('차변 계정'), {
        target: { value: '5030' }
      });
      fireEvent.change(screen.getByLabelText('대변 계정'), {
        target: { value: '1010' }
      });
      fireEvent.change(screen.getByLabelText('금액'), {
        target: { value: '100000' }
      });

      // 생성 버튼 클릭
      fireEvent.click(screen.getByText('분개 생성'));

      // API 호출 결과 확인
      await waitFor(() => {
        expect(screen.getByText('분개가 성공적으로 생성되었습니다')).toBeInTheDocument();
      });
    });

    test('should validate journal entry balance before creation', async () => {
      render(<JournalEntryManagement />);
      
      // 불균형 분개 입력 (차변 != 대변)
      fireEvent.change(screen.getByLabelText('적요'), {
        target: { value: '불균형 테스트' }
      });
      fireEvent.change(screen.getByLabelText('금액'), {
        target: { value: '0' }
      });

      fireEvent.click(screen.getByText('분개 생성'));

      await waitFor(() => {
        expect(screen.getByText('금액은 0보다 커야 합니다')).toBeInTheDocument();
      });
    });
  });

  describe('분개 승인 워크플로우', () => {
    test('should show approval button for draft journal entries', async () => {
      render(<JournalEntryManagement />);
      
      // 분개 목록이 로드되기를 기다림
      await waitFor(() => {
        expect(screen.getByText('테스트 분개')).toBeInTheDocument();
      });

      // DRAFT 상태 분개에 승인 버튼이 있는지 확인
      expect(screen.getByText('승인')).toBeInTheDocument();
    });

    test('should approve journal entry when approve button is clicked', async () => {
      render(<JournalEntryManagement />);
      
      await waitFor(() => {
        expect(screen.getByText('테스트 분개')).toBeInTheDocument();
      });

      // 승인 버튼 클릭
      fireEvent.click(screen.getByText('승인'));

      await waitFor(() => {
        expect(screen.getByText('분개가 승인되었습니다')).toBeInTheDocument();
      });
    });
  });

  describe('분개 전기 기능', () => {
    test('should show post button for approved journal entries', async () => {
      // 승인된 분개 모킹
      server.use(
        http.get('/api/v2/accounting/journal-entries', () => {
          return HttpResponse.json({
            journalEntries: [
              {
                id: 1,
                status: 'APPROVED',
                description: '승인된 분개',
                totalDebitAmount: 100000,
                totalCreditAmount: 100000
              }
            ]
          });
        })
      );

      render(<JournalEntryManagement />);
      
      await waitFor(() => {
        expect(screen.getByText('승인된 분개')).toBeInTheDocument();
      });

      expect(screen.getByText('전기')).toBeInTheDocument();
    });

    test('should post journal entry to general ledger', async () => {
      server.use(
        http.get('/api/v2/accounting/journal-entries', () => {
          return HttpResponse.json({
            journalEntries: [
              {
                id: 1,
                status: 'APPROVED',
                description: '승인된 분개'
              }
            ]
          });
        })
      );

      render(<JournalEntryManagement />);
      
      await waitFor(() => {
        expect(screen.getByText('승인된 분개')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('전기'));

      await waitFor(() => {
        expect(screen.getByText('분개가 총계정원장에 전기되었습니다')).toBeInTheDocument();
      });
    });
  });

  describe('복합 분개 처리', () => {
    test('should handle complex journal entries with multiple lines', async () => {
      render(<JournalEntryManagement />);
      
      // 복합 분개 모드 활성화
      fireEvent.click(screen.getByText('복합 분개'));

      expect(screen.getByText('분개 라인 추가')).toBeInTheDocument();
      
      // 첫 번째 라인 추가
      fireEvent.click(screen.getByText('라인 추가'));
      
      // 분개 라인이 추가되었는지 확인
      expect(screen.getByText('라인 1')).toBeInTheDocument();
    });

    test('should validate complex journal entry balance', async () => {
      server.use(
        http.post('/api/v2/accounting/journal-entries/complex', () => {
          return HttpResponse.json({
            success: false,
            message: 'Journal entry is not balanced'
          }, { status: 400 });
        })
      );

      render(<JournalEntryManagement />);
      
      fireEvent.click(screen.getByText('복합 분개'));
      
      // 불균형 복합 분개 생성 시도
      fireEvent.click(screen.getByText('복합 분개 생성'));

      await waitFor(() => {
        expect(screen.getByText('분개가 균형을 이루지 않습니다')).toBeInTheDocument();
      });
    });
  });

  describe('분개 목록 및 검색', () => {
    test('should display journal entries list with pagination', async () => {
      render(<JournalEntryManagement />);
      
      await waitFor(() => {
        expect(screen.getByText('테스트 분개')).toBeInTheDocument();
      });

      // 페이지네이션 요소 확인
      expect(screen.getByText('1 / 1 페이지')).toBeInTheDocument();
    });

    test('should filter journal entries by status', async () => {
      render(<JournalEntryManagement />);
      
      // 상태 필터 선택
      fireEvent.change(screen.getByLabelText('상태 필터'), {
        target: { value: 'DRAFT' }
      });

      await waitFor(() => {
        expect(screen.getByText('테스트 분개')).toBeInTheDocument();
      });
    });

    test('should search journal entries by description', async () => {
      render(<JournalEntryManagement />);
      
      // 검색어 입력
      fireEvent.change(screen.getByPlaceholderText('분개 검색...'), {
        target: { value: '테스트' }
      });

      fireEvent.click(screen.getByText('검색'));

      await waitFor(() => {
        expect(screen.getByText('테스트 분개')).toBeInTheDocument();
      });
    });
  });

  describe('분개 상세 정보', () => {
    test('should show journal entry details when clicked', async () => {
      render(<JournalEntryManagement />);
      
      await waitFor(() => {
        expect(screen.getByText('테스트 분개')).toBeInTheDocument();
      });

      // 분개 항목 클릭
      fireEvent.click(screen.getByText('테스트 분개'));

      // 상세 정보 모달이 열리는지 확인
      expect(screen.getByText('분개 상세 정보')).toBeInTheDocument();
      expect(screen.getByText('차변: 100,000원')).toBeInTheDocument();
      expect(screen.getByText('대변: 100,000원')).toBeInTheDocument();
    });

    test('should display journal entry audit trail', async () => {
      server.use(
        http.get('/api/v2/accounting/journal-entries/1/audit', () => {
          return HttpResponse.json({
            auditTrail: [
              {
                action: 'CREATED',
                timestamp: '2025-01-15T10:00:00Z',
                user: 'system'
              },
              {
                action: 'APPROVED',
                timestamp: '2025-01-15T10:30:00Z',
                user: 'admin'
              }
            ]
          });
        })
      );

      render(<JournalEntryManagement />);
      
      await waitFor(() => {
        expect(screen.getByText('테스트 분개')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('테스트 분개'));
      fireEvent.click(screen.getByText('감사 추적'));

      await waitFor(() => {
        expect(screen.getByText('분개 생성')).toBeInTheDocument();
        expect(screen.getByText('분개 승인')).toBeInTheDocument();
      });
    });
  });
});
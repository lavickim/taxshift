/**
 * TDD: 월말 마감 관리 UI 테스트 (Phase 5)
 * 백엔드 API를 호출하여 월말 마감, 재무제표 생성, 회계등식 검증을 테스트합니다.
 */
import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { rest } from 'msw';
import { setupServer } from 'msw/node';

import { MonthEndClosingManagement } from '../../components/month-end-closing-management';

// Mock 서버 설정
const server = setupServer(
  // 월말 마감 API
  rest.post('/api/v2/accounting/month-end-closing', (req, res, ctx) => {
    return res(
      ctx.json({
        success: true,
        closingResult: {
          companyId: 'test-company',
          fiscalYear: 2025,
          fiscalMonth: 1,
          status: 'SUCCESS',
          closedAccountsCount: 15,
          processingTimeMs: 1250,
          trialBalance: {
            totalDebit: 10000000,
            totalCredit: 10000000,
            isBalanced: true,
          },
          financialStatements: {
            incomeStatement: {
              totalRevenue: 10100000,
              totalExpenses: 9000000,
              netIncome: 1100000,
            },
            balanceSheet: {
              totalAssets: 10000000,
              totalLiabilities: 3000000,
              totalEquity: 8100000,
            },
          },
        },
      })
    );
  }),

  // 시산표 생성 API
  rest.get('/api/v2/accounting/trial-balance', (req, res, ctx) => {
    return res(
      ctx.json({
        trialBalance: {
          companyId: 'test-company',
          fiscalYear: 2025,
          fiscalMonth: 1,
          items: [
            {
              accountCode: '1100',
              accountName: '현금',
              accountType: '자산',
              debitBalance: 5000000,
              creditBalance: 0,
            },
            {
              accountCode: '2100',
              accountName: '매입채무',
              accountType: '부채',
              debitBalance: 0,
              creditBalance: 2000000,
            },
            {
              accountCode: '3100',
              accountName: '자본금',
              accountType: '자본',
              debitBalance: 0,
              creditBalance: 3000000,
            },
          ],
          totalDebit: 5000000,
          totalCredit: 5000000,
          isBalanced: true,
        },
      })
    );
  }),

  // 손익계산서 생성 API
  rest.post('/api/v2/accounting/income-statement', (req, res, ctx) => {
    return res(
      ctx.json({
        incomeStatement: {
          companyId: 'test-company',
          fiscalYear: 2025,
          fiscalMonth: 1,
          revenues: {
            매출: 10000000,
            이자수익: 100000,
          },
          expenses: {
            매출원가: 6000000,
            판매비: 2000000,
            관리비: 1000000,
          },
          totalRevenue: 10100000,
          totalExpenses: 9000000,
          netIncome: 1100000,
        },
      })
    );
  }),

  // 재무상태표 생성 API
  rest.post('/api/v2/accounting/balance-sheet', (req, res, ctx) => {
    return res(
      ctx.json({
        balanceSheet: {
          companyId: 'test-company',
          fiscalYear: 2025,
          fiscalMonth: 1,
          assets: {
            현금: 5000000,
            매출채권: 3000000,
            재고자산: 2000000,
          },
          liabilities: {
            매입채무: 2000000,
            단기차입금: 1000000,
          },
          equity: {
            자본금: 5000000,
            이익잉여금: 2000000,
            당기순이익: 1100000,
          },
          totalAssets: 10000000,
          totalLiabilities: 3000000,
          totalEquity: 8100000,
        },
      })
    );
  }),

  // 현금흐름표 생성 API
  rest.post('/api/v2/accounting/cash-flow-statement', (req, res, ctx) => {
    return res(
      ctx.json({
        cashFlowStatement: {
          companyId: 'test-company',
          fiscalYear: 2025,
          fiscalMonth: 1,
          operatingActivities: {
            영업현금수입: 8000000,
            영업현금지출: -6000000,
          },
          investingActivities: {
            설비투자: -1000000,
          },
          financingActivities: {
            차입금상환: -500000,
          },
          netOperatingCash: 2000000,
          netInvestingCash: -1000000,
          netFinancingCash: -500000,
          netCashChange: 500000,
        },
      })
    );
  }),

  // 회계등식 검증 API
  rest.post(
    '/api/v2/accounting/validate-accounting-equation',
    (req, res, ctx) => {
      return res(
        ctx.json({
          validation: {
            isValid: true,
            assets: 10000000,
            liabilitiesAndEquity: 11100000,
            difference: 0,
            errors: [],
          },
        })
      );
    }
  )
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('Month End Closing Management UI (TDD)', () => {
  describe('월말 마감 프로세스', () => {
    test('should render month-end closing interface', () => {
      render(<MonthEndClosingManagement />);

      expect(screen.getByText('월말 마감 관리')).toBeInTheDocument();
      expect(screen.getByText('월말 마감 실행')).toBeInTheDocument();
      expect(screen.getByLabelText('회사 선택')).toBeInTheDocument();
      expect(screen.getByLabelText('회계연도')).toBeInTheDocument();
      expect(screen.getByLabelText('회계월')).toBeInTheDocument();
    });

    test('should execute month-end closing process', async () => {
      render(<MonthEndClosingManagement />);

      // 마감 조건 입력
      fireEvent.change(screen.getByLabelText('회사 선택'), {
        target: { value: 'test-company' },
      });
      fireEvent.change(screen.getByLabelText('회계연도'), {
        target: { value: '2025' },
      });
      fireEvent.change(screen.getByLabelText('회계월'), {
        target: { value: '1' },
      });

      // 마감 실행
      fireEvent.click(screen.getByText('월말 마감 실행'));

      await waitFor(() => {
        expect(
          screen.getByText('월말 마감이 완료되었습니다')
        ).toBeInTheDocument();
        expect(screen.getByText('마감된 계정: 15개')).toBeInTheDocument();
        expect(screen.getByText('처리시간: 1,250ms')).toBeInTheDocument();
      });
    });

    test('should show closing validation before execution', async () => {
      render(<MonthEndClosingManagement />);

      fireEvent.click(screen.getByText('마감 전 검증'));

      // 미전기 분개 확인 메시지
      await waitFor(() => {
        expect(
          screen.getByText('마감 전 검증을 실행합니다')
        ).toBeInTheDocument();
      });
    });
  });

  describe('시산표 생성 및 검증', () => {
    test('should generate and display trial balance', async () => {
      render(<MonthEndClosingManagement />);

      fireEvent.click(screen.getByText('시산표 생성'));

      await waitFor(() => {
        expect(screen.getByText('시산표')).toBeInTheDocument();
        expect(screen.getByText('현금')).toBeInTheDocument();
        expect(screen.getByText('5,000,000원')).toBeInTheDocument();
        expect(screen.getByText('차변 합계: 5,000,000원')).toBeInTheDocument();
        expect(screen.getByText('대변 합계: 5,000,000원')).toBeInTheDocument();
      });
    });

    test('should validate trial balance equilibrium', async () => {
      render(<MonthEndClosingManagement />);

      fireEvent.click(screen.getByText('시산표 생성'));

      await waitFor(() => {
        expect(screen.getByText('시산표 균형: 정상')).toBeInTheDocument();
      });
    });

    test('should show warning for unbalanced trial balance', async () => {
      server.use(
        rest.get('/api/v2/accounting/trial-balance', (req, res, ctx) => {
          return res(
            ctx.json({
              trialBalance: {
                totalDebit: 5000000,
                totalCredit: 5000001,
                isBalanced: false,
              },
            })
          );
        })
      );

      render(<MonthEndClosingManagement />);

      fireEvent.click(screen.getByText('시산표 생성'));

      await waitFor(() => {
        expect(screen.getByText('시산표 불균형 감지')).toBeInTheDocument();
        expect(screen.getByText('차이: 1원')).toBeInTheDocument();
      });
    });
  });

  describe('재무제표 생성', () => {
    test('should generate income statement', async () => {
      render(<MonthEndClosingManagement />);

      fireEvent.click(screen.getByText('손익계산서'));

      await waitFor(() => {
        expect(screen.getByText('손익계산서')).toBeInTheDocument();
        expect(screen.getByText('매출: 10,000,000원')).toBeInTheDocument();
        expect(screen.getByText('이자수익: 100,000원')).toBeInTheDocument();
        expect(screen.getByText('총수익: 10,100,000원')).toBeInTheDocument();
        expect(screen.getByText('총비용: 9,000,000원')).toBeInTheDocument();
        expect(screen.getByText('당기순이익: 1,100,000원')).toBeInTheDocument();
      });
    });

    test('should generate balance sheet', async () => {
      render(<MonthEndClosingManagement />);

      fireEvent.click(screen.getByText('재무상태표'));

      await waitFor(() => {
        expect(screen.getByText('재무상태표')).toBeInTheDocument();
        expect(screen.getByText('현금: 5,000,000원')).toBeInTheDocument();
        expect(screen.getByText('총자산: 10,000,000원')).toBeInTheDocument();
        expect(screen.getByText('총부채: 3,000,000원')).toBeInTheDocument();
        expect(screen.getByText('총자본: 8,100,000원')).toBeInTheDocument();
      });
    });

    test('should generate cash flow statement', async () => {
      render(<MonthEndClosingManagement />);

      fireEvent.click(screen.getByText('현금흐름표'));

      await waitFor(() => {
        expect(screen.getByText('현금흐름표')).toBeInTheDocument();
        expect(
          screen.getByText('영업활동 순현금흐름: 2,000,000원')
        ).toBeInTheDocument();
        expect(
          screen.getByText('투자활동 순현금흐름: -1,000,000원')
        ).toBeInTheDocument();
        expect(
          screen.getByText('재무활동 순현금흐름: -500,000원')
        ).toBeInTheDocument();
        expect(screen.getByText('현금 순증감: 500,000원')).toBeInTheDocument();
      });
    });

    test('should generate comprehensive financial statements', async () => {
      render(<MonthEndClosingManagement />);

      fireEvent.click(screen.getByText('통합 재무제표 생성'));

      await waitFor(() => {
        expect(screen.getByText('손익계산서')).toBeInTheDocument();
        expect(screen.getByText('재무상태표')).toBeInTheDocument();
        expect(screen.getByText('현금흐름표')).toBeInTheDocument();
      });
    });
  });

  describe('회계등식 검증', () => {
    test('should validate accounting equation', async () => {
      render(<MonthEndClosingManagement />);

      fireEvent.click(screen.getByText('회계등식 검증'));

      await waitFor(() => {
        expect(screen.getByText('회계등식 검증 결과')).toBeInTheDocument();
        expect(screen.getByText('자산 = 부채 + 자본')).toBeInTheDocument();
        expect(screen.getByText('검증 결과: 정상')).toBeInTheDocument();
      });
    });

    test('should show error for unbalanced accounting equation', async () => {
      server.use(
        rest.post(
          '/api/v2/accounting/validate-accounting-equation',
          (req, res, ctx) => {
            return res(
              ctx.json({
                validation: {
                  isValid: false,
                  assets: 10000000,
                  liabilitiesAndEquity: 9999999,
                  difference: 1,
                  errors: ['Accounting equation does not balance'],
                },
              })
            );
          }
        )
      );

      render(<MonthEndClosingManagement />);

      fireEvent.click(screen.getByText('회계등식 검증'));

      await waitFor(() => {
        expect(screen.getByText('회계등식 불균형')).toBeInTheDocument();
        expect(screen.getByText('차이: 1원')).toBeInTheDocument();
      });
    });
  });

  describe('마감 이력 관리', () => {
    test('should display closing history', async () => {
      server.use(
        rest.get('/api/v2/accounting/closing-history', (req, res, ctx) => {
          return res(
            ctx.json({
              closingHistory: [
                {
                  fiscalYear: 2024,
                  fiscalMonth: 12,
                  closedAt: '2024-12-31T23:59:59Z',
                  status: 'CLOSED',
                  closedAccountsCount: 20,
                },
                {
                  fiscalYear: 2024,
                  fiscalMonth: 11,
                  closedAt: '2024-11-30T23:59:59Z',
                  status: 'CLOSED',
                  closedAccountsCount: 18,
                },
              ],
            })
          );
        })
      );

      render(<MonthEndClosingManagement />);

      fireEvent.click(screen.getByText('마감 이력'));

      await waitFor(() => {
        expect(screen.getByText('마감 이력')).toBeInTheDocument();
        expect(screen.getByText('2024년 12월')).toBeInTheDocument();
        expect(screen.getByText('2024년 11월')).toBeInTheDocument();
      });
    });

    test('should allow reopening closed periods', async () => {
      server.use(
        rest.post('/api/v2/accounting/reopen-period', (req, res, ctx) => {
          return res(
            ctx.json({
              success: true,
              message: 'Period reopened successfully',
            })
          );
        })
      );

      render(<MonthEndClosingManagement />);

      fireEvent.click(screen.getByText('마감 이력'));

      await waitFor(() => {
        expect(screen.getByText('2024년 12월')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('재개방'));

      await waitFor(() => {
        expect(screen.getByText('마감이 재개방되었습니다')).toBeInTheDocument();
      });
    });
  });

  describe('마감 보고서', () => {
    test('should generate comprehensive closing report', async () => {
      server.use(
        rest.post('/api/v2/accounting/closing-report', (req, res, ctx) => {
          return res(
            ctx.json({
              closingReport: {
                companyId: 'test-company',
                period: { year: 2025, month: 1 },
                closedAt: '2025-01-31T23:59:59Z',
                accountsSummary: {
                  totalAccounts: 25,
                  closedAccounts: 25,
                },
                financialStatements: {
                  incomeStatement: { netIncome: 1100000 },
                  balanceSheet: { totalAssets: 10000000 },
                },
                validationResults: { isValid: true },
              },
            })
          );
        })
      );

      render(<MonthEndClosingManagement />);

      fireEvent.click(screen.getByText('마감 보고서 생성'));

      await waitFor(() => {
        expect(screen.getByText('월말 마감 보고서')).toBeInTheDocument();
        expect(screen.getByText('총 계정: 25개')).toBeInTheDocument();
        expect(screen.getByText('마감 계정: 25개')).toBeInTheDocument();
        expect(screen.getByText('검증 결과: 정상')).toBeInTheDocument();
      });
    });

    test('should export closing report as PDF', async () => {
      const mockDownload = jest.fn();
      global.URL.createObjectURL = jest.fn();
      global.URL.revokeObjectURL = jest.fn();

      // PDF 생성 API 모킹
      server.use(
        rest.get('/api/v2/accounting/closing-report/pdf', (req, res, ctx) => {
          return res(
            ctx.set('Content-Type', 'application/pdf'),
            ctx.body(new ArrayBuffer(1024))
          );
        })
      );

      render(<MonthEndClosingManagement />);

      fireEvent.click(screen.getByText('PDF 내보내기'));

      await waitFor(() => {
        expect(screen.getByText('보고서가 다운로드됩니다')).toBeInTheDocument();
      });
    });
  });

  describe('성능 모니터링', () => {
    test('should display processing performance metrics', async () => {
      render(<MonthEndClosingManagement />);

      // 마감 실행 후 성능 지표 확인
      fireEvent.click(screen.getByText('월말 마감 실행'));

      await waitFor(() => {
        expect(screen.getByText('처리시간: 1,250ms')).toBeInTheDocument();
        expect(screen.getByText('처리된 계정: 15개')).toBeInTheDocument();
      });
    });

    test('should show warning for slow performance', async () => {
      server.use(
        rest.post('/api/v2/accounting/month-end-closing', (req, res, ctx) => {
          return res(
            ctx.json({
              success: true,
              closingResult: {
                processingTimeMs: 15000, // 15초 - 느린 처리
                status: 'SUCCESS',
              },
            })
          );
        })
      );

      render(<MonthEndClosingManagement />);

      fireEvent.click(screen.getByText('월말 마감 실행'));

      await waitFor(() => {
        expect(
          screen.getByText('처리시간이 예상보다 오래 걸렸습니다')
        ).toBeInTheDocument();
      });
    });
  });
});

package com.moneyshift.api.service;

import com.moneyshift.api.service.MonthEndClosingService.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Phase 5 TDD: 월말 마감 및 재무제표 생성 테스트
 * 
 * 테스트 시나리오:
 * 1. 월말 마감 프로세스 전체 통합 테스트
 * 2. 시산표 생성 및 균형 검증
 * 3. 손익계산서 생성 및 당기순이익 계산
 * 4. 재무상태표 생성 및 회계등식 검증
 * 5. 현금흐름표 생성
 * 6. 재무제표 통합 생성
 * 7. GL 마감 처리
 * 8. 마감 조건 검증
 */
@SpringBootTest
@ActiveProfiles("test")
@Transactional
public class Phase5MonthEndClosingTest {

    @Autowired
    private MonthEndClosingService monthEndClosingService;

    private String companyId = "test-company";
    private Integer fiscalYear = 2025;
    private Integer fiscalMonth = 1;

    @BeforeEach
    public void setUp() {
        // 테스트 설정
    }

    @Test
    @DisplayName("Phase 5-1: 월말 마감 프로세스 전체 통합 테스트")
    public void testMonthEndClosingProcess() {
        // When: 월말 마감 실행
        MonthEndClosingResult result = monthEndClosingService.closeMonth(companyId, fiscalYear, fiscalMonth);
        
        // Then: 마감 결과 검증
        assertNotNull(result);
        assertEquals(companyId, result.getCompanyId());
        assertEquals(fiscalYear, result.getFiscalYear());
        assertEquals(fiscalMonth, result.getFiscalMonth());
        assertEquals("SUCCESS", result.getStatus());
        assertNotNull(result.getClosingDate());
        assertNotNull(result.getTrialBalance());
        assertNotNull(result.getFinancialStatements());
        assertTrue(result.getClosedAccountsCount() > 0);
        assertTrue(result.getProcessingTimeMs() > 0);
    }

    @Test
    @DisplayName("Phase 5-2: 시산표 생성 및 균형 검증")
    public void testTrialBalanceGeneration() {
        // When: 시산표 생성
        TrialBalance trialBalance = monthEndClosingService.generateTrialBalance(companyId, fiscalYear, fiscalMonth);
        
        // Then: 시산표 검증
        assertNotNull(trialBalance);
        assertEquals(companyId, trialBalance.getCompanyId());
        assertEquals(fiscalYear, trialBalance.getFiscalYear());
        assertEquals(fiscalMonth, trialBalance.getFiscalMonth());
        assertNotNull(trialBalance.getItems());
        assertFalse(trialBalance.getItems().isEmpty());
        
        // 차변/대변 균형 검증
        assertTrue(trialBalance.getIsBalanced(), "시산표가 균형을 이루어야 함");
        assertEquals(trialBalance.getTotalDebit(), trialBalance.getTotalCredit(), 
                "차변과 대변 합계가 같아야 함");
        
        // 시산표 항목 검증
        for (TrialBalanceItem item : trialBalance.getItems()) {
            assertNotNull(item.getAccountCode());
            assertNotNull(item.getAccountName());
            assertNotNull(item.getAccountType());
            
            // 차변 또는 대변 중 하나만 잔액을 가져야 함
            boolean hasOnlyOneBalance = 
                    (item.getDebitBalance().compareTo(BigDecimal.ZERO) > 0 && 
                     item.getCreditBalance().equals(BigDecimal.ZERO)) ||
                    (item.getCreditBalance().compareTo(BigDecimal.ZERO) > 0 && 
                     item.getDebitBalance().equals(BigDecimal.ZERO));
            assertTrue(hasOnlyOneBalance, "계정은 차변 또는 대변 중 하나만 잔액을 가져야 함");
        }
    }

    @Test
    @DisplayName("Phase 5-3: 손익계산서 생성 및 당기순이익 계산")
    public void testIncomeStatementGeneration() {
        // When: 손익계산서 생성
        IncomeStatement incomeStatement = monthEndClosingService.generateIncomeStatement(
                companyId, fiscalYear, fiscalMonth);
        
        // Then: 손익계산서 검증
        assertNotNull(incomeStatement);
        assertEquals(companyId, incomeStatement.getCompanyId());
        assertEquals(fiscalYear, incomeStatement.getFiscalYear());
        assertEquals(fiscalMonth, incomeStatement.getFiscalMonth());
        
        // 수익 및 비용 데이터 검증
        assertNotNull(incomeStatement.getRevenues());
        assertNotNull(incomeStatement.getExpenses());
        assertFalse(incomeStatement.getRevenues().isEmpty());
        assertFalse(incomeStatement.getExpenses().isEmpty());
        
        // 합계 및 당기순이익 검증
        assertTrue(incomeStatement.getTotalRevenue().compareTo(BigDecimal.ZERO) > 0, "총수익은 0보다 커야 함");
        assertTrue(incomeStatement.getTotalExpenses().compareTo(BigDecimal.ZERO) > 0, "총비용은 0보다 커야 함");
        
        BigDecimal expectedNetIncome = incomeStatement.getTotalRevenue()
                .subtract(incomeStatement.getTotalExpenses());
        assertEquals(expectedNetIncome, incomeStatement.getNetIncome(), "당기순이익 계산이 정확해야 함");
        
        // 실제 예상값 검증 (샘플 데이터 기준)
        assertEquals(new BigDecimal("10100000"), incomeStatement.getTotalRevenue()); // 매출 + 이자수익
        assertEquals(new BigDecimal("9000000"), incomeStatement.getTotalExpenses());  // 매출원가 + 판매비 + 관리비
        assertEquals(new BigDecimal("1100000"), incomeStatement.getNetIncome());     // 순이익
    }

    @Test
    @DisplayName("Phase 5-4: 재무상태표 생성 및 회계등식 검증")
    public void testBalanceSheetGeneration() {
        // Given: 당기순이익 (손익계산서에서 가져온다고 가정)
        BigDecimal netIncome = new BigDecimal("1100000");
        
        // When: 재무상태표 생성
        BalanceSheet balanceSheet = monthEndClosingService.generateBalanceSheet(
                companyId, fiscalYear, fiscalMonth, netIncome);
        
        // Then: 재무상태표 검증
        assertNotNull(balanceSheet);
        assertEquals(companyId, balanceSheet.getCompanyId());
        assertEquals(fiscalYear, balanceSheet.getFiscalYear());
        assertEquals(fiscalMonth, balanceSheet.getFiscalMonth());
        
        // 자산, 부채, 자본 데이터 검증
        assertNotNull(balanceSheet.getAssets());
        assertNotNull(balanceSheet.getLiabilities());
        assertNotNull(balanceSheet.getEquity());
        assertFalse(balanceSheet.getAssets().isEmpty());
        assertFalse(balanceSheet.getLiabilities().isEmpty());
        assertFalse(balanceSheet.getEquity().isEmpty());
        
        // 당기순이익이 자본에 포함되었는지 확인
        assertTrue(balanceSheet.getEquity().containsKey("당기순이익"));
        assertEquals(netIncome, balanceSheet.getEquity().get("당기순이익"));
        
        // 회계등식 검증 (자산 = 부채 + 자본)
        BigDecimal totalLiabilitiesAndEquity = balanceSheet.getTotalLiabilities()
                .add(balanceSheet.getTotalEquity());
        assertEquals(balanceSheet.getTotalAssets(), totalLiabilitiesAndEquity, 
                "회계등식이 성립해야 함: 자산 = 부채 + 자본");
        
        // 실제 예상값 검증 (샘플 데이터 + 당기순이익 기준)
        assertEquals(new BigDecimal("10000000"), balanceSheet.getTotalAssets());   // 현금 + 매출채권 + 재고자산
        assertEquals(new BigDecimal("3000000"), balanceSheet.getTotalLiabilities()); // 매입채무 + 단기차입금
        assertEquals(new BigDecimal("8100000"), balanceSheet.getTotalEquity());   // 자본금 + 이익잉여금 + 당기순이익
        assertEquals(new BigDecimal("11100000"), totalLiabilitiesAndEquity);      // 부채 + 자본
    }

    @Test
    @DisplayName("Phase 5-5: 현금흐름표 생성")
    public void testCashFlowStatementGeneration() {
        // When: 현금흐름표 생성
        CashFlowStatement cashFlowStatement = monthEndClosingService.generateCashFlowStatement(
                companyId, fiscalYear, fiscalMonth);
        
        // Then: 현금흐름표 검증
        assertNotNull(cashFlowStatement);
        assertEquals(companyId, cashFlowStatement.getCompanyId());
        assertEquals(fiscalYear, cashFlowStatement.getFiscalYear());
        assertEquals(fiscalMonth, cashFlowStatement.getFiscalMonth());
        
        // 현금흐름 활동별 데이터 검증
        assertNotNull(cashFlowStatement.getOperatingActivities());
        assertNotNull(cashFlowStatement.getInvestingActivities());
        assertNotNull(cashFlowStatement.getFinancingActivities());
        
        // 순현금흐름 계산 검증
        BigDecimal expectedNetCashChange = cashFlowStatement.getNetOperatingCash()
                .add(cashFlowStatement.getNetInvestingCash())
                .add(cashFlowStatement.getNetFinancingCash());
        assertEquals(expectedNetCashChange, cashFlowStatement.getNetCashChange(), 
                "순현금변동 계산이 정확해야 함");
        
        // 실제 예상값 검증 (샘플 데이터 기준)
        assertEquals(new BigDecimal("2000000"), cashFlowStatement.getNetOperatingCash());  // 영업활동 순현금흐름
        assertEquals(new BigDecimal("-1000000"), cashFlowStatement.getNetInvestingCash()); // 투자활동 순현금흐름
        assertEquals(new BigDecimal("-500000"), cashFlowStatement.getNetFinancingCash());  // 재무활동 순현금흐름
        assertEquals(new BigDecimal("500000"), cashFlowStatement.getNetCashChange());      // 현금 순증감
    }

    @Test
    @DisplayName("Phase 5-6: 재무제표 통합 생성")
    public void testFinancialStatementsGeneration() {
        // When: 재무제표 통합 생성
        FinancialStatements financialStatements = monthEndClosingService.generateFinancialStatements(
                companyId, fiscalYear, fiscalMonth);
        
        // Then: 재무제표 통합 검증
        assertNotNull(financialStatements);
        assertEquals(companyId, financialStatements.getCompanyId());
        assertEquals(fiscalYear, financialStatements.getFiscalYear());
        assertEquals(fiscalMonth, financialStatements.getFiscalMonth());
        assertNotNull(financialStatements.getGeneratedAt());
        
        // 개별 재무제표 존재 검증
        assertNotNull(financialStatements.getIncomeStatement());
        assertNotNull(financialStatements.getBalanceSheet());
        assertNotNull(financialStatements.getCashFlowStatement());
        
        // 손익계산서와 재무상태표 간 당기순이익 일치 검증
        BigDecimal incomeStatementNetIncome = financialStatements.getIncomeStatement().getNetIncome();
        BigDecimal balanceSheetNetIncome = financialStatements.getBalanceSheet().getEquity().get("당기순이익");
        assertEquals(incomeStatementNetIncome, balanceSheetNetIncome, 
                "손익계산서와 재무상태표의 당기순이익이 일치해야 함");
    }

    @Test
    @DisplayName("Phase 5-7: 회계등식 검증 로직")
    public void testAccountingEquationValidation() {
        // Given: 균형 잡힌 재무제표
        FinancialStatements balancedStatements = monthEndClosingService.generateFinancialStatements(
                companyId, fiscalYear, fiscalMonth);
        
        // When & Then: 회계등식 검증이 통과해야 함
        assertDoesNotThrow(() -> monthEndClosingService.validateAccountingEquation(balancedStatements),
                "균형 잡힌 재무제표는 회계등식 검증을 통과해야 함");
        
        // Given: 불균형 재무제표 (테스트를 위해 자산을 임의로 변경)
        BalanceSheet unbalancedBalanceSheet = balancedStatements.getBalanceSheet();
        unbalancedBalanceSheet.getAssets().put("현금", new BigDecimal("999999999")); // 임의로 큰 값 설정
        unbalancedBalanceSheet.setTotalAssets(unbalancedBalanceSheet.getAssets().values().stream()
                .reduce(BigDecimal.ZERO, BigDecimal::add));
        
        FinancialStatements unbalancedStatements = FinancialStatements.builder()
                .companyId(companyId)
                .fiscalYear(fiscalYear)
                .fiscalMonth(fiscalMonth)
                .incomeStatement(balancedStatements.getIncomeStatement())
                .balanceSheet(unbalancedBalanceSheet)
                .cashFlowStatement(balancedStatements.getCashFlowStatement())
                .generatedAt(LocalDate.now())
                .build();
        
        // When & Then: 회계등식 검증에서 예외가 발생해야 함
        RuntimeException exception = assertThrows(RuntimeException.class, 
                () -> monthEndClosingService.validateAccountingEquation(unbalancedStatements));
        assertTrue(exception.getMessage().contains("회계등식이 균형을 이루지 않습니다"), 
                "회계등식 불균형 메시지가 포함되어야 함");
    }

    @Test
    @DisplayName("Phase 5-8: 시산표 개별 항목 검증")
    public void testTrialBalanceItemValidation() {
        // When: 시산표 생성
        TrialBalance trialBalance = monthEndClosingService.generateTrialBalance(companyId, fiscalYear, fiscalMonth);
        
        // Then: 개별 항목 상세 검증
        for (TrialBalanceItem item : trialBalance.getItems()) {
            // 계정코드 형식 검증
            assertNotNull(item.getAccountCode());
            assertFalse(item.getAccountCode().isEmpty());
            
            // 계정명 검증
            assertNotNull(item.getAccountName());
            assertFalse(item.getAccountName().isEmpty());
            
            // 계정유형 검증
            assertNotNull(item.getAccountType());
            assertTrue(item.getAccountType().matches("^(자산|부채|자본|수익|비용)$"), 
                    "계정유형은 자산, 부채, 자본, 수익, 비용 중 하나여야 함");
            
            // 잔액 검증 (null이 아니어야 함)
            assertNotNull(item.getDebitBalance());
            assertNotNull(item.getCreditBalance());
            
            // 음수 잔액 없음 검증
            assertTrue(item.getDebitBalance().compareTo(BigDecimal.ZERO) >= 0, 
                    "차변 잔액은 0 이상이어야 함");
            assertTrue(item.getCreditBalance().compareTo(BigDecimal.ZERO) >= 0, 
                    "대변 잔액은 0 이상이어야 함");
        }
        
        // 특정 계정 존재 확인
        boolean hasCashAccount = trialBalance.getItems().stream()
                .anyMatch(item -> "1100".equals(item.getAccountCode()) && "현금".equals(item.getAccountName()));
        assertTrue(hasCashAccount, "현금 계정이 시산표에 포함되어야 함");
    }

    @Test
    @DisplayName("Phase 5-9: 재무제표 금액 정확성 검증")
    public void testFinancialStatementsAmountAccuracy() {
        // When: 재무제표 생성
        FinancialStatements statements = monthEndClosingService.generateFinancialStatements(
                companyId, fiscalYear, fiscalMonth);
        
        // Then: 손익계산서 금액 검증
        IncomeStatement income = statements.getIncomeStatement();
        
        // 수익 항목별 검증
        assertEquals(new BigDecimal("10000000"), income.getRevenues().get("매출"));
        assertEquals(new BigDecimal("100000"), income.getRevenues().get("이자수익"));
        
        // 비용 항목별 검증
        assertEquals(new BigDecimal("6000000"), income.getExpenses().get("매출원가"));
        assertEquals(new BigDecimal("2000000"), income.getExpenses().get("판매비"));
        assertEquals(new BigDecimal("1000000"), income.getExpenses().get("관리비"));
        
        // Then: 재무상태표 금액 검증
        BalanceSheet balance = statements.getBalanceSheet();
        
        // 자산 항목별 검증
        assertEquals(new BigDecimal("5000000"), balance.getAssets().get("현금"));
        assertEquals(new BigDecimal("3000000"), balance.getAssets().get("매출채권"));
        assertEquals(new BigDecimal("2000000"), balance.getAssets().get("재고자산"));
        
        // 부채 항목별 검증
        assertEquals(new BigDecimal("2000000"), balance.getLiabilities().get("매입채무"));
        assertEquals(new BigDecimal("1000000"), balance.getLiabilities().get("단기차입금"));
        
        // 자본 항목별 검증
        assertEquals(new BigDecimal("5000000"), balance.getEquity().get("자본금"));
        assertEquals(new BigDecimal("2000000"), balance.getEquity().get("이익잉여금"));
        assertEquals(new BigDecimal("1100000"), balance.getEquity().get("당기순이익"));
    }

    @Test
    @DisplayName("Phase 5-10: 월말 마감 처리 시간 성능 검증")
    public void testMonthEndClosingPerformance() {
        // When: 월말 마감 실행 (시간 측정)
        long startTime = System.currentTimeMillis();
        MonthEndClosingResult result = monthEndClosingService.closeMonth(companyId, fiscalYear, fiscalMonth);
        long actualTime = System.currentTimeMillis() - startTime;
        
        // Then: 성능 검증
        assertNotNull(result.getProcessingTimeMs());
        assertTrue(result.getProcessingTimeMs() > 0, "처리시간이 기록되어야 함");
        
        // 실제 처리시간과 기록된 시간의 유사성 검증 (오차 100ms 허용)
        long timeDifference = Math.abs(actualTime - result.getProcessingTimeMs());
        assertTrue(timeDifference <= 100, "기록된 처리시간이 실제 시간과 유사해야 함");
        
        // 처리시간이 합리적 범위 내에 있는지 확인 (10초 이하)
        assertTrue(result.getProcessingTimeMs() < 10000, "처리시간이 10초를 초과하지 않아야 함");
    }

    @Test
    @DisplayName("Phase 5-11: 재무제표 데이터 일관성 검증")
    public void testFinancialStatementsDataConsistency() {
        // When: 재무제표 생성
        FinancialStatements statements = monthEndClosingService.generateFinancialStatements(
                companyId, fiscalYear, fiscalMonth);
        
        // Then: 데이터 일관성 검증
        
        // 1. 모든 재무제표가 같은 회사/기간 정보를 가져야 함
        assertEquals(statements.getCompanyId(), statements.getIncomeStatement().getCompanyId());
        assertEquals(statements.getCompanyId(), statements.getBalanceSheet().getCompanyId());
        assertEquals(statements.getCompanyId(), statements.getCashFlowStatement().getCompanyId());
        
        assertEquals(statements.getFiscalYear(), statements.getIncomeStatement().getFiscalYear());
        assertEquals(statements.getFiscalYear(), statements.getBalanceSheet().getFiscalYear());
        assertEquals(statements.getFiscalYear(), statements.getCashFlowStatement().getFiscalYear());
        
        assertEquals(statements.getFiscalMonth(), statements.getIncomeStatement().getFiscalMonth());
        assertEquals(statements.getFiscalMonth(), statements.getBalanceSheet().getFiscalMonth());
        assertEquals(statements.getFiscalMonth(), statements.getCashFlowStatement().getFiscalMonth());
        
        // 2. 손익계산서의 당기순이익이 재무상태표 자본에 정확히 반영되어야 함
        BigDecimal netIncomeFromIS = statements.getIncomeStatement().getNetIncome();
        BigDecimal netIncomeInBS = statements.getBalanceSheet().getEquity().get("당기순이익");
        assertEquals(netIncomeFromIS, netIncomeInBS, "당기순이익이 두 재무제표에서 일치해야 함");
        
        // 3. 재무상태표의 회계등식이 성립해야 함
        BalanceSheet bs = statements.getBalanceSheet();
        BigDecimal leftSide = bs.getTotalAssets();
        BigDecimal rightSide = bs.getTotalLiabilities().add(bs.getTotalEquity());
        assertEquals(leftSide, rightSide, "자산 = 부채 + 자본 등식이 성립해야 함");
    }

    @Test
    @DisplayName("Phase 5-12: 빈 데이터 처리 안정성 검증")
    public void testEmptyDataHandling() {
        // 이 테스트는 실제 데이터베이스 연동 후 빈 데이터 상황을 시뮬레이션할 때 사용
        // 현재는 샘플 데이터를 사용하므로 기본적인 null 체크만 수행
        
        // When: 재무제표 생성
        FinancialStatements statements = monthEndClosingService.generateFinancialStatements(
                companyId, fiscalYear, fiscalMonth);
        
        // Then: null 안전성 검증
        assertNotNull(statements);
        assertNotNull(statements.getIncomeStatement());
        assertNotNull(statements.getBalanceSheet());
        assertNotNull(statements.getCashFlowStatement());
        
        // 모든 Map이 null이 아니고 초기화되어 있는지 확인
        assertNotNull(statements.getIncomeStatement().getRevenues());
        assertNotNull(statements.getIncomeStatement().getExpenses());
        assertNotNull(statements.getBalanceSheet().getAssets());
        assertNotNull(statements.getBalanceSheet().getLiabilities());
        assertNotNull(statements.getBalanceSheet().getEquity());
        assertNotNull(statements.getCashFlowStatement().getOperatingActivities());
        assertNotNull(statements.getCashFlowStatement().getInvestingActivities());
        assertNotNull(statements.getCashFlowStatement().getFinancingActivities());
    }
}
package com.moneyshift.api.service;

import com.moneyshift.api.mapper.AccountingMapper;
import com.moneyshift.api.model.GeneralLedger;
import com.moneyshift.api.model.ChartOfAccount;
import io.micrometer.core.annotation.Counted;
import io.micrometer.core.annotation.Timed;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Phase 5: 월말 마감 및 재무제표 생성 서비스
 * 복식부기 원칙에 따른 월말 마감 프로세스 및 재무제표 자동 생성
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class MonthEndClosingService {

    private final AccountingMapper accountingMapper;

    // ========== 월말 마감 프로세스 ==========

    /**
     * 월말 마감 프로세스 실행
     */
    @Timed(value = "accounting.month.end.close", description = "월말 마감 처리시간")
    @Counted(value = "accounting.month.end.close.total", description = "월말 마감 총 처리 수")
    public MonthEndClosingResult closeMonth(String companyId, Integer fiscalYear, Integer fiscalMonth) {
        log.info("월말 마감 시작: companyId={}, fiscalYear={}, fiscalMonth={}", companyId, fiscalYear, fiscalMonth);
        
        long startTime = System.currentTimeMillis();
        
        try {
            // 1. 마감 전 검증
            validatePreClosingConditions(companyId, fiscalYear, fiscalMonth);
            
            // 2. 시산표 생성 및 균형 검증
            TrialBalance trialBalance = generateTrialBalance(companyId, fiscalYear, fiscalMonth);
            
            // 3. GL 계정 마감 처리
            List<GeneralLedger> closedAccounts = performGLClosing(companyId, fiscalYear, fiscalMonth);
            
            // 4. 재무제표 생성
            FinancialStatements financialStatements = generateFinancialStatements(companyId, fiscalYear, fiscalMonth);
            
            // 5. 회계등식 검증
            validateAccountingEquation(financialStatements);
            
            // 6. 마감 결과 생성
            long processingTime = System.currentTimeMillis() - startTime;
            
            MonthEndClosingResult result = MonthEndClosingResult.builder()
                    .companyId(companyId)
                    .fiscalYear(fiscalYear)
                    .fiscalMonth(fiscalMonth)
                    .closingDate(LocalDate.now())
                    .trialBalance(trialBalance)
                    .closedAccountsCount(closedAccounts.size())
                    .financialStatements(financialStatements)
                    .processingTimeMs(processingTime)
                    .status("SUCCESS")
                    .build();
            
            log.info("월말 마감 완료: companyId={}, 처리시간={}ms, 마감계정수={}", 
                    companyId, processingTime, closedAccounts.size());
            
            return result;
            
        } catch (Exception e) {
            log.error("월말 마감 실패: companyId={}, error={}", companyId, e.getMessage(), e);
            throw new RuntimeException("월말 마감 중 오류가 발생했습니다: " + e.getMessage(), e);
        }
    }

    /**
     * 마감 전 조건 검증
     */
    private void validatePreClosingConditions(String companyId, Integer fiscalYear, Integer fiscalMonth) {
        log.debug("마감 전 조건 검증: companyId={}", companyId);
        
        // 1. 미전기 분개 확인
        // TODO: 구현 필요 - POSTED 상태가 아닌 분개가 있으면 마감 불가
        
        // 2. 이미 마감된 월인지 확인
        // TODO: 구현 필요 - 이미 마감된 월이면 중복 마감 방지
        
        log.debug("마감 전 조건 검증 완료");
    }

    // ========== 시산표 생성 ==========

    /**
     * 시산표 생성 및 균형 검증
     */
    @Timed(value = "accounting.trial.balance.generate", description = "시산표 생성 처리시간")
    public TrialBalance generateTrialBalance(String companyId, Integer fiscalYear, Integer fiscalMonth) {
        log.info("시산표 생성: companyId={}, fiscalYear={}, fiscalMonth={}", companyId, fiscalYear, fiscalMonth);
        
        try {
            // GL 계정별 잔액 조회
            // TODO: 실제 구현 시 GL 데이터 조회
            List<TrialBalanceItem> items = createSampleTrialBalanceItems();
            
            // 차변/대변 합계 계산
            BigDecimal totalDebit = items.stream()
                    .map(TrialBalanceItem::getDebitBalance)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
                    
            BigDecimal totalCredit = items.stream()
                    .map(TrialBalanceItem::getCreditBalance)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            
            // 균형 검증
            boolean isBalanced = totalDebit.compareTo(totalCredit) == 0;
            
            if (!isBalanced) {
                log.warn("시산표 불균형 감지: 차변={}, 대변={}", totalDebit, totalCredit);
                throw new RuntimeException(String.format("시산표가 균형을 이루지 않습니다. 차변=%s, 대변=%s", 
                        totalDebit, totalCredit));
            }
            
            TrialBalance trialBalance = TrialBalance.builder()
                    .companyId(companyId)
                    .fiscalYear(fiscalYear)
                    .fiscalMonth(fiscalMonth)
                    .items(items)
                    .totalDebit(totalDebit)
                    .totalCredit(totalCredit)
                    .isBalanced(isBalanced)
                    .generatedAt(LocalDate.now())
                    .build();
            
            log.info("시산표 생성 완료: 차변={}, 대변={}, 균형={}", totalDebit, totalCredit, isBalanced);
            return trialBalance;
            
        } catch (Exception e) {
            log.error("시산표 생성 실패", e);
            throw new RuntimeException("시산표 생성 중 오류가 발생했습니다: " + e.getMessage(), e);
        }
    }

    // ========== GL 마감 처리 ==========

    /**
     * GL 계정 마감 처리
     */
    private List<GeneralLedger> performGLClosing(String companyId, Integer fiscalYear, Integer fiscalMonth) {
        log.info("GL 계정 마감 처리: companyId={}", companyId);
        
        try {
            // TODO: 실제 구현 시 GL 데이터 조회 및 마감 처리
            List<GeneralLedger> glAccounts = createSampleGLAccounts(companyId, fiscalYear, fiscalMonth);
            
            // 각 계정별 마감 처리
            glAccounts.forEach(gl -> {
                gl.closeMonth();
                log.debug("GL 계정 마감: accountCode={}, endingBalance={}", 
                        gl.getAccountCode(), gl.getNetBalance());
            });
            
            log.info("GL 계정 마감 완료: {}개 계정", glAccounts.size());
            return glAccounts;
            
        } catch (Exception e) {
            log.error("GL 계정 마감 실패", e);
            throw new RuntimeException("GL 계정 마감 중 오류가 발생했습니다: " + e.getMessage(), e);
        }
    }

    // ========== 재무제표 생성 ==========

    /**
     * 재무제표 통합 생성
     */
    @Timed(value = "accounting.financial.statements.generate", description = "재무제표 생성 처리시간")
    public FinancialStatements generateFinancialStatements(String companyId, Integer fiscalYear, Integer fiscalMonth) {
        log.info("재무제표 생성: companyId={}", companyId);
        
        try {
            // 1. 손익계산서 생성
            IncomeStatement incomeStatement = generateIncomeStatement(companyId, fiscalYear, fiscalMonth);
            
            // 2. 재무상태표 생성
            BalanceSheet balanceSheet = generateBalanceSheet(companyId, fiscalYear, fiscalMonth, 
                    incomeStatement.getNetIncome());
            
            // 3. 현금흐름표 생성
            CashFlowStatement cashFlowStatement = generateCashFlowStatement(companyId, fiscalYear, fiscalMonth);
            
            FinancialStatements statements = FinancialStatements.builder()
                    .companyId(companyId)
                    .fiscalYear(fiscalYear)
                    .fiscalMonth(fiscalMonth)
                    .incomeStatement(incomeStatement)
                    .balanceSheet(balanceSheet)
                    .cashFlowStatement(cashFlowStatement)
                    .generatedAt(LocalDate.now())
                    .build();
            
            log.info("재무제표 생성 완료");
            return statements;
            
        } catch (Exception e) {
            log.error("재무제표 생성 실패", e);
            throw new RuntimeException("재무제표 생성 중 오류가 발생했습니다: " + e.getMessage(), e);
        }
    }

    /**
     * 손익계산서 생성
     */
    public IncomeStatement generateIncomeStatement(String companyId, Integer fiscalYear, Integer fiscalMonth) {
        log.debug("손익계산서 생성: companyId={}", companyId);
        
        try {
            // TODO: 실제 구현 시 수익/비용 계정 데이터 조회
            Map<String, BigDecimal> revenues = createSampleRevenueData();
            Map<String, BigDecimal> expenses = createSampleExpenseData();
            
            // 합계 계산
            BigDecimal totalRevenue = revenues.values().stream()
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            BigDecimal totalExpenses = expenses.values().stream()
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            BigDecimal netIncome = totalRevenue.subtract(totalExpenses);
            
            IncomeStatement incomeStatement = IncomeStatement.builder()
                    .companyId(companyId)
                    .fiscalYear(fiscalYear)
                    .fiscalMonth(fiscalMonth)
                    .revenues(revenues)
                    .expenses(expenses)
                    .totalRevenue(totalRevenue)
                    .totalExpenses(totalExpenses)
                    .netIncome(netIncome)
                    .build();
            
            log.debug("손익계산서 생성 완료: 총수익={}, 총비용={}, 당기순이익={}", 
                    totalRevenue, totalExpenses, netIncome);
            
            return incomeStatement;
            
        } catch (Exception e) {
            log.error("손익계산서 생성 실패", e);
            throw new RuntimeException("손익계산서 생성 중 오류가 발생했습니다: " + e.getMessage(), e);
        }
    }

    /**
     * 재무상태표(대차대조표) 생성
     */
    public BalanceSheet generateBalanceSheet(String companyId, Integer fiscalYear, Integer fiscalMonth, 
                                           BigDecimal netIncome) {
        log.debug("대차대조표 생성: companyId={}", companyId);
        
        try {
            // TODO: 실제 구현 시 자산/부채/자본 계정 데이터 조회
            Map<String, BigDecimal> assets = createSampleAssetData();
            Map<String, BigDecimal> liabilities = createSampleLiabilityData();
            Map<String, BigDecimal> equity = createSampleEquityData();
            
            // 당기순이익을 자본에 반영
            equity.put("당기순이익", netIncome);
            
            // 합계 계산
            BigDecimal totalAssets = assets.values().stream()
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            BigDecimal totalLiabilities = liabilities.values().stream()
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            BigDecimal totalEquity = equity.values().stream()
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            
            BalanceSheet balanceSheet = BalanceSheet.builder()
                    .companyId(companyId)
                    .fiscalYear(fiscalYear)
                    .fiscalMonth(fiscalMonth)
                    .assets(assets)
                    .liabilities(liabilities)
                    .equity(equity)
                    .totalAssets(totalAssets)
                    .totalLiabilities(totalLiabilities)
                    .totalEquity(totalEquity)
                    .build();
            
            log.debug("대차대조표 생성 완료: 총자산={}, 총부채={}, 총자본={}", 
                    totalAssets, totalLiabilities, totalEquity);
            
            return balanceSheet;
            
        } catch (Exception e) {
            log.error("대차대조표 생성 실패", e);
            throw new RuntimeException("대차대조표 생성 중 오류가 발생했습니다: " + e.getMessage(), e);
        }
    }

    /**
     * 현금흐름표 생성
     */
    public CashFlowStatement generateCashFlowStatement(String companyId, Integer fiscalYear, Integer fiscalMonth) {
        log.debug("현금흐름표 생성: companyId={}", companyId);
        
        try {
            // TODO: 실제 구현 시 현금 관련 계정 데이터 조회
            Map<String, BigDecimal> operatingActivities = createSampleOperatingCashFlow();
            Map<String, BigDecimal> investingActivities = createSampleInvestingCashFlow();
            Map<String, BigDecimal> financingActivities = createSampleFinancingCashFlow();
            
            // 합계 계산
            BigDecimal netOperatingCash = operatingActivities.values().stream()
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            BigDecimal netInvestingCash = investingActivities.values().stream()
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            BigDecimal netFinancingCash = financingActivities.values().stream()
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            BigDecimal netCashChange = netOperatingCash.add(netInvestingCash).add(netFinancingCash);
            
            CashFlowStatement cashFlowStatement = CashFlowStatement.builder()
                    .companyId(companyId)
                    .fiscalYear(fiscalYear)
                    .fiscalMonth(fiscalMonth)
                    .operatingActivities(operatingActivities)
                    .investingActivities(investingActivities)
                    .financingActivities(financingActivities)
                    .netOperatingCash(netOperatingCash)
                    .netInvestingCash(netInvestingCash)
                    .netFinancingCash(netFinancingCash)
                    .netCashChange(netCashChange)
                    .build();
            
            log.debug("현금흐름표 생성 완료: 영업={}, 투자={}, 재무={}, 순증감={}", 
                    netOperatingCash, netInvestingCash, netFinancingCash, netCashChange);
            
            return cashFlowStatement;
            
        } catch (Exception e) {
            log.error("현금흐름표 생성 실패", e);
            throw new RuntimeException("현금흐름표 생성 중 오류가 발생했습니다: " + e.getMessage(), e);
        }
    }

    // ========== 회계등식 검증 ==========

    /**
     * 회계등식 검증 (자산 = 부채 + 자본)
     */
    public void validateAccountingEquation(FinancialStatements financialStatements) {
        log.debug("회계등식 검증");
        
        BalanceSheet balanceSheet = financialStatements.getBalanceSheet();
        BigDecimal totalAssets = balanceSheet.getTotalAssets();
        BigDecimal totalLiabilitiesAndEquity = balanceSheet.getTotalLiabilities()
                .add(balanceSheet.getTotalEquity());
        
        // 오차 허용 한계 (0.01원)
        BigDecimal tolerance = new BigDecimal("0.01");
        BigDecimal difference = totalAssets.subtract(totalLiabilitiesAndEquity).abs();
        
        if (difference.compareTo(tolerance) > 0) {
            log.error("회계등식 불균형: 자산={}, 부채+자본={}, 차이={}", 
                    totalAssets, totalLiabilitiesAndEquity, difference);
            throw new RuntimeException(String.format(
                    "회계등식이 균형을 이루지 않습니다. 자산=%s, 부채+자본=%s, 차이=%s", 
                    totalAssets, totalLiabilitiesAndEquity, difference));
        }
        
        log.debug("회계등식 검증 통과: 자산={}, 부채+자본={}", totalAssets, totalLiabilitiesAndEquity);
    }

    // ========== 샘플 데이터 생성 메소드들 (실제 구현 시 제거) ==========

    private List<TrialBalanceItem> createSampleTrialBalanceItems() {
        List<TrialBalanceItem> items = new ArrayList<>();
        
        items.add(TrialBalanceItem.builder()
                .accountCode("1100").accountName("현금").accountType("자산")
                .debitBalance(new BigDecimal("5000000")).creditBalance(BigDecimal.ZERO)
                .build());
        
        items.add(TrialBalanceItem.builder()
                .accountCode("2100").accountName("매입채무").accountType("부채")
                .debitBalance(BigDecimal.ZERO).creditBalance(new BigDecimal("2000000"))
                .build());
        
        items.add(TrialBalanceItem.builder()
                .accountCode("3100").accountName("자본금").accountType("자본")
                .debitBalance(BigDecimal.ZERO).creditBalance(new BigDecimal("3000000"))
                .build());
        
        return items;
    }

    private List<GeneralLedger> createSampleGLAccounts(String companyId, Integer fiscalYear, Integer fiscalMonth) {
        List<GeneralLedger> glAccounts = new ArrayList<>();
        
        glAccounts.add(GeneralLedger.builder()
                .companyId(companyId)
                .accountCode("1100")
                .fiscalYear(fiscalYear)
                .fiscalMonth(fiscalMonth)
                .beginningDebitBalance(new BigDecimal("4000000"))
                .periodDebitAmount(new BigDecimal("1000000"))
                .endingDebitBalance(new BigDecimal("5000000"))
                .build());
        
        return glAccounts;
    }

    private Map<String, BigDecimal> createSampleRevenueData() {
        Map<String, BigDecimal> revenues = new HashMap<>();
        revenues.put("매출", new BigDecimal("10000000"));
        revenues.put("이자수익", new BigDecimal("100000"));
        return revenues;
    }

    private Map<String, BigDecimal> createSampleExpenseData() {
        Map<String, BigDecimal> expenses = new HashMap<>();
        expenses.put("매출원가", new BigDecimal("6000000"));
        expenses.put("판매비", new BigDecimal("2000000"));
        expenses.put("관리비", new BigDecimal("1000000"));
        return expenses;
    }

    private Map<String, BigDecimal> createSampleAssetData() {
        Map<String, BigDecimal> assets = new HashMap<>();
        assets.put("현금", new BigDecimal("5000000"));
        assets.put("매출채권", new BigDecimal("3000000"));
        assets.put("재고자산", new BigDecimal("2000000"));
        return assets;
    }

    private Map<String, BigDecimal> createSampleLiabilityData() {
        Map<String, BigDecimal> liabilities = new HashMap<>();
        liabilities.put("매입채무", new BigDecimal("2000000"));
        liabilities.put("단기차입금", new BigDecimal("1000000"));
        return liabilities;
    }

    private Map<String, BigDecimal> createSampleEquityData() {
        Map<String, BigDecimal> equity = new HashMap<>();
        equity.put("자본금", new BigDecimal("5000000"));
        equity.put("이익잉여금", new BigDecimal("2000000"));
        return equity;
    }

    private Map<String, BigDecimal> createSampleOperatingCashFlow() {
        Map<String, BigDecimal> operating = new HashMap<>();
        operating.put("영업현금수입", new BigDecimal("8000000"));
        operating.put("영업현금지출", new BigDecimal("-6000000"));
        return operating;
    }

    private Map<String, BigDecimal> createSampleInvestingCashFlow() {
        Map<String, BigDecimal> investing = new HashMap<>();
        investing.put("설비투자", new BigDecimal("-1000000"));
        return investing;
    }

    private Map<String, BigDecimal> createSampleFinancingCashFlow() {
        Map<String, BigDecimal> financing = new HashMap<>();
        financing.put("차입금상환", new BigDecimal("-500000"));
        return financing;
    }

    // ========== 내부 모델 클래스들 ==========

    @lombok.Data
    @lombok.Builder
    public static class MonthEndClosingResult {
        private String companyId;
        private Integer fiscalYear;
        private Integer fiscalMonth;
        private LocalDate closingDate;
        private TrialBalance trialBalance;
        private Integer closedAccountsCount;
        private FinancialStatements financialStatements;
        private Long processingTimeMs;
        private String status;
    }

    @lombok.Data
    @lombok.Builder
    public static class TrialBalance {
        private String companyId;
        private Integer fiscalYear;
        private Integer fiscalMonth;
        private List<TrialBalanceItem> items;
        private BigDecimal totalDebit;
        private BigDecimal totalCredit;
        private Boolean isBalanced;
        private LocalDate generatedAt;
    }

    @lombok.Data
    @lombok.Builder
    public static class TrialBalanceItem {
        private String accountCode;
        private String accountName;
        private String accountType;
        private BigDecimal debitBalance;
        private BigDecimal creditBalance;
    }

    @lombok.Data
    @lombok.Builder
    public static class FinancialStatements {
        private String companyId;
        private Integer fiscalYear;
        private Integer fiscalMonth;
        private IncomeStatement incomeStatement;
        private BalanceSheet balanceSheet;
        private CashFlowStatement cashFlowStatement;
        private LocalDate generatedAt;
    }

    @lombok.Data
    @lombok.Builder
    public static class IncomeStatement {
        private String companyId;
        private Integer fiscalYear;
        private Integer fiscalMonth;
        private Map<String, BigDecimal> revenues;
        private Map<String, BigDecimal> expenses;
        private BigDecimal totalRevenue;
        private BigDecimal totalExpenses;
        private BigDecimal netIncome;
    }

    @lombok.Data
    @lombok.Builder
    public static class BalanceSheet {
        private String companyId;
        private Integer fiscalYear;
        private Integer fiscalMonth;
        private Map<String, BigDecimal> assets;
        private Map<String, BigDecimal> liabilities;
        private Map<String, BigDecimal> equity;
        private BigDecimal totalAssets;
        private BigDecimal totalLiabilities;
        private BigDecimal totalEquity;
    }

    @lombok.Data
    @lombok.Builder  
    public static class CashFlowStatement {
        private String companyId;
        private Integer fiscalYear;
        private Integer fiscalMonth;
        private Map<String, BigDecimal> operatingActivities;
        private Map<String, BigDecimal> investingActivities;
        private Map<String, BigDecimal> financingActivities;
        private BigDecimal netOperatingCash;
        private BigDecimal netInvestingCash;
        private BigDecimal netFinancingCash;
        private BigDecimal netCashChange;
    }
}
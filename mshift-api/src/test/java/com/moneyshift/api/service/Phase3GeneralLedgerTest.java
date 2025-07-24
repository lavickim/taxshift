package com.moneyshift.api.service;

import com.moneyshift.api.model.GeneralLedger;
import com.moneyshift.api.model.GlDetail;
import com.moneyshift.api.model.ChartOfAccount;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Phase 3 TDD: General Ledger 시스템 테스트
 * 
 * 테스트 시나리오:
 * 1. GL 계정별 잔액 관리
 * 2. 기말잔액 자동 계산
 * 3. 연누계 금액 관리
 * 4. 월말 마감 프로세스
 * 5. 차기월 이월 처리
 * 6. GL Detail 거래내역 추적
 * 7. 시산표 생성 및 균형 검증
 * 8. Running Balance 계산
 */
@SpringBootTest
@ActiveProfiles("test")
@Transactional
public class Phase3GeneralLedgerTest {

    private GeneralLedger sampleGL;
    private String companyId = "test-company";
    private Integer fiscalYear = 2025;
    private Integer fiscalMonth = 1;

    @BeforeEach
    public void setUp() {
        // 샘플 GL 생성 (현금 계정)
        sampleGL = GeneralLedger.createNew(companyId, "1100", fiscalYear, fiscalMonth);
        sampleGL.setAccountName("현금");
        
        // 기초잔액 설정
        sampleGL.setBeginningDebitBalance(new BigDecimal("1000000.00"));
        sampleGL.setBeginningCreditBalance(BigDecimal.ZERO);
    }

    @Test
    @DisplayName("Phase 3-1: GL 계정 생성 및 기본값 검증")
    public void testGLAccountCreation() {
        // When: 새로운 GL 계정 생성
        GeneralLedger newGL = GeneralLedger.createNew(companyId, "5130", 2025, 1);
        newGL.setAccountName("소모품비");
        
        // Then: 기본값 검증
        assertEquals(companyId, newGL.getCompanyId());
        assertEquals("5130", newGL.getAccountCode());
        assertEquals("소모품비", newGL.getAccountName());
        assertEquals(Integer.valueOf(2025), newGL.getFiscalYear());
        assertEquals(Integer.valueOf(1), newGL.getFiscalMonth());
        assertEquals(BigDecimal.ZERO, newGL.getBeginningDebitBalance());
        assertEquals(BigDecimal.ZERO, newGL.getBeginningCreditBalance());
        assertEquals(BigDecimal.ZERO, newGL.getPeriodDebitAmount());
        assertEquals(BigDecimal.ZERO, newGL.getPeriodCreditAmount());
        assertFalse(newGL.getIsClosed());
        assertNotNull(newGL.getCreatedAt());
    }

    @Test
    @DisplayName("Phase 3-2: 당월 발생액 추가 및 기말잔액 계산")
    public void testPeriodAmountAdditionAndEndingBalance() {
        // Given: 현금 계정 기초잔액 1,000,000원
        assertEquals(new BigDecimal("1000000.00"), sampleGL.getBeginningDebitBalance());
        
        // When: 당월 차변 500,000원, 대변 200,000원 발생
        sampleGL.addPeriodAmount(new BigDecimal("500000.00"), new BigDecimal("200000.00"));
        
        // Then: 발생액 및 기말잔액 검증
        assertEquals(new BigDecimal("500000.00"), sampleGL.getPeriodDebitAmount());
        assertEquals(new BigDecimal("200000.00"), sampleGL.getPeriodCreditAmount());
        assertEquals(new BigDecimal("1500000.00"), sampleGL.getEndingDebitBalance()); // 1,000,000 + 500,000
        assertEquals(new BigDecimal("200000.00"), sampleGL.getEndingCreditBalance());  // 0 + 200,000
    }

    @Test
    @DisplayName("Phase 3-3: 연누계 금액 계산")
    public void testYearToDateCalculation() {
        // Given: 당월 발생액 추가
        sampleGL.addPeriodAmount(new BigDecimal("300000.00"), new BigDecimal("100000.00"));
        
        // When: 연누계 업데이트
        sampleGL.updateYearToDateAmounts();
        
        // Then: 연누계 검증
        assertEquals(new BigDecimal("1300000.00"), sampleGL.getYearToDateDebit());  // 1,000,000 + 300,000
        assertEquals(new BigDecimal("100000.00"), sampleGL.getYearToDateCredit()); // 0 + 100,000
        assertNotNull(sampleGL.getUpdatedAt());
    }

    @Test
    @DisplayName("Phase 3-4: 월말 마감 프로세스")
    public void testMonthEndClosing() {
        // Given: 당월 거래 발생
        sampleGL.addPeriodAmount(new BigDecimal("800000.00"), new BigDecimal("300000.00"));
        
        // When: 월말 마감 처리
        sampleGL.closeMonth();
        
        // Then: 마감 상태 검증
        assertTrue(sampleGL.getIsClosed());
        assertNotNull(sampleGL.getClosedAt());
        assertEquals(new BigDecimal("1800000.00"), sampleGL.getEndingDebitBalance()); // 1,000,000 + 800,000
        assertEquals(new BigDecimal("300000.00"), sampleGL.getEndingCreditBalance());  // 0 + 300,000
        assertEquals(new BigDecimal("1800000.00"), sampleGL.getYearToDateDebit());
        assertEquals(new BigDecimal("300000.00"), sampleGL.getYearToDateCredit());
    }

    @Test
    @DisplayName("Phase 3-5: 차기월 이월 처리")
    public void testCarryForwardToNextMonth() {
        // Given: 1월 마감 완료
        sampleGL.addPeriodAmount(new BigDecimal("500000.00"), new BigDecimal("200000.00"));
        sampleGL.closeMonth();
        
        BigDecimal january_ending_debit = sampleGL.getEndingDebitBalance();
        BigDecimal january_ending_credit = sampleGL.getEndingCreditBalance();
        
        // When: 2월 이월 처리
        GeneralLedger februaryGL = sampleGL.carryForwardToNextMonth();
        
        // Then: 이월 잔액 검증
        assertEquals(companyId, februaryGL.getCompanyId());
        assertEquals("1100", februaryGL.getAccountCode());
        assertEquals(Integer.valueOf(2025), februaryGL.getFiscalYear());
        assertEquals(Integer.valueOf(2), februaryGL.getFiscalMonth()); // 2월
        assertEquals(january_ending_debit, februaryGL.getBeginningDebitBalance());   // 1월 기말 = 2월 기초
        assertEquals(january_ending_credit, februaryGL.getBeginningCreditBalance());
        assertEquals(BigDecimal.ZERO, februaryGL.getPeriodDebitAmount());
        assertEquals(BigDecimal.ZERO, februaryGL.getPeriodCreditAmount());
        assertFalse(februaryGL.getIsClosed());
    }

    @Test
    @DisplayName("Phase 3-6: 연말 차기년도 이월 처리")
    public void testYearEndCarryForward() {
        // Given: 12월 GL
        GeneralLedger decemberGL = GeneralLedger.createNew(companyId, "1100", 2024, 12);
        decemberGL.setBeginningDebitBalance(new BigDecimal("2000000.00"));
        decemberGL.addPeriodAmount(new BigDecimal("1000000.00"), new BigDecimal("500000.00"));
        decemberGL.closeMonth();
        
        // When: 차기년도 1월 이월
        GeneralLedger januaryNextYear = decemberGL.carryForwardToNextMonth();
        
        // Then: 차기년도 이월 검증
        assertEquals(Integer.valueOf(2025), januaryNextYear.getFiscalYear()); // 2025년
        assertEquals(Integer.valueOf(1), januaryNextYear.getFiscalMonth());   // 1월
        assertEquals(BigDecimal.ZERO, januaryNextYear.getYearToDateDebit());  // 연누계 초기화
        assertEquals(BigDecimal.ZERO, januaryNextYear.getYearToDateCredit());
    }

    @Test
    @DisplayName("Phase 3-7: GL 잔액 검증 로직")
    public void testGLBalanceValidation() {
        // Given: 정상적인 현금계정 (차변 잔액만 존재)
        sampleGL.addPeriodAmount(new BigDecimal("500000.00"), BigDecimal.ZERO);
        
        // When & Then: 잔액 검증 (차변 또는 대변 중 하나만 잔액 보유해야 함)
        assertTrue(sampleGL.isBalanceValid(), "현금계정은 차변 잔액만 있어야 정상");
        
        // Given: 비정상적인 잔액 (차변, 대변 모두 잔액 존재)
        sampleGL.setEndingDebitBalance(new BigDecimal("100000.00"));
        sampleGL.setEndingCreditBalance(new BigDecimal("50000.00"));
        
        // When & Then: 잔액 검증 실패
        assertFalse(sampleGL.isBalanceValid(), "차변, 대변 모두 잔액이 있으면 비정상");
    }

    @Test
    @DisplayName("Phase 3-8: 순 잔액 계산")
    public void testNetBalanceCalculation() {
        // Given: 차변 1,500,000원, 대변 200,000원
        sampleGL.addPeriodAmount(new BigDecimal("500000.00"), new BigDecimal("200000.00"));
        
        // When: 순 잔액 계산
        BigDecimal netBalance = sampleGL.getNetBalance();
        
        // Then: 순 잔액 검증 (차변 - 대변)
        assertEquals(new BigDecimal("1300000.00"), netBalance); // 1,500,000 - 200,000
    }

    @Test
    @DisplayName("Phase 3-9: 정상잔액 여부 확인")
    public void testNormalBalanceCheck() {
        // Given: 현금 계정 (차변 정상 계정)
        sampleGL.addPeriodAmount(new BigDecimal("500000.00"), BigDecimal.ZERO);
        
        // When & Then: 차변 정상 계정 확인
        assertTrue(sampleGL.isNormalBalance(true), "현금계정(차변정상)은 차변 잔액이 정상");
        assertFalse(sampleGL.isNormalBalance(false), "현금계정이 대변정상으로 취급되면 비정상");
        
        // Given: 매입채무 계정 시뮬레이션 (대변 정상 계정)
        GeneralLedger payableGL = GeneralLedger.createNew(companyId, "2100", 2025, 1);
        payableGL.setAccountName("매입채무");
        payableGL.addPeriodAmount(BigDecimal.ZERO, new BigDecimal("500000.00"));
        
        // When & Then: 대변 정상 계정 확인
        assertTrue(payableGL.isNormalBalance(false), "매입채무(대변정상)는 대변 잔액이 정상");
        assertFalse(payableGL.isNormalBalance(true), "매입채무가 차변정상으로 취급되면 비정상");
    }

    @Test
    @DisplayName("Phase 3-10: GL Detail 생성 및 기본 기능")
    public void testGLDetailCreation() {
        // When: GL Detail 생성 (차변)
        GlDetail debitDetail = GlDetail.createDebit(1L, 100L, new BigDecimal("50000.00"), "사무용품 구매");
        
        // Then: 차변 Detail 검증
        assertEquals(1L, debitDetail.getGeneralLedgerId());
        assertEquals(100L, debitDetail.getJournalEntryId());
        assertEquals(new BigDecimal("50000.00"), debitDetail.getDebitAmount());
        assertEquals(BigDecimal.ZERO, debitDetail.getCreditAmount());
        assertEquals("사무용품 구매", debitDetail.getDescription());
        assertTrue(debitDetail.isDebitTransaction());
        assertFalse(debitDetail.isCreditTransaction());
        assertNotNull(debitDetail.getPostingDate());
        
        // When: GL Detail 생성 (대변)
        GlDetail creditDetail = GlDetail.createCredit(1L, 100L, new BigDecimal("50000.00"), "현금 지출");
        
        // Then: 대변 Detail 검증
        assertEquals(BigDecimal.ZERO, creditDetail.getDebitAmount());
        assertEquals(new BigDecimal("50000.00"), creditDetail.getCreditAmount());
        assertFalse(creditDetail.isDebitTransaction());
        assertTrue(creditDetail.isCreditTransaction());
    }

    @Test
    @DisplayName("Phase 3-11: Running Balance 계산")
    public void testRunningBalanceCalculation() {
        // Given: 현금 계정 (차변 정상) 이전 잔액 1,000,000원
        BigDecimal previousBalance = new BigDecimal("1000000.00");
        
        // When: 차변 거래 50,000원 발생
        GlDetail debitDetail = GlDetail.createDebit(1L, 100L, new BigDecimal("50000.00"), "수입 발생");
        debitDetail.calculateRunningBalance(previousBalance, true); // 차변 정상 계정
        
        // Then: Running Balance 검증 (이전잔액 + 차변)
        assertEquals(new BigDecimal("1050000.00"), debitDetail.getRunningBalance());
        
        // When: 대변 거래 30,000원 발생
        GlDetail creditDetail = GlDetail.createCredit(1L, 101L, new BigDecimal("30000.00"), "지출 발생");
        creditDetail.calculateRunningBalance(debitDetail.getRunningBalance(), true);
        
        // Then: Running Balance 검증 (이전잔액 - 대변)
        assertEquals(new BigDecimal("1020000.00"), creditDetail.getRunningBalance());
    }

    @Test
    @DisplayName("Phase 3-12: 대변 정상 계정 Running Balance")
    public void testCreditNormalAccountRunningBalance() {
        // Given: 매출 계정 (대변 정상) 이전 잔액 500,000원
        BigDecimal previousBalance = new BigDecimal("500000.00");
        
        // When: 대변 거래 100,000원 발생 (매출 증가)
        GlDetail creditDetail = GlDetail.createCredit(2L, 200L, new BigDecimal("100000.00"), "매출 발생");
        creditDetail.calculateRunningBalance(previousBalance, false); // 대변 정상 계정
        
        // Then: Running Balance 검증 (이전잔액 + 대변)
        assertEquals(new BigDecimal("600000.00"), creditDetail.getRunningBalance());
        
        // When: 차변 거래 50,000원 발생 (매출 감소)
        GlDetail debitDetail = GlDetail.createDebit(2L, 201L, new BigDecimal("50000.00"), "매출 반품");
        debitDetail.calculateRunningBalance(creditDetail.getRunningBalance(), false);
        
        // Then: Running Balance 검증 (이전잔액 - 차변)
        assertEquals(new BigDecimal("550000.00"), debitDetail.getRunningBalance());
    }

    @Test
    @DisplayName("Phase 3-13: 시산표 균형 검증 (간단 버전)")
    public void testTrialBalanceValidation() {
        // Given: 여러 GL 계정들 생성
        List<GeneralLedger> trialBalanceAccounts = new ArrayList<>();
        
        // 현금 (차변 정상)
        GeneralLedger cashGL = GeneralLedger.createNew(companyId, "1100", 2025, 1);
        cashGL.setAccountName("현금");
        cashGL.addPeriodAmount(new BigDecimal("1000000.00"), BigDecimal.ZERO);
        trialBalanceAccounts.add(cashGL);
        
        // 매입채무 (대변 정상)
        GeneralLedger payableGL = GeneralLedger.createNew(companyId, "2100", 2025, 1);
        payableGL.setAccountName("매입채무");
        payableGL.addPeriodAmount(BigDecimal.ZERO, new BigDecimal("500000.00"));
        trialBalanceAccounts.add(payableGL);
        
        // 자본금 (대변 정상)
        GeneralLedger capitalGL = GeneralLedger.createNew(companyId, "3100", 2025, 1);
        capitalGL.setAccountName("자본금");
        capitalGL.addPeriodAmount(BigDecimal.ZERO, new BigDecimal("500000.00"));
        trialBalanceAccounts.add(capitalGL);
        
        // When: 시산표 합계 계산
        BigDecimal totalDebit = trialBalanceAccounts.stream()
                .map(GeneralLedger::getEndingDebitBalance)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
                
        BigDecimal totalCredit = trialBalanceAccounts.stream()
                .map(GeneralLedger::getEndingCreditBalance)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        // Then: 차변 = 대변 균형 검증
        assertEquals(totalDebit, totalCredit, "시산표 차변과 대변이 균형을 이루어야 함");
        assertEquals(new BigDecimal("1000000.00"), totalDebit);
        assertEquals(new BigDecimal("1000000.00"), totalCredit);
    }

    @Test
    @DisplayName("Phase 3-14: GL Detail 순 금액 계산")
    public void testGLDetailNetAmount() {
        // Given: 복합 GL Detail (차변과 대변 모두 있는 경우는 없지만 테스트용)
        GlDetail mixedDetail = GlDetail.create(1L, 100L, 
                new BigDecimal("100000.00"), new BigDecimal("30000.00"), "혼합 거래");
        
        // When: 순 금액 계산
        BigDecimal netAmount = mixedDetail.getNetAmount();
        
        // Then: 순 금액 검증 (차변 - 대변)
        assertEquals(new BigDecimal("70000.00"), netAmount);
    }

    @Test
    @DisplayName("Phase 3-15: 복수월 GL 관리")
    public void testMultiMonthGLManagement() {
        // Given: 1월 GL
        GeneralLedger januaryGL = GeneralLedger.createNew(companyId, "1100", 2025, 1);
        januaryGL.setBeginningDebitBalance(new BigDecimal("1000000.00"));
        januaryGL.addPeriodAmount(new BigDecimal("500000.00"), new BigDecimal("100000.00"));
        januaryGL.closeMonth();
        
        // When: 2월 GL 이월
        GeneralLedger februaryGL = januaryGL.carryForwardToNextMonth();
        februaryGL.addPeriodAmount(new BigDecimal("300000.00"), new BigDecimal("50000.00"));
        
        // When: 3월 GL 이월
        februaryGL.closeMonth();
        GeneralLedger marchGL = februaryGL.carryForwardToNextMonth();
        
        // Then: 각월별 잔액 추적 검증
        // 1월: 기초 1,000,000 + 차변 500,000 - 대변 100,000 = 1,400,000 (차변) + 100,000 (대변)
        assertEquals(new BigDecimal("1500000.00"), januaryGL.getEndingDebitBalance());  // 1월 기말 차변
        assertEquals(new BigDecimal("100000.00"), januaryGL.getEndingCreditBalance());  // 1월 기말 대변
        assertEquals(new BigDecimal("1500000.00"), februaryGL.getBeginningDebitBalance()); // 2월 기초 차변
        assertEquals(new BigDecimal("100000.00"), februaryGL.getBeginningCreditBalance()); // 2월 기초 대변
        // 2월: 기초 1,500,000(차변) + 100,000(대변) + 차변 300,000 + 대변 50,000 = 1,800,000(차변) + 150,000(대변)
        assertEquals(new BigDecimal("1800000.00"), februaryGL.getEndingDebitBalance());  // 2월 기말 차변
        assertEquals(new BigDecimal("150000.00"), februaryGL.getEndingCreditBalance());  // 2월 기말 대변
        assertEquals(new BigDecimal("1800000.00"), marchGL.getBeginningDebitBalance());  // 3월 기초 차변
        assertEquals(new BigDecimal("150000.00"), marchGL.getBeginningCreditBalance());  // 3월 기초 대변
        
        // 각월 마감 상태 확인
        assertTrue(januaryGL.getIsClosed());
        assertTrue(februaryGL.getIsClosed());
        assertFalse(marchGL.getIsClosed());
    }
}
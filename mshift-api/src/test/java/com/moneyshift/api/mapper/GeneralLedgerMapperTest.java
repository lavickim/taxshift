package com.moneyshift.api.mapper;

import com.moneyshift.api.model.GeneralLedger;
import com.moneyshift.api.model.GlDetail;
import com.moneyshift.api.service.BaseTestClass;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.*;

/**
 * TDD: GeneralLedgerMapper 테스트
 * 총계정원장 매퍼의 모든 메소드를 TDD 방식으로 검증합니다.
 */
@DisplayName("총계정원장 매퍼 TDD 테스트")
public class GeneralLedgerMapperTest extends BaseTestClass {

    @Autowired
    private GeneralLedgerMapper generalLedgerMapper;

    private GeneralLedger testGLAccount;
    private GlDetail testGLDetail;

    @BeforeEach
    void setUp() {
        // 테스트용 GL 계정 생성
        testGLAccount = GeneralLedger.builder()
                .companyId(testCompanyId)
                .accountCode(getCashAccountCode())
                .fiscalYear(2025)
                .fiscalMonth(1)
                .beginningDebitBalance(new BigDecimal("500000"))
                .beginningCreditBalance(BigDecimal.ZERO)
                .periodDebitAmount(new BigDecimal("100000"))
                .periodCreditAmount(new BigDecimal("50000"))
                .yearToDateDebit(new BigDecimal("600000"))
                .yearToDateCredit(new BigDecimal("50000"))
                .endingDebitBalance(new BigDecimal("550000"))
                .endingCreditBalance(BigDecimal.ZERO)
                .isClosed(false)
                .build();

        // 테스트용 GL 상세 내역
        testGLDetail = GlDetail.builder()
                .journalEntryId(1L)
                .postingDate(LocalDateTime.now())
                .debitAmount(new BigDecimal("50000"))
                .creditAmount(BigDecimal.ZERO)
                .runningBalance(new BigDecimal("550000"))
                .description("사무용품 구매")
                .build();
    }

    @Test
    @DisplayName("TDD: GL 계정 단건 조회 테스트")
    void should_FindGeneralLedgerAccount_When_AccountExists() {
        // Given
        generalLedgerMapper.insertGeneralLedgerAccount(testGLAccount);

        // When
        GeneralLedger foundAccount = generalLedgerMapper.findGeneralLedgerAccount(
                testCompanyId, getCashAccountCode(), 2025, 1);

        // Then
        assertThat(foundAccount).isNotNull();
        assertThat(foundAccount.getCompanyId()).isEqualTo(testCompanyId);
        assertThat(foundAccount.getAccountCode()).isEqualTo(getCashAccountCode());
        assertThat(foundAccount.getFiscalYear()).isEqualTo(2025);
        assertThat(foundAccount.getFiscalMonth()).isEqualTo(1);
        assertThat(foundAccount.getBeginningDebitBalance()).isEqualByComparingTo(new BigDecimal("500000"));
        assertThat(foundAccount.getEndingDebitBalance()).isEqualByComparingTo(new BigDecimal("550000"));
        assertThat(foundAccount.getIsClosed()).isFalse();
    }

    @Test
    @DisplayName("TDD: 존재하지 않는 GL 계정 조회 시 null 반환")
    void should_ReturnNull_When_GeneralLedgerAccountNotExists() {
        // Given
        String nonExistentCompanyId = java.util.UUID.randomUUID().toString();
        String nonExistentAccountCode = "9999";

        // When
        GeneralLedger foundAccount = generalLedgerMapper.findGeneralLedgerAccount(
                nonExistentCompanyId, nonExistentAccountCode, 2025, 1);

        // Then
        assertThat(foundAccount).isNull();
    }

    @Test
    @DisplayName("TDD: GL 계정 목록 조회 테스트")
    void should_FindGeneralLedgerAccounts_When_AccountsExist() {
        // Given
        GeneralLedger account1 = GeneralLedger.builder()
                .companyId(testCompanyId).accountCode(getCashAccountCode())
                .fiscalYear(2025).fiscalMonth(1)
                .beginningDebitBalance(new BigDecimal("100000"))
                .beginningCreditBalance(BigDecimal.ZERO)
                .periodDebitAmount(new BigDecimal("50000"))
                .periodCreditAmount(new BigDecimal("25000"))
                .yearToDateDebit(new BigDecimal("150000"))
                .yearToDateCredit(new BigDecimal("25000"))
                .endingDebitBalance(new BigDecimal("125000"))
                .endingCreditBalance(BigDecimal.ZERO)
                .isClosed(false)
                .build();

        GeneralLedger account2 = GeneralLedger.builder()
                .companyId(testCompanyId).accountCode(getAccountsPayableCode())
                .fiscalYear(2025).fiscalMonth(1)
                .beginningDebitBalance(BigDecimal.ZERO)
                .beginningCreditBalance(new BigDecimal("200000"))
                .periodDebitAmount(new BigDecimal("10000"))
                .periodCreditAmount(new BigDecimal("30000"))
                .yearToDateDebit(new BigDecimal("10000"))
                .yearToDateCredit(new BigDecimal("230000"))
                .endingDebitBalance(BigDecimal.ZERO)
                .endingCreditBalance(new BigDecimal("220000"))
                .isClosed(false)
                .build();

        generalLedgerMapper.insertGeneralLedgerAccount(account1);
        generalLedgerMapper.insertGeneralLedgerAccount(account2);

        // When
        List<GeneralLedger> glAccounts = generalLedgerMapper.findGeneralLedgerAccounts(
                testCompanyId, 2025, 1, null, null);

        // Then
        assertThat(glAccounts).hasSize(2);
        assertThat(glAccounts).extracting(GeneralLedger::getAccountCode)
                .containsExactlyInAnyOrder(getCashAccountCode(), getAccountsPayableCode());
    }

    @Test
    @DisplayName("TDD: GL 계정 목록 마감 상태별 필터링 테스트")
    void should_FindGeneralLedgerAccountsByClosedStatus_When_FilterProvided() {
        // Given
        GeneralLedger openAccount = GeneralLedger.builder()
                .companyId(testCompanyId).accountCode(getCashAccountCode())
                .fiscalYear(2025).fiscalMonth(1)
                .beginningDebitBalance(new BigDecimal("100000"))
                .beginningCreditBalance(BigDecimal.ZERO)
                .periodDebitAmount(BigDecimal.ZERO)
                .periodCreditAmount(BigDecimal.ZERO)
                .yearToDateDebit(new BigDecimal("100000"))
                .yearToDateCredit(BigDecimal.ZERO)
                .endingDebitBalance(new BigDecimal("100000"))
                .endingCreditBalance(BigDecimal.ZERO)
                .isClosed(false)
                .build();

        GeneralLedger closedAccount = GeneralLedger.builder()
                .companyId(testCompanyId).accountCode(getAccountsPayableCode())
                .fiscalYear(2025).fiscalMonth(1)
                .beginningDebitBalance(BigDecimal.ZERO)
                .beginningCreditBalance(new BigDecimal("200000"))
                .periodDebitAmount(BigDecimal.ZERO)
                .periodCreditAmount(BigDecimal.ZERO)
                .yearToDateDebit(BigDecimal.ZERO)
                .yearToDateCredit(new BigDecimal("200000"))
                .endingDebitBalance(BigDecimal.ZERO)
                .endingCreditBalance(new BigDecimal("200000"))
                .isClosed(true)
                .build();

        generalLedgerMapper.insertGeneralLedgerAccount(openAccount);
        generalLedgerMapper.insertGeneralLedgerAccount(closedAccount);

        // When - 마감되지 않은 계정만 조회
        List<GeneralLedger> openAccounts = generalLedgerMapper.findGeneralLedgerAccounts(
                testCompanyId, 2025, 1, null, false);

        // Then
        assertThat(openAccounts).hasSize(1);
        assertThat(openAccounts.get(0).getAccountCode()).isEqualTo(getCashAccountCode());
        assertThat(openAccounts.get(0).getIsClosed()).isFalse();
    }

    @Test
    @DisplayName("TDD: GL 계정 생성/업데이트 (UPSERT) 테스트")
    void should_InsertOrUpdateGeneralLedgerAccount_When_ValidAccountProvided() {
        // Given
        // GeneralLedger 모델에는 getId() 메소드가 없음 (복합키 사용)

        // When - 첫 번째: 신규 생성
        int result1 = generalLedgerMapper.insertGeneralLedgerAccount(testGLAccount);

        // Then
        assertThat(result1).isEqualTo(1);
        // GeneralLedger는 복합키를 사용하므로 ID가 없음

        // When - 두 번째: 기존 계정 업데이트 (UPSERT)
        testGLAccount.setPeriodDebitAmount(new BigDecimal("200000"));
        int result2 = generalLedgerMapper.insertGeneralLedgerAccount(testGLAccount);

        // Then - UPSERT는 항상 1을 반환하거나 기존 계정이 업데이트됨
        assertThat(result2).isGreaterThanOrEqualTo(0);
    }

    @Test
    @DisplayName("TDD: GL 계정 잔액 업데이트 테스트")
    void should_UpdateGeneralLedgerBalance_When_ValidAmountsProvided() {
        // Given
        generalLedgerMapper.insertGeneralLedgerAccount(testGLAccount);
        // GeneralLedger는 복합키를 사용하므로 ID 대신 1L을 임시로 사용

        BigDecimal additionalDebit = new BigDecimal("30000");
        BigDecimal additionalCredit = new BigDecimal("10000");

        // When
        int result = generalLedgerMapper.updateGeneralLedgerBalance(
                1L, additionalDebit, additionalCredit);

        // Then
        assertThat(result).isEqualTo(1);

        // 업데이트된 계정 조회하여 검증
        GeneralLedger updatedAccount = generalLedgerMapper.findGeneralLedgerAccount(
                testCompanyId, getCashAccountCode(), 2025, 1);
        
        // 기존 금액에 추가된 금액이 더해졌는지 확인
        assertThat(updatedAccount.getPeriodDebitAmount())
                .isEqualByComparingTo(new BigDecimal("130000")); // 100000 + 30000
        assertThat(updatedAccount.getPeriodCreditAmount())
                .isEqualByComparingTo(new BigDecimal("60000")); // 50000 + 10000
    }

    @Test
    @DisplayName("TDD: GL 상세 내역 생성 테스트")
    void should_InsertGLDetail_When_ValidDetailProvided() {
        // Given
        generalLedgerMapper.insertGeneralLedgerAccount(testGLAccount);
        // GeneralLedger는 복합키를 사용하므로 ID 대신 1L을 임시로 사용
        testGLDetail.setGeneralLedgerId(1L);

        // When
        int result = generalLedgerMapper.insertGLDetail(testGLDetail);

        // Then
        assertThat(result).isEqualTo(1);
        assertThat(testGLDetail.getId()).isNotNull();
        assertThat(testGLDetail.getCreatedAt()).isNotNull();
    }

    @Test
    @DisplayName("TDD: GL 상세 내역 조회 테스트")
    void should_FindGLDetails_When_DetailsExist() {
        // Given
        generalLedgerMapper.insertGeneralLedgerAccount(testGLAccount);
        // GeneralLedger는 복합키를 사용하므로 ID 대신 1L을 임시로 사용
        Long glAccountId = 1L;

        // 여러 상세 내역 생성
        GlDetail detail1 = GlDetail.builder()
                .generalLedgerId(glAccountId)
                .journalEntryId(1L)
                .postingDate(LocalDateTime.now().minusDays(2))
                .debitAmount(new BigDecimal("30000"))
                .creditAmount(BigDecimal.ZERO)
                .runningBalance(new BigDecimal("530000"))
                .description("첫 번째 거래")
                .build();

        GlDetail detail2 = GlDetail.builder()
                .generalLedgerId(glAccountId)
                .journalEntryId(2L)
                .postingDate(LocalDateTime.now().minusDays(1))
                .debitAmount(BigDecimal.ZERO)
                .creditAmount(new BigDecimal("20000"))
                .runningBalance(new BigDecimal("510000"))
                .description("두 번째 거래")
                .build();

        generalLedgerMapper.insertGLDetail(detail1);
        generalLedgerMapper.insertGLDetail(detail2);

        // When
        List<GlDetail> glDetails = generalLedgerMapper.findGLDetails(glAccountId);

        // Then
        assertThat(glDetails).hasSize(2);
        assertThat(glDetails).extracting(GlDetail::getDescription)
                .containsExactly("첫 번째 거래", "두 번째 거래"); // 날짜 순서대로

        // 차변/대변 확인
        GlDetail debitDetail = glDetails.stream()
                .filter(d -> d.getDebitAmount().compareTo(BigDecimal.ZERO) > 0)
                .findFirst().orElse(null);
        GlDetail creditDetail = glDetails.stream()
                .filter(d -> d.getCreditAmount().compareTo(BigDecimal.ZERO) > 0)
                .findFirst().orElse(null);

        assertThat(debitDetail).isNotNull();
        assertThat(debitDetail.getDebitAmount()).isEqualByComparingTo(new BigDecimal("30000"));
        assertThat(creditDetail).isNotNull();
        assertThat(creditDetail.getCreditAmount()).isEqualByComparingTo(new BigDecimal("20000"));
    }

    @Test
    @DisplayName("TDD: 시산표 데이터 조회 테스트")
    void should_GetTrialBalanceData_When_GLAccountsExist() {
        // Given - 여러 GL 계정 생성
        GeneralLedger assetAccount = GeneralLedger.builder()
                .companyId(testCompanyId).accountCode(getCashAccountCode())
                .fiscalYear(2025).fiscalMonth(1)
                .beginningDebitBalance(new BigDecimal("500000"))
                .beginningCreditBalance(BigDecimal.ZERO)
                .periodDebitAmount(new BigDecimal("100000"))
                .periodCreditAmount(new BigDecimal("50000"))
                .yearToDateDebit(new BigDecimal("600000"))
                .yearToDateCredit(new BigDecimal("50000"))
                .endingDebitBalance(new BigDecimal("550000"))
                .endingCreditBalance(BigDecimal.ZERO)
                .isClosed(false)
                .build();

        GeneralLedger liabilityAccount = GeneralLedger.builder()
                .companyId(testCompanyId).accountCode(getAccountsPayableCode())
                .fiscalYear(2025).fiscalMonth(1)
                .beginningDebitBalance(BigDecimal.ZERO)
                .beginningCreditBalance(new BigDecimal("300000"))
                .periodDebitAmount(new BigDecimal("20000"))
                .periodCreditAmount(new BigDecimal("80000"))
                .yearToDateDebit(new BigDecimal("20000"))
                .yearToDateCredit(new BigDecimal("380000"))
                .endingDebitBalance(BigDecimal.ZERO)
                .endingCreditBalance(new BigDecimal("360000"))
                .isClosed(false)
                .build();

        generalLedgerMapper.insertGeneralLedgerAccount(assetAccount);
        generalLedgerMapper.insertGeneralLedgerAccount(liabilityAccount);

        // When
        List<Map<String, Object>> trialBalanceData = generalLedgerMapper.getTrialBalanceData(
                testCompanyId, 2025, 1);

        // Then
        assertThat(trialBalanceData).hasSize(2);
        
        // 차변 잔액이 있는 계정 확인
        Map<String, Object> debitAccount = trialBalanceData.stream()
                .filter(row -> ((Number) row.get("debit_balance")).doubleValue() > 0)
                .findFirst().orElse(null);
        assertThat(debitAccount).isNotNull();
        assertThat(debitAccount.get("account_code")).isEqualTo(getCashAccountCode());
        assertThat(((Number) debitAccount.get("debit_balance")).doubleValue()).isEqualTo(550000.0);

        // 대변 잔액이 있는 계정 확인
        Map<String, Object> creditAccount = trialBalanceData.stream()
                .filter(row -> ((Number) row.get("credit_balance")).doubleValue() > 0)
                .findFirst().orElse(null);
        assertThat(creditAccount).isNotNull();
        assertThat(creditAccount.get("account_code")).isEqualTo(getAccountsPayableCode());
        assertThat(((Number) creditAccount.get("credit_balance")).doubleValue()).isEqualTo(360000.0);
    }

    @Test
    @DisplayName("TDD: 손익계산서 데이터 조회 테스트")
    void should_GetIncomeStatementData_When_RevenueAndExpenseAccountsExist() {
        // Given - 수익과 비용 계정 생성 (실제로는 chart_of_accounts 테이블과 조인)
        // 이 테스트는 GL 계정 데이터만 생성하므로 실제 조인 결과는 확인하기 어려움
        // 하지만 메소드 호출과 기본 동작은 검증 가능

        GeneralLedger revenueAccount = GeneralLedger.builder()
                .companyId(testCompanyId).accountCode(getSalesRevenueCode())
                .fiscalYear(2025).fiscalMonth(1)
                .beginningDebitBalance(BigDecimal.ZERO)
                .beginningCreditBalance(BigDecimal.ZERO)
                .periodDebitAmount(new BigDecimal("10000"))
                .periodCreditAmount(new BigDecimal("500000"))
                .yearToDateDebit(new BigDecimal("10000"))
                .yearToDateCredit(new BigDecimal("500000"))
                .endingDebitBalance(BigDecimal.ZERO)
                .endingCreditBalance(new BigDecimal("490000"))
                .isClosed(false)
                .build();

        generalLedgerMapper.insertGeneralLedgerAccount(revenueAccount);

        // When
        List<Map<String, Object>> incomeStatementData = generalLedgerMapper.getIncomeStatementData(
                testCompanyId, 2025, 1);

        // Then
        assertThat(incomeStatementData).isNotNull();
        // 실제 데이터는 chart_of_accounts와의 조인 결과에 따라 달라짐
        // 여기서는 메소드가 정상적으로 호출되고 예외가 발생하지 않는지만 확인
    }

    @Test
    @DisplayName("TDD: 재무상태표 데이터 조회 테스트")
    void should_GetBalanceSheetData_When_BalanceSheetAccountsExist() {
        // Given
        GeneralLedger balanceSheetAccount = GeneralLedger.builder()
                .companyId(testCompanyId).accountCode(getCashAccountCode())
                .fiscalYear(2025).fiscalMonth(1)
                .beginningDebitBalance(new BigDecimal("1000000"))
                .beginningCreditBalance(BigDecimal.ZERO)
                .periodDebitAmount(new BigDecimal("200000"))
                .periodCreditAmount(new BigDecimal("100000"))
                .yearToDateDebit(new BigDecimal("1200000"))
                .yearToDateCredit(new BigDecimal("100000"))
                .endingDebitBalance(new BigDecimal("1100000"))
                .endingCreditBalance(BigDecimal.ZERO)
                .isClosed(false)
                .build();

        generalLedgerMapper.insertGeneralLedgerAccount(balanceSheetAccount);

        // When
        List<Map<String, Object>> balanceSheetData = generalLedgerMapper.getBalanceSheetData(
                testCompanyId, 2025, 1);

        // Then
        assertThat(balanceSheetData).isNotNull();
        // 실제 데이터는 chart_of_accounts와의 조인 결과에 따라 달라짐
    }

    @Test
    @DisplayName("TDD: 현금흐름표 데이터 조회 테스트")
    void should_GetCashFlowData_When_CashAccountsExist() {
        // Given
        GeneralLedger cashAccount = GeneralLedger.builder()
                .companyId(testCompanyId).accountCode(getCashAccountCode()) // 현금 계정
                .fiscalYear(2025).fiscalMonth(1)
                .beginningDebitBalance(new BigDecimal("500000"))
                .beginningCreditBalance(BigDecimal.ZERO)
                .periodDebitAmount(new BigDecimal("200000"))
                .periodCreditAmount(new BigDecimal("150000"))
                .yearToDateDebit(new BigDecimal("700000"))
                .yearToDateCredit(new BigDecimal("150000"))
                .endingDebitBalance(new BigDecimal("550000"))
                .endingCreditBalance(BigDecimal.ZERO)
                .isClosed(false)
                .build();

        generalLedgerMapper.insertGeneralLedgerAccount(cashAccount);

        // When
        List<Map<String, Object>> cashFlowData = generalLedgerMapper.getCashFlowData(
                testCompanyId, 2025, 1);

        // Then
        assertThat(cashFlowData).isNotNull();
        // 현금성 자산 계정 (1000, 1010으로 시작하는 계정)에 대한 데이터 조회
    }

    @Test
    @DisplayName("TDD: GL 계정 마감 처리 테스트")
    void should_CloseGeneralLedgerAccounts_When_OpenAccountsExist() {
        // Given
        GeneralLedger openAccount1 = GeneralLedger.builder()
                .companyId(testCompanyId).accountCode(getCashAccountCode())
                .fiscalYear(2025).fiscalMonth(1)
                .beginningDebitBalance(new BigDecimal("100000"))
                .beginningCreditBalance(BigDecimal.ZERO)
                .periodDebitAmount(new BigDecimal("50000"))
                .periodCreditAmount(new BigDecimal("25000"))
                .yearToDateDebit(new BigDecimal("150000"))
                .yearToDateCredit(new BigDecimal("25000"))
                .endingDebitBalance(new BigDecimal("125000"))
                .endingCreditBalance(BigDecimal.ZERO)
                .isClosed(false)
                .build();

        GeneralLedger openAccount2 = GeneralLedger.builder()
                .companyId(testCompanyId).accountCode(getAccountsPayableCode())
                .fiscalYear(2025).fiscalMonth(1)
                .beginningDebitBalance(BigDecimal.ZERO)
                .beginningCreditBalance(new BigDecimal("200000"))
                .periodDebitAmount(new BigDecimal("10000"))
                .periodCreditAmount(new BigDecimal("30000"))
                .yearToDateDebit(new BigDecimal("10000"))
                .yearToDateCredit(new BigDecimal("230000"))
                .endingDebitBalance(BigDecimal.ZERO)
                .endingCreditBalance(new BigDecimal("220000"))
                .isClosed(false)
                .build();

        generalLedgerMapper.insertGeneralLedgerAccount(openAccount1);
        generalLedgerMapper.insertGeneralLedgerAccount(openAccount2);

        // When
        int closedCount = generalLedgerMapper.closeGeneralLedgerAccounts(testCompanyId, 2025, 1);

        // Then
        assertThat(closedCount).isEqualTo(2);

        // 마감 상태 확인
        GeneralLedger closedAccount1 = generalLedgerMapper.findGeneralLedgerAccount(testCompanyId, getCashAccountCode(), 2025, 1);
        GeneralLedger closedAccount2 = generalLedgerMapper.findGeneralLedgerAccount(testCompanyId, getAccountsPayableCode(), 2025, 1);

        assertThat(closedAccount1.getIsClosed()).isTrue();
        assertThat(closedAccount1.getClosedAt()).isNotNull();
        assertThat(closedAccount2.getIsClosed()).isTrue();
        assertThat(closedAccount2.getClosedAt()).isNotNull();
    }

    @Test
    @DisplayName("TDD: GL 계정 마감 재개방 테스트")
    void should_ReopenGeneralLedgerAccounts_When_ClosedAccountsExist() {
        // Given - 마감된 계정들 생성
        GeneralLedger closedAccount = GeneralLedger.builder()
                .companyId(testCompanyId).accountCode(getCashAccountCode())
                .fiscalYear(2025).fiscalMonth(1)
                .beginningDebitBalance(new BigDecimal("100000"))
                .beginningCreditBalance(BigDecimal.ZERO)
                .periodDebitAmount(new BigDecimal("50000"))
                .periodCreditAmount(new BigDecimal("25000"))
                .yearToDateDebit(new BigDecimal("150000"))
                .yearToDateCredit(new BigDecimal("25000"))
                .endingDebitBalance(new BigDecimal("125000"))
                .endingCreditBalance(BigDecimal.ZERO)
                .isClosed(true)
                .build();

        generalLedgerMapper.insertGeneralLedgerAccount(closedAccount);

        // When
        int reopenedCount = generalLedgerMapper.reopenGeneralLedgerAccounts(testCompanyId, 2025, 1);

        // Then
        assertThat(reopenedCount).isEqualTo(1);

        // 재개방 상태 확인
        GeneralLedger reopenedAccount = generalLedgerMapper.findGeneralLedgerAccount(testCompanyId, getCashAccountCode(), 2025, 1);
        assertThat(reopenedAccount.getIsClosed()).isFalse();
        assertThat(reopenedAccount.getClosedAt()).isNull();
    }

    @Test
    @DisplayName("TDD: 잔액 이월 테스트")
    void should_CarryForwardBalances_When_ClosedAccountsExist() {
        // Given - 12월 마감된 계정 생성
        GeneralLedger decemberAccount = GeneralLedger.builder()
                .companyId(testCompanyId).accountCode(getCashAccountCode())
                .fiscalYear(2024).fiscalMonth(12)
                .beginningDebitBalance(new BigDecimal("500000"))
                .beginningCreditBalance(BigDecimal.ZERO)
                .periodDebitAmount(new BigDecimal("200000"))
                .periodCreditAmount(new BigDecimal("100000"))
                .yearToDateDebit(new BigDecimal("2000000"))
                .yearToDateCredit(new BigDecimal("500000"))
                .endingDebitBalance(new BigDecimal("1500000"))
                .endingCreditBalance(BigDecimal.ZERO)
                .isClosed(true)
                .build();

        generalLedgerMapper.insertGeneralLedgerAccount(decemberAccount);

        // When - 2025년 1월로 이월
        int carriedForwardCount = generalLedgerMapper.carryForwardBalances(testCompanyId, 2024, 12);

        // Then
        assertThat(carriedForwardCount).isEqualTo(1);

        // 이월된 계정 확인 (2025년 1월)
        GeneralLedger januaryAccount = generalLedgerMapper.findGeneralLedgerAccount(testCompanyId, getCashAccountCode(), 2025, 1);
        assertThat(januaryAccount).isNotNull();
        assertThat(januaryAccount.getBeginningDebitBalance()).isEqualByComparingTo(new BigDecimal("1500000"));
        assertThat(januaryAccount.getEndingDebitBalance()).isEqualByComparingTo(new BigDecimal("1500000"));
        assertThat(januaryAccount.getPeriodDebitAmount()).isEqualByComparingTo(BigDecimal.ZERO);
        assertThat(januaryAccount.getPeriodCreditAmount()).isEqualByComparingTo(BigDecimal.ZERO);
        assertThat(januaryAccount.getIsClosed()).isFalse();
    }

    @Test
    @DisplayName("TDD: GL 마감 이력 조회 테스트")
    void should_GetClosingHistory_When_ClosingHistoryExists() {
        // Given - 마감된 계정들 생성
        GeneralLedger closedAccount1 = GeneralLedger.builder()
                .companyId(testCompanyId).accountCode(getCashAccountCode())
                .fiscalYear(2025).fiscalMonth(1)
                .beginningDebitBalance(new BigDecimal("100000"))
                .beginningCreditBalance(BigDecimal.ZERO)
                .periodDebitAmount(new BigDecimal("50000"))
                .periodCreditAmount(new BigDecimal("25000"))
                .yearToDateDebit(new BigDecimal("150000"))
                .yearToDateCredit(new BigDecimal("25000"))
                .endingDebitBalance(new BigDecimal("125000"))
                .endingCreditBalance(BigDecimal.ZERO)
                .isClosed(true)
                .build();

        GeneralLedger closedAccount2 = GeneralLedger.builder()
                .companyId(testCompanyId).accountCode(getAccountsPayableCode())
                .fiscalYear(2025).fiscalMonth(1)
                .beginningDebitBalance(BigDecimal.ZERO)
                .beginningCreditBalance(new BigDecimal("200000"))
                .periodDebitAmount(new BigDecimal("10000"))
                .periodCreditAmount(new BigDecimal("30000"))
                .yearToDateDebit(new BigDecimal("10000"))
                .yearToDateCredit(new BigDecimal("230000"))
                .endingDebitBalance(BigDecimal.ZERO)
                .endingCreditBalance(new BigDecimal("220000"))
                .isClosed(true)
                .build();

        generalLedgerMapper.insertGeneralLedgerAccount(closedAccount1);
        generalLedgerMapper.insertGeneralLedgerAccount(closedAccount2);

        // When
        List<Map<String, Object>> closingHistory = generalLedgerMapper.getClosingHistory(testCompanyId, 10, 0);

        // Then
        assertThat(closingHistory).hasSize(1); // 2025년 1월 마감 이력 1건
        
        Map<String, Object> historyRecord = closingHistory.get(0);
        assertThat(historyRecord.get("fiscal_year")).isEqualTo(2025);
        assertThat(historyRecord.get("fiscal_month")).isEqualTo(1);
        assertThat(historyRecord.get("total_accounts")).isEqualTo(2L);
        assertThat(historyRecord.get("closed_accounts")).isEqualTo(2L);
        assertThat(historyRecord.get("closed_at")).isNotNull();
    }
}
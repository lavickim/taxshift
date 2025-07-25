package com.moneyshift.api.mapper;

import com.moneyshift.api.model.ChartOfAccount;
import com.moneyshift.api.service.BaseTestClass;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.*;

/**
 * TDD: ChartOfAccountsMapper 테스트
 * MyBatis 매퍼의 모든 메소드를 TDD 방식으로 검증합니다.
 */
@DisplayName("계정과목 매퍼 TDD 테스트")
public class ChartOfAccountsMapperTest extends BaseTestClass {

    @Autowired
    private ChartOfAccountsMapper chartOfAccountsMapper;

    private ChartOfAccount testAccount;

    @BeforeEach
    void setUp() {
        // 테스트용 계정과목 생성
        testAccount = ChartOfAccount.builder()
                .accountCode(getCashAccountCode())
                .accountName("현금")
                .accountType("자산")
                .accountSubtype("유동자산")
                .isDebitNormal(true)
                .isActive(true)
                .displayOrder(1)
                .build();
    }

    @Test
    @DisplayName("TDD: 계정과목 생성 테스트")
    void should_InsertAccount_When_ValidAccountProvided() {
        // Given
        assertThat(testAccount.getId()).isNull();

        // When
        int result = chartOfAccountsMapper.insertAccount(testAccount);

        // Then
        assertThat(result).isEqualTo(1);
        assertThat(testAccount.getId()).isNotNull();
        assertThat(testAccount.getCreatedAt()).isNotNull();
    }

    @Test
    @DisplayName("TDD: 계정과목 코드로 조회 테스트")
    void should_FindAccountByCode_When_AccountExists() {
        // Given
        chartOfAccountsMapper.insertAccount(testAccount);
        String accountCode = testAccount.getAccountCode();

        // When
        ChartOfAccount foundAccount = chartOfAccountsMapper.findAccountByCode(accountCode);

        // Then
        assertThat(foundAccount).isNotNull();
        assertThat(foundAccount.getAccountCode()).isEqualTo(accountCode);
        assertThat(foundAccount.getAccountName()).isEqualTo("현금");
        assertThat(foundAccount.getAccountType()).isEqualTo("자산");
        assertThat(foundAccount.getIsDebitNormal()).isTrue();
    }

    @Test
    @DisplayName("TDD: 존재하지 않는 계정과목 코드로 조회 시 null 반환")
    void should_ReturnNull_When_AccountCodeNotExists() {
        // Given
        String nonExistentCode = "9999";

        // When
        ChartOfAccount foundAccount = chartOfAccountsMapper.findAccountByCode(nonExistentCode);

        // Then
        assertThat(foundAccount).isNull();
    }

    @Test
    @DisplayName("TDD: 계정과목 ID로 조회 테스트")
    void should_FindAccountById_When_AccountExists() {
        // Given
        chartOfAccountsMapper.insertAccount(testAccount);
        Integer accountId = testAccount.getId();

        // When
        ChartOfAccount foundAccount = chartOfAccountsMapper.findAccountById(accountId.longValue());

        // Then
        assertThat(foundAccount).isNotNull();
        assertThat(foundAccount.getId()).isEqualTo(accountId);
        assertThat(foundAccount.getAccountCode()).isEqualTo(getCashAccountCode());
    }

    @Test
    @DisplayName("TDD: 전체 활성 계정과목 조회 테스트")
    void should_FindAllActiveAccounts_When_ActiveAccountsExist() {
        // Given
        ChartOfAccount account1 = ChartOfAccount.builder()
                .accountCode(getCashAccountCode()).accountName("현금").accountType("자산")
                .isDebitNormal(true).isActive(true).displayOrder(1).build();
        
        ChartOfAccount account2 = ChartOfAccount.builder()
                .accountCode(getAccountsPayableCode()).accountName("외상매입금").accountType("부채")
                .isDebitNormal(false).isActive(true).displayOrder(2).build();

        ChartOfAccount inactiveAccount = ChartOfAccount.builder()
                .accountCode(getCapitalStockCode()).accountName("비활성계정").accountType("자본")
                .isDebitNormal(false).isActive(false).displayOrder(3).build();

        chartOfAccountsMapper.insertAccount(account1);
        chartOfAccountsMapper.insertAccount(account2);
        chartOfAccountsMapper.insertAccount(inactiveAccount);

        // When
        List<ChartOfAccount> activeAccounts = chartOfAccountsMapper.findAllActiveAccounts();

        // Then
        assertThat(activeAccounts).hasSize(2);
        assertThat(activeAccounts).extracting(ChartOfAccount::getAccountCode)
                .containsExactly(getCashAccountCode(), getAccountsPayableCode());
        assertThat(activeAccounts).allMatch(ChartOfAccount::getIsActive);
    }

    @Test
    @DisplayName("TDD: 계정과목 유형별 조회 테스트")
    void should_FindAccountsByType_When_AccountsOfTypeExist() {
        // Given
        ChartOfAccount assetAccount1 = ChartOfAccount.builder()
                .accountCode(getCashAccountCode()).accountName("현금").accountType("자산")
                .isDebitNormal(true).isActive(true).displayOrder(1).build();

        ChartOfAccount assetAccount2 = ChartOfAccount.builder()
                .accountCode(getBankDepositsCode()).accountName("보통예금").accountType("자산")
                .isDebitNormal(true).isActive(true).displayOrder(2).build();

        ChartOfAccount liabilityAccount = ChartOfAccount.builder()
                .accountCode(getAccountsPayableCode()).accountName("외상매입금").accountType("부채")
                .isDebitNormal(false).isActive(true).displayOrder(3).build();

        chartOfAccountsMapper.insertAccount(assetAccount1);
        chartOfAccountsMapper.insertAccount(assetAccount2);
        chartOfAccountsMapper.insertAccount(liabilityAccount);

        // When
        List<ChartOfAccount> assetAccounts = chartOfAccountsMapper.findAccountsByType("자산");

        // Then
        assertThat(assetAccounts).hasSize(2);
        assertThat(assetAccounts).extracting(ChartOfAccount::getAccountType)
                .containsOnly("자산");
        assertThat(assetAccounts).extracting(ChartOfAccount::getAccountCode)
                .containsExactly(getCashAccountCode(), getBankDepositsCode());
    }

    @Test
    @DisplayName("TDD: 계정과목 검색 테스트 (페이징 포함)")
    void should_SearchAccounts_When_KeywordMatches() {
        // Given
        ChartOfAccount cashAccount = ChartOfAccount.builder()
                .accountCode(getCashAccountCode()).accountName("현금").accountType("자산")
                .accountSubtype("현금성 자산").isActive(true).displayOrder(1).build();

        ChartOfAccount bankAccount = ChartOfAccount.builder()
                .accountCode(getBankDepositsCode()).accountName("보통예금").accountType("자산")
                .accountSubtype("은행 예금").isActive(true).displayOrder(2).build();

        chartOfAccountsMapper.insertAccount(cashAccount);
        chartOfAccountsMapper.insertAccount(bankAccount);

        // When - 계정명으로 검색
        List<ChartOfAccount> searchResults = chartOfAccountsMapper.searchAccounts(
                "현금", null, 10, 0);

        // Then
        assertThat(searchResults).hasSize(1);
        assertThat(searchResults.get(0).getAccountName()).isEqualTo("현금");

        // When - 서브타입으로 검색  
        List<ChartOfAccount> subtypeResults = chartOfAccountsMapper.searchAccounts(
                "은행", null, 10, 0);

        // Then
        assertThat(subtypeResults).hasSize(1);
        assertThat(subtypeResults.get(0).getAccountName()).isEqualTo("보통예금");
    }

    @Test
    @DisplayName("TDD: 계정과목 검색 총 개수 테스트")
    void should_CountSearchAccounts_When_KeywordMatches() {
        // Given
        for (int i = 0; i < 5; i++) {
            ChartOfAccount account = ChartOfAccount.builder()
                    .accountCode("100" + i).accountName("계정" + i).accountType("자산")
                    .isActive(true).displayOrder(i).build();
            chartOfAccountsMapper.insertAccount(account);
        }

        // When
        Long totalCount = chartOfAccountsMapper.countSearchAccounts("계정", null);

        // Then
        assertThat(totalCount).isEqualTo(5);
    }

    @Test
    @DisplayName("TDD: 계정과목 업데이트 테스트")
    void should_UpdateAccount_When_ValidDataProvided() {
        // Given
        chartOfAccountsMapper.insertAccount(testAccount);
        Integer accountId = testAccount.getId();

        testAccount.setAccountName("현금및현금성자산");
        testAccount.setAccountSubtype("업데이트된 서브타입");

        // When
        int result = chartOfAccountsMapper.updateAccount(testAccount);

        // Then
        assertThat(result).isEqualTo(1);

        ChartOfAccount updatedAccount = chartOfAccountsMapper.findAccountById(accountId.longValue());
        assertThat(updatedAccount.getAccountName()).isEqualTo("현금및현금성자산");
        assertThat(updatedAccount.getAccountSubtype()).isEqualTo("업데이트된 서브타입");
        assertThat(updatedAccount.getUpdatedAt()).isNotNull();
    }

    @Test
    @DisplayName("TDD: 계정과목 비활성화 테스트")
    void should_DeactivateAccount_When_AccountExists() {
        // Given
        chartOfAccountsMapper.insertAccount(testAccount);
        Integer accountId = testAccount.getId();

        // When
        int result = chartOfAccountsMapper.deactivateAccount(accountId.longValue());

        // Then
        assertThat(result).isEqualTo(1);

        ChartOfAccount deactivatedAccount = chartOfAccountsMapper.findAccountById(accountId.longValue());
        assertThat(deactivatedAccount.getIsActive()).isFalse();
        assertThat(deactivatedAccount.getUpdatedAt()).isNotNull();
    }

    @Test
    @DisplayName("TDD: 계정과목 활성화 테스트")
    void should_ActivateAccount_When_DeactivatedAccountExists() {
        // Given
        testAccount.setIsActive(false);
        chartOfAccountsMapper.insertAccount(testAccount);
        Integer accountId = testAccount.getId();

        // When
        int result = chartOfAccountsMapper.activateAccount(accountId.longValue());

        // Then
        assertThat(result).isEqualTo(1);

        ChartOfAccount activatedAccount = chartOfAccountsMapper.findAccountById(accountId.longValue());
        assertThat(activatedAccount.getIsActive()).isTrue();
        assertThat(activatedAccount.getUpdatedAt()).isNotNull();
    }

    @Test
    @DisplayName("TDD: 계정과목 코드 중복 확인 테스트")
    void should_CheckAccountCodeExists_When_AccountCodeProvided() {
        // Given
        chartOfAccountsMapper.insertAccount(testAccount);
        String existingCode = testAccount.getAccountCode();
        String nonExistingCode = "9999";

        // When & Then - 존재하는 코드
        Boolean exists = chartOfAccountsMapper.existsByAccountCode(existingCode);
        assertThat(exists).isTrue();

        // When & Then - 존재하지 않는 코드
        Boolean notExists = chartOfAccountsMapper.existsByAccountCode(nonExistingCode);
        assertThat(notExists).isFalse();
    }

    @Test
    @DisplayName("TDD: 계정과목 사용 여부 확인 테스트")
    void should_CheckAccountInUse_When_AccountCodeProvided() {
        // Given
        String accountCode = getCashAccountCode();

        // When & Then - 사용되지 않는 계정 (분개에서 사용 안됨)
        Boolean inUse = chartOfAccountsMapper.isAccountInUse(accountCode);
        assertThat(inUse).isFalse();

        // Note: 실제 분개 데이터가 있을 때는 true가 반환되어야 함
    }

    @Test
    @DisplayName("TDD: 최대 표시 순서 조회 테스트")
    void should_GetMaxDisplayOrder_When_AccountsExist() {
        // Given
        ChartOfAccount account1 = ChartOfAccount.builder()
                .accountCode(getCashAccountCode()).accountName("계정1").accountType("자산")
                .isActive(true).displayOrder(5).build();

        ChartOfAccount account2 = ChartOfAccount.builder()
                .accountCode(getBankDepositsCode()).accountName("계정2").accountType("자산")
                .isActive(true).displayOrder(10).build();

        chartOfAccountsMapper.insertAccount(account1);
        chartOfAccountsMapper.insertAccount(account2);

        // When
        Integer maxOrder = chartOfAccountsMapper.getMaxDisplayOrder("자산");

        // Then
        assertThat(maxOrder).isEqualTo(10);
    }

    @Test
    @DisplayName("TDD: 계정과목 통계 조회 테스트")
    void should_GetAccountStatistics_When_AccountsExist() {
        // Given
        ChartOfAccount assetAccount = ChartOfAccount.builder()
                .accountCode(getCashAccountCode()).accountName("자산계정").accountType("자산")
                .isActive(true).displayOrder(1).build();

        ChartOfAccount liabilityAccount = ChartOfAccount.builder()
                .accountCode(getAccountsPayableCode()).accountName("부채계정").accountType("부채")
                .isActive(true).displayOrder(2).build();

        ChartOfAccount inactiveAccount = ChartOfAccount.builder()
                .accountCode(getCapitalStockCode()).accountName("비활성계정").accountType("자산")
                .isActive(false).displayOrder(3).build();

        chartOfAccountsMapper.insertAccount(assetAccount);
        chartOfAccountsMapper.insertAccount(liabilityAccount);
        chartOfAccountsMapper.insertAccount(inactiveAccount);

        // When
        List<Map<String, Object>> statistics = chartOfAccountsMapper.getAccountStatistics();

        // Then
        assertThat(statistics).isNotEmpty();
        
        Map<String, Object> assetStats = statistics.stream()
                .filter(stat -> "자산".equals(stat.get("account_type")))
                .findFirst()
                .orElse(null);
        
        assertThat(assetStats).isNotNull();
        assertThat(assetStats.get("count")).isEqualTo(2L); // 총 2개 자산 계정
        assertThat(assetStats.get("active_count")).isEqualTo(1L); // 1개 활성
        assertThat(assetStats.get("inactive_count")).isEqualTo(1L); // 1개 비활성
    }

    @Test
    @DisplayName("TDD: 미사용 계정과목 조회 테스트")
    void should_FindUnusedAccounts_When_UnusedAccountsExist() {
        // Given
        chartOfAccountsMapper.insertAccount(testAccount);

        // When
        List<ChartOfAccount> unusedAccounts = chartOfAccountsMapper.findUnusedAccounts();

        // Then
        assertThat(unusedAccounts).contains(testAccount);
        // Note: 실제로는 분개에서 사용되지 않은 계정만 반환되어야 함
    }

    @Test
    @DisplayName("TDD: 계정과목 일괄 생성 테스트")
    void should_InsertAccountsBatch_When_ValidAccountsProvided() {
        // Given
        List<ChartOfAccount> accounts = List.of(
                ChartOfAccount.builder()
                        .accountCode(getCashAccountCode()).accountName("현금").accountType("자산")
                        .isDebitNormal(true).isActive(true).displayOrder(1).build(),
                
                ChartOfAccount.builder()
                        .accountCode(getAccountsPayableCode()).accountName("외상매입금").accountType("부채")
                        .isDebitNormal(false).isActive(true).displayOrder(2).build(),
                
                ChartOfAccount.builder()
                        .accountCode(getCapitalStockCode()).accountName("자본금").accountType("자본")
                        .isDebitNormal(false).isActive(true).displayOrder(3).build()
        );

        // When
        int result = chartOfAccountsMapper.insertAccountsBatch(accounts);

        // Then
        assertThat(result).isEqualTo(3);

        // 생성된 계정들 확인
        ChartOfAccount cash = chartOfAccountsMapper.findAccountByCode(getCashAccountCode());
        ChartOfAccount liability = chartOfAccountsMapper.findAccountByCode(getAccountsPayableCode());
        ChartOfAccount equity = chartOfAccountsMapper.findAccountByCode(getCapitalStockCode());

        assertThat(cash.getAccountName()).isEqualTo("현금");
        assertThat(liability.getAccountName()).isEqualTo("외상매입금");
        assertThat(equity.getAccountName()).isEqualTo("자본금");
    }

    @Test
    @DisplayName("TDD: 계정과목 계층 구조 조회 테스트")
    void should_FindAccountHierarchy_When_HierarchyExists() {
        // Given - 계층 구조 생성 (부모-자식 관계)
        ChartOfAccount parentAccount = ChartOfAccount.builder()
                .accountCode(getCashAccountCode()).accountName("유동자산").accountType("자산")
                .isDebitNormal(true).isActive(true).displayOrder(1).build();
        chartOfAccountsMapper.insertAccount(parentAccount);

        ChartOfAccount childAccount = ChartOfAccount.builder()
                .accountCode(getBankDepositsCode()).accountName("현금").accountType("자산")
                .parentAccountId(parentAccount.getId())
                .isDebitNormal(true).isActive(true).displayOrder(2).build();
        chartOfAccountsMapper.insertAccount(childAccount);

        // When
        List<ChartOfAccount> hierarchy = chartOfAccountsMapper.findAccountHierarchy(parentAccount.getId().longValue());

        // Then
        assertThat(hierarchy).hasSize(2); // 부모 + 자식
        assertThat(hierarchy.get(0).getAccountCode()).isEqualTo(getCashAccountCode()); // 부모가 먼저
        assertThat(hierarchy.get(1).getAccountCode()).isEqualTo(getBankDepositsCode()); // 자식이 다음
        assertThat(hierarchy.get(1).getParentAccountId()).isEqualTo(parentAccount.getId());
    }

    @Test
    @DisplayName("TDD: 표시 순서 업데이트 테스트")
    void should_UpdateDisplayOrders_When_ValidOrderProvided() {
        // Given
        chartOfAccountsMapper.insertAccount(testAccount);
        Integer accountId = testAccount.getId();
        Integer newOrder = 99;

        // When
        int result = chartOfAccountsMapper.updateDisplayOrders(accountId.longValue(), newOrder);

        // Then
        assertThat(result).isEqualTo(1);

        ChartOfAccount updatedAccount = chartOfAccountsMapper.findAccountById(accountId.longValue());
        assertThat(updatedAccount.getDisplayOrder()).isEqualTo(newOrder);
    }
}
package com.moneyshift.api.service;

import com.moneyshift.api.mapper.AccountingMapper;
import com.moneyshift.api.model.ChartOfAccount;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.*;

import static org.assertj.core.api.Assertions.*;

/**
 * TDD: ChartOfAccountsExpansionService 테스트 - Phase 1 계정과목 확장 시스템 검증
 * 
 * 핵심 기능:
 * 1. 200+ 한국 표준 계정과목 시스템 구축
 * 2. 4자리 계정코드 구조 검증
 * 3. 계정과목 정상잔액 검증
 * 4. 복식부기 원칙 적용
 * 5. 계정과목 계층구조 관리
 * 6. 한국 표준 계정과목 특화 생성
 * 7. 계정과목 일괄 생성 및 관리
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("ChartOfAccountsExpansionService TDD - Phase 1 계정과목 확장 시스템 테스트")
class ChartOfAccountsExpansionServiceTest {

    @Mock
    private AccountingMapper accountingMapper;
    
    @InjectMocks
    private ChartOfAccountsExpansionService chartOfAccountsExpansionService;
    
    private ChartOfAccount testAssetAccount;
    private ChartOfAccount testLiabilityAccount;
    private ChartOfAccount testEquityAccount;
    private ChartOfAccount testRevenueAccount;
    private ChartOfAccount testExpenseAccount;

    @BeforeEach
    void setUp() {
        // 테스트용 자산 계정
        testAssetAccount = ChartOfAccount.builder()
                .accountCode("1100")
                .accountName("현금")
                .accountType("자산")
                .isDebitNormal(true)
                .isActive(true)
                .displayOrder(1)
                .build();
        
        // 테스트용 부채 계정
        testLiabilityAccount = ChartOfAccount.builder()
                .accountCode("2100")
                .accountName("외상매입금")
                .accountType("부채")
                .isDebitNormal(false)
                .isActive(true)
                .displayOrder(51)
                .build();
        
        // 테스트용 자본 계정
        testEquityAccount = ChartOfAccount.builder()
                .accountCode("3100")
                .accountName("자본금")
                .accountType("자본")
                .isDebitNormal(false)
                .isActive(true)
                .displayOrder(81)
                .build();
        
        // 테스트용 수익 계정
        testRevenueAccount = ChartOfAccount.builder()
                .accountCode("4100")
                .accountName("매출")
                .accountType("수익")
                .isDebitNormal(false)
                .isActive(true)
                .displayOrder(91)
                .build();
        
        // 테스트용 비용 계정
        testExpenseAccount = ChartOfAccount.builder()
                .accountCode("5100")
                .accountName("매출원가")
                .accountType("비용")
                .isDebitNormal(true)
                .isActive(true)
                .displayOrder(111)
                .build();
    }

    @Test
    @DisplayName("TDD: 200+ 확장된 계정과목 시스템 초기화")
    void should_InitializeExpandedChartOfAccounts_When_ServiceCalled() {
        // Given
        // Mock 설정은 필요 없음 (현재는 DB 저장 없이 메모리에서만 동작)

        // When
        chartOfAccountsExpansionService.initializeExpandedChartOfAccounts();

        // Then
        // 예외가 발생하지 않으면 성공
        // 실제 구현에서는 로깅을 통해 200+ 계정과목 생성 확인
    }

    @Test
    @DisplayName("TDD: 자산 계정 50개 생성 - 1000번대 코드")
    void should_CreateAssetAccounts_When_AssetTypeRequested() {
        // Given
        String accountType = "자산";

        // When
        List<ChartOfAccount> result = chartOfAccountsExpansionService.createAccountsByType(accountType);

        // Then
        assertThat(result).isNotNull();
        assertThat(result).hasSize(50);
        
        // 첫 번째 계정 검증 (현금)
        ChartOfAccount firstAccount = result.get(0);
        assertThat(firstAccount.getAccountCode()).isEqualTo("1100");
        assertThat(firstAccount.getAccountName()).isEqualTo("현금");
        assertThat(firstAccount.getAccountType()).isEqualTo("자산");
        assertThat(firstAccount.getIsDebitNormal()).isTrue();
        assertThat(firstAccount.getIsActive()).isTrue();
        assertThat(firstAccount.getDisplayOrder()).isEqualTo(1);
        
        // 모든 계정이 1000번대 코드로 시작하는지 확인
        assertThat(result).allMatch(account -> 
            account.getAccountCode().startsWith("1"));
        
        // 모든 계정이 차변 정상잔액인지 확인 (자산의 특성)
        assertThat(result).allMatch(account -> 
            account.getIsDebitNormal() == true);
    }

    @Test
    @DisplayName("TDD: 부채 계정 30개 생성 - 2000번대 코드")
    void should_CreateLiabilityAccounts_When_LiabilityTypeRequested() {
        // Given
        String accountType = "부채";

        // When
        List<ChartOfAccount> result = chartOfAccountsExpansionService.createAccountsByType(accountType);

        // Then
        assertThat(result).isNotNull();
        assertThat(result).hasSize(30);
        
        // 첫 번째 계정 검증 (외상매입금)
        ChartOfAccount firstAccount = result.get(0);
        assertThat(firstAccount.getAccountCode()).isEqualTo("2100");
        assertThat(firstAccount.getAccountName()).isEqualTo("외상매입금");
        assertThat(firstAccount.getAccountType()).isEqualTo("부채");
        assertThat(firstAccount.getIsDebitNormal()).isFalse();
        
        // 모든 계정이 2000번대 코드로 시작하는지 확인
        assertThat(result).allMatch(account -> 
            account.getAccountCode().startsWith("2"));
        
        // 모든 계정이 대변 정상잔액인지 확인 (부채의 특성)
        assertThat(result).allMatch(account -> 
            account.getIsDebitNormal() == false);
    }

    @Test
    @DisplayName("TDD: 자본 계정 10개 생성 - 3000번대 코드")
    void should_CreateEquityAccounts_When_EquityTypeRequested() {
        // Given
        String accountType = "자본";

        // When
        List<ChartOfAccount> result = chartOfAccountsExpansionService.createAccountsByType(accountType);

        // Then
        assertThat(result).isNotNull();
        assertThat(result).hasSize(10);
        
        // 첫 번째 계정 검증 (자본금)
        ChartOfAccount firstAccount = result.get(0);
        assertThat(firstAccount.getAccountCode()).isEqualTo("3100");
        assertThat(firstAccount.getAccountName()).isEqualTo("자본금");
        assertThat(firstAccount.getAccountType()).isEqualTo("자본");
        assertThat(firstAccount.getIsDebitNormal()).isFalse();
        
        // 모든 계정이 3000번대 코드로 시작하는지 확인
        assertThat(result).allMatch(account -> 
            account.getAccountCode().startsWith("3"));
        
        // 모든 계정이 대변 정상잔액인지 확인 (자본의 특성)
        assertThat(result).allMatch(account -> 
            account.getIsDebitNormal() == false);
    }

    @Test
    @DisplayName("TDD: 수익 계정 20개 생성 - 4000번대 코드")
    void should_CreateRevenueAccounts_When_RevenueTypeRequested() {
        // Given
        String accountType = "수익";

        // When
        List<ChartOfAccount> result = chartOfAccountsExpansionService.createAccountsByType(accountType);

        // Then
        assertThat(result).isNotNull();
        assertThat(result).hasSize(20);
        
        // 첫 번째 계정 검증 (매출)
        ChartOfAccount firstAccount = result.get(0);
        assertThat(firstAccount.getAccountCode()).isEqualTo("4100");
        assertThat(firstAccount.getAccountName()).isEqualTo("매출");
        assertThat(firstAccount.getAccountType()).isEqualTo("수익");
        assertThat(firstAccount.getIsDebitNormal()).isFalse();
        
        // 모든 계정이 4000번대 코드로 시작하는지 확인
        assertThat(result).allMatch(account -> 
            account.getAccountCode().startsWith("4"));
        
        // 모든 계정이 대변 정상잔액인지 확인 (수익의 특성)
        assertThat(result).allMatch(account -> 
            account.getIsDebitNormal() == false);
    }

    @Test
    @DisplayName("TDD: 비용 계정 90개 생성 - 5000번대 코드")
    void should_CreateExpenseAccounts_When_ExpenseTypeRequested() {
        // Given
        String accountType = "비용";

        // When
        List<ChartOfAccount> result = chartOfAccountsExpansionService.createAccountsByType(accountType);

        // Then
        assertThat(result).isNotNull();
        assertThat(result).hasSize(90);
        
        // 첫 번째 계정 검증 (매출원가)
        ChartOfAccount firstAccount = result.get(0);
        assertThat(firstAccount.getAccountCode()).isEqualTo("5100");
        assertThat(firstAccount.getAccountName()).isEqualTo("매출원가");
        assertThat(firstAccount.getAccountType()).isEqualTo("비용");
        assertThat(firstAccount.getIsDebitNormal()).isTrue();
        
        // 모든 계정이 5000번대 코드로 시작하는지 확인
        assertThat(result).allMatch(account -> 
            account.getAccountCode().startsWith("5"));
        
        // 모든 계정이 차변 정상잔액인지 확인 (비용의 특성)
        assertThat(result).allMatch(account -> 
            account.getIsDebitNormal() == true);
    }

    @Test
    @DisplayName("TDD: 잘못된 계정 유형 예외 처리")
    void should_ThrowException_When_InvalidAccountTypeProvided() {
        // Given
        String invalidAccountType = "잘못된유형";

        // When & Then
        assertThatThrownBy(() -> {
            chartOfAccountsExpansionService.createAccountsByType(invalidAccountType);
        }).isInstanceOf(IllegalArgumentException.class)
          .hasMessage("Unknown account type: 잘못된유형");
    }

    @Test
    @DisplayName("TDD Red: 4자리 계정코드 구조 검증 - 미구현 상태")
    void should_ThrowNotImplementedException_When_ValidateFourDigitAccountCode() {
        // Given
        String accountCode = "1100";

        // When & Then
        assertThatThrownBy(() -> {
            chartOfAccountsExpansionService.validateFourDigitAccountCode(accountCode);
        }).isInstanceOf(RuntimeException.class)
          .hasMessage("Not implemented yet - TDD Red");
    }

    @Test
    @DisplayName("TDD Red: 계정과목 정상잔액 검증 - 미구현 상태")
    void should_ThrowNotImplementedException_When_ValidateNormalBalance() {
        // Given
        ChartOfAccount account = testAssetAccount;

        // When & Then
        assertThatThrownBy(() -> {
            chartOfAccountsExpansionService.validateNormalBalance(account);
        }).isInstanceOf(RuntimeException.class)
          .hasMessage("Not implemented yet - TDD Red");
    }

    @Test
    @DisplayName("TDD Red: 계정과목 중복 검증 - 미구현 상태")
    void should_ThrowNotImplementedException_When_ValidateAccountUniqueness() {
        // Given
        String accountCode = "1100";

        // When & Then
        assertThatThrownBy(() -> {
            chartOfAccountsExpansionService.validateAccountUniqueness(accountCode);
        }).isInstanceOf(RuntimeException.class)
          .hasMessage("Not implemented yet - TDD Red");
    }

    @Test
    @DisplayName("TDD Red: 계정과목 계층구조 검증 - 미구현 상태")
    void should_ThrowNotImplementedException_When_ValidateAccountHierarchy() {
        // Given
        List<ChartOfAccount> accounts = Arrays.asList(testAssetAccount, testLiabilityAccount);

        // When & Then
        assertThatThrownBy(() -> {
            chartOfAccountsExpansionService.validateAccountHierarchy(accounts);
        }).isInstanceOf(RuntimeException.class)
          .hasMessage("Not implemented yet - TDD Red");
    }

    @Test
    @DisplayName("TDD Red: 한국 표준 계정과목 특화 생성 - 미구현 상태")
    void should_ThrowNotImplementedException_When_CreateKoreanStandardAccounts() {
        // Given
        String businessType = "제조업";

        // When & Then
        assertThatThrownBy(() -> {
            chartOfAccountsExpansionService.createKoreanStandardAccounts(businessType);
        }).isInstanceOf(RuntimeException.class)
          .hasMessage("Not implemented yet - TDD Red");
    }

    @Test
    @DisplayName("TDD Red: 복식부기 원칙 적용 검증 - 미구현 상태")
    void should_ThrowNotImplementedException_When_ValidateDoubleEntryPrinciples() {
        // Given
        List<ChartOfAccount> accounts = Arrays.asList(testAssetAccount, testLiabilityAccount);

        // When & Then
        assertThatThrownBy(() -> {
            chartOfAccountsExpansionService.validateDoubleEntryPrinciples(accounts);
        }).isInstanceOf(RuntimeException.class)
          .hasMessage("Not implemented yet - TDD Red");
    }

    @Test
    @DisplayName("TDD Red: 계정과목 일괄 생성 - 미구현 상태")
    void should_ThrowNotImplementedException_When_BulkCreateAccounts() {
        // Given
        List<ChartOfAccount> accounts = Arrays.asList(testAssetAccount, testLiabilityAccount, testEquityAccount);

        // When & Then
        assertThatThrownBy(() -> {
            chartOfAccountsExpansionService.bulkCreateAccounts(accounts);
        }).isInstanceOf(RuntimeException.class)
          .hasMessage("Not implemented yet - TDD Red");
    }

    @Test
    @DisplayName("TDD: 전체 계정과목 생성 검증 - 자산+부채+자본+수익+비용 = 200개")
    void should_CreateAllAccountTypes_When_RequestingAllTypes() {
        // Given & When
        List<ChartOfAccount> assetAccounts = chartOfAccountsExpansionService.createAccountsByType("자산");
        List<ChartOfAccount> liabilityAccounts = chartOfAccountsExpansionService.createAccountsByType("부채");
        List<ChartOfAccount> equityAccounts = chartOfAccountsExpansionService.createAccountsByType("자본");
        List<ChartOfAccount> revenueAccounts = chartOfAccountsExpansionService.createAccountsByType("수익");
        List<ChartOfAccount> expenseAccounts = chartOfAccountsExpansionService.createAccountsByType("비용");

        // Then
        // 총 개수 검증: 50 + 30 + 10 + 20 + 90 = 200개
        int totalCount = assetAccounts.size() + liabilityAccounts.size() + 
                        equityAccounts.size() + revenueAccounts.size() + expenseAccounts.size();
        assertThat(totalCount).isEqualTo(200);
        
        // 각 타입별 개수 검증
        assertThat(assetAccounts).hasSize(50);
        assertThat(liabilityAccounts).hasSize(30);
        assertThat(equityAccounts).hasSize(10);
        assertThat(revenueAccounts).hasSize(20);
        assertThat(expenseAccounts).hasSize(90);
    }

    @Test
    @DisplayName("TDD: 계정코드 중복 검증 - 서로 다른 계정 유형간 코드 중복 없음")
    void should_HaveUniqueAccountCodes_When_CreatingAllAccountTypes() {
        // Given & When
        List<ChartOfAccount> allAccounts = new ArrayList<>();
        allAccounts.addAll(chartOfAccountsExpansionService.createAccountsByType("자산"));
        allAccounts.addAll(chartOfAccountsExpansionService.createAccountsByType("부채"));
        allAccounts.addAll(chartOfAccountsExpansionService.createAccountsByType("자본"));
        allAccounts.addAll(chartOfAccountsExpansionService.createAccountsByType("수익"));
        allAccounts.addAll(chartOfAccountsExpansionService.createAccountsByType("비용"));

        // Then
        // 모든 계정코드가 고유한지 검증
        Set<String> accountCodes = new HashSet<>();
        for (ChartOfAccount account : allAccounts) {
            assertThat(accountCodes).doesNotContain(account.getAccountCode()); // 중복 검증
            accountCodes.add(account.getAccountCode());
        }
        
        assertThat(accountCodes).hasSize(200); // 200개 모두 고유해야 함
    }

    @Test
    @DisplayName("TDD: 계정과목 displayOrder 연속성 검증")
    void should_HaveSequentialDisplayOrder_When_CreatingAllAccounts() {
        // Given & When
        List<ChartOfAccount> allAccounts = new ArrayList<>();
        allAccounts.addAll(chartOfAccountsExpansionService.createAccountsByType("자산"));
        allAccounts.addAll(chartOfAccountsExpansionService.createAccountsByType("부채"));
        allAccounts.addAll(chartOfAccountsExpansionService.createAccountsByType("자본"));
        allAccounts.addAll(chartOfAccountsExpansionService.createAccountsByType("수익"));
        allAccounts.addAll(chartOfAccountsExpansionService.createAccountsByType("비용"));

        // Then
        // displayOrder가 1부터 200까지 연속적인지 검증
        Set<Integer> displayOrders = new HashSet<>();
        for (ChartOfAccount account : allAccounts) {
            displayOrders.add(account.getDisplayOrder());
        }
        
        assertThat(displayOrders).hasSize(200);
        assertThat(Collections.min(displayOrders)).isEqualTo(1);
        assertThat(Collections.max(displayOrders)).isEqualTo(200);
    }

    @Test
    @DisplayName("TDD: 복식부기 원칙 적용 검증 - 정상잔액 규칙")
    void should_FollowDoubleEntryPrinciples_When_CreatingAccounts() {
        // Given & When
        List<ChartOfAccount> assetAccounts = chartOfAccountsExpansionService.createAccountsByType("자산");
        List<ChartOfAccount> liabilityAccounts = chartOfAccountsExpansionService.createAccountsByType("부채");
        List<ChartOfAccount> equityAccounts = chartOfAccountsExpansionService.createAccountsByType("자본");
        List<ChartOfAccount> revenueAccounts = chartOfAccountsExpansionService.createAccountsByType("수익");
        List<ChartOfAccount> expenseAccounts = chartOfAccountsExpansionService.createAccountsByType("비용");

        // Then
        // 자산과 비용은 차변 정상잔액
        assertThat(assetAccounts).allMatch(account -> account.getIsDebitNormal() == true);
        assertThat(expenseAccounts).allMatch(account -> account.getIsDebitNormal() == true);
        
        // 부채, 자본, 수익은 대변 정상잔액
        assertThat(liabilityAccounts).allMatch(account -> account.getIsDebitNormal() == false);
        assertThat(equityAccounts).allMatch(account -> account.getIsDebitNormal() == false);
        assertThat(revenueAccounts).allMatch(account -> account.getIsDebitNormal() == false);
    }

    @Test
    @DisplayName("TDD: 한국 표준 계정과목 특화 검증 - 주요 계정과목 포함")
    void should_IncludeKoreanStandardAccounts_When_CreatingAccounts() {
        // Given & When
        List<ChartOfAccount> expenseAccounts = chartOfAccountsExpansionService.createAccountsByType("비용");
        
        // Then
        // 한국 표준 계정과목들이 포함되어 있는지 검증
        List<String> expenseAccountNames = expenseAccounts.stream()
                .map(ChartOfAccount::getAccountName)
                .toList();
        
        assertThat(expenseAccountNames).contains(
                "급여",           // 급여비용
                "임차료",         // 임대료
                "소모품비",       // 소모품
                "통신비",         // 통신비용
                "접대비",         // 접대비용
                "광고선전비",     // 광고비
                "여비교통비"      // 교통비
        );
    }

    @Test
    @DisplayName("TDD: 계정과목 활성화 상태 검증 - 모든 계정이 활성화")
    void should_HaveAllAccountsActive_When_CreatingAccounts() {
        // Given & When
        List<ChartOfAccount> allAccounts = new ArrayList<>();
        allAccounts.addAll(chartOfAccountsExpansionService.createAccountsByType("자산"));
        allAccounts.addAll(chartOfAccountsExpansionService.createAccountsByType("부채"));
        allAccounts.addAll(chartOfAccountsExpansionService.createAccountsByType("자본"));
        allAccounts.addAll(chartOfAccountsExpansionService.createAccountsByType("수익"));
        allAccounts.addAll(chartOfAccountsExpansionService.createAccountsByType("비용"));

        // Then
        // 모든 계정이 활성화 상태인지 검증
        assertThat(allAccounts).allMatch(account -> 
            account.getIsActive() == true);
    }
}
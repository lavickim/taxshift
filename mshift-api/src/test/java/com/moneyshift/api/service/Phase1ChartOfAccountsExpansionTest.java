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

import java.util.Arrays;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Phase 1: 계정과목 확장 시스템 TDD 테스트
 * 200+ 한국 표준 계정과목 시스템 백엔드 구현
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("Phase 1: 계정과목 확장 시스템 TDD")
class Phase1ChartOfAccountsExpansionTest {

    @Mock
    private AccountingMapper accountingMapper;
    
    @InjectMocks
    private ChartOfAccountsExpansionService chartOfAccountsService;

    private List<ChartOfAccount> expandedChartOfAccounts;

    @BeforeEach
    void setUp() {
        // 200+ 확장된 계정과목 테스트 데이터 준비
        expandedChartOfAccounts = createExpandedChartOfAccounts();
    }

    @Test
    @DisplayName("TDD Green: 200+ 확장된 계정과목 시스템 초기화 - 성공 테스트")
    void shouldInitializeExpandedChartOfAccounts() {
        // Given: 서비스가 구현됨
        // When & Then: 정상적으로 초기화됨
        assertThatCode(() -> {
            chartOfAccountsService.initializeExpandedChartOfAccounts();
        }).doesNotThrowAnyException();
    }

    @Test
    @DisplayName("TDD Green: 자산 계정 50개 생성 - 성공 테스트") 
    void shouldCreateAssetAccounts() {
        // Given: 자산 계정 생성 요청
        String accountType = "자산";
        
        // When: 자산 계정 생성
        List<ChartOfAccount> assetAccounts = chartOfAccountsService.createAccountsByType(accountType);
        
        // Then: 50개의 자산 계정이 생성됨
        assertThat(assetAccounts).hasSize(50);
        assertThat(assetAccounts).allMatch(account -> account.getAccountType().equals("자산"));
        assertThat(assetAccounts).allMatch(account -> account.getAccountCode().startsWith("1"));
    }

    @Test
    @DisplayName("TDD Green: 부채 계정 30개 생성 - 성공 테스트")
    void shouldCreateLiabilityAccounts() {
        // Given: 부채 계정 생성 요청
        String accountType = "부채";
        
        // When: 부채 계정 생성
        List<ChartOfAccount> liabilityAccounts = chartOfAccountsService.createAccountsByType(accountType);
        
        // Then: 30개의 부채 계정이 생성됨
        assertThat(liabilityAccounts).hasSize(30);
        assertThat(liabilityAccounts).allMatch(account -> account.getAccountType().equals("부채"));
        assertThat(liabilityAccounts).allMatch(account -> account.getAccountCode().startsWith("2"));
    }

    @Test
    @DisplayName("TDD Green: 자본 계정 10개 생성 - 성공 테스트")
    void shouldCreateEquityAccounts() {
        // Given: 자본 계정 생성 요청
        String accountType = "자본";
        
        // When: 자본 계정 생성
        List<ChartOfAccount> equityAccounts = chartOfAccountsService.createAccountsByType(accountType);
        
        // Then: 10개의 자본 계정이 생성됨
        assertThat(equityAccounts).hasSize(10);
        assertThat(equityAccounts).allMatch(account -> account.getAccountType().equals("자본"));
        assertThat(equityAccounts).allMatch(account -> account.getAccountCode().startsWith("3"));
    }

    @Test
    @DisplayName("TDD Green: 수익 계정 20개 생성 - 성공 테스트")
    void shouldCreateRevenueAccounts() {
        // Given: 수익 계정 생성 요청
        String accountType = "수익";
        
        // When: 수익 계정 생성
        List<ChartOfAccount> revenueAccounts = chartOfAccountsService.createAccountsByType(accountType);
        
        // Then: 20개의 수익 계정이 생성됨
        assertThat(revenueAccounts).hasSize(20);
        assertThat(revenueAccounts).allMatch(account -> account.getAccountType().equals("수익"));
        assertThat(revenueAccounts).allMatch(account -> account.getAccountCode().startsWith("4"));
    }

    @Test
    @DisplayName("TDD Green: 비용 계정 90개 생성 - 성공 테스트")
    void shouldCreateExpenseAccounts() {
        // Given: 비용 계정 생성 요청
        String accountType = "비용";
        
        // When: 비용 계정 생성
        List<ChartOfAccount> expenseAccounts = chartOfAccountsService.createAccountsByType(accountType);
        
        // Then: 90개의 비용 계정이 생성됨
        assertThat(expenseAccounts).hasSize(90);
        assertThat(expenseAccounts).allMatch(account -> account.getAccountType().equals("비용"));
        assertThat(expenseAccounts).allMatch(account -> account.getAccountCode().startsWith("5"));
    }

    @Test
    @DisplayName("TDD Red: 4자리 계정코드 구조 검증 - 실패 테스트")
    void shouldFailValidateFourDigitAccountCodeStructure() {
        // Given: 4자리 계정코드 검증 요청
        String accountCode = "1010";
        
        // When & Then: 검증 메소드가 구현되지 않아 실패
        assertThatThrownBy(() -> {
            boolean isValid = chartOfAccountsService.validateFourDigitAccountCode(accountCode);
            assertThat(isValid).isTrue();
        }).isInstanceOf(RuntimeException.class);
    }

    @Test
    @DisplayName("TDD Red: 계정과목 정상잔액 검증 - 실패 테스트")
    void shouldFailValidateNormalBalance() {
        // Given: 계정과목 정상잔액 검증
        ChartOfAccount assetAccount = createTestAccount("1010", "현금", "자산", "차변");
        
        // When & Then: 정상잔액 검증 로직이 구현되지 않아 실패
        assertThatThrownBy(() -> {
            boolean isValidBalance = chartOfAccountsService.validateNormalBalance(assetAccount);
            assertThat(isValidBalance).isTrue();
        }).isInstanceOf(RuntimeException.class);
    }

    @Test
    @DisplayName("TDD Red: 계정과목 중복 검증 - 실패 테스트")
    void shouldFailValidateAccountUniqueness() {
        // Given: 중복 계정코드 검증
        String duplicateAccountCode = "1010";
        
        // When & Then: 중복 검증 로직이 구현되지 않아 실패
        assertThatThrownBy(() -> {
            boolean isUnique = chartOfAccountsService.validateAccountUniqueness(duplicateAccountCode);
            assertThat(isUnique).isFalse();
        }).isInstanceOf(RuntimeException.class);
    }

    @Test
    @DisplayName("TDD Red: 계정과목 계층구조 검증 - 실패 테스트")
    void shouldFailValidateAccountHierarchy() {
        // Given: 계정과목 계층구조 검증
        List<ChartOfAccount> accounts = expandedChartOfAccounts;
        
        // When & Then: 계층구조 검증 로직이 구현되지 않아 실패
        assertThatThrownBy(() -> {
            Map<String, Integer> hierarchy = chartOfAccountsService.validateAccountHierarchy(accounts);
            assertThat(hierarchy.get("자산")).isEqualTo(50);
            assertThat(hierarchy.get("부채")).isEqualTo(30);
            assertThat(hierarchy.get("자본")).isEqualTo(10);
            assertThat(hierarchy.get("수익")).isEqualTo(20);
            assertThat(hierarchy.get("비용")).isEqualTo(90);
        }).isInstanceOf(RuntimeException.class);
    }

    @Test
    @DisplayName("TDD Red: 한국 표준 계정과목 특화 생성 - 실패 테스트")
    void shouldFailCreateKoreanStandardAccounts() {
        // Given: 한국 비즈니스 특화 계정과목 생성
        String businessType = "소매업";
        
        // When & Then: 한국 표준 계정과목 생성 로직이 구현되지 않아 실패
        assertThatThrownBy(() -> {
            List<ChartOfAccount> koreanAccounts = chartOfAccountsService.createKoreanStandardAccounts(businessType);
            assertThat(koreanAccounts).isNotEmpty();
            assertThat(koreanAccounts.stream().anyMatch(acc -> acc.getAccountName().contains("매입"))).isTrue();
            assertThat(koreanAccounts.stream().anyMatch(acc -> acc.getAccountName().contains("부가세"))).isTrue();
        }).isInstanceOf(RuntimeException.class);
    }

    @Test
    @DisplayName("TDD Red: 복식부기 원칙 적용 검증 - 실패 테스트")
    void shouldFailValidateDoubleEntryPrinciples() {
        // Given: 복식부기 원칙 검증
        List<ChartOfAccount> allAccounts = expandedChartOfAccounts;
        
        // When & Then: 복식부기 원칙 검증 로직이 구현되지 않아 실패
        assertThatThrownBy(() -> {
            boolean isValidDoubleEntry = chartOfAccountsService.validateDoubleEntryPrinciples(allAccounts);
            assertThat(isValidDoubleEntry).isTrue();
        }).isInstanceOf(RuntimeException.class);
    }

    @Test
    @DisplayName("TDD Red: 계정과목 일괄 생성 - 실패 테스트")
    void shouldFailBulkCreateAccounts() {
        // Given: 200+ 계정과목 일괄 생성
        List<ChartOfAccount> accountsToCreate = expandedChartOfAccounts;
        
        // When & Then: 일괄 생성 로직이 구현되지 않아 실패
        assertThatThrownBy(() -> {
            int createdCount = chartOfAccountsService.bulkCreateAccounts(accountsToCreate);
            assertThat(createdCount).isEqualTo(200);
        }).isInstanceOf(RuntimeException.class);
    }

    // Helper Methods
    private List<ChartOfAccount> createExpandedChartOfAccounts() {
        return Arrays.asList(
            // 자산 계정 (1000번대) - 50개 예시
            createTestAccount("1100", "현금", "자산", "차변"),
            createTestAccount("1110", "보통예금", "자산", "차변"),
            createTestAccount("1120", "카드매출채권", "자산", "차변"),
            createTestAccount("1130", "외상매출금", "자산", "차변"),
            createTestAccount("1140", "받을어음", "자산", "차변"),
            
            // 부채 계정 (2000번대) - 30개 예시
            createTestAccount("2100", "외상매입금", "부채", "대변"),
            createTestAccount("2110", "지급어음", "부채", "대변"),
            createTestAccount("2120", "단기차입금", "부채", "대변"),
            createTestAccount("2130", "미지급금", "부채", "대변"),
            createTestAccount("2140", "예수금", "부채", "대변"),
            
            // 자본 계정 (3000번대) - 10개 예시
            createTestAccount("3100", "자본금", "자본", "대변"),
            createTestAccount("3200", "자본잉여금", "자본", "대변"),
            createTestAccount("3300", "이익잉여금", "자본", "대변"),
            createTestAccount("3400", "자본조정", "자본", "대변"),
            
            // 수익 계정 (4000번대) - 20개 예시
            createTestAccount("4100", "매출", "수익", "대변"),
            createTestAccount("4200", "영업외수익", "수익", "대변"),
            createTestAccount("4300", "특별이익", "수익", "대변"),
            createTestAccount("4400", "이자수익", "수익", "대변"),
            
            // 비용 계정 (5000번대) - 90개 예시
            createTestAccount("5100", "매출원가", "비용", "차변"),
            createTestAccount("5110", "급여", "비용", "차변"),
            createTestAccount("5120", "임차료", "비용", "차변"),
            createTestAccount("5130", "소모품비", "비용", "차변"),
            createTestAccount("5140", "통신비", "비용", "차변"),
            createTestAccount("5150", "접대비", "비용", "차변")
        );
    }
    
    private ChartOfAccount createTestAccount(String code, String name, String type, String normalBalance) {
        ChartOfAccount account = new ChartOfAccount();
        account.setAccountCode(code);
        account.setAccountName(name);
        account.setAccountType(type);
        account.setNormalBalance(normalBalance);
        account.setIsActive(true);
        return account;
    }
}
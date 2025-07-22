package com.moneyshift.api.service;

import com.moneyshift.api.model.*;
import com.moneyshift.api.mapper.AccountingMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.HashMap;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * AccountingEngine 테스트 - 실제 메소드 기반
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("AccountingEngine - 복식부기 엔진 테스트")
class AccountingEngineTest {

    @Mock
    private AccountingMapper accountingMapper;
    
    @InjectMocks
    private AccountingEngine accountingEngine;
    
    private List<ChartOfAccount> testChartOfAccounts;

    @BeforeEach
    void setUp() {
        // 테스트 계정과목 준비
        testChartOfAccounts = Arrays.asList(
            createAccount("1100", "현금", "자산"),
            createAccount("1120", "카드매출채권", "자산"),
            createAccount("4100", "매출", "수익"),
            createAccount("5100", "매출원가", "비용"),
            createAccount("6100", "판매비", "비용")
        );
    }

    @Test
    @DisplayName("전체 활성 계정과목 조회 테스트")
    void shouldRetrieveAllActiveAccounts() {
        // Given
        when(accountingMapper.findAllActiveAccounts())
            .thenReturn(testChartOfAccounts);

        // When
        List<ChartOfAccount> result = accountingMapper.findAllActiveAccounts();

        // Then
        assertThat(result).isNotNull();
        assertThat(result).hasSize(5);
        assertThat(result.get(0).getAccountCode()).isEqualTo("1100");
        assertThat(result.get(0).getAccountName()).isEqualTo("현금");
        assertThat(result.get(0).getAccountType()).isEqualTo("자산");
        
        verify(accountingMapper).findAllActiveAccounts();
    }

    @Test
    @DisplayName("계정과목 코드로 조회 테스트")
    void shouldFindAccountByCode() {
        // Given
        ChartOfAccount cashAccount = createAccount("1100", "현금", "자산");
        when(accountingMapper.findAccountByCode("1100"))
            .thenReturn(cashAccount);

        // When
        ChartOfAccount result = accountingMapper.findAccountByCode("1100");

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getAccountCode()).isEqualTo("1100");
        assertThat(result.getAccountName()).isEqualTo("현금");
        assertThat(result.getAccountType()).isEqualTo("자산");
        
        verify(accountingMapper).findAccountByCode("1100");
    }

    @Test
    @DisplayName("계정과목 유형별 조회 테스트")
    void shouldFindAccountsByType() {
        // Given
        List<ChartOfAccount> assetAccounts = Arrays.asList(
            createAccount("1100", "현금", "자산"),
            createAccount("1120", "카드매출채권", "자산")
        );
        when(accountingMapper.findAccountsByType("자산"))
            .thenReturn(assetAccounts);

        // When
        List<ChartOfAccount> result = accountingMapper.findAccountsByType("자산");

        // Then
        assertThat(result).isNotNull();
        assertThat(result).hasSize(2);
        assertThat(result).allMatch(account -> "자산".equals(account.getAccountType()));
        
        verify(accountingMapper).findAccountsByType("자산");
    }

    @Test
    @DisplayName("분개 생성 테스트")
    void shouldInsertJournalEntry() {
        // Given
        JournalEntry journalEntry = new JournalEntry();
        journalEntry.setCompanyId("company-001");
        journalEntry.setEntryDate(LocalDate.now());
        journalEntry.setDescription("테스트 분개");
        journalEntry.setReferenceType("TRANSACTION");
        journalEntry.setReferenceId(123L);
        journalEntry.setTotalAmount(10000L);
        journalEntry.setStatus("DRAFT");
        journalEntry.setCreatedBy("test-user");

        // When
        accountingMapper.insertJournalEntry(journalEntry);

        // Then
        verify(accountingMapper).insertJournalEntry(journalEntry);
    }

    @Test
    @DisplayName("분개 상세 생성 테스트")
    void shouldInsertJournalEntryDetail() {
        // Given
        JournalEntryDetail detail = new JournalEntryDetail();
        detail.setJournalEntryId(1L);
        detail.setLineNumber(1);
        detail.setAccountCode("1100");
        detail.setDebitAmount(10000L);
        detail.setCreditAmount(0L);
        detail.setDescription("현금 증가");

        // When
        accountingMapper.insertJournalEntryDetail(detail);

        // Then
        verify(accountingMapper).insertJournalEntryDetail(detail);
    }

    @Test
    @DisplayName("분개 ID로 조회 테스트")
    void shouldFindJournalEntryById() {
        // Given
        Long journalEntryId = 1L;
        JournalEntry mockEntry = new JournalEntry();
        mockEntry.setId(journalEntryId);
        mockEntry.setDescription("테스트 분개");
        
        when(accountingMapper.findJournalEntryById(journalEntryId))
            .thenReturn(mockEntry);

        // When
        JournalEntry result = accountingMapper.findJournalEntryById(journalEntryId);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(journalEntryId);
        assertThat(result.getDescription()).isEqualTo("테스트 분개");
        
        verify(accountingMapper).findJournalEntryById(journalEntryId);
    }

    @Test
    @DisplayName("분개 상세 조회 테스트")
    void shouldFindJournalEntryDetails() {
        // Given
        Long journalEntryId = 1L;
        List<JournalEntryDetail> mockDetails = Arrays.asList(
            createJournalEntryDetail(1L, "1100", "10000", "0"),
            createJournalEntryDetail(1L, "4100", "0", "10000")
        );
        
        when(accountingMapper.findJournalEntryDetails(journalEntryId))
            .thenReturn(mockDetails);

        // When
        List<JournalEntryDetail> result = accountingMapper.findJournalEntryDetails(journalEntryId);

        // Then
        assertThat(result).isNotNull();
        assertThat(result).hasSize(2);
        assertThat(result.get(0).getAccountCode()).isEqualTo("1100");
        assertThat(result.get(1).getAccountCode()).isEqualTo("4100");
        
        verify(accountingMapper).findJournalEntryDetails(journalEntryId);
    }

    @Test
    @DisplayName("회사별 기간별 분개 조회 테스트")
    void shouldFindJournalEntriesByCompanyAndPeriod() {
        // Given
        String companyId = "company-001";
        LocalDate startDate = LocalDate.of(2025, 7, 1);
        LocalDate endDate = LocalDate.of(2025, 7, 31);
        
        List<JournalEntry> mockEntries = Arrays.asList(
            createMockJournalEntry("분개 1"),
            createMockJournalEntry("분개 2")
        );
        
        when(accountingMapper.findJournalEntriesByCompanyAndPeriod(companyId, startDate, endDate))
            .thenReturn(mockEntries);

        // When
        List<JournalEntry> result = accountingMapper.findJournalEntriesByCompanyAndPeriod(companyId, startDate, endDate);

        // Then
        assertThat(result).isNotNull();
        assertThat(result).hasSize(2);
        
        verify(accountingMapper).findJournalEntriesByCompanyAndPeriod(companyId, startDate, endDate);
    }

    @Test
    @DisplayName("계정과목별 잔액 집계 테스트")
    void shouldGetAccountBalances() {
        // Given
        String companyId = "company-001";
        LocalDate asOfDate = LocalDate.of(2025, 7, 22);
        
        List<Map<String, Object>> mockBalances = Arrays.asList(
            createBalanceMap("1100", "현금", "자산", "10000"),
            createBalanceMap("4100", "매출", "수익", "15000")
        );
        
        when(accountingMapper.getAccountBalances(companyId, asOfDate))
            .thenReturn(mockBalances);

        // When
        List<Map<String, Object>> result = accountingMapper.getAccountBalances(companyId, asOfDate);

        // Then
        assertThat(result).isNotNull();
        assertThat(result).hasSize(2);
        assertThat(result.get(0).get("account_code")).isEqualTo("1100");
        assertThat(result.get(1).get("account_code")).isEqualTo("4100");
        
        verify(accountingMapper).getAccountBalances(companyId, asOfDate);
    }

    @Test
    @DisplayName("손익계산서 데이터 조회 테스트")
    void shouldGetIncomeStatementData() {
        // Given
        String companyId = "company-001";
        LocalDate periodStart = LocalDate.of(2025, 7, 1);
        LocalDate periodEnd = LocalDate.of(2025, 7, 31);
        
        List<Map<String, Object>> mockData = Arrays.asList(
            createIncomeMap("4100", "매출", "수익", "100000"),
            createIncomeMap("5100", "매출원가", "비용", "60000")
        );
        
        when(accountingMapper.getIncomeStatementData(companyId, periodStart, periodEnd))
            .thenReturn(mockData);

        // When
        List<Map<String, Object>> result = accountingMapper.getIncomeStatementData(companyId, periodStart, periodEnd);

        // Then
        assertThat(result).isNotNull();
        assertThat(result).hasSize(2);
        assertThat(result.get(0).get("account_type")).isEqualTo("수익");
        assertThat(result.get(1).get("account_type")).isEqualTo("비용");
        
        verify(accountingMapper).getIncomeStatementData(companyId, periodStart, periodEnd);
    }

    // Helper methods
    private ChartOfAccount createAccount(String code, String name, String type) {
        ChartOfAccount account = new ChartOfAccount();
        account.setAccountCode(code);
        account.setAccountName(name);
        account.setAccountType(type);
        return account;
    }
    
    private JournalEntryDetail createJournalEntryDetail(Long journalEntryId, String accountCode, String debitAmount, String creditAmount) {
        JournalEntryDetail detail = new JournalEntryDetail();
        detail.setJournalEntryId(journalEntryId);
        detail.setAccountCode(accountCode);
        detail.setDebitAmount(Long.parseLong(debitAmount));
        detail.setCreditAmount(Long.parseLong(creditAmount));
        return detail;
    }
    
    private JournalEntry createMockJournalEntry(String description) {
        JournalEntry entry = new JournalEntry();
        entry.setDescription(description);
        entry.setEntryDate(LocalDate.now());
        return entry;
    }
    
    private Map<String, Object> createBalanceMap(String accountCode, String accountName, String accountType, String balance) {
        Map<String, Object> map = new HashMap<>();
        map.put("account_code", accountCode);
        map.put("account_name", accountName);
        map.put("account_type", accountType);
        map.put("balance", new BigDecimal(balance));
        return map;
    }
    
    private Map<String, Object> createIncomeMap(String accountCode, String accountName, String accountType, String periodAmount) {
        Map<String, Object> map = new HashMap<>();
        map.put("account_code", accountCode);
        map.put("account_name", accountName);
        map.put("account_type", accountType);
        map.put("period_amount", new BigDecimal(periodAmount));
        return map;
    }
}
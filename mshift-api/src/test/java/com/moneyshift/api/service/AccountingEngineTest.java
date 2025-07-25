package com.moneyshift.api.service;

import com.moneyshift.api.model.*;
import com.moneyshift.api.mapper.AccountingMapper;
import com.moneyshift.api.mapper.TransactionMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * TDD: AccountingEngine 테스트 - 복식부기 엔진 비즈니스 로직 검증
 * 거래 내역을 분석하여 자동으로 복식부기 분개를 생성하는 시스템을 테스트합니다.
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("AccountingEngine TDD - 복식부기 엔진 서비스 테스트")
class AccountingEngineTest {

    @Mock
    private AccountingMapper accountingMapper;
    
    @Mock
    private TransactionMapper transactionMapper;
    
    @Mock
    private TagAccountMappingService tagAccountMappingService;
    
    @InjectMocks
    private AccountingEngine accountingEngine;
    
    private TransactionToJournalRequest testRequest;
    private TransactionEntity testTransaction;
    private JournalEntry testJournalEntry;
    private List<ChartOfAccount> testChartOfAccounts;

    @BeforeEach
    void setUp() {
        // 테스트용 거래 → 분개 변환 요청
        testRequest = TransactionToJournalRequest.builder()
                .transactionId(1L)
                .companyId("test-company")
                .build();
        
        // 테스트용 거래 데이터
        testTransaction = TransactionEntity.builder()
                .id(1L)
                .companyId("test-company")
                .transactionDate(LocalDate.now())
                .rawText("사무용품 구매")
                .amount(50000L)
                .transactionType("EXPENSE")
                .finalSuggestedTag("사무용품")
                .build();
        
        // 테스트용 분개
        testJournalEntry = JournalEntry.builder()
                .id(1L)
                .companyId("test-company")
                .entryDate(LocalDate.now())
                .description("사무용품 구매")
                .referenceType("TRANSACTION")
                .referenceId(1L)
                .totalAmount(new BigDecimal("50000"))
                .status("DRAFT")
                .createdBy("SYSTEM")
                .createdAt(LocalDateTime.now())
                .build();
        
        // 테스트 계정과목 준비
        testChartOfAccounts = Arrays.asList(
            createAccount("1120", "보통예금", "자산"),
            createAccount("5130", "소모품비", "비용"),
            createAccount("4110", "매출", "수익")
        );
    }

    @Test
    @DisplayName("TDD: 거래 → 분개 변환 성공 테스트 (신규 생성)")
    void should_ProcessTransaction_When_ValidTransactionProvided() {
        // Given
        when(accountingMapper.findJournalEntryByReference("TRANSACTION", 1L))
            .thenReturn(null); // 기존 분개 없음
        
        when(transactionMapper.findById(1L))
            .thenReturn(testTransaction);
        
        when(tagAccountMappingService.getAccountCodeByTag("사무용품", testTransaction))
            .thenReturn("5130"); // 소모품비
        
        when(accountingMapper.findAccountByCode("5130"))
            .thenReturn(createAccount("5130", "소모품비", "비용"));
        
        when(accountingMapper.findAccountByCode("1120"))
            .thenReturn(createAccount("1120", "보통예금", "자산"));
        
        // 분개 저장 성공 (ID 설정)
        doAnswer(invocation -> {
            JournalEntry entry = invocation.getArgument(0);
            entry.setId(1L); // ID 설정
            return null;
        }).when(accountingMapper).insertJournalEntry(any(JournalEntry.class));
        
        doNothing().when(accountingMapper).insertJournalEntryDetail(any(JournalEntryDetail.class));
        
        // 분개 검증 성공
        Map<String, Object> balanceResult = new HashMap<>();
        balanceResult.put("total_debit", new BigDecimal("50000"));
        balanceResult.put("total_credit", new BigDecimal("50000"));
        when(accountingMapper.validateJournalEntryBalance(1L))
            .thenReturn(balanceResult);

        // When
        JournalEntry result = accountingEngine.processTransaction(testRequest);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getCompanyId()).isEqualTo("test-company");
        assertThat(result.getDescription()).isEqualTo("사무용품 구매");
        assertThat(result.getReferenceType()).isEqualTo("TRANSACTION");
        assertThat(result.getReferenceId()).isEqualTo(1L);
        assertThat(result.getTotalAmount()).isEqualByComparingTo(new BigDecimal("50000"));
        assertThat(result.getStatus()).isEqualTo("DRAFT");
        assertThat(result.getCreatedBy()).isEqualTo("SYSTEM");
        
        // 복식부기 상세 검증
        assertThat(result.getDetails()).hasSize(2);
        
        // 차변: 소모품비 50,000원
        JournalEntryDetail debitDetail = result.getDetails().stream()
            .filter(d -> d.getDebitAmount().compareTo(BigDecimal.ZERO) > 0)
            .findFirst().orElse(null);
        assertThat(debitDetail).isNotNull();
        assertThat(debitDetail.getAccountCode()).isEqualTo("5130");
        assertThat(debitDetail.getDebitAmount()).isEqualByComparingTo(new BigDecimal("50000"));
        assertThat(debitDetail.getCreditAmount()).isEqualByComparingTo(BigDecimal.ZERO);
        
        // 대변: 보통예금 50,000원
        JournalEntryDetail creditDetail = result.getDetails().stream()
            .filter(d -> d.getCreditAmount().compareTo(BigDecimal.ZERO) > 0)
            .findFirst().orElse(null);
        assertThat(creditDetail).isNotNull();
        assertThat(creditDetail.getAccountCode()).isEqualTo("1120");
        assertThat(creditDetail.getDebitAmount()).isEqualByComparingTo(BigDecimal.ZERO);
        assertThat(creditDetail.getCreditAmount()).isEqualByComparingTo(new BigDecimal("50000"));
        
        // 메소드 호출 검증
        verify(accountingMapper).findJournalEntryByReference("TRANSACTION", 1L);
        verify(transactionMapper).findById(1L);
        verify(tagAccountMappingService).getAccountCodeByTag("사무용품", testTransaction);
        verify(accountingMapper).insertJournalEntry(any(JournalEntry.class));
        verify(accountingMapper, times(2)).insertJournalEntryDetail(any(JournalEntryDetail.class));
        verify(accountingMapper).validateJournalEntryBalance(1L);
    }

    @Test
    @DisplayName("TDD: 기존 분개 발견 시 기존 분개 반환 테스트")
    void should_ReturnExistingJournalEntry_When_ExistingJournalEntryFound() {
        // Given
        JournalEntry existingEntry = JournalEntry.builder()
            .id(2L)
            .companyId("test-company")
            .description("기존 분개")
            .build();
        
        when(accountingMapper.findJournalEntryByReference("TRANSACTION", 1L))
            .thenReturn(existingEntry);
        
        // 기존 분개 상세 포함하여 조회
        List<JournalEntryDetail> existingDetails = Arrays.asList(
            createJournalEntryDetail(2L, 1, "5130", "50000", "0"),
            createJournalEntryDetail(2L, 2, "1120", "0", "50000")
        );
        
        when(accountingMapper.findJournalEntryById(2L))
            .thenReturn(existingEntry);
        when(accountingMapper.findJournalEntryDetails(2L))
            .thenReturn(existingDetails);

        // When
        JournalEntry result = accountingEngine.processTransaction(testRequest);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(2L);
        assertThat(result.getDescription()).isEqualTo("기존 분개");
        assertThat(result.getDetails()).hasSize(2);
        
        // 새로운 분개 생성 관련 메소드는 호출되지 않아야 함
        verify(transactionMapper, never()).findById(anyLong());
        verify(accountingMapper, never()).insertJournalEntry(any(JournalEntry.class));
        
        // 기존 분개 조회 관련 메소드만 호출
        verify(accountingMapper).findJournalEntryByReference("TRANSACTION", 1L);
        verify(accountingMapper).findJournalEntryById(2L);
        verify(accountingMapper).findJournalEntryDetails(2L);
    }

    @Test
    @DisplayName("TDD: 강제 재생성 모드 테스트")
    void should_ForceRegenerateJournalEntry_When_ForceRegenerateIsTrue() {
        // Given
        testRequest.setForceRegenerate(true);
        
        // 기존 분개가 있더라도 조회하지 않음
        when(transactionMapper.findById(1L))
            .thenReturn(testTransaction);
        
        when(tagAccountMappingService.getAccountCodeByTag("사무용품", testTransaction))
            .thenReturn("5130");
        
        when(accountingMapper.findAccountByCode("5130"))
            .thenReturn(createAccount("5130", "소모품비", "비용"));
        
        when(accountingMapper.findAccountByCode("1120"))
            .thenReturn(createAccount("1120", "보통예금", "자산"));
        
        doAnswer(invocation -> {
            JournalEntry entry = invocation.getArgument(0);
            entry.setId(3L);
            return null;
        }).when(accountingMapper).insertJournalEntry(any(JournalEntry.class));
        
        doNothing().when(accountingMapper).insertJournalEntryDetail(any(JournalEntryDetail.class));
        
        Map<String, Object> balanceResult = new HashMap<>();
        balanceResult.put("total_debit", new BigDecimal("50000"));
        balanceResult.put("total_credit", new BigDecimal("50000"));
        when(accountingMapper.validateJournalEntryBalance(3L))
            .thenReturn(balanceResult);

        // When
        JournalEntry result = accountingEngine.processTransaction(testRequest);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(3L);
        
        // 기존 분개 조회 메소드는 호출되지 않아야 함
        verify(accountingMapper, never()).findJournalEntryByReference(anyString(), anyLong());
        
        // 새로운 분개 생성 메소드들이 호출되어야 함
        verify(transactionMapper).findById(1L);
        verify(accountingMapper).insertJournalEntry(any(JournalEntry.class));
        verify(accountingMapper, times(2)).insertJournalEntryDetail(any(JournalEntryDetail.class));
        verify(accountingMapper).validateJournalEntryBalance(3L);
    }

    @Test
    @DisplayName("TDD: 거래 정보 없음 예외 테스트")
    void should_ThrowException_When_TransactionNotFound() {
        // Given
        when(accountingMapper.findJournalEntryByReference("TRANSACTION", 1L))
            .thenReturn(null);
        
        when(transactionMapper.findById(1L))
            .thenReturn(null); // 거래 정보 없음

        // When & Then
        assertThatThrownBy(() -> accountingEngine.processTransaction(testRequest))
            .isInstanceOf(RuntimeException.class)
            .hasMessageContaining("거래 정보를 찾을 수 없습니다");
        
        verify(accountingMapper).findJournalEntryByReference("TRANSACTION", 1L);
        verify(transactionMapper).findById(1L);
        
        // 분개 생성 관련 메소드는 호출되지 않아야 함
        verify(accountingMapper, never()).insertJournalEntry(any(JournalEntry.class));
    }

    @Test
    @DisplayName("TDD: 수익 거래 분개 생성 테스트")
    void should_CreateIncomeJournalEntry_When_IncomeTransactionProvided() {
        // Given
        TransactionEntity incomeTransaction = TransactionEntity.builder()
            .id(2L)
            .companyId("test-company")
            .transactionDate(LocalDate.now())
            .rawText("매출 수입")
            .amount(100000L)
            .transactionType("INCOME")
            .finalSuggestedTag("매출")
            .build();
        
        TransactionToJournalRequest incomeRequest = TransactionToJournalRequest.builder()
            .transactionId(2L)
            .companyId("test-company")
            .forceRegenerate(false)
            .build();
        
        when(accountingMapper.findJournalEntryByReference("TRANSACTION", 2L))
            .thenReturn(null);
        
        when(transactionMapper.findById(2L))
            .thenReturn(incomeTransaction);
        
        when(tagAccountMappingService.getAccountCodeByTag("매출", incomeTransaction))
            .thenReturn("4110"); // 매출
        
        when(accountingMapper.findAccountByCode("4110"))
            .thenReturn(createAccount("4110", "매출", "수익"));
        
        when(accountingMapper.findAccountByCode("1120"))
            .thenReturn(createAccount("1120", "보통예금", "자산"));
        
        doAnswer(invocation -> {
            JournalEntry entry = invocation.getArgument(0);
            entry.setId(4L);
            return null;
        }).when(accountingMapper).insertJournalEntry(any(JournalEntry.class));
        
        doNothing().when(accountingMapper).insertJournalEntryDetail(any(JournalEntryDetail.class));
        
        Map<String, Object> balanceResult = new HashMap<>();
        balanceResult.put("total_debit", new BigDecimal("100000"));
        balanceResult.put("total_credit", new BigDecimal("100000"));
        when(accountingMapper.validateJournalEntryBalance(4L))
            .thenReturn(balanceResult);

        // When
        JournalEntry result = accountingEngine.processTransaction(incomeRequest);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getTotalAmount()).isEqualByComparingTo(new BigDecimal("100000"));
        assertThat(result.getDetails()).hasSize(2);
        
        // 차변: 보통예금 100,000원 (현금 증가)
        JournalEntryDetail debitDetail = result.getDetails().stream()
            .filter(d -> d.getDebitAmount().compareTo(BigDecimal.ZERO) > 0)
            .findFirst().orElse(null);
        assertThat(debitDetail).isNotNull();
        assertThat(debitDetail.getAccountCode()).isEqualTo("1120");
        assertThat(debitDetail.getDebitAmount()).isEqualByComparingTo(new BigDecimal("100000"));
        
        // 대변: 매출 100,000원 (수익 증가)
        JournalEntryDetail creditDetail = result.getDetails().stream()
            .filter(d -> d.getCreditAmount().compareTo(BigDecimal.ZERO) > 0)
            .findFirst().orElse(null);
        assertThat(creditDetail).isNotNull();
        assertThat(creditDetail.getAccountCode()).isEqualTo("4110");
        assertThat(creditDetail.getCreditAmount()).isEqualByComparingTo(new BigDecimal("100000"));
    }

    @Test
    @DisplayName("TDD: 분개 균형 검증 실패 예외 테스트")
    void should_ThrowException_When_JournalEntryIsNotBalanced() {
        // Given
        when(accountingMapper.findJournalEntryByReference("TRANSACTION", 1L))
            .thenReturn(null);
        
        when(transactionMapper.findById(1L))
            .thenReturn(testTransaction);
        
        when(tagAccountMappingService.getAccountCodeByTag("사무용품", testTransaction))
            .thenReturn("5130");
        
        when(accountingMapper.findAccountByCode("5130"))
            .thenReturn(createAccount("5130", "소모품비", "비용"));
        
        when(accountingMapper.findAccountByCode("1120"))
            .thenReturn(createAccount("1120", "보통예금", "자산"));
        
        doAnswer(invocation -> {
            JournalEntry entry = invocation.getArgument(0);
            entry.setId(5L);
            return null;
        }).when(accountingMapper).insertJournalEntry(any(JournalEntry.class));
        
        doNothing().when(accountingMapper).insertJournalEntryDetail(any(JournalEntryDetail.class));
        
        // 불균형 분개 (차변 ≠ 대변)
        Map<String, Object> unbalancedResult = new HashMap<>();
        unbalancedResult.put("total_debit", new BigDecimal("50000"));
        unbalancedResult.put("total_credit", new BigDecimal("40000")); // 불균형
        when(accountingMapper.validateJournalEntryBalance(5L))
            .thenReturn(unbalancedResult);

        // When & Then
        assertThatThrownBy(() -> accountingEngine.processTransaction(testRequest))
            .isInstanceOf(RuntimeException.class)
            .hasMessageContaining("분개 불균형 감지")
            .hasMessageContaining("차변=50000")
            .hasMessageContaining("대변=40000");
        
        verify(accountingMapper).validateJournalEntryBalance(5L);
    }

    @Test
    @DisplayName("TDD: 지원하지 않는 거래 유형 예외 테스트")
    void should_ThrowException_When_UnsupportedTransactionType() {
        // Given
        TransactionEntity unsupportedTransaction = TransactionEntity.builder()
            .id(3L)
            .companyId("test-company")
            .transactionDate(LocalDate.now())
            .rawText("미지원 거래")
            .amount(10000L)
            .transactionType("UNKNOWN") // 지원하지 않는 거래 유형
            .finalSuggestedTag("기타")
            .build();
        
        TransactionToJournalRequest unsupportedRequest = TransactionToJournalRequest.builder()
            .transactionId(3L)
            .companyId("test-company")
            .forceRegenerate(false)
            .build();
        
        when(accountingMapper.findJournalEntryByReference("TRANSACTION", 3L))
            .thenReturn(null);
        
        when(transactionMapper.findById(3L))
            .thenReturn(unsupportedTransaction);
        
        when(tagAccountMappingService.getAccountCodeByTag("기타", unsupportedTransaction))
            .thenReturn("5000");
        
        when(accountingMapper.findAccountByCode("5000"))
            .thenReturn(createAccount("5000", "기타비용", "비용"));
        
        when(accountingMapper.findAccountByCode("1120"))
            .thenReturn(createAccount("1120", "보통예금", "자산"));

        // When & Then
        assertThatThrownBy(() -> accountingEngine.processTransaction(unsupportedRequest))
            .isInstanceOf(RuntimeException.class)
            .hasMessageContaining("지원하지 않는 거래 유형: UNKNOWN");
    }

    @Test
    @DisplayName("TDD: 태그 매핑 실패 시 기본 계정과목 사용 테스트")
    void should_UseDefaultAccount_When_TagMappingFails() {
        // Given
        when(accountingMapper.findJournalEntryByReference("TRANSACTION", 1L))
            .thenReturn(null);
        
        when(transactionMapper.findById(1L))
            .thenReturn(testTransaction);
        
        // 태그 매핑 실패 (null 반환)
        when(tagAccountMappingService.getAccountCodeByTag("사무용품", testTransaction))
            .thenReturn(null);
        
        // 기본 계정과목들
        when(accountingMapper.findAccountByCode("5130")) // 소모품비 (기본값)
            .thenReturn(createAccount("5130", "소모품비", "비용"));
        
        when(accountingMapper.findAccountByCode("1120"))
            .thenReturn(createAccount("1120", "보통예금", "자산"));
        
        doAnswer(invocation -> {
            JournalEntry entry = invocation.getArgument(0);
            entry.setId(6L);
            return null;
        }).when(accountingMapper).insertJournalEntry(any(JournalEntry.class));
        
        doNothing().when(accountingMapper).insertJournalEntryDetail(any(JournalEntryDetail.class));
        
        Map<String, Object> balanceResult = new HashMap<>();
        balanceResult.put("total_debit", new BigDecimal("50000"));
        balanceResult.put("total_credit", new BigDecimal("50000"));
        when(accountingMapper.validateJournalEntryBalance(6L))
            .thenReturn(balanceResult);

        // When
        JournalEntry result = accountingEngine.processTransaction(testRequest);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getDetails()).hasSize(2);
        
        // 차변에 기본 계정과목(소모품비) 사용 확인
        JournalEntryDetail debitDetail = result.getDetails().stream()
            .filter(d -> d.getDebitAmount().compareTo(BigDecimal.ZERO) > 0)
            .findFirst().orElse(null);
        assertThat(debitDetail).isNotNull();
        assertThat(debitDetail.getAccountCode()).isEqualTo("5130"); // 기본값 사용
        
        verify(tagAccountMappingService).getAccountCodeByTag("사무용품", testTransaction);
        verify(accountingMapper).findAccountByCode("5130"); // 기본 계정과목 조회
    }

    @Test
    @DisplayName("TDD: 분개 상세와 함께 조회 테스트")
    void should_LoadJournalEntryWithDetails_When_JournalEntryExists() {
        // Given
        Long journalEntryId = 7L;
        
        JournalEntry mockEntry = JournalEntry.builder()
            .id(journalEntryId)
            .companyId("test-company")
            .description("테스트 분개")
            .build();
        
        List<JournalEntryDetail> mockDetails = Arrays.asList(
            createJournalEntryDetail(journalEntryId, 1, "5130", "25000", "0"),
            createJournalEntryDetail(journalEntryId, 2, "1120", "0", "25000")
        );
        
        when(accountingMapper.findJournalEntryById(journalEntryId))
            .thenReturn(mockEntry);
        
        when(accountingMapper.findJournalEntryDetails(journalEntryId))
            .thenReturn(mockDetails);

        // When
        JournalEntry result = accountingEngine.loadJournalEntryWithDetails(journalEntryId);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(journalEntryId);
        assertThat(result.getDescription()).isEqualTo("테스트 분개");
        assertThat(result.getDetails()).hasSize(2);
        assertThat(result.getDetails().get(0).getAccountCode()).isEqualTo("5130");
        assertThat(result.getDetails().get(1).getAccountCode()).isEqualTo("1120");
        
        verify(accountingMapper).findJournalEntryById(journalEntryId);
        verify(accountingMapper).findJournalEntryDetails(journalEntryId);
    }

    @Test
    @DisplayName("TDD: 존재하지 않는 분개 조회 시 null 반환 테스트")
    void should_ReturnNull_When_JournalEntryNotExists() {
        // Given
        Long nonExistentId = 999L;
        
        when(accountingMapper.findJournalEntryById(nonExistentId))
            .thenReturn(null);

        // When
        JournalEntry result = accountingEngine.loadJournalEntryWithDetails(nonExistentId);

        // Then
        assertThat(result).isNull();
        
        verify(accountingMapper).findJournalEntryById(nonExistentId);
        // 분개가 없으면 상세 조회는 호출되지 않아야 함
        verify(accountingMapper, never()).findJournalEntryDetails(anyLong());
    }
    
    @Test
    @DisplayName("TDD: 계정과목 목록 조회 테스트")
    void should_GetChartOfAccounts_When_Called() {
        // Given
        when(accountingMapper.findAllActiveAccounts())
            .thenReturn(testChartOfAccounts);

        // When
        List<ChartOfAccount> result = accountingEngine.getChartOfAccounts();

        // Then
        assertThat(result).isNotNull();
        assertThat(result).hasSize(3);
        assertThat(result).extracting(ChartOfAccount::getAccountCode)
            .containsExactlyInAnyOrder("1120", "5130", "4110");
        
        verify(accountingMapper).findAllActiveAccounts();
    }
    
    @Test
    @DisplayName("TDD: 회사별 기간별 분개 목록 조회 테스트")
    void should_GetJournalEntries_When_ValidCompanyAndPeriodProvided() {
        // Given
        String companyId = "test-company";
        LocalDate startDate = LocalDate.of(2025, 7, 1);
        LocalDate endDate = LocalDate.of(2025, 7, 31);
        
        List<JournalEntry> mockEntries = Arrays.asList(
            createMockJournalEntry("분개 1"),
            createMockJournalEntry("분개 2")
        );
        
        when(accountingMapper.findJournalEntriesByCompanyAndPeriod(companyId, startDate, endDate))
            .thenReturn(mockEntries);

        // When
        List<JournalEntry> result = accountingEngine.getJournalEntries(companyId, startDate, endDate);

        // Then
        assertThat(result).isNotNull();
        assertThat(result).hasSize(2);
        assertThat(result).extracting(JournalEntry::getDescription)
            .containsExactlyInAnyOrder("분개 1", "분개 2");
        
        verify(accountingMapper).findJournalEntriesByCompanyAndPeriod(companyId, startDate, endDate);
    }

    @Test
    @DisplayName("TDD: 대차대조표 데이터 생성 테스트")
    void should_GenerateBalanceSheetData_When_ValidCompanyAndDateProvided() {
        // Given
        String companyId = "test-company";
        LocalDate asOfDate = LocalDate.of(2025, 7, 24);
        
        List<Map<String, Object>> mockBalances = Arrays.asList(
            createBalanceMap("1120", "보통예금", "자산", "1000000"),
            createBalanceMap("5130", "소모품비", "비용", "200000"),
            createBalanceMap("2100", "외상매입금", "부채", "300000"),
            createBalanceMap("3100", "자본금", "자본", "900000")
        );
        
        when(accountingMapper.getAccountBalances(companyId, asOfDate))
            .thenReturn(mockBalances);

        // When
        Map<String, Object> result = accountingEngine.generateBalanceSheetData(companyId, asOfDate);

        // Then
        assertThat(result).isNotNull();
        
        // 자산 검증
        @SuppressWarnings("unchecked")
        Map<String, Long> assets = (Map<String, Long>) result.get("자산");
        assertThat(assets).containsEntry("보통예금", 1000000L);
        assertThat(result.get("자산합계")).isEqualTo(1000000L);
        
        // 부채 검증
        @SuppressWarnings("unchecked")
        Map<String, Long> liabilities = (Map<String, Long>) result.get("부채");
        assertThat(liabilities).containsEntry("외상매입금", 300000L);
        assertThat(result.get("부채합계")).isEqualTo(300000L);
        
        // 자본 검증
        @SuppressWarnings("unchecked")
        Map<String, Long> equity = (Map<String, Long>) result.get("자본");
        assertThat(equity).containsEntry("자본금", 900000L);
        assertThat(result.get("자본합계")).isEqualTo(900000L);
        
        // 대차 균형 검증
        assertThat(result.get("부채자본합계")).isEqualTo(1200000L);
        
        verify(accountingMapper).getAccountBalances(companyId, asOfDate);
    }
    
    @Test
    @DisplayName("TDD: 손익계산서 데이터 생성 테스트")
    void should_GenerateIncomeStatementData_When_ValidCompanyAndPeriodProvided() {
        // Given
        String companyId = "test-company";
        LocalDate periodStart = LocalDate.of(2025, 7, 1);
        LocalDate periodEnd = LocalDate.of(2025, 7, 31);
        
        List<Map<String, Object>> mockData = Arrays.asList(
            createIncomeMap("4110", "매출", "수익", "1000000"),
            createIncomeMap("4120", "기타수익", "수익", "100000"),
            createIncomeMap("5100", "매출원가", "비용", "600000"),
            createIncomeMap("5130", "소모품비", "비용", "50000")
        );
        
        when(accountingMapper.getIncomeStatementData(companyId, periodStart, periodEnd))
            .thenReturn(mockData);

        // When
        Map<String, Object> result = accountingEngine.generateIncomeStatementData(companyId, periodStart, periodEnd);

        // Then
        assertThat(result).isNotNull();
        
        // 수익 검증
        @SuppressWarnings("unchecked")
        Map<String, Long> revenues = (Map<String, Long>) result.get("수익");
        assertThat(revenues).containsEntry("매출", 1000000L);
        assertThat(revenues).containsEntry("기타수익", 100000L);
        assertThat(result.get("수익합계")).isEqualTo(1100000L);
        
        // 비용 검증
        @SuppressWarnings("unchecked")
        Map<String, Long> expenses = (Map<String, Long>) result.get("비용");
        assertThat(expenses).containsEntry("매출원가", 600000L);
        assertThat(expenses).containsEntry("소모품비", 50000L);
        assertThat(result.get("비용합계")).isEqualTo(650000L);
        
        // 당기순이익 검증
        assertThat(result.get("당기순이익")).isEqualTo(450000L); // 1,100,000 - 650,000
        
        verify(accountingMapper).getIncomeStatementData(companyId, periodStart, periodEnd);
    }

    // ========== Helper Methods ==========
    
    private ChartOfAccount createAccount(String code, String name, String type) {
        return ChartOfAccount.builder()
            .accountCode(code)
            .accountName(name)
            .accountType(type)
            .isDebitNormal("자산".equals(type) || "비용".equals(type))
            .isActive(true)
            .build();
    }
    
    private JournalEntryDetail createJournalEntryDetail(Long journalEntryId, int lineNumber, String accountCode, String debitAmount, String creditAmount) {
        return JournalEntryDetail.builder()
            .journalEntryId(journalEntryId)
            .lineNumber(lineNumber)
            .accountCode(accountCode)
            .debitAmount(new BigDecimal(debitAmount))
            .creditAmount(new BigDecimal(creditAmount))
            .build();
    }
    
    private JournalEntry createMockJournalEntry(String description) {
        return JournalEntry.builder()
            .description(description)
            .entryDate(LocalDate.now())
            .status("DRAFT")
            .build();
    }
    
    private Map<String, Object> createBalanceMap(String accountCode, String accountName, String accountType, String balance) {
        Map<String, Object> map = new HashMap<>();
        map.put("account_code", accountCode);
        map.put("account_name", accountName);
        map.put("account_type", accountType);
        map.put("balance", Long.valueOf(balance));
        return map;
    }
    
    private Map<String, Object> createIncomeMap(String accountCode, String accountName, String accountType, String periodAmount) {
        Map<String, Object> map = new HashMap<>();
        map.put("account_code", accountCode);
        map.put("account_name", accountName);
        map.put("account_type", accountType);
        map.put("period_amount", Long.valueOf(periodAmount));
        return map;
    }
}
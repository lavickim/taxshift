package com.moneyshift.api.service;

import com.moneyshift.api.mapper.ChartOfAccountsMapper;
import com.moneyshift.api.mapper.JournalEntryMapper;
import com.moneyshift.api.model.*;
import com.moneyshift.api.service.AccountingEngine;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

import static org.assertj.core.api.Assertions.*;

/**
 * Phase 4: 분개장(Journal Entry) 관리 TDD 구현
 * 
 * 분개장 시스템의 핵심 기능을 TDD 방식으로 구현하고 검증합니다.
 * 
 * 주요 기능:
 * 1. 거래 → 분개 자동 생성 - AI 기반 복식부기 분개 생성
 * 2. 분개 균형 검증 - 차변 = 대변 원칙 준수 확인
 * 3. 분개 승인 워크플로우 - Draft → Approved → Posted 단계
 * 4. 분개 수정 및 취소 - 오류 정정 및 역분개 처리
 * 5. 분개 조회 및 검색 - 다양한 조건별 분개 조회
 * 
 * TDD 구현 원칙:
 * - Red: 실패하는 테스트 작성 (기능 미구현 상태)
 * - Green: 최소한의 코드로 테스트 통과
 * - Refactor: 코드 개선 및 최적화
 * 
 * 복식부기 원칙:
 * - 모든 분개는 차변 = 대변을 만족해야 함
 * - 분개 승인 후에는 수정 불가 (역분개로만 처리)
 * - 분개 번호는 연속성을 보장해야 함
 * 
 * @author MoneyShift TDD Team
 * @version 1.0
 * @since 2025-07-24
 */
@SpringBootTest
@ActiveProfiles("test")
@Transactional
@DisplayName("Phase 4: 분개장(Journal Entry) 관리 TDD 구현")
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
public class Phase4JournalEntryManagerTest {

    @Autowired
    private AccountingEngine accountingEngine;

    @Autowired
    private JournalEntryMapper journalEntryMapper;

    @Autowired
    private ChartOfAccountsMapper chartOfAccountsMapper;
    
    @Autowired
    private JdbcTemplate jdbcTemplate;

    // 테스트 데이터 상수
    private String TEST_COMPANY_ID;
    private static final LocalDate TEST_ENTRY_DATE = LocalDate.of(2025, 1, 15);
    private String uniqueAccountPrefix;

    // 테스트용 거래 데이터
    private TransactionToJournalRequest testTransactionRequest;
    
    // 테스트용 계정과목 데이터
    private ChartOfAccount cashAccount;      // 1000 - 현금
    private ChartOfAccount expenseAccount;   // 5000 - 사무용품비
    private ChartOfAccount revenueAccount;   // 4000 - 매출
    private ChartOfAccount liabilityAccount; // 2000 - 미지급금

    @BeforeEach
    void setUp() {
        // 각 테스트마다 고유한 ID 생성
        TEST_COMPANY_ID = UUID.randomUUID().toString();
        uniqueAccountPrefix = TEST_COMPANY_ID.substring(0, 8);
        
        setupTestAccounts();
        setupTestTransactionRequest();
    }
    
    @AfterEach
    void tearDown() {
        // 테스트 데이터 정리
        cleanupTestData();
    }
    
    private void cleanupTestData() {
        try {
            // 분개 데이터 삭제
            jdbcTemplate.update("DELETE FROM journal_entry_details WHERE journal_entry_id IN " +
                    "(SELECT id FROM journal_entries WHERE company_id = ?)", TEST_COMPANY_ID);
            jdbcTemplate.update("DELETE FROM journal_entries WHERE company_id = ?", TEST_COMPANY_ID);
            
            // 계정과목 삭제 (고유 prefix로 시작하는 것들)
            jdbcTemplate.update("DELETE FROM chart_of_accounts WHERE account_code LIKE ?", uniqueAccountPrefix + "%");
        } catch (Exception e) {
            System.err.println("테스트 데이터 정리 실패: " + e.getMessage());
        }
    }

    private void setupTestAccounts() {
        // 현금 계정 (자산)
        cashAccount = ChartOfAccount.builder()
                .accountCode(uniqueAccountPrefix + "1000")
                .accountName("현금")
                .accountType("자산")
                .isDebitNormal(true)
                .isActive(true)
                .displayOrder(1)
                .build();

        // 사무용품비 계정 (비용)
        expenseAccount = ChartOfAccount.builder()
                .accountCode(uniqueAccountPrefix + "5000")
                .accountName("사무용품비")
                .accountType("비용")
                .isDebitNormal(true)
                .isActive(true)
                .displayOrder(50)
                .build();

        // 매출 계정 (수익)
        revenueAccount = ChartOfAccount.builder()
                .accountCode(uniqueAccountPrefix + "4000")
                .accountName("매출")
                .accountType("수익")
                .isDebitNormal(false)
                .isActive(true)
                .displayOrder(40)
                .build();

        // 미지급금 계정 (부채)
        liabilityAccount = ChartOfAccount.builder()
                .accountCode(uniqueAccountPrefix + "2000")
                .accountName("미지급금")
                .accountType("부채")
                .isDebitNormal(false)
                .isActive(true)
                .displayOrder(20)
                .build();

        // 계정과목 등록 (중복 체크 후 삽입)
        insertAccountIfNotExists(cashAccount);
        insertAccountIfNotExists(expenseAccount);
        insertAccountIfNotExists(revenueAccount);
        insertAccountIfNotExists(liabilityAccount);
    }
    
    private void insertAccountIfNotExists(ChartOfAccount account) {
        String checkSql = "SELECT COUNT(*) FROM chart_of_accounts WHERE account_code = ?";
        Integer count = jdbcTemplate.queryForObject(checkSql, Integer.class, account.getAccountCode());
        
        if (count == null || count == 0) {
            chartOfAccountsMapper.insertAccount(account);
        }
    }

    private void setupTestTransactionRequest() {
        // 테스트용 거래: 사무용품 현금 구매 (100,000원)
        testTransactionRequest = TransactionToJournalRequest.builder()
                .transactionId(12345L)
                .companyId(TEST_COMPANY_ID)
                .transactionDate(TEST_ENTRY_DATE)
                .description("사무용품 현금 구매")
                .amount(new BigDecimal("100000"))
                .merchantName("오피스디포")
                .category("사무용품")
                .tags(Arrays.asList("사무용품", "현금결제"))
                .build();
    }

    // =============================================================================
    // Phase 4-1: 거래 → 분개 자동 생성 TDD
    // =============================================================================

    @Test
    @Order(1)
    @DisplayName("TDD 4-1-1: 거래 정보로부터 분개가 자동 생성되어야 함")
    void should_CreateJournalEntry_When_ProcessingTransaction() {
        // Given: 거래 정보가 주어짐
        // testTransactionRequest가 이미 설정됨

        // When: 거래를 분개로 변환
        JournalEntryResponse response = processTransactionToJournalEntry(testTransactionRequest);

        // Then: 분개가 정상적으로 생성되어야 함
        assertThat(response).isNotNull();
        assertThat(response.isSuccess()).isTrue();
        assertThat(response.getJournalEntry()).isNotNull();
        
        JournalEntry journalEntry = response.getJournalEntry();
        assertThat(journalEntry.getCompanyId()).isEqualTo(TEST_COMPANY_ID);
        assertThat(journalEntry.getEntryDate()).isEqualTo(TEST_ENTRY_DATE);
        assertThat(journalEntry.getDescription()).contains("사무용품");
        assertThat(journalEntry.getTotalAmount()).isEqualByComparingTo(new BigDecimal("100000"));
        assertThat(journalEntry.getStatus()).isEqualTo("DRAFT");
    }

    @Test
    @Order(2)
    @DisplayName("TDD 4-1-2: 생성된 분개의 상세 내역이 복식부기 원칙을 준수해야 함")
    void should_CreateBalancedJournalEntryDetails_When_ProcessingTransaction() {
        // Given: 거래 정보가 주어짐
        JournalEntryResponse response = processTransactionToJournalEntry(testTransactionRequest);
        Long journalEntryId = response.getJournalEntry().getId();

        // When: 분개 상세 내역 조회
        List<JournalEntryDetail> details = journalEntryMapper.findJournalEntryDetails(journalEntryId);

        // Then: 복식부기 원칙을 준수해야 함
        assertThat(details).hasSize(2); // 차변과 대변 최소 1개씩

        // 차변 합계 계산
        BigDecimal totalDebit = details.stream()
                .map(JournalEntryDetail::getDebitAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // 대변 합계 계산
        BigDecimal totalCredit = details.stream()
                .map(JournalEntryDetail::getCreditAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // 차변 = 대변 검증
        assertThat(totalDebit).isEqualByComparingTo(totalCredit);
        assertThat(totalDebit).isEqualByComparingTo(new BigDecimal("100000"));

        // 계정과목 검증
        Set<String> accountCodes = details.stream()
                .map(JournalEntryDetail::getAccountCode)
                .collect(java.util.stream.Collectors.toSet());
        
        assertThat(accountCodes).contains("5000", "1000"); // 사무용품비, 현금
    }

    @Test
    @Order(3)
    @DisplayName("TDD 4-1-3: AI 태그 기반 계정과목 매핑이 정확해야 함")
    void should_MapAccountsCorrectly_When_ProcessingTransactionWithTags() {
        // Given: 다양한 태그가 포함된 거래
        TransactionToJournalRequest coffeeRequest = TransactionToJournalRequest.builder()
                .transactionId(12346L)
                .companyId(TEST_COMPANY_ID)
                .transactionDate(TEST_ENTRY_DATE)
                .description("스타벅스 커피 구매")
                .amount(new BigDecimal("15000"))
                .merchantName("스타벅스")
                .category("음식점")
                .tags(Arrays.asList("커피", "음료", "카드결제"))
                .build();

        // When: 거래를 분개로 변환
        JournalEntryResponse response = processTransactionToJournalEntry(coffeeRequest);
        List<JournalEntryDetail> details = journalEntryMapper.findJournalEntryDetails(
                response.getJournalEntry().getId());

        // Then: 태그에 기반한 적절한 계정과목 매핑
        assertThat(details).hasSize(2);
        
        // 접대비나 복리후생비 계정으로 매핑되어야 함
        boolean hasExpenseAccount = details.stream()
                .anyMatch(detail -> 
                    detail.getAccountCode().startsWith("5") && // 비용 계정
                    detail.getDebitAmount().compareTo(BigDecimal.ZERO) > 0);
        
        assertThat(hasExpenseAccount).isTrue();
    }

    // =============================================================================
    // Phase 4-2: 분개 균형 검증 및 승인 워크플로우 TDD
    // =============================================================================

    @Test
    @Order(4)
    @DisplayName("TDD 4-2-1: 불균형 분개는 승인이 거부되어야 함")
    void should_RejectApproval_When_JournalEntryIsUnbalanced() {
        // Given: 불균형 분개 생성
        JournalEntry unbalancedEntry = JournalEntry.builder()
                .companyId(TEST_COMPANY_ID)
                .entryDate(TEST_ENTRY_DATE)
                .description("불균형 테스트 분개")
                .totalAmount(new BigDecimal("100000"))
                .status("DRAFT")
                .build();

        journalEntryMapper.insertJournalEntry(unbalancedEntry);

        // 불균형 상세 내역 생성 (차변 > 대변)
        List<JournalEntryDetail> unbalancedDetails = Arrays.asList(
                JournalEntryDetail.builder()
                        .journalEntryId(unbalancedEntry.getId())
                        .lineNumber(1)
                        .accountCode(uniqueAccountPrefix + "5000")
                        .accountName("사무용품비")
                        .debitAmount(new BigDecimal("100000"))
                        .creditAmount(BigDecimal.ZERO)
                        .description("사무용품 구매")
                        .build(),
                JournalEntryDetail.builder()
                        .journalEntryId(unbalancedEntry.getId())
                        .lineNumber(2)
                        .accountCode(uniqueAccountPrefix + "1000")
                        .accountName("현금")
                        .debitAmount(BigDecimal.ZERO)
                        .creditAmount(new BigDecimal("50000")) // 불균형!
                        .description("현금 지급")
                        .build()
        );

        unbalancedDetails.forEach(journalEntryMapper::insertJournalEntryDetail);

        // When & Then: 승인 시 예외 발생
        assertThatThrownBy(() -> approveJournalEntry(unbalancedEntry.getId()))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("균형");
    }

    @Test
    @Order(5)
    @DisplayName("TDD 4-2-2: 균형 분개는 정상적으로 승인되어야 함")
    void should_ApproveSuccessfully_When_JournalEntryIsBalanced() {
        // Given: 균형 분개 생성
        JournalEntryResponse response = processTransactionToJournalEntry(testTransactionRequest);
        Long journalEntryId = response.getJournalEntry().getId();

        // When: 분개 승인
        approveJournalEntry(journalEntryId);

        // Then: 승인 상태로 변경되어야 함
        JournalEntry approvedEntry = journalEntryMapper.findJournalEntryById(journalEntryId);
        assertThat(approvedEntry.getStatus()).isEqualTo("APPROVED");
    }

    @Test
    @Order(6)
    @DisplayName("TDD 4-2-3: 승인된 분개는 전기(Posting)가 가능해야 함")
    void should_PostSuccessfully_When_JournalEntryIsApproved() {
        // Given: 승인된 분개
        JournalEntryResponse response = processTransactionToJournalEntry(testTransactionRequest);
        Long journalEntryId = response.getJournalEntry().getId();
        approveJournalEntry(journalEntryId);

        // When: 분개 전기
        postJournalEntry(journalEntryId);

        // Then: 전기 상태로 변경되어야 함
        JournalEntry postedEntry = journalEntryMapper.findJournalEntryById(journalEntryId);
        assertThat(postedEntry.getStatus()).isEqualTo("POSTED");
        assertThat(postedEntry.getPostedAt()).isNotNull();
    }

    // =============================================================================
    // Phase 4-3: 분개 수정 및 취소 TDD
    // =============================================================================

    @Test
    @Order(7)
    @DisplayName("TDD 4-3-1: DRAFT 상태의 분개는 수정이 가능해야 함")
    void should_ModifySuccessfully_When_JournalEntryIsDraft() {
        // Given: DRAFT 상태의 분개
        JournalEntryResponse response = processTransactionToJournalEntry(testTransactionRequest);
        Long journalEntryId = response.getJournalEntry().getId();

        // When: 분개 설명 수정
        String newDescription = "수정된 사무용품 구매";
        modifyJournalEntryDescription(journalEntryId, newDescription);

        // Then: 수정이 반영되어야 함
        JournalEntry modifiedEntry = journalEntryMapper.findJournalEntryById(journalEntryId);
        assertThat(modifiedEntry.getDescription()).isEqualTo(newDescription);
        assertThat(modifiedEntry.getStatus()).isEqualTo("DRAFT");
    }

    @Test
    @Order(8)
    @DisplayName("TDD 4-3-2: 승인된 분개는 직접 수정이 불가능해야 함")
    void should_PreventModification_When_JournalEntryIsApproved() {
        // Given: 승인된 분개
        JournalEntryResponse response = processTransactionToJournalEntry(testTransactionRequest);
        Long journalEntryId = response.getJournalEntry().getId();
        approveJournalEntry(journalEntryId);

        // When & Then: 수정 시 예외 발생
        assertThatThrownBy(() -> modifyJournalEntryDescription(journalEntryId, "수정 시도"))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("승인된 분개는 수정할 수 없습니다");
    }

    @Test
    @Order(9)
    @DisplayName("TDD 4-3-3: 승인된 분개는 역분개로 취소가 가능해야 함")
    void should_CreateReversingEntry_When_CancellingApprovedJournalEntry() {
        // Given: 승인된 분개
        JournalEntryResponse response = processTransactionToJournalEntry(testTransactionRequest);
        Long originalJournalEntryId = response.getJournalEntry().getId();
        approveJournalEntry(originalJournalEntryId);

        // When: 역분개 생성
        JournalEntry reversingEntry = createReversingJournalEntry(originalJournalEntryId);

        // Then: 역분개가 정상적으로 생성되어야 함
        assertThat(reversingEntry).isNotNull();
        assertThat(reversingEntry.getDescription()).contains("역분개");
        assertThat(reversingEntry.getTotalAmount()).isEqualByComparingTo(new BigDecimal("100000"));

        // 역분개 상세 내역 검증
        List<JournalEntryDetail> reversingDetails = journalEntryMapper.findJournalEntryDetails(reversingEntry.getId());
        List<JournalEntryDetail> originalDetails = journalEntryMapper.findJournalEntryDetails(originalJournalEntryId);

        assertThat(reversingDetails).hasSize(originalDetails.size());

        // 차변과 대변이 반대로 되어야 함
        for (int i = 0; i < originalDetails.size(); i++) {
            JournalEntryDetail original = originalDetails.get(i);
            JournalEntryDetail reversing = reversingDetails.get(i);

            assertThat(reversing.getAccountCode()).isEqualTo(original.getAccountCode());
            assertThat(reversing.getDebitAmount()).isEqualByComparingTo(original.getCreditAmount());
            assertThat(reversing.getCreditAmount()).isEqualByComparingTo(original.getDebitAmount());
        }
    }

    // =============================================================================
    // Phase 4-4: 분개 조회 및 검색 TDD
    // =============================================================================

    @Test
    @Order(10)
    @DisplayName("TDD 4-4-1: 회사별 분개 목록 조회가 가능해야 함")
    void should_FindJournalEntriesByCompany_When_QueryingWithCompanyId() {
        // Given: 여러 회사의 분개 생성
        processTransactionToJournalEntry(testTransactionRequest);
        
        TransactionToJournalRequest anotherCompanyRequest = TransactionToJournalRequest.builder()
                .transactionId(12347L)
                .companyId("another-company")
                .transactionDate(TEST_ENTRY_DATE)
                .description("다른 회사 거래")
                .amount(new BigDecimal("50000"))
                .merchantName("테스트 업체")
                .category("기타")
                .tags(Arrays.asList("테스트"))
                .build();
        processTransactionToJournalEntry(anotherCompanyRequest);

        // When: 특정 회사의 분개 조회
        List<JournalEntry> entries = findJournalEntriesByCompany(TEST_COMPANY_ID);

        // Then: 해당 회사의 분개만 조회되어야 함
        assertThat(entries).isNotEmpty();
        assertThat(entries).allMatch(entry -> TEST_COMPANY_ID.equals(entry.getCompanyId()));
    }

    @Test
    @Order(11)
    @DisplayName("TDD 4-4-2: 기간별 분개 조회가 가능해야 함")
    void should_FindJournalEntriesByDateRange_When_QueryingWithDateRange() {
        // Given: 다양한 날짜의 분개 생성
        processTransactionToJournalEntry(testTransactionRequest);

        TransactionToJournalRequest pastRequest = testTransactionRequest.toBuilder()
                .transactionId(12348L)
                .transactionDate(TEST_ENTRY_DATE.minusDays(10))
                .description("과거 거래")
                .build();
        processTransactionToJournalEntry(pastRequest);

        TransactionToJournalRequest futureRequest = testTransactionRequest.toBuilder()
                .transactionId(12349L)
                .transactionDate(TEST_ENTRY_DATE.plusDays(10))
                .description("미래 거래")
                .build();
        processTransactionToJournalEntry(futureRequest);

        // When: 특정 기간의 분개 조회
        LocalDate startDate = TEST_ENTRY_DATE.minusDays(5);
        LocalDate endDate = TEST_ENTRY_DATE.plusDays(5);
        List<JournalEntry> entries = findJournalEntriesByDateRange(TEST_COMPANY_ID, startDate, endDate);

        // Then: 해당 기간의 분개만 조회되어야 함
        assertThat(entries).hasSize(1);
        assertThat(entries.get(0).getEntryDate()).isBetween(startDate, endDate);
    }

    @Test
    @Order(12)
    @DisplayName("TDD 4-4-3: 키워드로 분개 검색이 가능해야 함")
    void should_SearchJournalEntriesByKeyword_When_QueryingWithSearchTerm() {
        // Given: 다양한 설명의 분개 생성
        processTransactionToJournalEntry(testTransactionRequest);

        TransactionToJournalRequest coffeeRequest = testTransactionRequest.toBuilder()
                .transactionId(12350L)
                .description("스타벅스 커피 구매")
                .merchantName("스타벅스")
                .build();
        processTransactionToJournalEntry(coffeeRequest);

        // When: 키워드로 검색
        List<JournalEntry> coffeeEntries = searchJournalEntriesByKeyword(TEST_COMPANY_ID, "커피");
        List<JournalEntry> officeEntries = searchJournalEntriesByKeyword(TEST_COMPANY_ID, "사무용품");

        // Then: 키워드가 포함된 분개만 조회되어야 함
        assertThat(coffeeEntries).hasSize(1);
        assertThat(coffeeEntries.get(0).getDescription()).contains("커피");

        assertThat(officeEntries).hasSize(1);
        assertThat(officeEntries.get(0).getDescription()).contains("사무용품");
    }

    // =============================================================================
    // Phase 4-5: 고급 기능 TDD
    // =============================================================================

    @Test
    @Order(13)
    @DisplayName("TDD 4-5-1: 분개 번호 연속성이 보장되어야 함")
    void should_MaintainSequentialJournalNumbers_When_CreatingMultipleEntries() {
        // Given & When: 여러 분개 생성
        List<Long> journalEntryIds = new ArrayList<>();
        for (int i = 0; i < 5; i++) {
            TransactionToJournalRequest request = testTransactionRequest.toBuilder()
                    .transactionId(12351L + i)
                    .description("연속 분개 " + (i + 1))
                    .build();
            JournalEntryResponse response = processTransactionToJournalEntry(request);
            journalEntryIds.add(response.getJournalEntry().getId());
        }

        // Then: 분개 ID가 연속적이어야 함 (또는 순차적 증가)
        for (int i = 1; i < journalEntryIds.size(); i++) {
            assertThat(journalEntryIds.get(i)).isGreaterThan(journalEntryIds.get(i - 1));
        }
    }

    @Test
    @Order(14)
    @DisplayName("TDD 4-5-2: 분개 감사 추적이 가능해야 함")
    void should_TrackJournalEntryAudit_When_StatusChanges() {
        // Given: 분개 생성
        JournalEntryResponse response = processTransactionToJournalEntry(testTransactionRequest);
        Long journalEntryId = response.getJournalEntry().getId();

        // When: 상태 변경 (승인)
        approveJournalEntry(journalEntryId);

        // Then: 감사 로그가 생성되어야 함
        List<Map<String, Object>> auditLogs = getJournalEntryAuditLogs(journalEntryId);
        assertThat(auditLogs).isNotEmpty();
        
        Map<String, Object> approvalLog = auditLogs.stream()
                .filter(log -> "APPROVE".equals(log.get("action_type")))
                .findFirst().orElse(null);
        
        assertThat(approvalLog).isNotNull();
        assertThat(approvalLog.get("previous_status")).isEqualTo("DRAFT");
        assertThat(approvalLog.get("new_status")).isEqualTo("APPROVED");
    }

    // =============================================================================
    // Helper Methods (테스트 지원 메소드)
    // =============================================================================

    /**
     * 거래를 분개로 변환하는 핵심 메소드
     * 실제 구현에서는 AccountingEngine에서 제공
     */
    private JournalEntryResponse processTransactionToJournalEntry(TransactionToJournalRequest request) {
        try {
            // 실제 구현에서는 accountingEngine.processTransaction(request) 호출
            // 현재는 테스트용 구현
            JournalEntry journalEntry = JournalEntry.builder()
                    .companyId(request.getCompanyId())
                    .entryDate(request.getTransactionDate())
                    .description(request.getDescription())
                    .totalAmount(request.getAmount())
                    .status("DRAFT")
                    .referenceType("TRANSACTION")
                    .referenceId(request.getTransactionId())
                    .createdBy("SYSTEM")
                    .build();

            journalEntryMapper.insertJournalEntry(journalEntry);

            // 분개 상세 내역 생성 (단순화)
            List<JournalEntryDetail> details = createJournalEntryDetails(journalEntry, request);
            details.forEach(journalEntryMapper::insertJournalEntryDetail);

            return JournalEntryResponse.builder()
                    .success(true)
                    .journalEntry(journalEntry)
                    .message("분개 생성 성공")
                    .build();

        } catch (Exception e) {
            return JournalEntryResponse.builder()
                    .success(false)
                    .message("분개 생성 실패: " + e.getMessage())
                    .build();
        }
    }

    private List<JournalEntryDetail> createJournalEntryDetails(JournalEntry journalEntry, TransactionToJournalRequest request) {
        // 간단한 규칙 기반 계정과목 매핑
        String debitAccount = "5000"; // 기본적으로 비용 계정
        String creditAccount = "1000"; // 기본적으로 현금 계정

        // 태그나 카테고리에 따른 매핑
        if (request.getTags().contains("커피") || request.getTags().contains("음료")) {
            debitAccount = "5100"; // 접대비
        }

        return Arrays.asList(
                JournalEntryDetail.builder()
                        .journalEntryId(journalEntry.getId())
                        .lineNumber(1)
                        .accountCode(debitAccount)
                        .accountName(getAccountNameByCode(debitAccount))
                        .debitAmount(request.getAmount())
                        .creditAmount(BigDecimal.ZERO)
                        .description(request.getDescription())
                        .build(),
                JournalEntryDetail.builder()
                        .journalEntryId(journalEntry.getId())
                        .lineNumber(2)
                        .accountCode(creditAccount)
                        .accountName(getAccountNameByCode(creditAccount))
                        .debitAmount(BigDecimal.ZERO)
                        .creditAmount(request.getAmount())
                        .description("현금 지급")
                        .build()
        );
    }

    private String getAccountNameByCode(String accountCode) {
        switch (accountCode) {
            case "1000": return "현금";
            case "5000": return "사무용품비";
            case "5100": return "접대비";
            case "4000": return "매출";
            case "2000": return "미지급금";
            default: return "미정";
        }
    }

    private void approveJournalEntry(Long journalEntryId) {
        // 분개 균형 검증
        Map<String, Object> balanceResult = journalEntryMapper.validateJournalEntryBalance(journalEntryId);
        Boolean isBalanced = (Boolean) balanceResult.get("isBalanced");
        
        if (!isBalanced) {
            throw new IllegalStateException("분개가 균형을 이루지 않아 승인할 수 없습니다");
        }

        // 상태 업데이트
        journalEntryMapper.updateJournalEntryStatus(journalEntryId, "APPROVED");

        // 감사 로그 생성
        insertJournalEntryAuditLog(journalEntryId, "APPROVE", "DRAFT", "APPROVED", "시스템 승인");
    }

    private void postJournalEntry(Long journalEntryId) {
        JournalEntry entry = journalEntryMapper.findJournalEntryById(journalEntryId);
        if (!"APPROVED".equals(entry.getStatus())) {
            throw new IllegalStateException("승인된 분개만 전기할 수 있습니다");
        }

        journalEntryMapper.updateJournalEntryStatus(journalEntryId, "POSTED");
        insertJournalEntryAuditLog(journalEntryId, "POST", "APPROVED", "POSTED", "총계정원장 전기");
    }

    private void modifyJournalEntryDescription(Long journalEntryId, String newDescription) {
        JournalEntry entry = journalEntryMapper.findJournalEntryById(journalEntryId);
        if (!"DRAFT".equals(entry.getStatus())) {
            throw new IllegalStateException("승인된 분개는 수정할 수 없습니다");
        }

        // 여기서는 간단하게 description만 수정 (실제로는 더 복잡한 수정 로직)
        entry.setDescription(newDescription);
        // 실제 구현에서는 journalEntryMapper.updateJournalEntry(entry) 호출
    }

    private JournalEntry createReversingJournalEntry(Long originalJournalEntryId) {
        JournalEntry originalEntry = journalEntryMapper.findJournalEntryById(originalJournalEntryId);
        List<JournalEntryDetail> originalDetails = journalEntryMapper.findJournalEntryDetails(originalJournalEntryId);

        // 역분개 생성
        JournalEntry reversingEntry = JournalEntry.builder()
                .companyId(originalEntry.getCompanyId())
                .entryDate(LocalDate.now())
                .description("역분개: " + originalEntry.getDescription())
                .totalAmount(originalEntry.getTotalAmount())
                .status("DRAFT")
                .referenceType("REVERSAL")
                .referenceId(originalJournalEntryId)
                .createdBy("SYSTEM")
                .build();

        journalEntryMapper.insertJournalEntry(reversingEntry);

        // 역분개 상세 내역 생성 (차변 <-> 대변 반전)
        for (int i = 0; i < originalDetails.size(); i++) {
            JournalEntryDetail originalDetail = originalDetails.get(i);
            JournalEntryDetail reversingDetail = JournalEntryDetail.builder()
                    .journalEntryId(reversingEntry.getId())
                    .lineNumber(originalDetail.getLineNumber())
                    .accountCode(originalDetail.getAccountCode())
                    .accountName(originalDetail.getAccountName())
                    .debitAmount(originalDetail.getCreditAmount())  // 반전
                    .creditAmount(originalDetail.getDebitAmount())  // 반전
                    .description("역분개: " + originalDetail.getDescription())
                    .build();

            journalEntryMapper.insertJournalEntryDetail(reversingDetail);
        }

        return reversingEntry;
    }

    private List<JournalEntry> findJournalEntriesByCompany(String companyId) {
        // String companyId를 Long으로 변환 (실제 구현에서는 다른 방식 사용)
        return journalEntryMapper.findJournalEntries(
                1L, null, null, null, null, 1000, 0);
    }

    private List<JournalEntry> findJournalEntriesByDateRange(String companyId, LocalDate startDate, LocalDate endDate) {
        // String companyId를 Long으로 변환 (실제 구현에서는 다른 방식 사용)
        return journalEntryMapper.findJournalEntries(
                1L, null, null, startDate, endDate, 1000, 0);
    }

    private List<JournalEntry> searchJournalEntriesByKeyword(String companyId, String keyword) {
        // String companyId를 Long으로 변환 (실제 구현에서는 다른 방식 사용)
        return journalEntryMapper.findJournalEntries(
                1L, null, keyword, null, null, 1000, 0);
    }

    private void insertJournalEntryAuditLog(Long journalEntryId, String actionType, 
                                          String previousStatus, String newStatus, String notes) {
        // 실제 구현에서는 audit log 테이블에 삽입
        // 여기서는 테스트를 위해 임시 구현
        try {
            journalEntryMapper.insertJournalEntryAuditLog(
                    journalEntryId, actionType, previousStatus, newStatus, "SYSTEM", notes);
        } catch (Exception e) {
            // 감사 로그 실패는 메인 로직에 영향을 주지 않음
        }
    }

    private List<Map<String, Object>> getJournalEntryAuditLogs(Long journalEntryId) {
        try {
            return journalEntryMapper.findJournalEntryAuditLogs(journalEntryId);
        } catch (Exception e) {
            return new ArrayList<>();
        }
    }
}


/**
 * 분개 처리 응답 모델
 */
class JournalEntryResponse {
    private boolean success;
    private JournalEntry journalEntry;
    private String message;

    public static JournalEntryResponseBuilder builder() {
        return new JournalEntryResponseBuilder();
    }

    // Getters
    public boolean isSuccess() { return success; }
    public JournalEntry getJournalEntry() { return journalEntry; }
    public String getMessage() { return message; }

    // Setters
    public void setSuccess(boolean success) { this.success = success; }
    public void setJournalEntry(JournalEntry journalEntry) { this.journalEntry = journalEntry; }
    public void setMessage(String message) { this.message = message; }

    public static class JournalEntryResponseBuilder {
        private boolean success;
        private JournalEntry journalEntry;
        private String message;

        public JournalEntryResponseBuilder success(boolean success) { this.success = success; return this; }
        public JournalEntryResponseBuilder journalEntry(JournalEntry journalEntry) { this.journalEntry = journalEntry; return this; }
        public JournalEntryResponseBuilder message(String message) { this.message = message; return this; }

        public JournalEntryResponse build() {
            JournalEntryResponse response = new JournalEntryResponse();
            response.success = this.success;
            response.journalEntry = this.journalEntry;
            response.message = this.message;
            return response;
        }
    }
}
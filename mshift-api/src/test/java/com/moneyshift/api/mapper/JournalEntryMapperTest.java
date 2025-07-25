package com.moneyshift.api.mapper;

import com.moneyshift.api.model.JournalEntry;
import com.moneyshift.api.model.JournalEntryDetail;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.*;

/**
 * TDD: JournalEntryMapper 테스트
 * 분개 매퍼의 모든 메소드를 TDD 방식으로 검증합니다.
 */
@SpringBootTest
@ActiveProfiles("test")
@Transactional
@DisplayName("분개 매퍼 TDD 테스트")
public class JournalEntryMapperTest {

    @Autowired
    private JournalEntryMapper journalEntryMapper;

    private JournalEntry testJournalEntry;
    private List<JournalEntryDetail> testDetails;

    @BeforeEach
    void setUp() {
        // 테스트용 분개 생성
        testJournalEntry = JournalEntry.builder()
                .companyId("test-company")
                .entryDate(LocalDate.now())
                .description("테스트 분개")
                .totalAmount(new BigDecimal("100000"))
                .status("DRAFT")
                .referenceType("MANUAL")
                .build();

        // 테스트용 분개 상세 내역
        testDetails = List.of(
                JournalEntryDetail.builder()
                        .lineNumber(1)
                        .accountCode("5030")
                        .accountName("사무용품비")
                        .debitAmount(new BigDecimal("100000"))
                        .creditAmount(BigDecimal.ZERO)
                        .description("차변: 사무용품비")
                        .build(),
                JournalEntryDetail.builder()
                        .lineNumber(2)
                        .accountCode("1010")
                        .accountName("보통예금")
                        .debitAmount(BigDecimal.ZERO)
                        .creditAmount(new BigDecimal("100000"))
                        .description("대변: 보통예금")
                        .build()
        );
    }

    @Test
    @DisplayName("TDD: 분개 생성 테스트")
    void should_InsertJournalEntry_When_ValidJournalEntryProvided() {
        // Given
        assertThat(testJournalEntry.getId()).isNull();

        // When
        int result = journalEntryMapper.insertJournalEntry(testJournalEntry);

        // Then
        assertThat(result).isEqualTo(1);
        assertThat(testJournalEntry.getId()).isNotNull();
        assertThat(testJournalEntry.getCreatedAt()).isNotNull();
    }

    @Test
    @DisplayName("TDD: 분개 상세 내역 일괄 생성 테스트")
    void should_InsertJournalEntryDetails_When_ValidDetailsProvided() {
        // Given
        journalEntryMapper.insertJournalEntry(testJournalEntry);
        Long journalEntryId = testJournalEntry.getId();

        // 분개 상세에 분개 ID 설정
        testDetails.forEach(detail -> detail.setJournalEntryId(journalEntryId));

        // When
        int result = journalEntryMapper.insertJournalEntryDetails(testDetails);

        // Then
        assertThat(result).isEqualTo(2);
        testDetails.forEach(detail -> assertThat(detail.getId()).isNotNull());
    }

    @Test
    @DisplayName("TDD: 분개 ID로 조회 테스트 (상세 포함)")
    void should_FindJournalEntryById_When_JournalEntryExists() {
        // Given
        journalEntryMapper.insertJournalEntry(testJournalEntry);
        testDetails.forEach(detail -> detail.setJournalEntryId(testJournalEntry.getId()));
        journalEntryMapper.insertJournalEntryDetails(testDetails);

        Long journalEntryId = testJournalEntry.getId();

        // When
        JournalEntry foundJournalEntry = journalEntryMapper.findJournalEntryById(journalEntryId);

        // Then
        assertThat(foundJournalEntry).isNotNull();
        assertThat(foundJournalEntry.getId()).isEqualTo(journalEntryId);
        assertThat(foundJournalEntry.getDescription()).isEqualTo("테스트 분개");
        assertThat(foundJournalEntry.getStatus()).isEqualTo("DRAFT");
        assertThat(foundJournalEntry.getTotalAmount()).isEqualByComparingTo(new BigDecimal("100000"));

        // 상세 내역도 함께 조회되는지 확인
        if (foundJournalEntry.getDetails() != null) {
            assertThat(foundJournalEntry.getDetails()).hasSize(2);
            assertThat(foundJournalEntry.getDetails()).extracting(JournalEntryDetail::getAccountCode)
                    .containsExactlyInAnyOrder("5030", "1010");
        }
    }

    @Test
    @DisplayName("TDD: 존재하지 않는 분개 ID로 조회 시 null 반환")
    void should_ReturnNull_When_JournalEntryNotExists() {
        // Given
        Long nonExistentId = 999999L;

        // When
        JournalEntry foundJournalEntry = journalEntryMapper.findJournalEntryById(nonExistentId);

        // Then
        assertThat(foundJournalEntry).isNull();
    }

    @Test
    @DisplayName("TDD: 분개 목록 조회 테스트 (페이징)")
    void should_FindJournalEntries_When_JournalEntriesExist() {
        // Given
        JournalEntry entry1 = JournalEntry.builder()
                .companyId("test-company").entryDate(LocalDate.now())
                .description("첫 번째 분개").status("DRAFT")
                .totalAmount(new BigDecimal("50000"))
                .build();

        JournalEntry entry2 = JournalEntry.builder()
                .companyId("test-company").entryDate(LocalDate.now())
                .description("두 번째 분개").status("APPROVED")
                .totalAmount(new BigDecimal("75000"))
                .build();

        journalEntryMapper.insertJournalEntry(entry1);
        journalEntryMapper.insertJournalEntry(entry2);

        // When
        List<JournalEntry> journalEntries = journalEntryMapper.findJournalEntries(
                1L, null, null, null, null, 10, 0);

        // Then
        assertThat(journalEntries).hasSize(2);
        assertThat(journalEntries).extracting(JournalEntry::getDescription)
                .containsExactlyInAnyOrder("첫 번째 분개", "두 번째 분개");
    }

    @Test
    @DisplayName("TDD: 분개 목록 상태별 필터링 테스트")
    void should_FindJournalEntriesByStatus_When_StatusFilterProvided() {
        // Given
        JournalEntry draftEntry = JournalEntry.builder()
                .companyId("test-company").entryDate(LocalDate.now())
                .description("Draft 분개").status("DRAFT")
                .totalAmount(new BigDecimal("50000"))
                .build();

        JournalEntry approvedEntry = JournalEntry.builder()
                .companyId("test-company").entryDate(LocalDate.now())
                .description("Approved 분개").status("APPROVED")
                .totalAmount(new BigDecimal("75000"))
                .build();

        journalEntryMapper.insertJournalEntry(draftEntry);
        journalEntryMapper.insertJournalEntry(approvedEntry);

        // When - DRAFT 상태만 조회
        List<JournalEntry> draftEntries = journalEntryMapper.findJournalEntries(
                1L, "DRAFT", null, null, null, 10, 0);

        // Then
        assertThat(draftEntries).hasSize(1);
        assertThat(draftEntries.get(0).getStatus()).isEqualTo("DRAFT");
        assertThat(draftEntries.get(0).getDescription()).isEqualTo("Draft 분개");
    }

    @Test
    @DisplayName("TDD: 분개 목록 총 개수 조회 테스트")
    void should_CountJournalEntries_When_JournalEntriesExist() {
        // Given
        for (int i = 0; i < 5; i++) {
            JournalEntry entry = JournalEntry.builder()
                    .companyId("test-company").entryDate(LocalDate.now())
                    .description("분개 " + i).status("DRAFT")
                    .totalAmount(new BigDecimal("10000"))
                    .build();
            journalEntryMapper.insertJournalEntry(entry);
        }

        // When
        Long totalCount = journalEntryMapper.countJournalEntries(
                1L, null, null, null, null);

        // Then
        assertThat(totalCount).isEqualTo(5);
    }

    @Test
    @DisplayName("TDD: 분개 상태 업데이트 테스트")
    void should_UpdateJournalEntryStatus_When_ValidStatusProvided() {
        // Given
        journalEntryMapper.insertJournalEntry(testJournalEntry);
        Long journalEntryId = testJournalEntry.getId();

        // When - DRAFT → APPROVED
        int result = journalEntryMapper.updateJournalEntryStatus(journalEntryId, "APPROVED");

        // Then
        assertThat(result).isEqualTo(1);

        JournalEntry updatedEntry = journalEntryMapper.findJournalEntryById(journalEntryId);
        assertThat(updatedEntry.getStatus()).isEqualTo("APPROVED");
        assertThat(updatedEntry.getUpdatedAt()).isNotNull();
    }

    @Test
    @DisplayName("TDD: 분개 균형 검증 테스트")
    void should_ValidateJournalEntryBalance_When_JournalEntryProvided() {
        // Given
        journalEntryMapper.insertJournalEntry(testJournalEntry);
        testDetails.forEach(detail -> detail.setJournalEntryId(testJournalEntry.getId()));
        journalEntryMapper.insertJournalEntryDetails(testDetails);

        Long journalEntryId = testJournalEntry.getId();

        // When
        Map<String, Object> balanceValidation = journalEntryMapper.validateJournalEntryBalance(journalEntryId);

        // Then
        assertThat(balanceValidation).isNotNull();
        assertThat(balanceValidation.get("totalDebit")).isEqualTo(new BigDecimal("100000"));
        assertThat(balanceValidation.get("totalCredit")).isEqualTo(new BigDecimal("100000"));
        assertThat(balanceValidation.get("isBalanced")).isEqualTo(true);
    }

    @Test
    @DisplayName("TDD: 불균형 분개 검증 테스트")
    void should_DetectImbalance_When_JournalEntryIsNotBalanced() {
        // Given - 불균형 분개 생성
        JournalEntry imbalancedEntry = JournalEntry.builder()
                .companyId("test-company").entryDate(LocalDate.now())
                .description("불균형 분개").status("DRAFT")
                .totalAmount(new BigDecimal("100000"))
                .build();

        journalEntryMapper.insertJournalEntry(imbalancedEntry);

        List<JournalEntryDetail> imbalancedDetails = List.of(
                JournalEntryDetail.builder()
                        .journalEntryId(imbalancedEntry.getId())
                        .lineNumber(1).accountCode("5030").accountName("사무용품비")
                        .debitAmount(new BigDecimal("100000")).creditAmount(BigDecimal.ZERO)
                        .description("차변: 사무용품비").build(),
                JournalEntryDetail.builder()
                        .journalEntryId(imbalancedEntry.getId())
                        .lineNumber(2).accountCode("1010").accountName("보통예금")
                        .debitAmount(BigDecimal.ZERO).creditAmount(new BigDecimal("80000"))
                        .description("대변: 보통예금").build()
        );

        journalEntryMapper.insertJournalEntryDetails(imbalancedDetails);

        // When
        Map<String, Object> balanceValidation = journalEntryMapper.validateJournalEntryBalance(imbalancedEntry.getId());

        // Then
        assertThat(balanceValidation.get("totalDebit")).isEqualTo(new BigDecimal("100000"));
        assertThat(balanceValidation.get("totalCredit")).isEqualTo(new BigDecimal("80000"));
        assertThat(balanceValidation.get("isBalanced")).isEqualTo(false);
    }

    @Test
    @DisplayName("TDD: 분개 상세 내역 조회 테스트")
    void should_FindJournalEntryDetails_When_DetailsExist() {
        // Given
        journalEntryMapper.insertJournalEntry(testJournalEntry);
        testDetails.forEach(detail -> detail.setJournalEntryId(testJournalEntry.getId()));
        journalEntryMapper.insertJournalEntryDetails(testDetails);

        Long journalEntryId = testJournalEntry.getId();

        // When
        List<JournalEntryDetail> foundDetails = journalEntryMapper.findJournalEntryDetails(journalEntryId);

        // Then
        assertThat(foundDetails).hasSize(2);
        assertThat(foundDetails).extracting(JournalEntryDetail::getAccountCode)
                .containsExactlyInAnyOrder("5030", "1010");
        assertThat(foundDetails).extracting(JournalEntryDetail::getLineNumber)
                .containsExactlyInAnyOrder(1, 2);

        // 차변/대변 금액 확인
        JournalEntryDetail debitDetail = foundDetails.stream()
                .filter(d -> d.getDebitAmount().compareTo(BigDecimal.ZERO) > 0)
                .findFirst().orElse(null);
        JournalEntryDetail creditDetail = foundDetails.stream()
                .filter(d -> d.getCreditAmount().compareTo(BigDecimal.ZERO) > 0)
                .findFirst().orElse(null);

        assertThat(debitDetail).isNotNull();
        assertThat(debitDetail.getDebitAmount()).isEqualByComparingTo(new BigDecimal("100000"));
        assertThat(creditDetail).isNotNull();
        assertThat(creditDetail.getCreditAmount()).isEqualByComparingTo(new BigDecimal("100000"));
    }

    @Test
    @DisplayName("TDD: 분개 삭제 테스트")
    void should_DeleteJournalEntry_When_JournalEntryExists() {
        // Given
        journalEntryMapper.insertJournalEntry(testJournalEntry);
        testDetails.forEach(detail -> detail.setJournalEntryId(testJournalEntry.getId()));
        journalEntryMapper.insertJournalEntryDetails(testDetails);

        Long journalEntryId = testJournalEntry.getId();

        // When - 상세 먼저 삭제
        int detailsDeleted = journalEntryMapper.deleteJournalEntryDetails(journalEntryId);
        int entryDeleted = journalEntryMapper.deleteJournalEntry(journalEntryId);

        // Then
        assertThat(detailsDeleted).isEqualTo(2);
        assertThat(entryDeleted).isEqualTo(1);

        // 삭제 확인
        JournalEntry deletedEntry = journalEntryMapper.findJournalEntryById(journalEntryId);
        assertThat(deletedEntry).isNull();
    }

    @Test
    @DisplayName("TDD: 미전기 분개 개수 조회 테스트")
    void should_FindUnpostedJournalEntries_When_UnpostedEntriesExist() {
        // Given
        LocalDate startDate = LocalDate.now().minusDays(7);
        LocalDate endDate = LocalDate.now();

        // DRAFT와 APPROVED 상태의 분개들 생성
        JournalEntry draftEntry = JournalEntry.builder()
                .companyId("test-company").entryDate(LocalDate.now())
                .description("Draft 분개").status("DRAFT")
                .totalAmount(new BigDecimal("50000"))
                .build();

        JournalEntry approvedEntry = JournalEntry.builder()
                .companyId("test-company").entryDate(LocalDate.now())
                .description("Approved 분개").status("APPROVED")
                .totalAmount(new BigDecimal("75000"))
                .build();

        JournalEntry postedEntry = JournalEntry.builder()
                .companyId("test-company").entryDate(LocalDate.now())
                .description("Posted 분개").status("POSTED")
                .totalAmount(new BigDecimal("25000"))
                .build();

        journalEntryMapper.insertJournalEntry(draftEntry);
        journalEntryMapper.insertJournalEntry(approvedEntry);
        journalEntryMapper.insertJournalEntry(postedEntry);

        // When
        Long unpostedCount = journalEntryMapper.findUnpostedJournalEntries("1", startDate, endDate);

        // Then - DRAFT와 APPROVED 상태만 카운트됨 (POSTED 제외)
        assertThat(unpostedCount).isEqualTo(2);
    }

    @Test
    @DisplayName("TDD: 분개 감사 로그 생성 테스트")
    void should_InsertJournalEntryAuditLog_When_ValidLogDataProvided() {
        // Given
        journalEntryMapper.insertJournalEntry(testJournalEntry);
        Long journalEntryId = testJournalEntry.getId();

        // When
        int result = journalEntryMapper.insertJournalEntryAuditLog(
                journalEntryId, "CREATE", null, "DRAFT", "system", "분개 생성");

        // Then
        assertThat(result).isEqualTo(1);
    }

    @Test
    @DisplayName("TDD: 분개 감사 로그 조회 테스트")
    void should_FindJournalEntryAuditLogs_When_AuditLogsExist() {
        // Given
        journalEntryMapper.insertJournalEntry(testJournalEntry);
        Long journalEntryId = testJournalEntry.getId();

        // 여러 감사 로그 생성
        journalEntryMapper.insertJournalEntryAuditLog(
                journalEntryId, "CREATE", null, "DRAFT", "system", "분개 생성");
        journalEntryMapper.insertJournalEntryAuditLog(
                journalEntryId, "APPROVE", "DRAFT", "APPROVED", "admin", "분개 승인");
        journalEntryMapper.insertJournalEntryAuditLog(
                journalEntryId, "POST", "APPROVED", "POSTED", "admin", "분개 전기");

        // When
        List<Map<String, Object>> auditLogs = journalEntryMapper.findJournalEntryAuditLogs(journalEntryId);

        // Then
        assertThat(auditLogs).hasSize(3);
        
        // 최신 로그가 먼저 나오는지 확인 (ORDER BY created_at DESC)
        assertThat(auditLogs.get(0).get("action_type")).isEqualTo("POST");
        assertThat(auditLogs.get(1).get("action_type")).isEqualTo("APPROVE");
        assertThat(auditLogs.get(2).get("action_type")).isEqualTo("CREATE");

        // 로그 내용 확인
        Map<String, Object> createLog = auditLogs.get(2);
        assertThat(createLog.get("previous_status")).isNull();
        assertThat(createLog.get("new_status")).isEqualTo("DRAFT");
        assertThat(createLog.get("user_id")).isEqualTo("system");
        assertThat(createLog.get("notes")).isEqualTo("분개 생성");
    }

    @Test
    @DisplayName("TDD: 분개 검색 기능 테스트")
    void should_FindJournalEntriesBySearch_When_SearchKeywordProvided() {
        // Given
        JournalEntry entry1 = JournalEntry.builder()
                .companyId("test-company").entryDate(LocalDate.now())
                .description("사무용품 구매").status("DRAFT")
                .totalAmount(new BigDecimal("50000"))
                .build();

        JournalEntry entry2 = JournalEntry.builder()
                .companyId("test-company").entryDate(LocalDate.now())
                .description("급여 지급").status("DRAFT")
                .totalAmount(new BigDecimal("200000"))
                .build();

        journalEntryMapper.insertJournalEntry(entry1);
        journalEntryMapper.insertJournalEntry(entry2);

        // When - "사무용품" 키워드로 검색
        List<JournalEntry> searchResults = journalEntryMapper.findJournalEntries(
                1L, null, "사무용품", null, null, 10, 0);

        // Then
        assertThat(searchResults).hasSize(1);
        assertThat(searchResults.get(0).getDescription()).contains("사무용품");
    }
}
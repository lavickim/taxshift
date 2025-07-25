package com.moneyshift.api.service;

import com.moneyshift.api.model.JournalEntry;
import com.moneyshift.api.model.JournalEntryDetail;
import com.moneyshift.api.model.TransactionEntity;
import com.moneyshift.api.model.TransactionToJournalRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Phase 4 TDD: 분개(Journal Entry) 비즈니스 로직 테스트
 * 
 * 테스트 시나리오:
 * 1. 거래(Transaction) → 분개(Journal Entry) 자동 변환
 * 2. 복식부기 원칙 검증 (차변 = 대변)
 * 3. 분개 승인 및 전기(Posting) 프로세스
 * 4. 분개별 상세 내역(Journal Entry Detail) 관리
 * 5. 분개 수정 및 상태 관리
 * 6. 복합 분개 처리 (여러 계정 동시)
 * 7. 분개 균형 검증 로직
 */
@SpringBootTest
@ActiveProfiles("test")
@Transactional
public class Phase4JournalEntryTest extends BaseTestClass {

    @Autowired
    private AccountingEngine accountingEngine;

    private TransactionEntity sampleTransaction;

    @BeforeEach
    public void setUp() {
        // 실제 데이터베이스에 거래 데이터 생성
        createTestTransaction(1L, "EXPENSE", "스타벅스 강남점", "커피전문점", 50000L);
        createTestTransaction(2L, "INCOME", "서비스 수입", "매출", 200000L);
        
        // 샘플 거래 엔티티 생성 (테스트용)
        sampleTransaction = TransactionEntity.builder()
                .id(1L)
                .companyId(testCompanyId)
                .amount(50000L) // 50,000원
                .transactionDate(LocalDate.now())
                .transactionType("EXPENSE")
                .rawText("스타벅스 강남점")
                .finalSuggestedTag("커피전문점")
                .build();
    }

    @Test
    @DisplayName("Phase 4-1: 분개 생성 및 기본값 검증")
    public void testJournalEntryCreation() {
        // When: 새로운 분개 생성
        JournalEntry journalEntry = JournalEntry.createDraft(
                testCompanyId, 
                LocalDate.now(), 
                "사무용품 구매", 
                "TRANSACTION", 
                123L, 
                new BigDecimal("50000.00")
        );
        
        // Then: 기본값 검증
        assertEquals(testCompanyId, journalEntry.getCompanyId());
        assertEquals("사무용품 구매", journalEntry.getDescription());
        assertEquals("TRANSACTION", journalEntry.getReferenceType());
        assertEquals(Long.valueOf(123L), journalEntry.getReferenceId());
        assertEquals(new BigDecimal("50000.00"), journalEntry.getTotalAmount());
        assertEquals("DRAFT", journalEntry.getStatus());
        assertEquals("SYSTEM", journalEntry.getCreatedBy());
        assertNotNull(journalEntry.getCreatedAt());
        assertNull(journalEntry.getPostedAt());
    }

    @Test
    @DisplayName("Phase 4-2: 분개 상세 내역 생성 (차변)")
    public void testJournalEntryDetailDebitCreation() {
        // When: 차변 분개 상세 생성
        JournalEntryDetail debitDetail = JournalEntryDetail.createDebit(
                1, "5130", "소모품비", new BigDecimal("50000.00"), "사무용품 구매"
        );
        
        // Then: 차변 상세 검증
        assertEquals(Integer.valueOf(1), debitDetail.getLineNumber());
        assertEquals("5130", debitDetail.getAccountCode());
        assertEquals("소모품비", debitDetail.getAccountName());
        assertEquals(new BigDecimal("50000.00"), debitDetail.getDebitAmount());
        assertEquals(BigDecimal.ZERO, debitDetail.getCreditAmount());
        assertEquals("사무용품 구매", debitDetail.getDescription());
        assertTrue(debitDetail.isDebit());
        assertFalse(debitDetail.isCredit());
        assertEquals("DEBIT", debitDetail.getDebitCreditType());
        assertEquals(new BigDecimal("50000.00"), debitDetail.getAmount());
    }

    @Test
    @DisplayName("Phase 4-3: 분개 상세 내역 생성 (대변)")
    public void testJournalEntryDetailCreditCreation() {
        // When: 대변 분개 상세 생성
        JournalEntryDetail creditDetail = JournalEntryDetail.createCredit(
                2, "1120", "보통예금", new BigDecimal("50000.00"), "현금 지출"
        );
        
        // Then: 대변 상세 검증
        assertEquals(Integer.valueOf(2), creditDetail.getLineNumber());
        assertEquals("1120", creditDetail.getAccountCode());
        assertEquals("보통예금", creditDetail.getAccountName());
        assertEquals(BigDecimal.ZERO, creditDetail.getDebitAmount());
        assertEquals(new BigDecimal("50000.00"), creditDetail.getCreditAmount());
        assertEquals("현금 지출", creditDetail.getDescription());
        assertFalse(creditDetail.isDebit());
        assertTrue(creditDetail.isCredit());
        assertEquals("CREDIT", creditDetail.getDebitCreditType());
        assertEquals(new BigDecimal("50000.00"), creditDetail.getAmount());
    }

    @Test
    @DisplayName("Phase 4-4: 복식부기 원칙 검증 (균형 분개)")
    public void testBalancedJournalEntry() {
        // Given: 균형 분개 생성
        JournalEntry journalEntry = JournalEntry.createDraft(
                testCompanyId, LocalDate.now(), "균형 분개", "MANUAL", null, new BigDecimal("100000.00")
        );
        
        List<JournalEntryDetail> details = new ArrayList<>();
        details.add(JournalEntryDetail.createDebit(1, "5130", "소모품비", new BigDecimal("100000.00"), "비용 발생"));
        details.add(JournalEntryDetail.createCredit(2, "1120", "보통예금", new BigDecimal("100000.00"), "현금 지출"));
        journalEntry.setDetails(details);
        
        // When & Then: 균형 검증
        assertTrue(journalEntry.isBalanced(), "차변과 대변이 균형을 이루어야 함");
        assertEquals(new BigDecimal("100000.00"), journalEntry.getTotalDebitAmount());
        assertEquals(new BigDecimal("100000.00"), journalEntry.getTotalCreditAmount());
    }

    @Test
    @DisplayName("Phase 4-5: 복식부기 원칙 검증 (불균형 분개)")
    public void testUnbalancedJournalEntry() {
        // Given: 불균형 분개 생성
        JournalEntry journalEntry = JournalEntry.createDraft(
                testCompanyId, LocalDate.now(), "불균형 분개", "MANUAL", null, new BigDecimal("100000.00")
        );
        
        List<JournalEntryDetail> details = new ArrayList<>();
        details.add(JournalEntryDetail.createDebit(1, "5130", "소모품비", new BigDecimal("100000.00"), "비용 발생"));
        details.add(JournalEntryDetail.createCredit(2, "1120", "보통예금", new BigDecimal("80000.00"), "현금 지출")); // 불균형
        journalEntry.setDetails(details);
        
        // When & Then: 불균형 검증
        assertFalse(journalEntry.isBalanced(), "차변과 대변이 불균형이어야 함");
        assertEquals(new BigDecimal("100000.00"), journalEntry.getTotalDebitAmount());
        assertEquals(new BigDecimal("80000.00"), journalEntry.getTotalCreditAmount());
    }

    @Test
    @DisplayName("Phase 4-6: 분개 승인 프로세스")
    public void testJournalEntryApprovalProcess() {
        // Given: 균형 분개 생성
        JournalEntry journalEntry = JournalEntry.createDraft(
                testCompanyId, LocalDate.now(), "승인 테스트", "MANUAL", null, new BigDecimal("50000.00")
        );
        
        List<JournalEntryDetail> details = new ArrayList<>();
        details.add(JournalEntryDetail.createDebit(1, "5130", "소모품비", new BigDecimal("50000.00"), "비용"));
        details.add(JournalEntryDetail.createCredit(2, "1120", "보통예금", new BigDecimal("50000.00"), "지출"));
        journalEntry.setDetails(details);
        
        // When: 분개 승인
        journalEntry.approve();
        
        // Then: 승인 상태 검증
        assertEquals("APPROVED", journalEntry.getStatus());
    }

    @Test
    @DisplayName("Phase 4-7: 불균형 분개 승인 시 예외 발생")
    public void testUnbalancedJournalEntryApprovalException() {
        // Given: 불균형 분개
        JournalEntry journalEntry = JournalEntry.createDraft(
                testCompanyId, LocalDate.now(), "불균형 분개", "MANUAL", null, new BigDecimal("100000.00")
        );
        
        List<JournalEntryDetail> details = new ArrayList<>();
        details.add(JournalEntryDetail.createDebit(1, "5130", "소모품비", new BigDecimal("100000.00"), "비용"));
        details.add(JournalEntryDetail.createCredit(2, "1120", "보통예금", new BigDecimal("80000.00"), "지출")); // 불균형
        journalEntry.setDetails(details);
        
        // When & Then: 승인 시 예외 발생
        IllegalStateException exception = assertThrows(IllegalStateException.class, journalEntry::approve);
        assertEquals("Journal entry must be balanced before approval", exception.getMessage());
        assertEquals("DRAFT", journalEntry.getStatus()); // 상태 변경되지 않음
    }

    @Test
    @DisplayName("Phase 4-8: 분개 전기(Posting) 프로세스")
    public void testJournalEntryPostingProcess() {
        // Given: 승인된 분개
        JournalEntry journalEntry = JournalEntry.createDraft(
                testCompanyId, LocalDate.now(), "전기 테스트", "MANUAL", null, new BigDecimal("75000.00")
        );
        
        List<JournalEntryDetail> details = new ArrayList<>();
        details.add(JournalEntryDetail.createDebit(1, "5130", "소모품비", new BigDecimal("75000.00"), "비용"));
        details.add(JournalEntryDetail.createCredit(2, "1120", "보통예금", new BigDecimal("75000.00"), "지출"));
        journalEntry.setDetails(details);
        
        journalEntry.approve(); // 먼저 승인
        
        // When: 분개 전기
        journalEntry.post();
        
        // Then: 전기 상태 검증
        assertEquals("POSTED", journalEntry.getStatus());
        assertNotNull(journalEntry.getPostedAt());
        assertEquals(LocalDate.now(), journalEntry.getPostedAt());
    }

    @Test
    @DisplayName("Phase 4-9: DRAFT 상태에서 전기 시 예외 발생")
    public void testDraftJournalEntryPostingException() {
        // Given: DRAFT 상태 분개
        JournalEntry journalEntry = JournalEntry.createDraft(
                testCompanyId, LocalDate.now(), "DRAFT 전기 테스트", "MANUAL", null, new BigDecimal("50000.00")
        );
        
        // When & Then: DRAFT에서 전기 시 예외 발생
        IllegalStateException exception = assertThrows(IllegalStateException.class, journalEntry::post);
        assertEquals("Only APPROVED entries can be posted", exception.getMessage());
        assertEquals("DRAFT", journalEntry.getStatus());
    }

    @Test
    @DisplayName("Phase 4-10: 복합 분개 처리 (여러 계정)")
    public void testComplexJournalEntry() {
        // Given: 복합 분개 (1개 차변, 2개 대변)
        JournalEntry journalEntry = JournalEntry.createDraft(
                testCompanyId, LocalDate.now(), "복합 분개", "MANUAL", null, new BigDecimal("120000.00")
        );
        
        List<JournalEntryDetail> details = new ArrayList<>();
        // 차변: 비용 120,000원
        details.add(JournalEntryDetail.createDebit(1, "5130", "소모품비", new BigDecimal("120000.00"), "사무용품 구매"));
        // 대변: 현금 80,000원 + 미지급금 40,000원
        details.add(JournalEntryDetail.createCredit(2, "1120", "보통예금", new BigDecimal("80000.00"), "현금 지출"));
        details.add(JournalEntryDetail.createCredit(3, "2110", "미지급금", new BigDecimal("40000.00"), "외상"));
        journalEntry.setDetails(details);
        
        // When & Then: 복합 분개 검증
        assertTrue(journalEntry.isBalanced(), "복합 분개도 균형을 이루어야 함");
        assertEquals(new BigDecimal("120000.00"), journalEntry.getTotalDebitAmount());
        assertEquals(new BigDecimal("120000.00"), journalEntry.getTotalCreditAmount());
        assertEquals(3, journalEntry.getDetails().size());
        
        // 승인 및 전기 가능
        journalEntry.approve();
        journalEntry.post();
        assertEquals("POSTED", journalEntry.getStatus());
    }

    @Test
    @DisplayName("Phase 4-11: 거래 → 분개 자동 변환 (비용)")
    public void testTransactionToJournalEntryConversion() {
        // Given: 비용 거래
        TransactionToJournalRequest request = new TransactionToJournalRequest();
        request.setTransactionId(sampleTransaction.getId());
        request.setCompanyId(sampleTransaction.getCompanyId());
        request.setForceRegenerate(true);
        
        // When: 분개 자동 생성
        JournalEntry generatedEntry = accountingEngine.processTransaction(request);
        
        // Then: 생성된 분개 검증
        assertNotNull(generatedEntry);
        assertEquals(testCompanyId, generatedEntry.getCompanyId());
        assertEquals("TRANSACTION", generatedEntry.getReferenceType());
        assertEquals(sampleTransaction.getId(), generatedEntry.getReferenceId());
        assertEquals(sampleTransaction.getRawText(), generatedEntry.getDescription());
        
        // 분개 상세 검증 (차변: 비용, 대변: 현금)
        assertNotNull(generatedEntry.getDetails());
        assertEquals(2, generatedEntry.getDetails().size());
        assertTrue(generatedEntry.isBalanced(), "자동 생성된 분개는 균형을 이루어야 함");
        
        // 차변: 복리후생비 (커피전문점 태그)
        JournalEntryDetail debitDetail = generatedEntry.getDetails().stream()
                .filter(JournalEntryDetail::isDebit)
                .findFirst()
                .orElse(null);
        assertNotNull(debitDetail);
        assertEquals("5120", debitDetail.getAccountCode()); // 복리후생비
        assertEquals(new BigDecimal("50000"), debitDetail.getDebitAmount());
        
        // 대변: 보통예금
        JournalEntryDetail creditDetail = generatedEntry.getDetails().stream()
                .filter(JournalEntryDetail::isCredit)
                .findFirst()
                .orElse(null);
        assertNotNull(creditDetail);
        assertEquals("1120", creditDetail.getAccountCode()); // 보통예금
        assertEquals(new BigDecimal("50000"), creditDetail.getCreditAmount());
    }

    @Test
    @DisplayName("Phase 4-12: 분개 상세 내역 순 금액 계산")
    public void testJournalEntryDetailNetAmount() {
        // Given: 차변 분개 상세
        JournalEntryDetail debitDetail = JournalEntryDetail.createDebit(
                1, "5130", "소모품비", new BigDecimal("100000.00"), "비용"
        );
        
        // When: 순 금액 계산
        BigDecimal debitNetAmount = debitDetail.getNetAmount();
        
        // Then: 차변 순 금액 검증 (차변 - 대변 = 양수)
        assertEquals(new BigDecimal("100000.00"), debitNetAmount);
        
        // Given: 대변 분개 상세
        JournalEntryDetail creditDetail = JournalEntryDetail.createCredit(
                2, "1120", "보통예금", new BigDecimal("100000.00"), "지출"
        );
        
        // When: 순 금액 계산
        BigDecimal creditNetAmount = creditDetail.getNetAmount();
        
        // Then: 대변 순 금액 검증 (차변 - 대변 = 음수)
        assertEquals(new BigDecimal("-100000.00"), creditNetAmount);
    }

    @Test
    @DisplayName("Phase 4-13: 빈 분개 상세 내역 처리")
    public void testEmptyJournalEntryDetails() {
        // Given: 상세 내역이 없는 분개
        JournalEntry journalEntry = JournalEntry.createDraft(
                testCompanyId, LocalDate.now(), "빈 분개", "MANUAL", null, new BigDecimal("0.00")
        );
        
        // When & Then: 빈 상세 내역 검증
        assertFalse(journalEntry.isBalanced(), "상세 내역이 없으면 균형이 아님");
        assertEquals(BigDecimal.ZERO, journalEntry.getTotalDebitAmount());
        assertEquals(BigDecimal.ZERO, journalEntry.getTotalCreditAmount());
        
        // 승인 시 예외 발생
        IllegalStateException exception = assertThrows(IllegalStateException.class, journalEntry::approve);
        assertEquals("Journal entry must be balanced before approval", exception.getMessage());
    }

    @Test
    @DisplayName("Phase 4-14: 상태 변경 제약 검증")
    public void testJournalEntryStatusConstraints() {
        // Given: 분개 생성
        JournalEntry journalEntry = JournalEntry.createDraft(
                testCompanyId, LocalDate.now(), "상태 테스트", "MANUAL", null, new BigDecimal("50000.00")
        );
        
        List<JournalEntryDetail> details = new ArrayList<>();
        details.add(JournalEntryDetail.createDebit(1, "5130", "소모품비", new BigDecimal("50000.00"), "비용"));
        details.add(JournalEntryDetail.createCredit(2, "1120", "보통예금", new BigDecimal("50000.00"), "지출"));
        journalEntry.setDetails(details);
        
        // 1단계: DRAFT → APPROVED
        assertEquals("DRAFT", journalEntry.getStatus());
        journalEntry.approve();
        assertEquals("APPROVED", journalEntry.getStatus());
        
        // 중복 승인 시 예외
        IllegalStateException approveException = assertThrows(IllegalStateException.class, journalEntry::approve);
        assertEquals("Only DRAFT entries can be approved", approveException.getMessage());
        
        // 2단계: APPROVED → POSTED
        journalEntry.post();
        assertEquals("POSTED", journalEntry.getStatus());
        assertNotNull(journalEntry.getPostedAt());
        
        // POSTED 상태에서 승인 시도 시 예외
        IllegalStateException postApproveException = assertThrows(IllegalStateException.class, journalEntry::approve);
        assertEquals("Only DRAFT entries can be approved", postApproveException.getMessage());
        
        // POSTED 상태에서 전기 시도 시 예외
        IllegalStateException postException = assertThrows(IllegalStateException.class, journalEntry::post);
        assertEquals("Only APPROVED entries can be posted", postException.getMessage());
    }

    @Test
    @DisplayName("Phase 4-15: 수익 거래 분개 생성")
    public void testRevenueTransactionJournalEntry() {
        // Given: 수익 거래
        TransactionEntity revenueTransaction = TransactionEntity.builder()
                .id(2L)
                .companyId(testCompanyId)
                .amount(200000L) // 200,000원
                .transactionDate(LocalDate.now())
                .transactionType("INCOME")
                .rawText("서비스 수입")
                .finalSuggestedTag("매출")
                .build();
        
        TransactionToJournalRequest request = new TransactionToJournalRequest();
        request.setTransactionId(revenueTransaction.getId());
        request.setCompanyId(revenueTransaction.getCompanyId());
        request.setForceRegenerate(true);
        
        // When: 분개 자동 생성
        JournalEntry generatedEntry = accountingEngine.processTransaction(request);
        
        // Then: 수익 분개 검증
        assertNotNull(generatedEntry);
        assertTrue(generatedEntry.isBalanced());
        assertEquals(2, generatedEntry.getDetails().size());
        
        // 차변: 현금/예금 계정
        JournalEntryDetail debitDetail = generatedEntry.getDetails().stream()
                .filter(JournalEntryDetail::isDebit)
                .findFirst()
                .orElse(null);
        assertNotNull(debitDetail);
        assertEquals("1120", debitDetail.getAccountCode()); // 보통예금
        assertEquals(new BigDecimal("200000"), debitDetail.getDebitAmount());
        
        // 대변: 수익 계정
        JournalEntryDetail creditDetail = generatedEntry.getDetails().stream()
                .filter(JournalEntryDetail::isCredit)
                .findFirst()
                .orElse(null);
        assertNotNull(creditDetail);
        assertEquals("4110", creditDetail.getAccountCode()); // 매출
        assertEquals(new BigDecimal("200000"), creditDetail.getCreditAmount());
    }
}
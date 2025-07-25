package com.moneyshift.api.model;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonInclude;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Phase 4: 회계 분개 모델 - 복식부기 분개 자동 생성 시스템
 * 거래(Transaction) → 분개(Journal Entry) 자동 변환 및 GL 전기
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
@Schema(description = "회계 분개 모델", example = """
    {
      "id": 1,
      "company_id": "test-company",
      "entry_date": "2025-01-24",
      "description": "사무용품 구매",
      "reference_type": "TRANSACTION",
      "reference_id": 123,
      "total_amount": 50000.00,
      "status": "DRAFT"
    }
    """)
public class JournalEntry {
    
    @Schema(description = "분개 ID", example = "1")
    private Long id;
    
    @NotBlank(message = "회사 ID는 필수입니다")
    @Schema(description = "회사 ID", example = "test-company")
    private String companyId;
    
    @NotNull(message = "분개일자는 필수입니다")
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
    @Schema(description = "분개일자", example = "2025-01-24")
    private LocalDate entryDate;
    
    @NotBlank(message = "분개설명은 필수입니다")
    @Schema(description = "분개설명", example = "사무용품 구매")
    private String description;
    
    @NotBlank(message = "참조유형은 필수입니다")
    @Schema(description = "참조유형", example = "TRANSACTION", allowableValues = {"TRANSACTION", "MANUAL", "ADJUSTMENT"})
    private String referenceType;
    
    @Schema(description = "참조 ID", example = "123")
    private Long referenceId;
    
    @NotNull(message = "총 금액은 필수입니다")
    @Schema(description = "총 금액", example = "50000.00")
    private BigDecimal totalAmount;
    
    @Schema(description = "총 차변 금액", example = "50000.00")
    private BigDecimal totalDebitAmount;
    
    @Schema(description = "총 대변 금액", example = "50000.00")
    private BigDecimal totalCreditAmount;
    
    @Builder.Default
    @Schema(description = "분개상태", example = "DRAFT", allowableValues = {"DRAFT", "APPROVED", "POSTED"}, defaultValue = "DRAFT")
    private String status = "DRAFT";
    
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
    @Schema(description = "전기일자", example = "2025-01-24")
    private LocalDate postedAt;
    
    @Schema(description = "생성자", example = "SYSTEM")
    private String createdBy;
    
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    @Builder.Default
    @Schema(description = "생성일시", example = "2025-01-24T10:30:00")
    private LocalDateTime createdAt = LocalDateTime.now();
    
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    @Schema(description = "수정일시", example = "2025-01-24T10:30:00")
    private LocalDateTime updatedAt;
    
    @Schema(description = "신뢰도 점수", example = "0.95")
    private Double confidenceScore;
    
    @Schema(description = "분개 상세 내역 목록")
    private List<JournalEntryDetail> details;

    // ========== 비즈니스 로직 메소드들 ==========

    /**
     * 복식부기 분개 균형 검증 (차변 = 대변)
     */
    public boolean isBalanced() {
        if (details == null || details.isEmpty()) {
            return false;
        }
        
        BigDecimal totalDebit = details.stream()
                .map(JournalEntryDetail::getDebitAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totalCredit = details.stream()
                .map(JournalEntryDetail::getCreditAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        return totalDebit.compareTo(totalCredit) == 0;
    }
    
    /**
     * 총 차변 금액 계산
     */
    public BigDecimal getTotalDebitAmount() {
        if (details == null || details.isEmpty()) {
            return BigDecimal.ZERO;
        }
        return details.stream()
                .map(JournalEntryDetail::getDebitAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
    
    /**
     * 총 대변 금액 계산
     */
    public BigDecimal getTotalCreditAmount() {
        if (details == null || details.isEmpty()) {
            return BigDecimal.ZERO;
        }
        return details.stream()
                .map(JournalEntryDetail::getCreditAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
    
    /**
     * Builder 패턴으로 DRAFT 상태 분개 생성
     */
    public static JournalEntry createDraft(String companyId, LocalDate entryDate, 
                                         String description, String referenceType, 
                                         Long referenceId, BigDecimal totalAmount) {
        return JournalEntry.builder()
                .companyId(companyId)
                .entryDate(entryDate)
                .description(description)
                .referenceType(referenceType)
                .referenceId(referenceId)
                .totalAmount(totalAmount)
                .totalDebitAmount(totalAmount)
                .totalCreditAmount(totalAmount)
                .status("DRAFT")
                .createdBy("SYSTEM")
                .createdAt(LocalDateTime.now())
                .build();
    }

    /**
     * 분개 승인 처리
     */
    public void approve() {
        if (!"DRAFT".equals(this.status)) {
            throw new IllegalStateException("Only DRAFT entries can be approved");
        }
        if (!isBalanced()) {
            throw new IllegalStateException("Journal entry must be balanced before approval");
        }
        this.status = "APPROVED";
    }

    /**
     * 분개 전기 처리
     */
    public void post() {
        if (!"APPROVED".equals(this.status)) {
            throw new IllegalStateException("Only APPROVED entries can be posted");
        }
        this.status = "POSTED";
        this.postedAt = LocalDate.now();
    }
}
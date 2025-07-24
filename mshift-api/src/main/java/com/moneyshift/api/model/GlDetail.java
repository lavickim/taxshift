package com.moneyshift.api.model;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonInclude;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Phase 3: GL Detail 모델
 * GL 계정별 상세 거래내역 및 감사 추적용
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
@Schema(description = "GL 상세 거래내역 모델 (감사 추적용)", example = """
    {
      "general_ledger_id": 1,
      "journal_entry_id": 100,
      "posting_date": "2025-01-24T10:30:00",
      "debit_amount": 50000.00,
      "credit_amount": 0.00,
      "running_balance": 1050000.00,
      "description": "사무용품 구매"
    }
    """)
public class GlDetail {

    @Schema(description = "GL Detail ID (PK)", example = "1")
    private Long id;

    @NotNull(message = "General Ledger ID는 필수입니다")
    @Schema(description = "General Ledger ID", example = "1")
    private Long generalLedgerId;

    @NotNull(message = "Journal Entry ID는 필수입니다")
    @Schema(description = "분개 ID", example = "100")
    private Long journalEntryId;

    @NotNull(message = "전기일자는 필수입니다")
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    @Schema(description = "전기일자", example = "2025-01-24T10:30:00")
    private LocalDateTime postingDate;

    @Builder.Default
    @Schema(description = "차변 금액", example = "50000.00", defaultValue = "0.00")
    private BigDecimal debitAmount = BigDecimal.ZERO;

    @Builder.Default
    @Schema(description = "대변 금액", example = "0.00", defaultValue = "0.00")
    private BigDecimal creditAmount = BigDecimal.ZERO;

    @Builder.Default
    @Schema(description = "누적 잔액 (Running Balance)", example = "1050000.00", defaultValue = "0.00")
    private BigDecimal runningBalance = BigDecimal.ZERO;

    @Schema(description = "거래 설명", example = "사무용품 구매")
    private String description;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    @Builder.Default
    @Schema(description = "생성일시", example = "2025-01-24T10:30:00")
    private LocalDateTime createdAt = LocalDateTime.now();

    // ========== 조인용 필드들 ==========

    @Schema(description = "회사 ID (조인용)", example = "test-company")
    private String companyId;

    @Schema(description = "계정과목 코드 (조인용)", example = "1100")
    private String accountCode;

    @Schema(description = "계정과목명 (조인용)", example = "현금")
    private String accountName;

    @Schema(description = "분개 참조 유형 (조인용)", example = "TRANSACTION")
    private String referenceType;

    @Schema(description = "분개 참조 ID (조인용)", example = "123")
    private Long referenceId;

    // ========== 비즈니스 로직 메소드들 ==========

    /**
     * Running Balance 계산
     * 차변이면 +, 대변이면 - (자산 기준)
     */
    public void calculateRunningBalance(BigDecimal previousBalance, boolean isDebitNormalAccount) {
        if (isDebitNormalAccount) {
            // 차변 정상 계정 (자산, 비용): 차변 +, 대변 -
            this.runningBalance = previousBalance.add(this.debitAmount).subtract(this.creditAmount);
        } else {
            // 대변 정상 계정 (부채, 자본, 수익): 대변 +, 차변 -
            this.runningBalance = previousBalance.add(this.creditAmount).subtract(this.debitAmount);
        }
    }

    /**
     * 거래 순 금액 계산
     */
    public BigDecimal getNetAmount() {
        return this.debitAmount.subtract(this.creditAmount);
    }

    /**
     * 차변 거래 여부
     */
    public boolean isDebitTransaction() {
        return this.debitAmount.compareTo(BigDecimal.ZERO) > 0;
    }

    /**
     * 대변 거래 여부
     */
    public boolean isCreditTransaction() {
        return this.creditAmount.compareTo(BigDecimal.ZERO) > 0;
    }

    /**
     * GL Detail 생성 Factory 메소드 - 차변
     */
    public static GlDetail createDebit(Long generalLedgerId, Long journalEntryId, 
                                      BigDecimal debitAmount, String description) {
        return GlDetail.builder()
                .generalLedgerId(generalLedgerId)
                .journalEntryId(journalEntryId)
                .postingDate(LocalDateTime.now())
                .debitAmount(debitAmount)
                .creditAmount(BigDecimal.ZERO)
                .description(description)
                .createdAt(LocalDateTime.now())
                .build();
    }

    /**
     * GL Detail 생성 Factory 메소드 - 대변
     */
    public static GlDetail createCredit(Long generalLedgerId, Long journalEntryId, 
                                       BigDecimal creditAmount, String description) {
        return GlDetail.builder()
                .generalLedgerId(generalLedgerId)
                .journalEntryId(journalEntryId)
                .postingDate(LocalDateTime.now())
                .debitAmount(BigDecimal.ZERO)
                .creditAmount(creditAmount)
                .description(description)
                .createdAt(LocalDateTime.now())
                .build();
    }

    /**
     * GL Detail 생성 Factory 메소드 - 일반
     */
    public static GlDetail create(Long generalLedgerId, Long journalEntryId, 
                                 BigDecimal debitAmount, BigDecimal creditAmount, 
                                 String description) {
        return GlDetail.builder()
                .generalLedgerId(generalLedgerId)
                .journalEntryId(journalEntryId)
                .postingDate(LocalDateTime.now())
                .debitAmount(debitAmount != null ? debitAmount : BigDecimal.ZERO)
                .creditAmount(creditAmount != null ? creditAmount : BigDecimal.ZERO)
                .description(description)
                .createdAt(LocalDateTime.now())
                .build();
    }
}
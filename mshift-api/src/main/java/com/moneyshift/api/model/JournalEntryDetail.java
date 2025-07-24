package com.moneyshift.api.model;

import com.fasterxml.jackson.annotation.JsonInclude;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * Phase 4: 분개 상세 내역 모델 (차변/대변)
 * 복식부기 원칙에 따른 분개 라인별 차변/대변 금액 관리
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
@Schema(description = "분개 상세 내역 모델", example = """
    {
      "id": 1,
      "journal_entry_id": 100,
      "line_number": 1,
      "account_code": "5130",
      "account_name": "소모품비",
      "debit_amount": 50000.00,
      "credit_amount": 0.00,
      "description": "사무용품 구매"
    }
    """)
public class JournalEntryDetail {
    
    @Schema(description = "분개 상세 ID", example = "1")
    private Long id;
    
    @NotNull(message = "분개 ID는 필수입니다")
    @Schema(description = "분개 ID", example = "100")
    private Long journalEntryId;
    
    @NotNull(message = "라인 번호는 필수입니다")
    @Schema(description = "라인 번호", example = "1")
    private Integer lineNumber;
    
    @NotBlank(message = "계정코드는 필수입니다")
    @Schema(description = "계정코드", example = "5130")
    private String accountCode;
    
    @Schema(description = "계정과목명", example = "소모품비")
    private String accountName;
    
    @Builder.Default
    @Schema(description = "차변 금액", example = "50000.00", defaultValue = "0.00")
    private BigDecimal debitAmount = BigDecimal.ZERO;
    
    @Builder.Default
    @Schema(description = "대변 금액", example = "0.00", defaultValue = "0.00")
    private BigDecimal creditAmount = BigDecimal.ZERO;
    
    @Schema(description = "분개 라인 설명", example = "사무용품 구매")
    private String description;

    // ========== 비즈니스 로직 메소드들 ==========

    /**
     * 차변 분개 라인 생성 (Builder 패턴)
     */
    public static JournalEntryDetail createDebit(Integer lineNumber, String accountCode, 
                                               String accountName, BigDecimal amount, String description) {
        return JournalEntryDetail.builder()
                .lineNumber(lineNumber)
                .accountCode(accountCode)
                .accountName(accountName)
                .debitAmount(amount)
                .creditAmount(BigDecimal.ZERO)
                .description(description)
                .build();
    }

    /**
     * 대변 분개 라인 생성 (Builder 패턴)
     */
    public static JournalEntryDetail createCredit(Integer lineNumber, String accountCode, 
                                                String accountName, BigDecimal amount, String description) {
        return JournalEntryDetail.builder()
                .lineNumber(lineNumber)
                .accountCode(accountCode)
                .accountName(accountName)
                .debitAmount(BigDecimal.ZERO)
                .creditAmount(amount)
                .description(description)
                .build();
    }

    /**
     * 차변 분개 라인인지 확인
     */
    public boolean isDebit() {
        return debitAmount != null && debitAmount.compareTo(BigDecimal.ZERO) > 0;
    }

    /**
     * 대변 분개 라인인지 확인
     */
    public boolean isCredit() {
        return creditAmount != null && creditAmount.compareTo(BigDecimal.ZERO) > 0;
    }

    /**
     * 분개 라인 금액 (차변 또는 대변)
     */
    public BigDecimal getAmount() {
        return isDebit() ? debitAmount : creditAmount;
    }

    /**
     * 분개 라인 순 금액 (차변 - 대변)
     */
    public BigDecimal getNetAmount() {
        return debitAmount.subtract(creditAmount);
    }

    /**
     * 분개 라인의 차대구분
     */
    public String getDebitCreditType() {
        if (isDebit()) {
            return "DEBIT";
        } else if (isCredit()) {
            return "CREDIT";
        } else {
            return "NONE";
        }
    }
}
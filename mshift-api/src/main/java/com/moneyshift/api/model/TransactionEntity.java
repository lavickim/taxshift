package com.moneyshift.api.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

/**
 * 거래 내역 엔티티 (데이터베이스 transactions 테이블)
 * MyBatis + Lombok + Builder 패턴
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TransactionEntity {
    
    @JsonProperty("id")
    private Long id;
    
    @JsonProperty("company_id")
    private String companyId;
    
    @JsonProperty("raw_text")
    private String rawText;
    
    @JsonProperty("transaction_date")
    private LocalDate transactionDate;
    
    @JsonProperty("amount")
    private Long amount;
    
    @JsonProperty("final_suggested_tag")
    private String finalSuggestedTag;
    
    @JsonProperty("final_debit_account") 
    private String finalDebitAccount;
    
    @JsonProperty("final_credit_account")
    private String finalCreditAccount;
    
    @JsonProperty("transaction_type")
    private String transactionType;  // "EXPENSE", "INCOME", "TRANSFER"
    
    @JsonProperty("layer_matched")
    private String layerMatched;  // "CACHE", "REGEX", "ML", "LLM"
    
    @JsonProperty("confidence_score")
    private Double confidenceScore;

    /**
     * 지출 거래인지 확인
     */
    public boolean isExpense() {
        return "EXPENSE".equals(transactionType);
    }

    /**
     * 수입 거래인지 확인
     */
    public boolean isIncome() {
        return "INCOME".equals(transactionType);
    }

    /**
     * 거래 금액 (절댓값)
     */
    public Long getAbsoluteAmount() {
        return amount != null ? Math.abs(amount) : 0L;
    }

    /**
     * 거래 설명 정리
     */
    public String getCleanDescription() {
        if (rawText == null) return "";
        return rawText.trim().replaceAll("\\s+", " ");
    }
}
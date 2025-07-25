package com.moneyshift.api.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

/**
 * 거래 → 분개 생성 요청 모델
 */
@Data
@Builder(toBuilder = true)
@NoArgsConstructor
@AllArgsConstructor
public class TransactionToJournalRequest {
    
    @JsonProperty("transaction_id")
    private Long transactionId;
    
    @JsonProperty("company_id")
    private String companyId;
    
    @JsonProperty("force_regenerate")
    @Builder.Default
    private Boolean forceRegenerate = false;
    
    @JsonProperty("transaction_date")
    private LocalDate transactionDate;
    
    @JsonProperty("description")
    private String description;
    
    @JsonProperty("amount")
    private BigDecimal amount;
    
    @JsonProperty("merchant_name")
    private String merchantName;
    
    @JsonProperty("category")
    private String category;
    
    @JsonProperty("tags")
    private List<String> tags;
}
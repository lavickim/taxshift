package com.moneyshift.api.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

/**
 * 거래 → 분개 생성 요청 모델
 */
@Data
@Builder
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
}
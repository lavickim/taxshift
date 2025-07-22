package com.moneyshift.api.model;

import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * 거래 → 분개 생성 요청 모델
 */
public class TransactionToJournalRequest {
    
    @JsonProperty("transaction_id")
    private Long transactionId;
    
    @JsonProperty("company_id")
    private String companyId;
    
    @JsonProperty("force_regenerate")
    private Boolean forceRegenerate = false;

    // 기본 생성자
    public TransactionToJournalRequest() {}

    // 생성자
    public TransactionToJournalRequest(Long transactionId, String companyId) {
        this.transactionId = transactionId;
        this.companyId = companyId;
    }

    // Getters and Setters
    public Long getTransactionId() { return transactionId; }
    public void setTransactionId(Long transactionId) { this.transactionId = transactionId; }

    public String getCompanyId() { return companyId; }
    public void setCompanyId(String companyId) { this.companyId = companyId; }

    public Boolean getForceRegenerate() { return forceRegenerate; }
    public void setForceRegenerate(Boolean forceRegenerate) { this.forceRegenerate = forceRegenerate; }

    @Override
    public String toString() {
        return String.format("TransactionToJournalRequest{transactionId=%d, companyId='%s', forceRegenerate=%s}", 
                           transactionId, companyId, forceRegenerate);
    }
}
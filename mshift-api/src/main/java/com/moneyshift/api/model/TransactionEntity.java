package com.moneyshift.api.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.LocalDate;

/**
 * 거래 내역 엔티티 (데이터베이스 transactions 테이블)
 */
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
    private String transactionType;
    
    @JsonProperty("status")
    private String status;

    // 기본 생성자
    public TransactionEntity() {}

    // 생성자
    public TransactionEntity(Long id, String companyId, String rawText, LocalDate transactionDate, 
                           Long amount, String finalSuggestedTag, String transactionType) {
        this.id = id;
        this.companyId = companyId;
        this.rawText = rawText;
        this.transactionDate = transactionDate;
        this.amount = amount;
        this.finalSuggestedTag = finalSuggestedTag;
        this.transactionType = transactionType;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getCompanyId() { return companyId; }
    public void setCompanyId(String companyId) { this.companyId = companyId; }

    public String getRawText() { return rawText; }
    public void setRawText(String rawText) { this.rawText = rawText; }

    public LocalDate getTransactionDate() { return transactionDate; }
    public void setTransactionDate(LocalDate transactionDate) { this.transactionDate = transactionDate; }

    public Long getAmount() { return amount; }
    public void setAmount(Long amount) { this.amount = amount; }

    public String getFinalSuggestedTag() { return finalSuggestedTag; }
    public void setFinalSuggestedTag(String finalSuggestedTag) { this.finalSuggestedTag = finalSuggestedTag; }

    public String getFinalDebitAccount() { return finalDebitAccount; }
    public void setFinalDebitAccount(String finalDebitAccount) { this.finalDebitAccount = finalDebitAccount; }

    public String getFinalCreditAccount() { return finalCreditAccount; }
    public void setFinalCreditAccount(String finalCreditAccount) { this.finalCreditAccount = finalCreditAccount; }

    public String getTransactionType() { return transactionType; }
    public void setTransactionType(String transactionType) { this.transactionType = transactionType; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    @Override
    public String toString() {
        return String.format("TransactionEntity{id=%d, companyId='%s', rawText='%s', transactionDate=%s, amount=%d, tag='%s', type='%s'}", 
                           id, companyId, rawText, transactionDate, amount, finalSuggestedTag, transactionType);
    }
}
package com.moneyshift.api.model;

import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * 분개 상세 내역 모델 (차변/대변)
 */
public class JournalEntryDetail {
    
    @JsonProperty("id")
    private Long id;
    
    @JsonProperty("journal_entry_id")
    private Long journalEntryId;
    
    @JsonProperty("line_number")
    private Integer lineNumber;
    
    @JsonProperty("account_code")
    private String accountCode;
    
    @JsonProperty("account_name")
    private String accountName;
    
    @JsonProperty("debit_amount")
    private Long debitAmount;
    
    @JsonProperty("credit_amount")
    private Long creditAmount;
    
    @JsonProperty("description")
    private String description;

    // 기본 생성자
    public JournalEntryDetail() {
        this.debitAmount = 0L;
        this.creditAmount = 0L;
    }

    // 생성자
    public JournalEntryDetail(Integer lineNumber, String accountCode, String accountName, 
                             Long debitAmount, Long creditAmount, String description) {
        this.lineNumber = lineNumber;
        this.accountCode = accountCode;
        this.accountName = accountName;
        this.debitAmount = debitAmount != null ? debitAmount : 0L;
        this.creditAmount = creditAmount != null ? creditAmount : 0L;
        this.description = description;
    }

    // 차변 생성 편의 메서드
    public static JournalEntryDetail createDebit(Integer lineNumber, String accountCode, 
                                               String accountName, Long amount, String description) {
        return new JournalEntryDetail(lineNumber, accountCode, accountName, amount, 0L, description);
    }

    // 대변 생성 편의 메서드
    public static JournalEntryDetail createCredit(Integer lineNumber, String accountCode, 
                                                String accountName, Long amount, String description) {
        return new JournalEntryDetail(lineNumber, accountCode, accountName, 0L, amount, description);
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getJournalEntryId() { return journalEntryId; }
    public void setJournalEntryId(Long journalEntryId) { this.journalEntryId = journalEntryId; }

    public Integer getLineNumber() { return lineNumber; }
    public void setLineNumber(Integer lineNumber) { this.lineNumber = lineNumber; }

    public String getAccountCode() { return accountCode; }
    public void setAccountCode(String accountCode) { this.accountCode = accountCode; }

    public String getAccountName() { return accountName; }
    public void setAccountName(String accountName) { this.accountName = accountName; }

    public Long getDebitAmount() { return debitAmount; }
    public void setDebitAmount(Long debitAmount) { this.debitAmount = debitAmount; }

    public Long getCreditAmount() { return creditAmount; }
    public void setCreditAmount(Long creditAmount) { this.creditAmount = creditAmount; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    /**
     * 분개가 차변인지 확인
     */
    public boolean isDebit() {
        return debitAmount > 0 && creditAmount == 0;
    }

    /**
     * 분개가 대변인지 확인
     */
    public boolean isCredit() {
        return creditAmount > 0 && debitAmount == 0;
    }

    /**
     * 분개 금액 반환 (차변이면 양수, 대변이면 음수)
     */
    public Long getSignedAmount() {
        if (isDebit()) return debitAmount;
        if (isCredit()) return -creditAmount;
        return 0L;
    }

    @Override
    public String toString() {
        return String.format("JournalEntryDetail{lineNumber=%d, accountCode='%s', accountName='%s', debit=%d, credit=%d, description='%s'}", 
                           lineNumber, accountCode, accountName, debitAmount, creditAmount, description);
    }
}
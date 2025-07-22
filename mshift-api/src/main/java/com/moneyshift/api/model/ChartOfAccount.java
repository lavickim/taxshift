package com.moneyshift.api.model;

import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * 회계 계정과목 모델
 */
public class ChartOfAccount {
    
    @JsonProperty("id")
    private Integer id;
    
    @JsonProperty("account_code")
    private String accountCode;
    
    @JsonProperty("account_name")
    private String accountName;
    
    @JsonProperty("account_type")
    private String accountType;
    
    @JsonProperty("account_subtype")
    private String accountSubtype;
    
    @JsonProperty("is_debit_normal")
    private Boolean isDebitNormal;
    
    @JsonProperty("parent_account_id")
    private Integer parentAccountId;
    
    @JsonProperty("is_active")
    private Boolean isActive;
    
    @JsonProperty("display_order")
    private Integer displayOrder;

    // 기본 생성자
    public ChartOfAccount() {}

    // 전체 생성자
    public ChartOfAccount(Integer id, String accountCode, String accountName, String accountType, 
                         String accountSubtype, Boolean isDebitNormal, Integer parentAccountId, 
                         Boolean isActive, Integer displayOrder) {
        this.id = id;
        this.accountCode = accountCode;
        this.accountName = accountName;
        this.accountType = accountType;
        this.accountSubtype = accountSubtype;
        this.isDebitNormal = isDebitNormal;
        this.parentAccountId = parentAccountId;
        this.isActive = isActive;
        this.displayOrder = displayOrder;
    }

    // Getters and Setters
    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public String getAccountCode() { return accountCode; }
    public void setAccountCode(String accountCode) { this.accountCode = accountCode; }

    public String getAccountName() { return accountName; }
    public void setAccountName(String accountName) { this.accountName = accountName; }

    public String getAccountType() { return accountType; }
    public void setAccountType(String accountType) { this.accountType = accountType; }

    public String getAccountSubtype() { return accountSubtype; }
    public void setAccountSubtype(String accountSubtype) { this.accountSubtype = accountSubtype; }

    public Boolean getIsDebitNormal() { return isDebitNormal; }
    public void setIsDebitNormal(Boolean isDebitNormal) { this.isDebitNormal = isDebitNormal; }

    public Integer getParentAccountId() { return parentAccountId; }
    public void setParentAccountId(Integer parentAccountId) { this.parentAccountId = parentAccountId; }

    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }

    public Integer getDisplayOrder() { return displayOrder; }
    public void setDisplayOrder(Integer displayOrder) { this.displayOrder = displayOrder; }

    @Override
    public String toString() {
        return String.format("ChartOfAccount{id=%d, accountCode='%s', accountName='%s', accountType='%s', accountSubtype='%s'}", 
                           id, accountCode, accountName, accountType, accountSubtype);
    }
}
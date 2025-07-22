package com.moneyshift.api.model;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

/**
 * 대차대조표 응답 모델
 */
public class BalanceSheetResponse {
    
    private List<AccountItem> assets;
    private List<AccountItem> liabilities;
    private List<AccountItem> equity;
    private LocalDate asOfDate;
    private BigDecimal totalAssets;
    private BigDecimal totalLiabilities;
    private BigDecimal totalEquity;

    public static class AccountItem {
        private String accountCode;
        private String accountName;
        private BigDecimal amount;
        private String category;

        public AccountItem() {}

        public AccountItem(String accountCode, String accountName, BigDecimal amount) {
            this.accountCode = accountCode;
            this.accountName = accountName;
            this.amount = amount;
        }

        public AccountItem(String accountCode, String accountName, BigDecimal amount, String category) {
            this.accountCode = accountCode;
            this.accountName = accountName;
            this.amount = amount;
            this.category = category;
        }

        // Getters and Setters
        public String getAccountCode() { return accountCode; }
        public void setAccountCode(String accountCode) { this.accountCode = accountCode; }

        public String getAccountName() { return accountName; }
        public void setAccountName(String accountName) { this.accountName = accountName; }

        public BigDecimal getAmount() { return amount; }
        public void setAmount(BigDecimal amount) { this.amount = amount; }

        public String getCategory() { return category; }
        public void setCategory(String category) { this.category = category; }
    }

    public BalanceSheetResponse() {}

    public BalanceSheetResponse(List<AccountItem> assets, List<AccountItem> liabilities, 
                              List<AccountItem> equity, LocalDate asOfDate) {
        this.assets = assets;
        this.liabilities = liabilities;
        this.equity = equity;
        this.asOfDate = asOfDate;
        this.totalAssets = calculateTotal(assets);
        this.totalLiabilities = calculateTotal(liabilities);
        this.totalEquity = calculateTotal(equity);
    }

    private BigDecimal calculateTotal(List<AccountItem> items) {
        return items.stream()
                .map(AccountItem::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    // Getters and Setters
    public List<AccountItem> getAssets() { return assets; }
    public void setAssets(List<AccountItem> assets) { 
        this.assets = assets;
        this.totalAssets = calculateTotal(assets);
    }

    public List<AccountItem> getLiabilities() { return liabilities; }
    public void setLiabilities(List<AccountItem> liabilities) { 
        this.liabilities = liabilities;
        this.totalLiabilities = calculateTotal(liabilities);
    }

    public List<AccountItem> getEquity() { return equity; }
    public void setEquity(List<AccountItem> equity) { 
        this.equity = equity;
        this.totalEquity = calculateTotal(equity);
    }

    public LocalDate getAsOfDate() { return asOfDate; }
    public void setAsOfDate(LocalDate asOfDate) { this.asOfDate = asOfDate; }

    public BigDecimal getTotalAssets() { return totalAssets; }
    public void setTotalAssets(BigDecimal totalAssets) { this.totalAssets = totalAssets; }

    public BigDecimal getTotalLiabilities() { return totalLiabilities; }
    public void setTotalLiabilities(BigDecimal totalLiabilities) { this.totalLiabilities = totalLiabilities; }

    public BigDecimal getTotalEquity() { return totalEquity; }
    public void setTotalEquity(BigDecimal totalEquity) { this.totalEquity = totalEquity; }

    /**
     * 복식부기 균형 체크 - 자산 = 부채 + 자본
     */
    public boolean isBalanced() {
        return totalAssets.compareTo(totalLiabilities.add(totalEquity)) == 0;
    }

    @Override
    public String toString() {
        return "BalanceSheetResponse{" +
                "totalAssets=" + totalAssets +
                ", totalLiabilities=" + totalLiabilities +
                ", totalEquity=" + totalEquity +
                ", asOfDate=" + asOfDate +
                ", balanced=" + isBalanced() +
                '}';
    }
}
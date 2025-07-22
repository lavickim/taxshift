package com.moneyshift.api.model;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;

/**
 * 손익계산서 응답 모델
 */
public class IncomeStatementResponse {
    
    private List<AccountItem> revenue;
    private List<AccountItem> expenses;
    private LocalDate periodStart;
    private LocalDate periodEnd;
    private BigDecimal totalRevenue;
    private BigDecimal totalExpenses;
    private BigDecimal grossProfit;
    private BigDecimal operatingIncome;
    private BigDecimal netIncome;

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

    public IncomeStatementResponse() {}

    public IncomeStatementResponse(List<AccountItem> revenue, List<AccountItem> expenses, 
                                 LocalDate periodStart, LocalDate periodEnd) {
        this.revenue = revenue;
        this.expenses = expenses;
        this.periodStart = periodStart;
        this.periodEnd = periodEnd;
        this.totalRevenue = calculateTotal(revenue);
        this.totalExpenses = calculateTotal(expenses);
        this.grossProfit = calculateGrossProfit();
        this.operatingIncome = calculateOperatingIncome();
        this.netIncome = totalRevenue.subtract(totalExpenses);
    }

    private BigDecimal calculateTotal(List<AccountItem> items) {
        return items.stream()
                .map(AccountItem::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private BigDecimal calculateGrossProfit() {
        BigDecimal cogs = expenses.stream()
                .filter(item -> "COGS".equals(item.getCategory()))
                .map(AccountItem::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        return totalRevenue.subtract(cogs);
    }

    private BigDecimal calculateOperatingIncome() {
        BigDecimal operatingExpenses = expenses.stream()
                .filter(item -> "OPERATING".equals(item.getCategory()))
                .map(AccountItem::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        return grossProfit.subtract(operatingExpenses);
    }

    // Getters and Setters
    public List<AccountItem> getRevenue() { return revenue; }
    public void setRevenue(List<AccountItem> revenue) { 
        this.revenue = revenue;
        this.totalRevenue = calculateTotal(revenue);
        updateCalculatedFields();
    }

    public List<AccountItem> getExpenses() { return expenses; }
    public void setExpenses(List<AccountItem> expenses) { 
        this.expenses = expenses;
        this.totalExpenses = calculateTotal(expenses);
        updateCalculatedFields();
    }

    public LocalDate getPeriodStart() { return periodStart; }
    public void setPeriodStart(LocalDate periodStart) { this.periodStart = periodStart; }

    public LocalDate getPeriodEnd() { return periodEnd; }
    public void setPeriodEnd(LocalDate periodEnd) { this.periodEnd = periodEnd; }

    public BigDecimal getTotalRevenue() { return totalRevenue; }
    public void setTotalRevenue(BigDecimal totalRevenue) { this.totalRevenue = totalRevenue; }

    public BigDecimal getTotalExpenses() { return totalExpenses; }
    public void setTotalExpenses(BigDecimal totalExpenses) { this.totalExpenses = totalExpenses; }

    public BigDecimal getGrossProfit() { return grossProfit; }
    public void setGrossProfit(BigDecimal grossProfit) { this.grossProfit = grossProfit; }

    public BigDecimal getOperatingIncome() { return operatingIncome; }
    public void setOperatingIncome(BigDecimal operatingIncome) { this.operatingIncome = operatingIncome; }

    public BigDecimal getNetIncome() { return netIncome; }
    public void setNetIncome(BigDecimal netIncome) { this.netIncome = netIncome; }

    private void updateCalculatedFields() {
        if (revenue != null && expenses != null) {
            this.grossProfit = calculateGrossProfit();
            this.operatingIncome = calculateOperatingIncome();
            this.netIncome = totalRevenue.subtract(totalExpenses);
        }
    }

    /**
     * 수익성 지표 계산
     */
    public BigDecimal getGrossProfitMargin() {
        if (totalRevenue.compareTo(BigDecimal.ZERO) == 0) return BigDecimal.ZERO;
        return grossProfit.divide(totalRevenue, 4, RoundingMode.HALF_UP)
                .multiply(BigDecimal.valueOf(100));
    }

    public BigDecimal getOperatingProfitMargin() {
        if (totalRevenue.compareTo(BigDecimal.ZERO) == 0) return BigDecimal.ZERO;
        return operatingIncome.divide(totalRevenue, 4, RoundingMode.HALF_UP)
                .multiply(BigDecimal.valueOf(100));
    }

    public BigDecimal getNetProfitMargin() {
        if (totalRevenue.compareTo(BigDecimal.ZERO) == 0) return BigDecimal.ZERO;
        return netIncome.divide(totalRevenue, 4, RoundingMode.HALF_UP)
                .multiply(BigDecimal.valueOf(100));
    }

    @Override
    public String toString() {
        return "IncomeStatementResponse{" +
                "totalRevenue=" + totalRevenue +
                ", totalExpenses=" + totalExpenses +
                ", netIncome=" + netIncome +
                ", periodStart=" + periodStart +
                ", periodEnd=" + periodEnd +
                ", netProfitMargin=" + getNetProfitMargin() + "%" +
                '}';
    }
}
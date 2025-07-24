package com.moneyshift.api.model;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;
import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

/**
 * 손익계산서 응답 모델
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
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

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AccountItem {
        private String accountCode;
        private String accountName;
        private BigDecimal amount;
        private String category;
    }

    // 비즈니스 로직을 포함한 생성자 메소드
    public static IncomeStatementResponse create(List<AccountItem> revenue, List<AccountItem> expenses, 
                                               LocalDate periodStart, LocalDate periodEnd) {
        BigDecimal totalRevenue = calculateTotal(revenue);
        BigDecimal totalExpenses = calculateTotal(expenses);
        BigDecimal grossProfit = calculateGrossProfit(revenue, totalRevenue, expenses);
        BigDecimal operatingIncome = calculateOperatingIncome(grossProfit, expenses);
        BigDecimal netIncome = totalRevenue.subtract(totalExpenses);
        
        return IncomeStatementResponse.builder()
                .revenue(revenue)
                .expenses(expenses)
                .periodStart(periodStart)
                .periodEnd(periodEnd)
                .totalRevenue(totalRevenue)
                .totalExpenses(totalExpenses)
                .grossProfit(grossProfit)
                .operatingIncome(operatingIncome)
                .netIncome(netIncome)
                .build();
    }

    private static BigDecimal calculateTotal(List<AccountItem> items) {
        return items.stream()
                .map(AccountItem::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private static BigDecimal calculateGrossProfit(List<AccountItem> revenue, BigDecimal totalRevenue, List<AccountItem> expenses) {
        BigDecimal cogs = expenses.stream()
                .filter(item -> "COGS".equals(item.getCategory()))
                .map(AccountItem::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        return totalRevenue.subtract(cogs);
    }

    private static BigDecimal calculateOperatingIncome(BigDecimal grossProfit, List<AccountItem> expenses) {
        BigDecimal operatingExpenses = expenses.stream()
                .filter(item -> "OPERATING".equals(item.getCategory()))
                .map(AccountItem::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        return grossProfit.subtract(operatingExpenses);
    }

    // 비즈니스 로직 메소드들
    public void setRevenue(List<AccountItem> revenue) { 
        this.revenue = revenue;
        this.totalRevenue = calculateTotal(revenue);
        updateCalculatedFields();
    }

    public void setExpenses(List<AccountItem> expenses) { 
        this.expenses = expenses;
        this.totalExpenses = calculateTotal(expenses);
        updateCalculatedFields();
    }

    private void updateCalculatedFields() {
        if (revenue != null && expenses != null) {
            this.grossProfit = calculateGrossProfit(revenue, totalRevenue, expenses);
            this.operatingIncome = calculateOperatingIncome(grossProfit, expenses);
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

}
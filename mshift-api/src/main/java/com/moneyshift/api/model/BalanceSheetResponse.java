package com.moneyshift.api.model;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

/**
 * 대차대조표 응답 모델
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BalanceSheetResponse {
    
    private List<AccountItem> assets;
    private List<AccountItem> liabilities;
    private List<AccountItem> equity;
    private LocalDate asOfDate;
    private BigDecimal totalAssets;
    private BigDecimal totalLiabilities;
    private BigDecimal totalEquity;

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
    public static BalanceSheetResponse create(List<AccountItem> assets, List<AccountItem> liabilities, 
                                            List<AccountItem> equity, LocalDate asOfDate) {
        return BalanceSheetResponse.builder()
                .assets(assets)
                .liabilities(liabilities)
                .equity(equity)
                .asOfDate(asOfDate)
                .totalAssets(calculateTotal(assets))
                .totalLiabilities(calculateTotal(liabilities))
                .totalEquity(calculateTotal(equity))
                .build();
    }

    private static BigDecimal calculateTotal(List<AccountItem> items) {
        return items.stream()
                .map(AccountItem::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    // 비즈니스 로직 메소드들
    public void setAssets(List<AccountItem> assets) { 
        this.assets = assets;
        this.totalAssets = calculateTotal(assets);
    }

    public void setLiabilities(List<AccountItem> liabilities) { 
        this.liabilities = liabilities;
        this.totalLiabilities = calculateTotal(liabilities);
    }

    public void setEquity(List<AccountItem> equity) { 
        this.equity = equity;
        this.totalEquity = calculateTotal(equity);
    }

    /**
     * 복식부기 균형 체크 - 자산 = 부채 + 자본
     */
    public boolean isBalanced() {
        return totalAssets.compareTo(totalLiabilities.add(totalEquity)) == 0;
    }

}
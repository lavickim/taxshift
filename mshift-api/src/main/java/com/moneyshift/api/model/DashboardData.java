package com.moneyshift.api.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardData {
    
    // 월간 요약 정보
    private MonthlyData monthlyData;
    
    // 알림 정보
    private List<NotificationItem> notifications;
    
    // 최근 거래
    private List<TransactionSummary> recentTransactions;
    
    // 통계 정보
    private Map<String, Object> statistics;
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class MonthlyData {
        private BigDecimal revenue;           // 매출
        private BigDecimal expense;           // 비용
        private BigDecimal profit;            // 순이익
        private BigDecimal estimatedTax;      // 예상 세금
        private BigDecimal revenueChange;     // 매출 변화율
        private BigDecimal expenseChange;     // 비용 변화율
        private String period;               // 기간 (예: "2025년 1월")
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class NotificationItem {
        private String id;
        private String type;                 // "warning", "info", "success", "error"
        private String title;
        private String message;
        private LocalDate dueDate;           // 마감일 (있는 경우)
        private String priority;             // "high", "medium", "low"
        private boolean isRead;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class TransactionSummary {
        private Long id;
        private String merchant;             // 거래처
        private BigDecimal amount;           // 금액
        private String type;                 // "income", "expense"
        private String category;             // 분류 카테고리
        private LocalDate transactionDate;  // 거래일
        private String status;               // "approved", "pending", "rejected"
        private Double confidence;           // AI 분류 신뢰도
    }
}
package com.moneyshift.expense.dto;

import com.moneyshift.expense.entity.Transaction;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TransactionDto {
    private Long transactionId;
    private Transaction.TransactionType transactionType;
    private BigDecimal amount;
    private Long assetId;
    private String assetName;
    private Long categoryId;
    private String categoryName;
    private String description;
    private String memo;
    private LocalDate transactionDate;
    private LocalTime transactionTime;
    private Long targetAssetId;
    private String targetAssetName;
    private String receiptPhotoUrl;
    private Boolean isRecurring;
    private Transaction.RecurringType recurringType;
    private LocalDate recurringEndDate;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateRequest {
        private Transaction.TransactionType transactionType;
        private BigDecimal amount;
        private Long assetId;
        private Long categoryId;
        private String description;
        private String memo;
        private LocalDate transactionDate;
        private LocalTime transactionTime;
        private Long targetAssetId; // for TRANSFER
        private Boolean isRecurring;
        private Transaction.RecurringType recurringType;
        private LocalDate recurringEndDate;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpdateRequest {
        private BigDecimal amount;
        private Long categoryId;
        private String description;
        private String memo;
        private LocalDate transactionDate;
        private LocalTime transactionTime;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MonthlyRequest {
        private Integer year;
        private Integer month;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DailyStatistics {
        private LocalDate date;
        private BigDecimal income;
        private BigDecimal expense;
        private BigDecimal balance;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CategoryStatistics {
        private Long categoryId;
        private String categoryName;
        private String iconName;
        private String colorCode;
        private BigDecimal amount;
        private BigDecimal percentage;
        private Integer count;
    }
}
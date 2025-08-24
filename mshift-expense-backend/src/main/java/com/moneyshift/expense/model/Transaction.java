package com.moneyshift.expense.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.LocalDateTime;

/**
 * 거래내역 엔티티
 * 편한가계부 앱의 핵심 거래 데이터
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Transaction {
    
    public enum TransactionType {
        INCOME("수입"),
        EXPENSE("지출"),
        TRANSFER("이체");
        
        private final String displayName;
        
        TransactionType(String displayName) {
            this.displayName = displayName;
        }
        
        public String getDisplayName() {
            return displayName;
        }
    }
    
    public enum RecurringType {
        DAILY("매일"),
        WEEKLY("매주"),
        MONTHLY("매월"),
        YEARLY("매년");
        
        private final String displayName;
        
        RecurringType(String displayName) {
            this.displayName = displayName;
        }
        
        public String getDisplayName() {
            return displayName;
        }
    }
    
    private Long transactionId;
    private Long userId;
    private Long assetId;
    private Long categoryId;
    private TransactionType transactionType;
    private BigDecimal amount;
    private String description;
    private String memo;
    private LocalDate transactionDate;
    private LocalTime transactionTime;
    private String receiptPhotoUrl;
    private String location;
    
    // 이체 관련
    private Long targetAssetId;
    
    // 반복 거래 관련
    private Boolean isRecurring;
    private RecurringType recurringType;
    private Integer recurringInterval;
    private LocalDate recurringEndDate;
    private Long parentTransactionId;
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
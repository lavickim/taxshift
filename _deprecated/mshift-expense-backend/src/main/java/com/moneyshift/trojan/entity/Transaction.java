package com.moneyshift.trojan.entity;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.LocalDateTime;

/**
 * 거래내역 엔티티 (트로이 목마 가계부)
 * database-schema.sql의 transactions 테이블과 매핑
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Transaction {
    
    private Long transactionId;
    private Long userId;
    private Long assetId;
    private Long categoryId;
    
    // INCOME, EXPENSE, TRANSFER
    private String transactionType;
    
    private BigDecimal amount;
    private String description;
    private String memo;
    
    private LocalDate transactionDate;
    private LocalTime transactionTime;
    
    private String receiptPhotoUrl;
    private String location;
    
    // 이체의 경우 대상 자산
    private Long targetAssetId;
    
    // 반복 거래 관련
    private Boolean isRecurring = false;
    private String recurringType; // DAILY, WEEKLY, MONTHLY, YEARLY
    private Integer recurringInterval = 1;
    private LocalDate recurringEndDate;
    private Long parentTransactionId;
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // 조회용 추가 필드 (조인 결과)
    private String assetName;
    private String categoryName;
    private String targetAssetName;
}
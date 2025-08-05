package com.moneyshift.trojan.model;

import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Transaction {
    private String id;
    private String userId;
    private String receiptId; // Optional - manual transactions won't have receipts
    
    // Basic transaction info
    private BigDecimal amount;
    private String description;
    private String category;
    private String subcategory;
    private LocalDateTime transactionDate;
    private String type; // INCOME, EXPENSE
    
    // Payment information
    private String paymentMethod; // CASH, CARD, BANK_TRANSFER, etc.
    private String accountNumber; // Last 4 digits for privacy
    private String bankName;
    
    // Location data
    private String merchantName;
    private String location;
    private Double latitude;
    private Double longitude;
    
    // Classification
    private List<String> tags;
    private String notes;
    
    // Data source tracking
    private String source; // RECEIPT_OCR, MANUAL_ENTRY, BANK_IMPORT
    private BigDecimal confidence; // How confident we are in the classification
    
    // Analytics data (anonymized)
    private Map<String, Object> analyticsMetadata;
    
    // Verification
    private boolean isVerified; // User confirmed the transaction details
    private LocalDateTime verifiedAt;
    
    // Timestamps
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
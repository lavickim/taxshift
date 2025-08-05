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
public class Receipt {
    private String id;
    private String userId;
    
    // Image information
    private String originalImageUrl;
    private String processedImageUrl;
    private String imageHash; // For duplicate detection
    private long imageSizeBytes;
    
    // OCR results
    private String rawOcrText;
    private BigDecimal ocrConfidence;
    private Map<String, Object> ocrMetadata; // Store structured OCR data
    
    // Extracted business information
    private String merchantName;
    private String merchantAddress;
    private String merchantPhone;
    private String businessRegistrationNumber;
    
    // Transaction details
    private BigDecimal totalAmount;
    private BigDecimal taxAmount;
    private BigDecimal discountAmount;
    private String currency;
    private LocalDateTime transactionDate;
    private String paymentMethod;
    
    // Categorization
    private String category;
    private String subcategory;
    private List<String> tags;
    
    // Processing status
    private String processingStatus; // UPLOADED, PROCESSING, COMPLETED, FAILED
    private String errorMessage;
    private int retryCount;
    
    // Quality metrics
    private BigDecimal imageQualityScore;
    private BigDecimal dataCompletenessScore;
    
    // Analytics data
    private Map<String, Object> analyticsData;
    
    // Timestamps
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime processedAt;
}
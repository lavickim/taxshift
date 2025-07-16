package com.moneyshift.api.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TransactionContext {
    private String originalText;
    private String normalizedText;
    private BigDecimal amount;
    private LocalDateTime timestamp;
    private LocalTime timeOfDay;
    
    // Context information
    private String location;
    private String merchantName;
    private String paymentMethod;
    
    // Extracted keywords
    private List<String> extractedKeywords;
    private Map<String, Object> metadata;
    
    // Processing flags
    private boolean isWeekend;
    private boolean isBusinessHours;
    private boolean isLateNight;
}
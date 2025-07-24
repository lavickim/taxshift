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
    
    /**
     * 늦은 밤 시간인지 확인 (22:00 - 06:00)
     */
    public boolean isLateNight() {
        if (timestamp == null) return false;
        int hour = timestamp.getHour();
        return hour >= 22 || hour < 6;
    }
    
    /**
     * 영업시간인지 확인 (09:00 - 18:00)
     */
    public boolean isBusinessHours() {
        if (timestamp == null) return false;
        int hour = timestamp.getHour();
        return hour >= 9 && hour <= 18;
    }
    
    /**
     * 주말인지 확인 (토요일, 일요일)
     */
    public boolean isWeekend() {
        if (timestamp == null) return false;
        int dayOfWeek = timestamp.getDayOfWeek().getValue();
        return dayOfWeek == 6 || dayOfWeek == 7; // 토요일(6), 일요일(7)
    }
}
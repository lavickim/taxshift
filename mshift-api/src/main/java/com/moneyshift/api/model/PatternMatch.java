package com.moneyshift.api.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PatternMatch {
    private Long ruleId;
    private String patternType;
    private String matchedPattern;
    private List<String> extractedKeywords;
    private BigDecimal baseConfidence;
    private BigDecimal finalConfidence;
    private String primaryTag;
    private String primaryAccount;
    private String secondaryTag;
    private String secondaryAccount;
    private Map<String, Object> contextData;
    private String matchReason;
}
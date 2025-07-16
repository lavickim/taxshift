package com.moneyshift.api.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LayerProcessingResult {
    private String layerName;
    private boolean successful;
    private Long processingTimeMs;
    private String reason;
    
    // 새로운 키워드 분류 결과 필드
    private boolean matched;
    private String processingPath;
    private String tag;
    private Long tagId;
    private double confidence;
    private String accountCode;
    private String accountName;
    private List<String> extractedKeywords;
    private KeywordGroup matchedKeywordGroup;
    private String error;
    
    // 브랜드 매칭 결과
    private String brandName;
    private String industryCategory;
    
    // 레거시 매칭 결과
    private BigDecimal finalConfidence;
    private String primaryTag;
    private String primaryAccount;
    private String secondaryTag;
    private String secondaryAccount;
    private String matchedPattern;
    private Long ruleId;
    
    // 전체 매칭 결과
    private List<PatternMatch> allMatches;
    
    // 편의 메서드
    public boolean isMatched() {
        return matched;
    }
    
    public String getTag() {
        return tag;
    }
    
    public Long getTagId() {
        return tagId;
    }
    
    public double getConfidence() {
        return confidence;
    }
    
    public String getProcessingPath() {
        return processingPath;
    }
    
    public String getAccountCode() {
        return accountCode;
    }
    
    public String getAccountName() {
        return accountName;
    }
    
    public void setProcessingPath(String processingPath) {
        this.processingPath = processingPath;
    }
}
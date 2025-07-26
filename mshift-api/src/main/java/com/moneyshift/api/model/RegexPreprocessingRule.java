package com.moneyshift.api.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * 정규식 전처리 규칙 모델
 * 거래 문자열을 정규화하기 위한 정규식 패턴과 출력 템플릿을 관리
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RegexPreprocessingRule {
    
    private Long id;
    
    @JsonProperty("ruleName")
    private String ruleName;
    
    private String description;
    
    private String category;
    
    @JsonProperty("inputPattern")
    private String inputPattern;
    
    @JsonProperty("outputTemplate")
    private String outputTemplate;
    
    private Integer priority;
    
    @JsonProperty("isActive")
    private Boolean isActive;
    
    @JsonProperty("metadataTags")
    private Map<String, Object> metadataTags;
    
    @JsonProperty("testCases")
    private List<TestCase> testCases;
    
    @JsonProperty("usageCount")
    private Long usageCount;
    
    @JsonProperty("successRate")
    private BigDecimal successRate;
    
    @JsonProperty("createdAt")
    private LocalDateTime createdAt;
    
    @JsonProperty("updatedAt")
    private LocalDateTime updatedAt;
    
    /**
     * 테스트 케이스 내부 클래스
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TestCase {
        private String id;
        private String input;
        private String expected;
        private String description;
    }
    
    /**
     * 전처리 결과 클래스
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProcessingResult {
        private String originalText;
        private String normalizedText;
        private Long appliedRuleId;
        private String appliedRuleName;
        private Map<String, Object> extractedMetadata;
        private Long processingTimeMs;
        private Boolean success;
        private String errorMessage;
    }
}
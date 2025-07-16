package com.moneyshift.api.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;
import java.util.Map;

/**
 * 키워드 패턴 테스트 결과 모델
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class KeywordPatternTestResult {
    
    @JsonProperty("pattern_id")
    private Long patternId;
    
    private String pattern;
    
    @JsonProperty("test_text")
    private String testText;
    
    private boolean success;
    
    @JsonProperty("extracted_keywords")
    private List<String> extractedKeywords;
    
    @JsonProperty("expected_keywords")
    private List<String> expectedKeywords;
    
    @JsonProperty("matched_keywords")
    private List<String> matchedKeywords;
    
    @JsonProperty("missing_keywords")
    private List<String> missingKeywords;
    
    @JsonProperty("extra_keywords")
    private List<String> extraKeywords;
    
    @JsonProperty("match_percentage")
    private Double matchPercentage;
    
    @JsonProperty("confidence_score")
    private Double confidenceScore;
    
    @JsonProperty("execution_time_ms")
    private Long executionTimeMs;
    
    @JsonProperty("error_message")
    private String errorMessage;
    
    @JsonProperty("context_matches")
    private Map<String, Object> contextMatches;
    
    @JsonProperty("test_samples")
    private List<SampleTestResult> testSamples;
    
    // 내부 클래스
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class SampleTestResult {
        private String sampleText;
        private boolean matched;
        private List<String> extractedKeywords;
        private String errorMessage;
        private Long executionTimeMs;
    }
}
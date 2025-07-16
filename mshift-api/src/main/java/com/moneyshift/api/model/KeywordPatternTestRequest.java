package com.moneyshift.api.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

/**
 * 키워드 패턴 테스트 요청 모델
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class KeywordPatternTestRequest {
    
    private String pattern;
    
    @JsonProperty("test_text")
    private String testText;
    
    @JsonProperty("sample_texts")
    private List<String> sampleTexts;
    
    @JsonProperty("pattern_type")
    private String patternType;
    
    @JsonProperty("expected_keywords")
    private List<String> expectedKeywords;
    
    @JsonProperty("context_rules")
    private KeywordPattern.AmountRange amountRange;
    
    @JsonProperty("time_context")
    private String timeContext;
    
    @JsonProperty("location_type")
    private String locationType;
}
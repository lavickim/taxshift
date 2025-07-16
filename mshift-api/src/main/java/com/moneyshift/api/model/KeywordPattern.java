package com.moneyshift.api.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.JsonNode;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 키워드 추출 패턴 모델
 * 정규식을 이용한 키워드 추출 규칙을 정의
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class KeywordPattern {
    
    private Long id;
    
    @JsonProperty("pattern_regex")
    private String patternRegex;
    
    @JsonProperty("pattern_type")
    private String patternType; // MERCHANT, CATEGORY, PURPOSE, PEOPLE, AMOUNT
    
    @JsonProperty("extracted_keywords")
    private List<String> extractedKeywords;
    
    @JsonProperty("confidence_score")
    private Integer confidenceScore;
    
    @JsonProperty("hit_count")
    private Long hitCount;
    
    @JsonProperty("is_active")
    private Boolean isActive;
    
    @JsonProperty("created_at")
    private LocalDateTime createdAt;
    
    @JsonProperty("updated_at")
    private LocalDateTime updatedAt;
    
    private String description;
    
    // 키워드 설정
    @JsonProperty("primary_keywords")
    private List<String> primaryKeywords;
    
    private List<String> synonyms;
    
    private Integer priority;
    
    // 컨텍스트 규칙
    @JsonProperty("context_rules")
    private JsonNode contextRules;
    
    @JsonProperty("time_context")
    private String timeContext; // morning, lunch, evening, night
    
    @JsonProperty("amount_range")
    private AmountRange amountRange;
    
    @JsonProperty("location_type")
    private String locationType; // online, offline, specific_region
    
    @JsonProperty("display_order")
    private Integer displayOrder;
    
    @JsonProperty("parent_keyword_group_id")
    private Long parentKeywordGroupId;
    
    // 내부 클래스들
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class AmountRange {
        private Long min;
        private Long max;
    }
    
    // 패턴 타입 enum
    public enum PatternType {
        MERCHANT("거래처"),
        CATEGORY("카테고리"),
        PURPOSE("용도"),
        PEOPLE("인원"),
        AMOUNT("금액범위");
        
        private final String description;
        
        PatternType(String description) {
            this.description = description;
        }
        
        public String getDescription() {
            return description;
        }
    }
    
    // 시간 컨텍스트 enum
    public enum TimeContext {
        MORNING("아침", "06:00-11:00"),
        LUNCH("점심", "11:00-14:00"),
        EVENING("저녁", "17:00-22:00"),
        NIGHT("심야", "22:00-06:00");
        
        private final String description;
        private final String timeRange;
        
        TimeContext(String description, String timeRange) {
            this.description = description;
            this.timeRange = timeRange;
        }
        
        public String getDescription() { return description; }
        public String getTimeRange() { return timeRange; }
    }
}
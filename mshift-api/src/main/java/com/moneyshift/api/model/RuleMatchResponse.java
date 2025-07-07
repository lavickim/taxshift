package com.moneyshift.api.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RuleMatchResponse {
    private boolean matched;
    private String processedText;
    private List<MatchedRule> matchedRules;
    private String originalText;
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class MatchedRule {
        private Long ruleId;
        private String pattern;
        private String replacement;
        private String description;
        private String category;
        private int priority;
        private String matchedText;
        private int startIndex;
        private int endIndex;
    }
}
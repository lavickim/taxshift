package com.moneyshift.api.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import com.fasterxml.jackson.databind.JsonNode;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class KeywordTagMapping {
    private Long id;
    private Long keywordGroupId;
    private Long tagId;
    private BigDecimal confidenceScore;
    private JsonNode contextRules;
    private Integer priority;
    private Long usageCount;
    private Boolean isActive;
    private LocalDateTime createdAt;
    
    // Joined data
    private KeywordGroup keywordGroup;
    private TagsMaster tag;
}
package com.moneyshift.api.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import com.fasterxml.jackson.databind.JsonNode;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserQuestion {
    private Long id;
    private Long triggerTagId;
    private JsonNode triggerConditions;
    private String questionText;
    private String questionType;
    private BigDecimal confidenceThreshold;
    private Boolean isActive;
    private Long usageCount;
    private LocalDateTime createdAt;
    
    // Related data
    private TagsMaster tag;
    private List<QuestionOption> questionOptions;
}
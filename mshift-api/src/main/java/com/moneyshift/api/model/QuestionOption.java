package com.moneyshift.api.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import com.fasterxml.jackson.databind.JsonNode;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuestionOption {
    private Long id;
    private Long questionId;
    private String optionText;
    private JsonNode optionValue;
    private Long selectionCount;
    private Integer displayOrder;
    private Boolean isActive;
    
    // Related data
    private UserQuestion question;
}
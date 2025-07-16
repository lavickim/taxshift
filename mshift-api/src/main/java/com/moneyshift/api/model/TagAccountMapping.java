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
public class TagAccountMapping {
    private Long id;
    private Long tagId;
    private String accountCode;
    private String accountName;
    private JsonNode mappingCondition;
    private Boolean isDefault;
    private Integer priority;
    private BigDecimal confidenceBoost;
    private LocalDateTime createdAt;
    
    // Joined data
    private TagsMaster tag;
}
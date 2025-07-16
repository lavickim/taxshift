package com.moneyshift.api.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class KeywordGroup {
    private Long id;
    private String groupName;
    private String primaryKeyword;
    private List<String> synonyms;
    private String category;
    private BigDecimal confidenceBase;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
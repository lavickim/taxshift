package com.moneyshift.api.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RegexRule {
    private Long id;
    private String pattern;
    private String replacement;
    private String description;
    private String category;
    private boolean enabled;
    private int priority;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
package com.moneyshift.api.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * 정규식 전처리 카테고리 모델
 * 전처리 규칙들을 분류하기 위한 카테고리 정보
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RegexPreprocessingCategory {
    
    private Long id;
    
    @JsonProperty("categoryName")
    private String categoryName;
    
    private String description;
    
    @JsonProperty("colorCode")
    private String colorCode;
    
    @JsonProperty("isActive")
    private Boolean isActive;
    
    @JsonProperty("createdAt")
    private LocalDateTime createdAt;
}
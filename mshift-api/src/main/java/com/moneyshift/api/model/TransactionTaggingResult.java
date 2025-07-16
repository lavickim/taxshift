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
public class TransactionTaggingResult {
    private String originalText;
    private BigDecimal amount;
    private LocalDateTime timestamp;
    
    // 제안된 결과
    private List<String> suggestedTags;
    private List<String> suggestedAccounts;
    private BigDecimal finalConfidence;
    
    // 추출된 정보
    private List<String> extractedKeywords;
    private String matchedPattern;
    private Long ruleId;
    
    // 처리 메타데이터
    private String processingPath;
    private Long processingTimeMs;
    private List<LayerProcessingResult> processingLayers;
    private Long startTime;
    
    // 사용자 질문
    private boolean requiresUserQuestion;
    private UserQuestion userQuestion;
    
    // 오류 처리
    private String errorMessage;
}
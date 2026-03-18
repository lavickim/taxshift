package com.moneyshift.api.controller;

import com.moneyshift.api.model.*;
import com.moneyshift.api.service.TransactionTaggingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 새로운 키워드 기반 거래 태깅 API 컨트롤러
 */
@Slf4j
@RestController
@RequestMapping("/api/v2/transaction-tagging")
@RequiredArgsConstructor
public class TransactionTaggingController {
    
    private final TransactionTaggingService transactionTaggingService;
    
    /**
     * 거래 텍스트 자동 태깅
     */
    @PostMapping("/process")
    public ResponseEntity<TransactionTaggingResult> processTransaction(
            @RequestBody ProcessTransactionRequest request) {
        
        log.info("거래 태깅 요청: {}", request.getTransactionText());
        
        try {
            TransactionTaggingRequest taggingRequest = TransactionTaggingRequest.builder()
                    .transactionText(request.getTransactionText())
                    .amount(request.getAmount())
                    .timestamp(request.getTimestamp() != null ? request.getTimestamp() : LocalDateTime.now())
                    .userId(request.getUserId())
                    .companyId(request.getCompanyId())
                    .location(request.getLocation())
                    .paymentMethod(request.getPaymentMethod())
                    .enableCache(request.isEnableCache())
                    .enableLLMFallback(request.isEnableLLMFallback())
                    .build();
            
            TransactionTaggingResult result = transactionTaggingService.processTransaction(taggingRequest);
            
            log.info("거래 태깅 완료: {} -> {}, 신뢰도: {}", 
                    request.getTransactionText(), 
                    result.getSuggestedTags(), 
                    result.getFinalConfidence());
            
            return ResponseEntity.ok(result);
            
        } catch (Exception e) {
            log.error("거래 태깅 처리 중 오류", e);
            return ResponseEntity.internalServerError()
                    .body(TransactionTaggingResult.builder()
                            .originalText(request.getTransactionText())
                            .processingPath("ERROR")
                            .errorMessage(e.getMessage())
                            .build());
        }
    }
    
    /**
     * 사용자 피드백 처리
     */
    @PostMapping("/feedback")
    public ResponseEntity<String> processFeedback(@RequestBody FeedbackRequest request) {
        log.info("피드백 처리 요청: {}", request);
        
        try {
            transactionTaggingService.processFeedback(
                    request.getTransactionId(), 
                    request.getFeedbackType(), 
                    request.getSelectedTag(), 
                    request.getSelectedAccount());
            
            return ResponseEntity.ok("피드백이 성공적으로 처리되었습니다.");
            
        } catch (Exception e) {
            log.error("피드백 처리 중 오류", e);
            return ResponseEntity.internalServerError()
                    .body("피드백 처리 중 오류가 발생했습니다: " + e.getMessage());
        }
    }
    
    /**
     * 키워드 추출 테스트
     */
    @PostMapping("/test-extraction")
    public ResponseEntity<TransactionTaggingResult> testKeywordExtraction(
            @RequestBody TestExtractionRequest request) {
        
        log.info("키워드 추출 테스트: {}", request.getTransactionText());
        
        try {
            TransactionTaggingRequest taggingRequest = TransactionTaggingRequest.builder()
                    .transactionText(request.getTransactionText())
                    .amount(request.getAmount())
                    .timestamp(LocalDateTime.now())
                    .enableCache(false) // 테스트는 캐시 비활성화
                    .enableLLMFallback(false) // 테스트는 LLM 비활성화
                    .build();
            
            TransactionTaggingResult result = transactionTaggingService.processTransaction(taggingRequest);
            
            return ResponseEntity.ok(result);
            
        } catch (Exception e) {
            log.error("키워드 추출 테스트 중 오류", e);
            return ResponseEntity.internalServerError()
                    .body(TransactionTaggingResult.builder()
                            .originalText(request.getTransactionText())
                            .processingPath("TEST_ERROR")
                            .errorMessage(e.getMessage())
                            .build());
        }
    }
    
    // 요청 DTO 클래스들
    @lombok.Data
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    public static class ProcessTransactionRequest {
        private String transactionText;
        private BigDecimal amount;
        private LocalDateTime timestamp;
        private String userId;
        private String companyId;
        private String location;
        private String paymentMethod;
        private boolean enableCache = true;
        private boolean enableLLMFallback = true;
    }
    
    @lombok.Data
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    public static class FeedbackRequest {
        private Long transactionId;
        private String feedbackType; // "ACCEPT", "MODIFY", "REJECT"
        private String selectedTag;
        private String selectedAccount;
        private String reason;
    }
    
    @lombok.Data
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    public static class TestExtractionRequest {
        private String transactionText;
        private BigDecimal amount;
    }
}
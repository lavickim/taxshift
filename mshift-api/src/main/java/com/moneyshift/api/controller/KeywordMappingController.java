package com.moneyshift.api.controller;

import com.moneyshift.api.service.KeywordMappingService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * 키워드 매핑 API 컨트롤러
 * 세그먼트 기반 키워드 매칭 엔진 API
 */
@RestController
@RequestMapping("/v2/keyword-mapping")
@CrossOrigin(origins = "*")
public class KeywordMappingController {
    
    private static final Logger logger = LoggerFactory.getLogger(KeywordMappingController.class);
    
    @Autowired
    private KeywordMappingService keywordMappingService;
    
    /**
     * 실시간 키워드 매칭 API
     * 거래 문자열 → 키워드 → 태그 → 계정과목 매핑
     */
    @PostMapping("/match")
    public ResponseEntity<Map<String, Object>> matchKeywords(@RequestBody Map<String, String> request) {
        long startTime = System.currentTimeMillis();
        
        try {
            String transactionText = request.get("transaction_text");
            
            if (transactionText == null || transactionText.trim().isEmpty()) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("success", false);
                errorResponse.put("error", "거래 문자열이 필요합니다");
                return ResponseEntity.badRequest().body(errorResponse);
            }
            
            logger.info("🔍 실시간 키워드 매칭 요청: {}", transactionText);
            
            // 키워드 매칭 수행
            Map<String, Object> result = keywordMappingService.matchKeywordsRealtime(transactionText);
            
            long processingTime = System.currentTimeMillis() - startTime;
            result.put("api_processing_time_ms", processingTime);
            
            logger.info("✅ 키워드 매칭 완료: {}ms", processingTime);
            
            return ResponseEntity.ok(result);
            
        } catch (Exception e) {
            logger.error("❌ 키워드 매칭 API 오류", e);
            
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("error", e.getMessage());
            errorResponse.put("processing_time_ms", System.currentTimeMillis() - startTime);
            
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }
    
    /**
     * 키워드 매핑 데이터 생성 API
     * 54만건 국민연금 데이터에서 키워드 추출 및 매핑 생성
     */
    @PostMapping("/generate")
    public ResponseEntity<Map<String, Object>> generateKeywordMappings() {
        long startTime = System.currentTimeMillis();
        
        try {
            logger.info("🚀 키워드 매핑 데이터 생성 시작...");
            
            keywordMappingService.generateKeywordMappingsFromPensionData();
            
            long processingTime = System.currentTimeMillis() - startTime;
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "키워드 매핑 데이터 생성 완료");
            response.put("processing_time_ms", processingTime);
            
            logger.info("✅ 키워드 매핑 데이터 생성 완료: {}ms", processingTime);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            logger.error("❌ 키워드 매핑 데이터 생성 오류", e);
            
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("error", e.getMessage());
            errorResponse.put("processing_time_ms", System.currentTimeMillis() - startTime);
            
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }
    
    /**
     * 키워드 매핑 데이터 새로고침 API
     */
    @PostMapping("/refresh")
    public ResponseEntity<Map<String, Object>> refreshKeywordMappings() {
        long startTime = System.currentTimeMillis();
        
        try {
            logger.info("🔄 키워드 매핑 데이터 새로고침 시작...");
            
            keywordMappingService.refreshKeywordMappings();
            
            long processingTime = System.currentTimeMillis() - startTime;
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "키워드 매핑 데이터 새로고침 완료");
            response.put("processing_time_ms", processingTime);
            
            logger.info("✅ 키워드 매핑 데이터 새로고침 완료: {}ms", processingTime);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            logger.error("❌ 키워드 매핑 데이터 새로고침 오류", e);
            
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("error", e.getMessage());
            errorResponse.put("processing_time_ms", System.currentTimeMillis() - startTime);
            
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }
    
    /**
     * 키워드 매핑 통계 조회 API
     */
    @GetMapping("/statistics")
    public ResponseEntity<Map<String, Object>> getKeywordMappingStatistics() {
        try {
            logger.info("📊 키워드 매핑 통계 조회 요청");
            
            Map<String, Object> statistics = keywordMappingService.getKeywordMappingStatistics();
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", statistics);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            logger.error("❌ 키워드 매핑 통계 조회 오류", e);
            
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("error", e.getMessage());
            
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }
    
    /**
     * 배치 키워드 매칭 API
     */
    @PostMapping("/match-batch")
    public ResponseEntity<Map<String, Object>> matchKeywordsBatch(@RequestBody Map<String, Object> request) {
        long startTime = System.currentTimeMillis();
        
        try {
            @SuppressWarnings("unchecked")
            java.util.List<String> transactionTexts = (java.util.List<String>) request.get("transaction_texts");
            
            if (transactionTexts == null || transactionTexts.isEmpty()) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("success", false);
                errorResponse.put("error", "거래 문자열 목록이 필요합니다");
                return ResponseEntity.badRequest().body(errorResponse);
            }
            
            logger.info("🔍 배치 키워드 매칭 요청: {}건", transactionTexts.size());
            
            java.util.List<Map<String, Object>> results = new java.util.ArrayList<>();
            
            for (String text : transactionTexts) {
                Map<String, Object> result = keywordMappingService.matchKeywordsRealtime(text);
                results.add(result);
            }
            
            long processingTime = System.currentTimeMillis() - startTime;
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("total_count", transactionTexts.size());
            response.put("results", results);
            response.put("processing_time_ms", processingTime);
            response.put("avg_processing_time_ms", (double) processingTime / transactionTexts.size());
            
            logger.info("✅ 배치 키워드 매칭 완료: {}건, {}ms", transactionTexts.size(), processingTime);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            logger.error("❌ 배치 키워드 매칭 API 오류", e);
            
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("error", e.getMessage());
            errorResponse.put("processing_time_ms", System.currentTimeMillis() - startTime);
            
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }
    
    /**
     * 키워드 매핑 시스템 상태 확인 API
     */
    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> getSystemStatus() {
        try {
            Map<String, Object> status = new HashMap<>();
            
            // 시스템 상태 정보 수집
            status.put("service_status", "ACTIVE");
            status.put("timestamp", java.time.LocalDateTime.now());
            
            // 간단한 성능 테스트
            long testStart = System.currentTimeMillis();
            keywordMappingService.matchKeywordsRealtime("테스트 거래 문자열");
            long testTime = System.currentTimeMillis() - testStart;
            
            status.put("performance_test_ms", testTime);
            status.put("performance_status", testTime < 100 ? "EXCELLENT" : testTime < 500 ? "GOOD" : "SLOW");
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("status", status);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            logger.error("❌ 시스템 상태 확인 오류", e);
            
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("error", e.getMessage());
            errorResponse.put("service_status", "ERROR");
            
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }
}
package com.moneyshift.api.controller;

import com.moneyshift.api.model.KeywordExtractionResult;
import com.moneyshift.api.model.KeywordRelationship;
import com.moneyshift.api.service.IndustryKeywordExtractionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 키워드 분석 API 컨트롤러
 * D3 키워드 그래프 시스템용
 */
@RestController
@RequestMapping("/v2/keyword-analysis")
public class KeywordAnalysisController {

    @Autowired
    private IndustryKeywordExtractionService keywordExtractionService;

    /**
     * 단일 업종명에서 키워드 추출
     */
    @PostMapping("/extract-single")
    public ResponseEntity<KeywordExtractionResult> extractKeywords(@RequestBody Map<String, String> request) {
        try {
            String industryName = request.get("industryName");
            if (industryName == null || industryName.trim().isEmpty()) {
                return ResponseEntity.badRequest().build();
            }

            KeywordExtractionResult result = keywordExtractionService.extractKeywords(industryName);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * 배치 키워드 추출
     */
    @PostMapping("/extract-batch")
    public ResponseEntity<List<KeywordExtractionResult>> extractKeywordsBatch(@RequestBody Map<String, List<String>> request) {
        try {
            List<String> industryNames = request.get("industryNames");
            if (industryNames == null || industryNames.isEmpty()) {
                return ResponseEntity.badRequest().build();
            }

            List<KeywordExtractionResult> results = keywordExtractionService.extractKeywordsBatch(industryNames);
            return ResponseEntity.ok(results);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * 키워드 관계 분석 (PMI 기반)
     */
    @PostMapping("/analyze-relationships")
    public ResponseEntity<List<KeywordRelationship>> analyzeKeywordRelationships(@RequestBody Map<String, List<String>> request) {
        try {
            List<String> industryNames = request.get("industryNames");
            if (industryNames == null || industryNames.isEmpty()) {
                return ResponseEntity.badRequest().build();
            }

            // 1. 배치 키워드 추출
            List<KeywordExtractionResult> extractionResults = keywordExtractionService.extractKeywordsBatch(industryNames);

            // 2. 관계 분석
            List<KeywordRelationship> relationships = keywordExtractionService.analyzeKeywordRelationships(extractionResults);

            return ResponseEntity.ok(relationships);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * 특정 키워드와 관련된 상위 관계 조회
     */
    @PostMapping("/related-keywords")
    public ResponseEntity<List<KeywordRelationship>> getRelatedKeywords(@RequestBody Map<String, Object> request) {
        try {
            String targetKeyword = (String) request.get("targetKeyword");
            List<String> industryNames = (List<String>) request.get("industryNames");
            Integer limit = (Integer) request.getOrDefault("limit", 10);

            if (targetKeyword == null || industryNames == null || industryNames.isEmpty()) {
                return ResponseEntity.badRequest().build();
            }

            // 1. 배치 키워드 추출
            List<KeywordExtractionResult> extractionResults = keywordExtractionService.extractKeywordsBatch(industryNames);

            // 2. 전체 관계 분석
            List<KeywordRelationship> allRelationships = keywordExtractionService.analyzeKeywordRelationships(extractionResults);

            // 3. 특정 키워드 관련 관계 추출
            List<KeywordRelationship> relatedKeywords = keywordExtractionService.getTopRelatedKeywords(
                targetKeyword, allRelationships, limit);

            return ResponseEntity.ok(relatedKeywords);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * 키워드 네트워크 통계
     */
    @PostMapping("/network-statistics")
    public ResponseEntity<Map<String, Object>> getNetworkStatistics(@RequestBody Map<String, List<String>> request) {
        try {
            List<String> industryNames = request.get("industryNames");
            if (industryNames == null || industryNames.isEmpty()) {
                return ResponseEntity.badRequest().build();
            }

            // 1. 배치 키워드 추출
            List<KeywordExtractionResult> extractionResults = keywordExtractionService.extractKeywordsBatch(industryNames);

            // 2. 관계 분석
            List<KeywordRelationship> relationships = keywordExtractionService.analyzeKeywordRelationships(extractionResults);

            // 3. 통계 계산
            Map<String, Object> statistics = keywordExtractionService.calculateNetworkStatistics(relationships);

            // 4. 추가 메타데이터
            Map<String, Object> response = new HashMap<>(statistics);
            response.put("totalIndustries", industryNames.size());
            response.put("totalExtractionResults", extractionResults.size());
            response.put("processingTimestamp", System.currentTimeMillis());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * 전체 키워드 분석 (키워드 추출 + 관계 분석 + 통계)
     */
    @PostMapping("/analyze-complete")
    public ResponseEntity<Map<String, Object>> analyzeComplete(@RequestBody Map<String, List<String>> request) {
        try {
            List<String> industryNames = request.get("industryNames");
            if (industryNames == null || industryNames.isEmpty()) {
                return ResponseEntity.badRequest().build();
            }

            long startTime = System.currentTimeMillis();

            // 1. 배치 키워드 추출
            List<KeywordExtractionResult> extractionResults = keywordExtractionService.extractKeywordsBatch(industryNames);

            // 2. 관계 분석
            List<KeywordRelationship> relationships = keywordExtractionService.analyzeKeywordRelationships(extractionResults);

            // 3. 통계 계산
            Map<String, Object> statistics = keywordExtractionService.calculateNetworkStatistics(relationships);

            long processingTime = System.currentTimeMillis() - startTime;

            // 4. 종합 결과
            Map<String, Object> response = new HashMap<>();
            response.put("extractionResults", extractionResults);
            response.put("relationships", relationships);
            response.put("statistics", statistics);
            response.put("processingTimeMs", processingTime);
            response.put("timestamp", System.currentTimeMillis());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * 시스템 상태 확인
     */
    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> healthCheck() {
        Map<String, Object> health = new HashMap<>();
        health.put("status", "UP");
        health.put("service", "KeywordAnalysisService");
        health.put("timestamp", System.currentTimeMillis());
        health.put("version", "1.0.0");
        return ResponseEntity.ok(health);
    }
}
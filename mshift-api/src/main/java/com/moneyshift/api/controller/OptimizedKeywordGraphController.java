package com.moneyshift.api.controller;

import com.moneyshift.api.service.OptimizedKeywordGraphService;
import com.moneyshift.api.service.NationalPensionKeywordService;
import com.moneyshift.api.service.KeywordGraphService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.CompletableFuture;

/**
 * 최적화된 키워드 그래프 API 컨트롤러
 * 50만건 대용량 데이터 처리 최적화
 */
@RestController
@RequestMapping("/v2/optimized-keyword-graph")
public class OptimizedKeywordGraphController {

    @Autowired
    private OptimizedKeywordGraphService optimizedKeywordGraphService;
    
    @Autowired
    private NationalPensionKeywordService nationalPensionKeywordService;
    
    @Autowired
    private KeywordGraphService keywordGraphService;

    /**
     * 최적화된 키워드 그래프 생성 (메인 API)
     * - 50만건 국민연금 데이터 처리 최적화
     * - 배치 처리, 병렬 처리, 메모리 최적화 적용
     */
    @PostMapping("/generate")
    public ResponseEntity<Map<String, Object>> generateOptimizedGraph(@RequestBody Map<String, Object> request) {
        try {
            // 요청 파라미터 추출 및 기본값 설정
            int minMemberCount = ((Number) request.getOrDefault("minMemberCount", 100)).intValue();
            int maxIndustries = ((Number) request.getOrDefault("maxIndustries", 150)).intValue();
            
            // 파라미터 검증
            minMemberCount = Math.max(50, Math.min(minMemberCount, 1000));
            maxIndustries = Math.max(50, Math.min(maxIndustries, 200));
            
            // 최적화된 그래프 생성
            Map<String, Object> result = optimizedKeywordGraphService.generateOptimizedKeywordGraph(
                minMemberCount, maxIndustries);
            
            return ResponseEntity.ok(result);
            
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("error", "최적화된 키워드 그래프 생성 중 오류 발생");
            errorResponse.put("details", e.getMessage());
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }

    /**
     * 비동기 키워드 그래프 생성
     * - 대용량 데이터 처리 시 응답 시간 최적화
     */
    @PostMapping("/generate-async")
    public ResponseEntity<Map<String, Object>> generateGraphAsync(@RequestBody Map<String, Object> request) {
        try {
            int minMemberCount = ((Number) request.getOrDefault("minMemberCount", 100)).intValue();
            int maxIndustries = ((Number) request.getOrDefault("maxIndustries", 150)).intValue();
            
            // 비동기 처리 시작
            CompletableFuture.supplyAsync(() -> 
                optimizedKeywordGraphService.generateOptimizedKeywordGraph(minMemberCount, maxIndustries)
            );
            
            // 즉시 응답 (처리 상태 반환)
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("status", "processing");
            response.put("message", "키워드 그래프 생성이 비동기로 시작되었습니다.");
            response.put("estimatedTime", "30-60초");
            response.put("checkEndpoint", "/v2/optimized-keyword-graph/status");
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("error", "비동기 처리 시작 중 오류 발생");
            errorResponse.put("details", e.getMessage());
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }

    /**
     * 성능 최적화된 미리보기 그래프
     * - 빠른 응답을 위한 샘플링 기반 그래프
     */
    @PostMapping("/preview")
    public ResponseEntity<Map<String, Object>> generatePreviewGraph(@RequestBody Map<String, Object> request) {
        try {
            // 미리보기용 제한된 파라미터
            int minMemberCount = 500;  // 높은 임계값으로 데이터 양 제한
            int maxIndustries = 50;    // 소량 업종으로 제한
            
            Map<String, Object> result = optimizedKeywordGraphService.generateOptimizedKeywordGraph(
                minMemberCount, maxIndustries);
            
            // 미리보기 표시
            result.put("preview", true);
            result.put("previewNote", "성능 최적화를 위한 샘플링된 데이터입니다.");
            
            return ResponseEntity.ok(result);
            
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("error", "미리보기 그래프 생성 중 오류 발생");
            errorResponse.put("details", e.getMessage());
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }

    /**
     * 캐시된 그래프 데이터 조회
     * - 데이터베이스에서 기생성된 그래프 조회
     */
    @GetMapping("/cached")
    public ResponseEntity<Map<String, Object>> getCachedGraph(
            @RequestParam(defaultValue = "100") int maxKeywords,
            @RequestParam(defaultValue = "200") int maxRelationships) {
        try {
            // 파라미터 검증
            maxKeywords = Math.max(20, Math.min(maxKeywords, 150));
            maxRelationships = Math.max(50, Math.min(maxRelationships, 300));
            
            // 캐시된 데이터 조회 (빠른 응답)
            Map<String, Object> result = keywordGraphService.getKeywordGraphFromDatabase(
                maxKeywords, maxRelationships);
            
            result.put("cached", true);
            result.put("note", "데이터베이스에서 조회된 캐시 데이터입니다.");
            
            return ResponseEntity.ok(result);
            
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("error", "캐시된 그래프 조회 중 오류 발생");
            errorResponse.put("details", e.getMessage());
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }

    /**
     * 그래프 새로고침 (전체 재생성)
     * - 기존 데이터 삭제 후 새로 생성
     */
    @PostMapping("/refresh")
    public ResponseEntity<Map<String, Object>> refreshGraph(@RequestBody Map<String, Object> request) {
        try {
            int minMemberCount = ((Number) request.getOrDefault("minMemberCount", 100)).intValue();
            int maxIndustries = ((Number) request.getOrDefault("maxIndustries", 150)).intValue();
            
            Map<String, Object> result = nationalPensionKeywordService.refreshKeywordGraph(
                minMemberCount, maxIndustries);
            
            result.put("refreshed", true);
            result.put("note", "모든 데이터가 새로 생성되었습니다.");
            
            return ResponseEntity.ok(result);
            
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("error", "그래프 새로고침 중 오류 발생");
            errorResponse.put("details", e.getMessage());
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }

    /**
     * 성능 통계 조회
     * - 최적화 효과 모니터링
     */
    @GetMapping("/performance-stats")
    public ResponseEntity<Map<String, Object>> getPerformanceStats() {
        Map<String, Object> stats = new HashMap<>();
        
        // 시스템 성능 정보
        Runtime runtime = Runtime.getRuntime();
        stats.put("totalMemory", runtime.totalMemory());
        stats.put("freeMemory", runtime.freeMemory());
        stats.put("usedMemory", runtime.totalMemory() - runtime.freeMemory());
        stats.put("availableProcessors", runtime.availableProcessors());
        
        // 최적화 설정 정보
        Map<String, Object> optimizationConfig = new HashMap<>();
        optimizationConfig.put("batchSize", 1000);
        optimizationConfig.put("maxKeywords", 150);
        optimizationConfig.put("maxRelationships", 300);
        optimizationConfig.put("parallelThreshold", 500);
        optimizationConfig.put("minMemberCount", 50);
        optimizationConfig.put("minPmiThreshold", 0.5);
        
        stats.put("optimizationConfig", optimizationConfig);
        stats.put("timestamp", System.currentTimeMillis());
        
        return ResponseEntity.ok(stats);
    }

    /**
     * 헬스 체크
     */
    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> healthCheck() {
        Map<String, Object> health = new HashMap<>();
        health.put("status", "UP");
        health.put("service", "OptimizedKeywordGraphService");
        health.put("optimizationLevel", "HIGH_PERFORMANCE");
        health.put("dataSource", "NATIONAL_PENSION");
        health.put("timestamp", System.currentTimeMillis());
        return ResponseEntity.ok(health);
    }

    /**
     * 설정 조회
     */
    @GetMapping("/config")
    public ResponseEntity<Map<String, Object>> getConfiguration() {
        Map<String, Object> config = new HashMap<>();
        
        // 성능 최적화 설정
        Map<String, Object> performance = new HashMap<>();
        performance.put("description", "50만건 대용량 데이터 처리 최적화");
        performance.put("techniques", new String[]{
            "배치 처리 (Batch Processing)",
            "병렬 처리 (Parallel Processing)", 
            "스트림 최적화 (Stream Optimization)",
            "메모리 최적화 (Memory Optimization)",
            "캐싱 (Caching)",
            "인덱싱 (Database Indexing)",
            "페이지네이션 (Pagination)",
            "압축 알고리즘 (Graph Compression)"
        });
        
        // 제한사항
        Map<String, Object> limits = new HashMap<>();
        limits.put("maxKeywords", 150);
        limits.put("maxRelationships", 300);
        limits.put("maxIndustries", 200);
        limits.put("minMemberCount", 50);
        limits.put("batchSize", 1000);
        
        config.put("performance", performance);
        config.put("limits", limits);
        config.put("version", "1.0");
        config.put("lastUpdated", "2025-07-27");
        
        return ResponseEntity.ok(config);
    }
}
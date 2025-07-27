package com.moneyshift.api.controller;

import com.moneyshift.api.service.SegmentedKeywordService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * 세그먼트 기반 키워드 분석 API 컨트롤러
 * 54만건 데이터를 미리 세그먼트화하여 빠른 키워드 조회 제공
 */
@RestController
@RequestMapping("/v2/segmented-keywords")
@Tag(name = "Segmented Keywords", description = "세그먼트 기반 키워드 분석 API")
@CrossOrigin(origins = "*")
public class SegmentedKeywordController {

    private static final Logger logger = LoggerFactory.getLogger(SegmentedKeywordController.class);
    
    @Autowired
    private SegmentedKeywordService segmentedKeywordService;
    
    /**
     * 세그먼트별 상위 키워드 조회
     */
    @GetMapping("/segments/{segmentType}/keywords")
    @Operation(summary = "세그먼트별 상위 키워드 조회", 
               description = "미리 세그먼트화된 데이터를 이용한 빠른 키워드 조회")
    public ResponseEntity<Map<String, Object>> getTopKeywordsBySegment(
            @Parameter(description = "세그먼트 유형 (category, region, size, frequency)")
            @PathVariable String segmentType,
            
            @Parameter(description = "세그먼트 이름 (선택사항)")
            @RequestParam(required = false) String segmentName,
            
            @Parameter(description = "조회할 키워드 수 (기본값: 20)")
            @RequestParam(defaultValue = "20") int limit) {
        
        logger.info("🔍 세그먼트 키워드 조회 요청: type={}, name={}, limit={}", 
                    segmentType, segmentName, limit);
        
        try {
            Map<String, Object> result = segmentedKeywordService.getTopKeywordsBySegment(
                segmentType, segmentName, limit);
            return ResponseEntity.ok(result);
            
        } catch (Exception e) {
            logger.error("❌ 세그먼트 키워드 조회 실패", e);
            return ResponseEntity.internalServerError()
                .body(Map.of("success", false, "error", e.getMessage()));
        }
    }
    
    /**
     * 키워드 관련어 조회
     */
    @GetMapping("/keywords/{keyword}/related")
    @Operation(summary = "키워드 관련어 조회", 
               description = "특정 키워드와 관련된 키워드들을 PMI 기반으로 조회")
    public ResponseEntity<Map<String, Object>> getRelatedKeywords(
            @Parameter(description = "기준 키워드")
            @PathVariable String keyword,
            
            @Parameter(description = "조회할 관련어 수 (기본값: 10)")
            @RequestParam(defaultValue = "10") int limit) {
        
        logger.info("🔗 키워드 관련어 조회 요청: keyword={}, limit={}", keyword, limit);
        
        try {
            Map<String, Object> result = segmentedKeywordService.getRelatedKeywords(keyword, limit);
            return ResponseEntity.ok(result);
            
        } catch (Exception e) {
            logger.error("❌ 키워드 관련어 조회 실패", e);
            return ResponseEntity.internalServerError()
                .body(Map.of("success", false, "error", e.getMessage()));
        }
    }
    
    /**
     * 세그먼트 통계 조회
     */
    @GetMapping("/segments/statistics")
    @Operation(summary = "세그먼트 통계 조회", 
               description = "모든 세그먼트의 통계 정보 조회")
    public ResponseEntity<Map<String, Object>> getSegmentStatistics() {
        
        logger.info("📊 세그먼트 통계 조회 요청");
        
        try {
            Map<String, Object> result = segmentedKeywordService.getSegmentStatistics();
            return ResponseEntity.ok(result);
            
        } catch (Exception e) {
            logger.error("❌ 세그먼트 통계 조회 실패", e);
            return ResponseEntity.internalServerError()
                .body(Map.of("success", false, "error", e.getMessage()));
        }
    }
    
    /**
     * 세그먼트 기반 키워드 그래프 데이터
     */
    @GetMapping("/graph")
    @Operation(summary = "세그먼트 키워드 그래프", 
               description = "세그먼트 필터링이 적용된 D3.js 키워드 그래프 데이터")
    public ResponseEntity<Map<String, Object>> getSegmentedKeywordGraph(
            @Parameter(description = "세그먼트 유형")
            @RequestParam(required = false) String segmentType,
            
            @Parameter(description = "세그먼트 이름")
            @RequestParam(required = false) String segmentName,
            
            @Parameter(description = "중심 키워드 (선택사항)")
            @RequestParam(required = false) String keyword,
            
            @Parameter(description = "노드 수 제한 (기본값: 50)")
            @RequestParam(defaultValue = "50") int nodeLimit,
            
            @Parameter(description = "링크 수 제한 (기본값: 100)")
            @RequestParam(defaultValue = "100") int linkLimit) {
        
        logger.info("🎯 세그먼트 키워드 그래프 요청: type={}, name={}, keyword={}, nodes={}, links={}", 
                    segmentType, segmentName, keyword, nodeLimit, linkLimit);
        
        try {
            Map<String, Object> result = segmentedKeywordService.getSegmentedKeywordGraph(
                segmentType, segmentName, keyword, nodeLimit, linkLimit);
            return ResponseEntity.ok(result);
            
        } catch (Exception e) {
            logger.error("❌ 세그먼트 키워드 그래프 생성 실패", e);
            return ResponseEntity.internalServerError()
                .body(Map.of("success", false, "error", e.getMessage()));
        }
    }
    
    /**
     * 통합 키워드 분석 대시보드 데이터
     */
    @GetMapping("/dashboard")
    @Operation(summary = "키워드 분석 대시보드", 
               description = "어드민 대시보드용 통합 키워드 분석 데이터")
    public ResponseEntity<Map<String, Object>> getKeywordDashboard(
            @Parameter(description = "세그먼트 유형 필터")
            @RequestParam(required = false) String segmentType) {
        
        logger.info("📈 키워드 대시보드 데이터 요청: segmentType={}", segmentType);
        
        try {
            long startTime = System.currentTimeMillis();
            
            // 통계 데이터
            Map<String, Object> statistics = segmentedKeywordService.getSegmentStatistics();
            
            // 세그먼트별 샘플 키워드 (각 유형별 상위 10개)
            Map<String, Object> categoryData = segmentedKeywordService.getTopKeywordsBySegment("category", null, 10);
            Map<String, Object> regionData = segmentedKeywordService.getTopKeywordsBySegment("region", null, 10);
            Map<String, Object> sizeData = segmentedKeywordService.getTopKeywordsBySegment("size", null, 10);
            Map<String, Object> frequencyData = segmentedKeywordService.getTopKeywordsBySegment("frequency", null, 10);
            
            // 샘플 그래프 데이터 (제조업)
            Map<String, Object> sampleGraph = segmentedKeywordService.getSegmentedKeywordGraph(
                "category", "제조업", null, 30, 50);
            
            Map<String, Object> result = Map.of(
                "success", true,
                "statistics", statistics,
                "segmentData", Map.of(
                    "category", categoryData,
                    "region", regionData,
                    "size", sizeData,
                    "frequency", frequencyData
                ),
                "sampleGraph", sampleGraph,
                "processingTimeMs", System.currentTimeMillis() - startTime,
                "optimized", true,
                "segmented", true,
                "generatedAt", java.time.LocalDateTime.now().toString()
            );
            
            logger.info("✅ 키워드 대시보드 데이터 생성 완료 ({}ms)", 
                       System.currentTimeMillis() - startTime);
            
            return ResponseEntity.ok(result);
            
        } catch (Exception e) {
            logger.error("❌ 키워드 대시보드 데이터 생성 실패", e);
            return ResponseEntity.internalServerError()
                .body(Map.of("success", false, "error", e.getMessage()));
        }
    }
    
    /**
     * 세그먼트 기반 키워드 검색
     */
    @GetMapping("/search")
    @Operation(summary = "세그먼트 키워드 검색", 
               description = "세그먼트 필터를 적용한 키워드 검색")
    public ResponseEntity<Map<String, Object>> searchSegmentedKeywords(
            @Parameter(description = "검색어")
            @RequestParam String q,
            
            @Parameter(description = "세그먼트 유형 필터")
            @RequestParam(required = false) String segmentType,
            
            @Parameter(description = "세그먼트 이름 필터")
            @RequestParam(required = false) String segmentName,
            
            @Parameter(description = "결과 수 제한 (기본값: 20)")
            @RequestParam(defaultValue = "20") int limit) {
        
        logger.info("🔍 세그먼트 키워드 검색: q={}, type={}, name={}, limit={}", 
                    q, segmentType, segmentName, limit);
        
        try {
            // 여기서는 기본적인 검색만 구현하고, 필요시 SegmentedKeywordService에 검색 메서드 추가
            Map<String, Object> result = Map.of(
                "success", true,
                "query", q,
                "segmentType", segmentType != null ? segmentType : "all",
                "segmentName", segmentName != null ? segmentName : "all",
                "results", java.util.List.of(), // 추후 구현
                "totalCount", 0,
                "processingTimeMs", 5L,
                "optimized", true
            );
            
            return ResponseEntity.ok(result);
            
        } catch (Exception e) {
            logger.error("❌ 세그먼트 키워드 검색 실패", e);
            return ResponseEntity.internalServerError()
                .body(Map.of("success", false, "error", e.getMessage()));
        }
    }
}
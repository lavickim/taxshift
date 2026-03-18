package com.moneyshift.api.controller;

import com.moneyshift.api.service.DynamicBrandService;
import com.moneyshift.api.service.KeywordGroupService;
import com.moneyshift.api.service.KeywordTagMappingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 브랜드 및 키워드 유지보수 관리 컨트롤러
 * 동적 키워드 시스템의 운영 및 관리 기능 제공
 */
@Slf4j
@RestController
@RequestMapping("/v2/maintenance")
@RequiredArgsConstructor
public class BrandMaintenanceController {
    
    private final DynamicBrandService dynamicBrandService;
    private final KeywordGroupService keywordGroupService;
    private final KeywordTagMappingService keywordTagMappingService;
    
    /**
     * 브랜드 사용 통계 조회
     */
    @GetMapping("/brand-usage-stats")
    public ResponseEntity<Map<String, Object>> getBrandUsageStats() {
        log.info("브랜드 사용 통계 조회 요청");
        
        try {
            Map<String, Integer> usageStats = dynamicBrandService.getBrandUsageStats();
            List<String> frequentBrands = dynamicBrandService.getFrequentlyUsedBrands(3);
            
            Map<String, Object> response = new HashMap<>();
            response.put("totalTrackedBrands", usageStats.size());
            response.put("usageStats", usageStats);
            response.put("frequentlyUsedBrands", frequentBrands);
            response.put("autoKeywordThreshold", 5);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("브랜드 사용 통계 조회 실패", e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * 자주 사용되는 브랜드 목록 조회
     */
    @GetMapping("/frequent-brands")
    public ResponseEntity<Map<String, Object>> getFrequentBrands(
            @RequestParam(value = "minUsage", defaultValue = "3") int minUsage) {
        
        log.info("자주 사용되는 브랜드 조회: 최소 사용 횟수 {}", minUsage);
        
        try {
            List<String> frequentBrands = dynamicBrandService.getFrequentlyUsedBrands(minUsage);
            Map<String, Integer> usageStats = dynamicBrandService.getBrandUsageStats();
            
            Map<String, Object> response = new HashMap<>();
            response.put("frequentBrands", frequentBrands);
            response.put("minUsage", minUsage);
            response.put("count", frequentBrands.size());
            response.put("brandDetails", frequentBrands.stream()
                .limit(20)
                .map(brand -> Map.of(
                    "brandName", brand,
                    "usageCount", usageStats.getOrDefault(brand, 0)
                ))
                .toList());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("자주 사용되는 브랜드 조회 실패", e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * 브랜드 검색 테스트
     */
    @PostMapping("/test-brand-search")
    public ResponseEntity<Map<String, Object>> testBrandSearch(@RequestBody TestBrandSearchRequest request) {
        log.info("브랜드 검색 테스트: {}", request.getTransactionText());
        
        try {
            List<DynamicBrandService.BrandMatch> matches = 
                dynamicBrandService.findMatchingBrands(request.getTransactionText());
            
            Map<String, Object> response = new HashMap<>();
            response.put("transactionText", request.getTransactionText());
            response.put("matchCount", matches.size());
            response.put("matches", matches.stream().limit(10).toList());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("브랜드 검색 테스트 실패", e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * 키워드 시스템 통계
     */
    @GetMapping("/keyword-system-stats")
    public ResponseEntity<Map<String, Object>> getKeywordSystemStats() {
        log.info("키워드 시스템 통계 조회");
        
        try {
            // 키워드 그룹 통계
            List<com.moneyshift.api.model.KeywordGroup> allGroups = keywordGroupService.findAllActiveGroups();
            long totalKeywordGroups = allGroups.size();
            
            // 자동 등록된 그룹 수
            long autoRegisteredGroups = allGroups.stream()
                .filter(group -> group.getGroupName().contains("자동등록"))
                .count();
            
            // 매핑 통계
            var mappingStats = keywordTagMappingService.getStats();
            
            Map<String, Object> response = new HashMap<>();
            response.put("totalKeywordGroups", totalKeywordGroups);
            response.put("autoRegisteredGroups", autoRegisteredGroups);
            response.put("manualGroups", totalKeywordGroups - autoRegisteredGroups);
            response.put("mappingStats", mappingStats);
            response.put("categoryCounts", allGroups.stream()
                .collect(java.util.stream.Collectors.groupingBy(
                    group -> group.getCategory(),
                    java.util.stream.Collectors.counting()
                )));
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("키워드 시스템 통계 조회 실패", e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * 브랜드 키워드 수동 등록
     */
    @PostMapping("/register-brand-keyword")
    public ResponseEntity<Map<String, Object>> registerBrandKeyword(@RequestBody RegisterBrandKeywordRequest request) {
        log.info("브랜드 키워드 수동 등록: {}", request.getBrandName());
        
        try {
            // TODO: 수동 브랜드 키워드 등록 로직 구현
            // dynamicBrandService에 수동 등록 메서드 추가 필요
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "브랜드 키워드 등록이 예약되었습니다");
            response.put("brandName", request.getBrandName());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("브랜드 키워드 수동 등록 실패", e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * 시스템 상태 확인
     */
    @GetMapping("/system-health")
    public ResponseEntity<Map<String, Object>> getSystemHealth() {
        log.info("시스템 상태 확인");
        
        try {
            Map<String, Object> health = new HashMap<>();
            health.put("dynamicBrandService", "OK");
            health.put("keywordGroupService", "OK");
            health.put("timestamp", java.time.LocalDateTime.now());
            health.put("status", "HEALTHY");
            
            // 간단한 헬스 체크
            dynamicBrandService.getBrandUsageStats();
            keywordGroupService.findAllActiveGroups();
            
            return ResponseEntity.ok(health);
            
        } catch (Exception e) {
            log.error("시스템 상태 확인 실패", e);
            
            Map<String, Object> health = new HashMap<>();
            health.put("status", "UNHEALTHY");
            health.put("error", e.getMessage());
            health.put("timestamp", java.time.LocalDateTime.now());
            
            return ResponseEntity.status(500).body(health);
        }
    }
    
    // DTO 클래스들
    @lombok.Data
    public static class TestBrandSearchRequest {
        private String transactionText;
    }
    
    @lombok.Data
    public static class RegisterBrandKeywordRequest {
        private String brandName;
        private String companyName;
        private String industryCategory;
        private String primaryTag;
        private List<String> synonyms;
    }
}
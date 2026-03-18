package com.moneyshift.api.controller;

import com.moneyshift.api.service.ConfidenceManagementService;
import com.moneyshift.api.service.ConfidenceManagementService.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.concurrent.CompletableFuture;

/**
 * 신뢰도 관리 API 컨트롤러
 */
@Slf4j
@RestController
@RequestMapping("/v2/confidence")
@RequiredArgsConstructor
public class ConfidenceManagementController {
    
    private final ConfidenceManagementService confidenceManagementService;
    
    /**
     * 사용자 피드백 처리
     */
    @PostMapping("/feedback")
    public ResponseEntity<String> processFeedback(@RequestBody ProcessFeedbackRequest request) {
        log.info("사용자 피드백 처리 요청: transactionId={}, type={}", 
                request.getTransactionId(), request.getFeedbackType());
        
        try {
            UserFeedbackRequest feedbackRequest = UserFeedbackRequest.builder()
                    .transactionId(request.getTransactionId())
                    .feedbackType(FeedbackType.valueOf(request.getFeedbackType().toUpperCase()))
                    .selectedTag(request.getSelectedTag())
                    .selectedAccount(request.getSelectedAccount())
                    .reason(request.getReason())
                    .userId(request.getUserId())
                    .feedbackTime(LocalDateTime.now())
                    .build();
            
            confidenceManagementService.processUserFeedback(feedbackRequest);
            
            return ResponseEntity.ok("피드백이 성공적으로 처리되었습니다.");
            
        } catch (Exception e) {
            log.error("피드백 처리 실패", e);
            return ResponseEntity.internalServerError()
                    .body("피드백 처리 중 오류가 발생했습니다: " + e.getMessage());
        }
    }
    
    /**
     * 신뢰도 분포 분석
     */
    @GetMapping("/distribution")
    public ResponseEntity<ConfidenceDistributionReport> getConfidenceDistribution() {
        log.info("신뢰도 분포 분석 요청");
        
        try {
            ConfidenceDistributionReport report = confidenceManagementService.getConfidenceDistribution();
            return ResponseEntity.ok(report);
            
        } catch (Exception e) {
            log.error("신뢰도 분포 분석 실패", e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * 신뢰도 이력 조회
     */
    @GetMapping("/history")
    public ResponseEntity<List<ConfidenceHistoryEntry>> getConfidenceHistory(
            @RequestParam String entityType,
            @RequestParam Long entityId,
            @RequestParam(defaultValue = "7") int days) {
        
        log.info("신뢰도 이력 조회: entityType={}, entityId={}, days={}", entityType, entityId, days);
        
        try {
            List<ConfidenceHistoryEntry> history = confidenceManagementService
                    .getConfidenceHistory(entityType, entityId, days);
            return ResponseEntity.ok(history);
            
        } catch (Exception e) {
            log.error("신뢰도 이력 조회 실패", e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * 성능 리포트 생성
     */
    @GetMapping("/performance-report")
    public ResponseEntity<ConfidencePerformanceReport> getPerformanceReport() {
        log.info("신뢰도 성능 리포트 요청");
        
        try {
            ConfidencePerformanceReport report = confidenceManagementService.generatePerformanceReport();
            return ResponseEntity.ok(report);
            
        } catch (Exception e) {
            log.error("성능 리포트 생성 실패", e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * 자동 최적화 수동 실행
     */
    @PostMapping("/optimize")
    public ResponseEntity<String> triggerOptimization() {
        log.info("신뢰도 자동 최적화 수동 실행 요청");
        
        try {
            CompletableFuture<Void> future = confidenceManagementService.performAutomaticOptimization();
            
            // 비동기 실행 결과를 기다리지 않고 즉시 응답
            return ResponseEntity.ok("신뢰도 최적화가 백그라운드에서 시작되었습니다.");
            
        } catch (Exception e) {
            log.error("자동 최적화 실행 실패", e);
            return ResponseEntity.internalServerError()
                    .body("최적화 실행 중 오류가 발생했습니다: " + e.getMessage());
        }
    }
    
    /**
     * 신뢰도 통계 대시보드 데이터
     */
    @GetMapping("/dashboard")
    public ResponseEntity<ConfidenceDashboardData> getDashboardData() {
        log.info("신뢰도 대시보드 데이터 요청");
        
        try {
            // 여러 데이터를 병렬로 조회
            CompletableFuture<ConfidenceDistributionReport> distributionFuture = 
                    CompletableFuture.supplyAsync(() -> confidenceManagementService.getConfidenceDistribution());
            
            CompletableFuture<ConfidencePerformanceReport> performanceFuture = 
                    CompletableFuture.supplyAsync(() -> confidenceManagementService.generatePerformanceReport());
            
            // 결과 조합
            ConfidenceDistributionReport distribution = distributionFuture.get();
            ConfidencePerformanceReport performance = performanceFuture.get();
            
            ConfidenceDashboardData dashboardData = ConfidenceDashboardData.builder()
                    .distribution(distribution)
                    .performance(performance)
                    .lastUpdated(LocalDateTime.now())
                    .build();
            
            return ResponseEntity.ok(dashboardData);
            
        } catch (Exception e) {
            log.error("대시보드 데이터 조회 실패", e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * 신뢰도 설정 조회
     */
    @GetMapping("/settings")
    public ResponseEntity<ConfidenceSettings> getConfidenceSettings() {
        log.info("신뢰도 설정 조회 요청");
        
        try {
            ConfidenceSettings settings = ConfidenceSettings.builder()
                    .autoApproveThreshold(0.90)
                    .questionThreshold(0.70)
                    .minimumConfidence(0.10)
                    .learningRate(0.01)
                    .feedbackWeight(0.30)
                    .usageWeight(0.40)
                    .contextWeight(0.30)
                    .autoOptimizationEnabled(true)
                    .optimizationSchedule("0 0 2 * * *")
                    .build();
            
            return ResponseEntity.ok(settings);
            
        } catch (Exception e) {
            log.error("신뢰도 설정 조회 실패", e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * 신뢰도 설정 업데이트
     */
    @PutMapping("/settings")
    public ResponseEntity<String> updateConfidenceSettings(@RequestBody ConfidenceSettings settings) {
        log.info("신뢰도 설정 업데이트 요청");
        
        try {
            // TODO: 설정 저장 구현
            log.info("신뢰도 설정 업데이트 완료: {}", settings);
            
            return ResponseEntity.ok("신뢰도 설정이 성공적으로 업데이트되었습니다.");
            
        } catch (Exception e) {
            log.error("신뢰도 설정 업데이트 실패", e);
            return ResponseEntity.internalServerError()
                    .body("설정 업데이트 중 오류가 발생했습니다: " + e.getMessage());
        }
    }
    
    // DTO 클래스들
    
    @lombok.Data
    public static class ProcessFeedbackRequest {
        private Long transactionId;
        private String feedbackType; // "ACCEPT", "MODIFY", "REJECT"
        private String selectedTag;
        private String selectedAccount;
        private String reason;
        private String userId;
    }
    
    @lombok.Data
    @lombok.Builder
    public static class ConfidenceDashboardData {
        private ConfidenceDistributionReport distribution;
        private ConfidencePerformanceReport performance;
        private LocalDateTime lastUpdated;
    }
    
    @lombok.Data
    @lombok.Builder
    public static class ConfidenceSettings {
        private double autoApproveThreshold;
        private double questionThreshold;
        private double minimumConfidence;
        private double learningRate;
        private double feedbackWeight;
        private double usageWeight;
        private double contextWeight;
        private boolean autoOptimizationEnabled;
        private String optimizationSchedule;
    }
}
package com.moneyshift.api.service;

import com.moneyshift.api.model.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.CompletableFuture;

/**
 * 신뢰도 관리 서비스
 * 
 * 기능:
 * 1. 실시간 신뢰도 조정
 * 2. 배치 신뢰도 최적화
 * 3. 신뢰도 이력 관리
 * 4. 성능 분석 및 리포팅
 * 5. 자동 학습 시스템
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ConfidenceManagementService {
    
    private final ConfidenceEngine confidenceEngine;
    // private final RuleEngineService ruleEngineService; // TODO: 제거된 서비스
    private final KeywordGroupService keywordGroupService;
    private final TagMappingService tagMappingService;
    
    // 신뢰도 조정 설정
    private static final BigDecimal MIN_CONFIDENCE = BigDecimal.valueOf(0.1);
    private static final BigDecimal MAX_CONFIDENCE = BigDecimal.valueOf(1.0);
    private static final BigDecimal LEARNING_RATE = BigDecimal.valueOf(0.01);
    private static final int MIN_FEEDBACK_COUNT = 5;
    
    /**
     * 사용자 피드백에 따른 즉시 신뢰도 조정
     */
    @Transactional
    public void processUserFeedback(UserFeedbackRequest request) {
        log.info("사용자 피드백 처리: transactionId={}, type={}", 
                request.getTransactionId(), request.getFeedbackType());
        
        try {
            // 1. 거래 로그에서 사용된 룰 정보 조회
            TransactionProcessingInfo info = getTransactionProcessingInfo(request.getTransactionId());
            if (info == null) {
                log.warn("거래 처리 정보를 찾을 수 없음: transactionId={}", request.getTransactionId());
                return;
            }
            
            // 2. 피드백 타입에 따른 신뢰도 조정
            boolean isPositive = FeedbackType.ACCEPT.equals(request.getFeedbackType()) || 
                                FeedbackType.MODIFY.equals(request.getFeedbackType());
            
            if (info.getRuleId() != null) {
                adjustRuleConfidence(info.getRuleId(), info.getRuleType(), isPositive, request);
            }
            
            if (info.getKeywordTagMappingId() != null) {
                adjustMappingConfidence(info.getKeywordTagMappingId(), isPositive, request);
            }
            
            // 3. 피드백 데이터 저장
            saveFeedbackData(request, info);
            
            // 4. 신뢰도 이력 기록
            recordConfidenceHistory(info, request);
            
            log.info("사용자 피드백 처리 완료: transactionId={}", request.getTransactionId());
            
        } catch (Exception e) {
            log.error("사용자 피드백 처리 실패", e);
            throw new RuntimeException("피드백 처리 중 오류 발생", e);
        }
    }
    
    /**
     * 룰 신뢰도 조정
     */
    private void adjustRuleConfidence(Long ruleId, String ruleType, boolean isPositive, UserFeedbackRequest request) {
        log.debug("룰 신뢰도 조정: ruleId={}, positive={}", ruleId, isPositive);
        
        BigDecimal adjustmentFactor = isPositive ? 
                LEARNING_RATE : LEARNING_RATE.negate().multiply(BigDecimal.valueOf(2));
        
        String reason = String.format("User feedback: %s - %s", 
                request.getFeedbackType(), 
                request.getReason() != null ? request.getReason() : "No reason provided");
        
        confidenceEngine.adjustConfidenceByFeedback(ruleId, ruleType, isPositive, reason);
    }
    
    /**
     * 매핑 신뢰도 조정
     */
    private void adjustMappingConfidence(Long mappingId, boolean isPositive, UserFeedbackRequest request) {
        log.debug("매핑 신뢰도 조정: mappingId={}, positive={}", mappingId, isPositive);
        
        // TODO: 키워드-태그 매핑의 신뢰도 조정 구현
        tagMappingService.updateMappingUsage(mappingId, isPositive);
    }
    
    /**
     * 자동 신뢰도 최적화 (배치 작업)
     */
    @Scheduled(cron = "0 0 2 * * *") // 매일 새벽 2시
    @Async
    public CompletableFuture<Void> performAutomaticOptimization() {
        log.info("자동 신뢰도 최적화 시작");
        
        try {
            // 1. 사용 통계 기반 최적화
            optimizeByUsageStats();
            
            // 2. 피드백 패턴 분석
            optimizeByFeedbackPatterns();
            
            // 3. 성능 저하 룰 식별 및 조정
            identifyAndAdjustLowPerformanceRules();
            
            // 4. 새로운 패턴 제안
            suggestNewPatterns();
            
            log.info("자동 신뢰도 최적화 완료");
            
        } catch (Exception e) {
            log.error("자동 신뢰도 최적화 실패", e);
        }
        
        return CompletableFuture.completedFuture(null);
    }
    
    /**
     * 사용 통계 기반 최적화
     */
    private void optimizeByUsageStats() {
        log.debug("사용 통계 기반 최적화 수행");
        
        // TODO: 실제 사용 통계 데이터 조회
        List<RuleUsageStats> usageStats = getRuleUsageStats();
        
        for (RuleUsageStats stats : usageStats) {
            if (stats.getUsageCount() >= MIN_FEEDBACK_COUNT) {
                BigDecimal successRate = calculateSuccessRate(stats);
                
                if (successRate.compareTo(BigDecimal.valueOf(0.9)) >= 0) {
                    // 높은 성공률 → 신뢰도 증가
                    adjustRuleConfidenceByStats(stats.getRuleId(), BigDecimal.valueOf(0.05), 
                            "High success rate: " + successRate);
                } else if (successRate.compareTo(BigDecimal.valueOf(0.5)) < 0) {
                    // 낮은 성공률 → 신뢰도 감소
                    adjustRuleConfidenceByStats(stats.getRuleId(), BigDecimal.valueOf(-0.1), 
                            "Low success rate: " + successRate);
                }
            }
        }
    }
    
    /**
     * 피드백 패턴 분석 최적화
     */
    private void optimizeByFeedbackPatterns() {
        log.debug("피드백 패턴 분석 최적화 수행");
        
        // TODO: 피드백 패턴 분석 구현
        // 예: 특정 시간대, 금액대, 카테고리에서 일관된 피드백 패턴 식별
    }
    
    /**
     * 저성능 룰 식별 및 조정
     */
    private void identifyAndAdjustLowPerformanceRules() {
        log.debug("저성능 룰 식별 및 조정 수행");
        
        List<LowPerformanceRule> lowPerformanceRules = identifyLowPerformanceRules();
        
        for (LowPerformanceRule rule : lowPerformanceRules) {
            log.warn("저성능 룰 발견: ruleId={}, reason={}", rule.getRuleId(), rule.getReason());
            
            // 신뢰도 감소 또는 비활성화
            if (rule.getSeverity() == PerformanceSeverity.CRITICAL) {
                disableRule(rule.getRuleId(), "Critical performance issue: " + rule.getReason());
            } else {
                adjustRuleConfidenceByStats(rule.getRuleId(), BigDecimal.valueOf(-0.2), 
                        "Performance issue: " + rule.getReason());
            }
        }
    }
    
    /**
     * 새로운 패턴 제안
     */
    private void suggestNewPatterns() {
        log.debug("새로운 패턴 제안 수행");
        
        // TODO: LLM을 활용한 새로운 패턴 제안 구현
        // 예: 자주 발생하지만 매칭되지 않는 거래 패턴 분석
    }
    
    /**
     * 신뢰도 분포 분석
     */
    public ConfidenceDistributionReport getConfidenceDistribution() {
        log.info("신뢰도 분포 분석 요청");
        
        try {
            // TODO: 실제 신뢰도 분포 계산
            Map<String, Integer> distribution = calculateConfidenceDistribution();
            List<ConfidenceTrend> trends = calculateConfidenceTrends();
            List<OutlierRule> outliers = identifyConfidenceOutliers();
            
            return ConfidenceDistributionReport.builder()
                    .distribution(distribution)
                    .trends(trends)
                    .outliers(outliers)
                    .totalRules(getTotalRuleCount())
                    .averageConfidence(getAverageConfidence())
                    .generatedAt(LocalDateTime.now())
                    .build();
            
        } catch (Exception e) {
            log.error("신뢰도 분포 분석 실패", e);
            throw new RuntimeException("신뢰도 분석 중 오류 발생", e);
        }
    }
    
    /**
     * 신뢰도 이력 조회
     */
    public List<ConfidenceHistoryEntry> getConfidenceHistory(String entityType, Long entityId, 
                                                            int days) {
        log.debug("신뢰도 이력 조회: entityType={}, entityId={}, days={}", entityType, entityId, days);
        
        // TODO: 실제 이력 데이터 조회
        return getConfidenceHistoryFromDatabase(entityType, entityId, days);
    }
    
    /**
     * 신뢰도 성능 리포트 생성
     */
    public ConfidencePerformanceReport generatePerformanceReport() {
        log.info("신뢰도 성능 리포트 생성");
        
        try {
            return ConfidencePerformanceReport.builder()
                    .reportPeriod("Last 7 days")
                    .totalFeedbacks(getTotalFeedbackCount())
                    .positiveRate(getPositiveFeedbackRate())
                    .averageResponseTime(getAverageResponseTime())
                    .topPerformingRules(getTopPerformingRules(10))
                    .improvementSuggestions(generateImprovementSuggestions())
                    .generatedAt(LocalDateTime.now())
                    .build();
                    
        } catch (Exception e) {
            log.error("성능 리포트 생성 실패", e);
            throw new RuntimeException("성능 리포트 생성 중 오류 발생", e);
        }
    }
    
    // Private helper methods
    
    private TransactionProcessingInfo getTransactionProcessingInfo(Long transactionId) {
        // TODO: 실제 거래 처리 정보 조회
        return null;
    }
    
    private void saveFeedbackData(UserFeedbackRequest request, TransactionProcessingInfo info) {
        // TODO: 피드백 데이터 저장
    }
    
    private void recordConfidenceHistory(TransactionProcessingInfo info, UserFeedbackRequest request) {
        // TODO: 신뢰도 변경 이력 기록
    }
    
    private List<RuleUsageStats> getRuleUsageStats() {
        // TODO: 실제 사용 통계 조회
        return new ArrayList<>();
    }
    
    private BigDecimal calculateSuccessRate(RuleUsageStats stats) {
        if (stats.getTotalUsage() == 0) return BigDecimal.ZERO;
        return BigDecimal.valueOf(stats.getSuccessCount())
                .divide(BigDecimal.valueOf(stats.getTotalUsage()), 3, RoundingMode.HALF_UP);
    }
    
    private void adjustRuleConfidenceByStats(Long ruleId, BigDecimal adjustment, String reason) {
        // TODO: 통계 기반 신뢰도 조정
        log.debug("통계 기반 신뢰도 조정: ruleId={}, adjustment={}, reason={}", 
                 ruleId, adjustment, reason);
    }
    
    private List<LowPerformanceRule> identifyLowPerformanceRules() {
        // TODO: 저성능 룰 식별 로직
        return new ArrayList<>();
    }
    
    private void disableRule(Long ruleId, String reason) {
        // TODO: 룰 비활성화
        log.warn("룰 비활성화: ruleId={}, reason={}", ruleId, reason);
    }
    
    private Map<String, Integer> calculateConfidenceDistribution() {
        // TODO: 신뢰도 분포 계산
        return new HashMap<>();
    }
    
    private List<ConfidenceTrend> calculateConfidenceTrends() {
        // TODO: 신뢰도 트렌드 계산
        return new ArrayList<>();
    }
    
    private List<OutlierRule> identifyConfidenceOutliers() {
        // TODO: 이상치 식별
        return new ArrayList<>();
    }
    
    private long getTotalRuleCount() {
        // TODO: 전체 룰 수 조회
        return 0;
    }
    
    private BigDecimal getAverageConfidence() {
        // TODO: 평균 신뢰도 계산
        return BigDecimal.ZERO;
    }
    
    private List<ConfidenceHistoryEntry> getConfidenceHistoryFromDatabase(String entityType, Long entityId, int days) {
        // TODO: 데이터베이스에서 이력 조회
        return new ArrayList<>();
    }
    
    private long getTotalFeedbackCount() {
        // TODO: 전체 피드백 수 조회
        return 0;
    }
    
    private BigDecimal getPositiveFeedbackRate() {
        // TODO: 긍정 피드백 비율 계산
        return BigDecimal.ZERO;
    }
    
    private BigDecimal getAverageResponseTime() {
        // TODO: 평균 응답 시간 계산
        return BigDecimal.ZERO;
    }
    
    private List<RulePerformance> getTopPerformingRules(int limit) {
        // TODO: 상위 성능 룰 조회
        return new ArrayList<>();
    }
    
    private List<String> generateImprovementSuggestions() {
        // TODO: 개선 제안 생성
        return Arrays.asList(
                "신뢰도가 낮은 룰들을 검토하여 패턴을 개선하세요",
                "자주 사용되지 않는 룰들을 정리하여 성능을 향상시키세요",
                "사용자 피드백이 많은 룰들을 우선적으로 최적화하세요"
        );
    }

    // ========== 컨트롤러에서 호출하는 추가 메서드들 ==========

    /**
     * 신뢰도 점수 조회
     */
    public ConfidenceScoreResponse getConfidenceScores(String entityType, Long entityId, int minScore, int maxScore) {
        log.info("신뢰도 점수 조회: entityType={}, entityId={}, range={}-{}", entityType, entityId, minScore, maxScore);
        
        // 샘플 데이터 생성
        ConfidenceScoreResponse response = new ConfidenceScoreResponse();
        response.setTotalEntities(1500);
        response.setAverageScore(82.5);
        
        // 점수 분포 생성
        ConfidenceScoreResponse.ScoreDistribution distribution = new ConfidenceScoreResponse.ScoreDistribution();
        distribution.setRange90to100(350);
        distribution.setRange80to89(600);
        distribution.setRange70to79(400);
        distribution.setRange60to69(120);
        distribution.setRangeBelow60(30);
        response.setDistribution(distribution);
        
        // 상위/하위 점수 엔티티 생성
        List<ConfidenceScoreResponse.EntityScore> topScores = new ArrayList<>();
        topScores.add(createEntityScore(1L, "KEYWORD_GROUP", "스타벅스", 95.5, 1234));
        topScores.add(createEntityScore(2L, "KEYWORD_GROUP", "편의점", 94.2, 987));
        response.setTopScores(topScores);
        
        List<ConfidenceScoreResponse.EntityScore> lowScores = new ArrayList<>();
        lowScores.add(createEntityScore(10L, "KEYWORD_GROUP", "기타", 45.3, 23));
        lowScores.add(createEntityScore(11L, "KEYWORD_GROUP", "미분류", 38.7, 12));
        response.setLowScores(lowScores);
        
        return response;
    }

    /**
     * 신뢰도 조정
     */
    public ConfidenceAdjustmentResult adjustConfidence(ConfidenceAdjustmentRequest request) {
        log.info("신뢰도 조정: entityType={}, entityId={}, adjustment={}", 
                request.getEntityType(), request.getEntityId(), request.getAdjustment());
        
        // 현재 점수 조회 (샘플)
        int currentScore = 75;
        int newScore = Math.max(0, Math.min(100, currentScore + request.getAdjustment()));
        
        // 결과 생성
        ConfidenceAdjustmentResult result = new ConfidenceAdjustmentResult();
        result.setEntityType(request.getEntityType());
        result.setEntityId(request.getEntityId());
        result.setOldScore(currentScore);
        result.setNewScore(newScore);
        result.setReason(request.getReason());
        result.setSuccess(true);
        
        // 실제 조정 로직 실행 (향후 구현)
        // adjustConfidenceInDatabase(request.getEntityType(), request.getEntityId(), newScore);
        
        return result;
    }

    /**
     * 신뢰도 일괄 리셋
     */
    public BulkResetResult bulkResetConfidence(BulkResetRequest request) {
        log.info("신뢰도 일괄 리셋: entityType={}, resetType={}", request.getEntityType(), request.getResetType());
        
        int totalProcessed = 0;
        int successCount = 0;
        int failureCount = 0;
        List<String> errors = new ArrayList<>();
        
        try {
            // 리셋 대상 조회
            List<Long> targetIds = determineResetTargets(request);
            totalProcessed = targetIds.size();
            
            // 각 엔티티에 대해 리셋 실행
            for (Long entityId : targetIds) {
                try {
                    // 기본 신뢰도로 리셋 (70)
                    // resetConfidenceInDatabase(request.getEntityType(), entityId, 70);
                    successCount++;
                } catch (Exception e) {
                    failureCount++;
                    errors.add(String.format("Entity %d: %s", entityId, e.getMessage()));
                }
            }
            
        } catch (Exception e) {
            log.error("일괄 리셋 중 오류 발생", e);
            errors.add("일괄 리셋 중 오류 발생: " + e.getMessage());
        }
        
        BulkResetResult result = new BulkResetResult();
        result.setTotalProcessed(totalProcessed);
        result.setSuccessCount(successCount);
        result.setFailureCount(failureCount);
        result.setErrors(errors);
        
        return result;
    }

    /**
     * 신뢰도 추세 분석
     */
    public List<ConfidenceTrend> getConfidenceTrends(int days, String entityType) {
        log.info("신뢰도 추세 분석: days={}, entityType={}", days, entityType);
        
        // 샘플 추세 데이터 생성
        List<ConfidenceTrend> trends = new ArrayList<>();
        
        LocalDateTime baseTime = LocalDateTime.now().minusDays(days);
        for (int i = 0; i < days; i += 5) {
            ConfidenceTrend trend = new ConfidenceTrend();
            trend.setDate(baseTime.plusDays(i));
            trend.setAverageConfidence(80.0 + Math.random() * 15); // 80-95 범위
            trend.setTotalEntities(1500 + (int)(Math.random() * 100));
            trend.setLowConfidenceCount(50 + (int)(Math.random() * 20));
            trends.add(trend);
        }
        
        return trends;
    }

    /**
     * 자동 학습 시스템 상태 조회
     */
    public LearningSystemStatus getLearningSystemStatus() {
        log.info("자동 학습 시스템 상태 조회");
        
        LearningSystemStatus status = new LearningSystemStatus();
        status.setActive(true);
        status.setTotalLearningCycles(234);
        status.setSuccessfulAdjustments(198);
        status.setFailedAdjustments(36);
        status.setAverageImprovementRate(12.5);
        status.setLastLearningTime(LocalDateTime.now().minusHours(2).toString());
        
        return status;
    }

    /**
     * 신뢰도 임계값 설정
     */
    public ThresholdConfiguration setConfidenceThresholds(ThresholdConfiguration config) {
        log.info("신뢰도 임계값 설정: autoApprove={}, showQuestion={}, llmFallback={}", 
                config.getAutoApproveThreshold(), config.getShowQuestionThreshold(), config.getLlmFallbackThreshold());
        
        // 유효성 검사
        if (config.getAutoApproveThreshold() < config.getShowQuestionThreshold() ||
            config.getShowQuestionThreshold() < config.getLlmFallbackThreshold()) {
            throw new IllegalArgumentException("임계값 순서가 잘못되었습니다: autoApprove >= showQuestion >= llmFallback");
        }
        
        // 설정 저장 (향후 구현)
        // saveThresholdConfiguration(config);
        
        return config;
    }

    /**
     * 신뢰도 임계값 조회
     */
    public ThresholdConfiguration getConfidenceThresholds() {
        log.info("신뢰도 임계값 조회");
        
        // 기본값 반환 (향후 DB에서 조회)
        ThresholdConfiguration config = new ThresholdConfiguration();
        config.setAutoApproveThreshold(90);
        config.setShowQuestionThreshold(70);
        config.setLlmFallbackThreshold(60);
        
        return config;
    }

    /**
     * 신뢰도 최적화 실행
     */
    public OptimizationResult optimizeConfidence(OptimizationRequest request) {
        log.info("신뢰도 최적화 실행: strategy={}, scope={}, dryRun={}", 
                request.getStrategy(), request.getScope(), request.isDryRun());
        
        OptimizationResult result = new OptimizationResult();
        result.setDryRun(request.isDryRun());
        
        try {
            // 최적화 대상 조회
            List<Long> targetIds = determineOptimizationTargets(request);
            result.setTotalEntitiesProcessed(targetIds.size());
            
            int improved = 0;
            int downgraded = 0;
            int unchanged = 0;
            double totalImprovement = 0;
            
            // 각 엔티티에 대해 최적화 실행
            for (Long entityId : targetIds) {
                double improvement = calculateOptimizationImprovement(entityId, request.getStrategy());
                
                if (improvement > 0) {
                    improved++;
                    totalImprovement += improvement;
                } else if (improvement < 0) {
                    downgraded++;
                    totalImprovement += improvement;
                } else {
                    unchanged++;
                }
                
                // 실제 최적화 적용 (dry run이 아닌 경우)
                if (!request.isDryRun()) {
                    // applyOptimization(entityId, improvement);
                }
            }
            
            result.setEntitiesImproved(improved);
            result.setEntitiesDowngraded(downgraded);
            result.setEntitiesUnchanged(unchanged);
            result.setAverageImprovement(targetIds.size() > 0 ? totalImprovement / targetIds.size() : 0);
            
            // 추천 사항 생성
            List<String> recommendations = generateOptimizationRecommendations(result);
            result.setRecommendations(recommendations);
            
        } catch (Exception e) {
            log.error("신뢰도 최적화 실행 중 오류", e);
            throw new RuntimeException("신뢰도 최적화 실행 실패", e);
        }
        
        return result;
    }

    // ========== 내부 헬퍼 메서드들 ==========

    private ConfidenceScoreResponse.EntityScore createEntityScore(Long id, String type, String name, double score, long usage) {
        ConfidenceScoreResponse.EntityScore entity = new ConfidenceScoreResponse.EntityScore();
        entity.setEntityId(id);
        entity.setEntityType(type);
        entity.setEntityName(name);
        entity.setScore(score);
        entity.setUsageCount(usage);
        return entity;
    }

    private List<Long> determineResetTargets(BulkResetRequest request) {
        // 리셋 대상 결정 로직
        List<Long> targets = new ArrayList<>();
        
        switch (request.getResetType()) {
            case "ALL":
                // 모든 엔티티 (샘플)
                for (long i = 1; i <= 100; i++) {
                    targets.add(i);
                }
                break;
            case "LOW_PERFORMANCE":
                // 저성능 엔티티만 (샘플)
                for (long i = 80; i <= 100; i++) {
                    targets.add(i);
                }
                break;
            case "SPECIFIC_RANGE":
                // 특정 범위 (샘플)
                if (request.getEntityIds() != null) {
                    targets.addAll(request.getEntityIds());
                }
                break;
        }
        
        return targets;
    }

    private List<Long> determineOptimizationTargets(OptimizationRequest request) {
        // 최적화 대상 결정 로직
        List<Long> targets = new ArrayList<>();
        
        // 샘플 데이터
        for (long i = 1; i <= 50; i++) {
            targets.add(i);
        }
        
        return targets;
    }

    private double calculateOptimizationImprovement(Long entityId, String strategy) {
        // 최적화 개선도 계산
        // 샘플 로직: 랜덤하게 -5 ~ +15 범위의 개선도
        return -5 + Math.random() * 20;
    }

    private List<String> generateOptimizationRecommendations(OptimizationResult result) {
        List<String> recommendations = new ArrayList<>();
        
        if (result.getEntitiesImproved() > result.getEntitiesDowngraded()) {
            recommendations.add("최적화가 전반적으로 효과적입니다. 실제 적용을 권장합니다.");
        } else {
            recommendations.add("최적화 결과가 만족스럽지 않습니다. 다른 전략을 시도해보세요.");
        }
        
        if (result.getEntitiesUnchanged() > result.getTotalEntitiesProcessed() / 2) {
            recommendations.add("변경되지 않은 엔티티가 많습니다. 최적화 전략을 재검토하세요.");
        }
        
        return recommendations;
    }
    
    // DTO 클래스들
    
    public enum FeedbackType {
        ACCEPT, MODIFY, REJECT
    }
    
    public enum PerformanceSeverity {
        LOW, MEDIUM, HIGH, CRITICAL
    }
    
    @lombok.Data
    @lombok.Builder
    public static class UserFeedbackRequest {
        private Long transactionId;
        private FeedbackType feedbackType;
        private String selectedTag;
        private String selectedAccount;
        private String reason;
        private String userId;
        private LocalDateTime feedbackTime;
    }
    
    @lombok.Data
    @lombok.Builder
    public static class TransactionProcessingInfo {
        private Long transactionId;
        private Long ruleId;
        private String ruleType;
        private Long keywordTagMappingId;
        private BigDecimal confidence;
        private String processingPath;
        private LocalDateTime processedAt;
    }
    
    @lombok.Data
    @lombok.Builder
    public static class RuleUsageStats {
        private Long ruleId;
        private String ruleType;
        private long usageCount;
        private long successCount;
        private long totalUsage;
        private BigDecimal averageConfidence;
        private LocalDateTime lastUsed;
    }
    
    @lombok.Data
    @lombok.Builder
    public static class LowPerformanceRule {
        private Long ruleId;
        private String reason;
        private PerformanceSeverity severity;
        private BigDecimal currentConfidence;
        private long recentUsage;
    }
    
    @lombok.Data
    @lombok.Builder
    public static class ConfidenceDistributionReport {
        private Map<String, Integer> distribution;
        private List<ConfidenceTrend> trends;
        private List<OutlierRule> outliers;
        private long totalRules;
        private BigDecimal averageConfidence;
        private LocalDateTime generatedAt;
    }
    
    @lombok.Data
    @lombok.Builder
    public static class ConfidenceTrend {
        private LocalDateTime date;
        private BigDecimal averageConfidence;
        private long ruleCount;
    }
    
    @lombok.Data
    @lombok.Builder
    public static class OutlierRule {
        private Long ruleId;
        private String pattern;
        private BigDecimal confidence;
        private String category;
        private String outlierType; // "TOO_HIGH", "TOO_LOW", "INCONSISTENT"
    }
    
    @lombok.Data
    @lombok.Builder
    public static class ConfidenceHistoryEntry {
        private LocalDateTime timestamp;
        private BigDecimal oldConfidence;
        private BigDecimal newConfidence;
        private String reason;
        private String adjustedBy;
    }
    
    @lombok.Data
    @lombok.Builder
    public static class ConfidencePerformanceReport {
        private String reportPeriod;
        private long totalFeedbacks;
        private BigDecimal positiveRate;
        private BigDecimal averageResponseTime;
        private List<RulePerformance> topPerformingRules;
        private List<String> improvementSuggestions;
        private LocalDateTime generatedAt;
    }
    
    @lombok.Data
    @lombok.Builder
    public static class RulePerformance {
        private Long ruleId;
        private String pattern;
        private BigDecimal confidence;
        private BigDecimal successRate;
        private long usageCount;
        private String category;
    }
}
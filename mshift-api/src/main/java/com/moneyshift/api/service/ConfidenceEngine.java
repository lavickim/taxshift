package com.moneyshift.api.service;

import com.moneyshift.api.model.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.Map;

/**
 * 신뢰도 관리 엔진
 * 
 * 기능:
 * 1. 사용자 피드백 기반 신뢰도 자동 조정
 * 2. 패턴 사용 통계에 따른 신뢰도 업데이트
 * 3. 컨텍스트 기반 신뢰도 보정
 * 4. 신뢰도 변경 이력 관리
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ConfidenceEngine {
    
    // 신뢰도 계산 가중치
    private static final BigDecimal PATTERN_WEIGHT = BigDecimal.valueOf(0.4);
    private static final BigDecimal HISTORY_WEIGHT = BigDecimal.valueOf(0.3);
    private static final BigDecimal CONTEXT_WEIGHT = BigDecimal.valueOf(0.3);
    
    // 피드백 기반 조정값
    private static final BigDecimal POSITIVE_FEEDBACK_BOOST = BigDecimal.valueOf(0.02);
    private static final BigDecimal NEGATIVE_FEEDBACK_PENALTY = BigDecimal.valueOf(0.05);
    private static final BigDecimal SUCCESS_RATE_BONUS = BigDecimal.valueOf(0.1);
    
    // 임계값
    private static final BigDecimal MIN_CONFIDENCE = BigDecimal.valueOf(0.1);
    private static final BigDecimal MAX_CONFIDENCE = BigDecimal.valueOf(1.0);
    private static final int MIN_USAGE_FOR_ADJUSTMENT = 10;
    
    /**
     * 패턴 매칭 결과에 대한 포괄적 신뢰도 계산
     */
    public BigDecimal calculateComprehensiveConfidence(
            PatternMatch match,
            TransactionContext context,
            UserFeedbackHistory userHistory) {
        
        log.debug("신뢰도 계산 시작 - Rule ID: {}, Pattern Type: {}", 
                 match.getRuleId(), match.getPatternType());
        
        // 1. 기본 패턴 신뢰도
        BigDecimal patternScore = calculatePatternScore(match);
        
        // 2. 사용자 히스토리 기반 신뢰도
        BigDecimal historyScore = calculateHistoryScore(match, userHistory);
        
        // 3. 컨텍스트 기반 신뢰도
        BigDecimal contextScore = calculateContextScore(match, context);
        
        // 4. 가중평균 계산
        BigDecimal finalConfidence = patternScore.multiply(PATTERN_WEIGHT)
                .add(historyScore.multiply(HISTORY_WEIGHT))
                .add(contextScore.multiply(CONTEXT_WEIGHT));
        
        // 5. 범위 제한
        finalConfidence = finalConfidence.max(MIN_CONFIDENCE).min(MAX_CONFIDENCE);
        
        log.debug("신뢰도 계산 완료 - Pattern: {}, History: {}, Context: {}, Final: {}", 
                 patternScore, historyScore, contextScore, finalConfidence);
        
        return finalConfidence.setScale(3, RoundingMode.HALF_UP);
    }
    
    /**
     * 기본 패턴 신뢰도 계산
     */
    private BigDecimal calculatePatternScore(PatternMatch match) {
        BigDecimal score = match.getBaseConfidence() != null ? 
                match.getBaseConfidence() : BigDecimal.valueOf(0.7);
        
        // 매칭된 키워드 수에 따른 보정
        if (match.getExtractedKeywords() != null) {
            int keywordCount = match.getExtractedKeywords().size();
            if (keywordCount > 1) {
                score = score.add(BigDecimal.valueOf(keywordCount * 0.05));
            }
        }
        
        return score.max(MIN_CONFIDENCE).min(MAX_CONFIDENCE);
    }
    
    /**
     * 사용자 히스토리 기반 신뢰도 계산
     */
    private BigDecimal calculateHistoryScore(PatternMatch match, UserFeedbackHistory userHistory) {
        if (userHistory == null) {
            return BigDecimal.valueOf(0.5); // 중립값
        }
        
        int acceptCount = userHistory.getAcceptCount(match.getRuleId());
        int rejectCount = userHistory.getRejectCount(match.getRuleId());
        int totalFeedback = acceptCount + rejectCount;
        
        if (totalFeedback == 0) {
            return BigDecimal.valueOf(0.5); // 피드백 없음
        }
        
        // 성공률 계산
        BigDecimal successRate = BigDecimal.valueOf(acceptCount)
                .divide(BigDecimal.valueOf(totalFeedback), 3, RoundingMode.HALF_UP);
        
        // 피드백 수에 따른 신뢰도 조정
        BigDecimal confidence = successRate;
        if (totalFeedback >= MIN_USAGE_FOR_ADJUSTMENT) {
            confidence = confidence.add(BigDecimal.valueOf(0.1)); // 충분한 피드백 보너스
        }
        
        return confidence.max(MIN_CONFIDENCE).min(MAX_CONFIDENCE);
    }
    
    /**
     * 컨텍스트 기반 신뢰도 계산
     */
    private BigDecimal calculateContextScore(PatternMatch match, TransactionContext context) {
        BigDecimal score = BigDecimal.valueOf(0.5); // 기본값
        
        // 시간대 매칭
        score = score.add(calculateTimeContextScore(match, context));
        
        // 금액 범위 매칭
        score = score.add(calculateAmountContextScore(match, context));
        
        // 요일 매칭
        score = score.add(calculateDayContextScore(match, context));
        
        return score.max(MIN_CONFIDENCE).min(MAX_CONFIDENCE);
    }
    
    /**
     * 시간 컨텍스트 점수 계산
     */
    private BigDecimal calculateTimeContextScore(PatternMatch match, TransactionContext context) {
        BigDecimal score = BigDecimal.ZERO;
        
        // 카테고리별 시간 선호도
        if (match.getContextData() != null) {
            String category = (String) match.getContextData().get("category");
            if (category != null) {
                switch (category) {
                    case "편의점":
                        if (context.isLateNight()) {
                            score = score.add(BigDecimal.valueOf(0.15));
                        }
                        break;
                    case "카페":
                        if (context.isBusinessHours()) {
                            score = score.add(BigDecimal.valueOf(0.1));
                        }
                        break;
                    case "주유소":
                        if (!context.isLateNight()) {
                            score = score.add(BigDecimal.valueOf(0.05));
                        }
                        break;
                }
            }
        }
        
        return score;
    }
    
    /**
     * 금액 컨텍스트 점수 계산
     */
    private BigDecimal calculateAmountContextScore(PatternMatch match, TransactionContext context) {
        BigDecimal score = BigDecimal.ZERO;
        
        if (context.getAmount() != null) {
            BigDecimal amount = context.getAmount();
            
            // 카테고리별 일반적인 금액 범위 확인
            if (match.getContextData() != null) {
                String category = (String) match.getContextData().get("category");
                if (category != null) {
                    switch (category) {
                        case "카페":
                            if (amount.compareTo(BigDecimal.valueOf(3000)) >= 0 && 
                                amount.compareTo(BigDecimal.valueOf(15000)) <= 0) {
                                score = score.add(BigDecimal.valueOf(0.1));
                            }
                            break;
                        case "편의점":
                            if (amount.compareTo(BigDecimal.valueOf(1000)) >= 0 && 
                                amount.compareTo(BigDecimal.valueOf(20000)) <= 0) {
                                score = score.add(BigDecimal.valueOf(0.05));
                            }
                            break;
                        case "주유소":
                            if (amount.compareTo(BigDecimal.valueOf(30000)) >= 0) {
                                score = score.add(BigDecimal.valueOf(0.1));
                            }
                            break;
                    }
                }
            }
        }
        
        return score;
    }
    
    /**
     * 요일 컨텍스트 점수 계산
     */
    private BigDecimal calculateDayContextScore(PatternMatch match, TransactionContext context) {
        BigDecimal score = BigDecimal.ZERO;
        
        // 주말 vs 평일 패턴
        if (match.getContextData() != null) {
            String category = (String) match.getContextData().get("category");
            if (category != null && "카페".equals(category)) {
                if (context.isWeekend()) {
                    score = score.add(BigDecimal.valueOf(0.05)); // 주말 카페 이용 증가
                }
            }
        }
        
        return score;
    }
    
    /**
     * 사용자 피드백에 따른 신뢰도 조정
     */
    @Transactional
    public void adjustConfidenceByFeedback(Long ruleId, String ruleType, 
                                         boolean isPositive, String reason) {
        log.info("피드백 기반 신뢰도 조정 시작 - Rule ID: {}, Type: {}, Positive: {}", 
                ruleId, ruleType, isPositive);
        
        try {
            // 현재 신뢰도 조회
            BigDecimal currentConfidence = getCurrentConfidence(ruleId, ruleType);
            
            // 조정값 계산
            BigDecimal adjustment = isPositive ? 
                    POSITIVE_FEEDBACK_BOOST : NEGATIVE_FEEDBACK_PENALTY.negate();
            
            // 새로운 신뢰도 계산
            BigDecimal newConfidence = currentConfidence.add(adjustment)
                    .max(MIN_CONFIDENCE)
                    .min(MAX_CONFIDENCE);
            
            // 신뢰도 업데이트
            updateConfidence(ruleId, ruleType, newConfidence);
            
            // 이력 저장
            saveConfidenceHistory(ruleId, ruleType, currentConfidence, newConfidence, 
                                reason, "USER_FEEDBACK");
            
            log.info("피드백 기반 신뢰도 조정 완료 - {} -> {}", currentConfidence, newConfidence);
            
        } catch (Exception e) {
            log.error("피드백 기반 신뢰도 조정 실패 - Rule ID: {}", ruleId, e);
            throw new RuntimeException("신뢰도 조정 중 오류 발생", e);
        }
    }
    
    /**
     * 패턴 사용 통계에 따른 신뢰도 자동 조정
     */
    @Transactional
    public void adjustConfidenceByUsageStats(Long ruleId, String ruleType, 
                                           int usageCount, int successCount) {
        if (usageCount < MIN_USAGE_FOR_ADJUSTMENT) {
            return; // 충분한 사용 데이터 없음
        }
        
        log.info("사용 통계 기반 신뢰도 조정 시작 - Rule ID: {}, Usage: {}, Success: {}", 
                ruleId, usageCount, successCount);
        
        try {
            BigDecimal currentConfidence = getCurrentConfidence(ruleId, ruleType);
            BigDecimal successRate = BigDecimal.valueOf(successCount)
                    .divide(BigDecimal.valueOf(usageCount), 3, RoundingMode.HALF_UP);
            
            // 성공률이 높은 경우 신뢰도 증가
            BigDecimal adjustment = BigDecimal.ZERO;
            if (successRate.compareTo(BigDecimal.valueOf(0.9)) >= 0) {
                adjustment = SUCCESS_RATE_BONUS;
            } else if (successRate.compareTo(BigDecimal.valueOf(0.6)) < 0) {
                adjustment = SUCCESS_RATE_BONUS.negate();
            }
            
            if (adjustment.compareTo(BigDecimal.ZERO) != 0) {
                BigDecimal newConfidence = currentConfidence.add(adjustment)
                        .max(MIN_CONFIDENCE)
                        .min(MAX_CONFIDENCE);
                
                updateConfidence(ruleId, ruleType, newConfidence);
                saveConfidenceHistory(ruleId, ruleType, currentConfidence, newConfidence, 
                                    String.format("Success rate: %.1f%%", successRate.multiply(BigDecimal.valueOf(100))), 
                                    "AUTO_ADJUSTMENT");
                
                log.info("사용 통계 기반 신뢰도 조정 완료 - {} -> {}", currentConfidence, newConfidence);
            }
            
        } catch (Exception e) {
            log.error("사용 통계 기반 신뢰도 조정 실패 - Rule ID: {}", ruleId, e);
        }
    }
    
    /**
     * 현재 신뢰도 조회
     */
    private BigDecimal getCurrentConfidence(Long ruleId, String ruleType) {
        // TODO: 실제 데이터베이스에서 조회하도록 구현
        return BigDecimal.valueOf(0.7); // 임시값
    }
    
    /**
     * 신뢰도 업데이트
     */
    private void updateConfidence(Long ruleId, String ruleType, BigDecimal newConfidence) {
        // TODO: 실제 데이터베이스 업데이트 구현
        log.debug("신뢰도 업데이트 - Rule ID: {}, Type: {}, Confidence: {}", 
                 ruleId, ruleType, newConfidence);
    }
    
    /**
     * 신뢰도 변경 이력 저장
     */
    private void saveConfidenceHistory(Long ruleId, String ruleType, 
                                     BigDecimal oldConfidence, BigDecimal newConfidence, 
                                     String reason, String adjustedBy) {
        // TODO: confidence_history 테이블에 저장
        log.debug("신뢰도 변경 이력 저장 - Rule ID: {}, {} -> {}, Reason: {}", 
                 ruleId, oldConfidence, newConfidence, reason);
    }
    
    /**
     * 사용자 피드백 히스토리 (임시 구현)
     */
    public static class UserFeedbackHistory {
        private Map<Long, Integer> acceptCounts;
        private Map<Long, Integer> rejectCounts;
        
        public int getAcceptCount(Long ruleId) {
            return acceptCounts != null ? acceptCounts.getOrDefault(ruleId, 0) : 0;
        }
        
        public int getRejectCount(Long ruleId) {
            return rejectCounts != null ? rejectCounts.getOrDefault(ruleId, 0) : 0;
        }
    }
}
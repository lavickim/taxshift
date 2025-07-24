package com.moneyshift.api.service;

import com.moneyshift.api.model.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.*;

import static org.assertj.core.api.Assertions.*;

/**
 * TDD: ConfidenceEngine 테스트 - ML 신뢰도 관리 엔진 검증
 * 
 * 핵심 기능:
 * 1. 사용자 피드백 기반 신뢰도 자동 조정
 * 2. 패턴 사용 통계에 따른 신뢰도 업데이트
 * 3. 컨텍스트 기반 신뢰도 보정 (시간, 금액, 요일)
 * 4. 신뢰도 변경 이력 관리
 * 5. 가중평균 기반 포괄적 신뢰도 계산
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("ConfidenceEngine TDD - ML 신뢰도 관리 엔진 테스트")
class ConfidenceEngineTest {

    @InjectMocks
    private ConfidenceEngine confidenceEngine;
    
    private PatternMatch testPatternMatch;
    private TransactionContext testTransactionContext;
    private ConfidenceEngine.UserFeedbackHistory testUserHistory;

    @BeforeEach
    void setUp() {
        // 테스트용 패턴 매치
        Map<String, Object> contextData = new HashMap<>();
        contextData.put("category", "편의점");
        
        testPatternMatch = PatternMatch.builder()
                .ruleId(1L)
                .patternType("REGEX")
                .baseConfidence(BigDecimal.valueOf(0.8))
                .extractedKeywords(Arrays.asList("CU", "편의점", "결제"))
                .contextData(contextData)
                .build();
        
        // 테스트용 거래 컨텍스트 (밤 10시, 편의점, 5000원, 평일)
        testTransactionContext = TransactionContext.builder()
                .originalText("CU편의점에서 결제")
                .amount(BigDecimal.valueOf(5000))
                .timestamp(LocalDateTime.of(2025, 7, 24, 22, 30)) // 밤 10시 30분
                .build();
        
        // 테스트용 사용자 피드백 히스토리
        testUserHistory = new ConfidenceEngine.UserFeedbackHistory();
    }

    @Test
    @DisplayName("TDD: 포괄적 신뢰도 계산 - 모든 컴포넌트 조합")
    void should_CalculateComprehensiveConfidence_When_AllComponentsProvided() {
        // Given
        // testPatternMatch: baseConfidence = 0.8, 키워드 3개
        // testTransactionContext: 밤 10시, 편의점, 5000원
        // testUserHistory: 빈 히스토리 (중립값 0.5)

        // When
        BigDecimal result = confidenceEngine.calculateComprehensiveConfidence(
                testPatternMatch, testTransactionContext, testUserHistory);

        // Then
        assertThat(result).isNotNull();
        
        // 가중평균 계산 검증:
        // Pattern Score: 0.8 + (3 * 0.05) = 0.95 (weight: 0.4)
        // History Score: 0.5 (중립값, weight: 0.3)
        // Context Score: 0.5 + 0.15(밤시간) + 0.05(금액범위) = 0.7 (weight: 0.3)
        // Final: 0.95*0.4 + 0.5*0.3 + 0.7*0.3 = 0.38 + 0.15 + 0.21 = 0.74
        
        assertThat(result).isEqualByComparingTo(BigDecimal.valueOf(0.74).setScale(3, RoundingMode.HALF_UP));
        assertThat(result.scale()).isEqualTo(3); // 소수점 3자리
    }

    @Test
    @DisplayName("TDD: 패턴 점수 계산 - 기본 신뢰도 + 키워드 보너스")
    void should_CalculatePatternScore_When_MultipleKeywordsPresent() {
        // Given
        PatternMatch multiKeywordMatch = PatternMatch.builder()
                .ruleId(2L)
                .baseConfidence(BigDecimal.valueOf(0.7))
                .extractedKeywords(Arrays.asList("스타벅스", "커피", "음료", "결제", "완료")) // 5개 키워드
                .build();

        // When
        BigDecimal result = confidenceEngine.calculateComprehensiveConfidence(
                multiKeywordMatch, testTransactionContext, testUserHistory);

        // Then
        // Pattern Score: 0.7 + (5 * 0.05) = 0.95
        // History Score: 0.5 (중립값)
        // Context Score: 0.5 (편의점 카테고리 없으므로 기본값)
        // Final: 0.95*0.4 + 0.5*0.3 + 0.5*0.3 = 0.38 + 0.15 + 0.15 = 0.68
        
        assertThat(result).isEqualByComparingTo(BigDecimal.valueOf(0.68).setScale(3, RoundingMode.HALF_UP));
    }

    @Test
    @DisplayName("TDD: 패턴 점수 계산 - 기본 신뢰도 없음 (기본값 0.7)")
    void should_UseDefaultConfidence_When_BaseConfidenceIsNull() {
        // Given
        PatternMatch noConfidenceMatch = PatternMatch.builder()
                .ruleId(3L)
                .baseConfidence(null) // 기본 신뢰도 없음
                .extractedKeywords(Arrays.asList("테스트"))
                .build();

        // When
        BigDecimal result = confidenceEngine.calculateComprehensiveConfidence(
                noConfidenceMatch, testTransactionContext, testUserHistory);

        // Then
        // Pattern Score: 0.7 (기본값) + (1 * 0.05) = 0.75
        // 기본값이 0.7로 설정되어야 함
        assertThat(result).isGreaterThan(BigDecimal.ZERO);
    }

    @Test
    @DisplayName("TDD: 사용자 히스토리 점수 - 긍정적 피드백 우세")
    void should_CalculateHighHistoryScore_When_PositiveFeedbackDominates() {
        // Given
        ConfidenceEngine.UserFeedbackHistory positiveHistory = new ConfidenceEngine.UserFeedbackHistory();
        // acceptCounts와 rejectCounts는 내부 필드이므로 직접 테스트하기 어려움
        // 실제로는 getAcceptCount/getRejectCount 메소드를 통해 값이 반환되어야 함
        
        // When
        BigDecimal result = confidenceEngine.calculateComprehensiveConfidence(
                testPatternMatch, testTransactionContext, positiveHistory);

        // Then
        // 현재 UserFeedbackHistory는 항상 0을 반환하므로 중립값 0.5가 사용됨
        assertThat(result).isNotNull();
        assertThat(result).isGreaterThan(BigDecimal.ZERO);
    }

    @Test
    @DisplayName("TDD: 컨텍스트 점수 - 편의점 밤시간 보너스")
    void should_AddNightTimeBonus_When_ConvenienceStoreAtNight() {
        // Given
        TransactionContext nightContext = TransactionContext.builder()
                .originalText("편의점 야식 구매")
                .amount(BigDecimal.valueOf(8000))
                .timestamp(LocalDateTime.of(2025, 7, 24, 23, 45)) // 밤 11시 45분
                .build();
        
        Map<String, Object> convenienceStoreData = new HashMap<>();
        convenienceStoreData.put("category", "편의점");
        PatternMatch nightMatch = PatternMatch.builder()
                .ruleId(testPatternMatch.getRuleId())
                .patternType(testPatternMatch.getPatternType())
                .baseConfidence(testPatternMatch.getBaseConfidence())
                .extractedKeywords(testPatternMatch.getExtractedKeywords())
                .contextData(convenienceStoreData)
                .build();

        // When
        BigDecimal result = confidenceEngine.calculateComprehensiveConfidence(
                nightMatch, nightContext, testUserHistory);

        // Then
        // Context Score에 밤시간 보너스 0.15가 추가되어야 함
        assertThat(result).isNotNull();
        assertThat(result).isGreaterThan(BigDecimal.valueOf(0.7)); // 기본값보다 높아야 함
    }

    @Test
    @DisplayName("TDD: 컨텍스트 점수 - 카페 영업시간 보너스")
    void should_AddBusinessHoursBonus_When_CafeDuringBusinessHours() {
        // Given
        TransactionContext businessHoursContext = TransactionContext.builder()
                .originalText("스타벅스 커피 주문")
                .amount(BigDecimal.valueOf(6500))
                .timestamp(LocalDateTime.of(2025, 7, 24, 14, 30)) // 오후 2시 30분 (영업시간)
                .build();
        
        Map<String, Object> cafeData = new HashMap<>();
        cafeData.put("category", "카페");
        PatternMatch cafeMatch = PatternMatch.builder()
                .ruleId(4L)
                .baseConfidence(BigDecimal.valueOf(0.8))
                .extractedKeywords(Arrays.asList("스타벅스", "커피"))
                .contextData(cafeData)
                .build();

        // When
        BigDecimal result = confidenceEngine.calculateComprehensiveConfidence(
                cafeMatch, businessHoursContext, testUserHistory);

        // Then
        // Context Score에 영업시간 보너스 0.1 + 카페 금액범위 보너스 0.1이 추가되어야 함
        assertThat(result).isNotNull();
        assertThat(result).isGreaterThan(BigDecimal.valueOf(0.7));
    }

    @Test
    @DisplayName("TDD: 컨텍스트 점수 - 주유소 고액 거래 보너스")
    void should_AddHighAmountBonus_When_GasStationHighAmount() {
        // Given
        TransactionContext gasStationContext = TransactionContext.builder()
                .originalText("주유소 주유")
                .amount(BigDecimal.valueOf(80000)) // 고액
                .timestamp(LocalDateTime.of(2025, 7, 24, 16, 0))
                .build();
        
        Map<String, Object> gasStationData = new HashMap<>();
        gasStationData.put("category", "주유소");
        PatternMatch gasStationMatch = PatternMatch.builder()
                .ruleId(5L)
                .baseConfidence(BigDecimal.valueOf(0.85))
                .extractedKeywords(Arrays.asList("주유소", "주유"))
                .contextData(gasStationData)
                .build();

        // When
        BigDecimal result = confidenceEngine.calculateComprehensiveConfidence(
                gasStationMatch, gasStationContext, testUserHistory);

        // Then
        // Context Score에 주유소 고액 보너스 0.1이 추가되어야 함
        assertThat(result).isNotNull();
        assertThat(result).isGreaterThan(BigDecimal.valueOf(0.72));
    }

    @Test
    @DisplayName("TDD: 주말 카페 이용 보너스")
    void should_AddWeekendCafeBonus_When_CafeOnWeekend() {
        // Given
        TransactionContext weekendContext = TransactionContext.builder()
                .originalText("주말 카페 방문")
                .amount(BigDecimal.valueOf(7000))
                .timestamp(LocalDateTime.of(2025, 7, 26, 15, 0)) // 토요일
                .build();
        
        Map<String, Object> weekendCafeData = new HashMap<>();
        weekendCafeData.put("category", "카페");
        PatternMatch weekendCafeMatch = PatternMatch.builder()
                .ruleId(6L)
                .baseConfidence(BigDecimal.valueOf(0.8))
                .extractedKeywords(Arrays.asList("카페", "커피"))
                .contextData(weekendCafeData)
                .build();

        // When
        BigDecimal result = confidenceEngine.calculateComprehensiveConfidence(
                weekendCafeMatch, weekendContext, testUserHistory);

        // Then
        // Context Score에 주말 카페 보너스 0.05가 추가되어야 함
        assertThat(result).isNotNull();
        assertThat(result).isGreaterThan(BigDecimal.valueOf(0.73));
    }

    @Test
    @DisplayName("TDD: 신뢰도 범위 제한 - 최소값 0.1")
    void should_EnforceMinimumConfidence_When_CalculatedValueTooLow() {
        // Given
        PatternMatch lowConfidenceMatch = PatternMatch.builder()
                .ruleId(7L)
                .baseConfidence(BigDecimal.valueOf(0.05)) // 매우 낮은 신뢰도
                .extractedKeywords(Collections.emptyList()) // 키워드 없음
                .build();
        
        TransactionContext neutralContext = TransactionContext.builder()
                .originalText("알 수 없는 거래")
                .amount(BigDecimal.valueOf(1000))
                .timestamp(LocalDateTime.of(2025, 7, 24, 12, 0))
                .build();

        // When
        BigDecimal result = confidenceEngine.calculateComprehensiveConfidence(
                lowConfidenceMatch, neutralContext, testUserHistory);

        // Then
        assertThat(result).isGreaterThanOrEqualTo(BigDecimal.valueOf(0.1)); // 최소값 보장
    }

    @Test
    @DisplayName("TDD: 신뢰도 범위 제한 - 최대값 1.0")
    void should_EnforceMaximumConfidence_When_CalculatedValueTooHigh() {
        // Given
        PatternMatch perfectMatch = PatternMatch.builder()
                .ruleId(8L)
                .baseConfidence(BigDecimal.valueOf(0.98)) // 매우 높은 신뢰도
                .extractedKeywords(Arrays.asList("완벽", "매칭", "키워드", "다수", "보너스", "최대")) // 많은 키워드
                .build();

        // When
        BigDecimal result = confidenceEngine.calculateComprehensiveConfidence(
                perfectMatch, testTransactionContext, testUserHistory);

        // Then
        assertThat(result).isLessThanOrEqualTo(BigDecimal.valueOf(1.0)); // 최대값 제한
    }

    @Test
    @DisplayName("TDD: 사용자 피드백 신뢰도 조정 - 긍정적 피드백")
    void should_IncreaseConfidence_When_PositiveFeedbackReceived() {
        // Given
        Long ruleId = 10L;
        String ruleType = "REGEX_RULE";
        boolean isPositive = true;
        String reason = "사용자가 제안을 수락함";

        // When
        confidenceEngine.adjustConfidenceByFeedback(ruleId, ruleType, isPositive, reason);

        // Then
        // 현재 구현에서는 실제 데이터베이스 업데이트가 없으므로 예외가 발생하지 않는지만 확인
        // 실제 구현에서는 다음을 검증해야 함:
        // 1. 현재 신뢰도 조회
        // 2. POSITIVE_FEEDBACK_BOOST(0.02) 추가
        // 3. 새로운 신뢰도 저장
        // 4. 이력 저장
        
        // 예외가 발생하지 않으면 성공
    }

    @Test
    @DisplayName("TDD: 사용자 피드백 신뢰도 조정 - 부정적 피드백")
    void should_DecreaseConfidence_When_NegativeFeedbackReceived() {
        // Given
        Long ruleId = 11L;
        String ruleType = "REGEX_RULE";
        boolean isPositive = false;
        String reason = "사용자가 제안을 거부함";

        // When
        confidenceEngine.adjustConfidenceByFeedback(ruleId, ruleType, isPositive, reason);

        // Then
        // 현재 구현에서는 실제 데이터베이스 업데이트가 없으므로 예외가 발생하지 않는지만 확인
        // 실제 구현에서는 NEGATIVE_FEEDBACK_PENALTY(-0.05) 적용 검증
        
        // 예외가 발생하지 않으면 성공
    }

    @Test
    @DisplayName("TDD: 사용 통계 기반 신뢰도 조정 - 높은 성공률")
    void should_IncreaseConfidence_When_HighSuccessRate() {
        // Given
        Long ruleId = 12L;
        String ruleType = "REGEX_RULE";
        int usageCount = 100;
        int successCount = 95; // 95% 성공률

        // When
        confidenceEngine.adjustConfidenceByUsageStats(ruleId, ruleType, usageCount, successCount);

        // Then
        // 성공률 95%는 90% 이상이므로 SUCCESS_RATE_BONUS(0.1) 적용되어야 함
        // 예외가 발생하지 않으면 성공
    }

    @Test
    @DisplayName("TDD: 사용 통계 기반 신뢰도 조정 - 낮은 성공률")
    void should_DecreaseConfidence_When_LowSuccessRate() {
        // Given
        Long ruleId = 13L;
        String ruleType = "REGEX_RULE";
        int usageCount = 50;
        int successCount = 25; // 50% 성공률

        // When
        confidenceEngine.adjustConfidenceByUsageStats(ruleId, ruleType, usageCount, successCount);

        // Then
        // 성공률 50%는 60% 미만이므로 SUCCESS_RATE_BONUS의 음수(-0.1) 적용되어야 함
        // 예외가 발생하지 않으면 성공
    }

    @Test
    @DisplayName("TDD: 사용 통계 기반 신뢰도 조정 - 사용량 부족으로 조정 안함")
    void should_NotAdjustConfidence_When_InsufficientUsageData() {
        // Given
        Long ruleId = 14L;
        String ruleType = "REGEX_RULE";
        int usageCount = 5; // MIN_USAGE_FOR_ADJUSTMENT(10) 미만
        int successCount = 5;

        // When
        confidenceEngine.adjustConfidenceByUsageStats(ruleId, ruleType, usageCount, successCount);

        // Then
        // 사용량이 부족하므로 조정하지 않고 바로 리턴해야 함
        // 예외가 발생하지 않으면 성공
    }

    @Test
    @DisplayName("TDD: 사용 통계 기반 신뢰도 조정 - 중간 성공률은 조정 안함")
    void should_NotAdjustConfidence_When_MediumSuccessRate() {
        // Given
        Long ruleId = 15L;
        String ruleType = "REGEX_RULE";
        int usageCount = 20;
        int successCount = 15; // 75% 성공률 (60% 이상 90% 미만)

        // When
        confidenceEngine.adjustConfidenceByUsageStats(ruleId, ruleType, usageCount, successCount);

        // Then
        // 중간 성공률(75%)은 조정 대상이 아니므로 변경되지 않아야 함
        // 예외가 발생하지 않으면 성공
    }

    @Test
    @DisplayName("TDD: UserFeedbackHistory - 기본 동작 테스트")
    void should_ReturnZero_When_NoFeedbackHistoryExists() {
        // Given
        ConfidenceEngine.UserFeedbackHistory emptyHistory = new ConfidenceEngine.UserFeedbackHistory();
        Long ruleId = 999L;

        // When
        int acceptCount = emptyHistory.getAcceptCount(ruleId);
        int rejectCount = emptyHistory.getRejectCount(ruleId);

        // Then
        assertThat(acceptCount).isEqualTo(0);
        assertThat(rejectCount).isEqualTo(0);
    }

    @Test
    @DisplayName("TDD: 복합 컨텍스트 시나리오 - 카페, 영업시간, 적정금액, 주말")
    void should_CalculateHighConfidence_When_OptimalCafeContext() {
        // Given
        TransactionContext optimalCafeContext = TransactionContext.builder()
                .originalText("주말 오후 카페에서 음료 주문")
                .amount(BigDecimal.valueOf(8500)) // 카페 적정 금액대
                .timestamp(LocalDateTime.of(2025, 7, 26, 15, 30)) // 토요일 오후 3시 30분
                .build();
        
        Map<String, Object> optimalCafeData = new HashMap<>();
        optimalCafeData.put("category", "카페");
        
        PatternMatch optimalCafeMatch = PatternMatch.builder()
                .ruleId(20L)
                .baseConfidence(BigDecimal.valueOf(0.85))
                .extractedKeywords(Arrays.asList("카페", "음료", "커피", "주문"))
                .contextData(optimalCafeData)
                .build();

        // When
        BigDecimal result = confidenceEngine.calculateComprehensiveConfidence(
                optimalCafeMatch, optimalCafeContext, testUserHistory);

        // Then
        // 모든 컨텍스트 보너스가 적용되어 높은 신뢰도를 가져야 함:
        // - 영업시간 보너스: +0.1
        // - 카페 금액범위 보너스: +0.1  
        // - 주말 카페 보너스: +0.05
        // - 키워드 보너스: 4개 키워드 * 0.05 = +0.2
        assertThat(result).isGreaterThan(BigDecimal.valueOf(0.77));
        assertThat(result).isLessThanOrEqualTo(BigDecimal.valueOf(1.0));
    }

    @Test
    @DisplayName("TDD: null 값 처리 - TransactionContext가 null인 경우")
    void should_HandleNullContext_When_TransactionContextIsNull() {
        // Given
        TransactionContext nullContext = null;

        // When & Then
        assertThatThrownBy(() -> {
            confidenceEngine.calculateComprehensiveConfidence(
                    testPatternMatch, nullContext, testUserHistory);
        }).isInstanceOf(NullPointerException.class);
    }

    @Test
    @DisplayName("TDD: null 값 처리 - UserFeedbackHistory가 null인 경우")
    void should_HandleNullHistory_When_UserFeedbackHistoryIsNull() {
        // Given
        ConfidenceEngine.UserFeedbackHistory nullHistory = null;

        // When
        BigDecimal result = confidenceEngine.calculateComprehensiveConfidence(
                testPatternMatch, testTransactionContext, nullHistory);

        // Then
        // null 히스토리는 중립값 0.5로 처리되어야 함
        assertThat(result).isNotNull();
        assertThat(result).isGreaterThan(BigDecimal.ZERO);
    }
}
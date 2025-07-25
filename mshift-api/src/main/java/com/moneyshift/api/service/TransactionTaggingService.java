package com.moneyshift.api.service;

import com.moneyshift.api.model.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * 거래 자동 태깅 통합 서비스
 * 
 * 4계층 처리 아키텍처:
 * Layer 0: Redis 캐시 (즉시 응답)
 * Layer 1: Regex 패턴 매칭 (95% 정확도 목표)
 * Layer 2: ML 추론 (향후 통합 예정)
 * Layer 3: LLM 폴백 (Gemini AI) - ⚠️ TODO: 아직 미구현 (Claude가 표시)
 * 
 * 처리 흐름:
 * 1. 캐시 조회 → 2. 키워드 추출 → 3. 태그 매칭 → 4. 계정과목 도출 → 5. 사용자 질문 (필요시)
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class TransactionTaggingService {
    
    private final KeywordExtractionEngine keywordEngine;
    private final ConfidenceEngine confidenceEngine;
    // private final RuleEngineService ruleEngineService; // TODO: 제거된 서비스
    
    // 신뢰도 임계값
    private static final BigDecimal AUTO_APPROVE_THRESHOLD = BigDecimal.valueOf(0.90);
    private static final BigDecimal QUESTION_THRESHOLD = BigDecimal.valueOf(0.70);
    
    /**
     * 거래 텍스트 자동 태깅 메인 메서드
     */
    public TransactionTaggingResult processTransaction(TransactionTaggingRequest request) {
        log.info("거래 태깅 시작: {}", request.getTransactionText());
        
        TransactionTaggingResult result = TransactionTaggingResult.builder()
                .originalText(request.getTransactionText())
                .amount(request.getAmount())
                .timestamp(request.getTimestamp())
                .processingLayers(new ArrayList<>())
                .build();
        
        try {
            // Layer 0: 캐시 조회
            TransactionTaggingResult cachedResult = checkCache(request);
            if (cachedResult != null) {
                result = cachedResult;
                result.setProcessingPath("CACHE_HIT");
                result.setProcessingTimeMs(System.currentTimeMillis() - result.getStartTime());
                log.info("캐시 히트: {}", request.getTransactionText());
                return result;
            }
            
            // Layer 1: 키워드 추출 및 패턴 매칭
            LayerProcessingResult layer1Result = processLayer1(request);
            result.getProcessingLayers().add(layer1Result);
            
            if (layer1Result.isSuccessful() && layer1Result.getFinalConfidence().compareTo(AUTO_APPROVE_THRESHOLD) >= 0) {
                // 높은 신뢰도로 자동 승인
                result = buildResultFromLayer1(layer1Result, request);
                result.setProcessingPath("REGEX_AUTO_APPROVE");
                result.setRequiresUserQuestion(false);
            } else if (layer1Result.isSuccessful() && layer1Result.getFinalConfidence().compareTo(QUESTION_THRESHOLD) >= 0) {
                // 중간 신뢰도 - 사용자 질문 필요
                result = buildResultFromLayer1(layer1Result, request);
                result.setProcessingPath("REGEX_WITH_QUESTION");
                result.setRequiresUserQuestion(true);
                result.setUserQuestion(generateUserQuestion(layer1Result));
            } else {
                // Layer 2: ML 추론 (향후 구현)
                LayerProcessingResult layer2Result = processLayer2(request);
                result.getProcessingLayers().add(layer2Result);
                
                if (layer2Result.isSuccessful()) {
                    result = buildResultFromLayer2(layer2Result, request);
                    result.setProcessingPath("ML_INFERENCE");
                } else {
                    // Layer 3: LLM 폴백 - ⚠️ TODO: 아직 미구현 (Claude가 표시)
                    LayerProcessingResult layer3Result = processLayer3(request);
                    result.getProcessingLayers().add(layer3Result);
                    
                    // ⚠️ 주의: LLM 미구현으로 빈 결과 반환 (Claude가 표시)
                    result = buildResultFromLayer3(layer3Result, request);
                    result.setProcessingPath("LLM_FALLBACK");
                }
            }
            
            // 결과 캐싱
            cacheResult(request, result);
            
            // 사용 통계 업데이트
            updateUsageStats(result);
            
            result.setProcessingTimeMs(System.currentTimeMillis() - result.getStartTime());
            
            log.info("거래 태깅 완료: {} -> {}, 신뢰도: {}, 경로: {}", 
                    request.getTransactionText(), 
                    result.getSuggestedTags(), 
                    result.getFinalConfidence(), 
                    result.getProcessingPath());
            
            return result;
            
        } catch (Exception e) {
            log.error("거래 태깅 중 오류 발생", e);
            return buildErrorResult(request, e);
        }
    }
    
    /**
     * Layer 0: 캐시 조회
     */
    private TransactionTaggingResult checkCache(TransactionTaggingRequest request) {
        // TODO: Redis에서 해시 기반 캐시 조회 구현
        return null;
    }
    
    /**
     * Layer 1: 키워드 추출 및 정규식 패턴 매칭
     */
    private LayerProcessingResult processLayer1(TransactionTaggingRequest request) {
        log.debug("Layer 1 처리 시작: 키워드 추출 및 패턴 매칭");
        
        long startTime = System.currentTimeMillis();
        
        try {
            // 키워드 추출 및 패턴 매칭
            LayerProcessingResult keywordResult = keywordEngine.extractAndMatch(
                    request.getTransactionText(), 
                    request.getAmount(), 
                    request.getTimestamp());
            
            // 기존 PatternMatch 리스트 생성 (호환성을 위해)
            List<PatternMatch> matches = keywordResult.getAllMatches() != null ? 
                    keywordResult.getAllMatches() : new ArrayList<>();
            
            if (matches.isEmpty()) {
                return LayerProcessingResult.builder()
                        .layerName("REGEX_PATTERN_MATCHING")
                        .successful(false)
                        .processingTimeMs(System.currentTimeMillis() - startTime)
                        .reason("No pattern matches found")
                        .build();
            }
            
            // 최고 신뢰도 매치 선택
            PatternMatch bestMatch = matches.get(0);
            
            // 신뢰도 재계산 (사용자 히스토리 포함)
            ConfidenceEngine.UserFeedbackHistory userHistory = getUserFeedbackHistory(request.getUserId());
            TransactionContext context = buildTransactionContext(request);
            BigDecimal finalConfidence = confidenceEngine.calculateComprehensiveConfidence(
                    bestMatch, context, userHistory);
            
            return LayerProcessingResult.builder()
                    .layerName("REGEX_PATTERN_MATCHING")
                    .successful(true)
                    .finalConfidence(finalConfidence)
                    .primaryTag(bestMatch.getPrimaryTag())
                    .primaryAccount(bestMatch.getPrimaryAccount())
                    .secondaryTag(bestMatch.getSecondaryTag())
                    .secondaryAccount(bestMatch.getSecondaryAccount())
                    .extractedKeywords(bestMatch.getExtractedKeywords())
                    .matchedPattern(bestMatch.getMatchedPattern())
                    .ruleId(bestMatch.getRuleId())
                    .processingTimeMs(System.currentTimeMillis() - startTime)
                    .allMatches(matches)
                    .build();
            
        } catch (Exception e) {
            log.error("Layer 1 처리 중 오류", e);
            return LayerProcessingResult.builder()
                    .layerName("REGEX_PATTERN_MATCHING")
                    .successful(false)
                    .processingTimeMs(System.currentTimeMillis() - startTime)
                    .reason("Error: " + e.getMessage())
                    .build();
        }
    }
    
    /**
     * Layer 2: ML 추론 (향후 구현)
     */
    private LayerProcessingResult processLayer2(TransactionTaggingRequest request) {
        log.debug("Layer 2 처리: ML 추론 (현재 미구현)");
        
        return LayerProcessingResult.builder()
                .layerName("ML_INFERENCE")
                .successful(false)
                .reason("ML inference not yet implemented")
                .processingTimeMs(0L)
                .build();
    }
    
    /**
     * Layer 3: LLM 폴백 (Gemini AI)
     * ⚠️ TODO: 아직 미구현 - Gemini AI 연동 필요 (Claude가 표시)
     * 
     * 향후 구현 예정 기능:
     * 1. Gemini AI API 호출
     * 2. 자연어 기반 거래 분류
     * 3. 비정형 텍스트 패턴 매칭
     * 4. 컴텍스트 기반 계정과목 추천
     */
    private LayerProcessingResult processLayer3(TransactionTaggingRequest request) {
        log.debug("Layer 3 처리: LLM 폴백 (현재 미구현) - Claude가 표시");
        
        // ⚠️ 주의: LLM 미구현으로 빈 결과 반환 (Claude가 표시)
        return LayerProcessingResult.builder()
                .layerName("LLM_FALLBACK")
                .successful(false)
                .reason("⚠️ LLM fallback not yet implemented - Gemini AI integration needed (Claude marked)")
                .processingTimeMs(0L)
                .build();
    }
    
    /**
     * Layer 1 결과로부터 최종 결과 구성
     */
    private TransactionTaggingResult buildResultFromLayer1(LayerProcessingResult layer1, TransactionTaggingRequest request) {
        return TransactionTaggingResult.builder()
                .originalText(request.getTransactionText())
                .amount(request.getAmount())
                .timestamp(request.getTimestamp())
                .suggestedTags(Arrays.asList(layer1.getPrimaryTag(), layer1.getSecondaryTag())
                        .stream().filter(Objects::nonNull).collect(Collectors.toList()))
                .suggestedAccounts(Arrays.asList(layer1.getPrimaryAccount(), layer1.getSecondaryAccount())
                        .stream().filter(Objects::nonNull).collect(Collectors.toList()))
                .finalConfidence(layer1.getFinalConfidence())
                .extractedKeywords(layer1.getExtractedKeywords())
                .matchedPattern(layer1.getMatchedPattern())
                .ruleId(layer1.getRuleId())
                .processingLayers(new ArrayList<>())
                .startTime(System.currentTimeMillis())
                .build();
    }
    
    /**
     * Layer 2 결과로부터 최종 결과 구성 (향후 구현)
     */
    private TransactionTaggingResult buildResultFromLayer2(LayerProcessingResult layer2, TransactionTaggingRequest request) {
        // TODO: ML 결과 기반 결과 구성
        return buildErrorResult(request, new RuntimeException("Layer 2 not implemented"));
    }
    
    /**
     * Layer 3 결과로부터 최종 결과 구성
     * ⚠️ TODO: LLM 미구현으로 빈 결과 반환 (Claude가 표시)
     * 
     * 향후 구현 예정:
     * - Gemini AI 응답에서 태그와 계정과목 추출
     * - 신뢰도 점수 산정
     * - 사용자 질문 여부 결정
     */
    private TransactionTaggingResult buildResultFromLayer3(LayerProcessingResult layer3, TransactionTaggingRequest request) {
        // ⚠️ 주의: LLM 미구현으로 빈 결과 반환 (Claude가 표시)
        return buildErrorResult(request, new RuntimeException("⚠️ Layer 3 (LLM) not implemented - Gemini AI integration needed (Claude marked)"));
    }
    
    /**
     * 사용자 질문 생성
     */
    private UserQuestion generateUserQuestion(LayerProcessingResult layer1) {
        // TODO: user_questions 테이블에서 적절한 질문 조회
        return UserQuestion.builder()
                .questionText("이 거래의 목적을 선택해주세요.")
                .questionType("SINGLE_CHOICE")
                .build();
    }
    
    /**
     * 거래 컨텍스트 구성
     */
    private TransactionContext buildTransactionContext(TransactionTaggingRequest request) {
        return TransactionContext.builder()
                .originalText(request.getTransactionText())
                .amount(request.getAmount())
                .timestamp(request.getTimestamp())
                .build();
    }
    
    /**
     * 사용자 피드백 히스토리 조회
     */
    private ConfidenceEngine.UserFeedbackHistory getUserFeedbackHistory(String userId) {
        // TODO: 실제 사용자 피드백 데이터 조회
        return new ConfidenceEngine.UserFeedbackHistory();
    }
    
    /**
     * 결과 캐싱
     */
    private void cacheResult(TransactionTaggingRequest request, TransactionTaggingResult result) {
        // TODO: Redis에 결과 캐싱
        log.debug("결과 캐싱: {}", request.getTransactionText());
    }
    
    /**
     * 사용 통계 업데이트
     */
    private void updateUsageStats(TransactionTaggingResult result) {
        if (result.getRuleId() != null) {
            // TODO: ruleEngineService.updateRuleUsageStats(result.getRuleId(), result.getFinalConfidence().compareTo(QUESTION_THRESHOLD) >= 0);
            log.debug("룰 사용 통계 업데이트 필요: ruleId={}", result.getRuleId());
        }
    }
    
    /**
     * 오류 결과 구성
     */
    private TransactionTaggingResult buildErrorResult(TransactionTaggingRequest request, Exception e) {
        return TransactionTaggingResult.builder()
                .originalText(request.getTransactionText())
                .amount(request.getAmount())
                .timestamp(request.getTimestamp())
                .processingPath("ERROR")
                .finalConfidence(BigDecimal.ZERO)
                .suggestedTags(Collections.emptyList())
                .suggestedAccounts(Collections.emptyList())
                .errorMessage(e.getMessage())
                .processingTimeMs(0L)
                .processingLayers(new ArrayList<>())
                .startTime(System.currentTimeMillis())
                .build();
    }
    
    /**
     * 사용자 피드백 처리
     */
    public void processFeedback(Long transactionId, String feedbackType, String selectedTag, String selectedAccount) {
        log.info("사용자 피드백 처리: Transaction={}, Type={}, Tag={}, Account={}", 
                transactionId, feedbackType, selectedTag, selectedAccount);
        
        try {
            // TODO: 거래 로그에서 사용된 룰 ID 조회
            Long ruleId = getRuleIdFromTransaction(transactionId);
            if (ruleId != null) {
                boolean isPositive = "ACCEPT".equals(feedbackType) || "MODIFY".equals(feedbackType);
                confidenceEngine.adjustConfidenceByFeedback(ruleId, "REGEX_RULE", isPositive, feedbackType);
            }
            
            // TODO: 피드백 데이터 저장
            
        } catch (Exception e) {
            log.error("피드백 처리 중 오류", e);
        }
    }
    
    /**
     * 거래에서 사용된 룰 ID 조회
     */
    private Long getRuleIdFromTransaction(Long transactionId) {
        // TODO: transaction_logs 테이블에서 룰 ID 조회
        return null;
    }
}
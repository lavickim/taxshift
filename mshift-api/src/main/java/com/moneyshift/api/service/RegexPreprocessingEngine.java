package com.moneyshift.api.service;

import com.moneyshift.api.mapper.RegexPreprocessingMapper;
import com.moneyshift.api.model.RegexPreprocessingRule;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.regex.PatternSyntaxException;

/**
 * 정규식 기반 전처리 엔진
 * 거래 문자열을 정규화하여 키워드 매칭에 최적화된 형태로 변환
 * 
 * 처리 흐름:
 * 1. 거래 원문 수신
 * 2. 우선순위 순으로 정규식 패턴 매칭
 * 3. 매칭된 패턴의 출력 템플릿 적용
 * 4. 메타데이터 추출
 * 5. 정규화된 텍스트 반환 → KeywordExtractionEngine으로 전달
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class RegexPreprocessingEngine {
    
    private final RegexPreprocessingMapper regexPreprocessingMapper;
    private final RedisCacheService redisCacheService;
    
    // 컴파일된 정규식 패턴 캐시 (성능 최적화)
    private final Map<Long, Pattern> compiledPatterns = new ConcurrentHashMap<>();
    
    // 규칙 캐시 (DB 조회 최소화)
    private List<RegexPreprocessingRule> cachedRules;
    private volatile long lastCacheUpdate = 0;
    private static final long CACHE_TTL_MS = 5 * 60 * 1000; // 5분
    
    /**
     * 서비스 초기화 - 규칙 로드 및 패턴 컴파일
     */
    @PostConstruct
    public void initialize() {
        log.info("정규식 전처리 엔진 초기화 중...");
        refreshRules();
        log.info("정규식 전처리 엔진 초기화 완료. 활성 규칙 수: {}", cachedRules.size());
    }
    
    /**
     * 메인 전처리 메서드
     * 거래 원문을 정규화된 텍스트로 변환
     */
    public PreprocessingResult preprocess(String originalText) {
        if (originalText == null) {
            return PreprocessingResult.builder()
                    .originalText(originalText)
                    .normalizedText("")
                    .success(true)
                    .processingTimeMs(0L)
                    .build();
        }
        
        if (originalText.trim().isEmpty()) {
            return PreprocessingResult.builder()
                    .originalText(originalText)
                    .normalizedText("")
                    .success(true)
                    .processingTimeMs(0L)
                    .build();
        }
        
        long startTime = System.currentTimeMillis();
        
        try {
            // 1. 캐시 확인
            String cacheKey = "regex_preprocess:" + originalText.hashCode();
            PreprocessingResult cachedResult = getCachedResult(cacheKey);
            if (cachedResult != null) {
                log.debug("캐시에서 전처리 결과 반환: {}", originalText);
                return cachedResult;
            }
            
            // 2. 캐시된 규칙 새로고침 (필요시)
            refreshRulesIfNeeded();
            
            // 3. 정규식 패턴 매칭 수행
            PreprocessingResult result = performPatternMatching(originalText);
            result.setProcessingTimeMs(System.currentTimeMillis() - startTime);
            
            // 4. 결과 캐싱
            cacheResult(cacheKey, result);
            
            // 5. 사용 통계 업데이트 (비동기)
            if (result.getAppliedRuleId() != null) {
                updateUsageStatsAsync(result.getAppliedRuleId(), result.isSuccess());
            }
            
            log.debug("전처리 완료: {} -> {} ({}ms)", 
                    originalText, result.getNormalizedText(), result.getProcessingTimeMs());
            
            return result;
            
        } catch (Exception e) {
            log.error("전처리 중 오류 발생: {}", originalText, e);
            return PreprocessingResult.builder()
                    .originalText(originalText)
                    .normalizedText(originalText) // 실패 시 원본 반환
                    .success(false)
                    .errorMessage(e.getMessage())
                    .processingTimeMs(System.currentTimeMillis() - startTime)
                    .build();
        }
    }
    
    /**
     * 패턴 매칭 수행
     */
    private PreprocessingResult performPatternMatching(String originalText) {
        String currentText = originalText.trim();
        RegexPreprocessingRule matchedRule = null;
        Map<String, Object> extractedMetadata = new HashMap<>();
        
        // 우선순위 순으로 규칙 적용
        for (RegexPreprocessingRule rule : cachedRules) {
            try {
                Pattern pattern = getCompiledPattern(rule);
                Matcher matcher = pattern.matcher(currentText);
                
                if (matcher.find()) {
                    // 패턴 매칭 성공
                    String normalizedText = applyOutputTemplate(matcher, rule.getOutputTemplate());
                    matchedRule = rule;
                    
                    // 메타데이터 추출
                    if (rule.getMetadataTags() != null) {
                        extractedMetadata.putAll(rule.getMetadataTags());
                    }
                    
                    log.debug("패턴 매칭 성공: {} -> {} (규칙: {})", 
                            originalText, normalizedText, rule.getRuleName());
                    
                    return PreprocessingResult.builder()
                            .originalText(originalText)
                            .normalizedText(normalizedText)
                            .appliedRuleId(rule.getId())
                            .appliedRuleName(rule.getRuleName())
                            .extractedMetadata(extractedMetadata)
                            .success(true)
                            .build();
                }
                
            } catch (Exception e) {
                log.warn("규칙 적용 중 오류: {} (규칙: {})", e.getMessage(), rule.getRuleName());
                continue; // 다음 규칙 시도
            }
        }
        
        // 매칭된 패턴이 없는 경우 원본 반환
        log.debug("매칭된 패턴 없음, 원본 반환: {}", originalText);
        return PreprocessingResult.builder()
                .originalText(originalText)
                .normalizedText(currentText) // trim된 텍스트 반환
                .success(true)
                .build();
    }
    
    /**
     * 출력 템플릿 적용
     */
    private String applyOutputTemplate(Matcher matcher, String outputTemplate) {
        String result = outputTemplate;
        
        // $1, $2, ... 그룹 치환
        for (int i = 0; i <= matcher.groupCount(); i++) {
            String group = matcher.group(i);
            if (group != null) {
                result = result.replace("$" + i, group);
            }
        }
        
        return result.trim();
    }
    
    /**
     * 컴파일된 패턴 가져오기 (캐시 활용)
     */
    private Pattern getCompiledPattern(RegexPreprocessingRule rule) {
        return compiledPatterns.computeIfAbsent(rule.getId(), id -> {
            try {
                return Pattern.compile(rule.getInputPattern(), Pattern.CASE_INSENSITIVE);
            } catch (PatternSyntaxException e) {
                log.error("잘못된 정규식 패턴: {} (규칙: {})", rule.getInputPattern(), rule.getRuleName());
                throw new RuntimeException("Invalid regex pattern: " + rule.getInputPattern(), e);
            }
        });
    }
    
    /**
     * 규칙 새로고침
     */
    public void refreshRules() {
        try {
            List<RegexPreprocessingRule> newRules = regexPreprocessingMapper.findAllActiveRules();
            this.cachedRules = newRules;
            this.lastCacheUpdate = System.currentTimeMillis();
            
            // 기존 컴파일된 패턴 캐시 클리어
            compiledPatterns.clear();
            
            log.info("정규식 규칙 새로고침 완료. 활성 규칙 수: {}", newRules.size());
            
        } catch (Exception e) {
            log.error("규칙 새로고침 중 오류", e);
        }
    }
    
    /**
     * 필요시 규칙 새로고침
     */
    private void refreshRulesIfNeeded() {
        if (System.currentTimeMillis() - lastCacheUpdate > CACHE_TTL_MS) {
            refreshRules();
        }
    }
    
    /**
     * 캐시된 결과 조회
     */
    private PreprocessingResult getCachedResult(String cacheKey) {
        try {
            // Redis에서 캐시된 결과 조회
            return redisCacheService.getPreprocessingResult(cacheKey);
        } catch (Exception e) {
            log.debug("캐시 조회 실패: {}", e.getMessage());
            return null;
        }
    }
    
    /**
     * 결과 캐싱
     */
    private void cacheResult(String cacheKey, PreprocessingResult result) {
        try {
            redisCacheService.savePreprocessingResult(cacheKey, result, 300); // 5분 TTL
        } catch (Exception e) {
            log.debug("캐시 저장 실패: {}", e.getMessage());
        }
    }
    
    /**
     * 사용 통계 비동기 업데이트
     */
    private void updateUsageStatsAsync(Long ruleId, boolean success) {
        // TODO: 비동기 처리 구현
        // 현재는 동기적으로 처리하되, 추후 @Async로 변경
        try {
            RegexPreprocessingRule rule = regexPreprocessingMapper.findById(ruleId);
            if (rule != null) {
                long newUsageCount = rule.getUsageCount() + 1;
                // 성공률 계산 로직은 추후 구현
                regexPreprocessingMapper.updateUsageStats(ruleId, newUsageCount, null);
            }
        } catch (Exception e) {
            log.debug("사용 통계 업데이트 실패: ruleId={}", ruleId, e);
        }
    }
    
    /**
     * 전처리 결과 클래스
     */
    public static class PreprocessingResult {
        private String originalText;
        private String normalizedText;
        private Long appliedRuleId;
        private String appliedRuleName;
        private Map<String, Object> extractedMetadata;
        private Long processingTimeMs;
        private boolean success;
        private String errorMessage;
        
        // Builder 패턴
        public static PreprocessingResultBuilder builder() {
            return new PreprocessingResultBuilder();
        }
        
        public static class PreprocessingResultBuilder {
            private PreprocessingResult result = new PreprocessingResult();
            
            public PreprocessingResultBuilder originalText(String originalText) {
                result.originalText = originalText;
                return this;
            }
            
            public PreprocessingResultBuilder normalizedText(String normalizedText) {
                result.normalizedText = normalizedText;
                return this;
            }
            
            public PreprocessingResultBuilder appliedRuleId(Long appliedRuleId) {
                result.appliedRuleId = appliedRuleId;
                return this;
            }
            
            public PreprocessingResultBuilder appliedRuleName(String appliedRuleName) {
                result.appliedRuleName = appliedRuleName;
                return this;
            }
            
            public PreprocessingResultBuilder extractedMetadata(Map<String, Object> extractedMetadata) {
                result.extractedMetadata = extractedMetadata;
                return this;
            }
            
            public PreprocessingResultBuilder processingTimeMs(Long processingTimeMs) {
                result.processingTimeMs = processingTimeMs;
                return this;
            }
            
            public PreprocessingResultBuilder success(boolean success) {
                result.success = success;
                return this;
            }
            
            public PreprocessingResultBuilder errorMessage(String errorMessage) {
                result.errorMessage = errorMessage;
                return this;
            }
            
            public PreprocessingResult build() {
                return result;
            }
        }
        
        // Getter methods
        public String getOriginalText() { return originalText; }
        public String getNormalizedText() { return normalizedText; }
        public Long getAppliedRuleId() { return appliedRuleId; }
        public String getAppliedRuleName() { return appliedRuleName; }
        public Map<String, Object> getExtractedMetadata() { return extractedMetadata; }
        public Long getProcessingTimeMs() { return processingTimeMs; }
        public boolean isSuccess() { return success; }
        public String getErrorMessage() { return errorMessage; }
        
        // Setter methods
        public void setProcessingTimeMs(Long processingTimeMs) { this.processingTimeMs = processingTimeMs; }
    }
}
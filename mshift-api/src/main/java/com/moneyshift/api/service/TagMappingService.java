package com.moneyshift.api.service;

import com.moneyshift.api.model.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

/**
 * 태그 매핑 관리 서비스
 * 
 * 기능:
 * 1. 키워드 그룹 → 태그 매핑 관리
 * 2. 태그 → 계정과목 매핑 관리
 * 3. 조건부 매핑 규칙 처리
 * 4. 매핑 우선순위 관리
 * 5. 매핑 통계 및 성능 분석
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class TagMappingService {
    
    private final RedisTemplate<String, Object> redisTemplate;
    private final KeywordGroupService keywordGroupService;
    private final KeywordTagMappingService keywordTagMappingService;
    private final TagAccountMappingService tagAccountMappingService;
    
    // 캐시 키 상수
    private static final String CACHE_KEY_KEYWORD_TAG_MAPPINGS = "mappings:keyword_tag:all";
    private static final String CACHE_KEY_TAG_ACCOUNT_MAPPINGS = "mappings:tag_account:all";
    private static final String CACHE_KEY_MAPPING_BY_KEYWORD_PREFIX = "mappings:keyword:";
    private static final String CACHE_KEY_MAPPING_BY_TAG_PREFIX = "mappings:tag:";
    private static final long CACHE_TTL_HOURS = 24;
    
    /**
     * 키워드 그룹에서 태그로의 매핑 조회
     */
    public List<KeywordTagMapping> findTagMappingsByKeywordGroup(Long keywordGroupId) {
        log.debug("키워드 그룹의 태그 매핑 조회: {}", keywordGroupId);
        
        String cacheKey = CACHE_KEY_MAPPING_BY_KEYWORD_PREFIX + keywordGroupId;
        
        @SuppressWarnings("unchecked")
        List<KeywordTagMapping> cachedMappings = (List<KeywordTagMapping>) redisTemplate.opsForValue()
                .get(cacheKey);
        
        if (cachedMappings != null) {
            return cachedMappings;
        }
        
        // 데이터베이스에서 조회
        List<KeywordTagMapping> mappings = keywordTagMappingService.findMappingsByKeywordGroup(keywordGroupId);
        
        // 캐시에 저장
        redisTemplate.opsForValue().set(cacheKey, mappings, CACHE_TTL_HOURS, TimeUnit.HOURS);
        
        return mappings;
    }
    
    /**
     * 모든 키워드-태그 매핑 조회
     */
    public List<KeywordTagMapping> findAllKeywordTagMappings() {
        log.debug("모든 키워드-태그 매핑 조회");
        
        String cacheKey = "all_keyword_tag_mappings";
        
        @SuppressWarnings("unchecked")
        List<KeywordTagMapping> cachedMappings = (List<KeywordTagMapping>) redisTemplate.opsForValue()
                .get(cacheKey);
        
        if (cachedMappings != null) {
            return cachedMappings;
        }
        
        // 데이터베이스에서 조회
        List<KeywordTagMapping> mappings = keywordTagMappingService.findAllActiveMappings();
        
        // 캐시에 저장
        redisTemplate.opsForValue().set(cacheKey, mappings, CACHE_TTL_HOURS, TimeUnit.HOURS);
        
        return mappings;
    }
    
    /**
     * 태그에서 계정과목으로의 매핑 조회
     */
    public List<TagAccountMapping> findAccountMappingsByTag(Long tagId) {
        log.debug("태그의 계정과목 매핑 조회: {}", tagId);
        
        String cacheKey = CACHE_KEY_MAPPING_BY_TAG_PREFIX + tagId;
        
        @SuppressWarnings("unchecked")
        List<TagAccountMapping> cachedMappings = (List<TagAccountMapping>) redisTemplate.opsForValue()
                .get(cacheKey);
        
        if (cachedMappings != null) {
            return cachedMappings;
        }
        
        // 데이터베이스에서 조회
        List<TagAccountMapping> mappings = tagAccountMappingService.findMappingsByTag(tagId);
        
        // 캐시에 저장
        redisTemplate.opsForValue().set(cacheKey, mappings, CACHE_TTL_HOURS, TimeUnit.HOURS);
        
        return mappings;
    }
    
    /**
     * 모든 태그-계정과목 매핑 조회
     */
    public List<TagAccountMapping> findAllTagAccountMappings() {
        log.debug("모든 태그-계정과목 매핑 조회");
        
        @SuppressWarnings("unchecked")
        List<TagAccountMapping> cachedMappings = (List<TagAccountMapping>) redisTemplate.opsForValue()
                .get(CACHE_KEY_TAG_ACCOUNT_MAPPINGS);
        
        if (cachedMappings != null) {
            return cachedMappings;
        }
        
        // 데이터베이스에서 조회
        List<TagAccountMapping> mappings = tagAccountMappingService.findAllMappings();
        
        // 캐시에 저장
        redisTemplate.opsForValue().set(CACHE_KEY_TAG_ACCOUNT_MAPPINGS, mappings, CACHE_TTL_HOURS, TimeUnit.HOURS);
        
        return mappings;
    }
    
    /**
     * 컨텍스트 기반 태그 추천
     */
    public List<TagRecommendation> recommendTags(String keyword, TransactionContext context) {
        log.debug("컨텍스트 기반 태그 추천: keyword={}, context={}", keyword, context);
        
        // 1. 키워드와 매칭되는 그룹 찾기
        List<KeywordGroup> matchingGroups = keywordGroupService.findGroupsByKeyword(keyword);
        
        if (matchingGroups.isEmpty()) {
            log.debug("매칭되는 키워드 그룹 없음: {}", keyword);
            return new ArrayList<>();
        }
        
        List<TagRecommendation> recommendations = new ArrayList<>();
        
        // 2. 각 그룹의 태그 매핑 조회 및 컨텍스트 평가
        for (KeywordGroup group : matchingGroups) {
            List<KeywordTagMapping> tagMappings = findTagMappingsByKeywordGroup(group.getId());
            
            for (KeywordTagMapping mapping : tagMappings) {
                if (!Boolean.TRUE.equals(mapping.getIsActive())) {
                    continue;
                }
                
                // 컨텍스트 규칙 확인
                BigDecimal contextScore = evaluateContextRules(mapping, context);
                BigDecimal finalConfidence = mapping.getConfidenceScore().add(contextScore);
                
                // 계정과목 매핑도 조회
                List<TagAccountMapping> accountMappings = findAccountMappingsByTag(mapping.getTagId());
                String recommendedAccount = selectBestAccount(accountMappings, context);
                
                TagRecommendation recommendation = TagRecommendation.builder()
                        .keywordGroup(group)
                        .tagMapping(mapping)
                        .finalConfidence(finalConfidence)
                        .recommendedAccount(recommendedAccount)
                        .contextScore(contextScore)
                        .reason(generateRecommendationReason(mapping, context))
                        .build();
                
                recommendations.add(recommendation);
            }
        }
        
        // 3. 신뢰도 기준 정렬
        recommendations.sort((a, b) -> b.getFinalConfidence().compareTo(a.getFinalConfidence()));
        
        log.debug("태그 추천 완료: {}개 추천", recommendations.size());
        return recommendations;
    }
    
    /**
     * 컨텍스트 규칙 평가
     */
    private BigDecimal evaluateContextRules(KeywordTagMapping mapping, TransactionContext context) {
        if (mapping.getContextRules() == null) {
            return BigDecimal.ZERO;
        }
        
        BigDecimal score = BigDecimal.ZERO;
        
        try {
            // TODO: JsonNode를 활용한 컨텍스트 규칙 평가 구현
            // 예시 규칙들:
            // - 시간 조건: {"time": "evening"} → context.isLateNight()
            // - 금액 조건: {"amount_min": 50000} → context.getAmount() >= 50000
            // - 요일 조건: {"weekend": true} → context.isWeekend()
            
            log.debug("컨텍스트 규칙 평가 완료: score={}", score);
            
        } catch (Exception e) {
            log.warn("컨텍스트 규칙 평가 중 오류", e);
        }
        
        return score;
    }
    
    /**
     * 최적 계정과목 선택
     */
    private String selectBestAccount(List<TagAccountMapping> accountMappings, TransactionContext context) {
        if (accountMappings.isEmpty()) {
            return null;
        }
        
        // 1. 조건부 매핑 우선 확인
        for (TagAccountMapping mapping : accountMappings) {
            if (mapping.getMappingCondition() != null) {
                boolean conditionMet = evaluateAccountCondition(mapping, context);
                if (conditionMet) {
                    return mapping.getAccountCode() + " (" + mapping.getAccountName() + ")";
                }
            }
        }
        
        // 2. 기본 매핑 사용
        TagAccountMapping defaultMapping = accountMappings.stream()
                .filter(mapping -> Boolean.TRUE.equals(mapping.getIsDefault()))
                .findFirst()
                .orElse(accountMappings.get(0)); // 첫 번째를 기본값으로
        
        return defaultMapping.getAccountCode() + " (" + defaultMapping.getAccountName() + ")";
    }
    
    /**
     * 계정과목 조건 평가
     */
    private boolean evaluateAccountCondition(TagAccountMapping mapping, TransactionContext context) {
        // TODO: JsonNode를 활용한 계정과목 조건 평가 구현
        return false;
    }
    
    /**
     * 추천 이유 생성
     */
    private String generateRecommendationReason(KeywordTagMapping mapping, TransactionContext context) {
        StringBuilder reason = new StringBuilder();
        
        reason.append("키워드 매칭 (신뢰도: ").append(mapping.getConfidenceScore()).append(")");
        
        if (context.isLateNight()) {
            reason.append(", 심야 시간대");
        }
        
        if (context.isWeekend()) {
            reason.append(", 주말");
        }
        
        return reason.toString();
    }
    
    /**
     * 키워드-태그 매핑 생성
     */
    @Transactional
    public KeywordTagMapping createKeywordTagMapping(CreateKeywordTagMappingRequest request) {
        log.info("키워드-태그 매핑 생성: keywordGroupId={}, tagId={}", 
                request.getKeywordGroupId(), request.getTagId());
        
        try {
            KeywordTagMapping mapping = KeywordTagMapping.builder()
                    .keywordGroupId(request.getKeywordGroupId())
                    .tagId(request.getTagId())
                    .confidenceScore(request.getConfidenceScore())
                    .contextRules((com.fasterxml.jackson.databind.JsonNode) request.getContextRules())
                    .priority(request.getPriority())
                    .isActive(true)
                    .usageCount(0L)
                    .build();
            
            // TODO: 데이터베이스에 저장
            KeywordTagMapping savedMapping = saveKeywordTagMappingToDatabase(mapping);
            
            // 캐시 무효화
            invalidateKeywordTagMappingCache();
            
            log.info("키워드-태그 매핑 생성 완료: ID={}", savedMapping.getId());
            return savedMapping;
            
        } catch (Exception e) {
            log.error("키워드-태그 매핑 생성 실패", e);
            throw new RuntimeException("키워드-태그 매핑 생성 중 오류 발생", e);
        }
    }
    
    /**
     * 태그-계정과목 매핑 생성
     */
    @Transactional
    public TagAccountMapping createTagAccountMapping(CreateTagAccountMappingRequest request) {
        log.info("태그-계정과목 매핑 생성: tagId={}, accountCode={}", 
                request.getTagId(), request.getAccountCode());
        
        try {
            TagAccountMapping mapping = TagAccountMapping.builder()
                    .tagId(request.getTagId())
                    .accountCode(request.getAccountCode())
                    .accountName(request.getAccountName())
                    .mappingCondition((com.fasterxml.jackson.databind.JsonNode) request.getMappingCondition())
                    .isDefault(request.getIsDefault())
                    .priority(request.getPriority())
                    .confidenceBoost(request.getConfidenceBoost())
                    .build();
            
            // TODO: 데이터베이스에 저장
            TagAccountMapping savedMapping = saveTagAccountMappingToDatabase(mapping);
            
            // 캐시 무효화
            invalidateTagAccountMappingCache();
            
            log.info("태그-계정과목 매핑 생성 완료: ID={}", savedMapping.getId());
            return savedMapping;
            
        } catch (Exception e) {
            log.error("태그-계정과목 매핑 생성 실패", e);
            throw new RuntimeException("태그-계정과목 매핑 생성 중 오류 발생", e);
        }
    }
    
    /**
     * 매핑 사용 통계 업데이트
     */
    @Transactional
    public void updateMappingUsage(Long keywordTagMappingId, boolean isSuccessful) {
        log.debug("매핑 사용 통계 업데이트: ID={}, Success={}", keywordTagMappingId, isSuccessful);
        
        try {
            // TODO: 사용 횟수 증가 및 성공률 업데이트
            updateMappingUsageInDatabase(keywordTagMappingId, isSuccessful);
            
        } catch (Exception e) {
            log.error("매핑 사용 통계 업데이트 실패: ID={}", keywordTagMappingId, e);
        }
    }
    
    /**
     * 매핑 통계 조회
     */
    public MappingStats getMappingStats() {
        log.debug("매핑 통계 조회");
        
        // TODO: 실제 통계 계산 구현
        return MappingStats.builder()
                .totalKeywordTagMappings(0L)
                .totalTagAccountMappings(0L)
                .averageConfidence(BigDecimal.ZERO)
                .topUsedMappings(new ArrayList<>())
                .build();
    }
    
    /**
     * 캐시 무효화
     */
    public void invalidateCache() {
        log.info("태그 매핑 캐시 무효화");
        invalidateKeywordTagMappingCache();
        invalidateTagAccountMappingCache();
    }
    
    private void invalidateKeywordTagMappingCache() {
        redisTemplate.delete(CACHE_KEY_KEYWORD_TAG_MAPPINGS);
        redisTemplate.delete(redisTemplate.keys(CACHE_KEY_MAPPING_BY_KEYWORD_PREFIX + "*"));
    }
    
    private void invalidateTagAccountMappingCache() {
        redisTemplate.delete(CACHE_KEY_TAG_ACCOUNT_MAPPINGS);
        redisTemplate.delete(redisTemplate.keys(CACHE_KEY_MAPPING_BY_TAG_PREFIX + "*"));
    }
    
    // Private helper methods
    
    private List<KeywordTagMapping> findKeywordTagMappingsFromDatabase(Long keywordGroupId) {
        // TODO: 실제 데이터베이스 조회 구현
        return new ArrayList<>();
    }
    
    private List<TagAccountMapping> findTagAccountMappingsFromDatabase(Long tagId) {
        // TODO: 실제 데이터베이스 조회 구현
        return new ArrayList<>();
    }
    
    private List<TagAccountMapping> findAllTagAccountMappingsFromDatabase() {
        // TODO: 실제 데이터베이스 조회 구현
        return new ArrayList<>();
    }
    
    private KeywordTagMapping saveKeywordTagMappingToDatabase(KeywordTagMapping mapping) {
        // TODO: 실제 데이터베이스 저장 구현
        mapping.setId(System.currentTimeMillis());
        return mapping;
    }
    
    private TagAccountMapping saveTagAccountMappingToDatabase(TagAccountMapping mapping) {
        // TODO: 실제 데이터베이스 저장 구현
        mapping.setId(System.currentTimeMillis());
        return mapping;
    }
    
    private void updateMappingUsageInDatabase(Long mappingId, boolean isSuccessful) {
        // TODO: 실제 사용 통계 업데이트 구현
    }
    
    // 요청/응답 클래스들
    
    @lombok.Data
    @lombok.Builder
    public static class CreateKeywordTagMappingRequest {
        private Long keywordGroupId;
        private Long tagId;
        private BigDecimal confidenceScore;
        private Object contextRules; // JsonNode
        private Integer priority;
    }
    
    @lombok.Data
    @lombok.Builder
    public static class CreateTagAccountMappingRequest {
        private Long tagId;
        private String accountCode;
        private String accountName;
        private Object mappingCondition; // JsonNode
        private Boolean isDefault;
        private Integer priority;
        private BigDecimal confidenceBoost;
    }
    
    @lombok.Data
    @lombok.Builder
    public static class TagRecommendation {
        private KeywordGroup keywordGroup;
        private KeywordTagMapping tagMapping;
        private BigDecimal finalConfidence;
        private String recommendedAccount;
        private BigDecimal contextScore;
        private String reason;
    }
    
    @lombok.Data
    @lombok.Builder
    public static class MappingStats {
        private long totalKeywordTagMappings;
        private long totalTagAccountMappings;
        private BigDecimal averageConfidence;
        private List<Object> topUsedMappings;
    }
}
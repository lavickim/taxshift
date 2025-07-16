package com.moneyshift.api.service;

import com.moneyshift.api.mapper.KeywordTagMappingMapper;
import com.moneyshift.api.model.KeywordTagMapping;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.TimeUnit;

/**
 * 키워드-태그 매핑 서비스
 * 
 * 기능:
 * 1. 키워드 그룹과 태그 간의 매핑 관리
 * 2. 매핑 신뢰도 관리
 * 3. 사용 통계 관리
 * 4. 캐시 관리
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class KeywordTagMappingService {
    
    private final RedisTemplate<String, Object> redisTemplate;
    private final KeywordTagMappingMapper keywordTagMappingMapper;
    
    /**
     * 키워드 그룹 ID로 매핑 조회
     */
    public List<KeywordTagMapping> getMappingsByKeywordGroupId(Long keywordGroupId) {
        try {
            return keywordTagMappingMapper.selectByKeywordGroupId(keywordGroupId);
        } catch (Exception e) {
            log.error("키워드 그룹 매핑 조회 실패: keywordGroupId={}", keywordGroupId, e);
            return new ArrayList<>();
        }
    }
    
    // 캐시 키 상수
    private static final String CACHE_KEY_ALL_MAPPINGS = "keyword_tag_mappings:all";
    private static final String CACHE_KEY_KEYWORD_GROUP_PREFIX = "keyword_tag_mappings:keyword_group:";
    private static final String CACHE_KEY_TAG_PREFIX = "keyword_tag_mappings:tag:";
    private static final String CACHE_KEY_STATS = "keyword_tag_mappings:stats";
    private static final long CACHE_TTL_HOURS = 24;
    
    /**
     * 모든 활성 매핑 조회
     */
    public List<KeywordTagMapping> findAllActiveMappings() {
        log.debug("모든 활성 키워드-태그 매핑 조회");
        
        // 캐시에서 조회 시도
        @SuppressWarnings("unchecked")
        List<KeywordTagMapping> cachedMappings = (List<KeywordTagMapping>) redisTemplate.opsForValue()
                .get(CACHE_KEY_ALL_MAPPINGS);
        
        if (cachedMappings != null) {
            log.debug("캐시에서 {}개 매핑 조회", cachedMappings.size());
            return cachedMappings;
        }
        
        // 데이터베이스에서 조회
        List<KeywordTagMapping> mappings = findActiveMappingsFromDatabase();
        
        // 캐시에 저장
        redisTemplate.opsForValue().set(CACHE_KEY_ALL_MAPPINGS, mappings, CACHE_TTL_HOURS, TimeUnit.HOURS);
        
        log.debug("데이터베이스에서 {}개 매핑 조회 및 캐시 저장", mappings.size());
        return mappings;
    }
    
    /**
     * 데이터베이스에서 직접 조회 (캐시 무시)
     */
    public List<KeywordTagMapping> findAllActiveMappingsFromDatabase() {
        return findActiveMappingsFromDatabase();
    }
    
    /**
     * 키워드 그룹별 매핑 조회
     */
    public List<KeywordTagMapping> findMappingsByKeywordGroup(Long keywordGroupId) {
        log.debug("키워드 그룹별 매핑 조회: {}", keywordGroupId);
        
        String cacheKey = CACHE_KEY_KEYWORD_GROUP_PREFIX + keywordGroupId;
        
        @SuppressWarnings("unchecked")
        List<KeywordTagMapping> cachedMappings = (List<KeywordTagMapping>) redisTemplate.opsForValue()
                .get(cacheKey);
        
        if (cachedMappings != null) {
            return cachedMappings;
        }
        
        // 데이터베이스에서 조회
        List<KeywordTagMapping> mappings = findMappingsByKeywordGroupFromDatabase(keywordGroupId);
        
        // 캐시에 저장
        redisTemplate.opsForValue().set(cacheKey, mappings, CACHE_TTL_HOURS, TimeUnit.HOURS);
        
        return mappings;
    }
    
    /**
     * 태그별 매핑 조회
     */
    public List<KeywordTagMapping> findMappingsByTag(Long tagId) {
        log.debug("태그별 매핑 조회: {}", tagId);
        
        String cacheKey = CACHE_KEY_TAG_PREFIX + tagId;
        
        @SuppressWarnings("unchecked")
        List<KeywordTagMapping> cachedMappings = (List<KeywordTagMapping>) redisTemplate.opsForValue()
                .get(cacheKey);
        
        if (cachedMappings != null) {
            return cachedMappings;
        }
        
        // 데이터베이스에서 조회
        List<KeywordTagMapping> mappings = findMappingsByTagFromDatabase(tagId);
        
        // 캐시에 저장
        redisTemplate.opsForValue().set(cacheKey, mappings, CACHE_TTL_HOURS, TimeUnit.HOURS);
        
        return mappings;
    }
    
    /**
     * 특정 매핑 조회
     */
    public KeywordTagMapping findById(Long id) {
        log.debug("매핑 조회: {}", id);
        
        return findAllActiveMappings().stream()
                .filter(mapping -> id.equals(mapping.getId()))
                .findFirst()
                .orElse(null);
    }
    
    /**
     * 키워드 그룹과 태그로 매핑 조회
     */
    public KeywordTagMapping findByKeywordGroupAndTag(Long keywordGroupId, Long tagId) {
        log.debug("키워드 그룹-태그 매핑 조회: keywordGroupId={}, tagId={}", keywordGroupId, tagId);
        
        try {
            return keywordTagMappingMapper.selectByKeywordGroupAndTag(keywordGroupId, tagId);
        } catch (Exception e) {
            log.error("키워드 그룹-태그 매핑 조회 실패", e);
            return null;
        }
    }
    
    /**
     * 매핑 생성
     */
    public KeywordTagMapping createMapping(KeywordTagMapping mapping) {
        log.info("키워드-태그 매핑 생성: keywordGroupId={}, tagId={}", mapping.getKeywordGroupId(), mapping.getTagId());
        
        try {
            // 기본값 설정
            if (mapping.getConfidenceScore() == null) {
                mapping.setConfidenceScore(BigDecimal.valueOf(0.70));
            }
            if (mapping.getPriority() == null) {
                mapping.setPriority(50);
            }
            if (mapping.getUsageCount() == null) {
                mapping.setUsageCount(0L);
            }
            if (mapping.getIsActive() == null) {
                mapping.setIsActive(true);
            }
            
            // 데이터베이스에 저장
            keywordTagMappingMapper.insertKeywordTagMapping(mapping);
            
            // 캐시 무효화
            invalidateCache();
            
            log.info("키워드-태그 매핑 생성 완료: ID={}", mapping.getId());
            return mapping;
            
        } catch (Exception e) {
            log.error("키워드-태그 매핑 생성 실패", e);
            throw new RuntimeException("키워드-태그 매핑 생성 중 오류 발생", e);
        }
    }
    
    /**
     * 매핑 수정
     */
    public KeywordTagMapping updateMapping(Long id, KeywordTagMapping mapping) {
        log.info("키워드-태그 매핑 수정: ID={}", id);
        
        try {
            mapping.setId(id);
            
            // 데이터베이스에 업데이트
            keywordTagMappingMapper.updateKeywordTagMapping(mapping);
            
            // 캐시 무효화
            invalidateCache();
            
            log.info("키워드-태그 매핑 수정 완료: ID={}", id);
            return mapping;
            
        } catch (Exception e) {
            log.error("키워드-태그 매핑 수정 실패: ID={}", id, e);
            throw new RuntimeException("키워드-태그 매핑 수정 중 오류 발생", e);
        }
    }
    
    /**
     * 매핑 삭제
     */
    public void deleteMapping(Long id) {
        log.info("키워드-태그 매핑 삭제: ID={}", id);
        
        try {
            // 데이터베이스에서 삭제
            keywordTagMappingMapper.deleteKeywordTagMapping(id);
            
            // 캐시 무효화
            invalidateCache();
            
            log.info("키워드-태그 매핑 삭제 완료: ID={}", id);
            
        } catch (Exception e) {
            log.error("키워드-태그 매핑 삭제 실패: ID={}", id, e);
            throw new RuntimeException("키워드-태그 매핑 삭제 중 오류 발생", e);
        }
    }
    
    /**
     * 사용 횟수 업데이트
     */
    public void updateUsageCount(Long id, int increment) {
        log.debug("매핑 사용 횟수 업데이트: ID={}, increment={}", id, increment);
        
        try {
            keywordTagMappingMapper.updateUsageCount(id, increment);
            
            // 캐시 무효화 (통계 정보 갱신)
            invalidateCache();
            
        } catch (Exception e) {
            log.error("매핑 사용 횟수 업데이트 실패: ID={}", id, e);
        }
    }
    
    /**
     * 인기 매핑 조회
     */
    public List<KeywordTagMapping> findTopMappingsByUsage(int limit) {
        log.debug("인기 매핑 조회: limit={}", limit);
        
        try {
            return keywordTagMappingMapper.selectTopMappingsByUsage(limit);
        } catch (Exception e) {
            log.error("인기 매핑 조회 실패", e);
            return new ArrayList<>();
        }
    }
    
    /**
     * 신뢰도 범위별 매핑 조회
     */
    public List<KeywordTagMapping> findMappingsByConfidenceRange(double minConfidence, double maxConfidence) {
        log.debug("신뢰도 범위별 매핑 조회: {}~{}", minConfidence, maxConfidence);
        
        try {
            return keywordTagMappingMapper.selectMappingsByConfidenceRange(minConfidence, maxConfidence);
        } catch (Exception e) {
            log.error("신뢰도 범위별 매핑 조회 실패", e);
            return new ArrayList<>();
        }
    }
    
    /**
     * 캐시 무효화
     */
    public void invalidateCache() {
        log.info("키워드-태그 매핑 캐시 무효화");
        
        redisTemplate.delete(CACHE_KEY_ALL_MAPPINGS);
        redisTemplate.delete(CACHE_KEY_STATS);
        
        // 키워드 그룹별 캐시 삭제
        redisTemplate.delete(redisTemplate.keys(CACHE_KEY_KEYWORD_GROUP_PREFIX + "*"));
        
        // 태그별 캐시 삭제
        redisTemplate.delete(redisTemplate.keys(CACHE_KEY_TAG_PREFIX + "*"));
    }
    
    /**
     * 매핑 통계 조회
     */
    public MappingStats getStats() {
        String cacheKey = CACHE_KEY_STATS;
        
        @SuppressWarnings("unchecked")
        MappingStats cachedStats = (MappingStats) redisTemplate.opsForValue().get(cacheKey);
        
        if (cachedStats != null) {
            return cachedStats;
        }
        
        List<KeywordTagMapping> allMappings = findAllActiveMappingsFromDatabase();
        
        long totalMappings = allMappings.size();
        double avgConfidence = allMappings.stream()
                .mapToDouble(mapping -> mapping.getConfidenceScore().doubleValue())
                .average()
                .orElse(0.0);
        
        long highConfidenceMappings = allMappings.stream()
                .filter(mapping -> mapping.getConfidenceScore().doubleValue() >= 0.8)
                .count();
        
        MappingStats stats = MappingStats.builder()
                .totalMappings(totalMappings)
                .averageConfidence(BigDecimal.valueOf(avgConfidence))
                .highConfidenceMappings(highConfidenceMappings)
                .topMappings(findTopMappingsByUsage(5))
                .build();
        
        // 캐시에 저장
        redisTemplate.opsForValue().set(cacheKey, stats, CACHE_TTL_HOURS, TimeUnit.HOURS);
        
        return stats;
    }
    
    // Private helper methods
    
    private List<KeywordTagMapping> findActiveMappingsFromDatabase() {
        log.debug("데이터베이스에서 활성 키워드-태그 매핑 조회");
        try {
            List<KeywordTagMapping> mappings = keywordTagMappingMapper.selectAllActive();
            log.debug("데이터베이스에서 {}개 매핑 조회됨", mappings.size());
            return mappings;
        } catch (Exception e) {
            log.error("데이터베이스에서 키워드-태그 매핑 조회 실패", e);
            return new ArrayList<>();
        }
    }
    
    private List<KeywordTagMapping> findMappingsByKeywordGroupFromDatabase(Long keywordGroupId) {
        try {
            return keywordTagMappingMapper.selectByKeywordGroupId(keywordGroupId);
        } catch (Exception e) {
            log.error("키워드 그룹별 매핑 조회 실패: keywordGroupId={}", keywordGroupId, e);
            return new ArrayList<>();
        }
    }
    
    private List<KeywordTagMapping> findMappingsByTagFromDatabase(Long tagId) {
        try {
            return keywordTagMappingMapper.selectByTagId(tagId);
        } catch (Exception e) {
            log.error("태그별 매핑 조회 실패: tagId={}", tagId, e);
            return new ArrayList<>();
        }
    }
    
    // 통계 클래스
    @lombok.Data
    @lombok.Builder
    public static class MappingStats {
        private long totalMappings;
        private BigDecimal averageConfidence;
        private long highConfidenceMappings;
        private List<KeywordTagMapping> topMappings;
    }
}
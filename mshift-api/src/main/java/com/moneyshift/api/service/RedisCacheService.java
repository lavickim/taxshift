package com.moneyshift.api.service;

import com.moneyshift.api.model.LayerProcessingResult;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.ValueOperations;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.concurrent.TimeUnit;
import java.util.List;
import java.util.Set;

/**
 * Redis 캐싱 서비스
 * 
 * 기능:
 * 1. 키워드 그룹 캐싱
 * 2. 태그 매핑 캐싱
 * 3. 거래 분류 결과 캐싱
 * 4. 성능 통계 캐싱
 * 5. 캐시 무효화 및 관리
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class RedisCacheService {

    private final RedisTemplate<String, Object> redisTemplate;
    
    // 캐시 키 상수
    public static final String CACHE_KEY_KEYWORD_GROUPS = "keyword_groups:all";
    public static final String CACHE_KEY_KEYWORD_GROUP_PREFIX = "keyword_group:";
    public static final String CACHE_KEY_TAG_MAPPINGS = "tag_mappings:all";
    public static final String CACHE_KEY_TAG_MAPPING_PREFIX = "tag_mapping:";
    public static final String CACHE_KEY_TRANSACTION_RESULT_PREFIX = "transaction_result:";
    public static final String CACHE_KEY_STATS_PREFIX = "stats:";
    public static final String CACHE_KEY_PATTERN_MATCHES_PREFIX = "pattern_matches:";
    public static final String CACHE_KEY_PREPROCESSING_RESULT_PREFIX = "preprocessing_result:";
    
    // TTL 상수 (초)
    private static final long TTL_KEYWORD_GROUPS = 3600; // 1시간
    private static final long TTL_TAG_MAPPINGS = 1800; // 30분
    private static final long TTL_TRANSACTION_RESULTS = 300; // 5분
    private static final long TTL_STATS = 600; // 10분
    private static final long TTL_PATTERN_MATCHES = 86400; // 24시간
    private static final long TTL_PREPROCESSING_RESULTS = 300; // 5분

    /**
     * 키워드 그룹 캐싱
     */
    public void cacheKeywordGroups(List<Object> keywordGroups) {
        try {
            redisTemplate.opsForValue().set(CACHE_KEY_KEYWORD_GROUPS, keywordGroups, TTL_KEYWORD_GROUPS, TimeUnit.SECONDS);
            log.debug("키워드 그룹 캐시 저장 완료: {}개", keywordGroups.size());
        } catch (Exception e) {
            log.error("키워드 그룹 캐시 저장 실패", e);
        }
    }

    /**
     * 키워드 그룹 캐시 조회
     */
    @SuppressWarnings("unchecked")
    public List<Object> getCachedKeywordGroups() {
        try {
            Object cached = redisTemplate.opsForValue().get(CACHE_KEY_KEYWORD_GROUPS);
            if (cached != null) {
                log.debug("키워드 그룹 캐시 히트");
                return (List<Object>) cached;
            }
            log.debug("키워드 그룹 캐시 미스");
            return null;
        } catch (Exception e) {
            log.error("키워드 그룹 캐시 조회 실패", e);
            return null;
        }
    }

    /**
     * 개별 키워드 그룹 캐싱
     */
    public void cacheKeywordGroup(Long groupId, Object keywordGroup) {
        try {
            String key = CACHE_KEY_KEYWORD_GROUP_PREFIX + groupId;
            redisTemplate.opsForValue().set(key, keywordGroup, TTL_KEYWORD_GROUPS, TimeUnit.SECONDS);
            log.debug("키워드 그룹 개별 캐시 저장: ID={}", groupId);
        } catch (Exception e) {
            log.error("키워드 그룹 개별 캐시 저장 실패: ID={}", groupId, e);
        }
    }

    /**
     * 개별 키워드 그룹 캐시 조회
     */
    public Object getCachedKeywordGroup(Long groupId) {
        try {
            String key = CACHE_KEY_KEYWORD_GROUP_PREFIX + groupId;
            Object cached = redisTemplate.opsForValue().get(key);
            if (cached != null) {
                log.debug("키워드 그룹 개별 캐시 히트: ID={}", groupId);
            } else {
                log.debug("키워드 그룹 개별 캐시 미스: ID={}", groupId);
            }
            return cached;
        } catch (Exception e) {
            log.error("키워드 그룹 개별 캐시 조회 실패: ID={}", groupId, e);
            return null;
        }
    }

    /**
     * 태그 매핑 캐싱
     */
    public void cacheTagMappings(String mappingType, Object mappings) {
        try {
            String key = CACHE_KEY_TAG_MAPPINGS + ":" + mappingType;
            redisTemplate.opsForValue().set(key, mappings, TTL_TAG_MAPPINGS, TimeUnit.SECONDS);
            log.debug("태그 매핑 캐시 저장: type={}", mappingType);
        } catch (Exception e) {
            log.error("태그 매핑 캐시 저장 실패: type={}", mappingType, e);
        }
    }

    /**
     * 태그 매핑 캐시 조회
     */
    public Object getCachedTagMappings(String mappingType) {
        try {
            String key = CACHE_KEY_TAG_MAPPINGS + ":" + mappingType;
            Object cached = redisTemplate.opsForValue().get(key);
            if (cached != null) {
                log.debug("태그 매핑 캐시 히트: type={}", mappingType);
            } else {
                log.debug("태그 매핑 캐시 미스: type={}", mappingType);
            }
            return cached;
        } catch (Exception e) {
            log.error("태그 매핑 캐시 조회 실패: type={}", mappingType, e);
            return null;
        }
    }

    /**
     * 거래 분류 결과 캐싱
     */
    public void cacheTransactionResult(String transactionHash, Object result) {
        try {
            String key = CACHE_KEY_TRANSACTION_RESULT_PREFIX + transactionHash;
            redisTemplate.opsForValue().set(key, result, TTL_TRANSACTION_RESULTS, TimeUnit.SECONDS);
            log.debug("거래 분류 결과 캐시 저장: hash={}", transactionHash);
        } catch (Exception e) {
            log.error("거래 분류 결과 캐시 저장 실패: hash={}", transactionHash, e);
        }
    }

    /**
     * 거래 분류 결과 캐시 조회
     */
    public Object getCachedTransactionResult(String transactionHash) {
        try {
            String key = CACHE_KEY_TRANSACTION_RESULT_PREFIX + transactionHash;
            Object cached = redisTemplate.opsForValue().get(key);
            if (cached != null) {
                log.debug("거래 분류 결과 캐시 히트: hash={}", transactionHash);
            } else {
                log.debug("거래 분류 결과 캐시 미스: hash={}", transactionHash);
            }
            return cached;
        } catch (Exception e) {
            log.error("거래 분류 결과 캐시 조회 실패: hash={}", transactionHash, e);
            return null;
        }
    }

    /**
     * 패턴 매칭 결과 캐싱
     */
    public void cachePatternMatches(String patternHash, Object matches) {
        try {
            String key = CACHE_KEY_PATTERN_MATCHES_PREFIX + patternHash;
            redisTemplate.opsForValue().set(key, matches, TTL_PATTERN_MATCHES, TimeUnit.SECONDS);
            log.debug("패턴 매칭 결과 캐시 저장: hash={}", patternHash);
        } catch (Exception e) {
            log.error("패턴 매칭 결과 캐시 저장 실패: hash={}", patternHash, e);
        }
    }

    /**
     * 패턴 매칭 결과 캐시 조회
     */
    public Object getCachedPatternMatches(String patternHash) {
        try {
            String key = CACHE_KEY_PATTERN_MATCHES_PREFIX + patternHash;
            Object cached = redisTemplate.opsForValue().get(key);
            if (cached != null) {
                log.debug("패턴 매칭 결과 캐시 히트: hash={}", patternHash);
            } else {
                log.debug("패턴 매칭 결과 캐시 미스: hash={}", patternHash);
            }
            return cached;
        } catch (Exception e) {
            log.error("패턴 매칭 결과 캐시 조회 실패: hash={}", patternHash, e);
            return null;
        }
    }

    /**
     * 통계 데이터 캐싱
     */
    public void cacheStats(String statsType, Object stats) {
        try {
            String key = CACHE_KEY_STATS_PREFIX + statsType;
            redisTemplate.opsForValue().set(key, stats, TTL_STATS, TimeUnit.SECONDS);
            log.debug("통계 데이터 캐시 저장: type={}", statsType);
        } catch (Exception e) {
            log.error("통계 데이터 캐시 저장 실패: type={}", statsType, e);
        }
    }

    /**
     * 통계 데이터 캐시 조회
     */
    public Object getCachedStats(String statsType) {
        try {
            String key = CACHE_KEY_STATS_PREFIX + statsType;
            Object cached = redisTemplate.opsForValue().get(key);
            if (cached != null) {
                log.debug("통계 데이터 캐시 히트: type={}", statsType);
            } else {
                log.debug("통계 데이터 캐시 미스: type={}", statsType);
            }
            return cached;
        } catch (Exception e) {
            log.error("통계 데이터 캐시 조회 실패: type={}", statsType, e);
            return null;
        }
    }

    /**
     * 패턴 캐시 무효화
     */
    public void invalidatePatternCache() {
        try {
            Set<String> keys = redisTemplate.keys("pattern:*");
            if (keys != null && !keys.isEmpty()) {
                redisTemplate.delete(keys);
                log.info("패턴 캐시 무효화: {}개 키", keys.size());
            }
        } catch (Exception e) {
            log.error("패턴 캐시 무효화 실패", e);
        }
    }

    /**
     * 전체 캐시 무효화
     */
    public void invalidateAllCache() {
        try {
            Set<String> keys = redisTemplate.keys("keyword_groups:*");
            if (keys != null && !keys.isEmpty()) {
                redisTemplate.delete(keys);
                log.info("키워드 그룹 캐시 무효화: {}개 키", keys.size());
            }

            keys = redisTemplate.keys("tag_mappings:*");
            if (keys != null && !keys.isEmpty()) {
                redisTemplate.delete(keys);
                log.info("태그 매핑 캐시 무효화: {}개 키", keys.size());
            }

            keys = redisTemplate.keys("stats:*");
            if (keys != null && !keys.isEmpty()) {
                redisTemplate.delete(keys);
                log.info("통계 캐시 무효화: {}개 키", keys.size());
            }

            log.info("전체 캐시 무효화 완료");
        } catch (Exception e) {
            log.error("전체 캐시 무효화 실패", e);
        }
    }

    /**
     * 특정 타입 캐시 무효화
     */
    public void invalidateCache(String cacheType) {
        try {
            Set<String> keys = redisTemplate.keys(cacheType + "*");
            if (keys != null && !keys.isEmpty()) {
                redisTemplate.delete(keys);
                log.info("{} 캐시 무효화: {}개 키", cacheType, keys.size());
            }
        } catch (Exception e) {
            log.error("{} 캐시 무효화 실패", cacheType, e);
        }
    }

    /**
     * 캐시 통계 조회
     */
    public CacheStats getCacheStats() {
        try {
            long keywordGroupKeys = getKeyCount("keyword_group*");
            long tagMappingKeys = getKeyCount("tag_mapping*");
            long transactionResultKeys = getKeyCount("transaction_result*");
            long statsKeys = getKeyCount("stats*");

            return CacheStats.builder()
                    .keywordGroupCacheSize(keywordGroupKeys)
                    .tagMappingCacheSize(tagMappingKeys)
                    .transactionResultCacheSize(transactionResultKeys)
                    .statsCacheSize(statsKeys)
                    .totalCacheSize(keywordGroupKeys + tagMappingKeys + transactionResultKeys + statsKeys)
                    .build();
        } catch (Exception e) {
            log.error("캐시 통계 조회 실패", e);
            return CacheStats.builder().build();
        }
    }

    /**
     * 키 개수 조회
     */
    private long getKeyCount(String pattern) {
        try {
            Set<String> keys = redisTemplate.keys(pattern);
            return keys != null ? keys.size() : 0;
        } catch (Exception e) {
            log.error("키 개수 조회 실패: pattern={}", pattern, e);
            return 0;
        }
    }

    /**
     * 거래 텍스트 해시 생성
     */
    public String generateTransactionHash(String transactionText, String amount) {
        try {
            String combined = transactionText + "|" + amount;
            return String.valueOf(combined.hashCode());
        } catch (Exception e) {
            log.error("거래 해시 생성 실패", e);
            return String.valueOf(System.currentTimeMillis());
        }
    }

    /**
     * 패턴 해시 생성
     */
    public String generatePatternHash(String pattern, String category) {
        try {
            String combined = pattern + "|" + category;
            return String.valueOf(combined.hashCode());
        } catch (Exception e) {
            log.error("패턴 해시 생성 실패", e);
            return String.valueOf(System.currentTimeMillis());
        }
    }

    /**
     * 캐시 연결 상태 확인
     */
    public boolean isRedisAvailable() {
        try {
            redisTemplate.opsForValue().set("health_check", "ok", 1, TimeUnit.SECONDS);
            String result = (String) redisTemplate.opsForValue().get("health_check");
            return "ok".equals(result);
        } catch (Exception e) {
            log.warn("Redis 연결 확인 실패", e);
            return false;
        }
    }

    /**
     * 캐시 키 생성 (분류 결과용)
     */
    public String generateCacheKey(String transactionText) {
        try {
            return "classification:" + Math.abs(transactionText.hashCode());
        } catch (Exception e) {
            log.error("캐시 키 생성 실패", e);
            return "classification:" + System.currentTimeMillis();
        }
    }
    
    /**
     * 분류 결과 캐시 저장
     */
    public void saveClassificationResult(String cacheKey, LayerProcessingResult result) {
        try {
            redisTemplate.opsForValue().set(cacheKey, result, TTL_TRANSACTION_RESULTS, TimeUnit.SECONDS);
            log.debug("분류 결과 캐시 저장: key={}", cacheKey);
        } catch (Exception e) {
            log.error("분류 결과 캐시 저장 실패: key={}", cacheKey, e);
        }
    }
    
    /**
     * 분류 결과 캐시 조회
     */
    public LayerProcessingResult getClassificationResult(String cacheKey) {
        try {
            Object cached = redisTemplate.opsForValue().get(cacheKey);
            if (cached instanceof LayerProcessingResult) {
                log.debug("분류 결과 캐시 히트: key={}", cacheKey);
                return (LayerProcessingResult) cached;
            }
            log.debug("분류 결과 캐시 미스: key={}", cacheKey);
            return null;
        } catch (Exception e) {
            log.error("분류 결과 캐시 조회 실패: key={}", cacheKey, e);
            return null;
        }
    }
    
    /**
     * 정규식 전처리 결과 캐시 저장
     */
    public void savePreprocessingResult(String cacheKey, RegexPreprocessingEngine.PreprocessingResult result, int ttlSeconds) {
        try {
            redisTemplate.opsForValue().set(cacheKey, result, ttlSeconds, TimeUnit.SECONDS);
            log.debug("전처리 결과 캐시 저장: key={}", cacheKey);
        } catch (Exception e) {
            log.error("전처리 결과 캐시 저장 실패: key={}", cacheKey, e);
        }
    }
    
    /**
     * 정규식 전처리 결과 캐시 조회
     */
    public RegexPreprocessingEngine.PreprocessingResult getPreprocessingResult(String cacheKey) {
        try {
            Object cached = redisTemplate.opsForValue().get(cacheKey);
            if (cached instanceof RegexPreprocessingEngine.PreprocessingResult) {
                log.debug("전처리 결과 캐시 히트: key={}", cacheKey);
                return (RegexPreprocessingEngine.PreprocessingResult) cached;
            }
            log.debug("전처리 결과 캐시 미스: key={}", cacheKey);
            return null;
        } catch (Exception e) {
            log.error("전처리 결과 캐시 조회 실패: key={}", cacheKey, e);
            return null;
        }
    }

    // DTO 클래스
    @lombok.Data
    @lombok.Builder
    public static class CacheStats {
        private long keywordGroupCacheSize;
        private long tagMappingCacheSize;
        private long transactionResultCacheSize;
        private long statsCacheSize;
        private long totalCacheSize;
    }
}
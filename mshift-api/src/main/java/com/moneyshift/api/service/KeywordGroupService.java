package com.moneyshift.api.service;

import com.moneyshift.api.mapper.KeywordGroupMapper;
import com.moneyshift.api.model.KeywordGroup;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.TimeUnit;

/**
 * 키워드 그룹 관리 서비스
 * 
 * 기능:
 * 1. 키워드 그룹 CRUD 작업
 * 2. 동의어 관리
 * 3. 키워드 검색 및 매칭
 * 4. 캐시 관리
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class KeywordGroupService {
    
    private final RedisTemplate<String, Object> redisTemplate;
    private final KeywordGroupMapper keywordGroupMapper;
    
    // 캐시 키 상수
    private static final String CACHE_KEY_ALL_GROUPS = "keyword_groups:all";
    private static final String CACHE_KEY_CATEGORY_PREFIX = "keyword_groups:category:";
    private static final String CACHE_KEY_ACTIVE_GROUPS = "keyword_groups:active";
    private static final long CACHE_TTL_HOURS = 24;
    
    /**
     * 모든 키워드 그룹 조회 (활성/비활성 포함)
     */
    public List<KeywordGroup> getAllKeywordGroups() {
        log.debug("모든 키워드 그룹 조회");
        
        // 캐시에서 조회 시도
        @SuppressWarnings("unchecked")
        List<KeywordGroup> cachedGroups = (List<KeywordGroup>) redisTemplate.opsForValue()
                .get(CACHE_KEY_ALL_GROUPS);
        
        if (cachedGroups != null) {
            log.debug("캐시에서 {}개 키워드 그룹 조회", cachedGroups.size());
            return cachedGroups;
        }
        
        // DB에서 조회
        List<KeywordGroup> groups = keywordGroupMapper.selectAllActive();
        log.debug("DB에서 {}개 키워드 그룹 조회", groups.size());
        
        // 캐시에 저장
        redisTemplate.opsForValue().set(CACHE_KEY_ALL_GROUPS, groups, CACHE_TTL_HOURS, TimeUnit.HOURS);
        
        return groups;
    }

    /**
     * 모든 활성 키워드 그룹 조회
     */
    public List<KeywordGroup> findAllActiveGroups() {
        log.debug("모든 활성 키워드 그룹 조회");
        
        // 임시: 캐시 우회하고 DB에서 직접 조회 (Redis 직렬화 문제 해결을 위해)
        List<KeywordGroup> groups = findActiveGroupsFromDatabase();
        log.debug("데이터베이스에서 {}개 키워드 그룹 조회", groups.size());
        return groups;
        
        // 원래 캐시 로직 (향후 복원)
        /*
        @SuppressWarnings("unchecked")
        List<KeywordGroup> cachedGroups = (List<KeywordGroup>) redisTemplate.opsForValue()
                .get(CACHE_KEY_ACTIVE_GROUPS);
        
        if (cachedGroups != null) {
            log.debug("캐시에서 {}개 키워드 그룹 조회", cachedGroups.size());
            return cachedGroups;
        }
        
        List<KeywordGroup> groups = findActiveGroupsFromDatabase();
        redisTemplate.opsForValue().set(CACHE_KEY_ACTIVE_GROUPS, groups, CACHE_TTL_HOURS, TimeUnit.HOURS);
        log.debug("데이터베이스에서 {}개 키워드 그룹 조회 및 캐시 저장", groups.size());
        return groups;
        */
    }
    
    /**
     * 카테고리별 키워드 그룹 조회
     */
    public List<KeywordGroup> findGroupsByCategory(String category) {
        log.debug("카테고리별 키워드 그룹 조회: {}", category);
        
        String cacheKey = CACHE_KEY_CATEGORY_PREFIX + category;
        
        @SuppressWarnings("unchecked")
        List<KeywordGroup> cachedGroups = (List<KeywordGroup>) redisTemplate.opsForValue()
                .get(cacheKey);
        
        if (cachedGroups != null) {
            return cachedGroups;
        }
        
        // 전체 그룹에서 필터링
        List<KeywordGroup> allGroups = findAllActiveGroups();
        List<KeywordGroup> categoryGroups = allGroups.stream()
                .filter(group -> category.equals(group.getCategory()))
                .toList();
        
        // 캐시에 저장
        redisTemplate.opsForValue().set(cacheKey, categoryGroups, CACHE_TTL_HOURS, TimeUnit.HOURS);
        
        return categoryGroups;
    }
    
    /**
     * 키워드로 그룹 검색
     */
    public List<KeywordGroup> findGroupsByKeyword(String keyword) {
        log.debug("키워드로 그룹 검색: {}", keyword);
        
        String normalizedKeyword = keyword.toLowerCase().trim();
        
        return findAllActiveGroups().stream()
                .filter(group -> {
                    // 주 키워드 확인
                    if (group.getPrimaryKeyword().toLowerCase().contains(normalizedKeyword)) {
                        return true;
                    }
                    
                    // 동의어 확인
                    if (group.getSynonyms() != null) {
                        return group.getSynonyms().stream()
                                .anyMatch(synonym -> synonym.toLowerCase().contains(normalizedKeyword));
                    }
                    
                    return false;
                })
                .toList();
    }
    
    /**
     * 그룹명으로 키워드 그룹 검색
     */
    public List<KeywordGroup> findByGroupName(String groupName) {
        log.debug("그룹명으로 검색: {}", groupName);
        
        return findAllActiveGroups().stream()
                .filter(group -> group.getGroupName().equals(groupName))
                .toList();
    }
    
    /**
     * 특정 키워드 그룹 조회
     */
    public KeywordGroup findById(Long id) {
        log.debug("키워드 그룹 조회: {}", id);
        
        return findAllActiveGroups().stream()
                .filter(group -> id.equals(group.getId()))
                .findFirst()
                .orElse(null);
    }
    
    /**
     * 키워드 그룹 생성
     */
    public KeywordGroup createGroup(KeywordGroup group) {
        log.info("키워드 그룹 생성: {}", group.getGroupName());
        
        try {
            // TODO: 데이터베이스에 저장
            KeywordGroup savedGroup = saveGroupToDatabase(group);
            
            // 캐시 무효화
            invalidateCache();
            
            log.info("키워드 그룹 생성 완료: ID={}, Name={}", savedGroup.getId(), savedGroup.getGroupName());
            return savedGroup;
            
        } catch (Exception e) {
            log.error("키워드 그룹 생성 실패", e);
            throw new RuntimeException("키워드 그룹 생성 중 오류 발생", e);
        }
    }
    
    /**
     * 키워드 그룹 수정
     */
    public KeywordGroup updateGroup(Long id, KeywordGroup group) {
        log.info("키워드 그룹 수정: ID={}", id);
        
        try {
            group.setId(id);
            
            // TODO: 데이터베이스에 업데이트
            KeywordGroup updatedGroup = updateGroupInDatabase(group);
            
            // 캐시 무효화
            invalidateCache();
            
            log.info("키워드 그룹 수정 완료: ID={}, Name={}", updatedGroup.getId(), updatedGroup.getGroupName());
            return updatedGroup;
            
        } catch (Exception e) {
            log.error("키워드 그룹 수정 실패: ID={}", id, e);
            throw new RuntimeException("키워드 그룹 수정 중 오류 발생", e);
        }
    }
    
    /**
     * 키워드 그룹 삭제
     */
    public void deleteGroup(Long id) {
        log.info("키워드 그룹 삭제: ID={}", id);
        
        try {
            // TODO: 데이터베이스에서 삭제 (소프트 삭제 권장)
            deleteGroupFromDatabase(id);
            
            // 캐시 무효화
            invalidateCache();
            
            log.info("키워드 그룹 삭제 완료: ID={}", id);
            
        } catch (Exception e) {
            log.error("키워드 그룹 삭제 실패: ID={}", id, e);
            throw new RuntimeException("키워드 그룹 삭제 중 오류 발생", e);
        }
    }
    
    /**
     * 동의어 추가
     */
    public void addSynonym(Long groupId, String synonym) {
        log.info("동의어 추가: GroupID={}, Synonym={}", groupId, synonym);
        
        KeywordGroup group = findById(groupId);
        if (group == null) {
            throw new RuntimeException("키워드 그룹을 찾을 수 없습니다: " + groupId);
        }
        
        List<String> synonyms = new ArrayList<>(group.getSynonyms() != null ? group.getSynonyms() : new ArrayList<>());
        if (!synonyms.contains(synonym.trim())) {
            synonyms.add(synonym.trim());
            group.setSynonyms(synonyms);
            updateGroup(groupId, group);
        }
    }
    
    /**
     * 동의어 제거
     */
    public void removeSynonym(Long groupId, String synonym) {
        log.info("동의어 제거: GroupID={}, Synonym={}", groupId, synonym);
        
        KeywordGroup group = findById(groupId);
        if (group == null) {
            throw new RuntimeException("키워드 그룹을 찾을 수 없습니다: " + groupId);
        }
        
        if (group.getSynonyms() != null) {
            List<String> synonyms = new ArrayList<>(group.getSynonyms());
            synonyms.remove(synonym.trim());
            group.setSynonyms(synonyms);
            updateGroup(groupId, group);
        }
    }
    
    /**
     * 캐시 무효화
     */
    public void invalidateCache() {
        log.info("키워드 그룹 캐시 무효화");
        
        redisTemplate.delete(CACHE_KEY_ALL_GROUPS);
        redisTemplate.delete(CACHE_KEY_ACTIVE_GROUPS);
        
        // 카테고리별 캐시도 삭제
        redisTemplate.delete(redisTemplate.keys(CACHE_KEY_CATEGORY_PREFIX + "*"));
    }
    
    /**
     * 통계 정보 조회
     */
    public KeywordGroupStats getStats() {
        List<KeywordGroup> allGroups = findAllActiveGroups();
        
        long totalGroups = allGroups.size();
        long totalKeywords = allGroups.stream()
                .mapToLong(group -> 1 + (group.getSynonyms() != null ? group.getSynonyms().size() : 0))
                .sum();
        
        // 카테고리별 통계
        var categoryStats = allGroups.stream()
                .collect(java.util.stream.Collectors.groupingBy(
                        group -> group.getCategory() != null ? group.getCategory() : "기타",
                        java.util.stream.Collectors.counting()
                ));
        
        return KeywordGroupStats.builder()
                .totalGroups(totalGroups)
                .totalKeywords(totalKeywords)
                .categoryStats(categoryStats)
                .build();
    }
    
    /**
     * 데이터베이스에서 직접 조회 (캐시 무시)
     */
    public List<KeywordGroup> findAllActiveGroupsFromDatabase() {
        return findActiveGroupsFromDatabase();
    }
    
    // Private helper methods
    
    private List<KeywordGroup> findActiveGroupsFromDatabase() {
        log.debug("데이터베이스에서 활성 키워드 그룹 조회");
        try {
            List<KeywordGroup> groups = keywordGroupMapper.selectAllActive();
            log.debug("데이터베이스에서 {}개 키워드 그룹 조회됨", groups.size());
            return groups;
        } catch (Exception e) {
            log.error("데이터베이스에서 키워드 그룹 조회 실패", e);
            return new ArrayList<>();
        }
    }
    
    private KeywordGroup saveGroupToDatabase(KeywordGroup group) {
        // TODO: 실제 데이터베이스 저장 구현
        log.debug("데이터베이스에 키워드 그룹 저장: {}", group.getGroupName());
        group.setId(System.currentTimeMillis()); // 임시 ID
        return group;
    }
    
    private KeywordGroup updateGroupInDatabase(KeywordGroup group) {
        // TODO: 실제 데이터베이스 업데이트 구현
        log.debug("데이터베이스에서 키워드 그룹 업데이트: ID={}", group.getId());
        return group;
    }
    
    private void deleteGroupFromDatabase(Long id) {
        // TODO: 실제 데이터베이스 삭제 구현 (소프트 삭제 권장)
        log.debug("데이터베이스에서 키워드 그룹 삭제: ID={}", id);
    }
    
    // 통계 클래스
    @lombok.Data
    @lombok.Builder
    public static class KeywordGroupStats {
        private long totalGroups;
        private long totalKeywords;
        private java.util.Map<String, Long> categoryStats;
    }
}
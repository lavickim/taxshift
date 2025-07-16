package com.moneyshift.api.service;

import com.moneyshift.api.model.TagsMaster;
import com.moneyshift.api.model.KeywordTagMapping;
import com.moneyshift.api.model.KeywordGroup;
import com.moneyshift.api.controller.TagManagementController;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.ArrayList;
import java.util.stream.Collectors;
import java.math.BigDecimal;

/**
 * 태그 관리 및 키워드-태그 매핑 서비스
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class TagManagementService {

    private final RedisCacheService redisCacheService;
    private final KeywordGroupService keywordGroupService;

    // ========== 태그 관리 ==========

    /**
     * 태그 목록 조회
     */
    public List<TagsMaster> getTags(String category, Boolean isActive, String search) {
        log.debug("태그 조회: category={}, isActive={}, search={}", category, isActive, search);
        
        try {
            // 샘플 데이터 생성
            List<TagsMaster> tags = createSampleTags();
            
            // 필터링 적용
            if (category != null && !category.isEmpty()) {
                tags = tags.stream()
                        .filter(tag -> category.equals(tag.getTagCategory()))
                        .collect(Collectors.toList());
            }
            
            if (isActive != null) {
                tags = tags.stream()
                        .filter(tag -> isActive.equals(tag.getIsActive()))
                        .collect(Collectors.toList());
            }
            
            if (search != null && !search.isEmpty()) {
                tags = tags.stream()
                        .filter(tag -> tag.getTagName().contains(search) || 
                                (tag.getDescription() != null && tag.getDescription().contains(search)))
                        .collect(Collectors.toList());
            }
            
            return tags;
            
        } catch (Exception e) {
            log.error("태그 조회 실패", e);
            throw new RuntimeException("태그 조회 실패", e);
        }
    }

    /**
     * 태그 생성
     */
    @Transactional
    public TagsMaster createTag(TagsMaster tag) {
        log.info("태그 생성: {}", tag.getTagName());
        
        try {
            // 유효성 검사
            validateTag(tag);
            
            // 기본값 설정
            tag.setCreatedAt(LocalDateTime.now());
            if (tag.getIsActive() == null) {
                tag.setIsActive(true);
            }
            if (tag.getDisplayOrder() == null) {
                tag.setDisplayOrder(100);
            }
            if (tag.getColorHex() == null) {
                tag.setColorHex("#6B7280");
            }
            if (tag.getIconName() == null) {
                tag.setIconName("tag");
            }
            
            // DB 저장 (향후 구현)
            tag.setId(System.currentTimeMillis());
            
            // 캐시 갱신
            refreshTagCache();
            
            return tag;
            
        } catch (Exception e) {
            log.error("태그 생성 실패", e);
            throw new RuntimeException("태그 생성 실패", e);
        }
    }

    /**
     * 태그 수정
     */
    @Transactional
    public TagsMaster updateTag(Long id, TagsMaster tag) {
        log.info("태그 수정: id={}, name={}", id, tag.getTagName());
        
        try {
            // 유효성 검사
            validateTag(tag);
            
            // ID 설정
            tag.setId(id);
            
            // DB 업데이트 (향후 구현)
            
            // 캐시 갱신
            refreshTagCache();
            
            return tag;
            
        } catch (Exception e) {
            log.error("태그 수정 실패", e);
            throw new RuntimeException("태그 수정 실패", e);
        }
    }

    /**
     * 태그 삭제
     */
    @Transactional
    public void deleteTag(Long id) {
        log.info("태그 삭제: id={}", id);
        
        try {
            // 관련 매핑 확인 (향후 구현)
            // 매핑이 있는 경우 예외 발생
            
            // DB 삭제 (향후 구현)
            
            // 캐시 갱신
            refreshTagCache();
            
        } catch (Exception e) {
            log.error("태그 삭제 실패", e);
            throw new RuntimeException("태그 삭제 실패", e);
        }
    }

    /**
     * 태그별 매핑 조회
     */
    public List<KeywordTagMapping> getTagMappings(Long tagId) {
        log.info("태그별 매핑 조회: tagId={}", tagId);
        
        try {
            // 샘플 데이터 생성
            List<KeywordTagMapping> mappings = createSampleMappings();
            
            // 태그 ID로 필터링
            return mappings.stream()
                    .filter(mapping -> tagId.equals(mapping.getTagId()))
                    .collect(Collectors.toList());
            
        } catch (Exception e) {
            log.error("태그별 매핑 조회 실패", e);
            throw new RuntimeException("태그별 매핑 조회 실패", e);
        }
    }

    // ========== 키워드-태그 매핑 관리 ==========

    /**
     * 키워드-태그 매핑 목록 조회
     */
    public List<KeywordTagMapping> getKeywordTagMappings(Long keywordGroupId, Long tagId, Boolean isActive) {
        log.debug("키워드-태그 매핑 조회: keywordGroupId={}, tagId={}, isActive={}", 
                keywordGroupId, tagId, isActive);
        
        try {
            // 샘플 데이터 생성
            List<KeywordTagMapping> mappings = createSampleMappings();
            
            // 필터링 적용
            if (keywordGroupId != null) {
                mappings = mappings.stream()
                        .filter(mapping -> keywordGroupId.equals(mapping.getKeywordGroupId()))
                        .collect(Collectors.toList());
            }
            
            if (tagId != null) {
                mappings = mappings.stream()
                        .filter(mapping -> tagId.equals(mapping.getTagId()))
                        .collect(Collectors.toList());
            }
            
            if (isActive != null) {
                mappings = mappings.stream()
                        .filter(mapping -> isActive.equals(mapping.getIsActive()))
                        .collect(Collectors.toList());
            }
            
            return mappings;
            
        } catch (Exception e) {
            log.error("키워드-태그 매핑 조회 실패", e);
            throw new RuntimeException("키워드-태그 매핑 조회 실패", e);
        }
    }

    /**
     * 키워드-태그 매핑 생성
     */
    @Transactional
    public KeywordTagMapping createKeywordTagMapping(KeywordTagMapping mapping) {
        log.info("키워드-태그 매핑 생성: keywordGroupId={}, tagId={}", 
                mapping.getKeywordGroupId(), mapping.getTagId());
        
        try {
            // 유효성 검사
            validateKeywordTagMapping(mapping);
            
            // 기본값 설정
            mapping.setCreatedAt(LocalDateTime.now());
            if (mapping.getConfidenceScore() == null) {
                mapping.setConfidenceScore(new BigDecimal("0.70"));
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
            
            // DB 저장 (향후 구현)
            mapping.setId(System.currentTimeMillis());
            
            // 캐시 갱신
            refreshMappingCache();
            
            return mapping;
            
        } catch (Exception e) {
            log.error("키워드-태그 매핑 생성 실패", e);
            throw new RuntimeException("키워드-태그 매핑 생성 실패", e);
        }
    }

    /**
     * 키워드-태그 매핑 수정
     */
    @Transactional
    public KeywordTagMapping updateKeywordTagMapping(Long id, KeywordTagMapping mapping) {
        log.info("키워드-태그 매핑 수정: id={}", id);
        
        try {
            // 유효성 검사
            validateKeywordTagMapping(mapping);
            
            // ID 설정
            mapping.setId(id);
            
            // DB 업데이트 (향후 구현)
            
            // 캐시 갱신
            refreshMappingCache();
            
            return mapping;
            
        } catch (Exception e) {
            log.error("키워드-태그 매핑 수정 실패", e);
            throw new RuntimeException("키워드-태그 매핑 수정 실패", e);
        }
    }

    /**
     * 키워드-태그 매핑 삭제
     */
    @Transactional
    public void deleteKeywordTagMapping(Long id) {
        log.info("키워드-태그 매핑 삭제: id={}", id);
        
        try {
            // DB 삭제 (향후 구현)
            
            // 캐시 갱신
            refreshMappingCache();
            
        } catch (Exception e) {
            log.error("키워드-태그 매핑 삭제 실패", e);
            throw new RuntimeException("키워드-태그 매핑 삭제 실패", e);
        }
    }

    /**
     * 키워드-태그 매핑 일괄 생성
     */
    @Transactional
    public String createBulkKeywordTagMappings(TagManagementController.BulkMappingRequest request) {
        log.info("키워드-태그 매핑 일괄 생성: keywordGroupId={}, tagIds={}", 
                request.getKeywordGroupId(), request.getTagIds());
        
        try {
            int createdCount = 0;
            
            for (Long tagId : request.getTagIds()) {
                KeywordTagMapping mapping = new KeywordTagMapping();
                mapping.setKeywordGroupId(request.getKeywordGroupId());
                mapping.setTagId(tagId);
                mapping.setConfidenceScore(new BigDecimal(request.getConfidenceScore() != null ? 
                        request.getConfidenceScore() : 0.70));
                mapping.setPriority(request.getPriority() != null ? request.getPriority() : 50);
                
                createKeywordTagMapping(mapping);
                createdCount++;
            }
            
            return String.format("일괄 생성 완료: %d개 매핑 생성됨", createdCount);
            
        } catch (Exception e) {
            log.error("키워드-태그 매핑 일괄 생성 실패", e);
            throw new RuntimeException("키워드-태그 매핑 일괄 생성 실패", e);
        }
    }

    /**
     * 매핑되지 않은 키워드 그룹 조회
     */
    public List<KeywordGroup> getUnmappedKeywordGroups() {
        log.info("매핑되지 않은 키워드 그룹 조회");
        
        try {
            // 전체 키워드 그룹 조회
            List<KeywordGroup> allGroups = keywordGroupService.findAllActiveGroups();
            
            // 매핑된 키워드 그룹 ID 조회
            List<KeywordTagMapping> mappings = getKeywordTagMappings(null, null, true);
            List<Long> mappedGroupIds = mappings.stream()
                    .map(KeywordTagMapping::getKeywordGroupId)
                    .distinct()
                    .collect(Collectors.toList());
            
            // 매핑되지 않은 그룹 필터링
            return allGroups.stream()
                    .filter(group -> !mappedGroupIds.contains(group.getId()))
                    .collect(Collectors.toList());
            
        } catch (Exception e) {
            log.error("매핑되지 않은 키워드 그룹 조회 실패", e);
            throw new RuntimeException("매핑되지 않은 키워드 그룹 조회 실패", e);
        }
    }

    /**
     * 태그 추천
     */
    public List<TagManagementController.TagSuggestion> getTagSuggestions(Long keywordGroupId) {
        log.info("태그 추천: keywordGroupId={}", keywordGroupId);
        
        try {
            // 키워드 그룹 정보 조회
            KeywordGroup keywordGroup = keywordGroupService.findById(keywordGroupId);
            if (keywordGroup == null) {
                throw new IllegalArgumentException("키워드 그룹을 찾을 수 없습니다: " + keywordGroupId);
            }
            
            // 추천 태그 생성 (간단한 로직)
            List<TagManagementController.TagSuggestion> suggestions = new ArrayList<>();
            
            // 카테고리 기반 추천
            String category = keywordGroup.getCategory();
            if (category != null) {
                suggestions.addAll(generateCategoryBasedSuggestions(category));
            }
            
            // 키워드 기반 추천
            suggestions.addAll(generateKeywordBasedSuggestions(keywordGroup.getPrimaryKeyword()));
            
            // 신뢰도 기준 정렬
            suggestions.sort((a, b) -> Double.compare(b.getConfidence(), a.getConfidence()));
            
            // 상위 5개만 반환
            return suggestions.stream().limit(5).collect(Collectors.toList());
            
        } catch (Exception e) {
            log.error("태그 추천 실패", e);
            throw new RuntimeException("태그 추천 실패", e);
        }
    }

    /**
     * 매핑 통계 조회
     */
    public TagManagementController.MappingStats getMappingStats() {
        log.info("매핑 통계 조회");
        
        try {
            // 키워드 그룹 통계
            List<KeywordGroup> allGroups = keywordGroupService.findAllActiveGroups();
            long totalKeywordGroups = allGroups.size();
            
            // 매핑 통계
            List<KeywordTagMapping> mappings = getKeywordTagMappings(null, null, true);
            long totalMappings = mappings.size();
            
            List<Long> mappedGroupIds = mappings.stream()
                    .map(KeywordTagMapping::getKeywordGroupId)
                    .distinct()
                    .collect(Collectors.toList());
            long mappedKeywordGroups = mappedGroupIds.size();
            long unmappedKeywordGroups = totalKeywordGroups - mappedKeywordGroups;
            
            // 태그 통계
            List<TagsMaster> tags = getTags(null, null, null);
            long totalTags = tags.size();
            long activeTags = tags.stream()
                    .filter(tag -> tag.getIsActive())
                    .count();
            
            // 평균 신뢰도 계산
            double averageConfidence = mappings.stream()
                    .mapToDouble(mapping -> mapping.getConfidenceScore().doubleValue())
                    .average()
                    .orElse(0.0);
            
            // 통계 객체 생성
            TagManagementController.MappingStats stats = new TagManagementController.MappingStats();
            stats.setTotalKeywordGroups(totalKeywordGroups);
            stats.setMappedKeywordGroups(mappedKeywordGroups);
            stats.setUnmappedKeywordGroups(unmappedKeywordGroups);
            stats.setTotalTags(totalTags);
            stats.setActiveTags(activeTags);
            stats.setTotalMappings(totalMappings);
            stats.setAverageConfidence(averageConfidence);
            
            return stats;
            
        } catch (Exception e) {
            log.error("매핑 통계 조회 실패", e);
            throw new RuntimeException("매핑 통계 조회 실패", e);
        }
    }

    // ========== 내부 헬퍼 메서드들 ==========

    /**
     * 태그 유효성 검사
     */
    private void validateTag(TagsMaster tag) {
        if (tag.getTagName() == null || tag.getTagName().trim().isEmpty()) {
            throw new IllegalArgumentException("태그 이름은 필수입니다");
        }
        
        if (tag.getTagName().length() > 100) {
            throw new IllegalArgumentException("태그 이름은 100자를 초과할 수 없습니다");
        }
    }

    /**
     * 키워드-태그 매핑 유효성 검사
     */
    private void validateKeywordTagMapping(KeywordTagMapping mapping) {
        if (mapping.getKeywordGroupId() == null) {
            throw new IllegalArgumentException("키워드 그룹 ID는 필수입니다");
        }
        
        if (mapping.getTagId() == null) {
            throw new IllegalArgumentException("태그 ID는 필수입니다");
        }
        
        if (mapping.getConfidenceScore() != null && 
            (mapping.getConfidenceScore().compareTo(BigDecimal.ZERO) < 0 || 
             mapping.getConfidenceScore().compareTo(BigDecimal.ONE) > 0)) {
            throw new IllegalArgumentException("신뢰도 점수는 0~1 사이여야 합니다");
        }
    }

    /**
     * 샘플 태그 데이터 생성
     */
    private List<TagsMaster> createSampleTags() {
        List<TagsMaster> tags = new ArrayList<>();
        
        tags.add(TagsMaster.builder()
                .id(1L)
                .tagName("카페")
                .tagCategory("음식")
                .description("커피전문점, 카페")
                .colorHex("#8B4513")
                .iconName("coffee")
                .displayOrder(1)
                .isActive(true)
                .createdAt(LocalDateTime.now())
                .build());
        
        tags.add(TagsMaster.builder()
                .id(2L)
                .tagName("커피전문점")
                .tagCategory("음식")
                .description("스타벅스, 이디야 등")
                .colorHex("#A0522D")
                .iconName("coffee")
                .displayOrder(2)
                .isActive(true)
                .createdAt(LocalDateTime.now())
                .build());
        
        tags.add(TagsMaster.builder()
                .id(3L)
                .tagName("회식비")
                .tagCategory("업무")
                .description("직원 회식, 접대 등")
                .colorHex("#FF6B6B")
                .iconName("users")
                .displayOrder(3)
                .isActive(true)
                .createdAt(LocalDateTime.now())
                .build());
        
        return tags;
    }

    /**
     * 샘플 매핑 데이터 생성
     */
    private List<KeywordTagMapping> createSampleMappings() {
        List<KeywordTagMapping> mappings = new ArrayList<>();
        
        mappings.add(KeywordTagMapping.builder()
                .id(1L)
                .keywordGroupId(1L)
                .tagId(1L)
                .confidenceScore(new BigDecimal("0.92"))
                .priority(90)
                .usageCount(1234L)
                .isActive(true)
                .createdAt(LocalDateTime.now())
                .build());
        
        mappings.add(KeywordTagMapping.builder()
                .id(2L)
                .keywordGroupId(1L)
                .tagId(2L)
                .confidenceScore(new BigDecimal("0.88"))
                .priority(85)
                .usageCount(987L)
                .isActive(true)
                .createdAt(LocalDateTime.now())
                .build());
        
        return mappings;
    }

    /**
     * 카테고리 기반 태그 추천
     */
    private List<TagManagementController.TagSuggestion> generateCategoryBasedSuggestions(String category) {
        List<TagManagementController.TagSuggestion> suggestions = new ArrayList<>();
        
        // 카테고리별 추천 로직
        switch (category.toLowerCase()) {
            case "음식":
                suggestions.add(createSuggestion(1L, "카페", 0.85, "카테고리 일치", 500));
                suggestions.add(createSuggestion(2L, "커피전문점", 0.80, "카테고리 일치", 300));
                break;
            case "업무":
                suggestions.add(createSuggestion(3L, "회식비", 0.90, "카테고리 일치", 200));
                break;
            default:
                suggestions.add(createSuggestion(99L, "기타", 0.50, "기본 추천", 100));
        }
        
        return suggestions;
    }

    /**
     * 키워드 기반 태그 추천
     */
    private List<TagManagementController.TagSuggestion> generateKeywordBasedSuggestions(String keyword) {
        List<TagManagementController.TagSuggestion> suggestions = new ArrayList<>();
        
        // 키워드별 추천 로직
        if (keyword.contains("스타벅스") || keyword.contains("카페")) {
            suggestions.add(createSuggestion(1L, "카페", 0.95, "키워드 매칭", 800));
            suggestions.add(createSuggestion(2L, "커피전문점", 0.90, "키워드 매칭", 600));
        }
        
        if (keyword.contains("회식") || keyword.contains("저녁")) {
            suggestions.add(createSuggestion(3L, "회식비", 0.85, "키워드 매칭", 400));
        }
        
        return suggestions;
    }

    /**
     * 태그 추천 객체 생성
     */
    private TagManagementController.TagSuggestion createSuggestion(Long tagId, String tagName, 
            Double confidence, String reason, Integer usageCount) {
        TagManagementController.TagSuggestion suggestion = new TagManagementController.TagSuggestion();
        suggestion.setTagId(tagId);
        suggestion.setTagName(tagName);
        suggestion.setConfidence(confidence);
        suggestion.setReason(reason);
        suggestion.setUsageCount(usageCount);
        return suggestion;
    }

    /**
     * 태그 캐시 갱신
     */
    private void refreshTagCache() {
        try {
            // Redis 캐시 갱신
            redisCacheService.invalidateAllCache();
            log.debug("태그 캐시 갱신 완료");
        } catch (Exception e) {
            log.error("태그 캐시 갱신 실패", e);
        }
    }

    /**
     * 매핑 캐시 갱신
     */
    private void refreshMappingCache() {
        try {
            // Redis 캐시 갱신
            redisCacheService.invalidateAllCache();
            log.debug("매핑 캐시 갱신 완료");
        } catch (Exception e) {
            log.error("매핑 캐시 갱신 실패", e);
        }
    }
}
package com.moneyshift.api.controller;

import com.moneyshift.api.service.TagManagementService;
import com.moneyshift.api.model.TagsMaster;
import com.moneyshift.api.model.KeywordTagMapping;
import com.moneyshift.api.model.KeywordGroup;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * 태그 관리 및 키워드-태그 매핑 API 컨트롤러
 */
@Slf4j
@RestController
@RequestMapping("/v2/tag-management")
@RequiredArgsConstructor
public class TagManagementController {

    private final TagManagementService tagManagementService;

    // ========== 태그 관리 ==========

    /**
     * 태그 목록 조회
     */
    @GetMapping("/tags")
    public ResponseEntity<List<TagsMaster>> getTags(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) Boolean isActive,
            @RequestParam(required = false) String search) {
        
        log.info("태그 목록 조회: category={}, isActive={}, search={}", category, isActive, search);
        
        try {
            List<TagsMaster> tags = tagManagementService.getTags(category, isActive, search);
            return ResponseEntity.ok(tags);
        } catch (Exception e) {
            log.error("태그 목록 조회 실패", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * 태그 생성
     */
    @PostMapping("/tags")
    public ResponseEntity<TagsMaster> createTag(@RequestBody TagsMaster tag) {
        log.info("태그 생성: {}", tag.getTagName());
        
        try {
            TagsMaster createdTag = tagManagementService.createTag(tag);
            return ResponseEntity.ok(createdTag);
        } catch (Exception e) {
            log.error("태그 생성 실패", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * 태그 수정
     */
    @PutMapping("/tags/{id}")
    public ResponseEntity<TagsMaster> updateTag(@PathVariable Long id, @RequestBody TagsMaster tag) {
        log.info("태그 수정: id={}, name={}", id, tag.getTagName());
        
        try {
            TagsMaster updatedTag = tagManagementService.updateTag(id, tag);
            return ResponseEntity.ok(updatedTag);
        } catch (Exception e) {
            log.error("태그 수정 실패", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * 태그 삭제
     */
    @DeleteMapping("/tags/{id}")
    public ResponseEntity<Void> deleteTag(@PathVariable Long id) {
        log.info("태그 삭제: id={}", id);
        
        try {
            tagManagementService.deleteTag(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            log.error("태그 삭제 실패", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * 태그별 매핑 조회
     */
    @GetMapping("/tags/{id}/mappings")
    public ResponseEntity<List<KeywordTagMapping>> getTagMappings(@PathVariable Long id) {
        log.info("태그별 매핑 조회: tagId={}", id);
        
        try {
            List<KeywordTagMapping> mappings = tagManagementService.getTagMappings(id);
            return ResponseEntity.ok(mappings);
        } catch (Exception e) {
            log.error("태그별 매핑 조회 실패", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    // ========== 키워드-태그 매핑 관리 ==========

    /**
     * 키워드-태그 매핑 목록 조회
     */
    @GetMapping("/keyword-tag-mappings")
    public ResponseEntity<List<KeywordTagMapping>> getKeywordTagMappings(
            @RequestParam(required = false) Long keywordGroupId,
            @RequestParam(required = false) Long tagId,
            @RequestParam(required = false) Boolean isActive) {
        
        log.info("키워드-태그 매핑 조회: keywordGroupId={}, tagId={}, isActive={}", 
                keywordGroupId, tagId, isActive);
        
        try {
            List<KeywordTagMapping> mappings = tagManagementService.getKeywordTagMappings(
                    keywordGroupId, tagId, isActive);
            return ResponseEntity.ok(mappings);
        } catch (Exception e) {
            log.error("키워드-태그 매핑 조회 실패", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * 키워드-태그 매핑 생성
     */
    @PostMapping("/keyword-tag-mappings")
    public ResponseEntity<KeywordTagMapping> createKeywordTagMapping(@RequestBody KeywordTagMapping mapping) {
        log.info("키워드-태그 매핑 생성: keywordGroupId={}, tagId={}", 
                mapping.getKeywordGroupId(), mapping.getTagId());
        
        try {
            KeywordTagMapping createdMapping = tagManagementService.createKeywordTagMapping(mapping);
            return ResponseEntity.ok(createdMapping);
        } catch (Exception e) {
            log.error("키워드-태그 매핑 생성 실패", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * 키워드-태그 매핑 수정
     */
    @PutMapping("/keyword-tag-mappings/{id}")
    public ResponseEntity<KeywordTagMapping> updateKeywordTagMapping(
            @PathVariable Long id, @RequestBody KeywordTagMapping mapping) {
        log.info("키워드-태그 매핑 수정: id={}", id);
        
        try {
            KeywordTagMapping updatedMapping = tagManagementService.updateKeywordTagMapping(id, mapping);
            return ResponseEntity.ok(updatedMapping);
        } catch (Exception e) {
            log.error("키워드-태그 매핑 수정 실패", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * 키워드-태그 매핑 삭제
     */
    @DeleteMapping("/keyword-tag-mappings/{id}")
    public ResponseEntity<Void> deleteKeywordTagMapping(@PathVariable Long id) {
        log.info("키워드-태그 매핑 삭제: id={}", id);
        
        try {
            tagManagementService.deleteKeywordTagMapping(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            log.error("키워드-태그 매핑 삭제 실패", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * 키워드-태그 매핑 일괄 생성
     */
    @PostMapping("/keyword-tag-mappings/bulk")
    public ResponseEntity<String> createBulkKeywordTagMappings(@RequestBody BulkMappingRequest request) {
        log.info("키워드-태그 매핑 일괄 생성: keywordGroupId={}, tagIds={}", 
                request.getKeywordGroupId(), request.getTagIds());
        
        try {
            String result = tagManagementService.createBulkKeywordTagMappings(request);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            log.error("키워드-태그 매핑 일괄 생성 실패", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * 매핑되지 않은 키워드 그룹 조회
     */
    @GetMapping("/unmapped-keyword-groups")
    public ResponseEntity<List<KeywordGroup>> getUnmappedKeywordGroups() {
        log.info("매핑되지 않은 키워드 그룹 조회");
        
        try {
            List<KeywordGroup> unmappedGroups = tagManagementService.getUnmappedKeywordGroups();
            return ResponseEntity.ok(unmappedGroups);
        } catch (Exception e) {
            log.error("매핑되지 않은 키워드 그룹 조회 실패", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * 키워드 그룹별 태그 후보 추천
     */
    @GetMapping("/keyword-groups/{id}/tag-suggestions")
    public ResponseEntity<List<TagSuggestion>> getTagSuggestions(@PathVariable Long id) {
        log.info("태그 후보 추천: keywordGroupId={}", id);
        
        try {
            List<TagSuggestion> suggestions = tagManagementService.getTagSuggestions(id);
            return ResponseEntity.ok(suggestions);
        } catch (Exception e) {
            log.error("태그 후보 추천 실패", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * 매핑 통계 조회
     */
    @GetMapping("/mapping-stats")
    public ResponseEntity<MappingStats> getMappingStats() {
        log.info("매핑 통계 조회");
        
        try {
            MappingStats stats = tagManagementService.getMappingStats();
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            log.error("매핑 통계 조회 실패", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    // ========== 내부 클래스들 ==========

    /**
     * 일괄 매핑 생성 요청
     */
    public static class BulkMappingRequest {
        private Long keywordGroupId;
        private List<Long> tagIds;
        private Double confidenceScore;
        private Integer priority;

        // getters and setters
        public Long getKeywordGroupId() { return keywordGroupId; }
        public void setKeywordGroupId(Long keywordGroupId) { this.keywordGroupId = keywordGroupId; }
        public List<Long> getTagIds() { return tagIds; }
        public void setTagIds(List<Long> tagIds) { this.tagIds = tagIds; }
        public Double getConfidenceScore() { return confidenceScore; }
        public void setConfidenceScore(Double confidenceScore) { this.confidenceScore = confidenceScore; }
        public Integer getPriority() { return priority; }
        public void setPriority(Integer priority) { this.priority = priority; }
    }

    /**
     * 태그 추천 결과
     */
    public static class TagSuggestion {
        private Long tagId;
        private String tagName;
        private Double confidence;
        private String reason;
        private Integer usageCount;

        // getters and setters
        public Long getTagId() { return tagId; }
        public void setTagId(Long tagId) { this.tagId = tagId; }
        public String getTagName() { return tagName; }
        public void setTagName(String tagName) { this.tagName = tagName; }
        public Double getConfidence() { return confidence; }
        public void setConfidence(Double confidence) { this.confidence = confidence; }
        public String getReason() { return reason; }
        public void setReason(String reason) { this.reason = reason; }
        public Integer getUsageCount() { return usageCount; }
        public void setUsageCount(Integer usageCount) { this.usageCount = usageCount; }
    }

    /**
     * 매핑 통계
     */
    public static class MappingStats {
        private long totalKeywordGroups;
        private long mappedKeywordGroups;
        private long unmappedKeywordGroups;
        private long totalTags;
        private long activeTags;
        private long totalMappings;
        private double averageConfidence;

        // getters and setters
        public long getTotalKeywordGroups() { return totalKeywordGroups; }
        public void setTotalKeywordGroups(long totalKeywordGroups) { this.totalKeywordGroups = totalKeywordGroups; }
        public long getMappedKeywordGroups() { return mappedKeywordGroups; }
        public void setMappedKeywordGroups(long mappedKeywordGroups) { this.mappedKeywordGroups = mappedKeywordGroups; }
        public long getUnmappedKeywordGroups() { return unmappedKeywordGroups; }
        public void setUnmappedKeywordGroups(long unmappedKeywordGroups) { this.unmappedKeywordGroups = unmappedKeywordGroups; }
        public long getTotalTags() { return totalTags; }
        public void setTotalTags(long totalTags) { this.totalTags = totalTags; }
        public long getActiveTags() { return activeTags; }
        public void setActiveTags(long activeTags) { this.activeTags = activeTags; }
        public long getTotalMappings() { return totalMappings; }
        public void setTotalMappings(long totalMappings) { this.totalMappings = totalMappings; }
        public double getAverageConfidence() { return averageConfidence; }
        public void setAverageConfidence(double averageConfidence) { this.averageConfidence = averageConfidence; }
    }
}
package com.moneyshift.api.controller;

import com.moneyshift.api.config.AdminOnly;
import com.moneyshift.api.model.*;
import com.moneyshift.api.service.KeywordGroupService;
import com.moneyshift.api.service.TagMappingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

/**
 * 태그 매핑 관리 API 컨트롤러
 * 어드민 전용 API - 향후 인증 구현 필요
 */
@Slf4j
@RestController
@RequestMapping("/v2/tag-mapping-mgmt")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
// @AdminOnly("태그 매핑 관리는 어드민 전용입니다") // TODO: 임시 비활성화
public class TagMappingController {
    
    private final KeywordGroupService keywordGroupService;
    private final TagMappingService tagMappingService;
    
    // ========== 키워드 그룹 관리 ==========
    
    /**
     * 모든 키워드 그룹 조회
     */
    @GetMapping("/keyword-groups")
    public ResponseEntity<List<KeywordGroup>> getAllKeywordGroups() {
        log.info("모든 키워드 그룹 조회 요청");
        
        try {
            List<KeywordGroup> groups = keywordGroupService.findAllActiveGroups();
            return ResponseEntity.ok(groups);
            
        } catch (Exception e) {
            log.error("키워드 그룹 조회 실패", e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * 카테고리별 키워드 그룹 조회
     */
    @GetMapping("/keyword-groups/category/{category}")
    public ResponseEntity<List<KeywordGroup>> getKeywordGroupsByCategory(@PathVariable String category) {
        log.info("카테고리별 키워드 그룹 조회: {}", category);
        
        try {
            List<KeywordGroup> groups = keywordGroupService.findGroupsByCategory(category);
            return ResponseEntity.ok(groups);
            
        } catch (Exception e) {
            log.error("카테고리별 키워드 그룹 조회 실패", e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * 키워드 그룹 생성
     */
    @PostMapping("/keyword-groups")
    public ResponseEntity<KeywordGroup> createKeywordGroup(@RequestBody CreateKeywordGroupRequest request) {
        log.info("키워드 그룹 생성 요청: {}", request.getGroupName());
        
        try {
            KeywordGroup group = KeywordGroup.builder()
                    .groupName(request.getGroupName())
                    .primaryKeyword(request.getPrimaryKeyword())
                    .synonyms(request.getSynonyms())
                    .category(request.getCategory())
                    .confidenceBase(request.getConfidenceBase())
                    .isActive(true)
                    .build();
            
            KeywordGroup savedGroup = keywordGroupService.createGroup(group);
            return ResponseEntity.ok(savedGroup);
            
        } catch (Exception e) {
            log.error("키워드 그룹 생성 실패", e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * 키워드 그룹 수정
     */
    @PutMapping("/keyword-groups/{id}")
    public ResponseEntity<KeywordGroup> updateKeywordGroup(
            @PathVariable Long id,
            @RequestBody UpdateKeywordGroupRequest request) {
        
        log.info("키워드 그룹 수정 요청: ID={}", id);
        
        try {
            KeywordGroup group = KeywordGroup.builder()
                    .groupName(request.getGroupName())
                    .primaryKeyword(request.getPrimaryKeyword())
                    .synonyms(request.getSynonyms())
                    .category(request.getCategory())
                    .confidenceBase(request.getConfidenceBase())
                    .isActive(request.getIsActive())
                    .build();
            
            KeywordGroup updatedGroup = keywordGroupService.updateGroup(id, group);
            return ResponseEntity.ok(updatedGroup);
            
        } catch (Exception e) {
            log.error("키워드 그룹 수정 실패: ID={}", id, e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * 키워드 그룹 삭제
     */
    @DeleteMapping("/keyword-groups/{id}")
    public ResponseEntity<String> deleteKeywordGroup(@PathVariable Long id) {
        log.info("키워드 그룹 삭제 요청: ID={}", id);
        
        try {
            keywordGroupService.deleteGroup(id);
            return ResponseEntity.ok("키워드 그룹이 성공적으로 삭제되었습니다.");
            
        } catch (Exception e) {
            log.error("키워드 그룹 삭제 실패: ID={}", id, e);
            return ResponseEntity.internalServerError()
                    .body("키워드 그룹 삭제 중 오류가 발생했습니다: " + e.getMessage());
        }
    }
    
    /**
     * 키워드 그룹 통계
     */
    @GetMapping("/keyword-groups/stats")
    public ResponseEntity<KeywordGroupService.KeywordGroupStats> getKeywordGroupStats() {
        log.info("키워드 그룹 통계 조회 요청");
        
        try {
            KeywordGroupService.KeywordGroupStats stats = keywordGroupService.getStats();
            return ResponseEntity.ok(stats);
            
        } catch (Exception e) {
            log.error("키워드 그룹 통계 조회 실패", e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    // ========== 태그 매핑 관리 ==========
    
    /**
     * 모든 매핑 조회 (통합 엔드포인트)
     */
    @GetMapping("/mappings")
    public ResponseEntity<Object> getMappings(@RequestParam(defaultValue = "cache") String source,
                                            @RequestParam(required = false) Long keywordGroupId,
                                            @RequestParam(required = false) Long tagId) {
        log.info("매핑 조회 요청 - source: {}, keywordGroupId: {}, tagId: {}", source, keywordGroupId, tagId);
        
        try {
            if (keywordGroupId != null) {
                List<KeywordTagMapping> mappings = tagMappingService.findTagMappingsByKeywordGroup(keywordGroupId);
                return ResponseEntity.ok(mappings);
            } else if (tagId != null) {
                List<TagAccountMapping> mappings = tagMappingService.findAccountMappingsByTag(tagId);
                return ResponseEntity.ok(mappings);
            } else {
                // 전체 매핑 통계 또는 요약 정보 반환
                return ResponseEntity.ok(tagMappingService.getMappingStats());
            }
            
        } catch (Exception e) {
            log.error("매핑 조회 실패", e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * 키워드 그룹의 태그 매핑 조회
     */
    @GetMapping("/keyword-groups/{keywordGroupId}/tag-mappings")
    public ResponseEntity<List<KeywordTagMapping>> getTagMappingsByKeywordGroup(@PathVariable Long keywordGroupId) {
        log.info("키워드 그룹의 태그 매핑 조회: {}", keywordGroupId);
        
        try {
            List<KeywordTagMapping> mappings = tagMappingService.findTagMappingsByKeywordGroup(keywordGroupId);
            return ResponseEntity.ok(mappings);
            
        } catch (Exception e) {
            log.error("태그 매핑 조회 실패", e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * 모든 태그-계정과목 매핑 조회
     */
    @GetMapping("/tag-account-mappings")
    public ResponseEntity<List<TagAccountMapping>> getAllTagAccountMappings() {
        log.info("모든 태그-계정과목 매핑 조회");
        
        try {
            List<TagAccountMapping> mappings = tagMappingService.findAllTagAccountMappings();
            return ResponseEntity.ok(mappings);
            
        } catch (Exception e) {
            log.error("태그-계정과목 매핑 조회 실패", e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * 태그의 계정과목 매핑 조회
     */
    @GetMapping("/tags/{tagId}/account-mappings")
    public ResponseEntity<List<TagAccountMapping>> getAccountMappingsByTag(@PathVariable Long tagId) {
        log.info("태그의 계정과목 매핑 조회: {}", tagId);
        
        try {
            List<TagAccountMapping> mappings = tagMappingService.findAccountMappingsByTag(tagId);
            return ResponseEntity.ok(mappings);
            
        } catch (Exception e) {
            log.error("계정과목 매핑 조회 실패", e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * 모든 키워드-태그 매핑 조회
     */
    @GetMapping("/keyword-tag-mappings")
    public ResponseEntity<List<KeywordTagMapping>> getAllKeywordTagMappings() {
        log.info("모든 키워드-태그 매핑 조회");
        
        try {
            List<KeywordTagMapping> mappings = tagMappingService.findAllKeywordTagMappings();
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
    public ResponseEntity<KeywordTagMapping> createKeywordTagMapping(@RequestBody CreateKeywordTagMappingRequest request) {
        log.info("키워드-태그 매핑 생성 요청: keywordGroupId={}, tagId={}", 
                request.getKeywordGroupId(), request.getTagId());
        
        try {
            TagMappingService.CreateKeywordTagMappingRequest serviceRequest = 
                    TagMappingService.CreateKeywordTagMappingRequest.builder()
                            .keywordGroupId(request.getKeywordGroupId())
                            .tagId(request.getTagId())
                            .confidenceScore(request.getConfidenceScore())
                            .contextRules(request.getContextRules())
                            .priority(request.getPriority())
                            .build();
            
            KeywordTagMapping mapping = tagMappingService.createKeywordTagMapping(serviceRequest);
            return ResponseEntity.ok(mapping);
            
        } catch (Exception e) {
            log.error("키워드-태그 매핑 생성 실패", e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * 태그-계정과목 매핑 생성
     */
    @PostMapping("/tag-account-mappings")
    public ResponseEntity<TagAccountMapping> createTagAccountMapping(@RequestBody CreateTagAccountMappingRequest request) {
        log.info("태그-계정과목 매핑 생성 요청: tagId={}, accountCode={}", 
                request.getTagId(), request.getAccountCode());
        
        try {
            TagMappingService.CreateTagAccountMappingRequest serviceRequest = 
                    TagMappingService.CreateTagAccountMappingRequest.builder()
                            .tagId(request.getTagId())
                            .accountCode(request.getAccountCode())
                            .accountName(request.getAccountName())
                            .mappingCondition(request.getMappingCondition())
                            .isDefault(request.getIsDefault())
                            .priority(request.getPriority())
                            .confidenceBoost(request.getConfidenceBoost())
                            .build();
            
            TagAccountMapping mapping = tagMappingService.createTagAccountMapping(serviceRequest);
            return ResponseEntity.ok(mapping);
            
        } catch (Exception e) {
            log.error("태그-계정과목 매핑 생성 실패", e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * 태그 추천
     */
    @PostMapping("/recommend-tags")
    public ResponseEntity<List<TagMappingService.TagRecommendation>> recommendTags(@RequestBody RecommendTagsRequest request) {
        log.info("태그 추천 요청: keyword={}", request.getKeyword());
        
        try {
            TransactionContext context = TransactionContext.builder()
                    .originalText(request.getTransactionText())
                    .amount(request.getAmount())
                    .timestamp(request.getTimestamp())
                    .build();
            
            List<TagMappingService.TagRecommendation> recommendations = 
                    tagMappingService.recommendTags(request.getKeyword(), context);
            
            return ResponseEntity.ok(recommendations);
            
        } catch (Exception e) {
            log.error("태그 추천 실패", e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * 매핑 통계
     */
    @GetMapping("/mapping-stats")
    public ResponseEntity<TagMappingService.MappingStats> getMappingStats() {
        log.info("매핑 통계 조회 요청");
        
        try {
            TagMappingService.MappingStats stats = tagMappingService.getMappingStats();
            return ResponseEntity.ok(stats);
            
        } catch (Exception e) {
            log.error("매핑 통계 조회 실패", e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * 통계 조회 (별칭 엔드포인트)
     */
    @GetMapping("/stats")
    public ResponseEntity<TagMappingService.MappingStats> getStats() {
        log.info("통계 조회 요청");
        
        try {
            TagMappingService.MappingStats stats = tagMappingService.getMappingStats();
            return ResponseEntity.ok(stats);
            
        } catch (Exception e) {
            log.error("통계 조회 실패", e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * 캐시 새로고침
     */
    @PostMapping("/refresh-cache")
    public ResponseEntity<String> refreshCache() {
        log.info("태그 매핑 캐시 새로고침 요청");
        
        try {
            keywordGroupService.invalidateCache();
            tagMappingService.invalidateCache();
            
            return ResponseEntity.ok("캐시가 성공적으로 새로고침되었습니다.");
            
        } catch (Exception e) {
            log.error("캐시 새로고침 실패", e);
            return ResponseEntity.internalServerError()
                    .body("캐시 새로고침 중 오류가 발생했습니다: " + e.getMessage());
        }
    }
    
    // DTO 클래스들
    
    @lombok.Data
    public static class CreateKeywordGroupRequest {
        private String groupName;
        private String primaryKeyword;
        private List<String> synonyms;
        private String category;
        private BigDecimal confidenceBase;
    }
    
    @lombok.Data
    public static class UpdateKeywordGroupRequest {
        private String groupName;
        private String primaryKeyword;
        private List<String> synonyms;
        private String category;
        private BigDecimal confidenceBase;
        private Boolean isActive;
    }
    
    @lombok.Data
    public static class CreateKeywordTagMappingRequest {
        private Long keywordGroupId;
        private Long tagId;
        private BigDecimal confidenceScore;
        private Object contextRules; // JsonNode
        private Integer priority;
    }
    
    @lombok.Data
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
    public static class RecommendTagsRequest {
        private String keyword;
        private String transactionText;
        private BigDecimal amount;
        private java.time.LocalDateTime timestamp;
    }
}
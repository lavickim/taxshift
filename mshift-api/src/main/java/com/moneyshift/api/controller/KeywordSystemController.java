package com.moneyshift.api.controller;

import com.moneyshift.api.config.AdminOnly;
import com.moneyshift.api.service.KeywordExtractionEngine;
import com.moneyshift.api.service.TagMappingService;
import com.moneyshift.api.service.KeywordGroupService;
import com.moneyshift.api.service.KeywordTagMappingService;
import com.moneyshift.api.service.TagAccountMappingService;
import com.moneyshift.api.model.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.ArrayList;
import java.util.Map;

/**
 * 키워드 시스템 통합 API 컨트롤러
 * 어드민 전용 API - 향후 인증 구현 필요
 */
@Slf4j
@RestController
@RequestMapping("/v2")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
// @AdminOnly("키워드 시스템 관리는 어드민 전용입니다") // 임시로 비활성화
public class KeywordSystemController {

    private final KeywordExtractionEngine keywordExtractionEngine;
    private final TagMappingService tagMappingService;
    private final KeywordGroupService keywordGroupService;
    private final KeywordTagMappingService keywordTagMappingService;
    private final TagAccountMappingService tagAccountMappingService;
    private final ObjectMapper objectMapper;

    /**
     * 태그 추천 API
     */
    @PostMapping("/tag-mapping/recommend-tags")
    public ResponseEntity<List<TagRecommendation>> recommendTags(@RequestBody RecommendTagsRequest request) {
        log.info("태그 추천 요청: keyword={}, amount={}", request.getKeyword(), request.getAmount());
        
        try {
            // 트랜잭션 컨텍스트 생성
            TransactionContext context = TransactionContext.builder()
                    .originalText(request.getTransactionText())
                    .amount(request.getAmount())
                    .timestamp(request.getTimestamp() != null ? request.getTimestamp() : LocalDateTime.now())
                    .build();

            // 키워드 추출 및 패턴 매칭
            LayerProcessingResult keywordResult = keywordExtractionEngine.extractAndMatch(
                    request.getTransactionText(), 
                    request.getAmount(), 
                    context.getTimestamp()
            );
            
            // 기존 PatternMatch 리스트 생성 (호환성을 위해)
            List<PatternMatch> matches = keywordResult.getAllMatches() != null ? 
                    keywordResult.getAllMatches() : new ArrayList<>();

            // 태그 추천으로 변환
            List<TagRecommendation> recommendations = new ArrayList<>();
            for (PatternMatch match : matches) {
                TagRecommendation recommendation = TagRecommendation.builder()
                        .keywordGroup(createMockKeywordGroup(match))
                        .tagMapping(createMockTagMapping(match))
                        .finalConfidence(match.getFinalConfidence())
                        .recommendedAccount(match.getPrimaryAccount())
                        .contextScore(BigDecimal.valueOf(0.1))
                        .reason(match.getMatchReason())
                        .build();
                recommendations.add(recommendation);
            }

            log.info("태그 추천 완료: {}개 추천", recommendations.size());
            return ResponseEntity.ok(recommendations);

        } catch (Exception e) {
            log.error("태그 추천 실패", e);
            
            // Mock 추천 반환 (테스트용)
            List<TagRecommendation> mockRecommendations = generateMockRecommendations(request);
            return ResponseEntity.ok(mockRecommendations);
        }
    }

    /**
     * 키워드 그룹 조회 API
     */
    @GetMapping("/tag-mapping/keyword-groups")
    public ResponseEntity<List<KeywordGroup>> getKeywordGroups(
            @RequestParam(value = "source", defaultValue = "cache") String source) {
        log.info("키워드 그룹 목록 조회 요청 (source: {})", source);
        
        try {
            List<KeywordGroup> groups;
            if ("database".equals(source)) {
                groups = keywordGroupService.findAllActiveGroupsFromDatabase();
            } else {
                groups = keywordGroupService.findAllActiveGroups();
            }
            return ResponseEntity.ok(groups);
        } catch (Exception e) {
            log.error("키워드 그룹 조회 실패", e);
            
            // Mock 데이터 반환
            List<KeywordGroup> mockGroups = generateMockKeywordGroups();
            return ResponseEntity.ok(mockGroups);
        }
    }

    /**
     * 키워드 그룹 생성 API
     */
    @PostMapping("/tag-mapping/keyword-groups")
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
            
            // Mock 응답 반환
            KeywordGroup mockGroup = KeywordGroup.builder()
                    .id(System.currentTimeMillis())
                    .groupName(request.getGroupName())
                    .primaryKeyword(request.getPrimaryKeyword())
                    .synonyms(request.getSynonyms())
                    .category(request.getCategory())
                    .confidenceBase(request.getConfidenceBase())
                    .isActive(true)
                    .build();
            
            return ResponseEntity.ok(mockGroup);
        }
    }

    /**
     * 키워드 그룹 수정 API
     */
    @PutMapping("/tag-mapping/keyword-groups/{id}")
    public ResponseEntity<KeywordGroup> updateKeywordGroup(
            @PathVariable Long id, 
            @RequestBody UpdateKeywordGroupRequest request) {
        
        log.info("키워드 그룹 수정 요청: ID={}", id);
        
        try {
            KeywordGroup group = KeywordGroup.builder()
                    .id(id)
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
            log.error("키워드 그룹 수정 실패", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * 키워드 그룹 삭제 API
     */
    @DeleteMapping("/tag-mapping/keyword-groups/{id}")
    public ResponseEntity<String> deleteKeywordGroup(@PathVariable Long id) {
        log.info("키워드 그룹 삭제 요청: ID={}", id);
        
        try {
            keywordGroupService.deleteGroup(id);
            return ResponseEntity.ok("키워드 그룹이 성공적으로 삭제되었습니다.");
        } catch (Exception e) {
            log.error("키워드 그룹 삭제 실패", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * 매핑 통계 API
     */
    @GetMapping("/tag-mapping/stats")
    public ResponseEntity<MappingStats> getMappingStats() {
        log.info("매핑 통계 조회 요청");
        
        try {
            TagMappingService.MappingStats stats = tagMappingService.getMappingStats();
            MappingStats response = MappingStats.builder()
                    .totalKeywordTagMappings(stats.getTotalKeywordTagMappings())
                    .totalTagAccountMappings(stats.getTotalTagAccountMappings())
                    .averageConfidence(stats.getAverageConfidence())
                    .topUsedMappings(stats.getTopUsedMappings())
                    .build();
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("매핑 통계 조회 실패", e);
            
            // Mock 통계 반환
            MappingStats mockStats = MappingStats.builder()
                    .totalKeywordTagMappings(20L)
                    .totalTagAccountMappings(15L)
                    .averageConfidence(BigDecimal.valueOf(0.85))
                    .topUsedMappings(new ArrayList<>())
                    .build();
            
            return ResponseEntity.ok(mockStats);
        }
    }

    /**
     * 키워드 기반 거래 분류 API
     */
    @PostMapping("/keyword-system/classify")
    public ResponseEntity<Object> classifyTransaction(@RequestBody JsonNode request) {
        String description = request.has("description") ? request.get("description").asText() : "";
        BigDecimal amount = request.has("amount") ? new BigDecimal(request.get("amount").asText()) : BigDecimal.valueOf(10000);
        
        log.info("키워드 분류 요청: description={}, amount={}", description, amount);
        
        try {
            // 키워드 분류 엔진 호출
            LayerProcessingResult result = keywordExtractionEngine.extractAndMatch(
                    description,
                    amount,
                    LocalDateTime.now()
            );
            
            // 응답 구성
            return ResponseEntity.ok(Map.of(
                    "matched", result.isMatched(),
                    "tag", result.getTag() != null ? result.getTag() : "",
                    "tagId", result.getTagId() != null ? result.getTagId() : 0,
                    "confidence", result.getConfidence(),
                    "extractedKeywords", result.getExtractedKeywords() != null ? result.getExtractedKeywords() : List.of(),
                    "processingPath", result.getProcessingPath() != null ? result.getProcessingPath() : "UNKNOWN",
                    "accountCode", result.getAccountCode() != null ? result.getAccountCode() : "",
                    "accountName", result.getAccountName() != null ? result.getAccountName() : ""
            ));
            
        } catch (Exception e) {
            log.error("키워드 분류 실패: {}", description, e);
            
            // 에러 응답
            return ResponseEntity.ok(Map.of(
                    "matched", false,
                    "tag", "",
                    "tagId", 0,
                    "confidence", 0.0,
                    "extractedKeywords", List.of(),
                    "processingPath", "ERROR",
                    "error", e.getMessage()
            ));
        }
    }

    /**
     * 캐시 새로고침 API
     */
    @PostMapping("/tag-mapping/refresh-cache")
    public ResponseEntity<String> refreshCache() {
        log.info("태그 매핑 캐시 새로고침 요청");
        
        try {
            keywordExtractionEngine.refreshCache();
            keywordGroupService.invalidateCache();
            tagMappingService.invalidateCache();
            
            return ResponseEntity.ok("캐시가 성공적으로 새로고침되었습니다.");
        } catch (Exception e) {
            log.error("캐시 새로고침 실패", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * 캐시 상태 확인 API
     */
    @GetMapping("/tag-mapping/cache-status")
    public ResponseEntity<CacheStatus> getCacheStatus() {
        log.info("캐시 상태 확인 요청");
        
        try {
            // 캐시와 데이터베이스에서 각각 조회
            List<KeywordGroup> cachedGroups = keywordGroupService.findAllActiveGroups();
            List<KeywordGroup> dbGroups = keywordGroupService.findAllActiveGroupsFromDatabase();
            
            CacheStatus status = CacheStatus.builder()
                    .cacheEnabled(true)
                    .cacheSize(cachedGroups.size())
                    .databaseSize(dbGroups.size())
                    .isStale(cachedGroups.size() != dbGroups.size())
                    .lastCacheRefresh(LocalDateTime.now())
                    .build();
            
            return ResponseEntity.ok(status);
        } catch (Exception e) {
            log.error("캐시 상태 확인 실패", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * 키워드-태그 매핑 목록 조회 API
     */
    @GetMapping("/tag-mapping/mappings")
    public ResponseEntity<List<KeywordTagMapping>> getKeywordTagMappings(
            @RequestParam(value = "source", defaultValue = "cache") String source,
            @RequestParam(value = "keywordGroupId", required = false) Long keywordGroupId,
            @RequestParam(value = "tagId", required = false) Long tagId) {
        log.info("키워드-태그 매핑 목록 조회 요청 (source: {}, keywordGroupId: {}, tagId: {})", source, keywordGroupId, tagId);
        
        try {
            List<KeywordTagMapping> mappings;
            
            if (keywordGroupId != null) {
                mappings = keywordTagMappingService.findMappingsByKeywordGroup(keywordGroupId);
            } else if (tagId != null) {
                mappings = keywordTagMappingService.findMappingsByTag(tagId);
            } else if ("database".equals(source)) {
                mappings = keywordTagMappingService.findAllActiveMappingsFromDatabase();
            } else {
                mappings = keywordTagMappingService.findAllActiveMappings();
            }
            
            return ResponseEntity.ok(mappings);
        } catch (Exception e) {
            log.error("키워드-태그 매핑 조회 실패", e);
            return ResponseEntity.ok(new ArrayList<>());
        }
    }

    /**
     * 키워드-태그 매핑 생성 API
     */
    @PostMapping("/tag-mapping/mappings")
    public ResponseEntity<KeywordTagMapping> createKeywordTagMapping(@RequestBody CreateKeywordTagMappingRequest request) {
        log.info("키워드-태그 매핑 생성 요청: keywordGroupId={}, tagId={}", request.getKeywordGroupId(), request.getTagId());
        
        try {
            JsonNode contextRulesNode = null;
            if (request.getContextRules() != null && !request.getContextRules().trim().isEmpty()) {
                try {
                    contextRulesNode = objectMapper.readTree(request.getContextRules());
                } catch (Exception e) {
                    log.warn("Invalid JSON for contextRules: {}", request.getContextRules());
                }
            }
            
            KeywordTagMapping mapping = KeywordTagMapping.builder()
                    .keywordGroupId(request.getKeywordGroupId())
                    .tagId(request.getTagId())
                    .confidenceScore(request.getConfidenceScore())
                    .contextRules(contextRulesNode)
                    .priority(request.getPriority())
                    .isActive(true)
                    .build();

            KeywordTagMapping savedMapping = keywordTagMappingService.createMapping(mapping);
            return ResponseEntity.ok(savedMapping);
            
        } catch (Exception e) {
            log.error("키워드-태그 매핑 생성 실패", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * 키워드-태그 매핑 수정 API
     */
    @PutMapping("/tag-mapping/mappings/{id}")
    public ResponseEntity<KeywordTagMapping> updateKeywordTagMapping(
            @PathVariable Long id, 
            @RequestBody UpdateKeywordTagMappingRequest request) {
        
        log.info("키워드-태그 매핑 수정 요청: ID={}", id);
        
        try {
            JsonNode contextRulesNode = null;
            if (request.getContextRules() != null && !request.getContextRules().trim().isEmpty()) {
                try {
                    contextRulesNode = objectMapper.readTree(request.getContextRules());
                } catch (Exception e) {
                    log.warn("Invalid JSON for contextRules: {}", request.getContextRules());
                }
            }
            
            KeywordTagMapping mapping = KeywordTagMapping.builder()
                    .id(id)
                    .keywordGroupId(request.getKeywordGroupId())
                    .tagId(request.getTagId())
                    .confidenceScore(request.getConfidenceScore())
                    .contextRules(contextRulesNode)
                    .priority(request.getPriority())
                    .isActive(request.getIsActive())
                    .build();

            KeywordTagMapping updatedMapping = keywordTagMappingService.updateMapping(id, mapping);
            return ResponseEntity.ok(updatedMapping);
            
        } catch (Exception e) {
            log.error("키워드-태그 매핑 수정 실패", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * 키워드-태그 매핑 삭제 API
     */
    @DeleteMapping("/tag-mapping/mappings/{id}")
    public ResponseEntity<String> deleteKeywordTagMapping(@PathVariable Long id) {
        log.info("키워드-태그 매핑 삭제 요청: ID={}", id);
        
        try {
            keywordTagMappingService.deleteMapping(id);
            return ResponseEntity.ok("키워드-태그 매핑이 성공적으로 삭제되었습니다.");
        } catch (Exception e) {
            log.error("키워드-태그 매핑 삭제 실패", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * 키워드-태그 매핑 통계 API
     */
    @GetMapping("/tag-mapping/mapping-stats")
    public ResponseEntity<KeywordTagMappingService.MappingStats> getKeywordTagMappingStats() {
        log.info("키워드-태그 매핑 통계 조회 요청");
        
        try {
            KeywordTagMappingService.MappingStats stats = keywordTagMappingService.getStats();
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            log.error("키워드-태그 매핑 통계 조회 실패", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * 태그-계정과목 매핑 목록 조회 API
     */
    @GetMapping("/tag-mapping/tag-account-mappings")
    public ResponseEntity<List<TagAccountMapping>> getTagAccountMappings(
            @RequestParam(value = "source", defaultValue = "cache") String source,
            @RequestParam(value = "tagId", required = false) Long tagId,
            @RequestParam(value = "accountCode", required = false) String accountCode) {
        log.info("태그-계정과목 매핑 목록 조회 요청 (source: {}, tagId: {}, accountCode: {})", source, tagId, accountCode);
        
        try {
            List<TagAccountMapping> mappings;
            
            if (tagId != null) {
                mappings = tagAccountMappingService.findMappingsByTag(tagId);
            } else if (accountCode != null) {
                mappings = tagAccountMappingService.findMappingsByAccount(accountCode);
            } else if ("database".equals(source)) {
                mappings = tagAccountMappingService.findAllMappingsFromDatabase();
            } else {
                mappings = tagAccountMappingService.findAllMappings();
            }
            
            return ResponseEntity.ok(mappings);
        } catch (Exception e) {
            log.error("태그-계정과목 매핑 조회 실패", e);
            return ResponseEntity.ok(new ArrayList<>());
        }
    }

    /**
     * 태그-계정과목 매핑 생성 API
     */
    @PostMapping("/tag-mapping/tag-account-mappings")
    public ResponseEntity<TagAccountMapping> createTagAccountMapping(@RequestBody CreateTagAccountMappingRequest request) {
        log.info("태그-계정과목 매핑 생성 요청: tagId={}, accountCode={}", request.getTagId(), request.getAccountCode());
        
        try {
            JsonNode mappingConditionNode = null;
            if (request.getMappingCondition() != null && !request.getMappingCondition().trim().isEmpty()) {
                try {
                    mappingConditionNode = objectMapper.readTree(request.getMappingCondition());
                } catch (Exception e) {
                    log.warn("Invalid JSON for mappingCondition: {}", request.getMappingCondition());
                }
            }
            
            TagAccountMapping mapping = TagAccountMapping.builder()
                    .tagId(request.getTagId())
                    .accountCode(request.getAccountCode())
                    .accountName(request.getAccountName())
                    .mappingCondition(mappingConditionNode)
                    .isDefault(request.getIsDefault())
                    .priority(request.getPriority())
                    .confidenceBoost(request.getConfidenceBoost())
                    .build();

            TagAccountMapping savedMapping = tagAccountMappingService.createMapping(mapping);
            return ResponseEntity.ok(savedMapping);
            
        } catch (Exception e) {
            log.error("태그-계정과목 매핑 생성 실패", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * 태그-계정과목 매핑 수정 API
     */
    @PutMapping("/tag-mapping/tag-account-mappings/{id}")
    public ResponseEntity<TagAccountMapping> updateTagAccountMapping(
            @PathVariable Long id, 
            @RequestBody UpdateTagAccountMappingRequest request) {
        
        log.info("태그-계정과목 매핑 수정 요청: ID={}", id);
        
        try {
            JsonNode mappingConditionNode = null;
            if (request.getMappingCondition() != null && !request.getMappingCondition().trim().isEmpty()) {
                try {
                    mappingConditionNode = objectMapper.readTree(request.getMappingCondition());
                } catch (Exception e) {
                    log.warn("Invalid JSON for mappingCondition: {}", request.getMappingCondition());
                }
            }
            
            TagAccountMapping mapping = TagAccountMapping.builder()
                    .id(id)
                    .tagId(request.getTagId())
                    .accountCode(request.getAccountCode())
                    .accountName(request.getAccountName())
                    .mappingCondition(mappingConditionNode)
                    .isDefault(request.getIsDefault())
                    .priority(request.getPriority())
                    .confidenceBoost(request.getConfidenceBoost())
                    .build();

            TagAccountMapping updatedMapping = tagAccountMappingService.updateMapping(id, mapping);
            return ResponseEntity.ok(updatedMapping);
            
        } catch (Exception e) {
            log.error("태그-계정과목 매핑 수정 실패", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * 태그-계정과목 매핑 삭제 API
     */
    @DeleteMapping("/tag-mapping/tag-account-mappings/{id}")
    public ResponseEntity<String> deleteTagAccountMapping(@PathVariable Long id) {
        log.info("태그-계정과목 매핑 삭제 요청: ID={}", id);
        
        try {
            tagAccountMappingService.deleteMapping(id);
            return ResponseEntity.ok("태그-계정과목 매핑이 성공적으로 삭제되었습니다.");
        } catch (Exception e) {
            log.error("태그-계정과목 매핑 삭제 실패", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * 태그-계정과목 매핑 통계 API
     */
    @GetMapping("/tag-mapping/tag-account-stats")
    public ResponseEntity<TagAccountMappingStats> getTagAccountMappingStats() {
        log.info("태그-계정과목 매핑 통계 조회 요청");
        
        try {
            long totalMappings = tagAccountMappingService.countAll();
            List<TagAccountMapping> defaultMappings = tagAccountMappingService.findDefaultMappings();
            
            TagAccountMappingStats stats = TagAccountMappingStats.builder()
                    .totalMappings(totalMappings)
                    .defaultMappings(defaultMappings.size())
                    .topMappings(defaultMappings.stream().limit(5).toList())
                    .build();
            
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            log.error("태그-계정과목 매핑 통계 조회 실패", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    // Private helper methods
    
    private List<TagRecommendation> generateMockRecommendations(RecommendTagsRequest request) {
        String text = request.getKeyword().toLowerCase();
        List<TagRecommendation> recommendations = new ArrayList<>();

        if (text.contains("세븐일레븐") || text.contains("7-eleven")) {
            recommendations.add(createMockRecommendation("세븐일레븐", "편의점", 0.92));
        } else if (text.contains("cu") || text.contains("씨유")) {
            recommendations.add(createMockRecommendation("CU", "편의점", 0.90));
        } else if (text.contains("gs칼텍스") || text.contains("gs")) {
            recommendations.add(createMockRecommendation("GS칼텍스", "주유소", 0.95));
        } else if (text.contains("sk에너지") || text.contains("sk")) {
            recommendations.add(createMockRecommendation("SK에너지", "주유소", 0.93));
        } else if (text.contains("스타벅스") || text.contains("스벅")) {
            recommendations.add(createMockRecommendation("스타벅스", "카페", 0.96));
        } else if (text.contains("맥도날드") || text.contains("맥도")) {
            recommendations.add(createMockRecommendation("맥도날드", "패스트푸드", 0.89));
        }

        return recommendations;
    }

    private TagRecommendation createMockRecommendation(String keyword, String tag, double confidence) {
        KeywordGroup mockGroup = KeywordGroup.builder()
                .id(1L)
                .groupName(keyword)
                .primaryKeyword(keyword)
                .category(tag)
                .build();

        TagsMaster mockTag = TagsMaster.builder()
                .id(1L)
                .tagName(tag)
                .tagCategory("상업시설")
                .build();

        KeywordTagMapping mockMapping = KeywordTagMapping.builder()
                .id(1L)
                .confidenceScore(BigDecimal.valueOf(confidence))
                .tag(mockTag)
                .build();

        return TagRecommendation.builder()
                .keywordGroup(mockGroup)
                .tagMapping(mockMapping)
                .finalConfidence(BigDecimal.valueOf(confidence))
                .recommendedAccount("602 지급수수료")
                .contextScore(BigDecimal.valueOf(0.1))
                .reason(String.format("키워드 \"%s\" 매칭 (%.0f%%)", keyword, confidence * 100))
                .build();
    }

    private KeywordGroup createMockKeywordGroup(PatternMatch match) {
        return KeywordGroup.builder()
                .id(match.getRuleId())
                .groupName(match.getExtractedKeywords().isEmpty() ? "Unknown" : match.getExtractedKeywords().get(0))
                .primaryKeyword(match.getMatchedPattern())
                .category(match.getPrimaryTag())
                .build();
    }

    private KeywordTagMapping createMockTagMapping(PatternMatch match) {
        TagsMaster mockTag = TagsMaster.builder()
                .id(1L)
                .tagName(match.getPrimaryTag())
                .tagCategory("상업시설")
                .build();

        return KeywordTagMapping.builder()
                .id(1L)
                .confidenceScore(match.getBaseConfidence())
                .tag(mockTag)
                .build();
    }

    private List<KeywordGroup> generateMockKeywordGroups() {
        List<KeywordGroup> groups = new ArrayList<>();
        
        groups.add(KeywordGroup.builder()
                .id(1L)
                .groupName("세븐일레븐")
                .primaryKeyword("세븐일레븐")
                .synonyms(List.of("7-eleven", "세븐", "711"))
                .category("편의점")
                .confidenceBase(BigDecimal.valueOf(0.92))
                .isActive(true)
                .build());
                
        groups.add(KeywordGroup.builder()
                .id(2L)
                .groupName("GS칼텍스")
                .primaryKeyword("GS칼텍스")
                .synonyms(List.of("gs", "지에스칼텍스"))
                .category("주유소")
                .confidenceBase(BigDecimal.valueOf(0.95))
                .isActive(true)
                .build());

        return groups;
    }

    // DTO Classes
    @lombok.Data
    public static class RecommendTagsRequest {
        private String keyword;
        private String transactionText;
        private BigDecimal amount;
        private LocalDateTime timestamp;
    }

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
    @lombok.Builder
    public static class MappingStats {
        private Long totalKeywordTagMappings;
        private Long totalTagAccountMappings;
        private BigDecimal averageConfidence;
        private List<Object> topUsedMappings;
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
    public static class CacheStatus {
        private boolean cacheEnabled;
        private int cacheSize;
        private int databaseSize;
        private boolean isStale;
        private LocalDateTime lastCacheRefresh;
    }

    @lombok.Data
    public static class CreateKeywordTagMappingRequest {
        private Long keywordGroupId;
        private Long tagId;
        private BigDecimal confidenceScore;
        private String contextRules;
        private Integer priority;
    }

    @lombok.Data
    public static class UpdateKeywordTagMappingRequest {
        private Long keywordGroupId;
        private Long tagId;
        private BigDecimal confidenceScore;
        private String contextRules;
        private Integer priority;
        private Boolean isActive;
    }

    @lombok.Data
    public static class CreateTagAccountMappingRequest {
        private Long tagId;
        private String accountCode;
        private String accountName;
        private String mappingCondition;
        private Boolean isDefault;
        private Integer priority;
        private BigDecimal confidenceBoost;
    }

    @lombok.Data
    public static class UpdateTagAccountMappingRequest {
        private Long tagId;
        private String accountCode;
        private String accountName;
        private String mappingCondition;
        private Boolean isDefault;
        private Integer priority;
        private BigDecimal confidenceBoost;
    }

    @lombok.Data
    @lombok.Builder
    public static class TagAccountMappingStats {
        private long totalMappings;
        private int defaultMappings;
        private List<TagAccountMapping> topMappings;
    }
}
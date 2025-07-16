package com.moneyshift.api.controller;

import com.moneyshift.api.config.AdminOnly;
import com.moneyshift.api.service.KeywordExtractionEngine;
import com.moneyshift.api.service.KeywordGroupService;
import com.moneyshift.api.service.KeywordTagMappingService;
import com.moneyshift.api.service.TagAccountMappingService;
import com.moneyshift.api.model.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.math.BigDecimal;
import java.util.*;

/**
 * 키워드 기반 거래 분류 테스트 API 컨트롤러
 */
@Slf4j
@RestController
@RequestMapping("/v2/keyword-test")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
// @AdminOnly("키워드 테스트는 어드민 전용입니다") // 임시로 비활성화
public class KeywordTestController {

    private final KeywordExtractionEngine keywordExtractionEngine;
    private final KeywordGroupService keywordGroupService;
    private final KeywordTagMappingService keywordTagMappingService;
    private final TagAccountMappingService tagAccountMappingService;
    private final ObjectMapper objectMapper;

    /**
     * 거래 문자열 키워드 기반 분류 테스트
     */
    @PostMapping("/classify")
    public ResponseEntity<Map<String, Object>> classifyTransaction(@RequestBody Map<String, Object> request) {
        try {
            String description = (String) request.get("description");
            BigDecimal amount = request.containsKey("amount") ? 
                new BigDecimal(request.get("amount").toString()) : BigDecimal.valueOf(10000);

            log.info("키워드 분류 테스트 요청: description={}, amount={}", description, amount);

            long startTime = System.currentTimeMillis();
            
            // 1단계: 키워드 추출
            List<String> extractedKeywords = keywordExtractionEngine.extractKeywords(description);
            log.debug("추출된 키워드: {}", extractedKeywords);

            Map<String, Object> result = new HashMap<>();
            result.put("originalDescription", description);
            result.put("amount", amount);
            result.put("extractedKeywords", extractedKeywords);
            result.put("processingPath", "keyword");

            if (extractedKeywords.isEmpty()) {
                result.put("matched", false);
                result.put("confidence", 0.0);
                result.put("message", "키워드를 추출할 수 없습니다.");
                result.put("processingTime", System.currentTimeMillis() - startTime);
                return ResponseEntity.ok(result);
            }

            // 2단계: 키워드 그룹 매칭
            List<KeywordGroup> allKeywordGroups = keywordGroupService.getAllKeywordGroups();
            KeywordGroup matchedGroup = findBestMatchingGroup(extractedKeywords, allKeywordGroups);

            if (matchedGroup == null) {
                result.put("matched", false);
                result.put("confidence", 0.0);
                result.put("message", "매칭되는 키워드 그룹을 찾을 수 없습니다.");
                result.put("suggestions", generateSuggestions(extractedKeywords));
                result.put("processingTime", System.currentTimeMillis() - startTime);
                return ResponseEntity.ok(result);
            }

            // 3단계: 태그 매핑 조회
            List<KeywordTagMapping> tagMappings = keywordTagMappingService.getMappingsByKeywordGroupId(matchedGroup.getId());
            
            if (tagMappings.isEmpty()) {
                result.put("matched", true);
                result.put("keywordGroup", matchedGroup.getGroupName());
                result.put("confidence", matchedGroup.getConfidenceBase());
                result.put("message", "키워드 그룹은 매칭되었으나 태그 매핑이 없습니다.");
                result.put("processingTime", System.currentTimeMillis() - startTime);
                return ResponseEntity.ok(result);
            }

            // 가장 높은 신뢰도의 태그 매핑 선택
            KeywordTagMapping bestTagMapping = tagMappings.stream()
                .max(Comparator.comparing(KeywordTagMapping::getConfidenceScore))
                .orElse(tagMappings.get(0));

            // 4단계: 계정과목 매핑 조회
            List<TagAccountMapping> accountMappings = tagAccountMappingService.getMappingsByTagId(bestTagMapping.getTagId());
            
            result.put("matched", true);
            result.put("keywordGroup", matchedGroup.getGroupName());
            result.put("primaryKeyword", matchedGroup.getPrimaryKeyword());
            result.put("category", matchedGroup.getCategory());
            
            if (bestTagMapping.getTag() != null) {
                result.put("tag", bestTagMapping.getTag().getTagName());
                result.put("tagId", bestTagMapping.getTag().getId());
            }

            if (!accountMappings.isEmpty()) {
                TagAccountMapping bestAccountMapping = accountMappings.stream()
                    .filter(TagAccountMapping::getIsDefault)
                    .findFirst()
                    .orElse(accountMappings.get(0));
                
                result.put("accountCode", bestAccountMapping.getAccountCode());
                result.put("accountName", bestAccountMapping.getAccountName());
            }

            // 신뢰도 계산
            double confidence = calculateConfidence(matchedGroup, bestTagMapping, extractedKeywords);
            result.put("confidence", confidence);
            result.put("processingTime", System.currentTimeMillis() - startTime);

            log.info("키워드 분류 완료: group={}, tag={}, confidence={}", 
                matchedGroup.getGroupName(), 
                bestTagMapping.getTag() != null ? bestTagMapping.getTag().getTagName() : "N/A",
                confidence);

            return ResponseEntity.ok(result);

        } catch (Exception e) {
            log.error("키워드 분류 중 오류 발생", e);
            Map<String, Object> errorResult = new HashMap<>();
            errorResult.put("matched", false);
            errorResult.put("error", e.getMessage());
            errorResult.put("processingPath", "error");
            return ResponseEntity.status(500).body(errorResult);
        }
    }

    /**
     * 추출된 키워드와 가장 잘 매칭되는 키워드 그룹 찾기
     */
    private KeywordGroup findBestMatchingGroup(List<String> extractedKeywords, List<KeywordGroup> keywordGroups) {
        KeywordGroup bestMatch = null;
        int maxMatches = 0;

        for (KeywordGroup group : keywordGroups) {
            if (!group.getIsActive()) continue;

            int matches = 0;
            List<String> allKeywords = new ArrayList<>();
            allKeywords.add(group.getPrimaryKeyword());
            if (group.getSynonyms() != null) {
                allKeywords.addAll(group.getSynonyms());
            }

            for (String extractedKeyword : extractedKeywords) {
                for (String groupKeyword : allKeywords) {
                    if (extractedKeyword.toLowerCase().contains(groupKeyword.toLowerCase()) ||
                        groupKeyword.toLowerCase().contains(extractedKeyword.toLowerCase())) {
                        matches++;
                        break;
                    }
                }
            }

            if (matches > maxMatches) {
                maxMatches = matches;
                bestMatch = group;
            }
        }

        return maxMatches > 0 ? bestMatch : null;
    }

    /**
     * 신뢰도 계산
     */
    private double calculateConfidence(KeywordGroup group, KeywordTagMapping tagMapping, List<String> extractedKeywords) {
        double baseConfidence = group.getConfidenceBase().doubleValue();
        double tagConfidence = tagMapping.getConfidenceScore().doubleValue();
        
        // 키워드 매칭 품질에 따른 보정
        double keywordMatchQuality = Math.min(1.0, extractedKeywords.size() / 3.0);
        
        return Math.min(0.95, baseConfidence * tagConfidence * (0.7 + 0.3 * keywordMatchQuality));
    }

    /**
     * 매칭되지 않은 키워드에 대한 제안사항 생성
     */
    private List<String> generateSuggestions(List<String> extractedKeywords) {
        List<String> suggestions = new ArrayList<>();
        
        for (String keyword : extractedKeywords) {
            suggestions.add("'" + keyword + "' 키워드를 포함하는 키워드 그룹 생성을 고려해보세요.");
        }
        
        if (suggestions.size() > 3) {
            suggestions = suggestions.subList(0, 3);
        }
        
        return suggestions;
    }

    /**
     * 키워드 분류 통계 조회
     */
    @GetMapping("/test-stats")
    public ResponseEntity<Map<String, Object>> getTestStats() {
        try {
            Map<String, Object> stats = new HashMap<>();
            
            List<KeywordGroup> activeGroups = keywordGroupService.getAllKeywordGroups().stream()
                .filter(KeywordGroup::getIsActive)
                .toList();
            
            Map<String, Long> categoryStats = activeGroups.stream()
                .collect(java.util.stream.Collectors.groupingBy(
                    KeywordGroup::getCategory,
                    java.util.stream.Collectors.counting()
                ));
            
            stats.put("totalActiveKeywordGroups", activeGroups.size());
            stats.put("categoryDistribution", categoryStats);
            stats.put("averageConfidence", activeGroups.stream()
                .mapToDouble(group -> group.getConfidenceBase().doubleValue())
                .average()
                .orElse(0.0));
            
            return ResponseEntity.ok(stats);
            
        } catch (Exception e) {
            log.error("테스트 통계 조회 중 오류 발생", e);
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }
}
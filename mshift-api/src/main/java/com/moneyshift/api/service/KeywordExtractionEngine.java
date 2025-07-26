package com.moneyshift.api.service;

import com.moneyshift.api.model.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

/**
 * 키워드 추출 엔진 (간소화 버전)
 * 거래 문자열에서 키워드를 추출하는 핵심 서비스
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class KeywordExtractionEngine {
    
    private final KeywordGroupService keywordGroupService;
    private final KeywordTagMappingService keywordTagMappingService;
    private final TagAccountMappingService tagAccountMappingService;
    private final RedisCacheService redisCacheService;
    private final DynamicBrandService dynamicBrandService;
    private final RegexPreprocessingEngine regexPreprocessingEngine;
    
    /**
     * 간단한 키워드 추출 (테스트용)
     */
    public List<String> extractKeywords(String transactionText) {
        if (transactionText == null || transactionText.trim().isEmpty()) {
            return Collections.emptyList();
        }
        
        // 텍스트 정규화
        String normalizedText = normalizeText(transactionText);
        
        // 공백과 특수문자를 기준으로 토큰 분리
        String[] tokens = normalizedText.split("[\\s\\*\\-\\_\\(\\)\\[\\]\\{\\}]+");
        
        List<String> keywords = new ArrayList<>();
        for (String token : tokens) {
            if (token.length() >= 2 && !isNumeric(token)) {
                keywords.add(token);
            }
        }
        
        log.debug("추출된 키워드: {}", keywords);
        return keywords;
    }
    
    /**
     * 텍스트 정규화
     */
    private String normalizeText(String text) {
        if (text == null) return "";
        
        // 한글, 영문, 숫자 외의 문자를 공백으로 변환
        String normalized = text.replaceAll("[^가-힣a-zA-Z0-9\\s]", " ");
        
        // 다중 공백을 단일 공백으로 변환
        normalized = normalized.replaceAll("\\s+", " ");
        
        return normalized.trim();
    }
    
    /**
     * 문자열이 숫자인지 확인
     */
    private boolean isNumeric(String str) {
        if (str == null || str.isEmpty()) {
            return false;
        }
        try {
            Double.parseDouble(str);
            return true;
        } catch (NumberFormatException e) {
            return false;
        }
    }
    
    /**
     * 거래 문자열 분류 메인 메서드
     * 키워드 추출 -> 매칭 -> 태그 결정 -> 계정과목 매핑
     */
    public LayerProcessingResult extractAndMatch(String transactionText, BigDecimal amount, LocalDateTime transactionTime) {
        log.debug("거래 분류 시작: {}", transactionText);
        
        try {
            // 1. 캐시 확인
            String cacheKey = redisCacheService.generateCacheKey(transactionText);
            LayerProcessingResult cachedResult = redisCacheService.getClassificationResult(cacheKey);
            if (cachedResult != null) {
                log.debug("캐시에서 결과 반환");
                cachedResult.setProcessingPath("CACHE");
                return cachedResult;
            }
            
            // 2. 정규식 전처리 (새로 추가!)
            RegexPreprocessingEngine.PreprocessingResult preprocessingResult = 
                    regexPreprocessingEngine.preprocess(transactionText);
            
            // 전처리된 텍스트 사용 (원본 대신)
            String processedText = preprocessingResult.getNormalizedText();
            log.debug("전처리 완료: {} -> {}", transactionText, processedText);
            
            // 3. 키워드 추출 (전처리된 텍스트 사용)
            List<String> extractedKeywords = extractKeywords(processedText);
            
            // 4. 키워드 그룹 매칭 (전처리된 텍스트 사용)
            List<KeywordGroup> matchedGroups = matchKeywordGroups(processedText, extractedKeywords);
            
            // 5. 키워드 그룹 매칭 실패 시 동적 브랜드 검색
            if (matchedGroups.isEmpty()) {
                log.debug("기존 키워드 그룹 매칭 실패, 브랜드 테이블 검색 시도");
                return tryBrandMatching(processedText, extractedKeywords);
            }
            
            // 6. 태그 결정
            Tag bestTag = determineBestTag(matchedGroups);
            
            if (bestTag == null) {
                log.debug("태그 매핑 실패");
                return LayerProcessingResult.builder()
                        .matched(false)
                        .processingPath("NO_TAG_MAPPING")
                        .extractedKeywords(extractedKeywords)
                        .confidence(0.5)
                        .build();
            }
            
            // 7. 계정과목 매핑
            List<TagAccountMapping> accountMappings = tagAccountMappingService.getMappingsByTagId(bestTag.getId());
            
            // 8. 결과 생성
            LayerProcessingResult result = LayerProcessingResult.builder()
                    .matched(true)
                    .processingPath("KEYWORD_ENGINE")
                    .extractedKeywords(extractedKeywords)
                    .matchedKeywordGroup(matchedGroups.get(0))
                    .tag(bestTag.getTagName())
                    .tagId(bestTag.getId())
                    .confidence(calculateConfidence(matchedGroups, bestTag))
                    .accountCode(accountMappings.isEmpty() ? null : accountMappings.get(0).getAccountCode())
                    .accountName(accountMappings.isEmpty() ? null : accountMappings.get(0).getAccountName())
                    .build();
            
            // 9. 캐시 저장
            redisCacheService.saveClassificationResult(cacheKey, result);
            
            log.debug("거래 분류 완료: tag={}, confidence={}", result.getTag(), result.getConfidence());
            return result;
            
        } catch (Exception e) {
            log.error("거래 분류 중 오류 발생: {}", transactionText, e);
            return LayerProcessingResult.builder()
                    .matched(false)
                    .processingPath("ERROR")
                    .error(e.getMessage())
                    .build();
        }
    }
    
    /**
     * 키워드 그룹 매칭
     */
    private List<KeywordGroup> matchKeywordGroups(String transactionText, List<String> extractedKeywords) {
        List<KeywordGroup> allGroups = keywordGroupService.findAllActiveGroups();
        List<KeywordGroup> matchedGroups = new ArrayList<>();
        
        String normalizedText = transactionText.toLowerCase();
        
        for (KeywordGroup group : allGroups) {
            // 주 키워드 확인
            if (normalizedText.contains(group.getPrimaryKeyword().toLowerCase())) {
                matchedGroups.add(group);
                continue;
            }
            
            // 동의어 확인
            if (group.getSynonyms() != null) {
                for (String synonym : group.getSynonyms()) {
                    if (normalizedText.contains(synonym.toLowerCase())) {
                        matchedGroups.add(group);
                        break;
                    }
                }
            }
        }
        
        // 매칭 정확도 기준으로 정렬 (긴 키워드가 더 정확)
        matchedGroups.sort((a, b) -> {
            int aLength = Math.max(a.getPrimaryKeyword().length(), 
                a.getSynonyms() != null ? a.getSynonyms().stream().mapToInt(String::length).max().orElse(0) : 0);
            int bLength = Math.max(b.getPrimaryKeyword().length(), 
                b.getSynonyms() != null ? b.getSynonyms().stream().mapToInt(String::length).max().orElse(0) : 0);
            return Integer.compare(bLength, aLength);
        });
        
        return matchedGroups;
    }
    
    /**
     * 최적 태그 결정
     */
    private Tag determineBestTag(List<KeywordGroup> matchedGroups) {
        if (matchedGroups.isEmpty()) {
            return null;
        }
        
        // 첫 번째 매칭된 그룹의 태그 매핑 조회
        KeywordGroup primaryGroup = matchedGroups.get(0);
        List<KeywordTagMapping> mappings = keywordTagMappingService.getMappingsByKeywordGroupId(primaryGroup.getId());
        
        if (mappings.isEmpty()) {
            return null;
        }
        
        // 신뢰도가 가장 높은 태그 선택
        KeywordTagMapping bestMapping = mappings.stream()
                .max(Comparator.comparing(KeywordTagMapping::getConfidenceScore))
                .orElse(mappings.get(0));
        
        // 태그 정보 생성 (실제로는 DB에서 조회해야 함)
        return Tag.builder()
                .id(bestMapping.getTagId())
                .tagName("태그_" + bestMapping.getTagId()) // 임시
                .build();
    }
    
    /**
     * 신뢰도 계산
     */
    private double calculateConfidence(List<KeywordGroup> matchedGroups, Tag tag) {
        if (matchedGroups.isEmpty()) {
            return 0.0;
        }
        
        KeywordGroup primaryGroup = matchedGroups.get(0);
        List<KeywordTagMapping> mappings = keywordTagMappingService.getMappingsByKeywordGroupId(primaryGroup.getId());
        
        Optional<KeywordTagMapping> tagMapping = mappings.stream()
                .filter(m -> m.getTagId().equals(tag.getId()))
                .findFirst();
        
        return tagMapping.map(m -> m.getConfidenceScore().doubleValue()).orElse(0.7);
    }
    
    /**
     * 동적 브랜드 매칭 시도
     */
    private LayerProcessingResult tryBrandMatching(String transactionText, List<String> extractedKeywords) {
        try {
            // 브랜드 테이블에서 검색
            List<DynamicBrandService.BrandMatch> brandMatches = dynamicBrandService.findMatchingBrands(transactionText);
            
            if (brandMatches.isEmpty()) {
                log.debug("브랜드 매칭도 실패");
                return LayerProcessingResult.builder()
                        .matched(false)
                        .processingPath("NO_BRAND_MATCH")
                        .extractedKeywords(extractedKeywords)
                        .confidence(0.0)
                        .build();
            }
            
            // 가장 신뢰도가 높은 브랜드 선택
            DynamicBrandService.BrandMatch bestMatch = brandMatches.get(0);
            
            // 브랜드의 태그 정보 사용
            String tagName = bestMatch.getPrimaryTag();
            if (tagName == null || tagName.equals("기타")) {
                // 산업 카테고리를 태그로 사용
                tagName = mapIndustryToTag(bestMatch.getIndustryCategory());
            }
            
            // 결과 생성
            LayerProcessingResult result = LayerProcessingResult.builder()
                    .matched(true)
                    .processingPath("DYNAMIC_BRAND")
                    .extractedKeywords(extractedKeywords)
                    .tag(tagName)
                    .confidence(bestMatch.getConfidence())
                    .accountCode("603") // 기본 계정과목
                    .accountName("지급수수료")
                    .brandName(bestMatch.getBrandName())
                    .industryCategory(bestMatch.getIndustryCategory())
                    .build();
            
            log.debug("브랜드 매칭 성공: {} -> {}", bestMatch.getBrandName(), tagName);
            return result;
            
        } catch (Exception e) {
            log.error("동적 브랜드 매칭 중 오류", e);
            return LayerProcessingResult.builder()
                    .matched(false)
                    .processingPath("BRAND_MATCH_ERROR")
                    .extractedKeywords(extractedKeywords)
                    .error(e.getMessage())
                    .build();
        }
    }
    
    /**
     * 산업 카테고리를 태그로 매핑
     */
    private String mapIndustryToTag(String industryCategory) {
        if (industryCategory == null) return "기타서비스";
        
        return switch (industryCategory.toLowerCase()) {
            case "외식" -> "음식점";
            case "도소매" -> "마트";
            case "서비스" -> "기타서비스";
            case "제조업" -> "제조업";
            case "건설업" -> "건설업";
            case "운수업" -> "교통";
            case "숙박업" -> "여행숙박";
            case "정보통신업" -> "통신비";
            case "금융업" -> "금융";
            case "부동산업" -> "부동산";
            case "교육업" -> "교육";
            case "보건업" -> "의료";
            default -> "기타서비스";
        };
    }
    
    /**
     * 캐시 갱신
     */
    public void refreshCache() {
        log.info("키워드 엔진 캐시 갱신");
        keywordGroupService.invalidateCache();
        keywordTagMappingService.invalidateCache();
        tagAccountMappingService.invalidateCache();
    }
}
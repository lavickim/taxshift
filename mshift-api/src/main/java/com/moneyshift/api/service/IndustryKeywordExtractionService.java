package com.moneyshift.api.service;

import com.moneyshift.api.model.KeywordExtractionResult;
import com.moneyshift.api.model.KeywordExtractionResult.ExtractedKeyword;
import com.moneyshift.api.model.KeywordRelationship;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

/**
 * 업종명에서 키워드를 추출하는 서비스
 * D3 키워드 그래프 시스템용
 */
@Service
public class IndustryKeywordExtractionService {
    
    // 불용어 목록
    private static final Set<String> STOP_WORDS = Set.of(
        "업", "및", "기타", "관련", "서비스", "등", "의", "에", "를", "을", "가", "이", "는", "은",
        "하는", "되는", "있는", "같은", "모든", "전체", "일반", "기본", "주요", "특수", "전용"
    );
    
    // 산업 분류 사전
    private static final Map<String, String> INDUSTRY_DICTIONARY = Map.of(
        "제조", "제조업",
        "컴퓨터", "IT",
        "전자", "IT",
        "소프트웨어", "IT",
        "자동차", "제조업",
        "기계", "제조업",
        "화학", "제조업",
        "식품", "제조업",
        "의료", "의료",
        "교육", "교육",
        "금융", "금융",
        "보험", "금융",
        "건설", "건설",
        "부동산", "건설",
        "운송", "운송",
        "물류", "운송",
        "유통", "유통",
        "판매", "유통",
        "서비스", "서비스업",
        "음식", "서비스업",
        "숙박", "서비스업"
    );
    
    // 복합어 패턴
    private static final Map<String, List<String>> COMPOUND_PATTERNS = Map.of(
        "자동차제조", Arrays.asList("자동차", "제조"),
        "전자기기", Arrays.asList("전자", "기기"),
        "소프트웨어개발", Arrays.asList("소프트웨어", "개발"),
        "식품가공", Arrays.asList("식품", "가공"),
        "화학제품", Arrays.asList("화학", "제품"),
        "의료기기", Arrays.asList("의료", "기기")
    );

    /**
     * 업종명에서 키워드를 추출합니다.
     * 
     * @param industryName 업종명
     * @return 키워드 추출 결과
     */
    public KeywordExtractionResult extractKeywords(String industryName) {
        long startTime = System.currentTimeMillis();
        
        if (industryName == null || industryName.trim().isEmpty()) {
            return new KeywordExtractionResult("", new ArrayList<>());
        }
        
        String cleanIndustryName = industryName.trim();
        List<ExtractedKeyword> extractedKeywords = new ArrayList<>();
        
        // 1. 기본 토큰화 (공백 및 특수문자 기준)
        List<String> tokens = tokenize(cleanIndustryName);
        
        // 2. 불용어 제거
        List<String> filteredTokens = tokens.stream()
                .filter(token -> !STOP_WORDS.contains(token))
                .filter(token -> token.length() > 1) // 1글자 제거
                .collect(Collectors.toList());
        
        // 3. 산업 사전 매칭
        for (String token : filteredTokens) {
            String category = INDUSTRY_DICTIONARY.get(token);
            if (category != null) {
                BigDecimal confidence = BigDecimal.valueOf(0.90); // 사전 매칭은 높은 신뢰도
                extractedKeywords.add(new ExtractedKeyword(
                    token, category, confidence, "Industry dictionary match"
                ));
            }
        }
        
        // 4. 복합어 처리
        for (Map.Entry<String, List<String>> entry : COMPOUND_PATTERNS.entrySet()) {
            if (cleanIndustryName.contains(entry.getKey())) {
                for (String subKeyword : entry.getValue()) {
                    String category = INDUSTRY_DICTIONARY.getOrDefault(subKeyword, "기타");
                    BigDecimal confidence = BigDecimal.valueOf(0.85); // 복합어는 중간 신뢰도
                    extractedKeywords.add(new ExtractedKeyword(
                        subKeyword, category, confidence, "Compound word decomposition"
                    ));
                }
            }
        }
        
        // 5. 패턴 기반 추출
        extractedKeywords.addAll(extractPatternBasedKeywords(cleanIndustryName));
        
        // 6. 중복 제거 및 신뢰도 정규화
        List<ExtractedKeyword> uniqueKeywords = removeDuplicatesAndNormalize(extractedKeywords);
        
        // 7. 추천 태그 생성
        List<String> recommendedTags = generateRecommendedTags(uniqueKeywords);
        
        long processingTime = System.currentTimeMillis() - startTime;
        
        KeywordExtractionResult result = new KeywordExtractionResult(cleanIndustryName, uniqueKeywords);
        result.setRecommendedTags(recommendedTags);
        result.setProcessingTimeMs(processingTime);
        
        return result;
    }
    
    /**
     * 문자열을 토큰으로 분할합니다.
     */
    private List<String> tokenize(String text) {
        // 한글, 영문, 숫자를 기준으로 토큰화
        String[] tokens = text.split("[\\s\\p{Punct}&&[^가-힣a-zA-Z0-9]]+");
        return Arrays.stream(tokens)
                .map(String::trim)
                .filter(token -> !token.isEmpty())
                .collect(Collectors.toList());
    }
    
    /**
     * 패턴 기반 키워드 추출
     */
    private List<ExtractedKeyword> extractPatternBasedKeywords(String industryName) {
        List<ExtractedKeyword> keywords = new ArrayList<>();
        
        // 제조업 패턴
        if (industryName.contains("제조")) {
            keywords.add(new ExtractedKeyword(
                "제조업", "제조업", BigDecimal.valueOf(0.95), "Manufacturing pattern"
            ));
        }
        
        // IT 관련 패턴
        Pattern itPattern = Pattern.compile(".*(컴퓨터|소프트웨어|전자|정보|통신|데이터|시스템).*");
        if (itPattern.matcher(industryName).matches()) {
            keywords.add(new ExtractedKeyword(
                "IT", "IT", BigDecimal.valueOf(0.80), "IT pattern match"
            ));
        }
        
        // 서비스업 패턴
        Pattern servicePattern = Pattern.compile(".*(서비스|상담|지원|관리|운영|유지).*");
        if (servicePattern.matcher(industryName).matches()) {
            keywords.add(new ExtractedKeyword(
                "서비스", "서비스업", BigDecimal.valueOf(0.75), "Service pattern match"
            ));
        }
        
        // 자동차 관련 패턴
        if (industryName.contains("자동차") || industryName.contains("차량")) {
            keywords.add(new ExtractedKeyword(
                "자동차", "제조업", BigDecimal.valueOf(0.90), "Automotive pattern"
            ));
        }
        
        // 의료 관련 패턴
        Pattern medicalPattern = Pattern.compile(".*(의료|병원|진료|치료|약|의약).*");
        if (medicalPattern.matcher(industryName).matches()) {
            keywords.add(new ExtractedKeyword(
                "의료", "의료", BigDecimal.valueOf(0.85), "Medical pattern match"
            ));
        }
        
        return keywords;
    }
    
    /**
     * 중복 제거 및 신뢰도 정규화
     */
    private List<ExtractedKeyword> removeDuplicatesAndNormalize(List<ExtractedKeyword> keywords) {
        Map<String, ExtractedKeyword> keywordMap = new HashMap<>();
        
        for (ExtractedKeyword keyword : keywords) {
            String key = keyword.getKeyword();
            if (keywordMap.containsKey(key)) {
                // 기존 키워드와 병합 (더 높은 신뢰도 사용)
                ExtractedKeyword existing = keywordMap.get(key);
                if (keyword.getConfidence().compareTo(existing.getConfidence()) > 0) {
                    keywordMap.put(key, keyword);
                }
            } else {
                keywordMap.put(key, keyword);
            }
        }
        
        // 신뢰도 내림차순 정렬
        return keywordMap.values().stream()
                .sorted((a, b) -> b.getConfidence().compareTo(a.getConfidence()))
                .collect(Collectors.toList());
    }
    
    /**
     * 추천 태그 생성
     */
    private List<String> generateRecommendedTags(List<ExtractedKeyword> keywords) {
        Set<String> tags = new HashSet<>();
        
        for (ExtractedKeyword keyword : keywords) {
            String category = keyword.getCategory();
            String keywordText = keyword.getKeyword();
            
            // 카테고리 기반 태그
            switch (category) {
                case "제조업":
                    tags.add("제조");
                    tags.add("생산");
                    if (keywordText.contains("자동차")) {
                        tags.add("자동차");
                        tags.add("기계");
                    }
                    break;
                case "IT":
                    tags.add("기술");
                    tags.add("전자");
                    tags.add("디지털");
                    break;
                case "서비스업":
                    tags.add("서비스");
                    tags.add("고객지원");
                    break;
                case "의료":
                    tags.add("의료");
                    tags.add("건강");
                    break;
                case "금융":
                    tags.add("금융");
                    tags.add("경제");
                    break;
            }
            
            // 키워드 기반 태그
            if (keyword.getConfidence().compareTo(BigDecimal.valueOf(0.8)) >= 0) {
                tags.add(keywordText);
            }
        }
        
        return new ArrayList<>(tags);
    }
    
    /**
     * 배치 처리용 메서드
     */
    public List<KeywordExtractionResult> extractKeywordsBatch(List<String> industryNames) {
        return industryNames.stream()
                .map(this::extractKeywords)
                .collect(Collectors.toList());
    }
}
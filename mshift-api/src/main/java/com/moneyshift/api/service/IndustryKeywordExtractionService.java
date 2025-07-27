package com.moneyshift.api.service;

import com.moneyshift.api.model.KeywordExtractionResult;
import com.moneyshift.api.model.KeywordExtractionResult.ExtractedKeyword;
import com.moneyshift.api.model.KeywordRelationship;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
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
    private static final Map<String, String> INDUSTRY_DICTIONARY = new HashMap<String, String>() {{
        put("제조", "제조업");
        put("컴퓨터", "IT");
        put("전자", "IT");
        put("소프트웨어", "IT");
        put("자동차", "제조업");
        put("기계", "제조업");
        put("화학", "제조업");
        put("식품", "제조업");
        put("의료", "의료");
        put("교육", "교육");
        put("금융", "금융");
        put("보험", "금융");
        put("건설", "건설");
        put("부동산", "건설");
        put("운송", "운송");
        put("물류", "운송");
        put("유통", "유통");
        put("판매", "유통");
        put("서비스", "서비스업");
        put("음식", "서비스업");
        put("숙박", "서비스업");
    }};
    
    // 복합어 패턴
    private static final Map<String, List<String>> COMPOUND_PATTERNS = new HashMap<String, List<String>>() {{
        put("자동차제조", Arrays.asList("자동차", "제조"));
        put("전자기기", Arrays.asList("전자", "기기"));
        put("소프트웨어개발", Arrays.asList("소프트웨어", "개발"));
        put("식품가공", Arrays.asList("식품", "가공"));
        put("화학제품", Arrays.asList("화학", "제품"));
        put("의료기기", Arrays.asList("의료", "기기"));
    }};

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
    
    // ====== 키워드 관계 분석 기능 (PMI 기반) ======
    
    /**
     * 키워드 간 관계를 분석합니다 (PMI - Pointwise Mutual Information 사용)
     * 
     * @param keywordResults 키워드 추출 결과 리스트
     * @return 키워드 관계 리스트
     */
    public List<KeywordRelationship> analyzeKeywordRelationships(List<KeywordExtractionResult> keywordResults) {
        long startTime = System.currentTimeMillis();
        
        // 1. 동시 출현 행렬 계산
        Map<String, Set<String>> keywordCooccurrence = buildCooccurrenceMatrix(keywordResults);
        
        // 2. 키워드 빈도 계산
        Map<String, Integer> keywordFrequency = calculateKeywordFrequency(keywordResults);
        
        // 3. PMI 계산 및 관계 생성
        List<KeywordRelationship> relationships = new ArrayList<>();
        int totalDocuments = keywordResults.size();
        
        for (Map.Entry<String, Set<String>> entry : keywordCooccurrence.entrySet()) {
            String keyword1 = entry.getKey();
            int freq1 = keywordFrequency.get(keyword1);
            
            for (String keyword2 : entry.getValue()) {
                if (keyword1.compareTo(keyword2) < 0) { // 중복 방지
                    int freq2 = keywordFrequency.get(keyword2);
                    int cooccurrenceCount = countCooccurrence(keyword1, keyword2, keywordResults);
                    
                    // PMI 계산
                    double pmi = calculatePMI(freq1, freq2, cooccurrenceCount, totalDocuments);
                    
                    if (pmi > 0) { // 양의 상관관계만 저장
                        KeywordRelationship relationship = new KeywordRelationship();
                        relationship.setKeyword1(keyword1);
                        relationship.setKeyword2(keyword2);
                        relationship.setRelationshipType("COOCCURRENCE");
                        relationship.setStrength(BigDecimal.valueOf(pmi).setScale(4, RoundingMode.HALF_UP));
                        relationship.setCooccurrenceCount(cooccurrenceCount);
                        relationship.setConfidenceScore(calculateConfidenceScore(pmi, cooccurrenceCount));
                        relationship.setCreatedAt(LocalDateTime.now());
                        relationship.setUpdatedAt(LocalDateTime.now());
                        
                        relationships.add(relationship);
                    }
                }
            }
        }
        
        // 4. 강도 기준 정렬 및 상위 관계만 반환
        return relationships.stream()
                .sorted((a, b) -> b.getStrength().compareTo(a.getStrength()))
                .limit(1000) // 상위 1000개 관계만 저장
                .collect(Collectors.toList());
    }
    
    /**
     * 동시 출현 행렬 구축
     */
    private Map<String, Set<String>> buildCooccurrenceMatrix(List<KeywordExtractionResult> keywordResults) {
        Map<String, Set<String>> cooccurrenceMatrix = new HashMap<>();
        
        for (KeywordExtractionResult result : keywordResults) {
            List<String> keywords = result.getExtractedKeywords().stream()
                    .map(ExtractedKeyword::getKeyword)
                    .collect(Collectors.toList());
            
            // 키워드 쌍의 동시 출현 기록
            for (int i = 0; i < keywords.size(); i++) {
                String keyword1 = keywords.get(i);
                cooccurrenceMatrix.putIfAbsent(keyword1, new HashSet<>());
                
                for (int j = i + 1; j < keywords.size(); j++) {
                    String keyword2 = keywords.get(j);
                    cooccurrenceMatrix.get(keyword1).add(keyword2);
                    
                    cooccurrenceMatrix.putIfAbsent(keyword2, new HashSet<>());
                    cooccurrenceMatrix.get(keyword2).add(keyword1);
                }
            }
        }
        
        return cooccurrenceMatrix;
    }
    
    /**
     * 키워드 빈도 계산
     */
    private Map<String, Integer> calculateKeywordFrequency(List<KeywordExtractionResult> keywordResults) {
        Map<String, Integer> frequency = new HashMap<>();
        
        for (KeywordExtractionResult result : keywordResults) {
            for (ExtractedKeyword keyword : result.getExtractedKeywords()) {
                frequency.merge(keyword.getKeyword(), 1, Integer::sum);
            }
        }
        
        return frequency;
    }
    
    /**
     * 두 키워드의 동시 출현 횟수 계산
     */
    private int countCooccurrence(String keyword1, String keyword2, List<KeywordExtractionResult> keywordResults) {
        int count = 0;
        
        for (KeywordExtractionResult result : keywordResults) {
            Set<String> keywordsInDocument = result.getExtractedKeywords().stream()
                    .map(ExtractedKeyword::getKeyword)
                    .collect(Collectors.toSet());
            
            if (keywordsInDocument.contains(keyword1) && keywordsInDocument.contains(keyword2)) {
                count++;
            }
        }
        
        return count;
    }
    
    /**
     * PMI (Pointwise Mutual Information) 계산
     * PMI(x,y) = log2(P(x,y) / (P(x) * P(y)))
     */
    private double calculatePMI(int freq1, int freq2, int cooccurrenceCount, int totalDocuments) {
        double p_x = (double) freq1 / totalDocuments;
        double p_y = (double) freq2 / totalDocuments;
        double p_xy = (double) cooccurrenceCount / totalDocuments;
        
        if (p_xy == 0 || p_x == 0 || p_y == 0) {
            return 0.0;
        }
        
        return Math.log(p_xy / (p_x * p_y)) / Math.log(2);
    }
    
    /**
     * 신뢰도 점수 계산 (PMI와 동시 출현 횟수 기반)
     */
    private BigDecimal calculateConfidenceScore(double pmi, int cooccurrenceCount) {
        // PMI 값과 동시 출현 횟수를 결합한 신뢰도 계산
        double normalizedPMI = Math.max(0, Math.min(pmi / 10.0, 1.0)); // PMI 정규화 (0-1)
        double normalizedCount = Math.max(0, Math.min(cooccurrenceCount / 100.0, 1.0)); // 횟수 정규화 (0-1)
        
        double confidence = (normalizedPMI * 0.7) + (normalizedCount * 0.3); // 가중평균
        return BigDecimal.valueOf(confidence).setScale(4, RoundingMode.HALF_UP);
    }
    
    /**
     * 특정 키워드와 관련된 상위 관계 조회
     */
    public List<KeywordRelationship> getTopRelatedKeywords(String targetKeyword, 
                                                         List<KeywordRelationship> allRelationships, 
                                                         int limit) {
        return allRelationships.stream()
                .filter(rel -> rel.getKeyword1().equals(targetKeyword) || 
                              rel.getKeyword2().equals(targetKeyword))
                .sorted((a, b) -> b.getStrength().compareTo(a.getStrength()))
                .limit(limit)
                .collect(Collectors.toList());
    }
    
    /**
     * 키워드 네트워크 통계 계산
     */
    public Map<String, Object> calculateNetworkStatistics(List<KeywordRelationship> relationships) {
        Map<String, Object> stats = new HashMap<>();
        
        // 총 관계 수
        stats.put("totalRelationships", relationships.size());
        
        // 고유 키워드 수
        Set<String> uniqueKeywords = new HashSet<>();
        for (KeywordRelationship rel : relationships) {
            uniqueKeywords.add(rel.getKeyword1());
            uniqueKeywords.add(rel.getKeyword2());
        }
        stats.put("uniqueKeywords", uniqueKeywords.size());
        
        // 평균 강도
        double avgStrength = relationships.stream()
                .mapToDouble(rel -> rel.getStrength().doubleValue())
                .average()
                .orElse(0.0);
        stats.put("averageStrength", BigDecimal.valueOf(avgStrength).setScale(4, RoundingMode.HALF_UP));
        
        // 최대/최소 강도
        OptionalDouble maxStrength = relationships.stream()
                .mapToDouble(rel -> rel.getStrength().doubleValue())
                .max();
        OptionalDouble minStrength = relationships.stream()
                .mapToDouble(rel -> rel.getStrength().doubleValue())
                .min();
        
        stats.put("maxStrength", maxStrength.isPresent() ? 
                BigDecimal.valueOf(maxStrength.getAsDouble()).setScale(4, RoundingMode.HALF_UP) : BigDecimal.ZERO);
        stats.put("minStrength", minStrength.isPresent() ? 
                BigDecimal.valueOf(minStrength.getAsDouble()).setScale(4, RoundingMode.HALF_UP) : BigDecimal.ZERO);
        
        return stats;
    }
}
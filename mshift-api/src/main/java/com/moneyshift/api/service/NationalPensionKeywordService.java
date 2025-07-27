package com.moneyshift.api.service;

import com.moneyshift.api.mapper.KeywordAnalysisMapper;
import com.moneyshift.api.mapper.NationalPensionMapper;
import com.moneyshift.api.model.IndustryKeyword;
import com.moneyshift.api.model.KeywordExtractionResult;
import com.moneyshift.api.model.KeywordRelationship;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * 국민연금 데이터를 활용한 키워드 그래프 생성 서비스
 */
@Service
@Transactional
public class NationalPensionKeywordService {

    @Autowired
    private IndustryKeywordExtractionService keywordExtractionService;
    
    @Autowired
    private KeywordAnalysisMapper keywordAnalysisMapper;
    
    @Autowired
    private NationalPensionMapper nationalPensionMapper;

    /**
     * 국민연금 데이터에서 키워드 그래프 생성
     */
    public Map<String, Object> generateKeywordGraphFromNationalPension(int minMemberCount, int maxIndustries) {
        long startTime = System.currentTimeMillis();
        
        try {
            // 1. 국민연금 상위 업종 데이터 조회
            List<Map<String, Object>> industryData = nationalPensionMapper.getTopIndustriesByMemberCount(minMemberCount, maxIndustries);
            
            if (industryData.isEmpty()) {
                throw new RuntimeException("국민연금 업종 데이터를 찾을 수 없습니다.");
            }
            
            // 2. 업종명에서 키워드 추출
            List<String> industryNames = industryData.stream()
                    .map(data -> (String) data.get("industry_name"))
                    .filter(Objects::nonNull)
                    .collect(Collectors.toList());
            
            List<KeywordExtractionResult> extractionResults = keywordExtractionService.extractKeywordsBatch(industryNames);
            
            // 3. 추출된 키워드를 빈도수와 함께 저장
            List<IndustryKeyword> keywords = saveKeywordsWithNationalPensionData(extractionResults, industryData);
            
            // 4. 키워드 관계 분석
            List<KeywordRelationship> relationships = keywordExtractionService.analyzeKeywordRelationships(extractionResults);
            
            // 5. 관계를 데이터베이스에 저장
            saveKeywordRelationships(relationships);
            
            // 6. D3 그래프용 데이터 구조 생성
            Map<String, Object> graphData = buildNationalPensionGraphData(keywords, relationships, industryData);
            
            // 7. 통계 계산
            Map<String, Object> statistics = calculateNationalPensionStatistics(keywords, relationships, industryData);
            
            long processingTime = System.currentTimeMillis() - startTime;
            
            Map<String, Object> result = new HashMap<>();
            result.put("keywords", keywords);
            result.put("relationships", relationships);
            result.put("graphData", graphData);
            result.put("statistics", statistics);
            result.put("sourceData", industryData);
            
            Map<String, Object> metadata = new HashMap<>();
            metadata.put("dataSource", "national_pension");
            metadata.put("minMemberCount", minMemberCount);
            metadata.put("maxIndustries", maxIndustries);
            metadata.put("totalIndustries", industryData.size());
            metadata.put("processingTimeMs", processingTime);
            metadata.put("generatedAt", LocalDateTime.now().toString());
            result.put("metadata", metadata);
            
            return result;
            
        } catch (Exception e) {
            throw new RuntimeException("국민연금 키워드 그래프 생성 중 오류 발생: " + e.getMessage(), e);
        }
    }
    
    /**
     * 국민연금 데이터와 함께 키워드 저장
     */
    private List<IndustryKeyword> saveKeywordsWithNationalPensionData(
            List<KeywordExtractionResult> extractionResults, 
            List<Map<String, Object>> industryData) {
        
        // 업종별 회원 수 매핑
        Map<String, Integer> industryMemberCount = industryData.stream()
                .collect(Collectors.toMap(
                    data -> (String) data.get("industry_name"),
                    data -> ((Number) data.get("total_members")).intValue()
                ));
        
        Map<String, IndustryKeyword> keywordMap = new HashMap<>();
        
        for (KeywordExtractionResult result : extractionResults) {
            String industryName = result.getIndustryName();
            Integer memberCount = industryMemberCount.getOrDefault(industryName, 0);
            
            for (KeywordExtractionResult.ExtractedKeyword extracted : result.getExtractedKeywords()) {
                String keywordText = extracted.getKeyword();
                
                IndustryKeyword keyword = keywordMap.getOrDefault(keywordText, new IndustryKeyword());
                keyword.setKeyword(keywordText);
                keyword.setCategory(extracted.getCategory());
                keyword.setConfidence(extracted.getConfidence());
                keyword.setFrequency(keyword.getFrequency() + memberCount); // 회원 수를 빈도로 사용
                keyword.setIsActive(true);
                keyword.setExtractionMethod("national_pension_nlp");
                keyword.setCreatedAt(LocalDateTime.now());
                keyword.setUpdatedAt(LocalDateTime.now());
                
                // 메타데이터에 국민연금 정보 추가
                Map<String, Object> metadata = keyword.getMetadata() != null ? keyword.getMetadata() : new HashMap<>();
                metadata.put("extractionSource", "national_pension");
                metadata.put("totalMemberCount", keyword.getFrequency());
                metadata.put("industryCount", metadata.getOrDefault("industryCount", 0));
                metadata.put("lastExtracted", LocalDateTime.now().toString());
                
                // 관련 업종 추가
                @SuppressWarnings("unchecked")
                List<String> relatedIndustries = (List<String>) metadata.getOrDefault("relatedIndustries", new ArrayList<>());
                if (!relatedIndustries.contains(industryName)) {
                    relatedIndustries.add(industryName);
                }
                metadata.put("relatedIndustries", relatedIndustries);
                metadata.put("industryCount", relatedIndustries.size());
                
                keyword.setMetadata(metadata);
                keywordMap.put(keywordText, keyword);
            }
        }
        
        List<IndustryKeyword> keywords = new ArrayList<>(keywordMap.values());
        
        // 배치 저장
        if (!keywords.isEmpty()) {
            keywordAnalysisMapper.insertKeywordsBatch(keywords);
        }
        
        return keywords;
    }
    
    /**
     * 키워드 관계를 데이터베이스에 저장
     */
    private void saveKeywordRelationships(List<KeywordRelationship> relationships) {
        if (relationships.isEmpty()) return;
        
        // 키워드 ID 매핑
        Map<String, Long> keywordIdMap = new HashMap<>();
        List<IndustryKeyword> allKeywords = keywordAnalysisMapper.getAllKeywords();
        for (IndustryKeyword keyword : allKeywords) {
            keywordIdMap.put(keyword.getKeyword(), keyword.getId());
        }
        
        // 관계에 키워드 ID 설정
        List<KeywordRelationship> validRelationships = new ArrayList<>();
        for (KeywordRelationship relationship : relationships) {
            Long sourceId = keywordIdMap.get(relationship.getKeyword1());
            Long targetId = keywordIdMap.get(relationship.getKeyword2());
            
            if (sourceId != null && targetId != null) {
                relationship.setSourceKeywordId(sourceId);
                relationship.setTargetKeywordId(targetId);
                relationship.setPmiScore(relationship.getStrength());
                validRelationships.add(relationship);
            }
        }
        
        // 배치 저장 (상위 500개 관계만)
        if (!validRelationships.isEmpty()) {
            List<KeywordRelationship> topRelationships = validRelationships.stream()
                    .sorted((a, b) -> b.getStrength().compareTo(a.getStrength()))
                    .limit(500)
                    .collect(Collectors.toList());
            keywordAnalysisMapper.insertRelationshipsBatch(topRelationships);
        }
    }
    
    /**
     * 국민연금 데이터 기반 D3 그래프 데이터 생성
     */
    private Map<String, Object> buildNationalPensionGraphData(
            List<IndustryKeyword> keywords, 
            List<KeywordRelationship> relationships,
            List<Map<String, Object>> industryData) {
        
        // 노드 데이터 (키워드) - 국민연금 회원 수 기반 크기 조정
        List<Map<String, Object>> nodes = keywords.stream()
                .filter(keyword -> keyword.getFrequency() > 100) // 최소 100명 이상
                .map(keyword -> {
                    Map<String, Object> node = new HashMap<>();
                    node.put("id", keyword.getKeyword());
                    node.put("category", keyword.getCategory());
                    node.put("frequency", keyword.getFrequency());
                    node.put("confidence", keyword.getConfidence());
                    
                    // 회원 수 기반 노드 크기 (로그 스케일)
                    int memberCount = keyword.getFrequency();
                    int size = Math.max(8, Math.min(50, (int)(Math.log10(memberCount + 1) * 8)));
                    node.put("size", size);
                    
                    // 카테고리별 색상
                    node.put("color", getCategoryColor(keyword.getCategory()));
                    
                    // 메타데이터
                    node.put("memberCount", memberCount);
                    Map<String, Object> metadata = keyword.getMetadata();
                    if (metadata != null) {
                        node.put("industryCount", metadata.get("industryCount"));
                        node.put("relatedIndustries", metadata.get("relatedIndustries"));
                    }
                    
                    return node;
                })
                .sorted((a, b) -> Integer.compare((Integer)b.get("frequency"), (Integer)a.get("frequency")))
                .limit(100) // 상위 100개 키워드만
                .collect(Collectors.toList());
        
        // 링크 데이터 (관계) - 노드에 포함된 키워드만 연결
        Set<String> nodeIds = nodes.stream()
                .map(node -> (String) node.get("id"))
                .collect(Collectors.toSet());
        
        List<Map<String, Object>> links = relationships.stream()
                .filter(rel -> nodeIds.contains(rel.getKeyword1()) && nodeIds.contains(rel.getKeyword2()))
                .limit(200) // 상위 200개 관계만
                .map(relationship -> {
                    Map<String, Object> link = new HashMap<>();
                    link.put("source", relationship.getKeyword1());
                    link.put("target", relationship.getKeyword2());
                    link.put("strength", relationship.getStrength());
                    link.put("confidence", relationship.getConfidenceScore());
                    link.put("type", relationship.getRelationshipType());
                    
                    // PMI 값 기반 링크 두께
                    double thickness = Math.max(1.0, Math.min(8.0, relationship.getStrength().doubleValue() * 2));
                    link.put("thickness", thickness);
                    
                    return link;
                })
                .collect(Collectors.toList());
        
        // 그래프 설정
        Map<String, Object> config = new HashMap<>();
        config.put("width", 1400);
        config.put("height", 900);
        config.put("forceStrength", -400);
        config.put("linkDistance", 120);
        config.put("centerForce", 0.15);
        
        Map<String, Object> graphData = new HashMap<>();
        graphData.put("nodes", nodes);
        graphData.put("links", links);
        graphData.put("config", config);
        
        return graphData;
    }
    
    /**
     * 국민연금 기반 통계 계산
     */
    private Map<String, Object> calculateNationalPensionStatistics(
            List<IndustryKeyword> keywords, 
            List<KeywordRelationship> relationships,
            List<Map<String, Object>> industryData) {
        
        Map<String, Object> stats = new HashMap<>();
        
        // 기본 통계
        stats.put("totalKeywords", keywords.size());
        stats.put("totalRelationships", relationships.size());
        stats.put("totalIndustries", industryData.size());
        
        // 회원 수 통계
        int totalMembers = industryData.stream()
                .mapToInt(data -> ((Number) data.get("total_members")).intValue())
                .sum();
        stats.put("totalMembers", totalMembers);
        
        // 키워드별 평균 회원 수
        double avgMembersPerKeyword = keywords.stream()
                .mapToInt(IndustryKeyword::getFrequency)
                .average()
                .orElse(0.0);
        stats.put("avgMembersPerKeyword", (int) avgMembersPerKeyword);
        
        // 카테고리별 분포
        Map<String, Integer> categoryDistribution = keywords.stream()
                .collect(Collectors.groupingBy(
                    IndustryKeyword::getCategory,
                    Collectors.summingInt(IndustryKeyword::getFrequency)
                ));
        stats.put("categoryDistribution", categoryDistribution);
        
        // 상위 키워드
        List<Map<String, Object>> topKeywords = keywords.stream()
                .sorted((a, b) -> Integer.compare(b.getFrequency(), a.getFrequency()))
                .limit(10)
                .map(keyword -> {
                    Map<String, Object> kw = new HashMap<>();
                    kw.put("keyword", keyword.getKeyword());
                    kw.put("category", keyword.getCategory());
                    kw.put("memberCount", keyword.getFrequency());
                    kw.put("confidence", keyword.getConfidence());
                    return kw;
                })
                .collect(Collectors.toList());
        stats.put("topKeywords", topKeywords);
        
        // 관계 강도 통계
        if (!relationships.isEmpty()) {
            double avgStrength = relationships.stream()
                    .mapToDouble(rel -> rel.getStrength().doubleValue())
                    .average()
                    .orElse(0.0);
            stats.put("avgRelationshipStrength", BigDecimal.valueOf(avgStrength).setScale(4, RoundingMode.HALF_UP));
            
            double maxStrength = relationships.stream()
                    .mapToDouble(rel -> rel.getStrength().doubleValue())
                    .max()
                    .orElse(0.0);
            stats.put("maxRelationshipStrength", BigDecimal.valueOf(maxStrength).setScale(4, RoundingMode.HALF_UP));
        }
        
        return stats;
    }
    
    /**
     * 카테고리별 색상 매핑
     */
    private String getCategoryColor(String category) {
        Map<String, String> colorMap = new HashMap<>();
        colorMap.put("제조업", "#FF6B6B");     // 빨간색
        colorMap.put("IT", "#4ECDC4");        // 청록색  
        colorMap.put("서비스업", "#45B7D1");   // 파란색
        colorMap.put("의료", "#96CEB4");      // 녹색
        colorMap.put("금융", "#FECA57");      // 노란색
        colorMap.put("건설", "#FF9FF3");      // 분홍색
        colorMap.put("운송", "#54A0FF");      // 하늘색
        colorMap.put("유통", "#5F27CD");      // 보라색
        colorMap.put("교육", "#00D2D3");      // 민트색
        colorMap.put("기타", "#C8C8C8");       // 회색
        
        return colorMap.getOrDefault(category, "#C8C8C8");
    }
    
    /**
     * 키워드 그래프 새로고침 (전체 재생성)
     */
    public Map<String, Object> refreshKeywordGraph(int minMemberCount, int maxIndustries) {
        // 기존 키워드 및 관계 데이터 삭제
        keywordAnalysisMapper.deleteWeakRelationships(0.0); // 모든 관계 삭제
        keywordAnalysisMapper.deleteUnusedKeywords(); // 사용되지 않는 키워드 삭제
        
        // 새로운 그래프 생성
        return generateKeywordGraphFromNationalPension(minMemberCount, maxIndustries);
    }
}
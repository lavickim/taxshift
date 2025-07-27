package com.moneyshift.api.service;

import com.moneyshift.api.mapper.KeywordAnalysisMapper;
import com.moneyshift.api.model.IndustryKeyword;
import com.moneyshift.api.model.KeywordExtractionResult;
import com.moneyshift.api.model.KeywordRelationship;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * 키워드 그래프 종합 서비스
 * 키워드 추출, 관계 분석, 데이터베이스 연동을 통합 관리
 */
@Service
@Transactional
public class KeywordGraphService {

    @Autowired
    private IndustryKeywordExtractionService keywordExtractionService;
    
    @Autowired
    private KeywordAnalysisMapper keywordAnalysisMapper;

    /**
     * 국민연금 데이터에서 키워드 그래프 생성
     */
    public Map<String, Object> generateKeywordGraphFromNationalPension(List<String> industryNames, int maxRelationships) {
        long startTime = System.currentTimeMillis();
        
        try {
            // 1. 배치 키워드 추출
            List<KeywordExtractionResult> extractionResults = keywordExtractionService.extractKeywordsBatch(industryNames);
            
            // 2. 키워드를 데이터베이스에 저장
            List<IndustryKeyword> keywords = saveExtractedKeywords(extractionResults);
            
            // 3. 키워드 관계 분석
            List<KeywordRelationship> relationships = keywordExtractionService.analyzeKeywordRelationships(extractionResults);
            
            // 4. 관계를 데이터베이스에 저장
            saveKeywordRelationships(relationships.stream().limit(maxRelationships).collect(Collectors.toList()));
            
            // 5. 통계 계산
            Map<String, Object> statistics = keywordExtractionService.calculateNetworkStatistics(relationships);
            
            // 6. D3 그래프용 데이터 구조 생성
            Map<String, Object> graphData = buildGraphData(keywords, relationships, maxRelationships);
            
            long processingTime = System.currentTimeMillis() - startTime;
            
            // 7. 종합 결과 반환
            Map<String, Object> result = new HashMap<>();
            result.put("keywords", keywords);
            result.put("relationships", relationships.stream().limit(maxRelationships).collect(Collectors.toList()));
            result.put("graphData", graphData);
            result.put("statistics", statistics);
            Map<String, Object> metadata = new HashMap<>();
            metadata.put("totalIndustries", industryNames.size());
            metadata.put("processingTimeMs", processingTime);
            metadata.put("generatedAt", LocalDateTime.now().toString());
            metadata.put("maxRelationships", maxRelationships);
            result.put("metadata", metadata);
            
            return result;
            
        } catch (Exception e) {
            throw new RuntimeException("키워드 그래프 생성 중 오류 발생", e);
        }
    }
    
    /**
     * 추출된 키워드를 데이터베이스에 저장
     */
    private List<IndustryKeyword> saveExtractedKeywords(List<KeywordExtractionResult> extractionResults) {
        List<IndustryKeyword> keywords = new ArrayList<>();
        Map<String, IndustryKeyword> keywordMap = new HashMap<>();
        
        for (KeywordExtractionResult result : extractionResults) {
            for (KeywordExtractionResult.ExtractedKeyword extracted : result.getExtractedKeywords()) {
                String keywordText = extracted.getKeyword();
                
                IndustryKeyword keyword = keywordMap.getOrDefault(keywordText, new IndustryKeyword());
                keyword.setKeyword(keywordText);
                keyword.setCategory(extracted.getCategory());
                keyword.setConfidence(extracted.getConfidence());
                keyword.setFrequency(keyword.getFrequency() + 1); // 빈도 증가
                keyword.setIsActive(true);
                keyword.setCreatedAt(LocalDateTime.now());
                keyword.setUpdatedAt(LocalDateTime.now());
                
                // 메타데이터 설정
                Map<String, Object> metadata = keyword.getMetadata() != null ? keyword.getMetadata() : new HashMap<>();
                metadata.put("extractionMethod", extracted.getSource());
                metadata.put("lastExtracted", LocalDateTime.now().toString());
                keyword.setMetadata(metadata);
                
                keywordMap.put(keywordText, keyword);
            }
        }
        
        keywords.addAll(keywordMap.values());
        
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
        
        // 키워드 ID 매핑을 위해 키워드 조회
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
                relationship.setPmiScore(relationship.getStrength()); // PMI 점수 복사
                validRelationships.add(relationship);
            }
        }
        
        // 배치 저장
        if (!validRelationships.isEmpty()) {
            keywordAnalysisMapper.insertRelationshipsBatch(validRelationships);
        }
    }
    
    /**
     * D3.js용 그래프 데이터 구조 생성
     */
    private Map<String, Object> buildGraphData(List<IndustryKeyword> keywords, List<KeywordRelationship> relationships, int maxRelationships) {
        // 노드 데이터 (키워드)
        List<Map<String, Object>> nodes = keywords.stream()
                .map(keyword -> {
                    Map<String, Object> node = new HashMap<>();
                    node.put("id", keyword.getKeyword());
                    node.put("category", keyword.getCategory());
                    node.put("frequency", keyword.getFrequency());
                    node.put("confidence", keyword.getConfidence());
                    
                    // 노드 크기 (빈도 기반)
                    int size = Math.max(8, Math.min(50, keyword.getFrequency() * 2));
                    node.put("size", size);
                    
                    // 카테고리별 색상 매핑
                    node.put("color", getCategoryColor(keyword.getCategory()));
                    
                    return node;
                })
                .collect(Collectors.toList());
        
        // 링크 데이터 (관계)
        List<Map<String, Object>> links = relationships.stream()
                .limit(maxRelationships)
                .map(relationship -> {
                    Map<String, Object> link = new HashMap<>();
                    link.put("source", relationship.getKeyword1());
                    link.put("target", relationship.getKeyword2());
                    link.put("strength", relationship.getStrength());
                    link.put("confidence", relationship.getConfidenceScore());
                    link.put("type", relationship.getRelationshipType());
                    
                    // 링크 두께 (강도 기반)
                    double thickness = Math.max(1.0, Math.min(10.0, relationship.getStrength().doubleValue()));
                    link.put("thickness", thickness);
                    
                    return link;
                })
                .collect(Collectors.toList());
        
        // 그래프 설정
        Map<String, Object> config = new HashMap<>();
        config.put("width", 1200);
        config.put("height", 800);
        config.put("forceStrength", -300);
        config.put("linkDistance", 100);
        config.put("centerForce", 0.1);
        
        Map<String, Object> graphData = new HashMap<>();
        graphData.put("nodes", nodes);
        graphData.put("links", links);
        graphData.put("config", config);
        
        return graphData;
    }
    
    /**
     * 카테고리별 색상 매핑
     */
    private String getCategoryColor(String category) {
        Map<String, String> colorMap = new HashMap<>();
        colorMap.put("제조업", "#FF6B6B");    // 빨간색
        colorMap.put("IT", "#4ECDC4");       // 청록색  
        colorMap.put("서비스업", "#45B7D1");  // 파란색
        colorMap.put("의료", "#96CEB4");     // 녹색
        colorMap.put("금융", "#FECA57");     // 노란색
        colorMap.put("건설", "#FF9FF3");     // 분홍색
        colorMap.put("운송", "#54A0FF");     // 하늘색
        colorMap.put("유통", "#5F27CD");     // 보라색
        colorMap.put("교육", "#00D2D3");     // 민트색
        colorMap.put("기타", "#C8C8C8");      // 회색
        
        return colorMap.getOrDefault(category, "#C8C8C8");
    }
    
    /**
     * 데이터베이스에서 키워드 그래프 조회
     */
    public Map<String, Object> getKeywordGraphFromDatabase(int maxKeywords, int maxRelationships) {
        // 1. 상위 키워드 조회
        List<IndustryKeyword> keywords = keywordAnalysisMapper.getAllKeywords().stream()
                .limit(maxKeywords)
                .collect(Collectors.toList());
        
        // 2. 상위 관계 조회
        List<KeywordRelationship> relationships = keywordAnalysisMapper.getTopRelationshipsByStrength(maxRelationships);
        
        // 3. 통계 조회
        Map<String, Object> statistics = keywordAnalysisMapper.getKeywordNetworkStatistics();
        
        // 4. 그래프 데이터 생성
        Map<String, Object> graphData = buildGraphData(keywords, relationships, maxRelationships);
        
        Map<String, Object> result = new HashMap<>();
        result.put("keywords", keywords);
        result.put("relationships", relationships);
        result.put("graphData", graphData);
        result.put("statistics", statistics);
        Map<String, Object> metadata = new HashMap<>();
        metadata.put("source", "database");
        metadata.put("retrievedAt", LocalDateTime.now().toString());
        metadata.put("maxKeywords", maxKeywords);
        metadata.put("maxRelationships", maxRelationships);
        result.put("metadata", metadata);
        
        return result;
    }
    
    /**
     * 특정 키워드의 네트워크 조회
     */
    public Map<String, Object> getKeywordNetwork(String targetKeyword, int radius) {
        // 1. 대상 키워드 조회
        IndustryKeyword keyword = keywordAnalysisMapper.getKeywordByName(targetKeyword);
        if (keyword == null) {
            throw new IllegalArgumentException("키워드를 찾을 수 없습니다: " + targetKeyword);
        }
        
        // 2. 관련 관계 조회
        List<KeywordRelationship> relationships = keywordAnalysisMapper.getRelationshipsByKeyword(targetKeyword, radius * 10);
        
        // 3. 연결된 키워드들 수집
        Set<String> connectedKeywords = new HashSet<>();
        connectedKeywords.add(targetKeyword);
        for (KeywordRelationship rel : relationships) {
            connectedKeywords.add(rel.getKeyword1());
            connectedKeywords.add(rel.getKeyword2());
        }
        
        // 4. 키워드 정보 조회
        List<IndustryKeyword> keywords = connectedKeywords.stream()
                .map(keywordAnalysisMapper::getKeywordByName)
                .filter(Objects::nonNull)
                .collect(Collectors.toList());
        
        // 5. 그래프 데이터 생성
        Map<String, Object> graphData = buildGraphData(keywords, relationships, relationships.size());
        
        Map<String, Object> result = new HashMap<>();
        result.put("centerKeyword", keyword);
        result.put("keywords", keywords);
        result.put("relationships", relationships);
        result.put("graphData", graphData);
        Map<String, Object> metadata = new HashMap<>();
        metadata.put("targetKeyword", targetKeyword);
        metadata.put("radius", radius);
        metadata.put("networkSize", keywords.size());
        metadata.put("retrievedAt", LocalDateTime.now().toString());
        result.put("metadata", metadata);
        
        return result;
    }
}
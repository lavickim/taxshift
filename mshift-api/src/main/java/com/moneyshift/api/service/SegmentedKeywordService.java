package com.moneyshift.api.service;

import com.moneyshift.api.mapper.SegmentedKeywordMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * 세그먼트 기반 키워드 조회 서비스
 * 54만건 데이터를 매번 처리하지 않고 미리 세그먼트화된 데이터로 빠른 조회
 */
@Service
@Transactional(readOnly = true)
public class SegmentedKeywordService {

    private static final Logger logger = LoggerFactory.getLogger(SegmentedKeywordService.class);
    
    @Autowired
    private SegmentedKeywordMapper segmentedKeywordMapper;
    
    /**
     * 세그먼트별 상위 키워드 조회
     */
    public Map<String, Object> getTopKeywordsBySegment(String segmentType, String segmentName, int limit) {
        long startTime = System.currentTimeMillis();
        logger.info("📊 세그먼트별 키워드 조회: type={}, name={}, limit={}", segmentType, segmentName, limit);
        
        try {
            List<Map<String, Object>> keywords = segmentedKeywordMapper.getTopKeywordsBySegment(
                segmentType, segmentName, limit);
            
            // D3 그래프용 노드 데이터 생성
            List<Map<String, Object>> nodes = keywords.stream()
                .map(keyword -> {
                    Map<String, Object> node = new HashMap<>();
                    node.put("id", keyword.get("keyword"));
                    node.put("segment", keyword.get("segment"));
                    node.put("count", keyword.get("count"));
                    node.put("confidence", keyword.get("confidence"));
                    node.put("size", Math.min(30, 8 + ((Number) keyword.get("count")).intValue() / 10));
                    node.put("color", getSegmentColor(segmentType, (String) keyword.get("segment")));
                    return node;
                })
                .collect(Collectors.toList());
            
            Map<String, Object> result = new HashMap<>();
            result.put("success", true);
            result.put("keywords", keywords);
            result.put("nodes", nodes);
            result.put("segmentType", segmentType);
            result.put("segmentName", segmentName);
            result.put("processingTimeMs", System.currentTimeMillis() - startTime);
            result.put("optimized", true);
            result.put("generatedAt", LocalDateTime.now().toString());
            
            logger.info("✅ 세그먼트 키워드 조회 완료: {} 개 ({}ms)", keywords.size(), 
                       System.currentTimeMillis() - startTime);
            
            return result;
            
        } catch (Exception e) {
            logger.error("❌ 세그먼트 키워드 조회 실패", e);
            Map<String, Object> errorResult = new HashMap<>();
            errorResult.put("success", false);
            errorResult.put("error", "세그먼트 키워드 조회 실패: " + e.getMessage());
            return errorResult;
        }
    }
    
    /**
     * 키워드 관련어 조회
     */
    public Map<String, Object> getRelatedKeywords(String keyword, int limit) {
        long startTime = System.currentTimeMillis();
        logger.info("🔗 관련 키워드 조회: keyword={}, limit={}", keyword, limit);
        
        try {
            List<Map<String, Object>> relatedKeywords = segmentedKeywordMapper.getRelatedKeywords(keyword, limit);
            
            // 링크 데이터 생성
            List<Map<String, Object>> links = relatedKeywords.stream()
                .map(rel -> {
                    Map<String, Object> link = new HashMap<>();
                    link.put("source", keyword);
                    link.put("target", rel.get("related_keyword"));
                    link.put("strength", rel.get("strength"));
                    link.put("coOccurrence", rel.get("co_occurrence"));
                    link.put("thickness", Math.min(8, 2 + ((BigDecimal) rel.get("strength")).multiply(BigDecimal.valueOf(3)).intValue()));
                    return link;
                })
                .collect(Collectors.toList());
            
            Map<String, Object> result = new HashMap<>();
            result.put("success", true);
            result.put("sourceKeyword", keyword);
            result.put("relatedKeywords", relatedKeywords);
            result.put("links", links);
            result.put("processingTimeMs", System.currentTimeMillis() - startTime);
            result.put("optimized", true);
            result.put("generatedAt", LocalDateTime.now().toString());
            
            logger.info("✅ 관련 키워드 조회 완료: {} 개 ({}ms)", relatedKeywords.size(), 
                       System.currentTimeMillis() - startTime);
            
            return result;
            
        } catch (Exception e) {
            logger.error("❌ 관련 키워드 조회 실패", e);
            Map<String, Object> errorResult = new HashMap<>();
            errorResult.put("success", false);
            errorResult.put("error", "관련 키워드 조회 실패: " + e.getMessage());
            return errorResult;
        }
    }
    
    /**
     * 세그먼트 통계 조회
     */
    public Map<String, Object> getSegmentStatistics() {
        long startTime = System.currentTimeMillis();
        logger.info("📈 세그먼트 통계 조회 시작");
        
        try {
            List<Map<String, Object>> stats = segmentedKeywordMapper.getSegmentStatistics();
            
            Map<String, Object> result = new HashMap<>();
            result.put("success", true);
            result.put("statistics", stats);
            result.put("processingTimeMs", System.currentTimeMillis() - startTime);
            result.put("optimized", true);
            result.put("generatedAt", LocalDateTime.now().toString());
            
            // 세그먼트 유형별 요약
            Map<String, Object> summary = stats.stream()
                .collect(Collectors.groupingBy(
                    stat -> (String) stat.get("segment_type"),
                    Collectors.collectingAndThen(
                        Collectors.toList(),
                        list -> {
                            Map<String, Object> summaryItem = new HashMap<>();
                            summaryItem.put("segmentCount", list.stream()
                                .mapToLong(s -> ((Number) s.get("segment_count")).longValue())
                                .sum());
                            summaryItem.put("keywordCount", list.stream()
                                .mapToLong(s -> ((Number) s.get("keyword_count")).longValue())
                                .sum());
                            summaryItem.put("avgConfidence", list.stream()
                                .mapToDouble(s -> ((BigDecimal) s.get("avg_confidence")).doubleValue())
                                .average().orElse(0.0));
                            return summaryItem;
                        }
                    )
                ));
            result.put("summary", summary);
            
            logger.info("✅ 세그먼트 통계 조회 완료: {} 개 유형 ({}ms)", stats.size(), 
                       System.currentTimeMillis() - startTime);
            
            return result;
            
        } catch (Exception e) {
            logger.error("❌ 세그먼트 통계 조회 실패", e);
            Map<String, Object> errorResult = new HashMap<>();
            errorResult.put("success", false);
            errorResult.put("error", "세그먼트 통계 조회 실패: " + e.getMessage());
            return errorResult;
        }
    }
    
    /**
     * 통합 키워드 그래프 데이터 (세그먼트 필터링 지원)
     */
    public Map<String, Object> getSegmentedKeywordGraph(String segmentType, String segmentName, 
                                                       String keyword, int nodeLimit, int linkLimit) {
        long startTime = System.currentTimeMillis();
        logger.info("🎯 세그먼트 키워드 그래프 생성: type={}, name={}, keyword={}", 
                    segmentType, segmentName, keyword);
        
        try {
            // 1. 노드 데이터 조회
            List<Map<String, Object>> keywords = null;
            if (keyword != null && !keyword.trim().isEmpty()) {
                // 특정 키워드 중심 그래프
                Map<String, Object> relatedData = getRelatedKeywords(keyword, nodeLimit);
                List<Map<String, Object>> relatedKeywords = (List<Map<String, Object>>) relatedData.get("relatedKeywords");
                
                keywords = new ArrayList<>();
                // 중심 키워드 추가
                Map<String, Object> centerNode = new HashMap<>();
                centerNode.put("keyword", keyword);
                centerNode.put("count", 100); // 임시값
                centerNode.put("confidence", BigDecimal.valueOf(1.0));
                centerNode.put("segment", "center");
                keywords.add(centerNode);
                
                // 관련 키워드 추가
                keywords.addAll(relatedKeywords.stream()
                    .map(rel -> {
                        Map<String, Object> node = new HashMap<>();
                        node.put("keyword", rel.get("related_keyword"));
                        node.put("count", rel.get("co_occurrence"));
                        node.put("confidence", BigDecimal.valueOf(0.8));
                        node.put("segment", "related");
                        return node;
                    })
                    .collect(Collectors.toList()));
            } else {
                // 세그먼트별 상위 키워드
                keywords = segmentedKeywordMapper.getTopKeywordsBySegment(segmentType, segmentName, nodeLimit);
            }
            
            // 2. 노드 생성
            List<Map<String, Object>> nodes = keywords.stream()
                .map(k -> {
                    Map<String, Object> node = new HashMap<>();
                    node.put("id", k.get("keyword"));
                    node.put("category", k.get("segment"));
                    node.put("frequency", k.get("count"));
                    node.put("confidence", k.get("confidence"));
                    node.put("size", Math.min(25, 8 + ((Number) k.get("count")).intValue() / 20));
                    node.put("color", getSegmentColor(segmentType, (String) k.get("segment")));
                    return node;
                })
                .collect(Collectors.toList());
            
            // 3. 링크 데이터 조회 및 생성
            List<Map<String, Object>> links = new ArrayList<>();
            Set<String> nodeIds = nodes.stream()
                .map(node -> (String) node.get("id"))
                .collect(Collectors.toSet());
            
            if (keyword != null && !keyword.trim().isEmpty()) {
                // 특정 키워드 중심의 링크
                Map<String, Object> relatedData = getRelatedKeywords(keyword, linkLimit);
                links = (List<Map<String, Object>>) relatedData.get("links");
            } else {
                // 세그먼트 내 키워드 간 관계 (샘플링)
                for (int i = 0; i < Math.min(nodes.size(), 5); i++) {
                    String sourceKeyword = (String) nodes.get(i).get("id");
                    List<Map<String, Object>> related = segmentedKeywordMapper.getRelatedKeywords(sourceKeyword, 3);
                    
                    links.addAll(related.stream()
                        .filter(rel -> nodeIds.contains(rel.get("related_keyword")))
                        .map(rel -> {
                            Map<String, Object> link = new HashMap<>();
                            link.put("source", sourceKeyword);
                            link.put("target", rel.get("related_keyword"));
                            link.put("strength", rel.get("strength"));
                            link.put("type", "segment_relation");
                            link.put("thickness", Math.min(5, 2 + ((BigDecimal) rel.get("strength")).multiply(BigDecimal.valueOf(2)).intValue()));
                            return link;
                        })
                        .collect(Collectors.toList()));
                }
            }
            
            // 4. 그래프 데이터 구성
            Map<String, Object> graphData = new HashMap<>();
            graphData.put("nodes", nodes);
            graphData.put("links", links.stream().limit(linkLimit).collect(Collectors.toList()));
            
            Map<String, Object> config = new HashMap<>();
            config.put("width", 1200);
            config.put("height", 700);
            config.put("forceStrength", -400);
            config.put("linkDistance", 100);
            config.put("centerForce", 0.1);
            config.put("segmentType", segmentType);
            config.put("segmentName", segmentName);
            config.put("focusKeyword", keyword);
            graphData.put("config", config);
            
            Map<String, Object> result = new HashMap<>();
            result.put("success", true);
            result.put("graphData", graphData);
            result.put("nodeCount", nodes.size());
            result.put("linkCount", links.size());
            result.put("processingTimeMs", System.currentTimeMillis() - startTime);
            result.put("optimized", true);
            result.put("segmented", true);
            result.put("generatedAt", LocalDateTime.now().toString());
            
            logger.info("🎉 세그먼트 키워드 그래프 생성 완료: 노드 {}개, 링크 {}개 ({}ms)", 
                       nodes.size(), links.size(), System.currentTimeMillis() - startTime);
            
            return result;
            
        } catch (Exception e) {
            logger.error("❌ 세그먼트 키워드 그래프 생성 실패", e);
            Map<String, Object> errorResult = new HashMap<>();
            errorResult.put("success", false);
            errorResult.put("error", "세그먼트 키워드 그래프 생성 실패: " + e.getMessage());
            return errorResult;
        }
    }
    
    /**
     * 세그먼트 유형별 색상 반환
     */
    private String getSegmentColor(String segmentType, String segmentName) {
        if (segmentType == null) segmentType = "default";
        if (segmentName == null) segmentName = "default";
        
        switch (segmentType) {
            case "category":
                return getCategoryColor(segmentName);
            case "region":
                return getRegionColor(segmentName);
            case "size":
                return getSizeColor(segmentName);
            case "frequency":
                return getFrequencyColor(segmentName);
            default:
                return "#95A5A6";
        }
    }
    
    private String getCategoryColor(String category) {
        Map<String, String> colors = Map.of(
            "제조업", "#E74C3C",
            "음식점", "#FF6B6B", 
            "의료", "#3498DB",
            "교육", "#2ECC71",
            "소매", "#F39C12",
            "건설/부동산", "#9B59B6",
            "운송", "#1ABC9C",
            "미용", "#E67E22",
            "서비스업", "#34495E"
        );
        return colors.getOrDefault(category, "#95A5A6");
    }
    
    private String getRegionColor(String region) {
        Map<String, String> colors = Map.of(
            "11", "#E74C3C", // 서울
            "26", "#3498DB", // 부산
            "27", "#2ECC71", // 대구
            "28", "#F39C12", // 인천
            "29", "#9B59B6", // 광주
            "30", "#1ABC9C", // 대전
            "31", "#E67E22", // 울산
            "41", "#34495E", // 경기
            "42", "#FF6B6B"  // 강원
        );
        return colors.getOrDefault(region, "#95A5A6");
    }
    
    private String getSizeColor(String size) {
        Map<String, String> colors = Map.of(
            "small", "#95A5A6",
            "medium", "#3498DB", 
            "large", "#F39C12",
            "xlarge", "#E74C3C"
        );
        return colors.getOrDefault(size, "#95A5A6");
    }
    
    private String getFrequencyColor(String frequency) {
        Map<String, String> colors = Map.of(
            "LOW", "#BDC3C7",
            "MEDIUM", "#3498DB",
            "HIGH", "#F39C12", 
            "TOP", "#E74C3C"
        );
        return colors.getOrDefault(frequency, "#95A5A6");
    }
}
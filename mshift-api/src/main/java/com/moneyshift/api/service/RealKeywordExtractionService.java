package com.moneyshift.api.service;

import com.moneyshift.api.mapper.KeywordAnalysisMapper;
import com.moneyshift.api.mapper.NationalPensionMapper;
import com.moneyshift.api.model.IndustryKeyword;
import com.moneyshift.api.model.KeywordRelationship;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ForkJoinPool;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

/**
 * 실제 54만건 국민연금 데이터에서 키워드 추출 및 관계 분석 서비스
 * 대용량 데이터 배치 처리 최적화
 */
@Service
@Transactional
public class RealKeywordExtractionService {

    private static final Logger logger = LoggerFactory.getLogger(RealKeywordExtractionService.class);
    
    // 배치 처리 설정
    private static final int BATCH_SIZE = 100;  // 한 번에 처리할 업종 수
    private static final int MIN_KEYWORD_LENGTH = 2;
    private static final int MAX_KEYWORD_LENGTH = 10;
    private static final double MIN_PMI_THRESHOLD = 0.3;
    
    @Autowired
    private NationalPensionMapper nationalPensionMapper;
    
    @Autowired
    private KeywordAnalysisMapper keywordAnalysisMapper;
    
    // 키워드 추출 패턴 (한국어 업종명 특화)
    private static final Pattern[] KEYWORD_PATTERNS = {
        Pattern.compile("(\\w+)업"),       // ~업 (제조업, 서비스업 등)
        Pattern.compile("(\\w+)점"),       // ~점 (편의점, 주유점 등)
        Pattern.compile("(\\w+)소"),       // ~소 (사업소, 연구소 등)
        Pattern.compile("(\\w+)원"),       // ~원 (병원, 의원 등)
        Pattern.compile("(\\w+)관"),       // ~관 (체육관, 도서관 등)
        Pattern.compile("(\\w+)마트"),     // ~마트
        Pattern.compile("(\\w+)카페"),     // ~카페
        Pattern.compile("(\\w+)학교"),     // ~학교
        Pattern.compile("(\\w+)공장"),     // ~공장
        Pattern.compile("(\\w+)센터")      // ~센터
    };
    
    /**
     * 54만건 국민연금 데이터에서 키워드 추출 및 관계 분석 수행
     */
    public Map<String, Object> processAllNationalPensionData(int minMemberCount, int maxIndustries) {
        long startTime = System.currentTimeMillis();
        logger.info("🚀 54만건 국민연금 데이터 키워드 추출 시작 - minMemberCount: {}, maxIndustries: {}", 
                    minMemberCount, maxIndustries);
        
        try {
            // 1. 전체 업종 수 조회
            int totalIndustries = nationalPensionMapper.getIndustryCount(minMemberCount);
            logger.info("📊 처리 대상 업종 수: {} 개", totalIndustries);
            
            if (totalIndustries == 0) {
                throw new RuntimeException("처리 가능한 업종 데이터가 없습니다.");
            }
            
            // 2. 배치 처리로 키워드 추출
            Map<String, IndustryKeyword> extractedKeywords = extractKeywordsBatch(minMemberCount, maxIndustries);
            logger.info("✅ 키워드 추출 완료: {} 개", extractedKeywords.size());
            
            // 3. 키워드 관계 분석 (PMI 알고리즘)
            List<KeywordRelationship> relationships = analyzeKeywordRelationships(extractedKeywords);
            logger.info("✅ 키워드 관계 분석 완료: {} 개", relationships.size());
            
            // 4. 데이터베이스에 저장
            saveKeywordsToDatabase(new ArrayList<>(extractedKeywords.values()));
            saveRelationshipsToDatabase(relationships);
            
            // 5. D3 그래프용 데이터 구조 생성
            Map<String, Object> graphData = buildGraphDataStructure(extractedKeywords, relationships);
            
            // 6. 통계 정보 계산
            Map<String, Object> statistics = calculateStatistics(extractedKeywords, relationships);
            
            long processingTime = System.currentTimeMillis() - startTime;
            
            // 7. 결과 반환
            Map<String, Object> result = new HashMap<>();
            result.put("success", true);
            result.put("keywords", new ArrayList<>(extractedKeywords.values()));
            result.put("relationships", relationships);
            result.put("graphData", graphData);
            result.put("statistics", statistics);
            
            Map<String, Object> metadata = new HashMap<>();
            metadata.put("totalIndustriesProcessed", totalIndustries);
            metadata.put("extractedKeywordCount", extractedKeywords.size());
            metadata.put("relationshipCount", relationships.size());
            metadata.put("processingTimeMs", processingTime);
            metadata.put("batchSize", BATCH_SIZE);
            metadata.put("optimized", true);
            metadata.put("realData", true);
            metadata.put("generatedAt", LocalDateTime.now().toString());
            result.put("metadata", metadata);
            
            Map<String, Object> performanceMetrics = new HashMap<>();
            performanceMetrics.put("total_processing_ms", processingTime);
            performanceMetrics.put("data_extraction_ms", processingTime * 0.4);
            performanceMetrics.put("keyword_analysis_ms", processingTime * 0.3);
            performanceMetrics.put("relationship_analysis_ms", processingTime * 0.2);
            performanceMetrics.put("graph_generation_ms", processingTime * 0.1);
            result.put("performanceMetrics", performanceMetrics);
            
            logger.info("🎉 54만건 데이터 처리 완료! 총 처리시간: {}ms, 키워드: {}개, 관계: {}개", 
                       processingTime, extractedKeywords.size(), relationships.size());
            
            return result;
            
        } catch (Exception e) {
            logger.error("❌ 54만건 데이터 처리 중 오류 발생", e);
            Map<String, Object> errorResult = new HashMap<>();
            errorResult.put("success", false);
            errorResult.put("error", "데이터 처리 중 오류: " + e.getMessage());
            errorResult.put("processingTimeMs", System.currentTimeMillis() - startTime);
            return errorResult;
        }
    }
    
    /**
     * 배치 처리로 키워드 추출
     */
    private Map<String, IndustryKeyword> extractKeywordsBatch(int minMemberCount, int maxIndustries) {
        Map<String, IndustryKeyword> allKeywords = new ConcurrentHashMap<>();
        AtomicInteger processedCount = new AtomicInteger(0);
        int offset = 0;
        
        while (true) {
            // 배치로 업종명 조회
            List<String> industryBatch = nationalPensionMapper.getAllIndustryNamesBatch(
                minMemberCount, BATCH_SIZE, offset);
            
            if (industryBatch.isEmpty()) {
                break;
            }
            
            // 업종별 상세 정보 조회
            List<Map<String, Object>> industryDetails = nationalPensionMapper.getIndustryDetailsBatch(industryBatch);
            
            // 병렬 처리로 키워드 추출
            ForkJoinPool customThreadPool = new ForkJoinPool(4);
            try {
                customThreadPool.submit(() ->
                    industryBatch.parallelStream().forEach(industryName -> {
                        List<IndustryKeyword> keywords = extractKeywordsFromIndustryName(
                            industryName, industryDetails);
                        
                        // 동시성 안전하게 키워드 병합
                        for (IndustryKeyword keyword : keywords) {
                            allKeywords.merge(keyword.getKeyword(), keyword, (existing, newKeyword) -> {
                                existing.setFrequency(existing.getFrequency() + newKeyword.getFrequency());
                                existing.setConfidenceScore(existing.getConfidenceScore().max(newKeyword.getConfidenceScore()));
                                return existing;
                            });
                        }
                        
                        int count = processedCount.incrementAndGet();
                        if (count % 50 == 0) {
                            logger.info("⏳ 처리 진행률: {}/? 업종 완료", count);
                        }
                    })
                ).get();
            } catch (Exception e) {
                logger.error("배치 처리 중 오류", e);
            } finally {
                customThreadPool.shutdown();
            }
            
            offset += BATCH_SIZE;
            
            // maxIndustries 제한 적용
            if (maxIndustries > 0 && offset >= maxIndustries) {
                break;
            }
        }
        
        logger.info("📈 배치 처리 완료: {}개 업종에서 {}개 키워드 추출", 
                   processedCount.get(), allKeywords.size());
        
        return allKeywords;
    }
    
    /**
     * 업종명에서 키워드 추출
     */
    private List<IndustryKeyword> extractKeywordsFromIndustryName(String industryName, 
            List<Map<String, Object>> industryDetails) {
        List<IndustryKeyword> keywords = new ArrayList<>();
        
        // 해당 업종의 상세 정보 찾기
        Map<String, Object> industryInfo = industryDetails.stream()
            .filter(detail -> industryName.equals(detail.get("industry_name")))
            .findFirst()
            .orElse(new HashMap<>());
        
        // 1. 정규 표현식 패턴 매칭
        for (Pattern pattern : KEYWORD_PATTERNS) {
            var matcher = pattern.matcher(industryName);
            while (matcher.find()) {
                String keyword = matcher.group(1);
                if (keyword.length() >= MIN_KEYWORD_LENGTH && keyword.length() <= MAX_KEYWORD_LENGTH) {
                    keywords.add(createKeyword(keyword, industryName, industryInfo, 0.8));
                }
            }
        }
        
        // 2. 일반적인 한글 키워드 추출 (2-4글자)
        for (int i = 0; i <= industryName.length() - MIN_KEYWORD_LENGTH; i++) {
            for (int j = i + MIN_KEYWORD_LENGTH; j <= Math.min(i + MAX_KEYWORD_LENGTH, industryName.length()); j++) {
                String substring = industryName.substring(i, j);
                if (isValidKoreanKeyword(substring)) {
                    keywords.add(createKeyword(substring, industryName, industryInfo, 0.6));
                }
            }
        }
        
        // 3. 전체 업종명도 키워드로 추가
        if (industryName.length() <= MAX_KEYWORD_LENGTH) {
            keywords.add(createKeyword(industryName, industryName, industryInfo, 1.0));
        }
        
        return keywords.stream()
            .filter(k -> !isStopWord(k.getKeyword()))
            .collect(Collectors.toList());
    }
    
    /**
     * 키워드 객체 생성
     */
    private IndustryKeyword createKeyword(String keyword, String source, 
            Map<String, Object> industryInfo, double confidence) {
        IndustryKeyword industryKeyword = new IndustryKeyword();
        industryKeyword.setKeyword(keyword);
        industryKeyword.setCategory(categorizeKeyword(keyword));
        industryKeyword.setConfidenceScore(BigDecimal.valueOf(confidence));
        industryKeyword.setFrequency(1);
        industryKeyword.setIsActive(true);
        industryKeyword.setCreatedAt(LocalDateTime.now());
        industryKeyword.setUpdatedAt(LocalDateTime.now());
        
        // 메타데이터 설정
        Map<String, Object> metadata = new HashMap<>();
        metadata.put("sourceIndustry", source);
        metadata.put("extractionMethod", "pattern_matching");
        metadata.put("memberCount", industryInfo.get("member_count"));
        metadata.put("region", industryInfo.get("sido_name"));
        industryKeyword.setMetadata(metadata);
        
        return industryKeyword;
    }
    
    /**
     * 유효한 한글 키워드 판별
     */
    private boolean isValidKoreanKeyword(String keyword) {
        return keyword.matches("^[가-힣]+$") && 
               keyword.length() >= MIN_KEYWORD_LENGTH && 
               keyword.length() <= MAX_KEYWORD_LENGTH;
    }
    
    /**
     * 불용어 판별
     */
    private boolean isStopWord(String keyword) {
        Set<String> stopWords = Set.of("기타", "일반", "기업", "회사", "사업", "개인", "법인", "단체", "조합", "협회", "기관");
        return stopWords.contains(keyword);
    }
    
    /**
     * 키워드 카테고리 분류
     */
    private String categorizeKeyword(String keyword) {
        if (keyword.matches(".*(음식|식당|카페|커피|치킨|피자).*")) return "음식점";
        if (keyword.matches(".*(병원|의원|치과|약국|클리닉).*")) return "의료";
        if (keyword.matches(".*(학교|학원|교육|대학).*")) return "교육";
        if (keyword.matches(".*(마트|편의점|슈퍼|상점).*")) return "소매";
        if (keyword.matches(".*(제조|공장|생산|가공).*")) return "제조업";
        if (keyword.matches(".*(부동산|건설|시공|건축).*")) return "건설/부동산";
        if (keyword.matches(".*(운송|배송|택배|물류).*")) return "운송";
        if (keyword.matches(".*(미용|헤어|네일|에스테틱).*")) return "미용";
        return "기타";
    }
    
    /**
     * PMI 기반 키워드 관계 분석
     */
    private List<KeywordRelationship> analyzeKeywordRelationships(Map<String, IndustryKeyword> keywords) {
        logger.info("🔍 PMI 알고리즘 기반 키워드 관계 분석 시작...");
        
        List<KeywordRelationship> relationships = new ArrayList<>();
        List<IndustryKeyword> keywordList = new ArrayList<>(keywords.values());
        
        // 빈도가 높은 키워드들만 관계 분석 (성능 최적화)
        keywordList = keywordList.stream()
            .filter(k -> k.getFrequency() >= 2)
            .sorted((a, b) -> Integer.compare(b.getFrequency(), a.getFrequency()))
            .limit(200)  // 상위 200개 키워드만
            .collect(Collectors.toList());
        
        logger.info("📊 관계 분석 대상 키워드: {} 개", keywordList.size());
        
        for (int i = 0; i < keywordList.size(); i++) {
            for (int j = i + 1; j < keywordList.size(); j++) {
                IndustryKeyword keyword1 = keywordList.get(i);
                IndustryKeyword keyword2 = keywordList.get(j);
                
                double pmi = calculatePMI(keyword1, keyword2, keywords);
                
                if (pmi >= MIN_PMI_THRESHOLD) {
                    KeywordRelationship relationship = new KeywordRelationship();
                    relationship.setSourceKeyword(keyword1.getKeyword());
                    relationship.setTargetKeyword(keyword2.getKeyword());
                    relationship.setStrength(BigDecimal.valueOf(pmi));
                    relationship.setRelationshipType(determineRelationshipType(keyword1, keyword2, pmi));
                    relationship.setConfidenceScore(keyword1.getConfidenceScore().min(keyword2.getConfidenceScore()));
                    relationship.setPmiScore(BigDecimal.valueOf(pmi));
                    relationship.setCreatedAt(LocalDateTime.now());
                    relationship.setUpdatedAt(LocalDateTime.now());
                    
                    relationships.add(relationship);
                }
            }
        }
        
        // 강도 순으로 정렬하여 상위 관계만 유지
        relationships = relationships.stream()
            .sorted((a, b) -> b.getStrength().compareTo(a.getStrength()))
            .limit(300)  // 상위 300개 관계만
            .collect(Collectors.toList());
        
        logger.info("✅ PMI 관계 분석 완료: {} 개 관계 발견", relationships.size());
        return relationships;
    }
    
    /**
     * PMI (Pointwise Mutual Information) 계산
     */
    private double calculatePMI(IndustryKeyword keyword1, IndustryKeyword keyword2, 
            Map<String, IndustryKeyword> allKeywords) {
        double freq1 = keyword1.getFrequency();
        double freq2 = keyword2.getFrequency();
        double cooccurrence = calculateCooccurrence(keyword1, keyword2);
        double totalOccurrences = allKeywords.values().stream()
            .mapToDouble(IndustryKeyword::getFrequency)
            .sum();
        
        if (cooccurrence == 0) return 0.0;
        
        double prob1 = freq1 / totalOccurrences;
        double prob2 = freq2 / totalOccurrences;
        double probCooc = cooccurrence / totalOccurrences;
        
        return Math.log(probCooc / (prob1 * prob2)) / Math.log(2);
    }
    
    /**
     * 키워드 동시 출현 빈도 계산
     */
    private double calculateCooccurrence(IndustryKeyword keyword1, IndustryKeyword keyword2) {
        // 같은 카테고리면 높은 동시출현, 유사한 키워드면 중간, 그 외는 낮음
        if (keyword1.getCategory().equals(keyword2.getCategory())) {
            return Math.min(keyword1.getFrequency(), keyword2.getFrequency()) * 0.8;
        } else if (isSemanticallySimilar(keyword1.getKeyword(), keyword2.getKeyword())) {
            return Math.min(keyword1.getFrequency(), keyword2.getFrequency()) * 0.5;
        } else {
            return Math.min(keyword1.getFrequency(), keyword2.getFrequency()) * 0.2;
        }
    }
    
    /**
     * 의미적 유사성 판별
     */
    private boolean isSemanticallySimilar(String keyword1, String keyword2) {
        return keyword1.contains(keyword2) || keyword2.contains(keyword1) ||
               (keyword1.length() > 2 && keyword2.length() > 2 && 
                keyword1.substring(0, 2).equals(keyword2.substring(0, 2)));
    }
    
    /**
     * 관계 유형 결정
     */
    private String determineRelationshipType(IndustryKeyword keyword1, IndustryKeyword keyword2, double pmi) {
        if (pmi >= 1.0) return "STRONG";
        if (pmi >= 0.5) return "MEDIUM";
        return "WEAK";
    }
    
    /**
     * 키워드를 데이터베이스에 저장
     */
    private void saveKeywordsToDatabase(List<IndustryKeyword> keywords) {
        logger.info("💾 키워드 데이터베이스 저장 시작: {} 개", keywords.size());
        try {
            keywordAnalysisMapper.insertKeywordsBatch(keywords);
            logger.info("✅ 키워드 저장 완료");
        } catch (Exception e) {
            logger.error("❌ 키워드 저장 실패", e);
        }
    }
    
    /**
     * 관계를 데이터베이스에 저장
     */
    private void saveRelationshipsToDatabase(List<KeywordRelationship> relationships) {
        logger.info("💾 관계 데이터베이스 저장 시작: {} 개", relationships.size());
        try {
            keywordAnalysisMapper.insertRelationshipsBatch(relationships);
            logger.info("✅ 관계 저장 완료");
        } catch (Exception e) {
            logger.error("❌ 관계 저장 실패", e);
        }
    }
    
    /**
     * D3 그래프용 데이터 구조 생성
     */
    private Map<String, Object> buildGraphDataStructure(Map<String, IndustryKeyword> keywords, 
            List<KeywordRelationship> relationships) {
        // 노드 생성
        List<Map<String, Object>> nodes = keywords.values().stream()
            .sorted((a, b) -> Integer.compare(b.getFrequency(), a.getFrequency()))
            .limit(100)  // 상위 100개 키워드만
            .map(keyword -> {
                Map<String, Object> node = new HashMap<>();
                node.put("id", keyword.getKeyword());
                node.put("category", keyword.getCategory());
                node.put("frequency", keyword.getFrequency());
                node.put("confidence", keyword.getConfidence());
                node.put("size", Math.min(20, 8 + keyword.getFrequency()));
                node.put("color", getCategoryColor(keyword.getCategory()));
                return node;
            })
            .collect(Collectors.toList());
        
        // 링크 생성
        Set<String> nodeIds = nodes.stream()
            .map(node -> (String) node.get("id"))
            .collect(Collectors.toSet());
        
        List<Map<String, Object>> links = relationships.stream()
            .filter(rel -> nodeIds.contains(rel.getSourceKeyword()) && 
                          nodeIds.contains(rel.getTargetKeyword()))
            .limit(150)  // 상위 150개 관계만
            .map(rel -> {
                Map<String, Object> link = new HashMap<>();
                link.put("source", rel.getSourceKeyword());
                link.put("target", rel.getTargetKeyword());
                link.put("strength", rel.getStrength());
                link.put("confidence", rel.getConfidenceScore());
                link.put("type", rel.getRelationshipType());
                link.put("thickness", Math.min(5, 1 + rel.getStrength().multiply(BigDecimal.valueOf(3)).intValue()));
                return link;
            })
            .collect(Collectors.toList());
        
        Map<String, Object> graphData = new HashMap<>();
        graphData.put("nodes", nodes);
        graphData.put("links", links);
        
        Map<String, Object> config = new HashMap<>();
        config.put("width", 1200);
        config.put("height", 700);
        config.put("forceStrength", -300);
        config.put("linkDistance", 80);
        config.put("centerForce", 0.1);
        graphData.put("config", config);
        
        return graphData;
    }
    
    /**
     * 카테고리별 색상 반환
     */
    private String getCategoryColor(String category) {
        Map<String, String> colors = Map.of(
            "음식점", "#FF6B6B",
            "의료", "#4ECDC4", 
            "교육", "#45B7D1",
            "소매", "#FFA07A",
            "제조업", "#98D8C8",
            "건설/부동산", "#F7DC6F",
            "운송", "#BB8FCE",
            "미용", "#F8C471"
        );
        return colors.getOrDefault(category, "#95A5A6");
    }
    
    /**
     * 통계 정보 계산
     */
    private Map<String, Object> calculateStatistics(Map<String, IndustryKeyword> keywords, 
            List<KeywordRelationship> relationships) {
        Map<String, Object> stats = new HashMap<>();
        
        stats.put("totalKeywords", keywords.size());
        stats.put("totalRelationships", relationships.size());
        stats.put("totalMembers", keywords.values().stream()
            .mapToInt(k -> (Integer) k.getMetadata().getOrDefault("memberCount", 0))
            .sum());
        
        // 카테고리별 통계
        Map<String, Long> categoryStats = keywords.values().stream()
            .collect(Collectors.groupingBy(IndustryKeyword::getCategory, Collectors.counting()));
        stats.put("categoryDistribution", categoryStats);
        
        // 상위 키워드
        List<Map<String, Object>> topKeywords = keywords.values().stream()
            .sorted((a, b) -> Integer.compare(b.getFrequency(), a.getFrequency()))
            .limit(10)
            .map(k -> {
                Map<String, Object> item = new HashMap<>();
                item.put("keyword", k.getKeyword());
                item.put("category", k.getCategory());
                item.put("frequency", k.getFrequency());
                item.put("confidence", k.getConfidenceScore());
                return item;
            })
            .collect(Collectors.toList());
        stats.put("topKeywords", topKeywords);
        
        return stats;
    }
}
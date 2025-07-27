package com.moneyshift.api.service;

import com.moneyshift.api.mapper.SegmentedKeywordMapper;
import com.moneyshift.api.model.KeywordExtractionResult;
import com.moneyshift.api.model.KeywordExtractionResult.ExtractedKeyword;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.stream.Collectors;

/**
 * 키워드-태그-계정과목 매핑 서비스
 * 54만건 국민연금 데이터를 활용한 키워드 매칭 엔진
 */
@Service
public class KeywordMappingService {
    
    private static final Logger logger = LoggerFactory.getLogger(KeywordMappingService.class);
    
    @Autowired
    private IndustryKeywordExtractionService keywordExtractionService;
    
    @Autowired
    private SegmentedKeywordMapper segmentedKeywordMapper;
    
    // 배치 처리용 스레드 풀
    private final ExecutorService executorService = Executors.newFixedThreadPool(4);
    
    // 키워드-태그 매핑 규칙
    private static final Map<String, List<String>> KEYWORD_TO_TAGS = new HashMap<String, List<String>>() {{
        // 제조업 관련
        put("제조업", Arrays.asList("제조", "생산"));
        put("자동차", Arrays.asList("자동차", "제조", "기계"));
        put("기계", Arrays.asList("기계", "제조", "장비"));
        put("화학", Arrays.asList("화학", "제조", "원료"));
        put("식품", Arrays.asList("식품", "제조", "가공"));
        put("전자", Arrays.asList("전자", "IT", "기술"));
        
        // IT 관련
        put("IT", Arrays.asList("기술", "전자", "디지털"));
        put("컴퓨터", Arrays.asList("기술", "IT", "전자"));
        put("소프트웨어", Arrays.asList("기술", "IT", "개발"));
        put("데이터", Arrays.asList("기술", "IT", "정보"));
        put("시스템", Arrays.asList("기술", "IT", "관리"));
        
        // 서비스업 관련
        put("서비스", Arrays.asList("서비스", "고객지원"));
        put("교육", Arrays.asList("교육", "서비스", "강의"));
        put("컨설팅", Arrays.asList("컨설팅", "서비스", "전문"));
        put("관리", Arrays.asList("관리", "서비스", "운영"));
        
        // 건설 관련
        put("건설", Arrays.asList("건설", "공사", "시설"));
        put("부동산", Arrays.asList("부동산", "건설", "임대"));
        put("공사", Arrays.asList("공사", "건설", "시공"));
        
        // 금융 관련
        put("금융", Arrays.asList("금융", "경제", "투자"));
        put("보험", Arrays.asList("보험", "금융", "보장"));
        put("투자", Arrays.asList("투자", "금융", "자산"));
        
        // 운송/물류 관련
        put("운송", Arrays.asList("운송", "물류", "배송"));
        put("물류", Arrays.asList("물류", "운송", "창고"));
        put("배송", Arrays.asList("배송", "운송", "택배"));
        
        // 유통/판매 관련
        put("유통", Arrays.asList("유통", "판매", "도매"));
        put("판매", Arrays.asList("판매", "유통", "소매"));
        put("도매", Arrays.asList("도매", "유통", "거래"));
        put("소매", Arrays.asList("소매", "판매", "매장"));
        
        // 의료 관련
        put("의료", Arrays.asList("의료", "건강", "치료"));
        put("병원", Arrays.asList("의료", "건강", "진료"));
        put("약국", Arrays.asList("의료", "약품", "건강"));
        
        // 기타
        put("음식", Arrays.asList("음식", "요리", "서비스"));
        put("숙박", Arrays.asList("숙박", "호텔", "서비스"));
        put("청소", Arrays.asList("청소", "위생", "서비스"));
    }};
    
    // 태그-계정과목 매핑 (간소화된 버전)
    private static final Map<String, String> TAG_TO_ACCOUNT_CODE = new HashMap<String, String>() {{
        // 비용 계정
        put("사무용품", "5101"); // 사무용품비
        put("임차료", "5102");   // 임차료
        put("급여", "5201");     // 임원급여
        put("제조", "5301");     // 원재료비
        put("기계", "1321");     // 기계장치
        put("자동차", "1323");   // 차량운반구
        put("기술", "5501");     // 기술료
        put("서비스", "5502");   // 용역비
        put("교육", "5601");     // 교육훈련비
        put("건설", "5701");     // 시설비
        put("운송", "5401");     // 운반비
        put("물류", "5401");     // 운반비
        put("유통", "5402");     // 판매비
        put("의료", "5603");     // 의료비
        put("금융", "6101");     // 이자비용
        put("보험", "5604");     // 보험료
        put("임대", "4101");     // 임대수익
        put("음식", "5605");     // 접대비
        put("숙박", "5606");     // 여비교통비
        put("청소", "5607");     // 수도광열비
    }};

    /**
     * 54만건 국민연금 데이터에서 키워드 추출 및 매핑 데이터 생성
     */
    @Transactional
    public void generateKeywordMappingsFromPensionData() {
        logger.info("🚀 54만건 국민연금 데이터 키워드 매핑 시작...");
        long startTime = System.currentTimeMillis();
        
        try {
            // 1. 국민연금 업종 데이터 조회 (배치 처리)
            List<Map<String, Object>> industryData = segmentedKeywordMapper.getPensionIndustryData();
            logger.info("📊 조회된 업종 데이터: {}건", industryData.size());
            
            // 2. 배치별로 키워드 추출 및 매핑 생성
            int batchSize = 1000;
            int totalBatches = (int) Math.ceil((double) industryData.size() / batchSize);
            
            List<CompletableFuture<Void>> futures = new ArrayList<>();
            
            for (int i = 0; i < totalBatches; i++) {
                int startIndex = i * batchSize;
                int endIndex = Math.min(startIndex + batchSize, industryData.size());
                List<Map<String, Object>> batch = industryData.subList(startIndex, endIndex);
                final int batchNumber = i + 1; // final 변수로 생성
                
                // 비동기 배치 처리
                CompletableFuture<Void> future = CompletableFuture.runAsync(() -> {
                    processBatch(batch, batchNumber, totalBatches);
                }, executorService);
                
                futures.add(future);
            }
            
            // 모든 배치 완료 대기
            CompletableFuture.allOf(futures.toArray(new CompletableFuture[0])).join();
            
            long processingTime = System.currentTimeMillis() - startTime;
            logger.info("✅ 키워드 매핑 완료! 처리시간: {}ms", processingTime);
            
            // 3. 통계 정보 출력
            printMappingStatistics();
            
        } catch (Exception e) {
            logger.error("❌ 키워드 매핑 처리 중 오류", e);
            throw new RuntimeException("키워드 매핑 생성 실패", e);
        }
    }
    
    /**
     * 배치별 키워드 추출 및 매핑 처리
     */
    private void processBatch(List<Map<String, Object>> batch, int batchNum, int totalBatches) {
        logger.info("🔄 배치 {}/{} 처리 중... ({}건)", batchNum, totalBatches, batch.size());
        
        List<Map<String, Object>> keywordMappings = new ArrayList<>();
        List<Map<String, Object>> tagAccountMappings = new ArrayList<>();
        
        for (Map<String, Object> industry : batch) {
            final String industryName = (String) industry.get("industry_name");
            final Integer memberCount = (Integer) industry.get("member_count");
            final String regionCode = (String) industry.get("sido_code");
            
            // 키워드 추출
            KeywordExtractionResult result = keywordExtractionService.extractKeywords(industryName);
            
            // 세그먼트 분류
            final String segmentType = determineSegmentType(memberCount, regionCode, industryName);
            final String segmentValue = determineSegmentValue(memberCount, regionCode, industryName, segmentType);
            
            // 키워드별 매핑 생성
            for (ExtractedKeyword keyword : result.getExtractedKeywords()) {
                // 키워드-태그 매핑 생성
                List<String> tags = KEYWORD_TO_TAGS.getOrDefault(keyword.getKeyword(), 
                    Arrays.asList("기타"));
                
                for (String tag : tags) {
                    // keyword_tag_mappings 데이터
                    Map<String, Object> keywordMapping = new HashMap<>();
                    keywordMapping.put("keyword", keyword.getKeyword());
                    keywordMapping.put("tag_name", tag);
                    keywordMapping.put("confidence", keyword.getConfidence());
                    keywordMapping.put("extraction_method", keyword.getReason());
                    keywordMapping.put("segment_type", segmentType);
                    keywordMapping.put("segment_value", segmentValue);
                    keywordMapping.put("industry_name", industryName);
                    keywordMapping.put("member_count", memberCount);
                    keywordMappings.add(keywordMapping);
                    
                    // tag_account_mappings 데이터 (기존에 없는 경우만)
                    String accountCode = TAG_TO_ACCOUNT_CODE.get(tag);
                    if (accountCode != null) {
                        Map<String, Object> tagMapping = new HashMap<>();
                        tagMapping.put("tag_name", tag);
                        tagMapping.put("account_code", accountCode);
                        tagMapping.put("confidence", keyword.getConfidence());
                        tagMapping.put("mapping_source", "PENSION_DATA_EXTRACTION");
                        tagAccountMappings.add(tagMapping);
                    }
                }
            }
        }
        
        // 배치 데이터 저장
        if (!keywordMappings.isEmpty()) {
            segmentedKeywordMapper.insertKeywordMappingsBatch(keywordMappings);
        }
        if (!tagAccountMappings.isEmpty()) {
            segmentedKeywordMapper.insertTagAccountMappingsBatch(tagAccountMappings);
        }
        
        logger.info("✅ 배치 {}/{} 완료 - 키워드 매핑: {}건, 태그 매핑: {}건", 
            batchNum, totalBatches, keywordMappings.size(), tagAccountMappings.size());
    }
    
    /**
     * 세그먼트 타입 결정
     */
    private String determineSegmentType(Integer memberCount, String regionCode, String industryName) {
        // 우선순위: category > size > region > frequency
        if (industryName != null) {
            for (String keyword : KEYWORD_TO_TAGS.keySet()) {
                if (industryName.contains(keyword)) {
                    return "category";
                }
            }
        }
        
        if (memberCount != null && memberCount > 0) {
            return "size";
        }
        
        if (regionCode != null && !regionCode.isEmpty()) {
            return "region";
        }
        
        return "frequency";
    }
    
    /**
     * 세그먼트 값 결정
     */
    private String determineSegmentValue(Integer memberCount, String regionCode, 
                                       String industryName, String segmentType) {
        switch (segmentType) {
            case "category":
                return determineCategoryFromIndustry(industryName);
            case "size":
                return determineSizeCategory(memberCount);
            case "region":
                return determineRegionCategory(regionCode);
            case "frequency":
                return "일반";
            default:
                return "기타";
        }
    }
    
    /**
     * 업종명에서 카테고리 결정
     */
    private String determineCategoryFromIndustry(String industryName) {
        if (industryName.contains("제조") || industryName.contains("생산")) return "제조업";
        if (industryName.contains("컴퓨터") || industryName.contains("소프트웨어") || 
            industryName.contains("IT") || industryName.contains("전자")) return "IT";
        if (industryName.contains("건설") || industryName.contains("공사")) return "건설";
        if (industryName.contains("서비스") || industryName.contains("상담")) return "서비스업";
        if (industryName.contains("운송") || industryName.contains("물류")) return "운송업";
        if (industryName.contains("유통") || industryName.contains("판매") || 
            industryName.contains("도매") || industryName.contains("소매")) return "유통업";
        if (industryName.contains("의료") || industryName.contains("병원")) return "의료업";
        if (industryName.contains("금융") || industryName.contains("보험")) return "금융업";
        if (industryName.contains("교육") || industryName.contains("학원")) return "교육업";
        return "기타업종";
    }
    
    /**
     * 직원 수 기반 규모 카테고리 결정
     */
    private String determineSizeCategory(Integer memberCount) {
        if (memberCount <= 4) return "1-4명";
        if (memberCount <= 9) return "5-9명";
        if (memberCount <= 19) return "10-19명";
        if (memberCount <= 49) return "20-49명";
        if (memberCount <= 99) return "50-99명";
        if (memberCount <= 299) return "100-299명";
        if (memberCount <= 999) return "300-999명";
        return "1000명+";
    }
    
    /**
     * 지역 코드 기반 지역 카테고리 결정
     */
    private String determineRegionCategory(String regionCode) {
        if (regionCode == null) return "미분류";
        
        switch (regionCode) {
            case "11": return "서울특별시";
            case "26": return "부산광역시";
            case "27": return "대구광역시";
            case "28": return "인천광역시";
            case "29": return "광주광역시";
            case "30": return "대전광역시";
            case "31": return "울산광역시";
            case "36": return "세종특별자치시";
            case "41": return "경기도";
            case "43": return "충청북도";
            case "44": return "충청남도";
            case "46": return "전라남도";
            case "47": return "경상북도";
            case "48": return "경상남도";
            case "50": return "제주특별자치도";
            default: return "기타지역";
        }
    }
    
    /**
     * 실시간 키워드 매칭 (거래 문자열 → 태그 → 계정과목)
     */
    public Map<String, Object> matchKeywordsRealtime(String transactionText) {
        long startTime = System.currentTimeMillis();
        
        Map<String, Object> result = new HashMap<>();
        
        try {
            // 1. 키워드 추출
            KeywordExtractionResult extraction = keywordExtractionService.extractKeywords(transactionText);
            
            // 2. 키워드 → 태그 매핑
            List<Map<String, Object>> matchedTags = new ArrayList<>();
            Set<String> uniqueTags = new HashSet<>();
            
            for (ExtractedKeyword keyword : extraction.getExtractedKeywords()) {
                List<String> tags = KEYWORD_TO_TAGS.getOrDefault(keyword.getKeyword(), new ArrayList<>());
                
                for (String tag : tags) {
                    if (!uniqueTags.contains(tag)) {
                        Map<String, Object> tagInfo = new HashMap<>();
                        tagInfo.put("tag", tag);
                        tagInfo.put("keyword", keyword.getKeyword());
                        tagInfo.put("confidence", keyword.getConfidence());
                        tagInfo.put("account_code", TAG_TO_ACCOUNT_CODE.get(tag));
                        
                        matchedTags.add(tagInfo);
                        uniqueTags.add(tag);
                    }
                }
            }
            
            // 3. 최고 신뢰도 태그 선택
            Map<String, Object> bestMatch = matchedTags.stream()
                .max(Comparator.comparing(tag -> (BigDecimal) tag.get("confidence")))
                .orElse(null);
            
            long processingTime = System.currentTimeMillis() - startTime;
            
            result.put("original_text", transactionText);
            result.put("extracted_keywords", extraction.getExtractedKeywords());
            result.put("matched_tags", matchedTags);
            result.put("best_match", bestMatch);
            result.put("processing_time_ms", processingTime);
            result.put("success", true);
            
        } catch (Exception e) {
            logger.error("실시간 키워드 매칭 오류", e);
            result.put("success", false);
            result.put("error", e.getMessage());
        }
        
        return result;
    }
    
    /**
     * 매핑 통계 정보 출력
     */
    private void printMappingStatistics() {
        try {
            Map<String, Object> stats = segmentedKeywordMapper.getKeywordMappingStatistics();
            
            logger.info("📊 키워드 매핑 통계:");
            logger.info("  - 총 키워드 매핑: {}건", stats.get("total_keyword_mappings"));
            logger.info("  - 고유 키워드: {}개", stats.get("unique_keywords"));
            logger.info("  - 고유 태그: {}개", stats.get("unique_tags"));
            logger.info("  - 평균 신뢰도: {}", stats.get("avg_confidence"));
            
        } catch (Exception e) {
            logger.warn("통계 정보 조회 실패", e);
        }
    }
    
    /**
     * 키워드 매핑 데이터 새로고침
     */
    @Transactional
    public void refreshKeywordMappings() {
        logger.info("🔄 키워드 매핑 데이터 새로고침 시작...");
        
        // 기존 매핑 데이터 정리
        segmentedKeywordMapper.clearKeywordMappings();
        
        // 새로운 매핑 데이터 생성
        generateKeywordMappingsFromPensionData();
        
        logger.info("✅ 키워드 매핑 데이터 새로고침 완료");
    }
    
    /**
     * 키워드 매핑 통계 조회
     */
    public Map<String, Object> getKeywordMappingStatistics() {
        try {
            return segmentedKeywordMapper.getKeywordMappingStatistics();
        } catch (Exception e) {
            logger.error("키워드 매핑 통계 조회 오류", e);
            
            // 기본 통계 반환
            Map<String, Object> defaultStats = new HashMap<>();
            defaultStats.put("total_keyword_mappings", 0);
            defaultStats.put("unique_keywords", 0);
            defaultStats.put("unique_tags", 0);
            defaultStats.put("avg_confidence", 0.0);
            defaultStats.put("high_confidence_mappings", 0);
            defaultStats.put("low_confidence_mappings", 0);
            defaultStats.put("error", e.getMessage());
            
            return defaultStats;
        }
    }
}
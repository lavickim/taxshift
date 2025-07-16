package com.moneyshift.api.service;

import com.moneyshift.api.model.KeywordGroup;
import com.moneyshift.api.model.KeywordTagMapping;
import com.moneyshift.api.model.Tag;
import com.moneyshift.api.model.TagsMaster;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

/**
 * 동적 브랜드 검색 및 키워드 관리 서비스
 * 브랜드 테이블을 활용한 실시간 검색 및 자동 키워드 등록
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class DynamicBrandService {
    
    private final JdbcTemplate jdbcTemplate;
    private final KeywordGroupService keywordGroupService;
    private final KeywordTagMappingService keywordTagMappingService;
    
    // 브랜드 사용 빈도 추적 (메모리 캐시)
    private final Map<String, Integer> brandUsageCount = new ConcurrentHashMap<>();
    
    // 자동 키워드 등록 임계값
    private static final int AUTO_KEYWORD_THRESHOLD = 5;
    
    /**
     * 거래 문자열에서 브랜드 검색
     */
    public List<BrandMatch> findMatchingBrands(String transactionText) {
        if (transactionText == null || transactionText.trim().isEmpty()) {
            return Collections.emptyList();
        }
        
        log.debug("브랜드 검색 시작: {}", transactionText);
        
        // 1. 정확한 브랜드명 매칭 (브랜드명이 거래문자열에 포함된 경우)
        List<BrandMatch> exactMatches = findExactBrandMatches(transactionText);
        
        // 2. 부분 매칭 (브랜드명의 일부가 매칭되는 경우)
        if (exactMatches.isEmpty()) {
            exactMatches = findPartialBrandMatches(transactionText);
        }
        
        // 3. 사용 빈도 업데이트
        for (BrandMatch match : exactMatches) {
            updateUsageCount(match.getBrandName());
        }
        
        log.debug("브랜드 매칭 결과: {}개", exactMatches.size());
        return exactMatches;
    }
    
    /**
     * 정확한 브랜드명 매칭
     */
    private List<BrandMatch> findExactBrandMatches(String transactionText) {
        String sql = """
            SELECT id, brand_name, company_name, industry_large_category, 
                   industry_medium_category, main_product, primary_tag, 
                   secondary_tag, tertiary_tag
            FROM franchise_brands 
            WHERE LOWER(?) LIKE LOWER(CONCAT('%', brand_name, '%'))
               OR LOWER(?) LIKE LOWER(CONCAT('%', company_name, '%'))
            ORDER BY LENGTH(brand_name) DESC, id ASC
            LIMIT 10
            """;
        
        try {
            return jdbcTemplate.query(sql, 
                new Object[]{transactionText, transactionText},
                (rs, rowNum) -> BrandMatch.builder()
                    .id(rs.getLong("id"))
                    .brandName(rs.getString("brand_name"))
                    .companyName(rs.getString("company_name"))
                    .industryCategory(rs.getString("industry_large_category"))
                    .industrySubCategory(rs.getString("industry_medium_category"))
                    .mainProduct(rs.getString("main_product"))
                    .primaryTag(rs.getString("primary_tag"))
                    .secondaryTag(rs.getString("secondary_tag"))
                    .tertiaryTag(rs.getString("tertiary_tag"))
                    .matchType("EXACT")
                    .confidence(0.95)
                    .build());
        } catch (Exception e) {
            log.error("브랜드 정확 매칭 중 오류", e);
            return Collections.emptyList();
        }
    }
    
    /**
     * 부분 브랜드명 매칭 (키워드 기반)
     */
    private List<BrandMatch> findPartialBrandMatches(String transactionText) {
        // 거래 문자열을 토큰으로 분리
        String[] tokens = transactionText.toLowerCase()
            .replaceAll("[^가-힣a-zA-Z0-9\\s]", " ")
            .split("\\s+");
        
        List<BrandMatch> matches = new ArrayList<>();
        
        for (String token : tokens) {
            if (token.length() >= 2 && !isNumeric(token)) {
                String sql = """
                    SELECT id, brand_name, company_name, industry_large_category, 
                           industry_medium_category, main_product, primary_tag, 
                           secondary_tag, tertiary_tag
                    FROM franchise_brands 
                    WHERE LOWER(brand_name) LIKE LOWER(CONCAT('%', ?, '%'))
                       OR LOWER(company_name) LIKE LOWER(CONCAT('%', ?, '%'))
                    ORDER BY LENGTH(brand_name) DESC, id ASC
                    LIMIT 5
                    """;
                
                try {
                    List<BrandMatch> tokenMatches = jdbcTemplate.query(sql, 
                        new Object[]{token, token},
                        (rs, rowNum) -> BrandMatch.builder()
                            .id(rs.getLong("id"))
                            .brandName(rs.getString("brand_name"))
                            .companyName(rs.getString("company_name"))
                            .industryCategory(rs.getString("industry_large_category"))
                            .industrySubCategory(rs.getString("industry_medium_category"))
                            .mainProduct(rs.getString("main_product"))
                            .primaryTag(rs.getString("primary_tag"))
                            .secondaryTag(rs.getString("secondary_tag"))
                            .tertiaryTag(rs.getString("tertiary_tag"))
                            .matchType("PARTIAL")
                            .confidence(0.80)
                            .build());
                    
                    matches.addAll(tokenMatches);
                } catch (Exception e) {
                    log.warn("토큰 '{}' 브랜드 매칭 중 오류", token, e);
                }
            }
        }
        
        // 중복 제거 및 신뢰도 순 정렬
        return matches.stream()
            .distinct()
            .sorted((a, b) -> Double.compare(b.getConfidence(), a.getConfidence()))
            .limit(5)
            .toList();
    }
    
    /**
     * 사용 빈도 업데이트 및 자동 키워드 등록 확인
     */
    private void updateUsageCount(String brandName) {
        int count = brandUsageCount.merge(brandName, 1, Integer::sum);
        
        // 임계값 도달 시 자동 키워드 등록
        if (count == AUTO_KEYWORD_THRESHOLD) {
            log.info("브랜드 '{}' 사용 빈도 {}회 도달, 자동 키워드 등록 시도", brandName, count);
            tryAutoKeywordRegistration(brandName);
        }
    }
    
    /**
     * 자동 키워드 등록
     */
    private void tryAutoKeywordRegistration(String brandName) {
        try {
            // 브랜드 정보 조회
            String sql = """
                SELECT id, brand_name, company_name, industry_large_category, 
                       industry_medium_category, main_product, primary_tag
                FROM franchise_brands 
                WHERE brand_name = ?
                LIMIT 1
                """;
            
            List<BrandMatch> brands = jdbcTemplate.query(sql, 
                new Object[]{brandName},
                (rs, rowNum) -> BrandMatch.builder()
                    .id(rs.getLong("id"))
                    .brandName(rs.getString("brand_name"))
                    .companyName(rs.getString("company_name"))
                    .industryCategory(rs.getString("industry_large_category"))
                    .industrySubCategory(rs.getString("industry_medium_category"))
                    .mainProduct(rs.getString("main_product"))
                    .primaryTag(rs.getString("primary_tag"))
                    .build());
            
            if (!brands.isEmpty()) {
                BrandMatch brand = brands.get(0);
                createKeywordGroupForBrand(brand);
            }
            
        } catch (Exception e) {
            log.error("브랜드 '{}' 자동 키워드 등록 실패", brandName, e);
        }
    }
    
    /**
     * 브랜드를 위한 키워드 그룹 생성
     */
    private void createKeywordGroupForBrand(BrandMatch brand) {
        try {
            // 이미 키워드 그룹이 있는지 확인
            String groupName = brand.getBrandName() + "_자동등록";
            List<KeywordGroup> existingGroups = keywordGroupService.findByGroupName(groupName);
            
            if (!existingGroups.isEmpty()) {
                log.debug("브랜드 '{}' 키워드 그룹이 이미 존재함", brand.getBrandName());
                return;
            }
            
            // 동의어 생성
            List<String> synonyms = new ArrayList<>();
            synonyms.add(brand.getBrandName());
            if (brand.getCompanyName() != null && !brand.getCompanyName().equals(brand.getBrandName())) {
                synonyms.add(brand.getCompanyName());
            }
            
            // 키워드 그룹 생성
            KeywordGroup keywordGroup = KeywordGroup.builder()
                .groupName(groupName)
                .primaryKeyword(brand.getBrandName())
                .synonyms(synonyms)
                .category(brand.getIndustryCategory())
                .confidenceBase(BigDecimal.valueOf(0.90))
                .isActive(true)
                .build();
            
            KeywordGroup savedGroup = keywordGroupService.createGroup(keywordGroup);
            
            // 태그 매핑 생성
            if (brand.getPrimaryTag() != null && !brand.getPrimaryTag().equals("기타")) {
                createTagMappingForBrand(savedGroup, brand);
            }
            
            log.info("브랜드 '{}' 자동 키워드 그룹 생성 완료 (ID: {})", 
                brand.getBrandName(), savedGroup.getId());
                
        } catch (Exception e) {
            log.error("브랜드 '{}' 키워드 그룹 생성 실패", brand.getBrandName(), e);
        }
    }
    
    /**
     * 브랜드를 위한 태그 매핑 생성
     */
    private void createTagMappingForBrand(KeywordGroup keywordGroup, BrandMatch brand) {
        try {
            // 태그 ID 조회
            String sql = "SELECT id FROM tags_master WHERE tag_name = ? AND is_active = true LIMIT 1";
            List<Long> tagIds = jdbcTemplate.query(sql, 
                new Object[]{brand.getPrimaryTag()},
                (rs, rowNum) -> rs.getLong("id"));
            
            if (tagIds.isEmpty()) {
                log.warn("태그 '{}' 를 찾을 수 없음", brand.getPrimaryTag());
                return;
            }
            
            Long tagId = tagIds.get(0);
            
            // 키워드-태그 매핑 생성
            KeywordTagMapping mapping = KeywordTagMapping.builder()
                .keywordGroupId(keywordGroup.getId())
                .tagId(tagId)
                .confidenceScore(BigDecimal.valueOf(0.90))
                .priority(150) // 브랜드는 높은 우선순위
                .usageCount(0L)
                .isActive(true)
                .build();
            
            keywordTagMappingService.createMapping(mapping);
            
            log.info("브랜드 '{}' 태그 매핑 생성 완료: {} -> {}", 
                brand.getBrandName(), keywordGroup.getId(), tagId);
                
        } catch (Exception e) {
            log.error("브랜드 '{}' 태그 매핑 생성 실패", brand.getBrandName(), e);
        }
    }
    
    /**
     * 브랜드 사용 통계 조회
     */
    public Map<String, Integer> getBrandUsageStats() {
        return new HashMap<>(brandUsageCount);
    }
    
    /**
     * 자주 사용되는 브랜드 목록 조회
     */
    public List<String> getFrequentlyUsedBrands(int minUsage) {
        return brandUsageCount.entrySet().stream()
            .filter(entry -> entry.getValue() >= minUsage)
            .sorted((a, b) -> Integer.compare(b.getValue(), a.getValue()))
            .map(Map.Entry::getKey)
            .toList();
    }
    
    /**
     * 숫자 여부 확인
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
     * 브랜드 매칭 결과 클래스
     */
    @lombok.Data
    @lombok.Builder
    public static class BrandMatch {
        private Long id;
        private String brandName;
        private String companyName;
        private String industryCategory;
        private String industrySubCategory;
        private String mainProduct;
        private String primaryTag;
        private String secondaryTag;
        private String tertiaryTag;
        private String matchType; // EXACT, PARTIAL
        private double confidence;
        
        @Override
        public boolean equals(Object o) {
            if (this == o) return true;
            if (o == null || getClass() != o.getClass()) return false;
            BrandMatch that = (BrandMatch) o;
            return Objects.equals(id, that.id);
        }
        
        @Override
        public int hashCode() {
            return Objects.hash(id);
        }
    }
}
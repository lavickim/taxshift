package com.moneyshift.api.mapper;

import com.moneyshift.api.model.RegexPreprocessingRule;
import com.moneyshift.api.model.RegexPreprocessingCategory;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * 정규식 전처리 매퍼
 * 정규식 전처리 규칙과 카테고리의 데이터베이스 CRUD 작업을 담당
 */
@Mapper
public interface RegexPreprocessingMapper {
    
    // ==================== 규칙 관리 ====================
    
    /**
     * 모든 활성 규칙 조회 (우선순위 순)
     */
    List<RegexPreprocessingRule> findAllActiveRules();
    
    /**
     * 카테고리별 활성 규칙 조회
     */
    List<RegexPreprocessingRule> findActiveRulesByCategory(@Param("category") String category);
    
    /**
     * 규칙 ID로 조회
     */
    RegexPreprocessingRule findById(@Param("id") Long id);
    
    /**
     * 규칙 생성
     */
    void insertRule(RegexPreprocessingRule rule);
    
    /**
     * 규칙 수정
     */
    void updateRule(RegexPreprocessingRule rule);
    
    /**
     * 규칙 삭제
     */
    void deleteRule(@Param("id") Long id);
    
    /**
     * 규칙 사용 통계 업데이트
     */
    void updateUsageStats(@Param("id") Long id, 
                         @Param("usageCount") Long usageCount, 
                         @Param("successRate") Double successRate);
    
    /**
     * 필터링된 규칙 목록 조회
     */
    List<RegexPreprocessingRule> findRulesWithFilters(@Param("category") String category,
                                                     @Param("isActive") Boolean isActive,
                                                     @Param("sortBy") String sortBy,
                                                     @Param("limit") Integer limit,
                                                     @Param("offset") Integer offset);
    
    /**
     * 규칙 개수 조회
     */
    Long countRules(@Param("category") String category, @Param("isActive") Boolean isActive);
    
    // ==================== 카테고리 관리 ====================
    
    /**
     * 모든 활성 카테고리 조회
     */
    List<RegexPreprocessingCategory> findAllActiveCategories();
    
    /**
     * 카테고리 생성
     */
    void insertCategory(RegexPreprocessingCategory category);
    
    /**
     * 카테고리 수정
     */
    void updateCategory(RegexPreprocessingCategory category);
    
    /**
     * 카테고리 삭제
     */
    void deleteCategory(@Param("id") Long id);
}
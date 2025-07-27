package com.moneyshift.api.mapper;

import com.moneyshift.api.model.IndustryKeyword;
import com.moneyshift.api.model.KeywordRelationship;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Map;

/**
 * 키워드 분석 매퍼
 * D3 키워드 그래프 시스템용
 */
@Mapper
public interface KeywordAnalysisMapper {

    // ====== 키워드 관리 ======
    
    /**
     * 키워드 삽입 또는 업데이트 (upsert)
     */
    void upsertKeyword(IndustryKeyword keyword);
    
    /**
     * 키워드 ID로 조회
     */
    IndustryKeyword getKeywordById(@Param("id") Long id);
    
    /**
     * 키워드명으로 조회
     */
    IndustryKeyword getKeywordByName(@Param("keyword") String keyword);
    
    /**
     * 모든 키워드 조회
     */
    List<IndustryKeyword> getAllKeywords();
    
    /**
     * 카테고리별 키워드 조회
     */
    List<IndustryKeyword> getKeywordsByCategory(@Param("category") String category);
    
    /**
     * 키워드 검색 (부분 매칭)
     */
    List<IndustryKeyword> searchKeywords(@Param("searchTerm") String searchTerm, @Param("limit") Integer limit);
    
    // ====== 키워드 관계 관리 ======
    
    /**
     * 키워드 관계 삽입 또는 업데이트 (upsert)
     */
    void upsertKeywordRelationship(KeywordRelationship relationship);
    
    /**
     * 키워드 관계 조회 (ID 기준)
     */
    KeywordRelationship getRelationshipById(@Param("id") Long id);
    
    /**
     * 두 키워드 간의 관계 조회
     */
    KeywordRelationship getRelationshipByKeywords(@Param("keyword1") String keyword1, @Param("keyword2") String keyword2);
    
    /**
     * 특정 키워드와 관련된 모든 관계 조회
     */
    List<KeywordRelationship> getRelationshipsByKeyword(@Param("keyword") String keyword, @Param("limit") Integer limit);
    
    /**
     * 강도 기준 상위 관계 조회
     */
    List<KeywordRelationship> getTopRelationshipsByStrength(@Param("limit") Integer limit);
    
    /**
     * 관계 타입별 조회
     */
    List<KeywordRelationship> getRelationshipsByType(@Param("relationshipType") String relationshipType, @Param("limit") Integer limit);
    
    /**
     * 모든 키워드 관계 조회 (페이징)
     */
    List<KeywordRelationship> getAllRelationships(@Param("offset") Integer offset, @Param("limit") Integer limit);
    
    // ====== 통계 및 분석 ======
    
    /**
     * 키워드 네트워크 통계
     */
    Map<String, Object> getKeywordNetworkStatistics();
    
    /**
     * 키워드별 관계 수 통계
     */
    List<Map<String, Object>> getKeywordRelationshipCounts(@Param("limit") Integer limit);
    
    /**
     * 카테고리별 키워드 분포
     */
    List<Map<String, Object>> getCategoryDistribution();
    
    /**
     * 최근 추가된 키워드
     */
    List<IndustryKeyword> getRecentKeywords(@Param("limit") Integer limit);
    
    /**
     * 최근 생성된 관계
     */
    List<KeywordRelationship> getRecentRelationships(@Param("limit") Integer limit);
    
    // ====== 배치 작업 ======
    
    /**
     * 키워드 배치 삽입
     */
    void insertKeywordsBatch(@Param("keywords") List<IndustryKeyword> keywords);
    
    /**
     * 관계 배치 삽입
     */
    void insertRelationshipsBatch(@Param("relationships") List<KeywordRelationship> relationships);
    
    /**
     * 키워드 사용 통계 업데이트
     */
    void updateKeywordUsageStats(@Param("keyword") String keyword);
    
    // ====== 데이터 정리 ======
    
    /**
     * 낮은 신뢰도 관계 삭제
     */
    int deleteWeakRelationships(@Param("minConfidence") Double minConfidence);
    
    /**
     * 사용되지 않는 키워드 삭제
     */
    int deleteUnusedKeywords();
}
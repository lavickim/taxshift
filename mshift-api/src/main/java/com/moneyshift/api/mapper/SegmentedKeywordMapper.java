package com.moneyshift.api.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Map;

/**
 * 세그먼트 기반 키워드 조회 매퍼
 * 미리 생성된 keyword_segments 테이블을 활용한 고성능 키워드 조회
 */
@Mapper
public interface SegmentedKeywordMapper {
    
    /**
     * 세그먼트별 상위 키워드 조회
     */
    List<Map<String, Object>> getTopKeywordsBySegment(
        @Param("segmentType") String segmentType,
        @Param("segmentName") String segmentName, 
        @Param("limit") int limit
    );
    
    /**
     * 키워드 관련어 조회
     */
    List<Map<String, Object>> getRelatedKeywords(
        @Param("keyword") String keyword,
        @Param("limit") int limit
    );
    
    /**
     * 세그먼트 통계 조회
     */
    List<Map<String, Object>> getSegmentStatistics();
    
    /**
     * 세그먼트 목록 조회
     */
    List<Map<String, Object>> getSegmentList(@Param("segmentType") String segmentType);
    
    /**
     * 특정 세그먼트의 키워드 수 조회
     */
    int getKeywordCountBySegment(
        @Param("segmentType") String segmentType,
        @Param("segmentName") String segmentName
    );
    
    /**
     * 키워드 검색 (세그먼트 필터링 지원)
     */
    List<Map<String, Object>> searchKeywords(
        @Param("searchTerm") String searchTerm,
        @Param("segmentType") String segmentType,
        @Param("segmentName") String segmentName,
        @Param("limit") int limit
    );
    
    /**
     * 세그먼트별 키워드 관계 조회
     */
    List<Map<String, Object>> getSegmentKeywordRelationships(
        @Param("segmentType") String segmentType,
        @Param("segmentName") String segmentName,
        @Param("limit") int limit
    );
}
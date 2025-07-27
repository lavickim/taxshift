package com.moneyshift.api.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Map;

/**
 * 국민연금 데이터 매퍼
 */
@Mapper
public interface NationalPensionMapper {

    /**
     * 회원 수 기준 상위 업종 조회
     */
    List<Map<String, Object>> getTopIndustriesByMemberCount(@Param("minMemberCount") int minMemberCount, @Param("limit") int limit);
    
    /**
     * 업종별 총 회원 수 조회
     */
    List<Map<String, Object>> getIndustryMemberStatistics();
    
    /**
     * 활성 사업장의 업종별 통계
     */
    List<Map<String, Object>> getActiveWorkplacesByIndustry();
    
    /**
     * 지역별 업종 분포
     */
    List<Map<String, Object>> getIndustryDistributionByRegion(@Param("sidoCode") String sidoCode);
    
    /**
     * 특정 업종의 상위 사업장
     */
    List<Map<String, Object>> getTopWorkplacesByIndustry(@Param("industryName") String industryName, @Param("limit") int limit);
    
    /**
     * 업종 코드별 매핑 정보
     */
    List<Map<String, Object>> getIndustryCodeMapping();
    
    /**
     * 키워드 그래프용 업종 데이터 (빈도와 회원 수 포함)
     */
    List<Map<String, Object>> getIndustryDataForKeywordGraph(@Param("minMemberCount") int minMemberCount, @Param("limit") int limit);
    
    /**
     * 배치 처리용: 모든 업종명 조회 (페이징)
     */
    List<String> getAllIndustryNamesBatch(@Param("minMemberCount") int minMemberCount, @Param("batchSize") int batchSize, @Param("offset") int offset);
    
    /**
     * 배치 처리용: 총 업종 수 조회
     */
    int getIndustryCount(@Param("minMemberCount") int minMemberCount);
    
    /**
     * 배치 처리용: 업종별 상세 정보 조회
     */
    List<Map<String, Object>> getIndustryDetailsBatch(@Param("industryNames") List<String> industryNames);
}
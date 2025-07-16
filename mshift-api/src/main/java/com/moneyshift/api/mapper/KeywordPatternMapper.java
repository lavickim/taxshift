package com.moneyshift.api.mapper;

import com.moneyshift.api.model.KeywordPattern;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * 키워드 패턴 매퍼 인터페이스
 * MyBatis를 통한 키워드 패턴 데이터 액세스
 */
@Mapper
public interface KeywordPatternMapper {

    /**
     * 키워드 패턴 목록 조회
     */
    List<KeywordPattern> selectPatterns(@Param("type") String type,
                                       @Param("confidence") Integer confidence,
                                       @Param("search") String search,
                                       @Param("isActive") Boolean isActive);

    /**
     * 키워드 패턴 단일 조회
     */
    KeywordPattern selectPatternById(@Param("id") Long id);

    /**
     * 키워드 패턴 생성
     */
    int insertPattern(KeywordPattern pattern);

    /**
     * 키워드 패턴 수정
     */
    int updatePattern(KeywordPattern pattern);

    /**
     * 키워드 패턴 삭제
     */
    int deletePattern(@Param("id") Long id);

    /**
     * 키워드 패턴 활성화/비활성화
     */
    int updatePatternStatus(@Param("id") Long id, @Param("isActive") Boolean isActive);

    /**
     * 키워드 패턴 히트 카운트 증가
     */
    int incrementHitCount(@Param("id") Long id);

    /**
     * 키워드 패턴 통계 조회
     */
    KeywordPatternStats selectPatternStats();

    /**
     * 활성화된 패턴만 조회
     */
    List<KeywordPattern> selectActivePatterns();

    /**
     * 패턴 타입별 조회
     */
    List<KeywordPattern> selectPatternsByType(@Param("type") String type);

    /**
     * 신뢰도 기준 조회
     */
    List<KeywordPattern> selectPatternsByConfidence(@Param("minConfidence") Integer minConfidence);

    /**
     * 패턴 일괄 상태 업데이트
     */
    int updatePatternsStatus(@Param("ids") List<Long> ids, @Param("isActive") Boolean isActive);

    /**
     * 패턴 일괄 삭제
     */
    int deletePatterns(@Param("ids") List<Long> ids);

    // 내부 클래스 - 통계 DTO
    public static class KeywordPatternStats {
        private long totalPatterns;
        private long activePatterns;
        private long inactivePatterns;
        private double averageConfidence;
        private long totalHits;

        // getters and setters
        public long getTotalPatterns() { return totalPatterns; }
        public void setTotalPatterns(long totalPatterns) { this.totalPatterns = totalPatterns; }
        public long getActivePatterns() { return activePatterns; }
        public void setActivePatterns(long activePatterns) { this.activePatterns = activePatterns; }
        public long getInactivePatterns() { return inactivePatterns; }
        public void setInactivePatterns(long inactivePatterns) { this.inactivePatterns = inactivePatterns; }
        public double getAverageConfidence() { return averageConfidence; }
        public void setAverageConfidence(double averageConfidence) { this.averageConfidence = averageConfidence; }
        public long getTotalHits() { return totalHits; }
        public void setTotalHits(long totalHits) { this.totalHits = totalHits; }
    }
}
package com.moneyshift.api.mapper;

import com.moneyshift.api.model.TransactionTestData;
import com.moneyshift.api.model.TestBatchExecution;
import org.apache.ibatis.annotations.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

/**
 * MoneyShift 거래 테스트 데이터 매퍼
 * 1000개 테스트 데이터 CRUD 및 배치 실행 관리
 */
@Mapper
public interface TransactionTestDataMapper {
    
    // ====================
    // 기본 CRUD 작업
    // ====================
    
    /**
     * 테스트 데이터 전체 조회 (페이징 지원)
     */
    List<TransactionTestData> findAll(@Param("offset") int offset, 
                                     @Param("limit") int limit,
                                     @Param("sourceType") String sourceType,
                                     @Param("testCategory") String testCategory,
                                     @Param("difficultyLevel") Integer difficultyLevel);
    
    /**
     * 테스트 데이터 개별 조회
     */
    TransactionTestData findById(@Param("id") Long id);
    
    /**
     * 테스트 데이터 전체 개수 조회
     */
    int countAll(@Param("sourceType") String sourceType,
                 @Param("testCategory") String testCategory,
                 @Param("difficultyLevel") Integer difficultyLevel);
    
    /**
     * 테스트 데이터 생성
     */
    @Options(useGeneratedKeys = true, keyProperty = "id")
    int insert(TransactionTestData testData);
    
    /**
     * 테스트 데이터 수정
     */
    int update(TransactionTestData testData);
    
    /**
     * 테스트 데이터 삭제
     */
    int deleteById(@Param("id") Long id);
    
    /**
     * 테스트 데이터 일괄 삭제
     */
    int deleteByIds(@Param("ids") List<Long> ids);
    
    // ====================
    // 검색 및 필터링
    // ====================
    
    /**
     * 텍스트 검색
     */
    List<TransactionTestData> searchByText(@Param("searchText") String searchText,
                                          @Param("offset") int offset,
                                          @Param("limit") int limit);
    
    /**
     * 날짜 범위로 검색
     */
    List<TransactionTestData> findByDateRange(@Param("startDate") LocalDate startDate,
                                             @Param("endDate") LocalDate endDate,
                                             @Param("offset") int offset,
                                             @Param("limit") int limit);
    
    /**
     * 금액 범위로 검색
     */
    List<TransactionTestData> findByAmountRange(@Param("minAmount") String minAmount,
                                               @Param("maxAmount") String maxAmount,
                                               @Param("offset") int offset,
                                               @Param("limit") int limit);
    
    /**
     * 비즈니스 타입별 조회
     */
    List<TransactionTestData> findByBusinessType(@Param("businessType") String businessType,
                                                @Param("offset") int offset,
                                                @Param("limit") int limit);
    
    /**
     * 지역별 조회
     */
    List<TransactionTestData> findByRegion(@Param("region") String region,
                                          @Param("offset") int offset,
                                          @Param("limit") int limit);
    
    // ====================
    // 테스트 결과 관리
    // ====================
    
    /**
     * 테스트 결과 업데이트
     */
    int updateTestResult(@Param("id") Long id,
                        @Param("processingResults") Object processingResults,
                        @Param("testPassed") Boolean testPassed,
                        @Param("testScore") String testScore,
                        @Param("testNotes") String testNotes);
    
    /**
     * 테스트 통과/실패 상태별 조회
     */
    List<TransactionTestData> findByTestStatus(@Param("testPassed") Boolean testPassed,
                                              @Param("offset") int offset,
                                              @Param("limit") int limit);
    
    /**
     * 점수 범위별 조회
     */
    List<TransactionTestData> findByScoreRange(@Param("minScore") String minScore,
                                              @Param("maxScore") String maxScore,
                                              @Param("offset") int offset,
                                              @Param("limit") int limit);
    
    // ====================
    // 통계 및 분석
    // ====================
    
    /**
     * 기본 통계 조회
     */
    Map<String, Object> getBasicStatistics();
    
    /**
     * 소스 타입별 통계
     */
    List<Map<String, Object>> getStatisticsBySourceType();
    
    /**
     * 테스트 카테고리별 통계
     */
    List<Map<String, Object>> getStatisticsByTestCategory();
    
    /**
     * 난이도별 통계
     */
    List<Map<String, Object>> getStatisticsByDifficultyLevel();
    
    /**
     * 지역별 통계
     */
    List<Map<String, Object>> getStatisticsByRegion();
    
    /**
     * 비즈니스 타입별 통계
     */
    List<Map<String, Object>> getStatisticsByBusinessType();
    
    /**
     * 테스트 성과 통계
     */
    Map<String, Object> getTestPerformanceStatistics();
    
    // ====================
    // 배치 실행 관리
    // ====================
    
    /**
     * 배치 실행 생성
     */
    @Options(useGeneratedKeys = true, keyProperty = "id")
    int insertBatchExecution(TestBatchExecution batchExecution);
    
    /**
     * 배치 실행 상태 업데이트
     */
    int updateBatchExecutionStatus(@Param("id") Long id,
                                  @Param("executionStatus") String executionStatus,
                                  @Param("endTime") String endTime,
                                  @Param("totalProcessingTimeMs") Long totalProcessingTimeMs);
    
    /**
     * 배치 실행 결과 업데이트
     */
    int updateBatchExecutionResults(@Param("id") Long id,
                                   @Param("passedCount") Integer passedCount,
                                   @Param("failedCount") Integer failedCount,
                                   @Param("successRate") String successRate,
                                   @Param("averageScore") String averageScore,
                                   @Param("layer0Hits") Integer layer0Hits,
                                   @Param("layer1Hits") Integer layer1Hits,
                                   @Param("layer2Hits") Integer layer2Hits,
                                   @Param("layer3Hits") Integer layer3Hits,
                                   @Param("layerPerformance") Object layerPerformance,
                                   @Param("errorPatterns") Object errorPatterns);
    
    /**
     * 배치 실행 이력 조회
     */
    List<TestBatchExecution> findBatchExecutions(@Param("offset") int offset,
                                                @Param("limit") int limit);
    
    /**
     * 배치 실행 개별 조회
     */
    TestBatchExecution findBatchExecutionById(@Param("id") Long id);
    
    /**
     * 배치 실행 삭제
     */
    int deleteBatchExecutionById(@Param("id") Long id);
    
    // ====================
    // 대량 작업
    // ====================
    
    /**
     * 대량 테스트 데이터 삽입
     */
    int insertBatch(@Param("testDataList") List<TransactionTestData> testDataList);
    
    /**
     * 테스트 데이터 초기화 (전체 삭제)
     */
    int truncateTestData();
    
    /**
     * 특정 조건의 테스트 데이터 일괄 업데이트
     */
    int updateBatchByCondition(@Param("sourceType") String sourceType,
                              @Param("testCategory") String testCategory,
                              @Param("updateFields") Map<String, Object> updateFields);
}
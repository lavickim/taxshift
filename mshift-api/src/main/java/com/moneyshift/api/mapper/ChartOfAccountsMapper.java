package com.moneyshift.api.mapper;

import com.moneyshift.api.model.ChartOfAccount;
import org.apache.ibatis.annotations.*;

import java.util.List;
import java.util.Map;

/**
 * 계정과목 관리 MyBatis Mapper
 * 계정과목 CRUD, 검색, 통계 등의 데이터베이스 작업을 처리합니다.
 */
@Mapper
public interface ChartOfAccountsMapper {

    /**
     * 전체 활성 계정과목 조회
     */
    List<ChartOfAccount> findAllActiveAccounts();

    /**
     * 계정과목 코드로 단건 조회
     * @param accountCode 계정과목 코드
     * @return 계정과목 정보
     */
    ChartOfAccount findAccountByCode(@Param("accountCode") String accountCode);

    /**
     * 계정과목 ID로 단건 조회
     * @param id 계정과목 ID
     * @return 계정과목 정보
     */
    ChartOfAccount findAccountById(@Param("id") Long id);

    /**
     * 계정과목 유형별 조회
     * @param accountType 계정과목 유형 (자산, 부채, 자본, 수익, 비용)
     * @return 계정과목 목록
     */
    List<ChartOfAccount> findAccountsByType(@Param("accountType") String accountType);

    /**
     * 계정과목 유형 및 하위유형별 조회
     * @param accountType 계정과목 유형
     * @param accountSubtype 계정과목 하위유형 (선택적)
     * @return 계정과목 목록
     */
    List<ChartOfAccount> findAccountsByTypeAndSubtype(@Param("accountType") String accountType, 
                                                     @Param("accountSubtype") String accountSubtype);

    /**
     * 상위 계정과목의 하위 계정과목들 조회
     * @param parentAccountId 상위 계정과목 ID
     * @return 하위 계정과목 목록
     */
    List<ChartOfAccount> findSubAccounts(@Param("parentAccountId") Long parentAccountId);

    /**
     * 계정과목 검색 (계정코드 또는 계정명)
     * @param keyword 검색 키워드
     * @param accountType 계정과목 유형 필터 (선택적)
     * @param limit 결과 개수 제한
     * @param offset 시작 위치
     * @return 검색 결과 목록
     */
    List<ChartOfAccount> searchAccounts(@Param("keyword") String keyword,
                                       @Param("accountType") String accountType,
                                       @Param("limit") int limit,
                                       @Param("offset") int offset);

    /**
     * 계정과목 검색 총 개수
     * @param keyword 검색 키워드
     * @param accountType 계정과목 유형 필터 (선택적)
     * @return 검색 결과 총 개수
     */
    Long countSearchAccounts(@Param("keyword") String keyword,
                           @Param("accountType") String accountType);

    /**
     * 계정과목 생성
     * @param account 계정과목 정보
     * @return 생성된 레코드 수
     */
    int insertAccount(ChartOfAccount account);

    /**
     * 계정과목 업데이트
     * @param account 계정과목 정보
     * @return 업데이트된 레코드 수
     */
    int updateAccount(ChartOfAccount account);

    /**
     * 계정과목 비활성화 (소프트 삭제)
     * @param id 계정과목 ID
     * @return 업데이트된 레코드 수
     */
    int deactivateAccount(@Param("id") Long id);

    /**
     * 계정과목 활성화
     * @param id 계정과목 ID
     * @return 업데이트된 레코드 수
     */
    int activateAccount(@Param("id") Long id);

    /**
     * 계정과목 코드 중복 확인
     * @param accountCode 계정과목 코드
     * @return 중복 여부
     */
    Boolean existsByAccountCode(@Param("accountCode") String accountCode);

    /**
     * 계정과목 사용 여부 확인 (분개에서 사용 중인지)
     * @param accountCode 계정과목 코드
     * @return 사용 중인지 여부
     */
    Boolean isAccountInUse(@Param("accountCode") String accountCode);

    /**
     * 계정과목 계층 구조 조회 (재귀 CTE)
     * @param accountId 기준 계정과목 ID
     * @return 계층 구조 목록
     */
    List<ChartOfAccount> findAccountHierarchy(@Param("accountId") Long accountId);

    /**
     * 최대 표시 순서 조회
     * @param accountType 계정과목 유형 (선택적)
     * @return 최대 표시 순서
     */
    Integer getMaxDisplayOrder(@Param("accountType") String accountType);

    /**
     * 표시 순서 업데이트
     * @param accountId 계정과목 ID
     * @param newOrder 새로운 표시 순서
     * @return 업데이트된 레코드 수
     */
    int updateDisplayOrders(@Param("accountId") Long accountId, @Param("newOrder") Integer newOrder);

    /**
     * 계정과목 통계
     * @return 계정과목 유형별 통계 정보
     */
    List<Map<String, Object>> getAccountStatistics();

    /**
     * 계정과목별 사용 빈도 조회
     * @param startDate 시작 날짜 (선택적)
     * @param endDate 종료 날짜 (선택적)
     * @return 사용 빈도 통계
     */
    List<Map<String, Object>> getAccountUsageStatistics(@Param("startDate") String startDate,
                                                        @Param("endDate") String endDate);

    /**
     * 미사용 계정과목 조회
     * @return 미사용 계정과목 목록
     */
    List<ChartOfAccount> findUnusedAccounts();

    /**
     * 계정과목 일괄 생성
     * @param accounts 계정과목 목록
     * @return 생성된 레코드 수
     */
    int insertAccountsBatch(@Param("list") List<ChartOfAccount> accounts);
}
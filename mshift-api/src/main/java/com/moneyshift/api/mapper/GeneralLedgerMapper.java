package com.moneyshift.api.mapper;

import com.moneyshift.api.model.GeneralLedger;
import com.moneyshift.api.model.GlDetail;
import org.apache.ibatis.annotations.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

/**
 * 총계정원장 관리 MyBatis Mapper
 * GL 계정 관리, 시산표, 재무제표 생성 등의 데이터베이스 작업을 처리합니다.
 */
@Mapper
public interface GeneralLedgerMapper {

    /**
     * GL 계정 단건 조회
     * @param companyId 회사 ID
     * @param accountCode 계정과목 코드
     * @param fiscalYear 회계연도
     * @param fiscalMonth 회계월
     * @return GL 계정 정보
     */
    GeneralLedger findGeneralLedgerAccount(@Param("companyId") String companyId,
                                         @Param("accountCode") String accountCode,
                                         @Param("fiscalYear") Integer fiscalYear,
                                         @Param("fiscalMonth") Integer fiscalMonth);

    /**
     * GL 계정 목록 조회
     * @param companyId 회사 ID (선택적)
     * @param fiscalYear 회계연도 (선택적)
     * @param fiscalMonth 회계월 (선택적)
     * @param accountCodes 계정과목 코드 목록 (선택적)
     * @param isClosed 마감 여부 (선택적)
     * @return GL 계정 목록
     */
    List<GeneralLedger> findGeneralLedgerAccounts(@Param("companyId") String companyId,
                                                @Param("fiscalYear") Integer fiscalYear,
                                                @Param("fiscalMonth") Integer fiscalMonth,
                                                @Param("accountCodes") List<String> accountCodes,
                                                @Param("isClosed") Boolean isClosed);

    /**
     * GL 계정 생성 또는 업데이트 (UPSERT)
     * @param glAccount GL 계정 정보
     * @return 영향받은 행 수
     */
    int insertGeneralLedgerAccount(GeneralLedger glAccount);

    /**
     * GL 계정 잔액 업데이트
     * @param generalLedgerId GL 계정 ID
     * @param debitAmount 차변 금액
     * @param creditAmount 대변 금액
     * @return 업데이트된 행 수
     */
    int updateGeneralLedgerBalance(@Param("generalLedgerId") Long generalLedgerId,
                                 @Param("debitAmount") BigDecimal debitAmount,
                                 @Param("creditAmount") BigDecimal creditAmount);

    /**
     * GL 상세 내역 생성
     * @param glDetail GL 상세 내역
     * @return 생성된 행 수
     */
    int insertGLDetail(GlDetail glDetail);

    /**
     * GL 상세 내역 조회
     * @param generalLedgerId GL 계정 ID
     * @return GL 상세 내역 목록
     */
    List<GlDetail> findGLDetails(@Param("generalLedgerId") Long generalLedgerId);

    /**
     * 시산표 데이터 조회
     * @param companyId 회사 ID
     * @param fiscalYear 회계연도
     * @param fiscalMonth 회계월
     * @return 시산표 데이터
     */
    List<Map<String, Object>> getTrialBalanceData(@Param("companyId") String companyId,
                                                @Param("fiscalYear") Integer fiscalYear,
                                                @Param("fiscalMonth") Integer fiscalMonth);

    /**
     * 손익계산서 데이터 조회
     * @param companyId 회사 ID
     * @param fiscalYear 회계연도
     * @param fiscalMonth 회계월
     * @return 손익계산서 데이터
     */
    List<Map<String, Object>> getIncomeStatementData(@Param("companyId") String companyId,
                                                    @Param("fiscalYear") Integer fiscalYear,
                                                    @Param("fiscalMonth") Integer fiscalMonth);

    /**
     * 재무상태표 데이터 조회
     * @param companyId 회사 ID
     * @param fiscalYear 회계연도
     * @param fiscalMonth 회계월
     * @return 재무상태표 데이터
     */
    List<Map<String, Object>> getBalanceSheetData(@Param("companyId") String companyId,
                                                 @Param("fiscalYear") Integer fiscalYear,
                                                 @Param("fiscalMonth") Integer fiscalMonth);

    /**
     * 현금흐름표 데이터 조회
     * @param companyId 회사 ID
     * @param fiscalYear 회계연도
     * @param fiscalMonth 회계월
     * @return 현금흐름표 데이터
     */
    List<Map<String, Object>> getCashFlowData(@Param("companyId") String companyId,
                                            @Param("fiscalYear") Integer fiscalYear,
                                            @Param("fiscalMonth") Integer fiscalMonth);

    /**
     * GL 계정 마감 처리
     * @param companyId 회사 ID
     * @param fiscalYear 회계연도
     * @param fiscalMonth 회계월
     * @return 마감된 계정 수
     */
    int closeGeneralLedgerAccounts(@Param("companyId") String companyId,
                                 @Param("fiscalYear") Integer fiscalYear,
                                 @Param("fiscalMonth") Integer fiscalMonth);

    /**
     * GL 계정 마감 재개방
     * @param companyId 회사 ID
     * @param fiscalYear 회계연도
     * @param fiscalMonth 회계월
     * @return 재개방된 계정 수
     */
    int reopenGeneralLedgerAccounts(@Param("companyId") String companyId,
                                  @Param("fiscalYear") Integer fiscalYear,
                                  @Param("fiscalMonth") Integer fiscalMonth);

    /**
     * 이전 월 기말잔액을 다음 월 기초잔액으로 이월
     * @param companyId 회사 ID
     * @param fiscalYear 회계연도
     * @param fiscalMonth 회계월
     * @return 이월된 계정 수
     */
    int carryForwardBalances(@Param("companyId") String companyId,
                           @Param("fiscalYear") Integer fiscalYear,
                           @Param("fiscalMonth") Integer fiscalMonth);

    /**
     * GL 마감 이력 조회
     * @param companyId 회사 ID
     * @param limit 조회 개수 제한
     * @param offset 시작 위치
     * @return 마감 이력 목록
     */
    List<Map<String, Object>> getClosingHistory(@Param("companyId") String companyId,
                                              @Param("limit") int limit,
                                              @Param("offset") int offset);
}
package com.moneyshift.api.mapper;

import com.moneyshift.api.model.JournalEntry;
import com.moneyshift.api.model.JournalEntryDetail;
import org.apache.ibatis.annotations.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

/**
 * 분개 관리 MyBatis Mapper
 * 분개 CRUD, 승인 워크플로우, 감사 추적 등의 데이터베이스 작업을 처리합니다.
 */
@Mapper
public interface JournalEntryMapper {

    /**
     * 분개 생성
     * @param journalEntry 분개 정보
     * @return 생성된 레코드 수
     */
    int insertJournalEntry(JournalEntry journalEntry);

    /**
     * 분개 상세 생성
     * @param detail 분개 상세 정보
     * @return 생성된 레코드 수
     */
    int insertJournalEntryDetail(JournalEntryDetail detail);

    /**
     * 분개 상세 일괄 생성
     * @param details 분개 상세 목록
     * @return 생성된 레코드 수
     */
    int insertJournalEntryDetails(@Param("list") List<JournalEntryDetail> details);

    /**
     * 분개 단건 조회 (상세 포함)
     * @param id 분개 ID
     * @return 분개 정보 (상세 포함)
     */
    JournalEntry findJournalEntryById(@Param("id") Long id);

    /**
     * 분개 목록 조회 (페이징)
     * @param companyId 회사 ID (선택적)
     * @param status 분개 상태 (선택적)
     * @param search 검색어 (선택적)
     * @param startDate 시작 날짜 (선택적)
     * @param endDate 종료 날짜 (선택적)
     * @param pageSize 페이지 크기
     * @param offset 시작 위치
     * @return 분개 목록
     */
    List<JournalEntry> findJournalEntries(@Param("companyId") Long companyId,
                                         @Param("status") String status,
                                         @Param("search") String search,
                                         @Param("startDate") LocalDate startDate,
                                         @Param("endDate") LocalDate endDate,
                                         @Param("pageSize") int pageSize,
                                         @Param("offset") int offset);

    /**
     * 분개 목록 총 개수
     * @param companyId 회사 ID (선택적)
     * @param status 분개 상태 (선택적)
     * @param search 검색어 (선택적)
     * @param startDate 시작 날짜 (선택적)
     * @param endDate 종료 날짜 (선택적)
     * @return 총 개수
     */
    Long countJournalEntries(@Param("companyId") Long companyId,
                           @Param("status") String status,
                           @Param("search") String search,
                           @Param("startDate") LocalDate startDate,
                           @Param("endDate") LocalDate endDate);

    /**
     * 분개 상태 업데이트
     * @param journalEntryId 분개 ID
     * @param status 새로운 상태
     * @return 업데이트된 레코드 수
     */
    int updateJournalEntryStatus(@Param("journalEntryId") Long journalEntryId,
                               @Param("status") String status);

    /**
     * 분개 균형 검증
     * @param journalEntryId 분개 ID
     * @return 균형 검증 결과 (totalDebit, totalCredit, isBalanced)
     */
    Map<String, Object> validateJournalEntryBalance(@Param("journalEntryId") Long journalEntryId);

    /**
     * 거래 ID로 분개 조회 (중복 방지)
     * @param transactionId 거래 ID
     * @return 분개 정보
     */
    JournalEntry findJournalEntryByTransactionId(@Param("transactionId") Long transactionId);

    /**
     * 분개 상세 조회
     * @param journalEntryId 분개 ID
     * @return 분개 상세 목록
     */
    List<JournalEntryDetail> findJournalEntryDetails(@Param("journalEntryId") Long journalEntryId);

    /**
     * 분개 상세 삭제
     * @param journalEntryId 분개 ID
     * @return 삭제된 레코드 수
     */
    int deleteJournalEntryDetails(@Param("journalEntryId") Long journalEntryId);

    /**
     * 분개 삭제
     * @param journalEntryId 분개 ID
     * @return 삭제된 레코드 수
     */
    int deleteJournalEntry(@Param("journalEntryId") Long journalEntryId);

    /**
     * 미전기 분개 개수 조회
     * @param companyId 회사 ID
     * @param startDate 시작 날짜
     * @param endDate 종료 날짜
     * @return 미전기 분개 개수
     */
    Long findUnpostedJournalEntries(@Param("companyId") Long companyId,
                                  @Param("startDate") LocalDate startDate,
                                  @Param("endDate") LocalDate endDate);

    /**
     * 분개 감사 로그 생성
     * @param journalEntryId 분개 ID
     * @param actionType 작업 유형
     * @param previousStatus 이전 상태
     * @param newStatus 새로운 상태
     * @param userId 사용자 ID
     * @param notes 비고
     * @return 생성된 레코드 수
     */
    int insertJournalEntryAuditLog(@Param("journalEntryId") Long journalEntryId,
                                 @Param("actionType") String actionType,
                                 @Param("previousStatus") String previousStatus,
                                 @Param("newStatus") String newStatus,
                                 @Param("userId") String userId,
                                 @Param("notes") String notes);

    /**
     * 분개 감사 로그 조회
     * @param journalEntryId 분개 ID
     * @return 감사 로그 목록
     */
    List<Map<String, Object>> findJournalEntryAuditLogs(@Param("journalEntryId") Long journalEntryId);
}
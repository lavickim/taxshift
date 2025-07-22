package com.moneyshift.api.mapper;

import com.moneyshift.api.model.ChartOfAccount;
import com.moneyshift.api.model.JournalEntry;
import com.moneyshift.api.model.JournalEntryDetail;
import org.apache.ibatis.annotations.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

/**
 * 기장 시스템 MyBatis Mapper
 */
@Mapper
public interface AccountingMapper {

    // ===== 계정과목 관련 =====
    
    /**
     * 전체 계정과목 조회
     */
    @Select("SELECT * FROM chart_of_accounts WHERE is_active = true ORDER BY display_order, account_code")
    List<ChartOfAccount> findAllActiveAccounts();

    /**
     * 계정과목 코드로 조회
     */
    @Select("SELECT * FROM chart_of_accounts WHERE account_code = #{accountCode} AND is_active = true")
    ChartOfAccount findAccountByCode(@Param("accountCode") String accountCode);

    /**
     * 계정과목 유형별 조회
     */
    @Select("SELECT * FROM chart_of_accounts WHERE account_type = #{accountType} AND is_active = true ORDER BY display_order")
    List<ChartOfAccount> findAccountsByType(@Param("accountType") String accountType);

    // ===== 분개 관련 =====
    
    /**
     * 분개 생성
     */
    @Insert({
        "INSERT INTO journal_entries (company_id, entry_date, description, reference_type, reference_id, total_amount, status, created_by)",
        "VALUES (CAST(#{companyId} AS UUID), #{entryDate}, #{description}, #{referenceType}, #{referenceId}, #{totalAmount}, CAST(#{status} AS journal_entry_status_enum), #{createdBy})"
    })
    @Options(useGeneratedKeys = true, keyProperty = "id", keyColumn = "id")
    void insertJournalEntry(JournalEntry journalEntry);

    /**
     * 분개 상세 생성
     */
    @Insert({
        "INSERT INTO journal_entry_details (journal_entry_id, line_number, account_code, debit_amount, credit_amount, description)",
        "VALUES (#{journalEntryId}, #{lineNumber}, #{accountCode}, #{debitAmount}, #{creditAmount}, #{description})"
    })
    @Options(useGeneratedKeys = true, keyProperty = "id", keyColumn = "id")
    void insertJournalEntryDetail(JournalEntryDetail detail);

    /**
     * 분개 조회
     */
    @Select("SELECT * FROM journal_entries WHERE id = #{id}")
    JournalEntry findJournalEntryById(@Param("id") Long id);

    /**
     * 분개 상세 조회
     */
    @Select({
        "SELECT jed.*, coa.account_name",
        "FROM journal_entry_details jed",
        "LEFT JOIN chart_of_accounts coa ON jed.account_code = coa.account_code",
        "WHERE jed.journal_entry_id = #{journalEntryId}",
        "ORDER BY jed.line_number"
    })
    List<JournalEntryDetail> findJournalEntryDetails(@Param("journalEntryId") Long journalEntryId);

    /**
     * 회사별 기간별 분개 조회
     */
    @Select({
        "SELECT je.*, COUNT(jed.id) as detail_count",
        "FROM journal_entries je",
        "LEFT JOIN journal_entry_details jed ON je.id = jed.journal_entry_id",
        "WHERE je.company_id = CAST(#{companyId} AS UUID)",
        "AND je.entry_date BETWEEN #{startDate} AND #{endDate}",
        "GROUP BY je.id",
        "ORDER BY je.entry_date DESC, je.id DESC"
    })
    List<JournalEntry> findJournalEntriesByCompanyAndPeriod(
        @Param("companyId") String companyId,
        @Param("startDate") LocalDate startDate,
        @Param("endDate") LocalDate endDate
    );

    /**
     * 참조 정보로 분개 조회 (거래 ID로 이미 생성된 분개가 있는지 확인)
     */
    @Select({
        "SELECT * FROM journal_entries",
        "WHERE reference_type = #{referenceType} AND reference_id = #{referenceId}"
    })
    JournalEntry findJournalEntryByReference(
        @Param("referenceType") String referenceType,
        @Param("referenceId") Long referenceId
    );

    // ===== 재무제표 생성을 위한 집계 쿼리 =====
    
    /**
     * 계정과목별 잔액 집계 (대차대조표용)
     */
    @Select({
        "SELECT",
        "  coa.account_code,",
        "  coa.account_name,",
        "  coa.account_type,",
        "  coa.account_subtype,",
        "  coa.is_debit_normal,",
        "  COALESCE(SUM(jed.debit_amount), 0) as total_debit,",
        "  COALESCE(SUM(jed.credit_amount), 0) as total_credit,",
        "  CASE",
        "    WHEN coa.is_debit_normal = true THEN COALESCE(SUM(jed.debit_amount), 0) - COALESCE(SUM(jed.credit_amount), 0)",
        "    ELSE COALESCE(SUM(jed.credit_amount), 0) - COALESCE(SUM(jed.debit_amount), 0)",
        "  END as balance",
        "FROM chart_of_accounts coa",
        "LEFT JOIN journal_entry_details jed ON coa.account_code = jed.account_code",
        "LEFT JOIN journal_entries je ON jed.journal_entry_id = je.id",
        "  AND je.company_id = CAST(#{companyId} AS UUID)",
        "  AND je.entry_date <= #{asOfDate}",
        "  AND je.status IN ('CONFIRMED'::journal_entry_status_enum, 'POSTED'::journal_entry_status_enum)",
        "WHERE coa.is_active = true",
        "AND coa.account_type IN ('자산', '부채', '자본')",
        "GROUP BY coa.account_code, coa.account_name, coa.account_type, coa.account_subtype, coa.is_debit_normal",
        "ORDER BY coa.account_type, coa.account_code"
    })
    List<Map<String, Object>> getAccountBalances(
        @Param("companyId") String companyId,
        @Param("asOfDate") LocalDate asOfDate
    );

    /**
     * 기간별 손익 집계 (손익계산서용)
     */
    @Select({
        "SELECT",
        "  coa.account_code,",
        "  coa.account_name,",
        "  coa.account_type,",
        "  coa.account_subtype,",
        "  COALESCE(SUM(jed.debit_amount), 0) as total_debit,",
        "  COALESCE(SUM(jed.credit_amount), 0) as total_credit,",
        "  CASE",
        "    WHEN coa.account_type = '비용' THEN COALESCE(SUM(jed.debit_amount), 0) - COALESCE(SUM(jed.credit_amount), 0)",
        "    WHEN coa.account_type = '수익' THEN COALESCE(SUM(jed.credit_amount), 0) - COALESCE(SUM(jed.debit_amount), 0)",
        "    ELSE 0",
        "  END as period_amount",
        "FROM chart_of_accounts coa",
        "LEFT JOIN journal_entry_details jed ON coa.account_code = jed.account_code",
        "LEFT JOIN journal_entries je ON jed.journal_entry_id = je.id",
        "  AND je.company_id = CAST(#{companyId} AS UUID)",
        "  AND je.entry_date BETWEEN #{periodStart} AND #{periodEnd}",
        "  AND je.status IN ('CONFIRMED'::journal_entry_status_enum, 'POSTED'::journal_entry_status_enum)",
        "WHERE coa.is_active = true",
        "AND coa.account_type IN ('수익', '비용')",
        "GROUP BY coa.account_code, coa.account_name, coa.account_type, coa.account_subtype",
        "ORDER BY coa.account_type DESC, coa.account_code"
    })
    List<Map<String, Object>> getIncomeStatementData(
        @Param("companyId") String companyId,
        @Param("periodStart") LocalDate periodStart,
        @Param("periodEnd") LocalDate periodEnd
    );

    /**
     * 분개 균형 검증
     */
    @Select({
        "SELECT",
        "  SUM(debit_amount) as total_debit,",
        "  SUM(credit_amount) as total_credit",
        "FROM journal_entry_details",
        "WHERE journal_entry_id = #{journalEntryId}"
    })
    Map<String, Object> validateJournalEntryBalance(@Param("journalEntryId") Long journalEntryId);
}
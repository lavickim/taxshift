package com.moneyshift.api.mapper;

import com.moneyshift.api.model.TransactionEntity;
import org.apache.ibatis.annotations.*;

import java.time.LocalDate;
import java.util.List;

/**
 * 거래 내역 MyBatis Mapper
 */
@Mapper
public interface TransactionMapper {

    /**
     * 거래 ID로 조회
     */
    @Select({
        "SELECT id, company_id, raw_text, transaction_date, amount,",
        "       final_suggested_tag, final_debit_account, final_credit_account,",
        "       transaction_type",
        "FROM transactions",
        "WHERE id = #{id}"
    })
    TransactionEntity findById(@Param("id") Long id);

    /**
     * 회사별 거래 조회
     */
    @Select({
        "SELECT id, company_id, raw_text, transaction_date, amount,",
        "       final_suggested_tag, final_debit_account, final_credit_account,",
        "       transaction_type",
        "FROM transactions",
        "WHERE company_id = #{companyId}",
        "ORDER BY transaction_date DESC, id DESC",
        "LIMIT #{limit} OFFSET #{offset}"
    })
    List<TransactionEntity> findByCompanyId(
        @Param("companyId") String companyId,
        @Param("limit") int limit,
        @Param("offset") int offset
    );

    /**
     * 기간별 거래 조회
     */
    @Select({
        "SELECT id, company_id, raw_text, transaction_date, amount,",
        "       final_suggested_tag, final_debit_account, final_credit_account,",
        "       transaction_type",
        "FROM transactions",
        "WHERE company_id = #{companyId}",
        "AND transaction_date BETWEEN #{startDate} AND #{endDate}",
        "ORDER BY transaction_date DESC, id DESC"
    })
    List<TransactionEntity> findByCompanyIdAndDateRange(
        @Param("companyId") String companyId,
        @Param("startDate") LocalDate startDate,
        @Param("endDate") LocalDate endDate
    );

    /**
     * 태그가 설정된 거래 조회
     */
    @Select({
        "SELECT id, company_id, raw_text, transaction_date, amount,",
        "       final_suggested_tag, final_debit_account, final_credit_account,",
        "       transaction_type",
        "FROM transactions",
        "WHERE company_id = #{companyId}",
        "AND final_suggested_tag IS NOT NULL",
        "AND final_suggested_tag != ''",
        "ORDER BY transaction_date DESC",
        "LIMIT #{limit}"
    })
    List<TransactionEntity> findTaggedTransactions(
        @Param("companyId") String companyId,
        @Param("limit") int limit
    );

    /**
     * 거래 수 조회
     */
    @Select({
        "SELECT COUNT(*) FROM transactions",
        "WHERE company_id = #{companyId}"
    })
    int countByCompanyId(@Param("companyId") String companyId);
}
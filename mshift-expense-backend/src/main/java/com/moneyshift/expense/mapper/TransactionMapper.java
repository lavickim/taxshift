package com.moneyshift.expense.mapper;

import com.moneyshift.expense.model.Transaction;
import org.apache.ibatis.annotations.*;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.math.BigDecimal;

/**
 * 거래내역 데이터 접근 매퍼
 */
@Mapper
public interface TransactionMapper {
    
    @Select("SELECT * FROM transactions WHERE transaction_id = #{transactionId} AND user_id = #{userId}")
    Optional<Transaction> findById(@Param("transactionId") Long transactionId, @Param("userId") Long userId);
    
    @Select("SELECT * FROM transactions WHERE user_id = #{userId} " +
            "ORDER BY transaction_date DESC, transaction_time DESC")
    List<Transaction> findByUserId(@Param("userId") Long userId);
    
    @Select("SELECT * FROM transactions WHERE user_id = #{userId} " +
            "AND transaction_date = #{date} " +
            "ORDER BY transaction_time DESC")
    List<Transaction> findByUserIdAndDate(@Param("userId") Long userId, @Param("date") LocalDate date);
    
    @Select("SELECT * FROM transactions WHERE user_id = #{userId} " +
            "AND EXTRACT(YEAR FROM transaction_date) = #{year} " +
            "AND EXTRACT(MONTH FROM transaction_date) = #{month} " +
            "ORDER BY transaction_date DESC, transaction_time DESC")
    List<Transaction> findByUserIdAndMonth(@Param("userId") Long userId, 
                                           @Param("year") int year, 
                                           @Param("month") int month);
    
    @Select("SELECT * FROM transactions WHERE user_id = #{userId} " +
            "AND category_id = #{categoryId} " +
            "ORDER BY transaction_date DESC, transaction_time DESC")
    List<Transaction> findByUserIdAndCategory(@Param("userId") Long userId, @Param("categoryId") Long categoryId);
    
    @Insert("INSERT INTO transactions (user_id, asset_id, category_id, transaction_type, amount, " +
            "description, memo, transaction_date, transaction_time, receipt_photo_url, location, " +
            "target_asset_id, is_recurring, recurring_type, recurring_interval, recurring_end_date, " +
            "parent_transaction_id) " +
            "VALUES (#{userId}, #{assetId}, #{categoryId}, #{transactionType}, #{amount}, " +
            "#{description}, #{memo}, #{transactionDate}, #{transactionTime}, #{receiptPhotoUrl}, " +
            "#{location}, #{targetAssetId}, #{isRecurring}, #{recurringType}, #{recurringInterval}, " +
            "#{recurringEndDate}, #{parentTransactionId})")
    @SelectKey(statement = "SELECT LASTVAL()", keyProperty = "transactionId", before = false, resultType = Long.class)
    int insert(Transaction transaction);
    
    @Update("UPDATE transactions SET asset_id = #{assetId}, category_id = #{categoryId}, " +
            "transaction_type = #{transactionType}, amount = #{amount}, description = #{description}, " +
            "memo = #{memo}, transaction_date = #{transactionDate}, transaction_time = #{transactionTime}, " +
            "receipt_photo_url = #{receiptPhotoUrl}, location = #{location}, " +
            "updated_at = CURRENT_TIMESTAMP " +
            "WHERE transaction_id = #{transactionId} AND user_id = #{userId}")
    int update(Transaction transaction);
    
    @Delete("DELETE FROM transactions WHERE transaction_id = #{transactionId} AND user_id = #{userId}")
    int delete(@Param("transactionId") Long transactionId, @Param("userId") Long userId);
    
    // 통계용 쿼리들
    @Select("SELECT SUM(amount) FROM transactions WHERE user_id = #{userId} " +
            "AND transaction_type = #{transactionType} " +
            "AND EXTRACT(YEAR FROM transaction_date) = #{year} " +
            "AND EXTRACT(MONTH FROM transaction_date) = #{month}")
    BigDecimal getSumByTypeAndMonth(@Param("userId") Long userId,
                                    @Param("transactionType") String transactionType,
                                    @Param("year") int year,
                                    @Param("month") int month);
    
    @Select("SELECT COUNT(*) FROM transactions WHERE user_id = #{userId} " +
            "AND EXTRACT(YEAR FROM transaction_date) = #{year} " +
            "AND EXTRACT(MONTH FROM transaction_date) = #{month}")
    int getCountByMonth(@Param("userId") Long userId, @Param("year") int year, @Param("month") int month);
    
    // 서비스에서 필요한 추가 메서드들
    @Select("SELECT * FROM transactions WHERE user_id = #{userId} " +
            "ORDER BY transaction_date DESC, transaction_time DESC " +
            "LIMIT #{limit} OFFSET #{offset}")
    List<Transaction> findByUserIdWithPaging(@Param("userId") Long userId, 
                                            @Param("offset") int offset, 
                                            @Param("limit") int limit);
    
    @Select("SELECT * FROM transactions WHERE user_id = #{userId} " +
            "AND transaction_date BETWEEN #{startDate} AND #{endDate} " +
            "ORDER BY transaction_date DESC, transaction_time DESC")
    List<Transaction> findByDateRange(@Param("userId") Long userId, 
                                     @Param("startDate") LocalDate startDate, 
                                     @Param("endDate") LocalDate endDate);
    
    @Select("SELECT * FROM transactions WHERE user_id = #{userId} " +
            "AND category_id = #{categoryId} " +
            "ORDER BY transaction_date DESC, transaction_time DESC")
    List<Transaction> findByCategory(@Param("userId") Long userId, @Param("categoryId") Long categoryId);
    
    @Select("SELECT * FROM transactions WHERE user_id = #{userId} " +
            "AND asset_id = #{assetId} " +
            "ORDER BY transaction_date DESC, transaction_time DESC")
    List<Transaction> findByAsset(@Param("userId") Long userId, @Param("assetId") Long assetId);
    
    @Select("SELECT * FROM transactions WHERE user_id = #{userId} " +
            "AND transaction_type = #{transactionType} " +
            "ORDER BY transaction_date DESC, transaction_time DESC")
    List<Transaction> findByType(@Param("userId") Long userId, @Param("transactionType") String transactionType);
    
    @Select("SELECT COUNT(*) FROM transactions WHERE user_id = #{userId}")
    int countByUserId(@Param("userId") Long userId);
    
    @Select("SELECT * FROM transactions WHERE user_id = #{userId} " +
            "AND (description ILIKE #{keyword} OR memo ILIKE #{keyword}) " +
            "ORDER BY transaction_date DESC, transaction_time DESC")
    List<Transaction> searchByKeyword(@Param("userId") Long userId, @Param("keyword") String keyword);
    
    // Mock 구현 (실제 환경에서는 복잡한 쿼리로 대체)
    @Select("SELECT " +
            "'totalIncome' as key, COALESCE(SUM(CASE WHEN transaction_type = 'INCOME' THEN amount ELSE 0 END), 0) as value " +
            "FROM transactions WHERE user_id = #{userId} " +
            "AND transaction_date BETWEEN #{startDate} AND #{endDate}")
    Map<String, Object> findMonthlySummary(@Param("userId") Long userId, 
                                          @Param("startDate") LocalDate startDate, 
                                          @Param("endDate") LocalDate endDate);
    
    @Select("SELECT c.category_name, COALESCE(SUM(t.amount), 0) as totalAmount " +
            "FROM categories c " +
            "LEFT JOIN transactions t ON c.category_id = t.category_id " +
            "AND t.user_id = #{userId} " +
            "AND t.transaction_type = 'EXPENSE' " +
            "AND t.transaction_date BETWEEN #{startDate} AND #{endDate} " +
            "GROUP BY c.category_id, c.category_name " +
            "HAVING SUM(t.amount) > 0 " +
            "ORDER BY totalAmount DESC")
    List<Map<String, Object>> findCategoryExpenseStats(@Param("userId") Long userId, 
                                                       @Param("startDate") LocalDate startDate, 
                                                       @Param("endDate") LocalDate endDate);
    
    @Select("SELECT " +
            "EXTRACT(YEAR FROM transaction_date) as year, " +
            "EXTRACT(MONTH FROM transaction_date) as month, " +
            "COALESCE(SUM(CASE WHEN transaction_type = 'INCOME' THEN amount ELSE 0 END), 0) as totalIncome, " +
            "COALESCE(SUM(CASE WHEN transaction_type = 'EXPENSE' THEN amount ELSE 0 END), 0) as totalExpense " +
            "FROM transactions " +
            "WHERE user_id = #{userId} " +
            "AND transaction_date >= (CURRENT_DATE - INTERVAL '1 month' * #{months}) " +
            "GROUP BY EXTRACT(YEAR FROM transaction_date), EXTRACT(MONTH FROM transaction_date) " +
            "ORDER BY year DESC, month DESC")
    List<Map<String, Object>> findMonthlyIncomeExpenseTrend(@Param("userId") Long userId, @Param("months") int months);
}
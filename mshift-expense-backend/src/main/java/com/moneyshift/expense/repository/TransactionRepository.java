package com.moneyshift.expense.repository;

import com.moneyshift.expense.entity.Transaction;
import com.moneyshift.expense.entity.User;
import com.moneyshift.expense.entity.Category;
import com.moneyshift.expense.entity.Asset;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    Page<Transaction> findByUserOrderByTransactionDateDescTransactionTimeDesc(User user, Pageable pageable);
    
    List<Transaction> findByUserAndTransactionDateBetweenOrderByTransactionDateDescTransactionTimeDesc(
        User user, LocalDate startDate, LocalDate endDate);
    
    Optional<Transaction> findByTransactionIdAndUser(Long transactionId, User user);
    
    @Query("SELECT SUM(t.amount) FROM Transaction t WHERE t.user = :user AND t.transactionType = :type AND t.transactionDate BETWEEN :startDate AND :endDate")
    BigDecimal getTotalAmountByTypeAndPeriod(
        @Param("user") User user,
        @Param("type") Transaction.TransactionType type,
        @Param("startDate") LocalDate startDate,
        @Param("endDate") LocalDate endDate);
    
    @Query("SELECT t.category, SUM(t.amount) FROM Transaction t WHERE t.user = :user AND t.transactionType = :type AND t.transactionDate BETWEEN :startDate AND :endDate GROUP BY t.category")
    List<Object[]> getCategoryStatistics(
        @Param("user") User user,
        @Param("type") Transaction.TransactionType type,
        @Param("startDate") LocalDate startDate,
        @Param("endDate") LocalDate endDate);
    
    @Query("SELECT COUNT(t) FROM Transaction t WHERE t.user = :user AND t.transactionDate BETWEEN :startDate AND :endDate")
    Long countTransactionsByPeriod(
        @Param("user") User user,
        @Param("startDate") LocalDate startDate,
        @Param("endDate") LocalDate endDate);
    
    List<Transaction> findByUserAndCategoryAndTransactionDateBetween(
        User user, Category category, LocalDate startDate, LocalDate endDate);
    
    List<Transaction> findByUserAndAssetOrderByTransactionDateDescTransactionTimeDesc(User user, Asset asset);
    
    @Query("SELECT t.transactionDate, SUM(CASE WHEN t.transactionType = 'INCOME' THEN t.amount ELSE 0 END), " +
           "SUM(CASE WHEN t.transactionType = 'EXPENSE' THEN t.amount ELSE 0 END) " +
           "FROM Transaction t WHERE t.user = :user AND t.transactionDate BETWEEN :startDate AND :endDate " +
           "GROUP BY t.transactionDate ORDER BY t.transactionDate")
    List<Object[]> getDailyStatistics(
        @Param("user") User user,
        @Param("startDate") LocalDate startDate,
        @Param("endDate") LocalDate endDate);
}
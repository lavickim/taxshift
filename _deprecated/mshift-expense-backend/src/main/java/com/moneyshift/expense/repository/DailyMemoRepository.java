package com.moneyshift.expense.repository;

import com.moneyshift.expense.entity.DailyMemo;
import com.moneyshift.expense.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface DailyMemoRepository extends JpaRepository<DailyMemo, Long> {
    
    Optional<DailyMemo> findByUserAndMemoDate(User user, LocalDate memoDate);
    
    List<DailyMemo> findByUserAndMemoDateBetweenOrderByMemoDateAsc(
        User user, LocalDate startDate, LocalDate endDate);
    
    List<DailyMemo> findByUserOrderByMemoDateDesc(User user);
    
    @Query("SELECT dm FROM DailyMemo dm WHERE dm.user = :user " +
           "AND EXTRACT(YEAR FROM dm.memoDate) = :year " +
           "AND EXTRACT(MONTH FROM dm.memoDate) = :month " +
           "ORDER BY dm.memoDate ASC")
    List<DailyMemo> findByUserAndYearMonth(@Param("user") User user, 
                                           @Param("year") int year, 
                                           @Param("month") int month);
    
    
    @Query("SELECT COUNT(dm) > 0 FROM DailyMemo dm " +
           "WHERE dm.user = :user AND dm.memoDate = :memoDate")
    boolean existsByUserAndMemoDate(@Param("user") User user, 
                                    @Param("memoDate") LocalDate memoDate);
}
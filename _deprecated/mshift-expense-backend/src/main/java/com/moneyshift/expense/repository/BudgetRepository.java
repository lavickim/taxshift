package com.moneyshift.expense.repository;

import com.moneyshift.expense.entity.Budget;
import com.moneyshift.expense.entity.User;
import com.moneyshift.expense.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BudgetRepository extends JpaRepository<Budget, Long> {
    List<Budget> findByUserAndBudgetYearAndBudgetMonth(User user, Integer year, Integer month);
    
    Optional<Budget> findByUserAndCategoryAndBudgetYearAndBudgetMonth(
        User user, Category category, Integer year, Integer month);
    
    Optional<Budget> findByBudgetIdAndUser(Long budgetId, User user);
    
    @Query("SELECT b FROM Budget b WHERE b.user = :user AND b.budgetYear = :year ORDER BY b.budgetMonth, b.category.displayOrder")
    List<Budget> findYearlyBudgets(@Param("user") User user, @Param("year") Integer year);
    
    void deleteByUserAndBudgetYearAndBudgetMonth(User user, Integer year, Integer month);
}
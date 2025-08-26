package com.moneyshift.expense.repository;

import com.moneyshift.expense.entity.Category;
import com.moneyshift.expense.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {
    List<Category> findByUserOrderByDisplayOrder(User user);
    List<Category> findByUserAndCategoryTypeOrderByDisplayOrder(User user, Category.CategoryType type);
    List<Category> findByIsDefaultTrueOrderByDisplayOrder();
    Optional<Category> findByCategoryIdAndUser(Long categoryId, User user);
    
    @Query("SELECT c FROM Category c WHERE (c.user = :user OR c.isDefault = true) AND c.categoryType = :type ORDER BY c.displayOrder")
    List<Category> findUserAndDefaultCategories(@Param("user") User user, @Param("type") Category.CategoryType type);
    
    @Query("SELECT c FROM Category c WHERE c.user = :user OR c.isDefault = true ORDER BY c.categoryType, c.displayOrder")
    List<Category> findAllUserAndDefaultCategories(@Param("user") User user);
}
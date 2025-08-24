package com.moneyshift.expense.mapper;

import com.moneyshift.expense.model.Category;
import org.apache.ibatis.annotations.*;
import java.util.List;
import java.util.Optional;

/**
 * 카테고리 데이터 접근 매퍼
 */
@Mapper
public interface CategoryMapper {
    
    @Select("SELECT * FROM categories WHERE category_id = #{categoryId} AND (user_id = #{userId} OR user_id IS NULL)")
    Optional<Category> findById(@Param("categoryId") Long categoryId, @Param("userId") Long userId);
    
    @Select("SELECT * FROM categories WHERE (user_id = #{userId} OR user_id IS NULL) " +
            "AND is_active = true ORDER BY display_order, created_at")
    List<Category> findByUserId(@Param("userId") Long userId);
    
    @Select("SELECT * FROM categories WHERE (user_id = #{userId} OR user_id IS NULL) " +
            "AND category_type = #{categoryType} AND is_active = true " +
            "ORDER BY display_order, created_at")
    List<Category> findByUserIdAndType(@Param("userId") Long userId, @Param("categoryType") String categoryType);
    
    @Select("SELECT * FROM categories WHERE user_id IS NULL AND is_active = true " +
            "ORDER BY category_type, display_order")
    List<Category> findSystemCategories();
    
    @Insert("INSERT INTO categories (user_id, category_name, category_type, icon_name, " +
            "color_code, parent_category_id, display_order) " +
            "VALUES (#{userId}, #{categoryName}, #{categoryType}, #{iconName}, " +
            "#{colorCode}, #{parentCategoryId}, #{displayOrder})")
    @SelectKey(statement = "SELECT LASTVAL()", keyProperty = "categoryId", before = false, resultType = Long.class)
    int insert(Category category);
    
    @Update("UPDATE categories SET category_name = #{categoryName}, icon_name = #{iconName}, " +
            "color_code = #{colorCode}, display_order = #{displayOrder} " +
            "WHERE category_id = #{categoryId} AND user_id = #{userId}")
    int update(Category category);
    
    @Delete("UPDATE categories SET is_active = false " +
            "WHERE category_id = #{categoryId} AND user_id = #{userId}")
    int delete(@Param("categoryId") Long categoryId, @Param("userId") Long userId);
    
    // CategoryService에서 필요한 추가 메서드들
    @Select("SELECT * FROM categories WHERE (user_id = #{userId} OR user_id IS NULL) " +
            "AND is_active = true ORDER BY display_order, created_at")
    List<Category> findActiveByUserId(@Param("userId") Long userId);
    
    @Select("SELECT * FROM categories WHERE (user_id = #{userId} OR user_id IS NULL) " +
            "AND parent_category_id = #{parentCategoryId} AND is_active = true " +
            "ORDER BY display_order, created_at")
    List<Category> findByParentCategory(@Param("userId") Long userId, @Param("parentCategoryId") Long parentCategoryId);
    
    @Select("SELECT * FROM categories WHERE (user_id = #{userId} OR user_id IS NULL) " +
            "AND parent_category_id IS NULL AND is_active = true " +
            "ORDER BY display_order, created_at")
    List<Category> findRootCategories(@Param("userId") Long userId);
    
    @Select("SELECT COALESCE(MAX(display_order), 0) FROM categories " +
            "WHERE (user_id = #{userId} OR user_id IS NULL) " +
            "AND (#{parentCategoryId} IS NULL AND parent_category_id IS NULL OR parent_category_id = #{parentCategoryId})")
    int getMaxDisplayOrder(@Param("userId") Long userId, @Param("parentCategoryId") Long parentCategoryId);
    
    @Select("SELECT COUNT(*) FROM transactions WHERE category_id = #{categoryId}")
    int countTransactionsByCategory(@Param("categoryId") Long categoryId);
    
    @Update("UPDATE categories SET is_active = #{isActive} " +
            "WHERE category_id = #{categoryId} AND user_id = #{userId}")
    int updateStatus(@Param("categoryId") Long categoryId, @Param("userId") Long userId, @Param("isActive") boolean isActive);
    
    @Update("UPDATE categories SET display_order = #{displayOrder} " +
            "WHERE category_id = #{categoryId} AND user_id = #{userId}")
    int updateDisplayOrder(@Param("categoryId") Long categoryId, @Param("userId") Long userId, @Param("displayOrder") int displayOrder);
    
    @Select("SELECT * FROM categories WHERE (user_id = #{userId} OR user_id IS NULL) " +
            "AND category_name ILIKE #{keyword} AND is_active = true " +
            "ORDER BY display_order, created_at")
    List<Category> searchByKeyword(@Param("userId") Long userId, @Param("keyword") String keyword);
    
    @Select("SELECT c.*, COALESCE(t.transaction_count, 0) as transaction_count " +
            "FROM categories c " +
            "LEFT JOIN (SELECT category_id, COUNT(*) as transaction_count " +
            "           FROM transactions GROUP BY category_id) t " +
            "ON c.category_id = t.category_id " +
            "WHERE (c.user_id = #{userId} OR c.user_id IS NULL) AND c.is_active = true " +
            "ORDER BY c.display_order, c.created_at")
    List<Category> findWithUsageStats(@Param("userId") Long userId);
}
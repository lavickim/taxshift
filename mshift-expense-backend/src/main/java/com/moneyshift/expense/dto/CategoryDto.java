package com.moneyshift.expense.dto;

import com.moneyshift.expense.entity.Category;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CategoryDto {
    private Long categoryId;
    private String categoryName;
    private Category.CategoryType categoryType;
    private String iconName;
    private String colorCode;
    private Long parentCategoryId;
    private Integer displayOrder;
    private Boolean isDefault;
    private LocalDateTime createdAt;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateRequest {
        private String categoryName;
        private Category.CategoryType categoryType;
        private String iconName;
        private String colorCode;
        private Long parentCategoryId;
        private Integer displayOrder;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpdateRequest {
        private String categoryName;
        private String iconName;
        private String colorCode;
        private Integer displayOrder;
    }
}
package com.moneyshift.expense.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.time.LocalDateTime;

/**
 * 카테고리 엔티티
 * 편한가계부 앱의 수입/지출 카테고리 관리
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Category {
    
    public enum CategoryType {
        INCOME("수입"),
        EXPENSE("지출");
        
        private final String displayName;
        
        CategoryType(String displayName) {
            this.displayName = displayName;
        }
        
        public String getDisplayName() {
            return displayName;
        }
    }
    
    private Long categoryId;
    private Long userId; // NULL for system default categories
    private String categoryName;
    private CategoryType categoryType;
    private String iconName;
    private String colorCode;
    private Long parentCategoryId;
    private Boolean isActive;
    private Integer displayOrder;
    private LocalDateTime createdAt;
}
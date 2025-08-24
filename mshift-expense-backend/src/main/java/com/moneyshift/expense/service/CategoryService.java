package com.moneyshift.expense.service;

import com.moneyshift.expense.mapper.CategoryMapper;
import com.moneyshift.expense.model.Category;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

/**
 * 카테고리 비즈니스 로직 서비스
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class CategoryService {
    
    private final CategoryMapper categoryMapper;
    
    /**
     * 카테고리 ID로 조회
     */
    public Optional<Category> getCategoryById(Long categoryId, Long userId) {
        log.debug("카테고리 조회: categoryId={}, userId={}", categoryId, userId);
        return categoryMapper.findById(categoryId, userId);
    }
    
    /**
     * 사용자의 모든 카테고리 조회
     */
    public List<Category> getUserCategories(Long userId) {
        log.debug("사용자 카테고리 목록 조회: userId={}", userId);
        return categoryMapper.findByUserId(userId);
    }
    
    /**
     * 카테고리 유형별 조회
     */
    public List<Category> getCategoriesByType(Long userId, Category.CategoryType categoryType) {
        log.debug("카테고리 유형별 조회: userId={}, categoryType={}", userId, categoryType);
        return categoryMapper.findByUserIdAndType(userId, categoryType.name());
    }
    
    /**
     * 활성 카테고리만 조회
     */
    public List<Category> getActiveCategories(Long userId) {
        log.debug("활성 카테고리 조회: userId={}", userId);
        return categoryMapper.findActiveByUserId(userId);
    }
    
    /**
     * 부모 카테고리별 하위 카테고리 조회
     */
    public List<Category> getSubCategories(Long userId, Long parentCategoryId) {
        log.debug("하위 카테고리 조회: userId={}, parentCategoryId={}", userId, parentCategoryId);
        return categoryMapper.findByParentCategory(userId, parentCategoryId);
    }
    
    /**
     * 최상위 카테고리만 조회
     */
    public List<Category> getRootCategories(Long userId) {
        log.debug("최상위 카테고리 조회: userId={}", userId);
        return categoryMapper.findRootCategories(userId);
    }
    
    /**
     * 새로운 카테고리 생성
     */
    @Transactional
    public Category createCategory(Category category) {
        log.info("카테고리 생성: userId={}, categoryName={}, categoryType={}", 
                category.getUserId(), category.getCategoryName(), category.getCategoryType());
        
        // 카테고리 검증
        validateCategory(category);
        
        // 기본값 설정
        if (category.getColorCode() == null) {
            category.setColorCode("#FF5722");
        }
        if (category.getIconName() == null) {
            category.setIconName("category");
        }
        if (category.getIsActive() == null) {
            category.setIsActive(true);
        }
        if (category.getDisplayOrder() == null) {
            // 같은 부모 하위에서 마지막 순서로 설정
            int maxOrder = categoryMapper.getMaxDisplayOrder(category.getUserId(), category.getParentCategoryId());
            category.setDisplayOrder(maxOrder + 1);
        }
        
        int result = categoryMapper.insert(category);
        if (result > 0) {
            log.info("카테고리 생성 완료: categoryId={}", category.getCategoryId());
            return category;
        } else {
            throw new RuntimeException("카테고리 생성에 실패했습니다.");
        }
    }
    
    /**
     * 카테고리 정보 수정
     */
    @Transactional
    public Category updateCategory(Category category) {
        log.info("카테고리 정보 수정: categoryId={}", category.getCategoryId());
        
        validateCategory(category);
        
        int result = categoryMapper.update(category);
        if (result > 0) {
            log.info("카테고리 정보 수정 완료: categoryId={}", category.getCategoryId());
            return category;
        } else {
            throw new RuntimeException("카테고리 정보 수정에 실패했습니다.");
        }
    }
    
    /**
     * 카테고리 삭제 (비활성화)
     */
    @Transactional
    public boolean deleteCategory(Long categoryId, Long userId) {
        log.info("카테고리 삭제: categoryId={}, userId={}", categoryId, userId);
        
        // 하위 카테고리가 있는지 확인
        List<Category> subCategories = categoryMapper.findByParentCategory(userId, categoryId);
        if (!subCategories.isEmpty()) {
            throw new RuntimeException("하위 카테고리가 있는 카테고리는 삭제할 수 없습니다.");
        }
        
        // 해당 카테고리를 사용하는 거래내역이 있는지 확인
        int transactionCount = categoryMapper.countTransactionsByCategory(categoryId);
        if (transactionCount > 0) {
            // 거래내역이 있으면 비활성화만
            int result = categoryMapper.updateStatus(categoryId, userId, false);
            if (result > 0) {
                log.info("카테고리 비활성화 완료: categoryId={}", categoryId);
                return true;
            }
        } else {
            // 거래내역이 없으면 완전 삭제
            int result = categoryMapper.delete(categoryId, userId);
            if (result > 0) {
                log.info("카테고리 삭제 완료: categoryId={}", categoryId);
                return true;
            }
        }
        
        throw new RuntimeException("카테고리 삭제에 실패했습니다.");
    }
    
    /**
     * 카테고리 순서 변경
     */
    @Transactional
    public boolean updateCategoryOrder(Long userId, List<Long> categoryIds) {
        log.info("카테고리 순서 변경: userId={}, categoryCount={}", userId, categoryIds.size());
        
        try {
            for (int i = 0; i < categoryIds.size(); i++) {
                Long categoryId = categoryIds.get(i);
                int displayOrder = i + 1;
                categoryMapper.updateDisplayOrder(categoryId, userId, displayOrder);
            }
            
            log.info("카테고리 순서 변경 완료: userId={}", userId);
            return true;
        } catch (Exception e) {
            log.error("카테고리 순서 변경 실패: {}", e.getMessage());
            throw new RuntimeException("카테고리 순서 변경에 실패했습니다.");
        }
    }
    
    /**
     * 기본 카테고리 생성 (신규 사용자용)
     */
    @Transactional
    public void createDefaultCategories(Long userId) {
        log.info("기본 카테고리 생성: userId={}", userId);
        
        // 수입 카테고리
        createCategory(Category.builder()
                .userId(userId)
                .categoryName("급여")
                .categoryType(Category.CategoryType.INCOME)
                .colorCode("#4CAF50")
                .iconName("work")
                .isActive(true)
                .displayOrder(1)
                .build());
                
        createCategory(Category.builder()
                .userId(userId)
                .categoryName("용돈")
                .categoryType(Category.CategoryType.INCOME)
                .colorCode("#8BC34A")
                .iconName("money")
                .isActive(true)
                .displayOrder(2)
                .build());
        
        // 지출 카테고리
        createCategory(Category.builder()
                .userId(userId)
                .categoryName("식비")
                .categoryType(Category.CategoryType.EXPENSE)
                .colorCode("#FF9800")
                .iconName("restaurant")
                .isActive(true)
                .displayOrder(1)
                .build());
                
        createCategory(Category.builder()
                .userId(userId)
                .categoryName("교통비")
                .categoryType(Category.CategoryType.EXPENSE)
                .colorCode("#2196F3")
                .iconName("directions_car")
                .isActive(true)
                .displayOrder(2)
                .build());
                
        createCategory(Category.builder()
                .userId(userId)
                .categoryName("생활용품")
                .categoryType(Category.CategoryType.EXPENSE)
                .colorCode("#9C27B0")
                .iconName("shopping_cart")
                .isActive(true)
                .displayOrder(3)
                .build());
                
        createCategory(Category.builder()
                .userId(userId)
                .categoryName("문화생활")
                .categoryType(Category.CategoryType.EXPENSE)
                .colorCode("#E91E63")
                .iconName("movie")
                .isActive(true)
                .displayOrder(4)
                .build());
        
        log.info("기본 카테고리 생성 완료: userId={}", userId);
    }
    
    /**
     * 카테고리 검색
     */
    public List<Category> searchCategories(Long userId, String keyword) {
        log.debug("카테고리 검색: userId={}, keyword={}", userId, keyword);
        return categoryMapper.searchByKeyword(userId, "%" + keyword + "%");
    }
    
    /**
     * 카테고리 사용 통계 조회
     */
    public List<Category> getCategoriesWithUsageStats(Long userId) {
        log.debug("카테고리 사용 통계 조회: userId={}", userId);
        return categoryMapper.findWithUsageStats(userId);
    }
    
    /**
     * 카테고리 검증
     */
    private void validateCategory(Category category) {
        if (category.getCategoryName() == null || category.getCategoryName().trim().isEmpty()) {
            throw new RuntimeException("카테고리 이름을 입력해주세요.");
        }
        
        if (category.getCategoryType() == null) {
            throw new RuntimeException("카테고리 유형을 선택해주세요.");
        }
        
        if (category.getUserId() == null) {
            throw new RuntimeException("사용자 정보가 필요합니다.");
        }
        
        // 부모 카테고리가 지정된 경우 순환 참조 확인
        if (category.getParentCategoryId() != null) {
            if (category.getCategoryId() != null && 
                category.getParentCategoryId().equals(category.getCategoryId())) {
                throw new RuntimeException("자기 자신을 부모 카테고리로 설정할 수 없습니다.");
            }
            
            // 부모 카테고리가 존재하고 같은 사용자의 카테고리인지 확인
            Optional<Category> parentCategory = categoryMapper.findById(category.getParentCategoryId(), category.getUserId());
            if (parentCategory.isEmpty()) {
                throw new RuntimeException("존재하지 않는 부모 카테고리입니다.");
            }
            
            // 부모 카테고리와 같은 유형인지 확인
            if (!parentCategory.get().getCategoryType().equals(category.getCategoryType())) {
                throw new RuntimeException("부모 카테고리와 같은 유형이어야 합니다.");
            }
        }
        
        // 같은 부모 하위에서 카테고리 이름 중복 확인
        List<Category> siblings = categoryMapper.findByParentCategory(category.getUserId(), category.getParentCategoryId());
        for (Category sibling : siblings) {
            if (sibling.getCategoryName().equals(category.getCategoryName()) && 
                !sibling.getCategoryId().equals(category.getCategoryId())) {
                throw new RuntimeException("같은 레벨에 동일한 이름의 카테고리가 있습니다.");
            }
        }
    }
}
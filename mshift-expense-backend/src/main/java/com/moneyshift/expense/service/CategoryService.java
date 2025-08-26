package com.moneyshift.expense.service;

import com.moneyshift.expense.dto.CategoryDto;
import com.moneyshift.expense.entity.Category;
import com.moneyshift.expense.entity.User;
import com.moneyshift.expense.mapper.EntityMapper;
import com.moneyshift.expense.repository.CategoryRepository;
import com.moneyshift.expense.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CategoryService {
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;
    private final EntityMapper entityMapper;

    @Transactional
    public CategoryDto createCategory(Long userId, CategoryDto.CreateRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        Category category = Category.builder()
                .user(user)
                .categoryName(request.getCategoryName())
                .categoryType(request.getCategoryType())
                .iconName(request.getIconName() != null ? request.getIconName() : "default")
                .colorCode(request.getColorCode() != null ? request.getColorCode() : "#FF5757")
                .displayOrder(request.getDisplayOrder() != null ? request.getDisplayOrder() : 0)
                .isDefault(false)
                .build();

        if (request.getParentCategoryId() != null) {
            Category parentCategory = categoryRepository.findByCategoryIdAndUser(request.getParentCategoryId(), user)
                    .orElseThrow(() -> new IllegalArgumentException("Parent category not found"));
            category.setParentCategory(parentCategory);
        }

        Category savedCategory = categoryRepository.save(category);
        log.info("Category created: {}", savedCategory.getCategoryName());
        
        return entityMapper.toCategoryDto(savedCategory);
    }

    public List<CategoryDto> getUserCategories(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        List<Category> categories = categoryRepository.findByUserOrderByDisplayOrder(user);
        
        return categories.stream()
                .map(entityMapper::toCategoryDto)
                .collect(Collectors.toList());
    }

    public List<CategoryDto> getUserCategoriesByType(Long userId, Category.CategoryType type) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        List<Category> categories = categoryRepository.findByUserAndCategoryTypeOrderByDisplayOrder(user, type);
        
        return categories.stream()
                .map(entityMapper::toCategoryDto)
                .collect(Collectors.toList());
    }

    public List<CategoryDto> getUserAndDefaultCategories(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        List<Category> categories = categoryRepository.findAllUserAndDefaultCategories(user);
        
        return categories.stream()
                .map(entityMapper::toCategoryDto)
                .collect(Collectors.toList());
    }

    public List<CategoryDto> getUserAndDefaultCategoriesByType(Long userId, Category.CategoryType type) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        List<Category> categories = categoryRepository.findUserAndDefaultCategories(user, type);
        
        return categories.stream()
                .map(entityMapper::toCategoryDto)
                .collect(Collectors.toList());
    }

    public List<CategoryDto> getDefaultCategories() {
        List<Category> categories = categoryRepository.findByIsDefaultTrueOrderByDisplayOrder();
        
        return categories.stream()
                .map(entityMapper::toCategoryDto)
                .collect(Collectors.toList());
    }

    public CategoryDto getCategory(Long userId, Long categoryId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        Category category = categoryRepository.findByCategoryIdAndUser(categoryId, user)
                .orElseThrow(() -> new IllegalArgumentException("Category not found"));

        return entityMapper.toCategoryDto(category);
    }

    @Transactional
    public CategoryDto updateCategory(Long userId, Long categoryId, CategoryDto.UpdateRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        Category category = categoryRepository.findByCategoryIdAndUser(categoryId, user)
                .orElseThrow(() -> new IllegalArgumentException("Category not found"));

        if (category.getIsDefault()) {
            throw new IllegalArgumentException("Cannot update default category");
        }

        if (request.getCategoryName() != null) {
            category.setCategoryName(request.getCategoryName());
        }
        if (request.getIconName() != null) {
            category.setIconName(request.getIconName());
        }
        if (request.getColorCode() != null) {
            category.setColorCode(request.getColorCode());
        }
        if (request.getDisplayOrder() != null) {
            category.setDisplayOrder(request.getDisplayOrder());
        }

        Category updatedCategory = categoryRepository.save(category);
        return entityMapper.toCategoryDto(updatedCategory);
    }

    @Transactional
    public void deleteCategory(Long userId, Long categoryId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        Category category = categoryRepository.findByCategoryIdAndUser(categoryId, user)
                .orElseThrow(() -> new IllegalArgumentException("Category not found"));

        if (category.getIsDefault()) {
            throw new IllegalArgumentException("Cannot delete default category");
        }

        categoryRepository.delete(category);
        log.info("Category deleted: {}", category.getCategoryName());
    }
}
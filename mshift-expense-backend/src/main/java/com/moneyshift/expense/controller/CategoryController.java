package com.moneyshift.expense.controller;

import com.moneyshift.expense.filter.JwtAuthenticationFilter;
import com.moneyshift.expense.model.Category;
import com.moneyshift.expense.service.CategoryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

/**
 * 카테고리 관리 REST API 컨트롤러
 */
@Slf4j
@RestController
@RequestMapping("/v1/categories")
@RequiredArgsConstructor
@Tag(name = "Category Management", description = "카테고리 관리 API")
public class CategoryController {
    
    private final CategoryService categoryService;
    
    /**
     * 사용자의 모든 카테고리 조회
     */
    @Operation(summary = "카테고리 목록 조회", description = "사용자의 모든 카테고리를 조회합니다.")
    @GetMapping
    public ResponseEntity<List<Category>> getUserCategories(Authentication auth) {
        Long userId = getCurrentUserId(auth);
        log.info("카테고리 목록 조회: userId={}", userId);
        
        List<Category> categories = categoryService.getUserCategories(userId);
        return ResponseEntity.ok(categories);
    }
    
    /**
     * 카테고리 상세 조회
     */
    @Operation(summary = "카테고리 상세 조회", description = "특정 카테고리의 상세 정보를 조회합니다.")
    @GetMapping("/{categoryId}")
    public ResponseEntity<Category> getCategory(@PathVariable Long categoryId, Authentication auth) {
        Long userId = getCurrentUserId(auth);
        log.info("카테고리 상세 조회: categoryId={}, userId={}", categoryId, userId);
        
        Optional<Category> category = categoryService.getCategoryById(categoryId, userId);
        if (category.isPresent()) {
            return ResponseEntity.ok(category.get());
        } else {
            return ResponseEntity.notFound().build();
        }
    }
    
    /**
     * 카테고리 유형별 조회
     */
    @Operation(summary = "카테고리 유형별 조회", description = "특정 유형의 카테고리들을 조회합니다.")
    @GetMapping("/type/{categoryType}")
    public ResponseEntity<List<Category>> getCategoriesByType(@PathVariable Category.CategoryType categoryType, 
                                                             Authentication auth) {
        Long userId = getCurrentUserId(auth);
        log.info("카테고리 유형별 조회: userId={}, categoryType={}", userId, categoryType);
        
        List<Category> categories = categoryService.getCategoriesByType(userId, categoryType);
        return ResponseEntity.ok(categories);
    }
    
    /**
     * 활성 카테고리만 조회
     */
    @Operation(summary = "활성 카테고리 조회", description = "활성화된 카테고리만 조회합니다.")
    @GetMapping("/active")
    public ResponseEntity<List<Category>> getActiveCategories(Authentication auth) {
        Long userId = getCurrentUserId(auth);
        log.info("활성 카테고리 조회: userId={}", userId);
        
        List<Category> categories = categoryService.getActiveCategories(userId);
        return ResponseEntity.ok(categories);
    }
    
    /**
     * 최상위 카테고리만 조회
     */
    @Operation(summary = "최상위 카테고리 조회", description = "부모가 없는 최상위 카테고리만 조회합니다.")
    @GetMapping("/root")
    public ResponseEntity<List<Category>> getRootCategories(Authentication auth) {
        Long userId = getCurrentUserId(auth);
        log.info("최상위 카테고리 조회: userId={}", userId);
        
        List<Category> categories = categoryService.getRootCategories(userId);
        return ResponseEntity.ok(categories);
    }
    
    /**
     * 하위 카테고리 조회
     */
    @Operation(summary = "하위 카테고리 조회", description = "특정 카테고리의 하위 카테고리들을 조회합니다.")
    @GetMapping("/{parentCategoryId}/subcategories")
    public ResponseEntity<List<Category>> getSubCategories(@PathVariable Long parentCategoryId, Authentication auth) {
        Long userId = getCurrentUserId(auth);
        log.info("하위 카테고리 조회: userId={}, parentCategoryId={}", userId, parentCategoryId);
        
        List<Category> subCategories = categoryService.getSubCategories(userId, parentCategoryId);
        return ResponseEntity.ok(subCategories);
    }
    
    /**
     * 새로운 카테고리 생성
     */
    @Operation(summary = "카테고리 생성", description = "새로운 카테고리를 생성합니다.")
    @PostMapping
    public ResponseEntity<Category> createCategory(@Validated @RequestBody Category category, Authentication auth) {
        Long userId = getCurrentUserId(auth);
        category.setUserId(userId);
        
        log.info("카테고리 생성: userId={}, categoryName={}, categoryType={}", 
                userId, category.getCategoryName(), category.getCategoryType());
        
        try {
            Category createdCategory = categoryService.createCategory(category);
            return ResponseEntity.ok(createdCategory);
        } catch (RuntimeException e) {
            log.error("카테고리 생성 실패: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * 카테고리 수정
     */
    @Operation(summary = "카테고리 수정", description = "기존 카테고리를 수정합니다.")
    @PutMapping("/{categoryId}")
    public ResponseEntity<Category> updateCategory(@PathVariable Long categoryId,
                                                  @Validated @RequestBody Category category,
                                                  Authentication auth) {
        Long userId = getCurrentUserId(auth);
        category.setCategoryId(categoryId);
        category.setUserId(userId);
        
        log.info("카테고리 수정: categoryId={}, userId={}", categoryId, userId);
        
        try {
            Category updatedCategory = categoryService.updateCategory(category);
            return ResponseEntity.ok(updatedCategory);
        } catch (RuntimeException e) {
            log.error("카테고리 수정 실패: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * 카테고리 삭제
     */
    @Operation(summary = "카테고리 삭제", description = "기존 카테고리를 삭제합니다.")
    @DeleteMapping("/{categoryId}")
    public ResponseEntity<Void> deleteCategory(@PathVariable Long categoryId, Authentication auth) {
        Long userId = getCurrentUserId(auth);
        log.info("카테고리 삭제: categoryId={}, userId={}", categoryId, userId);
        
        try {
            boolean success = categoryService.deleteCategory(categoryId, userId);
            if (success) {
                return ResponseEntity.ok().build();
            } else {
                return ResponseEntity.badRequest().build();
            }
        } catch (RuntimeException e) {
            log.error("카테고리 삭제 실패: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * 카테고리 순서 변경
     */
    @Operation(summary = "카테고리 순서 변경", description = "카테고리들의 표시 순서를 변경합니다.")
    @PutMapping("/reorder")
    public ResponseEntity<Void> updateCategoryOrder(@RequestBody List<Long> categoryIds, Authentication auth) {
        Long userId = getCurrentUserId(auth);
        log.info("카테고리 순서 변경: userId={}, categoryCount={}", userId, categoryIds.size());
        
        try {
            boolean success = categoryService.updateCategoryOrder(userId, categoryIds);
            if (success) {
                return ResponseEntity.ok().build();
            } else {
                return ResponseEntity.badRequest().build();
            }
        } catch (RuntimeException e) {
            log.error("카테고리 순서 변경 실패: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * 카테고리 검색
     */
    @Operation(summary = "카테고리 검색", description = "키워드로 카테고리를 검색합니다.")
    @GetMapping("/search")
    public ResponseEntity<List<Category>> searchCategories(@RequestParam String keyword, Authentication auth) {
        Long userId = getCurrentUserId(auth);
        log.info("카테고리 검색: userId={}, keyword={}", userId, keyword);
        
        List<Category> categories = categoryService.searchCategories(userId, keyword);
        return ResponseEntity.ok(categories);
    }
    
    /**
     * 카테고리 사용 통계 조회
     */
    @Operation(summary = "카테고리 사용 통계", description = "각 카테고리의 사용 통계를 포함하여 조회합니다.")
    @GetMapping("/with-stats")
    public ResponseEntity<List<Category>> getCategoriesWithUsageStats(Authentication auth) {
        Long userId = getCurrentUserId(auth);
        log.info("카테고리 사용 통계 조회: userId={}", userId);
        
        List<Category> categories = categoryService.getCategoriesWithUsageStats(userId);
        return ResponseEntity.ok(categories);
    }
    
    /**
     * 기본 카테고리 생성 (관리자용)
     */
    @Operation(summary = "기본 카테고리 생성", description = "신규 사용자를 위한 기본 카테고리를 생성합니다.")
    @PostMapping("/create-defaults")
    public ResponseEntity<Void> createDefaultCategories(Authentication auth) {
        Long userId = getCurrentUserId(auth);
        log.info("기본 카테고리 생성 요청: userId={}", userId);
        
        try {
            categoryService.createDefaultCategories(userId);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            log.error("기본 카테고리 생성 실패: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * 현재 인증된 사용자 ID 추출
     */
    private Long getCurrentUserId(Authentication auth) {
        if (auth != null && auth.getPrincipal() instanceof JwtAuthenticationFilter.UserPrincipal) {
            return ((JwtAuthenticationFilter.UserPrincipal) auth.getPrincipal()).getUserId();
        }
        throw new RuntimeException("인증 정보를 찾을 수 없습니다.");
    }
}
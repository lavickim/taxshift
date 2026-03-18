package com.moneyshift.expense.controller;

import com.moneyshift.expense.dto.CategoryDto;
import com.moneyshift.expense.entity.Category;
import com.moneyshift.expense.service.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/categories")
@RequiredArgsConstructor
@CrossOrigin
public class CategoryController {
    private final CategoryService categoryService;

    @PostMapping
    public ResponseEntity<CategoryDto> createCategory(
            @RequestParam Long userId,
            @RequestBody CategoryDto.CreateRequest request) {
        CategoryDto category = categoryService.createCategory(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(category);
    }

    @GetMapping
    public ResponseEntity<List<CategoryDto>> getUserCategories(
            @RequestParam Long userId,
            @RequestParam(required = false) Category.CategoryType type,
            @RequestParam(defaultValue = "false") boolean includeDefault) {
        
        List<CategoryDto> categories;
        if (includeDefault) {
            categories = (type != null) ? 
                categoryService.getUserAndDefaultCategoriesByType(userId, type) :
                categoryService.getUserAndDefaultCategories(userId);
        } else {
            categories = (type != null) ?
                categoryService.getUserCategoriesByType(userId, type) :
                categoryService.getUserCategories(userId);
        }
        
        return ResponseEntity.ok(categories);
    }

    @GetMapping("/default")
    public ResponseEntity<List<CategoryDto>> getDefaultCategories() {
        List<CategoryDto> categories = categoryService.getDefaultCategories();
        return ResponseEntity.ok(categories);
    }

    @GetMapping("/{categoryId}")
    public ResponseEntity<CategoryDto> getCategory(
            @RequestParam Long userId,
            @PathVariable Long categoryId) {
        CategoryDto category = categoryService.getCategory(userId, categoryId);
        return ResponseEntity.ok(category);
    }

    @PutMapping("/{categoryId}")
    public ResponseEntity<CategoryDto> updateCategory(
            @RequestParam Long userId,
            @PathVariable Long categoryId,
            @RequestBody CategoryDto.UpdateRequest request) {
        CategoryDto category = categoryService.updateCategory(userId, categoryId, request);
        return ResponseEntity.ok(category);
    }

    @DeleteMapping("/{categoryId}")
    public ResponseEntity<Void> deleteCategory(
            @RequestParam Long userId,
            @PathVariable Long categoryId) {
        categoryService.deleteCategory(userId, categoryId);
        return ResponseEntity.noContent().build();
    }
}
package com.moneyshift.expense.mapper;

import com.moneyshift.expense.dto.*;
import com.moneyshift.expense.entity.*;
import org.springframework.stereotype.Component;

@Component
public class EntityMapper {
    
    public UserDto toUserDto(User user) {
        if (user == null) return null;
        
        return UserDto.builder()
                .userId(user.getUserId())
                .email(user.getEmail())
                .nickname(user.getNickname())
                .isPremium(user.getIsPremium())
                .createdAt(user.getCreatedAt())
                .lastLoginAt(user.getLastLoginAt())
                .build();
    }
    
    public AssetDto toAssetDto(Asset asset) {
        if (asset == null) return null;
        
        return AssetDto.builder()
                .assetId(asset.getAssetId())
                .assetName(asset.getAssetName())
                .assetType(asset.getAssetType())
                .bankName(asset.getBankName())
                .accountNumber(asset.getAccountNumber())
                .initialBalance(asset.getInitialBalance())
                .currentBalance(asset.getCurrentBalance())
                .colorCode(asset.getColorCode())
                .iconName(asset.getIconName())
                .displayOrder(asset.getDisplayOrder())
                .isActive(asset.getIsActive())
                .createdAt(asset.getCreatedAt())
                .build();
    }
    
    public CategoryDto toCategoryDto(Category category) {
        if (category == null) return null;
        
        return CategoryDto.builder()
                .categoryId(category.getCategoryId())
                .categoryName(category.getCategoryName())
                .categoryType(category.getCategoryType())
                .iconName(category.getIconName())
                .colorCode(category.getColorCode())
                .parentCategoryId(category.getParentCategory() != null ? category.getParentCategory().getCategoryId() : null)
                .displayOrder(category.getDisplayOrder())
                .isDefault(category.getIsDefault())
                .createdAt(category.getCreatedAt())
                .build();
    }
    
    public TransactionDto toTransactionDto(Transaction transaction) {
        if (transaction == null) return null;
        
        return TransactionDto.builder()
                .transactionId(transaction.getTransactionId())
                .transactionType(transaction.getTransactionType())
                .amount(transaction.getAmount())
                .assetId(transaction.getAsset() != null ? transaction.getAsset().getAssetId() : null)
                .assetName(transaction.getAsset() != null ? transaction.getAsset().getAssetName() : null)
                .categoryId(transaction.getCategory() != null ? transaction.getCategory().getCategoryId() : null)
                .categoryName(transaction.getCategory() != null ? transaction.getCategory().getCategoryName() : null)
                .description(transaction.getDescription())
                .memo(transaction.getMemo())
                .transactionDate(transaction.getTransactionDate())
                .transactionTime(transaction.getTransactionTime())
                .targetAssetId(transaction.getTargetAsset() != null ? transaction.getTargetAsset().getAssetId() : null)
                .targetAssetName(transaction.getTargetAsset() != null ? transaction.getTargetAsset().getAssetName() : null)
                .receiptPhotoUrl(transaction.getReceiptPhotoUrl())
                .isRecurring(transaction.getIsRecurring())
                .recurringType(transaction.getRecurringType())
                .recurringEndDate(transaction.getRecurringEndDate())
                .createdAt(transaction.getCreatedAt())
                .updatedAt(transaction.getUpdatedAt())
                .build();
    }
    
    public BudgetDto toBudgetDto(Budget budget) {
        if (budget == null) return null;
        
        return BudgetDto.builder()
                .budgetId(budget.getBudgetId())
                .categoryId(budget.getCategory() != null ? budget.getCategory().getCategoryId() : null)
                .categoryName(budget.getCategory() != null ? budget.getCategory().getCategoryName() : null)
                .budgetAmount(budget.getBudgetAmount())
                .budgetYear(budget.getBudgetYear())
                .budgetMonth(budget.getBudgetMonth())
                .createdAt(budget.getCreatedAt())
                .build();
    }
}
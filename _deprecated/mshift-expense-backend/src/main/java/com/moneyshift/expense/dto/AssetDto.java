package com.moneyshift.expense.dto;

import com.moneyshift.expense.entity.Asset;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AssetDto {
    private Long assetId;
    private String assetName;
    private Asset.AssetType assetType;
    private String bankName;
    private String accountNumber;
    private BigDecimal initialBalance;
    private BigDecimal currentBalance;
    private String colorCode;
    private String iconName;
    private Integer displayOrder;
    private Boolean isActive;
    private LocalDateTime createdAt;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateRequest {
        private String assetName;
        private Asset.AssetType assetType;
        private String bankName;
        private String accountNumber;
        private BigDecimal initialBalance;
        private String colorCode;
        private String iconName;
        private Integer displayOrder;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpdateRequest {
        private String assetName;
        private String bankName;
        private String accountNumber;
        private String colorCode;
        private String iconName;
        private Integer displayOrder;
        private Boolean isActive;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BalanceUpdateRequest {
        private BigDecimal amount;
        private String type; // ADD, SUBTRACT, SET
    }
}
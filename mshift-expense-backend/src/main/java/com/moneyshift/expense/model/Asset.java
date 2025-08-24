package com.moneyshift.expense.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 자산(계좌/카드/현금) 엔티티
 * 편한가계부 앱의 자산 관리
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Asset {
    
    public enum AssetType {
        CASH("현금"),
        BANK("은행"),
        CARD("카드"),
        INVESTMENT("투자"),
        OTHER("기타");
        
        private final String displayName;
        
        AssetType(String displayName) {
            this.displayName = displayName;
        }
        
        public String getDisplayName() {
            return displayName;
        }
    }
    
    private Long assetId;
    private Long userId;
    private String assetName;
    private AssetType assetType;
    private String bankName;
    private String accountNumber;
    private BigDecimal balance;
    private String colorCode;
    private String iconName;
    private Boolean isActive;
    private Integer displayOrder;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
package com.moneyshift.expense.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.time.LocalDateTime;

/**
 * 사용자 엔티티
 * 편한가계부 앱의 사용자 정보를 관리
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {
    
    private Long userId;
    private String username;
    private String email;
    private String passwordHash;
    private String fullName;
    private String phoneNumber;
    private String profileImageUrl;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // 비밀번호는 반환하지 않도록 처리
    public void clearSensitiveData() {
        this.passwordHash = null;
    }
}
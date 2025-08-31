package com.moneyshift.expense.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChallengeDto {
    private Long id;
    private String title;
    private String description;
    private String category;
    private String challengeType;
    private Integer difficultyLevel;
    private Integer points;
    private Long badgeId;
    
    // 챌린지 조건
    private BigDecimal targetAmount;
    private Integer targetDays;
    private Integer targetCount;
    private String rules;
    
    // 기간 설정
    private LocalDate startDate;
    private LocalDate endDate;
    private Boolean isRecurring;
    
    // 상태
    private Boolean isActive;
    private Integer participantCount;
    private BigDecimal completionRate;
    
    // 사용자 참여 정보 (optional)
    private Boolean isJoined;
    private String userStatus;
    private BigDecimal userProgress;
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
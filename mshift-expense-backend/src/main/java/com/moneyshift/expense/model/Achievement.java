package com.moneyshift.expense.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Achievement {
    private String id;
    private String userId;
    private String achievementType;
    private String title;
    private String description;
    private String iconName;
    private Integer pointsAwarded;
    private String badgeEarned;
    private LocalDateTime unlockedAt;
}
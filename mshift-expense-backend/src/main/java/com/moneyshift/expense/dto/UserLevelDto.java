package com.moneyshift.expense.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserLevelDto {
    private Long userId;
    private Integer currentLevel;
    private Integer currentExp;
    private Integer totalExp;
    private Integer totalPoints;
    private Integer challengesCompleted;
    private Integer challengesFailed;
    private Integer badgesEarned;
    private Integer streakDays;
    private LocalDate lastActiveDate;
    private String title;
    private String tier;
    private Integer requiredExpForNextLevel;
    private Double progressToNextLevel;
}
package com.moneyshift.expense.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserChallengeDto {
    private Long id;
    private Long userId;
    private ChallengeDto challenge;
    private String status;
    private BigDecimal progress;
    private BigDecimal currentAmount;
    private Integer currentCount;
    private LocalDateTime joinedAt;
    private LocalDateTime completedAt;
    private LocalDateTime lastUpdated;
    private Integer pointsEarned;
    private String[] badgesEarned;
}
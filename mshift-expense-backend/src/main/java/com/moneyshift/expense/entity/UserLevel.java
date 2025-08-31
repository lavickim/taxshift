package com.moneyshift.expense.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "et_user_levels")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserLevel {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", unique = true, nullable = false)
    private User user;
    
    @Column(name = "current_level")
    private Integer currentLevel = 1;
    
    @Column(name = "current_exp")
    private Integer currentExp = 0;
    
    @Column(name = "total_exp")
    private Integer totalExp = 0;
    
    @Column(name = "total_points")
    private Integer totalPoints = 0;
    
    // 통계
    @Column(name = "challenges_completed")
    private Integer challengesCompleted = 0;
    
    @Column(name = "challenges_failed")
    private Integer challengesFailed = 0;
    
    @Column(name = "badges_earned")
    private Integer badgesEarned = 0;
    
    @Column(name = "streak_days")
    private Integer streakDays = 0;
    
    @Column(name = "last_active_date")
    private LocalDate lastActiveDate;
    
    // 타이틀
    @Column(length = 100)
    private String title = "초보 절약러";
    
    @Column(length = 20)
    private String tier = "bronze"; // bronze, silver, gold, platinum, diamond
    
    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
    
    // 레벨업 체크
    public boolean checkLevelUp() {
        int requiredExp = getRequiredExpForNextLevel();
        if (currentExp >= requiredExp) {
            currentLevel++;
            currentExp -= requiredExp;
            updateTierAndTitle();
            return true;
        }
        return false;
    }
    
    // 다음 레벨에 필요한 경험치
    public int getRequiredExpForNextLevel() {
        return 100 * currentLevel + (currentLevel * currentLevel * 10);
    }
    
    // 티어와 타이틀 업데이트
    private void updateTierAndTitle() {
        if (currentLevel >= 50) {
            tier = "diamond";
            title = "절약의 신";
        } else if (currentLevel >= 40) {
            tier = "platinum";
            title = "절약 마스터";
        } else if (currentLevel >= 30) {
            tier = "gold";
            title = "절약 전문가";
        } else if (currentLevel >= 20) {
            tier = "silver";
            title = "절약 고수";
        } else if (currentLevel >= 10) {
            tier = "bronze";
            title = "절약 입문자";
        }
    }
}
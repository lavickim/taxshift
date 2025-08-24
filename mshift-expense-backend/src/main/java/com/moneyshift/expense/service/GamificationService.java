package com.moneyshift.expense.service;

import com.moneyshift.expense.model.User;
import com.moneyshift.expense.model.Achievement;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class GamificationService {

    /**
     * Check and award achievements for user actions
     */
    public List<Achievement> checkAndAwardAchievements(String userId, String actionType, Object actionData) {
        List<Achievement> newAchievements = new ArrayList<>();
        
        switch (actionType) {
            case "RECEIPT_UPLOADED":
                newAchievements.addAll(checkReceiptAchievements(userId, (Integer) actionData));
                break;
            case "TRANSACTION_CREATED":
                newAchievements.addAll(checkTransactionAchievements(userId, (Integer) actionData));
                break;
            case "WEEKLY_GOAL_MET":
                newAchievements.add(createWeeklyGoalAchievement(userId));
                break;
            case "PREMIUM_UPGRADE":
                newAchievements.add(createPremiumAchievement(userId));
                break;
        }
        
        // Save achievements to database here
        for (Achievement achievement : newAchievements) {
            log.info("New achievement awarded to user {}: {}", userId, achievement.getTitle());
        }
        
        return newAchievements;
    }

    private List<Achievement> checkReceiptAchievements(String userId, int totalReceipts) {
        List<Achievement> achievements = new ArrayList<>();
        
        // First receipt milestone
        if (totalReceipts == 1) {
            achievements.add(Achievement.builder()
                    .id(generateAchievementId())
                    .userId(userId)
                    .achievementType("FIRST_RECEIPT")
                    .title("첫 영수증 마스터")
                    .description("첫 번째 영수증을 업로드했습니다!")
                    .iconName("camera")
                    .pointsAwarded(100)
                    .badgeEarned("BEGINNER")
                    .unlockedAt(LocalDateTime.now())
                    .build());
        }
        
        // Receipt milestones
        if (totalReceipts == 10) {
            achievements.add(Achievement.builder()
                    .id(generateAchievementId())
                    .userId(userId)
                    .achievementType("RECEIPT_COLLECTOR")
                    .title("영수증 컬렉터")
                    .description("영수증 10장을 모았습니다!")
                    .iconName("receipt")
                    .pointsAwarded(250)
                    .badgeEarned("COLLECTOR")
                    .unlockedAt(LocalDateTime.now())
                    .build());
        }
        
        if (totalReceipts == 50) {
            achievements.add(Achievement.builder()
                    .id(generateAchievementId())
                    .userId(userId)
                    .achievementType("RECEIPT_EXPERT")
                    .title("영수증 전문가")
                    .description("영수증 50장을 달성했습니다!")
                    .iconName("star")
                    .pointsAwarded(500)
                    .badgeEarned("EXPERT")
                    .unlockedAt(LocalDateTime.now())
                    .build());
        }
        
        if (totalReceipts == 100) {
            achievements.add(Achievement.builder()
                    .id(generateAchievementId())
                    .userId(userId)
                    .achievementType("RECEIPT_MASTER")
                    .title("영수증 마스터")
                    .description("영수증 100장을 달성! 진정한 가계부 마스터입니다!")
                    .iconName("trophy")
                    .pointsAwarded(1000)
                    .badgeEarned("MASTER")
                    .unlockedAt(LocalDateTime.now())
                    .build());
        }
        
        return achievements;
    }

    private List<Achievement> checkTransactionAchievements(String userId, int totalTransactions) {
        List<Achievement> achievements = new ArrayList<>();
        
        // Transaction milestones
        if (totalTransactions == 25) {
            achievements.add(Achievement.builder()
                    .id(generateAchievementId())
                    .userId(userId)
                    .achievementType("TRANSACTION_TRACKER")
                    .title("거래 추적자")
                    .description("거래 25건을 기록했습니다!")
                    .iconName("list")
                    .pointsAwarded(200)
                    .badgeEarned("TRACKER")
                    .unlockedAt(LocalDateTime.now())
                    .build());
        }
        
        if (totalTransactions == 100) {
            achievements.add(Achievement.builder()
                    .id(generateAchievementId())
                    .userId(userId)
                    .achievementType("TRANSACTION_MANAGER")
                    .title("거래 관리자")
                    .description("거래 100건 달성! 체계적인 가계 관리를 하고 있습니다!")
                    .iconName("checkmark-circle")
                    .pointsAwarded(750)
                    .badgeEarned("MANAGER")
                    .unlockedAt(LocalDateTime.now())
                    .build());
        }
        
        return achievements;
    }

    private Achievement createWeeklyGoalAchievement(String userId) {
        return Achievement.builder()
                .id(generateAchievementId())
                .userId(userId)
                .achievementType("WEEKLY_GOAL")
                .title("주간 목표 달성")
                .description("이번 주 목표를 달성했습니다!")
                .iconName("calendar")
                .pointsAwarded(150)
                .badgeEarned("CONSISTENT")
                .unlockedAt(LocalDateTime.now())
                .build();
    }

    private Achievement createPremiumAchievement(String userId) {
        return Achievement.builder()
                .id(generateAchievementId())
                .userId(userId)
                .achievementType("PREMIUM_USER")
                .title("프리미엄 업그레이드")
                .description("프리미엄 사용자가 되셨습니다! 더 많은 기능을 활용해보세요!")
                .iconName("star")
                .pointsAwarded(500)
                .badgeEarned("PREMIUM")
                .unlockedAt(LocalDateTime.now())
                .build();
    }

    /**
     * Calculate user level based on total points
     */
    public int calculateUserLevel(int totalPoints) {
        if (totalPoints < 500) return 1;
        if (totalPoints < 1000) return 2;
        if (totalPoints < 2000) return 3;
        if (totalPoints < 3500) return 4;
        if (totalPoints < 5000) return 5;
        if (totalPoints < 7500) return 6;
        if (totalPoints < 10000) return 7;
        if (totalPoints < 15000) return 8;
        if (totalPoints < 20000) return 9;
        return 10; // Max level
    }

    /**
     * Get next level requirements
     */
    public int getPointsForNextLevel(int currentLevel) {
        switch (currentLevel) {
            case 1: return 500;
            case 2: return 1000;
            case 3: return 2000;
            case 4: return 3500;
            case 5: return 5000;
            case 6: return 7500;
            case 7: return 10000;
            case 8: return 15000;
            case 9: return 20000;
            default: return 20000; // Max level
        }
    }

    /**
     * Get current badge based on achievements
     */
    public String getCurrentBadge(List<Achievement> achievements) {
        // Return the highest badge earned
        if (achievements.stream().anyMatch(a -> "MASTER".equals(a.getBadgeEarned()))) {
            return "MASTER";
        }
        if (achievements.stream().anyMatch(a -> "EXPERT".equals(a.getBadgeEarned()))) {
            return "EXPERT";
        }
        if (achievements.stream().anyMatch(a -> "MANAGER".equals(a.getBadgeEarned()))) {
            return "MANAGER";
        }
        if (achievements.stream().anyMatch(a -> "COLLECTOR".equals(a.getBadgeEarned()))) {
            return "COLLECTOR";
        }
        if (achievements.stream().anyMatch(a -> "TRACKER".equals(a.getBadgeEarned()))) {
            return "TRACKER";
        }
        if (achievements.stream().anyMatch(a -> "PREMIUM".equals(a.getBadgeEarned()))) {
            return "PREMIUM";
        }
        return "BEGINNER";
    }

    private String generateAchievementId() {
        return "achievement_" + System.currentTimeMillis() + "_" + (int)(Math.random() * 1000);
    }
}
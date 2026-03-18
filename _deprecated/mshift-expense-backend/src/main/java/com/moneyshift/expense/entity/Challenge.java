package com.moneyshift.expense.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "et_challenges")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Challenge {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, length = 200)
    private String title;
    
    @Column(columnDefinition = "TEXT", nullable = false)
    private String description;
    
    @Column(nullable = false, length = 50)
    private String category;
    
    @Column(name = "challenge_type", nullable = false, length = 50)
    private String challengeType;
    
    @Column(name = "difficulty_level")
    private Integer difficultyLevel = 1;
    
    private Integer points = 100;
    
    @Column(name = "badge_id")
    private Long badgeId;
    
    // 챌린지 조건
    @Column(name = "target_amount", precision = 15, scale = 2)
    private BigDecimal targetAmount;
    
    @Column(name = "target_days")
    private Integer targetDays;
    
    @Column(name = "target_count")
    private Integer targetCount;
    
    @Column(columnDefinition = "jsonb")
    private String rules;
    
    // 기간 설정
    @Column(name = "start_date")
    private LocalDate startDate;
    
    @Column(name = "end_date")
    private LocalDate endDate;
    
    @Column(name = "is_recurring")
    private Boolean isRecurring = false;
    
    // 상태
    @Column(name = "is_active")
    private Boolean isActive = true;
    
    @Column(name = "participant_count")
    private Integer participantCount = 0;
    
    @Column(name = "completion_rate", precision = 5, scale = 2)
    private BigDecimal completionRate = BigDecimal.ZERO;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
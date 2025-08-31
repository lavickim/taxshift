package com.moneyshift.expense.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "et_badges")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Badge {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, length = 100)
    private String name;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @Column(length = 50)
    private String category; // challenge, level, special, seasonal
    
    @Column(name = "icon_url", length = 255)
    private String iconUrl;
    
    @Column(length = 20)
    private String rarity; // common, rare, epic, legendary
    
    @Column(name = "points_value")
    private Integer pointsValue = 0;
    
    @Column(name = "unlock_condition", columnDefinition = "jsonb")
    private String unlockCondition;
    
    @Column(name = "is_active")
    private Boolean isActive = true;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();
}
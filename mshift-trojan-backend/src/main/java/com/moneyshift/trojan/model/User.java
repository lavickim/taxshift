package com.moneyshift.trojan.model;

import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import com.fasterxml.jackson.annotation.JsonIgnore;

import java.time.LocalDateTime;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class User {
    private String id;
    private String email;
    private String name;
    
    @JsonIgnore
    private String passwordHash;
    
    private String profileImageUrl;
    private boolean isPremium;
    private String subscriptionType; // FREE, PREMIUM
    
    // User preferences as JSON
    private Map<String, Object> preferences;
    
    // Analytics consent
    private boolean dataCollectionConsent;
    private boolean marketingConsent;
    
    // Usage statistics
    private int totalReceipts;
    private int totalTransactions;
    private LocalDateTime lastActiveAt;
    
    // Timestamps
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // Gamification
    private int currentLevel;
    private int totalPoints;
    private String currentBadge;
    
    // Device info for analytics
    private String deviceType;
    private String appVersion;
    private String osVersion;
}
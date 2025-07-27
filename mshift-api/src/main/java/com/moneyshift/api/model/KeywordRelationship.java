package com.moneyshift.api.model;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 키워드 관계 모델
 * D3 키워드 그래프 시스템용
 */
public class KeywordRelationship {
    private Long id;
    private Long sourceKeywordId;
    private Long targetKeywordId;
    private String relationshipType;
    private BigDecimal strength;
    private Integer coOccurrenceCount;
    private BigDecimal pmiScore;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // 추가 필드 (조인용)
    private String sourceKeyword;
    private String targetKeyword;
    private String sourceCategory;
    private String targetCategory;

    // 기본 생성자
    public KeywordRelationship() {}

    // 생성자
    public KeywordRelationship(Long sourceKeywordId, Long targetKeywordId, String relationshipType, BigDecimal strength) {
        this.sourceKeywordId = sourceKeywordId;
        this.targetKeywordId = targetKeywordId;
        this.relationshipType = relationshipType;
        this.strength = strength;
        this.coOccurrenceCount = 1;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getSourceKeywordId() {
        return sourceKeywordId;
    }

    public void setSourceKeywordId(Long sourceKeywordId) {
        this.sourceKeywordId = sourceKeywordId;
    }

    public Long getTargetKeywordId() {
        return targetKeywordId;
    }

    public void setTargetKeywordId(Long targetKeywordId) {
        this.targetKeywordId = targetKeywordId;
    }

    public String getRelationshipType() {
        return relationshipType;
    }

    public void setRelationshipType(String relationshipType) {
        this.relationshipType = relationshipType;
    }

    public BigDecimal getStrength() {
        return strength;
    }

    public void setStrength(BigDecimal strength) {
        this.strength = strength;
    }

    public Integer getCoOccurrenceCount() {
        return coOccurrenceCount;
    }

    public void setCoOccurrenceCount(Integer coOccurrenceCount) {
        this.coOccurrenceCount = coOccurrenceCount;
    }

    public BigDecimal getPmiScore() {
        return pmiScore;
    }

    public void setPmiScore(BigDecimal pmiScore) {
        this.pmiScore = pmiScore;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public String getSourceKeyword() {
        return sourceKeyword;
    }

    public void setSourceKeyword(String sourceKeyword) {
        this.sourceKeyword = sourceKeyword;
    }

    public String getTargetKeyword() {
        return targetKeyword;
    }

    public void setTargetKeyword(String targetKeyword) {
        this.targetKeyword = targetKeyword;
    }

    public String getSourceCategory() {
        return sourceCategory;
    }

    public void setSourceCategory(String sourceCategory) {
        this.sourceCategory = sourceCategory;
    }

    public String getTargetCategory() {
        return targetCategory;
    }

    public void setTargetCategory(String targetCategory) {
        this.targetCategory = targetCategory;
    }

    @Override
    public String toString() {
        return "KeywordRelationship{" +
                "id=" + id +
                ", sourceKeywordId=" + sourceKeywordId +
                ", targetKeywordId=" + targetKeywordId +
                ", relationshipType='" + relationshipType + '\'' +
                ", strength=" + strength +
                ", coOccurrenceCount=" + coOccurrenceCount +
                '}';
    }
}
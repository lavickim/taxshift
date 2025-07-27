package com.moneyshift.api.model;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 업종 키워드 모델
 * D3 키워드 그래프 시스템용
 */
public class IndustryKeyword {
    private Long id;
    private String keyword;
    private String category;
    private Integer frequency;
    private BigDecimal confidenceScore;
    private String extractionMethod;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // 기본 생성자
    public IndustryKeyword() {}

    // 생성자
    public IndustryKeyword(String keyword, String category, Integer frequency, BigDecimal confidenceScore) {
        this.keyword = keyword;
        this.category = category;
        this.frequency = frequency;
        this.confidenceScore = confidenceScore;
        this.extractionMethod = "nlp";
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

    public String getKeyword() {
        return keyword;
    }

    public void setKeyword(String keyword) {
        this.keyword = keyword;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public Integer getFrequency() {
        return frequency;
    }

    public void setFrequency(Integer frequency) {
        this.frequency = frequency;
    }

    public BigDecimal getConfidenceScore() {
        return confidenceScore;
    }

    public void setConfidenceScore(BigDecimal confidenceScore) {
        this.confidenceScore = confidenceScore;
    }

    public String getExtractionMethod() {
        return extractionMethod;
    }

    public void setExtractionMethod(String extractionMethod) {
        this.extractionMethod = extractionMethod;
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

    @Override
    public String toString() {
        return "IndustryKeyword{" +
                "id=" + id +
                ", keyword='" + keyword + '\'' +
                ", category='" + category + '\'' +
                ", frequency=" + frequency +
                ", confidenceScore=" + confidenceScore +
                ", extractionMethod='" + extractionMethod + '\'' +
                '}';
    }
}
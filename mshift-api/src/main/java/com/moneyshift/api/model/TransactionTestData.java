package com.moneyshift.api.model;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

/**
 * MoneyShift 거래 테스트 데이터 모델
 * 1000개 실제 한국 거래 패턴을 담는 엔티티
 */
public class TransactionTestData {
    
    @JsonProperty("id")
    private Long id;
    
    @JsonProperty("transaction_text")
    private String transactionText;
    
    @JsonProperty("amount")
    private BigDecimal amount;
    
    @JsonProperty("transaction_date")
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate transactionDate;
    
    @JsonProperty("source_type")
    private String sourceType; // BANK, CARD, CASH, TRANSFER, OTHER
    
    @JsonProperty("expected_category")
    private String expectedCategory;
    
    @JsonProperty("expected_account_code")
    private String expectedAccountCode;
    
    @JsonProperty("expected_description")
    private String expectedDescription;
    
    @JsonProperty("expected_company_name")
    private String expectedCompanyName;
    
    @JsonProperty("expected_keywords")
    private List<String> expectedKeywords;
    
    @JsonProperty("test_category")
    private String testCategory;
    
    @JsonProperty("business_type")
    private String businessType;
    
    @JsonProperty("region")
    private String region;
    
    @JsonProperty("difficulty_level")
    private Integer difficultyLevel; // 1(쉬움) ~ 4(매우어려움)
    
    @JsonProperty("test_tags")
    private List<String> testTags;
    
    @JsonProperty("processing_results")
    private Object processingResults; // JSONB로 저장되는 파이프라인 결과
    
    @JsonProperty("test_passed")
    private Boolean testPassed;
    
    @JsonProperty("test_score")
    private BigDecimal testScore;
    
    @JsonProperty("test_notes")
    private String testNotes;
    
    @JsonProperty("last_tested_at")
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime lastTestedAt;
    
    @JsonProperty("created_at")
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime createdAt;
    
    @JsonProperty("updated_at")
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime updatedAt;
    
    // 기본 생성자
    public TransactionTestData() {}
    
    // 전체 생성자
    public TransactionTestData(Long id, String transactionText, BigDecimal amount, 
                              LocalDate transactionDate, String sourceType, String expectedCategory,
                              String expectedAccountCode, String expectedDescription, 
                              String expectedCompanyName, List<String> expectedKeywords,
                              String testCategory, String businessType, String region,
                              Integer difficultyLevel, List<String> testTags) {
        this.id = id;
        this.transactionText = transactionText;
        this.amount = amount;
        this.transactionDate = transactionDate;
        this.sourceType = sourceType;
        this.expectedCategory = expectedCategory;
        this.expectedAccountCode = expectedAccountCode;
        this.expectedDescription = expectedDescription;
        this.expectedCompanyName = expectedCompanyName;
        this.expectedKeywords = expectedKeywords;
        this.testCategory = testCategory;
        this.businessType = businessType;
        this.region = region;
        this.difficultyLevel = difficultyLevel;
        this.testTags = testTags;
    }
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getTransactionText() { return transactionText; }
    public void setTransactionText(String transactionText) { this.transactionText = transactionText; }
    
    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }
    
    public LocalDate getTransactionDate() { return transactionDate; }
    public void setTransactionDate(LocalDate transactionDate) { this.transactionDate = transactionDate; }
    
    public String getSourceType() { return sourceType; }
    public void setSourceType(String sourceType) { this.sourceType = sourceType; }
    
    public String getExpectedCategory() { return expectedCategory; }
    public void setExpectedCategory(String expectedCategory) { this.expectedCategory = expectedCategory; }
    
    public String getExpectedAccountCode() { return expectedAccountCode; }
    public void setExpectedAccountCode(String expectedAccountCode) { this.expectedAccountCode = expectedAccountCode; }
    
    public String getExpectedDescription() { return expectedDescription; }
    public void setExpectedDescription(String expectedDescription) { this.expectedDescription = expectedDescription; }
    
    public String getExpectedCompanyName() { return expectedCompanyName; }
    public void setExpectedCompanyName(String expectedCompanyName) { this.expectedCompanyName = expectedCompanyName; }
    
    public List<String> getExpectedKeywords() { return expectedKeywords; }
    public void setExpectedKeywords(List<String> expectedKeywords) { this.expectedKeywords = expectedKeywords; }
    
    public String getTestCategory() { return testCategory; }
    public void setTestCategory(String testCategory) { this.testCategory = testCategory; }
    
    public String getBusinessType() { return businessType; }
    public void setBusinessType(String businessType) { this.businessType = businessType; }
    
    public String getRegion() { return region; }
    public void setRegion(String region) { this.region = region; }
    
    public Integer getDifficultyLevel() { return difficultyLevel; }
    public void setDifficultyLevel(Integer difficultyLevel) { this.difficultyLevel = difficultyLevel; }
    
    public List<String> getTestTags() { return testTags; }
    public void setTestTags(List<String> testTags) { this.testTags = testTags; }
    
    public Object getProcessingResults() { return processingResults; }
    public void setProcessingResults(Object processingResults) { this.processingResults = processingResults; }
    
    public Boolean getTestPassed() { return testPassed; }
    public void setTestPassed(Boolean testPassed) { this.testPassed = testPassed; }
    
    public BigDecimal getTestScore() { return testScore; }
    public void setTestScore(BigDecimal testScore) { this.testScore = testScore; }
    
    public String getTestNotes() { return testNotes; }
    public void setTestNotes(String testNotes) { this.testNotes = testNotes; }
    
    public LocalDateTime getLastTestedAt() { return lastTestedAt; }
    public void setLastTestedAt(LocalDateTime lastTestedAt) { this.lastTestedAt = lastTestedAt; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
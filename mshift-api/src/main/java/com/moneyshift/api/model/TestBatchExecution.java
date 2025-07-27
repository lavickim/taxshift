package com.moneyshift.api.model;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/**
 * MoneyShift 테스트 배치 실행 결과 모델
 * 파이프라인 테스트 실행 이력과 결과를 추적
 */
public class TestBatchExecution {
    
    @JsonProperty("id")
    private Long id;
    
    @JsonProperty("batch_name")
    private String batchName;
    
    @JsonProperty("test_data_count")
    private Integer testDataCount;
    
    @JsonProperty("execution_status")
    private String executionStatus; // RUNNING, COMPLETED, FAILED, CANCELLED
    
    @JsonProperty("start_time")
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime startTime;
    
    @JsonProperty("end_time")
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime endTime;
    
    @JsonProperty("total_processing_time_ms")
    private Long totalProcessingTimeMs;
    
    @JsonProperty("passed_count")
    private Integer passedCount;
    
    @JsonProperty("failed_count")
    private Integer failedCount;
    
    @JsonProperty("success_rate")
    private BigDecimal successRate;
    
    @JsonProperty("average_score")
    private BigDecimal averageScore;
    
    @JsonProperty("layer_0_hits")
    private Integer layer0Hits; // Redis 캐시 히트
    
    @JsonProperty("layer_1_hits")
    private Integer layer1Hits; // Regex 패턴 매칭
    
    @JsonProperty("layer_2_hits")
    private Integer layer2Hits; // ML 추론
    
    @JsonProperty("layer_3_hits")
    private Integer layer3Hits; // LLM 처리
    
    @JsonProperty("layer_performance")
    private Object layerPerformance; // JSONB로 저장되는 레이어별 성능 데이터
    
    @JsonProperty("error_patterns")
    private Object errorPatterns; // JSONB로 저장되는 오류 패턴 분석
    
    @JsonProperty("improvement_suggestions")
    private List<String> improvementSuggestions;
    
    @JsonProperty("execution_notes")
    private String executionNotes;
    
    @JsonProperty("created_by")
    private String createdBy;
    
    @JsonProperty("created_at")
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime createdAt;
    
    // 기본 생성자
    public TestBatchExecution() {}
    
    // 주요 생성자
    public TestBatchExecution(String batchName, Integer testDataCount, String executionStatus) {
        this.batchName = batchName;
        this.testDataCount = testDataCount;
        this.executionStatus = executionStatus;
        this.startTime = LocalDateTime.now();
    }
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getBatchName() { return batchName; }
    public void setBatchName(String batchName) { this.batchName = batchName; }
    
    public Integer getTestDataCount() { return testDataCount; }
    public void setTestDataCount(Integer testDataCount) { this.testDataCount = testDataCount; }
    
    public String getExecutionStatus() { return executionStatus; }
    public void setExecutionStatus(String executionStatus) { this.executionStatus = executionStatus; }
    
    public LocalDateTime getStartTime() { return startTime; }
    public void setStartTime(LocalDateTime startTime) { this.startTime = startTime; }
    
    public LocalDateTime getEndTime() { return endTime; }
    public void setEndTime(LocalDateTime endTime) { this.endTime = endTime; }
    
    public Long getTotalProcessingTimeMs() { return totalProcessingTimeMs; }
    public void setTotalProcessingTimeMs(Long totalProcessingTimeMs) { this.totalProcessingTimeMs = totalProcessingTimeMs; }
    
    public Integer getPassedCount() { return passedCount; }
    public void setPassedCount(Integer passedCount) { this.passedCount = passedCount; }
    
    public Integer getFailedCount() { return failedCount; }
    public void setFailedCount(Integer failedCount) { this.failedCount = failedCount; }
    
    public BigDecimal getSuccessRate() { return successRate; }
    public void setSuccessRate(BigDecimal successRate) { this.successRate = successRate; }
    
    public BigDecimal getAverageScore() { return averageScore; }
    public void setAverageScore(BigDecimal averageScore) { this.averageScore = averageScore; }
    
    public Integer getLayer0Hits() { return layer0Hits; }
    public void setLayer0Hits(Integer layer0Hits) { this.layer0Hits = layer0Hits; }
    
    public Integer getLayer1Hits() { return layer1Hits; }
    public void setLayer1Hits(Integer layer1Hits) { this.layer1Hits = layer1Hits; }
    
    public Integer getLayer2Hits() { return layer2Hits; }
    public void setLayer2Hits(Integer layer2Hits) { this.layer2Hits = layer2Hits; }
    
    public Integer getLayer3Hits() { return layer3Hits; }
    public void setLayer3Hits(Integer layer3Hits) { this.layer3Hits = layer3Hits; }
    
    public Object getLayerPerformance() { return layerPerformance; }
    public void setLayerPerformance(Object layerPerformance) { this.layerPerformance = layerPerformance; }
    
    public Object getErrorPatterns() { return errorPatterns; }
    public void setErrorPatterns(Object errorPatterns) { this.errorPatterns = errorPatterns; }
    
    public List<String> getImprovementSuggestions() { return improvementSuggestions; }
    public void setImprovementSuggestions(List<String> improvementSuggestions) { this.improvementSuggestions = improvementSuggestions; }
    
    public String getExecutionNotes() { return executionNotes; }
    public void setExecutionNotes(String executionNotes) { this.executionNotes = executionNotes; }
    
    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
package com.moneyshift.api.controller;

import com.moneyshift.api.service.IntegratedTestService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 통합 테스트 API 컨트롤러
 * 키워드 기반 거래 태깅 시스템의 End-to-End 테스트 기능 제공
 */
@Slf4j
@RestController
@RequestMapping("/v2/test")
@RequiredArgsConstructor
public class IntegratedTestController {

    private final IntegratedTestService integratedTestService;

    /**
     * 거래 문자열 파싱 테스트
     */
    @PostMapping("/parse-transaction")
    public ResponseEntity<TransactionParseResult> parseTransaction(@RequestBody TransactionParseRequest request) {
        log.info("거래 문자열 파싱 테스트: text={}", request.getTransactionText());
        
        try {
            TransactionParseResult result = integratedTestService.parseTransaction(request);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            log.error("거래 문자열 파싱 테스트 실패", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * End-to-End 테스트 실행
     */
    @PostMapping("/end-to-end")
    public ResponseEntity<EndToEndTestResult> runEndToEndTest(@RequestBody EndToEndTestRequest request) {
        log.info("End-to-End 테스트 실행: scenario={}", request.getScenario());
        
        try {
            EndToEndTestResult result = integratedTestService.runEndToEndTest(request);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            log.error("End-to-End 테스트 실행 실패", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * 테스트 시나리오 목록 조회
     */
    @GetMapping("/scenarios")
    public ResponseEntity<List<TestScenario>> getTestScenarios() {
        log.info("테스트 시나리오 목록 조회");
        
        try {
            List<TestScenario> scenarios = integratedTestService.getTestScenarios();
            return ResponseEntity.ok(scenarios);
        } catch (Exception e) {
            log.error("테스트 시나리오 목록 조회 실패", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * 일괄 테스트 실행
     */
    @PostMapping("/batch")
    public ResponseEntity<BatchTestResult> runBatchTest(@RequestBody BatchTestRequest request) {
        log.info("일괄 테스트 실행: testType={}, count={}", request.getTestType(), request.getTestCases().size());
        
        try {
            BatchTestResult result = integratedTestService.runBatchTest(request);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            log.error("일괄 테스트 실행 실패", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * 성능 테스트 실행
     */
    @PostMapping("/performance")
    public ResponseEntity<PerformanceTestResult> runPerformanceTest(@RequestBody PerformanceTestRequest request) {
        log.info("성능 테스트 실행: duration={}, concurrency={}", request.getDurationSeconds(), request.getConcurrencyLevel());
        
        try {
            PerformanceTestResult result = integratedTestService.runPerformanceTest(request);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            log.error("성능 테스트 실행 실패", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * 정확도 테스트 실행
     */
    @PostMapping("/accuracy")
    public ResponseEntity<AccuracyTestResult> runAccuracyTest(@RequestBody AccuracyTestRequest request) {
        log.info("정확도 테스트 실행: testSet={}", request.getTestSetName());
        
        try {
            AccuracyTestResult result = integratedTestService.runAccuracyTest(request);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            log.error("정확도 테스트 실행 실패", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * 회귀 테스트 실행
     */
    @PostMapping("/regression")
    public ResponseEntity<RegressionTestResult> runRegressionTest(@RequestBody RegressionTestRequest request) {
        log.info("회귀 테스트 실행: baselineVersion={}, currentVersion={}", 
                request.getBaselineVersion(), request.getCurrentVersion());
        
        try {
            RegressionTestResult result = integratedTestService.runRegressionTest(request);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            log.error("회귀 테스트 실행 실패", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * 테스트 리포트 생성
     */
    @PostMapping("/report")
    public ResponseEntity<TestReport> generateTestReport(@RequestBody TestReportRequest request) {
        log.info("테스트 리포트 생성: reportType={}, startDate={}, endDate={}", 
                request.getReportType(), request.getStartDate(), request.getEndDate());
        
        try {
            TestReport report = integratedTestService.generateTestReport(request);
            return ResponseEntity.ok(report);
        } catch (Exception e) {
            log.error("테스트 리포트 생성 실패", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * 테스트 결과 내보내기
     */
    @PostMapping("/export")
    public ResponseEntity<String> exportTestResults(@RequestBody TestExportRequest request) {
        log.info("테스트 결과 내보내기: format={}, testIds={}", request.getFormat(), request.getTestIds());
        
        try {
            String exportResult = integratedTestService.exportTestResults(request);
            return ResponseEntity.ok(exportResult);
        } catch (Exception e) {
            log.error("테스트 결과 내보내기 실패", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    // ========== 내부 클래스들 ==========

    /**
     * 거래 문자열 파싱 요청
     */
    public static class TransactionParseRequest {
        private String transactionText;
        private Long amount;
        private String transactionTime;
        private String expectedTag;
        private String expectedAccount;

        // getters and setters
        public String getTransactionText() { return transactionText; }
        public void setTransactionText(String transactionText) { this.transactionText = transactionText; }
        public Long getAmount() { return amount; }
        public void setAmount(Long amount) { this.amount = amount; }
        public String getTransactionTime() { return transactionTime; }
        public void setTransactionTime(String transactionTime) { this.transactionTime = transactionTime; }
        public String getExpectedTag() { return expectedTag; }
        public void setExpectedTag(String expectedTag) { this.expectedTag = expectedTag; }
        public String getExpectedAccount() { return expectedAccount; }
        public void setExpectedAccount(String expectedAccount) { this.expectedAccount = expectedAccount; }
    }

    /**
     * 거래 문자열 파싱 결과
     */
    public static class TransactionParseResult {
        private String transactionText;
        private List<String> extractedKeywords;
        private List<String> suggestedTags;
        private String selectedTag;
        private String selectedAccount;
        private Double confidence;
        private String processingPath;
        private boolean userQuestionTriggered;
        private String userQuestionText;
        private List<String> userQuestionOptions;
        private long processingTimeMs;
        private boolean success;
        private String errorMessage;

        // getters and setters
        public String getTransactionText() { return transactionText; }
        public void setTransactionText(String transactionText) { this.transactionText = transactionText; }
        public List<String> getExtractedKeywords() { return extractedKeywords; }
        public void setExtractedKeywords(List<String> extractedKeywords) { this.extractedKeywords = extractedKeywords; }
        public List<String> getSuggestedTags() { return suggestedTags; }
        public void setSuggestedTags(List<String> suggestedTags) { this.suggestedTags = suggestedTags; }
        public String getSelectedTag() { return selectedTag; }
        public void setSelectedTag(String selectedTag) { this.selectedTag = selectedTag; }
        public String getSelectedAccount() { return selectedAccount; }
        public void setSelectedAccount(String selectedAccount) { this.selectedAccount = selectedAccount; }
        public Double getConfidence() { return confidence; }
        public void setConfidence(Double confidence) { this.confidence = confidence; }
        public String getProcessingPath() { return processingPath; }
        public void setProcessingPath(String processingPath) { this.processingPath = processingPath; }
        public boolean isUserQuestionTriggered() { return userQuestionTriggered; }
        public void setUserQuestionTriggered(boolean userQuestionTriggered) { this.userQuestionTriggered = userQuestionTriggered; }
        public String getUserQuestionText() { return userQuestionText; }
        public void setUserQuestionText(String userQuestionText) { this.userQuestionText = userQuestionText; }
        public List<String> getUserQuestionOptions() { return userQuestionOptions; }
        public void setUserQuestionOptions(List<String> userQuestionOptions) { this.userQuestionOptions = userQuestionOptions; }
        public long getProcessingTimeMs() { return processingTimeMs; }
        public void setProcessingTimeMs(long processingTimeMs) { this.processingTimeMs = processingTimeMs; }
        public boolean isSuccess() { return success; }
        public void setSuccess(boolean success) { this.success = success; }
        public String getErrorMessage() { return errorMessage; }
        public void setErrorMessage(String errorMessage) { this.errorMessage = errorMessage; }
    }

    /**
     * End-to-End 테스트 요청
     */
    public static class EndToEndTestRequest {
        private String scenario;
        private String transactionText;
        private Long amount;
        private String transactionTime;
        private String expectedTag;
        private String expectedAccount;
        private boolean includeUserQuestion;

        // getters and setters
        public String getScenario() { return scenario; }
        public void setScenario(String scenario) { this.scenario = scenario; }
        public String getTransactionText() { return transactionText; }
        public void setTransactionText(String transactionText) { this.transactionText = transactionText; }
        public Long getAmount() { return amount; }
        public void setAmount(Long amount) { this.amount = amount; }
        public String getTransactionTime() { return transactionTime; }
        public void setTransactionTime(String transactionTime) { this.transactionTime = transactionTime; }
        public String getExpectedTag() { return expectedTag; }
        public void setExpectedTag(String expectedTag) { this.expectedTag = expectedTag; }
        public String getExpectedAccount() { return expectedAccount; }
        public void setExpectedAccount(String expectedAccount) { this.expectedAccount = expectedAccount; }
        public boolean isIncludeUserQuestion() { return includeUserQuestion; }
        public void setIncludeUserQuestion(boolean includeUserQuestion) { this.includeUserQuestion = includeUserQuestion; }
    }

    /**
     * End-to-End 테스트 결과
     */
    public static class EndToEndTestResult {
        private String scenario;
        private boolean passed;
        private List<TestStep> steps;
        private String finalTag;
        private String finalAccount;
        private String expectedTag;
        private String expectedAccount;
        private Double overallConfidence;
        private long totalProcessingTime;
        private String failureReason;

        // getters and setters
        public String getScenario() { return scenario; }
        public void setScenario(String scenario) { this.scenario = scenario; }
        public boolean isPassed() { return passed; }
        public void setPassed(boolean passed) { this.passed = passed; }
        public List<TestStep> getSteps() { return steps; }
        public void setSteps(List<TestStep> steps) { this.steps = steps; }
        public String getFinalTag() { return finalTag; }
        public void setFinalTag(String finalTag) { this.finalTag = finalTag; }
        public String getFinalAccount() { return finalAccount; }
        public void setFinalAccount(String finalAccount) { this.finalAccount = finalAccount; }
        public String getExpectedTag() { return expectedTag; }
        public void setExpectedTag(String expectedTag) { this.expectedTag = expectedTag; }
        public String getExpectedAccount() { return expectedAccount; }
        public void setExpectedAccount(String expectedAccount) { this.expectedAccount = expectedAccount; }
        public Double getOverallConfidence() { return overallConfidence; }
        public void setOverallConfidence(Double overallConfidence) { this.overallConfidence = overallConfidence; }
        public long getTotalProcessingTime() { return totalProcessingTime; }
        public void setTotalProcessingTime(long totalProcessingTime) { this.totalProcessingTime = totalProcessingTime; }
        public String getFailureReason() { return failureReason; }
        public void setFailureReason(String failureReason) { this.failureReason = failureReason; }

        public static class TestStep {
            private String stepName;
            private boolean passed;
            private String result;
            private long processingTime;
            private String error;

            // getters and setters
            public String getStepName() { return stepName; }
            public void setStepName(String stepName) { this.stepName = stepName; }
            public boolean isPassed() { return passed; }
            public void setPassed(boolean passed) { this.passed = passed; }
            public String getResult() { return result; }
            public void setResult(String result) { this.result = result; }
            public long getProcessingTime() { return processingTime; }
            public void setProcessingTime(long processingTime) { this.processingTime = processingTime; }
            public String getError() { return error; }
            public void setError(String error) { this.error = error; }
        }
    }

    /**
     * 테스트 시나리오
     */
    public static class TestScenario {
        private String id;
        private String name;
        private String description;
        private String category;
        private String transactionText;
        private String expectedTag;
        private String expectedAccount;
        private boolean isActive;

        // getters and setters
        public String getId() { return id; }
        public void setId(String id) { this.id = id; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public String getCategory() { return category; }
        public void setCategory(String category) { this.category = category; }
        public String getTransactionText() { return transactionText; }
        public void setTransactionText(String transactionText) { this.transactionText = transactionText; }
        public String getExpectedTag() { return expectedTag; }
        public void setExpectedTag(String expectedTag) { this.expectedTag = expectedTag; }
        public String getExpectedAccount() { return expectedAccount; }
        public void setExpectedAccount(String expectedAccount) { this.expectedAccount = expectedAccount; }
        public boolean isActive() { return isActive; }
        public void setActive(boolean active) { isActive = active; }
    }

    /**
     * 일괄 테스트 요청
     */
    public static class BatchTestRequest {
        private String testType;
        private List<TestCase> testCases;
        private boolean stopOnFirstFailure;
        private int maxConcurrency;

        // getters and setters
        public String getTestType() { return testType; }
        public void setTestType(String testType) { this.testType = testType; }
        public List<TestCase> getTestCases() { return testCases; }
        public void setTestCases(List<TestCase> testCases) { this.testCases = testCases; }
        public boolean isStopOnFirstFailure() { return stopOnFirstFailure; }
        public void setStopOnFirstFailure(boolean stopOnFirstFailure) { this.stopOnFirstFailure = stopOnFirstFailure; }
        public int getMaxConcurrency() { return maxConcurrency; }
        public void setMaxConcurrency(int maxConcurrency) { this.maxConcurrency = maxConcurrency; }

        public static class TestCase {
            private String id;
            private String transactionText;
            private String expectedTag;
            private String expectedAccount;

            // getters and setters
            public String getId() { return id; }
            public void setId(String id) { this.id = id; }
            public String getTransactionText() { return transactionText; }
            public void setTransactionText(String transactionText) { this.transactionText = transactionText; }
            public String getExpectedTag() { return expectedTag; }
            public void setExpectedTag(String expectedTag) { this.expectedTag = expectedTag; }
            public String getExpectedAccount() { return expectedAccount; }
            public void setExpectedAccount(String expectedAccount) { this.expectedAccount = expectedAccount; }
        }
    }

    /**
     * 일괄 테스트 결과
     */
    public static class BatchTestResult {
        private String testType;
        private int totalTests;
        private int passedTests;
        private int failedTests;
        private int skippedTests;
        private double successRate;
        private long totalExecutionTime;
        private List<BatchTestItem> results;

        // getters and setters
        public String getTestType() { return testType; }
        public void setTestType(String testType) { this.testType = testType; }
        public int getTotalTests() { return totalTests; }
        public void setTotalTests(int totalTests) { this.totalTests = totalTests; }
        public int getPassedTests() { return passedTests; }
        public void setPassedTests(int passedTests) { this.passedTests = passedTests; }
        public int getFailedTests() { return failedTests; }
        public void setFailedTests(int failedTests) { this.failedTests = failedTests; }
        public int getSkippedTests() { return skippedTests; }
        public void setSkippedTests(int skippedTests) { this.skippedTests = skippedTests; }
        public double getSuccessRate() { return successRate; }
        public void setSuccessRate(double successRate) { this.successRate = successRate; }
        public long getTotalExecutionTime() { return totalExecutionTime; }
        public void setTotalExecutionTime(long totalExecutionTime) { this.totalExecutionTime = totalExecutionTime; }
        public List<BatchTestItem> getResults() { return results; }
        public void setResults(List<BatchTestItem> results) { this.results = results; }

        public static class BatchTestItem {
            private String testId;
            private boolean passed;
            private String actualTag;
            private String actualAccount;
            private String expectedTag;
            private String expectedAccount;
            private long executionTime;
            private String error;

            // getters and setters
            public String getTestId() { return testId; }
            public void setTestId(String testId) { this.testId = testId; }
            public boolean isPassed() { return passed; }
            public void setPassed(boolean passed) { this.passed = passed; }
            public String getActualTag() { return actualTag; }
            public void setActualTag(String actualTag) { this.actualTag = actualTag; }
            public String getActualAccount() { return actualAccount; }
            public void setActualAccount(String actualAccount) { this.actualAccount = actualAccount; }
            public String getExpectedTag() { return expectedTag; }
            public void setExpectedTag(String expectedTag) { this.expectedTag = expectedTag; }
            public String getExpectedAccount() { return expectedAccount; }
            public void setExpectedAccount(String expectedAccount) { this.expectedAccount = expectedAccount; }
            public long getExecutionTime() { return executionTime; }
            public void setExecutionTime(long executionTime) { this.executionTime = executionTime; }
            public String getError() { return error; }
            public void setError(String error) { this.error = error; }
        }
    }

    /**
     * 성능 테스트 요청
     */
    public static class PerformanceTestRequest {
        private int durationSeconds;
        private int concurrencyLevel;
        private String testDataSet;
        private boolean warmUp;

        // getters and setters
        public int getDurationSeconds() { return durationSeconds; }
        public void setDurationSeconds(int durationSeconds) { this.durationSeconds = durationSeconds; }
        public int getConcurrencyLevel() { return concurrencyLevel; }
        public void setConcurrencyLevel(int concurrencyLevel) { this.concurrencyLevel = concurrencyLevel; }
        public String getTestDataSet() { return testDataSet; }
        public void setTestDataSet(String testDataSet) { this.testDataSet = testDataSet; }
        public boolean isWarmUp() { return warmUp; }
        public void setWarmUp(boolean warmUp) { this.warmUp = warmUp; }
    }

    /**
     * 성능 테스트 결과
     */
    public static class PerformanceTestResult {
        private int totalRequests;
        private int successfulRequests;
        private int failedRequests;
        private double requestsPerSecond;
        private double averageResponseTime;
        private double p95ResponseTime;
        private double p99ResponseTime;
        private double errorRate;
        private long totalExecutionTime;

        // getters and setters
        public int getTotalRequests() { return totalRequests; }
        public void setTotalRequests(int totalRequests) { this.totalRequests = totalRequests; }
        public int getSuccessfulRequests() { return successfulRequests; }
        public void setSuccessfulRequests(int successfulRequests) { this.successfulRequests = successfulRequests; }
        public int getFailedRequests() { return failedRequests; }
        public void setFailedRequests(int failedRequests) { this.failedRequests = failedRequests; }
        public double getRequestsPerSecond() { return requestsPerSecond; }
        public void setRequestsPerSecond(double requestsPerSecond) { this.requestsPerSecond = requestsPerSecond; }
        public double getAverageResponseTime() { return averageResponseTime; }
        public void setAverageResponseTime(double averageResponseTime) { this.averageResponseTime = averageResponseTime; }
        public double getP95ResponseTime() { return p95ResponseTime; }
        public void setP95ResponseTime(double p95ResponseTime) { this.p95ResponseTime = p95ResponseTime; }
        public double getP99ResponseTime() { return p99ResponseTime; }
        public void setP99ResponseTime(double p99ResponseTime) { this.p99ResponseTime = p99ResponseTime; }
        public double getErrorRate() { return errorRate; }
        public void setErrorRate(double errorRate) { this.errorRate = errorRate; }
        public long getTotalExecutionTime() { return totalExecutionTime; }
        public void setTotalExecutionTime(long totalExecutionTime) { this.totalExecutionTime = totalExecutionTime; }
    }

    /**
     * 정확도 테스트 요청
     */
    public static class AccuracyTestRequest {
        private String testSetName;
        private String category;
        private int sampleSize;
        private boolean includeConfidenceAnalysis;

        // getters and setters
        public String getTestSetName() { return testSetName; }
        public void setTestSetName(String testSetName) { this.testSetName = testSetName; }
        public String getCategory() { return category; }
        public void setCategory(String category) { this.category = category; }
        public int getSampleSize() { return sampleSize; }
        public void setSampleSize(int sampleSize) { this.sampleSize = sampleSize; }
        public boolean isIncludeConfidenceAnalysis() { return includeConfidenceAnalysis; }
        public void setIncludeConfidenceAnalysis(boolean includeConfidenceAnalysis) { this.includeConfidenceAnalysis = includeConfidenceAnalysis; }
    }

    /**
     * 정확도 테스트 결과
     */
    public static class AccuracyTestResult {
        private String testSetName;
        private int totalTests;
        private int correctPredictions;
        private double accuracy;
        private double precision;
        private double recall;
        private double f1Score;
        private ConfusionMatrix confusionMatrix;

        // getters and setters
        public String getTestSetName() { return testSetName; }
        public void setTestSetName(String testSetName) { this.testSetName = testSetName; }
        public int getTotalTests() { return totalTests; }
        public void setTotalTests(int totalTests) { this.totalTests = totalTests; }
        public int getCorrectPredictions() { return correctPredictions; }
        public void setCorrectPredictions(int correctPredictions) { this.correctPredictions = correctPredictions; }
        public double getAccuracy() { return accuracy; }
        public void setAccuracy(double accuracy) { this.accuracy = accuracy; }
        public double getPrecision() { return precision; }
        public void setPrecision(double precision) { this.precision = precision; }
        public double getRecall() { return recall; }
        public void setRecall(double recall) { this.recall = recall; }
        public double getF1Score() { return f1Score; }
        public void setF1Score(double f1Score) { this.f1Score = f1Score; }
        public ConfusionMatrix getConfusionMatrix() { return confusionMatrix; }
        public void setConfusionMatrix(ConfusionMatrix confusionMatrix) { this.confusionMatrix = confusionMatrix; }

        public static class ConfusionMatrix {
            private int truePositives;
            private int falsePositives;
            private int trueNegatives;
            private int falseNegatives;

            // getters and setters
            public int getTruePositives() { return truePositives; }
            public void setTruePositives(int truePositives) { this.truePositives = truePositives; }
            public int getFalsePositives() { return falsePositives; }
            public void setFalsePositives(int falsePositives) { this.falsePositives = falsePositives; }
            public int getTrueNegatives() { return trueNegatives; }
            public void setTrueNegatives(int trueNegatives) { this.trueNegatives = trueNegatives; }
            public int getFalseNegatives() { return falseNegatives; }
            public void setFalseNegatives(int falseNegatives) { this.falseNegatives = falseNegatives; }
        }
    }

    /**
     * 회귀 테스트 요청
     */
    public static class RegressionTestRequest {
        private String baselineVersion;
        private String currentVersion;
        private String testSuite;
        private double acceptableRegressionThreshold;

        // getters and setters
        public String getBaselineVersion() { return baselineVersion; }
        public void setBaselineVersion(String baselineVersion) { this.baselineVersion = baselineVersion; }
        public String getCurrentVersion() { return currentVersion; }
        public void setCurrentVersion(String currentVersion) { this.currentVersion = currentVersion; }
        public String getTestSuite() { return testSuite; }
        public void setTestSuite(String testSuite) { this.testSuite = testSuite; }
        public double getAcceptableRegressionThreshold() { return acceptableRegressionThreshold; }
        public void setAcceptableRegressionThreshold(double acceptableRegressionThreshold) { this.acceptableRegressionThreshold = acceptableRegressionThreshold; }
    }

    /**
     * 회귀 테스트 결과
     */
    public static class RegressionTestResult {
        private String baselineVersion;
        private String currentVersion;
        private double baselineAccuracy;
        private double currentAccuracy;
        private double regressionPercentage;
        private boolean hasRegression;
        private List<RegressionItem> regressionItems;

        // getters and setters
        public String getBaselineVersion() { return baselineVersion; }
        public void setBaselineVersion(String baselineVersion) { this.baselineVersion = baselineVersion; }
        public String getCurrentVersion() { return currentVersion; }
        public void setCurrentVersion(String currentVersion) { this.currentVersion = currentVersion; }
        public double getBaselineAccuracy() { return baselineAccuracy; }
        public void setBaselineAccuracy(double baselineAccuracy) { this.baselineAccuracy = baselineAccuracy; }
        public double getCurrentAccuracy() { return currentAccuracy; }
        public void setCurrentAccuracy(double currentAccuracy) { this.currentAccuracy = currentAccuracy; }
        public double getRegressionPercentage() { return regressionPercentage; }
        public void setRegressionPercentage(double regressionPercentage) { this.regressionPercentage = regressionPercentage; }
        public boolean isHasRegression() { return hasRegression; }
        public void setHasRegression(boolean hasRegression) { this.hasRegression = hasRegression; }
        public List<RegressionItem> getRegressionItems() { return regressionItems; }
        public void setRegressionItems(List<RegressionItem> regressionItems) { this.regressionItems = regressionItems; }

        public static class RegressionItem {
            private String testCase;
            private String baselineResult;
            private String currentResult;
            private boolean regressed;

            // getters and setters
            public String getTestCase() { return testCase; }
            public void setTestCase(String testCase) { this.testCase = testCase; }
            public String getBaselineResult() { return baselineResult; }
            public void setBaselineResult(String baselineResult) { this.baselineResult = baselineResult; }
            public String getCurrentResult() { return currentResult; }
            public void setCurrentResult(String currentResult) { this.currentResult = currentResult; }
            public boolean isRegressed() { return regressed; }
            public void setRegressed(boolean regressed) { this.regressed = regressed; }
        }
    }

    /**
     * 테스트 리포트 요청
     */
    public static class TestReportRequest {
        private String reportType;
        private String startDate;
        private String endDate;
        private String category;
        private boolean includeDetails;

        // getters and setters
        public String getReportType() { return reportType; }
        public void setReportType(String reportType) { this.reportType = reportType; }
        public String getStartDate() { return startDate; }
        public void setStartDate(String startDate) { this.startDate = startDate; }
        public String getEndDate() { return endDate; }
        public void setEndDate(String endDate) { this.endDate = endDate; }
        public String getCategory() { return category; }
        public void setCategory(String category) { this.category = category; }
        public boolean isIncludeDetails() { return includeDetails; }
        public void setIncludeDetails(boolean includeDetails) { this.includeDetails = includeDetails; }
    }

    /**
     * 테스트 리포트
     */
    public static class TestReport {
        private String reportType;
        private String generatedAt;
        private String period;
        private TestSummary summary;
        private List<TestCategory> categories;

        // getters and setters
        public String getReportType() { return reportType; }
        public void setReportType(String reportType) { this.reportType = reportType; }
        public String getGeneratedAt() { return generatedAt; }
        public void setGeneratedAt(String generatedAt) { this.generatedAt = generatedAt; }
        public String getPeriod() { return period; }
        public void setPeriod(String period) { this.period = period; }
        public TestSummary getSummary() { return summary; }
        public void setSummary(TestSummary summary) { this.summary = summary; }
        public List<TestCategory> getCategories() { return categories; }
        public void setCategories(List<TestCategory> categories) { this.categories = categories; }

        public static class TestSummary {
            private int totalTests;
            private int passedTests;
            private int failedTests;
            private double successRate;
            private double averageResponseTime;

            // getters and setters
            public int getTotalTests() { return totalTests; }
            public void setTotalTests(int totalTests) { this.totalTests = totalTests; }
            public int getPassedTests() { return passedTests; }
            public void setPassedTests(int passedTests) { this.passedTests = passedTests; }
            public int getFailedTests() { return failedTests; }
            public void setFailedTests(int failedTests) { this.failedTests = failedTests; }
            public double getSuccessRate() { return successRate; }
            public void setSuccessRate(double successRate) { this.successRate = successRate; }
            public double getAverageResponseTime() { return averageResponseTime; }
            public void setAverageResponseTime(double averageResponseTime) { this.averageResponseTime = averageResponseTime; }
        }

        public static class TestCategory {
            private String name;
            private int testCount;
            private double successRate;

            // getters and setters
            public String getName() { return name; }
            public void setName(String name) { this.name = name; }
            public int getTestCount() { return testCount; }
            public void setTestCount(int testCount) { this.testCount = testCount; }
            public double getSuccessRate() { return successRate; }
            public void setSuccessRate(double successRate) { this.successRate = successRate; }
        }
    }

    /**
     * 테스트 결과 내보내기 요청
     */
    public static class TestExportRequest {
        private String format; // "JSON", "CSV", "XML", "EXCEL"
        private List<String> testIds;
        private String dateRange;
        private boolean includeDetails;

        // getters and setters
        public String getFormat() { return format; }
        public void setFormat(String format) { this.format = format; }
        public List<String> getTestIds() { return testIds; }
        public void setTestIds(List<String> testIds) { this.testIds = testIds; }
        public String getDateRange() { return dateRange; }
        public void setDateRange(String dateRange) { this.dateRange = dateRange; }
        public boolean isIncludeDetails() { return includeDetails; }
        public void setIncludeDetails(boolean includeDetails) { this.includeDetails = includeDetails; }
    }
}
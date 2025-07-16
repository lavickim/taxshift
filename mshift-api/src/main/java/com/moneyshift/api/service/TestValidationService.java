package com.moneyshift.api.service;

import com.moneyshift.api.model.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

/**
 * 테스트 및 검증 도구 서비스
 * 
 * 기능:
 * 1. 룰 정확성 테스트
 * 2. 성능 벤치마크
 * 3. A/B 테스트
 * 4. 회귀 테스트
 * 5. 실시간 모니터링
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class TestValidationService {

    private final KeywordExtractionEngine keywordExtractionEngine;
    private final TagMappingService tagMappingService;
    private final LLMIntegrationService llmIntegrationService;
    private final RedisCacheService redisCacheService;
    private final ExecutorService executorService = Executors.newFixedThreadPool(10);

    /**
     * 포괄적인 시스템 테스트 실행
     */
    public CompletableFuture<SystemTestResult> runComprehensiveTest(TestConfiguration config) {
        log.info("포괄적인 시스템 테스트 시작: {}", config.getTestName());

        return CompletableFuture.supplyAsync(() -> {
            try {
                SystemTestResult result = SystemTestResult.builder()
                        .testName(config.getTestName())
                        .startTime(LocalDateTime.now())
                        .configuration(config)
                        .testResults(new ArrayList<>())
                        .build();

                // 1. 정확성 테스트
                if (config.isAccuracyTestEnabled()) {
                    AccuracyTestResult accuracyResult = runAccuracyTest(config.getTestCases());
                    result.getTestResults().add(accuracyResult);
                }

                // 2. 성능 테스트
                if (config.isPerformanceTestEnabled()) {
                    PerformanceTestResult performanceResult = runPerformanceTest(config.getPerformanceConfig());
                    result.getTestResults().add(performanceResult);
                }

                // 3. 부하 테스트
                if (config.isLoadTestEnabled()) {
                    LoadTestResult loadResult = runLoadTest(config.getLoadConfig());
                    result.getTestResults().add(loadResult);
                }

                // 4. 회귀 테스트
                if (config.isRegressionTestEnabled()) {
                    RegressionTestResult regressionResult = runRegressionTest(config.getRegressionConfig());
                    result.getTestResults().add(regressionResult);
                }

                result.setEndTime(LocalDateTime.now());
                result.setTotalDuration(calculateDuration(result.getStartTime(), result.getEndTime()));
                result.setOverallSuccess(calculateOverallSuccess(result.getTestResults()));

                log.info("포괄적인 시스템 테스트 완료: {}, 성공률: {}%", 
                        config.getTestName(), result.getOverallSuccessRate());

                return result;

            } catch (Exception e) {
                log.error("시스템 테스트 실행 실패", e);
                return createFailedTestResult(config, e);
            }
        }, executorService);
    }

    /**
     * 정확성 테스트 실행
     */
    public AccuracyTestResult runAccuracyTest(List<TestCase> testCases) {
        log.info("정확성 테스트 시작: {}개 테스트 케이스", testCases.size());

        AccuracyTestResult result = AccuracyTestResult.builder()
                .testType("ACCURACY")
                .startTime(LocalDateTime.now())
                .testCases(new ArrayList<>())
                .build();

        int passedCount = 0;
        int totalCount = testCases.size();

        for (TestCase testCase : testCases) {
            TestCaseResult caseResult = executeTestCase(testCase);
            result.getTestCases().add(caseResult);

            if (caseResult.isPassed()) {
                passedCount++;
            }
        }

        result.setEndTime(LocalDateTime.now());
        result.setPassedCount(passedCount);
        result.setFailedCount(totalCount - passedCount);
        result.setAccuracyRate(BigDecimal.valueOf((double) passedCount / totalCount * 100));
        result.setSuccess(result.getAccuracyRate().compareTo(BigDecimal.valueOf(80)) >= 0);

        log.info("정확성 테스트 완료: {}%, {}/{} 통과", 
                result.getAccuracyRate(), passedCount, totalCount);

        return result;
    }

    /**
     * 성능 테스트 실행
     */
    public PerformanceTestResult runPerformanceTest(PerformanceTestConfig config) {
        log.info("성능 테스트 시작: {}개 요청", config.getRequestCount());

        PerformanceTestResult result = PerformanceTestResult.builder()
                .testType("PERFORMANCE")
                .startTime(LocalDateTime.now())
                .requestCount(config.getRequestCount())
                .responseTimes(new ArrayList<>())
                .build();

        List<Long> responseTimes = Collections.synchronizedList(new ArrayList<>());
        List<CompletableFuture<Void>> futures = new ArrayList<>();

        // 동시 요청 실행
        for (int i = 0; i < config.getRequestCount(); i++) {
            CompletableFuture<Void> future = CompletableFuture.runAsync(() -> {
                long startTime = System.currentTimeMillis();
                try {
                    // 샘플 요청 실행
                    executePerformanceTestRequest(config.getSampleTransaction());
                } catch (Exception e) {
                    log.warn("성능 테스트 요청 실패", e);
                }
                long responseTime = System.currentTimeMillis() - startTime;
                responseTimes.add(responseTime);
            }, executorService);
            
            futures.add(future);
        }

        // 모든 요청 완료 대기
        CompletableFuture.allOf(futures.toArray(new CompletableFuture[0])).join();

        result.setEndTime(LocalDateTime.now());
        result.setResponseTimes(responseTimes);
        result.setAverageResponseTime(calculateAverageResponseTime(responseTimes));
        result.setMinResponseTime(Collections.min(responseTimes));
        result.setMaxResponseTime(Collections.max(responseTimes));
        result.setThroughput(calculateThroughput(config.getRequestCount(), result.getStartTime(), result.getEndTime()));
        result.setSuccess(result.getAverageResponseTime() <= config.getMaxAcceptableResponseTime());

        log.info("성능 테스트 완료: 평균 {}ms, 처리량: {} TPS", 
                result.getAverageResponseTime(), result.getThroughput());

        return result;
    }

    /**
     * 부하 테스트 실행
     */
    public LoadTestResult runLoadTest(LoadTestConfig config) {
        log.info("부하 테스트 시작: {} 동시 사용자, {}초 지속", 
                config.getConcurrentUsers(), config.getDurationSeconds());

        LoadTestResult result = LoadTestResult.builder()
                .testType("LOAD")
                .startTime(LocalDateTime.now())
                .concurrentUsers(config.getConcurrentUsers())
                .duration(config.getDurationSeconds())
                .successfulRequests(0)
                .failedRequests(0)
                .responseTimes(new ArrayList<>())
                .build();

        List<Long> responseTimes = Collections.synchronizedList(new ArrayList<>());
        int successCount = 0;
        int failureCount = 0;

        long endTime = System.currentTimeMillis() + (config.getDurationSeconds() * 1000);
        List<CompletableFuture<Void>> userTasks = new ArrayList<>();

        // 동시 사용자 시뮬레이션
        for (int i = 0; i < config.getConcurrentUsers(); i++) {
            CompletableFuture<Void> userTask = CompletableFuture.runAsync(() -> {
                while (System.currentTimeMillis() < endTime) {
                    long requestStart = System.currentTimeMillis();
                    try {
                        executeLoadTestRequest(config.getSampleTransaction());
                        long responseTime = System.currentTimeMillis() - requestStart;
                        responseTimes.add(responseTime);
                        
                        synchronized (result) {
                            result.setSuccessfulRequests(result.getSuccessfulRequests() + 1);
                        }
                        
                        // 요청 간 간격
                        Thread.sleep(config.getRequestIntervalMs());
                        
                    } catch (Exception e) {
                        synchronized (result) {
                            result.setFailedRequests(result.getFailedRequests() + 1);
                        }
                    }
                }
            }, executorService);
            
            userTasks.add(userTask);
        }

        // 모든 사용자 작업 완료 대기
        CompletableFuture.allOf(userTasks.toArray(new CompletableFuture[0])).join();

        result.setEndTime(LocalDateTime.now());
        result.setResponseTimes(responseTimes);
        result.setAverageResponseTime(calculateAverageResponseTime(responseTimes));
        result.setTotalRequests(result.getSuccessfulRequests() + result.getFailedRequests());
        result.setErrorRate(BigDecimal.valueOf((double) result.getFailedRequests() / result.getTotalRequests() * 100));
        result.setSuccess(result.getErrorRate().compareTo(BigDecimal.valueOf(5)) <= 0); // 5% 이하 오류율

        log.info("부하 테스트 완료: {} 요청, {}% 오류율", 
                result.getTotalRequests(), result.getErrorRate());

        return result;
    }

    /**
     * 회귀 테스트 실행
     */
    public RegressionTestResult runRegressionTest(RegressionTestConfig config) {
        log.info("회귀 테스트 시작: {}개 기준선 케이스", config.getBaselineResults().size());

        RegressionTestResult result = RegressionTestResult.builder()
                .testType("REGRESSION")
                .startTime(LocalDateTime.now())
                .comparisons(new ArrayList<>())
                .build();

        int passedComparisons = 0;
        int totalComparisons = config.getBaselineResults().size();

        for (BaselineTestResult baseline : config.getBaselineResults()) {
            // 현재 시스템으로 동일한 테스트 실행
            TestCaseResult currentResult = executeTestCase(baseline.getTestCase());
            
            // 결과 비교
            RegressionComparison comparison = compareResults(baseline, currentResult);
            result.getComparisons().add(comparison);
            
            if (comparison.isPassed()) {
                passedComparisons++;
            }
        }

        result.setEndTime(LocalDateTime.now());
        result.setPassedCount(passedComparisons);
        result.setFailedCount(totalComparisons - passedComparisons);
        result.setRegressionRate(BigDecimal.valueOf((double) passedComparisons / totalComparisons * 100));
        result.setSuccess(result.getRegressionRate().compareTo(BigDecimal.valueOf(95)) >= 0); // 95% 이상

        log.info("회귀 테스트 완료: {}%, {}/{} 일치", 
                result.getRegressionRate(), passedComparisons, totalComparisons);

        return result;
    }

    /**
     * 실시간 품질 모니터링
     */
    public QualityMonitoringResult monitorQuality(MonitoringConfig config) {
        log.info("실시간 품질 모니터링 시작");

        QualityMonitoringResult result = QualityMonitoringResult.builder()
                .monitoringType("REAL_TIME")
                .startTime(LocalDateTime.now())
                .metrics(new HashMap<>())
                .alerts(new ArrayList<>())
                .build();

        try {
            // 1. 정확성 메트릭
            BigDecimal currentAccuracy = measureCurrentAccuracy();
            result.getMetrics().put("accuracy", currentAccuracy);
            
            if (currentAccuracy.compareTo(config.getAccuracyThreshold()) < 0) {
                result.getAlerts().add(createAlert("ACCURACY", "정확성이 임계값 이하", currentAccuracy));
            }

            // 2. 성능 메트릭
            Long averageResponseTime = measureAverageResponseTime();
            result.getMetrics().put("response_time", BigDecimal.valueOf(averageResponseTime));
            
            if (averageResponseTime > config.getResponseTimeThreshold()) {
                result.getAlerts().add(createAlert("PERFORMANCE", "응답시간이 임계값 초과", BigDecimal.valueOf(averageResponseTime)));
            }

            // 3. 오류율 메트릭
            BigDecimal errorRate = measureErrorRate();
            result.getMetrics().put("error_rate", errorRate);
            
            if (errorRate.compareTo(config.getErrorRateThreshold()) > 0) {
                result.getAlerts().add(createAlert("ERROR_RATE", "오류율이 임계값 초과", errorRate));
            }

            // 4. 캐시 히트율
            BigDecimal cacheHitRate = measureCacheHitRate();
            result.getMetrics().put("cache_hit_rate", cacheHitRate);

            result.setOverallHealth(calculateOverallHealth(result.getMetrics(), result.getAlerts()));

        } catch (Exception e) {
            log.error("품질 모니터링 실패", e);
            result.getAlerts().add(createAlert("SYSTEM", "모니터링 시스템 오류", BigDecimal.ZERO));
        }

        result.setEndTime(LocalDateTime.now());
        
        log.info("품질 모니터링 완료: {} 상태, {} 알림", 
                result.getOverallHealth(), result.getAlerts().size());

        return result;
    }

    // Private helper methods

    private TestCaseResult executeTestCase(TestCase testCase) {
        TestCaseResult result = TestCaseResult.builder()
                .testCase(testCase)
                .startTime(LocalDateTime.now())
                .build();

        try {
            // 키워드 추출 및 태그 추천 실행
            LayerProcessingResult keywordResult = keywordExtractionEngine.extractAndMatch(
                    testCase.getInput(), 
                    testCase.getAmount(), 
                    LocalDateTime.now()
            );

            // 기존 PatternMatch 리스트 생성 (호환성을 위해)
            List<PatternMatch> matches = keywordResult.getAllMatches() != null ? 
                    keywordResult.getAllMatches() : new ArrayList<>();
            
            String actualTag = matches.isEmpty() ? "Unknown" : matches.get(0).getPrimaryTag();
            BigDecimal actualConfidence = matches.isEmpty() ? BigDecimal.ZERO : matches.get(0).getFinalConfidence();

            result.setActualTag(actualTag);
            result.setActualConfidence(actualConfidence);
            result.setPassed(actualTag.equals(testCase.getExpectedTag()));
            result.setSuccess(true);

        } catch (Exception e) {
            log.error("테스트 케이스 실행 실패: {}", testCase.getInput(), e);
            result.setSuccess(false);
            result.setPassed(false);
            result.setErrorMessage(e.getMessage());
        }

        result.setEndTime(LocalDateTime.now());
        return result;
    }

    private void executePerformanceTestRequest(String sampleTransaction) {
        // 성능 테스트용 요청 실행
        keywordExtractionEngine.extractAndMatch(sampleTransaction, BigDecimal.valueOf(10000), LocalDateTime.now());
    }

    private void executeLoadTestRequest(String sampleTransaction) {
        // 부하 테스트용 요청 실행
        executePerformanceTestRequest(sampleTransaction);
    }

    private long calculateAverageResponseTime(List<Long> responseTimes) {
        return responseTimes.stream().mapToLong(Long::longValue).sum() / responseTimes.size();
    }

    private BigDecimal calculateThroughput(int requestCount, LocalDateTime startTime, LocalDateTime endTime) {
        long durationMs = java.time.Duration.between(startTime, endTime).toMillis();
        return BigDecimal.valueOf((double) requestCount / durationMs * 1000); // TPS
    }

    private long calculateDuration(LocalDateTime startTime, LocalDateTime endTime) {
        return java.time.Duration.between(startTime, endTime).toMillis();
    }

    private boolean calculateOverallSuccess(List<Object> testResults) {
        // 모든 테스트 결과가 성공인지 확인
        return testResults.stream().allMatch(this::isTestResultSuccessful);
    }

    private boolean isTestResultSuccessful(Object testResult) {
        if (testResult instanceof AccuracyTestResult) {
            return ((AccuracyTestResult) testResult).isSuccess();
        } else if (testResult instanceof PerformanceTestResult) {
            return ((PerformanceTestResult) testResult).isSuccess();
        } else if (testResult instanceof LoadTestResult) {
            return ((LoadTestResult) testResult).isSuccess();
        } else if (testResult instanceof RegressionTestResult) {
            return ((RegressionTestResult) testResult).isSuccess();
        }
        return false;
    }

    private SystemTestResult createFailedTestResult(TestConfiguration config, Exception e) {
        return SystemTestResult.builder()
                .testName(config.getTestName())
                .startTime(LocalDateTime.now())
                .endTime(LocalDateTime.now())
                .configuration(config)
                .testResults(new ArrayList<>())
                .overallSuccess(false)
                .overallSuccessRate(BigDecimal.ZERO)
                .errorMessage(e.getMessage())
                .build();
    }

    private RegressionComparison compareResults(BaselineTestResult baseline, TestCaseResult current) {
        return RegressionComparison.builder()
                .testCase(baseline.getTestCase())
                .baselineResult(baseline)
                .currentResult(current)
                .passed(baseline.getExpectedTag().equals(current.getActualTag()))
                .confidenceDifference(current.getActualConfidence().subtract(baseline.getExpectedConfidence()))
                .build();
    }

    private BigDecimal measureCurrentAccuracy() {
        // 최근 처리된 거래들의 정확성 측정 (목 구현)
        return BigDecimal.valueOf(85.0);
    }

    private Long measureAverageResponseTime() {
        // 최근 응답시간 평균 측정 (목 구현)
        return 250L;
    }

    private BigDecimal measureErrorRate() {
        // 최근 오류율 측정 (목 구현)
        return BigDecimal.valueOf(2.5);
    }

    private BigDecimal measureCacheHitRate() {
        // 캐시 히트율 측정 (목 구현)
        return BigDecimal.valueOf(78.0);
    }

    private String calculateOverallHealth(Map<String, BigDecimal> metrics, List<QualityAlert> alerts) {
        if (alerts.isEmpty()) {
            return "HEALTHY";
        } else if (alerts.size() <= 2) {
            return "WARNING";
        } else {
            return "CRITICAL";
        }
    }

    private QualityAlert createAlert(String type, String message, BigDecimal value) {
        return QualityAlert.builder()
                .alertType(type)
                .message(message)
                .value(value)
                .timestamp(LocalDateTime.now())
                .build();
    }

    // DTO 클래스들 (간소화)
    @lombok.Data
    @lombok.Builder
    public static class TestConfiguration {
        private String testName;
        private boolean accuracyTestEnabled;
        private boolean performanceTestEnabled;
        private boolean loadTestEnabled;
        private boolean regressionTestEnabled;
        private List<TestCase> testCases;
        private PerformanceTestConfig performanceConfig;
        private LoadTestConfig loadConfig;
        private RegressionTestConfig regressionConfig;
    }

    @lombok.Data
    @lombok.Builder
    public static class TestCase {
        private String input;
        private BigDecimal amount;
        private String expectedTag;
        private String expectedAccount;
        private BigDecimal expectedConfidence;
    }

    @lombok.Data
    @lombok.Builder
    public static class SystemTestResult {
        private String testName;
        private LocalDateTime startTime;
        private LocalDateTime endTime;
        private long totalDuration;
        private TestConfiguration configuration;
        private List<Object> testResults;
        private boolean overallSuccess;
        private BigDecimal overallSuccessRate;
        private String errorMessage;
    }

    @lombok.Data
    @lombok.Builder
    public static class AccuracyTestResult {
        private String testType;
        private LocalDateTime startTime;
        private LocalDateTime endTime;
        private List<TestCaseResult> testCases;
        private int passedCount;
        private int failedCount;
        private BigDecimal accuracyRate;
        private boolean success;
    }

    @lombok.Data
    @lombok.Builder
    public static class TestCaseResult {
        private TestCase testCase;
        private LocalDateTime startTime;
        private LocalDateTime endTime;
        private String actualTag;
        private BigDecimal actualConfidence;
        private boolean passed;
        private boolean success;
        private String errorMessage;
    }

    @lombok.Data
    @lombok.Builder
    public static class PerformanceTestResult {
        private String testType;
        private LocalDateTime startTime;
        private LocalDateTime endTime;
        private int requestCount;
        private List<Long> responseTimes;
        private long averageResponseTime;
        private long minResponseTime;
        private long maxResponseTime;
        private BigDecimal throughput;
        private boolean success;
    }

    @lombok.Data
    @lombok.Builder
    public static class PerformanceTestConfig {
        private int requestCount;
        private String sampleTransaction;
        private long maxAcceptableResponseTime;
    }

    @lombok.Data
    @lombok.Builder
    public static class LoadTestResult {
        private String testType;
        private LocalDateTime startTime;
        private LocalDateTime endTime;
        private int concurrentUsers;
        private int duration;
        private int successfulRequests;
        private int failedRequests;
        private int totalRequests;
        private List<Long> responseTimes;
        private long averageResponseTime;
        private BigDecimal errorRate;
        private boolean success;
    }

    @lombok.Data
    @lombok.Builder
    public static class LoadTestConfig {
        private int concurrentUsers;
        private int durationSeconds;
        private int requestIntervalMs;
        private String sampleTransaction;
    }

    @lombok.Data
    @lombok.Builder
    public static class RegressionTestResult {
        private String testType;
        private LocalDateTime startTime;
        private LocalDateTime endTime;
        private List<RegressionComparison> comparisons;
        private int passedCount;
        private int failedCount;
        private BigDecimal regressionRate;
        private boolean success;
    }

    @lombok.Data
    @lombok.Builder
    public static class RegressionTestConfig {
        private List<BaselineTestResult> baselineResults;
    }

    @lombok.Data
    @lombok.Builder
    public static class BaselineTestResult {
        private TestCase testCase;
        private String expectedTag;
        private BigDecimal expectedConfidence;
    }

    @lombok.Data
    @lombok.Builder
    public static class RegressionComparison {
        private TestCase testCase;
        private BaselineTestResult baselineResult;
        private TestCaseResult currentResult;
        private boolean passed;
        private BigDecimal confidenceDifference;
    }

    @lombok.Data
    @lombok.Builder
    public static class QualityMonitoringResult {
        private String monitoringType;
        private LocalDateTime startTime;
        private LocalDateTime endTime;
        private Map<String, BigDecimal> metrics;
        private List<QualityAlert> alerts;
        private String overallHealth;
    }

    @lombok.Data
    @lombok.Builder
    public static class MonitoringConfig {
        private BigDecimal accuracyThreshold;
        private long responseTimeThreshold;
        private BigDecimal errorRateThreshold;
    }

    @lombok.Data
    @lombok.Builder
    public static class QualityAlert {
        private String alertType;
        private String message;
        private BigDecimal value;
        private LocalDateTime timestamp;
    }
}
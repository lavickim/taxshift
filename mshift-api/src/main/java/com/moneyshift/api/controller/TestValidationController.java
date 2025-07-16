package com.moneyshift.api.controller;

import com.moneyshift.api.service.TestValidationService;
import com.moneyshift.api.service.TestValidationService.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.CompletableFuture;

/**
 * 테스트 및 검증 API 컨트롤러
 */
@Slf4j
@RestController
@RequestMapping("/api/v2/test")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class TestValidationController {

    private final TestValidationService testValidationService;

    /**
     * 포괄적인 시스템 테스트 실행
     */
    @PostMapping("/comprehensive")
    public ResponseEntity<CompletableFuture<SystemTestResult>> runComprehensiveTest(
            @RequestBody TestConfiguration config) {
        
        log.info("포괄적인 시스템 테스트 요청: {}", config.getTestName());
        
        try {
            CompletableFuture<SystemTestResult> future = testValidationService.runComprehensiveTest(config);
            return ResponseEntity.ok(future);
        } catch (Exception e) {
            log.error("포괄적인 시스템 테스트 실행 실패", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * 정확성 테스트 실행
     */
    @PostMapping("/accuracy")
    public ResponseEntity<AccuracyTestResult> runAccuracyTest(@RequestBody AccuracyTestRequest request) {
        log.info("정확성 테스트 요청: {}개 테스트 케이스", request.getTestCases().size());
        
        try {
            AccuracyTestResult result = testValidationService.runAccuracyTest(request.getTestCases());
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            log.error("정확성 테스트 실행 실패", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * 성능 테스트 실행
     */
    @PostMapping("/performance")
    public ResponseEntity<PerformanceTestResult> runPerformanceTest(@RequestBody PerformanceTestConfig config) {
        log.info("성능 테스트 요청: {}개 요청", config.getRequestCount());
        
        try {
            PerformanceTestResult result = testValidationService.runPerformanceTest(config);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            log.error("성능 테스트 실행 실패", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * 부하 테스트 실행
     */
    @PostMapping("/load")
    public ResponseEntity<LoadTestResult> runLoadTest(@RequestBody LoadTestConfig config) {
        log.info("부하 테스트 요청: {} 동시 사용자", config.getConcurrentUsers());
        
        try {
            LoadTestResult result = testValidationService.runLoadTest(config);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            log.error("부하 테스트 실행 실패", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * 실시간 품질 모니터링
     */
    @PostMapping("/monitor")
    public ResponseEntity<QualityMonitoringResult> monitorQuality(@RequestBody MonitoringConfig config) {
        log.info("실시간 품질 모니터링 요청");
        
        try {
            QualityMonitoringResult result = testValidationService.monitorQuality(config);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            log.error("품질 모니터링 실행 실패", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * 샘플 테스트 케이스 생성
     */
    @GetMapping("/sample-cases")
    public ResponseEntity<List<TestCase>> getSampleTestCases() {
        log.info("샘플 테스트 케이스 요청");
        
        try {
            List<TestCase> sampleCases = createSampleTestCases();
            return ResponseEntity.ok(sampleCases);
        } catch (Exception e) {
            log.error("샘플 테스트 케이스 생성 실패", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * 기본 테스트 설정 생성
     */
    @GetMapping("/default-config")
    public ResponseEntity<TestConfiguration> getDefaultTestConfiguration() {
        log.info("기본 테스트 설정 요청");
        
        try {
            TestConfiguration config = createDefaultTestConfiguration();
            return ResponseEntity.ok(config);
        } catch (Exception e) {
            log.error("기본 테스트 설정 생성 실패", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    // Private helper methods
    
    private List<TestCase> createSampleTestCases() {
        List<TestCase> testCases = new ArrayList<>();
        
        // 편의점 테스트 케이스
        testCases.add(TestCase.builder()
                .input("세븐일레븐 강남점에서 커피 구매")
                .amount(BigDecimal.valueOf(4500))
                .expectedTag("편의점")
                .expectedAccount("602")
                .expectedConfidence(BigDecimal.valueOf(0.9))
                .build());
                
        testCases.add(TestCase.builder()
                .input("CU편의점 야식 구매 새벽 2시")
                .amount(BigDecimal.valueOf(8000))
                .expectedTag("편의점")
                .expectedAccount("655")
                .expectedConfidence(BigDecimal.valueOf(0.85))
                .build());

        // 주유소 테스트 케이스
        testCases.add(TestCase.builder()
                .input("GS칼텍스 주유소 휘발유 충전")
                .amount(BigDecimal.valueOf(70000))
                .expectedTag("주유소")
                .expectedAccount("622")
                .expectedConfidence(BigDecimal.valueOf(0.95))
                .build());
                
        testCases.add(TestCase.builder()
                .input("SK에너지 셀프 주유")
                .amount(BigDecimal.valueOf(65000))
                .expectedTag("주유소")
                .expectedAccount("622")
                .expectedConfidence(BigDecimal.valueOf(0.92))
                .build());

        // 카페 테스트 케이스
        testCases.add(TestCase.builder()
                .input("스타벅스 아메리카노 2잔")
                .amount(BigDecimal.valueOf(9000))
                .expectedTag("카페")
                .expectedAccount("651")
                .expectedConfidence(BigDecimal.valueOf(0.96))
                .build());
                
        testCases.add(TestCase.builder()
                .input("이디야 커피 소액")
                .amount(BigDecimal.valueOf(3000))
                .expectedTag("카페")
                .expectedAccount("634")
                .expectedConfidence(BigDecimal.valueOf(0.8))
                .build());

        // 패스트푸드 테스트 케이스
        testCases.add(TestCase.builder()
                .input("맥도날드 빅맥세트 점심")
                .amount(BigDecimal.valueOf(12000))
                .expectedTag("패스트푸드")
                .expectedAccount("651")
                .expectedConfidence(BigDecimal.valueOf(0.89))
                .build());

        // 온라인 서비스 테스트 케이스
        testCases.add(TestCase.builder()
                .input("쿠팡 생필품 주문 배송비 포함")
                .amount(BigDecimal.valueOf(25000))
                .expectedTag("온라인쇼핑")
                .expectedAccount("634")
                .expectedConfidence(BigDecimal.valueOf(0.82))
                .build());

        return testCases;
    }
    
    private TestConfiguration createDefaultTestConfiguration() {
        List<TestCase> sampleCases = createSampleTestCases();
        
        PerformanceTestConfig performanceConfig = PerformanceTestConfig.builder()
                .requestCount(100)
                .sampleTransaction("세븐일레븐 커피 구매")
                .maxAcceptableResponseTime(1000L)
                .build();
                
        LoadTestConfig loadConfig = LoadTestConfig.builder()
                .concurrentUsers(10)
                .durationSeconds(30)
                .requestIntervalMs(100)
                .sampleTransaction("GS칼텍스 주유소 휘발유")
                .build();

        return TestConfiguration.builder()
                .testName("기본 시스템 테스트")
                .accuracyTestEnabled(true)
                .performanceTestEnabled(true)
                .loadTestEnabled(false)
                .regressionTestEnabled(false)
                .testCases(sampleCases)
                .performanceConfig(performanceConfig)
                .loadConfig(loadConfig)
                .build();
    }

    // DTO Classes
    @lombok.Data
    public static class AccuracyTestRequest {
        private List<TestCase> testCases;
    }
}
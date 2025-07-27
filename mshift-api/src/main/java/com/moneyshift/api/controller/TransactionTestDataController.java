package com.moneyshift.api.controller;

import com.moneyshift.api.model.TransactionTestData;
import com.moneyshift.api.model.TestBatchExecution;
import com.moneyshift.api.service.TransactionTestDataService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CompletableFuture;

/**
 * MoneyShift 거래 테스트 데이터 REST API 컨트롤러
 * 1000개 테스트 데이터 CRUD 및 파이프라인 테스트 실행 API
 */
@RestController
@RequestMapping("/v2/test-data")
@CrossOrigin(origins = {"http://localhost:3000", "http://127.0.0.1:3000"})
public class TransactionTestDataController {
    
    private static final Logger logger = LoggerFactory.getLogger(TransactionTestDataController.class);
    
    @Autowired
    private TransactionTestDataService testDataService;
    
    // ====================
    // 기본 CRUD API
    // ====================
    
    /**
     * 테스트 데이터 전체 조회 (페이징 지원)
     * GET /v2/test-data?page=0&size=20&sourceType=BANK&testCategory=음식점&difficultyLevel=2
     */
    @GetMapping
    public ResponseEntity<?> getAllTestData(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String sourceType,
            @RequestParam(required = false) String testCategory,
            @RequestParam(required = false) Integer difficultyLevel) {
        
        try {
            Map<String, Object> result = testDataService.findAll(page, size, sourceType, testCategory, difficultyLevel);
            
            logger.info("테스트 데이터 조회 API 호출 성공: page={}, size={}", page, size);
            return ResponseEntity.ok(result);
            
        } catch (Exception e) {
            logger.error("테스트 데이터 조회 API 실패", e);
            return ResponseEntity.status(500).body(Map.of(
                "error", "테스트 데이터 조회 실패",
                "message", e.getMessage()
            ));
        }
    }
    
    /**
     * 테스트 데이터 개별 조회
     * GET /v2/test-data/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getTestDataById(@PathVariable Long id) {
        try {
            TransactionTestData testData = testDataService.findById(id);
            
            logger.info("테스트 데이터 개별 조회 API 호출 성공: ID={}", id);
            return ResponseEntity.ok(testData);
            
        } catch (RuntimeException e) {
            logger.error("테스트 데이터 개별 조회 API 실패: ID={}", id, e);
            return ResponseEntity.status(404).body(Map.of(
                "error", "테스트 데이터 조회 실패",
                "message", e.getMessage()
            ));
        } catch (Exception e) {
            logger.error("테스트 데이터 개별 조회 API 오류: ID={}", id, e);
            return ResponseEntity.status(500).body(Map.of(
                "error", "서버 오류",
                "message", e.getMessage()
            ));
        }
    }
    
    /**
     * 테스트 데이터 생성
     * POST /v2/test-data
     */
    @PostMapping
    public ResponseEntity<?> createTestData(@RequestBody TransactionTestData testData) {
        try {
            TransactionTestData created = testDataService.create(testData);
            
            logger.info("테스트 데이터 생성 API 호출 성공: ID={}", created.getId());
            return ResponseEntity.status(201).body(created);
            
        } catch (IllegalArgumentException e) {
            logger.error("테스트 데이터 생성 API 유효성 검증 실패", e);
            return ResponseEntity.status(400).body(Map.of(
                "error", "입력 데이터 유효성 검증 실패",
                "message", e.getMessage()
            ));
        } catch (Exception e) {
            logger.error("테스트 데이터 생성 API 실패", e);
            return ResponseEntity.status(500).body(Map.of(
                "error", "테스트 데이터 생성 실패",
                "message", e.getMessage()
            ));
        }
    }
    
    /**
     * 테스트 데이터 수정
     * PUT /v2/test-data/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> updateTestData(@PathVariable Long id, @RequestBody TransactionTestData testData) {
        try {
            TransactionTestData updated = testDataService.update(id, testData);
            
            logger.info("테스트 데이터 수정 API 호출 성공: ID={}", id);
            return ResponseEntity.ok(updated);
            
        } catch (IllegalArgumentException e) {
            logger.error("테스트 데이터 수정 API 유효성 검증 실패: ID={}", id, e);
            return ResponseEntity.status(400).body(Map.of(
                "error", "입력 데이터 유효성 검증 실패",
                "message", e.getMessage()
            ));
        } catch (RuntimeException e) {
            logger.error("테스트 데이터 수정 API 실패: ID={}", id, e);
            return ResponseEntity.status(404).body(Map.of(
                "error", "테스트 데이터 수정 실패",
                "message", e.getMessage()
            ));
        } catch (Exception e) {
            logger.error("테스트 데이터 수정 API 오류: ID={}", id, e);
            return ResponseEntity.status(500).body(Map.of(
                "error", "서버 오류",
                "message", e.getMessage()
            ));
        }
    }
    
    /**
     * 테스트 데이터 삭제
     * DELETE /v2/test-data/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteTestData(@PathVariable Long id) {
        try {
            testDataService.deleteById(id);
            
            logger.info("테스트 데이터 삭제 API 호출 성공: ID={}", id);
            return ResponseEntity.ok(Map.of(
                "message", "테스트 데이터가 성공적으로 삭제되었습니다.",
                "deletedId", id
            ));
            
        } catch (RuntimeException e) {
            logger.error("테스트 데이터 삭제 API 실패: ID={}", id, e);
            return ResponseEntity.status(404).body(Map.of(
                "error", "테스트 데이터 삭제 실패",
                "message", e.getMessage()
            ));
        } catch (Exception e) {
            logger.error("테스트 데이터 삭제 API 오류: ID={}", id, e);
            return ResponseEntity.status(500).body(Map.of(
                "error", "서버 오류",
                "message", e.getMessage()
            ));
        }
    }
    
    /**
     * 테스트 데이터 일괄 삭제
     * DELETE /v2/test-data/batch
     */
    @DeleteMapping("/batch")
    public ResponseEntity<?> deleteTestDataBatch(@RequestBody List<Long> ids) {
        try {
            testDataService.deleteByIds(ids);
            
            logger.info("테스트 데이터 일괄 삭제 API 호출 성공: {} 건", ids.size());
            return ResponseEntity.ok(Map.of(
                "message", "테스트 데이터가 성공적으로 일괄 삭제되었습니다.",
                "deletedCount", ids.size(),
                "deletedIds", ids
            ));
            
        } catch (IllegalArgumentException e) {
            logger.error("테스트 데이터 일괄 삭제 API 유효성 검증 실패", e);
            return ResponseEntity.status(400).body(Map.of(
                "error", "입력 데이터 유효성 검증 실패",
                "message", e.getMessage()
            ));
        } catch (Exception e) {
            logger.error("테스트 데이터 일괄 삭제 API 실패", e);
            return ResponseEntity.status(500).body(Map.of(
                "error", "테스트 데이터 일괄 삭제 실패",
                "message", e.getMessage()
            ));
        }
    }
    
    // ====================
    // 검색 및 필터링 API
    // ====================
    
    /**
     * 텍스트 검색
     * GET /v2/test-data/search?text=스타벅스&page=0&size=20
     */
    @GetMapping("/search")
    public ResponseEntity<?> searchTestData(
            @RequestParam String text,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        try {
            Map<String, Object> result = testDataService.searchByText(text, page, size);
            
            logger.info("테스트 데이터 텍스트 검색 API 호출 성공: '{}'", text);
            return ResponseEntity.ok(result);
            
        } catch (Exception e) {
            logger.error("테스트 데이터 텍스트 검색 API 실패: '{}'", text, e);
            return ResponseEntity.status(500).body(Map.of(
                "error", "텍스트 검색 실패",
                "message", e.getMessage()
            ));
        }
    }
    
    /**
     * 날짜 범위 검색
     * GET /v2/test-data/search/date-range?startDate=2025-01-01&endDate=2025-12-31&page=0&size=20
     */
    @GetMapping("/search/date-range")
    public ResponseEntity<?> searchTestDataByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        try {
            Map<String, Object> result = testDataService.findByDateRange(startDate, endDate, page, size);
            
            logger.info("테스트 데이터 날짜 범위 검색 API 호출 성공: {} ~ {}", startDate, endDate);
            return ResponseEntity.ok(result);
            
        } catch (Exception e) {
            logger.error("테스트 데이터 날짜 범위 검색 API 실패: {} ~ {}", startDate, endDate, e);
            return ResponseEntity.status(500).body(Map.of(
                "error", "날짜 범위 검색 실패",
                "message", e.getMessage()
            ));
        }
    }
    
    // ====================
    // 파이프라인 테스트 실행 API
    // ====================
    
    /**
     * 단일 테스트 실행
     * POST /v2/test-data/{id}/execute
     */
    @PostMapping("/{id}/execute")
    public ResponseEntity<?> executeSingleTest(@PathVariable Long id) {
        try {
            Map<String, Object> result = testDataService.executeSingleTest(id);
            
            logger.info("단일 테스트 실행 API 호출 성공: ID={}", id);
            return ResponseEntity.ok(result);
            
        } catch (RuntimeException e) {
            logger.error("단일 테스트 실행 API 실패: ID={}", id, e);
            return ResponseEntity.status(404).body(Map.of(
                "error", "단일 테스트 실행 실패",
                "message", e.getMessage()
            ));
        } catch (Exception e) {
            logger.error("단일 테스트 실행 API 오류: ID={}", id, e);
            return ResponseEntity.status(500).body(Map.of(
                "error", "서버 오류",
                "message", e.getMessage()
            ));
        }
    }
    
    /**
     * 배치 테스트 실행 (비동기)
     * POST /v2/test-data/execute/batch
     */
    @PostMapping("/execute/batch")
    public ResponseEntity<?> executeBatchTest(@RequestBody Map<String, Object> request) {
        try {
            String batchName = (String) request.get("batchName");
            @SuppressWarnings("unchecked")
            List<Long> testDataIds = (List<Long>) request.get("testDataIds");
            String createdBy = (String) request.getOrDefault("createdBy", "system");
            
            if (batchName == null || batchName.trim().isEmpty()) {
                return ResponseEntity.status(400).body(Map.of(
                    "error", "배치명은 필수입니다."
                ));
            }
            
            if (testDataIds == null || testDataIds.isEmpty()) {
                return ResponseEntity.status(400).body(Map.of(
                    "error", "테스트할 데이터 ID 목록은 필수입니다."
                ));
            }
            
            // 비동기 실행
            CompletableFuture<TestBatchExecution> future = testDataService.executeBatchTestAsync(
                batchName, testDataIds, createdBy);
            
            logger.info("배치 테스트 실행 API 호출 성공: {} ({} 건)", batchName, testDataIds.size());
            
            return ResponseEntity.accepted().body(Map.of(
                "message", "배치 테스트가 비동기로 시작되었습니다.",
                "batchName", batchName,
                "testDataCount", testDataIds.size(),
                "status", "RUNNING"
            ));
            
        } catch (Exception e) {
            logger.error("배치 테스트 실행 API 실패", e);
            return ResponseEntity.status(500).body(Map.of(
                "error", "배치 테스트 실행 실패",
                "message", e.getMessage()
            ));
        }
    }
    
    /**
     * 배치 테스트 실행 (동기)
     * POST /v2/test-data/execute/batch/sync
     */
    @PostMapping("/execute/batch/sync")
    public ResponseEntity<?> executeBatchTestSync(@RequestBody Map<String, Object> request) {
        try {
            String batchName = (String) request.get("batchName");
            @SuppressWarnings("unchecked")
            List<Long> testDataIds = (List<Long>) request.get("testDataIds");
            String createdBy = (String) request.getOrDefault("createdBy", "system");
            
            if (batchName == null || batchName.trim().isEmpty()) {
                return ResponseEntity.status(400).body(Map.of(
                    "error", "배치명은 필수입니다."
                ));
            }
            
            if (testDataIds == null || testDataIds.isEmpty()) {
                return ResponseEntity.status(400).body(Map.of(
                    "error", "테스트할 데이터 ID 목록은 필수입니다."
                ));
            }
            
            // 동기 실행
            TestBatchExecution result = testDataService.executeBatchTest(batchName, testDataIds, createdBy);
            
            logger.info("배치 테스트 동기 실행 API 호출 성공: {} ({} 건)", batchName, testDataIds.size());
            return ResponseEntity.ok(result);
            
        } catch (Exception e) {
            logger.error("배치 테스트 동기 실행 API 실패", e);
            return ResponseEntity.status(500).body(Map.of(
                "error", "배치 테스트 실행 실패",
                "message", e.getMessage()
            ));
        }
    }
    
    // ====================
    // 통계 및 분석 API
    // ====================
    
    /**
     * 종합 통계 조회
     * GET /v2/test-data/statistics
     */
    @GetMapping("/statistics")
    public ResponseEntity<?> getStatistics() {
        try {
            Map<String, Object> statistics = testDataService.getComprehensiveStatistics();
            
            logger.info("종합 통계 조회 API 호출 성공");
            return ResponseEntity.ok(statistics);
            
        } catch (Exception e) {
            logger.error("종합 통계 조회 API 실패", e);
            return ResponseEntity.status(500).body(Map.of(
                "error", "통계 조회 실패",
                "message", e.getMessage()
            ));
        }
    }
    
    // ====================
    // 배치 실행 관리 API
    // ====================
    
    /**
     * 배치 실행 이력 조회
     * GET /v2/test-data/batch-executions?page=0&size=20
     */
    @GetMapping("/batch-executions")
    public ResponseEntity<?> getBatchExecutions(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        try {
            Map<String, Object> result = testDataService.getBatchExecutions(page, size);
            
            logger.info("배치 실행 이력 조회 API 호출 성공: page={}, size={}", page, size);
            return ResponseEntity.ok(result);
            
        } catch (Exception e) {
            logger.error("배치 실행 이력 조회 API 실패", e);
            return ResponseEntity.status(500).body(Map.of(
                "error", "배치 실행 이력 조회 실패",
                "message", e.getMessage()
            ));
        }
    }
    
    // ====================
    // 헬스체크 API
    // ====================
    
    /**
     * 테스트 데이터 시스템 헬스체크
     * GET /v2/test-data/health
     */
    @GetMapping("/health")
    public ResponseEntity<?> healthCheck() {
        try {
            Map<String, Object> basicStats = testDataService.getComprehensiveStatistics();
            @SuppressWarnings("unchecked")
            Map<String, Object> basic = (Map<String, Object>) basicStats.get("basic");
            
            Integer totalRecords = (Integer) basic.get("total_records");
            
            Map<String, Object> health = Map.of(
                "status", "healthy",
                "timestamp", java.time.LocalDateTime.now(),
                "testDataCount", totalRecords != null ? totalRecords : 0,
                "message", "테스트 데이터 시스템이 정상 작동 중입니다."
            );
            
            logger.info("테스트 데이터 시스템 헬스체크 성공");
            return ResponseEntity.ok(health);
            
        } catch (Exception e) {
            logger.error("테스트 데이터 시스템 헬스체크 실패", e);
            
            Map<String, Object> health = Map.of(
                "status", "unhealthy",
                "timestamp", java.time.LocalDateTime.now(),
                "message", "테스트 데이터 시스템에 문제가 있습니다.",
                "error", e.getMessage()
            );
            
            return ResponseEntity.status(500).body(health);
        }
    }
}
package com.moneyshift.api.controller;

import com.moneyshift.api.service.TagAccountMappingService;
import com.moneyshift.api.model.TagAccountMapping;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.fasterxml.jackson.databind.JsonNode;

import java.util.List;

/**
 * 태그-계정과목 매핑 API 컨트롤러
 * 조건부 규칙을 포함한 태그-계정과목 매핑 관리
 */
@Slf4j
@RestController
@RequestMapping("/v2/tag-account-mappings")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class TagAccountMappingController {

    private final TagAccountMappingService tagAccountMappingService;

    /**
     * 태그-계정과목 매핑 목록 조회
     */
    @GetMapping
    public ResponseEntity<List<TagAccountMapping>> getTagAccountMappings(
            @RequestParam(required = false) Long tagId,
            @RequestParam(required = false) String accountCode,
            @RequestParam(required = false) Boolean isDefault) {
        
        log.info("태그-계정과목 매핑 조회: tagId={}, accountCode={}, isDefault={}", 
                tagId, accountCode, isDefault);
        
        try {
            List<TagAccountMapping> mappings = tagAccountMappingService.getMappings(tagId, accountCode, isDefault);
            return ResponseEntity.ok(mappings);
        } catch (Exception e) {
            log.error("태그-계정과목 매핑 조회 실패", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * 태그별 계정과목 매핑 조회
     */
    @GetMapping("/by-tag/{tagId}")
    public ResponseEntity<List<TagAccountMapping>> getMappingsByTag(@PathVariable Long tagId) {
        log.info("태그별 계정과목 매핑 조회: tagId={}", tagId);
        
        try {
            List<TagAccountMapping> mappings = tagAccountMappingService.getMappingsByTagId(tagId);
            return ResponseEntity.ok(mappings);
        } catch (Exception e) {
            log.error("태그별 계정과목 매핑 조회 실패", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * 태그-계정과목 매핑 생성
     */
    @PostMapping
    public ResponseEntity<TagAccountMapping> createMapping(@RequestBody TagAccountMapping mapping) {
        log.info("태그-계정과목 매핑 생성: tagId={}, accountCode={}", 
                mapping.getTagId(), mapping.getAccountCode());
        
        try {
            TagAccountMapping createdMapping = tagAccountMappingService.createMapping(mapping);
            return ResponseEntity.ok(createdMapping);
        } catch (Exception e) {
            log.error("태그-계정과목 매핑 생성 실패", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * 태그-계정과목 매핑 수정
     */
    @PutMapping("/{id}")
    public ResponseEntity<TagAccountMapping> updateMapping(@PathVariable Long id, @RequestBody TagAccountMapping mapping) {
        log.info("태그-계정과목 매핑 수정: id={}", id);
        
        try {
            TagAccountMapping updatedMapping = tagAccountMappingService.updateMapping(id, mapping);
            return ResponseEntity.ok(updatedMapping);
        } catch (Exception e) {
            log.error("태그-계정과목 매핑 수정 실패", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * 태그-계정과목 매핑 삭제
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMapping(@PathVariable Long id) {
        log.info("태그-계정과목 매핑 삭제: id={}", id);
        
        try {
            tagAccountMappingService.deleteMapping(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            log.error("태그-계정과목 매핑 삭제 실패", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * 조건부 매핑 규칙 테스트
     */
    @PostMapping("/test-conditions")
    public ResponseEntity<ConditionalMappingTestResult> testConditionalMapping(@RequestBody ConditionalMappingTestRequest request) {
        log.info("조건부 매핑 규칙 테스트: tagId={}, conditions={}", 
                request.getTagId(), request.getConditions());
        
        try {
            ConditionalMappingTestResult result = tagAccountMappingService.testConditionalMapping(request);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            log.error("조건부 매핑 규칙 테스트 실패", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * 매핑 시나리오 테스트
     */
    @PostMapping("/test-scenarios")
    public ResponseEntity<List<MappingScenarioResult>> testMappingScenarios(@RequestBody List<MappingScenarioRequest> scenarios) {
        log.info("매핑 시나리오 테스트: scenarios={}", scenarios.size());
        
        try {
            List<MappingScenarioResult> results = tagAccountMappingService.testMappingScenarios(scenarios);
            return ResponseEntity.ok(results);
        } catch (Exception e) {
            log.error("매핑 시나리오 테스트 실패", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * 계정과목 목록 조회
     */
    @GetMapping("/accounts")
    public ResponseEntity<List<AccountInfo>> getAccounts() {
        log.info("계정과목 목록 조회");
        
        try {
            List<AccountInfo> accounts = tagAccountMappingService.getAccounts();
            return ResponseEntity.ok(accounts);
        } catch (Exception e) {
            log.error("계정과목 목록 조회 실패", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * 매핑 통계 조회
     */
    @GetMapping("/stats")
    public ResponseEntity<MappingStatistics> getMappingStats() {
        log.info("매핑 통계 조회");
        
        try {
            MappingStatistics stats = tagAccountMappingService.getMappingStats();
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            log.error("매핑 통계 조회 실패", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * 조건부 매핑 규칙 생성
     */
    @PostMapping("/conditional-rules")
    public ResponseEntity<ConditionalRule> createConditionalRule(@RequestBody ConditionalRule rule) {
        log.info("조건부 매핑 규칙 생성: tagId={}, conditions={}", 
                rule.getTagId(), rule.getConditions());
        
        try {
            ConditionalRule createdRule = tagAccountMappingService.createConditionalRule(rule);
            return ResponseEntity.ok(createdRule);
        } catch (Exception e) {
            log.error("조건부 매핑 규칙 생성 실패", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * 조건부 매핑 규칙 조회
     */
    @GetMapping("/conditional-rules")
    public ResponseEntity<List<ConditionalRule>> getConditionalRules(@RequestParam(required = false) Long tagId) {
        log.info("조건부 매핑 규칙 조회: tagId={}", tagId);
        
        try {
            List<ConditionalRule> rules = tagAccountMappingService.getConditionalRules(tagId);
            return ResponseEntity.ok(rules);
        } catch (Exception e) {
            log.error("조건부 매핑 규칙 조회 실패", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    // ========== 내부 클래스들 ==========

    /**
     * 조건부 매핑 테스트 요청
     */
    public static class ConditionalMappingTestRequest {
        private Long tagId;
        private JsonNode conditions;
        private String transactionText;
        private Long amount;
        private String timeContext;
        private String previousTag;

        // getters and setters
        public Long getTagId() { return tagId; }
        public void setTagId(Long tagId) { this.tagId = tagId; }
        public JsonNode getConditions() { return conditions; }
        public void setConditions(JsonNode conditions) { this.conditions = conditions; }
        public String getTransactionText() { return transactionText; }
        public void setTransactionText(String transactionText) { this.transactionText = transactionText; }
        public Long getAmount() { return amount; }
        public void setAmount(Long amount) { this.amount = amount; }
        public String getTimeContext() { return timeContext; }
        public void setTimeContext(String timeContext) { this.timeContext = timeContext; }
        public String getPreviousTag() { return previousTag; }
        public void setPreviousTag(String previousTag) { this.previousTag = previousTag; }
    }

    /**
     * 조건부 매핑 테스트 결과
     */
    public static class ConditionalMappingTestResult {
        private Long tagId;
        private String accountCode;
        private String accountName;
        private boolean matched;
        private String matchedCondition;
        private Double confidence;
        private String reason;

        // getters and setters
        public Long getTagId() { return tagId; }
        public void setTagId(Long tagId) { this.tagId = tagId; }
        public String getAccountCode() { return accountCode; }
        public void setAccountCode(String accountCode) { this.accountCode = accountCode; }
        public String getAccountName() { return accountName; }
        public void setAccountName(String accountName) { this.accountName = accountName; }
        public boolean isMatched() { return matched; }
        public void setMatched(boolean matched) { this.matched = matched; }
        public String getMatchedCondition() { return matchedCondition; }
        public void setMatchedCondition(String matchedCondition) { this.matchedCondition = matchedCondition; }
        public Double getConfidence() { return confidence; }
        public void setConfidence(Double confidence) { this.confidence = confidence; }
        public String getReason() { return reason; }
        public void setReason(String reason) { this.reason = reason; }
    }

    /**
     * 매핑 시나리오 테스트 요청
     */
    public static class MappingScenarioRequest {
        private String scenarioName;
        private String transactionText;
        private Long amount;
        private String timeContext;
        private String expectedAccount;
        private String expectedAccountName;

        // getters and setters
        public String getScenarioName() { return scenarioName; }
        public void setScenarioName(String scenarioName) { this.scenarioName = scenarioName; }
        public String getTransactionText() { return transactionText; }
        public void setTransactionText(String transactionText) { this.transactionText = transactionText; }
        public Long getAmount() { return amount; }
        public void setAmount(Long amount) { this.amount = amount; }
        public String getTimeContext() { return timeContext; }
        public void setTimeContext(String timeContext) { this.timeContext = timeContext; }
        public String getExpectedAccount() { return expectedAccount; }
        public void setExpectedAccount(String expectedAccount) { this.expectedAccount = expectedAccount; }
        public String getExpectedAccountName() { return expectedAccountName; }
        public void setExpectedAccountName(String expectedAccountName) { this.expectedAccountName = expectedAccountName; }
    }

    /**
     * 매핑 시나리오 테스트 결과
     */
    public static class MappingScenarioResult {
        private String scenarioName;
        private boolean passed;
        private String actualAccount;
        private String actualAccountName;
        private String expectedAccount;
        private String expectedAccountName;
        private String errorMessage;

        // getters and setters
        public String getScenarioName() { return scenarioName; }
        public void setScenarioName(String scenarioName) { this.scenarioName = scenarioName; }
        public boolean isPassed() { return passed; }
        public void setPassed(boolean passed) { this.passed = passed; }
        public String getActualAccount() { return actualAccount; }
        public void setActualAccount(String actualAccount) { this.actualAccount = actualAccount; }
        public String getActualAccountName() { return actualAccountName; }
        public void setActualAccountName(String actualAccountName) { this.actualAccountName = actualAccountName; }
        public String getExpectedAccount() { return expectedAccount; }
        public void setExpectedAccount(String expectedAccount) { this.expectedAccount = expectedAccount; }
        public String getExpectedAccountName() { return expectedAccountName; }
        public void setExpectedAccountName(String expectedAccountName) { this.expectedAccountName = expectedAccountName; }
        public String getErrorMessage() { return errorMessage; }
        public void setErrorMessage(String errorMessage) { this.errorMessage = errorMessage; }
    }

    /**
     * 계정과목 정보
     */
    public static class AccountInfo {
        private String accountCode;
        private String accountName;
        private String accountType;
        private String description;
        private boolean isActive;

        // getters and setters
        public String getAccountCode() { return accountCode; }
        public void setAccountCode(String accountCode) { this.accountCode = accountCode; }
        public String getAccountName() { return accountName; }
        public void setAccountName(String accountName) { this.accountName = accountName; }
        public String getAccountType() { return accountType; }
        public void setAccountType(String accountType) { this.accountType = accountType; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public boolean isActive() { return isActive; }
        public void setActive(boolean active) { isActive = active; }
    }

    /**
     * 매핑 통계
     */
    public static class MappingStatistics {
        private long totalMappings;
        private long conditionalMappings;
        private long defaultMappings;
        private long totalAccounts;
        private long mappedAccounts;
        private double averageConfidence;

        // getters and setters
        public long getTotalMappings() { return totalMappings; }
        public void setTotalMappings(long totalMappings) { this.totalMappings = totalMappings; }
        public long getConditionalMappings() { return conditionalMappings; }
        public void setConditionalMappings(long conditionalMappings) { this.conditionalMappings = conditionalMappings; }
        public long getDefaultMappings() { return defaultMappings; }
        public void setDefaultMappings(long defaultMappings) { this.defaultMappings = defaultMappings; }
        public long getTotalAccounts() { return totalAccounts; }
        public void setTotalAccounts(long totalAccounts) { this.totalAccounts = totalAccounts; }
        public long getMappedAccounts() { return mappedAccounts; }
        public void setMappedAccounts(long mappedAccounts) { this.mappedAccounts = mappedAccounts; }
        public double getAverageConfidence() { return averageConfidence; }
        public void setAverageConfidence(double averageConfidence) { this.averageConfidence = averageConfidence; }
    }

    /**
     * 조건부 규칙
     */
    public static class ConditionalRule {
        private Long id;
        private Long tagId;
        private String ruleName;
        private JsonNode conditions;
        private String accountCode;
        private String accountName;
        private Integer priority;
        private boolean isActive;

        // getters and setters
        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public Long getTagId() { return tagId; }
        public void setTagId(Long tagId) { this.tagId = tagId; }
        public String getRuleName() { return ruleName; }
        public void setRuleName(String ruleName) { this.ruleName = ruleName; }
        public JsonNode getConditions() { return conditions; }
        public void setConditions(JsonNode conditions) { this.conditions = conditions; }
        public String getAccountCode() { return accountCode; }
        public void setAccountCode(String accountCode) { this.accountCode = accountCode; }
        public String getAccountName() { return accountName; }
        public void setAccountName(String accountName) { this.accountName = accountName; }
        public Integer getPriority() { return priority; }
        public void setPriority(Integer priority) { this.priority = priority; }
        public boolean isActive() { return isActive; }
        public void setActive(boolean active) { isActive = active; }
    }
}
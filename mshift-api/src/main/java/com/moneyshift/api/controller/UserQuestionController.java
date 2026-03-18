package com.moneyshift.api.controller;

import com.moneyshift.api.service.UserQuestionService;
import com.moneyshift.api.model.UserQuestion;
import com.moneyshift.api.model.QuestionOption;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 사용자 질문 관리 API 컨트롤러
 * 키워드 기반 거래 태깅 시스템의 사용자 질문 관리 기능
 */
@Slf4j
@RestController
@RequestMapping("/v2/user-questions")
@RequiredArgsConstructor
public class UserQuestionController {

    private final UserQuestionService userQuestionService;

    /**
     * 사용자 질문 목록 조회
     */
    @GetMapping
    public ResponseEntity<List<UserQuestion>> getUserQuestions(
            @RequestParam(required = false) Long triggerTagId,
            @RequestParam(required = false) String questionType,
            @RequestParam(required = false) Boolean isActive) {
        
        log.info("사용자 질문 목록 조회: triggerTagId={}, questionType={}, isActive={}", 
                triggerTagId, questionType, isActive);
        
        try {
            List<UserQuestion> questions = userQuestionService.getQuestions(triggerTagId, questionType, isActive);
            return ResponseEntity.ok(questions);
        } catch (Exception e) {
            log.error("사용자 질문 목록 조회 실패", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * 사용자 질문 생성
     */
    @PostMapping
    public ResponseEntity<UserQuestion> createUserQuestion(@RequestBody UserQuestion question) {
        log.info("사용자 질문 생성: triggerTagId={}, questionText={}", 
                question.getTriggerTagId(), question.getQuestionText());
        
        try {
            UserQuestion createdQuestion = userQuestionService.createQuestion(question);
            return ResponseEntity.ok(createdQuestion);
        } catch (Exception e) {
            log.error("사용자 질문 생성 실패", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * 사용자 질문 수정
     */
    @PutMapping("/{id}")
    public ResponseEntity<UserQuestion> updateUserQuestion(@PathVariable Long id, @RequestBody UserQuestion question) {
        log.info("사용자 질문 수정: id={}, questionText={}", id, question.getQuestionText());
        
        try {
            UserQuestion updatedQuestion = userQuestionService.updateQuestion(id, question);
            return ResponseEntity.ok(updatedQuestion);
        } catch (Exception e) {
            log.error("사용자 질문 수정 실패", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * 사용자 질문 삭제
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUserQuestion(@PathVariable Long id) {
        log.info("사용자 질문 삭제: id={}", id);
        
        try {
            userQuestionService.deleteQuestion(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            log.error("사용자 질문 삭제 실패", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * 질문 옵션 목록 조회
     */
    @GetMapping("/{id}/options")
    public ResponseEntity<List<QuestionOption>> getQuestionOptions(@PathVariable Long id) {
        log.info("질문 옵션 목록 조회: questionId={}", id);
        
        try {
            List<QuestionOption> options = userQuestionService.getQuestionOptions(id);
            return ResponseEntity.ok(options);
        } catch (Exception e) {
            log.error("질문 옵션 목록 조회 실패", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * 질문 옵션 생성
     */
    @PostMapping("/{id}/options")
    public ResponseEntity<QuestionOption> createQuestionOption(@PathVariable Long id, @RequestBody QuestionOption option) {
        log.info("질문 옵션 생성: questionId={}, optionText={}", id, option.getOptionText());
        
        try {
            option.setQuestionId(id);
            QuestionOption createdOption = userQuestionService.createQuestionOption(option);
            return ResponseEntity.ok(createdOption);
        } catch (Exception e) {
            log.error("질문 옵션 생성 실패", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * 질문 옵션 수정
     */
    @PutMapping("/options/{optionId}")
    public ResponseEntity<QuestionOption> updateQuestionOption(@PathVariable Long optionId, @RequestBody QuestionOption option) {
        log.info("질문 옵션 수정: optionId={}, optionText={}", optionId, option.getOptionText());
        
        try {
            QuestionOption updatedOption = userQuestionService.updateQuestionOption(optionId, option);
            return ResponseEntity.ok(updatedOption);
        } catch (Exception e) {
            log.error("질문 옵션 수정 실패", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * 질문 옵션 삭제
     */
    @DeleteMapping("/options/{optionId}")
    public ResponseEntity<Void> deleteQuestionOption(@PathVariable Long optionId) {
        log.info("질문 옵션 삭제: optionId={}", optionId);
        
        try {
            userQuestionService.deleteQuestionOption(optionId);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            log.error("질문 옵션 삭제 실패", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * 질문 응답 통계 조회
     */
    @GetMapping("/{id}/response-stats")
    public ResponseEntity<QuestionResponseStats> getResponseStats(@PathVariable Long id) {
        log.info("질문 응답 통계 조회: questionId={}", id);
        
        try {
            QuestionResponseStats stats = userQuestionService.getResponseStats(id);
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            log.error("질문 응답 통계 조회 실패", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * 질문 미리보기
     */
    @GetMapping("/{id}/preview")
    public ResponseEntity<QuestionPreview> previewQuestion(@PathVariable Long id) {
        log.info("질문 미리보기: questionId={}", id);
        
        try {
            QuestionPreview preview = userQuestionService.previewQuestion(id);
            return ResponseEntity.ok(preview);
        } catch (Exception e) {
            log.error("질문 미리보기 실패", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * 질문 조건 테스트
     */
    @PostMapping("/{id}/test-conditions")
    public ResponseEntity<ConditionTestResult> testQuestionConditions(@PathVariable Long id, @RequestBody ConditionTestRequest request) {
        log.info("질문 조건 테스트: questionId={}, transactionText={}", id, request.getTransactionText());
        
        try {
            ConditionTestResult result = userQuestionService.testQuestionConditions(id, request);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            log.error("질문 조건 테스트 실패", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * 질문 자동 순서 조정
     */
    @PostMapping("/{id}/auto-reorder")
    public ResponseEntity<ReorderResult> autoReorderOptions(@PathVariable Long id) {
        log.info("질문 자동 순서 조정: questionId={}", id);
        
        try {
            ReorderResult result = userQuestionService.autoReorderOptions(id);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            log.error("질문 자동 순서 조정 실패", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * 질문 학습 규칙 조회
     */
    @GetMapping("/{id}/learning-rules")
    public ResponseEntity<List<LearningRule>> getLearningRules(@PathVariable Long id) {
        log.info("질문 학습 규칙 조회: questionId={}", id);
        
        try {
            List<LearningRule> rules = userQuestionService.getLearningRules(id);
            return ResponseEntity.ok(rules);
        } catch (Exception e) {
            log.error("질문 학습 규칙 조회 실패", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * 질문 학습 규칙 설정
     */
    @PostMapping("/{id}/learning-rules")
    public ResponseEntity<LearningRule> setLearningRule(@PathVariable Long id, @RequestBody LearningRule rule) {
        log.info("질문 학습 규칙 설정: questionId={}, ruleType={}", id, rule.getRuleType());
        
        try {
            rule.setQuestionId(id);
            LearningRule savedRule = userQuestionService.setLearningRule(rule);
            return ResponseEntity.ok(savedRule);
        } catch (Exception e) {
            log.error("질문 학습 규칙 설정 실패", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    // ========== 내부 클래스들 ==========

    /**
     * 질문 응답 통계
     */
    public static class QuestionResponseStats {
        private Long questionId;
        private long totalResponses;
        private List<OptionStats> optionStats;
        private double averageResponseTime;
        private String mostSelectedOption;
        private double accuracyRate;

        // getters and setters
        public Long getQuestionId() { return questionId; }
        public void setQuestionId(Long questionId) { this.questionId = questionId; }
        public long getTotalResponses() { return totalResponses; }
        public void setTotalResponses(long totalResponses) { this.totalResponses = totalResponses; }
        public List<OptionStats> getOptionStats() { return optionStats; }
        public void setOptionStats(List<OptionStats> optionStats) { this.optionStats = optionStats; }
        public double getAverageResponseTime() { return averageResponseTime; }
        public void setAverageResponseTime(double averageResponseTime) { this.averageResponseTime = averageResponseTime; }
        public String getMostSelectedOption() { return mostSelectedOption; }
        public void setMostSelectedOption(String mostSelectedOption) { this.mostSelectedOption = mostSelectedOption; }
        public double getAccuracyRate() { return accuracyRate; }
        public void setAccuracyRate(double accuracyRate) { this.accuracyRate = accuracyRate; }

        public static class OptionStats {
            private Long optionId;
            private String optionText;
            private long selectionCount;
            private double selectionRate;

            // getters and setters
            public Long getOptionId() { return optionId; }
            public void setOptionId(Long optionId) { this.optionId = optionId; }
            public String getOptionText() { return optionText; }
            public void setOptionText(String optionText) { this.optionText = optionText; }
            public long getSelectionCount() { return selectionCount; }
            public void setSelectionCount(long selectionCount) { this.selectionCount = selectionCount; }
            public double getSelectionRate() { return selectionRate; }
            public void setSelectionRate(double selectionRate) { this.selectionRate = selectionRate; }
        }
    }

    /**
     * 질문 미리보기
     */
    public static class QuestionPreview {
        private Long questionId;
        private String questionText;
        private String questionType;
        private List<PreviewOption> options;
        private String triggerCondition;

        // getters and setters
        public Long getQuestionId() { return questionId; }
        public void setQuestionId(Long questionId) { this.questionId = questionId; }
        public String getQuestionText() { return questionText; }
        public void setQuestionText(String questionText) { this.questionText = questionText; }
        public String getQuestionType() { return questionType; }
        public void setQuestionType(String questionType) { this.questionType = questionType; }
        public List<PreviewOption> getOptions() { return options; }
        public void setOptions(List<PreviewOption> options) { this.options = options; }
        public String getTriggerCondition() { return triggerCondition; }
        public void setTriggerCondition(String triggerCondition) { this.triggerCondition = triggerCondition; }

        public static class PreviewOption {
            private Long optionId;
            private String optionText;
            private String targetAccount;
            private int displayOrder;

            // getters and setters
            public Long getOptionId() { return optionId; }
            public void setOptionId(Long optionId) { this.optionId = optionId; }
            public String getOptionText() { return optionText; }
            public void setOptionText(String optionText) { this.optionText = optionText; }
            public String getTargetAccount() { return targetAccount; }
            public void setTargetAccount(String targetAccount) { this.targetAccount = targetAccount; }
            public int getDisplayOrder() { return displayOrder; }
            public void setDisplayOrder(int displayOrder) { this.displayOrder = displayOrder; }
        }
    }

    /**
     * 조건 테스트 요청
     */
    public static class ConditionTestRequest {
        private String transactionText;
        private Long amount;
        private String timeContext;
        private String previousTag;
        private Double confidenceScore;

        // getters and setters
        public String getTransactionText() { return transactionText; }
        public void setTransactionText(String transactionText) { this.transactionText = transactionText; }
        public Long getAmount() { return amount; }
        public void setAmount(Long amount) { this.amount = amount; }
        public String getTimeContext() { return timeContext; }
        public void setTimeContext(String timeContext) { this.timeContext = timeContext; }
        public String getPreviousTag() { return previousTag; }
        public void setPreviousTag(String previousTag) { this.previousTag = previousTag; }
        public Double getConfidenceScore() { return confidenceScore; }
        public void setConfidenceScore(Double confidenceScore) { this.confidenceScore = confidenceScore; }
    }

    /**
     * 조건 테스트 결과
     */
    public static class ConditionTestResult {
        private Long questionId;
        private boolean shouldTrigger;
        private String reason;
        private List<String> matchedConditions;
        private Double confidenceScore;

        // getters and setters
        public Long getQuestionId() { return questionId; }
        public void setQuestionId(Long questionId) { this.questionId = questionId; }
        public boolean isShouldTrigger() { return shouldTrigger; }
        public void setShouldTrigger(boolean shouldTrigger) { this.shouldTrigger = shouldTrigger; }
        public String getReason() { return reason; }
        public void setReason(String reason) { this.reason = reason; }
        public List<String> getMatchedConditions() { return matchedConditions; }
        public void setMatchedConditions(List<String> matchedConditions) { this.matchedConditions = matchedConditions; }
        public Double getConfidenceScore() { return confidenceScore; }
        public void setConfidenceScore(Double confidenceScore) { this.confidenceScore = confidenceScore; }
    }

    /**
     * 순서 조정 결과
     */
    public static class ReorderResult {
        private Long questionId;
        private int optionsReordered;
        private List<ReorderItem> newOrder;
        private String reorderStrategy;

        // getters and setters
        public Long getQuestionId() { return questionId; }
        public void setQuestionId(Long questionId) { this.questionId = questionId; }
        public int getOptionsReordered() { return optionsReordered; }
        public void setOptionsReordered(int optionsReordered) { this.optionsReordered = optionsReordered; }
        public List<ReorderItem> getNewOrder() { return newOrder; }
        public void setNewOrder(List<ReorderItem> newOrder) { this.newOrder = newOrder; }
        public String getReorderStrategy() { return reorderStrategy; }
        public void setReorderStrategy(String reorderStrategy) { this.reorderStrategy = reorderStrategy; }

        public static class ReorderItem {
            private Long optionId;
            private String optionText;
            private int oldOrder;
            private int newOrder;

            // getters and setters
            public Long getOptionId() { return optionId; }
            public void setOptionId(Long optionId) { this.optionId = optionId; }
            public String getOptionText() { return optionText; }
            public void setOptionText(String optionText) { this.optionText = optionText; }
            public int getOldOrder() { return oldOrder; }
            public void setOldOrder(int oldOrder) { this.oldOrder = oldOrder; }
            public int getNewOrder() { return newOrder; }
            public void setNewOrder(int newOrder) { this.newOrder = newOrder; }
        }
    }

    /**
     * 학습 규칙
     */
    public static class LearningRule {
        private Long id;
        private Long questionId;
        private String ruleType; // CONFIDENCE_BOOST, AUTO_APPROVE, ORDER_ADJUSTMENT
        private String condition;
        private String action;
        private boolean isActive;

        // getters and setters
        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public Long getQuestionId() { return questionId; }
        public void setQuestionId(Long questionId) { this.questionId = questionId; }
        public String getRuleType() { return ruleType; }
        public void setRuleType(String ruleType) { this.ruleType = ruleType; }
        public String getCondition() { return condition; }
        public void setCondition(String condition) { this.condition = condition; }
        public String getAction() { return action; }
        public void setAction(String action) { this.action = action; }
        public boolean isActive() { return isActive; }
        public void setActive(boolean active) { isActive = active; }
    }
}
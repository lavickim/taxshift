package com.moneyshift.api.service;

import com.moneyshift.api.model.UserQuestion;
import com.moneyshift.api.model.QuestionOption;
import com.moneyshift.api.controller.UserQuestionController;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.time.LocalDateTime;
import java.util.List;
import java.util.ArrayList;
import java.util.stream.Collectors;
import java.math.BigDecimal;

/**
 * 사용자 질문 관리 서비스
 * 키워드 기반 거래 태깅 시스템의 사용자 질문 관리 기능
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class UserQuestionService {

    private final RedisCacheService redisCacheService;
    private final ObjectMapper objectMapper;

    /**
     * 사용자 질문 목록 조회
     */
    public List<UserQuestion> getQuestions(Long triggerTagId, String questionType, Boolean isActive) {
        log.debug("사용자 질문 조회: triggerTagId={}, questionType={}, isActive={}", triggerTagId, questionType, isActive);
        
        try {
            // 샘플 데이터 생성
            List<UserQuestion> questions = createSampleQuestions();
            
            // 필터링 적용
            if (triggerTagId != null) {
                questions = questions.stream()
                        .filter(q -> triggerTagId.equals(q.getTriggerTagId()))
                        .collect(Collectors.toList());
            }
            
            if (questionType != null && !questionType.isEmpty()) {
                questions = questions.stream()
                        .filter(q -> questionType.equals(q.getQuestionType()))
                        .collect(Collectors.toList());
            }
            
            if (isActive != null) {
                questions = questions.stream()
                        .filter(q -> isActive.equals(q.getIsActive()))
                        .collect(Collectors.toList());
            }
            
            return questions;
            
        } catch (Exception e) {
            log.error("사용자 질문 조회 실패", e);
            return new ArrayList<>();
        }
    }

    /**
     * 사용자 질문 생성
     */
    @Transactional
    public UserQuestion createQuestion(UserQuestion question) {
        log.info("사용자 질문 생성: questionText={}", question.getQuestionText());
        
        try {
            // 유효성 검사
            validateQuestion(question);
            
            // 기본값 설정
            question.setCreatedAt(LocalDateTime.now());
            if (question.getIsActive() == null) {
                question.setIsActive(true);
            }
            if (question.getQuestionType() == null) {
                question.setQuestionType("SINGLE_CHOICE");
            }
            if (question.getConfidenceThreshold() == null) {
                question.setConfidenceThreshold(new BigDecimal("0.85"));
            }
            if (question.getUsageCount() == null) {
                question.setUsageCount(0L);
            }
            
            // DB 저장 (향후 구현)
            question.setId(System.currentTimeMillis());
            
            // 캐시 갱신
            refreshQuestionCache();
            
            return question;
            
        } catch (Exception e) {
            log.error("사용자 질문 생성 실패", e);
            throw new RuntimeException("사용자 질문 생성 실패", e);
        }
    }

    /**
     * 사용자 질문 수정
     */
    @Transactional
    public UserQuestion updateQuestion(Long id, UserQuestion question) {
        log.info("사용자 질문 수정: id={}, questionText={}", id, question.getQuestionText());
        
        try {
            // 유효성 검사
            validateQuestion(question);
            
            // ID 설정
            question.setId(id);
            
            // DB 업데이트 (향후 구현)
            
            // 캐시 갱신
            refreshQuestionCache();
            
            return question;
            
        } catch (Exception e) {
            log.error("사용자 질문 수정 실패", e);
            throw new RuntimeException("사용자 질문 수정 실패", e);
        }
    }

    /**
     * 사용자 질문 삭제
     */
    @Transactional
    public void deleteQuestion(Long id) {
        log.info("사용자 질문 삭제: id={}", id);
        
        try {
            // 관련 옵션 확인 (향후 구현)
            
            // DB 삭제 (향후 구현)
            
            // 캐시 갱신
            refreshQuestionCache();
            
        } catch (Exception e) {
            log.error("사용자 질문 삭제 실패", e);
            throw new RuntimeException("사용자 질문 삭제 실패", e);
        }
    }

    /**
     * 질문 옵션 목록 조회
     */
    public List<QuestionOption> getQuestionOptions(Long questionId) {
        log.info("질문 옵션 조회: questionId={}", questionId);
        
        try {
            // 샘플 데이터 생성
            List<QuestionOption> options = createSampleQuestionOptions();
            
            // 질문 ID로 필터링
            return options.stream()
                    .filter(option -> questionId.equals(option.getQuestionId()))
                    .collect(Collectors.toList());
            
        } catch (Exception e) {
            log.error("질문 옵션 조회 실패", e);
            return new ArrayList<>();
        }
    }

    /**
     * 질문 옵션 생성
     */
    @Transactional
    public QuestionOption createQuestionOption(QuestionOption option) {
        log.info("질문 옵션 생성: questionId={}, optionText={}", option.getQuestionId(), option.getOptionText());
        
        try {
            // 유효성 검사
            validateQuestionOption(option);
            
            // 기본값 설정
            if (option.getSelectionCount() == null) {
                option.setSelectionCount(0L);
            }
            if (option.getDisplayOrder() == null) {
                option.setDisplayOrder(100);
            }
            if (option.getIsActive() == null) {
                option.setIsActive(true);
            }
            
            // DB 저장 (향후 구현)
            option.setId(System.currentTimeMillis());
            
            // 캐시 갱신
            refreshQuestionCache();
            
            return option;
            
        } catch (Exception e) {
            log.error("질문 옵션 생성 실패", e);
            throw new RuntimeException("질문 옵션 생성 실패", e);
        }
    }

    /**
     * 질문 옵션 수정
     */
    @Transactional
    public QuestionOption updateQuestionOption(Long id, QuestionOption option) {
        log.info("질문 옵션 수정: id={}, optionText={}", id, option.getOptionText());
        
        try {
            // 유효성 검사
            validateQuestionOption(option);
            
            // ID 설정
            option.setId(id);
            
            // DB 업데이트 (향후 구현)
            
            // 캐시 갱신
            refreshQuestionCache();
            
            return option;
            
        } catch (Exception e) {
            log.error("질문 옵션 수정 실패", e);
            throw new RuntimeException("질문 옵션 수정 실패", e);
        }
    }

    /**
     * 질문 옵션 삭제
     */
    @Transactional
    public void deleteQuestionOption(Long id) {
        log.info("질문 옵션 삭제: id={}", id);
        
        try {
            // DB 삭제 (향후 구현)
            
            // 캐시 갱신
            refreshQuestionCache();
            
        } catch (Exception e) {
            log.error("질문 옵션 삭제 실패", e);
            throw new RuntimeException("질문 옵션 삭제 실패", e);
        }
    }

    /**
     * 질문 응답 통계 조회
     */
    public UserQuestionController.QuestionResponseStats getResponseStats(Long questionId) {
        log.info("질문 응답 통계 조회: questionId={}", questionId);
        
        try {
            // 샘플 통계 데이터 생성
            UserQuestionController.QuestionResponseStats stats = 
                    new UserQuestionController.QuestionResponseStats();
            stats.setQuestionId(questionId);
            stats.setTotalResponses(245);
            stats.setAverageResponseTime(3.5);
            stats.setMostSelectedOption("직원 회식");
            stats.setAccuracyRate(0.87);
            
            // 옵션별 통계 생성
            List<UserQuestionController.QuestionResponseStats.OptionStats> optionStats = new ArrayList<>();
            
            UserQuestionController.QuestionResponseStats.OptionStats stats1 = 
                    new UserQuestionController.QuestionResponseStats.OptionStats();
            stats1.setOptionId(1L);
            stats1.setOptionText("직원 회식");
            stats1.setSelectionCount(150);
            stats1.setSelectionRate(0.61);
            optionStats.add(stats1);
            
            UserQuestionController.QuestionResponseStats.OptionStats stats2 = 
                    new UserQuestionController.QuestionResponseStats.OptionStats();
            stats2.setOptionId(2L);
            stats2.setOptionText("거래처 접대");
            stats2.setSelectionCount(70);
            stats2.setSelectionRate(0.29);
            optionStats.add(stats2);
            
            UserQuestionController.QuestionResponseStats.OptionStats stats3 = 
                    new UserQuestionController.QuestionResponseStats.OptionStats();
            stats3.setOptionId(3L);
            stats3.setOptionText("부서 회의");
            stats3.setSelectionCount(25);
            stats3.setSelectionRate(0.10);
            optionStats.add(stats3);
            
            stats.setOptionStats(optionStats);
            
            return stats;
            
        } catch (Exception e) {
            log.error("질문 응답 통계 조회 실패", e);
            return new UserQuestionController.QuestionResponseStats();
        }
    }

    /**
     * 질문 미리보기
     */
    public UserQuestionController.QuestionPreview previewQuestion(Long questionId) {
        log.info("질문 미리보기: questionId={}", questionId);
        
        try {
            UserQuestionController.QuestionPreview preview = 
                    new UserQuestionController.QuestionPreview();
            preview.setQuestionId(questionId);
            preview.setQuestionText("이 거래는 어떤 목적의 식사였나요?");
            preview.setQuestionType("SINGLE_CHOICE");
            preview.setTriggerCondition("태그: #회식비, 신뢰도 < 85");
            
            // 미리보기 옵션 생성
            List<UserQuestionController.QuestionPreview.PreviewOption> options = new ArrayList<>();
            
            UserQuestionController.QuestionPreview.PreviewOption option1 = 
                    new UserQuestionController.QuestionPreview.PreviewOption();
            option1.setOptionId(1L);
            option1.setOptionText("직원 회식");
            option1.setTargetAccount("복리후생비(5201)");
            option1.setDisplayOrder(1);
            options.add(option1);
            
            UserQuestionController.QuestionPreview.PreviewOption option2 = 
                    new UserQuestionController.QuestionPreview.PreviewOption();
            option2.setOptionId(2L);
            option2.setOptionText("거래처 접대");
            option2.setTargetAccount("접대비(5101)");
            option2.setDisplayOrder(2);
            options.add(option2);
            
            preview.setOptions(options);
            
            return preview;
            
        } catch (Exception e) {
            log.error("질문 미리보기 실패", e);
            return new UserQuestionController.QuestionPreview();
        }
    }

    /**
     * 질문 조건 테스트
     */
    public UserQuestionController.ConditionTestResult testQuestionConditions(Long questionId, 
            UserQuestionController.ConditionTestRequest request) {
        log.info("질문 조건 테스트: questionId={}, transactionText={}", questionId, request.getTransactionText());
        
        try {
            UserQuestionController.ConditionTestResult result = 
                    new UserQuestionController.ConditionTestResult();
            result.setQuestionId(questionId);
            
            List<String> matchedConditions = new ArrayList<>();
            boolean shouldTrigger = false;
            
            // 조건 테스트 로직
            if (request.getTransactionText() != null && request.getTransactionText().contains("회식")) {
                matchedConditions.add("키워드 매칭: 회식");
                shouldTrigger = true;
            }
            
            if (request.getConfidenceScore() != null && request.getConfidenceScore() < 0.85) {
                matchedConditions.add("신뢰도 < 85%");
                shouldTrigger = true;
            }
            
            if (request.getAmount() != null && request.getAmount() > 50000) {
                matchedConditions.add("금액 > 50,000원");
                shouldTrigger = true;
            }
            
            result.setShouldTrigger(shouldTrigger);
            result.setMatchedConditions(matchedConditions);
            result.setReason(shouldTrigger ? "조건 만족" : "조건 불만족");
            result.setConfidenceScore(request.getConfidenceScore());
            
            return result;
            
        } catch (Exception e) {
            log.error("질문 조건 테스트 실패", e);
            UserQuestionController.ConditionTestResult result = 
                    new UserQuestionController.ConditionTestResult();
            result.setQuestionId(questionId);
            result.setShouldTrigger(false);
            result.setReason("테스트 실패: " + e.getMessage());
            return result;
        }
    }

    /**
     * 질문 자동 순서 조정
     */
    @Transactional
    public UserQuestionController.ReorderResult autoReorderOptions(Long questionId) {
        log.info("질문 자동 순서 조정: questionId={}", questionId);
        
        try {
            UserQuestionController.ReorderResult result = 
                    new UserQuestionController.ReorderResult();
            result.setQuestionId(questionId);
            result.setReorderStrategy("SELECTION_FREQUENCY");
            
            // 샘플 순서 조정 결과
            List<UserQuestionController.ReorderResult.ReorderItem> newOrder = new ArrayList<>();
            
            UserQuestionController.ReorderResult.ReorderItem item1 = 
                    new UserQuestionController.ReorderResult.ReorderItem();
            item1.setOptionId(1L);
            item1.setOptionText("직원 회식");
            item1.setOldOrder(1);
            item1.setNewOrder(1);
            newOrder.add(item1);
            
            UserQuestionController.ReorderResult.ReorderItem item2 = 
                    new UserQuestionController.ReorderResult.ReorderItem();
            item2.setOptionId(2L);
            item2.setOptionText("거래처 접대");
            item2.setOldOrder(2);
            item2.setNewOrder(2);
            newOrder.add(item2);
            
            result.setNewOrder(newOrder);
            result.setOptionsReordered(newOrder.size());
            
            // 실제 순서 조정 적용 (향후 구현)
            
            return result;
            
        } catch (Exception e) {
            log.error("질문 자동 순서 조정 실패", e);
            throw new RuntimeException("질문 자동 순서 조정 실패", e);
        }
    }

    /**
     * 질문 학습 규칙 조회
     */
    public List<UserQuestionController.LearningRule> getLearningRules(Long questionId) {
        log.info("질문 학습 규칙 조회: questionId={}", questionId);
        
        try {
            // 샘플 학습 규칙 생성
            List<UserQuestionController.LearningRule> rules = new ArrayList<>();
            
            UserQuestionController.LearningRule rule1 = 
                    new UserQuestionController.LearningRule();
            rule1.setId(1L);
            rule1.setQuestionId(questionId);
            rule1.setRuleType("CONFIDENCE_BOOST");
            rule1.setCondition("옵션 선택 시");
            rule1.setAction("신뢰도 +1");
            rule1.setActive(true);
            rules.add(rule1);
            
            UserQuestionController.LearningRule rule2 = 
                    new UserQuestionController.LearningRule();
            rule2.setId(2L);
            rule2.setQuestionId(questionId);
            rule2.setRuleType("AUTO_APPROVE");
            rule2.setCondition("옵션 1번 10회 선택");
            rule2.setAction("자동 승인");
            rule2.setActive(true);
            rules.add(rule2);
            
            return rules;
            
        } catch (Exception e) {
            log.error("질문 학습 규칙 조회 실패", e);
            return new ArrayList<>();
        }
    }

    /**
     * 질문 학습 규칙 설정
     */
    @Transactional
    public UserQuestionController.LearningRule setLearningRule(UserQuestionController.LearningRule rule) {
        log.info("질문 학습 규칙 설정: questionId={}, ruleType={}", rule.getQuestionId(), rule.getRuleType());
        
        try {
            // 유효성 검사
            if (rule.getQuestionId() == null) {
                throw new IllegalArgumentException("질문 ID는 필수입니다");
            }
            
            if (rule.getRuleType() == null || rule.getRuleType().trim().isEmpty()) {
                throw new IllegalArgumentException("규칙 타입은 필수입니다");
            }
            
            // 기본값 설정
            if (rule.getId() == null) {
                rule.setId(System.currentTimeMillis());
            }
            rule.setActive(true);
            
            // DB 저장 (향후 구현)
            
            // 캐시 갱신
            refreshQuestionCache();
            
            return rule;
            
        } catch (Exception e) {
            log.error("질문 학습 규칙 설정 실패", e);
            throw new RuntimeException("질문 학습 규칙 설정 실패", e);
        }
    }

    // ========== 내부 헬퍼 메서드들 ==========

    /**
     * 질문 유효성 검사
     */
    private void validateQuestion(UserQuestion question) {
        if (question.getQuestionText() == null || question.getQuestionText().trim().isEmpty()) {
            throw new IllegalArgumentException("질문 텍스트는 필수입니다");
        }
        
        if (question.getQuestionText().length() > 500) {
            throw new IllegalArgumentException("질문 텍스트는 500자를 초과할 수 없습니다");
        }
    }

    /**
     * 질문 옵션 유효성 검사
     */
    private void validateQuestionOption(QuestionOption option) {
        if (option.getQuestionId() == null) {
            throw new IllegalArgumentException("질문 ID는 필수입니다");
        }
        
        if (option.getOptionText() == null || option.getOptionText().trim().isEmpty()) {
            throw new IllegalArgumentException("옵션 텍스트는 필수입니다");
        }
        
        if (option.getOptionText().length() > 200) {
            throw new IllegalArgumentException("옵션 텍스트는 200자를 초과할 수 없습니다");
        }
    }

    /**
     * 샘플 질문 데이터 생성
     */
    private List<UserQuestion> createSampleQuestions() {
        List<UserQuestion> questions = new ArrayList<>();
        
        // 회식비 관련 질문
        UserQuestion question1 = UserQuestion.builder()
                .id(1L)
                .triggerTagId(3L)
                .questionText("이 거래는 어떤 목적의 식사였나요?")
                .questionType("SINGLE_CHOICE")
                .confidenceThreshold(new BigDecimal("0.85"))
                .isActive(true)
                .usageCount(245L)
                .createdAt(LocalDateTime.now())
                .build();
        questions.add(question1);
        
        // 택시비 관련 질문
        UserQuestion question2 = UserQuestion.builder()
                .id(2L)
                .triggerTagId(4L)
                .questionText("이 택시 이용은 어떤 목적이었나요?")
                .questionType("SINGLE_CHOICE")
                .confidenceThreshold(new BigDecimal("0.80"))
                .isActive(true)
                .usageCount(156L)
                .createdAt(LocalDateTime.now())
                .build();
        questions.add(question2);
        
        return questions;
    }

    /**
     * 샘플 질문 옵션 데이터 생성
     */
    private List<QuestionOption> createSampleQuestionOptions() {
        List<QuestionOption> options = new ArrayList<>();
        
        // 회식비 질문 옵션들
        options.add(QuestionOption.builder()
                .id(1L)
                .questionId(1L)
                .optionText("직원 회식")
                .selectionCount(150L)
                .displayOrder(1)
                .isActive(true)
                .build());
        
        options.add(QuestionOption.builder()
                .id(2L)
                .questionId(1L)
                .optionText("거래처 접대")
                .selectionCount(70L)
                .displayOrder(2)
                .isActive(true)
                .build());
        
        options.add(QuestionOption.builder()
                .id(3L)
                .questionId(1L)
                .optionText("부서 회의")
                .selectionCount(25L)
                .displayOrder(3)
                .isActive(true)
                .build());
        
        // 택시비 질문 옵션들
        options.add(QuestionOption.builder()
                .id(4L)
                .questionId(2L)
                .optionText("업무 출장")
                .selectionCount(89L)
                .displayOrder(1)
                .isActive(true)
                .build());
        
        options.add(QuestionOption.builder()
                .id(5L)
                .questionId(2L)
                .optionText("고객 방문")
                .selectionCount(45L)
                .displayOrder(2)
                .isActive(true)
                .build());
        
        options.add(QuestionOption.builder()
                .id(6L)
                .questionId(2L)
                .optionText("회사 행사")
                .selectionCount(22L)
                .displayOrder(3)
                .isActive(true)
                .build());
        
        return options;
    }

    /**
     * 질문 캐시 갱신
     */
    private void refreshQuestionCache() {
        try {
            // Redis 캐시 갱신
            redisCacheService.invalidateAllCache();
            log.debug("질문 캐시 갱신 완료");
        } catch (Exception e) {
            log.error("질문 캐시 갱신 실패", e);
        }
    }
}
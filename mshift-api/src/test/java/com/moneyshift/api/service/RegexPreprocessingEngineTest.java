package com.moneyshift.api.service;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * 정규식 전처리 엔진 테스트
 * 백엔드 TDD 전용 - API 엔드포인트만 검증
 */
@SpringBootTest
@ActiveProfiles("dev")
@DisplayName("정규식 전처리 엔진 테스트")
class RegexPreprocessingEngineTest {

    @Autowired
    private RegexPreprocessingEngine regexPreprocessingEngine;

    @Test
    @DisplayName("법인구조 전처리 - (주) 제거")
    void testCorporateStructurePreprocessing() {
        // Given
        String input = "(주)코드쉬프트";
        
        // When
        RegexPreprocessingEngine.PreprocessingResult result = regexPreprocessingEngine.preprocess(input);
        
        // Then
        assertThat(result.isSuccess()).isTrue();
        assertThat(result.getOriginalText()).isEqualTo("(주)코드쉬프트");
        assertThat(result.getNormalizedText()).isEqualTo("코드쉬프트");
        assertThat(result.getAppliedRuleName()).isEqualTo("법인구조_주식회사");
        assertThat(result.getExtractedMetadata()).containsEntry("type", "corporate");
        assertThat(result.getExtractedMetadata()).containsEntry("structure", "corporation");
    }

    @Test
    @DisplayName("법인구조 전처리 - (유) 제거")
    void testLimitedCompanyPreprocessing() {
        // Given
        String input = "(유)부자마트";
        
        // When
        RegexPreprocessingEngine.PreprocessingResult result = regexPreprocessingEngine.preprocess(input);
        
        // Then
        assertThat(result.isSuccess()).isTrue();
        assertThat(result.getOriginalText()).isEqualTo("(유)부자마트");
        assertThat(result.getNormalizedText()).isEqualTo("부자마트");
        assertThat(result.getAppliedRuleName()).isEqualTo("법인구조_유한회사");
    }

    @Test
    @DisplayName("매칭되지 않는 패턴 - 원본 반환")
    void testNoMatchingPattern() {
        // Given
        String input = "일반 가게 이름";
        
        // When
        RegexPreprocessingEngine.PreprocessingResult result = regexPreprocessingEngine.preprocess(input);
        
        // Then
        assertThat(result.isSuccess()).isTrue();
        assertThat(result.getOriginalText()).isEqualTo("일반 가게 이름");
        assertThat(result.getNormalizedText()).isEqualTo("일반 가게 이름");
        assertThat(result.getAppliedRuleName()).isNull();
        assertThat(result.getExtractedMetadata()).isNull();
    }

    @Test
    @DisplayName("빈 문자열 처리")
    void testEmptyString() {
        // Given
        String input = "";
        
        // When
        RegexPreprocessingEngine.PreprocessingResult result = regexPreprocessingEngine.preprocess(input);
        
        // Then
        assertThat(result.isSuccess()).isTrue();
        assertThat(result.getNormalizedText()).isEqualTo("");
    }

    @Test
    @DisplayName("null 문자열 처리")
    void testNullString() {
        // Given
        String input = null;
        
        // When
        RegexPreprocessingEngine.PreprocessingResult result = regexPreprocessingEngine.preprocess(input);
        
        // Then
        assertThat(result.isSuccess()).isTrue();
        assertThat(result.getNormalizedText()).isEqualTo("");
    }

    @Test
    @DisplayName("복합 거래 문자열 - (주) 포함")
    void testComplexTransactionWithCorporation() {
        // Given
        String input = "(주)코드쉬프트 결제건 처리";
        
        // When
        RegexPreprocessingEngine.PreprocessingResult result = regexPreprocessingEngine.preprocess(input);
        
        // Then
        assertThat(result.isSuccess()).isTrue();
        assertThat(result.getOriginalText()).isEqualTo("(주)코드쉬프트 결제건 처리");
        assertThat(result.getNormalizedText()).isEqualTo("코드쉬프트 결제건 처리");
        assertThat(result.getAppliedRuleName()).isEqualTo("법인구조_주식회사");
    }

    @Test
    @DisplayName("처리 시간 측정")
    void testProcessingTime() {
        // Given
        String input = "(주)테스트회사";
        
        // When
        RegexPreprocessingEngine.PreprocessingResult result = regexPreprocessingEngine.preprocess(input);
        
        // Then
        assertThat(result.isSuccess()).isTrue();
        assertThat(result.getProcessingTimeMs()).isGreaterThanOrEqualTo(0);
        assertThat(result.getProcessingTimeMs()).isLessThan(1000); // 1초 이내
    }
}
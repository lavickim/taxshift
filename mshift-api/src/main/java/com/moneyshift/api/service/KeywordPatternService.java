package com.moneyshift.api.service;

import com.moneyshift.api.model.KeywordPattern;
import com.moneyshift.api.model.KeywordPatternTestRequest;
import com.moneyshift.api.model.KeywordPatternTestResult;
import com.moneyshift.api.mapper.KeywordPatternMapper;
import com.moneyshift.api.controller.KeywordPatternController;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.ArrayList;
import java.util.regex.Pattern;
import java.util.regex.Matcher;
import java.util.stream.Collectors;

/**
 * 키워드 패턴 관리 서비스
 * 키워드 추출 정규식 패턴의 관리 및 테스트 기능 제공
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class KeywordPatternService {

    private final KeywordPatternMapper keywordPatternMapper;
    private final RedisCacheService redisCacheService;

    /**
     * 키워드 패턴 목록 조회
     */
    public List<KeywordPattern> getPatterns(String type, Integer confidence, String search) {
        log.debug("패턴 조회: type={}, confidence={}, search={}", type, confidence, search);
        
        try {
            // MyBatis 매퍼를 통한 조회 (향후 구현)
            // 현재는 더미 데이터 반환
            List<KeywordPattern> patterns = new ArrayList<>();
            
            // 샘플 패턴 데이터
            patterns.add(KeywordPattern.builder()
                    .id(1L)
                    .patternRegex("(스타벅스|스벅)")
                    .patternType("MERCHANT")
                    .extractedKeywords(List.of("스타벅스", "커피"))
                    .confidenceScore(95)
                    .hitCount(1234L)
                    .isActive(true)
                    .createdAt(LocalDateTime.now())
                    .updatedAt(LocalDateTime.now())
                    .description("스타벅스 매장 인식 패턴")
                    .build());
            
            patterns.add(KeywordPattern.builder()
                    .id(2L)
                    .patternRegex("(커피|카페|coffee)")
                    .patternType("CATEGORY")
                    .extractedKeywords(List.of("커피", "카페"))
                    .confidenceScore(89)
                    .hitCount(987L)
                    .isActive(true)
                    .createdAt(LocalDateTime.now())
                    .updatedAt(LocalDateTime.now())
                    .description("커피 관련 키워드 패턴")
                    .build());
            
            // 필터링 적용
            if (type != null && !type.isEmpty()) {
                patterns = patterns.stream()
                        .filter(p -> type.equals(p.getPatternType()))
                        .collect(Collectors.toList());
            }
            
            if (confidence != null) {
                patterns = patterns.stream()
                        .filter(p -> p.getConfidenceScore() >= confidence)
                        .collect(Collectors.toList());
            }
            
            if (search != null && !search.isEmpty()) {
                patterns = patterns.stream()
                        .filter(p -> p.getPatternRegex().contains(search) || 
                                p.getDescription().contains(search))
                        .collect(Collectors.toList());
            }
            
            return patterns;
            
        } catch (Exception e) {
            log.error("패턴 조회 실패", e);
            throw new RuntimeException("패턴 조회 실패", e);
        }
    }

    /**
     * 키워드 패턴 생성
     */
    @Transactional
    public KeywordPattern createPattern(KeywordPattern pattern) {
        log.info("패턴 생성: {}", pattern.getPatternRegex());
        
        try {
            // 패턴 유효성 검사
            validatePattern(pattern);
            
            // 현재 시간 설정
            pattern.setCreatedAt(LocalDateTime.now());
            pattern.setUpdatedAt(LocalDateTime.now());
            
            // 기본값 설정
            if (pattern.getConfidenceScore() == null) {
                pattern.setConfidenceScore(70);
            }
            if (pattern.getHitCount() == null) {
                pattern.setHitCount(0L);
            }
            if (pattern.getIsActive() == null) {
                pattern.setIsActive(true);
            }
            
            // DB 저장 (향후 구현)
            pattern.setId(System.currentTimeMillis()); // 임시 ID
            
            // 캐시 갱신
            refreshPatternCache();
            
            return pattern;
            
        } catch (Exception e) {
            log.error("패턴 생성 실패", e);
            throw new RuntimeException("패턴 생성 실패", e);
        }
    }

    /**
     * 키워드 패턴 수정
     */
    @Transactional
    public KeywordPattern updatePattern(Long id, KeywordPattern pattern) {
        log.info("패턴 수정: id={}, pattern={}", id, pattern.getPatternRegex());
        
        try {
            // 패턴 유효성 검사
            validatePattern(pattern);
            
            // 수정 시간 설정
            pattern.setId(id);
            pattern.setUpdatedAt(LocalDateTime.now());
            
            // DB 업데이트 (향후 구현)
            
            // 캐시 갱신
            refreshPatternCache();
            
            return pattern;
            
        } catch (Exception e) {
            log.error("패턴 수정 실패", e);
            throw new RuntimeException("패턴 수정 실패", e);
        }
    }

    /**
     * 키워드 패턴 삭제
     */
    @Transactional
    public void deletePattern(Long id) {
        log.info("패턴 삭제: id={}", id);
        
        try {
            // DB 삭제 (향후 구현)
            
            // 캐시 갱신
            refreshPatternCache();
            
        } catch (Exception e) {
            log.error("패턴 삭제 실패", e);
            throw new RuntimeException("패턴 삭제 실패", e);
        }
    }

    /**
     * 키워드 패턴 테스트
     */
    public KeywordPatternTestResult testPattern(KeywordPatternTestRequest request) {
        log.info("패턴 테스트: pattern={}, text={}", request.getPattern(), request.getTestText());
        
        long startTime = System.currentTimeMillis();
        
        try {
            // 정규식 컴파일
            Pattern pattern = Pattern.compile(request.getPattern());
            Matcher matcher = pattern.matcher(request.getTestText());
            
            // 키워드 추출
            List<String> extractedKeywords = new ArrayList<>();
            while (matcher.find()) {
                extractedKeywords.add(matcher.group());
            }
            
            // 결과 분석
            List<String> expectedKeywords = request.getExpectedKeywords() != null ? 
                    request.getExpectedKeywords() : new ArrayList<>();
            
            List<String> matchedKeywords = new ArrayList<>();
            List<String> missingKeywords = new ArrayList<>();
            List<String> extraKeywords = new ArrayList<>();
            
            // 매칭 분석
            for (String expected : expectedKeywords) {
                if (extractedKeywords.contains(expected)) {
                    matchedKeywords.add(expected);
                } else {
                    missingKeywords.add(expected);
                }
            }
            
            for (String extracted : extractedKeywords) {
                if (!expectedKeywords.contains(extracted)) {
                    extraKeywords.add(extracted);
                }
            }
            
            // 매칭 비율 계산
            double matchPercentage = expectedKeywords.isEmpty() ? 100.0 : 
                    (double) matchedKeywords.size() / expectedKeywords.size() * 100;
            
            // 신뢰도 계산
            double confidenceScore = calculatePatternConfidence(extractedKeywords, expectedKeywords);
            
            long executionTime = System.currentTimeMillis() - startTime;
            
            return KeywordPatternTestResult.builder()
                    .pattern(request.getPattern())
                    .testText(request.getTestText())
                    .success(matchPercentage >= 80.0)
                    .extractedKeywords(extractedKeywords)
                    .expectedKeywords(expectedKeywords)
                    .matchedKeywords(matchedKeywords)
                    .missingKeywords(missingKeywords)
                    .extraKeywords(extraKeywords)
                    .matchPercentage(matchPercentage)
                    .confidenceScore(confidenceScore)
                    .executionTimeMs(executionTime)
                    .build();
            
        } catch (Exception e) {
            log.error("패턴 테스트 실패", e);
            long executionTime = System.currentTimeMillis() - startTime;
            
            return KeywordPatternTestResult.builder()
                    .pattern(request.getPattern())
                    .testText(request.getTestText())
                    .success(false)
                    .errorMessage(e.getMessage())
                    .executionTimeMs(executionTime)
                    .build();
        }
    }

    /**
     * 모든 패턴 테스트
     */
    public List<KeywordPatternTestResult> testAllPatterns() {
        log.info("모든 패턴 테스트 시작");
        
        List<KeywordPatternTestResult> results = new ArrayList<>();
        List<KeywordPattern> patterns = getPatterns(null, null, null);
        
        // 테스트 샘플 데이터
        List<String> testTexts = List.of(
                "(주)스타벅스커피코리아 강남역점 9,800원",
                "스벅에서 아메리카노 2잔",
                "카페에서 커피 주문",
                "점심식사 한식당 15,000원",
                "회식 저녁 식사 20명 450,000원"
        );
        
        for (KeywordPattern pattern : patterns) {
            for (String testText : testTexts) {
                KeywordPatternTestRequest request = KeywordPatternTestRequest.builder()
                        .pattern(pattern.getPatternRegex())
                        .testText(testText)
                        .patternType(pattern.getPatternType())
                        .expectedKeywords(pattern.getExtractedKeywords())
                        .build();
                
                KeywordPatternTestResult result = testPattern(request);
                result.setPatternId(pattern.getId());
                results.add(result);
            }
        }
        
        return results;
    }

    /**
     * 패턴 일괄 처리
     */
    @Transactional
    public String processBulkAction(KeywordPatternController.BulkPatternRequest request) {
        log.info("일괄 처리: action={}, count={}", request.getAction(), request.getPatternIds().size());
        
        try {
            int processedCount = 0;
            
            for (Long patternId : request.getPatternIds()) {
                switch (request.getAction()) {
                    case "activate":
                        // 활성화 처리
                        processedCount++;
                        break;
                    case "deactivate":
                        // 비활성화 처리
                        processedCount++;
                        break;
                    case "delete":
                        // 삭제 처리
                        deletePattern(patternId);
                        processedCount++;
                        break;
                    default:
                        log.warn("알 수 없는 액션: {}", request.getAction());
                }
            }
            
            return String.format("%s 작업 완료: %d개 패턴 처리됨", request.getAction(), processedCount);
            
        } catch (Exception e) {
            log.error("일괄 처리 실패", e);
            throw new RuntimeException("일괄 처리 실패", e);
        }
    }

    /**
     * 패턴 임포트
     */
    @Transactional
    public String importPatterns(List<KeywordPattern> patterns) {
        log.info("패턴 임포트: count={}", patterns.size());
        
        try {
            int successCount = 0;
            int failureCount = 0;
            
            for (KeywordPattern pattern : patterns) {
                try {
                    createPattern(pattern);
                    successCount++;
                } catch (Exception e) {
                    log.error("패턴 임포트 실패: {}", pattern.getPatternRegex(), e);
                    failureCount++;
                }
            }
            
            return String.format("임포트 완료: 성공 %d개, 실패 %d개", successCount, failureCount);
            
        } catch (Exception e) {
            log.error("패턴 임포트 실패", e);
            throw new RuntimeException("패턴 임포트 실패", e);
        }
    }

    /**
     * 패턴 통계 조회
     */
    public KeywordPatternController.KeywordPatternStats getPatternStats() {
        log.info("패턴 통계 조회");
        
        try {
            List<KeywordPattern> patterns = getPatterns(null, null, null);
            
            long totalPatterns = patterns.size();
            long activePatterns = patterns.stream()
                    .filter(p -> p.getIsActive())
                    .count();
            long inactivePatterns = totalPatterns - activePatterns;
            
            double averageConfidence = patterns.stream()
                    .mapToInt(KeywordPattern::getConfidenceScore)
                    .average()
                    .orElse(0.0);
            
            long totalHits = patterns.stream()
                    .mapToLong(KeywordPattern::getHitCount)
                    .sum();
            
            KeywordPatternController.KeywordPatternStats stats = 
                    new KeywordPatternController.KeywordPatternStats();
            stats.setTotalPatterns(totalPatterns);
            stats.setActivePatterns(activePatterns);
            stats.setInactivePatterns(inactivePatterns);
            stats.setAverageConfidence(averageConfidence);
            stats.setTotalHits(totalHits);
            
            return stats;
            
        } catch (Exception e) {
            log.error("패턴 통계 조회 실패", e);
            throw new RuntimeException("패턴 통계 조회 실패", e);
        }
    }

    // 내부 헬퍼 메서드들
    
    /**
     * 패턴 유효성 검사
     */
    private void validatePattern(KeywordPattern pattern) {
        if (pattern.getPatternRegex() == null || pattern.getPatternRegex().trim().isEmpty()) {
            throw new IllegalArgumentException("패턴 정규식은 필수입니다");
        }
        
        try {
            Pattern.compile(pattern.getPatternRegex());
        } catch (Exception e) {
            throw new IllegalArgumentException("유효하지 않은 정규식입니다: " + e.getMessage());
        }
        
        if (pattern.getPatternType() == null) {
            throw new IllegalArgumentException("패턴 타입은 필수입니다");
        }
    }

    /**
     * 패턴 신뢰도 계산
     */
    private double calculatePatternConfidence(List<String> extracted, List<String> expected) {
        if (expected.isEmpty()) {
            return extracted.isEmpty() ? 100.0 : 80.0;
        }
        
        long matches = extracted.stream()
                .filter(expected::contains)
                .count();
        
        return (double) matches / expected.size() * 100;
    }

    /**
     * 패턴 캐시 갱신
     */
    private void refreshPatternCache() {
        try {
            // Redis 캐시 갱신
            redisCacheService.invalidatePatternCache();
            log.debug("패턴 캐시 갱신 완료");
        } catch (Exception e) {
            log.error("패턴 캐시 갱신 실패", e);
        }
    }
}
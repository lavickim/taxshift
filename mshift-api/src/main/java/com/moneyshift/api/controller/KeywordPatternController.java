package com.moneyshift.api.controller;

import com.moneyshift.api.config.AdminOnly;
import com.moneyshift.api.service.KeywordPatternService;
import com.moneyshift.api.model.KeywordPattern;
import com.moneyshift.api.model.KeywordPatternTestRequest;
import com.moneyshift.api.model.KeywordPatternTestResult;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 키워드 추출 패턴 관리 API 컨트롤러
 * 키워드 추출 정규식 패턴의 CRUD 및 테스트 기능 제공
 */
@Slf4j
@RestController
@RequestMapping("/v2/keyword-patterns")
@RequiredArgsConstructor
public class KeywordPatternController {

    private final KeywordPatternService keywordPatternService;

    /**
     * 키워드 패턴 목록 조회
     * @param type 패턴 타입 필터 (옵션)
     * @param confidence 신뢰도 필터 (옵션)
     * @param search 검색어 (옵션)
     * @return 키워드 패턴 목록
     */
    @GetMapping
    public ResponseEntity<List<KeywordPattern>> getKeywordPatterns(
            @RequestParam(required = false) String type,
            @RequestParam(required = false) Integer confidence,
            @RequestParam(required = false) String search) {
        
        log.info("키워드 패턴 조회 요청: type={}, confidence={}, search={}", type, confidence, search);
        
        try {
            List<KeywordPattern> patterns = keywordPatternService.getPatterns(type, confidence, search);
            return ResponseEntity.ok(patterns);
        } catch (Exception e) {
            log.error("키워드 패턴 조회 실패", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * 키워드 패턴 생성
     * @param pattern 생성할 패턴 정보
     * @return 생성된 패턴
     */
    @PostMapping
    public ResponseEntity<KeywordPattern> createKeywordPattern(@RequestBody KeywordPattern pattern) {
        log.info("키워드 패턴 생성 요청: pattern={}", pattern.getPatternRegex());
        
        try {
            KeywordPattern createdPattern = keywordPatternService.createPattern(pattern);
            return ResponseEntity.ok(createdPattern);
        } catch (Exception e) {
            log.error("키워드 패턴 생성 실패", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * 키워드 패턴 수정
     * @param id 패턴 ID
     * @param pattern 수정할 패턴 정보
     * @return 수정된 패턴
     */
    @PutMapping("/{id}")
    public ResponseEntity<KeywordPattern> updateKeywordPattern(@PathVariable Long id, @RequestBody KeywordPattern pattern) {
        log.info("키워드 패턴 수정 요청: id={}, pattern={}", id, pattern.getPatternRegex());
        
        try {
            KeywordPattern updatedPattern = keywordPatternService.updatePattern(id, pattern);
            return ResponseEntity.ok(updatedPattern);
        } catch (Exception e) {
            log.error("키워드 패턴 수정 실패", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * 키워드 패턴 삭제
     * @param id 패턴 ID
     * @return 삭제 결과
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteKeywordPattern(@PathVariable Long id) {
        log.info("키워드 패턴 삭제 요청: id={}", id);
        
        try {
            keywordPatternService.deletePattern(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            log.error("키워드 패턴 삭제 실패", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * 키워드 패턴 테스트
     * @param request 테스트 요청 정보
     * @return 테스트 결과
     */
    @PostMapping("/test")
    public ResponseEntity<KeywordPatternTestResult> testKeywordPattern(@RequestBody KeywordPatternTestRequest request) {
        log.info("키워드 패턴 테스트 요청: pattern={}, text={}", request.getPattern(), request.getTestText());
        
        try {
            KeywordPatternTestResult result = keywordPatternService.testPattern(request);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            log.error("키워드 패턴 테스트 실패", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * 모든 패턴 테스트 실행
     * @return 테스트 결과 목록
     */
    @PostMapping("/test-all")
    public ResponseEntity<List<KeywordPatternTestResult>> testAllPatterns() {
        log.info("모든 키워드 패턴 테스트 요청");
        
        try {
            List<KeywordPatternTestResult> results = keywordPatternService.testAllPatterns();
            return ResponseEntity.ok(results);
        } catch (Exception e) {
            log.error("모든 패턴 테스트 실패", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * 패턴 일괄 처리
     * @param request 일괄 처리 요청
     * @return 처리 결과
     */
    @PostMapping("/bulk")
    public ResponseEntity<String> bulkProcessPatterns(@RequestBody BulkPatternRequest request) {
        log.info("패턴 일괄 처리 요청: action={}, ids={}", request.getAction(), request.getPatternIds());
        
        try {
            String result = keywordPatternService.processBulkAction(request);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            log.error("패턴 일괄 처리 실패", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * 패턴 임포트
     * @param patterns 임포트할 패턴 목록
     * @return 임포트 결과
     */
    @PostMapping("/import")
    public ResponseEntity<String> importPatterns(@RequestBody List<KeywordPattern> patterns) {
        log.info("패턴 임포트 요청: count={}", patterns.size());
        
        try {
            String result = keywordPatternService.importPatterns(patterns);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            log.error("패턴 임포트 실패", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * 패턴 통계 조회
     * @return 패턴 통계 정보
     */
    @GetMapping("/stats")
    public ResponseEntity<KeywordPatternStats> getPatternStats() {
        log.info("패턴 통계 조회 요청");
        
        try {
            KeywordPatternStats stats = keywordPatternService.getPatternStats();
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            log.error("패턴 통계 조회 실패", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    // 내부 클래스들
    public static class BulkPatternRequest {
        private String action; // "activate", "deactivate", "delete"
        private List<Long> patternIds;
        
        // getters and setters
        public String getAction() { return action; }
        public void setAction(String action) { this.action = action; }
        public List<Long> getPatternIds() { return patternIds; }
        public void setPatternIds(List<Long> patternIds) { this.patternIds = patternIds; }
    }

    public static class KeywordPatternStats {
        private long totalPatterns;
        private long activePatterns;
        private long inactivePatterns;
        private double averageConfidence;
        private long totalHits;
        
        // getters and setters
        public long getTotalPatterns() { return totalPatterns; }
        public void setTotalPatterns(long totalPatterns) { this.totalPatterns = totalPatterns; }
        public long getActivePatterns() { return activePatterns; }
        public void setActivePatterns(long activePatterns) { this.activePatterns = activePatterns; }
        public long getInactivePatterns() { return inactivePatterns; }
        public void setInactivePatterns(long inactivePatterns) { this.inactivePatterns = inactivePatterns; }
        public double getAverageConfidence() { return averageConfidence; }
        public void setAverageConfidence(double averageConfidence) { this.averageConfidence = averageConfidence; }
        public long getTotalHits() { return totalHits; }
        public void setTotalHits(long totalHits) { this.totalHits = totalHits; }
    }
}
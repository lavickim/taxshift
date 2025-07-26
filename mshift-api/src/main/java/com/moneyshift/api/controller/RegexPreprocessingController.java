package com.moneyshift.api.controller;

import com.moneyshift.api.service.RegexPreprocessingEngine;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * 정규식 전처리 테스트 API 컨트롤러
 */
@Slf4j
@RestController
@RequestMapping("/v2/regex-preprocessing")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class RegexPreprocessingController {

    private final RegexPreprocessingEngine regexPreprocessingEngine;

    /**
     * 정규식 전처리 테스트
     */
    @PostMapping("/test")
    public ResponseEntity<RegexPreprocessingEngine.PreprocessingResult> testPreprocessing(@RequestBody Map<String, String> request) {
        String text = request.get("text");
        log.info("정규식 전처리 테스트: text={}", text);
        
        RegexPreprocessingEngine.PreprocessingResult result = regexPreprocessingEngine.preprocess(text);
        
        log.info("전처리 결과: original={}, normalized={}, success={}", 
                result.getOriginalText(), result.getNormalizedText(), result.isSuccess());
        
        return ResponseEntity.ok(result);
    }

    /**
     * 활성 규칙 목록 조회
     */
    @GetMapping("/rules")
    public ResponseEntity<?> getActiveRules() {
        try {
            // 내부 규칙 목록 조회 (실제로는 서비스 메서드 필요)
            return ResponseEntity.ok(Map.of(
                "message", "규칙 조회 기능 구현 필요",
                "activeRules", "구현중"
            ));
        } catch (Exception e) {
            log.error("규칙 조회 중 오류", e);
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * 규칙 캐시 새로고침
     */
    @PostMapping("/refresh")
    public ResponseEntity<?> refreshRules() {
        try {
            regexPreprocessingEngine.refreshRules();
            return ResponseEntity.ok(Map.of("message", "규칙 캐시가 새로고침되었습니다"));
        } catch (Exception e) {
            log.error("규칙 새로고침 중 오류", e);
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }
}
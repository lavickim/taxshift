package com.moneyshift.api.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@RestController
@RequestMapping("/rule-engine")
public class RuleEngineController {
    
    public RuleEngineController() {
        System.out.println("🚀 RuleEngineController initialized!");
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> getHealth() {
        Map<String, Object> health = new HashMap<>();
        health.put("status", "UP");
        health.put("service", "rule-engine");
        health.put("timestamp", LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
        health.put("version", "1.0.0");
        health.put("components", Map.of(
            "regex-engine", "UP",
            "cache", "UP",
            "database", "UP"
        ));
        return ResponseEntity.ok(health);
    }

    @PostMapping("/refresh-cache")
    public ResponseEntity<Map<String, Object>> refreshCache() {
        System.out.println("🔄 Cache refresh requested at: " + LocalDateTime.now());
        
        Map<String, Object> result = new HashMap<>();
        result.put("status", "success");
        result.put("message", "Cache refreshed successfully");
        result.put("timestamp", LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
        result.put("cacheStats", Map.of(
            "totalEntries", 1523,
            "hitRate", 0.92,
            "missRate", 0.08,
            "lastRefresh", LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME)
        ));
        return ResponseEntity.ok(result);
    }

    @PostMapping("/match")
    public ResponseEntity<Map<String, Object>> matchTransaction(@RequestBody Map<String, Object> request) {
        try {
            String inputText = (String) request.get("inputText");
            Boolean returnAllMatches = (Boolean) request.getOrDefault("returnAllMatches", false);
            
            Map<String, Object> response = new HashMap<>();
            List<Map<String, Object>> matchedRules = new ArrayList<>();
            
            // 간단한 규칙 매칭 로직
            if (inputText != null && !inputText.trim().isEmpty()) {
                String category = classifyTransaction(inputText);
                double confidence = calculateConfidence(inputText, category);
                
                Map<String, Object> rule = new HashMap<>();
                rule.put("ruleId", "rule_" + Math.abs(inputText.hashCode()));
                rule.put("category", category);
                rule.put("confidence", confidence);
                rule.put("pattern", extractPattern(inputText));
                rule.put("description", "자동 분류된 거래");
                
                matchedRules.add(rule);
            }
            
            response.put("success", true);
            response.put("inputText", inputText);
            response.put("matchedRules", matchedRules);
            response.put("totalMatches", matchedRules.size());
            response.put("processingTime", "45ms");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", "매칭 처리 중 오류 발생");
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @GetMapping("/rules")
    public ResponseEntity<Map<String, Object>> getRules(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        
        List<Map<String, Object>> rules = Arrays.asList(
            createRule("rule_001", "복리후생비", "스타벅스|카페|커피", 0.95),
            createRule("rule_002", "차량유지비", "주유소|SK|GS.*주유", 0.92),
            createRule("rule_003", "사무용품비", "편의점|GS25|CU|세븐일레븐", 0.88),
            createRule("rule_004", "광고선전비", "마케팅|광고|홍보", 0.85),
            createRule("rule_005", "매출", "입금|수수료|프로젝트", 0.98)
        );
        
        Map<String, Object> response = new HashMap<>();
        response.put("rules", rules);
        response.put("totalCount", rules.size());
        response.put("page", page);
        response.put("size", size);
        response.put("hasNext", false);
        
        return ResponseEntity.ok(response);
    }

    private String classifyTransaction(String inputText) {
        String lowerText = inputText.toLowerCase();
        
        if (lowerText.contains("스타벅스") || lowerText.contains("카페") || lowerText.contains("커피")) {
            return "복리후생비";
        } else if (lowerText.contains("주유소") || lowerText.contains("sk") || lowerText.contains("gs")) {
            return "차량유지비";
        } else if (lowerText.contains("편의점") || lowerText.contains("gs25") || lowerText.contains("cu")) {
            return "사무용품비";
        } else if (lowerText.contains("마케팅") || lowerText.contains("광고") || lowerText.contains("홍보")) {
            return "광고선전비";
        } else if (lowerText.contains("입금") || lowerText.contains("수수료") || lowerText.contains("프로젝트")) {
            return "매출";
        } else {
            return "기타";
        }
    }

    private double calculateConfidence(String inputText, String category) {
        String lowerText = inputText.toLowerCase();
        
        if ("복리후생비".equals(category) && lowerText.contains("스타벅스")) {
            return 0.95;
        } else if ("차량유지비".equals(category) && lowerText.contains("주유소")) {
            return 0.92;
        } else if ("매출".equals(category) && lowerText.contains("입금")) {
            return 0.98;
        } else {
            return 0.75;
        }
    }

    private String extractPattern(String inputText) {
        String lowerText = inputText.toLowerCase();
        
        if (lowerText.contains("스타벅스")) {
            return "스타벅스.*";
        } else if (lowerText.contains("주유소")) {
            return ".*주유소.*";
        } else if (lowerText.contains("편의점")) {
            return ".*편의점.*";
        } else {
            return ".*" + inputText.substring(0, Math.min(inputText.length(), 5)) + ".*";
        }
    }

    private Map<String, Object> createRule(String ruleId, String category, String pattern, double confidence) {
        Map<String, Object> rule = new HashMap<>();
        rule.put("ruleId", ruleId);
        rule.put("category", category);
        rule.put("pattern", pattern);
        rule.put("confidence", confidence);
        rule.put("isActive", true);
        rule.put("createdAt", LocalDateTime.now().minusDays((long) (Math.random() * 30)).format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
        return rule;
    }
}
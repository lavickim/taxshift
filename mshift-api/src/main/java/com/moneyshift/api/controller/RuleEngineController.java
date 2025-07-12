package com.moneyshift.api.controller;

import com.moneyshift.api.model.RegexRule;
import com.moneyshift.api.model.RuleMatchRequest;
import com.moneyshift.api.model.RuleMatchResponse;
import com.moneyshift.api.service.RuleEngineService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/rule-engine")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class RuleEngineController {
    
    private final RuleEngineService ruleEngineService;
    
    @PostMapping("/match")
    public ResponseEntity<RuleMatchResponse> matchRules(@Valid @RequestBody RuleMatchRequest request) {
        log.debug("Received rule match request: {}", request);
        
        try {
            RuleMatchResponse response = ruleEngineService.processText(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error processing rule match request", e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    @GetMapping("/rules")
    public ResponseEntity<List<RegexRule>> getAllRules() {
        try {
            List<RegexRule> rules = ruleEngineService.getAllRules();
            return ResponseEntity.ok(rules);
        } catch (Exception e) {
            log.error("Error retrieving all rules", e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    @GetMapping("/rules/category/{category}")
    public ResponseEntity<List<RegexRule>> getRulesByCategory(@PathVariable String category) {
        try {
            List<RegexRule> rules = ruleEngineService.getRulesByCategory(category);
            return ResponseEntity.ok(rules);
        } catch (Exception e) {
            log.error("Error retrieving rules by category: {}", category, e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    @PostMapping("/refresh-cache")
    public ResponseEntity<String> refreshCache() {
        try {
            ruleEngineService.refreshRulesCache();
            return ResponseEntity.ok("Cache refreshed successfully");
        } catch (Exception e) {
            log.error("Error refreshing cache", e);
            return ResponseEntity.internalServerError().body("Failed to refresh cache");
        }
    }
    
    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("Rule Engine API is running");
    }
}
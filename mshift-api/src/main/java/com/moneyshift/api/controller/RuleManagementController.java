package com.moneyshift.api.controller;

import com.moneyshift.api.mapper.RegexRuleMapper;
import com.moneyshift.api.model.RegexRule;
import com.moneyshift.api.service.RuleEngineService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/admin/rules")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"})
public class RuleManagementController {
    
    private final RegexRuleMapper regexRuleMapper;
    private final RuleEngineService ruleEngineService;
    
    @PostMapping
    public ResponseEntity<RegexRule> createRule(@Valid @RequestBody RegexRule rule) {
        try {
            int result = regexRuleMapper.insertRule(rule);
            if (result > 0) {
                // Refresh cache after creating new rule
                ruleEngineService.refreshRulesCache();
                return ResponseEntity.ok(rule);
            }
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            log.error("Error creating rule", e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<RegexRule> getRule(@PathVariable Long id) {
        try {
            RegexRule rule = regexRuleMapper.selectRuleById(id);
            if (rule != null) {
                return ResponseEntity.ok(rule);
            }
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            log.error("Error retrieving rule {}", id, e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<RegexRule> updateRule(@PathVariable Long id, @Valid @RequestBody RegexRule rule) {
        try {
            rule.setId(id);
            int result = regexRuleMapper.updateRule(rule);
            if (result > 0) {
                // Refresh cache after updating rule
                ruleEngineService.refreshRulesCache();
                return ResponseEntity.ok(rule);
            }
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            log.error("Error updating rule {}", id, e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRule(@PathVariable Long id) {
        try {
            int result = regexRuleMapper.deleteRule(id);
            if (result > 0) {
                // Refresh cache after deleting rule
                ruleEngineService.refreshRulesCache();
                return ResponseEntity.noContent().build();
            }
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            log.error("Error deleting rule {}", id, e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    @PatchMapping("/{id}/enable")
    public ResponseEntity<Void> enableRule(@PathVariable Long id) {
        try {
            int result = regexRuleMapper.enableRule(id);
            if (result > 0) {
                ruleEngineService.refreshRulesCache();
                return ResponseEntity.ok().build();
            }
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            log.error("Error enabling rule {}", id, e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    @PatchMapping("/{id}/disable")
    public ResponseEntity<Void> disableRule(@PathVariable Long id) {
        try {
            int result = regexRuleMapper.disableRule(id);
            if (result > 0) {
                ruleEngineService.refreshRulesCache();
                return ResponseEntity.ok().build();
            }
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            log.error("Error disabling rule {}", id, e);
            return ResponseEntity.internalServerError().build();
        }
    }
}
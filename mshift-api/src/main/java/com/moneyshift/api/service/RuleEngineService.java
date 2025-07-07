package com.moneyshift.api.service;

import com.moneyshift.api.mapper.RegexRuleMapper;
import com.moneyshift.api.model.RegexRule;
import com.moneyshift.api.model.RuleMatchRequest;
import com.moneyshift.api.model.RuleMatchResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.TimeUnit;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
@Slf4j
public class RuleEngineService {
    
    private final RegexRuleMapper regexRuleMapper;
    private final RedisTemplate<String, Object> redisTemplate;
    
    private static final String RULES_CACHE_KEY = "regex_rules:all";
    private static final String CATEGORY_CACHE_KEY = "regex_rules:category:";
    private static final long CACHE_EXPIRATION_HOURS = 24;
    
    @PostConstruct
    public void loadRulesToRedis() {
        log.info("Loading regex rules to Redis cache...");
        try {
            List<RegexRule> rules = regexRuleMapper.selectAllActiveRules();
            
            // Cache all rules
            redisTemplate.opsForValue().set(RULES_CACHE_KEY, rules, CACHE_EXPIRATION_HOURS, TimeUnit.HOURS);
            
            // Cache rules by category
            rules.stream()
                .filter(rule -> rule.getCategory() != null)
                .collect(java.util.stream.Collectors.groupingBy(RegexRule::getCategory))
                .forEach((category, categoryRules) -> {
                    String categoryKey = CATEGORY_CACHE_KEY + category;
                    redisTemplate.opsForValue().set(categoryKey, categoryRules, CACHE_EXPIRATION_HOURS, TimeUnit.HOURS);
                });
            
            log.info("Successfully loaded {} regex rules to Redis cache", rules.size());
        } catch (Exception e) {
            log.error("Failed to load rules to Redis cache", e);
            throw new RuntimeException("Failed to initialize rule engine", e);
        }
    }
    
    public RuleMatchResponse processText(RuleMatchRequest request) {
        log.debug("Processing text: {}", request.getInputText());
        
        List<RegexRule> rules = getRulesFromCache(request.getCategory());
        
        if (rules.isEmpty()) {
            log.warn("No rules found for category: {}", request.getCategory());
            return RuleMatchResponse.builder()
                .matched(false)
                .processedText(request.getInputText())
                .originalText(request.getInputText())
                .matchedRules(new ArrayList<>())
                .build();
        }
        
        String processedText = request.getInputText();
        List<RuleMatchResponse.MatchedRule> matchedRules = new ArrayList<>();
        boolean hasMatches = false;
        
        for (RegexRule rule : rules) {
            try {
                Pattern pattern = Pattern.compile(rule.getPattern());
                Matcher matcher = pattern.matcher(processedText);
                
                if (matcher.find()) {
                    hasMatches = true;
                    
                    // Record the match
                    RuleMatchResponse.MatchedRule matchedRule = RuleMatchResponse.MatchedRule.builder()
                        .ruleId(rule.getId())
                        .pattern(rule.getPattern())
                        .replacement(rule.getReplacement())
                        .description(rule.getDescription())
                        .category(rule.getCategory())
                        .priority(rule.getPriority())
                        .matchedText(matcher.group())
                        .startIndex(matcher.start())
                        .endIndex(matcher.end())
                        .build();
                    
                    matchedRules.add(matchedRule);
                    
                    // Apply replacement if specified
                    if (rule.getReplacement() != null && !rule.getReplacement().isEmpty()) {
                        processedText = matcher.replaceAll(rule.getReplacement());
                    }
                    
                    // If not returning all matches, break after first match
                    if (!request.getReturnAllMatches()) {
                        break;
                    }
                }
            } catch (Exception e) {
                log.error("Error processing rule {}: {}", rule.getId(), e.getMessage());
            }
        }
        
        return RuleMatchResponse.builder()
            .matched(hasMatches)
            .processedText(processedText)
            .originalText(request.getInputText())
            .matchedRules(matchedRules)
            .build();
    }
    
    private List<RegexRule> getRulesFromCache(String category) {
        try {
            String cacheKey = (category != null && !category.isEmpty()) 
                ? CATEGORY_CACHE_KEY + category 
                : RULES_CACHE_KEY;
            
            Object cached = redisTemplate.opsForValue().get(cacheKey);
            
            if (cached != null) {
                // Handle Redis deserialization
                if (cached instanceof List) {
                    List<?> cachedList = (List<?>) cached;
                    List<RegexRule> rules = new ArrayList<>();
                    
                    for (Object item : cachedList) {
                        if (item instanceof RegexRule) {
                            rules.add((RegexRule) item);
                        } else if (item instanceof java.util.Map) {
                            // Convert LinkedHashMap to RegexRule
                            @SuppressWarnings("unchecked")
                            java.util.Map<String, Object> map = (java.util.Map<String, Object>) item;
                            RegexRule rule = mapToRegexRule(map);
                            if (rule != null) {
                                rules.add(rule);
                            }
                        }
                    }
                    
                    if (!rules.isEmpty()) {
                        return rules;
                    }
                }
            }
            
            // If cache miss, reload from database
            log.warn("Cache miss for key: {}, reloading from database", cacheKey);
            
            List<RegexRule> rules = (category != null && !category.isEmpty()) 
                ? regexRuleMapper.selectRulesByCategory(category)
                : regexRuleMapper.selectAllActiveRules();
            
            // Update cache
            redisTemplate.opsForValue().set(cacheKey, rules, CACHE_EXPIRATION_HOURS, TimeUnit.HOURS);
            
            return rules;
        } catch (Exception e) {
            log.error("Error retrieving rules from cache", e);
            // Fallback to database
            return (category != null && !category.isEmpty()) 
                ? regexRuleMapper.selectRulesByCategory(category)
                : regexRuleMapper.selectAllActiveRules();
        }
    }
    
    private RegexRule mapToRegexRule(java.util.Map<String, Object> map) {
        try {
            RegexRule rule = new RegexRule();
            rule.setId(((Number) map.get("id")).longValue());
            rule.setPattern((String) map.get("pattern"));
            rule.setReplacement((String) map.get("replacement"));
            rule.setDescription((String) map.get("description"));
            rule.setCategory((String) map.get("category"));
            rule.setEnabled((Boolean) map.get("enabled"));
            rule.setPriority(((Number) map.get("priority")).intValue());
            
            // Handle LocalDateTime conversion
            Object createdAt = map.get("createdAt");
            Object updatedAt = map.get("updatedAt");
            
            if (createdAt instanceof java.util.List) {
                @SuppressWarnings("unchecked")
                java.util.List<Integer> dateList = (java.util.List<Integer>) createdAt;
                if (dateList.size() >= 7) {
                    rule.setCreatedAt(java.time.LocalDateTime.of(
                        dateList.get(0), dateList.get(1), dateList.get(2),
                        dateList.get(3), dateList.get(4), dateList.get(5),
                        dateList.get(6)
                    ));
                }
            }
            
            if (updatedAt instanceof java.util.List) {
                @SuppressWarnings("unchecked")
                java.util.List<Integer> dateList = (java.util.List<Integer>) updatedAt;
                if (dateList.size() >= 7) {
                    rule.setUpdatedAt(java.time.LocalDateTime.of(
                        dateList.get(0), dateList.get(1), dateList.get(2),
                        dateList.get(3), dateList.get(4), dateList.get(5),
                        dateList.get(6)
                    ));
                }
            }
            
            return rule;
        } catch (Exception e) {
            log.error("Error converting map to RegexRule", e);
            return null;
        }
    }
    
    public void refreshRulesCache() {
        log.info("Refreshing rules cache...");
        
        // Clear existing cache
        redisTemplate.delete(RULES_CACHE_KEY);
        
        // Clear category caches
        redisTemplate.delete(redisTemplate.keys(CATEGORY_CACHE_KEY + "*"));
        
        // Reload rules
        loadRulesToRedis();
    }
    
    public List<RegexRule> getAllRules() {
        return getRulesFromCache(null);
    }
    
    public List<RegexRule> getRulesByCategory(String category) {
        return getRulesFromCache(category);
    }
}
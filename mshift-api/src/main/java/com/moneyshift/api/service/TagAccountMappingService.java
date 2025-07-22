package com.moneyshift.api.service;

import com.moneyshift.api.mapper.TagAccountMappingMapper;
import com.moneyshift.api.model.TagAccountMapping;
import com.moneyshift.api.model.TransactionEntity;
import com.moneyshift.api.controller.TagAccountMappingController;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.List;
import java.util.ArrayList;
import java.util.concurrent.TimeUnit;
import java.time.LocalDateTime;
import java.math.BigDecimal;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class TagAccountMappingService {
    
    private final TagAccountMappingMapper tagAccountMappingMapper;
    private final RedisTemplate<String, Object> redisTemplate;
    
    private static final String CACHE_KEY_ALL_MAPPINGS = "tag_account_mappings:all";
    private static final String CACHE_KEY_TAG_PREFIX = "tag_account_mappings:tag:";
    private static final String CACHE_KEY_ACCOUNT_PREFIX = "tag_account_mappings:account:";
    private static final long CACHE_TTL_HOURS = 24;
    
    /**
     * 태그 ID로 매핑 조회
     */
    public List<TagAccountMapping> getMappingsByTagId(Long tagId) {
        try {
            return tagAccountMappingMapper.selectByTagId(tagId);
        } catch (Exception e) {
            log.error("태그 계정 매핑 조회 실패: tagId={}", tagId, e);
            return new ArrayList<>();
        }
    }
    
    public List<TagAccountMapping> findAllMappings() {
        log.info("모든 태그-계정과목 매핑 조회");
        try {
            // Try cache first
            List<TagAccountMapping> cachedMappings = (List<TagAccountMapping>) redisTemplate.opsForValue().get(CACHE_KEY_ALL_MAPPINGS);
            if (cachedMappings != null) {
                log.info("캐시에서 {}개 태그-계정과목 매핑 조회", cachedMappings.size());
                return cachedMappings;
            }
            
            // Fallback to database
            return findAllMappingsFromDatabase();
        } catch (Exception e) {
            log.error("태그-계정과목 매핑 조회 실패", e);
            return new ArrayList<>();
        }
    }
    
    public List<TagAccountMapping> findAllMappingsFromDatabase() {
        log.info("데이터베이스에서 태그-계정과목 매핑 조회");
        try {
            List<TagAccountMapping> mappings = tagAccountMappingMapper.selectAllWithTags();
            log.info("데이터베이스에서 {}개 태그-계정과목 매핑 조회됨", mappings.size());
            
            // Cache the results
            redisTemplate.opsForValue().set(CACHE_KEY_ALL_MAPPINGS, mappings, CACHE_TTL_HOURS, TimeUnit.HOURS);
            log.info("데이터베이스에서 {}개 매핑 조회 및 캐시 저장", mappings.size());
            
            return mappings;
        } catch (Exception e) {
            log.error("데이터베이스에서 태그-계정과목 매핑 조회 실패", e);
            return new ArrayList<>();
        }
    }
    
    public List<TagAccountMapping> findMappingsByTag(Long tagId) {
        log.info("태그별 계정과목 매핑 조회: {}", tagId);
        try {
            String cacheKey = CACHE_KEY_TAG_PREFIX + tagId;
            List<TagAccountMapping> cachedMappings = (List<TagAccountMapping>) redisTemplate.opsForValue().get(cacheKey);
            if (cachedMappings != null) {
                return cachedMappings;
            }
            
            List<TagAccountMapping> mappings = tagAccountMappingMapper.selectByTagIdWithTags(tagId);
            redisTemplate.opsForValue().set(cacheKey, mappings, CACHE_TTL_HOURS, TimeUnit.HOURS);
            
            return mappings;
        } catch (Exception e) {
            log.error("태그별 계정과목 매핑 조회 실패: tagId={}", tagId, e);
            return new ArrayList<>();
        }
    }
    
    public List<TagAccountMapping> findMappingsByAccount(String accountCode) {
        log.info("계정과목별 태그 매핑 조회: {}", accountCode);
        try {
            String cacheKey = CACHE_KEY_ACCOUNT_PREFIX + accountCode;
            List<TagAccountMapping> cachedMappings = (List<TagAccountMapping>) redisTemplate.opsForValue().get(cacheKey);
            if (cachedMappings != null) {
                return cachedMappings;
            }
            
            List<TagAccountMapping> mappings = tagAccountMappingMapper.selectByAccountCodeWithTags(accountCode);
            redisTemplate.opsForValue().set(cacheKey, mappings, CACHE_TTL_HOURS, TimeUnit.HOURS);
            
            return mappings;
        } catch (Exception e) {
            log.error("계정과목별 태그 매핑 조회 실패: accountCode={}", accountCode, e);
            return new ArrayList<>();
        }
    }
    
    public TagAccountMapping findById(Long id) {
        log.info("태그-계정과목 매핑 단건 조회: {}", id);
        try {
            return tagAccountMappingMapper.selectByIdWithTags(id);
        } catch (Exception e) {
            log.error("태그-계정과목 매핑 단건 조회 실패: id={}", id, e);
            return null;
        }
    }
    
    public TagAccountMapping createMapping(TagAccountMapping mapping) {
        log.info("태그-계정과목 매핑 생성: tagId={}, accountCode={}", mapping.getTagId(), mapping.getAccountCode());
        try {
            tagAccountMappingMapper.insertTagAccountMapping(mapping);
            invalidateCache();
            return mapping;
        } catch (Exception e) {
            log.error("태그-계정과목 매핑 생성 실패", e);
            throw new RuntimeException("태그-계정과목 매핑 생성 실패", e);
        }
    }
    
    public TagAccountMapping updateMapping(Long id, TagAccountMapping mapping) {
        log.info("태그-계정과목 매핑 수정: id={}", id);
        try {
            mapping.setId(id);
            tagAccountMappingMapper.updateTagAccountMapping(mapping);
            invalidateCache();
            return mapping;
        } catch (Exception e) {
            log.error("태그-계정과목 매핑 수정 실패: id={}", id, e);
            throw new RuntimeException("태그-계정과목 매핑 수정 실패", e);
        }
    }
    
    public void deleteMapping(Long id) {
        log.info("태그-계정과목 매핑 삭제: id={}", id);
        try {
            tagAccountMappingMapper.deleteTagAccountMapping(id);
            invalidateCache();
        } catch (Exception e) {
            log.error("태그-계정과목 매핑 삭제 실패: id={}", id, e);
            throw new RuntimeException("태그-계정과목 매핑 삭제 실패", e);
        }
    }
    
    public long countAll() {
        try {
            return tagAccountMappingMapper.countAll();
        } catch (Exception e) {
            log.error("태그-계정과목 매핑 전체 개수 조회 실패", e);
            return 0;
        }
    }
    
    public List<TagAccountMapping> findDefaultMappings() {
        log.info("기본 태그-계정과목 매핑 조회");
        try {
            return tagAccountMappingMapper.selectDefaultMappings();
        } catch (Exception e) {
            log.error("기본 태그-계정과목 매핑 조회 실패", e);
            return new ArrayList<>();
        }
    }
    
    public void invalidateCache() {
        log.info("태그-계정과목 매핑 캐시 무효화");
        try {
            redisTemplate.delete(CACHE_KEY_ALL_MAPPINGS);
            // Clear tag-specific caches
            redisTemplate.delete(redisTemplate.keys(CACHE_KEY_TAG_PREFIX + "*"));
            redisTemplate.delete(redisTemplate.keys(CACHE_KEY_ACCOUNT_PREFIX + "*"));
        } catch (Exception e) {
            log.error("태그-계정과목 매핑 캐시 무효화 실패", e);
        }
    }

    // ========== 추가된 메서드들 ==========

    /**
     * 태그-계정과목 매핑 조회 (필터링 포함)
     */
    public List<TagAccountMapping> getMappings(Long tagId, String accountCode, Boolean isDefault) {
        log.debug("태그-계정과목 매핑 조회: tagId={}, accountCode={}, isDefault={}", tagId, accountCode, isDefault);
        
        try {
            // 샘플 데이터 생성
            List<TagAccountMapping> mappings = createSampleAccountMappings();
            
            // 필터링 적용
            if (tagId != null) {
                mappings = mappings.stream()
                        .filter(mapping -> tagId.equals(mapping.getTagId()))
                        .collect(Collectors.toList());
            }
            
            if (accountCode != null && !accountCode.isEmpty()) {
                mappings = mappings.stream()
                        .filter(mapping -> accountCode.equals(mapping.getAccountCode()))
                        .collect(Collectors.toList());
            }
            
            if (isDefault != null) {
                mappings = mappings.stream()
                        .filter(mapping -> isDefault.equals(mapping.getIsDefault()))
                        .collect(Collectors.toList());
            }
            
            return mappings;
            
        } catch (Exception e) {
            log.error("태그-계정과목 매핑 조회 실패", e);
            return new ArrayList<>();
        }
    }

    /**
     * 조건부 매핑 테스트
     */
    public TagAccountMappingController.ConditionalMappingTestResult testConditionalMapping(
            TagAccountMappingController.ConditionalMappingTestRequest request) {
        log.info("조건부 매핑 테스트: tagId={}", request.getTagId());
        
        try {
            // 간단한 조건부 매핑 로직 구현
            TagAccountMappingController.ConditionalMappingTestResult result = 
                    new TagAccountMappingController.ConditionalMappingTestResult();
            
            result.setTagId(request.getTagId());
            
            // 시간 기반 조건 테스트
            if ("late_night".equals(request.getTimeContext()) && 
                request.getPreviousTag() != null && request.getPreviousTag().contains("회식")) {
                result.setAccountCode("5101");
                result.setAccountName("접대비");
                result.setMatched(true);
                result.setMatchedCondition("심야 + 회식");
                result.setConfidence(0.85);
                result.setReason("심야 시간대 회식 후 택시 이용");
            } else if (request.getAmount() != null && request.getAmount() > 50000) {
                result.setAccountCode("5101");
                result.setAccountName("접대비");
                result.setMatched(true);
                result.setMatchedCondition("금액 > 50,000원");
                result.setConfidence(0.80);
                result.setReason("고액 거래로 접대비 가능성 높음");
            } else {
                result.setAccountCode("5301");
                result.setAccountName("여비교통비");
                result.setMatched(true);
                result.setMatchedCondition("기본 규칙");
                result.setConfidence(0.70);
                result.setReason("기본 매핑 규칙 적용");
            }
            
            return result;
            
        } catch (Exception e) {
            log.error("조건부 매핑 테스트 실패", e);
            TagAccountMappingController.ConditionalMappingTestResult result = 
                    new TagAccountMappingController.ConditionalMappingTestResult();
            result.setTagId(request.getTagId());
            result.setMatched(false);
            result.setReason("테스트 실패: " + e.getMessage());
            return result;
        }
    }

    /**
     * 매핑 시나리오 테스트
     */
    public List<TagAccountMappingController.MappingScenarioResult> testMappingScenarios(
            List<TagAccountMappingController.MappingScenarioRequest> scenarios) {
        log.info("매핑 시나리오 테스트: {}개 시나리오", scenarios.size());
        
        List<TagAccountMappingController.MappingScenarioResult> results = new ArrayList<>();
        
        for (TagAccountMappingController.MappingScenarioRequest scenario : scenarios) {
            TagAccountMappingController.MappingScenarioResult result = 
                    new TagAccountMappingController.MappingScenarioResult();
            result.setScenarioName(scenario.getScenarioName());
            result.setExpectedAccount(scenario.getExpectedAccount());
            result.setExpectedAccountName(scenario.getExpectedAccountName());
            
            try {
                // 간단한 매핑 로직 구현
                if (scenario.getTransactionText().contains("스타벅스") || 
                    scenario.getTransactionText().contains("커피")) {
                    result.setActualAccount("5201");
                    result.setActualAccountName("복리후생비");
                } else if (scenario.getTransactionText().contains("택시")) {
                    if (scenario.getAmount() != null && scenario.getAmount() > 50000) {
                        result.setActualAccount("5101");
                        result.setActualAccountName("접대비");
                    } else {
                        result.setActualAccount("5301");
                        result.setActualAccountName("여비교통비");
                    }
                } else {
                    result.setActualAccount("5901");
                    result.setActualAccountName("기타비용");
                }
                
                // 결과 비교
                result.setPassed(scenario.getExpectedAccount().equals(result.getActualAccount()));
                
            } catch (Exception e) {
                result.setPassed(false);
                result.setErrorMessage(e.getMessage());
            }
            
            results.add(result);
        }
        
        return results;
    }

    /**
     * 계정과목 목록 조회
     */
    public List<TagAccountMappingController.AccountInfo> getAccounts() {
        log.info("계정과목 목록 조회");
        
        List<TagAccountMappingController.AccountInfo> accounts = new ArrayList<>();
        
        // 샘플 계정과목 데이터
        accounts.add(createAccountInfo("5101", "접대비", "판매비", "고객 및 거래처 접대 비용", true));
        accounts.add(createAccountInfo("5201", "복리후생비", "판매비", "직원 복리후생 비용", true));
        accounts.add(createAccountInfo("5301", "여비교통비", "판매비", "출장 및 교통비용", true));
        accounts.add(createAccountInfo("5401", "회의비", "판매비", "회의 관련 비용", true));
        accounts.add(createAccountInfo("5901", "기타비용", "판매비", "기타 잡비", true));
        
        return accounts;
    }

    /**
     * 매핑 통계 조회
     */
    public TagAccountMappingController.MappingStatistics getMappingStats() {
        log.info("매핑 통계 조회");
        
        try {
            List<TagAccountMapping> mappings = getMappings(null, null, null);
            
            long totalMappings = mappings.size();
            long conditionalMappings = mappings.stream()
                    .filter(mapping -> mapping.getMappingCondition() != null)
                    .count();
            long defaultMappings = mappings.stream()
                    .filter(mapping -> mapping.getIsDefault())
                    .count();
            
            List<TagAccountMappingController.AccountInfo> accounts = getAccounts();
            long totalAccounts = accounts.size();
            long mappedAccounts = mappings.stream()
                    .map(TagAccountMapping::getAccountCode)
                    .distinct()
                    .count();
            
            double averageConfidence = mappings.stream()
                    .filter(mapping -> mapping.getConfidenceBoost() != null)
                    .mapToDouble(mapping -> mapping.getConfidenceBoost().doubleValue())
                    .average()
                    .orElse(0.0);
            
            TagAccountMappingController.MappingStatistics stats = 
                    new TagAccountMappingController.MappingStatistics();
            stats.setTotalMappings(totalMappings);
            stats.setConditionalMappings(conditionalMappings);
            stats.setDefaultMappings(defaultMappings);
            stats.setTotalAccounts(totalAccounts);
            stats.setMappedAccounts(mappedAccounts);
            stats.setAverageConfidence(averageConfidence);
            
            return stats;
            
        } catch (Exception e) {
            log.error("매핑 통계 조회 실패", e);
            return new TagAccountMappingController.MappingStatistics();
        }
    }

    /**
     * 조건부 규칙 생성
     */
    @Transactional
    public TagAccountMappingController.ConditionalRule createConditionalRule(
            TagAccountMappingController.ConditionalRule rule) {
        log.info("조건부 규칙 생성: tagId={}, ruleName={}", rule.getTagId(), rule.getRuleName());
        
        try {
            // 기본값 설정
            rule.setId(System.currentTimeMillis());
            if (rule.getPriority() == null) {
                rule.setPriority(50);
            }
            rule.setActive(true);
            
            // DB 저장 (향후 구현)
            
            // 캐시 갱신
            invalidateCache();
            
            return rule;
            
        } catch (Exception e) {
            log.error("조건부 규칙 생성 실패", e);
            throw new RuntimeException("조건부 규칙 생성 실패", e);
        }
    }

    /**
     * 조건부 규칙 조회
     */
    public List<TagAccountMappingController.ConditionalRule> getConditionalRules(Long tagId) {
        log.info("조건부 규칙 조회: tagId={}", tagId);
        
        try {
            // 샘플 데이터 생성
            List<TagAccountMappingController.ConditionalRule> rules = createSampleConditionalRules();
            
            // 태그 ID로 필터링
            if (tagId != null) {
                rules = rules.stream()
                        .filter(rule -> tagId.equals(rule.getTagId()))
                        .collect(Collectors.toList());
            }
            
            return rules;
            
        } catch (Exception e) {
            log.error("조건부 규칙 조회 실패", e);
            return new ArrayList<>();
        }
    }

    // ========== 헬퍼 메서드들 ==========

    /**
     * 샘플 계정과목 매핑 데이터 생성
     */
    private List<TagAccountMapping> createSampleAccountMappings() {
        List<TagAccountMapping> mappings = new ArrayList<>();
        
        mappings.add(TagAccountMapping.builder()
                .id(1L)
                .tagId(1L)
                .accountCode("5201")
                .accountName("복리후생비")
                .isDefault(true)
                .priority(100)
                .confidenceBoost(new BigDecimal("0.0"))
                .createdAt(LocalDateTime.now())
                .build());
        
        mappings.add(TagAccountMapping.builder()
                .id(2L)
                .tagId(1L)
                .accountCode("5101")
                .accountName("접대비")
                .isDefault(false)
                .priority(90)
                .confidenceBoost(new BigDecimal("0.1"))
                .createdAt(LocalDateTime.now())
                .build());
        
        mappings.add(TagAccountMapping.builder()
                .id(3L)
                .tagId(3L)
                .accountCode("5301")
                .accountName("여비교통비")
                .isDefault(true)
                .priority(100)
                .confidenceBoost(new BigDecimal("0.0"))
                .createdAt(LocalDateTime.now())
                .build());
        
        return mappings;
    }

    /**
     * 계정과목 정보 생성
     */
    private TagAccountMappingController.AccountInfo createAccountInfo(String code, String name, 
            String type, String description, boolean isActive) {
        TagAccountMappingController.AccountInfo info = new TagAccountMappingController.AccountInfo();
        info.setAccountCode(code);
        info.setAccountName(name);
        info.setAccountType(type);
        info.setDescription(description);
        info.setActive(isActive);
        return info;
    }

    /**
     * 샘플 조건부 규칙 데이터 생성
     */
    private List<TagAccountMappingController.ConditionalRule> createSampleConditionalRules() {
        List<TagAccountMappingController.ConditionalRule> rules = new ArrayList<>();
        
        TagAccountMappingController.ConditionalRule rule1 = new TagAccountMappingController.ConditionalRule();
        rule1.setId(1L);
        rule1.setTagId(3L);
        rule1.setRuleName("심야 + 회식");
        rule1.setAccountCode("5101");
        rule1.setAccountName("접대비");
        rule1.setPriority(90);
        rule1.setActive(true);
        rules.add(rule1);
        
        TagAccountMappingController.ConditionalRule rule2 = new TagAccountMappingController.ConditionalRule();
        rule2.setId(2L);
        rule2.setTagId(3L);
        rule2.setRuleName("고액 거래");
        rule2.setAccountCode("5101");
        rule2.setAccountName("접대비");
        rule2.setPriority(85);
        rule2.setActive(true);
        rules.add(rule2);
        
        return rules;
    }

    /**
     * 태그명으로 계정과목 코드 조회 (기장 시스템용)
     */
    public String getAccountCodeByTag(String tagName, TransactionEntity transaction) {
        try {
            log.debug("태그 기반 계정과목 조회: tagName={}, transactionAmount={}", tagName, transaction.getAmount());
            
            // 기본 태그 매핑 (간단한 예시)
            switch (tagName) {
                case "커피전문점":
                case "커피":
                    return "5120"; // 복리후생비
                    
                case "주유소":
                case "차량유지":
                    return "5140"; // 차량유지비
                    
                case "편의점":
                case "사무용품":
                    return "5130"; // 소모품비
                    
                case "음식점":
                case "식당":
                    // 조건부 매핑: 야간 시간대 체크
                    if (isLateNightTransaction(transaction)) {
                        return "5510"; // 야근식대 (복리후생비)
                    } else {
                        return "5110"; // 접대비
                    }
                    
                case "택시":
                case "교통":
                    // 조건부 매핑: 금액 기반
                    if (transaction.getAmount() > 50000) {
                        return "5110"; // 접대비 (고액)
                    } else {
                        return "5230"; // 차량관련비 (교통비)
                    }
                    
                case "통신":
                case "휴대폰":
                    return "5150"; // 통신비
                    
                case "교육":
                case "학원":
                    return "5170"; // 교육훈련비
                    
                case "보험":
                    return "5190"; // 보험료
                    
                case "의료":
                case "병원":
                    return "5210"; // 의료비
                    
                default:
                    log.debug("매핑되지 않은 태그, 기본 계정과목 사용: tagName={}", tagName);
                    return "5130"; // 소모품비 (기본값)
            }
            
        } catch (Exception e) {
            log.warn("태그 기반 계정과목 조회 실패, 기본값 사용: tagName={}, error={}", tagName, e.getMessage());
            return "5130"; // 소모품비 (기본값)
        }
    }

    /**
     * 야간 거래 여부 확인 (22시-06시)
     */
    private boolean isLateNightTransaction(TransactionEntity transaction) {
        // 실제 구현에서는 transaction의 시간 정보를 확인
        // 현재는 간단히 false 반환
        return false;
    }
}
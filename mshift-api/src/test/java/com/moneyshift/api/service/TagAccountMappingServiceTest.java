package com.moneyshift.api.service;

import com.moneyshift.api.mapper.TagAccountMappingMapper;
import com.moneyshift.api.model.TagAccountMapping;
import com.moneyshift.api.model.TransactionEntity;
import com.moneyshift.api.controller.TagAccountMappingController;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.ValueOperations;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.TimeUnit;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.mockito.Mockito.lenient;

/**
 * TDD: TagAccountMappingService 테스트 - Phase 2 태그-계정과목 매핑 시스템 검증
 * 
 * 핵심 기능:
 * 1. 태그-계정과목 매핑 CRUD 작업
 * 2. Redis 캐싱 시스템
 * 3. 조건부 매핑 규칙 처리
 * 4. 매핑 통계 및 분석
 * 5. 계정과목 자동 추천
 * 6. 기장 시스템 연동
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("TagAccountMappingService TDD - Phase 2 태그-계정과목 매핑 시스템 테스트")
class TagAccountMappingServiceTest {

    @Mock
    private TagAccountMappingMapper tagAccountMappingMapper;
    
    @Mock
    private RedisTemplate<String, Object> redisTemplate;
    
    @Mock
    private ValueOperations<String, Object> valueOperations;
    
    @InjectMocks
    private TagAccountMappingService tagAccountMappingService;
    
    private TagAccountMapping testMapping;
    private TransactionEntity testTransaction;
    private List<TagAccountMapping> testMappingList;

    @BeforeEach
    void setUp() {
        // Redis ValueOperations Mock 설정 (lenient)
        lenient().when(redisTemplate.opsForValue()).thenReturn(valueOperations);
        
        // 테스트용 태그-계정과목 매핑
        testMapping = TagAccountMapping.builder()
                .id(1L)
                .tagId(10L)
                .accountCode("5120")
                .accountName("복리후생비")
                .isDefault(true)
                .priority(100)
                .confidenceBoost(BigDecimal.valueOf(0.1))
                .createdAt(LocalDateTime.now())
                .build();
        
        // 테스트용 거래 엔티티
        testTransaction = TransactionEntity.builder()
                .id(1L)
                .rawText("스타벅스 커피 주문")
                .amount(5500L)
                .transactionDate(LocalDateTime.now().toLocalDate())
                .build();
        
        // 테스트용 매핑 리스트
        testMappingList = Arrays.asList(
                testMapping,
                TagAccountMapping.builder()
                        .id(2L)
                        .tagId(20L)
                        .accountCode("5130")
                        .accountName("소모품비")
                        .isDefault(false)
                        .priority(90)
                        .confidenceBoost(BigDecimal.valueOf(0.05))
                        .createdAt(LocalDateTime.now().minusDays(1))
                        .build(),
                TagAccountMapping.builder()
                        .id(3L)
                        .tagId(30L)
                        .accountCode("5110")
                        .accountName("접대비")
                        .isDefault(false)
                        .priority(80)
                        .confidenceBoost(BigDecimal.valueOf(0.15))
                        .createdAt(LocalDateTime.now().minusDays(2))
                        .build()
        );
    }

    @Test
    @DisplayName("TDD: 태그 ID로 매핑 조회 - 성공")
    void should_ReturnMappings_When_GetMappingsByTagIdWithValidId() {
        // Given
        Long tagId = 10L;
        when(tagAccountMappingMapper.selectByTagId(tagId)).thenReturn(Arrays.asList(testMapping));

        // When
        List<TagAccountMapping> result = tagAccountMappingService.getMappingsByTagId(tagId);

        // Then
        assertThat(result).isNotNull();
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getTagId()).isEqualTo(tagId);
        assertThat(result.get(0).getAccountCode()).isEqualTo("5120");
        assertThat(result.get(0).getAccountName()).isEqualTo("복리후생비");
        
        verify(tagAccountMappingMapper).selectByTagId(tagId);
    }

    @Test
    @DisplayName("TDD: 태그 ID로 매핑 조회 - 예외 처리")
    void should_ReturnEmptyList_When_GetMappingsByTagIdThrowsException() {
        // Given
        Long tagId = 999L;
        when(tagAccountMappingMapper.selectByTagId(tagId)).thenThrow(new RuntimeException("Database error"));

        // When
        List<TagAccountMapping> result = tagAccountMappingService.getMappingsByTagId(tagId);

        // Then
        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
        
        verify(tagAccountMappingMapper).selectByTagId(tagId);
    }

    @Test
    @DisplayName("TDD: 모든 매핑 조회 - 캐시 히트")
    void should_ReturnCachedMappings_When_CacheHit() {
        // Given
        when(valueOperations.get("tag_account_mappings:all")).thenReturn(testMappingList);

        // When
        List<TagAccountMapping> result = tagAccountMappingService.findAllMappings();

        // Then
        assertThat(result).isNotNull();
        assertThat(result).hasSize(3);
        assertThat(result).isEqualTo(testMappingList);
        
        verify(valueOperations).get("tag_account_mappings:all");
        verify(tagAccountMappingMapper, never()).selectAllWithTags();
    }

    @Test
    @DisplayName("TDD: 모든 매핑 조회 - 캐시 미스 및 데이터베이스 조회")
    void should_ReturnDatabaseMappings_When_CacheMiss() {
        // Given
        when(valueOperations.get("tag_account_mappings:all")).thenReturn(null);
        when(tagAccountMappingMapper.selectAllWithTags()).thenReturn(testMappingList);

        // When
        List<TagAccountMapping> result = tagAccountMappingService.findAllMappings();

        // Then
        assertThat(result).isNotNull();
        assertThat(result).hasSize(3);
        assertThat(result).isEqualTo(testMappingList);
        
        verify(valueOperations).get("tag_account_mappings:all");
        verify(tagAccountMappingMapper).selectAllWithTags();
        verify(valueOperations).set("tag_account_mappings:all", testMappingList, 24L, TimeUnit.HOURS);
    }

    @Test
    @DisplayName("TDD: 태그별 매핑 조회 - 캐시 사용")
    void should_ReturnTagMappings_When_FindMappingsByTag() {
        // Given
        Long tagId = 10L;
        String cacheKey = "tag_account_mappings:tag:10";
        List<TagAccountMapping> tagMappings = Arrays.asList(testMapping);
        
        when(valueOperations.get(cacheKey)).thenReturn(null);
        when(tagAccountMappingMapper.selectByTagIdWithTags(tagId)).thenReturn(tagMappings);

        // When
        List<TagAccountMapping> result = tagAccountMappingService.findMappingsByTag(tagId);

        // Then
        assertThat(result).isNotNull();
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getTagId()).isEqualTo(tagId);
        
        verify(valueOperations).get(cacheKey);
        verify(tagAccountMappingMapper).selectByTagIdWithTags(tagId);
        verify(valueOperations).set(cacheKey, tagMappings, 24L, TimeUnit.HOURS);
    }

    @Test
    @DisplayName("TDD: 계정과목별 매핑 조회")
    void should_ReturnAccountMappings_When_FindMappingsByAccount() {
        // Given
        String accountCode = "5120";
        String cacheKey = "tag_account_mappings:account:5120";
        List<TagAccountMapping> accountMappings = Arrays.asList(testMapping);
        
        when(valueOperations.get(cacheKey)).thenReturn(null);
        when(tagAccountMappingMapper.selectByAccountCodeWithTags(accountCode)).thenReturn(accountMappings);

        // When
        List<TagAccountMapping> result = tagAccountMappingService.findMappingsByAccount(accountCode);

        // Then
        assertThat(result).isNotNull();
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getAccountCode()).isEqualTo(accountCode);
        
        verify(valueOperations).get(cacheKey);
        verify(tagAccountMappingMapper).selectByAccountCodeWithTags(accountCode);
        verify(valueOperations).set(cacheKey, accountMappings, 24L, TimeUnit.HOURS);
    }

    @Test
    @DisplayName("TDD: 매핑 단건 조회")
    void should_ReturnMapping_When_FindById() {
        // Given
        Long id = 1L;
        when(tagAccountMappingMapper.selectByIdWithTags(id)).thenReturn(testMapping);

        // When
        TagAccountMapping result = tagAccountMappingService.findById(id);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(id);
        assertThat(result.getAccountCode()).isEqualTo("5120");
        
        verify(tagAccountMappingMapper).selectByIdWithTags(id);
    }

    @Test
    @DisplayName("TDD: 매핑 생성")
    void should_CreateMapping_When_ValidMappingProvided() {
        // Given
        TagAccountMapping newMapping = TagAccountMapping.builder()
                .tagId(40L)
                .accountCode("5140")
                .accountName("차량유지비")
                .isDefault(false)
                .priority(85)
                .build();

        // When
        TagAccountMapping result = tagAccountMappingService.createMapping(newMapping);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getTagId()).isEqualTo(40L);
        assertThat(result.getAccountCode()).isEqualTo("5140");
        
        verify(tagAccountMappingMapper).insertTagAccountMapping(newMapping);
        verify(redisTemplate).delete("tag_account_mappings:all");
    }

    @Test
    @DisplayName("TDD: 매핑 수정")
    void should_UpdateMapping_When_ValidMappingProvided() {
        // Given
        Long id = 1L;
        TagAccountMapping updateMapping = TagAccountMapping.builder()
                .tagId(10L)
                .accountCode("5150")
                .accountName("통신비")
                .priority(95)
                .build();

        // When
        TagAccountMapping result = tagAccountMappingService.updateMapping(id, updateMapping);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(id);
        assertThat(result.getAccountCode()).isEqualTo("5150");
        
        verify(tagAccountMappingMapper).updateTagAccountMapping(updateMapping);
        verify(redisTemplate).delete("tag_account_mappings:all");
    }

    @Test
    @DisplayName("TDD: 매핑 삭제")
    void should_DeleteMapping_When_ValidIdProvided() {
        // Given
        Long id = 1L;

        // When
        tagAccountMappingService.deleteMapping(id);

        // Then
        verify(tagAccountMappingMapper).deleteTagAccountMapping(id);
        verify(redisTemplate).delete("tag_account_mappings:all");
    }

    @Test
    @DisplayName("TDD: 전체 매핑 개수 조회")
    void should_ReturnCount_When_CountAll() {
        // Given
        when(tagAccountMappingMapper.countAll()).thenReturn(15L);

        // When
        long result = tagAccountMappingService.countAll();

        // Then
        assertThat(result).isEqualTo(15L);
        verify(tagAccountMappingMapper).countAll();
    }

    @Test
    @DisplayName("TDD: 기본 매핑 조회")
    void should_ReturnDefaultMappings_When_FindDefaultMappings() {
        // Given
        List<TagAccountMapping> defaultMappings = testMappingList.stream()
                .filter(mapping -> mapping.getIsDefault())
                .toList();
        when(tagAccountMappingMapper.selectDefaultMappings()).thenReturn(defaultMappings);

        // When
        List<TagAccountMapping> result = tagAccountMappingService.findDefaultMappings();

        // Then
        assertThat(result).isNotNull();
        assertThat(result).allMatch(mapping -> mapping.getIsDefault());
        verify(tagAccountMappingMapper).selectDefaultMappings();
    }

    @Test
    @DisplayName("TDD: 캐시 무효화")
    void should_InvalidateCache_When_InvalidateCacheCalled() {
        // Given
        Set<String> tagKeys = Set.of("tag_account_mappings:tag:1", "tag_account_mappings:tag:2");
        Set<String> accountKeys = Set.of("tag_account_mappings:account:5120", "tag_account_mappings:account:5130");
        
        when(redisTemplate.keys("tag_account_mappings:tag:*")).thenReturn(tagKeys);
        when(redisTemplate.keys("tag_account_mappings:account:*")).thenReturn(accountKeys);

        // When
        tagAccountMappingService.invalidateCache();

        // Then
        verify(redisTemplate).delete("tag_account_mappings:all");
        verify(redisTemplate).delete(tagKeys);
        verify(redisTemplate).delete(accountKeys);
    }

    @Test
    @DisplayName("TDD: 필터링 포함 매핑 조회 - 태그 ID 필터")
    void should_ReturnFilteredMappings_When_GetMappingsWithTagIdFilter() {
        // Given
        Long tagId = 10L;

        // When
        List<TagAccountMapping> result = tagAccountMappingService.getMappings(tagId, null, null);

        // Then
        assertThat(result).isNotNull();
        assertThat(result).allMatch(mapping -> tagId.equals(mapping.getTagId()));
    }

    @Test
    @DisplayName("TDD: 필터링 포함 매핑 조회 - 계정코드 필터")
    void should_ReturnFilteredMappings_When_GetMappingsWithAccountCodeFilter() {
        // Given
        String accountCode = "5201";

        // When
        List<TagAccountMapping> result = tagAccountMappingService.getMappings(null, accountCode, null);

        // Then
        assertThat(result).isNotNull();
        assertThat(result).allMatch(mapping -> accountCode.equals(mapping.getAccountCode()));
    }

    @Test
    @DisplayName("TDD: 필터링 포함 매핑 조회 - 기본 매핑 필터")
    void should_ReturnFilteredMappings_When_GetMappingsWithDefaultFilter() {
        // Given
        Boolean isDefault = true;

        // When
        List<TagAccountMapping> result = tagAccountMappingService.getMappings(null, null, isDefault);

        // Then
        assertThat(result).isNotNull();
        assertThat(result).allMatch(mapping -> isDefault.equals(mapping.getIsDefault()));
    }

    @Test
    @DisplayName("TDD: 조건부 매핑 테스트 - 심야 + 회식 조건")
    void should_ReturnEntertainmentAccount_When_TestConditionalMappingWithNightAndDining() {
        // Given
        TagAccountMappingController.ConditionalMappingTestRequest request = 
                new TagAccountMappingController.ConditionalMappingTestRequest();
        request.setTagId(3L);
        request.setTimeContext("late_night");
        request.setPreviousTag("회식");
        request.setAmount(30000L);

        // When
        TagAccountMappingController.ConditionalMappingTestResult result = 
                tagAccountMappingService.testConditionalMapping(request);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getTagId()).isEqualTo(3L);
        assertThat(result.isMatched()).isTrue();
        assertThat(result.getAccountCode()).isEqualTo("5101");
        assertThat(result.getAccountName()).isEqualTo("접대비");
        assertThat(result.getMatchedCondition()).isEqualTo("심야 + 회식");
        assertThat(result.getConfidence()).isEqualTo(0.85);
        assertThat(result.getReason()).isEqualTo("심야 시간대 회식 후 택시 이용");
    }

    @Test
    @DisplayName("TDD: 조건부 매핑 테스트 - 고액 거래 조건")
    void should_ReturnEntertainmentAccount_When_TestConditionalMappingWithHighAmount() {
        // Given
        TagAccountMappingController.ConditionalMappingTestRequest request = 
                new TagAccountMappingController.ConditionalMappingTestRequest();
        request.setTagId(3L);
        request.setTimeContext("business_hours");
        request.setAmount(60000L);

        // When
        TagAccountMappingController.ConditionalMappingTestResult result = 
                tagAccountMappingService.testConditionalMapping(request);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.isMatched()).isTrue();
        assertThat(result.getAccountCode()).isEqualTo("5101");
        assertThat(result.getAccountName()).isEqualTo("접대비");
        assertThat(result.getMatchedCondition()).isEqualTo("금액 > 50,000원");
        assertThat(result.getConfidence()).isEqualTo(0.80);
        assertThat(result.getReason()).isEqualTo("고액 거래로 접대비 가능성 높음");
    }

    @Test
    @DisplayName("TDD: 조건부 매핑 테스트 - 기본 규칙")
    void should_ReturnTransportAccount_When_TestConditionalMappingWithDefaultRule() {
        // Given
        TagAccountMappingController.ConditionalMappingTestRequest request = 
                new TagAccountMappingController.ConditionalMappingTestRequest();
        request.setTagId(3L);
        request.setTimeContext("business_hours");
        request.setAmount(15000L);

        // When
        TagAccountMappingController.ConditionalMappingTestResult result = 
                tagAccountMappingService.testConditionalMapping(request);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.isMatched()).isTrue();
        assertThat(result.getAccountCode()).isEqualTo("5301");
        assertThat(result.getAccountName()).isEqualTo("여비교통비");
        assertThat(result.getMatchedCondition()).isEqualTo("기본 규칙");
        assertThat(result.getConfidence()).isEqualTo(0.70);
        assertThat(result.getReason()).isEqualTo("기본 매핑 규칙 적용");
    }

    @Test
    @DisplayName("TDD: 매핑 시나리오 테스트 - 커피전문점")
    void should_ReturnWelfareAccount_When_TestMappingScenariosWithCoffeeShop() {
        // Given
        TagAccountMappingController.MappingScenarioRequest scenario = 
                new TagAccountMappingController.MappingScenarioRequest();
        scenario.setScenarioName("커피전문점 거래");
        scenario.setTransactionText("스타벅스 커피 주문");
        scenario.setAmount(6500L);
        scenario.setExpectedAccount("5201");
        scenario.setExpectedAccountName("복리후생비");
        
        List<TagAccountMappingController.MappingScenarioRequest> scenarios = Arrays.asList(scenario);

        // When
        List<TagAccountMappingController.MappingScenarioResult> results = 
                tagAccountMappingService.testMappingScenarios(scenarios);

        // Then
        assertThat(results).isNotNull();
        assertThat(results).hasSize(1);
        
        TagAccountMappingController.MappingScenarioResult result = results.get(0);
        assertThat(result.getScenarioName()).isEqualTo("커피전문점 거래");
        assertThat(result.getActualAccount()).isEqualTo("5201");
        assertThat(result.getActualAccountName()).isEqualTo("복리후생비");
        assertThat(result.isPassed()).isTrue();
    }

    @Test
    @DisplayName("TDD: 매핑 시나리오 테스트 - 택시 고액 거래")
    void should_ReturnEntertainmentAccount_When_TestMappingScenariosWithHighAmountTaxi() {
        // Given
        TagAccountMappingController.MappingScenarioRequest scenario = 
                new TagAccountMappingController.MappingScenarioRequest();
        scenario.setScenarioName("택시 고액 거래");
        scenario.setTransactionText("택시 이용");
        scenario.setAmount(65000L);
        scenario.setExpectedAccount("5101");
        scenario.setExpectedAccountName("접대비");
        
        List<TagAccountMappingController.MappingScenarioRequest> scenarios = Arrays.asList(scenario);

        // When
        List<TagAccountMappingController.MappingScenarioResult> results = 
                tagAccountMappingService.testMappingScenarios(scenarios);

        // Then
        assertThat(results).isNotNull();
        assertThat(results).hasSize(1);
        
        TagAccountMappingController.MappingScenarioResult result = results.get(0);
        assertThat(result.getScenarioName()).isEqualTo("택시 고액 거래");
        assertThat(result.getActualAccount()).isEqualTo("5101");
        assertThat(result.getActualAccountName()).isEqualTo("접대비");
        assertThat(result.isPassed()).isTrue();
    }

    @Test
    @DisplayName("TDD: 계정과목 목록 조회")
    void should_ReturnAccountsList_When_GetAccounts() {
        // When
        List<TagAccountMappingController.AccountInfo> result = tagAccountMappingService.getAccounts();

        // Then
        assertThat(result).isNotNull();
        assertThat(result).hasSize(5);
        
        // 주요 계정과목들이 포함되어 있는지 확인
        List<String> accountCodes = result.stream()
                .map(TagAccountMappingController.AccountInfo::getAccountCode)
                .toList();
        assertThat(accountCodes).contains("5101", "5204", "5301", "5401", "5901"); // AccountCodeConfig 확장: 5201→5204
        
        // 모든 계정과목이 활성화 상태인지 확인
        assertThat(result).allMatch(TagAccountMappingController.AccountInfo::isActive);
    }

    @Test
    @DisplayName("TDD: 매핑 통계 조회")
    void should_ReturnMappingStatistics_When_GetMappingStats() {
        // When
        TagAccountMappingController.MappingStatistics result = tagAccountMappingService.getMappingStats();

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getTotalMappings()).isGreaterThan(0);
        assertThat(result.getTotalAccounts()).isEqualTo(5); // getAccounts()에서 반환하는 계정과목 수
        assertThat(result.getAverageConfidence()).isGreaterThanOrEqualTo(0.0);
    }

    @Test
    @DisplayName("TDD: 조건부 규칙 생성")
    void should_CreateConditionalRule_When_ValidRuleProvided() {
        // Given
        TagAccountMappingController.ConditionalRule rule = new TagAccountMappingController.ConditionalRule();
        rule.setTagId(10L);
        rule.setRuleName("테스트 규칙");
        rule.setAccountCode("5120");
        rule.setAccountName("복리후생비");

        // When
        TagAccountMappingController.ConditionalRule result = tagAccountMappingService.createConditionalRule(rule);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getId()).isNotNull();
        assertThat(result.getTagId()).isEqualTo(10L);
        assertThat(result.getRuleName()).isEqualTo("테스트 규칙");
        assertThat(result.getPriority()).isEqualTo(50); // 기본값
        assertThat(result.isActive()).isTrue();
        
        verify(redisTemplate).delete("tag_account_mappings:all");
    }

    @Test
    @DisplayName("TDD: 조건부 규칙 조회")
    void should_ReturnConditionalRules_When_GetConditionalRules() {
        // Given
        Long tagId = 3L;

        // When
        List<TagAccountMappingController.ConditionalRule> result = 
                tagAccountMappingService.getConditionalRules(tagId);

        // Then
        assertThat(result).isNotNull();
        assertThat(result).allMatch(rule -> tagId.equals(rule.getTagId()));
        assertThat(result).allMatch(TagAccountMappingController.ConditionalRule::isActive);
    }

    @Test
    @DisplayName("TDD: 태그명으로 계정과목 코드 조회 - 커피전문점")
    void should_ReturnWelfareAccountCode_When_GetAccountCodeByTagWithCoffeeShop() {
        // Given
        String tagName = "커피전문점";

        // When
        String result = tagAccountMappingService.getAccountCodeByTag(tagName, testTransaction);

        // Then
        assertThat(result).isEqualTo("5204"); // AccountCodeConfig 확장: 복리후생비 5120→5204
    }

    @Test
    @DisplayName("TDD: 태그명으로 계정과목 코드 조회 - 주유소")
    void should_ReturnVehicleAccountCode_When_GetAccountCodeByTagWithGasStation() {
        // Given
        String tagName = "주유소";

        // When
        String result = tagAccountMappingService.getAccountCodeByTag(tagName, testTransaction);

        // Then
        assertThat(result).isEqualTo("5140"); // 차량유지비
    }

    @Test
    @DisplayName("TDD: 태그명으로 계정과목 코드 조회 - 편의점")
    void should_ReturnSuppliesAccountCode_When_GetAccountCodeByTagWithConvenienceStore() {
        // Given
        String tagName = "편의점";

        // When
        String result = tagAccountMappingService.getAccountCodeByTag(tagName, testTransaction);

        // Then
        assertThat(result).isEqualTo("5130"); // 소모품비
    }

    @Test
    @DisplayName("TDD: 태그명으로 계정과목 코드 조회 - 택시 고액")
    void should_ReturnEntertainmentAccountCode_When_GetAccountCodeByTagWithHighAmountTaxi() {
        // Given
        String tagName = "택시";
        TransactionEntity highAmountTransaction = TransactionEntity.builder()
                .id(2L)
                .rawText("택시 이용")
                .amount(60000L) // 50,000원 초과
                .transactionDate(LocalDateTime.now().toLocalDate())
                .build();

        // When
        String result = tagAccountMappingService.getAccountCodeByTag(tagName, highAmountTransaction);

        // Then
        assertThat(result).isEqualTo("5110"); // 접대비 (고액)
    }

    @Test
    @DisplayName("TDD: 태그명으로 계정과목 코드 조회 - 택시 저액")
    void should_ReturnTransportAccountCode_When_GetAccountCodeByTagWithLowAmountTaxi() {
        // Given
        String tagName = "택시";
        TransactionEntity lowAmountTransaction = TransactionEntity.builder()
                .id(3L)
                .rawText("택시 이용")
                .amount(15000L) // 50,000원 이하
                .transactionDate(LocalDateTime.now().toLocalDate())
                .build();

        // When
        String result = tagAccountMappingService.getAccountCodeByTag(tagName, lowAmountTransaction);

        // Then
        assertThat(result).isEqualTo("5230"); // 차량관련비 (교통비)
    }

    @Test
    @DisplayName("TDD: 태그명으로 계정과목 코드 조회 - 알려지지 않은 태그")
    void should_ReturnDefaultAccountCode_When_GetAccountCodeByTagWithUnknownTag() {
        // Given
        String unknownTagName = "알려지지않은태그";

        // When
        String result = tagAccountMappingService.getAccountCodeByTag(unknownTagName, testTransaction);

        // Then
        assertThat(result).isEqualTo("5130"); // 소모품비 (기본값)
    }

    @Test
    @DisplayName("TDD: 예외 처리 - 매핑 생성 실패")
    void should_ThrowException_When_CreateMappingFails() {
        // Given
        TagAccountMapping invalidMapping = TagAccountMapping.builder().build();
        doThrow(new RuntimeException("Database error")).when(tagAccountMappingMapper).insertTagAccountMapping(invalidMapping);

        // When & Then
        assertThatThrownBy(() -> {
            tagAccountMappingService.createMapping(invalidMapping);
        }).isInstanceOf(RuntimeException.class)
          .hasMessage("태그-계정과목 매핑 생성 실패");
    }

    @Test
    @DisplayName("TDD: 예외 처리 - 매핑 수정 실패")
    void should_ThrowException_When_UpdateMappingFails() {
        // Given
        Long id = 1L;
        TagAccountMapping updateMapping = TagAccountMapping.builder().build();
        doThrow(new RuntimeException("Database error")).when(tagAccountMappingMapper).updateTagAccountMapping(any());

        // When & Then
        assertThatThrownBy(() -> {
            tagAccountMappingService.updateMapping(id, updateMapping);
        }).isInstanceOf(RuntimeException.class)
          .hasMessage("태그-계정과목 매핑 수정 실패");
    }

    @Test
    @DisplayName("TDD: 예외 처리 - 매핑 삭제 실패")
    void should_ThrowException_When_DeleteMappingFails() {
        // Given
        Long id = 1L;
        doThrow(new RuntimeException("Database error")).when(tagAccountMappingMapper).deleteTagAccountMapping(id);

        // When & Then
        assertThatThrownBy(() -> {
            tagAccountMappingService.deleteMapping(id);
        }).isInstanceOf(RuntimeException.class)
          .hasMessage("태그-계정과목 매핑 삭제 실패");
    }

    @Test
    @DisplayName("TDD: 매핑 시나리오 테스트 - 실패 케이스")
    void should_ReturnFailedResult_When_TestMappingScenariosWithMismatch() {
        // Given
        TagAccountMappingController.MappingScenarioRequest scenario = 
                new TagAccountMappingController.MappingScenarioRequest();
        scenario.setScenarioName("실패 테스트");
        scenario.setTransactionText("알수없는 거래");
        scenario.setAmount(10000L);
        scenario.setExpectedAccount("5120"); // 복리후생비 기대
        scenario.setExpectedAccountName("복리후생비");
        
        List<TagAccountMappingController.MappingScenarioRequest> scenarios = Arrays.asList(scenario);

        // When
        List<TagAccountMappingController.MappingScenarioResult> results = 
                tagAccountMappingService.testMappingScenarios(scenarios);

        // Then
        assertThat(results).isNotNull();
        assertThat(results).hasSize(1);
        
        TagAccountMappingController.MappingScenarioResult result = results.get(0);
        assertThat(result.getScenarioName()).isEqualTo("실패 테스트");
        assertThat(result.getActualAccount()).isEqualTo("5901"); // 기타비용
        assertThat(result.getActualAccountName()).isEqualTo("기타비용");
        assertThat(result.isPassed()).isFalse(); // 기대값과 실제값이 다름
    }
}
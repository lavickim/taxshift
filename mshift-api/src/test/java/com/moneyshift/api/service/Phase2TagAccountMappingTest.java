package com.moneyshift.api.service;

import com.moneyshift.api.mapper.TagAccountMappingMapper;
import com.moneyshift.api.model.TagAccountMapping;
import com.moneyshift.api.model.TransactionEntity;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Phase 2 TDD: 태그-계정과목 매핑 시스템 테스트
 * 
 * 테스트 시나리오:
 * 1. 태그명 기반 계정과목 자동 조회
 * 2. 조건부 매핑 로직 (시간, 금액 기반)
 * 3. Redis 캐시 기반 성능 최적화
 * 4. 매핑 CRUD 작업
 * 5. 우선순위 기반 매핑 선택
 */
@SpringBootTest
@ActiveProfiles("test")
@Transactional
public class Phase2TagAccountMappingTest {

    @Autowired
    private TagAccountMappingService tagAccountMappingService;

    @Autowired
    private TagAccountMappingMapper tagAccountMappingMapper;

    @Autowired
    private RedisTemplate<String, Object> redisTemplate;

    private TransactionEntity sampleTransaction;

    @BeforeEach
    public void setUp() {
        // 캐시 클리어
        tagAccountMappingService.invalidateCache();
        
        // 샘플 거래 생성
        sampleTransaction = TransactionEntity.builder()
                .id(1L)
                .companyId("test-company")
                .amount(25000L)
                .transactionDate(LocalDate.now())
                .transactionType("EXPENSE")
                .rawText("스타벅스 강남점")
                .finalSuggestedTag("커피전문점")
                .build();
    }

    @Test
    @DisplayName("Phase 2-1: 커피전문점 태그 → 복리후생비 매핑")
    public void testCoffeeShopTagMapping() {
        // Given: 커피전문점 태그
        String tagName = "커피전문점";
        
        // When: 계정과목 조회
        String accountCode = tagAccountMappingService.getAccountCodeByTag(tagName, sampleTransaction);
        
        // Then: 복리후생비(5120) 반환
        assertEquals("5120", accountCode, "커피전문점은 복리후생비(5120)로 매핑되어야 함");
    }

    @Test
    @DisplayName("Phase 2-2: 주유소 태그 → 차량유지비 매핑")
    public void testGasStationTagMapping() {
        // Given: 주유소 태그와 거래
        String tagName = "주유소";
        TransactionEntity gasTransaction = TransactionEntity.builder()
                .id(2L)
                .companyId("test-company")
                .amount(80000L)
                .transactionDate(LocalDate.now())
                .transactionType("EXPENSE")
                .rawText("GS칼텍스 서울역점")
                .finalSuggestedTag("주유소")
                .build();
        
        // When: 계정과목 조회
        String accountCode = tagAccountMappingService.getAccountCodeByTag(tagName, gasTransaction);
        
        // Then: 차량유지비(5140) 반환
        assertEquals("5140", accountCode, "주유소는 차량유지비(5140)로 매핑되어야 함");
    }

    @Test
    @DisplayName("Phase 2-3: 음식점 태그 조건부 매핑 - 일반 시간대")
    public void testRestaurantTagMappingNormalHours() {
        // Given: 음식점 태그 (일반 시간대)
        String tagName = "음식점";
        TransactionEntity restaurantTransaction = TransactionEntity.builder()
                .id(3L)
                .companyId("test-company")
                .amount(45000L)
                .transactionDate(LocalDate.now()) // 일반 시간대로 가정
                .transactionType("EXPENSE")
                .rawText("맛있는집 본점")
                .finalSuggestedTag("음식점")
                .build();
        
        // When: 계정과목 조회
        String accountCode = tagAccountMappingService.getAccountCodeByTag(tagName, restaurantTransaction);
        
        // Then: 접대비(5110) 반환 (야간 시간이 아니므로)
        assertEquals("5110", accountCode, "음식점(일반시간)은 접대비(5110)로 매핑되어야 함");
    }

    @Test
    @DisplayName("Phase 2-4: 택시 태그 조건부 매핑 - 금액별 분기")
    public void testTaxiTagConditionalMapping() {
        // Given: 택시 태그 - 저액 거래
        String tagName = "택시";
        TransactionEntity lowAmountTaxi = TransactionEntity.builder()
                .id(4L)
                .companyId("test-company")
                .amount(15000L) // 50,000원 미만
                .transactionDate(LocalDate.now())
                .transactionType("EXPENSE")
                .rawText("카카오택시")
                .finalSuggestedTag("택시")
                .build();
        
        // When: 계정과목 조회 (저액)
        String lowAmountAccount = tagAccountMappingService.getAccountCodeByTag(tagName, lowAmountTaxi);
        
        // Then: 차량관련비(5230) 반환
        assertEquals("5230", lowAmountAccount, "택시(저액)는 차량관련비(5230)로 매핑되어야 함");
        
        // Given: 택시 태그 - 고액 거래
        TransactionEntity highAmountTaxi = TransactionEntity.builder()
                .id(5L)
                .companyId("test-company")
                .amount(65000L) // 50,000원 초과
                .transactionDate(LocalDate.now())
                .transactionType("EXPENSE")
                .rawText("고급택시")
                .finalSuggestedTag("택시")
                .build();
        
        // When: 계정과목 조회 (고액)
        String highAmountAccount = tagAccountMappingService.getAccountCodeByTag(tagName, highAmountTaxi);
        
        // Then: 접대비(5110) 반환
        assertEquals("5110", highAmountAccount, "택시(고액)는 접대비(5110)로 매핑되어야 함");
    }

    @Test
    @DisplayName("Phase 2-5: 편의점 태그 → 소모품비 매핑")
    public void testConvenienceStoreTagMapping() {
        // Given: 편의점 태그
        String tagName = "편의점";
        TransactionEntity convenienceTransaction = TransactionEntity.builder()
                .id(6L)
                .companyId("test-company")
                .amount(8500L)
                .transactionDate(LocalDate.now())
                .transactionType("EXPENSE")
                .rawText("세븐일레븐 사무용품")
                .finalSuggestedTag("편의점")
                .build();
        
        // When: 계정과목 조회
        String accountCode = tagAccountMappingService.getAccountCodeByTag(tagName, convenienceTransaction);
        
        // Then: 소모품비(5130) 반환
        assertEquals("5130", accountCode, "편의점은 소모품비(5130)로 매핑되어야 함");
    }

    @Test
    @DisplayName("Phase 2-6: 통신 태그 → 통신비 매핑")
    public void testCommunicationTagMapping() {
        // Given: 통신 태그
        String tagName = "통신";
        TransactionEntity communicationTransaction = TransactionEntity.builder()
                .id(7L)
                .companyId("test-company")
                .amount(89000L)
                .transactionDate(LocalDate.now())
                .transactionType("EXPENSE")
                .rawText("SKT 휴대폰 요금")
                .finalSuggestedTag("통신")
                .build();
        
        // When: 계정과목 조회
        String accountCode = tagAccountMappingService.getAccountCodeByTag(tagName, communicationTransaction);
        
        // Then: 통신비(5150) 반환
        assertEquals("5150", accountCode, "통신은 통신비(5150)로 매핑되어야 함");
    }

    @Test
    @DisplayName("Phase 2-7: 매핑되지 않은 태그 → 기본 계정과목")
    public void testUnmappedTagDefaultAccount() {
        // Given: 매핑되지 않은 태그
        String tagName = "알수없는태그";
        
        // When: 계정과목 조회
        String accountCode = tagAccountMappingService.getAccountCodeByTag(tagName, sampleTransaction);
        
        // Then: 기본 계정과목 소모품비(5130) 반환
        assertEquals("5130", accountCode, "매핑되지 않은 태그는 기본 계정과목(5130)을 반환해야 함");
    }

    @Test
    @DisplayName("Phase 2-8: Redis 캐시 동작 검증")
    public void testRedisCacheOperation() {
        // Given: 캐시가 비어있는 상태에서 시작
        String cacheKey = "tag_account_mappings:all";
        redisTemplate.delete(cacheKey);
        
        // When: 첫 번째 조회 (DB에서 조회 후 캐시 저장)
        List<TagAccountMapping> firstCall = tagAccountMappingService.findAllMappings();
        
        // Then: 캐시에 저장되었는지 확인
        List<TagAccountMapping> cachedMappings = (List<TagAccountMapping>) redisTemplate.opsForValue().get(cacheKey);
        assertNotNull(cachedMappings, "캐시에 데이터가 저장되어야 함");
        
        // When: 두 번째 조회 (캐시에서 조회)
        List<TagAccountMapping> secondCall = tagAccountMappingService.findAllMappings();
        
        // Then: 같은 결과 반환 (캐시 히트)
        assertEquals(firstCall.size(), secondCall.size(), "캐시된 데이터와 동일한 결과를 반환해야 함");
    }

    @Test
    @DisplayName("Phase 2-9: 캐시 무효화 검증")
    public void testCacheInvalidation() {
        // Given: 캐시에 데이터가 있는 상태
        List<TagAccountMapping> initialMappings = tagAccountMappingService.findAllMappings();
        String cacheKey = "tag_account_mappings:all";
        assertNotNull(redisTemplate.opsForValue().get(cacheKey), "캐시에 데이터가 있어야 함");
        
        // When: 캐시 무효화
        tagAccountMappingService.invalidateCache();
        
        // Then: 캐시가 삭제되었는지 확인
        Object cachedData = redisTemplate.opsForValue().get(cacheKey);
        assertNull(cachedData, "캐시 무효화 후 데이터가 삭제되어야 함");
    }

    @Test
    @DisplayName("Phase 2-10: 다중 태그 매핑 검증")
    public void testMultipleTagMapping() {
        // Given: 여러 태그들
        String[] tags = {"커피전문점", "주유소", "편의점", "음식점", "택시", "통신"};
        String[] expectedAccounts = {"5120", "5140", "5130", "5110", "5230", "5150"};
        
        // When & Then: 각 태그별 올바른 계정과목 매핑 확인
        for (int i = 0; i < tags.length; i++) {
            String actualAccount = tagAccountMappingService.getAccountCodeByTag(tags[i], sampleTransaction);
            
            // 택시의 경우 금액에 따라 다르므로 별도 처리
            if ("택시".equals(tags[i])) {
                assertTrue("5110".equals(actualAccount) || "5230".equals(actualAccount), 
                    "택시는 금액에 따라 5110 또는 5230이어야 함");
            } else {
                assertEquals(expectedAccounts[i], actualAccount, 
                    String.format("태그 '%s'는 계정과목 '%s'로 매핑되어야 함", tags[i], expectedAccounts[i]));
            }
        }
    }

    @Test
    @DisplayName("Phase 2-11: 예외 상황 처리 검증")
    public void testExceptionHandling() {
        // Given: null 태그명
        String nullTag = null;
        
        // When: 계정과목 조회
        String accountCode = tagAccountMappingService.getAccountCodeByTag(nullTag, sampleTransaction);
        
        // Then: 기본 계정과목 반환 (예외 발생하지 않음)
        assertEquals("5130", accountCode, "null 태그에 대해서도 기본 계정과목을 반환해야 함");
        
        // Given: 빈 태그명
        String emptyTag = "";
        
        // When: 계정과목 조회
        String emptyAccountCode = tagAccountMappingService.getAccountCodeByTag(emptyTag, sampleTransaction);
        
        // Then: 기본 계정과목 반환
        assertEquals("5130", emptyAccountCode, "빈 태그에 대해서도 기본 계정과목을 반환해야 함");
    }

    @Test
    @DisplayName("Phase 2-12: 매핑 통계 기능 검증")
    public void testMappingStatistics() {
        // When: 매핑 통계 조회
        var stats = tagAccountMappingService.getMappingStats();
        
        // Then: 통계 데이터 검증
        assertNotNull(stats, "매핑 통계가 반환되어야 함");
        assertTrue(stats.getTotalMappings() >= 0, "총 매핑 수는 0 이상이어야 함");
        assertTrue(stats.getTotalAccounts() >= 0, "총 계정과목 수는 0 이상이어야 함");
        assertTrue(stats.getAverageConfidence() >= 0.0, "평균 신뢰도는 0 이상이어야 함");
    }

    @Test
    @DisplayName("Phase 2-13: 계정과목 목록 조회 검증")
    public void testGetAccounts() {
        // When: 계정과목 목록 조회
        var accounts = tagAccountMappingService.getAccounts();
        
        // Then: 계정과목 목록 검증
        assertNotNull(accounts, "계정과목 목록이 반환되어야 함");
        assertFalse(accounts.isEmpty(), "계정과목 목록이 비어있지 않아야 함");
        
        // 필수 계정과목들이 포함되어 있는지 확인
        boolean hasExpenseAccounts = accounts.stream()
                .anyMatch(account -> account.getAccountCode().startsWith("5"));
        assertTrue(hasExpenseAccounts, "비용 계정과목(5xxx)이 포함되어야 함");
    }
}
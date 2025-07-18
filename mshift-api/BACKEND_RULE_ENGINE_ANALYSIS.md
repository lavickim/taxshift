# MoneyShift API Backend Rule Engine 분석 보고서

## 📋 개요

MoneyShift API는 **4-Layer 거래 분류 파이프라인**을 구현한 Spring Boot 기반 Java 백엔드 시스템입니다. 키워드 기반 거래 태깅과 계정과목 자동 매핑을 통해 금융 거래 데이터를 효율적으로 분류합니다.

**주요 특징:**
- Redis 캐싱 기반 고성능 처리
- 키워드-태그-계정과목 3단계 매핑
- 신뢰도 기반 자동/수동 처리 분기
- 확장 가능한 레이어 아키텍처

## 🏗️ 핵심 아키텍처: 4-Layer Processing Pipeline

### Layer 0: Redis 캐싱 (즉시 응답)
```
🔍 목적: 이전 분류 결과의 즉시 반환
⚡ 성능: < 1ms 응답 시간
🕒 TTL: 5분 (거래 분류 결과)
🔧 구현: RedisCacheService
🔑 캐시 키: classification:${transactionTextHash}
```

**캐시 전략:**
- **키워드 그룹**: 1시간 TTL
- **태그 매핑**: 30분 TTL  
- **거래 분류 결과**: 5분 TTL
- **통계 데이터**: 10분 TTL
- **패턴 매칭**: 24시간 TTL

### Layer 1: 키워드 패턴 매칭 (95% 정확도 목표)
```
🔍 목적: 키워드 추출, 패턴 매칭, 동적 브랜드 검색을 통한 거래 분류
⚡ 성능: 10-50ms 처리 시간 (캐시 히트 시 < 1ms)
🎯 정확도: 95% 목표 (현재 약 85-90%)
🔧 구현: KeywordExtractionEngine, KeywordSystemController
📊 데이터: 80개 키워드 그룹, 62개 태그-계정과목 매핑
```

## 📋 Layer 1 상세 구현 분석

### 🏗️ 핵심 클래스 구조

#### 1. KeywordExtractionEngine
**위치**: `com.moneyshift.api.service.KeywordExtractionEngine`
**역할**: 거래 분류의 핵심 엔진

**주요 메서드:**
```java
// 메인 진입점 - 거래 텍스트를 받아 분류 결과 반환
public LayerProcessingResult extractAndMatch(String transactionText, TransactionContext context)

// 키워드 추출 - 정규화 및 토큰화
private List<String> extractKeywords(String text)

// 키워드 그룹 매칭 - 추출된 키워드로 그룹 찾기
private List<KeywordGroup> matchKeywordGroups(List<String> keywords)

// 동적 브랜드 매칭 - 키워드 매칭 실패 시 폴백
private LayerProcessingResult tryBrandMatching(String transactionText)
```

#### 2. KeywordSystemController
**위치**: `com.moneyshift.api.controller.KeywordSystemController`
**역할**: 키워드 분류 API 엔드포인트 제공

**핵심 엔드포인트:**
```java
@PostMapping("/v2/keyword-system/classify")
public ResponseEntity<TransactionTaggingResult> classifyTransaction(@RequestBody JsonNode request)
```

#### 3. KeywordGroupService
**위치**: `com.moneyshift.api.service.KeywordGroupService`
**역할**: 키워드 그룹 관리 및 캐싱

**캐싱 전략:**
```java
// 모든 활성 키워드 그룹 1시간 캐싱
@Cacheable(value = "keywordGroups", key = "'all'")
public List<KeywordGroup> findAllActiveGroups()

// 카테고리별 키워드 그룹 30분 캐싱
@Cacheable(value = "keywordGroups", key = "'category:' + #category")
public List<KeywordGroup> findGroupsByCategory(String category)
```

#### 4. TagMappingService
**위치**: `com.moneyshift.api.service.TagMappingService`
**역할**: 키워드-태그-계정과목 매핑 관리

### 🔄 처리 흐름 상세 분석

#### Step 1: 캐시 확인 (< 1ms)
```java
// Redis 캐시 키 생성
String cacheKey = "classification:" + transactionText.hashCode();

// 캐시에서 이전 분류 결과 조회
LayerProcessingResult cachedResult = redisCacheService.getClassificationResult(cacheKey);
if (cachedResult != null) {
    log.debug("캐시 히트: {}", cacheKey);
    return cachedResult; // 즉시 반환
}
```

#### Step 2: 텍스트 정규화 및 키워드 추출 (1-5ms)
```java
// 1단계: 텍스트 정규화
String normalized = transactionText
    .replaceAll("[^가-힣a-zA-Z0-9\\s]", " ")  // 특수문자 제거
    .replaceAll("\\s+", " ")                   // 연속 공백 정리
    .trim()
    .toLowerCase();

// 2단계: 토큰 분리
String[] tokens = normalized.split("[\\s\\*\\-\\_\\(\\)\\[\\]\\{\\}]+");

// 3단계: 키워드 필터링
List<String> keywords = Arrays.stream(tokens)
    .filter(token -> token.length() >= 2)     // 2글자 이상
    .filter(token -> !isNumeric(token))       // 숫자 제외
    .filter(token -> !isStopWord(token))      // 불용어 제외
    .collect(Collectors.toList());

log.debug("추출된 키워드: {}", keywords);
```

**키워드 추출 예시:**
```
입력: "스타벅스강남점 아메리카노 4,500원 신한카드 승인"
정규화: "스타벅스강남점 아메리카노 4500원 신한카드 승인"
토큰: ["스타벅스강남점", "아메리카노", "4500원", "신한카드", "승인"]
키워드: ["스타벅스강남점", "아메리카노", "신한카드"]
```

#### Step 3: 키워드 그룹 매칭 (5-15ms)
```java
// 모든 활성 키워드 그룹 조회 (캐시됨)
List<KeywordGroup> allGroups = keywordGroupService.findAllActiveGroups();

List<KeywordGroupMatch> matches = new ArrayList<>();

for (KeywordGroup group : allGroups) {
    // 주 키워드 매칭
    if (extractedKeywords.stream()
            .anyMatch(keyword -> keyword.contains(group.getPrimaryKeyword().toLowerCase()))) {
        matches.add(new KeywordGroupMatch(group, group.getPrimaryKeyword(), 
                                        group.getConfidenceBase()));
        continue;
    }
    
    // 동의어 매칭
    for (String synonym : group.getSynonyms()) {
        if (extractedKeywords.stream()
                .anyMatch(keyword -> keyword.contains(synonym.toLowerCase()))) {
            matches.add(new KeywordGroupMatch(group, synonym, 
                                            group.getConfidenceBase() * 0.9)); // 동의어는 약간 낮은 신뢰도
            break;
        }
    }
}

// 우선순위 정렬: 키워드 길이 > 신뢰도 > 사용 횟수
matches.sort((a, b) -> {
    int lengthCompare = Integer.compare(b.getMatchedKeyword().length(), 
                                       a.getMatchedKeyword().length());
    if (lengthCompare != 0) return lengthCompare;
    
    int confidenceCompare = Double.compare(b.getConfidence(), a.getConfidence());
    if (confidenceCompare != 0) return confidenceCompare;
    
    return Integer.compare(b.getGroup().getUsageCount(), a.getGroup().getUsageCount());
});
```

**매칭 예시:**
```
키워드: ["스타벅스강남점"]
매칭된 그룹:
1. KeywordGroup(id=10, groupName="스타벅스", primaryKeyword="스타벅스", 
                 synonyms=["STARBUCKS", "스벅"], category="카페", confidenceBase=0.85)

우선순위 계산:
- 키워드 길이: "스타벅스" = 3글자
- 신뢰도: 0.85
- 사용 횟수: 245회
→ 최종 선택됨
```

#### Step 4: 동적 브랜드 매칭 (키워드 매칭 실패 시)
```java
if (matches.isEmpty()) {
    log.debug("키워드 그룹 매칭 실패, 브랜드 테이블 검색 시도");
    return tryBrandMatching(transactionText, extractedKeywords);
}

private LayerProcessingResult tryBrandMatching(String text, List<String> keywords) {
    // 1단계: 정확 매칭
    List<Brand> exactMatches = brandService.findByExactMatch(text);
    
    // 2단계: 부분 매칭
    if (exactMatches.isEmpty()) {
        for (String keyword : keywords) {
            List<Brand> partialMatches = brandService.findByPartialMatch(keyword);
            if (!partialMatches.isEmpty()) {
                exactMatches.addAll(partialMatches);
                break;
            }
        }
    }
    
    if (!exactMatches.isEmpty()) {
        Brand bestBrand = exactMatches.get(0); // 첫 번째 결과 사용
        
        // 브랜드 사용 횟수 증가
        brandUsageService.incrementUsage(bestBrand.getBrandName());
        
        // 자동 키워드 그룹 등록 체크
        if (brandUsageService.getUsageCount(bestBrand.getBrandName()) >= AUTO_KEYWORD_THRESHOLD) {
            autoRegisterBrandAsKeywordGroup(bestBrand);
        }
        
        return LayerProcessingResult.builder()
            .matched(true)
            .processingPath("DYNAMIC_BRAND")
            .tag(bestBrand.getPrimaryTag())
            .accountName(bestBrand.getDefaultAccount())
            .confidence(0.80) // 브랜드 매칭 기본 신뢰도
            .extractedKeywords(keywords)
            .build();
    }
    
    return LayerProcessingResult.builder()
        .matched(false)
        .processingPath("NO_MATCH")
        .build();
}
```

**브랜드 매칭 예시:**
```sql
-- 정확 매칭 쿼리
SELECT * FROM franchise_brands 
WHERE LOWER('맥도날드 강남점 빅맥세트') LIKE LOWER(CONCAT('%', brand_name, '%'))
   OR LOWER('맥도날드 강남점 빅맥세트') LIKE LOWER(CONCAT('%', company_name, '%'))
ORDER BY LENGTH(brand_name) DESC;

-- 결과: Brand(brandName="맥도날드", companyName="맥도날드코리아", primaryTag="패스트푸드")
```

#### Step 5: 태그 매핑 (2-5ms)
```java
// 선택된 키워드 그룹의 태그 매핑 조회
List<KeywordTagMapping> tagMappings = keywordTagMappingService
    .findMappingsByKeywordGroup(selectedGroup.getId());

// 신뢰도와 우선순위 기반 정렬
KeywordTagMapping bestMapping = tagMappings.stream()
    .filter(mapping -> mapping.isActive())
    .max(Comparator
        .comparing(KeywordTagMapping::getPriority)          // 우선순위 우선
        .thenComparing(KeywordTagMapping::getConfidenceScore) // 신뢰도 다음
        .thenComparing(KeywordTagMapping::getUsageCount))     // 사용 횟수 마지막
    .orElse(null);

if (bestMapping != null) {
    Tag selectedTag = tagService.findById(bestMapping.getTagId());
    log.debug("선택된 태그: {} (신뢰도: {})", selectedTag.getTagName(), 
              bestMapping.getConfidenceScore());
}
```

#### Step 6: 계정과목 매핑 (2-5ms)
```java
// 선택된 태그의 계정과목 매핑 조회
List<TagAccountMapping> accountMappings = tagAccountMappingService
    .findMappingsByTag(selectedTag.getId());

// 우선순위와 조건 확인
TagAccountMapping selectedMapping = accountMappings.stream()
    .filter(mapping -> mapping.isActive())
    .filter(mapping -> evaluateCondition(mapping.getMappingCondition(), context))
    .max(Comparator
        .comparing(TagAccountMapping::getPriority)
        .thenComparing(TagAccountMapping::isDefault))
    .orElse(accountMappings.get(0)); // 기본값 사용

String accountCode = selectedMapping.getAccountCode();
String accountName = selectedMapping.getAccountName();
```

#### Step 7: 신뢰도 계산 (1-3ms)
```java
// ConfidenceEngine을 통한 종합 신뢰도 계산
ConfidenceScore finalScore = confidenceEngine.calculateConfidence(
    ConfidenceRequest.builder()
        .keywordGroup(selectedGroup)
        .tagMapping(bestMapping)
        .accountMapping(selectedMapping)
        .transactionContext(context)
        .extractedKeywords(extractedKeywords)
        .build()
);

double finalConfidence = finalScore.getTotalScore();
```

### 🎯 신뢰도 계산 알고리즘

#### ConfidenceEngine 클래스
**위치**: `com.moneyshift.api.service.ConfidenceEngine`

#### 신뢰도 구성 요소 (가중치 기반)
```java
public class ConfidenceScore {
    private BigDecimal patternScore;    // 40% 가중치
    private BigDecimal historyScore;    // 30% 가중치  
    private BigDecimal contextScore;    // 30% 가중치
    private BigDecimal totalScore;      // 최종 점수
}
```

#### 1. 패턴 점수 (40% 가중치)
```java
private BigDecimal calculatePatternScore(ConfidenceRequest request) {
    BigDecimal baseScore = request.getKeywordGroup().getConfidenceBase(); // 기본 0.7
    
    // 키워드 개수 보너스
    int keywordCount = request.getExtractedKeywords().size();
    if (keywordCount > 1) {
        baseScore = baseScore.add(BigDecimal.valueOf(keywordCount * 0.05)); // 키워드당 +5%
    }
    
    // 키워드 길이 보너스 (긴 키워드 = 더 구체적)
    String longestKeyword = request.getExtractedKeywords().stream()
        .max(Comparator.comparing(String::length))
        .orElse("");
    
    if (longestKeyword.length() >= 5) {
        baseScore = baseScore.add(BigDecimal.valueOf(0.10)); // +10%
    } else if (longestKeyword.length() >= 3) {
        baseScore = baseScore.add(BigDecimal.valueOf(0.05)); // +5%
    }
    
    // 매핑 신뢰도 곱셈
    BigDecimal mappingConfidence = request.getTagMapping().getConfidenceScore();
    return baseScore.multiply(mappingConfidence);
}
```

#### 2. 히스토리 점수 (30% 가중치)
```java
private BigDecimal calculateHistoryScore(ConfidenceRequest request) {
    String ruleId = request.getKeywordGroup().getId().toString();
    
    // 사용자 피드백 통계 조회
    FeedbackStats stats = feedbackService.getFeedbackStats(ruleId, "KEYWORD_MAPPING");
    
    int totalFeedback = stats.getPositiveCount() + stats.getNegativeCount();
    if (totalFeedback == 0) {
        return BigDecimal.valueOf(0.70); // 기본값
    }
    
    // 성공률 계산
    BigDecimal successRate = BigDecimal.valueOf(stats.getPositiveCount())
        .divide(BigDecimal.valueOf(totalFeedback), 2, RoundingMode.HALF_UP);
    
    // 충분한 피드백 보너스
    if (totalFeedback >= 10) {
        successRate = successRate.add(BigDecimal.valueOf(0.10)); // +10%
    }
    
    // 사용 횟수 보너스
    int usageCount = request.getTagMapping().getUsageCount();
    if (usageCount >= 100) {
        successRate = successRate.add(BigDecimal.valueOf(0.05)); // +5%
    }
    
    return successRate.min(BigDecimal.ONE); // 최대 1.0으로 제한
}
```

#### 3. 컨텍스트 점수 (30% 가중치)
```java
private BigDecimal calculateContextScore(ConfidenceRequest request) {
    BigDecimal contextScore = BigDecimal.valueOf(0.70); // 기본값
    TransactionContext context = request.getTransactionContext();
    String category = request.getKeywordGroup().getCategory();
    
    // 시간대 컨텍스트
    contextScore = contextScore.add(calculateTimeContext(category, context.getTransactionTime()));
    
    // 금액 컨텍스트  
    contextScore = contextScore.add(calculateAmountContext(category, context.getAmount()));
    
    // 요일 컨텍스트
    contextScore = contextScore.add(calculateDayContext(category, context.getDayOfWeek()));
    
    return contextScore.min(BigDecimal.ONE);
}

private BigDecimal calculateTimeContext(String category, LocalTime time) {
    int hour = time.getHour();
    
    switch (category) {
        case "카페":
            if (hour >= 7 && hour <= 10) return BigDecimal.valueOf(0.15); // 모닝타임
            if (hour >= 14 && hour <= 16) return BigDecimal.valueOf(0.10); // 오후타임
            break;
        case "편의점":
            if (hour >= 22 || hour <= 6) return BigDecimal.valueOf(0.15); // 야간타임
            break;
        case "주유소":
            if (hour >= 6 && hour <= 22) return BigDecimal.valueOf(0.10); // 주간
            break;
    }
    return BigDecimal.ZERO;
}

private BigDecimal calculateAmountContext(String category, BigDecimal amount) {
    switch (category) {
        case "카페":
            if (amount.compareTo(BigDecimal.valueOf(3000)) >= 0 && 
                amount.compareTo(BigDecimal.valueOf(15000)) <= 0) {
                return BigDecimal.valueOf(0.10); // 일반적인 카페 금액
            }
            break;
        case "주유소":
            if (amount.compareTo(BigDecimal.valueOf(30000)) >= 0) {
                return BigDecimal.valueOf(0.10); // 주유 일반 금액
            }
            break;
        case "편의점":
            if (amount.compareTo(BigDecimal.valueOf(1000)) >= 0 && 
                amount.compareTo(BigDecimal.valueOf(20000)) <= 0) {
                return BigDecimal.valueOf(0.10);
            }
            break;
    }
    return BigDecimal.ZERO;
}
```

#### 최종 신뢰도 계산
```java
public ConfidenceScore calculateFinalConfidence(ConfidenceRequest request) {
    BigDecimal patternScore = calculatePatternScore(request);
    BigDecimal historyScore = calculateHistoryScore(request);
    BigDecimal contextScore = calculateContextScore(request);
    
    // 가중 평균 계산
    BigDecimal finalScore = patternScore.multiply(BigDecimal.valueOf(0.4))
        .add(historyScore.multiply(BigDecimal.valueOf(0.3)))
        .add(contextScore.multiply(BigDecimal.valueOf(0.3)));
    
    return ConfidenceScore.builder()
        .patternScore(patternScore)
        .historyScore(historyScore)  
        .contextScore(contextScore)
        .totalScore(finalScore)
        .build();
}
```

### 🏆 우선순위 시스템

#### 우선순위 결정 요소 (순서대로)
1. **키워드 길이**: 더 긴 키워드 = 더 구체적 = 높은 우선순위
2. **매핑 우선순위**: `keyword_tag_mappings.priority` 필드 (0-200)
3. **신뢰도**: `confidence_score` 높은 순
4. **사용 횟수**: `usage_count` 많은 순

#### 매핑 우선순위 정의
```java
public enum MappingPriority {
    BRAND_EXACT_MATCH(150),      // 브랜드 정확 매칭
    KEYWORD_LONG(120),           // 긴 키워드 (5글자 이상)
    KEYWORD_MEDIUM(100),         // 중간 키워드 (3-4글자)
    KEYWORD_SHORT(80),           // 짧은 키워드 (2글자)
    DYNAMIC_BRAND(150),          // 동적 브랜드 매칭
    GENERIC_PATTERN(50),         // 일반 패턴
    FALLBACK(20);                // 폴백 패턴
    
    private final int value;
}
```

#### 실제 우선순위 계산 예시
```java
// 여러 매칭이 발견된 경우의 우선순위 정렬
List<KeywordGroupMatch> sortedMatches = matches.stream()
    .sorted(Comparator
        .comparing((KeywordGroupMatch m) -> m.getMatchedKeyword().length()).reversed()  // 키워드 길이 내림차순
        .thenComparing((KeywordGroupMatch m) -> m.getPriority()).reversed()             // 우선순위 내림차순
        .thenComparing((KeywordGroupMatch m) -> m.getConfidence()).reversed()           // 신뢰도 내림차순
        .thenComparing((KeywordGroupMatch m) -> m.getUsageCount()).reversed())          // 사용횟수 내림차순
    .collect(Collectors.toList());

KeywordGroupMatch winner = sortedMatches.get(0);
```

### 📊 캐싱 전략 상세

#### Redis 캐시 구조
```java
// 캐시 키 패턴
classification:{transactionHashCode}          // 분류 결과 (TTL: 5분)
keyword_groups:all                           // 전체 키워드 그룹 (TTL: 1시간)
keyword_groups:category:{categoryName}       // 카테고리별 그룹 (TTL: 30분)
tag_mappings:keyword:{keywordGroupId}        // 키워드-태그 매핑 (TTL: 30분)
tag_mappings:tag:{tagId}                     // 태그-계정과목 매핑 (TTL: 30분)
stats:mapping                                // 매핑 통계 (TTL: 10분)
brand_usage:{brandName}                      // 브랜드 사용 횟수 (TTL: 24시간)
```

#### 캐시 무효화 전략
```java
@Service
public class CacheInvalidationService {
    
    // 키워드 그룹 변경 시
    public void invalidateKeywordGroupCache(Long keywordGroupId) {
        redisTemplate.delete("keyword_groups:all");
        redisTemplate.delete("keyword_groups:category:*");
        redisTemplate.delete("tag_mappings:keyword:" + keywordGroupId);
    }
    
    // 태그 매핑 변경 시
    public void invalidateTagMappingCache(Long tagId) {
        redisTemplate.delete("tag_mappings:tag:" + tagId);
        redisTemplate.delete("stats:mapping");
    }
    
    // 전체 캐시 초기화
    public void invalidateAllCache() {
        Set<String> keys = redisTemplate.keys("classification:*");
        if (!keys.isEmpty()) {
            redisTemplate.delete(keys);
        }
        redisTemplate.delete("keyword_groups:*");
        redisTemplate.delete("tag_mappings:*");
        redisTemplate.delete("stats:*");
    }
}
```

### 🔧 성능 최적화

#### 1. 배치 로딩
```java
@PostConstruct
public void initializeCache() {
    // 시스템 시작 시 모든 키워드 그룹 미리 로딩
    List<KeywordGroup> allGroups = keywordGroupService.findAllActiveGroups();
    log.info("키워드 그룹 {} 개 캐시에 로딩됨", allGroups.size());
    
    // 자주 사용되는 태그 매핑도 미리 로딩
    tagMappingService.preloadFrequentMappings();
}
```

#### 2. 조기 종료 최적화
```java
// 높은 신뢰도 매칭 시 즉시 반환
if (finalConfidence.compareTo(BigDecimal.valueOf(0.95)) >= 0) {
    log.debug("높은 신뢰도 매칭 ({}), 조기 종료", finalConfidence);
    return buildResult(match, finalConfidence);
}
```

#### 3. 병렬 처리
```java
// 브랜드 매칭 시 여러 토큰 병렬 처리
List<CompletableFuture<List<Brand>>> futures = keywords.stream()
    .map(keyword -> CompletableFuture.supplyAsync(() -> 
        brandService.findByPartialMatch(keyword), executorService))
    .collect(Collectors.toList());

List<Brand> allBrands = futures.stream()
    .flatMap(future -> future.join().stream())
    .collect(Collectors.toList());
```

### 📝 실제 처리 예시

#### 예시 1: 카페 거래
```
입력: "스타벅스 강남점 아메리카노 4,500원"

Step 1: 캐시 확인
- Key: "classification:123456789"
- Result: 캐시 미스

Step 2: 키워드 추출
- 정규화: "스타벅스 강남점 아메리카노 4500원"
- 키워드: ["스타벅스", "강남점", "아메리카노"]

Step 3: 키워드 그룹 매칭
- 매칭: KeywordGroup(id=10, groupName="스타벅스", primaryKeyword="스타벅스", category="카페")
- 우선순위: 길이(3) + 신뢰도(0.85) + 사용횟수(245)

Step 4: 태그 매핑
- 매핑: KeywordTagMapping(tagId=5, confidence=0.90, priority=100)
- 태그: Tag(id=5, tagName="카페", category="식음료")

Step 5: 계정과목 매핑  
- 매핑: TagAccountMapping(accountCode="603", accountName="지급수수료", priority=1)

Step 6: 신뢰도 계산
- 패턴 점수: 0.85 (기본) + 0.05 (키워드 수) = 0.90
- 히스토리 점수: 0.85 (245회 사용, 긍정 피드백 90%)
- 컨텍스트 점수: 0.70 + 0.10 (금액) + 0.05 (시간) = 0.85
- 최종: (0.90×0.4) + (0.85×0.3) + (0.85×0.3) = 0.87

Step 7: 결과 생성 및 캐싱
- 신뢰도 0.87 → 사용자 질문 범위
- Redis에 5분간 캐싱
- 처리 시간: 23ms
```

#### 예시 2: 브랜드 폴백 매칭
```
입력: "올리브영 화장품 구매"

Step 1-3: 키워드 매칭 실패
- 키워드: ["올리브영", "화장품", "구매"]  
- 키워드 그룹에서 "올리브영" 매칭 실패

Step 4: 동적 브랜드 매칭
- 브랜드 테이블 검색: Brand(brandName="올리브영", category="드럭스토어")
- 매칭 성공, 사용 횟수 증가 (4회 → 5회)
- 임계값 도달 → 자동 키워드 그룹 등록

Step 5: 결과 반환
- 태그: "드럭스토어"
- 계정과목: "소모품비" 
- 신뢰도: 0.80 (브랜드 매칭 기본값)
- 처리 경로: "DYNAMIC_BRAND"
```

이 문서는 Layer 1 키워드 패턴 매칭 시스템의 완전한 구현 가이드로, 향후 개발 작업의 기반이 될 것입니다.

### Layer 2: ML 추론 (미구현)
```
❌ 상태: 향후 구현 예정
🔍 목적: 유사도 매칭 기반 분류
🎯 정확도: Layer 1 실패 건의 80% 처리 목표
```

### Layer 3: LLM 폴백 (미구현)
```
❌ 상태: Gemini AI 통합 예정
🔍 목적: 복잡한/미지의 거래 처리
🎯 정확도: 모든 거래 처리 보장
```

## 🛠️ 데이터베이스 스키마

### 핵심 테이블 구조

#### 1. 키워드 그룹 (keyword_groups)
```sql
id              BIGINT PRIMARY KEY
group_name      VARCHAR(100) NOT NULL    -- 그룹 이름
primary_keyword VARCHAR(100) NOT NULL    -- 주 키워드
synonyms        TEXT[]                   -- 동의어 배열
category        VARCHAR(50)              -- 카테고리
confidence_base DECIMAL(3,2)             -- 기본 신뢰도
is_active       BOOLEAN DEFAULT true     -- 활성 상태
created_at      TIMESTAMP
updated_at      TIMESTAMP
```

#### 2. 키워드-태그 매핑 (keyword_tag_mappings)
```sql
id               BIGINT PRIMARY KEY
keyword_group_id BIGINT NOT NULL         -- 키워드 그룹 ID
tag_id          BIGINT NOT NULL         -- 태그 ID
confidence_score DECIMAL(3,2)            -- 매핑 신뢰도
context_rules   JSONB                   -- 컨텍스트 규칙
priority        INTEGER DEFAULT 1       -- 우선순위
usage_count     INTEGER DEFAULT 0       -- 사용 횟수
is_active       BOOLEAN DEFAULT true    -- 활성 상태
created_at      TIMESTAMP
```

#### 3. 태그-계정과목 매핑 (tag_account_mappings)
```sql
id               BIGINT PRIMARY KEY
tag_id          BIGINT NOT NULL         -- 태그 ID
account_code    VARCHAR(10) NOT NULL    -- 계정과목 코드
account_name    VARCHAR(100) NOT NULL   -- 계정과목명
mapping_condition JSONB                 -- 매핑 조건
is_default      BOOLEAN DEFAULT false   -- 기본 매핑 여부
priority        INTEGER DEFAULT 1       -- 우선순위
confidence_boost DECIMAL(3,2)           -- 신뢰도 보정값
created_at      TIMESTAMP
```

#### 4. 태그 마스터 (tags_master)
```sql
id            BIGINT PRIMARY KEY
tag_name      VARCHAR(50) NOT NULL      -- 태그명
tag_category  VARCHAR(30)               -- 태그 카테고리
description   TEXT                      -- 설명
color_hex     VARCHAR(7)                -- 색상 코드
icon_name     VARCHAR(50)               -- 아이콘명
display_order INTEGER DEFAULT 0         -- 표시 순서
is_active     BOOLEAN DEFAULT true      -- 활성 상태
created_at    TIMESTAMP
```

### 데이터 흐름
```
거래 텍스트 → 키워드 추출 → 키워드 그룹 매칭 → 태그 매핑 → 계정과목 매핑 → 최종 결과
```

## 🚀 전체 엔드포인트 목록

### 1. 거래 태깅 API (`/api/v2/transaction-tagging`)

#### `POST /process` - 거래 자동 태깅
**목적:** 거래 텍스트를 입력받아 자동으로 태그와 계정과목을 분류
**요청 데이터:**
```json
{
  "description": "세븐일레븐 결제 5000원",
  "amount": 5000,
  "processingOptions": {
    "autoApprove": true,
    "requireConfirmation": false
  }
}
```
**응답 데이터:**
```json
{
  "processingPath": "KEYWORD_ENGINE",
  "tag": "편의점",
  "accountCode": "602",
  "accountName": "소모품비",
  "confidence": 0.95,
  "extractedKeywords": ["세븐일레븐"],
  "processingTimeMs": 15,
  "userQuestions": []
}
```

#### `POST /feedback` - 사용자 피드백 처리
**목적:** 사용자의 분류 결과 피드백을 받아 시스템 학습 개선
**요청 데이터:**
```json
{
  "transactionId": "tx_12345",
  "ruleId": "rule_67890",
  "ruleType": "KEYWORD_MAPPING",
  "isPositive": true,
  "reason": "정확한 분류였습니다",
  "correctTag": "편의점",
  "correctAccount": "602"
}
```

#### `POST /test-extraction` - 키워드 추출 테스트
**목적:** 키워드 추출 알고리즘 테스트 및 디버깅
**요청 데이터:**
```json
{
  "text": "스타벅스 아메리카노 결제",
  "extractionMode": "DETAILED"
}
```

### 2. 키워드 시스템 API (`/v2`)

#### `POST /keyword-system/classify` - 키워드 분류
**목적:** 키워드 기반 거래 분류의 핵심 엔드포인트
**요청 데이터:**
```json
{
  "description": "GS25 편의점 결제",
  "amount": 3000
}
```
**응답 데이터:**
```json
{
  "processingPath": "KEYWORD_ENGINE",
  "tag": "편의점",
  "accountName": "소모품비",
  "confidence": 0.88,
  "extractedKeywords": ["GS25"],
  "processingTimeMs": 12
}
```

#### `GET /tag-mapping/keyword-groups` - 키워드 그룹 조회
**목적:** 등록된 키워드 그룹 목록 조회
**쿼리 파라미터:**
- `category`: 카테고리 필터링
- `isActive`: 활성 상태 필터링
- `page`: 페이지 번호
- `size`: 페이지 크기

#### `POST /tag-mapping/keyword-groups` - 키워드 그룹 생성
**목적:** 새로운 키워드 그룹 생성
**요청 데이터:**
```json
{
  "groupName": "스타벅스",
  "primaryKeyword": "스타벅스",
  "synonyms": ["STARBUCKS", "스벅"],
  "category": "카페",
  "confidenceBase": 0.92
}
```

#### `PUT /tag-mapping/keyword-groups/{id}` - 키워드 그룹 수정
**목적:** 기존 키워드 그룹 정보 수정

#### `DELETE /tag-mapping/keyword-groups/{id}` - 키워드 그룹 삭제
**목적:** 키워드 그룹 비활성화 (soft delete)

#### `POST /tag-mapping/recommend-tags` - 태그 추천
**목적:** 거래 내용을 기반으로 적절한 태그 추천
**요청 데이터:**
```json
{
  "description": "맥도날드 빅맥 세트",
  "amount": 8000,
  "recommendCount": 3
}
```

#### `POST /tag-mapping/refresh-cache` - 캐시 갱신
**목적:** Redis 캐시 강제 갱신
**기능:** 모든 매핑 데이터 캐시 무효화 및 재로드

#### `GET /tag-mapping/cache-status` - 캐시 상태 확인
**목적:** Redis 캐시 상태 및 통계 확인
**응답 데이터:**
```json
{
  "cacheHitRate": 0.85,
  "totalCacheSize": 1024,
  "keywordGroupsCached": 80,
  "tagMappingsCached": 150,
  "lastRefreshTime": "2024-01-15T10:30:00Z"
}
```

### 3. 태그 매핑 관리 API (`/v2/tag-mapping-mgmt`)

#### `GET /keyword-tag-mappings` - 키워드-태그 매핑 조회
**목적:** 키워드 그룹과 태그 간의 매핑 관계 조회
**응답 데이터:**
```json
[
  {
    "id": 1,
    "keywordGroupId": 10,
    "keywordGroup": {"groupName": "스타벅스", "primaryKeyword": "스타벅스"},
    "tagId": 5,
    "tag": {"tagName": "카페", "tagCategory": "식음료"},
    "confidenceScore": 0.95,
    "priority": 1,
    "usageCount": 245,
    "isActive": true
  }
]
```

#### `GET /tag-account-mappings` - 태그-계정과목 매핑 조회
**목적:** 태그와 계정과목 간의 매핑 관계 조회
**응답 데이터:**
```json
[
  {
    "id": 1,
    "tagId": 5,
    "tag": {"tagName": "카페", "tagCategory": "식음료"},
    "accountCode": "602",
    "accountName": "소모품비",
    "isDefault": true,
    "priority": 1,
    "confidenceBoost": 0.05
  }
]
```

#### `GET /stats` - 매핑 통계
**목적:** 시스템 전체 매핑 통계 제공
**응답 데이터:**
```json
{
  "totalKeywordTagMappings": 0,
  "totalTagAccountMappings": 0,
  "averageConfidence": 0.0,
  "topUsedMappings": []
}
```

#### `POST /keyword-tag-mappings` - 키워드-태그 매핑 생성
**목적:** 새로운 키워드-태그 매핑 생성
**요청 데이터:**
```json
{
  "keywordGroupId": 10,
  "tagId": 5,
  "confidenceScore": 0.95,
  "priority": 1,
  "contextRules": {
    "minAmount": 1000,
    "maxAmount": 50000
  }
}
```

#### `GET /mappings` - 조건별 매핑 조회
**목적:** 다양한 조건으로 매핑 데이터 조회
**쿼리 파라미터:**
- `source`: 데이터 소스 (cache/database)
- `keywordGroupId`: 키워드 그룹 ID로 필터링
- `tagId`: 태그 ID로 필터링

### 4. 키워드 패턴 관리 API (`/v2/keyword-patterns`)

#### `GET /` - 패턴 목록 조회
**목적:** 등록된 키워드 패턴 목록 조회
**기능:** 페이징, 필터링, 정렬 지원

#### `POST /` - 패턴 생성
**목적:** 새로운 키워드 패턴 생성
**요청 데이터:**
```json
{
  "pattern": "^(스타벅스|STARBUCKS)",
  "category": "카페",
  "description": "스타벅스 패턴",
  "priority": 1,
  "isActive": true
}
```

#### `PUT /{id}` - 패턴 수정
**목적:** 기존 키워드 패턴 수정

#### `DELETE /{id}` - 패턴 삭제
**목적:** 키워드 패턴 비활성화

#### `POST /test` - 패턴 테스트
**목적:** 특정 패턴의 매칭 테스트
**요청 데이터:**
```json
{
  "pattern": "^(스타벅스|STARBUCKS)",
  "testTexts": ["스타벅스 아메리카노", "STARBUCKS COFFEE", "투썸플레이스"]
}
```

#### `POST /test-all` - 모든 패턴 테스트
**목적:** 모든 활성 패턴에 대한 테스트 수행

#### `POST /bulk` - 패턴 일괄 처리
**목적:** 여러 패턴을 한 번에 생성/수정/삭제

#### `POST /import` - 패턴 임포트
**목적:** 외부 파일에서 패턴 데이터 가져오기

#### `GET /stats` - 패턴 통계
**목적:** 패턴 사용 통계 및 성능 지표 제공

### 5. 태그 관리 API (`/v2/tag-management`)

#### `GET /tags` - 태그 목록 조회
**목적:** 시스템에 등록된 태그 목록 조회
**응답 데이터:**
```json
[
  {
    "id": 1,
    "tagName": "카페",
    "tagCategory": "식음료",
    "description": "카페 및 커피전문점",
    "colorHex": "#8B4513",
    "iconName": "coffee",
    "displayOrder": 1,
    "isActive": true
  }
]
```

#### `POST /tags` - 태그 생성
**목적:** 새로운 태그 생성
**요청 데이터:**
```json
{
  "tagName": "편의점",
  "tagCategory": "소매업",
  "description": "편의점 및 소형 마트",
  "colorHex": "#FF6B6B",
  "iconName": "store"
}
```

#### `PUT /tags/{id}` - 태그 수정
**목적:** 기존 태그 정보 수정

#### `DELETE /tags/{id}` - 태그 삭제
**목적:** 태그 비활성화

#### `GET /tags/{id}/mappings` - 태그별 매핑 조회
**목적:** 특정 태그와 연결된 모든 매핑 정보 조회

#### `POST /keyword-tag-mappings/bulk` - 매핑 일괄 생성
**목적:** 키워드-태그 매핑을 일괄로 생성

#### `GET /unmapped-keyword-groups` - 미매핑 키워드 그룹 조회
**목적:** 아직 태그에 매핑되지 않은 키워드 그룹 조회

#### `GET /keyword-groups/{id}/tag-suggestions` - 태그 추천
**목적:** 특정 키워드 그룹에 적합한 태그 추천

#### `GET /mapping-stats` - 매핑 통계
**목적:** 태그별 매핑 통계 및 사용 현황 제공

### 6. 통합 테스트 API (`/v2/test`)

#### `POST /parse-transaction` - 거래 문자열 파싱 테스트
**목적:** 거래 텍스트 파싱 로직 테스트
**요청 데이터:**
```json
{
  "transactionText": "01/15 14:30 스타벅스강남점 아메리카노 4500원 신한카드"
}
```

#### `POST /end-to-end` - End-to-End 테스트
**목적:** 전체 파이프라인 테스트
**요청 데이터:**
```json
{
  "transactions": [
    {"description": "스타벅스 결제", "amount": 4500},
    {"description": "GS25 편의점", "amount": 3000}
  ]
}
```

#### `GET /scenarios` - 테스트 시나리오 조회
**목적:** 사전 정의된 테스트 시나리오 목록 조회

#### `POST /batch` - 일괄 테스트
**목적:** 대량 거래 데이터 일괄 테스트

#### `POST /performance` - 성능 테스트
**목적:** 시스템 성능 벤치마킹

#### `POST /accuracy` - 정확도 테스트
**목적:** 분류 정확도 측정

#### `POST /regression` - 회귀 테스트
**목적:** 시스템 변경사항 영향 테스트

#### `POST /report` - 테스트 리포트 생성
**목적:** 테스트 결과 상세 리포트 생성

#### `POST /export` - 테스트 결과 내보내기
**목적:** 테스트 결과를 다양한 형식으로 내보내기

### 7. 신뢰도 관리 API (`/v2/confidence-management`)

#### `GET /rules` - 신뢰도 룰 조회
**목적:** 신뢰도 계산 룰 조회 및 관리

#### `POST /adjust` - 신뢰도 조정
**목적:** 사용자 피드백 기반 신뢰도 조정

#### `GET /statistics` - 신뢰도 통계
**목적:** 신뢰도 분포 및 성과 통계

### 8. 사용자 질문 API (`/v2/user-questions`)

#### `POST /create` - 질문 생성
**목적:** 애매한 분류 결과에 대한 사용자 질문 생성

#### `POST /answer` - 질문 답변
**목적:** 사용자 질문에 대한 답변 처리

#### `GET /pending` - 대기 중인 질문 조회
**목적:** 답변 대기 중인 질문 목록 조회

### 9. 브랜드 유지보수 API (`/v2/brand-maintenance`)

#### `POST /sync` - 브랜드 데이터 동기화
**목적:** 외부 브랜드 데이터와 동기화

#### `GET /duplicates` - 중복 브랜드 조회
**목적:** 중복된 브랜드 항목 조회

#### `POST /merge` - 브랜드 병합
**목적:** 중복 브랜드 항목 병합

## 🧠 키워드 추출 알고리즘

### 추출 과정
1. **텍스트 정규화**
   - 한글, 영문, 숫자 외 문자 제거
   - 연속된 공백 정리
   - 특수문자 처리

2. **토큰 분리**
   - 공백 및 특수문자 기준 분리
   - 최소 2글자 이상 토큰만 유지
   - 숫자만으로 구성된 토큰 제외

3. **키워드 그룹 매칭**
   - 주 키워드 우선 매칭
   - 동의어 배열 매칭
   - 부분 매칭 지원

4. **매칭 우선순위**
   - 정확도 기반: 긴 키워드 우선
   - 신뢰도 기반: 높은 신뢰도 매핑 우선
   - 우선순위 기반: 매핑 테이블의 priority 필드

5. **동적 브랜드 검색**
   - 키워드 그룹 매칭 실패 시 활성화
   - 브랜드 테이블에서 유사한 항목 검색
   - 부분 매칭 및 Levenshtein 거리 계산

### 키워드 추출 예시
```
입력: "스타벅스 강남점 아메리카노 4500원"
추출: ["스타벅스", "강남점", "아메리카노"]
매칭: "스타벅스" → 키워드 그룹 "스타벅스" (카페)
결과: 태그 "카페", 계정과목 "접대비"
```

## 🔥 신뢰도 엔진

### 신뢰도 계산 공식
```
최종 신뢰도 = 기본 신뢰도 × 매핑 신뢰도 × 컨텍스트 보정 × 피드백 보정
```

### 계산 요소
1. **기본 신뢰도** (`keyword_groups.confidence_base`)
   - 키워드 그룹별 기본 신뢰도
   - 범위: 0.00 ~ 1.00

2. **매핑 신뢰도** (`keyword_tag_mappings.confidence_score`)
   - 키워드-태그 매핑별 신뢰도
   - 범위: 0.00 ~ 1.00

3. **컨텍스트 보정**
   - 거래 금액 범위 확인
   - 시간대 조건 확인
   - 요일 조건 확인

4. **피드백 보정**
   - 사용자 긍정 피드백 → 신뢰도 증가
   - 사용자 부정 피드백 → 신뢰도 감소
   - 사용 횟수 기반 보정

### 신뢰도 임계값
- **자동 승인**: 0.90 이상
  - 즉시 처리, 사용자 개입 불필요
- **사용자 질문**: 0.70 ~ 0.89
  - 사용자 확인 후 처리
- **거부/재처리**: 0.70 미만
  - 다음 Layer로 전달

## 📊 성능 및 모니터링

### 현재 구현된 메트릭
- **처리 시간 추적**: 각 Layer별 처리 시간
- **캐시 히트율**: Redis 캐시 효율성
- **분류 성공률**: Layer별 분류 성공률
- **사용자 피드백**: 긍정/부정 피드백 비율

### Spring Actuator 엔드포인트
- `GET /api/actuator/health` - 시스템 헬스체크
- `GET /api/actuator/info` - 애플리케이션 정보
- `GET /api/actuator/metrics` - 성능 메트릭

### 로깅 시스템
- **DEBUG 레벨**: 상세 처리 과정
- **INFO 레벨**: 주요 이벤트 및 결과
- **ERROR 레벨**: 오류 및 예외 상황

## 🚨 TODO 및 개선 필요 사항

### 🔴 즉시 개선 필요 (Critical)
1. **Layer 2 (ML 추론) 구현**
   - 유사도 매칭 알고리즘 구현
   - 벡터 임베딩 시스템 구축
   - 모델 학습 파이프라인 구축

2. **Layer 3 (LLM 폴백) 구현**
   - Gemini AI 통합
   - 프롬프트 엔지니어링
   - 응답 파싱 및 검증

3. **사용자 피드백 시스템 완성**
   - 데이터베이스 연동 완료
   - 피드백 기반 학습 알고리즘
   - 피드백 통계 및 분석

### 🟡 중요 개선 사항 (High Priority)
1. **보안 및 인증 강화**
   - JWT 기반 인증 시스템
   - 어드민 권한 관리 활성화
   - API 레이트 리미팅

2. **성능 최적화**
   - 키워드 매칭 알고리즘 개선
   - 데이터베이스 쿼리 최적화
   - 캐시 전략 개선

3. **모니터링 및 알림**
   - 실시간 모니터링 대시보드
   - 성능 지표 추적
   - 장애 알림 시스템

### 🟢 일반 개선 사항 (Medium Priority)
1. **데이터베이스 스키마 완성**
   - 거래 로그 테이블 구현
   - 사용자 피드백 테이블 구현
   - 성능 통계 테이블 구현

2. **테스트 커버리지 확대**
   - 단위 테스트 추가
   - 통합 테스트 보강
   - 성능 테스트 자동화

3. **문서화 개선**
   - API 문서 자동화
   - 코드 문서화
   - 운영 가이드

## 🎯 결론

MoneyShift API는 **체계적인 4-Layer 아키텍처**를 기반으로 한 견고한 거래 분류 시스템입니다. 

### 주요 강점
- ✅ **명확한 레이어 분리**: 각 Layer별 역할과 책임 명확
- ✅ **포괄적인 API**: 관리 및 테스트를 위한 풍부한 엔드포인트
- ✅ **효율적인 캐싱**: Redis 기반 고성능 캐싱 시스템
- ✅ **확장 가능한 구조**: 새로운 Layer 추가 용이
- ✅ **상세한 로깅**: 디버깅 및 모니터링 지원

### 현재 상태
- **Layer 1**: ✅ 완전 구현 (키워드 패턴 매칭)
- **Layer 2**: ❌ 미구현 (ML 추론)
- **Layer 3**: ❌ 미구현 (LLM 폴백)
- **전체 시스템**: 🟡 Production-ready에 근접

### 개발 우선순위
1. **Layer 2/3 구현** → 분류 정확도 향상
2. **보안 강화** → Production 배포 준비
3. **성능 최적화** → 대용량 처리 준비
4. **모니터링 시스템** → 운영 안정성 확보

전반적으로 **production-ready**에 가까운 상태이며, 누락된 기능들을 순차적으로 구현하면 완전한 시스템이 될 것입니다.
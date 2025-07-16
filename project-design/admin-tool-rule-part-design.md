# 키워드 기반 거래 태깅 시스템 어드민 툴 PRD

## 1. 개요

### 1.1 목적
거래 문자열에서 키워드를 추출하고, 태그를 매칭한 후, 계정과목으로 자동 분류하는 다단계 하이브리드 엔진의 효율적인 운영을 위한 통합 관리 도구

### 1.2 시스템 특징
- **다단계 처리**: 키워드 추출 → 태그 매칭 → 계정과목 도출
- **하이브리드 엔진**: 정규식 우선, LLM 보완
- **동적 신뢰도**: 사용자 피드백 기반 자동 학습
- **Redis 캐싱**: 고성능 실시간 처리

## 2. 핵심 기능 요구사항

### 2.1 전체 프로세스 대시보드

#### 2.1.1 실시간 처리 현황
```
┌─────────────────────────────────────────────────────────────┐
│              Keyword-Based Tagging Dashboard                │
├─────────────────┬─────────────────┬─────────────────────────┤
│ Active Keywords │ Active Tags     │ Today's Transactions    │
│     3,456      │     245         │     67,890             │
├─────────────────┴─────────────────┴─────────────────────────┤
│                  Processing Pipeline Status                  │
│ ┌──────────┐    ┌──────────┐    ┌──────────┐              │
│ │ Keywords │───▶│   Tags   │───▶│ Accounts │              │
│ │  87.5%   │    │  92.3%   │    │  98.1%   │              │
│ └──────────┘    └──────────┘    └──────────┘              │
├─────────────────────────────────────────────────────────────┤
│                    Engine Performance                        │
│ Regex Success: 85.2% | LLM Fallback: 14.8%                 │
│ Avg Response: 12ms | Cache Hit Rate: 94.5%                 │
├─────────────────────────────────────────────────────────────┤
│                    Recent Activities                         │
│ • [14:30] Keyword "스벅" confidence +2 (now: 89)           │
│ • [14:25] New tag mapping: #카페 → 복리후생비              │
│ • [14:20] Question triggered for "회식" keyword            │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 키워드 추출 엔진 관리

#### 2.2.1 키워드 추출 정규식 관리
```
┌─────────────────────────────────────────────────────────────┐
│ Keyword Extraction Patterns                                  │
├─────────────────────────────────────────────────────────────┤
│ [Search: _______] [Type: All ▼] [Confidence: All ▼]        │
├─────────────────────────────────────────────────────────────┤
│□│Pattern              │Type      │Keywords  │Conf│Actions  │
├─┼────────────────────┼──────────┼──────────┼────┼─────────┤
│□│(스타벅스|스벅)      │거래처    │스타벅스   │ 95 │[✏️][🗑️] │
│□│(커피|카페|coffee)  │카테고리  │커피,카페  │ 89 │[✏️][🗑️] │
│□│(점심|저녁|식사)    │용도      │식사      │ 87 │[✏️][🗑️] │
│□│[0-9]+명           │인원      │N명       │ 92 │[✏️][🗑️] │
└─────────────────────────────────────────────────────────────┘
[Bulk Actions ▼] [+ Add Pattern] [Import] [Test All]
```

#### 2.2.2 키워드 추출 규칙 등록/수정
```yaml
Keyword Extraction Rule:
  Pattern Information:
    - Regex Pattern: [(정규식 입력)]
    - Pattern Type: [거래처/카테고리/용도/인원/금액범위]
    - Description: [패턴 설명]
    
  Keyword Configuration:
    - Primary Keywords: [메인 키워드들]
    - Synonyms: [동의어 목록]
    - Confidence Score: [0-100]
    - Priority: [1-100]
    
  Context Rules:
    - Time Context: [아침/점심/저녁/심야]
    - Amount Range: [최소-최대 금액]
    - Location Type: [온라인/오프라인/특정지역]
    
Test Section:
  Sample Texts:
    "(주)스타벅스커피코리아 강남역점 9,800원"
    "스벅에서 아메리카노 2잔"
    
  Extraction Results:
    ✅ Keywords: ["스타벅스", "커피", "강남"]
    ✅ Context: {time: "afternoon", amount: 9800}
```

### 2.3 태그 매칭 시스템 관리

#### 2.3.1 키워드-태그 매핑 관리
```
┌─────────────────────────────────────────────────────────────┐
│ Keyword to Tag Mapping                                      │
├─────────────────────────────────────────────────────────────┤
│ Keyword Groups │ Mapped Tags        │ Confidence │ Usage   │
├────────────────┼────────────────────┼────────────┼─────────┤
│ 스타벅스,스벅   │ #카페, #커피전문점  │    92      │ 12,345  │
│ 커피,카페      │ #음료, #카페       │    88      │ 9,876   │
│ 점심,중식      │ #식사, #점심식사    │    90      │ 8,234   │
│ 회식,회사저녁   │ #회식비 (Q)        │    75      │ 5,432   │
└────────────────┴────────────────────┴────────────┴─────────┘
(Q) = Requires user question
[Add Mapping] [Bulk Edit] [View Unmapped Keywords]
```

#### 2.3.2 태그 후보 제시 설정
```
┌─────────────────────────────────────────────────────────────┐
│ Tag Suggestion Configuration                                 │
├─────────────────────────────────────────────────────────────┤
│ For Keywords: ["스타벅스", "커피"]                          │
│                                                              │
│ Tag Candidates (drag to reorder):                           │
│ 1. #카페 (confidence: 92)                                  │
│ 2. #커피전문점 (confidence: 88)                             │
│ 3. #음료 (confidence: 75)                                  │
│                                                              │
│ Presentation Rules:                                          │
│ • Show top [3] candidates                                   │
│ • Min confidence for display: [50]                          │
│ • Auto-select if confidence > [90]                         │
│                                                              │
│ Context Modifiers:                                           │
│ • Morning (06-11): +5 for #카페                            │
│ • With "회의": +10 for #회의비                             │
│ • Amount > 50,000: +5 for #회식비                         │
│                                                              │
│ [Save Configuration] [Test with Sample]                      │
└─────────────────────────────────────────────────────────────┘
```

### 2.4 계정과목 매핑 관리

#### 2.4.1 태그-계정과목 (N:1) 매핑
```
┌─────────────────────────────────────────────────────────────┐
│ Tag to Account Code Mapping (N:1)                          │
├─────────────────────────────────────────────────────────────┤
│ Tags                    │ Account Code    │ Conditions      │
├─────────────────────────┼─────────────────┼─────────────────┤
│ #카페, #커피전문점       │ 복리후생비(5201) │ Default         │
│ #카페, #커피전문점       │ 접대비(5101)    │ If "거래처"     │
│ #회식비                │ 복리후생비(5201) │ If "직원"       │
│ #회식비                │ 접대비(5101)    │ If "고객"       │
│ #택시, #교통           │ 여비교통비(5301) │ Default         │
│ #택시                  │ 접대비(5101)    │ If 심야+회식    │
└─────────────────────────┴─────────────────┴─────────────────┘
[Add Mapping] [Edit Conditions] [Test Scenarios]
```

#### 2.4.2 조건부 매핑 규칙 설정
```
┌─────────────────────────────────────────────────────────────┐
│ Conditional Mapping Rules                                    │
├─────────────────────────────────────────────────────────────┤
│ Tag: #택시                                                  │
│                                                              │
│ Rule Priority:                                               │
│ 1. IF time = "late_night" AND previous_tag = "#회식비"      │
│    THEN account = "접대비(5101)"                           │
│                                                              │
│ 2. IF amount > 50000                                        │
│    THEN account = "접대비(5101)"                           │
│                                                              │
│ 3. IF keywords contain "출장"                               │
│    THEN account = "여비교통비(5301)"                       │
│                                                              │
│ 4. DEFAULT                                                  │
│    THEN account = "여비교통비(5301)"                       │
│                                                              │
│ [Add Rule] [Test Rules] [Reorder] [View Statistics]         │
└─────────────────────────────────────────────────────────────┘
```

### 2.5 사용자 질문 관리

#### 2.5.1 질문 템플릿 설정
```
┌─────────────────────────────────────────────────────────────┐
│ User Question Configuration                                  │
├─────────────────────────────────────────────────────────────┤
│ Trigger Conditions:                                          │
│ • Tag: #회식비                                              │
│ • Keywords: ["회식", "회사저녁", "팀저녁"]                  │
│ • Confidence: < 85                                          │
│                                                              │
│ Question Template:                                           │
│ "이 거래는 어떤 목적의 식사였나요?"                          │
│                                                              │
│ Answer Options:                                              │
│ ┌─────────────────────────────────────┐                    │
│ │ 1. 직원 회식 → 복리후생비(5201)    │ [↑][↓][✏️][🗑️]    │
│ │ 2. 거래처 접대 → 접대비(5101)      │ [↑][↓][✏️][🗑️]    │
│ │ 3. 부서 회의 → 회의비(5401)       │ [↑][↓][✏️][🗑️]    │
│ │ 4. 기타 → 기타비용(5901)          │ [↑][↓][✏️][🗑️]    │
│ └─────────────────────────────────────┘                    │
│                                                              │
│ Learning Rules:                                              │
│ • Option selected → Confidence +1                           │
│ • Option 1 selected 10 times → Auto-approve                │
│ • Option order auto-adjusts based on selection frequency    │
│                                                              │
│ [Save Question] [Preview] [View Response Stats]             │
└─────────────────────────────────────────────────────────────┘
```

### 2.6 신뢰도 관리 시스템

#### 2.6.1 신뢰도 점수 모니터링
```
┌─────────────────────────────────────────────────────────────┐
│ Confidence Score Management                                  │
├─────────────────────────────────────────────────────────────┤
│ Score Distribution:                                          │
│ ┌────────────────────────────────────────────────┐         │
│ │ 90-100: ████████████████ (1,234 rules)        │         │
│ │ 80-89:  ███████████ (987 rules)               │         │
│ │ 70-79:  ████████ (654 rules)                  │         │
│ │ 60-69:  ████ (321 rules)                      │         │
│ │ < 60:   ██ (123 rules) ⚠️                     │         │
│ └────────────────────────────────────────────────┘         │
│                                                              │
│ Automatic Adjustment Rules:                                  │
│ • User accepts suggestion: +1 point                         │
│ • User rejects suggestion: -2 points                        │
│ • Pattern match success: +0.5 points                        │
│ • LLM fallback needed: -1 point                            │
│                                                              │
│ Thresholds:                                                  │
│ • Auto-approve: >= 90                                       │
│ • Show question: 70-89                                      │
│ • LLM fallback: < 70                                        │
│                                                              │
│ [Edit Rules] [Reset Scores] [Export Report]                 │
└─────────────────────────────────────────────────────────────┘
```

### 2.7 LLM 통합 관리

#### 2.7.1 LLM 폴백 설정
```
┌─────────────────────────────────────────────────────────────┐
│ LLM Fallback Configuration                                  │
├─────────────────────────────────────────────────────────────┤
│ Trigger Conditions:                                          │
│ • No keyword extracted                                      │
│ • No matching tags found                                    │
│ • All tag confidences < 70                                  │
│ • User explicitly requests                                  │
│                                                              │
│ LLM Settings:                                               │
│ • Model: [GPT-4 ▼] [Claude-3 ▼]                           │
│ • Temperature: [0.3] (0.0 - 1.0)                           │
│ • Max tokens: [150]                                         │
│ • Timeout: [3000ms]                                         │
│                                                              │
│ Prompt Template:                                             │
│ ┌─────────────────────────────────────────────────┐        │
│ │ 거래: {transaction_text}                        │        │
│ │ 금액: {amount}                                  │        │
│ │ 시간: {timestamp}                               │        │
│ │                                                 │        │
│ │ 위 거래에서:                                    │        │
│ │ 1. 핵심 키워드 추출                             │        │
│ │ 2. 적절한 태그 제안 (최대 3개)                  │        │
│ │ 3. 계정과목 추천                                │        │
│ └─────────────────────────────────────────────────┘        │
│                                                              │
│ Auto Rule Creation:                                          │
│ • Create rule after [10] consistent LLM responses           │
│ • Initial confidence: [70]                                  │
│                                                              │
│ [Save Settings] [Test LLM] [View Usage Stats]               │
└─────────────────────────────────────────────────────────────┘
```

### 2.8 Redis 캐시 관리

#### 2.8.1 캐시 모니터링
```
┌─────────────────────────────────────────────────────────────┐
│ Redis Cache Dashboard                                        │
├─────────────────────────────────────────────────────────────┤
│ Cache Statistics:                                            │
│ • Total Keys: 145,678                                       │
│ • Memory Usage: 2.3GB / 8GB (28.75%)                       │
│ • Hit Rate: 94.5%                                           │
│ • Avg Response Time: 0.3ms                                  │
│                                                              │
│ Cache Distribution:                                          │
│ • Keyword Patterns: 45,234 keys                             │
│ • Tag Mappings: 32,456 keys                                 │
│ • Account Mappings: 28,901 keys                             │
│ • Transaction Results: 39,087 keys                          │
│                                                              │
│ TTL Configuration:                                           │
│ • Patterns: No expiry                                       │
│ • Mappings: No expiry                                       │
│ • Results: 24 hours                                         │
│                                                              │
│ [Flush Cache] [Reload Patterns] [View Details]              │
└─────────────────────────────────────────────────────────────┘
```

### 2.9 테스트 및 검증

#### 2.9.1 통합 테스트 도구
```
┌─────────────────────────────────────────────────────────────┐
│ End-to-End Testing Suite                                    │
├─────────────────────────────────────────────────────────────┤
│ Test Scenario: "Coffee Meeting"                              │
│                                                              │
│ Input Transaction:                                           │
│ "스타벅스 강남점 아메리카노 4잔 15,600원"                    │
│                                                              │
│ Processing Steps:                                            │
│ 1. Keyword Extraction ✅                                    │
│    → Keywords: ["스타벅스", "커피", "4잔", "강남"]         │
│                                                              │
│ 2. Tag Matching ✅                                          │
│    → Suggested Tags: [#카페(92%), #회의비(78%)]            │
│                                                              │
│ 3. User Question ⚠️                                         │
│    → "이 커피는 어떤 목적이었나요?"                         │
│    → Options: [회의용, 개인용, 접대용]                      │
│                                                              │
│ 4. Account Mapping ✅                                       │
│    → If 회의용: 회의비(5401)                               │
│    → If 접대용: 접대비(5101)                               │
│                                                              │
│ [Run Test] [Save Scenario] [Export Results]                 │
└─────────────────────────────────────────────────────────────┘
```

## 3. 데이터베이스 스키마

### 3.1 핵심 테이블

```sql
-- 키워드 추출 패턴 테이블
CREATE TABLE keyword_patterns (
    id BIGSERIAL PRIMARY KEY,
    pattern_regex VARCHAR(500) NOT NULL,
    pattern_type VARCHAR(50) NOT NULL, -- 'MERCHANT', 'CATEGORY', 'PURPOSE', 'PEOPLE'
    extracted_keywords TEXT[], -- PostgreSQL 배열 타입
    confidence_score INTEGER DEFAULT 70,
    hit_count BIGINT DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 태그 마스터 테이블
CREATE TABLE tags (
    id BIGSERIAL PRIMARY KEY,
    tag_name VARCHAR(100) NOT NULL UNIQUE,
    tag_category VARCHAR(50),
    description TEXT,
    display_order INTEGER DEFAULT 100,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 키워드-태그 매핑 테이블
CREATE TABLE keyword_tag_mappings (
    id BIGSERIAL PRIMARY KEY,
    keyword_group TEXT[] NOT NULL, -- 관련 키워드 그룹
    tag_id BIGINT REFERENCES tags(id),
    confidence_score INTEGER DEFAULT 70,
    context_rules JSONB, -- {"time": "evening", "amount_min": 50000}
    usage_count BIGINT DEFAULT 0,
    UNIQUE(keyword_group, tag_id)
);

-- 태그-계정과목 매핑 테이블 (N:1)
CREATE TABLE tag_account_mappings (
    id BIGSERIAL PRIMARY KEY,
    tag_id BIGINT REFERENCES tags(id),
    account_code VARCHAR(20) NOT NULL,
    account_name VARCHAR(100) NOT NULL,
    mapping_condition JSONB, -- 조건부 매핑 규칙
    is_default BOOLEAN DEFAULT false,
    priority INTEGER DEFAULT 50
);

-- 사용자 질문 설정 테이블
CREATE TABLE user_questions (
    id BIGSERIAL PRIMARY KEY,
    trigger_tag_id BIGINT REFERENCES tags(id),
    trigger_keywords TEXT[],
    confidence_threshold INTEGER DEFAULT 85,
    question_text TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true
);

-- 질문 답변 옵션 테이블
CREATE TABLE question_options (
    id BIGSERIAL PRIMARY KEY,
    question_id BIGINT REFERENCES user_questions(id),
    option_text VARCHAR(200) NOT NULL,
    target_account_code VARCHAR(20),
    target_account_name VARCHAR(100),
    selection_count BIGINT DEFAULT 0,
    display_order INTEGER
);

-- 거래 처리 로그 테이블
CREATE TABLE transaction_logs (
    id BIGSERIAL PRIMARY KEY,
    original_text TEXT NOT NULL,
    extracted_keywords TEXT[],
    matched_tags JSONB, -- [{"tag_id": 1, "confidence": 92}]
    selected_tag_id BIGINT REFERENCES tags(id),
    final_account_code VARCHAR(20),
    processing_path VARCHAR(50), -- 'REGEX', 'REGEX_WITH_QUESTION', 'LLM'
    confidence_scores JSONB, -- 각 단계별 신뢰도
    processing_time_ms INTEGER,
    user_feedback VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 신뢰도 조정 이력 테이블
CREATE TABLE confidence_history (
    id BIGSERIAL PRIMARY KEY,
    entity_type VARCHAR(50), -- 'PATTERN', 'MAPPING', 'TAG'
    entity_id BIGINT NOT NULL,
    old_confidence INTEGER,
    new_confidence INTEGER,
    adjustment_reason VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- LLM 생성 룰 후보 테이블
CREATE TABLE llm_rule_candidates (
    id BIGSERIAL PRIMARY KEY,
    transaction_samples TEXT[],
    suggested_pattern VARCHAR(500),
    suggested_keywords TEXT[],
    suggested_tag VARCHAR(100),
    occurrence_count INTEGER DEFAULT 1,
    confidence_estimate INTEGER,
    status VARCHAR(20) DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 인덱스 생성
CREATE INDEX idx_keyword_patterns_regex ON keyword_patterns(pattern_regex);
CREATE INDEX idx_keyword_patterns_active ON keyword_patterns(is_active);
CREATE INDEX idx_keyword_tag_mappings_keywords ON keyword_tag_mappings USING GIN(keyword_group);
CREATE INDEX idx_tag_account_mappings_tag ON tag_account_mappings(tag_id);
CREATE INDEX idx_transaction_logs_created ON transaction_logs(created_at DESC);
CREATE INDEX idx_confidence_history_entity ON confidence_history(entity_type, entity_id);
```

## 4. API 설계

### 4.1 핵심 API 엔드포인트

```yaml
# 키워드 패턴 관리
GET    /api/v1/keyword-patterns
POST   /api/v1/keyword-patterns
PUT    /api/v1/keyword-patterns/{id}
DELETE /api/v1/keyword-patterns/{id}
POST   /api/v1/keyword-patterns/test

# 태그 관리
GET    /api/v1/tags
POST   /api/v1/tags
PUT    /api/v1/tags/{id}
GET    /api/v1/tags/{id}/mappings

# 키워드-태그 매핑
GET    /api/v1/keyword-tag-mappings
POST   /api/v1/keyword-tag-mappings
PUT    /api/v1/keyword-tag-mappings/{id}
POST   /api/v1/keyword-tag-mappings/bulk

# 태그-계정과목 매핑
GET    /api/v1/tag-account-mappings
POST   /api/v1/tag-account-mappings
PUT    /api/v1/tag-account-mappings/{id}
GET    /api/v1/tag-account-mappings/by-tag/{tagId}

# 사용자 질문 관리
GET    /api/v1/user-questions
POST   /api/v1/user-questions
PUT    /api/v1/user-questions/{id}
POST   /api/v1/user-questions/{id}/options

# 신뢰도 관리
GET    /api/v1/confidence/scores
POST   /api/v1/confidence/adjust
GET    /api/v1/confidence/history
POST   /api/v1/confidence/bulk-reset

# 테스트 및 시뮬레이션
POST   /api/v1/test/parse-transaction
POST   /api/v1/test/end-to-end
GET    /api/v1/test/scenarios
POST   /api/v1/test/batch

# LLM 관리
GET    /api/v1/llm/candidates
POST   /api/v1/llm/approve-candidate/{id}
POST   /api/v1/llm/test-prompt
GET    /api/v1/llm/usage-stats

# Redis 캐시 관리
GET    /api/v1/cache/stats
POST   /api/v1/cache/refresh
DELETE /api/v1/cache/flush
GET    /api/v1/cache/keys

# 분석 및 모니터링
GET    /api/v1/analytics/dashboard
GET    /api/v1/analytics/processing-stats
GET    /api/v1/analytics/confidence-trends
GET    /api/v1/analytics/user-feedback
```

## 5. 시스템 아키텍처

### 5.1 컴포넌트 구조

```
┌─────────────────────────────────────────────────────────────┐
│                     Admin Tool Frontend                      │
│                    (React + TypeScript)                      │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│                    Admin API Gateway                         │
│                     (Spring Cloud)                           │
└──────────────────────────┬──────────────────────────────────┘
                           │
        ┌──────────────────┴──────────────────┬───────────────┐
        │                                     │               │
┌───────▼────────┐                 ┌─────────▼──────┐ ┌──────▼─────┐
│ Pattern Service│                 │ Mapping Service│ │ LLM Service│
│ (Spring Boot)  │                 │ (Spring Boot)  │ │(Spring Boot)│
└───────┬────────┘                 └─────────┬──────┘ └──────┬─────┘
        │                                     │               │
        └──────────────────┬──────────────────┴───────────────┘
                           │
                ┌──────────▼──────────┐
                │    PostgreSQL       │
                │   (Primary DB)      │
                └──────────┬──────────┘
                           │
                ┌──────────▼──────────┐
                │    Redis Cache      │
                │  (Pattern Cache)    │
                └─────────────────────┘
```

### 5.2 Spring Boot 서비스 구조

```java
@Component
public class PatternEngine {
    
    private final RedisTemplate<String, Pattern> redisTemplate;
    private final PatternRepository patternRepository;
    
    @PostConstruct
    public void loadPatternsToCache() {
        // 서버 시작시 모든 활성 패턴을 Redis에 로드
        List<KeywordPattern> patterns = patternRepository.findAllActive();
        patterns.forEach(pattern -> {
            String key = "pattern:" + pattern.getId();
            redisTemplate.opsForValue().set(key, pattern);
        });
    }
    
    public List<String> extractKeywords(String transactionText) {
        // 1. 캐시에서 패턴 조회
        Set<String> patternKeys = redisTemplate.keys("pattern:*");
        List<String> keywords = new ArrayList<>();
        
        // 2. 패턴 매칭 실행
        for (String key : patternKeys) {
            Pattern pattern = redisTemplate.opsForValue().get(key);
            if (pattern.matches(transactionText)) {
                keywords.addAll(pattern.getExtractedKeywords());
                // 3. 히트 카운트 증가
                incrementHitCount(pattern.getId());
            }
        }
        
        return keywords;
    }
}

@Service
public class ConfidenceManager {
    
    @Transactional
    public void adjustConfidence(Long entityId, String entityType, 
                                int adjustment, String reason) {
        // 1. 현재 신뢰도 조회
        int currentScore = getConfidenceScore(entityId, entityType);
        int newScore = Math.max(0, Math.min(100, currentScore + adjustment));
        
        // 2. 신뢰도 업데이트
        updateConfidenceScore(entityId, entityType, newScore);
        
        // 3. 이력 저장
        saveConfidenceHistory(entityId, entityType, 
                            currentScore, newScore, reason);
        
        // 4. 캐시 갱신
        refreshCache(entityId, entityType);
    }
}
```

## 6. 보안 및 성능 요구사항

### 6.1 보안 요구사항
- **접근 제어**: OAuth 2.0 + JWT 기반 인증
- **권한 관리**: RBAC (관리자, 검토자, 조회자)
- **감사 로깅**: 모든 설정 변경 추적
- **데이터 암호화**: 민감 정보 AES-256 암호화

### 6.2 성능 요구사항
- **응답 시간**: 
  - 키워드 추출: < 5ms
  - 태그 매칭: < 3ms  
  - 전체 프로세스: < 15ms (캐시 히트시)
- **처리량**: 10,000 TPS
- **캐시 히트율**: > 90%
- **동시 사용자**: 200명

### 6.3 확장성 요구사항
- **패턴 규모**: 최대 10만개
- **태그 수**: 최대 1,000개
- **월간 거래**: 1억건
- **수평 확장**: Kubernetes 기반 자동 스케일링

## 7. 모니터링 및 알림

### 7.1 핵심 메트릭
- 각 단계별 성공률 (키워드 추출, 태그 매칭, 계정 도출)
- 신뢰도 분포 및 변화 추이
- LLM 사용률 및 비용
- 캐시 히트율 및 메모리 사용량
- 사용자 피드백 비율

### 7.2 알림 조건
- 전체 성공률 < 80%: WARNING
- LLM 사용률 > 20%: WARNING
- 캐시 히트율 < 85%: WARNING
- 응답시간 P95 > 50ms: CRITICAL

## 8. 향후 개선 계획

### Phase 1 (3개월)
- 기본 키워드 추출 엔진 구축
- 주요 태그 200개 정의
- 신뢰도 관리 시스템 구현

### Phase 2 (6개월)
- LLM 통합 완료
- 자동 학습 시스템 구현
- A/B 테스트 프레임워크

### Phase 3 (9개월)
- 멀티 테넌트 지원
- 실시간 패턴 최적화
- API 외부 공개
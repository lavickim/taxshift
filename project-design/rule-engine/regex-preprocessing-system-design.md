# 정규식 기반 전처리 시스템 설계서

## 📋 시스템 개요

**정규식 기반 전처리 시스템**은 MoneyShift의 Layer 1 키워드 매칭 시스템 **앞단**에 위치하여, 다양한 형태의 거래 문자열을 정교하게 정규화(노말라이징)하는 핵심 시스템입니다.

### 시스템 목적
- 복잡하고 다양한 거래 문자열을 키워드 매칭에 최적화된 형태로 변환
- 브랜드명, 업종 표시자, 위치 정보 등을 체계적으로 추출 및 정규화
- 어드민 툴을 통한 정규식 패턴의 유연한 관리 및 유지보수

### 처리 아키텍처
```
거래 원문 → [정규식 기반 전처리 시스템] → 정규화된 텍스트 → [키워드 매칭 시스템] → 태그/계정과목
```

## 🎯 처리 예시 및 요구사항

### 1. 법인 구조 정규화
| 입력 | 출력 | 패턴 |
|------|------|------|
| (주)코드쉬프트 | 코드쉬프트 | `\\(주\\)(.+)` → `$1` |  
| 주식회사 코드쉬프트 | 코드쉬프트 | `주식회사\\s*(.+)` → `$1` |
| (유)부자마트 | 부자마트 | `\\(유\\)(.+)` → `$1` |
| 사단법인 한국협회 | 한국협회 | `사단법인\\s*(.+)` → `$1` |

### 2. 주유소 전용 패턴
| 입력 | 출력 | 분석 |
|------|------|------|
| (주)부자 충주(상)주 -80000 | 부자 충주 상행선 주유소 | `\\(상\\)주` → 상행선 주유소 |
| SK에너지 서울(하)주 | SK에너지 서울 하행선 주유소 | `\\(하\\)주` → 하행선 주유소 |
| GS칼텍스셀프 강남직영 | GS칼텍스 강남 셀프 직영 | `셀프`, `직영` 추출 |

### 3. 대형마트/백화점 패턴
| 입력 | 출력 | 분석 |
|------|------|------|
| 이마트 에브리데이 서 | 이마트 | 핵심 브랜드명 추출 |
| 롯데백화점잠실점 | 롯데백화점 잠실점 | 브랜드 + 지점 분리 |
| 신세계백화점본점 | 신세계백화점 본점 | 본점 표시자 분리 |

### 4. 해외 서비스 패턴
| 입력 | 출력 | 분석 |
|------|------|------|
| CLAUDE.AI SUBSCRIPTION SAN FRANCISCO USA | Claude AI | 핵심 서비스명 추출 |
| GOOGLE PAYMENT KOREA | 구글페이 | 결제 서비스 정규화 |
| NETFLIX COM BILL | 넷플릭스 | 구독 서비스 정규화 |

### 5. 정부/공공기관 패턴  
| 입력 | 출력 | 분석 |
|------|------|------|
| 세금인증수수료 | 세금 인증수수료 | 공공요금 분리 |
| 국민연금관리공단 | 국민연금 | 공단명 정규화 |
| 한국전력공사 | 한전 | 공기업 약칭 적용 |

## 🏗️ 시스템 아키텍처

### 처리 파이프라인
```
1. 원본 거래문자열 수신
   ↓
2. 전처리 규칙 매칭 (우선순위 순)
   ↓  
3. 정규식 패턴 적용
   ↓
4. 추출된 키워드 조합
   ↓
5. 메타데이터 태깅 (업종, 위치 등)
   ↓
6. 정규화된 텍스트 + 메타데이터 출력
   ↓
7. KeywordExtractionEngine으로 전달
```

### 데이터베이스 스키마

#### 1. regex_preprocessing_rules (전처리 규칙)
```sql
CREATE TABLE regex_preprocessing_rules (
    id                  BIGSERIAL PRIMARY KEY,
    rule_name          VARCHAR(100) NOT NULL,      -- 규칙명
    description        TEXT,                       -- 규칙 설명
    category           VARCHAR(50) NOT NULL,       -- 카테고리 (법인구조, 주유소, 마트 등)
    input_pattern      TEXT NOT NULL,              -- 입력 정규식 패턴
    output_template    TEXT NOT NULL,              -- 출력 템플릿
    priority           INTEGER DEFAULT 100,        -- 처리 우선순위 (높을수록 먼저)
    is_active          BOOLEAN DEFAULT true,       -- 활성 상태
    metadata_tags      JSONB,                      -- 메타데이터 태그 {"industry": "gas_station", "location_type": "highway"}
    test_cases         JSONB,                      -- 테스트 케이스 [{"input": "...", "expected": "..."}]
    usage_count        BIGINT DEFAULT 0,           -- 사용 횟수
    success_rate       DECIMAL(5,2),               -- 성공률
    created_at         TIMESTAMP DEFAULT NOW(),
    updated_at         TIMESTAMP DEFAULT NOW()
);
```

#### 2. regex_preprocessing_categories (카테고리)
```sql
CREATE TABLE regex_preprocessing_categories (
    id                 BIGSERIAL PRIMARY KEY,
    category_name      VARCHAR(50) NOT NULL UNIQUE,  -- 카테고리명
    description        TEXT,                         -- 설명
    display_order      INTEGER DEFAULT 0,            -- 표시 순서
    icon_name          VARCHAR(50),                  -- 아이콘명
    color_hex          VARCHAR(7),                   -- 색상코드
    is_active          BOOLEAN DEFAULT true,         -- 활성 상태
    created_at         TIMESTAMP DEFAULT NOW()
);
```

#### 3. regex_preprocessing_logs (처리 로그)
```sql  
CREATE TABLE regex_preprocessing_logs (
    id                 BIGSERIAL PRIMARY KEY,
    original_text      TEXT NOT NULL,                -- 원본 텍스트
    normalized_text    TEXT,                         -- 정규화된 텍스트
    applied_rule_id    BIGINT,                       -- 적용된 규칙 ID
    applied_rule_name  VARCHAR(100),                 -- 적용된 규칙명
    extracted_metadata JSONB,                        -- 추출된 메타데이터
    processing_time_ms INTEGER,                      -- 처리 시간
    success            BOOLEAN DEFAULT true,         -- 성공 여부
    error_message      TEXT,                         -- 오류 메시지
    created_at         TIMESTAMP DEFAULT NOW()
);
```

### 인덱스 설계
```sql
-- 성능 최적화 인덱스
CREATE INDEX idx_regex_rules_category ON regex_preprocessing_rules(category);
CREATE INDEX idx_regex_rules_priority ON regex_preprocessing_rules(priority DESC);
CREATE INDEX idx_regex_rules_active ON regex_preprocessing_rules(is_active) WHERE is_active = true;
CREATE INDEX idx_regex_logs_created_at ON regex_preprocessing_logs(created_at DESC);
CREATE INDEX idx_regex_logs_rule_id ON regex_preprocessing_logs(applied_rule_id);

-- GIN 인덱스 (메타데이터 검색용)
CREATE INDEX idx_regex_rules_metadata ON regex_preprocessing_rules USING GIN(metadata_tags);
CREATE INDEX idx_regex_logs_metadata ON regex_preprocessing_logs USING GIN(extracted_metadata);
```

## ⚙️ 핵심 서비스 구현

### 1. RegexPreprocessingEngine (핵심 엔진) - **✅ 구현 완료**
```typescript
// /lib/services/regex-preprocessing.service.ts
import { PrismaClient } from '@/lib/generated/prisma';

export class RegexPreprocessingEngine {
  private static instance: RegexPreprocessingEngine;
  private rulesCache: Map<string, RegexRule[]> = new Map();
  private patternCache: Map<string, RegExp> = new Map();

  /**
   * 메인 전처리 메서드
   */
  async preprocess(originalText: string): Promise<ProcessingResult> {
    const startTime = Date.now();
    
    try {
      // 1. 활성 규칙 조회 (우선순위 순, 5분 캐시)
      const rules = await this.getActiveRules();
      
      // 2. 규칙 적용
      const result = await this.applyRules(originalText, rules);
      
      // 3. 처리 시간 계산
      const processingTimeMs = Date.now() - startTime;
      
      // 4. 로그 저장 (비동기)
      await this.logProcessing(originalText, { ...result, processingTimeMs });
      
      return { ...result, processingTimeMs };
    } catch (error) {
      // 에러 처리 및 로깅
      const processingTimeMs = Date.now() - startTime;
      const errorResult: ProcessingResult = {
        originalText,
        normalizedText: originalText, // 원본 텍스트 반환
        success: false,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        processingTimeMs
      };
      
      await this.logProcessing(originalText, errorResult);
      return errorResult;
    }
  }

  /**
   * 정규식 규칙 적용
   */
  private async applyRules(text: string, rules: RegexRule[]): Promise<Omit<ProcessingResult, 'processingTimeMs'>> {
    for (const rule of rules) {
      try {
        const pattern = this.getCompiledPattern(rule.inputPattern);
        const match = pattern.exec(text);
        
        if (match) {
          // 매칭된 규칙 적용
          const normalizedText = this.applyOutputTemplate(match, rule.outputTemplate);
          const metadata = this.extractMetadata(match, rule);
          
          // 사용 횟수 증가 (비동기)
          await this.incrementUsageCount(rule.id);
          
          return {
            originalText: text,
            normalizedText,
            appliedRuleId: rule.id,
            appliedRuleName: rule.ruleName,
            extractedMetadata: metadata,
            success: true
          };
        }
      } catch (error) {
        console.warn(`Rule ${rule.id} (${rule.ruleName}) failed:`, error);
        continue; // 다음 규칙 시도
      }
    }
    
    // 매칭되는 규칙이 없는 경우 기본 정규화
    return {
      originalText: text,
      normalizedText: this.defaultNormalize(text),
      success: true
    };
  }

  /**
   * 정규식 패턴 컴파일 캐싱 (메모리 효율성)
   */
  private getCompiledPattern(pattern: string): RegExp {
    if (!this.patternCache.has(pattern)) {
      this.patternCache.set(pattern, new RegExp(pattern, 'gi'));
    }
    return this.patternCache.get(pattern)!;
  }

  /**
   * 출력 템플릿 적용 ($1, $2, ... 치환)
   */
  private applyOutputTemplate(match: RegExpExecArray, template: string): string {
    let result = template;
    
    // $1, $2, ... 순차 치환
    for (let i = 1; i < match.length; i++) {
      result = result.replace(new RegExp(`\\$${i}`, 'g'), match[i] || '');
    }
    
    return result.trim();
  }

  /**
   * 메타데이터 추출 (분석용)
   */
  private extractMetadata(match: RegExpExecArray, rule: RegexRule): Record<string, any> {
    return {
      ...rule.metadataTags,
      matchedGroups: match.slice(1),
      fullMatch: match[0],
      ruleCategory: rule.category,
      rulePriority: rule.priority
    };
  }

  /**
   * 기본 정규화 (매칭 실패 시)
   */
  private defaultNormalize(text: string): string {
    return text
      .replace(/[^\w가-힣\s]/g, ' ')  // 특수문자 → 공백
      .replace(/\s+/g, ' ')          // 연속 공백 정리
      .trim();
  }
}
```

### 2. RegexRuleManagementService (규칙 관리) - **✅ 구현 완료**
```typescript
export class RegexRuleManagementService {
  private static instance: RegexRuleManagementService;

  /**
   * 규칙 생성 (검증 포함)
   */
  async createRule(request: CreateRuleRequest): Promise<RegexRule> {
    // 1. 정규식 패턴 검증 (ReDoS 위험 검사)
    this.validateRegexPattern(request.inputPattern);
    
    // 2. 테스트 케이스 검증
    if (request.testCases) {
      await this.validateTestCases(request.inputPattern, request.outputTemplate, request.testCases);
    }
    
    // 3. Prisma로 규칙 저장
    const rule = await prisma.regexPreprocessingRule.create({
      data: {
        ruleName: request.ruleName,
        description: request.description,
        category: request.category,
        inputPattern: request.inputPattern,
        outputTemplate: request.outputTemplate,
        priority: request.priority || 100,
        metadataTags: request.metadataTags,
        testCases: request.testCases
      },
      include: { category_ref: true }
    });
    
    // 4. 캐시 무효화
    this.invalidateCache();
    
    return this.formatRule(rule);
  }

  /**
   * 정규식 패턴 보안 검증
   */
  private validateRegexPattern(pattern: string): void {
    try {
      new RegExp(pattern);
    } catch (error) {
      throw new Error(`Invalid regex pattern: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
    
    // ReDoS 위험 패턴 검사
    const dangerousPatterns = [
      /(\.\*){2,}/,           // 중첩된 .* 패턴
      /(\+\*|\*\+)/,          // +* 또는 *+ 조합  
      /((\w\+\*)|(\w\*\+))/   // word character와 +* 조합
    ];
    
    for (const dangerous of dangerousPatterns) {
      if (dangerous.test(pattern)) {
        throw new Error('Potentially dangerous regex pattern detected (ReDoS risk)');
      }
    }
  }

  /**
   * 규칙 테스트 실행
   */
  async testRule(ruleId: number, testInputs: string[]): Promise<RuleTestResult> {
    const rule = await prisma.regexPreprocessingRule.findUnique({
      where: { id: BigInt(ruleId) }
    });
    
    if (!rule) {
      throw new Error('Rule not found');
    }
    
    const results: TestCaseResult[] = [];
    
    for (const input of testInputs) {
      const startTime = Date.now();
      
      try {
        const pattern = new RegExp(rule.inputPattern, 'gi');
        const match = pattern.exec(input);
        
        if (match) {
          const output = this.applyTemplate(match, rule.outputTemplate);
          const metadata = { 
            matchedGroups: match.slice(1), 
            fullMatch: match[0] 
          };
          
          results.push({
            input,
            output,
            metadata,
            processingTime: Date.now() - startTime,
            success: true
          });
        } else {
          results.push({
            input,
            processingTime: Date.now() - startTime,
            success: false,
            errorMessage: 'Pattern did not match'
          });
        }
      } catch (error) {
        results.push({
          input,
          processingTime: Date.now() - startTime,
          success: false,
          errorMessage: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
    
    const successCount = results.filter(r => r.success).length;
    const successRate = (successCount / results.length) * 100;
    
    return {
      ruleId,
      ruleName: rule.ruleName,
      testResults: results,
      successRate
    };
  }
}
```

### 2. RegexRuleManagementService (규칙 관리)
```java
@Service
@RequiredArgsConstructor  
public class RegexRuleManagementService {
    
    private final RegexRuleRepository regexRuleRepository;
    private final RedisTemplate<String, Object> redisTemplate;
    
    /**
     * 규칙 생성
     */
    public RegexPreprocessingRule createRule(CreateRuleRequest request) {
        // 1. 정규식 패턴 검증
        validateRegexPattern(request.getInputPattern());
        
        // 2. 테스트 케이스 검증
        validateTestCases(request);
        
        // 3. 규칙 저장
        RegexPreprocessingRule rule = RegexPreprocessingRule.builder()
            .ruleName(request.getRuleName())
            .category(request.getCategory())
            .inputPattern(request.getInputPattern())
            .outputTemplate(request.getOutputTemplate())
            .priority(request.getPriority())
            .metadataTags(request.getMetadataTags())
            .testCases(request.getTestCases())
            .build();
            
        RegexPreprocessingRule saved = regexRuleRepository.save(rule);
        
        // 4. 캐시 갱신
        invalidateCache();
        
        return saved;
    }
    
    /**
     * 규칙 테스트 실행
     */
    public RuleTestResult testRule(Long ruleId, List<String> testInputs) {
        RegexPreprocessingRule rule = regexRuleRepository.findById(ruleId)
            .orElseThrow(() -> new EntityNotFoundException("Rule not found"));
            
        List<TestCaseResult> results = new ArrayList<>();
        
        for (String input : testInputs) {
            try {
                PreprocessingResult result = applyRule(input, rule);
                results.add(TestCaseResult.builder()
                    .input(input)
                    .output(result.getNormalizedText())
                    .metadata(result.getExtractedMetadata())
                    .success(true)
                    .build());
            } catch (Exception e) {
                results.add(TestCaseResult.builder()
                    .input(input)
                    .success(false)
                    .errorMessage(e.getMessage()) 
                    .build());
            }
        }
        
        return RuleTestResult.builder()
            .ruleId(ruleId)
            .ruleName(rule.getRuleName())
            .testResults(results)
            .successRate(calculateSuccessRate(results))
            .build();
    }
}
```

## 🎨 어드민 UI 구현

### 1. 규칙 관리 화면 구성
```
📋 정규식 전처리 규칙 관리
├── 🔍 규칙 목록 (카테고리별 필터링)
├── ➕ 새 규칙 추가
├── ✏️ 규칙 수정
├── 🧪 규칙 테스트
├── 📊 처리 통계
└── 📝 처리 로그
```

### 2. 핵심 UI 컴포넌트

#### RegexRuleManager.tsx
```typescript
interface RegexRule {
  id: number;
  ruleName: string;
  category: string;
  inputPattern: string;
  outputTemplate: string;
  priority: number;
  testCases: TestCase[];
  isActive: boolean;
  usageCount: number;
  successRate: number;
}

interface TestCase {
  input: string;
  expected: string;
  description?: string;
}

const RegexRuleManager: React.FC = () => {
  const [rules, setRules] = useState<RegexRule[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [testInput, setTestInput] = useState<string>('');
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  
  // 규칙 테스트 실행
  const handleTestRule = async (ruleId: number) => {
    const result = await regexRuleApi.testRule(ruleId, [testInput]);
    setTestResults(result.testResults);
  };
  
  // 실시간 패턴 미리보기
  const handlePatternPreview = (pattern: string, input: string) => {
    try {
      const regex = new RegExp(pattern);
      const match = regex.exec(input);
      return match ? match.groups || match.slice(1) : null;
    } catch (error) {
      return { error: '잘못된 정규식 패턴' };
    }
  };
  
  return <div>...</div>;
};
```

## 📊 성능 및 모니터링

### 성능 목표
- **전처리 시간**: < 5ms (캐시 히트 시 < 1ms)
- **규칙 매칭 정확도**: 95% 이상
- **캐시 히트율**: 85% 이상
- **시스템 가용성**: 99.9%

### 모니터링 지표
```yaml
핵심 메트릭:
  - 전처리 성공률
  - 평균 처리 시간
  - 규칙별 사용 통계
  - 캐시 히트율
  - 오류 발생률

알림 조건:
  - 성공률 < 90%: WARNING
  - 성공률 < 80%: CRITICAL  
  - 평균 처리시간 > 10ms: WARNING
  - 오류율 > 5%: CRITICAL
```

## 🚀 구현 단계별 계획 (현재 진행 상황)

### Phase 1: 핵심 인프라 구축 - **✅ 완료**
- [x] **데이터베이스 스키마 생성** - Prisma 스키마에 3개 테이블 추가
  - `regex_preprocessing_rules` - 정규식 규칙 저장
  - `regex_preprocessing_categories` - 카테고리 관리
  - `regex_preprocessing_logs` - 처리 로그 저장
- [x] **RegexPreprocessingEngine 핵심 로직 구현** - TypeScript로 완전 구현
  - 패턴 매칭 및 캐싱 시스템
  - 메타데이터 추출 및 로깅
  - 에러 처리 및 복구 로직
- [x] **기본 CRUD API 구현** - Next.js App Router 사용
  - `GET /api/regex-preprocessing/rules` - 규칙 목록 조회
  - `POST /api/regex-preprocessing/rules` - 규칙 생성
  - `POST /api/regex-preprocessing/rules/[id]/test` - 규칙 테스트
  - `POST /api/regex-preprocessing/preprocess` - 전처리 실행
  - `GET /api/regex-preprocessing/performance` - 성능 통계
- [x] **보안 검증** - ReDoS 공격 방지 로직 구현

### Phase 2: 어드민 UI 구현 - **🔄 진행 중**
- [x] **기본 레이아웃** - 대시보드, 규칙 관리 화면 구조 완성
- [x] **규칙 관리 화면 구현** - CRUD 기본 화면 완성
- [ ] **실시간 테스트 기능 구현** ← 현재 작업 중
- [ ] **엑셀 익스포트/임포트 기능** - 규칙 대량 관리 
- [ ] **패턴 미리보기 기능**
- [ ] **통계 대시보드 구현**

### Phase 3: 핵심 규칙 구축 (1주) - **대기 중**
- [ ] 법인구조 정규화 규칙 (10개)
- [ ] 주유소 전용 규칙 (15개)
- [ ] 대형마트/백화점 규칙 (20개)
- [ ] 해외서비스 규칙 (10개)
- [ ] 공공기관 규칙 (10개)

### Phase 4: 성능 최적화 (1주) - **대기 중**
- [ ] Redis 캐싱 최적화
- [x] **정규식 컴파일 캐싱** - 메모리 캐시로 구현 완료
- [ ] 벌크 처리 최적화
- [x] **모니터링 시스템 구축** - 기본 성능 통계 API 완성

### Phase 5: 기존 시스템 통합 (1주) - **대기 중**
- [ ] KeywordExtractionEngine 연동
- [ ] 기존 데이터 마이그레이션
- [ ] A/B 테스트 실행
- [ ] 성능 검증 및 튜닝

---

### 📊 현재 구현 현황 (2025-01-26 기준)

**완성된 기능:**
- ✅ 데이터베이스 스키마 및 마이그레이션
- ✅ 핵심 전처리 엔진 (RegexPreprocessingEngine)
- ✅ 규칙 관리 서비스 (RegexRuleManagementService)
- ✅ 성능 통계 서비스 (RegexPerformanceService)
- ✅ REST API 엔드포인트 5개
- ✅ 보안 검증 (ReDoS 방지)
- ✅ 어드민 UI 기본 구조

**진행 중인 작업:**
- 🔄 실시간 테스트 기능 어드민 UI 구현
- 🔄 백엔드-프론트엔드 API 연동

**다음 단계:**
1. 실시간 테스트 기능 완성
2. 엑셀 익스포트/임포트 기능 구현 (규칙 대량 관리)
3. LLM 패턴 생성 시스템 구축
4. 충돌 감지 알고리즘 구현
5. 대량 테스트 및 성능 분석 도구

## 🎯 예상 효과

### 정량적 효과
- **키워드 매칭 정확도**: 77% → 90%+ (13%+ 향상)
- **전처리 속도**: 현재보다 2-3배 향상
- **유지보수성**: 어드민 UI를 통한 실시간 규칙 관리
- **확장성**: 새로운 거래 패턴 대응 시간 단축 (일 → 분)

### 정성적 효과
- **개발 효율성**: 하드코딩된 전처리 로직 → 설정 기반 관리
- **비즈니스 민첩성**: 신규 업종/브랜드 대응 속도 향상
- **운영 안정성**: 체계적인 로깅 및 모니터링
- **사용자 만족도**: 더 정확한 거래 분류 결과

---

## 🔗 관련 시스템 연동

### 기존 시스템과의 관계
```
[정규식 기반 전처리 시스템] → [KeywordExtractionEngine] → [태그 매핑] → [계정과목 매핑]
```

### REST API 엔드포인트 명세 - **✅ 구현 완료**

#### 1. 규칙 관리 API
```typescript
// GET /api/regex-preprocessing/rules - 규칙 목록 조회
// 쿼리 파라미터: category, active, sortBy, limit, offset
Response: {
  success: boolean;
  data: RegexRule[];
  total: number;
}

// POST /api/regex-preprocessing/rules - 새 규칙 생성
Request: CreateRuleRequest {
  ruleName: string;
  description?: string;
  category: string;
  inputPattern: string;
  outputTemplate: string;
  priority?: number;
  metadataTags?: Record<string, any>;
  testCases?: TestCase[];
}
Response: {
  success: boolean;
  data: RegexRule;
}
```

#### 2. 규칙 테스트 API
```typescript
// POST /api/regex-preprocessing/rules/[id]/test - 규칙 테스트 실행
Request: {
  testInputs: string[];
}
Response: {
  success: boolean;
  data: RuleTestResult {
    ruleId: number;
    ruleName: string;
    testResults: TestCaseResult[];
    successRate: number;
  };
}
```

#### 3. 전처리 실행 API
```typescript
// POST /api/regex-preprocessing/preprocess - 텍스트 전처리 실행
Request: {
  text?: string;        // 단일 텍스트
  texts?: string[];     // 다중 텍스트 배치 처리
}
Response: {
  success: boolean;
  data: ProcessingResult | {
    results: ProcessingResult[];
    summary: {
      total: number;
      successful: number;
      failed: number;
      successRate: number;
      totalProcessingTime: number;
      averageProcessingTime: number;
    };
  };
}
```

#### 4. 성능 통계 API
```typescript
// GET /api/regex-preprocessing/performance?period=7d - 성능 통계 조회
Response: {
  success: boolean;
  data: PerformanceStats {
    totalRules: number;
    activeRules: number;
    processingAccuracy: number;
    averageProcessingTime: number;
    cacheHitRate: number;
    dailyProcessingCount: number;
    errorRate: number;
    topCategories: CategoryStats[];
  };
  period: string;
}
```

#### 5. 엑셀 익스포트/임포트 API (예정)
```typescript
// GET /api/regex-preprocessing/export - 규칙 엑셀 다운로드
// 쿼리 파라미터: category, format (xlsx/csv)
Response: File (Excel/CSV)

// POST /api/regex-preprocessing/import - 엑셀 파일 업로드
Request: FormData {
  file: File;
  options: {
    overwrite: boolean;     // 기존 규칙 덮어쓰기 여부
    validate: boolean;      // 업로드 전 검증 수행
    dryRun: boolean;       // 시뮬레이션만 수행
  };
}
Response: {
  success: boolean;
  data: {
    imported: number;       // 성공적으로 임포트된 규칙 수
    updated: number;        // 업데이트된 규칙 수
    errors: ImportError[];  // 오류 목록
    warnings: string[];     // 경고 목록
  };
}

// Excel 파일 형식 명세
interface ExcelRuleFormat {
  규칙명: string;
  설명: string;
  카테고리: string;
  입력패턴: string;
  출력템플릿: string;
  우선순위: number;
  활성상태: 'Y' | 'N';
  메타데이터: string;        // JSON 문자열
  테스트케이스: string;      // JSON 문자열
}
```

### API 인터페이스 - KeywordExtractionEngine 연동 (예정)
```typescript
// 기존 시스템과의 통합을 위한 인터페이스
interface ProcessingResult {
  originalText: string;           // 원본 텍스트
  normalizedText: string;         // 정규화된 텍스트
  appliedRuleId?: number;         // 적용된 규칙 ID
  appliedRuleName?: string;       // 적용된 규칙명
  extractedMetadata?: Record<string, any>;  // 추출된 메타데이터
  processingTimeMs: number;       // 처리 시간
  success: boolean;               // 처리 성공 여부
  errorMessage?: string;          // 오류 메시지
}

// KeywordExtractionEngine에서 호출 (향후 통합 예정)
class KeywordExtractionEngine {
  private readonly preprocessingEngine = RegexPreprocessingEngine.getInstance();
  
  async extractAndMatch(transactionText: string, amount: number, transactionTime: Date) {
    // 1. 전처리 시스템 호출
    const preprocessed = await this.preprocessingEngine.preprocess(transactionText);
    
    // 2. 전처리된 텍스트로 키워드 추출
    const keywords = this.extractKeywords(preprocessed.normalizedText);
    
    // 3. 메타데이터 활용한 추가 로직
    if (preprocessed.extractedMetadata?.industry) {
      // 업종 정보 기반 추가 처리
    }
    
    // 4. 기존 Layer 1 키워드 매칭 수행
    return this.performKeywordMatching(keywords, preprocessed.extractedMetadata);
  }
}
```

이 설계서를 바탕으로 정규식 기반 전처리 시스템을 체계적으로 구축하여, MoneyShift의 거래 분류 정확도를 대폭 향상시킬 수 있습니다.

---

# 📱 v1.0 어드민 툴 기능 설계서 및 화면 와이어프레임

## 🎯 어드민 툴 개요

정규식 전처리 시스템을 위한 **강력한 어드민 관리 도구**로, LLM 지원 패턴 생성, 실시간 테스트, 충돌 감지, 우선순위 최적화 등 고급 기능을 제공합니다.

### 핵심 기능 요구사항
- **지능형 패턴 생성**: LLM 기반 정규식 패턴 자동 생성 및 제안
- **실시간 테스트 엔진**: 패턴 적용 결과를 즉시 확인
- **충돌 감지 시스템**: 패턴 간 겹침 및 우선순위 문제 자동 탐지
- **직관적 UI/UX**: 드래그앤드롭 우선순위 조정, 비주얼 패턴 편집기
- **성능 최적화**: 대량 데이터 처리 및 실시간 응답

---

## 🖼️ 화면별 와이어프레임 설계

### 1. 메인 대시보드 화면

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│ MoneyShift 정규식 전처리 관리 시스템                    [🔍 Search] [👤 Admin] [⚙️ Settings] │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                         │
│ 📊 시스템 개요                                           📈 처리 통계 (최근 7일)            │
│ ┌─────────────────────┐ ┌─────────────────────┐        ┌─────────────────────────────────┐│
│ │ 활성 규칙 수         │ │ 처리 정확도          │        │     성공률 추이                   ││
│ │      247           │ │     94.3%          │        │  95% ┌─┐                        ││
│ │   ↗️ +12 (이번 주)   │ │   ↗️ +2.1% (이번 주) │        │      │ │  ┌─┐  ┌─┐              ││
│ └─────────────────────┘ └─────────────────────┘        │  90% │ │┌─┘ │┌─┘ │              ││
│                                                        │      └─┘│   └┘   │              ││
│ ┌─────────────────────┐ ┌─────────────────────┐        │  85%    └────────┴─────────────  ││
│ │ 금일 처리 건수       │ │ 평균 처리 시간       │        │        월  화  수  목  금  토  일   ││
│ │    1,247           │ │     3.2ms          │        └─────────────────────────────────┘│
│ │   ↗️ +8% (어제 대비) │ │   ↘️ -0.3ms (어제 대비)│                                         │
│ └─────────────────────┘ └─────────────────────┘                                         │
│                                                                                         │
│ 🚨 시스템 알림                               🔄 최근 활동                                    │
│ ┌─────────────────────────────────────────┐ ┌─────────────────────────────────────────┐│
│ │ ⚠️  충돌 감지: "주유소" 패턴 3개 겹침      │ │ 09:23 - 김관리자: "편의점" 규칙 수정     ││
│ │     → 우선순위 조정 필요                 │ │ 09:15 - 시스템: 새 패턴 5개 LLM 제안     ││
│ │                                         │ │ 08:44 - 이개발자: "카페" 테스트 완료     ││
│ │ 🔍 성능 저하: 처리 시간 5ms 초과 (12회)   │ │ 08:30 - 시스템: 주간 성능 리포트 생성    ││
│ │     → 패턴 최적화 권장                   │ │                                         ││
│ └─────────────────────────────────────────┘ └─────────────────────────────────────────┘│
│                                                                                         │
│ 🎯 빠른 액션                                                                             │
│ [➕ 새 규칙 추가] [🧪 대량 테스트] [🔧 패턴 최적화] [📊 성능 분석] [🤖 LLM 패턴 생성]        │
│                                                                                         │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

#### 주요 구성 요소
- **실시간 통계 위젯**: 시스템 상태를 한눈에 파악
- **알림 센터**: 충돌, 성능 문제 등 즉시 알림
- **빠른 액션 버튼**: 자주 사용하는 기능에 원클릭 접근
- **활동 로그**: 팀원들의 최근 작업 이력 표시

### 2. 규칙 관리 메인 화면

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│ 📋 정규식 전처리 규칙 관리                                                                 │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                         │
│ 🔍 필터 및 검색                                                                          │
│ ┌─────────────────────────────────────────────────────────────────────────────────────┐│
│ │ [🔍 키워드 검색: "주유소"    ] [📂 카테고리: 전체 ▼] [⚡ 상태: 활성 ▼] [📊 정렬: 우선순위 ▼] ││
│ │                                                                                     ││
│ │ 🏷️ 태그 필터: [법인구조] [주유소] [마트] [해외서비스] [공공기관] [+ 더보기]               ││
│ └─────────────────────────────────────────────────────────────────────────────────────┘│
│                                                                                         │
│ 📊 규칙 통계: 총 247개 규칙 | 활성 231개 | 비활성 16개 | 충돌 3개                         │
│                                                                                         │
│ 🎛️ 액션 바                                                                              │
│ [➕ 새 규칙] [🤖 LLM 생성] [📤 가져오기] [📥 내보내기] [🔧 대량 편집] [🧪 대량 테스트]       │
│                                                                                         │
│ 📋 규칙 목록 (우선순위 순)                                      [📄 10개씩 보기 ▼] 1/25 페이지 │
│ ┌─────────────────────────────────────────────────────────────────────────────────────┐│
│ │ ⚠️  [ 충돌 ] 우선순위: 150 | 📂 주유소 | ✅ 활성                    [↕️] [✏️] [🧪] [❌] ││
│ │     규칙명: "주유소 상하행선 분리"                                                     ││
│ │     패턴: `(\S+)\s*\((상|하)\)주\s*(-?\d+)`                                        ││
│ │     출력: `$1 $2행선 주유소`                                                         ││
│ │     테스트: 15개 | 성공률: 93.3% | 사용: 1,247회                                      ││
│ │     ⚠️ 충돌: "GS칼텍스 패턴"과 67% 겹침                             마지막 수정: 2시간 전 ││
│ ├─────────────────────────────────────────────────────────────────────────────────────┤│
│ │      우선순위: 145 | 📂 법인구조 | ✅ 활성                         [↕️] [✏️] [🧪] [❌] ││
│ │     규칙명: "주식회사 표시 제거"                                                       ││
│ │     패턴: `주식회사\s*(.+)`                                                          ││
│ │     출력: `$1`                                                                      ││
│ │     테스트: 8개 | 성공률: 100% | 사용: 2,156회                                        ││
│ │     ✅ 정상                                                        마지막 수정: 1일 전 ││
│ ├─────────────────────────────────────────────────────────────────────────────────────┤│
│ │      우선순위: 140 | 📂 해외서비스 | ✅ 활성                       [↕️] [✏️] [🧪] [❌] ││
│ │     규칙명: "Claude AI 정규화"                                                        ││
│ │     패턴: `CLAUDE\.AI\s+SUBSCRIPTION.*`                                             ││
│ │     출력: `Claude AI`                                                               ││
│ │     테스트: 3개 | 성공률: 100% | 사용: 89회                                           ││
│ │     🆕 새 규칙                                                     마지막 수정: 30분 전 ││
│ └─────────────────────────────────────────────────────────────────────────────────────┘│
│                                                                                         │
│ [이전] [1] [2] [3] ... [25] [다음]                                                      │
│                                                                                         │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

#### 주요 기능
- **우선순위 드래그앤드롭**: 직관적인 순서 조정
- **실시간 충돌 감지**: 패턴 겹침을 시각적으로 표시
- **성능 지표 표시**: 성공률, 사용 횟수, 처리 시간
- **일괄 작업**: 여러 규칙을 동시에 관리

### 3. 규칙 생성/편집 화면

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│ ✏️ 정규식 규칙 편집: "주유소 상하행선 분리"                                                │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                         │
│ 📝 기본 정보                                                                             │
│ ┌─────────────────────────────────────────────────────────────────────────────────────┐│
│ │ 규칙명: [주유소 상하행선 분리                                     ]                    ││
│ │ 설명:   [주유소 거래에서 (상)주, (하)주를 상행선, 하행선으로 변환     ]                    ││
│ │ 카테고리: [주유소 ▼]  우선순위: [150] 🔼🔽  상태: [✅ 활성 ▼]                         ││
│ └─────────────────────────────────────────────────────────────────────────────────────┘│
│                                                                                         │
│ 🎯 패턴 정의                                                                             │
│ ┌─────────────────────────────────────────────────────────────────────────────────────┐│
│ │ 입력 패턴 (정규식):                                               [🤖 LLM 도움] [📚 도움말] ││
│ │ [(\S+)\s*\((상|하)\)주\s*(-?\d+)                                              ]       ││
│ │                                                                                     ││
│ │ 📊 패턴 복잡도: 중간 (75점/100점) | 🚀 예상 성능: 빠름 (< 2ms)                         ││
│ │ ⚠️ ReDoS 위험도: 낮음 | 💡 최적화 제안: 캡처 그룹 최소화                              ││
│ │                                                                                     ││
│ │ 출력 템플릿:                                                                         ││
│ │ [$1 $2행선 주유소                                                                  ] ││
│ │                                                                                     ││
│ │ 🔗 메타데이터 설정:                                                                  ││
│ │ - industry: [gas_station ▼]                                                        ││
│ │ - location_type: [highway ▼]                                                       ││
│ │ - extraction_method: [regex ▼]                                                     ││
│ └─────────────────────────────────────────────────────────────────────────────────────┘│
│                                                                                         │
│ 🧪 실시간 테스트                                                                         │
│ ┌─────────────────────────────────────────────────────────────────────────────────────┐│
│ │ 🎯 테스트 케이스 추가: [Shell 강남(상)주 -80000                          ] [➕ 추가]  ││
│ │                                                                                     ││
│ │ 📋 테스트 결과:                                                      [🧪 모두 실행]   ││
│ │ ┌─────────────────────────────────────────────────────────────────────────────────┐ ││
│ │ │ ✅ Shell 강남(상)주 -80000        →  Shell 강남 상행선 주유소             [❌]    │ ││
│ │ │ ✅ GS칼텍스 서울(하)주 -65000      →  GS칼텍스 서울 하행선 주유소          [❌]    │ ││
│ │ │ ✅ SK에너지 부산(상)주 -72000      →  SK에너지 부산 상행선 주유소          [❌]    │ ││
│ │ │ ❌ 이마트 강남점 -25000           →  매칭 실패 (패턴 불일치)              [❌]    │ ││
│ │ │ ✅ 현대오일뱅크 대전(하)주 -58000   →  현대오일뱅크 대전 하행선 주유소       [❌]    │ ││
│ │ └─────────────────────────────────────────────────────────────────────────────────┘ ││
│ │                                                                                     ││
│ │ 📊 테스트 통계: 총 5개 | 성공 4개 (80%) | 실패 1개 (20%) | 평균 처리 시간: 1.2ms        ││
│ └─────────────────────────────────────────────────────────────────────────────────────┘│
│                                                                                         │
│ ⚠️ 충돌 감지                                                                            │
│ ┌─────────────────────────────────────────────────────────────────────────────────────┐│
│ │ 🚨 패턴 충돌 감지: 2개 규칙과 겹침                                                    ││
│ │ ┌─────────────────────────────────────────────────────────────────────────────────┐ ││
│ │ │ ⚠️ "GS칼텍스 전용 패턴" (우선순위 120) - 67% 겹침                    [🔍 상세보기]  │ ││
│ │ │    문제: "GS칼텍스" 키워드로 양쪽 패턴 모두 매칭                                  │ ││
│ │ │    제안: 현재 규칙 우선순위를 120보다 높이거나 패턴 수정                           │ ││
│ │ ├─────────────────────────────────────────────────────────────────────────────────┤ ││
│ │ │ ⚠️ "전체 주유소 패턴" (우선순위 100) - 23% 겹침                       [🔍 상세보기] │ ││
│ │ │    문제: 일반적인 주유소 패턴과 부분 겹침                                         │ ││
│ │ │    제안: 더 구체적인 패턴으로 수정 권장                                           │ ││
│ │ └─────────────────────────────────────────────────────────────────────────────────┘ ││
│ │                                                                                     ││
│ │ 💡 해결 제안: [우선순위 자동 조정] [패턴 수정 제안] [LLM 도움 요청]                     ││
│ └─────────────────────────────────────────────────────────────────────────────────────┘│
│                                                                                         │
│ 🎛️ 액션                                                                                 │
│ [💾 저장] [🧪 전체 테스트] [🤖 LLM 최적화] [📋 복사] [🚨 충돌 해결] [❌ 취소]              │
│                                                                                         │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

#### 핵심 특징
- **실시간 패턴 검증**: 입력과 동시에 유효성 검사
- **비주얼 테스트 엔진**: 매칭 과정을 시각적으로 표시
- **지능형 충돌 감지**: 패턴 간 겹침을 자동으로 탐지하고 해결책 제안
- **성능 예측**: 패턴의 예상 성능과 위험도 미리 표시

### 4. LLM 지원 패턴 생성 화면

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│ 🤖 LLM 지원 정규식 패턴 생성                                                             │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                         │
│ 📝 거래 데이터 입력                                                                      │
│ ┌─────────────────────────────────────────────────────────────────────────────────────┐│
│ │ 🎯 분석할 거래 문자열들 (한 줄씩 입력):                              [📄 파일 업로드]   ││
│ │ ┌─────────────────────────────────────────────────────────────────────────────────┐ ││
│ │ │ (주)코드쉬프트 개발팀 회식비                                                    │ ││
│ │ │ 주식회사 코드쉬프트 사무용품 구매                                               │ ││
│ │ │ 코드쉬프트 교육비 결제                                                          │ ││
│ │ │ (유)부자마트 생필품 구매                                                       │ ││
│ │ │ 사단법인 한국협회 연회비 납부                                                   │ ││
│ │ │ 코드쉬프트 직원 급여 지급                                                       │ ││
│ │ │                                                                               │ ││
│ │ └─────────────────────────────────────────────────────────────────────────────────┘ ││
│ │                                                                                     ││
│ │ 📊 입력 통계: 6개 문자열 | 평균 길이: 18자 | 감지된 패턴: 법인 구조 표시자               ││
│ └─────────────────────────────────────────────────────────────────────────────────────┘│
│                                                                                         │
│ 🎯 정규화 목표 설정                                                                      │
│ ┌─────────────────────────────────────────────────────────────────────────────────────┐│
│ │ 원하는 결과 (선택사항):                                                               ││
│ │ ┌─────────────────────────────────────────────────────────────────────────────────┐ ││
│ │ │ 코드쉬프트                                                                      │ ││
│ │ │ 코드쉬프트                                                                      │ ││
│ │ │ 코드쉬프트                                                                      │ ││
│ │ │ 부자마트                                                                        │ ││
│ │ │ 한국협회                                                                        │ ││
│ │ │ 코드쉬프트                                                                      │ ││
│ │ └─────────────────────────────────────────────────────────────────────────────────┘ ││
│ │                                                                                     ││
│ │ 카테고리: [법인구조 ▼] | 우선순위: [100] | 메타데이터: [company_type: corporation]     ││
│ │ 사용자 노트: [법인 형태 표시자를 제거하고 핵심 업체명만 추출                      ]      ││
│ └─────────────────────────────────────────────────────────────────────────────────────┘│
│                                                                                         │
│ 🧠 LLM 분석 중...                                                     [⏹️ 분석 중단]    │
│ ┌─────────────────────────────────────────────────────────────────────────────────────┐│
│ │ 🤖 Gemini AI 분석 중... (15초 소요 예상)                                             ││
│ │ ██████████████████████░░░░ 82% 완료                                               ││
│ │                                                                                     ││
│ │ 🔍 현재 단계: 패턴 최적화 및 성능 검증                                                ││
│ └─────────────────────────────────────────────────────────────────────────────────────┘│
│                                                                                         │
│ 💡 LLM 분석 결과                                                                         │
│ ┌─────────────────────────────────────────────────────────────────────────────────────┐│
│ │ 🎯 생성된 정규식 패턴 (신뢰도: 94%)                                                   ││
│ │ ┌─────────────────────────────────────────────────────────────────────────────────┐ ││
│ │ │ 패턴 1 (추천): `(?:\((?:주|유)\)|주식회사|사단법인)\s*(.+?)(?:\s|$)`              │ ││
│ │ │ 출력 템플릿: `$1`                                                                │ ││
│ │ │ 설명: 법인 형태 표시자를 포괄적으로 제거하고 핵심 업체명 추출                       │ ││
│ │ │ 예상 성능: 매우 빠름 (< 1ms) | ReDoS 위험: 없음                                   │ ││
│ │ │ ✅ 테스트 성공률: 100% (6/6개)                           [👍 선택] [🧪 테스트]      │ ││
│ │ ├─────────────────────────────────────────────────────────────────────────────────┤ ││
│ │ │ 패턴 2 (대안): `^(?:\([주유]\)|주식회사|사단법인)\s*([^가-힣]*[가-힣]+)`           │ ││
│ │ │ 출력 템플릿: `$1`                                                                │ ││
│ │ │ 설명: 한글 업체명에 특화된 추출 방식                                              │ ││
│ │ │ 예상 성능: 빠름 (< 2ms) | ReDoS 위험: 낮음                                       │ ││
│ │ │ ✅ 테스트 성공률: 83% (5/6개)                            [👍 선택] [🧪 테스트]      │ ││
│ │ └─────────────────────────────────────────────────────────────────────────────────┘ ││
│ │                                                                                     ││
│ │ 🧐 LLM 분석 인사이트:                                                                ││
│ │ • 입력 데이터에서 4가지 법인 형태 패턴 감지: (주), (유), 주식회사, 사단법인              │ ││
│ │ • "코드쉬프트"가 가장 빈번한 업체명으로 나타남 (4회)                                   │ ││
│ │ • 법인 표시자 이후 공백 처리가 일관성 있게 필요                                       │ ││
│ │ • 추가 데이터로 패턴 개선 가능성 높음                                                 │ ││
│ │                                                                                     ││
│ │ 📋 잠재적 문제점:                                                                    ││
│ │ • "사무용품", "회식비" 등 추가 정보가 포함된 경우 처리 방안 고려 필요                   │ ││
│ │ • 영문/숫자 조합 업체명에 대한 추가 테스트 권장                                       │ ││
│ │                                                                                     ││
│ │ 🎯 추천 우선순위: 140 (법인구조 카테고리 평균보다 높음)                                │ ││
│ └─────────────────────────────────────────────────────────────────────────────────────┘│
│                                                                                         │
│ 🎛️ 액션                                                                                 │
│ [📋 패턴 적용] [🔄 다시 분석] [💾 임시 저장] [🧪 추가 테스트] [🤝 사람 검토 요청]          │
│                                                                                         │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

#### LLM 통합 특징
- **지능형 패턴 분석**: 복잡한 거래 문자열 패턴을 자동으로 분석
- **다중 패턴 제안**: 여러 대안을 제시하고 각각의 장단점 설명
- **성능 예측**: 생성된 패턴의 성능과 위험도를 사전 평가
- **점진적 학습**: 사용자 피드백을 통한 패턴 생성 개선

### 5. 충돌 관리 및 우선순위 최적화 화면

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│ ⚠️ 패턴 충돌 관리 및 우선순위 최적화                                                      │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                         │
│ 📊 충돌 개요                                                                             │
│ ┌─────────────────────────────────────────────────────────────────────────────────────┐│
│ │ 🚨 감지된 충돌: 7개 | 🔴 Critical: 2개 | 🟡 Warning: 5개                              ││
│ │ 📈 성능 영향: 평균 처리 시간 +23% 증가 | 정확도 -3.2% 감소                             ││
│ │ 🎯 최적화 잠재력: 우선순위 재배치로 +15% 성능 향상 가능                                 ││
│ └─────────────────────────────────────────────────────────────────────────────────────┘│
│                                                                                         │
│ 🔧 자동 최적화 제안                                                                      │
│ ┌─────────────────────────────────────────────────────────────────────────────────────┐│
│ │ 🤖 LLM 최적화 분석 완료 - 3가지 해결 방안 제안                    [🚀 전체 적용]       ││
│ │ ┌─────────────────────────────────────────────────────────────────────────────────┐ ││
│ │ │ 💡 제안 1: 우선순위 자동 재배치 (추천)                         [✅ 적용]          │ ││
│ │ │    • "스타벅스 전용" (160) → "커피전문점 일반" (140) 보다 앞으로                 │ ││
│ │ │    • "주유소 브랜드별" → "주유소 일반" 보다 앞으로                               │ ││
│ │ │    • 예상 효과: +12% 성능 향상, 충돌 5개 해결                                  │ ││
│ │ ├─────────────────────────────────────────────────────────────────────────────────┤ ││
│ │ │ 💡 제안 2: 패턴 통합 및 분리                                  [🔍 상세]          │ ││
│ │ │    • 겹치는 3개 법인구조 패턴을 1개로 통합                                     │ ││
│ │ │    • 과도하게 넓은 "전체 매칭" 패턴을 세분화                                   │ ││
│ │ │    • 예상 효과: +8% 성능 향상, 메모리 사용량 -15%                              │ ││
│ │ ├─────────────────────────────────────────────────────────────────────────────────┤ ││
│ │ │ 💡 제안 3: 조건부 패턴 적용                                   [🔍 상세]          │ ││
│ │ │    • 시간대별, 금액대별 패턴 분기 적용                                         │ ││
│ │ │    • 예상 효과: +5% 정확도 향상, 처리 시간 유지                                │ ││
│ │ └─────────────────────────────────────────────────────────────────────────────────┘ ││
│ └─────────────────────────────────────────────────────────────────────────────────────┘│
│                                                                                         │
│ 🎯 우선순위 시각화 및 드래그앤드롭 편집                                                  │
│ ┌─────────────────────────────────────────────────────────────────────────────────────┐│
│ │ 📊 현재 우선순위 맵 (충돌 영역 표시)                           [🔄 자동 정렬] [💾 저장] ││
│ │ ┌─────────────────────────────────────────────────────────────────────────────────┐ ││
│ │ │ 170 ┌──────────────────────┐ ⚠️ 충돌!                               [↕️ 이동]   │ ││
│ │ │     │ 스타벅스 전용 패턴    │ ↕️  ┌──────────────────────┐                     │ ││
│ │ │ 160 └──────────────────────┘     │ 카페 일반 패턴        │                     │ ││
│ │ │                                  └──────────────────────┘                     │ ││
│ │ │                                                                               │ ││
│ │ │ 150 ┌──────────────────────┐ ⚠️ 충돌!                                         │ ││
│ │ │     │ 주유소 상하행 패턴    │ ↕️  ┌──────────────────────┐                     │ ││
│ │ │ 145 └──────────────────────┘     │ GS칼텍스 전용 패턴    │                     │ ││
│ │ │ 140                              └──────────────────────┘                     │ ││
│ │ │                                                                               │ ││
│ │ │ 130 ┌──────────────────────┐                                                  │ ││
│ │ │     │ 법인구조 패턴         │  ✅ 정상                                         │ ││
│ │ │ 120 └──────────────────────┘                                                  │ ││
│ │ │                                                                               │ ││
│ │ │ 110 ┌──────────────────────┐                                                  │ ││
│ │ │     │ 해외서비스 패턴       │  ✅ 정상                                         │ ││
│ │ │ 100 └──────────────────────┘                                                  │ ││
│ │ └─────────────────────────────────────────────────────────────────────────────────┘ ││
│ └─────────────────────────────────────────────────────────────────────────────────────┘│
│                                                                                         │
│ 🔍 충돌 상세 분석                                                                        │
│ ┌─────────────────────────────────────────────────────────────────────────────────────┐│
│ │ 🚨 Critical 충돌 #1: 스타벅스 vs 카페 일반 패턴                   [🔧 해결하기]       ││
│ │ ┌─────────────────────────────────────────────────────────────────────────────────┐ ││
│ │ │ 패턴 A: "스타벅스" 전용 (우선순위: 170)                                         │ ││
│ │ │ - 정규식: `스타벅스.*`                                                          │ ││
│ │ │ - 매칭률: 95% | 사용횟수: 1,247회                                               │ ││
│ │ │                                                                               │ ││
│ │ │ 패턴 B: "카페" 일반 (우선순위: 160)                                            │ ││
│ │ │ - 정규식: `(스타벅스|이디야|할리스|카페베네).*`                                  │ ││
│ │ │ - 매칭률: 87% | 사용횟수: 3,456회                                               │ ││
│ │ │                                                                               │ ││
│ │ │ 🔍 충돌 분석:                                                                  │ ││
│ │ │ • 겹침률: 100% (스타벅스 거래에서 두 패턴 모두 매칭)                            │ ││
│ │ │ • 현재: 패턴 A가 우선 적용되어 패턴 B 사용률 저하                               │ ││
│ │ │ • 영향: 매일 약 45개 거래에서 중복 처리 발생                                    │ ││
│ │ │                                                                               │ ││
│ │ │ 💡 해결 방안:                                                                  │ ││
│ │ │ [🎯 패턴 A 세분화] [📝 패턴 B 수정] [🔄 우선순위 교체] [🗑️ 중복 패턴 제거]       │ ││
│ │ └─────────────────────────────────────────────────────────────────────────────────┘ ││
│ │                                                                                     ││
│ │ 🟡 Warning 충돌 #2: 주유소 상하행 vs GS칼텍스 전용                [🔧 해결하기]       ││
│ │ ┌─────────────────────────────────────────────────────────────────────────────────┐ ││
│ │ │ 겹침률: 67% | 예상 성능 영향: 중간 | 일일 영향 건수: 12건                        │ ││
│ │ │ 💡 빠른 해결: 우선순위 10 차이로 조정 [⚡ 적용]                                  │ ││
│ │ └─────────────────────────────────────────────────────────────────────────────────┘ ││
│ └─────────────────────────────────────────────────────────────────────────────────────┘│
│                                                                                         │
│ 🎛️ 액션                                                                                 │
│ [🤖 전체 자동 최적화] [💾 현재 설정 저장] [⏪ 이전 상태 복원] [🧪 최적화 테스트] [❌ 취소] │
│                                                                                         │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

#### 충돌 관리 핵심 기능
- **시각적 충돌 매트릭스**: 패턴 간 겹침을 직관적으로 표시
- **자동 최적화 엔진**: LLM 기반 우선순위 재배치 제안
- **영향도 분석**: 각 충돌이 시스템 성능에 미치는 영향 정량화
- **실시간 해결**: 드래그앤드롭으로 즉시 우선순위 조정

### 6. 대량 테스트 및 성능 분석 화면

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│ 🧪 대량 테스트 및 성능 분석                                                               │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                         │
│ 📊 테스트 설정                                                                           │
│ ┌─────────────────────────────────────────────────────────────────────────────────────┐│
│ │ 🎯 테스트 데이터 소스:                                                                ││
│ │ [📁 파일 업로드] [🗄️ 프로덕션 데이터] [🎲 합성 데이터] [📋 수동 입력]                   ││
│ │                                                                                     ││
│ │ 선택된 데이터: "production_transactions_last_30days.csv"                             ││
│ │ 📊 데이터 통계: 15,847건 | 평균 길이: 23자 | 고유 패턴: 1,247개                       ││
│ │                                                                                     ││
│ │ 🎛️ 테스트 옵션:                                                                     ││
│ │ ☑️ 전체 규칙 테스트 (247개)     ☑️ 성능 측정 포함                                    ││
│ │ ☑️ 충돌 감지 실행              ☑️ 메모리 사용량 측정                                  ││
│ │ ☑️ 상세 로그 생성              ☑️ 실패 케이스 상세 분석                               ││
│ │                                                                                     ││
│ │ 📈 성능 목표 설정:                                                                   ││
│ │ 처리 시간: [< 5ms ▼] | 정확도: [> 90% ▼] | 메모리: [< 256MB ▼]                      ││
│ └─────────────────────────────────────────────────────────────────────────────────────┘│
│                                                                                         │
│ 🚀 테스트 실행 상태                                                                      │
│ ┌─────────────────────────────────────────────────────────────────────────────────────┐│
│ │ 🧪 대량 테스트 실행 중... (3분 15초 소요 예상)                       [⏹️ 중단]        ││
│ │ ████████████████████████████████████████████████░░░░░░░░░░ 78% 완료                ││
│ │                                                                                     ││
│ │ ⚡ 현재 단계: 성능 측정 및 메모리 분석                                                ││
│ │ 📊 진행 상황:                                                                       ││
│ │ • 처리 완료: 12,361 / 15,847건                                                      ││
│ │ • 성공: 11,789건 (95.4%)                                                            ││
│ │ • 실패: 572건 (4.6%)                                                               ││
│ │ • 평균 처리 시간: 3.2ms (목표: 5ms 이하) ✅                                         ││
│ │ • 메모리 사용량: 187MB (목표: 256MB 이하) ✅                                         ││
│ └─────────────────────────────────────────────────────────────────────────────────────┘│
│                                                                                         │
│ 📈 실시간 성능 그래프                                                                    │
│ ┌─────────────────────────────────────────────────────────────────────────────────────┐│
│ │ 🚀 처리 속도 (TPS)                                  📊 정확도 추이                     ││
│ │ 350 ┌─┐                                          100% ┌─────────┐                  ││
│ │     │ │    ┌─┐                                        │         │                  ││
│ │ 300 │ │┌─┐ │ │                                   95%  │         └─┐                ││
│ │     │ ││ │ │ │                                        │           │                ││
│ │ 250 │ ││ │ │ │                                   90%  │           └─┐              ││
│ │     └─┘│ │ │ │                                        │             │              ││
│ │ 200    └─┘ └─┘                                   85%  └─────────────┴──────────────  ││
│ │     0    5   10   15분                                 0    5   10   15분           ││
│ │                                                                                     ││
│ │ 💾 메모리 사용량                                        ⚡ 응답 시간 분포                ││
│ │ 200MB ┌───────────┐                               < 1ms: ████████ 45%               ││
│ │       │           │                               1-3ms: ██████████████ 38%        ││
│ │ 150MB │           │                               3-5ms: ████ 12%                  ││
│ │       │           └─┐                             5-10ms: ██ 4%                    ││
│ │ 100MB │             │                             > 10ms: █ 1%                     ││
│ │       └─────────────┴─────────────                                                 ││
│ │       0    5   10   15분                                                           ││
│ └─────────────────────────────────────────────────────────────────────────────────────┘│
│                                                                                         │
│ 🔍 실패 케이스 분석                                                                      │
│ ┌─────────────────────────────────────────────────────────────────────────────────────┐│
│ │ 📋 실패 유형별 통계:                                                [🔍 상세 분석]    ││
│ │ ┌─────────────────────────────────────────────────────────────────────────────────┐ ││
│ │ │ 🚨 패턴 매칭 실패 (342건, 59.8%)                                                │ ││
│ │ │    대표 사례: "알 수 없는 해외 서비스: WEIRD.SERVICE.COM PAYMENT"                │ ││
│ │ │    원인: 신규 해외 서비스 패턴 미등록                                            │ ││
│ │ │    해결: 해외서비스 일반 패턴 확장 필요            [🤖 패턴 생성] [📝 수동 추가]   │ ││
│ │ ├─────────────────────────────────────────────────────────────────────────────────┤ ││
│ │ │ ⚠️ 정규식 오류 (156건, 27.3%)                                                   │ ││
│ │ │    대표 사례: "복잡한 중첩 괄호: ((주))테스트회사 ((지점))"                       │ ││
│ │ │    원인: 예외적인 괄호 중첩 처리 부족                                            │ ││
│ │ │    해결: 예외 처리 로직 보강 필요                  [🔧 패턴 수정] [📝 예외 추가]   │ ││
│ │ ├─────────────────────────────────────────────────────────────────────────────────┤ ││
│ │ │ 🐌 성능 임계치 초과 (74건, 12.9%)                                               │ ││
│ │ │    대표 사례: "매우 긴 거래 문자열: 삼성전자 주식회사 디지털시티캠퍼스..."      │ ││
│ │ │    원인: 과도하게 복잡한 정규식 패턴                                             │ ││
│ │ │    해결: 패턴 최적화 또는 길이 제한 필요            [⚡ 최적화] [📏 제한 설정]    │ ││
│ │ └─────────────────────────────────────────────────────────────────────────────────┘ ││
│ └─────────────────────────────────────────────────────────────────────────────────────┘│
│                                                                                         │
│ 🎛️ 액션                                                                                 │
│ [📊 상세 리포트] [🤖 자동 개선] [📁 결과 내보내기] [🔄 재테스트] [⚙️ 설정 수정]          │
│                                                                                         │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 🛠️ 기술적 구현 사양

### Frontend 기술 스택
```typescript
// 주요 기술 스택
- Next.js 14 (App Router)
- TypeScript 5.0+
- Tailwind CSS + Headless UI
- React Hook Form + Zod validation
- TanStack Query (데이터 fetching)
- Socket.IO (실시간 업데이트)
- Monaco Editor (정규식 편집기)
- React DnD (드래그앤드롭)
- Chart.js (통계 시각화)

// 핵심 컴포넌트 구조
interface RegexRule {
  id: number;
  ruleName: string;
  category: string;
  inputPattern: string;
  outputTemplate: string;
  priority: number;
  metadataTags: Record<string, any>;
  testCases: TestCase[];
  isActive: boolean;
  usageCount: number;
  successRate: number;
  conflictIds: number[];
  createdAt: string;
  updatedAt: string;
}

interface TestCase {
  id: string;
  input: string;
  expected: string;
  actual?: string;
  success?: boolean;
  processingTime?: number;
  description?: string;
}

interface ConflictAnalysis {
  ruleId: number;
  conflictingRuleId: number;
  overlapPercentage: number;
  impactLevel: 'critical' | 'warning' | 'info';
  suggestedResolution: string[];
  affectedTransactionsPerDay: number;
}

interface LLMPatternSuggestion {
  pattern: string;
  outputTemplate: string;
  confidence: number;
  explanation: string;
  expectedPerformance: {
    speed: 'very_fast' | 'fast' | 'medium' | 'slow';
    complexity: number;
    redosRisk: 'none' | 'low' | 'medium' | 'high';
  };
  testResults: TestResult[];
  metadata: Record<string, any>;
}
```

### Backend API 사양
```java
// 정규식 전처리 엔진 서비스
@RestController
@RequestMapping("/v2/regex-preprocessing")
public class RegexPreprocessingController {
    
    // 규칙 CRUD
    @GetMapping("/rules")
    public ResponseEntity<List<RegexRule>> getRules(
        @RequestParam(required = false) String category,
        @RequestParam(required = false) Boolean active,
        @RequestParam(defaultValue = "priority") String sortBy
    );
    
    @PostMapping("/rules")
    public ResponseEntity<RegexRule> createRule(@Valid @RequestBody CreateRuleRequest request);
    
    @PutMapping("/rules/{id}")
    public ResponseEntity<RegexRule> updateRule(@PathVariable Long id, @Valid @RequestBody UpdateRuleRequest request);
    
    @DeleteMapping("/rules/{id}")
    public ResponseEntity<Void> deleteRule(@PathVariable Long id);
    
    // 패턴 테스트
    @PostMapping("/rules/{id}/test")
    public ResponseEntity<RuleTestResult> testRule(
        @PathVariable Long id, 
        @RequestBody List<String> testInputs
    );
    
    @PostMapping("/test-bulk")
    public ResponseEntity<BulkTestResult> testBulk(@RequestBody BulkTestRequest request);
    
    // 충돌 감지 및 분석
    @GetMapping("/conflicts")
    public ResponseEntity<List<ConflictAnalysis>> analyzeConflicts();
    
    @PostMapping("/conflicts/resolve")
    public ResponseEntity<ConflictResolutionResult> resolveConflicts(@RequestBody ConflictResolutionRequest request);
    
    // LLM 통합
    @PostMapping("/llm/generate-patterns")
    public ResponseEntity<List<LLMPatternSuggestion>> generatePatterns(@RequestBody LLMGenerationRequest request);
    
    @PostMapping("/llm/optimize-rule")
    public ResponseEntity<LLMOptimizationResult> optimizeRule(@PathVariable Long ruleId);
    
    // 성능 모니터링
    @GetMapping("/performance/stats")
    public ResponseEntity<PerformanceStats> getPerformanceStats(@RequestParam String period);
    
    @GetMapping("/performance/realtime")
    public SseEmitter realtimePerformance(); // Server-Sent Events for real-time monitoring
}

// LLM 통합 서비스
@Service
public class LLMIntegrationService {
    
    public List<LLMPatternSuggestion> generatePatterns(
        List<String> sampleInputs, 
        List<String> expectedOutputs,
        String category,
        String userNotes
    ) {
        // Gemini AI API 호출
        // 패턴 생성 및 검증
        // 성능 예측 및 위험 분석
    }
    
    public ConflictResolutionSuggestion resolveConflicts(List<ConflictAnalysis> conflicts) {
        // 충돌 해결 방안 생성
        // 우선순위 재배치 제안
        // 패턴 수정 제안
    }
    
    public OptimizationSuggestion optimizePerformance(List<RegexRule> rules, PerformanceStats stats) {
        // 성능 최적화 제안
        // 패턴 리팩토링 제안
        // 인덱스 최적화 제안
    }
}
```

### 실시간 기능 구현
```typescript
// WebSocket 연결 관리
class RealtimeManager {
  private socket: Socket;
  
  constructor() {
    this.socket = io('/regex-preprocessing');
    this.setupEventListeners();
  }
  
  private setupEventListeners() {
    // 실시간 테스트 결과
    this.socket.on('test-progress', (data: TestProgressEvent) => {
      updateTestProgress(data);
    });
    
    // 충돌 감지 알림
    this.socket.on('conflict-detected', (data: ConflictDetectedEvent) => {
      showConflictAlert(data);
    });
    
    // 성능 모니터링
    this.socket.on('performance-update', (data: PerformanceUpdateEvent) => {
      updatePerformanceCharts(data);
    });
    
    // LLM 분석 진행상황
    this.socket.on('llm-analysis-progress', (data: LLMProgressEvent) => {
      updateLLMProgress(data);
    });
  }
  
  // 실시간 패턴 테스트
  public testPatternRealtime(pattern: string, testInputs: string[]) {
    this.socket.emit('test-pattern-realtime', { pattern, testInputs });
  }
  
  // 충돌 감지 요청
  public analyzeConflictsRealtime(ruleId: number) {
    this.socket.emit('analyze-conflicts', { ruleId });
  }
}

// 실시간 성능 모니터링 컴포넌트
export const RealtimePerformanceChart: React.FC = () => {
  const [performanceData, setPerformanceData] = useState<PerformanceData[]>([]);
  const realtimeManager = useRealtimeManager();
  
  useEffect(() => {
    const unsubscribe = realtimeManager.subscribe('performance-update', (data) => {
      setPerformanceData(prev => [...prev.slice(-50), data]); // 최근 50개 데이터 포인트만 유지
    });
    
    return unsubscribe;
  }, []);
  
  return (
    <div className="performance-chart">
      <Line
        data={{
          labels: performanceData.map(d => d.timestamp),
          datasets: [
            {
              label: 'Processing Time (ms)',
              data: performanceData.map(d => d.processingTime),
              borderColor: 'rgb(75, 192, 192)',
              tension: 0.1
            },
            {
              label: 'Success Rate (%)',
              data: performanceData.map(d => d.successRate),
              borderColor: 'rgb(255, 99, 132)',
              tension: 0.1
            }
          ]
        }}
        options={{
          responsive: true,
          animation: { duration: 0 }, // 실시간 업데이트를 위해 애니메이션 비활성화
          scales: {
            x: { type: 'time' },
            y: { beginAtZero: true }
          }
        }}
      />
    </div>
  );
};
```

### 보안 및 성능 최적화
```typescript
// 보안 설정
class SecurityManager {
  // XSS 방지 - 정규식 패턴 검증
  public validateRegexPattern(pattern: string): ValidationResult {
    // 위험한 패턴 검사 (ReDoS, 무한 루프 등)
    const dangerousPatterns = [
      /(\.\*){2,}/, // 중첩된 .* 패턴
      /(\+\*|\*\+)/, // +* 또는 *+ 조합
      /((\w\+\*)|(\w\*\+))/, // word character와 +* 조합
    ];
    
    for (const dangerous of dangerousPatterns) {
      if (dangerous.test(pattern)) {
        return {
          valid: false,
          risk: 'high',
          reason: 'Potential ReDoS attack vector detected'
        };
      }
    }
    
    // 복잡도 검사
    const complexity = this.calculateComplexity(pattern);
    if (complexity > 100) {
      return {
        valid: false,
        risk: 'medium',
        reason: 'Pattern too complex, may cause performance issues'
      };
    }
    
    return { valid: true, risk: 'low' };
  }
  
  // 입력 데이터 크기 제한
  public validateInputSize(data: any): boolean {
    const jsonSize = JSON.stringify(data).length;
    return jsonSize <= 1024 * 1024; // 1MB 제한
  }
  
  // 사용자 권한 검사
  public checkPermission(user: User, action: string, resource: string): boolean {
    const userRole = user.role;
    const permissions = this.rolePermissions[userRole] || [];
    return permissions.includes(`${action}:${resource}`);
  }
}

// 성능 최적화
class PerformanceOptimizer {
  private patternCache = new Map<string, CompiledPattern>();
  private resultCache = new Map<string, ProcessingResult>();
  
  // 정규식 패턴 컴파일 캐싱
  public getCompiledPattern(pattern: string): CompiledPattern {
    if (!this.patternCache.has(pattern)) {
      const compiled = new RegExp(pattern, 'g');
      this.patternCache.set(pattern, compiled);
    }
    return this.patternCache.get(pattern)!;
  }
  
  // 결과 캐싱 (LRU)
  public getCachedResult(input: string): ProcessingResult | null {
    const key = this.generateCacheKey(input);
    return this.resultCache.get(key) || null;
  }
  
  public setCachedResult(input: string, result: ProcessingResult): void {
    const key = this.generateCacheKey(input);
    
    // LRU 캐시 크기 제한
    if (this.resultCache.size >= 10000) {
      const firstKey = this.resultCache.keys().next().value;
      this.resultCache.delete(firstKey);
    }
    
    this.resultCache.set(key, result);
  }
  
  // 배치 처리 최적화
  public processBatch(inputs: string[], batchSize: number = 100): Promise<ProcessingResult[]> {
    const batches = this.chunkArray(inputs, batchSize);
    const promises = batches.map(batch => this.processBatchChunk(batch));
    return Promise.all(promises).then(results => results.flat());
  }
  
  private async processBatchChunk(inputs: string[]): Promise<ProcessingResult[]> {
    // Worker 스레드 활용 (브라우저) 또는 클러스터링 (Node.js)
    return new Promise((resolve) => {
      const worker = new Worker('/workers/regex-processor.js');
      worker.postMessage({ inputs });
      worker.onmessage = (e) => {
        resolve(e.data.results);
        worker.terminate();
      };
    });
  }
}
```

---

## 🎯 구현 우선순위 및 개발 계획

### Phase 1: 핵심 UI 구현 (2주)
- [x] 메인 대시보드 레이아웃
- [ ] 규칙 관리 CRUD 화면
- [ ] 기본 테스트 기능
- [ ] 실시간 성능 모니터링

### Phase 2: 고급 기능 구현 (3주)
- [ ] LLM 통합 및 패턴 생성
- [ ] 충돌 감지 시스템
- [ ] 드래그앤드롭 우선순위 관리
- [ ] 대량 테스트 기능

### Phase 3: 최적화 및 보안 (2주)
- [ ] 성능 최적화 엔진
- [ ] 보안 강화 (XSS, ReDoS 방지)
- [ ] 에러 처리 및 복구 시스템
- [ ] 사용자 권한 관리

### Phase 4: 통합 및 테스트 (1주)
- [ ] 백엔드 API 연동
- [ ] E2E 테스트 작성
- [ ] 성능 벤치마크
- [ ] 사용자 교육 자료 작성

---

이 상세한 어드민 툴 설계서는 정규식 전처리 시스템의 완전한 관리 도구로서, LLM 지원 패턴 생성부터 실시간 충돌 감지까지 모든 고급 기능을 포함하고 있습니다. 특히 사용자 경험을 중시한 직관적인 UI/UX 설계와 성능 최적화를 통해 실제 프로덕션 환경에서 안정적으로 운영될 수 있도록 구성되었습니다.
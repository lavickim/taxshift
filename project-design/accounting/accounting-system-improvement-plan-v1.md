# MoneyShift 복식부기 시스템 개선 계획서 v1.0

**문서 목적**: 현재 시스템에서 경쟁사 수준으로 발전시키기 위한 상세한 작업 계획  
**작성일**: 2025년 7월 24일  
**예상 개발 기간**: MVP 6-8주, 완성형 12-16주  

---

## 📊 현황 분석 요약

### 현재 시스템 강점
- ✅ **견고한 기반 시스템**: 89.3% 자동 처리율의 AI 기반 거래 분류
- ✅ **기본 복식부기 엔진**: AccountingEngine.java로 구현된 안정적인 분개 생성
- ✅ **확장 가능한 아키텍처**: Spring Boot + PostgreSQL + Redis 기반

### 핵심 부족 사항 (MVP 대비)
- ❌ **계정과목 부족**: 31개 → 200개+ 필요
- ❌ **총계정원장(GL) 시스템**: 완전히 누락
- ❌ **전문적 재무제표**: 월별 비교, 계층 표시 없음
- ❌ **마감 프로세스**: 결산 및 차기 이월 로직 없음
- ❌ **감사 추적**: 수정 이력 관리 미흡

---

## 🎯 개선 목표

### 1차 목표 (MVP 달성 - 6주)
- **200개+ 계정과목** 완전 구축
- **총계정원장 시스템** 구현
- **월별 비교 재무제표** 생성
- **기본 마감 프로세스** 구현

### 2차 목표 (경쟁사 수준 - 12주)
- **전표 형식 분개** 출력
- **감사 추적 시스템** 완성
- **세무 신고용 재무제표** 형식
- **Excel/PDF 출력** 기능

---

## 🏗️ 시스템 아키텍처 확장 계획

### 기존 시스템 유지 + 확장 전략
```
기존 시스템 (유지)
├── AccountingEngine.java (확장)
├── TransactionTaggingService.java (유지)
├── JournalEntry/JournalEntryDetail (확장)
└── 기본 재무제표 생성 (고도화)

새로 추가할 모듈
├── GeneralLedgerManager.java (신규)
├── ClosingProcessManager.java (신규) 
├── AdvancedReportGenerator.java (신규)
└── AuditTrailService.java (신규)
```

### 데이터베이스 확장 계획
```sql
-- 새로 추가할 핵심 테이블
1. general_ledger (총계정원장)
2. gl_details (원장 상세)  
3. closing_periods (마감 기간 관리)
4. audit_trail (감사 추적)
5. account_categories (계정과목 분류)

-- 확장할 기존 테이블
1. chart_of_accounts (200개+ 계정과목 추가)
2. journal_entries (승인 워크플로 필드 추가)
3. companies (회계 정책 설정 추가)
```

---

## 📅 단계별 구현 계획

## Phase 1: 기반 구조 강화 (Week 1-2)

### 🎯 목표: 계정과목 체계 완성 + GL 테이블 구조

#### Week 1: 계정과목 확장
**작업 내용**:
- [ ] 한국 표준 계정과목 200개+ 데이터 구축
- [ ] 계정과목 계층 구조 설계 (부모-자식 관계)
- [ ] 기존 태그-계정과목 매핑 업데이트
- [ ] 계정과목별 속성 정의 (차변/대변 정상, 표시 순서)

**산출물**:
- `chart_of_accounts_extended.sql` - 200개+ 계정과목 데이터
- `account_hierarchy.sql` - 계정과목 계층 구조
- `updated_tag_mapping.sql` - 기존 매핑 업데이트

**테스트 계획**:
- 모든 계정과목 정상 로드 테스트
- 계층 구조 무결성 테스트
- 기존 분개 생성 기능 호환성 테스트

#### Week 2: GL 시스템 기반 구조
**작업 내용**:
- [ ] `general_ledger` 테이블 설계 및 생성
- [ ] `gl_details` 테이블 설계 및 생성  
- [ ] `GeneralLedgerManager.java` 기본 틀 구현
- [ ] GL 전기 기본 로직 구현

**산출물**:
- `GeneralLedgerManager.java` - GL 관리 핵심 클래스
- `GLPostingService.java` - 전기 로직
- `general_ledger.sql` - 테이블 생성 스크립트

**테스트 계획**:
- GL 테이블 CRUD 테스트
- 기본 전기 로직 테스트
- 데이터 무결성 테스트

## Phase 2: 핵심 기능 구현 (Week 3-4)

### 🎯 목표: GL 전기 시스템 + 고급 재무제표

#### Week 3: GL 전기 시스템 완성
**작업 내용**:
- [ ] 분개 → GL 자동 전기 로직 구현
- [ ] 월별 기초/기말 잔액 관리
- [ ] 당월 발생액 집계 기능
- [ ] GL API 엔드포인트 구현

**구현 세부사항**:
```java
// 핵심 구현 로직
@Service
public class GeneralLedgerManager {
    // 분개를 GL에 전기
    public void postJournalEntryToGL(Long journalEntryId);
    
    // 월별 GL 잔액 계산
    public GLBalance calculateMonthlyBalance(String companyId, String accountCode, LocalDate monthEnd);
    
    // GL 시산표 생성
    public TrialBalance generateTrialBalance(String companyId, LocalDate asOfDate);
}
```

**테스트 계획**:
- 분개 전기 정확성 테스트
- 잔액 계산 로직 테스트
- 시산표 균형 검증 테스트

#### Week 4: 고급 재무제표 생성
**작업 내용**:
- [ ] 월별 비교 재무제표 생성 로직
- [ ] 계층적 계정 표시 기능
- [ ] 다기간 추이 분석 기능
- [ ] 재무제표 출력 형식 고도화

**구현 세부사항**:
```java
// 월별 비교 손익계산서
public class AdvancedIncomeStatementGenerator {
    public MonthlyComparisonIS generateMonthlyComparison(
        String companyId, 
        LocalDate startMonth, 
        LocalDate endMonth
    );
}
```

**테스트 계획**:
- 월별 비교 정확성 테스트
- 계층 표시 로직 테스트
- 재무제표 형식 검증 테스트

## Phase 3: 마감 및 결산 (Week 5-6)

### 🎯 목표: 마감 프로세스 + 결산 처리

#### Week 5: 마감 시스템 구현
**작업 내용**:
- [ ] `ClosingProcessManager.java` 구현
- [ ] 월차 마감 프로세스 로직
- [ ] 마감 상태 관리 시스템
- [ ] 마감 후 수정 불가 로직

**구현 세부사항**:
```java
@Service
public class ClosingProcessManager {
    // 월차 마감 실행
    public ClosingResult executeMonthlyClosing(String companyId, LocalDate closingDate);
    
    // 마감 취소 (조건부)
    public void reverseClosing(String companyId, LocalDate closingDate);
    
    // 마감 상태 확인
    public boolean isClosingPeriod(String companyId, LocalDate date);
}
```

#### Week 6: 결산 정리 분개
**작업 내용**:  
- [ ] 결산 정리 분개 자동 생성
- [ ] 당기순이익 이월 로직
- [ ] 차기 이월 처리
- [ ] 연말 결산 프로세스

**테스트 계획**:
- 마감 프로세스 완전성 테스트
- 결산 정리 분개 정확성 테스트
- 차기 이월 검증 테스트

## Phase 4: 고급 기능 및 완성 (Week 7-8)

### 🎯 목표: 감사 추적 + 시스템 완성

#### Week 7: 감사 추적 시스템
**작업 내용**:
- [ ] `AuditTrailService.java` 구현
- [ ] 분개 수정 이력 관리
- [ ] 승인 워크플로 구현
- [ ] 변경 추적 로그 시스템

#### Week 8: 시스템 완성 및 최적화
**작업 내용**:
- [ ] 전체 시스템 통합 테스트
- [ ] 성능 최적화
- [ ] UI/UX 개선
- [ ] 문서화 완성

---

## 🧪 TDD 개발 전략

### 테스트 우선 원칙
1. **회계 규칙 테스트**: 모든 회계 로직은 테스트 케이스 먼저 작성
2. **데이터 무결성 테스트**: 분개 균형, GL 잔액 정확성 등
3. **통합 테스트**: 거래 입력 → 분개 → GL 전기 → 재무제표 전체 플로우
4. **성능 테스트**: 대용량 데이터 처리 시 응답 시간

### 핵심 테스트 케이스
```java
// 예시: GL 전기 테스트
@Test
public void testJournalEntryPostingToGL() {
    // Given: 분개 생성
    JournalEntry entry = createSampleJournalEntry();
    
    // When: GL 전기 실행
    glManager.postJournalEntryToGL(entry.getId());
    
    // Then: GL 잔액 정확성 검증
    GLBalance balance = glManager.getAccountBalance(entry.getCompanyId(), "5130", entry.getEntryDate());
    assertThat(balance.getEndingDebitBalance()).isEqualTo(expectedAmount);
}
```

---

## 📋 상세 작업 리스트

### Phase 1 작업 (Week 1-2)

#### 1.1 계정과목 확장 (Week 1)
- [ ] **계정과목 데이터 구축**
  - [ ] 자산 계정 50개 (유동자산 20개, 비유동자산 30개)
  - [ ] 부채 계정 30개 (유동부채 15개, 비유동부채 15개)  
  - [ ] 자본 계정 10개
  - [ ] 수익 계정 20개 (영업수익 10개, 영업외수익 10개)
  - [ ] 비용 계정 90개 (판매관리비 60개, 영업외비용 30개)

- [ ] **데이터베이스 스키마 확장**
  ```sql
  -- chart_of_accounts 테이블 확장
  ALTER TABLE chart_of_accounts 
  ADD COLUMN account_group VARCHAR(50),
  ADD COLUMN display_order INTEGER DEFAULT 0,
  ADD COLUMN is_summary_account BOOLEAN DEFAULT FALSE,
  ADD COLUMN parent_account_id INTEGER REFERENCES chart_of_accounts(id);
  ```

- [ ] **매핑 규칙 업데이트**
  - [ ] 기존 35개 태그 → 새로운 계정과목 재매핑
  - [ ] 조건부 매핑 규칙 확장 (시간대, 금액, 컨텍스트 기반)
  - [ ] TagAccountMappingService.java 업데이트

#### 1.2 GL 시스템 기반 (Week 2)
- [ ] **새로운 테이블 생성**
  ```sql
  -- 총계정원장 테이블
  CREATE TABLE general_ledger (
      id BIGSERIAL PRIMARY KEY,
      company_id UUID NOT NULL REFERENCES companies(id),
      account_code VARCHAR(20) NOT NULL REFERENCES chart_of_accounts(account_code),
      fiscal_year INTEGER NOT NULL,
      fiscal_month INTEGER NOT NULL,
      beginning_debit_balance DECIMAL(18,2) DEFAULT 0,
      beginning_credit_balance DECIMAL(18,2) DEFAULT 0,
      period_debit_amount DECIMAL(18,2) DEFAULT 0,
      period_credit_amount DECIMAL(18,2) DEFAULT 0,
      ending_debit_balance DECIMAL(18,2) DEFAULT 0,
      ending_credit_balance DECIMAL(18,2) DEFAULT 0,
      is_closed BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(company_id, account_code, fiscal_year, fiscal_month)
  );

  -- GL 상세 테이블  
  CREATE TABLE gl_details (
      id BIGSERIAL PRIMARY KEY,
      general_ledger_id BIGINT NOT NULL REFERENCES general_ledger(id),
      journal_entry_id BIGINT NOT NULL REFERENCES journal_entries(id),
      journal_entry_detail_id BIGINT NOT NULL REFERENCES journal_entry_details(id),
      posting_date DATE NOT NULL,
      debit_amount DECIMAL(18,2) DEFAULT 0,
      credit_amount DECIMAL(18,2) DEFAULT 0,
      running_debit_balance DECIMAL(18,2) DEFAULT 0,
      running_credit_balance DECIMAL(18,2) DEFAULT 0,
      description TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
  );
  ```

- [ ] **GeneralLedgerManager.java 구현**
  ```java
  @Service
  public class GeneralLedgerManager {
      
      // GL 계정 초기화 (회계 기간 시작 시)
      public void initializeGLAccount(String companyId, String accountCode, 
                                     Integer fiscalYear, Integer fiscalMonth);
      
      // 분개를 GL에 전기
      public GLPostingResult postJournalEntryToGL(Long journalEntryId);
      
      // 월별 잔액 조회
      public GLBalance getMonthlyBalance(String companyId, String accountCode, 
                                       Integer fiscalYear, Integer fiscalMonth);
      
      // 시산표 생성
      public TrialBalance generateTrialBalance(String companyId, LocalDate asOfDate);
  }
  ```

### Phase 2 작업 (Week 3-4)

#### 2.1 GL 전기 시스템 (Week 3)
- [ ] **자동 전기 로직 구현**
  ```java
  @Service
  public class GLPostingService {
      
      // 분개 전기 메인 로직
      public GLPostingResult postJournalEntry(JournalEntry journalEntry) {
          List<GLPostingDetail> postingDetails = new ArrayList<>();
          
          for(JournalEntryDetail detail : journalEntry.getDetails()) {
              // 1. GL 계정 존재 확인/생성
              GeneralLedger glAccount = ensureGLAccountExists(
                  journalEntry.getCompanyId(), 
                  detail.getAccountCode(),
                  journalEntry.getEntryDate()
              );
              
              // 2. GL 상세 생성
              GLDetail glDetail = createGLDetail(glAccount, detail);
              
              // 3. 잔액 업데이트
              updateGLBalance(glAccount, detail.getDebitAmount(), detail.getCreditAmount());
              
              postingDetails.add(new GLPostingDetail(glAccount, glDetail));
          }
          
          return new GLPostingResult(postingDetails, true);
      }
  }
  ```

- [ ] **API 엔드포인트 구현**
  ```java
  @RestController
  @RequestMapping("/api/v2/accounting/general-ledger")
  public class GeneralLedgerController {
      
      @GetMapping("/{companyId}/trial-balance")
      public ResponseEntity<TrialBalance> getTrialBalance(
          @PathVariable String companyId,
          @RequestParam LocalDate asOfDate
      );
      
      @GetMapping("/{companyId}/account/{accountCode}/ledger")  
      public ResponseEntity<AccountLedger> getAccountLedger(
          @PathVariable String companyId,
          @PathVariable String accountCode,
          @RequestParam LocalDate startDate,
          @RequestParam LocalDate endDate
      );
  }
  ```

#### 2.2 고급 재무제표 (Week 4)
- [ ] **월별 비교 재무제표 구현**
  ```java
  @Service
  public class AdvancedReportGenerator {
      
      // 월별 손익계산서 비교
      public MonthlyIncomeStatementComparison generateMonthlyISComparison(
          String companyId, 
          Integer fiscalYear,
          List<Integer> months
      ) {
          Map<Integer, IncomeStatementData> monthlyData = new LinkedHashMap<>();
          
          for(Integer month : months) {
              IncomeStatementData monthData = generateMonthlyIS(companyId, fiscalYear, month);
              monthlyData.put(month, monthData);
          }
          
          return new MonthlyIncomeStatementComparison(monthlyData);
      }
      
      // 계층적 재무제표 생성
      public HierarchicalFinancialStatement generateHierarchicalStatement(
          String companyId,
          LocalDate asOfDate,
          StatementType statementType
      );
  }
  ```

### Phase 3 작업 (Week 5-6)

#### 3.1 마감 시스템 (Week 5)
- [ ] **마감 기간 관리 테이블**
  ```sql
  CREATE TABLE closing_periods (
      id BIGSERIAL PRIMARY KEY,
      company_id UUID NOT NULL REFERENCES companies(id),
      period_type VARCHAR(20) NOT NULL, -- MONTHLY, QUARTERLY, YEARLY
      fiscal_year INTEGER NOT NULL,
      fiscal_period INTEGER NOT NULL, -- 월: 1-12, 분기: 1-4, 연: 1
      status VARCHAR(20) DEFAULT 'OPEN', -- OPEN, CLOSING, CLOSED
      closing_started_at TIMESTAMPTZ,
      closed_at TIMESTAMPTZ,
      closed_by UUID,
      closing_notes TEXT,
      UNIQUE(company_id, period_type, fiscal_year, fiscal_period)
  );
  ```

- [ ] **ClosingProcessManager.java 구현**
  ```java
  @Service
  public class ClosingProcessManager {
      
      // 월차 마감 프로세스
      public ClosingResult executeMonthlyClosing(String companyId, LocalDate closingDate) {
          // 1. 마감 전 검증
          validatePreClosingConditions(companyId, closingDate);
          
          // 2. 시산표 균형 확인  
          verifyTrialBalance(companyId, closingDate);
          
          // 3. GL 잔액 확정
          finalizeGLBalances(companyId, closingDate);
          
          // 4. 마감 상태 업데이트
          updateClosingStatus(companyId, closingDate, ClosingStatus.CLOSED);
          
          // 5. 다음 월 초기화
          initializeNextPeriod(companyId, closingDate.plusMonths(1));
          
          return new ClosingResult(true, "월차 마감 완료");
      }
  }
  ```

#### 3.2 결산 처리 (Week 6)
- [ ] **결산 정리 분개 자동 생성**
  ```java
  @Service  
  public class ClosingJournalEntryGenerator {
      
      // 손익 계정 정리 (당기순이익 이월)
      public JournalEntry generateProfitLossClosingEntry(String companyId, LocalDate closingDate) {
          // 1. 수익 계정 잔액 조회
          List<GLBalance> revenueBalances = getRevenueAccountBalances(companyId, closingDate);
          
          // 2. 비용 계정 잔액 조회  
          List<GLBalance> expenseBalances = getExpenseAccountBalances(companyId, closingDate);
          
          // 3. 당기순이익 계산
          BigDecimal netIncome = calculateNetIncome(revenueBalances, expenseBalances);
          
          // 4. 정리 분개 생성
          return createClosingJournalEntry(companyId, closingDate, netIncome);
      }
  }
  ```

### Phase 4 작업 (Week 7-8)

#### 4.1 감사 추적 시스템 (Week 7)
- [ ] **감사 추적 테이블**
  ```sql
  CREATE TABLE audit_trail (
      id BIGSERIAL PRIMARY KEY,
      entity_type VARCHAR(50) NOT NULL, -- JOURNAL_ENTRY, GL_ACCOUNT, etc.
      entity_id BIGINT NOT NULL,
      action_type VARCHAR(20) NOT NULL, -- CREATE, UPDATE, DELETE, APPROVE
      old_values JSONB,
      new_values JSONB,
      changed_by UUID,
      changed_at TIMESTAMPTZ DEFAULT NOW(),
      ip_address INET,
      user_agent TEXT,
      reason TEXT
  );
  ```

- [ ] **AuditTrailService.java 구현**
  ```java
  @Service
  public class AuditTrailService {
      
      // 변경 이력 기록
      public void recordChange(AuditChangeEvent event) {
          AuditTrail audit = AuditTrail.builder()
              .entityType(event.getEntityType())
              .entityId(event.getEntityId())  
              .actionType(event.getActionType())
              .oldValues(event.getOldValues())
              .newValues(event.getNewValues())
              .changedBy(event.getUserId())
              .reason(event.getReason())
              .build();
              
          auditTrailRepository.save(audit);
      }
      
      // 감사 로그 조회
      public List<AuditTrail> getAuditHistory(String entityType, Long entityId);
  }
  ```

#### 4.2 시스템 완성 (Week 8)
- [ ] **전체 통합 테스트**
- [ ] **성능 최적화**
- [ ] **문서화 완성**
- [ ] **운영 환경 배포 준비**

---

## 🧪 테스트 전략

### 단위 테스트 (각 Phase마다)
```java
// GL 전기 테스트
@Test
public void testGLPosting() {
    // Given
    JournalEntry entry = createTestJournalEntry();
    
    // When  
    GLPostingResult result = glPostingService.postJournalEntry(entry);
    
    // Then
    assertThat(result.isSuccess()).isTrue();
    assertThat(getGLBalance("5130")).isEqualTo(expectedBalance);
}

// 시산표 균형 테스트
@Test
public void testTrialBalanceBal() {
    // Given
    String companyId = "test-company";
    LocalDate asOfDate = LocalDate.of(2025, 7, 31);
    
    // When
    TrialBalance trialBalance = glManager.generateTrialBalance(companyId, asOfDate);
    
    // Then  
    assertThat(trialBalance.getTotalDebit())
        .isEqualTo(trialBalance.getTotalCredit());
}
```

### 통합 테스트
```java
@Test
@Transactional
public void testFullAccountingFlow() {
    // 1. 거래 입력
    Transaction transaction = createTestTransaction();
    
    // 2. 분개 생성
    JournalEntry journalEntry = accountingEngine.processTransaction(transaction.getId());
    
    // 3. GL 전기
    GLPostingResult postingResult = glManager.postJournalEntryToGL(journalEntry.getId());
    
    // 4. 재무제표 생성
    IncomeStatement is = reportGenerator.generateIncomeStatement(
        transaction.getCompanyId(), 
        LocalDate.now().withDayOfMonth(1),
        LocalDate.now()
    );
    
    // 검증
    assertThat(postingResult.isSuccess()).isTrue();
    assertThat(is.getNetIncome()).isEqualTo(expectedNetIncome);
}
```

---

## 📊 성공 지표 및 검증 방법

### 기능적 목표
- [ ] **계정과목 200개** 완전 구축 및 정상 동작
- [ ] **GL 전기 정확성** 100% (분개 ↔ GL 잔액 일치)
- [ ] **재무제표 정확성** 99.9% (수작업 대비)
- [ ] **마감 프로세스** 완전성 (차기 이월 포함)

### 성능 목표  
- [ ] **분개 생성**: 기존 85ms → 100ms 이하 유지
- [ ] **GL 전기**: 분개당 50ms 이하
- [ ] **재무제표 생성**: 3초 이하 (월별 12개월 비교 기준)
- [ ] **마감 프로세스**: 5분 이하 (월 1,000건 거래 기준)

### 품질 목표
- [ ] **테스트 커버리지**: 95% 이상
- [ ] **코드 복잡도**: Cyclomatic Complexity 10 이하
- [ ] **메모리 사용량**: 현재 대비 150% 이하
- [ ] **데이터베이스 크기**: 현재 대비 300% 이하

---

## 🚀 결론

본 계획서는 현재의 견고한 기반 시스템을 유지하면서 단계적으로 확장하여 **경쟁사 수준의 전문 회계 시스템**을 구축하는 실현 가능한 로드맵입니다.

### 핵심 성공 요인
1. **TDD 방식**으로 회계 정확성 보장
2. **기존 시스템 호환성** 유지하며 점진적 확장
3. **명확한 우선순위**로 MVP 빠른 달성
4. **충분한 테스트**로 품질 보장

### 예상 결과
- **6주 후**: MVP 수준 달성 (200개 계정과목 + GL + 월별 재무제표)
- **12주 후**: 경쟁사 수준 완성 (감사 추적 + 전문적 출력)
- **16주 후**: 고도화 완성 (다중 회계기준 + 고급 분석)

**이 계획을 따라 단계적으로 진행하면 현재 시스템을 MVP 수준을 넘어 시장 경쟁력 있는 전문 회계 시스템으로 발전시킬 수 있습니다.**
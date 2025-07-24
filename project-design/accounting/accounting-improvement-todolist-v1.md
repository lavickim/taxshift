# MoneyShift 복식부기 시스템 개선 TodoList v1.0

**문서 목적**: 개발팀용 상세 작업 리스트 및 체크리스트  
**작성일**: 2025년 7월 24일  
**총 예상 기간**: 8주 (MVP 6주 + 완성 2주)  

---

## 📋 전체 진행 상황 요약

```
Progress: [██████░░░░░░░░░░░░░░] 0/8 Phases (0%)

Phase 1: 기반 구조 강화    [░░░░░░░░░░] 0/10 tasks (Week 1-2)
Phase 2: 핵심 기능 구현    [░░░░░░░░░░] 0/8 tasks  (Week 3-4) 
Phase 3: 마감 및 결산      [░░░░░░░░░░] 0/6 tasks  (Week 5-6)
Phase 4: 고급 기능 완성    [░░░░░░░░░░] 0/4 tasks  (Week 7-8)
```

---

## 🎯 Phase 1: 기반 구조 강화 (Week 1-2)

### Week 1: 계정과목 확장

#### 📁 1.1 한국 표준 계정과목 200개+ 데이터 구축
- [ ] **자산 계정 구축 (50개)**
  - [ ] 유동자산 (20개)
    - [ ] `1111` 현금
    - [ ] `1112` 보통예금  
    - [ ] `1113` 당좌예금
    - [ ] `1114` 정기예금
    - [ ] `1115` 외화예금
    - [ ] `1121` 받을어음
    - [ ] `1122` 매출채권
    - [ ] `1123` 미수금
    - [ ] `1124` 미수수익
    - [ ] `1125` 선급금
    - [ ] `1131` 상품
    - [ ] `1132` 제품
    - [ ] `1133` 재공품
    - [ ] `1134` 원재료
    - [ ] `1135` 저장품
    - [ ] `1141` 선급비용
    - [ ] `1142` 선급법인세
    - [ ] `1143` 부가세대급금
    - [ ] `1149` 기타유동자산
    - [ ] `1150` 유동자산평가충당금
  - [ ] 비유동자산 (30개)
    - [ ] **투자자산**
      - [ ] `1211` 투자유가증권
      - [ ] `1212` 출자금
      - [ ] `1213` 장기대여금
      - [ ] `1219` 투자자산평가충당금
    - [ ] **유형자산**  
      - [ ] `1221` 토지
      - [ ] `1222` 건물
      - [ ] `1223` 구축물
      - [ ] `1224` 기계장치
      - [ ] `1225` 차량운반구
      - [ ] `1226` 공구기구비품
      - [ ] `1227` 건설중인자산
      - [ ] `1228` 감가상각누계액(건물)
      - [ ] `1229` 감가상각누계액(구축물)
      - [ ] `1230` 감가상각누계액(기계장치)
      - [ ] `1231` 감가상각누계액(차량운반구)
      - [ ] `1232` 감가상각누계액(공구기구비품)
    - [ ] **무형자산**
      - [ ] `1241` 영업권
      - [ ] `1242` 특허권  
      - [ ] `1243` 실용신안권
      - [ ] `1244` 의장권
      - [ ] `1245` 상표권
      - [ ] `1246` 저작권
      - [ ] `1247` 소프트웨어
      - [ ] `1248` 개발비
      - [ ] `1249` 기타무형자산

- [ ] **부채 계정 구축 (30개)**
  - [ ] 유동부채 (15개)
    - [ ] `2111` 지급어음
    - [ ] `2112` 매입채무
    - [ ] `2113` 미지급금
    - [ ] `2114` 미지급비용
    - [ ] `2115` 선수금
    - [ ] `2116` 예수금
    - [ ] `2117` 단기차입금
    - [ ] `2118` 유동성장기부채
    - [ ] `2119` 미지급법인세
    - [ ] `2120` 부가세예수금
    - [ ] `2121` 원천세예수금
    - [ ] `2122` 사회보험료예수금
    - [ ] `2123` 미지급배당금
    - [ ] `2124` 충당금
    - [ ] `2129` 기타유동부채
  - [ ] 비유동부채 (15개)
    - [ ] `2211` 사채
    - [ ] `2212` 장기차입금
    - [ ] `2213` 장기미지급금
    - [ ] `2214` 퇴직급여충당금
    - [ ] `2215` 장기충당금
    - [ ] `2216` 이연법인세부채
    - [ ] `2217` 건설보증충당금
    - [ ] `2218` 판매보증충당금
    - [ ] `2219` 기타비유동부채
    - [ ] `2221` 전환사채
    - [ ] `2222` 신주인수권부사채
    - [ ] `2223` 교환사채
    - [ ] `2224` 영구채
    - [ ] `2225` 하이브리드채권
    - [ ] `2229` 기타특수채권

- [ ] **자본 계정 구축 (10개)**
  - [ ] `3111` 자본금
  - [ ] `3112` 주식발행초과금  
  - [ ] `3113` 감자차익
  - [ ] `3121` 이익준비금
  - [ ] `3122` 기업확장적립금
  - [ ] `3123` 배당평균적립금
  - [ ] `3124` 임의적립금
  - [ ] `3131` 이익잉여금
  - [ ] `3132` 전기이월이익잉여금
  - [ ] `3133` 당기순이익

- [ ] **수익 계정 구축 (20개)**
  - [ ] 영업수익 (10개)
    - [ ] `4111` 제품매출
    - [ ] `4112` 상품매출
    - [ ] `4113` 용역매출
    - [ ] `4114` 기타매출
    - [ ] `4115` 매출할인
    - [ ] `4116` 매출환입
    - [ ] `4117` 매출에누리
    - [ ] `4118` 순매출
    - [ ] `4119` 임대수익
    - [ ] `4120` 로열티수익
  - [ ] 영업외수익 (10개)
    - [ ] `4211` 이자수익
    - [ ] `4212` 배당금수익
    - [ ] `4213` 투자자산처분이익
    - [ ] `4214` 유형자산처분이익
    - [ ] `4215` 외환차익
    - [ ] `4216` 외화환산이익
    - [ ] `4217` 잡이익
    - [ ] `4218` 법인세환급액
    - [ ] `4219` 전기오류수정이익
    - [ ] `4220` 기타영업외수익

- [ ] **비용 계정 구축 (90개)**
  - [ ] 판매관리비 (60개)
    - [ ] **급여 관련** (15개)
      - [ ] `5111` 급여
      - [ ] `5112` 상여금
      - [ ] `5113` 임시직급여
      - [ ] `5114` 퇴직급여
      - [ ] `5115` 국민연금보험료
      - [ ] `5116` 건강보험료
      - [ ] `5117` 고용보험료
      - [ ] `5118` 산재보험료
      - [ ] `5119` 갑근세
      - [ ] `5120` 주민세
      - [ ] `5121` 복리후생비
      - [ ] `5122` 회의비
      - [ ] `5123` 교육훈련비
      - [ ] `5124` 도서인쇄비
      - [ ] `5125` 야근식대
    - [ ] **시설 관련** (15개)
      - [ ] `5131` 임차료
      - [ ] `5132` 수도광열비
      - [ ] `5133` 통신비
      - [ ] `5134` 수선비
      - [ ] `5135` 보험료
      - [ ] `5136` 차량유지비
      - [ ] `5137` 주차비
      - [ ] `5138` 청소비
      - [ ] `5139` 경비비
      - [ ] `5140` 관리비
      - [ ] `5141` 소모품비
      - [ ] `5142` 사무용품비
      - [ ] `5143` 도구소모품비
      - [ ] `5144` 전산소모품비
      - [ ] `5145` 기타시설비
    - [ ] **영업 관련** (15개)
      - [ ] `5151` 접대비
      - [ ] `5152` 광고선전비
      - [ ] `5153` 판촉비
      - [ ] `5154` 견본비
      - [ ] `5155` 판매수수료
      - [ ] `5156` 운반비
      - [ ] `5157` 포장비
      - [ ] `5158` 보관비
      - [ ] `5159` 하역비
      - [ ] `5160` 여비교통비
      - [ ] `5161` 출장비
      - [ ] `5162` 시장조사비
      - [ ] `5163` 신제품개발비
      - [ ] `5164` 기술료
      - [ ] `5165` 컨설팅비
    - [ ] **일반관리** (15개)
      - [ ] `5171` 감가상각비
      - [ ] `5172` 무형자산상각비
      - [ ] `5173` 대손상각비
      - [ ] `5174` 세금과공과
      - [ ] `5175` 인허가비
      - [ ] `5176` 법무비
      - [ ] `5177` 회계감사비
      - [ ] `5178` 전문용역비
      - [ ] `5179` 용역비
      - [ ] `5180` 외주가공비
      - [ ] `5181` 임가공비
      - [ ] `5182` 지급수수료
      - [ ] `5183` 연구개발비
      - [ ] `5184` 기부금
      - [ ] `5185` 잡비
  - [ ] 영업외비용 (30개)
    - [ ] **금융비용** (10개)
      - [ ] `5211` 이자비용
      - [ ] `5212` 사채이자
      - [ ] `5213` 할인료
      - [ ] `5214` 외환차손
      - [ ] `5215` 외화환산손실
      - [ ] `5216` 투자자산처분손실
      - [ ] `5217` 투자자산평가손실
      - [ ] `5218` 유가증권처분손실
      - [ ] `5219` 파생상품평가손실
      - [ ] `5220` 기타금융비용  
    - [ ] **기타영업외비용** (20개)
      - [ ] `5221` 유형자산처분손실
      - [ ] `5222` 유형자산평가손실
      - [ ] `5223` 무형자산처분손실
      - [ ] `5224` 무형자산손상차손
      - [ ] `5225` 재고자산평가손실
      - [ ] `5226` 매출채권평가손실
      - [ ] `5227` 손해배상금
      - [ ] `5228` 벌과금
      - [ ] `5229` 기부금한도초과액
      - [ ] `5230` 접대비한도초과액
      - [ ] `5231` 법인세추징액
      - [ ] `5232` 가산세
      - [ ] `5233` 연체료
      - [ ] `5234` 소송비용
      - [ ] `5235` 화재손실
      - [ ] `5236` 도난손실
      - [ ] `5237` 재해손실
      - [ ] `5238` 전기오류수정손실
      - [ ] `5239` 기타영업외비용
      - [ ] `5240` 특별손실

#### 📊 1.2 계정과목 계층 구조 설계
- [ ] **parent_account_id 설정**
  ```sql
  -- 계정과목 계층 구조 예시
  -- 자산 (1000)
  --   유동자산 (1100)  
  --     현금및현금성자산 (1110)
  --       현금 (1111)
  --       보통예금 (1112) 
  --       당좌예금 (1113)
  ```
- [ ] **account_group 및 display_order 설정**
- [ ] **is_summary_account 플래그 설정** (요약 계정 표시)

#### 🔗 1.3 기존 태그-계정과목 매핑 업데이트  
- [ ] **기존 35개 태그 재매핑**
  - [ ] `커피전문점` → `5121` (복리후생비) 또는 `5151` (접대비)
  - [ ] `주유소` → `5136` (차량유지비)
  - [ ] `편의점` → `5141` (소모품비)
  - [ ] `음식점` → `5151` (접대비) 또는 `5121` (복리후생비)
  - [ ] `택시` → `5160` (여비교통비) 또는 `5151` (접대비)
  - [ ] `통신` → `5133` (통신비)
  - [ ] `임차료` → `5131` (임차료)
  - [ ] 나머지 28개 태그 새로운 계정과목 매핑

- [ ] **조건부 매핑 규칙 확장**
  ```java  
  // 시간대 기반 매핑
  if (isBusinessHours && amount < 50000) {
      return "5121"; // 복리후생비
  } else if (isAfterHours && amount > 50000) {  
      return "5151"; // 접대비
  }
  ```

#### 🗄️ 1.4 데이터베이스 스키마 확장
- [ ] **chart_of_accounts 테이블 컬럼 추가**
  ```sql
  ALTER TABLE chart_of_accounts 
  ADD COLUMN account_group VARCHAR(50),           -- 계정 그룹 (현금및현금성자산, 매출채권 등)
  ADD COLUMN display_order INTEGER DEFAULT 0,    -- 표시 순서
  ADD COLUMN is_summary_account BOOLEAN DEFAULT FALSE, -- 요약계정 여부
  ADD COLUMN parent_account_id INTEGER REFERENCES chart_of_accounts(id), -- 상위계정
  ADD COLUMN account_level INTEGER DEFAULT 1,    -- 계정 레벨 (1:대분류, 2:중분류, 3:소분류)
  ADD COLUMN is_control_account BOOLEAN DEFAULT FALSE, -- 통제계정 여부
  ADD COLUMN normal_balance_type VARCHAR(10) CHECK (normal_balance_type IN ('DEBIT', 'CREDIT')); -- 정상잔액유형
  ```

- [ ] **200개 계정과목 데이터 INSERT**
  ```sql
  -- 실행할 스크립트 파일들
  INSERT INTO chart_of_accounts (account_code, account_name, account_type, ...) VALUES 
  ('1111', '현금', '자산', '유동자산', TRUE, 1, '현금및현금성자산', 10, FALSE, NULL, 3, FALSE, 'DEBIT'),
  ('1112', '보통예금', '자산', '유동자산', TRUE, 1, '현금및현금성자산', 20, FALSE, NULL, 3, FALSE, 'DEBIT'),
  -- ... 200개 데이터
  ```

### Week 2: GL 시스템 기반 구조

#### 🗄️ 2.1 새로운 테이블 생성
- [ ] **general_ledger 테이블 생성**
  ```sql
  CREATE TABLE general_ledger (
      id BIGSERIAL PRIMARY KEY,
      company_id UUID NOT NULL REFERENCES companies(id),
      account_code VARCHAR(20) NOT NULL REFERENCES chart_of_accounts(account_code),
      fiscal_year INTEGER NOT NULL,
      fiscal_month INTEGER NOT NULL,
      beginning_debit_balance DECIMAL(18,2) DEFAULT 0,   -- 기초 차변잔액
      beginning_credit_balance DECIMAL(18,2) DEFAULT 0,  -- 기초 대변잔액  
      period_debit_amount DECIMAL(18,2) DEFAULT 0,       -- 당월 차변발생액
      period_credit_amount DECIMAL(18,2) DEFAULT 0,      -- 당월 대변발생액
      ending_debit_balance DECIMAL(18,2) DEFAULT 0,      -- 기말 차변잔액
      ending_credit_balance DECIMAL(18,2) DEFAULT 0,     -- 기말 대변잔액
      is_closed BOOLEAN DEFAULT FALSE,                   -- 마감 여부
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(company_id, account_code, fiscal_year, fiscal_month)
  );
  
  -- 인덱스 생성
  CREATE INDEX idx_general_ledger_company_account ON general_ledger(company_id, account_code);
  CREATE INDEX idx_general_ledger_fiscal_period ON general_ledger(fiscal_year, fiscal_month);
  CREATE INDEX idx_general_ledger_is_closed ON general_ledger(is_closed);
  ```

- [ ] **gl_details 테이블 생성**
  ```sql
  CREATE TABLE gl_details (
      id BIGSERIAL PRIMARY KEY,
      general_ledger_id BIGINT NOT NULL REFERENCES general_ledger(id),
      journal_entry_id BIGINT NOT NULL REFERENCES journal_entries(id),
      journal_entry_detail_id BIGINT NOT NULL REFERENCES journal_entry_details(id),
      posting_date DATE NOT NULL,                        -- 전기일자
      debit_amount DECIMAL(18,2) DEFAULT 0,              -- 차변금액
      credit_amount DECIMAL(18,2) DEFAULT 0,             -- 대변금액
      running_debit_balance DECIMAL(18,2) DEFAULT 0,     -- 누적 차변잔액
      running_credit_balance DECIMAL(18,2) DEFAULT 0,    -- 누적 대변잔액
      description TEXT,                                   -- 적요
      created_at TIMESTAMPTZ DEFAULT NOW(),
      CONSTRAINT chk_debit_credit_exclusive CHECK (
          (debit_amount > 0 AND credit_amount = 0) OR 
          (debit_amount = 0 AND credit_amount > 0)
      )
  );
  
  -- 인덱스 생성
  CREATE INDEX idx_gl_details_general_ledger ON gl_details(general_ledger_id);
  CREATE INDEX idx_gl_details_journal_entry ON gl_details(journal_entry_id);
  CREATE INDEX idx_gl_details_posting_date ON gl_details(posting_date);
  ```

#### 🏗️ 2.2 GeneralLedgerManager.java 구현
- [ ] **기본 클래스 구조 생성**
  ```java
  @Service
  @Transactional
  public class GeneralLedgerManager {
      
      @Autowired
      private GeneralLedgerRepository generalLedgerRepository;
      
      @Autowired  
      private GLDetailsRepository glDetailsRepository;
      
      @Autowired
      private ChartOfAccountsRepository chartOfAccountsRepository;
      
      // GL 계정 초기화 (회계 기간 시작 시)
      public GeneralLedger initializeGLAccount(
          String companyId, 
          String accountCode, 
          Integer fiscalYear, 
          Integer fiscalMonth
      ) {
          // 구현 예정
      }
      
      // 분개를 GL에 전기
      public GLPostingResult postJournalEntryToGL(Long journalEntryId) {
          // 구현 예정  
      }
      
      // 월별 잔액 조회
      public GLBalance getMonthlyBalance(
          String companyId, 
          String accountCode, 
          Integer fiscalYear, 
          Integer fiscalMonth
      ) {
          // 구현 예정
      }
      
      // 시산표 생성
      public TrialBalance generateTrialBalance(String companyId, LocalDate asOfDate) {
          // 구현 예정
      }
  }
  ```

- [ ] **GLPostingService.java 구현**
  ```java
  @Service
  public class GLPostingService {
      
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
      
      private GeneralLedger ensureGLAccountExists(
          String companyId, 
          String accountCode, 
          LocalDateTime entryDate
      ) {
          // 구현 예정
      }
      
      private GLDetail createGLDetail(GeneralLedger glAccount, JournalEntryDetail detail) {
          // 구현 예정
      }
      
      private void updateGLBalance(
          GeneralLedger glAccount, 
          BigDecimal debitAmount, 
          BigDecimal creditAmount
      ) {
          // 구현 예정
      }
  }
  ```

#### 🧪 2.3 기본 테스트 작성
- [ ] **GeneralLedgerManagerTest.java**
  ```java
  @SpringBootTest
  @Transactional
  public class GeneralLedgerManagerTest {
      
      @Autowired
      private GeneralLedgerManager glManager;
      
      @Test
      public void testInitializeGLAccount() {
          // Given
          String companyId = "test-company";
          String accountCode = "1112";
          Integer fiscalYear = 2025;
          Integer fiscalMonth = 7;
          
          // When
          GeneralLedger gl = glManager.initializeGLAccount(
              companyId, accountCode, fiscalYear, fiscalMonth);
          
          // Then
          assertThat(gl).isNotNull();
          assertThat(gl.getCompanyId()).isEqualTo(companyId);
          assertThat(gl.getAccountCode()).isEqualTo(accountCode);
          assertThat(gl.getBeginningDebitBalance()).isEqualTo(BigDecimal.ZERO);
      }
      
      @Test
      public void testTrialBalanceBalance() {
          // 시산표 균형 테스트 구현 예정
      }
  }
  ```

---

## 🎯 Phase 2: 핵심 기능 구현 (Week 3-4)

### Week 3: GL 전기 시스템 완성

#### ⚙️ 3.1 분개 → GL 자동 전기 로직 구현
- [ ] **ensureGLAccountExists() 메서드 구현**
  ```java
  private GeneralLedger ensureGLAccountExists(
      String companyId, 
      String accountCode, 
      LocalDateTime entryDate
  ) {
      Integer fiscalYear = entryDate.getYear();
      Integer fiscalMonth = entryDate.getMonthValue();
      
      Optional<GeneralLedger> existing = generalLedgerRepository
          .findByCompanyIdAndAccountCodeAndFiscalYearAndFiscalMonth(
              companyId, accountCode, fiscalYear, fiscalMonth);
      
      if (existing.isPresent()) {
          return existing.get();
      }
      
      // 새로운 GL 계정 생성
      GeneralLedger newGL = GeneralLedger.builder()
          .companyId(companyId)
          .accountCode(accountCode)
          .fiscalYear(fiscalYear)
          .fiscalMonth(fiscalMonth)
          .beginningDebitBalance(BigDecimal.ZERO)
          .beginningCreditBalance(BigDecimal.ZERO)
          .periodDebitAmount(BigDecimal.ZERO)
          .periodCreditAmount(BigDecimal.ZERO)
          .endingDebitBalance(BigDecimal.ZERO)
          .endingCreditBalance(BigDecimal.ZERO)
          .isClosed(false)
          .build();
          
      return generalLedgerRepository.save(newGL);
  }
  ```

- [ ] **createGLDetail() 메서드 구현**
  ```java
  private GLDetail createGLDetail(
      GeneralLedger glAccount, 
      JournalEntryDetail journalDetail
  ) {
      GLDetail glDetail = GLDetail.builder()
          .generalLedgerId(glAccount.getId())
          .journalEntryId(journalDetail.getJournalEntryId())
          .journalEntryDetailId(journalDetail.getId())
          .postingDate(journalDetail.getJournalEntry().getEntryDate())
          .debitAmount(journalDetail.getDebitAmount())
          .creditAmount(journalDetail.getCreditAmount())
          .description(journalDetail.getDescription())
          .build();
          
      return glDetailsRepository.save(glDetail);
  }
  ```

- [ ] **updateGLBalance() 메서드 구현**
  ```java
  private void updateGLBalance(
      GeneralLedger glAccount, 
      BigDecimal debitAmount, 
      BigDecimal creditAmount
  ) {
      // 당월 발생액 업데이트
      glAccount.setPeriodDebitAmount(
          glAccount.getPeriodDebitAmount().add(debitAmount));
      glAccount.setPeriodCreditAmount(
          glAccount.getPeriodCreditAmount().add(creditAmount));
      
      // 기말 잔액 계산
      ChartOfAccounts account = chartOfAccountsRepository
          .findByAccountCode(glAccount.getAccountCode()).orElseThrow();
      
      if (account.getIsDebitNormal()) {
          // 차변 정상 계정 (자산, 비용)
          BigDecimal endingBalance = glAccount.getBeginningDebitBalance()
              .add(glAccount.getPeriodDebitAmount())
              .subtract(glAccount.getPeriodCreditAmount());
              
          if (endingBalance.compareTo(BigDecimal.ZERO) >= 0) {
              glAccount.setEndingDebitBalance(endingBalance);
              glAccount.setEndingCreditBalance(BigDecimal.ZERO);
          } else {
              glAccount.setEndingDebitBalance(BigDecimal.ZERO);
              glAccount.setEndingCreditBalance(endingBalance.negate());
          }
      } else {
          // 대변 정상 계정 (부채, 자본, 수익)
          BigDecimal endingBalance = glAccount.getBeginningCreditBalance()
              .add(glAccount.getPeriodCreditAmount())
              .subtract(glAccount.getPeriodDebitAmount());
              
          if (endingBalance.compareTo(BigDecimal.ZERO) >= 0) {
              glAccount.setEndingCreditBalance(endingBalance);
              glAccount.setEndingDebitBalance(BigDecimal.ZERO);
          } else {
              glAccount.setEndingCreditBalance(BigDecimal.ZERO);
              glAccount.setEndingDebitBalance(endingBalance.negate());
          }
      }
      
      generalLedgerRepository.save(glAccount);
  }
  ```

#### 📊 3.2 시산표 생성 로직 구현
- [ ] **generateTrialBalance() 메서드 구현**
  ```java
  public TrialBalance generateTrialBalance(String companyId, LocalDate asOfDate) {
      Integer fiscalYear = asOfDate.getYear();
      Integer fiscalMonth = asOfDate.getMonthValue();
      
      List<GeneralLedger> glAccounts = generalLedgerRepository
          .findByCompanyIdAndFiscalYearAndFiscalMonth(companyId, fiscalYear, fiscalMonth);
      
      TrialBalance trialBalance = new TrialBalance();
      trialBalance.setCompanyId(companyId);
      trialBalance.setAsOfDate(asOfDate);
      
      BigDecimal totalDebit = BigDecimal.ZERO;
      BigDecimal totalCredit = BigDecimal.ZERO;
      
      List<TrialBalanceItem> items = new ArrayList<>();
      
      for (GeneralLedger glAccount : glAccounts) {
          ChartOfAccounts account = chartOfAccountsRepository
              .findByAccountCode(glAccount.getAccountCode()).orElse(null);
          
          if (account == null) continue;
          
          TrialBalanceItem item = TrialBalanceItem.builder()
              .accountCode(glAccount.getAccountCode())
              .accountName(account.getAccountName())
              .debitBalance(glAccount.getEndingDebitBalance())
              .creditBalance(glAccount.getEndingCreditBalance())
              .build();
          
          items.add(item);
          
          totalDebit = totalDebit.add(glAccount.getEndingDebitBalance());
          totalCredit = totalCredit.add(glAccount.getEndingCreditBalance());
      }
      
      trialBalance.setItems(items);
      trialBalance.setTotalDebit(totalDebit);
      trialBalance.setTotalCredit(totalCredit);
      trialBalance.setIsBalanced(totalDebit.compareTo(totalCredit) == 0);
      
      return trialBalance;
  }
  ```

#### 🌐 3.3 GL API 엔드포인트 구현
- [ ] **GeneralLedgerController.java 생성**
  ```java
  @RestController
  @RequestMapping("/api/v2/accounting/general-ledger")
  public class GeneralLedgerController {
      
      @Autowired
      private GeneralLedgerManager glManager;
      
      @GetMapping("/{companyId}/trial-balance")
      public ResponseEntity<TrialBalance> getTrialBalance(
          @PathVariable String companyId,
          @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate asOfDate
      ) {
          try {
              TrialBalance trialBalance = glManager.generateTrialBalance(companyId, asOfDate);
              return ResponseEntity.ok(trialBalance);
          } catch (Exception e) {
              log.error("시산표 생성 오류: companyId={}, asOfDate={}", companyId, asOfDate, e);
              return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
          }
      }
      
      @GetMapping("/{companyId}/account/{accountCode}/ledger")
      public ResponseEntity<AccountLedger> getAccountLedger(
          @PathVariable String companyId,
          @PathVariable String accountCode,
          @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
          @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate
      ) {
          // 구현 예정
          return ResponseEntity.ok().build();
      }
      
      @PostMapping("/{companyId}/post-journal-entry/{journalEntryId}")
      public ResponseEntity<GLPostingResult> postJournalEntry(
          @PathVariable String companyId,
          @PathVariable Long journalEntryId
      ) {
          try {
              GLPostingResult result = glManager.postJournalEntryToGL(journalEntryId);
              return ResponseEntity.ok(result);
          } catch (Exception e) {
              log.error("분개 전기 오류: journalEntryId={}", journalEntryId, e);
              return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
          }
      }
  }
  ```

#### 🧪 3.4 GL 전기 테스트 작성
- [ ] **GLPostingServiceTest.java**
  ```java
  @SpringBootTest
  @Transactional
  public class GLPostingServiceTest {
      
      @Autowired
      private GLPostingService glPostingService;
      
      @Autowired
      private TestDataCreator testDataCreator;
      
      @Test
      public void testPostJournalEntryToGL() {
          // Given: 테스트용 분개 생성
          JournalEntry journalEntry = testDataCreator.createSampleJournalEntry(
              "test-company", LocalDate.now(), 
              Arrays.asList(
                  new JournalEntryDetail("5130", BigDecimal.valueOf(10000), BigDecimal.ZERO, "소모품비"),
                  new JournalEntryDetail("1112", BigDecimal.ZERO, BigDecimal.valueOf(10000), "보통예금")
              )
          );
          
          // When: GL 전기 실행
          GLPostingResult result = glPostingService.postJournalEntry(journalEntry);
          
          // Then: 결과 검증
          assertThat(result.isSuccess()).isTrue();
          assertThat(result.getPostingDetails()).hasSize(2);
          
          // GL 잔액 검증
          GeneralLedger glExpense = findGLAccount("test-company", "5130", LocalDate.now());
          GeneralLedger glCash = findGLAccount("test-company", "1112", LocalDate.now());
          
          assertThat(glExpense.getEndingDebitBalance()).isEqualTo(BigDecimal.valueOf(10000));
          assertThat(glCash.getEndingCreditBalance()).isEqualTo(BigDecimal.valueOf(10000));
      }
      
      @Test
      public void testTrialBalanceAfterPosting() {
          // GL 전기 후 시산표 균형 테스트
      }
  }
  ```

### Week 4: 고급 재무제표 생성

#### 📈 4.1 월별 비교 재무제표 구현
- [ ] **AdvancedReportGenerator.java 생성**
  ```java
  @Service
  public class AdvancedReportGenerator {
      
      @Autowired
      private GeneralLedgerManager glManager;
      
      @Autowired
      private ChartOfAccountsRepository chartOfAccountsRepository;
      
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
      
      private IncomeStatementData generateMonthlyIS(
          String companyId, 
          Integer fiscalYear, 
          Integer fiscalMonth
      ) {
          // 수익 계정 조회 (4000번대)
          List<GeneralLedger> revenueAccounts = glManager.getGLAccountsByType(
              companyId, fiscalYear, fiscalMonth, "수익");
          
          // 비용 계정 조회 (5000번대)  
          List<GeneralLedger> expenseAccounts = glManager.getGLAccountsByType(
              companyId, fiscalYear, fiscalMonth, "비용");
          
          return IncomeStatementData.builder()
              .revenueAccounts(revenueAccounts)
              .expenseAccounts(expenseAccounts)
              .build();
      }
  }
  ```

- [ ] **MonthlyIncomeStatementComparison 클래스 구현**
  ```java
  public class MonthlyIncomeStatementComparison {
      private Map<Integer, IncomeStatementData> monthlyData;
      private ComparisonAnalysis analysis;
      
      public ComparisonAnalysis generateAnalysis() {
          ComparisonAnalysis analysis = new ComparisonAnalysis();
          
          // 월별 증감 분석
          List<Integer> months = new ArrayList<>(monthlyData.keySet());
          Collections.sort(months);
          
          for (int i = 1; i < months.size(); i++) {
              Integer currentMonth = months.get(i);
              Integer previousMonth = months.get(i - 1);
              
              IncomeStatementData current = monthlyData.get(currentMonth);
              IncomeStatementData previous = monthlyData.get(previousMonth);
              
              MonthlyChange change = calculateMonthlyChange(previous, current);
              analysis.addMonthlyChange(currentMonth, change);
          }
          
          return analysis;
      }
      
      private MonthlyChange calculateMonthlyChange(
          IncomeStatementData previous, 
          IncomeStatementData current
      ) {
          // 매출 증감률 계산
          BigDecimal revenueChange = calculateChangeRate(
              previous.getTotalRevenue(), current.getTotalRevenue());
          
          // 비용 증감률 계산  
          BigDecimal expenseChange = calculateChangeRate(
              previous.getTotalExpense(), current.getTotalExpense());
          
          // 순이익 증감률 계산
          BigDecimal netIncomeChange = calculateChangeRate(
              previous.getNetIncome(), current.getNetIncome());
          
          return MonthlyChange.builder()
              .revenueChangeRate(revenueChange)
              .expenseChangeRate(expenseChange)
              .netIncomeChangeRate(netIncomeChange)
              .build();
      }
  }
  ```

#### 🏗️ 4.2 계층적 재무제표 구현
- [ ] **HierarchicalFinancialStatement 클래스 구현**
  ```java
  public class HierarchicalFinancialStatement {
      private List<StatementSection> sections;
      
      public static class StatementSection {
          private String sectionName;        // "I. 유동자산"
          private String sectionLevel;       // "I", "II", "III"
          private List<StatementItem> items;
          private List<StatementSection> subSections;
          private BigDecimal sectionTotal;
          
          // 소계 계산
          public BigDecimal calculateSubtotal() {
              BigDecimal subtotal = BigDecimal.ZERO;
              
              // 직접 항목들의 합계
              for (StatementItem item : items) {
                  subtotal = subtotal.add(item.getAmount());
              }
              
              // 하위 섹션들의 합계
              for (StatementSection subSection : subSections) {
                  subtotal = subtotal.add(subSection.calculateSubtotal());
              }
              
              this.sectionTotal = subtotal;
              return subtotal;
          }
      }
      
      public static class StatementItem {
          private String accountCode;
          private String accountName;
          private BigDecimal amount;
          private String displayFormat;     // "  현금" (들여쓰기 포함)
      }
  }
  ```

- [ ] **계층 구조 생성 로직**
  ```java
  public HierarchicalFinancialStatement generateHierarchicalBS(
      String companyId,
      LocalDate asOfDate
  ) {
      HierarchicalFinancialStatement statement = new HierarchicalFinancialStatement();
      
      // I. 자산
      StatementSection assetSection = new StatementSection("자산", "I");
      
      // I-1. 유동자산
      StatementSection currentAssetSection = new StatementSection("유동자산", "1");
      
      // 현금및현금성자산
      StatementSection cashSection = new StatementSection("현금및현금성자산", "");
      cashSection.addItem(new StatementItem("1111", "현금", getCashAmount(companyId, asOfDate)));
      cashSection.addItem(new StatementItem("1112", "보통예금", getBankAmount(companyId, asOfDate)));
      
      currentAssetSection.addSubSection(cashSection);
      assetSection.addSubSection(currentAssetSection);
      
      // 소계 계산
      currentAssetSection.calculateSubtotal();
      assetSection.calculateSubtotal();
      
      statement.addSection(assetSection);
      
      return statement;
  }
  ```

#### 📄 4.3 재무제표 출력 형식 개선
- [ ] **Excel 출력 기능**
  ```java
  @Service
  public class FinancialStatementExporter {
      
      public Workbook exportToExcel(MonthlyIncomeStatementComparison comparison) {
          Workbook workbook = new XSSFWorkbook();
          Sheet sheet = workbook.createSheet("월별 손익계산서");
          
          // 헤더 행 생성
          Row headerRow = sheet.createRow(0);
          headerRow.createCell(0).setCellValue("계정과목");
          
          List<Integer> months = comparison.getMonths();
          for (int i = 0; i < months.size(); i++) {
              headerRow.createCell(i + 1).setCellValue(months.get(i) + "월");
          }
          headerRow.createCell(months.size() + 1).setCellValue("합계");
          headerRow.createCell(months.size() + 2).setCellValue("평균");
          
          // 데이터 행 생성
          int rowNum = 1;
          
          // 수익 부문
          rowNum = addSectionToExcel(sheet, rowNum, "I. 매출", comparison.getRevenueData());
          
          // 비용 부문
          rowNum = addSectionToExcel(sheet, rowNum, "II. 판매비와관리비", comparison.getExpenseData());
          
          // 당기순이익
          Row netIncomeRow = sheet.createRow(rowNum);
          netIncomeRow.createCell(0).setCellValue("당기순이익");
          for (int i = 0; i < months.size(); i++) {
              BigDecimal netIncome = comparison.getNetIncome(months.get(i));
              netIncomeRow.createCell(i + 1).setCellValue(netIncome.doubleValue());
          }
          
          return workbook;
      }
  }
  ```

#### 🧪 4.4 고급 재무제표 테스트
- [ ] **AdvancedReportGeneratorTest.java**
  ```java
  @SpringBootTest
  @Transactional
  public class AdvancedReportGeneratorTest {
      
      @Test
      public void testMonthlyISComparison() {
          // Given: 3개월 데이터 준비
          String companyId = "test-company";
          Integer fiscalYear = 2025;
          List<Integer> months = Arrays.asList(5, 6, 7);
          
          // 테스트 데이터 생성
          createTestGLData(companyId, fiscalYear, months);
          
          // When: 월별 비교 손익계산서 생성
          MonthlyIncomeStatementComparison comparison = 
              advancedReportGenerator.generateMonthlyISComparison(companyId, fiscalYear, months);
          
          // Then: 결과 검증
          assertThat(comparison.getMonthlyData()).hasSize(3);
          assertThat(comparison.getAnalysis().getMonthlyChanges()).hasSize(2); // 6월vs5월, 7월vs6월
          
          // 증감률 검증
          MonthlyChange juneChange = comparison.getAnalysis().getMonthlyChange(6);
          assertThat(juneChange.getRevenueChangeRate()).isGreaterThan(BigDecimal.ZERO);
      }
  }
  ```

---

## 🎯 Phase 3: 마감 및 결산 (Week 5-6)

### Week 5: 마감 시스템 구현

#### 🗄️ 5.1 마감 기간 관리 테이블 생성
- [ ] **closing_periods 테이블 생성**
  ```sql
  CREATE TABLE closing_periods (
      id BIGSERIAL PRIMARY KEY,
      company_id UUID NOT NULL REFERENCES companies(id),
      period_type VARCHAR(20) NOT NULL CHECK (period_type IN ('MONTHLY', 'QUARTERLY', 'YEARLY')),
      fiscal_year INTEGER NOT NULL,
      fiscal_period INTEGER NOT NULL, -- 월: 1-12, 분기: 1-4, 연: 1
      status VARCHAR(20) DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'CLOSING', 'CLOSED', 'REVERSED')),
      closing_started_at TIMESTAMPTZ,
      closed_at TIMESTAMPTZ,
      closed_by UUID,
      closing_notes TEXT,
      reversal_reason TEXT,
      reversed_at TIMESTAMPTZ,
      reversed_by UUID,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(company_id, period_type, fiscal_year, fiscal_period)
  );
  
  -- 인덱스 생성
  CREATE INDEX idx_closing_periods_company_status ON closing_periods(company_id, status);
  CREATE INDEX idx_closing_periods_fiscal_period ON closing_periods(fiscal_year, fiscal_period);
  ```

#### 🏗️ 5.2 ClosingProcessManager.java 구현
- [ ] **기본 클래스 구조**
  ```java
  @Service
  @Transactional
  public class ClosingProcessManager {
      
      @Autowired
      private ClosingPeriodsRepository closingPeriodsRepository;
      
      @Autowired
      private GeneralLedgerManager glManager;
      
      @Autowired
      private JournalEntryRepository journalEntryRepository;
      
      // 월차 마감 프로세스
      public ClosingResult executeMonthlyClosing(String companyId, LocalDate closingDate) {
          log.info("월차 마감 시작: companyId={}, closingDate={}", companyId, closingDate);
          
          try {
              // 1. 마감 전 검증
              validatePreClosingConditions(companyId, closingDate);
              
              // 2. 마감 상태 업데이트 (CLOSING으로 변경)
              ClosingPeriod closingPeriod = updateClosingStatus(
                  companyId, closingDate, ClosingStatus.CLOSING);
              
              // 3. 시산표 균형 확인
              TrialBalance trialBalance = verifyTrialBalance(companyId, closingDate);
              if (!trialBalance.getIsBalanced()) {
                  throw new ClosingException("시산표가 불균형입니다: " + 
                      trialBalance.getTotalDebit() + " vs " + trialBalance.getTotalCredit());
              }
              
              // 4. GL 잔액 확정 (is_closed = true)
              finalizeGLBalances(companyId, closingDate);
              
              // 5. 다음 월 GL 계정 초기화
              initializeNextPeriod(companyId, closingDate.plusMonths(1));
              
              // 6. 마감 완료 상태 업데이트
              closingPeriod = updateClosingStatus(companyId, closingDate, ClosingStatus.CLOSED);
              
              log.info("월차 마감 완료: companyId={}, closingDate={}", companyId, closingDate);
              
              return ClosingResult.builder()
                  .success(true)
                  .message("월차 마감이 성공적으로 완료되었습니다.")
                  .closingPeriod(closingPeriod)
                  .trialBalance(trialBalance)
                  .build();
                  
          } catch (Exception e) {
              log.error("월차 마감 실패: companyId={}, closingDate={}", companyId, closingDate, e);
              
              // 마감 상태를 OPEN으로 되돌림
              updateClosingStatus(companyId, closingDate, ClosingStatus.OPEN);
              
              return ClosingResult.builder()
                  .success(false)
                  .message("월차 마감 실패: " + e.getMessage())
                  .build();
          }
      }
  }
  ```

- [ ] **마감 전 검증 로직**
  ```java
  private void validatePreClosingConditions(String companyId, LocalDate closingDate) {
      Integer fiscalYear = closingDate.getYear();
      Integer fiscalMonth = closingDate.getMonthValue();
      
      // 1. 이미 마감된 기간인지 확인
      Optional<ClosingPeriod> existingClosure = closingPeriodsRepository
          .findByCompanyIdAndPeriodTypeAndFiscalYearAndFiscalPeriod(
              companyId, PeriodType.MONTHLY, fiscalYear, fiscalMonth);
      
      if (existingClosure.isPresent() && existingClosure.get().getStatus() == ClosingStatus.CLOSED) {
          throw new ClosingException("이미 마감된 기간입니다: " + closingDate);
      }
      
      // 2. 전월이 마감되었는지 확인
      LocalDate previousMonth = closingDate.minusMonths(1);
      Integer prevYear = previousMonth.getYear();
      Integer prevMonth = previousMonth.getMonthValue();
      
      Optional<ClosingPeriod> previousClosure = closingPeriodsRepository
          .findByCompanyIdAndPeriodTypeAndFiscalYearAndFiscalPeriod(
              companyId, PeriodType.MONTHLY, prevYear, prevMonth);
      
      if (previousClosure.isEmpty() || previousClosure.get().getStatus() != ClosingStatus.CLOSED) {
          throw new ClosingException("전월이 마감되지 않았습니다: " + previousMonth);
      }
      
      // 3. 미승인 분개가 있는지 확인
      List<JournalEntry> unapprovedEntries = journalEntryRepository
          .findUnapprovedEntriesInPeriod(companyId, 
              closingDate.withDayOfMonth(1), 
              closingDate.withDayOfMonth(closingDate.lengthOfMonth()));
      
      if (!unapprovedEntries.isEmpty()) {
          throw new ClosingException("미승인 분개가 " + unapprovedEntries.size() + "건 있습니다.");
      }
  }
  ```

- [ ] **GL 잔액 확정 로직**
  ```java
  private void finalizeGLBalances(String companyId, LocalDate closingDate) {
      Integer fiscalYear = closingDate.getYear();
      Integer fiscalMonth = closingDate.getMonthValue();
      
      List<GeneralLedger> glAccounts = generalLedgerRepository
          .findByCompanyIdAndFiscalYearAndFiscalMonth(companyId, fiscalYear, fiscalMonth);
      
      for (GeneralLedger glAccount : glAccounts) {
          // 최종 잔액 계산 및 확정
          glAccount.calculateFinalBalance();
          glAccount.setIsClosed(true);
          glAccount.setUpdatedAt(LocalDateTime.now());
      }
      
      generalLedgerRepository.saveAll(glAccounts);
      log.info("GL 잔액 확정 완료: {} 개 계정", glAccounts.size());
  }
  ```

#### 🔄 5.3 마감 취소 기능
- [ ] **마감 취소 로직**
  ```java
  public ClosingReversalResult reverseClosing(
      String companyId, 
      LocalDate closingDate, 
      String reversalReason
  ) {
      log.info("마감 취소 시작: companyId={}, closingDate={}", companyId, closingDate);
      
      try {
          // 1. 마감 취소 가능 여부 확인
          validateReversalConditions(companyId, closingDate);
          
          // 2. GL 계정 마감 상태 해제
          releaseGLClosingStatus(companyId, closingDate);
          
          // 3. 다음 달 초기 잔액 재계산
          recalculateNextMonthBeginningBalance(companyId, closingDate.plusMonths(1));
          
          // 4. 마감 상태 업데이트
          ClosingPeriod closingPeriod = updateClosingStatus(
              companyId, closingDate, ClosingStatus.REVERSED, reversalReason);
          
          log.info("마감 취소 완료: companyId={}, closingDate={}", companyId, closingDate);
          
          return ClosingReversalResult.builder()
              .success(true)
              .message("마감이 성공적으로 취소되었습니다.")
              .reversedPeriod(closingPeriod)
              .build();
              
      } catch (Exception e) {
          log.error("마감 취소 실패: companyId={}, closingDate={}", companyId, closingDate, e);
          
          return ClosingReversalResult.builder()
              .success(false) 
              .message("마감 취소 실패: " + e.getMessage())
              .build();
      }
  }
  
  private void validateReversalConditions(String companyId, LocalDate closingDate) {
      // 1. 다음 달이 마감되지 않았는지 확인
      LocalDate nextMonth = closingDate.plusMonths(1);
      Optional<ClosingPeriod> nextMonthClosure = closingPeriodsRepository
          .findByCompanyIdAndPeriodTypeAndFiscalYearAndFiscalPeriod(
              companyId, PeriodType.MONTHLY, nextMonth.getYear(), nextMonth.getMonthValue());
      
      if (nextMonthClosure.isPresent() && nextMonthClosure.get().getStatus() == ClosingStatus.CLOSED) {
          throw new ClosingReversalException("다음 달이 이미 마감되어 취소할 수 없습니다.");
      }
      
      // 2. 결산 정리 분개가 생성되지 않았는지 확인 (연말인 경우)
      if (closingDate.getMonthValue() == 12) {
          List<JournalEntry> closingEntries = journalEntryRepository
              .findClosingEntriesByCompanyAndYear(companyId, closingDate.getYear());
              
          if (!closingEntries.isEmpty()) {
              throw new ClosingReversalException("결산 정리 분개가 있어 취소할 수 없습니다.");
          }
      }
  }
  ```

#### 🧪 5.4 마감 시스템 테스트
- [ ] **ClosingProcessManagerTest.java**
  ```java
  @SpringBootTest
  @Transactional
  public class ClosingProcessManagerTest {
      
      @Autowired
      private ClosingProcessManager closingManager;
      
      @Autowired
      private TestDataCreator testDataCreator;
      
      @Test
      public void testSuccessfulMonthlyClosing() {
          // Given: 테스트 데이터 준비
          String companyId = "test-company";
          LocalDate closingDate = LocalDate.of(2025, 7, 31);
          
          // 전월 마감 완료 상태 생성
          testDataCreator.createClosedPeriod(companyId, LocalDate.of(2025, 6, 30));
          
          // 당월 분개 및 GL 데이터 생성
          testDataCreator.createSampleTransactionsAndGL(companyId, 
              LocalDate.of(2025, 7, 1), LocalDate.of(2025, 7, 31));
          
          // When: 월차 마감 실행
          ClosingResult result = closingManager.executeMonthlyClosing(companyId, closingDate);
          
          // Then: 결과 검증
          assertThat(result.isSuccess()).isTrue();
          assertThat(result.getClosingPeriod().getStatus()).isEqualTo(ClosingStatus.CLOSED);
          assertThat(result.getTrialBalance().getIsBalanced()).isTrue();
          
          // GL 계정 마감 상태 확인
          List<GeneralLedger> glAccounts = findGLAccounts(companyId, 2025, 7);
          assertThat(glAccounts).allMatch(gl -> gl.getIsClosed());
      }
      
      @Test
      public void testClosingValidationFailure() {
          // Given: 전월 미마감 상태
          String companyId = "test-company";
          LocalDate closingDate = LocalDate.of(2025, 7, 31);
          
          // When: 마감 시도
          ClosingResult result = closingManager.executeMonthlyClosing(companyId, closingDate);
          
          // Then: 실패 확인
          assertThat(result.isSuccess()).isFalse();
          assertThat(result.getMessage()).contains("전월이 마감되지 않았습니다");
      }
      
      @Test
      public void testClosingReversal() {
          // Given: 마감 완료된 상태
          String companyId = "test-company";
          LocalDate closingDate = LocalDate.of(2025, 7, 31);
          
          testDataCreator.createClosedPeriod(companyId, closingDate);
          
          // When: 마감 취소
          ClosingReversalResult result = closingManager.reverseClosing(
              companyId, closingDate, "데이터 수정 필요");
          
          // Then: 취소 성공 확인
          assertThat(result.isSuccess()).isTrue();
          assertThat(result.getReversedPeriod().getStatus()).isEqualTo(ClosingStatus.REVERSED);
          
          // GL 계정 마감 해제 확인
          List<GeneralLedger> glAccounts = findGLAccounts(companyId, 2025, 7);
          assertThat(glAccounts).allMatch(gl -> !gl.getIsClosed());
      }
  }
  ```

### Week 6: 결산 처리

#### 🏗️ 6.1 결산 정리 분개 생성 시스템
- [ ] **ClosingJournalEntryGenerator.java 구현**
  ```java
  @Service
  public class ClosingJournalEntryGenerator {
      
      @Autowired
      private GeneralLedgerManager glManager;
      
      @Autowired  
      private AccountingEngine accountingEngine;
      
      // 손익 계정 정리 (당기순이익 이월)
      public JournalEntry generateProfitLossClosingEntry(String companyId, LocalDate closingDate) {
          log.info("손익계정 정리분개 생성 시작: companyId={}, closingDate={}", companyId, closingDate);
          
          // 1. 수익 계정 잔액 조회 (4000번대)
          List<GLBalance> revenueBalances = getAccountBalancesByType(
              companyId, closingDate, "수익");
          
          // 2. 비용 계정 잔액 조회 (5000번대)
          List<GLBalance> expenseBalances = getAccountBalancesByType(
              companyId, closingDate, "비용");
          
          // 3. 당기순이익 계산
          BigDecimal totalRevenue = revenueBalances.stream()
              .map(GLBalance::getEndingCreditBalance)
              .reduce(BigDecimal.ZERO, BigDecimal::add);
              
          BigDecimal totalExpenses = expenseBalances.stream()
              .map(GLBalance::getEndingDebitBalance)
              .reduce(BigDecimal.ZERO, BigDecimal::add);
              
          BigDecimal netIncome = totalRevenue.subtract(totalExpenses);
          
          log.info("당기순이익 계산: 총수익={}, 총비용={}, 순이익={}", 
                   totalRevenue, totalExpenses, netIncome);
          
          // 4. 정리 분개 생성
          JournalEntry closingEntry = JournalEntry.builder()
              .companyId(companyId)
              .entryDate(closingDate)
              .description("손익계정 정리분개 (당기순이익 이월)")
              .referenceType("CLOSING_ENTRY")
              .referenceId(null)
              .status(JournalEntryStatus.CONFIRMED)
              .createdBy("CLOSING_SYSTEM")
              .build();
          
          List<JournalEntryDetail> details = new ArrayList<>();
          Integer lineNumber = 1;
          
          // 수익 계정 정리 (차변 처리)
          for (GLBalance revenueBalance : revenueBalances) {
              if (revenueBalance.getEndingCreditBalance().compareTo(BigDecimal.ZERO) > 0) {
                  details.add(JournalEntryDetail.builder()
                      .lineNumber(lineNumber++)
                      .accountCode(revenueBalance.getAccountCode())
                      .debitAmount(revenueBalance.getEndingCreditBalance())
                      .creditAmount(BigDecimal.ZERO)
                      .description(revenueBalance.getAccountName() + " 정리")
                      .build());
              }
          }
          
          // 비용 계정 정리 (대변 처리)
          for (GLBalance expenseBalance : expenseBalances) {
              if (expenseBalance.getEndingDebitBalance().compareTo(BigDecimal.ZERO) > 0) {
                  details.add(JournalEntryDetail.builder()
                      .lineNumber(lineNumber++)
                      .accountCode(expenseBalance.getAccountCode())
                      .debitAmount(BigDecimal.ZERO)
                      .creditAmount(expenseBalance.getEndingDebitBalance())
                      .description(expenseBalance.getAccountName() + " 정리")
                      .build());
              }
          }
          
          // 당기순이익 처리
          if (netIncome.compareTo(BigDecimal.ZERO) > 0) {
              // 이익인 경우: 차변에 당기순이익, 대변에 이익잉여금
              details.add(JournalEntryDetail.builder()
                  .lineNumber(lineNumber++)
                  .accountCode("3133") // 당기순이익
                  .debitAmount(netIncome)
                  .creditAmount(BigDecimal.ZERO)
                  .description("당기순이익")
                  .build());
                  
              details.add(JournalEntryDetail.builder()
                  .lineNumber(lineNumber++)
                  .accountCode("3131") // 이익잉여금
                  .debitAmount(BigDecimal.ZERO)
                  .creditAmount(netIncome)
                  .description("이익잉여금 이월")
                  .build());
          } else if (netIncome.compareTo(BigDecimal.ZERO) < 0) {
              // 손실인 경우: 차변에 이익잉여금, 대변에 당기순손실
              BigDecimal netLoss = netIncome.negate();
              
              details.add(JournalEntryDetail.builder()
                  .lineNumber(lineNumber++)
                  .accountCode("3131") // 이익잉여금
                  .debitAmount(netLoss)
                  .creditAmount(BigDecimal.ZERO)
                  .description("당기순손실 처리")
                  .build());
                  
              details.add(JournalEntryDetail.builder()
                  .lineNumber(lineNumber++)
                  .accountCode("3133") // 당기순이익(손실)
                  .debitAmount(BigDecimal.ZERO)
                  .creditAmount(netLoss)
                  .description("당기순손실")
                  .build());
          }
          
          closingEntry.setDetails(details);
          closingEntry.setTotalAmount(netIncome.abs());
          
          // 5. 분개 저장 및 GL 전기
          JournalEntry savedEntry = journalEntryRepository.save(closingEntry);
          glManager.postJournalEntryToGL(savedEntry.getId());
          
          log.info("손익계정 정리분개 생성 완료: journalEntryId={}", savedEntry.getId());
          
          return savedEntry;
      }
  }
  ```

#### 🔄 6.2 차기 이월 처리
- [ ] **차기 이월 로직 구현**
  ```java
  public void carryForwardToNextPeriod(String companyId, LocalDate closingDate) {
      LocalDate nextPeriodStart = closingDate.plusMonths(1).withDayOfMonth(1);
      Integer nextYear = nextPeriodStart.getYear();
      Integer nextMonth = nextPeriodStart.getMonthValue();
      
      log.info("차기 이월 처리 시작: {} → {}", closingDate, nextPeriodStart);
      
      // 1. 현재 기말 잔액이 있는 모든 GL 계정 조회
      List<GeneralLedger> currentPeriodGL = generalLedgerRepository
          .findByCompanyIdAndFiscalYearAndFiscalMonthAndHasBalance(
              companyId, closingDate.getYear(), closingDate.getMonthValue());
      
      for (GeneralLedger currentGL : currentPeriodGL) {
          ChartOfAccounts account = chartOfAccountsRepository
              .findByAccountCode(currentGL.getAccountCode()).orElse(null);
          
          if (account == null) continue;
          
          // 2. 차기 GL 계정 생성 또는 조회
          GeneralLedger nextPeriodGL = generalLedgerRepository
              .findByCompanyIdAndAccountCodeAndFiscalYearAndFiscalMonth(
                  companyId, currentGL.getAccountCode(), nextYear, nextMonth)
              .orElse(null);
          
          if (nextPeriodGL == null) {
              nextPeriodGL = GeneralLedger.builder()
                  .companyId(companyId)
                  .accountCode(currentGL.getAccountCode())
                  .fiscalYear(nextYear)
                  .fiscalMonth(nextMonth)
                  .periodDebitAmount(BigDecimal.ZERO)
                  .periodCreditAmount(BigDecimal.ZERO)
                  .endingDebitBalance(BigDecimal.ZERO)
                  .endingCreditBalance(BigDecimal.ZERO)
                  .isClosed(false)
                  .build();
          }
          
          // 3. 계정 유형에 따른 이월 처리
          if (isBalanceSheetAccount(account.getAccountType())) {
              // 대차대조표 계정: 기말잔액을 차기 기초잔액으로 이월
              nextPeriodGL.setBeginningDebitBalance(currentGL.getEndingDebitBalance());
              nextPeriodGL.setBeginningCreditBalance(currentGL.getEndingCreditBalance());
              nextPeriodGL.setEndingDebitBalance(currentGL.getEndingDebitBalance());
              nextPeriodGL.setEndingCreditBalance(currentGL.getEndingCreditBalance());
              
              log.debug("대차대조표 계정 이월: {} - 차변:{}, 대변:{}", 
                        currentGL.getAccountCode(),
                        currentGL.getEndingDebitBalance(),
                        currentGL.getEndingCreditBalance());
          } else {
              // 손익계산서 계정: 영잔액으로 이월 (정리분개로 이미 정리됨)
              nextPeriodGL.setBeginningDebitBalance(BigDecimal.ZERO);
              nextPeriodGL.setBeginningCreditBalance(BigDecimal.ZERO);
              nextPeriodGL.setEndingDebitBalance(BigDecimal.ZERO);
              nextPeriodGL.setEndingCreditBalance(BigDecimal.ZERO);
              
              log.debug("손익계산서 계정 이월: {} - 영잔액으로 이월", currentGL.getAccountCode());
          }
          
          generalLedgerRepository.save(nextPeriodGL);
      }
      
      log.info("차기 이월 처리 완료: {} 개 계정 이월", currentPeriodGL.size());
  }
  
  private boolean isBalanceSheetAccount(String accountType) {
      return Arrays.asList("자산", "부채", "자본").contains(accountType);
  }
  ```

#### 📊 6.3 연말 결산 특별 처리
- [ ] **연말 결산 프로세스**
  ```java
  public YearEndClosingResult executeYearEndClosing(String companyId, Integer fiscalYear) {
      log.info("연말 결산 시작: companyId={}, fiscalYear={}", companyId, fiscalYear);
      
      try {
          // 1. 12월 마감 확인
          validateDecemberClosed(companyId, fiscalYear);
          
          // 2. 결산 정리 분개 생성
          List<JournalEntry> closingEntries = generateYearEndClosingEntries(companyId, fiscalYear);
          
          // 3. 감가상각 계산 및 분개
          JournalEntry depreciationEntry = generateDepreciationEntry(companyId, fiscalYear);
          closingEntries.add(depreciationEntry);
          
          // 4. 법인세 추정 계산 및 분개
          JournalEntry taxEntry = generateTaxEntry(companyId, fiscalYear);
          closingEntries.add(taxEntry);
          
          // 5. 이익잉여금 이월
          JournalEntry retainedEarningsEntry = generateRetainedEarningsEntry(companyId, fiscalYear);
          closingEntries.add(retainedEarningsEntry);
          
          // 6. 모든 정리분개 GL 전기
          for (JournalEntry entry : closingEntries) {
              glManager.postJournalEntryToGL(entry.getId());
          }
          
          // 7. 연말 마감 상태 업데이트
          ClosingPeriod yearEndClosure = createYearEndClosingPeriod(companyId, fiscalYear);
          
          // 8. 차기 연도 초기화
          initializeNextFiscalYear(companyId, fiscalYear + 1);
          
          return YearEndClosingResult.builder()
              .success(true)
              .fiscalYear(fiscalYear)
              .closingEntries(closingEntries)
              .yearEndClosure(yearEndClosure)
              .message("연말 결산이 성공적으로 완료되었습니다.")
              .build();
              
      } catch (Exception e) {
          log.error("연말 결산 실패: companyId={}, fiscalYear={}", companyId, fiscalYear, e);
          
          return YearEndClosingResult.builder()
              .success(false)
              .fiscalYear(fiscalYear)
              .message("연말 결산 실패: " + e.getMessage())
              .build();
      }
  }
  ```

#### 🧪 6.4 결산 처리 테스트
- [ ] **ClosingJournalEntryGeneratorTest.java**
  ```java
  @SpringBootTest
  @Transactional  
  public class ClosingJournalEntryGeneratorTest {
      
      @Test
      public void testProfitLossClosingEntry() {
          // Given: 손익 계정 잔액 준비
          String companyId = "test-company";
          LocalDate closingDate = LocalDate.of(2025, 12, 31);
          
          // 수익 계정 (매출 100만원)
          createGLBalance(companyId, "4111", closingDate, BigDecimal.ZERO, BigDecimal.valueOf(1000000));
          
          // 비용 계정 (비용 60만원)
          createGLBalance(companyId, "5130", closingDate, BigDecimal.valueOf(600000), BigDecimal.ZERO);
          
          // When: 손익 정리분개 생성
          JournalEntry closingEntry = closingGenerator.generateProfitLossClosingEntry(
              companyId, closingDate);
          
          // Then: 분개 검증
          assertThat(closingEntry.getDetails()).hasSize(4); // 매출정리, 비용정리, 당기순이익, 이익잉여금
          
          // 차변 = 대변 균형 확인
          BigDecimal totalDebit = closingEntry.getDetails().stream()
              .map(JournalEntryDetail::getDebitAmount)
              .reduce(BigDecimal.ZERO, BigDecimal::add);
          BigDecimal totalCredit = closingEntry.getDetails().stream()
              .map(JournalEntryDetail::getCreditAmount)
              .reduce(BigDecimal.ZERO, BigDecimal::add);
          
          assertThat(totalDebit).isEqualTo(totalCredit);
          assertThat(totalDebit).isEqualTo(BigDecimal.valueOf(1600000)); // 100만 + 60만
          
          // 당기순이익 40만원 확인
          JournalEntryDetail netIncomeDetail = closingEntry.getDetails().stream()
              .filter(d -> "3133".equals(d.getAccountCode()))
              .findFirst().orElse(null);
          
          assertThat(netIncomeDetail).isNotNull();
          assertThat(netIncomeDetail.getDebitAmount()).isEqualTo(BigDecimal.valueOf(400000));
      }
      
      @Test
      public void testCarryForwardToNextPeriod() {
          // Given: 기말 잔액이 있는 GL 계정들
          String companyId = "test-company";
          LocalDate closingDate = LocalDate.of(2025, 12, 31);
          
          // 자산 계정 (보통예금 500만원)
          createGLBalance(companyId, "1112", closingDate, BigDecimal.valueOf(5000000), BigDecimal.ZERO);
          
          // 부채 계정 (미지급금 100만원)
          createGLBalance(companyId, "2113", closingDate, BigDecimal.ZERO, BigDecimal.valueOf(1000000));
          
          // When: 차기 이월 처리
          closingGenerator.carryForwardToNextPeriod(companyId, closingDate);
          
          // Then: 차기 기초잔액 확인
          GeneralLedger nextYearCash = findGLAccount(companyId, "1112", 2026, 1);
          GeneralLedger nextYearPayable = findGLAccount(companyId, "2113", 2026, 1);
          
          assertThat(nextYearCash.getBeginningDebitBalance())
              .isEqualTo(BigDecimal.valueOf(5000000));
          assertThat(nextYearPayable.getBeginningCreditBalance())
              .isEqualTo(BigDecimal.valueOf(1000000));
      }
  }
  ```

---

## 🎯 Phase 4: 고급 기능 및 완성 (Week 7-8)

### Week 7: 감사 추적 시스템

#### 🗄️ 7.1 감사 추적 테이블 생성
- [ ] **audit_trail 테이블 생성**
  ```sql
  CREATE TABLE audit_trail (
      id BIGSERIAL PRIMARY KEY,
      entity_type VARCHAR(50) NOT NULL, -- JOURNAL_ENTRY, GL_ACCOUNT, CHART_OF_ACCOUNTS, etc.
      entity_id BIGINT NOT NULL,        -- 관련 엔티티의 ID
      action_type VARCHAR(20) NOT NULL, -- CREATE, UPDATE, DELETE, APPROVE, REVERSE
      old_values JSONB,                 -- 변경 전 값들
      new_values JSONB,                 -- 변경 후 값들
      changed_fields TEXT[],            -- 변경된 필드명 배열
      changed_by UUID,                  -- 변경한 사용자 ID
      changed_at TIMESTAMPTZ DEFAULT NOW(),
      ip_address INET,                  -- 클라이언트 IP
      user_agent TEXT,                  -- 브라우저 정보
      session_id VARCHAR(100),          -- 세션 ID
      reason TEXT,                      -- 변경 사유
      approval_required BOOLEAN DEFAULT FALSE, -- 승인 필요 여부
      approved_by UUID,                 -- 승인자 ID
      approved_at TIMESTAMPTZ,          -- 승인 일시
      rejection_reason TEXT,            -- 거부 사유
      created_at TIMESTAMPTZ DEFAULT NOW()
  );
  
  -- 인덱스 생성
  CREATE INDEX idx_audit_trail_entity ON audit_trail(entity_type, entity_id);
  CREATE INDEX idx_audit_trail_changed_by ON audit_trail(changed_by);
  CREATE INDEX idx_audit_trail_changed_at ON audit_trail(changed_at);
  CREATE INDEX idx_audit_trail_action_type ON audit_trail(action_type);
  ```

#### 🏗️ 7.2 AuditTrailService.java 구현
- [ ] **기본 클래스 구조**
  ```java
  @Service
  public class AuditTrailService {
      
      @Autowired
      private AuditTrailRepository auditTrailRepository;
      
      @Autowired
      private ObjectMapper objectMapper;
      
      // 변경 이력 기록
      public void recordChange(AuditChangeEvent event) {
          try {
              AuditTrail audit = AuditTrail.builder()
                  .entityType(event.getEntityType())
                  .entityId(event.getEntityId())
                  .actionType(event.getActionType())
                  .oldValues(convertToJsonb(event.getOldValues()))
                  .newValues(convertToJsonb(event.getNewValues()))
                  .changedFields(calculateChangedFields(event.getOldValues(), event.getNewValues()))
                  .changedBy(event.getUserId())
                  .ipAddress(event.getIpAddress())
                  .userAgent(event.getUserAgent())
                  .sessionId(event.getSessionId())
                  .reason(event.getReason())
                  .approvalRequired(determineApprovalRequired(event))
                  .build();
                  
              auditTrailRepository.save(audit);
              
              log.info("감사 이력 기록: entityType={}, entityId={}, action={}, user={}", 
                       event.getEntityType(), event.getEntityId(), 
                       event.getActionType(), event.getUserId());
                       
          } catch (Exception e) {
              log.error("감사 이력 기록 실패", e);
              // 감사 이력 기록 실패는 시스템을 중단시키지 않음
          }
      }
      
      // 감사 로그 조회
      public List<AuditTrail> getAuditHistory(String entityType, Long entityId) {
          return auditTrailRepository
              .findByEntityTypeAndEntityIdOrderByChangedAtDesc(entityType, entityId);
      }
      
      // 사용자별 활동 이력 조회
      public List<AuditTrail> getUserActivity(UUID userId, LocalDateTime from, LocalDateTime to) {
          return auditTrailRepository
              .findByChangedByAndChangedAtBetweenOrderByChangedAtDesc(userId, from, to);
      }
      
      // 승인이 필요한 변경 사항 조회
      public List<AuditTrail> getPendingApprovals() {
          return auditTrailRepository
              .findByApprovalRequiredTrueAndApprovedByIsNullOrderByChangedAtAsc();
      }
      
      private JSONB convertToJsonb(Object object) {
          try {
              if (object == null) return null;
              String json = objectMapper.writeValueAsString(object);
              return JSONB.valueOf(json);
          } catch (Exception e) {
              log.warn("JSONB 변환 실패", e);
              return null;
          }
      }
      
      private String[] calculateChangedFields(Object oldValues, Object newValues) {
          // 변경된 필드 계산 로직 구현
          Set<String> changedFields = new HashSet<>();
          
          if (oldValues != null && newValues != null) {
              try {
                  Map<String, Object> oldMap = objectMapper.convertValue(oldValues, Map.class);
                  Map<String, Object> newMap = objectMapper.convertValue(newValues, Map.class);
                  
                  Set<String> allKeys = new HashSet<>();
                  allKeys.addAll(oldMap.keySet());
                  allKeys.addAll(newMap.keySet());
                  
                  for (String key : allKeys) {
                      Object oldValue = oldMap.get(key);
                      Object newValue = newMap.get(key);
                      
                      if (!Objects.equals(oldValue, newValue)) {
                          changedFields.add(key);
                      }
                  }
              } catch (Exception e) {
                  log.warn("변경 필드 계산 실패", e);
              }
          }
          
          return changedFields.toArray(new String[0]);
      }
      
      private boolean determineApprovalRequired(AuditChangeEvent event) {
          // 승인이 필요한 변경 사항 판단 로직
          switch (event.getEntityType()) {
              case "JOURNAL_ENTRY":
                  // 분개 수정/삭제는 승인 필요
                  return Arrays.asList("UPDATE", "DELETE").contains(event.getActionType());
                  
              case "CHART_OF_ACCOUNTS":
                  // 계정과목 변경은 승인 필요
                  return true;
                  
              case "CLOSING_PERIOD":
                  // 마감 취소는 승인 필요
                  return "REVERSE".equals(event.getActionType());
                  
              default:
                  return false;
          }
      }
  }
  ```

#### 🔍 7.3 변경 추적 인터셉터 구현
- [ ] **JPA Audit 인터셉터**
  ```java
  @Component
  public class AuditTrailInterceptor {
      
      @Autowired
      private AuditTrailService auditTrailService;
      
      @EventListener
      public void handleJournalEntryChange(JournalEntryChangeEvent event) {
          AuditChangeEvent auditEvent = AuditChangeEvent.builder()
              .entityType("JOURNAL_ENTRY")
              .entityId(event.getJournalEntry().getId())
              .actionType(event.getActionType())
              .oldValues(event.getOldValues())
              .newValues(event.getNewValues())
              .userId(event.getUserId())
              .ipAddress(event.getIpAddress())
              .userAgent(event.getUserAgent())
              .sessionId(event.getSessionId())
              .reason(event.getReason())
              .build();
              
          auditTrailService.recordChange(auditEvent);
      }
      
      @EventListener
      public void handleGLAccountChange(GLAccountChangeEvent event) {
          AuditChangeEvent auditEvent = AuditChangeEvent.builder()
              .entityType("GL_ACCOUNT")
              .entityId(event.getGeneralLedger().getId())
              .actionType(event.getActionType())
              .oldValues(event.getOldValues())
              .newValues(event.getNewValues())
              .userId(event.getUserId())
              .reason(event.getReason())
              .build();
              
          auditTrailService.recordChange(auditEvent);
      }
  }
  ```

#### 🛡️ 7.4 승인 워크플로 구현
- [ ] **ApprovalWorkflowService.java**
  ```java
  @Service
  public class ApprovalWorkflowService {
      
      @Autowired
      private AuditTrailService auditTrailService;
      
      @Autowired
      private NotificationService notificationService;
      
      // 승인 요청 제출
      public ApprovalRequest submitForApproval(
          String entityType, 
          Long entityId,
          String changeReason,
          UUID requestedBy
      ) {
          // 1. 승인 요청 생성
          ApprovalRequest request = ApprovalRequest.builder()
              .entityType(entityType)
              .entityId(entityId)
              .changeReason(changeReason)
              .requestedBy(requestedBy)
              .status(ApprovalStatus.PENDING)
              .requestedAt(LocalDateTime.now())
              .build();
              
          ApprovalRequest savedRequest = approvalRequestRepository.save(request);
          
          // 2. 승인자에게 알림 발송
          List<UUID> approvers = getApproversForEntityType(entityType);
          for (UUID approverId : approvers) {
              notificationService.sendApprovalNotification(approverId, savedRequest);
          }
          
          log.info("승인 요청 제출: entityType={}, entityId={}, requestId={}", 
                   entityType, entityId, savedRequest.getId());
          
          return savedRequest;
      }
      
      // 승인 처리
      public ApprovalResult processApproval(
          Long requestId,
          ApprovalDecision decision,
          String comments,
          UUID approverId
      ) {
          ApprovalRequest request = approvalRequestRepository.findById(requestId)
              .orElseThrow(() -> new NotFoundException("승인 요청을 찾을 수 없습니다: " + requestId));
          
          if (request.getStatus() != ApprovalStatus.PENDING) {
              throw new IllegalStateException("이미 처리된 승인 요청입니다: " + request.getStatus());
          }
          
          // 승인 결과 업데이트
          request.setStatus(decision == ApprovalDecision.APPROVE ? 
                           ApprovalStatus.APPROVED : ApprovalStatus.REJECTED);
          request.setApprovedBy(approverId);
          request.setApprovedAt(LocalDateTime.now());
          request.setApprovalComments(comments);
          
          approvalRequestRepository.save(request);
          
          // 감사 이력에 승인 결과 기록
          AuditTrail auditTrail = auditTrailService.findPendingAuditTrail(
              request.getEntityType(), request.getEntityId());
              
          if (auditTrail != null) {
              auditTrail.setApprovedBy(approverId);
              auditTrail.setApprovedAt(LocalDateTime.now());
              if (decision == ApprovalDecision.REJECT) {
                  auditTrail.setRejectionReason(comments);
              }
              auditTrailRepository.save(auditTrail);
          }
          
          // 요청자에게 결과 알림
          notificationService.sendApprovalResultNotification(
              request.getRequestedBy(), request, decision, comments);
          
          log.info("승인 처리 완료: requestId={}, decision={}, approver={}", 
                   requestId, decision, approverId);
          
          return ApprovalResult.builder()
              .request(request)
              .decision(decision)
              .processedBy(approverId)
              .build();
      }
  }
  ```

#### 🧪 7.5 감사 추적 테스트
- [ ] **AuditTrailServiceTest.java**
  ```java
  @SpringBootTest
  @Transactional
  public class AuditTrailServiceTest {
      
      @Test
      public void testRecordJournalEntryChange() {
          // Given: 분개 변경 이벤트
          JournalEntry oldEntry = createSampleJournalEntry();
          JournalEntry newEntry = createModifiedJournalEntry(oldEntry);
          
          AuditChangeEvent event = AuditChangeEvent.builder()
              .entityType("JOURNAL_ENTRY")
              .entityId(oldEntry.getId())
              .actionType("UPDATE")
              .oldValues(oldEntry)
              .newValues(newEntry)
              .userId(UUID.randomUUID())
              .reason("금액 수정")
              .build();
          
          // When: 감사 이력 기록
          auditTrailService.recordChange(event);
          
          // Then: 이력 조회 및 검증  
          List<AuditTrail> history = auditTrailService.getAuditHistory(
              "JOURNAL_ENTRY", oldEntry.getId());
              
          assertThat(history).hasSize(1);
          
          AuditTrail audit = history.get(0);
          assertThat(audit.getActionType()).isEqualTo("UPDATE");
          assertThat(audit.getChangedFields()).contains("totalAmount");
          assertThat(audit.getReason()).isEqualTo("금액 수정");
      }
      
      @Test
      public void testApprovalWorkflow() {
          // Given: 승인이 필요한 변경 사항
          Long journalEntryId = 123L;
          UUID requesterId = UUID.randomUUID();
          UUID approverId = UUID.randomUUID();
          
          // When: 승인 요청 제출
          ApprovalRequest request = approvalWorkflowService.submitForApproval(
              "JOURNAL_ENTRY", journalEntryId, "중요한 수정", requesterId);
          
          // Then: 승인 요청 생성 확인
          assertThat(request.getStatus()).isEqualTo(ApprovalStatus.PENDING);
          
          // When: 승인 처리
          ApprovalResult result = approvalWorkflowService.processApproval(
              request.getId(), ApprovalDecision.APPROVE, "승인합니다", approverId);
          
          // Then: 승인 완료 확인
          assertThat(result.getDecision()).isEqualTo(ApprovalDecision.APPROVE);
          assertThat(result.getRequest().getStatus()).isEqualTo(ApprovalStatus.APPROVED);
      }
  }
  ```

### Week 8: 시스템 완성 및 최적화

#### 🔧 8.1 전체 시스템 통합 테스트
- [ ] **통합 테스트 시나리오 작성**
  ```java
  @SpringBootTest
  @Transactional
  @TestMethodOrder(OrderAnnotation.class)
  public class FullSystemIntegrationTest {
      
      @Test
      @Order(1)
      public void testCompleteAccountingFlow() {
          // 1. 거래 생성 → 분개 생성 → GL 전기 → 재무제표 생성 전체 플로우 검증
          
          String companyId = "integration-test-company";
          LocalDate transactionDate = LocalDate.of(2025, 7, 1);
          
          // 거래 생성
          TransactionEntity transaction = createTestTransaction(
              companyId, "스타벅스 강남점 15000원", 15000, transactionDate);
          
          // 분개 자동 생성
          JournalEntry journalEntry = accountingEngine.processTransaction(
              TransactionToJournalRequest.builder()
                  .transactionId(transaction.getId())
                  .companyId(companyId)
                  .build()
          );
          
          // GL 자동 전기
          GLPostingResult postingResult = glManager.postJournalEntryToGL(journalEntry.getId());
          assertThat(postingResult.isSuccess()).isTrue();
          
          // 재무제표 생성
          IncomeStatement is = reportGenerator.generateIncomeStatement(
              companyId, transactionDate, transactionDate);
          
          // 결과 검증
          assertThat(is.getTotalExpenses()).isEqualTo(BigDecimal.valueOf(15000));
          assertThat(is.getNetIncome()).isEqualTo(BigDecimal.valueOf(-15000));
      }
      
      @Test
      @Order(2)
      public void testMonthlyClosingProcess() {
          // 2. 월차 마감 프로세스 전체 검증
          
          String companyId = "integration-test-company";
          LocalDate closingDate = LocalDate.of(2025, 7, 31);
          
          // 전월 마감 완료 설정
          createClosedPeriod(companyId, LocalDate.of(2025, 6, 30));
          
          // 월차 마감 실행
          ClosingResult result = closingManager.executeMonthlyClosing(companyId, closingDate);
          
          // 결과 검증
          assertThat(result.isSuccess()).isTrue();
          assertThat(result.getTrialBalance().getIsBalanced()).isTrue();
          
          // GL 계정 마감 상태 확인
          List<GeneralLedger> closedAccounts = findClosedGLAccounts(companyId, 2025, 7);
          assertThat(closedAccounts).allMatch(gl -> gl.getIsClosed());
      }
      
      @Test
      @Order(3)
      public void testYearEndClosingProcess() {
          // 3. 연말 결산 프로세스 검증
          
          String companyId = "integration-test-company";
          Integer fiscalYear = 2025;
          
          // 12월까지 모든 월 마감 완료 설정
          for (int month = 1; month <= 12; month++) {
              createClosedPeriod(companyId, LocalDate.of(fiscalYear, month, 
                  LocalDate.of(fiscalYear, month, 1).lengthOfMonth()));
          }
          
          // 연말 결산 실행
          YearEndClosingResult result = closingManager.executeYearEndClosing(companyId, fiscalYear);
          
          // 결과 검증
          assertThat(result.isSuccess()).isTrue();
          assertThat(result.getClosingEntries()).isNotEmpty();
          
          // 차기 연도 초기화 확인
          List<GeneralLedger> nextYearAccounts = findGLAccounts(companyId, fiscalYear + 1, 1);
          assertThat(nextYearAccounts).isNotEmpty();
      }
      
      @Test
      @Order(4)
      public void testAuditTrailAndApproval() {
          // 4. 감사 추적 및 승인 프로세스 검증
          
          // 분개 수정 시도
          JournalEntry entry = findExistingJournalEntry();
          JournalEntry modifiedEntry = modifyJournalEntry(entry);
          
          // 승인 요청 제출
          ApprovalRequest request = approvalWorkflowService.submitForApproval(
              "JOURNAL_ENTRY", entry.getId(), "금액 수정 필요", getCurrentUserId());
          
          // 승인 처리
          ApprovalResult result = approvalWorkflowService.processApproval(
              request.getId(), ApprovalDecision.APPROVE, "승인", getApproverUserId());
          
          // 감사 이력 확인
          List<AuditTrail> auditHistory = auditTrailService.getAuditHistory(
              "JOURNAL_ENTRY", entry.getId());
              
          assertThat(auditHistory).isNotEmpty();
          assertThat(result.getDecision()).isEqualTo(ApprovalDecision.APPROVE);
      }
  }
  ```

#### ⚡ 8.2 성능 최적화
- [ ] **데이터베이스 쿼리 최적화**
  ```sql
  -- 자주 사용되는 쿼리의 인덱스 추가
  
  -- 시산표 생성용 인덱스
  CREATE INDEX idx_general_ledger_company_fiscal_period_balance 
  ON general_ledger(company_id, fiscal_year, fiscal_month) 
  WHERE (ending_debit_balance > 0 OR ending_credit_balance > 0);
  
  -- GL 상세 조회용 인덱스
  CREATE INDEX idx_gl_details_account_date 
  ON gl_details(general_ledger_id, posting_date);
  
  -- 감사 추적용 인덱스
  CREATE INDEX idx_audit_trail_entity_action_date 
  ON audit_trail(entity_type, entity_id, action_type, changed_at);
  
  -- 분개 조회용 복합 인덱스
  CREATE INDEX idx_journal_entries_company_date_status 
  ON journal_entries(company_id, entry_date, status) 
  WHERE status IN ('CONFIRMED', 'POSTED');
  ```

- [ ] **캐시 전략 구현**
  ```java
  @Service
  public class AccountingCacheService {
      
      @Cacheable(value = "trialBalance", key = "#companyId + '_' + #asOfDate")
      public TrialBalance getCachedTrialBalance(String companyId, LocalDate asOfDate) {
          return glManager.generateTrialBalance(companyId, asOfDate);
      }
      
      @Cacheable(value = "chartOfAccounts", key = "#companyId")
      public List<ChartOfAccounts> getCachedChartOfAccounts(String companyId) {
          return chartOfAccountsRepository.findActiveAccountsByCompanyId(companyId);
      }
      
      @CacheEvict(value = {"trialBalance", "financialStatements"}, 
                  key = "#companyId", condition = "#result.success")
      public GLPostingResult postWithCacheEviction(String companyId, Long journalEntryId) {
          return glManager.postJournalEntryToGL(journalEntryId);
      }
  }
  ```

#### 🎨 8.3 UI/UX 개선
- [ ] **Admin Dashboard 컴포넌트 추가**
  ```typescript
  // components/accounting/GeneralLedgerManagement.tsx
  export const GeneralLedgerManagement: React.FC = () => {
    const [selectedAccount, setSelectedAccount] = useState<string>('');
    const [fiscalPeriod, setFiscalPeriod] = useState<FiscalPeriod>({
      year: new Date().getFullYear(),
      month: new Date().getMonth() + 1
    });
    
    const { data: trialBalance, isLoading } = useQuery({
      queryKey: ['trialBalance', fiscalPeriod],
      queryFn: () => fetchTrialBalance(fiscalPeriod),
    });
    
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">총계정원장 관리</h1>
          <Button onClick={() => setShowClosingDialog(true)}>
            월차 마감
          </Button>
        </div>
        
        <FiscalPeriodSelector 
          value={fiscalPeriod} 
          onChange={setFiscalPeriod} 
        />
        
        <TrialBalanceTable 
          data={trialBalance} 
          isLoading={isLoading}
          onAccountSelect={setSelectedAccount}
        />
        
        {selectedAccount && (
          <AccountLedgerDetail 
            accountCode={selectedAccount}
            fiscalPeriod={fiscalPeriod}
          />
        )}
        
        <MonthlyClosingDialog 
          open={showClosingDialog}
          onClose={() => setShowClosingDialog(false)}
          fiscalPeriod={fiscalPeriod}
        />
      </div>
    );
  };
  ```

- [ ] **재무제표 출력 컴포넌트**
  ```typescript
  // components/accounting/AdvancedFinancialStatements.tsx
  export const AdvancedFinancialStatements: React.FC = () => {
    const [reportType, setReportType] = useState<'IS' | 'BS'>('IS');
    const [comparisonPeriods, setComparisonPeriods] = useState<number[]>([]);
    
    const generateReport = useCallback(async () => {
      if (reportType === 'IS') {
        const comparison = await fetchMonthlyISComparison(comparisonPeriods);
        setReportData(comparison);
      } else {
        const balanceSheet = await fetchHierarchicalBS();
        setReportData(balanceSheet);
      }
    }, [reportType, comparisonPeriods]);
    
    return (
      <div className="space-y-6">
        <ReportTypeSelector value={reportType} onChange={setReportType} />
        
        <PeriodSelector 
          multiple={reportType === 'IS'}
          value={comparisonPeriods}
          onChange={setComparisonPeriods}
        />
        
        <Button onClick={generateReport} className="w-full">
          재무제표 생성
        </Button>
        
        {reportData && (
          <div className="space-y-4">
            <div className="flex justify-end space-x-2">
              <Button onClick={() => exportToExcel(reportData)}>
                Excel 다운로드
              </Button>
              <Button onClick={() => exportToPDF(reportData)}>
                PDF 다운로드
              </Button>
            </div>
            
            <FinancialStatementViewer data={reportData} type={reportType} />
          </div>
        )}
      </div>
    );
  };
  ```

#### 📚 8.4 문서화 완성
- [ ] **API 문서 자동 생성**
  ```java
  // Swagger/OpenAPI 설정
  @OpenAPIDefinition(
      info = @Info(
          title = "MoneyShift Accounting API",
          version = "2.0",
          description = "고급 복식부기 시스템 API"
      )
  )
  @SecurityScheme(
      name = "bearerAuth",
      type = SecuritySchemeType.HTTP,
      scheme = "bearer",
      bearerFormat = "JWT"
  )
  public class OpenApiConfig {
      
      @Bean
      public GroupedOpenApi accountingApi() {
          return GroupedOpenApi.builder()
              .group("accounting")
              .pathsToMatch("/api/v2/accounting/**")
              .build();
      }
  }
  ```

- [ ] **사용자 매뉴얼 작성**
  ```markdown
  # MoneyShift 고급 회계 시스템 사용 매뉴얼
  
  ## 1. 총계정원장 관리
  ### 1.1 시산표 조회
  - 경로: 회계관리 > 총계정원장 > 시산표
  - 기능: 월별 계정잔액 조회 및 균형 확인
  
  ### 1.2 계정별 원장 조회  
  - 경로: 총계정원장 > 계정 선택
  - 기능: 특정 계정의 거래 내역 및 잔액 변동 추이
  
  ## 2. 월차 마감
  ### 2.1 마감 실행
  - 조건: 전월 마감 완료, 미승인 분개 없음
  - 절차: 검증 → 잔액확정 → 차기이월
  
  ### 2.2 마감 취소
  - 조건: 다음달 미마감, 결산분개 없음
  - 승인: 관리자 승인 필요
  ```

---

## 📊 최종 검증 체크리스트

### 기능 완성도 체크
- [ ] **200개+ 계정과목** 정상 로드 및 분류
- [ ] **GL 전기 시스템** 100% 정확성 (차변=대변)
- [ ] **월별 비교 재무제표** 12개월 데이터 처리
- [ ] **마감 프로세스** 전체 플로우 완성
- [ ] **감사 추적** 모든 변경사항 기록
- [ ] **승인 워크플로** 정상 동작

### 성능 목표 달성
- [ ] **분개 생성**: 100ms 이하 유지
- [ ] **GL 전기**: 분개당 50ms 이하  
- [ ] **재무제표 생성**: 3초 이하
- [ ] **마감 프로세스**: 5분 이하

### 테스트 커버리지
- [ ] **단위 테스트**: 95% 이상
- [ ] **통합 테스트**: 주요 플로우 100% 커버
- [ ] **성능 테스트**: 대용량 데이터 검증
- [ ] **회계 정확성**: 수작업 대비 99.9% 일치

### 운영 준비도
- [ ] **모니터링**: 핵심 메트릭 수집
- [ ] **로깅**: 상세 추적 가능
- [ ] **백업**: 자동 백업 설정
- [ ] **문서화**: 사용자/개발자 매뉴얼 완성

---

## 🎯 완성 후 기대 효과

### 비즈니스 가치
- **경쟁사 수준** 전문 회계 기능 제공
- **자동화율 95%+** 달성으로 업무 효율성 극대화
- **실시간 재무제표** 생성으로 경영 의사결정 지원
- **감사 대응** 완벽한 추적 기능

### 기술적 성과
- **확장 가능한 아키텍처** 구축
- **고성능 GL 시스템** 구현
- **견고한 회계 검증** 로직
- **완전한 TDD** 기반 안정성

이 TodoList를 따라 체계적으로 진행하면 **8주 만에 현재 시스템을 MVP 수준을 넘어 경쟁사와 대등한 전문 회계 시스템으로 발전**시킬 수 있습니다.
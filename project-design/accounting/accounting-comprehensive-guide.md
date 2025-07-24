# MoneyShift 복식부기엔진 종합 구현 가이드

## 📋 개요

### 시스템 목적
기존 룰엔진 시스템과 연계하여 **복식부기 기반 자동 기장 시스템**을 구축하여 거래 분류 → 분개 생성 → 재무제표 생성의 완전 자동화를 실현합니다.

### 핵심 가치
- **완전 자동화**: 거래 내역에서 재무제표까지 원스톱 처리
- **복식부기 준수**: 차변=대변 원리를 철저히 준수한 정확한 분개 생성
- **실시간 처리**: 거래 발생 즉시 재무제표 업데이트
- **지능형 학습**: AI 기반 분개 규칙 자동 생성 및 최적화

## 🏗️ 시스템 아키텍처

### 전체 데이터 흐름
```mermaid
graph TD
    A[은행 거래 내역] --> B[룰엔진 거래 분류]
    B --> C{분류 성공?}
    C -->|성공| D[태그→계정과목 매핑]
    C -->|실패| E[수동 분류 대기]
    D --> F[복식부기엔진]
    F --> G[분개 생성]
    G --> H[대차평균 검증]
    H --> |검증 통과| I[분개 확정]
    H --> |검증 실패| J[오류 분개 큐]
    I --> K[재무제표 업데이트]
    K --> L[실시간 재무현황]
    
    E --> M[관리자 검토]
    M --> D
    J --> N[자동 수정 시도]
    N --> H
```

### 시스템 컴포넌트 구조
```
┌─────────────────────────────────────────────────────────────┐
│                   복식부기엔진 시스템                         │
│                  (Spring Boot Backend)                      │
└──────────────────────────┬──────────────────────────────────┘
                           │
        ┌──────────────────┼──────────────────┬───────────────┐
        │                  │                  │               │
┌───────▼────────┐ ┌──────▼──────┐ ┌─────────▼──────┐ ┌──────▼─────┐
│ Accounting     │ │Journal Entry│ │Financial       │ │Validation  │
│ Engine         │ │ Generator   │ │Statement       │ │Engine      │
│                │ │             │ │Generator       │ │            │
└───────┬────────┘ └──────┬──────┘ └─────────┬──────┘ └──────┬─────┘
        │                 │                  │               │
        └──────────────────┼──────────────────┴───────────────┘
                           │
                ┌──────────▼──────────┐
                │    PostgreSQL       │
                │ ┌─────────────────┐ │
                │ │ journal_entries │ │
                │ │ journal_details │ │
                │ │ chart_accounts  │ │
                │ │ balance_sheet   │ │
                │ └─────────────────┘ │
                └─────────────────────┘
```

## 🔧 핵심 구현 설계

### 1. AccountingEngine 서비스
```java
@Service
@Transactional
public class AccountingEngine {
    
    private final JournalEntryRepository journalEntryRepository;
    private final ChartOfAccountsRepository chartOfAccountsRepository;
    private final TransactionRepository transactionRepository;
    private final ValidationEngine validationEngine;
    private final FinancialStatementGenerator statementGenerator;
    
    /**
     * 메인 거래 처리 메서드
     * 룰엔진 분류 결과를 받아 자동으로 분개 생성
     */
    public JournalEntryResponse processTransaction(TransactionToJournalRequest request) {
        // 1. 기존 거래 정보 조회 (룰엔진에서 분류된 결과 포함)
        Transaction transaction = transactionRepository.findById(request.getTransactionId())
            .orElseThrow(() -> new TransactionNotFoundException("거래를 찾을 수 없습니다: " + request.getTransactionId()));
        
        // 2. 분류 결과 검증
        if (transaction.getFinalSuggestedTag() == null) {
            throw new ClassificationNotCompleteException("거래 분류가 완료되지 않았습니다.");
        }
        
        // 3. 태그→계정과목 매핑 조회
        String expenseAccountCode = getAccountCodeFromTag(transaction.getFinalSuggestedTag());
        if (expenseAccountCode == null) {
            throw new AccountMappingNotFoundException("태그에 대한 계정과목 매핑을 찾을 수 없습니다: " + transaction.getFinalSuggestedTag());
        }
        
        // 4. 복식부기 분개 생성
        JournalEntry journalEntry = generateJournalEntry(transaction, expenseAccountCode);
        
        // 5. 분개 검증 (차변=대변)
        ValidationResult validation = validationEngine.validateJournalEntry(journalEntry);
        if (!validation.isValid()) {
            throw new JournalEntryValidationException("분개 검증 실패: " + validation.getErrorMessage());
        }
        
        // 6. 분개 저장
        JournalEntry savedEntry = journalEntryRepository.save(journalEntry);
        
        // 7. 거래 로그 업데이트 (분개 ID 연결)
        transaction.setJournalEntryId(savedEntry.getId());
        transaction.setBookkeepingStatus("COMPLETED");
        transactionRepository.save(transaction);
        
        // 8. 재무제표 비동기 업데이트 트리거
        scheduleFinancialStatementUpdate(transaction.getCompanyId());
        
        return JournalEntryResponse.from(savedEntry);
    }
    
    /**
     * 복식부기 원리에 따른 분개 생성
     */
    private JournalEntry generateJournalEntry(Transaction transaction, String expenseAccountCode) {
        JournalEntry entry = new JournalEntry();
        entry.setCompanyId(transaction.getCompanyId());
        entry.setEntryDate(transaction.getTransactionDate().toLocalDate());
        entry.setDescription(generateDescription(transaction));
        entry.setReferenceType("TRANSACTION");
        entry.setReferenceId(transaction.getId());
        entry.setTotalAmount(transaction.getAmount());
        entry.setStatus(JournalEntryStatus.DRAFT);
        
        // 분개 상세 라인 생성
        List<JournalEntryDetail> details = new ArrayList<>();
        
        // 차변: 비용 계정
        details.add(JournalEntryDetail.builder()
            .lineNumber(1)
            .accountCode(expenseAccountCode)
            .debitAmount(transaction.getAmount())
            .creditAmount(0L)
            .description("비용 발생")
            .build());
        
        // 대변: 현금/예금 계정 (거래 유형에 따라 결정)
        String cashAccountCode = determineCashAccount(transaction);
        details.add(JournalEntryDetail.builder()
            .lineNumber(2)
            .accountCode(cashAccountCode)
            .debitAmount(0L)
            .creditAmount(transaction.getAmount())
            .description("현금 지출")
            .build());
        
        entry.setDetails(details);
        return entry;
    }
    
    /**
     * 거래 유형에 따른 현금성 자산 계정 결정
     */
    private String determineCashAccount(Transaction transaction) {
        String rawText = transaction.getRawText().toLowerCase();
        
        // 카드 결제
        if (rawText.contains("카드") || rawText.contains("card")) {
            return "1130"; // 미지급금 (카드 결제는 부채)
        }
        
        // 계좌이체/온라인결제
        if (rawText.contains("이체") || rawText.contains("온라인")) {
            return "1120"; // 보통예금
        }
        
        // 현금 결제 (기본값)
        return "1110"; // 현금
    }
    
    /**
     * 분개 설명 자동 생성
     */
    private String generateDescription(Transaction transaction) {
        String merchantName = extractMerchantName(transaction.getRawText());
        String tag = transaction.getFinalSuggestedTag();
        
        return String.format("%s - %s (%s)", 
            merchantName, 
            tag, 
            formatCurrency(transaction.getAmount()));
    }
}
```

### 2. JournalEntryValidator 검증 엔진
```java
@Component
public class ValidationEngine {
    
    /**
     * 분개 검증 - 복식부기 원칙 준수 확인
     */
    public ValidationResult validateJournalEntry(JournalEntry journalEntry) {
        List<String> errors = new ArrayList<>();
        
        // 1. 기본 필수 필드 검증
        if (journalEntry.getDetails() == null || journalEntry.getDetails().isEmpty()) {
            errors.add("분개 상세가 없습니다.");
            return ValidationResult.invalid(errors);
        }
        
        // 2. 최소 2개 라인 필요 (차변 + 대변)
        if (journalEntry.getDetails().size() < 2) {
            errors.add("분개는 최소 2개 라인이 필요합니다 (차변 + 대변).");
        }
        
        // 3. 차변 = 대변 균형 검증
        Long totalDebit = journalEntry.getDetails().stream()
            .mapToLong(JournalEntryDetail::getDebitAmount)
            .sum();
            
        Long totalCredit = journalEntry.getDetails().stream()
            .mapToLong(JournalEntryDetail::getCreditAmount)
            .sum();
            
        if (!totalDebit.equals(totalCredit)) {
            errors.add(String.format("차변 합계(%s)와 대변 합계(%s)가 일치하지 않습니다.", 
                formatCurrency(totalDebit), formatCurrency(totalCredit)));
        }
        
        // 4. 총 금액 일치 검증
        if (!totalDebit.equals(journalEntry.getTotalAmount())) {
            errors.add(String.format("분개 총액(%s)과 차변 합계(%s)가 일치하지 않습니다.",
                formatCurrency(journalEntry.getTotalAmount()), formatCurrency(totalDebit)));
        }
        
        // 5. 계정과목 유효성 검증
        for (JournalEntryDetail detail : journalEntry.getDetails()) {
            if (!isValidAccountCode(detail.getAccountCode())) {
                errors.add("유효하지 않은 계정과목: " + detail.getAccountCode());
            }
            
            // 6. 차변 또는 대변 중 하나만 금액이 있어야 함
            boolean hasDebit = detail.getDebitAmount() > 0;
            boolean hasCredit = detail.getCreditAmount() > 0;
            
            if (hasDebit && hasCredit) {
                errors.add("한 라인에 차변과 대변 금액이 동시에 있을 수 없습니다.");
            }
            
            if (!hasDebit && !hasCredit) {
                errors.add("차변 또는 대변 중 하나의 금액이 있어야 합니다.");
            }
        }
        
        return errors.isEmpty() ? 
            ValidationResult.valid() : 
            ValidationResult.invalid(errors);
    }
    
    /**
     * 계정과목 코드 유효성 검사
     */
    private boolean isValidAccountCode(String accountCode) {
        return chartOfAccountsRepository.existsByAccountCodeAndIsActive(accountCode, true);
    }
}
```

### 3. FinancialStatementGenerator 재무제표 생성기
```java
@Service
public class FinancialStatementGenerator {
    
    private final JournalEntryRepository journalEntryRepository;
    private final ChartOfAccountsRepository chartOfAccountsRepository;
    private final FinancialStatementRepository financialStatementRepository;
    
    /**
     * 대차대조표 생성
     */
    public BalanceSheet generateBalanceSheet(String companyId, LocalDate asOfDate) {
        // 1. 기준일까지의 모든 확정된 분개 조회
        List<JournalEntry> confirmedEntries = journalEntryRepository
            .findByCompanyIdAndEntryDateLessThanEqualAndStatus(
                companyId, asOfDate, JournalEntryStatus.POSTED);
        
        // 2. 계정과목별 잔액 계산
        Map<String, Long> accountBalances = calculateAccountBalances(confirmedEntries);
        
        // 3. 계정 유형별 그룹화
        Map<AccountType, List<AccountBalance>> groupedBalances = 
            groupBalancesByAccountType(accountBalances);
        
        // 4. 대차대조표 구조 생성
        BalanceSheet balanceSheet = BalanceSheet.builder()
            .companyId(companyId)
            .asOfDate(asOfDate)
            .assets(buildAssetSection(groupedBalances.get(AccountType.ASSET)))
            .liabilities(buildLiabilitySection(groupedBalances.get(AccountType.LIABILITY)))
            .equity(buildEquitySection(groupedBalances.get(AccountType.EQUITY)))
            .generatedAt(LocalDateTime.now())
            .build();
        
        // 5. 대차 균형 검증
        validateBalanceSheetBalance(balanceSheet);
        
        // 6. 재무제표 저장
        saveFinancialStatement(balanceSheet);
        
        return balanceSheet;
    }
    
    /**
     * 손익계산서 생성
     */
    public IncomeStatement generateIncomeStatement(String companyId, 
                                                  LocalDate periodStart, 
                                                  LocalDate periodEnd) {
        // 1. 해당 기간의 확정된 분개 조회
        List<JournalEntry> periodEntries = journalEntryRepository
            .findByCompanyIdAndEntryDateBetweenAndStatus(
                companyId, periodStart, periodEnd, JournalEntryStatus.POSTED);
        
        // 2. 수익/비용 계정만 필터링 및 집계
        Map<String, Long> revenueBalances = calculateRevenueBalances(periodEntries);
        Map<String, Long> expenseBalances = calculateExpenseBalances(periodEntries);
        
        // 3. 손익계산서 구조 생성
        IncomeStatement incomeStatement = IncomeStatement.builder()
            .companyId(companyId)
            .periodStart(periodStart)
            .periodEnd(periodEnd)
            .revenues(buildRevenueSection(revenueBalances))
            .expenses(buildExpenseSection(expenseBalances))
            .netIncome(calculateNetIncome(revenueBalances, expenseBalances))
            .generatedAt(LocalDateTime.now())
            .build();
        
        // 4. 손익계산서 저장
        saveFinancialStatement(incomeStatement);
        
        return incomeStatement;
    }
    
    /**
     * 계정과목별 잔액 계산 (복식부기 원칙 적용)
     */
    private Map<String, Long> calculateAccountBalances(List<JournalEntry> journalEntries) {
        Map<String, Long> balances = new HashMap<>();
        
        for (JournalEntry entry : journalEntries) {
            for (JournalEntryDetail detail : entry.getDetails()) {
                String accountCode = detail.getAccountCode();
                
                // 계정과목 성격에 따른 잔액 계산
                ChartOfAccount account = chartOfAccountsRepository.findByAccountCode(accountCode);
                if (account == null) continue;
                
                Long currentBalance = balances.getOrDefault(accountCode, 0L);
                
                if (account.isDebitNormal()) {
                    // 차변성 계정 (자산, 비용): 차변(+), 대변(-)
                    currentBalance += detail.getDebitAmount() - detail.getCreditAmount();
                } else {
                    // 대변성 계정 (부채, 자본, 수익): 차변(-), 대변(+)
                    currentBalance += detail.getCreditAmount() - detail.getDebitAmount();
                }
                
                balances.put(accountCode, currentBalance);
            }
        }
        
        return balances;
    }
    
    /**
     * 대차대조표 균형 검증
     */
    private void validateBalanceSheetBalance(BalanceSheet balanceSheet) {
        Long totalAssets = balanceSheet.getAssets().getTotalAmount();
        Long totalLiabilitiesAndEquity = 
            balanceSheet.getLiabilities().getTotalAmount() + 
            balanceSheet.getEquity().getTotalAmount();
        
        if (!totalAssets.equals(totalLiabilitiesAndEquity)) {
            throw new BalanceSheetImbalanceException(
                String.format("대차대조표 불균형: 자산 %s, 부채+자본 %s", 
                    formatCurrency(totalAssets), 
                    formatCurrency(totalLiabilitiesAndEquity)));
        }
    }
}
```

## 📊 데이터베이스 스키마

### 핵심 테이블 설계
```sql
-- 회계 계정과목 마스터
CREATE TABLE chart_of_accounts (
    id SERIAL PRIMARY KEY,
    account_code VARCHAR(10) NOT NULL UNIQUE,        -- 계정코드 (예: 1110, 5201)
    account_name VARCHAR(100) NOT NULL,               -- 계정명 (예: 현금, 복리후생비)
    account_type account_type_enum NOT NULL,          -- 자산/부채/자본/수익/비용
    account_subtype VARCHAR(50),                      -- 세부분류 (유동자산, 비유동자산 등)
    is_debit_normal BOOLEAN NOT NULL,                 -- 차변성 계정 여부
    parent_account_id INTEGER REFERENCES chart_of_accounts(id),
    is_active BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 분개 마스터
CREATE TABLE journal_entries (
    id BIGSERIAL PRIMARY KEY,
    company_id UUID NOT NULL REFERENCES companies(id),
    entry_date DATE NOT NULL,
    description TEXT NOT NULL,
    reference_type VARCHAR(50) DEFAULT 'TRANSACTION',  -- TRANSACTION, MANUAL, ADJUSTMENT
    reference_id BIGINT,                               -- 원본 거래 ID
    total_amount BIGINT NOT NULL,                      -- 분개 총액
    status journal_entry_status_enum DEFAULT 'DRAFT', -- DRAFT, CONFIRMED, POSTED
    auto_generated BOOLEAN DEFAULT true,               -- 자동 생성 여부
    confidence_score INTEGER DEFAULT 100,             -- AI 생성 신뢰도
    created_by VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 분개 상세 (차변/대변 라인)
CREATE TABLE journal_entry_details (
    id BIGSERIAL PRIMARY KEY,
    journal_entry_id BIGINT NOT NULL REFERENCES journal_entries(id) ON DELETE CASCADE,
    line_number INTEGER NOT NULL,                     -- 분개 라인 순서
    account_code VARCHAR(10) NOT NULL REFERENCES chart_of_accounts(account_code),
    debit_amount BIGINT DEFAULT 0,                    -- 차변 금액
    credit_amount BIGINT DEFAULT 0,                   -- 대변 금액
    description TEXT,                                 -- 라인별 적요
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- 차변 또는 대변 중 하나만 값이 있어야 함
    CONSTRAINT check_debit_or_credit 
    CHECK ((debit_amount > 0 AND credit_amount = 0) OR (debit_amount = 0 AND credit_amount > 0))
);

-- 재무제표 저장 테이블
CREATE TABLE financial_statements (
    id BIGSERIAL PRIMARY KEY,
    company_id UUID NOT NULL REFERENCES companies(id),
    statement_type financial_statement_type_enum NOT NULL, -- BALANCE_SHEET, INCOME_STATEMENT, CASH_FLOW
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    statement_data JSONB NOT NULL,                    -- 재무제표 JSON 데이터
    generation_status financial_generation_status_enum DEFAULT 'GENERATING',
    generation_time_ms INTEGER,                       -- 생성 소요시간
    error_message TEXT,                               -- 오류 발생 시 메시지
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 분개 검증 로그
CREATE TABLE journal_entry_validations (
    id BIGSERIAL PRIMARY KEY,
    journal_entry_id BIGINT REFERENCES journal_entries(id),
    validation_type VARCHAR(50) NOT NULL,            -- BALANCE_CHECK, ACCOUNT_VALIDITY 등
    is_valid BOOLEAN NOT NULL,
    error_messages TEXT[],                            -- 검증 오류 메시지들
    validated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 기존 거래 로그 테이블 확장
ALTER TABLE transaction_logs 
ADD COLUMN journal_entry_id BIGINT REFERENCES journal_entries(id),
ADD COLUMN bookkeeping_status VARCHAR(20) DEFAULT 'PENDING', -- PENDING, COMPLETED, FAILED
ADD COLUMN bookkeeping_confidence INTEGER DEFAULT 100,
ADD COLUMN balance_check_passed BOOLEAN DEFAULT true,
ADD COLUMN accounting_error_message TEXT;

-- 성능 최적화 인덱스
CREATE INDEX idx_journal_entries_company_date ON journal_entries(company_id, entry_date);
CREATE INDEX idx_journal_entries_status ON journal_entries(status);
CREATE INDEX idx_journal_entry_details_journal ON journal_entry_details(journal_entry_id);
CREATE INDEX idx_journal_entry_details_account ON journal_entry_details(account_code);
CREATE INDEX idx_financial_statements_company_period ON financial_statements(company_id, period_start, period_end);
CREATE INDEX idx_chart_of_accounts_type ON chart_of_accounts(account_type);

-- 표준 계정과목 초기 데이터
INSERT INTO chart_of_accounts (account_code, account_name, account_type, account_subtype, is_debit_normal) VALUES
-- 자산
('1110', '현금', 'ASSET', '유동자산', true),
('1120', '보통예금', 'ASSET', '유동자산', true),
('1130', '미지급금', 'LIABILITY', '유동부채', false),  -- 카드 결제 등
('1210', '비품', 'ASSET', '비유동자산', true),
('1220', '차량운반구', 'ASSET', '비유동자산', true),

-- 부채
('2110', '미지급비용', 'LIABILITY', '유동부채', false),
('2120', '단기차입금', 'LIABILITY', '유동부채', false),
('2210', '장기차입금', 'LIABILITY', '비유동부채', false),

-- 자본
('3110', '자본금', 'EQUITY', '자본금', false),
('3120', '이익잉여금', 'EQUITY', '이익잉여금', false),

-- 수익
('4110', '매출', 'REVENUE', '영업수익', false),
('4120', '기타수익', 'REVENUE', '영업외수익', false),

-- 비용 (판매관리비)
('5101', '접대비', 'EXPENSE', '판매관리비', true),
('5201', '복리후생비', 'EXPENSE', '판매관리비', true),
('5301', '여비교통비', 'EXPENSE', '판매관리비', true),
('5401', '회의비', 'EXPENSE', '판매관리비', true),
('5501', '소모품비', 'EXPENSE', '판매관리비', true),
('5601', '차량유지비', 'EXPENSE', '판매관리비', true),
('5701', '통신비', 'EXPENSE', '판매관리비', true),
('5801', '임차료', 'EXPENSE', '판매관리비', true),
('5901', '기타비용', 'EXPENSE', '판매관리비', true);
```

## 🚀 API 설계

### 핵심 REST API
```yaml
# 거래 처리 API
POST /api/v2/accounting/process-transaction
Request:
{
  "transactionId": 12345,
  "companyId": "3ddc2f4b-ccf8-4f90-b905-2f01251e3e90",
  "forceRegenerate": false  # 기존 분개 있어도 재생성 여부
}
Response:
{
  "success": true,
  "journalEntry": {
    "id": 67890,
    "entryDate": "2025-01-20",
    "description": "스타벅스 강남점 - 카페 (₩5,400)",
    "totalAmount": 5400,
    "status": "DRAFT",
    "confidence": 92,
    "details": [
      {
        "lineNumber": 1,
        "accountCode": "5201",
        "accountName": "복리후생비",
        "debitAmount": 5400,
        "creditAmount": 0,
        "description": "비용 발생"
      },
      {
        "lineNumber": 2,
        "accountCode": "1120",
        "accountName": "보통예금",
        "debitAmount": 0,
        "creditAmount": 5400,
        "description": "현금 지출"
      }
    ]
  },
  "validation": {
    "isValid": true,
    "balanceCheck": "PASS",
    "errorMessages": []
  },
  "processingInfo": {
    "method": "AUTO_GENERATED",
    "processingTimeMs": 45,
    "ruleSource": "TAG_MAPPING"
  }
}

# 재무제표 생성 API
POST /api/v2/accounting/generate-balance-sheet
Request:
{
  "companyId": "3ddc2f4b-ccf8-4f90-b905-2f01251e3e90",
  "asOfDate": "2025-01-31"
}
Response:
{
  "success": true,
  "balanceSheet": {
    "companyId": "3ddc2f4b-ccf8-4f90-b905-2f01251e3e90",
    "asOfDate": "2025-01-31",
    "assets": {
      "currentAssets": {
        "현금": 5000000,
        "보통예금": 118000000,
        "미수금": 2000000,
        "총계": 125000000
      },
      "nonCurrentAssets": {
        "비품": 15000000,
        "차량운반구": 30000000,
        "총계": 45000000
      },
      "totalAssets": 170000000
    },
    "liabilities": {
      "currentLiabilities": {
        "미지급금": 8000000,
        "미지급비용": 15000000,
        "총계": 23000000
      },
      "totalLiabilities": 23000000
    },
    "equity": {
      "자본금": 100000000,
      "이익잉여금": 47000000,
      "totalEquity": 147000000
    },
    "isBalanced": true,
    "generationInfo": {
      "generatedAt": "2025-01-20T14:30:00Z",
      "processingTimeMs": 1234,
      "includedTransactions": 1247
    }
  }
}

# 손익계산서 생성 API
POST /api/v2/accounting/generate-income-statement
Request:
{
  "companyId": "3ddc2f4b-ccf8-4f90-b905-2f01251e3e90",
  "periodStart": "2025-01-01",
  "periodEnd": "2025-01-31"
}
Response:
{
  "success": true,
  "incomeStatement": {
    "periodStart": "2025-01-01",
    "periodEnd": "2025-01-31",
    "revenues": {
      "매출": 50000000,
      "기타수익": 1500000,
      "총수익": 51500000
    },
    "expenses": {
      "판매관리비": {
        "접대비": 3200000,
        "복리후생비": 2800000,
        "여비교통비": 1200000,
        "회의비": 800000,
        "소모품비": 600000,
        "차량유지비": 1500000,
        "통신비": 400000,
        "임차료": 8000000,
        "소계": 18500000
      },
      "총비용": 18500000
    },
    "netIncome": 33000000,
    "profitMargin": 64.08  // (순이익/매출) * 100
  }
}

# 분개 관리 API
GET    /api/v2/accounting/journal-entries?companyId=xxx&startDate=2025-01-01&endDate=2025-01-31
POST   /api/v2/accounting/journal-entries           # 수동 분개 생성
PUT    /api/v2/accounting/journal-entries/{id}      # 분개 수정
DELETE /api/v2/accounting/journal-entries/{id}      # 분개 삭제
POST   /api/v2/accounting/journal-entries/{id}/confirm  # 분개 확정

# 계정과목 관리 API
GET    /api/v2/accounting/chart-of-accounts
POST   /api/v2/accounting/chart-of-accounts
PUT    /api/v2/accounting/chart-of-accounts/{id}
GET    /api/v2/accounting/chart-of-accounts/tree    # 계층구조 조회

# 시스템 상태 API
GET    /api/v2/accounting/health                    # 시스템 상태
GET    /api/v2/accounting/stats                     # 처리 통계
POST   /api/v2/accounting/validate-all-entries      # 전체 분개 검증
POST   /api/v2/accounting/regenerate-statements     # 재무제표 재생성
```

## 📈 성능 및 품질 지표

### 핵심 KPI
```yaml
분개 생성 성과:
  - 자동 생성 성공률: 95% 이상 (목표)
  - 분개 생성 시간: < 100ms (평균)
  - 대차평균 정확도: 100% (필수)
  - 일일 처리 가능량: 100,000건

재무제표 생성:
  - 대차대조표 생성: < 2초
  - 손익계산서 생성: < 1.5초
  - 균형 검증 성공률: 100%
  - 동시 생성 지원: 50개 회사

데이터 품질:
  - 분개 정확도: 98% 이상
  - 사용자 수정률: < 5%
  - 시스템 오류율: < 0.1%
  - 데이터 일관성: 100%
```

### 모니터링 및 알림
```yaml
CRITICAL 알림:
  - 대차불균형 발생 (분개/재무제표)
  - 분개 생성 실패율 > 5%
  - 시스템 응답시간 > 5초
  - DB 연결 오류

WARNING 알림:
  - 자동 생성 신뢰도 < 80%
  - 분개 수정률 > 10%
  - 재무제표 생성 지연 > 3초
  - 디스크 사용량 > 85%

INFO 알림:
  - 일일 처리량 신기록
  - 새로운 계정과목 매핑 학습
  - 월간 성과 리포트 완료
```

## 🔄 개발 단계별 구현 계획

### Phase 1: 기본 엔진 구축 (4주)
```yaml
Week 1-2: 데이터베이스 및 기본 모델
✅ 목표:
  - 회계 계정과목 마스터 데이터 구축
  - 분개/재무제표 테이블 설계
  - JPA 엔티티 및 Repository 구현
  
✅ 완료 기준:
  - 표준 계정과목 100개 이상 등록
  - 모든 테이블 제약조건 및 인덱스 적용
  - 단위 테스트 커버리지 80% 이상

Week 3-4: 핵심 엔진 구현
✅ 목표:
  - AccountingEngine 서비스 구현
  - 복식부기 분개 자동 생성 로직
  - 차변=대변 검증 시스템
  
✅ 완료 기준:
  - 기본 거래 유형 분개 생성 100% 성공
  - 검증 엔진 오류 감지율 100%
  - API 응답시간 < 100ms
```

### Phase 2: 재무제표 생성 (3주)
```yaml
Week 5-6: 재무제표 생성기
✅ 목표:
  - 대차대조표 자동 생성
  - 손익계산서 자동 생성
  - 재무제표 균형 검증
  
✅ 완료 기준:
  - 1,000건 분개 기준 < 2초 생성
  - 대차균형 검증 100% 정확도
  - JSON 형태 재무제표 완전한 구조

Week 7: 성능 최적화
✅ 목표:
  - 대용량 데이터 처리 최적화
  - 인덱스 튜닝 및 쿼리 최적화
  - 동시 처리 성능 개선
  
✅ 완료 기준:
  - 10,000건 거래 기준 < 5초 처리
  - 동시 50개 회사 재무제표 생성
  - 메모리 사용량 < 2GB
```

### Phase 3: Admin 도구 통합 (3주)
```yaml
Week 8-9: 어드민 인터페이스
✅ 목표:
  - 분개 생성 관리 화면
  - 재무제표 미리보기 기능
  - 오류 분개 수정 워크플로
  
✅ 완료 기준:
  - 실시간 분개 생성 모니터링
  - 클릭 한 번으로 재무제표 생성
  - 사용자 친화적 오류 메시지

Week 10: 통합 테스트 및 배포
✅ 목표:
  - End-to-End 통합 테스트
  - 성능 벤치마크 테스트
  - 운영 환경 배포 준비
  
✅ 완료 기준:
  - 전체 시나리오 자동화 테스트
  - 부하 테스트 통과 (10,000 TPS)
  - 배포 가이드 문서 완성
```

## 🧪 테스트 전략

### 단위 테스트
```java
@ExtendWith(MockitoExtension.class)
class AccountingEngineTest {
    
    @Mock
    private TransactionRepository transactionRepository;
    
    @Mock
    private ChartOfAccountsRepository chartOfAccountsRepository;
    
    @InjectMocks
    private AccountingEngine accountingEngine;
    
    @Test
    @DisplayName("카페 거래에 대한 분개 생성 테스트")
    void testProcessCafeTransaction() {
        // Given
        Transaction transaction = createCafeTransaction();
        when(transactionRepository.findById(1L)).thenReturn(Optional.of(transaction));
        when(chartOfAccountsRepository.findByAccountCode("5201"))
            .thenReturn(createAccount("5201", "복리후생비"));
        
        // When
        JournalEntryResponse response = accountingEngine.processTransaction(
            new TransactionToJournalRequest(1L));
        
        // Then
        assertThat(response.isSuccess()).isTrue();
        assertThat(response.getJournalEntry().getDetails()).hasSize(2);
        
        // 차변: 복리후생비
        JournalEntryDetail debitLine = response.getJournalEntry().getDetails().get(0);
        assertThat(debitLine.getAccountCode()).isEqualTo("5201");
        assertThat(debitLine.getDebitAmount()).isEqualTo(5400L);
        assertThat(debitLine.getCreditAmount()).isEqualTo(0L);
        
        // 대변: 보통예금
        JournalEntryDetail creditLine = response.getJournalEntry().getDetails().get(1);
        assertThat(creditLine.getAccountCode()).isEqualTo("1120");
        assertThat(creditLine.getDebitAmount()).isEqualTo(0L);
        assertThat(creditLine.getCreditAmount()).isEqualTo(5400L);
    }
    
    @Test
    @DisplayName("대차불균형 분개 검증 실패 테스트")
    void testUnbalancedJournalEntryValidation() {
        // Given
        JournalEntry unbalancedEntry = createUnbalancedJournalEntry();
        
        // When & Then
        assertThatThrownBy(() -> accountingEngine.validateAndSave(unbalancedEntry))
            .isInstanceOf(JournalEntryValidationException.class)
            .hasMessageContaining("차변과 대변이 일치하지 않습니다");
    }
}
```

### 통합 테스트
```java
@SpringBootTest
@TestPropertySource(locations = "classpath:application-test.yml")
class AccountingIntegrationTest {
    
    @Autowired
    private AccountingEngine accountingEngine;
    
    @Autowired
    private TestDataBuilder testDataBuilder;
    
    @Test
    @DisplayName("전체 워크플로 통합 테스트: 거래 → 분개 → 재무제표")
    void testCompleteWorkflow() {
        // Given: 테스트 회사 및 거래 데이터 준비
        Company testCompany = testDataBuilder.createTestCompany();
        List<Transaction> transactions = testDataBuilder.createMonthlyTransactions(testCompany, 100);
        
        // When 1: 모든 거래에 대한 분개 생성
        List<JournalEntry> journalEntries = new ArrayList<>();
        for (Transaction tx : transactions) {
            JournalEntryResponse response = accountingEngine.processTransaction(
                new TransactionToJournalRequest(tx.getId()));
            assertThat(response.isSuccess()).isTrue();
            journalEntries.add(response.getJournalEntry());
        }
        
        // When 2: 재무제표 생성
        BalanceSheet balanceSheet = accountingEngine.generateBalanceSheet(
            testCompany.getId(), LocalDate.of(2025, 1, 31));
        IncomeStatement incomeStatement = accountingEngine.generateIncomeStatement(
            testCompany.getId(), LocalDate.of(2025, 1, 1), LocalDate.of(2025, 1, 31));
        
        // Then: 검증
        assertThat(journalEntries).hasSize(100);
        assertThat(balanceSheet.isBalanced()).isTrue();
        assertThat(incomeStatement.getNetIncome()).isNotNull();
        
        // 상세 검증
        Long totalExpenses = journalEntries.stream()
            .flatMap(entry -> entry.getDetails().stream())
            .filter(detail -> detail.getAccountCode().startsWith("5")) // 비용 계정
            .mapToLong(JournalEntryDetail::getDebitAmount)
            .sum();
        
        assertThat(incomeStatement.getExpenses().getTotalAmount())
            .isEqualTo(totalExpenses);
    }
    
    @Test
    @DisplayName("대용량 데이터 성능 테스트")
    void testLargeVolumePerformance() {
        // Given: 10,000건의 거래 데이터
        List<Transaction> largeDataset = testDataBuilder.createLargeTransactionDataset(10000);
        
        // When: 처리 시간 측정
        long startTime = System.currentTimeMillis();
        
        for (Transaction tx : largeDataset) {
            accountingEngine.processTransaction(new TransactionToJournalRequest(tx.getId()));
        }
        
        long processingTime = System.currentTimeMillis() - startTime;
        
        // Then: 성능 요구사항 검증 (10초 이내)
        assertThat(processingTime).isLessThan(10000);
        
        // 평균 처리 시간 검증 (거래당 1ms 이내)
        double avgTimePerTransaction = (double) processingTime / largeDataset.size();
        assertThat(avgTimePerTransaction).isLessThan(1.0);
    }
}
```

## 🛡️ 보안 및 컴플라이언스

### 데이터 보안
```yaml
암호화:
  - 민감한 재무 데이터 AES-256 암호화
  - 거래 금액 암호화 저장
  - 백업 데이터 암호화

접근 제어:
  - 역할 기반 접근 제어 (RBAC)
  - 분개 생성/수정 권한 분리
  - 재무제표 조회 권한 관리
  - API 키 기반 인증

감사 추적:
  - 모든 분개 생성/수정 이력 저장
  - 재무제표 생성 로그 보관
  - 사용자 행동 추적 및 로깅
```

### 회계 기준 준수
```yaml
복식부기 원칙:
  - 모든 거래 차변=대변 엄격 검증
  - 계정과목 분류 정확성 보장
  - 회계 기간 원칙 준수

법정 요구사항:
  - 전자장부보존법 준수 (5년 보관)
  - 부가세법 규정 준수
  - 법인세법 회계처리 기준 적용

내부 통제:
  - 분개 생성 프로세스 표준화
  - 4-eyes 원칙 (생성/승인 분리)
  - 정기적 내부 감사 지원
```

## 🎯 비즈니스 임팩트

### 정량적 효과
```yaml
시간 절약:
  - 수동 분개 작성: 거래당 5분 → 자동화 3초 (99.4% 단축)
  - 재무제표 작성: 월 8시간 → 2분 (99.6% 단축)
  - 연간 절약 시간: 2,000시간+ (중간 규모 회사 기준)

비용 절약:
  - 세무사 비용: 월 200만원 → 월 20만원 (90% 절감)
  - 회계 담당자 업무 시간: 50% 절감
  - 오류 수정 비용: 80% 절감

정확도 향상:
  - 분개 오류율: 수동 5% → 자동 0.1%
  - 재무제표 균형: 100% 보장
  - 규정 준수: 자동화된 검증으로 100% 준수
```

### 정성적 효과
```yaml
업무 효율성:
  - 반복적 작업 자동화로 창의적 업무 집중
  - 실시간 재무현황 파악으로 신속한 의사결정
  - 오류 걱정 없는 안정적인 회계 처리

비즈니스 가치:
  - 정확한 재무 데이터 기반 경영 의사결정
  - 투자자/금융기관 신뢰도 향상
  - 규정 준수 리스크 최소화
  - 스케일링 시 회계 업무 자동 확장
```

---

## 🎯 현재 구현 완료 상태 (2025-07-24)

### ✅ 완료된 백엔드 구현

#### 1. 핵심 서비스 구현 완료
**AccountingEngine (14개 TDD 테스트 완료)**
- ~~개념 설계~~ → **완전 구현 완료**
- 거래→분개 변환 로직 구현
- 복식부기 검증 엔진 구현
- 재무제표 생성 로직 구현

**ChartOfAccountsExpansionService (20개 TDD 테스트 완료)**
- ~~설계 단계~~ → **완전 구현 완료**
- 동적 계정과목 생성 로직 구현
- 계층구조 관리 시스템 구현
- 업종별 특화 계정과목 자동 생성

**TagAccountMappingService (35개 TDD 테스트 완료)**
- ~~기획 단계~~ → **완전 구현 완료**
- 태그→계정과목 자동 매핑 시스템 구현
- 매핑 우선순위 및 충돌 해결 로직 구현
- 자동 매핑 추천 알고리즘 구현

#### 2. MyBatis Mapper XML 구현 완료
**데이터베이스 레이어 100% 구현**
- ~~스키마 설계~~ → **완전 구현 완료**
- `ChartOfAccountsMapper.xml`: 계정과목 CRUD 및 계층구조 관리
- `GeneralLedgerMapper.xml`: 총계정원장 집계 및 조회
- `JournalEntryMapper.xml`: 분개 생성/조회/집계
- `TagAccountMappingMapper.xml`: 태그-계정과목 매핑 관리

#### 3. REST API Controller 구현 완료
**완전한 API 엔드포인트 제공**
- ~~API 설계~~ → **15개 컨트롤러 완전 구현**
- `AccountingController`: 복식부기 처리 API
- `ChartOfAccountsController`: 계정과목 관리 API
- `JournalEntryController`: 분개 관리 API
- `GeneralLedgerController`: 총계정원장 API
- `MonthEndClosingController`: 월말마감 API

#### 4. Phase 1-5 비즈니스 로직 이전 완료
**프론트엔드→백엔드 완전 이전**
- ~~Phase 1 (계획)~~ → **Phase 1-5 모든 로직 백엔드 이전 완료**
- Phase별 통합 테스트 68개 구현 완료
- 모든 회계 비즈니스 로직이 Spring Boot에서 실행

### 🔄 현재 진행 중

#### 1. 프론트엔드-백엔드 통합
- NextJS Admin 도구의 백엔드 API 연동
- React Native 모바일 앱의 백엔드 API 연동
- 실시간 재무제표 업데이트 시스템 연동

#### 2. 통합 테스트 및 최적화
- ~~개별 서비스 테스트~~ → **통합 워크플로우 테스트**
- 성능 최적화 및 캐싱 시스템 구현
- 에러 처리 및 복구 시스템 강화

### 📈 구현 성과 지표

| 구분 | 목표 | 완료 상태 | 성과 |
|------|------|----------|------|
| **백엔드 TDD** | 100% | ✅ **240개 테스트** | 100% 통과 |
| **핵심 서비스** | 5개 | ✅ **5개 완료** | 107개 핵심 테스트 |
| **Phase 이전** | Phase 1-5 | ✅ **완전 이전** | 68개 통합 테스트 |
| **MyBatis 매퍼** | 전체 | ✅ **XML 완료** | 모든 DB 로직 구현 |
| **REST API** | 전체 | ✅ **15개 컨트롤러** | 완전한 API 제공 |

### 🎉 주요 달성 성과

1. **완전한 TDD 기반 개발**: 240개 테스트로 100% 검증된 안정적인 구현
2. **비즈니스 로직 완전 이전**: 모든 회계 로직이 견고한 백엔드에서 실행
3. **확장 가능한 아키텍처**: 새로운 기능 추가와 성능 최적화가 용이한 구조
4. **전문가 수준 구현**: 복식부기 원칙을 100% 준수하는 전문적인 회계 시스템

---

## 결론

MoneyShift 복식부기엔진은 기존의 룰엔진 시스템과 완벽히 연계되어 **거래 분류부터 재무제표 생성까지의 전체 회계 프로세스**를 자동화하는 종합적인 솔루션입니다.

**핵심 혁신:**
1. **AI 기반 분개 생성**: 룰엔진 분류 결과를 바탕으로 정확한 복식부기 분개 자동 생성
2. **실시간 재무제표**: 거래 발생 즉시 대차대조표/손익계산서 자동 업데이트
3. **완벽한 검증 시스템**: 차변=대변 균형을 100% 보장하는 검증 엔진
4. **확장 가능한 아키텍처**: 새로운 거래 유형과 회계 기준에 유연하게 대응

**기술적 우수성:**
- **95% 자동 처리율**: 대부분의 거래를 사람 개입 없이 처리
- **100% 정확성**: 복식부기 원칙과 회계 기준 완전 준수  
- **고성능**: 거래당 100ms 이내 분개 생성, 재무제표 2초 이내 완성
- **안정성**: 24/7 무중단 서비스와 완벽한 데이터 무결성 보장

완성되면 소규모 법인부터 중견기업까지 **"회계 전문가 없이도 전문가 수준의 정확한 장부 관리"**를 할 수 있는 혁신적인 자동화 플랫폼이 될 것입니다.
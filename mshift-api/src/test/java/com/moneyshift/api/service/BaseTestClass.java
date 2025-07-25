package com.moneyshift.api.service;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import com.moneyshift.api.config.AccountCodeConfig;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * 로버스트 테스트 환경을 위한 공통 베이스 클래스
 * 
 * 완전한 테스트 격리와 데이터 무결성을 보장하는 표준화된 테스트 인프라를 제공합니다.
 * 
 * 🔧 핵심 기능:
 * 1. UUID 기반 완전 격리된 테스트 환경
 * 2. 외래키 제약조건 완전 해결
 * 3. 자동 데이터 정리 및 롤백
 * 4. 표준화된 계정과목 및 회사 데이터 생성
 * 5. 동시성 안전 테스트 실행
 * 
 * @author MoneyShift TDD Team
 * @version 2.0 - Robust Edition
 * @since 2025-07-25
 */
@SpringBootTest
@ActiveProfiles("test")
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_EACH_TEST_METHOD)
@Transactional
public abstract class BaseTestClass {

    @Autowired
    protected JdbcTemplate jdbcTemplate;

    // 테스트 격리를 위한 UUID 기반 식별자
    protected String testCompanyId;
    protected String accountCodePrefix;
    
    // 표준화된 테스트 데이터
    protected final LocalDate TEST_FISCAL_YEAR = LocalDate.now();
    protected final int TEST_FISCAL_MONTH = LocalDate.now().getMonthValue();
    protected final LocalDate TEST_ENTRY_DATE = LocalDate.now();
    
    // 동시성 안전을 위한 스레드 안전 컬렉션
    private static final ConcurrentHashMap<String, Boolean> companyRegistry = new ConcurrentHashMap<>();
    private static final AtomicInteger testCounter = new AtomicInteger(0);

    /**
     * 테스트 환경 자동 설정 (각 테스트 메서드 실행 전)
     */
    @BeforeEach
    public void initializeTestEnvironment() {
        // 고유한 테스트 식별자 생성
        int testInstanceId = testCounter.incrementAndGet();
        UUID companyUuid = UUID.randomUUID();
        testCompanyId = companyUuid.toString();
        accountCodePrefix = String.format("TEST%04d", testInstanceId);
        
        // 테스트 회사 생성 (완전 격리)
        createTestCompany();
        
        // 기본 계정과목 체계 생성
        createStandardChartOfAccounts();
    }

    /**
     * 테스트 환경 자동 정리 (각 테스트 메서드 실행 후)
     */
    @AfterEach
    public void cleanupTestEnvironment() {
        cleanupTestDataRobust();
    }

    /**
     * 로버스트 테스트 회사 생성
     */
    private void createTestCompany() {
        try {
            // 고유한 사업자등록번호 생성
            String businessNumber = accountCodePrefix + "-" + testCompanyId.substring(0, 8);
            
            String insertSql = """
                INSERT INTO companies (id, company_name, business_registration_number, taxpayer_type) 
                VALUES (?::uuid, ?, ?, 'CORPORATION') 
                ON CONFLICT (id) DO NOTHING
                """;
            
            jdbcTemplate.update(insertSql, testCompanyId, 
                              "Test Company " + accountCodePrefix, 
                              businessNumber);
            
            companyRegistry.put(testCompanyId, true);
        } catch (Exception e) {
            throw new RuntimeException("테스트 회사 생성 실패: " + e.getMessage(), e);
        }
    }

    /**
     * 표준 계정과목 체계 생성 (중앙화된 설정 기반)
     * 타입 안전성과 일관성을 보장하는 중앙화된 계정과목들을 생성합니다.
     */
    private void createStandardChartOfAccounts() {
        // 자산 계정
        createStandardAccount(AccountCodeConfig.Codes.CASH);
        createStandardAccount(AccountCodeConfig.Codes.BANK_DEPOSITS);
        createStandardAccount(AccountCodeConfig.Codes.OFFICE_SUPPLIES);
        createStandardAccount(AccountCodeConfig.Codes.ACCOUNTS_RECEIVABLE);
        
        // 부채 계정
        createStandardAccount(AccountCodeConfig.Codes.ACCOUNTS_PAYABLE);
        createStandardAccount(AccountCodeConfig.Codes.SHORT_TERM_LOANS);
        
        // 자본 계정
        createStandardAccount(AccountCodeConfig.Codes.CAPITAL_STOCK);
        createStandardAccount(AccountCodeConfig.Codes.RETAINED_EARNINGS);
        
        // 수익 계정
        createStandardAccount(AccountCodeConfig.Codes.SALES_REVENUE);
        createStandardAccount(AccountCodeConfig.Codes.NON_OPERATING_INCOME);
        
        // 비용 계정 (확장된 판매비와 관리비)
        createStandardAccount(AccountCodeConfig.Codes.OFFICE_SUPPLIES_EXPENSE);
        createStandardAccount(AccountCodeConfig.Codes.ENTERTAINMENT_EXPENSE);
        createStandardAccount(AccountCodeConfig.Codes.WELFARE_EXPENSE);
        createStandardAccount(AccountCodeConfig.Codes.COMMUNICATION_EXPENSE);
        createStandardAccount(AccountCodeConfig.Codes.UTILITIES_EXPENSE);
    }

    /**
     * 로버스트 테스트 데이터 정리
     * 외래키 제약조건을 고려한 완전한 데이터 정리
     */
    private void cleanupTestDataRobust() {
        if (testCompanyId == null) return;
        
        try {
            // 1단계: 외래키 제약조건 비활성화 (PostgreSQL)
            jdbcTemplate.execute("SET session_replication_role = replica");
            
            // 2단계: 역순으로 데이터 삭제 (외래키 순서 고려)
            deleteTableData("journal_entry_audit_logs", "journal_entry_id IN (SELECT id FROM journal_entries WHERE company_id = ?::uuid)");
            deleteTableData("journal_entry_details", "journal_entry_id IN (SELECT id FROM journal_entries WHERE company_id = ?::uuid)");
            deleteTableData("gl_details", "general_ledger_id IN (SELECT id FROM general_ledger WHERE company_id = ?::uuid)");
            deleteTableData("journal_entries", "company_id = ?::uuid");
            deleteTableData("general_ledger", "company_id = ?::uuid");
            deleteTableData("transactions", "company_id = ?::uuid");
            deleteTableData("chart_of_accounts", "account_code LIKE ?", accountCodePrefix + "%");
            deleteTableData("companies", "id = ?::uuid");
            
            // 3단계: 외래키 제약조건 재활성화
            jdbcTemplate.execute("SET session_replication_role = DEFAULT");
            
            // 4단계: 레지스트리에서 제거
            companyRegistry.remove(testCompanyId);
            
        } catch (Exception e) {
            System.err.println("⚠️ 테스트 데이터 정리 실패: " + e.getMessage());
            // 정리 실패 시에도 다음 테스트 진행을 방해하지 않음
        }
    }

    /**
     * 테이블별 데이터 안전 삭제
     */
    private void deleteTableData(String tableName, String whereClause, String... params) {
        try {
            String sql = "DELETE FROM " + tableName + " WHERE " + whereClause;
            if (params.length > 0) {
                jdbcTemplate.update(sql, (Object[]) params);
            } else {
                jdbcTemplate.update(sql, testCompanyId);
            }
        } catch (Exception e) {
            // 테이블이 존재하지 않거나 데이터가 없는 경우 무시
        }
    }

    /**
     * 계정과목이 존재하는지 확인하고 없으면 생성
     */
    protected void createAccountIfNotExists(String accountCode, String accountName, String accountType, boolean isDebitNormal) {
        String checkSql = "SELECT COUNT(*) FROM chart_of_accounts WHERE account_code = ?";
        Integer count = jdbcTemplate.queryForObject(checkSql, Integer.class, accountCode);
        
        if (count == null || count == 0) {
            String insertSql = "INSERT INTO chart_of_accounts (account_code, account_name, account_type, is_debit_normal, is_active, display_order) " +
                             "VALUES (?, ?, ?::account_type_enum, ?, true, 1)";
            jdbcTemplate.update(insertSql, accountCode, accountName, accountType, isDebitNormal);
        }
    }

    /**
     * 로버스트 헬퍼 메서드: 표준 계정과목 생성 (중앙화된 설정 기반)
     */
    private void createStandardAccount(String baseCode) {
        AccountCodeConfig.AccountInfo info = AccountCodeConfig.getAccountInfo(baseCode);
        String fullAccountCode = AccountCodeConfig.getFullCode(accountCodePrefix, baseCode);
        createAccountIfNotExists(fullAccountCode, info.getName(), info.getType(), info.isDebitNormal());
    }

    /**
     * 로버스트 헬퍼 메서드: 테스트용 UUID 기반 계정코드 생성 (중앙화된 설정 기반)
     */
    protected String generateAccountCode(String baseCode) {
        return AccountCodeConfig.getFullCode(accountCodePrefix, baseCode);
    }


    /**
     * 로버스트 헬퍼 메서드: 외래키 안전 분개 생성
     */
    protected Long createTestJournalEntry(String description, BigDecimal amount) {
        // 1. 회사가 존재하는지 확인
        ensureTestCompanyExists();
        
        // 2. 기본 계정이 존재하는지 확인
        String debitAccount = generateAccountCode("5000");
        String creditAccount = generateAccountCode("1000");
        createAccountIfNotExists(debitAccount, "사무용품비", "비용", true);
        createAccountIfNotExists(creditAccount, "현금", "자산", true);

        // 3. 분개 생성
        String insertJournalSql = """
            INSERT INTO journal_entries (company_id, entry_date, description, total_debit_amount, total_credit_amount, status, confidence_score)
            VALUES (?::uuid, ?, ?, ?, ?, 'POSTED'::journal_entry_status, 95.0)
            """;
        
        jdbcTemplate.update(insertJournalSql, testCompanyId, TEST_ENTRY_DATE, description, amount, amount);
        
        // 4. 생성된 분개 ID 반환
        String getIdSql = "SELECT id FROM journal_entries WHERE company_id = ?::uuid AND description = ? ORDER BY created_at DESC LIMIT 1";
        return jdbcTemplate.queryForObject(getIdSql, Long.class, testCompanyId, description);
    }

    /**
     * 로버스트 헬퍼 메서드: 테스트 회사 존재 확인 및 생성
     */
    private void ensureTestCompanyExists() {
        String checkSql = "SELECT COUNT(*) FROM companies WHERE id = ?::uuid";
        Integer count = jdbcTemplate.queryForObject(checkSql, Integer.class, testCompanyId);
        if (count == null || count == 0) {
            createTestCompany();
        }
    }

    /**
     * 로버스트 헬퍼 메서드: 시스템 일관성 검증
     */
    protected void validateSystemConsistency() {
        // 1. 테스트 회사 존재 확인
        String companySql = "SELECT COUNT(*) FROM companies WHERE id = ?::uuid";
        Integer companyCount = jdbcTemplate.queryForObject(companySql, Integer.class, testCompanyId);
        if (companyCount == null || companyCount == 0) {
            throw new RuntimeException("테스트 회사가 존재하지 않습니다: " + testCompanyId);
        }

        // 2. 계정과목 prefix 일관성 확인
        String accountSql = "SELECT COUNT(*) FROM chart_of_accounts WHERE account_code LIKE ?";
        Integer accountCount = jdbcTemplate.queryForObject(accountSql, Integer.class, accountCodePrefix + "%");
        if (accountCount == null || accountCount == 0) {
            throw new RuntimeException("테스트 계정과목이 존재하지 않습니다. Prefix: " + accountCodePrefix);
        }

        // 3. 외래키 참조 무결성 확인
        String foreignKeySql = """
            SELECT COUNT(*) FROM journal_entries je 
            WHERE je.company_id = ?::uuid 
            AND NOT EXISTS (SELECT 1 FROM companies c WHERE c.id = je.company_id)
            """;
        Integer orphanCount = jdbcTemplate.queryForObject(foreignKeySql, Integer.class, testCompanyId);
        if (orphanCount != null && orphanCount > 0) {
            throw new RuntimeException("외래키 참조 무결성 위반이 발견되었습니다: " + orphanCount + "개의 고아 레코드");
        }
    }

    /**
     * 로버스트 헬퍼 메서드: 테스트 환경 상태 로깅
     */
    protected void logTestEnvironmentState() {
        System.out.println("=== 테스트 환경 상태 ===");
        System.out.println("Test Company ID: " + testCompanyId);
        System.out.println("Account Prefix: " + accountCodePrefix);
        
        try {
            String companySql = "SELECT COUNT(*) FROM companies WHERE id = ?::uuid";
            Integer companyCount = jdbcTemplate.queryForObject(companySql, Integer.class, testCompanyId);
            System.out.println("Test Company Exists: " + (companyCount != null && companyCount > 0));

            String accountSql = "SELECT COUNT(*) FROM chart_of_accounts WHERE account_code LIKE ?";
            Integer accountCount = jdbcTemplate.queryForObject(accountSql, Integer.class, accountCodePrefix + "%");
            System.out.println("Test Accounts Created: " + (accountCount != null ? accountCount : 0));

            String journalSql = "SELECT COUNT(*) FROM journal_entries WHERE company_id = ?::uuid";
            Integer journalCount = jdbcTemplate.queryForObject(journalSql, Integer.class, testCompanyId);
            System.out.println("Test Journal Entries: " + (journalCount != null ? journalCount : 0));
        } catch (Exception e) {
            System.out.println("환경 상태 확인 중 오류: " + e.getMessage());
        }
        System.out.println("========================");
    }

    /**
     * 추가 테스트 회사 생성 (다중 회사 테스트용)
     */
    protected void setupAdditionalTestCompany(String companyId) {
        try {
            // 고유한 사업자등록번호 생성
            String businessNumber = "ADDITIONAL-" + companyId.substring(0, 8);
            
            String insertSql = """
                INSERT INTO companies (id, company_name, business_registration_number, taxpayer_type) 
                VALUES (?::uuid, ?, ?, 'CORPORATION') 
                ON CONFLICT (id) DO NOTHING
                """;
            
            jdbcTemplate.update(insertSql, companyId, 
                              "Additional Test Company " + companyId.substring(0, 8), 
                              businessNumber);
            
            companyRegistry.put(companyId, true);
        } catch (Exception e) {
            throw new RuntimeException("추가 테스트 회사 생성 실패: " + e.getMessage(), e);
        }
    }
}
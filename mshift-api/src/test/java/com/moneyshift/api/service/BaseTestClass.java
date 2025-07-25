package com.moneyshift.api.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;

import java.util.UUID;

/**
 * 모든 테스트 클래스의 공통 베이스 클래스
 * 
 * 테스트 환경의 격리성과 일관성을 보장하기 위한 공통 기능을 제공합니다.
 * 
 * 주요 기능:
 * 1. 테스트용 회사 데이터 자동 생성
 * 2. 고유한 계정코드 prefix 생성 (UUID 기반)
 * 3. 외래키 제약조건 해결을 위한 기본 데이터 설정
 * 4. 테스트 데이터 격리 및 정리
 * 
 * @author MoneyShift TDD Team
 * @version 1.0
 * @since 2025-07-25
 */
@SpringBootTest
@ActiveProfiles("test")
public abstract class BaseTestClass {

    @Autowired
    protected JdbcTemplate jdbcTemplate;

    protected String TEST_COMPANY_ID;
    protected String uniqueAccountPrefix;

    /**
     * 테스트용 회사 설정
     * 각 테스트마다 고유한 회사 ID와 계정코드 prefix를 생성합니다.
     */
    protected void setupTestCompany() {
        // 각 테스트마다 고유한 ID 생성
        TEST_COMPANY_ID = UUID.randomUUID().toString();
        uniqueAccountPrefix = TEST_COMPANY_ID.substring(0, 8);
        
        // 테스트용 회사가 이미 존재하는지 확인
        String checkSql = "SELECT COUNT(*) FROM companies WHERE id = ?::uuid";
        Integer count = jdbcTemplate.queryForObject(checkSql, Integer.class, TEST_COMPANY_ID);
        
        if (count == null || count == 0) {
            // 고유한 사업자등록번호 생성 (UUID 기반)
            String uniqueBusinessNumber = TEST_COMPANY_ID.substring(0, 8) + "-" + TEST_COMPANY_ID.substring(9, 13);
            
            // 테스트용 회사 생성
            String insertSql = "INSERT INTO companies (id, company_name, business_registration_number, taxpayer_type) " +
                             "VALUES (?::uuid, ?, ?, 'CORPORATION') ON CONFLICT (id) DO NOTHING";
            jdbcTemplate.update(insertSql, TEST_COMPANY_ID, "테스트 회사 " + TEST_COMPANY_ID.substring(0, 8), uniqueBusinessNumber);
        }
    }

    /**
     * 테스트 데이터 정리
     * 테스트 완료 후 생성된 데이터를 안전하게 정리합니다.
     */
    protected void cleanupTestData() {
        try {
            if (TEST_COMPANY_ID != null) {
                // 1. 분개 상세 데이터 삭제 (외래키 순서 고려)
                jdbcTemplate.update("DELETE FROM journal_entry_details WHERE journal_entry_id IN " +
                        "(SELECT id FROM journal_entries WHERE company_id = ?::uuid)", TEST_COMPANY_ID);
                
                // 2. 분개 데이터 삭제
                jdbcTemplate.update("DELETE FROM journal_entries WHERE company_id = ?::uuid", TEST_COMPANY_ID);
                
                // 3. 총계정원장 데이터 삭제
                jdbcTemplate.update("DELETE FROM general_ledger WHERE company_id = ?::uuid", TEST_COMPANY_ID);
                
                // 4. 거래 데이터 삭제 (있다면)
                jdbcTemplate.update("DELETE FROM transactions WHERE company_id = ?::uuid", TEST_COMPANY_ID);
                
                // 5. 계정과목 삭제 (고유 prefix로 시작하는 것들)
                if (uniqueAccountPrefix != null) {
                    jdbcTemplate.update("DELETE FROM chart_of_accounts WHERE account_code LIKE ?", uniqueAccountPrefix + "%");
                }
                
                // 6. 테스트 회사 삭제
                jdbcTemplate.update("DELETE FROM companies WHERE id = ?::uuid", TEST_COMPANY_ID);
            }
        } catch (Exception e) {
            System.err.println("테스트 데이터 정리 실패: " + e.getMessage());
            // 정리 실패시에도 테스트는 계속 진행되도록 함
        }
    }

    /**
     * 계정과목이 존재하는지 확인하고 없으면 생성
     */
    protected void insertAccountIfNotExists(String accountCode, String accountName, String accountType, boolean isDebitNormal) {
        String checkSql = "SELECT COUNT(*) FROM chart_of_accounts WHERE account_code = ?";
        Integer count = jdbcTemplate.queryForObject(checkSql, Integer.class, accountCode);
        
        if (count == null || count == 0) {
            String insertSql = "INSERT INTO chart_of_accounts (account_code, account_name, account_type, is_debit_normal, is_active, display_order) " +
                             "VALUES (?, ?, ?, ?, true, 1) ON CONFLICT (account_code) DO NOTHING";
            jdbcTemplate.update(insertSql, accountCode, accountName, accountType, isDebitNormal);
        }
    }
}
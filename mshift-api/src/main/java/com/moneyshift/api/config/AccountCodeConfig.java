package com.moneyshift.api.config;

import org.springframework.stereotype.Component;
import java.util.Map;
import java.util.HashMap;

/**
 * 계정과목 코드 중앙 관리 설정
 * 
 * 모든 계정과목 관련 로직을 한 곳에서 관리하는 중앙화된 설정 클래스
 * - 실수 방지: 타이핑 오류 완전 차단
 * - 유지보수성: 계정과목 변경이 필요할 때 이 파일만 수정
 * - 일관성: 전체 시스템에서 동일한 계정과목 사용 보장
 * - 검증: 잘못된 계정과목 사용 시 즉시 오류 발생
 * 
 * @author MoneyShift Central Management Team
 * @version 1.0
 * @since 2025-07-25
 */
@Component
public class AccountCodeConfig {
    
    // === 중앙화된 계정과목 정의 ===
    public static final class Codes {
        // 자산
        public static final String CASH = "1000";
        public static final String BANK_DEPOSITS = "1100"; 
        public static final String OFFICE_SUPPLIES = "1200";
        public static final String ACCOUNTS_RECEIVABLE = "1300";
        
        // 부채
        public static final String ACCOUNTS_PAYABLE = "2000";
        public static final String SHORT_TERM_LOANS = "2100";
        
        // 자본 
        public static final String CAPITAL_STOCK = "3000";
        public static final String RETAINED_EARNINGS = "3100";
        public static final String CURRENT_YEAR_EARNINGS = "3200";
        
        // 수익
        public static final String SALES_REVENUE = "4000";
        public static final String NON_OPERATING_INCOME = "4100";
        
        // 비용
        public static final String OFFICE_SUPPLIES_EXPENSE = "5000";
        public static final String ENTERTAINMENT_EXPENSE = "5100";
        public static final String WELFARE_EXPENSE = "5120";
        public static final String COMMUNICATION_EXPENSE = "5130";
        public static final String TELEPHONE_EXPENSE = "5150";
    }
    
    // === 계정과목 메타데이터 맵 ===
    private static final Map<String, AccountInfo> ACCOUNT_INFO_MAP = new HashMap<>();
    
    static {
        // 자산 계정
        ACCOUNT_INFO_MAP.put(Codes.CASH, new AccountInfo("현금", "자산", true));
        ACCOUNT_INFO_MAP.put(Codes.BANK_DEPOSITS, new AccountInfo("예금", "자산", true));
        ACCOUNT_INFO_MAP.put(Codes.OFFICE_SUPPLIES, new AccountInfo("사무용품", "자산", true));
        ACCOUNT_INFO_MAP.put(Codes.ACCOUNTS_RECEIVABLE, new AccountInfo("미수금", "자산", true));
        
        // 부채 계정
        ACCOUNT_INFO_MAP.put(Codes.ACCOUNTS_PAYABLE, new AccountInfo("미지급금", "부채", false));
        ACCOUNT_INFO_MAP.put(Codes.SHORT_TERM_LOANS, new AccountInfo("단기차입금", "부채", false));
        
        // 자본 계정
        ACCOUNT_INFO_MAP.put(Codes.CAPITAL_STOCK, new AccountInfo("자본금", "자본", false));
        ACCOUNT_INFO_MAP.put(Codes.RETAINED_EARNINGS, new AccountInfo("이익잉여금", "자본", false));
        ACCOUNT_INFO_MAP.put(Codes.CURRENT_YEAR_EARNINGS, new AccountInfo("당기순이익", "자본", false));
        
        // 수익 계정
        ACCOUNT_INFO_MAP.put(Codes.SALES_REVENUE, new AccountInfo("매출", "수익", false));
        ACCOUNT_INFO_MAP.put(Codes.NON_OPERATING_INCOME, new AccountInfo("영업외수익", "수익", false));
        
        // 비용 계정
        ACCOUNT_INFO_MAP.put(Codes.OFFICE_SUPPLIES_EXPENSE, new AccountInfo("사무용품비", "비용", true));
        ACCOUNT_INFO_MAP.put(Codes.ENTERTAINMENT_EXPENSE, new AccountInfo("접대비", "비용", true));
        ACCOUNT_INFO_MAP.put(Codes.WELFARE_EXPENSE, new AccountInfo("복리후생비", "비용", true));
        ACCOUNT_INFO_MAP.put(Codes.COMMUNICATION_EXPENSE, new AccountInfo("통신비", "비용", true));
        ACCOUNT_INFO_MAP.put(Codes.TELEPHONE_EXPENSE, new AccountInfo("전화비", "비용", true));
    }
    
    /**
     * 계정과목 정보 조회 (중앙화된 메타데이터)
     */
    public static AccountInfo getAccountInfo(String code) {
        AccountInfo info = ACCOUNT_INFO_MAP.get(code);
        if (info == null) {
            throw new IllegalArgumentException("Unknown account code: " + code + 
                ". 계정과목이 AccountCodeConfig에 정의되지 않았습니다.");
        }
        return info;
    }
    
    /**
     * prefix와 함께 완전한 계정 코드 생성
     */
    public static String getFullCode(String prefix, String baseCode) {
        // 유효성 검증
        if (!ACCOUNT_INFO_MAP.containsKey(baseCode)) {
            throw new IllegalArgumentException("Invalid account code: " + baseCode);
        }
        return prefix + baseCode;
    }
    
    /**
     * 모든 정의된 계정과목 코드 반환
     */
    public static String[] getAllDefinedCodes() {
        return ACCOUNT_INFO_MAP.keySet().toArray(new String[0]);
    }
    
    /**
     * 계정과목 정보 클래스
     */
    public static class AccountInfo {
        private final String name;
        private final String type;
        private final boolean isDebitNormal;
        
        public AccountInfo(String name, String type, boolean isDebitNormal) {
            this.name = name;
            this.type = type;
            this.isDebitNormal = isDebitNormal;
        }
        
        public String getName() { return name; }
        public String getType() { return type; }
        public boolean isDebitNormal() { return isDebitNormal; }
    }
}
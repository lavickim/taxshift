package com.moneyshift.api.constant;

/**
 * 한국 표준 계정과목 코드 시스템
 * 
 * 로버스트한 회계 시스템을 위한 표준화된 계정과목 관리
 * - 타입 안전성 보장
 * - 의미론적 명확성 제공
 * - 계층 구조 지원
 * - 검증 및 매핑 자동화
 * 
 * @author MoneyShift Robust System Team
 * @version 2.0 - Type-Safe Edition
 * @since 2025-07-25
 */
public enum StandardAccountCodes {
    
    // === 자산 계정 (1000-1999) ===
    CASH("1000", "현금", AccountType.ASSET, true),
    BANK_DEPOSITS("1100", "예금", AccountType.ASSET, true),
    OFFICE_SUPPLIES("1200", "사무용품", AccountType.ASSET, true),
    ACCOUNTS_RECEIVABLE("1300", "미수금", AccountType.ASSET, true),
    INVENTORY("1400", "재고자산", AccountType.ASSET, true),
    PREPAID_EXPENSES("1500", "선급비용", AccountType.ASSET, true),
    
    // === 부채 계정 (2000-2999) ===
    ACCOUNTS_PAYABLE("2000", "미지급금", AccountType.LIABILITY, false),
    SHORT_TERM_LOANS("2100", "단기차입금", AccountType.LIABILITY, false),
    ACCRUED_EXPENSES("2200", "미지급비용", AccountType.LIABILITY, false),
    
    // === 자본 계정 (3000-3999) ===
    CAPITAL_STOCK("3000", "자본금", AccountType.EQUITY, false),
    RETAINED_EARNINGS("3100", "이익잉여금", AccountType.EQUITY, false),
    CURRENT_YEAR_EARNINGS("3200", "당기순이익", AccountType.EQUITY, false),
    
    // === 수익 계정 (4000-4999) ===
    SALES_REVENUE("4000", "매출", AccountType.REVENUE, false),
    SERVICE_REVENUE("4100", "용역매출", AccountType.REVENUE, false),
    NON_OPERATING_INCOME("4200", "영업외수익", AccountType.REVENUE, false),
    
    // === 비용 계정 (5000-5999) ===
    OFFICE_SUPPLIES_EXPENSE("5000", "사무용품비", AccountType.EXPENSE, true),
    ENTERTAINMENT_EXPENSE("5100", "접대비", AccountType.EXPENSE, true),
    WELFARE_EXPENSE("5120", "복리후생비", AccountType.EXPENSE, true),
    COMMUNICATION_EXPENSE("5130", "통신비", AccountType.EXPENSE, true),
    TELEPHONE_EXPENSE("5150", "전화비", AccountType.EXPENSE, true),
    TRAVEL_EXPENSE("5200", "여비교통비", AccountType.EXPENSE, true),
    RENT_EXPENSE("5300", "임차료", AccountType.EXPENSE, true),
    UTILITIES_EXPENSE("5400", "수도광열비", AccountType.EXPENSE, true),
    DEPRECIATION_EXPENSE("5500", "감가상각비", AccountType.EXPENSE, true);
    
    private final String code;
    private final String name;
    private final AccountType type;
    private final boolean isDebitNormal;
    
    StandardAccountCodes(String code, String name, AccountType type, boolean isDebitNormal) {
        this.code = code;
        this.name = name;
        this.type = type;
        this.isDebitNormal = isDebitNormal;
    }
    
    public String getCode() { return code; }
    public String getName() { return name; }
    public AccountType getType() { return type; }
    public boolean isDebitNormal() { return isDebitNormal; }
    
    /**
     * 계정과목 코드로 enum 검색
     */
    public static StandardAccountCodes fromCode(String code) {
        for (StandardAccountCodes account : values()) {
            if (account.code.equals(code)) {
                return account;
            }
        }
        throw new IllegalArgumentException("Unknown account code: " + code);
    }
    
    /**
     * prefix와 함께 완전한 계정 코드 생성
     */
    public String getCodeWithPrefix(String prefix) {
        return prefix + code;
    }
    
    /**
     * 계정 유형별 필터링
     */
    public static StandardAccountCodes[] getAccountsByType(AccountType type) {
        return java.util.Arrays.stream(values())
                .filter(account -> account.type == type)
                .toArray(StandardAccountCodes[]::new);
    }
    
    public enum AccountType {
        ASSET("자산"),
        LIABILITY("부채"), 
        EQUITY("자본"),
        REVENUE("수익"),
        EXPENSE("비용");
        
        private final String koreanName;
        
        AccountType(String koreanName) {
            this.koreanName = koreanName;
        }
        
        public String getKoreanName() { return koreanName; }
    }
}
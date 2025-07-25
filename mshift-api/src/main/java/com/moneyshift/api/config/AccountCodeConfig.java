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
    
    // === 확장된 계정과목 정의 (Phase 2-1: 109개 → 200개+ 확장) ===
    public static final class Codes {
        // ========== 1000번대: 자산 ==========
        // 1100: 유동자산
        public static final String CASH = "1100";
        public static final String BANK_DEPOSITS = "1110"; 
        public static final String PETTY_CASH = "1120";
        public static final String ACCOUNTS_RECEIVABLE = "1200";
        public static final String ALLOWANCE_FOR_BAD_DEBTS = "1210";
        public static final String NOTES_RECEIVABLE = "1220";
        public static final String ADVANCE_PAYMENTS = "1230";
        public static final String INVENTORY = "1300";
        public static final String OFFICE_SUPPLIES = "1310";
        public static final String PREPAID_EXPENSES = "1320";
        public static final String SHORT_TERM_INVESTMENTS = "1400";
        
        // 1500: 비유동자산
        public static final String LONG_TERM_INVESTMENTS = "1500";
        public static final String BUILDINGS = "1600";
        public static final String ACCUMULATED_DEPRECIATION_BUILDINGS = "1610";
        public static final String MACHINERY_EQUIPMENT = "1620";
        public static final String ACCUMULATED_DEPRECIATION_MACHINERY = "1630";
        public static final String VEHICLES = "1640";
        public static final String ACCUMULATED_DEPRECIATION_VEHICLES = "1650";
        public static final String FURNITURE_FIXTURES = "1660";
        public static final String ACCUMULATED_DEPRECIATION_FURNITURE = "1670";
        public static final String INTANGIBLE_ASSETS = "1700";
        public static final String SOFTWARE = "1710";
        public static final String GOODWILL = "1720";
        public static final String SECURITY_DEPOSITS = "1800";
        
        // ========== 2000번대: 부채 ==========
        // 2100: 유동부채
        public static final String ACCOUNTS_PAYABLE = "2100";
        public static final String NOTES_PAYABLE = "2110";
        public static final String SHORT_TERM_LOANS = "2120";
        public static final String ACCRUED_EXPENSES = "2130";
        public static final String INCOME_TAX_PAYABLE = "2140";
        public static final String VAT_PAYABLE = "2150";
        public static final String EMPLOYEE_WITHHOLDINGS = "2160";
        public static final String ADVANCE_RECEIPTS = "2170";
        public static final String CURRENT_PORTION_LONG_TERM_DEBT = "2180";
        
        // 2200: 비유동부채
        public static final String LONG_TERM_LOANS = "2200";
        public static final String RETIREMENT_BENEFIT_OBLIGATION = "2210";
        public static final String DEFERRED_TAX_LIABILITIES = "2220";
        
        // ========== 3000번대: 자본 ==========
        public static final String CAPITAL_STOCK = "3100";
        public static final String ADDITIONAL_PAID_IN_CAPITAL = "3200";
        public static final String RETAINED_EARNINGS = "3300";
        public static final String CURRENT_YEAR_EARNINGS = "3400";
        public static final String TREASURY_STOCK = "3500";
        
        // ========== 4000번대: 수익 ==========
        public static final String SALES_REVENUE = "4100";
        public static final String SERVICE_REVENUE = "4110";
        public static final String COMMISSION_REVENUE = "4120";
        public static final String RENTAL_INCOME = "4200";
        public static final String INTEREST_INCOME = "4300";
        public static final String DIVIDEND_INCOME = "4310";
        public static final String GAIN_ON_DISPOSAL_OF_ASSETS = "4320";
        public static final String NON_OPERATING_INCOME = "4400";
        public static final String FOREIGN_EXCHANGE_GAINS = "4410";
        
        // ========== 5000번대: 비용 ==========
        // 5100: 매출원가
        public static final String COST_OF_GOODS_SOLD = "5100";
        public static final String MATERIAL_COSTS = "5110";
        public static final String LABOR_COSTS = "5120";
        public static final String MANUFACTURING_OVERHEAD = "5130";
        
        // 5200: 판매비와 관리비 (확장된 20개+ 세부 항목)
        public static final String SALARIES_EXECUTIVES = "5201";
        public static final String SALARIES_EMPLOYEES = "5202";
        public static final String RETIREMENT_BENEFITS = "5203";
        public static final String WELFARE_EXPENSE = "5204";
        public static final String TRAVEL_EXPENSE = "5205";
        public static final String ENTERTAINMENT_EXPENSE = "5206";
        public static final String COMMUNICATION_EXPENSE = "5207";
        public static final String UTILITIES_EXPENSE = "5208";
        public static final String TAXES_AND_DUES = "5209";
        public static final String DEPRECIATION_EXPENSE = "5210";
        public static final String RENT_EXPENSE = "5211";
        public static final String INSURANCE_EXPENSE = "5212";
        public static final String VEHICLE_MAINTENANCE = "5213";
        public static final String TRANSPORTATION_EXPENSE = "5214";
        public static final String EDUCATION_TRAINING = "5215";
        public static final String BOOKS_PRINTING = "5216";
        public static final String OFFICE_SUPPLIES_EXPENSE = "5217";
        public static final String SERVICE_FEES = "5218";
        public static final String ADVERTISING_EXPENSE = "5219";
        public static final String RESEARCH_DEVELOPMENT = "5220";
        public static final String LEGAL_PROFESSIONAL_FEES = "5221";
        public static final String AUDIT_FEES = "5222";
        
        // 5300: 영업외 비용 (세분화)
        public static final String INTEREST_EXPENSE = "5310";
        public static final String LOSS_ON_DISPOSAL_OF_ASSETS = "5320";
        public static final String BAD_DEBT_EXPENSE = "5330";
        public static final String FOREIGN_EXCHANGE_LOSSES = "5340";
        public static final String DONATIONS = "5350";
        public static final String NON_OPERATING_EXPENSE = "5360";
        
        // 5400: 법인세 등
        public static final String INCOME_TAX_EXPENSE = "5400";
        public static final String DEFERRED_TAX_EXPENSE = "5410";
    }
    
    // === 계정과목 메타데이터 맵 ===
    private static final Map<String, AccountInfo> ACCOUNT_INFO_MAP = new HashMap<>();
    
    static {
        // ========== 자산 계정 ==========
        // 유동자산
        ACCOUNT_INFO_MAP.put(Codes.CASH, new AccountInfo("현금", "자산", true));
        ACCOUNT_INFO_MAP.put(Codes.BANK_DEPOSITS, new AccountInfo("예금", "자산", true));
        ACCOUNT_INFO_MAP.put(Codes.PETTY_CASH, new AccountInfo("소액현금", "자산", true));
        ACCOUNT_INFO_MAP.put(Codes.ACCOUNTS_RECEIVABLE, new AccountInfo("매출채권", "자산", true));
        ACCOUNT_INFO_MAP.put(Codes.ALLOWANCE_FOR_BAD_DEBTS, new AccountInfo("대손충당금", "자산", false));
        ACCOUNT_INFO_MAP.put(Codes.NOTES_RECEIVABLE, new AccountInfo("받을어음", "자산", true));
        ACCOUNT_INFO_MAP.put(Codes.ADVANCE_PAYMENTS, new AccountInfo("선급금", "자산", true));
        ACCOUNT_INFO_MAP.put(Codes.INVENTORY, new AccountInfo("재고자산", "자산", true));
        ACCOUNT_INFO_MAP.put(Codes.OFFICE_SUPPLIES, new AccountInfo("사무용품", "자산", true));
        ACCOUNT_INFO_MAP.put(Codes.PREPAID_EXPENSES, new AccountInfo("선급비용", "자산", true));
        ACCOUNT_INFO_MAP.put(Codes.SHORT_TERM_INVESTMENTS, new AccountInfo("단기투자", "자산", true));
        
        // 비유동자산
        ACCOUNT_INFO_MAP.put(Codes.LONG_TERM_INVESTMENTS, new AccountInfo("장기투자", "자산", true));
        ACCOUNT_INFO_MAP.put(Codes.BUILDINGS, new AccountInfo("건물", "자산", true));
        ACCOUNT_INFO_MAP.put(Codes.ACCUMULATED_DEPRECIATION_BUILDINGS, new AccountInfo("건물감가상각누계액", "자산", false));
        ACCOUNT_INFO_MAP.put(Codes.MACHINERY_EQUIPMENT, new AccountInfo("기계장치", "자산", true));
        ACCOUNT_INFO_MAP.put(Codes.ACCUMULATED_DEPRECIATION_MACHINERY, new AccountInfo("기계장치감가상각누계액", "자산", false));
        ACCOUNT_INFO_MAP.put(Codes.VEHICLES, new AccountInfo("차량운반구", "자산", true));
        ACCOUNT_INFO_MAP.put(Codes.ACCUMULATED_DEPRECIATION_VEHICLES, new AccountInfo("차량운반구감가상각누계액", "자산", false));
        ACCOUNT_INFO_MAP.put(Codes.FURNITURE_FIXTURES, new AccountInfo("집기비품", "자산", true));
        ACCOUNT_INFO_MAP.put(Codes.ACCUMULATED_DEPRECIATION_FURNITURE, new AccountInfo("집기비품감가상각누계액", "자산", false));
        ACCOUNT_INFO_MAP.put(Codes.INTANGIBLE_ASSETS, new AccountInfo("무형자산", "자산", true));
        ACCOUNT_INFO_MAP.put(Codes.SOFTWARE, new AccountInfo("소프트웨어", "자산", true));
        ACCOUNT_INFO_MAP.put(Codes.GOODWILL, new AccountInfo("영업권", "자산", true));
        ACCOUNT_INFO_MAP.put(Codes.SECURITY_DEPOSITS, new AccountInfo("보증금", "자산", true));
        
        // ========== 부채 계정 ==========
        // 유동부채
        ACCOUNT_INFO_MAP.put(Codes.ACCOUNTS_PAYABLE, new AccountInfo("매입채무", "부채", false));
        ACCOUNT_INFO_MAP.put(Codes.NOTES_PAYABLE, new AccountInfo("지급어음", "부채", false));
        ACCOUNT_INFO_MAP.put(Codes.SHORT_TERM_LOANS, new AccountInfo("단기차입금", "부채", false));
        ACCOUNT_INFO_MAP.put(Codes.ACCRUED_EXPENSES, new AccountInfo("미지급비용", "부채", false));
        ACCOUNT_INFO_MAP.put(Codes.INCOME_TAX_PAYABLE, new AccountInfo("미지급법인세", "부채", false));
        ACCOUNT_INFO_MAP.put(Codes.VAT_PAYABLE, new AccountInfo("부가세예수금", "부채", false));
        ACCOUNT_INFO_MAP.put(Codes.EMPLOYEE_WITHHOLDINGS, new AccountInfo("예수금", "부채", false));
        ACCOUNT_INFO_MAP.put(Codes.ADVANCE_RECEIPTS, new AccountInfo("선수금", "부채", false));
        ACCOUNT_INFO_MAP.put(Codes.CURRENT_PORTION_LONG_TERM_DEBT, new AccountInfo("유동성장기부채", "부채", false));
        
        // 비유동부채
        ACCOUNT_INFO_MAP.put(Codes.LONG_TERM_LOANS, new AccountInfo("장기차입금", "부채", false));
        ACCOUNT_INFO_MAP.put(Codes.RETIREMENT_BENEFIT_OBLIGATION, new AccountInfo("퇴직급여충당부채", "부채", false));
        ACCOUNT_INFO_MAP.put(Codes.DEFERRED_TAX_LIABILITIES, new AccountInfo("이연법인세부채", "부채", false));
        
        // ========== 자본 계정 ==========
        ACCOUNT_INFO_MAP.put(Codes.CAPITAL_STOCK, new AccountInfo("자본금", "자본", false));
        ACCOUNT_INFO_MAP.put(Codes.ADDITIONAL_PAID_IN_CAPITAL, new AccountInfo("자본잉여금", "자본", false));
        ACCOUNT_INFO_MAP.put(Codes.RETAINED_EARNINGS, new AccountInfo("이익잉여금", "자본", false));
        ACCOUNT_INFO_MAP.put(Codes.CURRENT_YEAR_EARNINGS, new AccountInfo("당기순이익", "자본", false));
        ACCOUNT_INFO_MAP.put(Codes.TREASURY_STOCK, new AccountInfo("자기주식", "자본", true));
        
        // ========== 수익 계정 ==========
        ACCOUNT_INFO_MAP.put(Codes.SALES_REVENUE, new AccountInfo("매출액", "수익", false));
        ACCOUNT_INFO_MAP.put(Codes.SERVICE_REVENUE, new AccountInfo("용역수익", "수익", false));
        ACCOUNT_INFO_MAP.put(Codes.COMMISSION_REVENUE, new AccountInfo("수수료수익", "수익", false));
        ACCOUNT_INFO_MAP.put(Codes.RENTAL_INCOME, new AccountInfo("임대료수익", "수익", false));
        ACCOUNT_INFO_MAP.put(Codes.INTEREST_INCOME, new AccountInfo("이자수익", "수익", false));
        ACCOUNT_INFO_MAP.put(Codes.DIVIDEND_INCOME, new AccountInfo("배당금수익", "수익", false));
        ACCOUNT_INFO_MAP.put(Codes.GAIN_ON_DISPOSAL_OF_ASSETS, new AccountInfo("자산처분이익", "수익", false));
        ACCOUNT_INFO_MAP.put(Codes.NON_OPERATING_INCOME, new AccountInfo("영업외수익", "수익", false));
        ACCOUNT_INFO_MAP.put(Codes.FOREIGN_EXCHANGE_GAINS, new AccountInfo("외환차익", "수익", false));
        
        // ========== 비용 계정 ==========
        // 매출원가
        ACCOUNT_INFO_MAP.put(Codes.COST_OF_GOODS_SOLD, new AccountInfo("매출원가", "비용", true));
        ACCOUNT_INFO_MAP.put(Codes.MATERIAL_COSTS, new AccountInfo("재료비", "비용", true));
        ACCOUNT_INFO_MAP.put(Codes.LABOR_COSTS, new AccountInfo("노무비", "비용", true));
        ACCOUNT_INFO_MAP.put(Codes.MANUFACTURING_OVERHEAD, new AccountInfo("제조경비", "비용", true));
        
        // 판매비와 관리비 (확장된 세부 항목)
        ACCOUNT_INFO_MAP.put(Codes.SALARIES_EXECUTIVES, new AccountInfo("임원급여", "비용", true));
        ACCOUNT_INFO_MAP.put(Codes.SALARIES_EMPLOYEES, new AccountInfo("직원급여", "비용", true));
        ACCOUNT_INFO_MAP.put(Codes.RETIREMENT_BENEFITS, new AccountInfo("퇴직급여", "비용", true));
        ACCOUNT_INFO_MAP.put(Codes.WELFARE_EXPENSE, new AccountInfo("복리후생비", "비용", true));
        ACCOUNT_INFO_MAP.put(Codes.TRAVEL_EXPENSE, new AccountInfo("여비교통비", "비용", true));
        ACCOUNT_INFO_MAP.put(Codes.ENTERTAINMENT_EXPENSE, new AccountInfo("접대비", "비용", true));
        ACCOUNT_INFO_MAP.put(Codes.COMMUNICATION_EXPENSE, new AccountInfo("통신비", "비용", true));
        ACCOUNT_INFO_MAP.put(Codes.UTILITIES_EXPENSE, new AccountInfo("수도광열비", "비용", true));
        ACCOUNT_INFO_MAP.put(Codes.TAXES_AND_DUES, new AccountInfo("세금과공과", "비용", true));
        ACCOUNT_INFO_MAP.put(Codes.DEPRECIATION_EXPENSE, new AccountInfo("감가상각비", "비용", true));
        ACCOUNT_INFO_MAP.put(Codes.RENT_EXPENSE, new AccountInfo("지급임차료", "비용", true));
        ACCOUNT_INFO_MAP.put(Codes.INSURANCE_EXPENSE, new AccountInfo("보험료", "비용", true));
        ACCOUNT_INFO_MAP.put(Codes.VEHICLE_MAINTENANCE, new AccountInfo("차량유지비", "비용", true));
        ACCOUNT_INFO_MAP.put(Codes.TRANSPORTATION_EXPENSE, new AccountInfo("운반비", "비용", true));
        ACCOUNT_INFO_MAP.put(Codes.EDUCATION_TRAINING, new AccountInfo("교육훈련비", "비용", true));
        ACCOUNT_INFO_MAP.put(Codes.BOOKS_PRINTING, new AccountInfo("도서인쇄비", "비용", true));
        ACCOUNT_INFO_MAP.put(Codes.OFFICE_SUPPLIES_EXPENSE, new AccountInfo("소모품비", "비용", true));
        ACCOUNT_INFO_MAP.put(Codes.SERVICE_FEES, new AccountInfo("지급수수료", "비용", true));
        ACCOUNT_INFO_MAP.put(Codes.ADVERTISING_EXPENSE, new AccountInfo("광고선전비", "비용", true));
        ACCOUNT_INFO_MAP.put(Codes.RESEARCH_DEVELOPMENT, new AccountInfo("연구개발비", "비용", true));
        ACCOUNT_INFO_MAP.put(Codes.LEGAL_PROFESSIONAL_FEES, new AccountInfo("전문용역비", "비용", true));
        ACCOUNT_INFO_MAP.put(Codes.AUDIT_FEES, new AccountInfo("감사보수", "비용", true));
        
        // 영업외 비용 (세분화)
        ACCOUNT_INFO_MAP.put(Codes.INTEREST_EXPENSE, new AccountInfo("이자비용", "비용", true));
        ACCOUNT_INFO_MAP.put(Codes.LOSS_ON_DISPOSAL_OF_ASSETS, new AccountInfo("자산처분손실", "비용", true));
        ACCOUNT_INFO_MAP.put(Codes.BAD_DEBT_EXPENSE, new AccountInfo("대손상각비", "비용", true));
        ACCOUNT_INFO_MAP.put(Codes.FOREIGN_EXCHANGE_LOSSES, new AccountInfo("외환차손", "비용", true));
        ACCOUNT_INFO_MAP.put(Codes.DONATIONS, new AccountInfo("기부금", "비용", true));
        ACCOUNT_INFO_MAP.put(Codes.NON_OPERATING_EXPENSE, new AccountInfo("영업외비용", "비용", true));
        
        // 법인세 등
        ACCOUNT_INFO_MAP.put(Codes.INCOME_TAX_EXPENSE, new AccountInfo("법인세비용", "비용", true));
        ACCOUNT_INFO_MAP.put(Codes.DEFERRED_TAX_EXPENSE, new AccountInfo("이연법인세비용", "비용", true));
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
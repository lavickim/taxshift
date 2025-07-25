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
    
    // === 확장된 계정과목 정의 (Phase 2-1: 84개 → 200개+ 확장 완료) ===
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
        
        // 1400-1450: 기타 유동자산
        public static final String ACCRUED_INCOME = "1410";
        public static final String TEMPORARY_PAYMENTS = "1420";
        public static final String DEPOSITS_FOR_PURCHASES = "1430";
        public static final String VAT_REFUNDABLE = "1440";
        public static final String WITHHOLDING_TAX_RECEIVABLE = "1450";
        
        // 1500: 비유동자산
        public static final String LONG_TERM_INVESTMENTS = "1500";
        public static final String INVESTMENT_SECURITIES = "1510";
        public static final String INVESTMENT_REAL_ESTATE = "1520";
        public static final String SUBSIDIARIES_INVESTMENT = "1530";
        public static final String JOINT_VENTURE_INVESTMENT = "1540";
        
        // 1600-1690: 유형자산
        public static final String BUILDINGS = "1600";
        public static final String ACCUMULATED_DEPRECIATION_BUILDINGS = "1610";
        public static final String LAND = "1620";
        public static final String CONSTRUCTION_IN_PROGRESS = "1630";
        public static final String MACHINERY_EQUIPMENT = "1640";
        public static final String ACCUMULATED_DEPRECIATION_MACHINERY = "1650";
        public static final String VEHICLES = "1660";
        public static final String ACCUMULATED_DEPRECIATION_VEHICLES = "1670";
        public static final String FURNITURE_FIXTURES = "1680";
        public static final String ACCUMULATED_DEPRECIATION_FURNITURE = "1690";
        
        // 1700-1790: 무형자산
        public static final String INTANGIBLE_ASSETS = "1700";
        public static final String SOFTWARE = "1710";
        public static final String PATENTS = "1720";
        public static final String TRADEMARKS = "1730";
        public static final String COPYRIGHTS = "1740";
        public static final String GOODWILL = "1750";
        public static final String DEVELOPMENT_COSTS = "1760";
        public static final String CUSTOMER_RELATIONSHIPS = "1770";
        public static final String ACCUMULATED_AMORTIZATION_INTANGIBLE = "1780";
        public static final String RESEARCH_COSTS = "1790";
        
        // 1800-1890: 기타 비유동자산  
        public static final String SECURITY_DEPOSITS = "1800";
        public static final String LONG_TERM_PREPAID_EXPENSES = "1810";
        public static final String LONG_TERM_RECEIVABLES = "1820";
        public static final String DEFERRED_TAX_ASSETS = "1830";
        public static final String INVESTMENT_PROPERTY = "1840";
        public static final String BIOLOGICAL_ASSETS = "1850";
        public static final String GUARANTEE_DEPOSITS_PAID = "1860";
        public static final String CLUB_MEMBERSHIPS = "1870";
        public static final String ART_WORKS = "1880";
        public static final String OTHER_NON_CURRENT_ASSETS = "1890";
        
        // ========== 2000번대: 부채 ==========
        // 2100-2190: 유동부채
        public static final String ACCOUNTS_PAYABLE = "2100";
        public static final String NOTES_PAYABLE = "2110";
        public static final String SHORT_TERM_LOANS = "2120";
        public static final String ACCRUED_EXPENSES = "2130";
        public static final String INCOME_TAX_PAYABLE = "2140";
        public static final String VAT_PAYABLE = "2150";
        public static final String EMPLOYEE_WITHHOLDINGS = "2160";
        public static final String ADVANCE_RECEIPTS = "2170";
        public static final String CURRENT_PORTION_LONG_TERM_DEBT = "2180";
        public static final String ACCRUED_SALARIES = "2181";
        public static final String ACCRUED_INTEREST = "2182";
        public static final String ACCRUED_UTILITIES = "2183";
        public static final String DIVIDEND_PAYABLE = "2184";
        public static final String CUSTOMER_DEPOSITS = "2185";
        public static final String WARRANTY_PROVISIONS = "2186";
        public static final String SALES_TAX_PAYABLE = "2187";
        public static final String SOCIAL_INSURANCE_PAYABLE = "2188";
        public static final String OTHER_CURRENT_LIABILITIES = "2190";
        
        // 2200-2290: 비유동부채
        public static final String LONG_TERM_LOANS = "2200";
        public static final String CORPORATE_BONDS = "2210";
        public static final String RETIREMENT_BENEFIT_OBLIGATION = "2220";
        public static final String DEFERRED_TAX_LIABILITIES = "2230";
        public static final String LONG_TERM_LEASE_LIABILITIES = "2240";
        public static final String ASSET_RETIREMENT_OBLIGATIONS = "2250";
        public static final String ENVIRONMENTAL_LIABILITIES = "2260";
        public static final String LITIGATION_PROVISIONS = "2270";
        public static final String RESTRUCTURING_PROVISIONS = "2280";
        public static final String OTHER_NON_CURRENT_LIABILITIES = "2290";
        
        // ========== 3000번대: 자본 ==========
        // 3100-3190: 자본금 관련
        public static final String CAPITAL_STOCK = "3100";
        public static final String PREFERRED_STOCK = "3110";
        public static final String COMMON_STOCK = "3120";
        public static final String STOCK_SUBSCRIPTION_RIGHTS = "3130";
        public static final String STOCK_OPTIONS = "3140";
        
        // 3200-3290: 자본잉여금
        public static final String ADDITIONAL_PAID_IN_CAPITAL = "3200";
        public static final String CAPITAL_SURPLUS_REVALUATION = "3210";
        public static final String CAPITAL_SURPLUS_MERGER = "3220";
        public static final String CAPITAL_SURPLUS_TREASURY_STOCK = "3230";
        public static final String CAPITAL_SURPLUS_CONVERSION = "3240";
        
        // 3300-3390: 이익잉여금
        public static final String RETAINED_EARNINGS = "3300";
        public static final String LEGAL_RESERVE = "3310";
        public static final String VOLUNTARY_RESERVE = "3320";
        public static final String SPECIAL_RESERVE = "3330";
        public static final String UNAPPROPRIATED_RETAINED_EARNINGS = "3340";
        
        // 3400-3490: 기타 자본항목
        public static final String CURRENT_YEAR_EARNINGS = "3400";
        public static final String TREASURY_STOCK = "3410";
        public static final String ACCUMULATED_OTHER_COMPREHENSIVE_INCOME = "3420";
        public static final String FOREIGN_CURRENCY_TRANSLATION = "3430";
        public static final String UNREALIZED_GAIN_LOSS_SECURITIES = "3440";
        public static final String REVALUATION_SURPLUS = "3450";
        public static final String NON_CONTROLLING_INTERESTS = "3460";
        
        // ========== 4000번대: 수익 ==========
        // 4100-4190: 영업수익
        public static final String SALES_REVENUE = "4100";
        public static final String SERVICE_REVENUE = "4110";
        public static final String COMMISSION_REVENUE = "4120";
        public static final String FRANCHISE_REVENUE = "4130";
        public static final String MEMBERSHIP_REVENUE = "4140";
        public static final String SUBSCRIPTION_REVENUE = "4150";
        public static final String CONSULTING_REVENUE = "4160";
        public static final String TRAINING_REVENUE = "4170";
        public static final String MAINTENANCE_REVENUE = "4180";
        public static final String INSTALLATION_REVENUE = "4190";
        
        // 4200-4290: 기타 영업수익
        public static final String RENTAL_INCOME = "4200";
        public static final String ROYALTY_INCOME = "4210";
        public static final String LICENSE_INCOME = "4220";
        public static final String PATENT_INCOME = "4230";
        public static final String TRADEMARK_INCOME = "4240";
        
        // 4300-4390: 영업외수익
        public static final String INTEREST_INCOME = "4300";
        public static final String DIVIDEND_INCOME = "4310";
        public static final String GAIN_ON_DISPOSAL_OF_ASSETS = "4320";
        public static final String GAIN_ON_SALE_OF_INVESTMENTS = "4330";
        public static final String FOREIGN_EXCHANGE_GAINS = "4340";
        public static final String GOVERNMENT_GRANTS = "4350";
        public static final String INSURANCE_CLAIMS = "4360";
        public static final String REVERSAL_OF_PROVISIONS = "4370";
        public static final String MISCELLANEOUS_INCOME = "4380";
        public static final String NON_OPERATING_INCOME = "4390";
        
        // ========== 5000번대: 비용 ==========
        // 5100: 매출원가
        public static final String COST_OF_GOODS_SOLD = "5100";
        public static final String MATERIAL_COSTS = "5110";
        public static final String LABOR_COSTS = "5120";
        public static final String MANUFACTURING_OVERHEAD = "5130";
        
        // 5200: 판매비와 관리비 (확장된 40개+ 세부 항목)
        // 5201-5210: 인건비 관련
        public static final String SALARIES_EXECUTIVES = "5201";
        public static final String SALARIES_EMPLOYEES = "5202";
        public static final String RETIREMENT_BENEFITS = "5203";
        public static final String WELFARE_EXPENSE = "5204";
        public static final String BONUS_EXECUTIVES = "5205";
        public static final String BONUS_EMPLOYEES = "5206";
        public static final String OVERTIME_ALLOWANCE = "5207";
        public static final String MEAL_ALLOWANCE = "5208";
        public static final String TRANSPORTATION_ALLOWANCE = "5209";
        public static final String NATIONAL_PENSION = "5210";
        
        // 5211-5220: 사업관련 비용
        public static final String TRAVEL_EXPENSE = "5211";
        public static final String ENTERTAINMENT_EXPENSE = "5212";
        public static final String COMMUNICATION_EXPENSE = "5213";
        public static final String UTILITIES_EXPENSE = "5214";
        public static final String RENT_EXPENSE = "5215";
        public static final String INSURANCE_EXPENSE = "5216";
        public static final String VEHICLE_MAINTENANCE = "5217";
        public static final String TRANSPORTATION_EXPENSE = "5218";
        public static final String FUEL_EXPENSE = "5219";
        public static final String PARKING_TOLLS = "5220";
        
        // 5221-5230: 사무 및 관리비용
        public static final String OFFICE_SUPPLIES_EXPENSE = "5221";
        public static final String BOOKS_PRINTING = "5222";
        public static final String POSTAGE_EXPENSE = "5223";
        public static final String CONSUMABLE_SUPPLIES = "5224";
        public static final String CLEANING_EXPENSE = "5225";
        public static final String SECURITY_EXPENSE = "5226";
        public static final String MAINTENANCE_EXPENSE = "5227";
        public static final String REPAIR_EXPENSE = "5228";
        public static final String SUBSCRIPTION_FEES = "5229";
        public static final String MEMBERSHIP_FEES = "5230";
        
        // 5231-5240: 세금 및 공과금
        public static final String TAXES_AND_DUES = "5231";
        public static final String PROPERTY_TAX = "5232";
        public static final String ACQUISITION_TAX = "5233";
        public static final String REGISTRATION_TAX = "5234";
        public static final String BUSINESS_LICENSE_TAX = "5235";
        public static final String AUTOMOBILE_TAX = "5236";
        public static final String STAMP_TAX = "5237";
        public static final String ENVIRONMENT_TAX = "5238";
        public static final String LOCAL_INCOME_TAX = "5239";
        public static final String OTHER_TAXES = "5240";
        
        // 5241-5250: 감가상각 및 상각비
        public static final String DEPRECIATION_EXPENSE = "5241";
        public static final String DEPRECIATION_BUILDINGS = "5242";
        public static final String DEPRECIATION_VEHICLES = "5243";
        public static final String DEPRECIATION_FURNITURE = "5244";
        public static final String DEPRECIATION_MACHINERY = "5245";
        public static final String AMORTIZATION_SOFTWARE = "5246";
        public static final String AMORTIZATION_INTANGIBLE = "5247";
        public static final String DEPLETION_EXPENSE = "5248";
        public static final String IMPAIRMENT_LOSS = "5249";
        public static final String ASSET_RETIREMENT_COST = "5250";
        
        // 5251-5260: 전문서비스 및 수수료
        public static final String SERVICE_FEES = "5251";
        public static final String LEGAL_PROFESSIONAL_FEES = "5252";
        public static final String AUDIT_FEES = "5253";
        public static final String TAX_SERVICE_FEES = "5254";
        public static final String CONSULTING_FEES = "5255";
        public static final String ACCOUNTING_FEES = "5256";
        public static final String DESIGN_FEES = "5257";
        public static final String SYSTEM_DEVELOPMENT_FEES = "5258";
        public static final String OUTSOURCING_FEES = "5259";
        public static final String TECHNICAL_SUPPORT_FEES = "5260";
        
        // 5261-5270: 마케팅 및 판촉
        public static final String ADVERTISING_EXPENSE = "5261";
        public static final String PROMOTION_EXPENSE = "5262";
        public static final String MARKETING_EXPENSE = "5263";
        public static final String EXHIBITION_EXPENSE = "5264";
        public static final String SAMPLE_EXPENSE = "5265";
        public static final String CATALOG_EXPENSE = "5266";
        public static final String WEBSITE_MAINTENANCE = "5267";
        public static final String SOCIAL_MEDIA_EXPENSE = "5268";
        public static final String EVENT_EXPENSE = "5269";
        public static final String CUSTOMER_SERVICE_EXPENSE = "5270";
        
        // 5271-5280: 교육 및 연구개발
        public static final String EDUCATION_TRAINING = "5271";
        public static final String RESEARCH_DEVELOPMENT = "5272";
        public static final String PATENT_EXPENSE = "5273";
        public static final String LICENSE_FEES = "5274";
        public static final String TRAINING_MATERIALS = "5275";
        public static final String CONFERENCE_EXPENSE = "5276";
        public static final String SEMINAR_EXPENSE = "5277";
        public static final String CERTIFICATION_FEES = "5278";
        public static final String TECHNICAL_BOOKS = "5279";
        public static final String SOFTWARE_LICENSE = "5280";
        
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
        
        // 기타 유동자산
        ACCOUNT_INFO_MAP.put(Codes.ACCRUED_INCOME, new AccountInfo("미수수익", "자산", true));
        ACCOUNT_INFO_MAP.put(Codes.TEMPORARY_PAYMENTS, new AccountInfo("가지급금", "자산", true));
        ACCOUNT_INFO_MAP.put(Codes.DEPOSITS_FOR_PURCHASES, new AccountInfo("구매예치금", "자산", true));
        ACCOUNT_INFO_MAP.put(Codes.VAT_REFUNDABLE, new AccountInfo("부가세환급금", "자산", true));
        ACCOUNT_INFO_MAP.put(Codes.WITHHOLDING_TAX_RECEIVABLE, new AccountInfo("원천세환급금", "자산", true));
        
        // 투자자산
        ACCOUNT_INFO_MAP.put(Codes.INVESTMENT_SECURITIES, new AccountInfo("투자유가증권", "자산", true));
        ACCOUNT_INFO_MAP.put(Codes.INVESTMENT_REAL_ESTATE, new AccountInfo("투자부동산", "자산", true));
        ACCOUNT_INFO_MAP.put(Codes.SUBSIDIARIES_INVESTMENT, new AccountInfo("종속회사투자", "자산", true));
        ACCOUNT_INFO_MAP.put(Codes.JOINT_VENTURE_INVESTMENT, new AccountInfo("합작투자", "자산", true));
        
        // 유형자산 (확장)
        ACCOUNT_INFO_MAP.put(Codes.LAND, new AccountInfo("토지", "자산", true));
        ACCOUNT_INFO_MAP.put(Codes.CONSTRUCTION_IN_PROGRESS, new AccountInfo("건설중인자산", "자산", true));
        
        // 무형자산 (확장)
        ACCOUNT_INFO_MAP.put(Codes.PATENTS, new AccountInfo("특허권", "자산", true));
        ACCOUNT_INFO_MAP.put(Codes.TRADEMARKS, new AccountInfo("상표권", "자산", true));
        ACCOUNT_INFO_MAP.put(Codes.COPYRIGHTS, new AccountInfo("저작권", "자산", true));
        ACCOUNT_INFO_MAP.put(Codes.DEVELOPMENT_COSTS, new AccountInfo("개발비", "자산", true));
        ACCOUNT_INFO_MAP.put(Codes.CUSTOMER_RELATIONSHIPS, new AccountInfo("고객관계", "자산", true));
        ACCOUNT_INFO_MAP.put(Codes.ACCUMULATED_AMORTIZATION_INTANGIBLE, new AccountInfo("무형자산상각누계액", "자산", false));
        ACCOUNT_INFO_MAP.put(Codes.RESEARCH_COSTS, new AccountInfo("연구비", "자산", true));
        
        // 기타 비유동자산
        ACCOUNT_INFO_MAP.put(Codes.LONG_TERM_PREPAID_EXPENSES, new AccountInfo("장기선급비용", "자산", true));
        ACCOUNT_INFO_MAP.put(Codes.LONG_TERM_RECEIVABLES, new AccountInfo("장기채권", "자산", true));
        ACCOUNT_INFO_MAP.put(Codes.DEFERRED_TAX_ASSETS, new AccountInfo("이연법인세자산", "자산", true));
        ACCOUNT_INFO_MAP.put(Codes.INVESTMENT_PROPERTY, new AccountInfo("투자부동산", "자산", true));
        ACCOUNT_INFO_MAP.put(Codes.BIOLOGICAL_ASSETS, new AccountInfo("생물자산", "자산", true));
        ACCOUNT_INFO_MAP.put(Codes.GUARANTEE_DEPOSITS_PAID, new AccountInfo("지급보증금", "자산", true));
        ACCOUNT_INFO_MAP.put(Codes.CLUB_MEMBERSHIPS, new AccountInfo("클럽회원권", "자산", true));
        ACCOUNT_INFO_MAP.put(Codes.ART_WORKS, new AccountInfo("미술품", "자산", true));
        ACCOUNT_INFO_MAP.put(Codes.OTHER_NON_CURRENT_ASSETS, new AccountInfo("기타비유동자산", "자산", true));
        
        // 유동부채 (확장)
        ACCOUNT_INFO_MAP.put(Codes.ACCRUED_SALARIES, new AccountInfo("미지급급여", "부채", false));
        ACCOUNT_INFO_MAP.put(Codes.ACCRUED_INTEREST, new AccountInfo("미지급이자", "부채", false));
        ACCOUNT_INFO_MAP.put(Codes.ACCRUED_UTILITIES, new AccountInfo("미지급공과금", "부채", false));
        ACCOUNT_INFO_MAP.put(Codes.DIVIDEND_PAYABLE, new AccountInfo("미지급배당금", "부채", false));
        ACCOUNT_INFO_MAP.put(Codes.CUSTOMER_DEPOSITS, new AccountInfo("고객예치금", "부채", false));
        ACCOUNT_INFO_MAP.put(Codes.WARRANTY_PROVISIONS, new AccountInfo("품질보증충당부채", "부채", false));
        ACCOUNT_INFO_MAP.put(Codes.SALES_TAX_PAYABLE, new AccountInfo("판매세예수금", "부채", false));
        ACCOUNT_INFO_MAP.put(Codes.SOCIAL_INSURANCE_PAYABLE, new AccountInfo("사회보험료예수금", "부채", false));
        ACCOUNT_INFO_MAP.put(Codes.OTHER_CURRENT_LIABILITIES, new AccountInfo("기타유동부채", "부채", false));
        
        // 비유동부채 (확장)
        ACCOUNT_INFO_MAP.put(Codes.CORPORATE_BONDS, new AccountInfo("회사채", "부채", false));
        ACCOUNT_INFO_MAP.put(Codes.LONG_TERM_LEASE_LIABILITIES, new AccountInfo("장기리스부채", "부채", false));
        ACCOUNT_INFO_MAP.put(Codes.ASSET_RETIREMENT_OBLIGATIONS, new AccountInfo("자산해체충당부채", "부채", false));
        ACCOUNT_INFO_MAP.put(Codes.ENVIRONMENTAL_LIABILITIES, new AccountInfo("환경복구충당부채", "부채", false));
        ACCOUNT_INFO_MAP.put(Codes.LITIGATION_PROVISIONS, new AccountInfo("소송충당부채", "부채", false));
        ACCOUNT_INFO_MAP.put(Codes.RESTRUCTURING_PROVISIONS, new AccountInfo("구조조정충당부채", "부채", false));
        ACCOUNT_INFO_MAP.put(Codes.OTHER_NON_CURRENT_LIABILITIES, new AccountInfo("기타비유동부채", "부채", false));
        
        // 자본 (확장)
        ACCOUNT_INFO_MAP.put(Codes.PREFERRED_STOCK, new AccountInfo("우선주", "자본", false));
        ACCOUNT_INFO_MAP.put(Codes.COMMON_STOCK, new AccountInfo("보통주", "자본", false));
        ACCOUNT_INFO_MAP.put(Codes.STOCK_SUBSCRIPTION_RIGHTS, new AccountInfo("신주인수권", "자본", false));
        ACCOUNT_INFO_MAP.put(Codes.STOCK_OPTIONS, new AccountInfo("주식선택권", "자본", false));
        ACCOUNT_INFO_MAP.put(Codes.CAPITAL_SURPLUS_REVALUATION, new AccountInfo("재평가자본잉여금", "자본", false));
        ACCOUNT_INFO_MAP.put(Codes.CAPITAL_SURPLUS_MERGER, new AccountInfo("합병자본잉여금", "자본", false));
        ACCOUNT_INFO_MAP.put(Codes.CAPITAL_SURPLUS_TREASURY_STOCK, new AccountInfo("자기주식처분이익", "자본", false));
        ACCOUNT_INFO_MAP.put(Codes.CAPITAL_SURPLUS_CONVERSION, new AccountInfo("전환자본잉여금", "자본", false));
        ACCOUNT_INFO_MAP.put(Codes.LEGAL_RESERVE, new AccountInfo("법정적립금", "자본", false));
        ACCOUNT_INFO_MAP.put(Codes.VOLUNTARY_RESERVE, new AccountInfo("임의적립금", "자본", false));
        ACCOUNT_INFO_MAP.put(Codes.SPECIAL_RESERVE, new AccountInfo("특별적립금", "자본", false));
        ACCOUNT_INFO_MAP.put(Codes.UNAPPROPRIATED_RETAINED_EARNINGS, new AccountInfo("미처분이익잉여금", "자본", false));
        ACCOUNT_INFO_MAP.put(Codes.ACCUMULATED_OTHER_COMPREHENSIVE_INCOME, new AccountInfo("기타포괄손익누계액", "자본", false));
        ACCOUNT_INFO_MAP.put(Codes.FOREIGN_CURRENCY_TRANSLATION, new AccountInfo("외화환산조정", "자본", false));
        ACCOUNT_INFO_MAP.put(Codes.UNREALIZED_GAIN_LOSS_SECURITIES, new AccountInfo("매도가능증권평가손익", "자본", false));
        ACCOUNT_INFO_MAP.put(Codes.REVALUATION_SURPLUS, new AccountInfo("재평가적립금", "자본", false));
        ACCOUNT_INFO_MAP.put(Codes.NON_CONTROLLING_INTERESTS, new AccountInfo("비지배지분", "자본", false));
        
        // 영업수익 (확장)
        ACCOUNT_INFO_MAP.put(Codes.FRANCHISE_REVENUE, new AccountInfo("가맹수익", "수익", false));
        ACCOUNT_INFO_MAP.put(Codes.MEMBERSHIP_REVENUE, new AccountInfo("회원수익", "수익", false));
        ACCOUNT_INFO_MAP.put(Codes.SUBSCRIPTION_REVENUE, new AccountInfo("구독수익", "수익", false));
        ACCOUNT_INFO_MAP.put(Codes.CONSULTING_REVENUE, new AccountInfo("컨설팅수익", "수익", false));
        ACCOUNT_INFO_MAP.put(Codes.TRAINING_REVENUE, new AccountInfo("교육수익", "수익", false));
        ACCOUNT_INFO_MAP.put(Codes.MAINTENANCE_REVENUE, new AccountInfo("유지보수수익", "수익", false));
        ACCOUNT_INFO_MAP.put(Codes.INSTALLATION_REVENUE, new AccountInfo("설치수익", "수익", false));
        ACCOUNT_INFO_MAP.put(Codes.ROYALTY_INCOME, new AccountInfo("로열티수익", "수익", false));
        ACCOUNT_INFO_MAP.put(Codes.LICENSE_INCOME, new AccountInfo("라이선스수익", "수익", false));
        ACCOUNT_INFO_MAP.put(Codes.PATENT_INCOME, new AccountInfo("특허수익", "수익", false));
        ACCOUNT_INFO_MAP.put(Codes.TRADEMARK_INCOME, new AccountInfo("상표수익", "수익", false));
        ACCOUNT_INFO_MAP.put(Codes.GAIN_ON_SALE_OF_INVESTMENTS, new AccountInfo("투자자산처분이익", "수익", false));
        ACCOUNT_INFO_MAP.put(Codes.GOVERNMENT_GRANTS, new AccountInfo("정부보조금", "수익", false));
        ACCOUNT_INFO_MAP.put(Codes.INSURANCE_CLAIMS, new AccountInfo("보험금수익", "수익", false));
        ACCOUNT_INFO_MAP.put(Codes.REVERSAL_OF_PROVISIONS, new AccountInfo("충당부채환입", "수익", false));
        ACCOUNT_INFO_MAP.put(Codes.MISCELLANEOUS_INCOME, new AccountInfo("잡수익", "수익", false));
        
        // 판매비와 관리비 (확장된 세부 항목 - 인건비)
        ACCOUNT_INFO_MAP.put(Codes.SALARIES_EXECUTIVES, new AccountInfo("임원급여", "비용", true));
        ACCOUNT_INFO_MAP.put(Codes.SALARIES_EMPLOYEES, new AccountInfo("직원급여", "비용", true));
        ACCOUNT_INFO_MAP.put(Codes.RETIREMENT_BENEFITS, new AccountInfo("퇴직급여", "비용", true));
        ACCOUNT_INFO_MAP.put(Codes.WELFARE_EXPENSE, new AccountInfo("복리후생비", "비용", true));
        ACCOUNT_INFO_MAP.put(Codes.BONUS_EXECUTIVES, new AccountInfo("임원상여", "비용", true));
        ACCOUNT_INFO_MAP.put(Codes.BONUS_EMPLOYEES, new AccountInfo("직원상여", "비용", true));
        ACCOUNT_INFO_MAP.put(Codes.OVERTIME_ALLOWANCE, new AccountInfo("시간외근무수당", "비용", true));
        ACCOUNT_INFO_MAP.put(Codes.MEAL_ALLOWANCE, new AccountInfo("식대", "비용", true));
        ACCOUNT_INFO_MAP.put(Codes.TRANSPORTATION_ALLOWANCE, new AccountInfo("교통비", "비용", true));
        ACCOUNT_INFO_MAP.put(Codes.NATIONAL_PENSION, new AccountInfo("국민연금", "비용", true));
        
        // 사업관련 비용
        ACCOUNT_INFO_MAP.put(Codes.TRAVEL_EXPENSE, new AccountInfo("여비교통비", "비용", true));
        ACCOUNT_INFO_MAP.put(Codes.ENTERTAINMENT_EXPENSE, new AccountInfo("접대비", "비용", true));
        ACCOUNT_INFO_MAP.put(Codes.COMMUNICATION_EXPENSE, new AccountInfo("통신비", "비용", true));
        ACCOUNT_INFO_MAP.put(Codes.UTILITIES_EXPENSE, new AccountInfo("수도광열비", "비용", true));
        ACCOUNT_INFO_MAP.put(Codes.RENT_EXPENSE, new AccountInfo("지급임차료", "비용", true));
        ACCOUNT_INFO_MAP.put(Codes.INSURANCE_EXPENSE, new AccountInfo("보험료", "비용", true));
        ACCOUNT_INFO_MAP.put(Codes.VEHICLE_MAINTENANCE, new AccountInfo("차량유지비", "비용", true));
        ACCOUNT_INFO_MAP.put(Codes.TRANSPORTATION_EXPENSE, new AccountInfo("운반비", "비용", true));
        ACCOUNT_INFO_MAP.put(Codes.FUEL_EXPENSE, new AccountInfo("유류비", "비용", true));
        ACCOUNT_INFO_MAP.put(Codes.PARKING_TOLLS, new AccountInfo("주차료및통행료", "비용", true));
        
        // 사무 및 관리비용
        ACCOUNT_INFO_MAP.put(Codes.OFFICE_SUPPLIES_EXPENSE, new AccountInfo("소모품비", "비용", true));
        ACCOUNT_INFO_MAP.put(Codes.BOOKS_PRINTING, new AccountInfo("도서인쇄비", "비용", true));
        ACCOUNT_INFO_MAP.put(Codes.POSTAGE_EXPENSE, new AccountInfo("우편료", "비용", true));
        ACCOUNT_INFO_MAP.put(Codes.CONSUMABLE_SUPPLIES, new AccountInfo("소모용품", "비용", true));
        ACCOUNT_INFO_MAP.put(Codes.CLEANING_EXPENSE, new AccountInfo("청소비", "비용", true));
        ACCOUNT_INFO_MAP.put(Codes.SECURITY_EXPENSE, new AccountInfo("경비비", "비용", true));
        ACCOUNT_INFO_MAP.put(Codes.MAINTENANCE_EXPENSE, new AccountInfo("시설유지비", "비용", true));
        ACCOUNT_INFO_MAP.put(Codes.REPAIR_EXPENSE, new AccountInfo("수선비", "비용", true));
        ACCOUNT_INFO_MAP.put(Codes.SUBSCRIPTION_FEES, new AccountInfo("구독료", "비용", true));
        ACCOUNT_INFO_MAP.put(Codes.MEMBERSHIP_FEES, new AccountInfo("가입비", "비용", true));
        
        // 세금 및 공과금
        ACCOUNT_INFO_MAP.put(Codes.TAXES_AND_DUES, new AccountInfo("세금과공과", "비용", true));
        ACCOUNT_INFO_MAP.put(Codes.PROPERTY_TAX, new AccountInfo("재산세", "비용", true));
        ACCOUNT_INFO_MAP.put(Codes.ACQUISITION_TAX, new AccountInfo("취득세", "비용", true));
        ACCOUNT_INFO_MAP.put(Codes.REGISTRATION_TAX, new AccountInfo("등록세", "비용", true));
        ACCOUNT_INFO_MAP.put(Codes.BUSINESS_LICENSE_TAX, new AccountInfo("사업자등록세", "비용", true));
        ACCOUNT_INFO_MAP.put(Codes.AUTOMOBILE_TAX, new AccountInfo("자동차세", "비용", true));
        ACCOUNT_INFO_MAP.put(Codes.STAMP_TAX, new AccountInfo("인지세", "비용", true));
        ACCOUNT_INFO_MAP.put(Codes.ENVIRONMENT_TAX, new AccountInfo("환경개선부담금", "비용", true));
        ACCOUNT_INFO_MAP.put(Codes.LOCAL_INCOME_TAX, new AccountInfo("지방소득세", "비용", true));
        ACCOUNT_INFO_MAP.put(Codes.OTHER_TAXES, new AccountInfo("기타세금", "비용", true));
        
        // 감가상각 및 상각비
        ACCOUNT_INFO_MAP.put(Codes.DEPRECIATION_EXPENSE, new AccountInfo("감가상각비", "비용", true));
        ACCOUNT_INFO_MAP.put(Codes.DEPRECIATION_BUILDINGS, new AccountInfo("건물감가상각비", "비용", true));
        ACCOUNT_INFO_MAP.put(Codes.DEPRECIATION_VEHICLES, new AccountInfo("차량감가상각비", "비용", true));
        ACCOUNT_INFO_MAP.put(Codes.DEPRECIATION_FURNITURE, new AccountInfo("집기감가상각비", "비용", true));
        ACCOUNT_INFO_MAP.put(Codes.DEPRECIATION_MACHINERY, new AccountInfo("기계감가상각비", "비용", true));
        ACCOUNT_INFO_MAP.put(Codes.AMORTIZATION_SOFTWARE, new AccountInfo("소프트웨어상각비", "비용", true));
        ACCOUNT_INFO_MAP.put(Codes.AMORTIZATION_INTANGIBLE, new AccountInfo("무형자산상각비", "비용", true));
        ACCOUNT_INFO_MAP.put(Codes.DEPLETION_EXPENSE, new AccountInfo("자원감모비", "비용", true));
        ACCOUNT_INFO_MAP.put(Codes.IMPAIRMENT_LOSS, new AccountInfo("손상차손", "비용", true));
        ACCOUNT_INFO_MAP.put(Codes.ASSET_RETIREMENT_COST, new AccountInfo("자산제거비용", "비용", true));
        
        // 전문서비스 및 수수료
        ACCOUNT_INFO_MAP.put(Codes.SERVICE_FEES, new AccountInfo("지급수수료", "비용", true));
        ACCOUNT_INFO_MAP.put(Codes.LEGAL_PROFESSIONAL_FEES, new AccountInfo("전문용역비", "비용", true));
        ACCOUNT_INFO_MAP.put(Codes.AUDIT_FEES, new AccountInfo("감사보수", "비용", true));
        ACCOUNT_INFO_MAP.put(Codes.TAX_SERVICE_FEES, new AccountInfo("세무용역비", "비용", true));
        ACCOUNT_INFO_MAP.put(Codes.CONSULTING_FEES, new AccountInfo("컨설팅비", "비용", true));
        ACCOUNT_INFO_MAP.put(Codes.ACCOUNTING_FEES, new AccountInfo("회계용역비", "비용", true));
        ACCOUNT_INFO_MAP.put(Codes.DESIGN_FEES, new AccountInfo("설계비", "비용", true));
        ACCOUNT_INFO_MAP.put(Codes.SYSTEM_DEVELOPMENT_FEES, new AccountInfo("시스템개발비", "비용", true));
        ACCOUNT_INFO_MAP.put(Codes.OUTSOURCING_FEES, new AccountInfo("외주비", "비용", true));
        ACCOUNT_INFO_MAP.put(Codes.TECHNICAL_SUPPORT_FEES, new AccountInfo("기술지원비", "비용", true));
        
        // 마케팅 및 판촉
        ACCOUNT_INFO_MAP.put(Codes.ADVERTISING_EXPENSE, new AccountInfo("광고선전비", "비용", true));
        ACCOUNT_INFO_MAP.put(Codes.PROMOTION_EXPENSE, new AccountInfo("판촉비", "비용", true));
        ACCOUNT_INFO_MAP.put(Codes.MARKETING_EXPENSE, new AccountInfo("마케팅비", "비용", true));
        ACCOUNT_INFO_MAP.put(Codes.EXHIBITION_EXPENSE, new AccountInfo("전시비", "비용", true));
        ACCOUNT_INFO_MAP.put(Codes.SAMPLE_EXPENSE, new AccountInfo("견본비", "비용", true));
        ACCOUNT_INFO_MAP.put(Codes.CATALOG_EXPENSE, new AccountInfo("카탈로그비", "비용", true));
        ACCOUNT_INFO_MAP.put(Codes.WEBSITE_MAINTENANCE, new AccountInfo("웹사이트유지비", "비용", true));
        ACCOUNT_INFO_MAP.put(Codes.SOCIAL_MEDIA_EXPENSE, new AccountInfo("소셜미디어비", "비용", true));
        ACCOUNT_INFO_MAP.put(Codes.EVENT_EXPENSE, new AccountInfo("행사비", "비용", true));
        ACCOUNT_INFO_MAP.put(Codes.CUSTOMER_SERVICE_EXPENSE, new AccountInfo("고객서비스비", "비용", true));
        
        // 교육 및 연구개발
        ACCOUNT_INFO_MAP.put(Codes.EDUCATION_TRAINING, new AccountInfo("교육훈련비", "비용", true));
        ACCOUNT_INFO_MAP.put(Codes.RESEARCH_DEVELOPMENT, new AccountInfo("연구개발비", "비용", true));
        ACCOUNT_INFO_MAP.put(Codes.PATENT_EXPENSE, new AccountInfo("특허비", "비용", true));
        ACCOUNT_INFO_MAP.put(Codes.LICENSE_FEES, new AccountInfo("라이선스비", "비용", true));
        ACCOUNT_INFO_MAP.put(Codes.TRAINING_MATERIALS, new AccountInfo("교육자료비", "비용", true));
        ACCOUNT_INFO_MAP.put(Codes.CONFERENCE_EXPENSE, new AccountInfo("컨퍼런스비", "비용", true));
        ACCOUNT_INFO_MAP.put(Codes.SEMINAR_EXPENSE, new AccountInfo("세미나비", "비용", true));
        ACCOUNT_INFO_MAP.put(Codes.CERTIFICATION_FEES, new AccountInfo("자격증비", "비용", true));
        ACCOUNT_INFO_MAP.put(Codes.TECHNICAL_BOOKS, new AccountInfo("기술도서비", "비용", true));
        ACCOUNT_INFO_MAP.put(Codes.SOFTWARE_LICENSE, new AccountInfo("소프트웨어라이선스", "비용", true));
        
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
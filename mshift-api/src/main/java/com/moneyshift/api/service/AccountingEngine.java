package com.moneyshift.api.service;

import com.moneyshift.api.mapper.AccountingMapper;
import com.moneyshift.api.mapper.TransactionMapper;
import com.moneyshift.api.model.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.*;

/**
 * 기장 처리 엔진
 * 거래 내역을 분석하여 자동으로 복식부기 분개를 생성합니다.
 */
@Service
@Transactional
public class AccountingEngine {
    
    private static final Logger logger = LoggerFactory.getLogger(AccountingEngine.class);
    
    @Autowired
    private AccountingMapper accountingMapper;
    
    @Autowired
    private TransactionMapper transactionMapper;
    
    @Autowired
    private TagAccountMappingService tagAccountMappingService;

    /**
     * 거래 내역을 분석하여 자동으로 분개 생성
     */
    public JournalEntry processTransaction(TransactionToJournalRequest request) {
        long startTime = System.currentTimeMillis();
        
        try {
            logger.info("거래 분개 생성 시작: transactionId={}, companyId={}", 
                       request.getTransactionId(), request.getCompanyId());
            
            // 1. 기존 분개 확인 (중복 방지)
            if (!request.getForceRegenerate()) {
                JournalEntry existing = accountingMapper.findJournalEntryByReference(
                    "TRANSACTION", request.getTransactionId());
                if (existing != null) {
                    logger.info("기존 분개 발견: journalEntryId={}", existing.getId());
                    return loadJournalEntryWithDetails(existing.getId());
                }
            }
            
            // 2. 거래 정보 조회
            TransactionEntity transaction = transactionMapper.findById(request.getTransactionId());
            if (transaction == null) {
                throw new RuntimeException("거래 정보를 찾을 수 없습니다: " + request.getTransactionId());
            }
            
            // 3. 계정과목 결정
            String expenseAccountCode = determineExpenseAccount(transaction);
            String cashAccountCode = "1120"; // 보통예금 (기본값)
            
            // 4. 복식부기 분개 생성
            JournalEntry journalEntry = createJournalEntry(transaction, expenseAccountCode, cashAccountCode);
            
            // 5. 데이터베이스 저장
            saveJournalEntry(journalEntry);
            
            // 6. 분개 검증
            validateJournalEntry(journalEntry.getId());
            
            long processingTime = System.currentTimeMillis() - startTime;
            logger.info("거래 분개 생성 완료: journalEntryId={}, processingTime={}ms", 
                       journalEntry.getId(), processingTime);
            
            return journalEntry;
            
        } catch (Exception e) {
            logger.error("거래 분개 생성 실패: transactionId={}, error={}", 
                        request.getTransactionId(), e.getMessage(), e);
            throw new RuntimeException("분개 생성 중 오류가 발생했습니다: " + e.getMessage(), e);
        }
    }

    /**
     * 거래 내역으로부터 적절한 비용 계정과목 결정
     */
    private String determineExpenseAccount(TransactionEntity transaction) {
        try {
            // 1. 태그 기반 계정과목 매핑 조회
            String suggestedTag = transaction.getFinalSuggestedTag();
            if (suggestedTag != null && !suggestedTag.isEmpty()) {
                String accountCode = tagAccountMappingService.getAccountCodeByTag(suggestedTag, transaction);
                if (accountCode != null) {
                    logger.debug("태그 기반 계정과목 결정: tag={}, accountCode={}", suggestedTag, accountCode);
                    return accountCode;
                }
            }
            
            // 2. 기본 계정과목 사용
            String defaultAccount = "5130"; // 소모품비 (기본값)
            logger.debug("기본 계정과목 사용: accountCode={}", defaultAccount);
            return defaultAccount;
            
        } catch (Exception e) {
            logger.warn("계정과목 결정 중 오류 발생, 기본값 사용: {}", e.getMessage());
            return "5130"; // 소모품비
        }
    }

    /**
     * 복식부기 분개 생성
     */
    private JournalEntry createJournalEntry(TransactionEntity transaction, String expenseAccountCode, String cashAccountCode) {
        // 분개 헤더 생성
        JournalEntry journalEntry = new JournalEntry(
            transaction.getCompanyId(),
            transaction.getTransactionDate(),
            transaction.getRawText(),
            "TRANSACTION",
            transaction.getId(),
            transaction.getAmount()
        );
        journalEntry.setCreatedBy("SYSTEM");
        
        // 분개 상세 생성
        List<JournalEntryDetail> details = generateDoubleEntry(
            expenseAccountCode, cashAccountCode, transaction.getAmount(), transaction.getTransactionType()
        );
        journalEntry.setDetails(details);
        
        return journalEntry;
    }

    /**
     * 복식부기 원리에 따른 차변/대변 자동 생성
     */
    private List<JournalEntryDetail> generateDoubleEntry(String expenseAccountCode, String cashAccountCode, 
                                                        Long amount, String transactionType) {
        List<JournalEntryDetail> details = new ArrayList<>();
        
        // 계정과목 정보 조회
        ChartOfAccount expenseAccount = accountingMapper.findAccountByCode(expenseAccountCode);
        ChartOfAccount cashAccount = accountingMapper.findAccountByCode(cashAccountCode);
        
        String expenseAccountName = expenseAccount != null ? expenseAccount.getAccountName() : "미지정";
        String cashAccountName = cashAccount != null ? cashAccount.getAccountName() : "보통예금";
        
        if ("EXPENSE".equals(transactionType)) {
            // 비용 발생: 차변(비용 계정), 대변(현금/예금)
            details.add(JournalEntryDetail.createDebit(1, expenseAccountCode, expenseAccountName, amount, "비용 발생"));
            details.add(JournalEntryDetail.createCredit(2, cashAccountCode, cashAccountName, amount, "현금 지출"));
            
        } else if ("INCOME".equals(transactionType)) {
            // 수익 발생: 차변(현금/예금), 대변(수익 계정)
            String revenueAccountCode = "4110"; // 매출
            ChartOfAccount revenueAccount = accountingMapper.findAccountByCode(revenueAccountCode);
            String revenueAccountName = revenueAccount != null ? revenueAccount.getAccountName() : "매출";
            
            details.add(JournalEntryDetail.createDebit(1, cashAccountCode, cashAccountName, amount, "현금 수입"));
            details.add(JournalEntryDetail.createCredit(2, revenueAccountCode, revenueAccountName, amount, "매출 발생"));
        } else {
            throw new RuntimeException("지원하지 않는 거래 유형: " + transactionType);
        }
        
        return details;
    }

    /**
     * 분개를 데이터베이스에 저장
     */
    private void saveJournalEntry(JournalEntry journalEntry) {
        // 1. 분개 헤더 저장
        accountingMapper.insertJournalEntry(journalEntry);
        Long journalEntryId = journalEntry.getId();
        
        // 2. 분개 상세 저장
        for (JournalEntryDetail detail : journalEntry.getDetails()) {
            detail.setJournalEntryId(journalEntryId);
            accountingMapper.insertJournalEntryDetail(detail);
        }
        
        logger.debug("분개 저장 완료: journalEntryId={}, detailCount={}", 
                    journalEntryId, journalEntry.getDetails().size());
    }

    /**
     * 분개 검증 (차변 = 대변)
     */
    private void validateJournalEntry(Long journalEntryId) {
        Map<String, Object> balance = accountingMapper.validateJournalEntryBalance(journalEntryId);
        
        // PostgreSQL SUM() returns BigDecimal, convert to Long
        Long totalDebit = ((Number) balance.get("total_debit")).longValue();
        Long totalCredit = ((Number) balance.get("total_credit")).longValue();
        
        if (!totalDebit.equals(totalCredit)) {
            throw new RuntimeException(String.format(
                "분개 불균형 감지: journalEntryId=%d, 차변=%d, 대변=%d", 
                journalEntryId, totalDebit, totalCredit));
        }
        
        logger.debug("분개 검증 통과: journalEntryId={}, 차변=대변={}", journalEntryId, totalDebit);
    }

    /**
     * 분개 상세 정보와 함께 조회
     */
    public JournalEntry loadJournalEntryWithDetails(Long journalEntryId) {
        JournalEntry journalEntry = accountingMapper.findJournalEntryById(journalEntryId);
        if (journalEntry == null) {
            return null;
        }
        
        List<JournalEntryDetail> details = accountingMapper.findJournalEntryDetails(journalEntryId);
        journalEntry.setDetails(details);
        
        return journalEntry;
    }

    /**
     * 계정과목 목록 조회
     */
    public List<ChartOfAccount> getChartOfAccounts() {
        return accountingMapper.findAllActiveAccounts();
    }

    /**
     * 회사별 기간별 분개 목록 조회
     */
    public List<JournalEntry> getJournalEntries(String companyId, LocalDate startDate, LocalDate endDate) {
        return accountingMapper.findJournalEntriesByCompanyAndPeriod(companyId, startDate, endDate);
    }

    /**
     * 대차대조표 데이터 생성
     */
    public Map<String, Object> generateBalanceSheetData(String companyId, LocalDate asOfDate) {
        List<Map<String, Object>> accountBalances = accountingMapper.getAccountBalances(companyId, asOfDate);
        
        Map<String, Object> balanceSheet = new HashMap<>();
        Map<String, Long> assets = new HashMap<>();
        Map<String, Long> liabilities = new HashMap<>();
        Map<String, Long> equity = new HashMap<>();
        
        for (Map<String, Object> account : accountBalances) {
            String accountType = (String) account.get("account_type");
            String accountName = (String) account.get("account_name");
            Long balance = ((Number) account.get("balance")).longValue();
            
            switch (accountType) {
                case "자산":
                    assets.put(accountName, balance);
                    break;
                case "부채":
                    liabilities.put(accountName, balance);
                    break;
                case "자본":
                    equity.put(accountName, balance);
                    break;
            }
        }
        
        // 합계 계산
        Long totalAssets = assets.values().stream().mapToLong(Long::longValue).sum();
        Long totalLiabilities = liabilities.values().stream().mapToLong(Long::longValue).sum();
        Long totalEquity = equity.values().stream().mapToLong(Long::longValue).sum();
        
        balanceSheet.put("자산", assets);
        balanceSheet.put("자산합계", totalAssets);
        balanceSheet.put("부채", liabilities);
        balanceSheet.put("부채합계", totalLiabilities);
        balanceSheet.put("자본", equity);
        balanceSheet.put("자본합계", totalEquity);
        balanceSheet.put("부채자본합계", totalLiabilities + totalEquity);
        
        // 대차 균형 검증
        if (!totalAssets.equals(totalLiabilities + totalEquity)) {
            logger.warn("대차대조표 불균형: 자산={}, 부채+자본={}", totalAssets, totalLiabilities + totalEquity);
        }
        
        return balanceSheet;
    }

    /**
     * 손익계산서 데이터 생성
     */
    public Map<String, Object> generateIncomeStatementData(String companyId, LocalDate periodStart, LocalDate periodEnd) {
        List<Map<String, Object>> incomeStatementData = accountingMapper.getIncomeStatementData(companyId, periodStart, periodEnd);
        
        Map<String, Object> incomeStatement = new HashMap<>();
        Map<String, Long> revenues = new HashMap<>();
        Map<String, Long> expenses = new HashMap<>();
        
        for (Map<String, Object> account : incomeStatementData) {
            String accountType = (String) account.get("account_type");
            String accountName = (String) account.get("account_name");
            Long periodAmount = ((Number) account.get("period_amount")).longValue();
            
            if ("수익".equals(accountType)) {
                revenues.put(accountName, periodAmount);
            } else if ("비용".equals(accountType)) {
                expenses.put(accountName, periodAmount);
            }
        }
        
        // 합계 계산
        Long totalRevenue = revenues.values().stream().mapToLong(Long::longValue).sum();
        Long totalExpenses = expenses.values().stream().mapToLong(Long::longValue).sum();
        Long netIncome = totalRevenue - totalExpenses;
        
        incomeStatement.put("수익", revenues);
        incomeStatement.put("수익합계", totalRevenue);
        incomeStatement.put("비용", expenses);
        incomeStatement.put("비용합계", totalExpenses);
        incomeStatement.put("당기순이익", netIncome);
        
        return incomeStatement;
    }
}
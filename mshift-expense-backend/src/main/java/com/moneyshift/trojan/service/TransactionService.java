package com.moneyshift.trojan.service;

import com.moneyshift.trojan.entity.Transaction;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.*;

/**
 * 거래내역 서비스
 * 트로이 목마 가계부 앱의 거래 비즈니스 로직 처리
 */
@Slf4j
@Service
@Transactional
@RequiredArgsConstructor
public class TransactionService {

    @Transactional
    public Transaction createTransaction(Transaction transaction) {
        log.info("Creating transaction: {}", transaction);
        
        // 기본값 설정
        if (transaction.getTransactionDate() == null) {
            transaction.setTransactionDate(LocalDate.now());
        }
        if (transaction.getIsRecurring() == null) {
            transaction.setIsRecurring(false);
        }
        
        // TODO: 실제 데이터베이스 저장 로직 구현
        // 현재는 Mock 데이터로 응답
        transaction.setTransactionId(System.currentTimeMillis());
        
        log.info("Created transaction with ID: {}", transaction.getTransactionId());
        return transaction;
    }

    @Transactional(readOnly = true)
    public List<Transaction> getMonthlyTransactions(Long userId, LocalDate date) {
        log.info("Getting monthly transactions for user: {}, date: {}", userId, date);
        
        YearMonth yearMonth = YearMonth.from(date);
        
        // TODO: 실제 데이터베이스 조회 로직 구현
        // 현재는 Mock 데이터로 응답
        List<Transaction> mockTransactions = Arrays.asList(
            createMockTransaction(1L, userId, "EXPENSE", new BigDecimal("15000"), "점심식사", date.minusDays(1)),
            createMockTransaction(2L, userId, "EXPENSE", new BigDecimal("3000"), "교통비", date.minusDays(2)),
            createMockTransaction(3L, userId, "INCOME", new BigDecimal("50000"), "용돈", date.minusDays(3))
        );
        
        log.info("Found {} transactions for month: {}", mockTransactions.size(), yearMonth);
        return mockTransactions;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getMonthlySummary(Long userId, LocalDate date) {
        log.info("Getting monthly summary for user: {}, date: {}", userId, date);
        
        List<Transaction> transactions = getMonthlyTransactions(userId, date);
        
        BigDecimal totalIncome = transactions.stream()
                .filter(t -> "INCOME".equals(t.getTransactionType()))
                .map(Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        BigDecimal totalExpense = transactions.stream()
                .filter(t -> "EXPENSE".equals(t.getTransactionType()))
                .map(Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        BigDecimal balance = totalIncome.subtract(totalExpense);
        
        Map<String, Object> summary = new HashMap<>();
        summary.put("totalIncome", totalIncome);
        summary.put("totalExpense", totalExpense);
        summary.put("balance", balance);
        summary.put("transactionCount", transactions.size());
        summary.put("month", YearMonth.from(date).toString());
        
        log.info("Monthly summary - Income: {}, Expense: {}, Balance: {}", 
                totalIncome, totalExpense, balance);
        
        return summary;
    }

    @Transactional(readOnly = true)
    public Transaction getTransactionById(Long transactionId) {
        log.info("Getting transaction by ID: {}", transactionId);
        
        // TODO: 실제 데이터베이스 조회 로직 구현
        // 현재는 Mock 데이터로 응답
        Transaction mockTransaction = createMockTransaction(transactionId, 1L, "EXPENSE", 
                new BigDecimal("25000"), "마트 쇼핑", LocalDate.now());
        
        log.info("Found transaction: {}", mockTransaction);
        return mockTransaction;
    }

    @Transactional
    public Transaction updateTransaction(Transaction transaction) {
        log.info("Updating transaction: {}", transaction.getTransactionId());
        
        // TODO: 실제 데이터베이스 업데이트 로직 구현
        log.info("Updated transaction: {}", transaction);
        return transaction;
    }

    @Transactional
    public void deleteTransaction(Long transactionId) {
        log.info("Deleting transaction: {}", transactionId);
        
        // TODO: 실제 데이터베이스 삭제 로직 구현
        log.info("Deleted transaction: {}", transactionId);
    }

    @Transactional(readOnly = true)
    public List<Transaction> getUserTransactions(Long userId, int page, int size) {
        log.info("Getting user transactions: userId={}, page={}, size={}", userId, page, size);
        
        // TODO: 실제 데이터베이스 페이징 조회 로직 구현
        // 현재는 Mock 데이터로 응답
        List<Transaction> mockTransactions = Arrays.asList(
            createMockTransaction(1L, userId, "EXPENSE", new BigDecimal("15000"), "점심식사", LocalDate.now()),
            createMockTransaction(2L, userId, "INCOME", new BigDecimal("100000"), "급여", LocalDate.now().minusDays(1))
        );
        
        log.info("Found {} transactions for user: {}", mockTransactions.size(), userId);
        return mockTransactions;
    }

    private Transaction createMockTransaction(Long id, Long userId, String type, 
                                           BigDecimal amount, String description, LocalDate date) {
        return Transaction.builder()
                .transactionId(id)
                .userId(userId)
                .transactionType(type)
                .amount(amount)
                .description(description)
                .transactionDate(date)
                .isRecurring(false)
                .categoryName(type.equals("INCOME") ? "급여" : "식비")
                .assetName("주거래 계좌")
                .build();
    }
}
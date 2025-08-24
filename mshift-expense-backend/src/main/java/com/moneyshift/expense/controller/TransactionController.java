package com.moneyshift.expense.controller;

import com.moneyshift.expense.filter.JwtAuthenticationFilter;
import com.moneyshift.expense.model.Transaction;
import com.moneyshift.expense.service.TransactionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.YearMonth;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * 거래내역 관리 REST API 컨트롤러
 */
@Slf4j
@RestController
@RequestMapping("/v1/transactions")
@RequiredArgsConstructor
@Tag(name = "Transaction Management", description = "거래내역 관리 API")
public class TransactionController {
    
    private final TransactionService transactionService;
    
    /**
     * 사용자의 거래내역 목록 조회
     */
    @Operation(summary = "거래내역 목록 조회", description = "사용자의 모든 거래내역을 조회합니다.")
    @GetMapping
    public ResponseEntity<List<Transaction>> getUserTransactions(Authentication auth,
                                                                @RequestParam(defaultValue = "0") int offset,
                                                                @RequestParam(defaultValue = "50") int limit) {
        Long userId = getCurrentUserId(auth);
        log.info("거래내역 목록 조회: userId={}, offset={}, limit={}", userId, offset, limit);
        
        List<Transaction> transactions = transactionService.getUserTransactions(userId, offset, limit);
        return ResponseEntity.ok(transactions);
    }
    
    /**
     * 거래내역 상세 조회
     */
    @Operation(summary = "거래내역 상세 조회", description = "특정 거래내역의 상세 정보를 조회합니다.")
    @GetMapping("/{transactionId}")
    public ResponseEntity<Transaction> getTransaction(@PathVariable Long transactionId, Authentication auth) {
        Long userId = getCurrentUserId(auth);
        log.info("거래내역 상세 조회: transactionId={}, userId={}", transactionId, userId);
        
        Optional<Transaction> transaction = transactionService.getTransactionById(transactionId, userId);
        if (transaction.isPresent()) {
            return ResponseEntity.ok(transaction.get());
        } else {
            return ResponseEntity.notFound().build();
        }
    }
    
    /**
     * 새로운 거래내역 생성
     */
    @Operation(summary = "거래내역 생성", description = "새로운 거래내역을 생성합니다.")
    @PostMapping
    public ResponseEntity<Transaction> createTransaction(@Validated @RequestBody Transaction transaction, Authentication auth) {
        Long userId = getCurrentUserId(auth);
        transaction.setUserId(userId);
        
        log.info("거래내역 생성: userId={}, transactionType={}, amount={}", 
                userId, transaction.getTransactionType(), transaction.getAmount());
        
        try {
            Transaction createdTransaction = transactionService.createTransaction(transaction);
            return ResponseEntity.ok(createdTransaction);
        } catch (RuntimeException e) {
            log.error("거래내역 생성 실패: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * 거래내역 수정
     */
    @Operation(summary = "거래내역 수정", description = "기존 거래내역을 수정합니다.")
    @PutMapping("/{transactionId}")
    public ResponseEntity<Transaction> updateTransaction(@PathVariable Long transactionId,
                                                        @Validated @RequestBody Transaction transaction,
                                                        Authentication auth) {
        Long userId = getCurrentUserId(auth);
        transaction.setTransactionId(transactionId);
        transaction.setUserId(userId);
        
        log.info("거래내역 수정: transactionId={}, userId={}", transactionId, userId);
        
        try {
            Transaction updatedTransaction = transactionService.updateTransaction(transaction);
            return ResponseEntity.ok(updatedTransaction);
        } catch (RuntimeException e) {
            log.error("거래내역 수정 실패: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * 거래내역 삭제
     */
    @Operation(summary = "거래내역 삭제", description = "기존 거래내역을 삭제합니다.")
    @DeleteMapping("/{transactionId}")
    public ResponseEntity<Void> deleteTransaction(@PathVariable Long transactionId, Authentication auth) {
        Long userId = getCurrentUserId(auth);
        log.info("거래내역 삭제: transactionId={}, userId={}", transactionId, userId);
        
        try {
            boolean success = transactionService.deleteTransaction(transactionId, userId);
            if (success) {
                return ResponseEntity.ok().build();
            } else {
                return ResponseEntity.badRequest().build();
            }
        } catch (RuntimeException e) {
            log.error("거래내역 삭제 실패: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * 날짜 범위별 거래내역 조회
     */
    @Operation(summary = "날짜별 거래내역 조회", description = "특정 날짜 범위의 거래내역을 조회합니다.")
    @GetMapping("/date-range")
    public ResponseEntity<List<Transaction>> getTransactionsByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            Authentication auth) {
        
        Long userId = getCurrentUserId(auth);
        log.info("날짜별 거래내역 조회: userId={}, startDate={}, endDate={}", userId, startDate, endDate);
        
        List<Transaction> transactions = transactionService.getTransactionsByDateRange(userId, startDate, endDate);
        return ResponseEntity.ok(transactions);
    }
    
    /**
     * 카테고리별 거래내역 조회
     */
    @Operation(summary = "카테고리별 거래내역 조회", description = "특정 카테고리의 거래내역을 조회합니다.")
    @GetMapping("/category/{categoryId}")
    public ResponseEntity<List<Transaction>> getTransactionsByCategory(@PathVariable Long categoryId, Authentication auth) {
        Long userId = getCurrentUserId(auth);
        log.info("카테고리별 거래내역 조회: userId={}, categoryId={}", userId, categoryId);
        
        List<Transaction> transactions = transactionService.getTransactionsByCategory(userId, categoryId);
        return ResponseEntity.ok(transactions);
    }
    
    /**
     * 자산별 거래내역 조회
     */
    @Operation(summary = "자산별 거래내역 조회", description = "특정 자산의 거래내역을 조회합니다.")
    @GetMapping("/asset/{assetId}")
    public ResponseEntity<List<Transaction>> getTransactionsByAsset(@PathVariable Long assetId, Authentication auth) {
        Long userId = getCurrentUserId(auth);
        log.info("자산별 거래내역 조회: userId={}, assetId={}", userId, assetId);
        
        List<Transaction> transactions = transactionService.getTransactionsByAsset(userId, assetId);
        return ResponseEntity.ok(transactions);
    }
    
    /**
     * 거래 유형별 조회
     */
    @Operation(summary = "거래 유형별 조회", description = "특정 거래 유형의 거래내역을 조회합니다.")
    @GetMapping("/type/{transactionType}")
    public ResponseEntity<List<Transaction>> getTransactionsByType(@PathVariable Transaction.TransactionType transactionType, 
                                                                  Authentication auth) {
        Long userId = getCurrentUserId(auth);
        log.info("거래 유형별 조회: userId={}, transactionType={}", userId, transactionType);
        
        List<Transaction> transactions = transactionService.getTransactionsByType(userId, transactionType);
        return ResponseEntity.ok(transactions);
    }
    
    /**
     * 거래내역 검색
     */
    @Operation(summary = "거래내역 검색", description = "키워드로 거래내역을 검색합니다.")
    @GetMapping("/search")
    public ResponseEntity<List<Transaction>> searchTransactions(@RequestParam String keyword, Authentication auth) {
        Long userId = getCurrentUserId(auth);
        log.info("거래내역 검색: userId={}, keyword={}", userId, keyword);
        
        List<Transaction> transactions = transactionService.searchTransactions(userId, keyword);
        return ResponseEntity.ok(transactions);
    }
    
    /**
     * 월별 거래내역 요약
     */
    @Operation(summary = "월별 거래내역 요약", description = "특정 월의 거래내역 요약 정보를 조회합니다.")
    @GetMapping("/monthly-summary")
    public ResponseEntity<Map<String, Object>> getMonthlyTransactionSummary(
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM") YearMonth yearMonth,
            Authentication auth) {
        
        Long userId = getCurrentUserId(auth);
        log.info("월별 거래내역 요약 조회: userId={}, yearMonth={}", userId, yearMonth);
        
        Map<String, Object> summary = transactionService.getMonthlyTransactionSummary(userId, yearMonth);
        return ResponseEntity.ok(summary);
    }
    
    /**
     * 카테고리별 지출 통계
     */
    @Operation(summary = "카테고리별 지출 통계", description = "카테고리별 지출 통계를 조회합니다.")
    @GetMapping("/stats/category-expense")
    public ResponseEntity<List<Map<String, Object>>> getCategoryExpenseStats(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            Authentication auth) {
        
        Long userId = getCurrentUserId(auth);
        log.info("카테고리별 지출 통계 조회: userId={}, startDate={}, endDate={}", userId, startDate, endDate);
        
        List<Map<String, Object>> stats = transactionService.getCategoryExpenseStats(userId, startDate, endDate);
        return ResponseEntity.ok(stats);
    }
    
    /**
     * 월별 수입/지출 추이
     */
    @Operation(summary = "월별 수입/지출 추이", description = "최근 N개월의 수입/지출 추이를 조회합니다.")
    @GetMapping("/stats/monthly-trend")
    public ResponseEntity<List<Map<String, Object>>> getMonthlyIncomeExpenseTrend(
            @RequestParam(defaultValue = "12") int months,
            Authentication auth) {
        
        Long userId = getCurrentUserId(auth);
        log.info("월별 수입/지출 추이 조회: userId={}, months={}", userId, months);
        
        List<Map<String, Object>> trend = transactionService.getMonthlyIncomeExpenseTrend(userId, months);
        return ResponseEntity.ok(trend);
    }
    
    /**
     * 거래내역 개수 조회
     */
    @Operation(summary = "거래내역 개수 조회", description = "사용자의 총 거래내역 개수를 조회합니다.")
    @GetMapping("/count")
    public ResponseEntity<Map<String, Object>> getUserTransactionCount(Authentication auth) {
        Long userId = getCurrentUserId(auth);
        log.info("거래내역 개수 조회: userId={}", userId);
        
        int count = transactionService.getUserTransactionCount(userId);
        
        Map<String, Object> response = new HashMap<>();
        response.put("userId", userId);
        response.put("transactionCount", count);
        
        return ResponseEntity.ok(response);
    }
    
    /**
     * 대시보드 데이터 조회
     */
    @Operation(summary = "대시보드 데이터 조회", description = "대시보드에 표시할 종합 데이터를 조회합니다.")
    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> getDashboardData(Authentication auth) {
        Long userId = getCurrentUserId(auth);
        log.info("대시보드 데이터 조회: userId={}", userId);
        
        Map<String, Object> dashboard = new HashMap<>();
        
        try {
            // 이번 달 요약
            YearMonth currentMonth = YearMonth.now();
            Map<String, Object> monthlySummary = transactionService.getMonthlyTransactionSummary(userId, currentMonth);
            
            // 최근 거래내역 (5개)
            List<Transaction> recentTransactions = transactionService.getUserTransactions(userId, 0, 5);
            
            // 월별 추이 (6개월)
            List<Map<String, Object>> monthlyTrend = transactionService.getMonthlyIncomeExpenseTrend(userId, 6);
            
            // 카테고리별 지출 통계 (이번 달)
            LocalDate startOfMonth = currentMonth.atDay(1);
            LocalDate endOfMonth = currentMonth.atEndOfMonth();
            List<Map<String, Object>> categoryStats = transactionService.getCategoryExpenseStats(userId, startOfMonth, endOfMonth);
            
            // 총 거래내역 개수
            int totalTransactions = transactionService.getUserTransactionCount(userId);
            
            dashboard.put("monthlySummary", monthlySummary);
            dashboard.put("recentTransactions", recentTransactions);
            dashboard.put("monthlyTrend", monthlyTrend);
            dashboard.put("categoryStats", categoryStats);
            dashboard.put("totalTransactions", totalTransactions);
            
            return ResponseEntity.ok(dashboard);
            
        } catch (Exception e) {
            log.error("대시보드 데이터 조회 실패: {}", e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * 현재 인증된 사용자 ID 추출
     */
    private Long getCurrentUserId(Authentication auth) {
        if (auth != null && auth.getPrincipal() instanceof JwtAuthenticationFilter.UserPrincipal) {
            return ((JwtAuthenticationFilter.UserPrincipal) auth.getPrincipal()).getUserId();
        }
        throw new RuntimeException("인증 정보를 찾을 수 없습니다.");
    }
}
package com.moneyshift.expense.controller;

import com.moneyshift.expense.filter.JwtAuthenticationFilter;
import com.moneyshift.expense.service.AssetService;
import com.moneyshift.expense.service.TransactionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 통계 및 분석 데이터 API 컨트롤러
 */
@Slf4j
@RestController
@RequestMapping("/v1/statistics")
@RequiredArgsConstructor
@Tag(name = "Statistics", description = "통계 및 분석 API")
public class StatisticsController {
    
    private final TransactionService transactionService;
    private final AssetService assetService;
    
    /**
     * 전체 재무 현황 요약
     */
    @Operation(summary = "재무 현황 요약", description = "사용자의 전체적인 재무 현황을 요약해서 제공합니다.")
    @GetMapping("/financial-overview")
    public ResponseEntity<Map<String, Object>> getFinancialOverview(Authentication auth) {
        Long userId = getCurrentUserId(auth);
        log.info("재무 현황 요약 조회: userId={}", userId);
        
        try {
            Map<String, Object> overview = new HashMap<>();
            
            // 현재 총 자산
            BigDecimal totalAssets = assetService.getTotalBalance(userId);
            
            // 이번 달 요약
            YearMonth currentMonth = YearMonth.now();
            Map<String, Object> monthlySummary = transactionService.getMonthlyTransactionSummary(userId, currentMonth);
            
            // 최근 3개월 추이
            List<Map<String, Object>> quarterlyTrend = transactionService.getMonthlyIncomeExpenseTrend(userId, 3);
            
            // 거래내역 총 개수
            int totalTransactions = transactionService.getUserTransactionCount(userId);
            
            overview.put("totalAssets", totalAssets);
            overview.put("monthlySummary", monthlySummary);
            overview.put("quarterlyTrend", quarterlyTrend);
            overview.put("totalTransactions", totalTransactions);
            overview.put("generatedAt", LocalDate.now());
            
            return ResponseEntity.ok(overview);
            
        } catch (Exception e) {
            log.error("재무 현황 요약 조회 실패: {}", e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * 월별 수입/지출 분석
     */
    @Operation(summary = "월별 수입/지출 분석", description = "지정된 기간 동안의 월별 수입/지출 추이를 분석합니다.")
    @GetMapping("/monthly-analysis")
    public ResponseEntity<Map<String, Object>> getMonthlyAnalysis(
            @RequestParam(defaultValue = "12") int months,
            Authentication auth) {
        
        Long userId = getCurrentUserId(auth);
        log.info("월별 수입/지출 분석: userId={}, months={}", userId, months);
        
        try {
            List<Map<String, Object>> monthlyTrend = transactionService.getMonthlyIncomeExpenseTrend(userId, months);
            
            // 추가 분석 데이터 계산
            BigDecimal totalIncome = BigDecimal.ZERO;
            BigDecimal totalExpense = BigDecimal.ZERO;
            BigDecimal maxIncome = BigDecimal.ZERO;
            BigDecimal maxExpense = BigDecimal.ZERO;
            
            for (Map<String, Object> monthData : monthlyTrend) {
                BigDecimal income = (BigDecimal) monthData.getOrDefault("totalIncome", BigDecimal.ZERO);
                BigDecimal expense = (BigDecimal) monthData.getOrDefault("totalExpense", BigDecimal.ZERO);
                
                totalIncome = totalIncome.add(income);
                totalExpense = totalExpense.add(expense);
                
                if (income.compareTo(maxIncome) > 0) maxIncome = income;
                if (expense.compareTo(maxExpense) > 0) maxExpense = expense;
            }
            
            BigDecimal avgIncome = months > 0 ? totalIncome.divide(BigDecimal.valueOf(months), 2, BigDecimal.ROUND_HALF_UP) : BigDecimal.ZERO;
            BigDecimal avgExpense = months > 0 ? totalExpense.divide(BigDecimal.valueOf(months), 2, BigDecimal.ROUND_HALF_UP) : BigDecimal.ZERO;
            BigDecimal netIncome = totalIncome.subtract(totalExpense);
            
            Map<String, Object> analysis = new HashMap<>();
            analysis.put("monthlyData", monthlyTrend);
            analysis.put("summary", Map.of(
                "totalIncome", totalIncome,
                "totalExpense", totalExpense,
                "netIncome", netIncome,
                "avgIncome", avgIncome,
                "avgExpense", avgExpense,
                "maxIncome", maxIncome,
                "maxExpense", maxExpense,
                "period", months + "개월"
            ));
            
            return ResponseEntity.ok(analysis);
            
        } catch (Exception e) {
            log.error("월별 수입/지출 분석 실패: {}", e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * 카테고리별 지출 분석
     */
    @Operation(summary = "카테고리별 지출 분석", description = "지정된 기간 동안의 카테고리별 지출을 분석합니다.")
    @GetMapping("/category-analysis")
    public ResponseEntity<Map<String, Object>> getCategoryExpenseAnalysis(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            Authentication auth) {
        
        Long userId = getCurrentUserId(auth);
        log.info("카테고리별 지출 분석: userId={}, startDate={}, endDate={}", userId, startDate, endDate);
        
        try {
            List<Map<String, Object>> categoryStats = transactionService.getCategoryExpenseStats(userId, startDate, endDate);
            
            // 총 지출 및 추가 분석
            BigDecimal totalExpense = BigDecimal.ZERO;
            String topCategory = null;
            BigDecimal topCategoryAmount = BigDecimal.ZERO;
            
            for (Map<String, Object> category : categoryStats) {
                BigDecimal amount = (BigDecimal) category.getOrDefault("totalAmount", BigDecimal.ZERO);
                totalExpense = totalExpense.add(amount);
                
                if (amount.compareTo(topCategoryAmount) > 0) {
                    topCategoryAmount = amount;
                    topCategory = (String) category.get("categoryName");
                }
            }
            
            // 각 카테고리의 비율 계산
            for (Map<String, Object> category : categoryStats) {
                BigDecimal amount = (BigDecimal) category.getOrDefault("totalAmount", BigDecimal.ZERO);
                if (totalExpense.compareTo(BigDecimal.ZERO) > 0) {
                    BigDecimal percentage = amount.divide(totalExpense, 4, BigDecimal.ROUND_HALF_UP)
                            .multiply(BigDecimal.valueOf(100));
                    category.put("percentage", percentage);
                } else {
                    category.put("percentage", BigDecimal.ZERO);
                }
            }
            
            Map<String, Object> analysis = new HashMap<>();
            analysis.put("categoryData", categoryStats);
            analysis.put("summary", Map.of(
                "totalExpense", totalExpense,
                "topCategory", topCategory != null ? topCategory : "없음",
                "topCategoryAmount", topCategoryAmount,
                "categoryCount", categoryStats.size(),
                "period", startDate + " ~ " + endDate
            ));
            
            return ResponseEntity.ok(analysis);
            
        } catch (Exception e) {
            log.error("카테고리별 지출 분석 실패: {}", e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * 자산별 현황 분석
     */
    @Operation(summary = "자산별 현황 분석", description = "사용자의 자산별 잔액 및 비율을 분석합니다.")
    @GetMapping("/asset-analysis")
    public ResponseEntity<Map<String, Object>> getAssetAnalysis(Authentication auth) {
        Long userId = getCurrentUserId(auth);
        log.info("자산별 현황 분석: userId={}", userId);
        
        try {
            var assets = assetService.getUserAssets(userId);
            BigDecimal totalBalance = assetService.getTotalBalance(userId);
            
            // 자산별 비율 계산
            var assetAnalysis = assets.stream().map(asset -> {
                Map<String, Object> assetData = new HashMap<>();
                assetData.put("assetId", asset.getAssetId());
                assetData.put("assetName", asset.getAssetName());
                assetData.put("assetType", asset.getAssetType());
                assetData.put("balance", asset.getBalance());
                
                if (totalBalance.compareTo(BigDecimal.ZERO) > 0) {
                    BigDecimal percentage = asset.getBalance().divide(totalBalance, 4, BigDecimal.ROUND_HALF_UP)
                            .multiply(BigDecimal.valueOf(100));
                    assetData.put("percentage", percentage);
                } else {
                    assetData.put("percentage", BigDecimal.ZERO);
                }
                
                return assetData;
            }).toList();
            
            // 자산 유형별 요약
            Map<String, BigDecimal> typeBalances = new HashMap<>();
            for (var asset : assets) {
                String type = asset.getAssetType().toString();
                typeBalances.put(type, 
                    typeBalances.getOrDefault(type, BigDecimal.ZERO).add(asset.getBalance())
                );
            }
            
            Map<String, Object> analysis = new HashMap<>();
            analysis.put("assets", assetAnalysis);
            analysis.put("summary", Map.of(
                "totalBalance", totalBalance,
                "assetCount", assets.size(),
                "typeBreakdown", typeBalances
            ));
            
            return ResponseEntity.ok(analysis);
            
        } catch (Exception e) {
            log.error("자산별 현황 분석 실패: {}", e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * 기간별 비교 분석
     */
    @Operation(summary = "기간별 비교 분석", description = "두 기간의 수입/지출을 비교 분석합니다.")
    @GetMapping("/period-comparison")
    public ResponseEntity<Map<String, Object>> getPeriodComparison(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate period1Start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate period1End,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate period2Start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate period2End,
            Authentication auth) {
        
        Long userId = getCurrentUserId(auth);
        log.info("기간별 비교 분석: userId={}, period1={}-{}, period2={}-{}", 
                userId, period1Start, period1End, period2Start, period2End);
        
        try {
            // 각 기간의 거래내역 조회
            var period1Transactions = transactionService.getTransactionsByDateRange(userId, period1Start, period1End);
            var period2Transactions = transactionService.getTransactionsByDateRange(userId, period2Start, period2End);
            
            // 기간별 합계 계산
            BigDecimal period1Income = period1Transactions.stream()
                .filter(t -> t.getTransactionType() == com.moneyshift.expense.model.Transaction.TransactionType.INCOME)
                .map(com.moneyshift.expense.model.Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
                
            BigDecimal period1Expense = period1Transactions.stream()
                .filter(t -> t.getTransactionType() == com.moneyshift.expense.model.Transaction.TransactionType.EXPENSE)
                .map(com.moneyshift.expense.model.Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
                
            BigDecimal period2Income = period2Transactions.stream()
                .filter(t -> t.getTransactionType() == com.moneyshift.expense.model.Transaction.TransactionType.INCOME)
                .map(com.moneyshift.expense.model.Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
                
            BigDecimal period2Expense = period2Transactions.stream()
                .filter(t -> t.getTransactionType() == com.moneyshift.expense.model.Transaction.TransactionType.EXPENSE)
                .map(com.moneyshift.expense.model.Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
            
            // 변화율 계산
            BigDecimal incomeChange = calculatePercentageChange(period1Income, period2Income);
            BigDecimal expenseChange = calculatePercentageChange(period1Expense, period2Expense);
            
            Map<String, Object> comparison = new HashMap<>();
            comparison.put("period1", Map.of(
                "startDate", period1Start,
                "endDate", period1End,
                "income", period1Income,
                "expense", period1Expense,
                "net", period1Income.subtract(period1Expense),
                "transactionCount", period1Transactions.size()
            ));
            comparison.put("period2", Map.of(
                "startDate", period2Start,
                "endDate", period2End,
                "income", period2Income,
                "expense", period2Expense,
                "net", period2Income.subtract(period2Expense),
                "transactionCount", period2Transactions.size()
            ));
            comparison.put("changes", Map.of(
                "incomeChange", incomeChange,
                "expenseChange", expenseChange,
                "transactionCountChange", period2Transactions.size() - period1Transactions.size()
            ));
            
            return ResponseEntity.ok(comparison);
            
        } catch (Exception e) {
            log.error("기간별 비교 분석 실패: {}", e.getMessage());
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
    
    /**
     * 변화율 계산 (백분율)
     */
    private BigDecimal calculatePercentageChange(BigDecimal oldValue, BigDecimal newValue) {
        if (oldValue.compareTo(BigDecimal.ZERO) == 0) {
            return newValue.compareTo(BigDecimal.ZERO) == 0 ? BigDecimal.ZERO : BigDecimal.valueOf(100);
        }
        return newValue.subtract(oldValue)
                .divide(oldValue, 4, BigDecimal.ROUND_HALF_UP)
                .multiply(BigDecimal.valueOf(100));
    }
}
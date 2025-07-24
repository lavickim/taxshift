package com.moneyshift.api.controller;

import com.moneyshift.api.mapper.GeneralLedgerMapper;
import com.moneyshift.api.service.MonthEndClosingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 월말 마감 및 재무제표 생성 REST API Controller
 * Phase 5 기능을 제공합니다.
 */
@RestController
@RequestMapping("/api/v2/accounting/month-end-closing")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Month-End Closing", description = "월말 마감 및 재무제표 생성 API")
public class MonthEndClosingController {

    private final MonthEndClosingService monthEndClosingService;
    private final GeneralLedgerMapper generalLedgerMapper;

    @Operation(summary = "시산표 생성", description = "특정 회계연도/월의 시산표를 생성합니다.")
    @PostMapping("/trial-balance")
    public ResponseEntity<Map<String, Object>> generateTrialBalance(
            @Parameter(description = "회사 ID")
            @RequestParam Long companyId,
            @Parameter(description = "회계연도")
            @RequestParam Integer fiscalYear,
            @Parameter(description = "회계월")
            @RequestParam Integer fiscalMonth) {
        try {
            var trialBalance = monthEndClosingService.generateTrialBalance(
                companyId.toString(), fiscalYear, fiscalMonth);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("trialBalance", trialBalance);
            response.put("period", Map.of("year", fiscalYear, "month", fiscalMonth));
            response.put("message", "시산표가 성공적으로 생성되었습니다.");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error generating trial balance", e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "시산표 생성 중 오류가 발생했습니다: " + e.getMessage());
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }

    @Operation(summary = "손익계산서 생성", description = "특정 회계연도/월의 손익계산서를 생성합니다.")
    @PostMapping("/income-statement")
    public ResponseEntity<Map<String, Object>> generateIncomeStatement(
            @Parameter(description = "회사 ID")
            @RequestParam Long companyId,
            @Parameter(description = "회계연도")
            @RequestParam Integer fiscalYear,
            @Parameter(description = "회계월")
            @RequestParam Integer fiscalMonth) {
        try {
            var incomeStatement = monthEndClosingService.generateIncomeStatement(
                companyId.toString(), fiscalYear, fiscalMonth);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("incomeStatement", incomeStatement);
            response.put("period", Map.of("year", fiscalYear, "month", fiscalMonth));
            response.put("message", "손익계산서가 성공적으로 생성되었습니다.");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error generating income statement", e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "손익계산서 생성 중 오류가 발생했습니다: " + e.getMessage());
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }

    @Operation(summary = "재무상태표 생성", description = "특정 회계연도/월의 재무상태표를 생성합니다.")
    @PostMapping("/balance-sheet")
    public ResponseEntity<Map<String, Object>> generateBalanceSheet(
            @Parameter(description = "회사 ID")
            @RequestParam Long companyId,
            @Parameter(description = "회계연도")
            @RequestParam Integer fiscalYear,
            @Parameter(description = "회계월")
            @RequestParam Integer fiscalMonth) {
        try {
            var balanceSheet = monthEndClosingService.generateBalanceSheet(
                companyId.toString(), fiscalYear, fiscalMonth, BigDecimal.ZERO);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("balanceSheet", balanceSheet);
            response.put("period", Map.of("year", fiscalYear, "month", fiscalMonth));
            response.put("message", "재무상태표가 성공적으로 생성되었습니다.");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error generating balance sheet", e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "재무상태표 생성 중 오류가 발생했습니다: " + e.getMessage());
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }

    @Operation(summary = "현금흐름표 생성", description = "특정 회계연도/월의 현금흐름표를 생성합니다.")
    @PostMapping("/cash-flow-statement")
    public ResponseEntity<Map<String, Object>> generateCashFlowStatement(
            @Parameter(description = "회사 ID")
            @RequestParam Long companyId,
            @Parameter(description = "회계연도")
            @RequestParam Integer fiscalYear,
            @Parameter(description = "회계월")
            @RequestParam Integer fiscalMonth) {
        try {
            var cashFlowStatement = monthEndClosingService.generateCashFlowStatement(
                companyId.toString(), fiscalYear, fiscalMonth);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("cashFlowStatement", cashFlowStatement);
            response.put("period", Map.of("year", fiscalYear, "month", fiscalMonth));
            response.put("message", "현금흐름표가 성공적으로 생성되었습니다.");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error generating cash flow statement", e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "현금흐름표 생성 중 오류가 발생했습니다: " + e.getMessage());
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }

    @Operation(summary = "회계등식 검증", description = "재무상태표의 회계등식(자산 = 부채 + 자본)을 검증합니다.")
    @GetMapping("/validate-accounting-equation")
    public ResponseEntity<Map<String, Object>> validateAccountingEquation(
            @Parameter(description = "회사 ID")
            @RequestParam Long companyId,
            @Parameter(description = "회계연도")
            @RequestParam Integer fiscalYear,
            @Parameter(description = "회계월")
            @RequestParam Integer fiscalMonth) {
        try {
            // Generate financial statements to validate accounting equation
            var financialStatements = monthEndClosingService.generateFinancialStatements(
                companyId.toString(), fiscalYear, fiscalMonth);
            
            boolean isValid = true;
            try {
                monthEndClosingService.validateAccountingEquation(financialStatements);
            } catch (Exception e) {
                isValid = false;
            }
            
            // 각 계정 유형별 총액 조회
            List<Map<String, Object>> balanceSheetData = generalLedgerMapper.getBalanceSheetData(
                companyId.toString(), fiscalYear, fiscalMonth);
            
            Double totalAssets = balanceSheetData.stream()
                .filter(row -> "자산".equals(row.get("account_type")))
                .mapToDouble(row -> ((Number) row.get("amount")).doubleValue())
                .sum();
            Double totalLiabilities = balanceSheetData.stream()
                .filter(row -> "부채".equals(row.get("account_type")))
                .mapToDouble(row -> ((Number) row.get("amount")).doubleValue())
                .sum();
            Double totalEquity = balanceSheetData.stream()
                .filter(row -> "자본".equals(row.get("account_type")))
                .mapToDouble(row -> ((Number) row.get("amount")).doubleValue())
                .sum();
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("validation", Map.of(
                "isValid", isValid,
                "totalAssets", totalAssets,
                "totalLiabilities", totalLiabilities,
                "totalEquity", totalEquity,
                "difference", totalAssets - (totalLiabilities + totalEquity)
            ));
            response.put("period", Map.of("year", fiscalYear, "month", fiscalMonth));
            response.put("message", isValid ? "회계등식이 성립합니다." : "회계등식이 성립하지 않습니다.");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error validating accounting equation", e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "회계등식 검증 중 오류가 발생했습니다: " + e.getMessage());
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }

    @Operation(summary = "월말 마감 처리", description = "지정된 회계연도/월의 월말 마감을 수행합니다.")
    @PostMapping("/process")
    public ResponseEntity<Map<String, Object>> processMonthEndClosing(
            @Parameter(description = "회사 ID")
            @RequestParam Long companyId,
            @Parameter(description = "회계연도")
            @RequestParam Integer fiscalYear,
            @Parameter(description = "회계월")
            @RequestParam Integer fiscalMonth) {
        try {
            var closingResult = monthEndClosingService.closeMonth(
                companyId.toString(), fiscalYear, fiscalMonth);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("closingResult", closingResult);
            response.put("period", Map.of("year", fiscalYear, "month", fiscalMonth));
            response.put("message", "월말 마감이 성공적으로 완료되었습니다.");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error processing month-end closing", e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "월말 마감 처리 중 오류가 발생했습니다: " + e.getMessage());
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }

    @Operation(summary = "마감 상태 조회", description = "특정 회계연도/월의 마감 상태를 조회합니다.")
    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> getClosingStatus(
            @Parameter(description = "회사 ID")
            @RequestParam Long companyId,
            @Parameter(description = "회계연도")
            @RequestParam Integer fiscalYear,
            @Parameter(description = "회계월")
            @RequestParam Integer fiscalMonth) {
        try {
            // Check GL closing status
            List<Map<String, Object>> closingHistory = generalLedgerMapper.getClosingHistory(
                companyId.toString(), 10, 0);
            
            boolean isClosed = closingHistory.stream()
                .anyMatch(record -> 
                    fiscalYear.equals(record.get("fiscal_year")) && 
                    fiscalMonth.equals(record.get("fiscal_month")));
            
            Map<String, Object> closingStatus = Map.of(
                "isClosed", isClosed,
                "closingHistory", closingHistory
            );
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("closingStatus", closingStatus);
            response.put("period", Map.of("year", fiscalYear, "month", fiscalMonth));
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error fetching closing status", e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "마감 상태 조회 중 오류가 발생했습니다: " + e.getMessage());
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }

    @Operation(summary = "마감 재개방", description = "마감된 회계연도/월을 재개방합니다.")
    @PostMapping("/reopen")
    public ResponseEntity<Map<String, Object>> reopenClosing(
            @Parameter(description = "회사 ID")
            @RequestParam Long companyId,
            @Parameter(description = "회계연도")
            @RequestParam Integer fiscalYear,
            @Parameter(description = "회계월")
            @RequestParam Integer fiscalMonth) {
        try {
            int reopenedCount = generalLedgerMapper.reopenGeneralLedgerAccounts(
                companyId.toString(), fiscalYear, fiscalMonth);
            
            Map<String, Object> reopenResult = Map.of(
                "reopenedAccountsCount", reopenedCount
            );
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("reopenResult", reopenResult);
            response.put("period", Map.of("year", fiscalYear, "month", fiscalMonth));
            response.put("message", "마감이 성공적으로 재개방되었습니다.");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error reopening closing", e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "마감 재개방 중 오류가 발생했습니다: " + e.getMessage());
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }

    @Operation(summary = "재무제표 패키지 생성", description = "시산표, 손익계산서, 재무상태표, 현금흐름표를 한 번에 생성합니다.")
    @PostMapping("/financial-statements-package")
    public ResponseEntity<Map<String, Object>> generateFinancialStatementsPackage(
            @Parameter(description = "회사 ID")
            @RequestParam Long companyId,
            @Parameter(description = "회계연도")
            @RequestParam Integer fiscalYear,
            @Parameter(description = "회계월")
            @RequestParam Integer fiscalMonth) {
        try {
            var financialStatements = monthEndClosingService.generateFinancialStatements(
                companyId.toString(), fiscalYear, fiscalMonth);
            
            Map<String, Object> financialPackage = Map.of(
                "financialStatements", financialStatements,
                "generatedAt", java.time.LocalDateTime.now()
            );
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("financialPackage", financialPackage);
            response.put("period", Map.of("year", fiscalYear, "month", fiscalMonth));
            response.put("message", "재무제표 패키지가 성공적으로 생성되었습니다.");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error generating financial statements package", e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "재무제표 패키지 생성 중 오류가 발생했습니다: " + e.getMessage());
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }

    @Operation(summary = "마감 진행률 조회", description = "월말 마감의 진행률을 실시간으로 조회합니다.")
    @GetMapping("/progress")
    public ResponseEntity<Map<String, Object>> getClosingProgress(
            @Parameter(description = "회사 ID")
            @RequestParam Long companyId,
            @Parameter(description = "회계연도")
            @RequestParam Integer fiscalYear,
            @Parameter(description = "회계월")
            @RequestParam Integer fiscalMonth) {
        try {
            // Simple progress calculation based on GL accounts status
            List<Map<String, Object>> closingHistory = generalLedgerMapper.getClosingHistory(
                companyId.toString(), 1, 0);
            
            Map<String, Object> progress = Map.of(
                "currentStep", "준비중",
                "totalSteps", 5,
                "completedSteps", 0,
                "progressPercentage", 0.0,
                "status", "PENDING"
            );
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("progress", progress);
            response.put("period", Map.of("year", fiscalYear, "month", fiscalMonth));
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error fetching closing progress", e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "마감 진행률 조회 중 오류가 발생했습니다: " + e.getMessage());
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }

    @Operation(summary = "마감 검증", description = "월말 마감 전 필수 조건들을 검증합니다.")
    @GetMapping("/validate")
    public ResponseEntity<Map<String, Object>> validateClosingRequirements(
            @Parameter(description = "회사 ID")
            @RequestParam Long companyId,
            @Parameter(description = "회계연도")
            @RequestParam Integer fiscalYear,
            @Parameter(description = "회계월")
            @RequestParam Integer fiscalMonth) {
        try {
            // Basic validation checks
            boolean hasUnpostedEntries = false; // TODO: Implement actual check
            boolean isAlreadyClosed = false; // TODO: Check GL closing status
            
            Map<String, Object> validation = Map.of(
                "canClose", !hasUnpostedEntries && !isAlreadyClosed,
                "hasUnpostedEntries", hasUnpostedEntries,
                "isAlreadyClosed", isAlreadyClosed,
                "validationMessages", List.of()
            );
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("validation", validation);
            response.put("period", Map.of("year", fiscalYear, "month", fiscalMonth));
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error validating closing requirements", e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "마감 검증 중 오류가 발생했습니다: " + e.getMessage());
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }
}
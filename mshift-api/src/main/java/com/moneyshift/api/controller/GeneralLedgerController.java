package com.moneyshift.api.controller;

import com.moneyshift.api.mapper.GeneralLedgerMapper;
import com.moneyshift.api.model.GeneralLedger;
import com.moneyshift.api.model.GlDetail;
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
 * 총계정원장 관리 REST API Controller
 * GL 계정 관리, 시산표, 재무제표 생성 등의 기능을 제공합니다.
 */
@RestController
@RequestMapping("/api/v2/accounting/general-ledger")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "General Ledger", description = "총계정원장 관리 API")
public class GeneralLedgerController {

    private final GeneralLedgerMapper generalLedgerMapper;

    @Operation(summary = "GL 계정 조회", description = "특정 회사, 계정, 회계연도/월의 GL 계정을 조회합니다.")
    @GetMapping("/account")
    public ResponseEntity<Map<String, Object>> getGeneralLedgerAccount(
            @Parameter(description = "회사 ID")
            @RequestParam Long companyId,
            @Parameter(description = "계정과목 코드")
            @RequestParam String accountCode,
            @Parameter(description = "회계연도")
            @RequestParam Integer fiscalYear,
            @Parameter(description = "회계월")
            @RequestParam Integer fiscalMonth) {
        try {
            GeneralLedger glAccount = generalLedgerMapper.findGeneralLedgerAccount(
                companyId.toString(), accountCode, fiscalYear, fiscalMonth);
            
            Map<String, Object> response = new HashMap<>();
            if (glAccount != null) {
                response.put("success", true);
                response.put("glAccount", glAccount);
            } else {
                response.put("success", false);
                response.put("message", "해당 GL 계정을 찾을 수 없습니다.");
            }
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error fetching GL account", e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "GL 계정 조회 중 오류가 발생했습니다: " + e.getMessage());
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }

    @Operation(summary = "GL 계정 목록 조회", description = "조건에 따라 GL 계정 목록을 조회합니다.")
    @GetMapping("/accounts")
    public ResponseEntity<Map<String, Object>> getGeneralLedgerAccounts(
            @Parameter(description = "회사 ID")
            @RequestParam(required = false) Long companyId,
            @Parameter(description = "회계연도")
            @RequestParam(required = false) Integer fiscalYear,
            @Parameter(description = "회계월")
            @RequestParam(required = false) Integer fiscalMonth,
            @Parameter(description = "계정과목 코드 목록 (콤마 구분)")
            @RequestParam(required = false) List<String> accountCodes,
            @Parameter(description = "마감 여부")
            @RequestParam(required = false) Boolean isClosed) {
        try {
            List<GeneralLedger> glAccounts = generalLedgerMapper.findGeneralLedgerAccounts(
                companyId.toString(), fiscalYear, fiscalMonth, accountCodes, isClosed);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("glAccounts", glAccounts);
            response.put("total", glAccounts.size());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error fetching GL accounts", e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "GL 계정 목록 조회 중 오류가 발생했습니다: " + e.getMessage());
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }

    @Operation(summary = "GL 계정 생성/업데이트", description = "GL 계정을 생성하거나 기존 계정의 잔액을 업데이트합니다.")
    @PostMapping("/account")
    public ResponseEntity<Map<String, Object>> createOrUpdateGLAccount(
            @RequestBody GeneralLedger glAccount) {
        try {
            int result = generalLedgerMapper.insertGeneralLedgerAccount(glAccount);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("glAccount", glAccount);
            response.put("message", "GL 계정이 성공적으로 생성/업데이트되었습니다.");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error creating/updating GL account", e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "GL 계정 생성/업데이트 중 오류가 발생했습니다: " + e.getMessage());
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }

    @Operation(summary = "GL 계정 잔액 업데이트", description = "분개 전기 시 GL 계정의 잔액을 업데이트합니다.")
    @PutMapping("/account/{id}/balance")
    public ResponseEntity<Map<String, Object>> updateGLBalance(
            @Parameter(description = "GL 계정 ID")
            @PathVariable Long id,
            @Parameter(description = "차변 금액")
            @RequestParam Double debitAmount,
            @Parameter(description = "대변 금액")
            @RequestParam Double creditAmount) {
        try {
            int result = generalLedgerMapper.updateGeneralLedgerBalance(
                id, BigDecimal.valueOf(debitAmount), BigDecimal.valueOf(creditAmount));
            
            Map<String, Object> response = new HashMap<>();
            if (result > 0) {
                response.put("success", true);
                response.put("message", "GL 계정 잔액이 업데이트되었습니다.");
            } else {
                response.put("success", false);
                response.put("message", "해당 GL 계정을 찾을 수 없습니다.");
            }
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error updating GL balance", e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "GL 계정 잔액 업데이트 중 오류가 발생했습니다: " + e.getMessage());
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }

    @Operation(summary = "GL 상세 내역 생성", description = "분개 전기 시 GL 상세 내역을 생성합니다.")
    @PostMapping("/detail")
    public ResponseEntity<Map<String, Object>> createGLDetail(
            @RequestBody GlDetail glDetail) {
        try {
            int result = generalLedgerMapper.insertGLDetail(glDetail);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("glDetail", glDetail);
            response.put("message", "GL 상세 내역이 생성되었습니다.");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error creating GL detail", e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "GL 상세 내역 생성 중 오류가 발생했습니다: " + e.getMessage());
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }

    @Operation(summary = "GL 상세 내역 조회", description = "특정 GL 계정의 상세 내역을 조회합니다.")
    @GetMapping("/account/{id}/details")
    public ResponseEntity<Map<String, Object>> getGLDetails(
            @Parameter(description = "GL 계정 ID")
            @PathVariable Long id) {
        try {
            List<GlDetail> glDetails = generalLedgerMapper.findGLDetails(id);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("glDetails", glDetails);
            response.put("total", glDetails.size());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error fetching GL details for account: {}", id, e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "GL 상세 내역 조회 중 오류가 발생했습니다: " + e.getMessage());
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }

    @Operation(summary = "시산표 데이터 조회", description = "특정 회계연도/월의 시산표 데이터를 조회합니다.")
    @GetMapping("/trial-balance")
    public ResponseEntity<Map<String, Object>> getTrialBalanceData(
            @Parameter(description = "회사 ID")
            @RequestParam Long companyId,
            @Parameter(description = "회계연도")
            @RequestParam Integer fiscalYear,
            @Parameter(description = "회계월")
            @RequestParam Integer fiscalMonth) {
        try {
            List<Map<String, Object>> trialBalanceData = generalLedgerMapper.getTrialBalanceData(
                companyId.toString(), fiscalYear, fiscalMonth);
            
            // 시산표 총계 계산
            Double totalDebit = trialBalanceData.stream()
                .mapToDouble(row -> ((Number) row.get("debit_balance")).doubleValue())
                .sum();
            Double totalCredit = trialBalanceData.stream()
                .mapToDouble(row -> ((Number) row.get("credit_balance")).doubleValue())
                .sum();
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("trialBalanceData", trialBalanceData);
            response.put("summary", Map.of(
                "totalDebit", totalDebit,
                "totalCredit", totalCredit,
                "isBalanced", Math.abs(totalDebit - totalCredit) < 0.01,
                "period", Map.of("year", fiscalYear, "month", fiscalMonth)
            ));
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error fetching trial balance data", e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "시산표 데이터 조회 중 오류가 발생했습니다: " + e.getMessage());
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }

    @Operation(summary = "손익계산서 데이터 조회", description = "특정 회계연도/월의 손익계산서 데이터를 조회합니다.")
    @GetMapping("/income-statement")
    public ResponseEntity<Map<String, Object>> getIncomeStatementData(
            @Parameter(description = "회사 ID")
            @RequestParam Long companyId,
            @Parameter(description = "회계연도")
            @RequestParam Integer fiscalYear,
            @Parameter(description = "회계월")
            @RequestParam Integer fiscalMonth) {
        try {
            List<Map<String, Object>> incomeStatementData = generalLedgerMapper.getIncomeStatementData(
                companyId.toString(), fiscalYear, fiscalMonth);
            
            // 수익과 비용 분류 및 당기순이익 계산
            Double totalRevenue = incomeStatementData.stream()
                .filter(row -> "수익".equals(row.get("account_type")))
                .mapToDouble(row -> ((Number) row.get("amount")).doubleValue())
                .sum();
            Double totalExpenses = incomeStatementData.stream()
                .filter(row -> "비용".equals(row.get("account_type")))
                .mapToDouble(row -> ((Number) row.get("amount")).doubleValue())
                .sum();
            Double netIncome = totalRevenue - totalExpenses;
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("incomeStatementData", incomeStatementData);
            response.put("summary", Map.of(
                "totalRevenue", totalRevenue,
                "totalExpenses", totalExpenses,
                "netIncome", netIncome,
                "period", Map.of("year", fiscalYear, "month", fiscalMonth)
            ));
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error fetching income statement data", e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "손익계산서 데이터 조회 중 오류가 발생했습니다: " + e.getMessage());
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }

    @Operation(summary = "재무상태표 데이터 조회", description = "특정 회계연도/월의 재무상태표 데이터를 조회합니다.")
    @GetMapping("/balance-sheet")
    public ResponseEntity<Map<String, Object>> getBalanceSheetData(
            @Parameter(description = "회사 ID")
            @RequestParam Long companyId,
            @Parameter(description = "회계연도")
            @RequestParam Integer fiscalYear,
            @Parameter(description = "회계월")
            @RequestParam Integer fiscalMonth) {
        try {
            List<Map<String, Object>> balanceSheetData = generalLedgerMapper.getBalanceSheetData(
                companyId.toString(), fiscalYear, fiscalMonth);
            
            // 자산, 부채, 자본 분류 및 회계등식 검증
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
            
            boolean accountingEquationValid = Math.abs(totalAssets - (totalLiabilities + totalEquity)) < 0.01;
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("balanceSheetData", balanceSheetData);
            response.put("summary", Map.of(
                "totalAssets", totalAssets,
                "totalLiabilities", totalLiabilities,
                "totalEquity", totalEquity,
                "accountingEquationValid", accountingEquationValid,
                "period", Map.of("year", fiscalYear, "month", fiscalMonth)
            ));
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error fetching balance sheet data", e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "재무상태표 데이터 조회 중 오류가 발생했습니다: " + e.getMessage());
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }

    @Operation(summary = "현금흐름표 데이터 조회", description = "특정 회계연도/월의 현금흐름표 데이터를 조회합니다.")
    @GetMapping("/cash-flow")
    public ResponseEntity<Map<String, Object>> getCashFlowData(
            @Parameter(description = "회사 ID")
            @RequestParam Long companyId,
            @Parameter(description = "회계연도")
            @RequestParam Integer fiscalYear,
            @Parameter(description = "회계월")
            @RequestParam Integer fiscalMonth) {
        try {
            List<Map<String, Object>> cashFlowData = generalLedgerMapper.getCashFlowData(
                companyId.toString(), fiscalYear, fiscalMonth);
            
            // 현금 유입/유출 계산
            Double totalCashInflow = cashFlowData.stream()
                .filter(row -> ((Number) row.get("net_change")).doubleValue() > 0)
                .mapToDouble(row -> ((Number) row.get("net_change")).doubleValue())
                .sum();
            Double totalCashOutflow = cashFlowData.stream()
                .filter(row -> ((Number) row.get("net_change")).doubleValue() < 0)
                .mapToDouble(row -> Math.abs(((Number) row.get("net_change")).doubleValue()))
                .sum();
            Double netCashFlow = totalCashInflow - totalCashOutflow;
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("cashFlowData", cashFlowData);
            response.put("summary", Map.of(
                "totalCashInflow", totalCashInflow,
                "totalCashOutflow", totalCashOutflow,
                "netCashFlow", netCashFlow,
                "period", Map.of("year", fiscalYear, "month", fiscalMonth)
            ));
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error fetching cash flow data", e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "현금흐름표 데이터 조회 중 오류가 발생했습니다: " + e.getMessage());
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }

    @Operation(summary = "GL 계정 마감", description = "특정 회계연도/월의 GL 계정들을 마감 처리합니다.")
    @PostMapping("/close")
    public ResponseEntity<Map<String, Object>> closeGeneralLedgerAccounts(
            @Parameter(description = "회사 ID")
            @RequestParam Long companyId,
            @Parameter(description = "회계연도")
            @RequestParam Integer fiscalYear,
            @Parameter(description = "회계월")
            @RequestParam Integer fiscalMonth) {
        try {
            int closedCount = generalLedgerMapper.closeGeneralLedgerAccounts(
                companyId.toString(), fiscalYear, fiscalMonth);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("closedAccountsCount", closedCount);
            response.put("message", closedCount + "개의 GL 계정이 마감되었습니다.");
            response.put("period", Map.of("year", fiscalYear, "month", fiscalMonth));
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error closing GL accounts", e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "GL 계정 마감 중 오류가 발생했습니다: " + e.getMessage());
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }

    @Operation(summary = "GL 계정 마감 재개방", description = "마감된 GL 계정들을 재개방합니다.")
    @PostMapping("/reopen")
    public ResponseEntity<Map<String, Object>> reopenGeneralLedgerAccounts(
            @Parameter(description = "회사 ID")
            @RequestParam Long companyId,
            @Parameter(description = "회계연도")
            @RequestParam Integer fiscalYear,
            @Parameter(description = "회계월")
            @RequestParam Integer fiscalMonth) {
        try {
            int reopenedCount = generalLedgerMapper.reopenGeneralLedgerAccounts(
                companyId.toString(), fiscalYear, fiscalMonth);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("reopenedAccountsCount", reopenedCount);
            response.put("message", reopenedCount + "개의 GL 계정이 재개방되었습니다.");
            response.put("period", Map.of("year", fiscalYear, "month", fiscalMonth));
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error reopening GL accounts", e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "GL 계정 재개방 중 오류가 발생했습니다: " + e.getMessage());
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }

    @Operation(summary = "잔액 이월", description = "이전 월 기말잔액을 다음 월 기초잔액으로 이월합니다.")
    @PostMapping("/carry-forward")
    public ResponseEntity<Map<String, Object>> carryForwardBalances(
            @Parameter(description = "회사 ID")
            @RequestParam Long companyId,
            @Parameter(description = "회계연도")
            @RequestParam Integer fiscalYear,
            @Parameter(description = "회계월")
            @RequestParam Integer fiscalMonth) {
        try {
            int carriedForwardCount = generalLedgerMapper.carryForwardBalances(
                companyId.toString(), fiscalYear, fiscalMonth);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("carriedForwardCount", carriedForwardCount);
            response.put("message", carriedForwardCount + "개의 계정 잔액이 이월되었습니다.");
            response.put("fromPeriod", Map.of("year", fiscalYear, "month", fiscalMonth));
            response.put("toPeriod", Map.of(
                "year", fiscalMonth == 12 ? fiscalYear + 1 : fiscalYear,
                "month", fiscalMonth == 12 ? 1 : fiscalMonth + 1
            ));
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error carrying forward balances", e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "잔액 이월 중 오류가 발생했습니다: " + e.getMessage());
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }

    @Operation(summary = "GL 마감 이력 조회", description = "GL 계정의 마감 이력을 조회합니다.")
    @GetMapping("/closing-history")
    public ResponseEntity<Map<String, Object>> getClosingHistory(
            @Parameter(description = "회사 ID")
            @RequestParam Long companyId,
            @Parameter(description = "페이지 번호 (0부터 시작)", example = "0")
            @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "페이지 크기", example = "10")
            @RequestParam(defaultValue = "10") int size) {
        try {
            int offset = page * size;
            
            List<Map<String, Object>> closingHistory = generalLedgerMapper.getClosingHistory(
                companyId.toString(), size, offset);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("closingHistory", closingHistory);
            response.put("pagination", Map.of(
                "page", page,
                "size", size,
                "hasMore", closingHistory.size() == size
            ));
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error fetching closing history", e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "GL 마감 이력 조회 중 오류가 발생했습니다: " + e.getMessage());
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }
}
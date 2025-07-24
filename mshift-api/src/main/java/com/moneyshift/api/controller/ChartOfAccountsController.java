package com.moneyshift.api.controller;

import com.moneyshift.api.mapper.ChartOfAccountsMapper;
import com.moneyshift.api.model.ChartOfAccount;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 계정과목 관리 REST API Controller
 * 계정과목 CRUD, 검색, 통계 기능을 제공합니다.
 */
@RestController
@RequestMapping("/api/v2/accounting/chart-of-accounts")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Chart of Accounts", description = "계정과목 관리 API")
public class ChartOfAccountsController {

    private final ChartOfAccountsMapper chartOfAccountsMapper;

    @Operation(summary = "전체 활성 계정과목 조회", description = "활성화된 모든 계정과목을 표시 순서대로 조회합니다.")
    @GetMapping
    public ResponseEntity<Map<String, Object>> getAllActiveAccounts() {
        try {
            List<ChartOfAccount> accounts = chartOfAccountsMapper.findAllActiveAccounts();
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("accounts", accounts);
            response.put("total", accounts.size());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error fetching active accounts", e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "계정과목 조회 중 오류가 발생했습니다: " + e.getMessage());
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }

    @Operation(summary = "계정과목 코드로 조회", description = "계정과목 코드로 특정 계정과목을 조회합니다.")
    @GetMapping("/code/{accountCode}")
    public ResponseEntity<Map<String, Object>> getAccountByCode(
            @Parameter(description = "계정과목 코드", example = "1010")
            @PathVariable String accountCode) {
        try {
            ChartOfAccount account = chartOfAccountsMapper.findAccountByCode(accountCode);
            
            Map<String, Object> response = new HashMap<>();
            if (account != null) {
                response.put("success", true);
                response.put("account", account);
            } else {
                response.put("success", false);
                response.put("message", "해당 계정과목을 찾을 수 없습니다.");
            }
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error fetching account by code: {}", accountCode, e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "계정과목 조회 중 오류가 발생했습니다: " + e.getMessage());
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }

    @Operation(summary = "계정과목 ID로 조회", description = "계정과목 ID로 특정 계정과목을 조회합니다.")
    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getAccountById(
            @Parameter(description = "계정과목 ID")
            @PathVariable Long id) {
        try {
            ChartOfAccount account = chartOfAccountsMapper.findAccountById(id);
            
            Map<String, Object> response = new HashMap<>();
            if (account != null) {
                response.put("success", true);
                response.put("account", account);
            } else {
                response.put("success", false);
                response.put("message", "해당 계정과목을 찾을 수 없습니다.");
            }
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error fetching account by id: {}", id, e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "계정과목 조회 중 오류가 발생했습니다: " + e.getMessage());
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }

    @Operation(summary = "계정과목 유형별 조회", description = "계정과목 유형(자산, 부채, 자본, 수익, 비용)으로 계정과목을 조회합니다.")
    @GetMapping("/type/{accountType}")
    public ResponseEntity<Map<String, Object>> getAccountsByType(
            @Parameter(description = "계정과목 유형", example = "자산")
            @PathVariable String accountType) {
        try {
            List<ChartOfAccount> accounts = chartOfAccountsMapper.findAccountsByType(accountType);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("accounts", accounts);
            response.put("total", accounts.size());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error fetching accounts by type: {}", accountType, e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "계정과목 조회 중 오류가 발생했습니다: " + e.getMessage());
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }

    @Operation(summary = "계정과목 검색", description = "키워드로 계정과목을 검색합니다 (계정코드, 계정명, 설명 대상)")
    @GetMapping("/search")
    public ResponseEntity<Map<String, Object>> searchAccounts(
            @Parameter(description = "검색 키워드")
            @RequestParam(required = false) String keyword,
            @Parameter(description = "계정과목 유형 필터")
            @RequestParam(required = false) String accountType,
            @Parameter(description = "페이지 번호 (0부터 시작)", example = "0")
            @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "페이지 크기", example = "20")
            @RequestParam(defaultValue = "20") int size) {
        try {
            int offset = page * size;
            
            List<ChartOfAccount> accounts = chartOfAccountsMapper.searchAccounts(
                keyword, accountType, size, offset);
            Long total = chartOfAccountsMapper.countSearchAccounts(keyword, accountType);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("accounts", accounts);
            response.put("pagination", Map.of(
                "total", total,
                "page", page,
                "size", size,
                "totalPages", (total + size - 1) / size
            ));
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error searching accounts with keyword: {}", keyword, e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "계정과목 검색 중 오류가 발생했습니다: " + e.getMessage());
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }

    @Operation(summary = "계정과목 생성", description = "새로운 계정과목을 생성합니다.")
    @PostMapping
    public ResponseEntity<Map<String, Object>> createAccount(
            @RequestBody ChartOfAccount account) {
        try {
            // 계정과목 코드 중복 확인
            if (chartOfAccountsMapper.existsByAccountCode(account.getAccountCode())) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "이미 존재하는 계정과목 코드입니다.");
                return ResponseEntity.badRequest().body(response);
            }
            
            // 표시 순서 자동 설정 (필요시)
            if (account.getDisplayOrder() == null) {
                Integer maxOrder = chartOfAccountsMapper.getMaxDisplayOrder(account.getAccountType());
                account.setDisplayOrder(maxOrder + 1);
            }
            
            chartOfAccountsMapper.insertAccount(account);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("account", account);
            response.put("message", "계정과목이 성공적으로 생성되었습니다.");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error creating account", e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "계정과목 생성 중 오류가 발생했습니다: " + e.getMessage());
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }

    @Operation(summary = "계정과목 업데이트", description = "기존 계정과목 정보를 업데이트합니다.")
    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> updateAccount(
            @Parameter(description = "계정과목 ID")
            @PathVariable Long id,
            @RequestBody ChartOfAccount account) {
        try {
            account.setId(id.intValue());
            int updatedRows = chartOfAccountsMapper.updateAccount(account);
            
            Map<String, Object> response = new HashMap<>();
            if (updatedRows > 0) {
                response.put("success", true);
                response.put("account", account);
                response.put("message", "계정과목이 성공적으로 업데이트되었습니다.");
            } else {
                response.put("success", false);
                response.put("message", "해당 계정과목을 찾을 수 없습니다.");
            }
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error updating account: {}", id, e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "계정과목 업데이트 중 오류가 발생했습니다: " + e.getMessage());
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }

    @Operation(summary = "계정과목 비활성화", description = "계정과목을 비활성화합니다 (소프트 삭제)")
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> deactivateAccount(
            @Parameter(description = "계정과목 ID")
            @PathVariable Long id) {
        try {
            // 해당 계정과목이 분개에서 사용 중인지 확인
            ChartOfAccount account = chartOfAccountsMapper.findAccountById(id);
            if (account != null && chartOfAccountsMapper.isAccountInUse(account.getAccountCode())) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "분개에서 사용 중인 계정과목은 삭제할 수 없습니다.");
                return ResponseEntity.badRequest().body(response);
            }
            
            int updatedRows = chartOfAccountsMapper.deactivateAccount(id);
            
            Map<String, Object> response = new HashMap<>();
            if (updatedRows > 0) {
                response.put("success", true);
                response.put("message", "계정과목이 성공적으로 비활성화되었습니다.");
            } else {
                response.put("success", false);
                response.put("message", "해당 계정과목을 찾을 수 없습니다.");
            }
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error deactivating account: {}", id, e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "계정과목 비활성화 중 오류가 발생했습니다: " + e.getMessage());
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }

    @Operation(summary = "계정과목 활성화", description = "비활성화된 계정과목을 다시 활성화합니다.")
    @PutMapping("/{id}/activate")
    public ResponseEntity<Map<String, Object>> activateAccount(
            @Parameter(description = "계정과목 ID")
            @PathVariable Long id) {
        try {
            int updatedRows = chartOfAccountsMapper.activateAccount(id);
            
            Map<String, Object> response = new HashMap<>();
            if (updatedRows > 0) {
                response.put("success", true);
                response.put("message", "계정과목이 성공적으로 활성화되었습니다.");
            } else {
                response.put("success", false);
                response.put("message", "해당 계정과목을 찾을 수 없습니다.");
            }
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error activating account: {}", id, e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "계정과목 활성화 중 오류가 발생했습니다: " + e.getMessage());
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }

    @Operation(summary = "계정과목 계층 구조 조회", description = "특정 계정과목의 계층 구조를 조회합니다 (하위 계정 포함)")
    @GetMapping("/{id}/hierarchy")
    public ResponseEntity<Map<String, Object>> getAccountHierarchy(
            @Parameter(description = "계정과목 ID")
            @PathVariable Long id) {
        try {
            List<ChartOfAccount> hierarchy = chartOfAccountsMapper.findAccountHierarchy(id);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("hierarchy", hierarchy);
            response.put("total", hierarchy.size());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error fetching account hierarchy: {}", id, e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "계정과목 계층 구조 조회 중 오류가 발생했습니다: " + e.getMessage());
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }

    @Operation(summary = "계정과목 통계", description = "계정과목 유형별 통계 정보를 조회합니다.")
    @GetMapping("/statistics")
    public ResponseEntity<Map<String, Object>> getAccountStatistics() {
        try {
            List<Map<String, Object>> statistics = chartOfAccountsMapper.getAccountStatistics();
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("statistics", statistics);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error fetching account statistics", e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "계정과목 통계 조회 중 오류가 발생했습니다: " + e.getMessage());
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }

    @Operation(summary = "계정과목 사용 통계", description = "계정과목별 분개 사용 빈도와 금액 통계를 조회합니다.")
    @GetMapping("/usage-statistics")
    public ResponseEntity<Map<String, Object>> getAccountUsageStatistics(
            @Parameter(description = "시작 날짜 (YYYY-MM-DD)")
            @RequestParam(required = false) String startDate,
            @Parameter(description = "종료 날짜 (YYYY-MM-DD)")
            @RequestParam(required = false) String endDate) {
        try {
            List<Map<String, Object>> usageStats = chartOfAccountsMapper.getAccountUsageStatistics(
                startDate, endDate);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("usageStatistics", usageStats);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error fetching account usage statistics", e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "계정과목 사용 통계 조회 중 오류가 발생했습니다: " + e.getMessage());
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }

    @Operation(summary = "미사용 계정과목 조회", description = "분개에서 한 번도 사용되지 않은 계정과목을 조회합니다.")
    @GetMapping("/unused")
    public ResponseEntity<Map<String, Object>> getUnusedAccounts() {
        try {
            List<ChartOfAccount> unusedAccounts = chartOfAccountsMapper.findUnusedAccounts();
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("unusedAccounts", unusedAccounts);
            response.put("total", unusedAccounts.size());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error fetching unused accounts", e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "미사용 계정과목 조회 중 오류가 발생했습니다: " + e.getMessage());
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }

    @Operation(summary = "계정과목 일괄 생성", description = "여러 계정과목을 한 번에 생성합니다.")
    @PostMapping("/batch")
    public ResponseEntity<Map<String, Object>> createAccountsBatch(
            @RequestBody List<ChartOfAccount> accounts) {
        try {
            // 중복 계정코드 검증
            for (ChartOfAccount account : accounts) {
                if (chartOfAccountsMapper.existsByAccountCode(account.getAccountCode())) {
                    Map<String, Object> response = new HashMap<>();
                    response.put("success", false);
                    response.put("message", "중복된 계정과목 코드가 있습니다: " + account.getAccountCode());
                    return ResponseEntity.badRequest().body(response);
                }
            }
            
            chartOfAccountsMapper.insertAccountsBatch(accounts);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("createdCount", accounts.size());
            response.put("message", accounts.size() + "개의 계정과목이 성공적으로 생성되었습니다.");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error creating accounts batch", e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "계정과목 일괄 생성 중 오류가 발생했습니다: " + e.getMessage());
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }
}
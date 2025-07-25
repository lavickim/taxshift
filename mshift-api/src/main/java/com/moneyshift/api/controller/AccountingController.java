package com.moneyshift.api.controller;

import com.moneyshift.api.model.*;
import com.moneyshift.api.service.AccountingEngine;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.micrometer.core.annotation.Counted;
import io.micrometer.core.annotation.Timed;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

/**
 * 기장 시스템 API 컨트롤러 - 최신 OpenAPI + Validation 어노테이션 적용
 * 복식부기 분개 자동 생성 및 재무제표 생성 API
 */
@RestController
@RequestMapping("/api/v2/accounting")
@CrossOrigin(origins = "http://localhost:3000")
@Validated
@Tag(name = "Accounting API", description = "복식부기 회계 시스템 API - 분개 생성, 재무제표 생성")
public class AccountingController {
    
    private static final Logger logger = LoggerFactory.getLogger(AccountingController.class);
    
    @Autowired
    private AccountingEngine accountingEngine;
    
    // @Autowired
    // private MonthEndClosingService monthEndClosingService;

    /**
     * 거래 → 분개 자동 생성
     */
    @Operation(
        summary = "거래 데이터를 복식부기 분개로 자동 변환",
        description = "거래 내역을 분석하여 적절한 계정과목을 결정하고 복식부기 원칙에 따른 분개를 자동 생성합니다."
    )
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200", 
            description = "분개 생성 성공",
            content = @Content(schema = @Schema(implementation = JournalEntryResponse.class))
        ),
        @ApiResponse(
            responseCode = "400", 
            description = "잘못된 요청 (거래 ID 누락 등)",
            content = @Content(schema = @Schema(implementation = JournalEntryResponse.class))
        ),
        @ApiResponse(
            responseCode = "500", 
            description = "서버 오류",
            content = @Content(schema = @Schema(implementation = JournalEntryResponse.class))
        )
    })
    @Timed(value = "accounting.process.transaction", description = "거래→분개 변환 소요시간")
    @Counted(value = "accounting.process.transaction.total", description = "거래→분개 변환 총 요청 수")
    @PostMapping("/process-transaction")
    public ResponseEntity<JournalEntryResponse> processTransaction(
            @Parameter(description = "거래→분개 생성 요청", required = true)
            @Valid @RequestBody TransactionToJournalRequest request) {
        
        long startTime = System.currentTimeMillis();
        
        try {
            logger.info("거래 분개 생성 요청: {}", request);
            
            // 입력 검증
            if (request.getTransactionId() == null) {
                return ResponseEntity.badRequest()
                    .body(JournalEntryResponse.error("거래 ID가 필요합니다."));
            }
            
            // 분개 생성
            JournalEntry journalEntry = accountingEngine.processTransaction(request);
            
            // 응답 생성
            JournalEntryResponse response = JournalEntryResponse.success(journalEntry);
            
            // 처리 정보 추가
            long processingTime = System.currentTimeMillis() - startTime;
            JournalEntryResponse.ProcessingInfo processingInfo = 
                JournalEntryResponse.ProcessingInfo.builder()
                    .processingTimeMs(processingTime)
                    .validationPassed(true)
                    .accountMappingSource("TAG_MAPPING")
                    .build();
            response.setProcessingInfo(processingInfo);
            
            logger.info("거래 분개 생성 성공: journalEntryId={}, processingTime={}ms", 
                       journalEntry.getId(), processingTime);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            logger.error("거래 분개 생성 실패: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError()
                .body(JournalEntryResponse.error("분개 생성 중 오류가 발생했습니다: " + e.getMessage()));
        }
    }

    /**
     * 분개 상세 조회
     */
    @Operation(summary = "분개 상세 조회", description = "분개 ID로 분개 상세 내역을 조회합니다.")
    @Timed(value = "accounting.journal.entry.get", description = "분개 조회 소요시간")
    @Counted(value = "accounting.journal.entry.get.total", description = "분개 조회 총 요청 수")
    @GetMapping("/journal-entry/{id}")
    public ResponseEntity<JournalEntry> getJournalEntry(
            @Parameter(description = "분개 ID", required = true) @PathVariable Long id) {
        try {
            logger.debug("분개 조회 요청: journalEntryId={}", id);
            
            JournalEntry journalEntry = accountingEngine.loadJournalEntryWithDetails(id);
            if (journalEntry == null) {
                return ResponseEntity.notFound().build();
            }
            
            return ResponseEntity.ok(journalEntry);
            
        } catch (Exception e) {
            logger.error("분개 조회 실패: journalEntryId={}, error={}", id, e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * 분개 목록 조회
     */
    @Operation(
        summary = "회사별 기간별 분개 목록 조회",
        description = "지정된 회사의 특정 기간 동안 생성된 모든 분개 목록을 조회합니다."
    )
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200",
            description = "분개 목록 조회 성공",
            content = @Content(schema = @Schema(implementation = JournalEntry.class))
        ),
        @ApiResponse(
            responseCode = "400",
            description = "잘못된 요청 (필수 파라미터 누락 등)"
        ),
        @ApiResponse(
            responseCode = "500",
            description = "서버 오류"
        )
    })
    @Timed(value = "accounting.journal.entries.list", description = "분개 목록 조회 소요시간")
    @Counted(value = "accounting.journal.entries.list.total", description = "분개 목록 조회 총 요청 수")
    @GetMapping("/entries")
    public ResponseEntity<List<JournalEntry>> getJournalEntries(
            @Parameter(description = "회사 ID", required = true) @RequestParam String companyId,
            @Parameter(description = "조회 시작일", required = true) @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @Parameter(description = "조회 종료일", required = true) @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        
        try {
            logger.debug("분개 목록 조회: companyId={}, period={} ~ {}", companyId, startDate, endDate);
            
            List<JournalEntry> entries = accountingEngine.getJournalEntries(companyId, startDate, endDate);
            
            return ResponseEntity.ok(entries);
            
        } catch (Exception e) {
            logger.error("분개 목록 조회 실패: companyId={}, error={}", companyId, e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * 계정과목 목록 조회
     */
    @Operation(
        summary = "전체 계정과목 목록 조회",
        description = "시스템에 등록된 모든 활성 계정과목 목록을 조회합니다. (Phase 1: 200+ 확장된 한국 표준 계정과목)"
    )
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200",
            description = "계정과목 목록 조회 성공",
            content = @Content(schema = @Schema(implementation = ChartOfAccount.class))
        ),
        @ApiResponse(
            responseCode = "500",
            description = "서버 오류"
        )
    })
    @Timed(value = "accounting.chart.of.accounts.get", description = "계정과목 목록 조회 소요시간")
    @Counted(value = "accounting.chart.of.accounts.get.total", description = "계정과목 목록 조회 총 요청 수")
    @GetMapping("/accounts")
    public ResponseEntity<List<ChartOfAccount>> getChartOfAccounts() {
        try {
            logger.debug("계정과목 목록 조회 요청");
            
            List<ChartOfAccount> accounts = accountingEngine.getChartOfAccounts();
            
            return ResponseEntity.ok(accounts);
            
        } catch (Exception e) {
            logger.error("계정과목 목록 조회 실패: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * 대차대조표 생성
     */
    @Operation(
        summary = "대차대조표 생성",
        description = "지정된 회사의 특정 기준일 기준 대차대조표를 생성합니다. 자산 = 부채 + 자본의 회계 등식을 검증합니다."
    )
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200",
            description = "대차대조표 생성 성공",
            content = @Content(schema = @Schema(implementation = Map.class))
        ),
        @ApiResponse(
            responseCode = "400",
            description = "잘못된 요청 (필수 파라미터 누락 등)"
        ),
        @ApiResponse(
            responseCode = "500",
            description = "서버 오류"
        )
    })
    @Timed(value = "accounting.balance.sheet.generate", description = "대차대조표 생성 소요시간")
    @Counted(value = "accounting.balance.sheet.generate.total", description = "대차대조표 생성 총 요청 수")
    @PostMapping("/generate-balance-sheet")
    public ResponseEntity<Map<String, Object>> generateBalanceSheet(
            @Parameter(description = "회사 ID", required = true) @RequestParam String companyId,
            @Parameter(description = "기준일", required = true) @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate asOfDate) {
        
        try {
            logger.info("대차대조표 생성 요청: companyId={}, asOfDate={}", companyId, asOfDate);
            
            Map<String, Object> balanceSheet = accountingEngine.generateBalanceSheetData(companyId, asOfDate);
            
            logger.info("대차대조표 생성 완료: companyId={}", companyId);
            return ResponseEntity.ok(balanceSheet);
            
        } catch (Exception e) {
            logger.error("대차대조표 생성 실패: companyId={}, error={}", companyId, e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * 손익계산서 생성
     */
    @Operation(
        summary = "손익계산서 생성",
        description = "지정된 회사의 특정 기간 동안의 손익계산서를 생성합니다. 수익 - 비용 = 당기순이익을 계산합니다."
    )
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200",
            description = "손익계산서 생성 성공",
            content = @Content(schema = @Schema(implementation = Map.class))
        ),
        @ApiResponse(
            responseCode = "400",
            description = "잘못된 요청 (필수 파라미터 누락 등)"
        ),
        @ApiResponse(
            responseCode = "500",
            description = "서버 오류"
        )
    })
    @Timed(value = "accounting.income.statement.generate", description = "손익계산서 생성 소요시간")
    @Counted(value = "accounting.income.statement.generate.total", description = "손익계산서 생성 총 요청 수")
    @PostMapping("/generate-income-statement")
    public ResponseEntity<Map<String, Object>> generateIncomeStatement(
            @Parameter(description = "회사 ID", required = true) @RequestParam String companyId,
            @Parameter(description = "기간 시작일", required = true) @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate periodStart,
            @Parameter(description = "기간 종료일", required = true) @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate periodEnd) {
        
        try {
            logger.info("손익계산서 생성 요청: companyId={}, period={} ~ {}", companyId, periodStart, periodEnd);
            
            Map<String, Object> incomeStatement = accountingEngine.generateIncomeStatementData(
                companyId, periodStart, periodEnd);
            
            logger.info("손익계산서 생성 완료: companyId={}", companyId);
            return ResponseEntity.ok(incomeStatement);
            
        } catch (Exception e) {
            logger.error("손익계산서 생성 실패: companyId={}, error={}", companyId, e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * 시스템 상태 확인 (헬스체크)
     */
    @Operation(
        summary = "회계 시스템 헬스체크",
        description = "회계 엔진의 상태를 확인하고 기본 계정과목 존재 여부를 검증합니다."
    )
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200",
            description = "시스템 정상",
            content = @Content(schema = @Schema(implementation = Map.class))
        ),
        @ApiResponse(
            responseCode = "500",
            description = "시스템 비정상",
            content = @Content(schema = @Schema(implementation = Map.class))
        )
    })
    @Timed(value = "accounting.health.check", description = "헬스체크 소요시간")
    @Counted(value = "accounting.health.check.total", description = "헬스체크 총 요청 수")
    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> healthCheck() {
        try {
            // 기본 계정과목 존재 확인
            List<ChartOfAccount> accounts = accountingEngine.getChartOfAccounts();
            
            Map<String, Object> health = Map.of(
                "status", "healthy",
                "service", "accounting-engine",
                "chart_of_accounts_count", accounts.size(),
                "timestamp", System.currentTimeMillis()
            );
            
            return ResponseEntity.ok(health);
            
        } catch (Exception e) {
            logger.error("헬스체크 실패: {}", e.getMessage(), e);
            
            Map<String, Object> health = Map.of(
                "status", "unhealthy",
                "service", "accounting-engine",
                "error", e.getMessage(),
                "timestamp", System.currentTimeMillis()
            );
            
            return ResponseEntity.internalServerError().body(health);
        }
    }
}
package com.moneyshift.api.controller;

import com.moneyshift.api.model.*;
import com.moneyshift.api.service.AccountingEngine;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

/**
 * 기장 시스템 API 컨트롤러
 */
@RestController
@RequestMapping("/api/v2/accounting")
@CrossOrigin(origins = "http://localhost:3000")
public class AccountingController {
    
    private static final Logger logger = LoggerFactory.getLogger(AccountingController.class);
    
    @Autowired
    private AccountingEngine accountingEngine;

    /**
     * 거래 → 분개 자동 생성
     */
    @PostMapping("/process-transaction")
    public ResponseEntity<JournalEntryResponse> processTransaction(
            @RequestBody TransactionToJournalRequest request) {
        
        long startTime = System.currentTimeMillis();
        
        try {
            logger.info("거래 분개 생성 요청: {}", request);
            
            // 입력 검증
            if (request.getTransactionId() == null) {
                return ResponseEntity.badRequest()
                    .body(new JournalEntryResponse("거래 ID가 필요합니다."));
            }
            
            // 분개 생성
            JournalEntry journalEntry = accountingEngine.processTransaction(request);
            
            // 응답 생성
            JournalEntryResponse response = new JournalEntryResponse(journalEntry);
            
            // 처리 정보 추가
            long processingTime = System.currentTimeMillis() - startTime;
            JournalEntryResponse.ProcessingInfo processingInfo = 
                new JournalEntryResponse.ProcessingInfo(processingTime, true, "TAG_MAPPING");
            response.setProcessingInfo(processingInfo);
            
            logger.info("거래 분개 생성 성공: journalEntryId={}, processingTime={}ms", 
                       journalEntry.getId(), processingTime);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            logger.error("거래 분개 생성 실패: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError()
                .body(new JournalEntryResponse("분개 생성 중 오류가 발생했습니다: " + e.getMessage()));
        }
    }

    /**
     * 분개 상세 조회
     */
    @GetMapping("/journal-entry/{id}")
    public ResponseEntity<JournalEntry> getJournalEntry(@PathVariable Long id) {
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
    @GetMapping("/journal-entries")
    public ResponseEntity<List<JournalEntry>> getJournalEntries(
            @RequestParam String companyId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        
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
    @GetMapping("/chart-of-accounts")
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
    @PostMapping("/generate-balance-sheet")
    public ResponseEntity<Map<String, Object>> generateBalanceSheet(
            @RequestParam String companyId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate asOfDate) {
        
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
    @PostMapping("/generate-income-statement")
    public ResponseEntity<Map<String, Object>> generateIncomeStatement(
            @RequestParam String companyId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate periodStart,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate periodEnd) {
        
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
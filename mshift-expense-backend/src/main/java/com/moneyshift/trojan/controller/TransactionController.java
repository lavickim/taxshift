package com.moneyshift.trojan.controller;

import com.moneyshift.trojan.entity.Transaction;
import com.moneyshift.trojan.service.TransactionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

/**
 * 거래내역 관리 API 컨트롤러
 * 트로이 목마 가계부 앱의 핵심 거래 기능 제공
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/transactions")
@RequiredArgsConstructor
@Tag(name = "Transaction API", description = "거래내역 관리 API")
@CrossOrigin(origins = {"http://localhost:8081", "http://10.0.2.2:8080"})
public class TransactionController {

    private final TransactionService transactionService;

    @Operation(summary = "새 거래내역 등록", description = "수입/지출/이체 거래내역을 등록합니다")
    @PostMapping
    public ResponseEntity<Transaction> createTransaction(@Valid @RequestBody Transaction transaction) {
        log.info("Creating transaction: type={}, amount={}", 
                transaction.getTransactionType(), transaction.getAmount());
        
        Transaction created = transactionService.createTransaction(transaction);
        return ResponseEntity.ok(created);
    }

    @Operation(summary = "월별 거래내역 조회", description = "특정 월의 거래내역을 조회합니다")
    @GetMapping("/monthly")
    public ResponseEntity<List<Transaction>> getMonthlyTransactions(
            @RequestParam Long userId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        
        log.info("Getting monthly transactions: userId={}, date={}", userId, date);
        
        List<Transaction> transactions = transactionService.getMonthlyTransactions(userId, date);
        return ResponseEntity.ok(transactions);
    }

    @Operation(summary = "월별 거래 요약", description = "월별 수입/지출 합계를 조회합니다")
    @GetMapping("/monthly/summary")
    public ResponseEntity<Map<String, Object>> getMonthlySummary(
            @RequestParam Long userId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        
        log.info("Getting monthly summary: userId={}, date={}", userId, date);
        
        Map<String, Object> summary = transactionService.getMonthlySummary(userId, date);
        return ResponseEntity.ok(summary);
    }

    @Operation(summary = "거래내역 상세 조회", description = "특정 거래내역의 상세 정보를 조회합니다")
    @GetMapping("/{transactionId}")
    public ResponseEntity<Transaction> getTransaction(@PathVariable Long transactionId) {
        log.info("Getting transaction details: transactionId={}", transactionId);
        
        Transaction transaction = transactionService.getTransactionById(transactionId);
        return ResponseEntity.ok(transaction);
    }

    @Operation(summary = "거래내역 수정", description = "기존 거래내역을 수정합니다")
    @PutMapping("/{transactionId}")
    public ResponseEntity<Transaction> updateTransaction(
            @PathVariable Long transactionId, 
            @Valid @RequestBody Transaction transaction) {
        
        log.info("Updating transaction: transactionId={}, type={}", 
                transactionId, transaction.getTransactionType());
        
        transaction.setTransactionId(transactionId);
        Transaction updated = transactionService.updateTransaction(transaction);
        return ResponseEntity.ok(updated);
    }

    @Operation(summary = "거래내역 삭제", description = "거래내역을 삭제합니다")
    @DeleteMapping("/{transactionId}")
    public ResponseEntity<Void> deleteTransaction(@PathVariable Long transactionId) {
        log.info("Deleting transaction: transactionId={}", transactionId);
        
        transactionService.deleteTransaction(transactionId);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "사용자별 거래내역 조회", description = "특정 사용자의 모든 거래내역을 조회합니다")
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Transaction>> getUserTransactions(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        log.info("Getting user transactions: userId={}, page={}, size={}", userId, page, size);
        
        List<Transaction> transactions = transactionService.getUserTransactions(userId, page, size);
        return ResponseEntity.ok(transactions);
    }
}
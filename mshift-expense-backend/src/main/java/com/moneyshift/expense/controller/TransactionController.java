package com.moneyshift.expense.controller;

import com.moneyshift.expense.dto.TransactionDto;
import com.moneyshift.expense.entity.Transaction;
import com.moneyshift.expense.service.TransactionService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/v1/transactions")
@RequiredArgsConstructor
@CrossOrigin
public class TransactionController {
    private final TransactionService transactionService;

    @PostMapping
    public ResponseEntity<TransactionDto> createTransaction(
            @RequestParam Long userId,
            @RequestBody TransactionDto.CreateRequest request) {
        TransactionDto transaction = transactionService.createTransaction(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(transaction);
    }

    @GetMapping("/monthly/{year}/{month}")
    public ResponseEntity<List<TransactionDto>> getMonthlyTransactions(
            @RequestParam Long userId,
            @PathVariable Integer year,
            @PathVariable Integer month) {
        List<TransactionDto> transactions = transactionService.getMonthlyTransactions(userId, year, month);
        return ResponseEntity.ok(transactions);
    }

    @GetMapping
    public ResponseEntity<Page<TransactionDto>> getTransactions(
            @RequestParam Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<TransactionDto> transactions = transactionService.getTransactions(userId, pageable);
        return ResponseEntity.ok(transactions);
    }

    @GetMapping("/{transactionId}")
    public ResponseEntity<TransactionDto> getTransaction(
            @RequestParam Long userId,
            @PathVariable Long transactionId) {
        TransactionDto transaction = transactionService.getTransaction(userId, transactionId);
        return ResponseEntity.ok(transaction);
    }

    @PutMapping("/{transactionId}")
    public ResponseEntity<TransactionDto> updateTransaction(
            @RequestParam Long userId,
            @PathVariable Long transactionId,
            @RequestBody TransactionDto.UpdateRequest request) {
        TransactionDto transaction = transactionService.updateTransaction(userId, transactionId, request);
        return ResponseEntity.ok(transaction);
    }

    @DeleteMapping("/{transactionId}")
    public ResponseEntity<Void> deleteTransaction(
            @RequestParam Long userId,
            @PathVariable Long transactionId) {
        transactionService.deleteTransaction(userId, transactionId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/statistics/daily")
    public ResponseEntity<List<TransactionDto.DailyStatistics>> getDailyStatistics(
            @RequestParam Long userId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        List<TransactionDto.DailyStatistics> statistics = transactionService.getDailyStatistics(userId, startDate, endDate);
        return ResponseEntity.ok(statistics);
    }

    @GetMapping("/statistics/category")
    public ResponseEntity<List<TransactionDto.CategoryStatistics>> getCategoryStatistics(
            @RequestParam Long userId,
            @RequestParam Transaction.TransactionType type,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        List<TransactionDto.CategoryStatistics> statistics = transactionService.getCategoryStatistics(userId, type, startDate, endDate);
        return ResponseEntity.ok(statistics);
    }
}
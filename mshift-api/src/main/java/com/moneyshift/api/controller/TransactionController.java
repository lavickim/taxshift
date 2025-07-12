package com.moneyshift.api.controller;

import com.moneyshift.api.model.TransactionData;
import com.moneyshift.api.service.TransactionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/transactions")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class TransactionController {
    
    private final TransactionService transactionService;
    
    @GetMapping("/bank-a")
    public ResponseEntity<TransactionData> getBankATransactions() {
        log.debug("Received request for bank-a transactions");
        
        try {
            TransactionData response = transactionService.getBankATransactions();
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error retrieving bank-a transactions", e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("Transaction API is running");
    }
}
package com.moneyshift.trojan.controller;

import com.moneyshift.trojan.model.Transaction;
import com.moneyshift.trojan.model.Receipt;
import com.moneyshift.trojan.service.ExcelExportService;
import com.moneyshift.trojan.service.TransactionService;
import com.moneyshift.trojan.service.ReceiptService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@RestController
@RequestMapping("/export")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Data Export", description = "Data export APIs for user transaction data")
public class ExportController {

    private final ExcelExportService excelExportService;
    private final TransactionService transactionService;
    private final ReceiptService receiptService;

    @GetMapping("/excel")
    @Operation(summary = "Export transactions to Excel", description = "Export user transactions and receipts to Excel format")
    public ResponseEntity<byte[]> exportToExcel(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false, defaultValue = "false") boolean includeReceipts) {
        
        try {
            String userId = userDetails.getUsername();
            log.info("Excel export requested by user: {} from {} to {}", userId, startDate, endDate);
            
            // Set default date range if not provided (last 3 months)
            if (startDate == null) {
                startDate = LocalDate.now().minusMonths(3);
            }
            if (endDate == null) {
                endDate = LocalDate.now();
            }
            
            LocalDateTime startDateTime = startDate.atStartOfDay();
            LocalDateTime endDateTime = endDate.atTime(LocalTime.MAX);
            
            // Fetch transactions
            List<Transaction> transactions = transactionService.getTransactionsByDateRange(
                    userId, startDateTime, endDateTime);
            
            // Fetch receipts if requested
            List<Receipt> receipts = null;
            if (includeReceipts) {
                receipts = receiptService.getReceiptsByDateRange(userId, startDateTime, endDateTime);
            }
            
            // Generate Excel file
            byte[] excelData = excelExportService.exportTransactionsToExcel(userId, transactions, receipts);
            
            // Prepare response
            String filename = String.format("moneyshift_export_%s_%s.xlsx", 
                    startDate.toString(), endDate.toString());
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
            headers.setContentDispositionFormData("attachment", filename);
            headers.setContentLength(excelData.length);
            
            log.info("Excel export completed for user: {} - {} bytes", userId, excelData.length);
            
            return ResponseEntity.ok()
                    .headers(headers)
                    .body(excelData);
                    
        } catch (Exception e) {
            log.error("Failed to export Excel for user: {}", userDetails.getUsername(), e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/csv")
    @Operation(summary = "Export transactions to CSV", description = "Export user transactions to CSV format")
    public ResponseEntity<byte[]> exportToCsv(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        
        try {
            String userId = userDetails.getUsername();
            log.info("CSV export requested by user: {} from {} to {}", userId, startDate, endDate);
            
            // Set default date range if not provided
            if (startDate == null) {
                startDate = LocalDate.now().minusMonths(3);
            }
            if (endDate == null) {
                endDate = LocalDate.now();
            }
            
            LocalDateTime startDateTime = startDate.atStartOfDay();
            LocalDateTime endDateTime = endDate.atTime(LocalTime.MAX);
            
            // Fetch transactions
            List<Transaction> transactions = transactionService.getTransactionsByDateRange(
                    userId, startDateTime, endDateTime);
            
            // Generate CSV data
            StringBuilder csvBuilder = new StringBuilder();
            
            // CSV header
            csvBuilder.append("날짜,구분,금액,설명,카테고리,결제수단,가맹점,위치\n");
            
            // CSV data rows
            for (Transaction transaction : transactions) {
                csvBuilder.append(String.format("%s,%s,%s,%s,%s,%s,%s,%s\n",
                        transaction.getTransactionDate().toString(),
                        "INCOME".equals(transaction.getType()) ? "수입" : "지출",
                        transaction.getAmount().toString(),
                        escapeCSV(transaction.getDescription()),
                        escapeCSV(transaction.getCategory()),
                        escapeCSV(transaction.getPaymentMethod()),
                        escapeCSV(transaction.getMerchantName()),
                        escapeCSV(transaction.getLocation())
                ));
            }
            
            byte[] csvData = csvBuilder.toString().getBytes("UTF-8");
            
            // Prepare response
            String filename = String.format("moneyshift_export_%s_%s.csv", 
                    startDate.toString(), endDate.toString());
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.TEXT_PLAIN);
            headers.setContentDispositionFormData("attachment", filename);
            headers.setContentLength(csvData.length);
            
            log.info("CSV export completed for user: {} - {} bytes", userId, csvData.length);
            
            return ResponseEntity.ok()
                    .headers(headers)
                    .body(csvData);
                    
        } catch (Exception e) {
            log.error("Failed to export CSV for user: {}", userDetails.getUsername(), e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @PostMapping("/anonymized-data")
    @Operation(summary = "Export anonymized data for MoneyShift analysis", 
               description = "Export anonymized transaction data for improving MoneyShift classification engine")
    public ResponseEntity<String> exportAnonymizedDataForAnalysis(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        
        try {
            log.info("Anonymized data export requested for MoneyShift analysis from {} to {}", startDate, endDate);
            
            // Set default date range if not provided
            if (startDate == null) {
                startDate = LocalDate.now().minusMonths(1);
            }
            if (endDate == null) {
                endDate = LocalDate.now();
            }
            
            LocalDateTime startDateTime = startDate.atStartOfDay();
            LocalDateTime endDateTime = endDate.atTime(LocalTime.MAX);
            
            // Get anonymized data for analysis
            // This would only include users who consented to data sharing
            int exportedRecords = transactionService.exportAnonymizedDataForAnalysis(startDateTime, endDateTime);
            
            log.info("Anonymized data export completed - {} records exported", exportedRecords);
            
            return ResponseEntity.ok(String.format(
                    "Anonymized data export completed successfully. %d records exported for MoneyShift analysis.", 
                    exportedRecords
            ));
                    
        } catch (Exception e) {
            log.error("Failed to export anonymized data for analysis", e);
            return ResponseEntity.internalServerError()
                    .body("Failed to export anonymized data: " + e.getMessage());
        }
    }

    private String escapeCSV(String value) {
        if (value == null) {
            return "";
        }
        
        // Escape quotes and wrap in quotes if contains comma or quote
        if (value.contains(",") || value.contains("\"") || value.contains("\n")) {
            return "\"" + value.replace("\"", "\"\"") + "\"";
        }
        
        return value;
    }
}
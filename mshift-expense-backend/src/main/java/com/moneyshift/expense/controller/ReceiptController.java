package com.moneyshift.expense.controller;

import com.moneyshift.expense.dto.ReceiptUploadResponse;
import com.moneyshift.expense.dto.ReceiptProcessingRequest;
import com.moneyshift.expense.model.Receipt;
import com.moneyshift.expense.service.ReceiptService;
import com.moneyshift.expense.service.OcrService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import jakarta.validation.Valid;
import java.util.List;
import java.util.concurrent.CompletableFuture;

@RestController
@RequestMapping("/receipts")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Receipt Management", description = "Receipt upload and processing APIs")
public class ReceiptController {

    private final ReceiptService receiptService;
    private final OcrService ocrService;

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload receipt image", description = "Upload a receipt image and trigger OCR processing")
    public CompletableFuture<ResponseEntity<ReceiptUploadResponse>> uploadReceipt(
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal UserDetails userDetails) {
        
        log.info("Receipt upload requested by user: {}", userDetails.getUsername());
        
        return receiptService.uploadAndProcessReceipt(file, userDetails.getUsername())
                .thenApply(response -> ResponseEntity.ok(response))
                .exceptionally(throwable -> {
                    log.error("Failed to process receipt upload", throwable);
                    return ResponseEntity.internalServerError()
                            .body(ReceiptUploadResponse.builder()
                                    .success(false)
                                    .message("Failed to process receipt: " + throwable.getMessage())
                                    .build());
                });
    }

    @PostMapping("/process")
    @Operation(summary = "Process existing receipt", description = "Reprocess an existing receipt with updated parameters")
    public ResponseEntity<Receipt> processReceipt(
            @Valid @RequestBody ReceiptProcessingRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        
        try {
            Receipt processed = receiptService.reprocessReceipt(request.getReceiptId(), userDetails.getUsername());
            return ResponseEntity.ok(processed);
        } catch (Exception e) {
            log.error("Failed to reprocess receipt: {}", request.getReceiptId(), e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping
    @Operation(summary = "Get user receipts", description = "Get paginated list of user's receipts")
    public ResponseEntity<List<Receipt>> getUserReceipts(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String status) {
        
        try {
            List<Receipt> receipts = receiptService.getUserReceipts(
                    userDetails.getUsername(), page, size, status);
            return ResponseEntity.ok(receipts);
        } catch (Exception e) {
            log.error("Failed to fetch user receipts", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/{receiptId}")
    @Operation(summary = "Get receipt by ID", description = "Get detailed receipt information")
    public ResponseEntity<Receipt> getReceipt(
            @PathVariable String receiptId,
            @AuthenticationPrincipal UserDetails userDetails) {
        
        try {
            Receipt receipt = receiptService.getReceiptById(receiptId, userDetails.getUsername());
            return receipt != null ? ResponseEntity.ok(receipt) : ResponseEntity.notFound().build();
        } catch (Exception e) {
            log.error("Failed to fetch receipt: {}", receiptId, e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @DeleteMapping("/{receiptId}")
    @Operation(summary = "Delete receipt", description = "Delete a receipt and associated data")
    public ResponseEntity<Void> deleteReceipt(
            @PathVariable String receiptId,
            @AuthenticationPrincipal UserDetails userDetails) {
        
        try {
            boolean deleted = receiptService.deleteReceipt(receiptId, userDetails.getUsername());
            return deleted ? ResponseEntity.noContent().build() : ResponseEntity.notFound().build();
        } catch (Exception e) {
            log.error("Failed to delete receipt: {}", receiptId, e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/{receiptId}/analytics")
    @Operation(summary = "Get receipt analytics", description = "Get analytics data for a receipt (anonymized)")
    public ResponseEntity<Object> getReceiptAnalytics(
            @PathVariable String receiptId,
            @AuthenticationPrincipal UserDetails userDetails) {
        
        try {
            Object analytics = receiptService.getReceiptAnalytics(receiptId, userDetails.getUsername());
            return ResponseEntity.ok(analytics);
        } catch (Exception e) {
            log.error("Failed to fetch receipt analytics: {}", receiptId, e);
            return ResponseEntity.internalServerError().build();
        }
    }
}
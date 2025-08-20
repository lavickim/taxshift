package com.moneyshift.trojan.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReceiptUploadResponse {
    private boolean success;
    private String message;
    private String receiptId;
    private String status;
    private Double ocrConfidence;
    private String estimatedProcessingTime;
}
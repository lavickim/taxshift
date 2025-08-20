package com.moneyshift.trojan.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.NotBlank;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReceiptProcessingRequest {
    @NotBlank(message = "Receipt ID is required")
    private String receiptId;
    
    private Boolean forceReprocess;
    private String expectedMerchantName;
    private Double expectedAmount;
}
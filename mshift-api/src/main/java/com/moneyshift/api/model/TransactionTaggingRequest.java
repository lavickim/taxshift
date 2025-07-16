package com.moneyshift.api.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TransactionTaggingRequest {
    private String transactionText;
    private BigDecimal amount;
    private LocalDateTime timestamp;
    private String userId;
    private String companyId;
    private String location;
    private String paymentMethod;
    private boolean enableCache;
    private boolean enableLLMFallback;
}
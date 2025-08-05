package com.moneyshift.trojan.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.Map;

@Data
@Builder
public class OcrResult {
    private boolean success;
    private BigDecimal confidence;
    private String rawText;
    private Map<String, Object> extractedData;
    private String errorMessage;
}
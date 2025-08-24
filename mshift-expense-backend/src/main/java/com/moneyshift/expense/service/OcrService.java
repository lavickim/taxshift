package com.moneyshift.expense.service;

import com.moneyshift.expense.dto.OcrResult;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
@Slf4j
public class OcrService {

    @Value("${ocr.confidence-threshold:0.8}")
    private double confidenceThreshold;

    /**
     * Process receipt image and extract structured data
     * This is a simplified implementation - in production, you would integrate with
     * Google Cloud Vision API or similar OCR service
     */
    public OcrResult processReceiptImage(MultipartFile imageFile) {
        try {
            log.info("Processing receipt image: {} (size: {} bytes)", 
                     imageFile.getOriginalFilename(), imageFile.getSize());

            // Simulate OCR processing with realistic Korean receipt patterns
            String simulatedOcrText = simulateKoreanReceiptOcr(imageFile.getOriginalFilename());
            
            OcrResult result = extractStructuredData(simulatedOcrText);
            
            log.info("OCR processing completed with confidence: {}", result.getConfidence());
            return result;
            
        } catch (Exception e) {
            log.error("Failed to process receipt image", e);
            return OcrResult.builder()
                    .success(false)
                    .confidence(BigDecimal.ZERO)
                    .rawText("")
                    .errorMessage("OCR processing failed: " + e.getMessage())
                    .build();
        }
    }

    /**
     * Simulate OCR text extraction with realistic Korean receipt patterns
     */
    private String simulateKoreanReceiptOcr(String filename) {
        // Simulate different types of Korean receipts based on filename or random selection
        String[] receiptTemplates = {
            // Coffee shop receipt
            """
            스타벅스코리아
            서울시 강남구 테헤란로 152
            Tel: 02-1234-5678
            
            아메리카노 Tall         5,500
            카페라떼 Grande        6,100
            치즈케이크            4,500
            
            소계                 16,100
            부가세                1,610
            총액                 17,710
            
            신용카드             17,710
            승인번호: 12345678
            2024-08-05 14:23:45
            """,
            
            // Restaurant receipt
            """
            김밥천국 강남점
            서울시 강남구 강남대로 123
            사업자번호: 123-45-67890
            
            김치찌개              8,000
            제육볶음              9,000
            공기밥                1,000
            
            합계                 18,000
            현금결제             18,000
            
            2024-08-05 12:15:30
            감사합니다
            """,
            
            // Convenience store receipt
            """
            세븐일레븐 역삼점
            서울시 강남구 역삼동 456
            
            삼각김밥 참치          1,200
            바나나우유            1,800
            과자                  2,500
            
            소계                  5,500
            부가세                  500
            합계                  6,000
            
            카드결제              6,000
            2024-08-05 09:30:15
            """,
            
            // Gas station receipt
            """
            SK에너지 강남주유소
            서울시 강남구 논현로 789
            
            휘발유(일반)
            단가: 1,580원/L
            수량: 30.5L
            금액: 48,190원
            
            세차서비스            5,000
            
            총액                 53,190
            신용카드             53,190
            2024-08-05 16:45:22
            """,
            
            // Delivery receipt
            """
            배달의민족
            치킨마루 강남점
            
            후라이드치킨          18,000
            양념치킨             20,000
            콜라 1.25L            3,000
            배달료                3,000
            
            주문금액             44,000
            할인                 -2,000
            결제금액             42,000
            
            카드결제             42,000
            2024-08-05 19:20:10
            """,
            
            // Department store receipt
            """
            롯데백화점 본점
            서울시 중구 남대문로 81
            
            의류(셔츠)           89,000
            신발                158,000
            벨트                 45,000
            
            소계               292,000
            할인                -29,200
            부가세               23,920
            
            총액               286,720
            신용카드           286,720
            2024-08-05 15:30:45
            """
        };
        
        Random random = new Random();
        return receiptTemplates[random.nextInt(receiptTemplates.length)];
    }

    /**
     * Extract structured data from OCR text using pattern matching
     */
    private OcrResult extractStructuredData(String ocrText) {
        Map<String, Object> extractedData = new HashMap<>();
        
        // Extract merchant name (first non-empty line typically)
        String merchantName = extractMerchantName(ocrText);
        extractedData.put("merchantName", merchantName);
        
        // Extract total amount
        BigDecimal totalAmount = extractTotalAmount(ocrText);
        extractedData.put("totalAmount", totalAmount);
        
        // Extract date
        LocalDateTime transactionDate = extractTransactionDate(ocrText);
        extractedData.put("transactionDate", transactionDate);
        
        // Extract payment method
        String paymentMethod = extractPaymentMethod(ocrText);
        extractedData.put("paymentMethod", paymentMethod);
        
        // Extract business registration number
        String businessNumber = extractBusinessNumber(ocrText);
        extractedData.put("businessNumber", businessNumber);
        
        // Extract items
        List<Map<String, Object>> items = extractItems(ocrText);
        extractedData.put("items", items);
        
        // Determine category based on merchant name and items
        String category = determineCategory(merchantName, ocrText);
        extractedData.put("category", category);
        
        // Calculate confidence based on extracted data completeness
        BigDecimal confidence = calculateConfidence(extractedData);
        
        return OcrResult.builder()
                .success(true)
                .confidence(confidence)
                .rawText(ocrText)
                .extractedData(extractedData)
                .build();
    }

    private String extractMerchantName(String text) {
        String[] lines = text.split("\n");
        for (String line : lines) {
            line = line.trim();
            if (!line.isEmpty() && !line.matches("\\d+.*") && line.length() > 2) {
                return line;
            }
        }
        return "Unknown Merchant";
    }

    private BigDecimal extractTotalAmount(String text) {
        // Korean receipt patterns for total amount
        Pattern[] patterns = {
            Pattern.compile("총액\\s*:?\\s*([0-9,]+)"),
            Pattern.compile("합계\\s*:?\\s*([0-9,]+)"),
            Pattern.compile("결제금액\\s*:?\\s*([0-9,]+)"),
            Pattern.compile("총\\s*([0-9,]+)"),
            Pattern.compile("TOTAL\\s*:?\\s*([0-9,]+)", Pattern.CASE_INSENSITIVE)
        };
        
        for (Pattern pattern : patterns) {
            Matcher matcher = pattern.matcher(text);
            if (matcher.find()) {
                String amountStr = matcher.group(1).replace(",", "");
                try {
                    return new BigDecimal(amountStr);
                } catch (NumberFormatException e) {
                    continue;
                }
            }
        }
        return BigDecimal.ZERO;
    }

    private LocalDateTime extractTransactionDate(String text) {
        // Korean date patterns
        Pattern[] patterns = {
            Pattern.compile("(\\d{4})-(\\d{2})-(\\d{2})\\s+(\\d{2}):(\\d{2}):(\\d{2})"),
            Pattern.compile("(\\d{4})/(\\d{2})/(\\d{2})\\s+(\\d{2}):(\\d{2})"),
            Pattern.compile("(\\d{2})-(\\d{2})-(\\d{2})\\s+(\\d{2}):(\\d{2})")
        };
        
        for (Pattern pattern : patterns) {
            Matcher matcher = pattern.matcher(text);
            if (matcher.find()) {
                try {
                    if (pattern.pattern().contains("\\d{4}")) {
                        // Full year format
                        int year = Integer.parseInt(matcher.group(1));
                        int month = Integer.parseInt(matcher.group(2));
                        int day = Integer.parseInt(matcher.group(3));
                        int hour = Integer.parseInt(matcher.group(4));
                        int minute = Integer.parseInt(matcher.group(5));
                        int second = matcher.groupCount() >= 6 ? Integer.parseInt(matcher.group(6)) : 0;
                        
                        return LocalDateTime.of(year, month, day, hour, minute, second);
                    }
                } catch (Exception e) {
                    continue;
                }
            }
        }
        return LocalDateTime.now(); // Default to current time
    }

    private String extractPaymentMethod(String text) {
        if (text.contains("신용카드") || text.contains("카드결제")) {
            return "CREDIT_CARD";
        } else if (text.contains("현금") || text.contains("현금결제")) {
            return "CASH";
        } else if (text.contains("계좌이체")) {
            return "BANK_TRANSFER";
        }
        return "UNKNOWN";
    }

    private String extractBusinessNumber(String text) {
        Pattern pattern = Pattern.compile("사업자번호\\s*:?\\s*([0-9]{3}-[0-9]{2}-[0-9]{5})");
        Matcher matcher = pattern.matcher(text);
        if (matcher.find()) {
            return matcher.group(1);
        }
        return null;
    }

    private List<Map<String, Object>> extractItems(String text) {
        List<Map<String, Object>> items = new ArrayList<>();
        String[] lines = text.split("\n");
        
        Pattern itemPattern = Pattern.compile("([가-힣a-zA-Z\\s]+)\\s+([0-9,]+)");
        
        for (String line : lines) {
            line = line.trim();
            Matcher matcher = itemPattern.matcher(line);
            if (matcher.find()) {
                String itemName = matcher.group(1).trim();
                String priceStr = matcher.group(2).replace(",", "");
                
                // Skip common non-item lines
                if (itemName.contains("소계") || itemName.contains("합계") || 
                    itemName.contains("총액") || itemName.contains("부가세") ||
                    itemName.contains("할인")) {
                    continue;
                }
                
                try {
                    BigDecimal price = new BigDecimal(priceStr);
                    if (price.compareTo(BigDecimal.ZERO) > 0) {
                        Map<String, Object> item = new HashMap<>();
                        item.put("name", itemName);
                        item.put("price", price);
                        item.put("quantity", 1);
                        items.add(item);
                    }
                } catch (NumberFormatException e) {
                    continue;
                }
            }
        }
        
        return items;
    }

    private String determineCategory(String merchantName, String text) {
        merchantName = merchantName.toLowerCase();
        text = text.toLowerCase();
        
        if (merchantName.contains("스타벅스") || merchantName.contains("카페") || 
            merchantName.contains("coffee") || text.contains("아메리카노")) {
            return "카페/음료";
        } else if (merchantName.contains("김밥") || merchantName.contains("식당") || 
                   text.contains("찌개") || text.contains("볶음")) {
            return "음식점";
        } else if (merchantName.contains("세븐일레븐") || merchantName.contains("편의점")) {
            return "편의점";
        } else if (merchantName.contains("주유소") || text.contains("휘발유")) {
            return "주유소";
        } else if (merchantName.contains("백화점") || text.contains("의류")) {
            return "쇼핑";
        } else if (text.contains("배달")) {
            return "배달음식";
        }
        
        return "기타";
    }

    private BigDecimal calculateConfidence(Map<String, Object> extractedData) {
        int score = 0;
        int maxScore = 6;
        
        if (extractedData.get("merchantName") != null && 
            !extractedData.get("merchantName").equals("Unknown Merchant")) {
            score++;
        }
        
        if (extractedData.get("totalAmount") != null && 
            ((BigDecimal) extractedData.get("totalAmount")).compareTo(BigDecimal.ZERO) > 0) {
            score++;
        }
        
        if (extractedData.get("transactionDate") != null) {
            score++;
        }
        
        if (extractedData.get("paymentMethod") != null && 
            !extractedData.get("paymentMethod").equals("UNKNOWN")) {
            score++;
        }
        
        if (extractedData.get("category") != null && 
            !extractedData.get("category").equals("기타")) {
            score++;
        }
        
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> items = (List<Map<String, Object>>) extractedData.get("items");
        if (items != null && !items.isEmpty()) {
            score++;
        }
        
        return BigDecimal.valueOf((double) score / maxScore);
    }
}
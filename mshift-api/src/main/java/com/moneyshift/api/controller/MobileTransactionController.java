package com.moneyshift.api.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;

@RestController
@RequestMapping("/transactions")
@CrossOrigin(origins = "*")
public class MobileTransactionController {

    @GetMapping("/bank-a")
    public ResponseEntity<Map<String, Object>> getBankATransactions() {
        try {
            Map<String, Object> response = new HashMap<>();
            
            // 계좌 정보
            Map<String, Object> accountInfo = new HashMap<>();
            accountInfo.put("bankName", "신한은행");
            accountInfo.put("accountNumber", "110-123-456789");
            accountInfo.put("balance", "12500000");
            accountInfo.put("currency", "원");
            accountInfo.put("lastUpdated", LocalDate.now().format(DateTimeFormatter.ISO_LOCAL_DATE));
            
            // 거래 목록 (샘플 데이터)
            List<Map<String, Object>> transactions = Arrays.asList(
                createTransaction(1L, "스타벅스 강남점", new BigDecimal("5400"), "expense", "복리후생비", LocalDate.now(), "approved", 0.95),
                createTransaction(2L, "ABC마케팅", new BigDecimal("330000"), "expense", "광고선전비", LocalDate.now().minusDays(1), "pending", 0.72),
                createTransaction(3L, "클라이언트입금", new BigDecimal("2200000"), "income", "매출", LocalDate.now().minusDays(2), "approved", 1.0),
                createTransaction(4L, "GS25 편의점", new BigDecimal("8900"), "expense", "사무용품비", LocalDate.now().minusDays(3), "approved", 0.88),
                createTransaction(5L, "SK주유소", new BigDecimal("65000"), "expense", "차량유지비", LocalDate.now().minusDays(4), "approved", 0.92),
                createTransaction(6L, "네이버페이", new BigDecimal("45000"), "expense", "온라인서비스", LocalDate.now().minusDays(5), "pending", 0.65),
                createTransaction(7L, "삼성전자", new BigDecimal("1200000"), "expense", "사무용품비", LocalDate.now().minusDays(6), "approved", 0.98),
                createTransaction(8L, "프로젝트 수수료", new BigDecimal("3500000"), "income", "매출", LocalDate.now().minusDays(7), "approved", 1.0),
                createTransaction(9L, "카페베네", new BigDecimal("4500"), "expense", "복리후생비", LocalDate.now().minusDays(8), "approved", 0.82),
                createTransaction(10L, "롯데마트", new BigDecimal("89000"), "expense", "사무용품비", LocalDate.now().minusDays(9), "approved", 0.76)
            );
            
            response.put("accountInfo", accountInfo);
            response.put("transactions", transactions);
            response.put("totalCount", transactions.size());
            response.put("summary", createSummary(transactions));
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
    
    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> getTransactionHealth() {
        Map<String, Object> health = new HashMap<>();
        health.put("status", "healthy");
        health.put("service", "transaction-service");
        health.put("timestamp", LocalDate.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
        health.put("version", "1.0.0");
        return ResponseEntity.ok(health);
    }
    
    @PostMapping("/classify")
    public ResponseEntity<Map<String, Object>> classifyTransaction(@RequestBody Map<String, Object> request) {
        try {
            String description = (String) request.get("description");
            BigDecimal amount = new BigDecimal(request.get("amount").toString());
            
            // 간단한 분류 로직 (실제로는 더 복잡한 AI 분류 시스템 사용)
            String category = classifyTransactionLogic(description, amount);
            double confidence = calculateConfidence(description, category);
            
            Map<String, Object> response = new HashMap<>();
            response.put("category", category);
            response.put("confidence", confidence);
            response.put("description", description);
            response.put("amount", amount);
            response.put("suggestions", getSuggestions(category));
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
    
    private Map<String, Object> createTransaction(Long id, String merchant, BigDecimal amount, 
                                                String type, String category, LocalDate date, 
                                                String status, double confidence) {
        Map<String, Object> transaction = new HashMap<>();
        transaction.put("id", id);
        transaction.put("merchant", merchant);
        transaction.put("amount", amount);
        transaction.put("type", type);
        transaction.put("category", category);
        transaction.put("transactionDate", date.format(DateTimeFormatter.ISO_LOCAL_DATE));
        transaction.put("status", status);
        transaction.put("confidence", confidence);
        transaction.put("description", merchant);
        return transaction;
    }
    
    private Map<String, Object> createSummary(List<Map<String, Object>> transactions) {
        Map<String, Object> summary = new HashMap<>();
        
        BigDecimal totalIncome = BigDecimal.ZERO;
        BigDecimal totalExpense = BigDecimal.ZERO;
        int approvedCount = 0;
        int pendingCount = 0;
        
        for (Map<String, Object> transaction : transactions) {
            BigDecimal amount = (BigDecimal) transaction.get("amount");
            String type = (String) transaction.get("type");
            String status = (String) transaction.get("status");
            
            if ("income".equals(type)) {
                totalIncome = totalIncome.add(amount);
            } else if ("expense".equals(type)) {
                totalExpense = totalExpense.add(amount);
            }
            
            if ("approved".equals(status)) {
                approvedCount++;
            } else if ("pending".equals(status)) {
                pendingCount++;
            }
        }
        
        summary.put("totalIncome", totalIncome);
        summary.put("totalExpense", totalExpense);
        summary.put("netIncome", totalIncome.subtract(totalExpense));
        summary.put("totalTransactions", transactions.size());
        summary.put("approvedTransactions", approvedCount);
        summary.put("pendingTransactions", pendingCount);
        
        return summary;
    }
    
    private String classifyTransactionLogic(String description, BigDecimal amount) {
        String lowerDesc = description.toLowerCase();
        
        if (lowerDesc.contains("스타벅스") || lowerDesc.contains("카페") || lowerDesc.contains("커피")) {
            return "복리후생비";
        } else if (lowerDesc.contains("주유소") || lowerDesc.contains("sk") || lowerDesc.contains("gs") && lowerDesc.contains("주유")) {
            return "차량유지비";
        } else if (lowerDesc.contains("편의점") || lowerDesc.contains("gs25") || lowerDesc.contains("cu") || lowerDesc.contains("세븐일레븐")) {
            return "사무용품비";
        } else if (lowerDesc.contains("마케팅") || lowerDesc.contains("광고") || lowerDesc.contains("홍보")) {
            return "광고선전비";
        } else if (lowerDesc.contains("입금") || lowerDesc.contains("수수료") || lowerDesc.contains("프로젝트")) {
            return "매출";
        } else if (lowerDesc.contains("온라인") || lowerDesc.contains("인터넷") || lowerDesc.contains("네이버") || lowerDesc.contains("카카오")) {
            return "온라인서비스";
        } else {
            return "기타";
        }
    }
    
    private double calculateConfidence(String description, String category) {
        // 간단한 신뢰도 계산 로직
        String lowerDesc = description.toLowerCase();
        
        if ("복리후생비".equals(category) && (lowerDesc.contains("스타벅스") || lowerDesc.contains("카페"))) {
            return 0.95;
        } else if ("차량유지비".equals(category) && lowerDesc.contains("주유소")) {
            return 0.92;
        } else if ("매출".equals(category) && lowerDesc.contains("입금")) {
            return 1.0;
        } else {
            return 0.75; // 기본 신뢰도
        }
    }
    
    private List<String> getSuggestions(String category) {
        Map<String, List<String>> categoryMap = new HashMap<>();
        categoryMap.put("복리후생비", Arrays.asList("직원 복지", "회식비", "간식비"));
        categoryMap.put("차량유지비", Arrays.asList("연료비", "주차비", "수리비"));
        categoryMap.put("사무용품비", Arrays.asList("문구류", "소모품", "사무기기"));
        categoryMap.put("광고선전비", Arrays.asList("온라인 광고", "인쇄물", "홍보비"));
        categoryMap.put("매출", Arrays.asList("서비스 수입", "제품 판매", "수수료"));
        
        return categoryMap.getOrDefault(category, Arrays.asList("기타 비용"));
    }
}
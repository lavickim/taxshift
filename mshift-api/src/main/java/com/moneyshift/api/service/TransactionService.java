package com.moneyshift.api.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.moneyshift.api.model.TransactionData;
import com.moneyshift.api.model.TransactionData.AccountInfo;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import java.io.IOException;

@Service
@Slf4j
public class TransactionService {
    
    private final ObjectMapper objectMapper = new ObjectMapper();
    
    public TransactionData getBankATransactions() {
        try {
            // 개발용: JSON 파일에서 데이터 로드
            ClassPathResource resource = new ClassPathResource("data/bank-a-transaction.json");
            TransactionData data = objectMapper.readValue(resource.getInputStream(), TransactionData.class);
            
            log.info("Successfully loaded {} transactions from JSON file", 
                    data.getTransactions() != null ? data.getTransactions().size() : 0);
            
            return data;
        } catch (IOException e) {
            log.error("Failed to load transaction data from JSON file", e);
            
            // 실패 시 기본 데이터 반환
            return createDefaultTransactionData();
        }
    }
    
    private TransactionData createDefaultTransactionData() {
        TransactionData defaultData = new TransactionData();
        
        // 기본 계좌 정보 설정
        AccountInfo accountInfo = new AccountInfo();
        accountInfo.setBankName("기업은행");
        accountInfo.setAccountNumber("****-****-****-1234");
        accountInfo.setBalance("0");
        accountInfo.setCurrency("원");
        
        defaultData.setAccountInfo(accountInfo);
        defaultData.setTransactions(java.util.Collections.emptyList());
        
        return defaultData;
    }
}
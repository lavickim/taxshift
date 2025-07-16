package com.moneyshift.api.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

/**
 * LLM 통합 서비스 (간소화 버전)
 * 
 * 기능:
 * 1. Gemini AI 기반 거래 분류
 * 2. 자연어 기반 태그 검색
 * 3. 거래 패턴 분석
 * 
 * TODO: 향후 Gemini AI 통합 시 확장 예정
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class LLMIntegrationService {
    
    /**
     * 거래 텍스트 LLM 분류 (현재 비활성화)
     */
    public String classifyTransactionWithLLM(String transactionText) {
        log.debug("LLM 분류 요청: {}", transactionText);
        
        // TODO: Gemini AI 통합 시 실제 구현
        return "LLM classification not implemented yet";
    }
    
    /**
     * 자연어 태그 검색 (현재 비활성화)
     */
    public String searchTagsByNaturalLanguage(String query) {
        log.debug("자연어 태그 검색: {}", query);
        
        // TODO: Gemini AI 통합 시 실제 구현
        return "Natural language search not implemented yet";
    }
    
    /**
     * 거래 패턴 분석 (현재 비활성화)
     */
    public String analyzeTransactionPatterns(String data) {
        log.debug("거래 패턴 분석 요청");
        
        // TODO: Gemini AI 통합 시 실제 구현
        return "Pattern analysis not implemented yet";
    }
}
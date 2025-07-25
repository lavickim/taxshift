package com.moneyshift.api.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

/**
 * LLM 통합 서비스
 * ⚠️ TODO: 아직 미구현 - Gemini AI 연동 필요 (Claude가 표시)
 * 
 * 향후 구현 예정 기능:
 * 1. Gemini AI 기반 거래 분류
 * 2. 자연어 기반 태그 검색
 * 3. 거래 패턴 분석
 * 4. 컴텍스트 기반 계정과목 추천
 * 5. 비정형 텍스트 처리
 * 
 * 구현 우선순위:
 * 1. Gemini AI API 클라이언트 설정
 * 2. 프롬프트 엔지니어링
 * 3. 응답 파싱 및 검증
 * 4. 오류 처리 및 재시도 로직
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class LLMIntegrationService {
    
    /**
     * 거래 텍스트 LLM 분류
     * ⚠️ TODO: 아직 미구현 - Gemini AI API 연동 필요 (Claude가 표시)
     */
    public String classifyTransactionWithLLM(String transactionText) {
        log.debug("LLM 분류 요청: {} - ⚠️ 미구현 (Claude가 표시)", transactionText);
        
        // ⚠️ TODO: Gemini AI 통합 시 실제 구현 (Claude가 표시)
        return "⚠️ LLM classification not implemented yet - Gemini AI integration needed (Claude marked)";
    }
    
    /**
     * 자연어 태그 검색  
     * ⚠️ TODO: 아직 미구현 - Gemini AI 연동 필요 (Claude가 표시)
     */
    public String searchTagsByNaturalLanguage(String query) {
        log.debug("자연어 태그 검색: {} - ⚠️ 미구현 (Claude가 표시)", query);
        
        // ⚠️ TODO: Gemini AI 통합 시 실제 구현 (Claude가 표시)
        return "⚠️ Natural language search not implemented yet - Gemini AI integration needed (Claude marked)";
    }
    
    /**
     * 거래 패턴 분석
     * ⚠️ TODO: 아직 미구현 - Gemini AI 연동 필요 (Claude가 표시)
     */
    public String analyzeTransactionPatterns(String data) {
        log.debug("거래 패턴 분석 요청 - ⚠️ 미구현 (Claude가 표시)");
        
        // ⚠️ TODO: Gemini AI 통합 시 실제 구현 (Claude가 표시)
        return "⚠️ Pattern analysis not implemented yet - Gemini AI integration needed (Claude marked)";
    }
}
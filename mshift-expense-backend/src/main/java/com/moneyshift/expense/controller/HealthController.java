package com.moneyshift.expense.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

/**
 * 시스템 상태 확인을 위한 공개 API 컨트롤러
 */
@Slf4j
@RestController
@RequestMapping("/public")
@Tag(name = "Health Check", description = "시스템 상태 확인 API (인증 불필요)")
public class HealthController {
    
    @Operation(summary = "시스템 상태 확인", description = "백엔드 서버의 동작 상태를 확인합니다.")
    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> getHealth() {
        log.info("공개 헬스체크 요청");
        
        Map<String, Object> health = new HashMap<>();
        health.put("status", "UP");
        health.put("service", "mshift-trojan-backend");
        health.put("timestamp", LocalDateTime.now());
        health.put("version", "1.0.0");
        
        return ResponseEntity.ok(health);
    }
    
    @Operation(summary = "API 정보", description = "구현된 API 엔드포인트 목록을 반환합니다.")
    @GetMapping("/info")
    public ResponseEntity<Map<String, Object>> getInfo() {
        log.info("API 정보 요청");
        
        Map<String, Object> info = new HashMap<>();
        info.put("service", "트로이 목마 가계부 백엔드");
        info.put("description", "편한가계부와 동일한 기능을 제공하는 Spring Boot API");
        info.put("version", "1.0.0");
        info.put("build", "Phase 1: 핵심 모델 및 기본 CRUD API");
        info.put("swagger", "/api/swagger-ui.html");
        
        Map<String, String> endpoints = new HashMap<>();
        endpoints.put("사용자 관리", "/api/v1/users");
        endpoints.put("자산 관리", "/api/v1/assets");
        endpoints.put("카테고리 관리", "/api/v1/categories");
        endpoints.put("거래내역 관리", "/api/v1/transactions");
        info.put("endpoints", endpoints);
        
        return ResponseEntity.ok(info);
    }
}
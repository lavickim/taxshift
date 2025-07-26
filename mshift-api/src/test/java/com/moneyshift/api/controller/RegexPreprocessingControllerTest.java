package com.moneyshift.api.controller;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;

import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * 정규식 전처리 API 엔드포인트 테스트 (TDD - 백엔드 전용)
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("dev") // 실제 DB 연결 사용
@DisplayName("정규식 전처리 API 엔드포인트 테스트")
class RegexPreprocessingControllerTest {

    @LocalServerPort
    private int port;

    private final RestTemplate restTemplate = new RestTemplate();

    @Test
    @DisplayName("정규식 전처리 API - 정상 응답")
    void testPreprocessingApiEndpoint() {
        // Given
        String url = "http://localhost:" + port + "/mshift-api/v2/regex-preprocessing/test";
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        
        Map<String, String> requestBody = Map.of("text", "(주)테스트회사");
        HttpEntity<Map<String, String>> request = new HttpEntity<>(requestBody, headers);
        
        // When
        ResponseEntity<Map> response = restTemplate.exchange(url, HttpMethod.POST, request, Map.class);
        
        // Then
        assertThat(response.getStatusCode().is2xxSuccessful()).isTrue();
        
        Map<String, Object> body = response.getBody();
        assertThat(body).isNotNull();
        assertThat(body).containsKey("originalText");
        assertThat(body).containsKey("normalizedText");
        assertThat(body).containsKey("success");
        assertThat(body.get("success")).isEqualTo(true);
    }

    @Test
    @DisplayName("캐시 새로고침 API - 정상 응답")
    void testRefreshApiEndpoint() {
        // Given
        String url = "http://localhost:" + port + "/mshift-api/v2/regex-preprocessing/refresh";
        
        // When
        ResponseEntity<Map> response = restTemplate.postForEntity(url, null, Map.class);
        
        // Then
        assertThat(response.getStatusCode().is2xxSuccessful()).isTrue();
        
        Map<String, Object> body = response.getBody();
        assertThat(body).isNotNull();
        assertThat(body).containsKey("message");
    }

    @Test
    @DisplayName("통합 거래 파싱 API - 정상 응답")
    void testIntegratedTransactionApiEndpoint() {
        // Given
        String url = "http://localhost:" + port + "/mshift-api/v2/test/parse-transaction";
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        
        Map<String, Object> requestBody = Map.of(
            "transactionText", "(주)테스트회사 결제",
            "amount", 50000
        );
        HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);
        
        // When
        ResponseEntity<Map> response = restTemplate.exchange(url, HttpMethod.POST, request, Map.class);
        
        // Then
        assertThat(response.getStatusCode().is2xxSuccessful()).isTrue();
        
        Map<String, Object> body = response.getBody();
        assertThat(body).isNotNull();
        assertThat(body).containsKey("transactionText");
        assertThat(body).containsKey("success");
        assertThat(body.get("success")).isEqualTo(true);
    }
}
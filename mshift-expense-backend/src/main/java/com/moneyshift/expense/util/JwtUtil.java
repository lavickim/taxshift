package com.moneyshift.expense.util;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.Map;

/**
 * JWT 토큰 생성 및 검증 유틸리티
 * 트로이 목마 가계부 앱의 인증 토큰 관리
 */
@Slf4j
@Component
public class JwtUtil {
    
    private final SecretKey secretKey;
    private final long jwtExpiration;
    
    public JwtUtil(@Value("${spring.security.jwt.secret}") String secret,
                   @Value("${spring.security.jwt.expiration}") long expiration) {
        this.secretKey = Keys.hmacShaKeyFor(secret.getBytes());
        this.jwtExpiration = expiration;
        log.info("🔐 JWT 유틸리티 초기화 완료 (만료시간: {}ms)", expiration);
    }
    
    /**
     * JWT 토큰 생성
     */
    public String generateToken(Long userId, String username, String email) {
        Date now = new Date();
        Date expiration = new Date(now.getTime() + jwtExpiration);
        
        String token = Jwts.builder()
                .setSubject(userId.toString())
                .claim("username", username)
                .claim("email", email)
                .setIssuedAt(now)
                .setExpiration(expiration)
                .signWith(secretKey)
                .compact();
                
        log.debug("JWT 토큰 생성: userId={}, username={}, expiration={}", userId, username, expiration);
        return token;
    }
    
    /**
     * JWT 토큰에서 사용자 ID 추출
     */
    public Long extractUserId(String token) {
        try {
            Claims claims = extractClaims(token);
            String subject = claims.getSubject();
            return Long.parseLong(subject);
        } catch (Exception e) {
            log.error("사용자 ID 추출 실패: {}", e.getMessage());
            return null;
        }
    }
    
    /**
     * JWT 토큰에서 사용자명 추출
     */
    public String extractUsername(String token) {
        try {
            Claims claims = extractClaims(token);
            return claims.get("username", String.class);
        } catch (Exception e) {
            log.error("사용자명 추출 실패: {}", e.getMessage());
            return null;
        }
    }
    
    /**
     * JWT 토큰에서 이메일 추출
     */
    public String extractEmail(String token) {
        try {
            Claims claims = extractClaims(token);
            return claims.get("email", String.class);
        } catch (Exception e) {
            log.error("이메일 추출 실패: {}", e.getMessage());
            return null;
        }
    }
    
    /**
     * JWT 토큰에서 만료일 추출
     */
    public Date extractExpiration(String token) {
        try {
            Claims claims = extractClaims(token);
            return claims.getExpiration();
        } catch (Exception e) {
            log.error("만료일 추출 실패: {}", e.getMessage());
            return null;
        }
    }
    
    /**
     * JWT 토큰 만료 확인
     */
    public Boolean isTokenExpired(String token) {
        try {
            Date expiration = extractExpiration(token);
            return expiration != null && expiration.before(new Date());
        } catch (Exception e) {
            log.error("토큰 만료 확인 실패: {}", e.getMessage());
            return true;
        }
    }
    
    /**
     * JWT 토큰 유효성 검증
     */
    public Boolean validateToken(String token, Long userId) {
        try {
            Long tokenUserId = extractUserId(token);
            return tokenUserId != null && 
                   tokenUserId.equals(userId) && 
                   !isTokenExpired(token);
        } catch (Exception e) {
            log.error("토큰 검증 실패: {}", e.getMessage());
            return false;
        }
    }
    
    /**
     * JWT 토큰 유효성 검증 (사용자 정보 없이)
     */
    public Boolean validateToken(String token) {
        try {
            extractClaims(token);
            return !isTokenExpired(token);
        } catch (Exception e) {
            log.error("토큰 검증 실패: {}", e.getMessage());
            return false;
        }
    }
    
    /**
     * 리프레시 토큰 생성 (더 긴 유효기간)
     */
    public String generateRefreshToken(Long userId) {
        Date now = new Date();
        Date expiration = new Date(now.getTime() + (jwtExpiration * 7)); // 7배 더 길게
        
        String refreshToken = Jwts.builder()
                .setSubject(userId.toString())
                .claim("type", "refresh")
                .setIssuedAt(now)
                .setExpiration(expiration)
                .signWith(secretKey)
                .compact();
                
        log.debug("리프레시 토큰 생성: userId={}, expiration={}", userId, expiration);
        return refreshToken;
    }
    
    /**
     * 토큰이 리프레시 토큰인지 확인
     */
    public Boolean isRefreshToken(String token) {
        try {
            Claims claims = extractClaims(token);
            String type = claims.get("type", String.class);
            return "refresh".equals(type);
        } catch (Exception e) {
            log.error("리프레시 토큰 확인 실패: {}", e.getMessage());
            return false;
        }
    }
    
    /**
     * JWT Claims 추출
     */
    private Claims extractClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(secretKey)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }
    
    /**
     * 토큰 정보 요약
     */
    public Map<String, Object> getTokenInfo(String token) {
        try {
            Claims claims = extractClaims(token);
            return Map.of(
                "userId", claims.getSubject(),
                "username", claims.get("username", String.class),
                "email", claims.get("email", String.class),
                "issuedAt", claims.getIssuedAt(),
                "expiration", claims.getExpiration(),
                "expired", isTokenExpired(token)
            );
        } catch (Exception e) {
            log.error("토큰 정보 추출 실패: {}", e.getMessage());
            return Map.of("error", e.getMessage());
        }
    }
}
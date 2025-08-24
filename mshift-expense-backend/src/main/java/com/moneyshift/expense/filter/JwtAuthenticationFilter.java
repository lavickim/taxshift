package com.moneyshift.expense.filter;

import com.moneyshift.expense.util.JwtUtil;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

/**
 * JWT 인증 필터
 * HTTP 요청에서 JWT 토큰을 추출하고 검증하여 사용자 인증 처리
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    
    private final JwtUtil jwtUtil;
    
    @Override
    protected void doFilterInternal(HttpServletRequest request, 
                                   HttpServletResponse response, 
                                   FilterChain filterChain) throws ServletException, IOException {
        
        String requestURI = request.getRequestURI();
        log.debug("JWT 필터 처리: {}", requestURI);
        
        // 공개 API는 인증 건너뜀
        if (isPublicPath(requestURI)) {
            log.debug("공개 API 경로, 인증 건너뜀: {}", requestURI);
            filterChain.doFilter(request, response);
            return;
        }
        
        try {
            String token = extractTokenFromRequest(request);
            
            if (token != null && jwtUtil.validateToken(token)) {
                // 토큰에서 사용자 정보 추출
                Long userId = jwtUtil.extractUserId(token);
                String username = jwtUtil.extractUsername(token);
                String email = jwtUtil.extractEmail(token);
                
                if (userId != null && username != null) {
                    // Spring Security 컨텍스트에 인증 정보 설정
                    Authentication authentication = createAuthentication(userId, username, email);
                    SecurityContextHolder.getContext().setAuthentication(authentication);
                    
                    log.debug("JWT 인증 성공: userId={}, username={}", userId, username);
                    
                    // 요청에 사용자 정보 추가 (컨트롤러에서 사용 가능)
                    request.setAttribute("userId", userId);
                    request.setAttribute("username", username);
                    request.setAttribute("email", email);
                } else {
                    log.warn("JWT 토큰에서 사용자 정보 추출 실패");
                }
            } else if (token != null) {
                log.warn("유효하지 않은 JWT 토큰: {}", requestURI);
            }
        } catch (Exception e) {
            log.error("JWT 인증 처리 중 오류 발생: {}", e.getMessage());
        }
        
        filterChain.doFilter(request, response);
    }
    
    /**
     * 공개 API 경로 확인
     */
    private boolean isPublicPath(String requestURI) {
        return requestURI.startsWith("/api/public/") ||
               requestURI.startsWith("/api/v1/auth/") ||
               requestURI.startsWith("/api/actuator/") ||
               requestURI.startsWith("/api/v3/api-docs") ||
               requestURI.startsWith("/api/swagger-ui") ||
               requestURI.contains("swagger") ||
               requestURI.contains("api-docs");
    }
    
    /**
     * HTTP 요청에서 JWT 토큰 추출
     */
    private String extractTokenFromRequest(HttpServletRequest request) {
        // Authorization 헤더에서 Bearer 토큰 추출
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            return authHeader.substring(7);
        }
        
        // 쿼리 파라미터에서 토큰 추출 (개발용)
        String tokenParam = request.getParameter("token");
        if (tokenParam != null) {
            log.debug("쿼리 파라미터에서 토큰 추출: {}", request.getRequestURI());
            return tokenParam;
        }
        
        return null;
    }
    
    /**
     * Spring Security Authentication 객체 생성
     */
    private Authentication createAuthentication(Long userId, String username, String email) {
        // 기본 권한 부여 (추후 역할 기반으로 확장 가능)
        List<SimpleGrantedAuthority> authorities = List.of(
            new SimpleGrantedAuthority("ROLE_USER")
        );
        
        // Principal에 사용자 정보 포함
        UserPrincipal principal = new UserPrincipal(userId, username, email);
        
        return new UsernamePasswordAuthenticationToken(principal, null, authorities);
    }
    
    /**
     * JWT 인증용 사용자 정보 클래스
     */
    public static class UserPrincipal {
        private final Long userId;
        private final String username;
        private final String email;
        
        public UserPrincipal(Long userId, String username, String email) {
            this.userId = userId;
            this.username = username;
            this.email = email;
        }
        
        public Long getUserId() { return userId; }
        public String getUsername() { return username; }
        public String getEmail() { return email; }
        
        @Override
        public String toString() {
            return String.format("UserPrincipal{userId=%d, username='%s', email='%s'}", 
                               userId, username, email);
        }
    }
}
package com.moneyshift.expense.controller;

import com.moneyshift.expense.model.User;
import com.moneyshift.expense.service.UserService;
import com.moneyshift.expense.service.AssetService;
import com.moneyshift.expense.util.JwtUtil;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

/**
 * 인증 관리 REST API 컨트롤러
 * 로그인, 회원가입, 토큰 관리 등
 */
@Slf4j
@RestController
@RequestMapping("/v1/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "인증 및 인가 API")
public class AuthController {
    
    private final UserService userService;
    private final AssetService assetService;
    private final JwtUtil jwtUtil;
    private final PasswordEncoder passwordEncoder;
    
    @Operation(summary = "사용자 로그인", description = "사용자명/이메일과 비밀번호로 로그인합니다.")
    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody LoginRequest loginRequest) {
        log.info("로그인 요청: identifier={}", loginRequest.getIdentifier());
        
        try {
            // 사용자명 또는 이메일로 사용자 조회
            Optional<User> userOpt = userService.findByUsernameOrEmail(loginRequest.getIdentifier());
            
            if (userOpt.isEmpty()) {
                log.warn("존재하지 않는 사용자: {}", loginRequest.getIdentifier());
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(createErrorResponse("존재하지 않는 사용자입니다."));
            }
            
            User user = userOpt.get();
            
            // 비밀번호 검증
            if (!passwordEncoder.matches(loginRequest.getPassword(), user.getPasswordHash())) {
                log.warn("잘못된 비밀번호: userId={}", user.getUserId());
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(createErrorResponse("비밀번호가 일치하지 않습니다."));
            }
            
            // 활성 사용자 확인
            if (!user.getIsActive()) {
                log.warn("비활성 사용자 로그인 시도: userId={}", user.getUserId());
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(createErrorResponse("비활성화된 계정입니다."));
            }
            
            // JWT 토큰 생성
            String accessToken = jwtUtil.generateToken(user.getUserId(), user.getUsername(), user.getEmail());
            String refreshToken = jwtUtil.generateRefreshToken(user.getUserId());
            
            // 민감한 정보 제거
            user.clearSensitiveData();
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "로그인 성공");
            response.put("user", user);
            response.put("accessToken", accessToken);
            response.put("refreshToken", refreshToken);
            response.put("tokenType", "Bearer");
            
            log.info("로그인 성공: userId={}, username={}", user.getUserId(), user.getUsername());
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("로그인 처리 중 오류 발생: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(createErrorResponse("로그인 처리 중 오류가 발생했습니다."));
        }
    }
    
    @Operation(summary = "사용자 회원가입", description = "새로운 사용자 계정을 생성합니다.")
    @PostMapping("/register")
    public ResponseEntity<Map<String, Object>> register(@RequestBody RegisterRequest registerRequest) {
        log.info("회원가입 요청: username={}, email={}", registerRequest.getUsername(), registerRequest.getEmail());
        
        try {
            // 사용자 생성
            User user = User.builder()
                .username(registerRequest.getUsername())
                .email(registerRequest.getEmail())
                .passwordHash(registerRequest.getPassword())
                .fullName(registerRequest.getFullName())
                .phoneNumber(registerRequest.getPhoneNumber())
                .build();
                
            User createdUser = userService.createUser(user);
            
            // 기본 자산 생성
            assetService.createDefaultAssets(createdUser.getUserId());
            
            // JWT 토큰 생성
            String accessToken = jwtUtil.generateToken(createdUser.getUserId(), createdUser.getUsername(), createdUser.getEmail());
            String refreshToken = jwtUtil.generateRefreshToken(createdUser.getUserId());
            
            // 민감한 정보 제거
            createdUser.clearSensitiveData();
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "회원가입 성공");
            response.put("user", createdUser);
            response.put("accessToken", accessToken);
            response.put("refreshToken", refreshToken);
            response.put("tokenType", "Bearer");
            
            log.info("회원가입 성공: userId={}, username={}", createdUser.getUserId(), createdUser.getUsername());
            return ResponseEntity.ok(response);
            
        } catch (RuntimeException e) {
            log.error("회원가입 실패: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(createErrorResponse(e.getMessage()));
        } catch (Exception e) {
            log.error("회원가입 처리 중 오류 발생: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(createErrorResponse("회원가입 처리 중 오류가 발생했습니다."));
        }
    }
    
    @Operation(summary = "토큰 새로고침", description = "리프레시 토큰으로 새로운 액세스 토큰을 발급받습니다.")
    @PostMapping("/refresh")
    public ResponseEntity<Map<String, Object>> refreshToken(@RequestBody RefreshTokenRequest refreshRequest) {
        log.info("토큰 새로고침 요청");
        
        try {
            String refreshToken = refreshRequest.getRefreshToken();
            
            // 리프레시 토큰 검증
            if (!jwtUtil.validateToken(refreshToken) || !jwtUtil.isRefreshToken(refreshToken)) {
                log.warn("유효하지 않은 리프레시 토큰");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(createErrorResponse("유효하지 않은 리프레시 토큰입니다."));
            }
            
            // 사용자 ID 추출
            Long userId = jwtUtil.extractUserId(refreshToken);
            if (userId == null) {
                log.warn("리프레시 토큰에서 사용자 ID 추출 실패");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(createErrorResponse("토큰에서 사용자 정보를 찾을 수 없습니다."));
            }
            
            // 사용자 조회
            Optional<User> userOpt = userService.getUserById(userId);
            if (userOpt.isEmpty()) {
                log.warn("존재하지 않는 사용자 ID: {}", userId);
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(createErrorResponse("존재하지 않는 사용자입니다."));
            }
            
            User user = userOpt.get();
            
            // 새로운 토큰 생성
            String newAccessToken = jwtUtil.generateToken(user.getUserId(), user.getUsername(), user.getEmail());
            String newRefreshToken = jwtUtil.generateRefreshToken(user.getUserId());
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "토큰 새로고침 성공");
            response.put("accessToken", newAccessToken);
            response.put("refreshToken", newRefreshToken);
            response.put("tokenType", "Bearer");
            
            log.info("토큰 새로고침 성공: userId={}", userId);
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("토큰 새로고침 중 오류 발생: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(createErrorResponse("토큰 새로고침 중 오류가 발생했습니다."));
        }
    }
    
    @Operation(summary = "토큰 정보 조회", description = "현재 토큰의 정보를 조회합니다.")
    @GetMapping("/token-info")
    public ResponseEntity<Map<String, Object>> getTokenInfo(@RequestHeader("Authorization") String authHeader) {
        try {
            String token = authHeader.startsWith("Bearer ") ? authHeader.substring(7) : authHeader;
            Map<String, Object> tokenInfo = jwtUtil.getTokenInfo(token);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("tokenInfo", tokenInfo);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("토큰 정보 조회 중 오류 발생: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(createErrorResponse("토큰 정보 조회에 실패했습니다."));
        }
    }
    
    @Operation(summary = "로그아웃", description = "현재 세션을 종료합니다.")
    @PostMapping("/logout")
    public ResponseEntity<Map<String, Object>> logout(@RequestHeader("Authorization") String authHeader) {
        log.info("로그아웃 요청");
        
        try {
            // 실제 구현에서는 Redis에서 토큰을 블랙리스트에 추가할 수 있음
            // 현재는 클라이언트에서 토큰 삭제만으로 처리
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "로그아웃 성공");
            
            log.info("로그아웃 성공");
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("로그아웃 처리 중 오류 발생: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(createErrorResponse("로그아웃 처리 중 오류가 발생했습니다."));
        }
    }
    
    /**
     * 오류 응답 생성
     */
    private Map<String, Object> createErrorResponse(String message) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", false);
        response.put("error", message);
        return response;
    }
    
    // DTO 클래스들
    public static class LoginRequest {
        private String identifier; // 사용자명 또는 이메일
        private String password;
        
        public String getIdentifier() { return identifier; }
        public void setIdentifier(String identifier) { this.identifier = identifier; }
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
    }
    
    public static class RegisterRequest {
        private String username;
        private String email;
        private String password;
        private String fullName;
        private String phoneNumber;
        
        public String getUsername() { return username; }
        public void setUsername(String username) { this.username = username; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
        public String getFullName() { return fullName; }
        public void setFullName(String fullName) { this.fullName = fullName; }
        public String getPhoneNumber() { return phoneNumber; }
        public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }
    }
    
    public static class RefreshTokenRequest {
        private String refreshToken;
        
        public String getRefreshToken() { return refreshToken; }
        public void setRefreshToken(String refreshToken) { this.refreshToken = refreshToken; }
    }
}
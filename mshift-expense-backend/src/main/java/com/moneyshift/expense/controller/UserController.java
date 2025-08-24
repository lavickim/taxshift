package com.moneyshift.expense.controller;

import com.moneyshift.expense.model.User;
import com.moneyshift.expense.service.UserService;
import com.moneyshift.expense.service.AssetService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

/**
 * 사용자 관리 REST API 컨트롤러
 */
@Slf4j
@RestController
@RequestMapping("/v1/users")
@RequiredArgsConstructor
@Tag(name = "User Management", description = "사용자 관리 API")
public class UserController {
    
    private final UserService userService;
    private final AssetService assetService;
    
    @Operation(summary = "사용자 조회", description = "사용자 ID로 사용자 정보를 조회합니다.")
    @GetMapping("/{userId}")
    public ResponseEntity<User> getUser(@PathVariable Long userId) {
        log.info("사용자 조회 요청: userId={}", userId);
        
        Optional<User> user = userService.getUserById(userId);
        if (user.isPresent()) {
            return ResponseEntity.ok(user.get());
        } else {
            return ResponseEntity.notFound().build();
        }
    }
    
    @Operation(summary = "사용자 등록", description = "새로운 사용자를 등록합니다.")
    @PostMapping
    public ResponseEntity<User> createUser(@Validated @RequestBody User user) {
        log.info("사용자 등록 요청: username={}, email={}", user.getUsername(), user.getEmail());
        
        try {
            User createdUser = userService.createUser(user);
            
            // 기본 자산 생성
            assetService.createDefaultAssets(createdUser.getUserId());
            
            return ResponseEntity.ok(createdUser);
        } catch (RuntimeException e) {
            log.error("사용자 등록 실패: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }
    
    @Operation(summary = "사용자 정보 수정", description = "사용자 정보를 수정합니다.")
    @PutMapping("/{userId}")
    public ResponseEntity<User> updateUser(@PathVariable Long userId, @Validated @RequestBody User user) {
        log.info("사용자 정보 수정 요청: userId={}", userId);
        
        user.setUserId(userId);
        try {
            User updatedUser = userService.updateUser(user);
            return ResponseEntity.ok(updatedUser);
        } catch (RuntimeException e) {
            log.error("사용자 정보 수정 실패: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }
    
    @Operation(summary = "비밀번호 변경", description = "사용자 비밀번호를 변경합니다.")
    @PutMapping("/{userId}/password")
    public ResponseEntity<Void> changePassword(@PathVariable Long userId, 
                                              @RequestParam String currentPassword,
                                              @RequestParam String newPassword) {
        log.info("비밀번호 변경 요청: userId={}", userId);
        
        try {
            boolean success = userService.changePassword(userId, currentPassword, newPassword);
            if (success) {
                return ResponseEntity.ok().build();
            } else {
                return ResponseEntity.badRequest().build();
            }
        } catch (RuntimeException e) {
            log.error("비밀번호 변경 실패: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }
    
    @Operation(summary = "사용자 상태 변경", description = "사용자 활성화/비활성화 상태를 변경합니다.")
    @PutMapping("/{userId}/status")
    public ResponseEntity<Void> updateUserStatus(@PathVariable Long userId, 
                                                 @RequestParam Boolean isActive) {
        log.info("사용자 상태 변경 요청: userId={}, isActive={}", userId, isActive);
        
        try {
            boolean success = userService.updateUserStatus(userId, isActive);
            if (success) {
                return ResponseEntity.ok().build();
            } else {
                return ResponseEntity.badRequest().build();
            }
        } catch (RuntimeException e) {
            log.error("사용자 상태 변경 실패: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }
    
    @Operation(summary = "활성 사용자 목록 조회", description = "모든 활성 사용자 목록을 조회합니다.")
    @GetMapping
    public ResponseEntity<List<User>> getAllActiveUsers() {
        log.info("활성 사용자 목록 조회 요청");
        
        List<User> users = userService.getAllActiveUsers();
        return ResponseEntity.ok(users);
    }
}
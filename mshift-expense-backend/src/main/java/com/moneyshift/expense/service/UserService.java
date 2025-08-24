package com.moneyshift.expense.service;

import com.moneyshift.expense.mapper.UserMapper;
import com.moneyshift.expense.model.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

/**
 * 사용자 비즈니스 로직 서비스
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class UserService {
    
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;
    
    /**
     * 사용자 ID로 조회
     */
    public Optional<User> getUserById(Long userId) {
        log.debug("사용자 조회: userId={}", userId);
        Optional<User> user = userMapper.findById(userId);
        user.ifPresent(User::clearSensitiveData);
        return user;
    }
    
    /**
     * 사용자명으로 조회
     */
    public Optional<User> getUserByUsername(String username) {
        log.debug("사용자명으로 조회: username={}", username);
        return userMapper.findByUsername(username);
    }
    
    /**
     * 이메일로 조회
     */
    public Optional<User> getUserByEmail(String email) {
        log.debug("이메일로 조회: email={}", email);
        return userMapper.findByEmail(email);
    }
    
    /**
     * 사용자명 또는 이메일로 조회 (로그인용)
     */
    public Optional<User> findByUsernameOrEmail(String identifier) {
        log.debug("사용자명 또는 이메일로 조회: identifier={}", identifier);
        
        // 먼저 사용자명으로 시도
        Optional<User> user = userMapper.findByUsername(identifier);
        if (user.isPresent()) {
            return user;
        }
        
        // 사용자명으로 찾지 못하면 이메일로 시도
        return userMapper.findByEmail(identifier);
    }
    
    /**
     * 사용자 등록
     */
    @Transactional
    public User createUser(User user) {
        log.info("사용자 등록: username={}, email={}", user.getUsername(), user.getEmail());
        
        // 중복 확인
        if (userMapper.findByUsername(user.getUsername()).isPresent()) {
            throw new RuntimeException("이미 존재하는 사용자명입니다: " + user.getUsername());
        }
        
        if (userMapper.findByEmail(user.getEmail()).isPresent()) {
            throw new RuntimeException("이미 존재하는 이메일입니다: " + user.getEmail());
        }
        
        // 비밀번호 암호화
        user.setPasswordHash(passwordEncoder.encode(user.getPasswordHash()));
        user.setIsActive(true);
        
        int result = userMapper.insert(user);
        if (result > 0) {
            log.info("사용자 등록 완료: userId={}", user.getUserId());
            user.clearSensitiveData();
            return user;
        } else {
            throw new RuntimeException("사용자 등록에 실패했습니다.");
        }
    }
    
    /**
     * 사용자 정보 수정
     */
    @Transactional
    public User updateUser(User user) {
        log.info("사용자 정보 수정: userId={}", user.getUserId());
        
        int result = userMapper.update(user);
        if (result > 0) {
            log.info("사용자 정보 수정 완료: userId={}", user.getUserId());
            user.clearSensitiveData();
            return user;
        } else {
            throw new RuntimeException("사용자 정보 수정에 실패했습니다.");
        }
    }
    
    /**
     * 비밀번호 변경
     */
    @Transactional
    public boolean changePassword(Long userId, String currentPassword, String newPassword) {
        log.info("비밀번호 변경: userId={}", userId);
        
        Optional<User> userOpt = userMapper.findById(userId);
        if (userOpt.isEmpty()) {
            throw new RuntimeException("사용자를 찾을 수 없습니다.");
        }
        
        User user = userOpt.get();
        if (!passwordEncoder.matches(currentPassword, user.getPasswordHash())) {
            throw new RuntimeException("현재 비밀번호가 일치하지 않습니다.");
        }
        
        String encodedNewPassword = passwordEncoder.encode(newPassword);
        int result = userMapper.updatePassword(userId, encodedNewPassword);
        
        if (result > 0) {
            log.info("비밀번호 변경 완료: userId={}", userId);
            return true;
        } else {
            throw new RuntimeException("비밀번호 변경에 실패했습니다.");
        }
    }
    
    /**
     * 사용자 상태 변경 (활성화/비활성화)
     */
    @Transactional
    public boolean updateUserStatus(Long userId, Boolean isActive) {
        log.info("사용자 상태 변경: userId={}, isActive={}", userId, isActive);
        
        int result = userMapper.updateStatus(userId, isActive);
        if (result > 0) {
            log.info("사용자 상태 변경 완료: userId={}", userId);
            return true;
        } else {
            throw new RuntimeException("사용자 상태 변경에 실패했습니다.");
        }
    }
    
    /**
     * 로그인 인증
     */
    public boolean authenticate(String username, String password) {
        log.debug("로그인 인증 시도: username={}", username);
        
        Optional<User> userOpt = userMapper.findByUsername(username);
        if (userOpt.isEmpty()) {
            log.warn("존재하지 않는 사용자: username={}", username);
            return false;
        }
        
        User user = userOpt.get();
        if (!user.getIsActive()) {
            log.warn("비활성화된 사용자: username={}", username);
            return false;
        }
        
        boolean matches = passwordEncoder.matches(password, user.getPasswordHash());
        log.debug("로그인 인증 결과: username={}, success={}", username, matches);
        
        return matches;
    }
    
    /**
     * 활성 사용자 목록 조회
     */
    public List<User> getAllActiveUsers() {
        log.debug("활성 사용자 목록 조회");
        List<User> users = userMapper.findAllActive();
        users.forEach(User::clearSensitiveData);
        return users;
    }
}
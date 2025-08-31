package com.moneyshift.expense.controller;

import com.moneyshift.expense.dto.*;
import com.moneyshift.expense.service.ChallengeService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/challenges")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class ChallengeController {
    
    private final ChallengeService challengeService;
    
    // 챌린지 목록 조회
    @GetMapping
    public ResponseEntity<Page<ChallengeDto>> getChallenges(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String type,
            @RequestParam(defaultValue = "recent") String sort,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        log.info("Getting challenges - category: {}, type: {}, sort: {}", category, type, sort);
        Page<ChallengeDto> challenges = challengeService.getChallenges(category, type, sort, page, size);
        return ResponseEntity.ok(challenges);
    }
    
    // 챌린지 상세 조회
    @GetMapping("/{challengeId}")
    public ResponseEntity<ChallengeDto> getChallenge(@PathVariable Long challengeId) {
        log.info("Getting challenge details for id: {}", challengeId);
        ChallengeDto challenge = challengeService.getChallenge(challengeId);
        return ResponseEntity.ok(challenge);
    }
    
    // 챌린지 참여
    @PostMapping("/{challengeId}/join")
    public ResponseEntity<UserChallengeDto> joinChallenge(
            @PathVariable Long challengeId,
            @RequestParam Long userId) {
        
        log.info("User {} joining challenge {}", userId, challengeId);
        UserChallengeDto userChallenge = challengeService.joinChallenge(userId, challengeId);
        return ResponseEntity.ok(userChallenge);
    }
    
    // 챌린지 진행 상황 업데이트
    @PutMapping("/user-challenges/{userChallengeId}/progress")
    public ResponseEntity<UserChallengeDto> updateProgress(
            @PathVariable Long userChallengeId,
            @RequestParam(required = false) BigDecimal amount,
            @RequestParam(required = false) Integer count) {
        
        log.info("Updating progress for user challenge {} - amount: {}, count: {}", 
                userChallengeId, amount, count);
        UserChallengeDto updated = challengeService.updateProgress(userChallengeId, amount, count);
        return ResponseEntity.ok(updated);
    }
    
    // 사용자의 챌린지 목록
    @GetMapping("/user/{userId}")
    public ResponseEntity<Page<UserChallengeDto>> getUserChallenges(
            @PathVariable Long userId,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        log.info("Getting challenges for user {} with status: {}", userId, status);
        Page<UserChallengeDto> userChallenges = challengeService.getUserChallenges(userId, status, page, size);
        return ResponseEntity.ok(userChallenges);
    }
    
    // 사용자 레벨 정보
    @GetMapping("/user/{userId}/level")
    public ResponseEntity<UserLevelDto> getUserLevel(@PathVariable Long userId) {
        log.info("Getting level info for user {}", userId);
        UserLevelDto userLevel = challengeService.getUserLevel(userId);
        return ResponseEntity.ok(userLevel);
    }
    
    // 챌린지 통계
    @GetMapping("/user/{userId}/stats")
    public ResponseEntity<Map<String, Object>> getUserChallengeStats(@PathVariable Long userId) {
        log.info("Getting challenge stats for user {}", userId);
        
        UserLevelDto userLevel = challengeService.getUserLevel(userId);
        Map<String, Object> stats = new HashMap<>();
        stats.put("level", userLevel.getCurrentLevel());
        stats.put("title", userLevel.getTitle());
        stats.put("tier", userLevel.getTier());
        stats.put("totalPoints", userLevel.getTotalPoints());
        stats.put("challengesCompleted", userLevel.getChallengesCompleted());
        stats.put("challengesFailed", userLevel.getChallengesFailed());
        stats.put("streakDays", userLevel.getStreakDays());
        stats.put("badgesEarned", userLevel.getBadgesEarned());
        
        return ResponseEntity.ok(stats);
    }
}
package com.moneyshift.expense.service;

import com.moneyshift.expense.entity.*;
import com.moneyshift.expense.repository.*;
import com.moneyshift.expense.dto.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class ChallengeService {
    
    private final ChallengeRepository challengeRepository;
    private final UserChallengeRepository userChallengeRepository;
    private final UserRepository userRepository;
    private final UserLevelRepository userLevelRepository;
    private final BadgeRepository badgeRepository;
    private final UserBadgeRepository userBadgeRepository;
    
    // 챌린지 목록 조회
    public Page<ChallengeDto> getChallenges(String category, String type, String sort, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Challenge> challenges;
        
        if ("popular".equals(sort)) {
            challenges = challengeRepository.findPopularChallenges(pageable);
        } else if ("completion".equals(sort)) {
            challenges = challengeRepository.findHighCompletionRateChallenges(pageable);
        } else if (category != null) {
            challenges = challengeRepository.findByCategoryAndIsActiveTrue(category, pageable);
        } else if (type != null) {
            challenges = challengeRepository.findByChallengeTypeAndIsActiveTrue(type, pageable);
        } else {
            challenges = challengeRepository.findRecentChallenges(pageable);
        }
        
        return challenges.map(this::convertToDto);
    }
    
    // 챌린지 상세 조회
    public ChallengeDto getChallenge(Long challengeId) {
        Challenge challenge = challengeRepository.findById(challengeId)
            .orElseThrow(() -> new RuntimeException("챌린지를 찾을 수 없습니다."));
        return convertToDto(challenge);
    }
    
    // 챌린지 참여
    public UserChallengeDto joinChallenge(Long userId, Long challengeId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));
        
        Challenge challenge = challengeRepository.findById(challengeId)
            .orElseThrow(() -> new RuntimeException("챌린지를 찾을 수 없습니다."));
        
        // 이미 참여중인지 확인
        if (userChallengeRepository.findByUserAndChallenge(user, challenge).isPresent()) {
            throw new RuntimeException("이미 참여중인 챌린지입니다.");
        }
        
        // UserChallenge 생성
        UserChallenge userChallenge = new UserChallenge();
        userChallenge.setUser(user);
        userChallenge.setChallenge(challenge);
        userChallenge.setStatus("in_progress");
        userChallenge.setJoinedAt(LocalDateTime.now());
        
        UserChallenge saved = userChallengeRepository.save(userChallenge);
        
        // 참여자 수 증가
        challenge.setParticipantCount(challenge.getParticipantCount() + 1);
        challengeRepository.save(challenge);
        
        // 첫 챌린지 참여 뱃지 체크
        checkAndAwardBadge(user, "first_challenge");
        
        return convertToUserChallengeDto(saved);
    }
    
    // 챌린지 진행 상황 업데이트
    public UserChallengeDto updateProgress(Long userChallengeId, BigDecimal amount, Integer count) {
        UserChallenge userChallenge = userChallengeRepository.findById(userChallengeId)
            .orElseThrow(() -> new RuntimeException("참여 정보를 찾을 수 없습니다."));
        
        if (!"in_progress".equals(userChallenge.getStatus())) {
            throw new RuntimeException("진행중인 챌린지가 아닙니다.");
        }
        
        Challenge challenge = userChallenge.getChallenge();
        
        // 진행 상황 업데이트
        if (amount != null) {
            userChallenge.setCurrentAmount(userChallenge.getCurrentAmount().add(amount));
        }
        if (count != null) {
            userChallenge.setCurrentCount(userChallenge.getCurrentCount() + count);
        }
        
        // 진행률 계산
        BigDecimal progress = calculateProgress(userChallenge, challenge);
        userChallenge.setProgress(progress);
        
        // 완료 체크
        if (progress.compareTo(new BigDecimal(100)) >= 0) {
            completeChallenge(userChallenge);
        }
        
        userChallenge.setLastUpdated(LocalDateTime.now());
        return convertToUserChallengeDto(userChallengeRepository.save(userChallenge));
    }
    
    // 챌린지 완료 처리
    private void completeChallenge(UserChallenge userChallenge) {
        userChallenge.setStatus("completed");
        userChallenge.setCompletedAt(LocalDateTime.now());
        userChallenge.setPointsEarned(userChallenge.getChallenge().getPoints());
        
        User user = userChallenge.getUser();
        
        // 레벨 시스템 업데이트
        UserLevel userLevel = userLevelRepository.findByUser(user)
            .orElseGet(() -> createUserLevel(user));
        
        userLevel.setTotalPoints(userLevel.getTotalPoints() + userChallenge.getPointsEarned());
        userLevel.setCurrentExp(userLevel.getCurrentExp() + userChallenge.getPointsEarned());
        userLevel.setTotalExp(userLevel.getTotalExp() + userChallenge.getPointsEarned());
        userLevel.setChallengesCompleted(userLevel.getChallengesCompleted() + 1);
        
        // 레벨업 체크
        if (userLevel.checkLevelUp()) {
            log.info("User {} leveled up to level {}", user.getUserId(), userLevel.getCurrentLevel());
        }
        
        userLevelRepository.save(userLevel);
        
        // 뱃지 체크 및 수여
        checkChallengeCompletionBadges(user, userChallenge.getChallenge());
    }
    
    // 진행률 계산
    private BigDecimal calculateProgress(UserChallenge userChallenge, Challenge challenge) {
        BigDecimal progress = BigDecimal.ZERO;
        
        if (challenge.getTargetAmount() != null) {
            progress = userChallenge.getCurrentAmount()
                .divide(challenge.getTargetAmount(), 2, BigDecimal.ROUND_HALF_UP)
                .multiply(new BigDecimal(100));
        } else if (challenge.getTargetCount() != null) {
            progress = new BigDecimal(userChallenge.getCurrentCount())
                .divide(new BigDecimal(challenge.getTargetCount()), 2, BigDecimal.ROUND_HALF_UP)
                .multiply(new BigDecimal(100));
        }
        
        return progress.min(new BigDecimal(100));
    }
    
    // 사용자의 챌린지 목록
    public Page<UserChallengeDto> getUserChallenges(Long userId, String status, int page, int size) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));
        
        Pageable pageable = PageRequest.of(page, size);
        Page<UserChallenge> userChallenges;
        
        if (status != null) {
            userChallenges = userChallengeRepository.findByUserAndStatus(user, status, pageable);
        } else {
            userChallenges = userChallengeRepository.findByUser(user, pageable);
        }
        
        return userChallenges.map(this::convertToUserChallengeDto);
    }
    
    // 사용자 레벨 정보 조회
    public UserLevelDto getUserLevel(Long userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));
        
        UserLevel userLevel = userLevelRepository.findByUser(user)
            .orElseGet(() -> createUserLevel(user));
        
        return convertToUserLevelDto(userLevel);
    }
    
    // 사용자 레벨 생성
    private UserLevel createUserLevel(User user) {
        UserLevel userLevel = new UserLevel();
        userLevel.setUser(user);
        return userLevelRepository.save(userLevel);
    }
    
    // 뱃지 체크 및 수여
    private void checkAndAwardBadge(User user, String condition) {
        // 조건에 맞는 뱃지 찾기 및 수여 로직
        // TODO: 실제 구현 필요
    }
    
    private void checkChallengeCompletionBadges(User user, Challenge challenge) {
        // 챌린지 완료 관련 뱃지 체크
        // TODO: 실제 구현 필요
    }
    
    // DTO 변환 메서드들
    private ChallengeDto convertToDto(Challenge challenge) {
        ChallengeDto dto = new ChallengeDto();
        dto.setId(challenge.getId());
        dto.setTitle(challenge.getTitle());
        dto.setDescription(challenge.getDescription());
        dto.setCategory(challenge.getCategory());
        dto.setChallengeType(challenge.getChallengeType());
        dto.setDifficultyLevel(challenge.getDifficultyLevel());
        dto.setPoints(challenge.getPoints());
        dto.setTargetAmount(challenge.getTargetAmount());
        dto.setTargetDays(challenge.getTargetDays());
        dto.setTargetCount(challenge.getTargetCount());
        dto.setRules(challenge.getRules());
        dto.setStartDate(challenge.getStartDate());
        dto.setEndDate(challenge.getEndDate());
        dto.setParticipantCount(challenge.getParticipantCount());
        dto.setCompletionRate(challenge.getCompletionRate());
        dto.setCreatedAt(challenge.getCreatedAt());
        return dto;
    }
    
    private UserChallengeDto convertToUserChallengeDto(UserChallenge userChallenge) {
        UserChallengeDto dto = new UserChallengeDto();
        dto.setId(userChallenge.getId());
        dto.setUserId(userChallenge.getUser().getUserId());
        dto.setChallenge(convertToDto(userChallenge.getChallenge()));
        dto.setStatus(userChallenge.getStatus());
        dto.setProgress(userChallenge.getProgress());
        dto.setCurrentAmount(userChallenge.getCurrentAmount());
        dto.setCurrentCount(userChallenge.getCurrentCount());
        dto.setJoinedAt(userChallenge.getJoinedAt());
        dto.setCompletedAt(userChallenge.getCompletedAt());
        dto.setPointsEarned(userChallenge.getPointsEarned());
        return dto;
    }
    
    private UserLevelDto convertToUserLevelDto(UserLevel userLevel) {
        UserLevelDto dto = new UserLevelDto();
        dto.setUserId(userLevel.getUser().getUserId());
        dto.setCurrentLevel(userLevel.getCurrentLevel());
        dto.setCurrentExp(userLevel.getCurrentExp());
        dto.setTotalExp(userLevel.getTotalExp());
        dto.setTotalPoints(userLevel.getTotalPoints());
        dto.setChallengesCompleted(userLevel.getChallengesCompleted());
        dto.setChallengesFailed(userLevel.getChallengesFailed());
        dto.setBadgesEarned(userLevel.getBadgesEarned());
        dto.setStreakDays(userLevel.getStreakDays());
        dto.setTitle(userLevel.getTitle());
        dto.setTier(userLevel.getTier());
        dto.setRequiredExpForNextLevel(userLevel.getRequiredExpForNextLevel());
        return dto;
    }
}
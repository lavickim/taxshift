package com.moneyshift.expense.repository;

import com.moneyshift.expense.entity.Challenge;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ChallengeRepository extends JpaRepository<Challenge, Long> {
    
    // 활성화된 챌린지 목록
    Page<Challenge> findByIsActiveTrue(Pageable pageable);
    
    // 카테고리별 챌린지 조회
    Page<Challenge> findByCategoryAndIsActiveTrue(String category, Pageable pageable);
    
    // 챌린지 타입별 조회
    Page<Challenge> findByChallengeTypeAndIsActiveTrue(String challengeType, Pageable pageable);
    
    // 난이도별 조회
    Page<Challenge> findByDifficultyLevelLessThanEqualAndIsActiveTrue(Integer difficultyLevel, Pageable pageable);
    
    // 인기 챌린지 (참여자 많은 순)
    @Query("SELECT c FROM Challenge c WHERE c.isActive = true ORDER BY c.participantCount DESC")
    Page<Challenge> findPopularChallenges(Pageable pageable);
    
    // 완료율 높은 챌린지
    @Query("SELECT c FROM Challenge c WHERE c.isActive = true AND c.participantCount > 0 ORDER BY c.completionRate DESC")
    Page<Challenge> findHighCompletionRateChallenges(Pageable pageable);
    
    // 신규 챌린지
    @Query("SELECT c FROM Challenge c WHERE c.isActive = true ORDER BY c.createdAt DESC")
    Page<Challenge> findRecentChallenges(Pageable pageable);
    
    // 추천 챌린지 (사용자 레벨 기반)
    @Query("SELECT c FROM Challenge c WHERE c.isActive = true AND c.difficultyLevel <= :userLevel ORDER BY c.points DESC")
    List<Challenge> findRecommendedChallenges(@Param("userLevel") Integer userLevel, Pageable pageable);
}
package com.moneyshift.expense.repository;

import com.moneyshift.expense.entity.UserChallenge;
import com.moneyshift.expense.entity.User;
import com.moneyshift.expense.entity.Challenge;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserChallengeRepository extends JpaRepository<UserChallenge, Long> {
    
    // 사용자의 특정 챌린지 참여 확인
    Optional<UserChallenge> findByUserAndChallenge(User user, Challenge challenge);
    
    // 사용자의 모든 챌린지
    Page<UserChallenge> findByUser(User user, Pageable pageable);
    
    // 사용자의 진행중인 챌린지
    Page<UserChallenge> findByUserAndStatus(User user, String status, Pageable pageable);
    
    // 챌린지별 참여자 목록
    Page<UserChallenge> findByChallenge(Challenge challenge, Pageable pageable);
    
    // 사용자의 완료한 챌린지 수
    @Query("SELECT COUNT(uc) FROM UserChallenge uc WHERE uc.user = :user AND uc.status = 'completed'")
    Long countCompletedChallengesByUser(@Param("user") User user);
    
    // 사용자의 진행중인 챌린지 수
    @Query("SELECT COUNT(uc) FROM UserChallenge uc WHERE uc.user = :user AND uc.status = 'in_progress'")
    Long countInProgressChallengesByUser(@Param("user") User user);
    
    // 챌린지별 완료율 계산
    @Query("SELECT COUNT(uc) * 100.0 / (SELECT COUNT(uc2) FROM UserChallenge uc2 WHERE uc2.challenge = :challenge) " +
           "FROM UserChallenge uc WHERE uc.challenge = :challenge AND uc.status = 'completed'")
    Double calculateCompletionRate(@Param("challenge") Challenge challenge);
    
    // 최근 활동
    @Query("SELECT uc FROM UserChallenge uc WHERE uc.user = :user ORDER BY uc.lastUpdated DESC")
    List<UserChallenge> findRecentActivities(@Param("user") User user, Pageable pageable);
}
package com.moneyshift.expense.repository;

import com.moneyshift.expense.entity.UserLevel;
import com.moneyshift.expense.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserLevelRepository extends JpaRepository<UserLevel, Long> {
    Optional<UserLevel> findByUser(User user);
    
    // 레벨 랭킹
    @Query("SELECT ul FROM UserLevel ul ORDER BY ul.currentLevel DESC, ul.totalExp DESC")
    List<UserLevel> findTopByLevel(int limit);
    
    // 포인트 랭킹
    @Query("SELECT ul FROM UserLevel ul ORDER BY ul.totalPoints DESC")
    List<UserLevel> findTopByPoints(int limit);
    
    // 챌린지 완료 랭킹
    @Query("SELECT ul FROM UserLevel ul ORDER BY ul.challengesCompleted DESC")
    List<UserLevel> findTopByChallengesCompleted(int limit);
}
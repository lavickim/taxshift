package com.moneyshift.expense.repository;

import com.moneyshift.expense.entity.CommunityUser;
import com.moneyshift.expense.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface CommunityUserRepository extends JpaRepository<CommunityUser, Long> {
    Optional<CommunityUser> findByUser(User user);
    Optional<CommunityUser> findByNickname(String nickname);
    boolean existsByNickname(String nickname);
    Optional<CommunityUser> findByUserUserId(Long userId);
}
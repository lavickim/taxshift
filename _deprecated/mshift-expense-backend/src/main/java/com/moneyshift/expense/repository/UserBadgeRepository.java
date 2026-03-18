package com.moneyshift.expense.repository;

import com.moneyshift.expense.entity.UserBadge;
import com.moneyshift.expense.entity.User;
import com.moneyshift.expense.entity.Badge;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserBadgeRepository extends JpaRepository<UserBadge, Long> {
    List<UserBadge> findByUser(User user);
    Optional<UserBadge> findByUserAndBadge(User user, Badge badge);
    
    @Query("SELECT COUNT(ub) FROM UserBadge ub WHERE ub.user = :user")
    Long countByUser(@Param("user") User user);
}
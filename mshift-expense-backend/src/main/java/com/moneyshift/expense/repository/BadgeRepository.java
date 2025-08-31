package com.moneyshift.expense.repository;

import com.moneyshift.expense.entity.Badge;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface BadgeRepository extends JpaRepository<Badge, Long> {
    List<Badge> findByCategory(String category);
    List<Badge> findByRarity(String rarity);
    List<Badge> findByIsActiveTrue();
}
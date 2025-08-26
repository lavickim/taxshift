package com.moneyshift.expense.repository;

import com.moneyshift.expense.entity.Asset;
import com.moneyshift.expense.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface AssetRepository extends JpaRepository<Asset, Long> {
    List<Asset> findByUserOrderByDisplayOrder(User user);
    List<Asset> findByUserAndIsActiveTrueOrderByDisplayOrder(User user);
    Optional<Asset> findByAssetIdAndUser(Long assetId, User user);
    
    @Query("SELECT SUM(a.currentBalance) FROM Asset a WHERE a.user = :user AND a.isActive = true")
    BigDecimal getTotalBalance(@Param("user") User user);
    
    @Query("SELECT SUM(a.currentBalance) FROM Asset a WHERE a.user = :user AND a.assetType = :assetType AND a.isActive = true")
    BigDecimal getTotalBalanceByType(@Param("user") User user, @Param("assetType") Asset.AssetType assetType);
}
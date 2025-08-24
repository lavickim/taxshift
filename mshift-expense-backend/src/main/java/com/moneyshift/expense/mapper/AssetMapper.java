package com.moneyshift.expense.mapper;

import com.moneyshift.expense.model.Asset;
import org.apache.ibatis.annotations.*;
import java.util.List;
import java.util.Optional;

/**
 * 자산 데이터 접근 매퍼
 */
@Mapper
public interface AssetMapper {
    
    @Select("SELECT * FROM assets WHERE asset_id = #{assetId} AND user_id = #{userId}")
    Optional<Asset> findById(@Param("assetId") Long assetId, @Param("userId") Long userId);
    
    @Select("SELECT * FROM assets WHERE user_id = #{userId} AND is_active = true " +
            "ORDER BY display_order, created_at")
    List<Asset> findByUserId(@Param("userId") Long userId);
    
    @Select("SELECT * FROM assets WHERE user_id = #{userId} AND asset_type = #{assetType} " +
            "AND is_active = true ORDER BY display_order, created_at")
    List<Asset> findByUserIdAndType(@Param("userId") Long userId, @Param("assetType") String assetType);
    
    @Insert("INSERT INTO assets (user_id, asset_name, asset_type, bank_name, account_number, " +
            "balance, color_code, icon_name, display_order) " +
            "VALUES (#{userId}, #{assetName}, #{assetType}, #{bankName}, #{accountNumber}, " +
            "#{balance}, #{colorCode}, #{iconName}, #{displayOrder})")
    @SelectKey(statement = "SELECT LASTVAL()", keyProperty = "assetId", before = false, resultType = Long.class)
    int insert(Asset asset);
    
    @Update("UPDATE assets SET asset_name = #{assetName}, bank_name = #{bankName}, " +
            "account_number = #{accountNumber}, color_code = #{colorCode}, icon_name = #{iconName}, " +
            "display_order = #{displayOrder}, updated_at = CURRENT_TIMESTAMP " +
            "WHERE asset_id = #{assetId} AND user_id = #{userId}")
    int update(Asset asset);
    
    @Update("UPDATE assets SET balance = #{balance}, updated_at = CURRENT_TIMESTAMP " +
            "WHERE asset_id = #{assetId}")
    int updateBalance(@Param("assetId") Long assetId, @Param("balance") java.math.BigDecimal balance);
    
    @Delete("UPDATE assets SET is_active = false, updated_at = CURRENT_TIMESTAMP " +
            "WHERE asset_id = #{assetId} AND user_id = #{userId}")
    int delete(@Param("assetId") Long assetId, @Param("userId") Long userId);
    
    @Select("SELECT SUM(balance) FROM assets WHERE user_id = #{userId} AND is_active = true")
    java.math.BigDecimal getTotalBalance(@Param("userId") Long userId);
}
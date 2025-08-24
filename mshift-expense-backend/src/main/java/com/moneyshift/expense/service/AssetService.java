package com.moneyshift.expense.service;

import com.moneyshift.expense.mapper.AssetMapper;
import com.moneyshift.expense.model.Asset;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

/**
 * 자산 비즈니스 로직 서비스
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AssetService {
    
    private final AssetMapper assetMapper;
    
    /**
     * 사용자의 모든 자산 조회
     */
    public List<Asset> getUserAssets(Long userId) {
        log.debug("사용자 자산 목록 조회: userId={}", userId);
        return assetMapper.findByUserId(userId);
    }
    
    /**
     * 자산 ID로 조회
     */
    public Optional<Asset> getAssetById(Long assetId, Long userId) {
        log.debug("자산 조회: assetId={}, userId={}", assetId, userId);
        return assetMapper.findById(assetId, userId);
    }
    
    /**
     * 자산 유형별 조회
     */
    public List<Asset> getAssetsByType(Long userId, Asset.AssetType assetType) {
        log.debug("자산 유형별 조회: userId={}, assetType={}", userId, assetType);
        return assetMapper.findByUserIdAndType(userId, assetType.name());
    }
    
    /**
     * 새 자산 생성
     */
    @Transactional
    public Asset createAsset(Asset asset) {
        log.info("자산 생성: userId={}, assetName={}, assetType={}", 
                asset.getUserId(), asset.getAssetName(), asset.getAssetType());
        
        // 기본값 설정
        if (asset.getBalance() == null) {
            asset.setBalance(BigDecimal.ZERO);
        }
        if (asset.getColorCode() == null) {
            asset.setColorCode("#FF5722");
        }
        if (asset.getIconName() == null) {
            asset.setIconName("account");
        }
        if (asset.getIsActive() == null) {
            asset.setIsActive(true);
        }
        if (asset.getDisplayOrder() == null) {
            asset.setDisplayOrder(0);
        }
        
        int result = assetMapper.insert(asset);
        if (result > 0) {
            log.info("자산 생성 완료: assetId={}", asset.getAssetId());
            return asset;
        } else {
            throw new RuntimeException("자산 생성에 실패했습니다.");
        }
    }
    
    /**
     * 자산 정보 수정
     */
    @Transactional
    public Asset updateAsset(Asset asset) {
        log.info("자산 정보 수정: assetId={}", asset.getAssetId());
        
        int result = assetMapper.update(asset);
        if (result > 0) {
            log.info("자산 정보 수정 완료: assetId={}", asset.getAssetId());
            return asset;
        } else {
            throw new RuntimeException("자산 정보 수정에 실패했습니다.");
        }
    }
    
    /**
     * 자산 잔액 업데이트
     */
    @Transactional
    public boolean updateAssetBalance(Long assetId, BigDecimal balance) {
        log.info("자산 잔액 업데이트: assetId={}, balance={}", assetId, balance);
        
        int result = assetMapper.updateBalance(assetId, balance);
        if (result > 0) {
            log.info("자산 잔액 업데이트 완료: assetId={}", assetId);
            return true;
        } else {
            throw new RuntimeException("자산 잔액 업데이트에 실패했습니다.");
        }
    }
    
    /**
     * 자산 삭제 (비활성화)
     */
    @Transactional
    public boolean deleteAsset(Long assetId, Long userId) {
        log.info("자산 삭제: assetId={}, userId={}", assetId, userId);
        
        int result = assetMapper.delete(assetId, userId);
        if (result > 0) {
            log.info("자산 삭제 완료: assetId={}", assetId);
            return true;
        } else {
            throw new RuntimeException("자산 삭제에 실패했습니다.");
        }
    }
    
    /**
     * 사용자의 총 자산 조회
     */
    public BigDecimal getTotalBalance(Long userId) {
        log.debug("총 자산 조회: userId={}", userId);
        
        BigDecimal totalBalance = assetMapper.getTotalBalance(userId);
        return totalBalance != null ? totalBalance : BigDecimal.ZERO;
    }
    
    /**
     * 기본 자산 생성 (신규 사용자용)
     */
    @Transactional
    public void createDefaultAssets(Long userId) {
        log.info("기본 자산 생성: userId={}", userId);
        
        // 현금 자산
        Asset cashAsset = Asset.builder()
                .userId(userId)
                .assetName("현금")
                .assetType(Asset.AssetType.CASH)
                .balance(BigDecimal.ZERO)
                .colorCode("#4CAF50")
                .iconName("cash")
                .isActive(true)
                .displayOrder(1)
                .build();
        
        createAsset(cashAsset);
        
        log.info("기본 자산 생성 완료: userId={}", userId);
    }
}
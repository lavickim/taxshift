package com.moneyshift.expense.service;

import com.moneyshift.expense.dto.AssetDto;
import com.moneyshift.expense.entity.Asset;
import com.moneyshift.expense.entity.User;
import com.moneyshift.expense.mapper.EntityMapper;
import com.moneyshift.expense.repository.AssetRepository;
import com.moneyshift.expense.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AssetService {
    private final AssetRepository assetRepository;
    private final UserRepository userRepository;
    private final EntityMapper entityMapper;

    @Transactional
    public AssetDto createAsset(Long userId, AssetDto.CreateRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        Asset asset = Asset.builder()
                .user(user)
                .assetName(request.getAssetName())
                .assetType(request.getAssetType())
                .bankName(request.getBankName())
                .accountNumber(request.getAccountNumber())
                .initialBalance(request.getInitialBalance() != null ? request.getInitialBalance() : BigDecimal.ZERO)
                .currentBalance(request.getInitialBalance() != null ? request.getInitialBalance() : BigDecimal.ZERO)
                .colorCode(request.getColorCode() != null ? request.getColorCode() : "#FF5757")
                .iconName(request.getIconName())
                .displayOrder(request.getDisplayOrder() != null ? request.getDisplayOrder() : 0)
                .isActive(true)
                .build();

        Asset savedAsset = assetRepository.save(asset);
        log.info("Asset created: {}", savedAsset.getAssetName());
        
        return entityMapper.toAssetDto(savedAsset);
    }

    public List<AssetDto> getUserAssets(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        List<Asset> assets = assetRepository.findByUserOrderByDisplayOrder(user);
        
        return assets.stream()
                .map(entityMapper::toAssetDto)
                .collect(Collectors.toList());
    }

    public List<AssetDto> getActiveUserAssets(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        List<Asset> assets = assetRepository.findByUserAndIsActiveTrueOrderByDisplayOrder(user);
        
        return assets.stream()
                .map(entityMapper::toAssetDto)
                .collect(Collectors.toList());
    }

    public AssetDto getAsset(Long userId, Long assetId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        Asset asset = assetRepository.findByAssetIdAndUser(assetId, user)
                .orElseThrow(() -> new IllegalArgumentException("Asset not found"));

        return entityMapper.toAssetDto(asset);
    }

    @Transactional
    public AssetDto updateAsset(Long userId, Long assetId, AssetDto.UpdateRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        Asset asset = assetRepository.findByAssetIdAndUser(assetId, user)
                .orElseThrow(() -> new IllegalArgumentException("Asset not found"));

        if (request.getAssetName() != null) {
            asset.setAssetName(request.getAssetName());
        }
        if (request.getBankName() != null) {
            asset.setBankName(request.getBankName());
        }
        if (request.getAccountNumber() != null) {
            asset.setAccountNumber(request.getAccountNumber());
        }
        if (request.getColorCode() != null) {
            asset.setColorCode(request.getColorCode());
        }
        if (request.getIconName() != null) {
            asset.setIconName(request.getIconName());
        }
        if (request.getDisplayOrder() != null) {
            asset.setDisplayOrder(request.getDisplayOrder());
        }
        if (request.getIsActive() != null) {
            asset.setIsActive(request.getIsActive());
        }

        Asset updatedAsset = assetRepository.save(asset);
        return entityMapper.toAssetDto(updatedAsset);
    }

    @Transactional
    public AssetDto updateBalance(Long userId, Long assetId, AssetDto.BalanceUpdateRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        Asset asset = assetRepository.findByAssetIdAndUser(assetId, user)
                .orElseThrow(() -> new IllegalArgumentException("Asset not found"));

        BigDecimal currentBalance = asset.getCurrentBalance();
        BigDecimal newBalance;

        switch (request.getType().toUpperCase()) {
            case "ADD":
                newBalance = currentBalance.add(request.getAmount());
                break;
            case "SUBTRACT":
                newBalance = currentBalance.subtract(request.getAmount());
                break;
            case "SET":
                newBalance = request.getAmount();
                break;
            default:
                throw new IllegalArgumentException("Invalid balance update type");
        }

        asset.setCurrentBalance(newBalance);
        Asset updatedAsset = assetRepository.save(asset);
        
        log.info("Asset balance updated: {} - New balance: {}", asset.getAssetName(), newBalance);
        return entityMapper.toAssetDto(updatedAsset);
    }

    @Transactional
    public void deleteAsset(Long userId, Long assetId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        Asset asset = assetRepository.findByAssetIdAndUser(assetId, user)
                .orElseThrow(() -> new IllegalArgumentException("Asset not found"));

        assetRepository.delete(asset);
        log.info("Asset deleted: {}", asset.getAssetName());
    }

    public BigDecimal getTotalBalance(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        BigDecimal totalBalance = assetRepository.getTotalBalance(user);
        return totalBalance != null ? totalBalance : BigDecimal.ZERO;
    }

    public BigDecimal getTotalBalanceByType(Long userId, Asset.AssetType assetType) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        BigDecimal totalBalance = assetRepository.getTotalBalanceByType(user, assetType);
        return totalBalance != null ? totalBalance : BigDecimal.ZERO;
    }
}
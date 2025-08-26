package com.moneyshift.expense.controller;

import com.moneyshift.expense.dto.AssetDto;
import com.moneyshift.expense.entity.Asset;
import com.moneyshift.expense.service.AssetService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/v1/assets")
@RequiredArgsConstructor
@CrossOrigin
public class AssetController {
    private final AssetService assetService;

    @PostMapping
    public ResponseEntity<AssetDto> createAsset(
            @RequestParam Long userId,
            @RequestBody AssetDto.CreateRequest request) {
        AssetDto asset = assetService.createAsset(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(asset);
    }

    @GetMapping
    public ResponseEntity<List<AssetDto>> getUserAssets(
            @RequestParam Long userId,
            @RequestParam(defaultValue = "false") boolean activeOnly) {
        List<AssetDto> assets = activeOnly ? 
            assetService.getActiveUserAssets(userId) : 
            assetService.getUserAssets(userId);
        return ResponseEntity.ok(assets);
    }

    @GetMapping("/{assetId}")
    public ResponseEntity<AssetDto> getAsset(
            @RequestParam Long userId,
            @PathVariable Long assetId) {
        AssetDto asset = assetService.getAsset(userId, assetId);
        return ResponseEntity.ok(asset);
    }

    @PutMapping("/{assetId}")
    public ResponseEntity<AssetDto> updateAsset(
            @RequestParam Long userId,
            @PathVariable Long assetId,
            @RequestBody AssetDto.UpdateRequest request) {
        AssetDto asset = assetService.updateAsset(userId, assetId, request);
        return ResponseEntity.ok(asset);
    }

    @PutMapping("/{assetId}/balance")
    public ResponseEntity<AssetDto> updateBalance(
            @RequestParam Long userId,
            @PathVariable Long assetId,
            @RequestBody AssetDto.BalanceUpdateRequest request) {
        AssetDto asset = assetService.updateBalance(userId, assetId, request);
        return ResponseEntity.ok(asset);
    }

    @DeleteMapping("/{assetId}")
    public ResponseEntity<Void> deleteAsset(
            @RequestParam Long userId,
            @PathVariable Long assetId) {
        assetService.deleteAsset(userId, assetId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/total-balance")
    public ResponseEntity<BigDecimal> getTotalBalance(@RequestParam Long userId) {
        BigDecimal totalBalance = assetService.getTotalBalance(userId);
        return ResponseEntity.ok(totalBalance);
    }

    @GetMapping("/total-balance/{assetType}")
    public ResponseEntity<BigDecimal> getTotalBalanceByType(
            @RequestParam Long userId,
            @PathVariable Asset.AssetType assetType) {
        BigDecimal totalBalance = assetService.getTotalBalanceByType(userId, assetType);
        return ResponseEntity.ok(totalBalance);
    }
}
package com.moneyshift.expense.controller;

import com.moneyshift.expense.model.Asset;
import com.moneyshift.expense.service.AssetService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

/**
 * 자산 관리 REST API 컨트롤러
 */
@Slf4j
@RestController
@RequestMapping("/v1/assets")
@RequiredArgsConstructor
@Tag(name = "Asset Management", description = "자산 관리 API")
public class AssetController {
    
    private final AssetService assetService;
    
    @Operation(summary = "사용자 자산 목록 조회", description = "특정 사용자의 모든 자산을 조회합니다.")
    @GetMapping
    public ResponseEntity<List<Asset>> getUserAssets(@RequestParam Long userId) {
        log.info("사용자 자산 목록 조회 요청: userId={}", userId);
        
        List<Asset> assets = assetService.getUserAssets(userId);
        return ResponseEntity.ok(assets);
    }
    
    @Operation(summary = "자산 조회", description = "자산 ID로 특정 자산을 조회합니다.")
    @GetMapping("/{assetId}")
    public ResponseEntity<Asset> getAsset(@PathVariable Long assetId, @RequestParam Long userId) {
        log.info("자산 조회 요청: assetId={}, userId={}", assetId, userId);
        
        Optional<Asset> asset = assetService.getAssetById(assetId, userId);
        if (asset.isPresent()) {
            return ResponseEntity.ok(asset.get());
        } else {
            return ResponseEntity.notFound().build();
        }
    }
    
    @Operation(summary = "자산 유형별 조회", description = "특정 자산 유형의 자산들을 조회합니다.")
    @GetMapping("/type/{assetType}")
    public ResponseEntity<List<Asset>> getAssetsByType(@RequestParam Long userId, 
                                                      @PathVariable Asset.AssetType assetType) {
        log.info("자산 유형별 조회 요청: userId={}, assetType={}", userId, assetType);
        
        List<Asset> assets = assetService.getAssetsByType(userId, assetType);
        return ResponseEntity.ok(assets);
    }
    
    @Operation(summary = "자산 생성", description = "새로운 자산을 생성합니다.")
    @PostMapping
    public ResponseEntity<Asset> createAsset(@Validated @RequestBody Asset asset) {
        log.info("자산 생성 요청: userId={}, assetName={}", asset.getUserId(), asset.getAssetName());
        
        try {
            Asset createdAsset = assetService.createAsset(asset);
            return ResponseEntity.ok(createdAsset);
        } catch (RuntimeException e) {
            log.error("자산 생성 실패: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }
    
    @Operation(summary = "자산 정보 수정", description = "자산 정보를 수정합니다.")
    @PutMapping("/{assetId}")
    public ResponseEntity<Asset> updateAsset(@PathVariable Long assetId, 
                                           @Validated @RequestBody Asset asset) {
        log.info("자산 정보 수정 요청: assetId={}", assetId);
        
        asset.setAssetId(assetId);
        try {
            Asset updatedAsset = assetService.updateAsset(asset);
            return ResponseEntity.ok(updatedAsset);
        } catch (RuntimeException e) {
            log.error("자산 정보 수정 실패: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }
    
    @Operation(summary = "자산 잔액 업데이트", description = "자산의 잔액을 업데이트합니다.")
    @PutMapping("/{assetId}/balance")
    public ResponseEntity<Void> updateAssetBalance(@PathVariable Long assetId, 
                                                  @RequestParam BigDecimal balance) {
        log.info("자산 잔액 업데이트 요청: assetId={}, balance={}", assetId, balance);
        
        try {
            boolean success = assetService.updateAssetBalance(assetId, balance);
            if (success) {
                return ResponseEntity.ok().build();
            } else {
                return ResponseEntity.badRequest().build();
            }
        } catch (RuntimeException e) {
            log.error("자산 잔액 업데이트 실패: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }
    
    @Operation(summary = "자산 삭제", description = "자산을 삭제(비활성화)합니다.")
    @DeleteMapping("/{assetId}")
    public ResponseEntity<Void> deleteAsset(@PathVariable Long assetId, @RequestParam Long userId) {
        log.info("자산 삭제 요청: assetId={}, userId={}", assetId, userId);
        
        try {
            boolean success = assetService.deleteAsset(assetId, userId);
            if (success) {
                return ResponseEntity.ok().build();
            } else {
                return ResponseEntity.badRequest().build();
            }
        } catch (RuntimeException e) {
            log.error("자산 삭제 실패: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }
    
    @Operation(summary = "총 자산 조회", description = "사용자의 총 자산 잔액을 조회합니다.")
    @GetMapping("/total")
    public ResponseEntity<BigDecimal> getTotalBalance(@RequestParam Long userId) {
        log.info("총 자산 조회 요청: userId={}", userId);
        
        BigDecimal totalBalance = assetService.getTotalBalance(userId);
        return ResponseEntity.ok(totalBalance);
    }
}
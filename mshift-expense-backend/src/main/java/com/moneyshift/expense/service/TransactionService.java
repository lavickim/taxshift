package com.moneyshift.expense.service;

import com.moneyshift.expense.mapper.TransactionMapper;
import com.moneyshift.expense.model.Transaction;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * 거래내역 비즈니스 로직 서비스
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class TransactionService {
    
    private final TransactionMapper transactionMapper;
    private final AssetService assetService;
    
    /**
     * 거래내역 ID로 조회
     */
    public Optional<Transaction> getTransactionById(Long transactionId, Long userId) {
        log.debug("거래내역 조회: transactionId={}, userId={}", transactionId, userId);
        return transactionMapper.findById(transactionId, userId);
    }
    
    /**
     * 사용자의 모든 거래내역 조회
     */
    public List<Transaction> getUserTransactions(Long userId) {
        log.debug("사용자 거래내역 목록 조회: userId={}", userId);
        return transactionMapper.findByUserId(userId);
    }
    
    /**
     * 사용자의 거래내역 페이징 조회
     */
    public List<Transaction> getUserTransactions(Long userId, int offset, int limit) {
        log.debug("사용자 거래내역 페이징 조회: userId={}, offset={}, limit={}", userId, offset, limit);
        return transactionMapper.findByUserIdWithPaging(userId, offset, limit);
    }
    
    /**
     * 날짜 범위별 거래내역 조회
     */
    public List<Transaction> getTransactionsByDateRange(Long userId, LocalDate startDate, LocalDate endDate) {
        log.debug("날짜별 거래내역 조회: userId={}, startDate={}, endDate={}", userId, startDate, endDate);
        return transactionMapper.findByDateRange(userId, startDate, endDate);
    }
    
    /**
     * 카테고리별 거래내역 조회
     */
    public List<Transaction> getTransactionsByCategory(Long userId, Long categoryId) {
        log.debug("카테고리별 거래내역 조회: userId={}, categoryId={}", userId, categoryId);
        return transactionMapper.findByCategory(userId, categoryId);
    }
    
    /**
     * 자산별 거래내역 조회
     */
    public List<Transaction> getTransactionsByAsset(Long userId, Long assetId) {
        log.debug("자산별 거래내역 조회: userId={}, assetId={}", userId, assetId);
        return transactionMapper.findByAsset(userId, assetId);
    }
    
    /**
     * 거래 유형별 조회
     */
    public List<Transaction> getTransactionsByType(Long userId, Transaction.TransactionType transactionType) {
        log.debug("거래 유형별 조회: userId={}, transactionType={}", userId, transactionType);
        return transactionMapper.findByType(userId, transactionType.name());
    }
    
    /**
     * 새로운 거래내역 생성
     */
    @Transactional
    public Transaction createTransaction(Transaction transaction) {
        log.info("거래내역 생성: userId={}, transactionType={}, amount={}", 
                transaction.getUserId(), transaction.getTransactionType(), transaction.getAmount());
        
        // 거래 유형별 검증
        validateTransaction(transaction);
        
        // 거래내역 저장
        int result = transactionMapper.insert(transaction);
        if (result <= 0) {
            throw new RuntimeException("거래내역 생성에 실패했습니다.");
        }
        
        // 자산 잔액 업데이트
        updateAssetBalance(transaction);
        
        log.info("거래내역 생성 완료: transactionId={}", transaction.getTransactionId());
        return transaction;
    }
    
    /**
     * 거래내역 수정
     */
    @Transactional
    public Transaction updateTransaction(Transaction transaction) {
        log.info("거래내역 수정: transactionId={}", transaction.getTransactionId());
        
        // 기존 거래내역 조회
        Optional<Transaction> existingOpt = transactionMapper.findById(transaction.getTransactionId(), transaction.getUserId());
        if (existingOpt.isEmpty()) {
            throw new RuntimeException("수정할 거래내역을 찾을 수 없습니다.");
        }
        
        Transaction existing = existingOpt.get();
        
        // 기존 거래의 자산 잔액 복구
        revertAssetBalance(existing);
        
        // 거래내역 업데이트
        validateTransaction(transaction);
        int result = transactionMapper.update(transaction);
        if (result <= 0) {
            throw new RuntimeException("거래내역 수정에 실패했습니다.");
        }
        
        // 새로운 거래의 자산 잔액 반영
        updateAssetBalance(transaction);
        
        log.info("거래내역 수정 완료: transactionId={}", transaction.getTransactionId());
        return transaction;
    }
    
    /**
     * 거래내역 삭제
     */
    @Transactional
    public boolean deleteTransaction(Long transactionId, Long userId) {
        log.info("거래내역 삭제: transactionId={}, userId={}", transactionId, userId);
        
        // 기존 거래내역 조회
        Optional<Transaction> existingOpt = transactionMapper.findById(transactionId, userId);
        if (existingOpt.isEmpty()) {
            throw new RuntimeException("삭제할 거래내역을 찾을 수 없습니다.");
        }
        
        Transaction existing = existingOpt.get();
        
        // 자산 잔액 복구
        revertAssetBalance(existing);
        
        // 거래내역 삭제
        int result = transactionMapper.delete(transactionId, userId);
        if (result > 0) {
            log.info("거래내역 삭제 완료: transactionId={}", transactionId);
            return true;
        } else {
            throw new RuntimeException("거래내역 삭제에 실패했습니다.");
        }
    }
    
    /**
     * 월별 거래내역 요약 조회
     */
    public Map<String, Object> getMonthlyTransactionSummary(Long userId, YearMonth yearMonth) {
        log.debug("월별 거래내역 요약 조회: userId={}, yearMonth={}", userId, yearMonth);
        return transactionMapper.findMonthlySummary(userId, yearMonth.atDay(1), yearMonth.atEndOfMonth());
    }
    
    /**
     * 카테고리별 지출 통계
     */
    public List<Map<String, Object>> getCategoryExpenseStats(Long userId, LocalDate startDate, LocalDate endDate) {
        log.debug("카테고리별 지출 통계 조회: userId={}, startDate={}, endDate={}", userId, startDate, endDate);
        return transactionMapper.findCategoryExpenseStats(userId, startDate, endDate);
    }
    
    /**
     * 월별 수입/지출 추이
     */
    public List<Map<String, Object>> getMonthlyIncomeExpenseTrend(Long userId, int months) {
        log.debug("월별 수입/지출 추이 조회: userId={}, months={}", userId, months);
        return transactionMapper.findMonthlyIncomeExpenseTrend(userId, months);
    }
    
    /**
     * 거래내역 개수 조회
     */
    public int getUserTransactionCount(Long userId) {
        log.debug("거래내역 개수 조회: userId={}", userId);
        return transactionMapper.countByUserId(userId);
    }
    
    /**
     * 거래내역 검색
     */
    public List<Transaction> searchTransactions(Long userId, String keyword) {
        log.debug("거래내역 검색: userId={}, keyword={}", userId, keyword);
        return transactionMapper.searchByKeyword(userId, "%" + keyword + "%");
    }
    
    /**
     * 거래내역 검증
     */
    private void validateTransaction(Transaction transaction) {
        if (transaction.getAmount() == null || transaction.getAmount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new RuntimeException("거래 금액은 0보다 커야 합니다.");
        }
        
        if (transaction.getTransactionType() == null) {
            throw new RuntimeException("거래 유형을 입력해주세요.");
        }
        
        if (transaction.getAssetId() == null) {
            throw new RuntimeException("거래 계좌를 선택해주세요.");
        }
        
        if (transaction.getCategoryId() == null) {
            throw new RuntimeException("거래 카테고리를 선택해주세요.");
        }
        
        // 이체의 경우 대상 자산 필수
        if (transaction.getTransactionType() == Transaction.TransactionType.TRANSFER) {
            if (transaction.getTargetAssetId() == null) {
                throw new RuntimeException("이체 대상 계좌를 선택해주세요.");
            }
            if (transaction.getTargetAssetId().equals(transaction.getAssetId())) {
                throw new RuntimeException("같은 계좌로는 이체할 수 없습니다.");
            }
        }
    }
    
    /**
     * 자산 잔액 업데이트
     */
    private void updateAssetBalance(Transaction transaction) {
        switch (transaction.getTransactionType()) {
            case INCOME:
                // 수입: 자산 증가
                assetService.updateAssetBalance(transaction.getAssetId(), 
                    getCurrentBalance(transaction.getAssetId()).add(transaction.getAmount()));
                break;
                
            case EXPENSE:
                // 지출: 자산 감소
                assetService.updateAssetBalance(transaction.getAssetId(), 
                    getCurrentBalance(transaction.getAssetId()).subtract(transaction.getAmount()));
                break;
                
            case TRANSFER:
                // 이체: 출발 자산 감소, 도착 자산 증가
                assetService.updateAssetBalance(transaction.getAssetId(), 
                    getCurrentBalance(transaction.getAssetId()).subtract(transaction.getAmount()));
                assetService.updateAssetBalance(transaction.getTargetAssetId(), 
                    getCurrentBalance(transaction.getTargetAssetId()).add(transaction.getAmount()));
                break;
        }
    }
    
    /**
     * 자산 잔액 복구 (거래 취소/수정 시)
     */
    private void revertAssetBalance(Transaction transaction) {
        switch (transaction.getTransactionType()) {
            case INCOME:
                // 수입 취소: 자산 감소
                assetService.updateAssetBalance(transaction.getAssetId(), 
                    getCurrentBalance(transaction.getAssetId()).subtract(transaction.getAmount()));
                break;
                
            case EXPENSE:
                // 지출 취소: 자산 증가
                assetService.updateAssetBalance(transaction.getAssetId(), 
                    getCurrentBalance(transaction.getAssetId()).add(transaction.getAmount()));
                break;
                
            case TRANSFER:
                // 이체 취소: 출발 자산 증가, 도착 자산 감소
                assetService.updateAssetBalance(transaction.getAssetId(), 
                    getCurrentBalance(transaction.getAssetId()).add(transaction.getAmount()));
                assetService.updateAssetBalance(transaction.getTargetAssetId(), 
                    getCurrentBalance(transaction.getTargetAssetId()).subtract(transaction.getAmount()));
                break;
        }
    }
    
    /**
     * 현재 자산 잔액 조회
     */
    private BigDecimal getCurrentBalance(Long assetId) {
        return assetService.getAssetById(assetId, null)
                .map(asset -> asset.getBalance())
                .orElse(BigDecimal.ZERO);
    }
}
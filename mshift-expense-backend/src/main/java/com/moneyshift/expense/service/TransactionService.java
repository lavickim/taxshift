package com.moneyshift.expense.service;

import com.moneyshift.expense.dto.TransactionDto;
import com.moneyshift.expense.entity.*;
import com.moneyshift.expense.mapper.EntityMapper;
import com.moneyshift.expense.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class TransactionService {
    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository;
    private final AssetRepository assetRepository;
    private final CategoryRepository categoryRepository;
    private final EntityMapper entityMapper;

    @Transactional
    public TransactionDto createTransaction(Long userId, TransactionDto.CreateRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        Asset asset = assetRepository.findByAssetIdAndUser(request.getAssetId(), user)
                .orElseThrow(() -> new IllegalArgumentException("Asset not found"));

        Category category = categoryRepository.findByCategoryIdAndUser(request.getCategoryId(), user)
                .orElseThrow(() -> new IllegalArgumentException("Category not found"));

        Transaction transaction = Transaction.builder()
                .user(user)
                .transactionType(request.getTransactionType())
                .amount(request.getAmount())
                .asset(asset)
                .category(category)
                .description(request.getDescription())
                .memo(request.getMemo())
                .transactionDate(request.getTransactionDate() != null ? request.getTransactionDate() : LocalDate.now())
                .transactionTime(request.getTransactionTime() != null ? request.getTransactionTime() : LocalTime.now())
                .isRecurring(request.getIsRecurring() != null ? request.getIsRecurring() : false)
                .recurringType(request.getRecurringType())
                .recurringEndDate(request.getRecurringEndDate())
                .build();

        // Handle transfer transactions
        if (request.getTransactionType() == Transaction.TransactionType.TRANSFER && request.getTargetAssetId() != null) {
            Asset targetAsset = assetRepository.findByAssetIdAndUser(request.getTargetAssetId(), user)
                    .orElseThrow(() -> new IllegalArgumentException("Target asset not found"));
            transaction.setTargetAsset(targetAsset);
            
            // Update asset balances
            updateAssetBalance(asset, request.getAmount().negate());
            updateAssetBalance(targetAsset, request.getAmount());
        } else if (request.getTransactionType() == Transaction.TransactionType.INCOME) {
            updateAssetBalance(asset, request.getAmount());
        } else if (request.getTransactionType() == Transaction.TransactionType.EXPENSE) {
            updateAssetBalance(asset, request.getAmount().negate());
        }

        Transaction savedTransaction = transactionRepository.save(transaction);
        log.info("Transaction created: {} - {}", savedTransaction.getTransactionType(), savedTransaction.getAmount());
        
        return entityMapper.toTransactionDto(savedTransaction);
    }

    public List<TransactionDto> getMonthlyTransactions(Long userId, Integer year, Integer month) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        YearMonth yearMonth = YearMonth.of(year, month);
        LocalDate startDate = yearMonth.atDay(1);
        LocalDate endDate = yearMonth.atEndOfMonth();

        List<Transaction> transactions = transactionRepository
                .findByUserAndTransactionDateBetweenOrderByTransactionDateDescTransactionTimeDesc(
                    user, startDate, endDate);

        return transactions.stream()
                .map(entityMapper::toTransactionDto)
                .collect(Collectors.toList());
    }

    public Page<TransactionDto> getTransactions(Long userId, Pageable pageable) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        Page<Transaction> transactions = transactionRepository
                .findByUserOrderByTransactionDateDescTransactionTimeDesc(user, pageable);

        return transactions.map(entityMapper::toTransactionDto);
    }

    public TransactionDto getTransaction(Long userId, Long transactionId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        Transaction transaction = transactionRepository.findByTransactionIdAndUser(transactionId, user)
                .orElseThrow(() -> new IllegalArgumentException("Transaction not found"));

        return entityMapper.toTransactionDto(transaction);
    }

    @Transactional
    public TransactionDto updateTransaction(Long userId, Long transactionId, TransactionDto.UpdateRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        Transaction transaction = transactionRepository.findByTransactionIdAndUser(transactionId, user)
                .orElseThrow(() -> new IllegalArgumentException("Transaction not found"));

        // Reverse previous asset balance changes
        reverseAssetBalanceChange(transaction);

        // Update transaction fields
        if (request.getAmount() != null) {
            transaction.setAmount(request.getAmount());
        }
        if (request.getCategoryId() != null) {
            Category category = categoryRepository.findByCategoryIdAndUser(request.getCategoryId(), user)
                    .orElseThrow(() -> new IllegalArgumentException("Category not found"));
            transaction.setCategory(category);
        }
        if (request.getDescription() != null) {
            transaction.setDescription(request.getDescription());
        }
        if (request.getMemo() != null) {
            transaction.setMemo(request.getMemo());
        }
        if (request.getTransactionDate() != null) {
            transaction.setTransactionDate(request.getTransactionDate());
        }
        if (request.getTransactionTime() != null) {
            transaction.setTransactionTime(request.getTransactionTime());
        }

        // Apply new asset balance changes
        applyAssetBalanceChange(transaction);

        Transaction updatedTransaction = transactionRepository.save(transaction);
        return entityMapper.toTransactionDto(updatedTransaction);
    }

    @Transactional
    public void deleteTransaction(Long userId, Long transactionId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        Transaction transaction = transactionRepository.findByTransactionIdAndUser(transactionId, user)
                .orElseThrow(() -> new IllegalArgumentException("Transaction not found"));

        // Reverse asset balance changes
        reverseAssetBalanceChange(transaction);

        transactionRepository.delete(transaction);
        log.info("Transaction deleted: {}", transactionId);
    }

    public List<TransactionDto.DailyStatistics> getDailyStatistics(Long userId, LocalDate startDate, LocalDate endDate) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        List<Object[]> stats = transactionRepository.getDailyStatistics(user, startDate, endDate);
        List<TransactionDto.DailyStatistics> result = new ArrayList<>();

        for (Object[] stat : stats) {
            LocalDate date = (LocalDate) stat[0];
            BigDecimal income = (BigDecimal) stat[1];
            BigDecimal expense = (BigDecimal) stat[2];
            
            result.add(TransactionDto.DailyStatistics.builder()
                    .date(date)
                    .income(income != null ? income : BigDecimal.ZERO)
                    .expense(expense != null ? expense : BigDecimal.ZERO)
                    .balance(income.subtract(expense))
                    .build());
        }

        return result;
    }

    public List<TransactionDto.CategoryStatistics> getCategoryStatistics(Long userId, 
            Transaction.TransactionType type, LocalDate startDate, LocalDate endDate) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        List<Object[]> stats = transactionRepository.getCategoryStatistics(user, type, startDate, endDate);
        List<TransactionDto.CategoryStatistics> result = new ArrayList<>();
        
        BigDecimal total = BigDecimal.ZERO;
        for (Object[] stat : stats) {
            BigDecimal amount = (BigDecimal) stat[1];
            total = total.add(amount);
        }

        for (Object[] stat : stats) {
            Category category = (Category) stat[0];
            BigDecimal amount = (BigDecimal) stat[1];
            
            result.add(TransactionDto.CategoryStatistics.builder()
                    .categoryId(category.getCategoryId())
                    .categoryName(category.getCategoryName())
                    .iconName(category.getIconName())
                    .colorCode(category.getColorCode())
                    .amount(amount)
                    .percentage(total.compareTo(BigDecimal.ZERO) > 0 ? 
                        amount.multiply(BigDecimal.valueOf(100)).divide(total, 2, BigDecimal.ROUND_HALF_UP) : 
                        BigDecimal.ZERO)
                    .build());
        }

        return result;
    }

    private void updateAssetBalance(Asset asset, BigDecimal amount) {
        asset.setCurrentBalance(asset.getCurrentBalance().add(amount));
        assetRepository.save(asset);
    }

    private void reverseAssetBalanceChange(Transaction transaction) {
        if (transaction.getTransactionType() == Transaction.TransactionType.TRANSFER) {
            if (transaction.getAsset() != null) {
                updateAssetBalance(transaction.getAsset(), transaction.getAmount());
            }
            if (transaction.getTargetAsset() != null) {
                updateAssetBalance(transaction.getTargetAsset(), transaction.getAmount().negate());
            }
        } else if (transaction.getTransactionType() == Transaction.TransactionType.INCOME) {
            if (transaction.getAsset() != null) {
                updateAssetBalance(transaction.getAsset(), transaction.getAmount().negate());
            }
        } else if (transaction.getTransactionType() == Transaction.TransactionType.EXPENSE) {
            if (transaction.getAsset() != null) {
                updateAssetBalance(transaction.getAsset(), transaction.getAmount());
            }
        }
    }

    private void applyAssetBalanceChange(Transaction transaction) {
        if (transaction.getTransactionType() == Transaction.TransactionType.TRANSFER) {
            if (transaction.getAsset() != null) {
                updateAssetBalance(transaction.getAsset(), transaction.getAmount().negate());
            }
            if (transaction.getTargetAsset() != null) {
                updateAssetBalance(transaction.getTargetAsset(), transaction.getAmount());
            }
        } else if (transaction.getTransactionType() == Transaction.TransactionType.INCOME) {
            if (transaction.getAsset() != null) {
                updateAssetBalance(transaction.getAsset(), transaction.getAmount());
            }
        } else if (transaction.getTransactionType() == Transaction.TransactionType.EXPENSE) {
            if (transaction.getAsset() != null) {
                updateAssetBalance(transaction.getAsset(), transaction.getAmount().negate());
            }
        }
    }
}
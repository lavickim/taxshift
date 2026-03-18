package com.moneyshift.expense.service;

import com.moneyshift.expense.dto.DailyMemoDto;
import com.moneyshift.expense.entity.DailyMemo;
import com.moneyshift.expense.entity.User;
import com.moneyshift.expense.repository.DailyMemoRepository;
import com.moneyshift.expense.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class DailyMemoService {
    
    private final DailyMemoRepository dailyMemoRepository;
    private final UserRepository userRepository;
    
    public DailyMemoDto createOrUpdateMemo(DailyMemoDto memoDto) {
        User user = userRepository.findById(memoDto.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        DailyMemo memo = dailyMemoRepository.findByUserAndMemoDate(user, memoDto.getMemoDate())
                .orElse(DailyMemo.builder()
                        .user(user)
                        .memoDate(memoDto.getMemoDate())
                        .build());
        
        memo.setTitle(memoDto.getTitle());
        memo.setContent(memoDto.getContent());
        memo.setColor(memoDto.getColor());
        memo.setMood(memoDto.getMood());
        memo.setIsImportant(memoDto.getIsImportant());
        
        DailyMemo savedMemo = dailyMemoRepository.save(memo);
        return convertToDto(savedMemo);
    }
    
    @Transactional(readOnly = true)
    public DailyMemoDto getMemoByDate(Long userId, LocalDate date) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        return dailyMemoRepository.findByUserAndMemoDate(user, date)
                .map(this::convertToDto)
                .orElse(null);
    }
    
    @Transactional(readOnly = true)
    public List<DailyMemoDto> getMemosByMonth(Long userId, int year, int month) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        List<DailyMemo> memos = dailyMemoRepository.findByUserAndYearMonth(user, year, month);
        return memos.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public List<DailyMemoDto> getMemosByDateRange(Long userId, LocalDate startDate, LocalDate endDate) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        List<DailyMemo> memos = dailyMemoRepository.findByUserAndMemoDateBetweenOrderByMemoDateAsc(
                user, startDate, endDate);
        return memos.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }
    
    @Transactional
    public void deleteMemo(Long userId, LocalDate date) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        DailyMemo memo = dailyMemoRepository.findByUserAndMemoDate(user, date)
                .orElse(null);
        if (memo != null) {
            dailyMemoRepository.delete(memo);
        }
    }
    
    private DailyMemoDto convertToDto(DailyMemo memo) {
        return DailyMemoDto.builder()
                .memoId(memo.getMemoId())
                .userId(memo.getUser().getUserId())
                .memoDate(memo.getMemoDate())
                .title(memo.getTitle())
                .content(memo.getContent())
                .color(memo.getColor())
                .mood(memo.getMood())
                .isImportant(memo.getIsImportant())
                .createdAt(memo.getCreatedAt())
                .updatedAt(memo.getUpdatedAt())
                .build();
    }
}
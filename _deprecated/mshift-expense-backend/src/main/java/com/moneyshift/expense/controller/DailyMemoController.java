package com.moneyshift.expense.controller;

import com.moneyshift.expense.dto.DailyMemoDto;
import com.moneyshift.expense.service.DailyMemoService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/daily-memos")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class DailyMemoController {
    
    private final DailyMemoService dailyMemoService;
    
    @PostMapping
    public ResponseEntity<DailyMemoDto> createOrUpdateMemo(@RequestBody DailyMemoDto memoDto) {
        DailyMemoDto savedMemo = dailyMemoService.createOrUpdateMemo(memoDto);
        return ResponseEntity.ok(savedMemo);
    }
    
    @GetMapping("/user/{userId}/date/{date}")
    public ResponseEntity<DailyMemoDto> getMemoByDate(
            @PathVariable Long userId,
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        DailyMemoDto memo = dailyMemoService.getMemoByDate(userId, date);
        if (memo != null) {
            return ResponseEntity.ok(memo);
        } else {
            return ResponseEntity.noContent().build();
        }
    }
    
    @GetMapping("/user/{userId}/month")
    public ResponseEntity<List<DailyMemoDto>> getMemosByMonth(
            @PathVariable Long userId,
            @RequestParam int year,
            @RequestParam int month) {
        List<DailyMemoDto> memos = dailyMemoService.getMemosByMonth(userId, year, month);
        return ResponseEntity.ok(memos);
    }
    
    @GetMapping("/user/{userId}/range")
    public ResponseEntity<List<DailyMemoDto>> getMemosByDateRange(
            @PathVariable Long userId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        List<DailyMemoDto> memos = dailyMemoService.getMemosByDateRange(userId, startDate, endDate);
        return ResponseEntity.ok(memos);
    }
    
    @DeleteMapping("/user/{userId}/date/{date}")
    public ResponseEntity<Void> deleteMemo(
            @PathVariable Long userId,
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        dailyMemoService.deleteMemo(userId, date);
        return ResponseEntity.noContent().build();
    }
}
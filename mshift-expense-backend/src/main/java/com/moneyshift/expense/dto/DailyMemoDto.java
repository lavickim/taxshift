package com.moneyshift.expense.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DailyMemoDto {
    private Long memoId;
    private Long userId;
    private LocalDate memoDate;
    private String title;
    private String content;
    private String color;
    private String mood;
    private Boolean isImportant;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
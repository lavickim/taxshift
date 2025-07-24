package com.moneyshift.api.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

/**
 * 분개 생성 응답 모델
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class JournalEntryResponse {
    
    @JsonProperty("success")
    private Boolean success;
    
    @JsonProperty("message")
    private String message;
    
    @JsonProperty("journal_entry")
    private JournalEntry journalEntry;
    
    @JsonProperty("processing_info")
    private ProcessingInfo processingInfo;

    // 성공 응답 생성 팩토리 메소드
    public static JournalEntryResponse success(JournalEntry journalEntry) {
        return JournalEntryResponse.builder()
                .success(true)
                .message("분개가 성공적으로 생성되었습니다.")
                .journalEntry(journalEntry)
                .build();
    }

    // 오류 응답 생성 팩토리 메소드
    public static JournalEntryResponse error(String errorMessage) {
        return JournalEntryResponse.builder()
                .success(false)
                .message(errorMessage)
                .journalEntry(null)
                .build();
    }

    /**
     * 분개 처리 과정 정보
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProcessingInfo {
        @JsonProperty("processing_time_ms")
        private Long processingTimeMs;
        
        @JsonProperty("validation_passed")
        private Boolean validationPassed;
        
        @JsonProperty("account_mapping_source")
        private String accountMappingSource; // "TAG_MAPPING", "MANUAL", "DEFAULT"
    }
}
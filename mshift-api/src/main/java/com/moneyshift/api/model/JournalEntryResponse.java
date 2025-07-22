package com.moneyshift.api.model;

import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * 분개 생성 응답 모델
 */
public class JournalEntryResponse {
    
    @JsonProperty("success")
    private Boolean success;
    
    @JsonProperty("message")
    private String message;
    
    @JsonProperty("journal_entry")
    private JournalEntry journalEntry;
    
    @JsonProperty("processing_info")
    private ProcessingInfo processingInfo;

    // 기본 생성자
    public JournalEntryResponse() {}

    // 성공 응답 생성자
    public JournalEntryResponse(JournalEntry journalEntry) {
        this.success = true;
        this.message = "분개가 성공적으로 생성되었습니다.";
        this.journalEntry = journalEntry;
    }

    // 오류 응답 생성자
    public JournalEntryResponse(String errorMessage) {
        this.success = false;
        this.message = errorMessage;
        this.journalEntry = null;
    }

    // Getters and Setters
    public Boolean getSuccess() { return success; }
    public void setSuccess(Boolean success) { this.success = success; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public JournalEntry getJournalEntry() { return journalEntry; }
    public void setJournalEntry(JournalEntry journalEntry) { this.journalEntry = journalEntry; }

    public ProcessingInfo getProcessingInfo() { return processingInfo; }
    public void setProcessingInfo(ProcessingInfo processingInfo) { this.processingInfo = processingInfo; }

    @Override
    public String toString() {
        return String.format("JournalEntryResponse{success=%s, message='%s', journalEntry=%s}", 
                           success, message, journalEntry);
    }

    /**
     * 분개 처리 과정 정보
     */
    public static class ProcessingInfo {
        @JsonProperty("processing_time_ms")
        private Long processingTimeMs;
        
        @JsonProperty("validation_passed")
        private Boolean validationPassed;
        
        @JsonProperty("account_mapping_source")
        private String accountMappingSource; // "TAG_MAPPING", "MANUAL", "DEFAULT"

        public ProcessingInfo() {}

        public ProcessingInfo(Long processingTimeMs, Boolean validationPassed, String accountMappingSource) {
            this.processingTimeMs = processingTimeMs;
            this.validationPassed = validationPassed;
            this.accountMappingSource = accountMappingSource;
        }

        // Getters and Setters
        public Long getProcessingTimeMs() { return processingTimeMs; }
        public void setProcessingTimeMs(Long processingTimeMs) { this.processingTimeMs = processingTimeMs; }

        public Boolean getValidationPassed() { return validationPassed; }
        public void setValidationPassed(Boolean validationPassed) { this.validationPassed = validationPassed; }

        public String getAccountMappingSource() { return accountMappingSource; }
        public void setAccountMappingSource(String accountMappingSource) { this.accountMappingSource = accountMappingSource; }
    }
}
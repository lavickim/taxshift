package com.moneyshift.api.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.LocalDate;
import java.util.List;

/**
 * 회계 분개 모델
 */
public class JournalEntry {
    
    @JsonProperty("id")
    private Long id;
    
    @JsonProperty("company_id")
    private String companyId;
    
    @JsonProperty("entry_date")
    private LocalDate entryDate;
    
    @JsonProperty("description")
    private String description;
    
    @JsonProperty("reference_type")
    private String referenceType;
    
    @JsonProperty("reference_id")
    private Long referenceId;
    
    @JsonProperty("total_amount")
    private Long totalAmount;
    
    @JsonProperty("status")
    private String status;
    
    @JsonProperty("created_by")
    private String createdBy;
    
    @JsonProperty("details")
    private List<JournalEntryDetail> details;

    // 기본 생성자
    public JournalEntry() {}

    // 생성자
    public JournalEntry(String companyId, LocalDate entryDate, String description, 
                       String referenceType, Long referenceId, Long totalAmount) {
        this.companyId = companyId;
        this.entryDate = entryDate;
        this.description = description;
        this.referenceType = referenceType;
        this.referenceId = referenceId;
        this.totalAmount = totalAmount;
        this.status = "DRAFT";
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getCompanyId() { return companyId; }
    public void setCompanyId(String companyId) { this.companyId = companyId; }

    public LocalDate getEntryDate() { return entryDate; }
    public void setEntryDate(LocalDate entryDate) { this.entryDate = entryDate; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getReferenceType() { return referenceType; }
    public void setReferenceType(String referenceType) { this.referenceType = referenceType; }

    public Long getReferenceId() { return referenceId; }
    public void setReferenceId(Long referenceId) { this.referenceId = referenceId; }

    public Long getTotalAmount() { return totalAmount; }
    public void setTotalAmount(Long totalAmount) { this.totalAmount = totalAmount; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }

    public List<JournalEntryDetail> getDetails() { return details; }
    public void setDetails(List<JournalEntryDetail> details) { this.details = details; }

    @Override
    public String toString() {
        return String.format("JournalEntry{id=%d, companyId='%s', entryDate=%s, description='%s', totalAmount=%d, status='%s'}", 
                           id, companyId, entryDate, description, totalAmount, status);
    }
}
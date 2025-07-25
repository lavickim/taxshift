package com.moneyshift.api.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

/**
 * 전표 출력 요청 DTO
 * 
 * 전표 형식의 분개 출력을 위한 요청 데이터
 * - 한국 표준 전표 양식 지원
 * - 입금전표/출금전표/대체전표 형식 제공
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "전표 출력 요청")
public class VoucherPrintRequest {
    
    @NotBlank(message = "회사 ID는 필수입니다")
    @Schema(description = "회사 ID", example = "test-company")
    private String companyId;
    
    @Schema(description = "특정 분개 ID 목록 (선택적)", example = "[1, 2, 3]")
    private List<Long> journalEntryIds;
    
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
    @Schema(description = "시작일자 (기간 조회시)", example = "2025-01-01")
    private LocalDate startDate;
    
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
    @Schema(description = "종료일자 (기간 조회시)", example = "2025-01-31")
    private LocalDate endDate;
    
    @NotNull(message = "전표 형식은 필수입니다")
    @Schema(description = "전표 형식", example = "STANDARD", allowableValues = {"STANDARD", "RECEIPT", "PAYMENT", "TRANSFER"})
    private VoucherFormat voucherFormat;
    
    @NotNull(message = "출력 형식은 필수입니다")
    @Schema(description = "출력 형식", example = "HTML", allowableValues = {"HTML", "PDF", "EXCEL"})
    private OutputFormat outputFormat;
    
    @Schema(description = "회사명 (전표 헤더용)", example = "테스트 주식회사")
    private String companyName;
    
    @Schema(description = "결재란 포함 여부", example = "true")
    @Builder.Default
    private Boolean includeApprovalSection = true;
    
    /**
     * 전표 형식 종류
     */
    public enum VoucherFormat {
        STANDARD("일반 전표"),
        RECEIPT("입금 전표"), 
        PAYMENT("출금 전표"),
        TRANSFER("대체 전표");
        
        private final String description;
        
        VoucherFormat(String description) {
            this.description = description;
        }
        
        public String getDescription() {
            return description;
        }
    }
    
    /**
     * 출력 형식 종류
     */
    public enum OutputFormat {
        HTML("HTML"),
        PDF("PDF"),
        EXCEL("Excel");
        
        private final String description;
        
        OutputFormat(String description) {
            this.description = description;
        }
        
        public String getDescription() {
            return description;
        }
    }
}
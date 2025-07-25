package com.moneyshift.api.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * 전표 출력 응답 DTO
 * 
 * 전표 형식으로 출력된 분개 데이터
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "전표 출력 응답")
public class VoucherPrintResponse {
    
    @Schema(description = "생성된 전표 목록")
    private List<VoucherData> vouchers;
    
    @Schema(description = "전체 전표 수", example = "5")
    private Integer totalVouchers;
    
    @Schema(description = "요청한 출력 형식", example = "HTML")
    private VoucherPrintRequest.OutputFormat outputFormat;
    
    @Schema(description = "생성된 파일 경로 (PDF/Excel 출력시)", example = "/tmp/vouchers_20250125.pdf")
    private String filePath;
    
    @Schema(description = "HTML 출력 내용 (HTML 출력시)")
    private String htmlContent;
    
    /**
     * 개별 전표 데이터
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @Schema(description = "개별 전표 데이터")
    public static class VoucherData {
        
        @Schema(description = "전표 번호", example = "V-2025-0001")
        private String voucherNumber;
        
        @Schema(description = "회사명", example = "테스트 주식회사")
        private String companyName;
        
        @Schema(description = "분개일자", example = "2025-01-25")
        private String entryDate;
        
        @Schema(description = "적요", example = "사무용품 구매")
        private String description;
        
        @Schema(description = "전표 형식", example = "PAYMENT")
        private VoucherPrintRequest.VoucherFormat voucherFormat;
        
        @Schema(description = "분개 상세 내역")
        private List<VoucherLineItem> lineItems;
        
        @Schema(description = "차변 합계", example = "100000")
        private String totalDebit;
        
        @Schema(description = "대변 합계", example = "100000") 
        private String totalCredit;
        
        @Schema(description = "작성자", example = "SYSTEM")
        private String createdBy;
        
        @Schema(description = "승인자", example = "관리자")
        private String approvedBy;
        
        @Schema(description = "전표 상태", example = "APPROVED")
        private String status;
    }
    
    /**
     * 전표 라인 아이템 (분개 상세)
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @Schema(description = "전표 라인 아이템")
    public static class VoucherLineItem {
        
        @Schema(description = "계정과목 코드", example = "5217")
        private String accountCode;
        
        @Schema(description = "계정과목명", example = "소모품비")
        private String accountName;
        
        @Schema(description = "적요", example = "A4 용지 구매")
        private String description;
        
        @Schema(description = "차변 금액", example = "50000")
        private String debitAmount;
        
        @Schema(description = "대변 금액", example = "0")
        private String creditAmount;
        
        @Schema(description = "라인 번호", example = "1")
        private Integer lineNumber;
    }
}
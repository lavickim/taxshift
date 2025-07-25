package com.moneyshift.api.controller;

import com.moneyshift.api.dto.VoucherPrintRequest;
import com.moneyshift.api.dto.VoucherPrintResponse;
import com.moneyshift.api.service.VoucherGeneratorService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

/**
 * 전표 출력 API 컨트롤러
 * 
 * 한국 표준 전표 양식으로 분개 데이터를 출력하는 API를 제공합니다.
 * - 입금전표/출금전표/대체전표 형식 지원
 * - HTML/PDF/Excel 출력 형식 지원
 * - 유연한 조회 조건 (특정 분개, 기간별, 회사별)
 */
@Slf4j
@RestController
@RequestMapping("/api/v2/accounting/vouchers")
@RequiredArgsConstructor
@Tag(name = "전표 출력", description = "전표 형식 분개 출력 API")
public class VoucherController {

    private final VoucherGeneratorService voucherGeneratorService;

    @Operation(
        summary = "전표 출력",
        description = "분개 데이터를 전표 형식으로 출력합니다. 입금전표/출금전표/대체전표 양식을 지원하며, HTML/PDF/Excel 형식으로 출력할 수 있습니다."
    )
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "전표 출력 성공"),
        @ApiResponse(responseCode = "400", description = "잘못된 요청 파라미터"),
        @ApiResponse(responseCode = "404", description = "분개 데이터 없음"),
        @ApiResponse(responseCode = "500", description = "서버 오류")
    })
    @PostMapping("/print")
    public ResponseEntity<?> printVouchers(
            @Parameter(description = "전표 출력 요청 정보", required = true)
            @Valid @RequestBody VoucherPrintRequest request) {
        
        try {
            log.info("전표 출력 요청: companyId={}, format={}, output={}", 
                    request.getCompanyId(), request.getVoucherFormat(), request.getOutputFormat());

            VoucherPrintResponse response = voucherGeneratorService.generateVouchers(request);

            if (response.getTotalVouchers() == 0) {
                return ResponseEntity.ok()
                        .body(new ApiResult<>(false, "출력할 전표가 없습니다.", response));
            }

            // HTML 출력인 경우 직접 HTML 내용 반환
            if (request.getOutputFormat() == VoucherPrintRequest.OutputFormat.HTML) {
                return ResponseEntity.ok()
                        .contentType(MediaType.TEXT_HTML)
                        .body(response.getHtmlContent());
            }

            // JSON 형태로 응답 (PDF/Excel은 파일 경로 포함)
            return ResponseEntity.ok()
                    .body(new ApiResult<>(true, 
                            String.format("%d개 전표 출력 완료", response.getTotalVouchers()), 
                            response));

        } catch (IllegalArgumentException e) {
            log.warn("전표 출력 요청 오류: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(new ApiResult<>(false, e.getMessage(), null));
        } catch (Exception e) {
            log.error("전표 출력 중 오류 발생", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResult<>(false, "전표 출력 중 오류가 발생했습니다.", null));
        }
    }

    @Operation(
        summary = "특정 분개 전표 출력",
        description = "지정된 분개 ID들을 전표 형식으로 출력합니다."
    )
    @PostMapping("/print/entries")
    public ResponseEntity<ApiResult<VoucherPrintResponse>> printSpecificEntries(
            @Parameter(description = "회사 ID", required = true, example = "test-company")
            @RequestParam String companyId,
            
            @Parameter(description = "분개 ID 목록", required = true)
            @RequestParam List<Long> journalEntryIds,
            
            @Parameter(description = "전표 형식", required = false, example = "STANDARD")
            @RequestParam(defaultValue = "STANDARD") VoucherPrintRequest.VoucherFormat voucherFormat,
            
            @Parameter(description = "출력 형식", required = false, example = "HTML")
            @RequestParam(defaultValue = "HTML") VoucherPrintRequest.OutputFormat outputFormat,
            
            @Parameter(description = "회사명", required = false)
            @RequestParam(required = false) String companyName,
            
            @Parameter(description = "결재란 포함 여부", required = false)
            @RequestParam(defaultValue = "true") Boolean includeApprovalSection) {

        try {
            VoucherPrintRequest request = VoucherPrintRequest.builder()
                    .companyId(companyId)
                    .journalEntryIds(journalEntryIds)
                    .voucherFormat(voucherFormat)
                    .outputFormat(outputFormat)
                    .companyName(companyName)
                    .includeApprovalSection(includeApprovalSection)
                    .build();

            VoucherPrintResponse response = voucherGeneratorService.generateVouchers(request);

            return ResponseEntity.ok(
                    new ApiResult<>(true, 
                            String.format("%d개 전표 출력 완료", response.getTotalVouchers()), 
                            response));

        } catch (Exception e) {
            log.error("특정 분개 전표 출력 중 오류 발생", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResult<>(false, "전표 출력 중 오류가 발생했습니다.", null));
        }
    }

    @Operation(
        summary = "기간별 전표 출력",
        description = "지정된 기간의 분개를 전표 형식으로 출력합니다."
    )
    @GetMapping("/print/period")
    public ResponseEntity<ApiResult<VoucherPrintResponse>> printByPeriod(
            @Parameter(description = "회사 ID", required = true, example = "test-company")
            @RequestParam String companyId,
            
            @Parameter(description = "시작일자", required = true, example = "2025-01-01")
            @RequestParam LocalDate startDate,
            
            @Parameter(description = "종료일자", required = true, example = "2025-01-31")
            @RequestParam LocalDate endDate,
            
            @Parameter(description = "전표 형식", required = false, example = "STANDARD")
            @RequestParam(defaultValue = "STANDARD") VoucherPrintRequest.VoucherFormat voucherFormat,
            
            @Parameter(description = "출력 형식", required = false, example = "HTML")
            @RequestParam(defaultValue = "HTML") VoucherPrintRequest.OutputFormat outputFormat,
            
            @Parameter(description = "회사명", required = false)
            @RequestParam(required = false) String companyName,
            
            @Parameter(description = "결재란 포함 여부", required = false)
            @RequestParam(defaultValue = "true") Boolean includeApprovalSection) {

        try {
            VoucherPrintRequest request = VoucherPrintRequest.builder()
                    .companyId(companyId)
                    .startDate(startDate)
                    .endDate(endDate)
                    .voucherFormat(voucherFormat)
                    .outputFormat(outputFormat)
                    .companyName(companyName)
                    .includeApprovalSection(includeApprovalSection)
                    .build();

            VoucherPrintResponse response = voucherGeneratorService.generateVouchers(request);

            return ResponseEntity.ok(
                    new ApiResult<>(true, 
                            String.format("%s~%s 기간 %d개 전표 출력 완료", 
                                    startDate, endDate, response.getTotalVouchers()), 
                            response));

        } catch (Exception e) {
            log.error("기간별 전표 출력 중 오류 발생", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResult<>(false, "전표 출력 중 오류가 발생했습니다.", null));
        }
    }

    @Operation(
        summary = "전표 출력 미리보기",
        description = "실제 출력 전에 전표 형식을 미리 확인할 수 있습니다."
    )
    @PostMapping("/preview")
    public ResponseEntity<ApiResult<VoucherPrintResponse>> previewVouchers(
            @Parameter(description = "전표 미리보기 요청 정보", required = true)
            @Valid @RequestBody VoucherPrintRequest request) {

        try {
            // HTML 형식으로 강제 설정 (미리보기용)
            VoucherPrintRequest previewRequest = VoucherPrintRequest.builder()
                    .companyId(request.getCompanyId())
                    .journalEntryIds(request.getJournalEntryIds())
                    .startDate(request.getStartDate())
                    .endDate(request.getEndDate())
                    .voucherFormat(request.getVoucherFormat())
                    .outputFormat(VoucherPrintRequest.OutputFormat.HTML)
                    .companyName(request.getCompanyName())
                    .includeApprovalSection(request.getIncludeApprovalSection())
                    .build();

            VoucherPrintResponse response = voucherGeneratorService.generateVouchers(previewRequest);

            return ResponseEntity.ok(
                    new ApiResult<>(true, "전표 미리보기 생성 완료", response));

        } catch (Exception e) {
            log.error("전표 미리보기 중 오류 발생", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResult<>(false, "전표 미리보기 중 오류가 발생했습니다.", null));
        }
    }

    @Operation(
        summary = "지원 전표 형식 조회",
        description = "시스템에서 지원하는 전표 형식과 출력 형식 목록을 조회합니다."
    )
    @GetMapping("/formats")
    public ResponseEntity<ApiResult<VoucherFormatsResponse>> getSupportedFormats() {
        try {
            VoucherFormatsResponse response = VoucherFormatsResponse.builder()
                    .voucherFormats(List.of(
                            new FormatInfo("STANDARD", "일반 전표", "기본 분개 전표 형식"),
                            new FormatInfo("RECEIPT", "입금 전표", "현금 입금 거래용 전표"),
                            new FormatInfo("PAYMENT", "출금 전표", "현금 출금 거래용 전표"),
                            new FormatInfo("TRANSFER", "대체 전표", "현금 이동이 없는 대체 거래용 전표")
                    ))
                    .outputFormats(List.of(
                            new FormatInfo("HTML", "HTML", "웹 브라우저에서 볼 수 있는 HTML 형식"),
                            new FormatInfo("PDF", "PDF", "인쇄용 PDF 파일 (향후 지원)"),
                            new FormatInfo("EXCEL", "Excel", "엑셀 파일 형식 (향후 지원)")
                    ))
                    .build();

            return ResponseEntity.ok(
                    new ApiResult<>(true, "지원 형식 조회 완료", response));

        } catch (Exception e) {
            log.error("지원 형식 조회 중 오류 발생", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResult<>(false, "지원 형식 조회 중 오류가 발생했습니다.", null));
        }
    }

    /**
     * API 응답 통일 클래스
     */
    public static class ApiResult<T> {
        private boolean success;
        private String message;
        private T data;

        public ApiResult(boolean success, String message, T data) {
            this.success = success;
            this.message = message;
            this.data = data;
        }

        // Getters
        public boolean isSuccess() { return success; }
        public String getMessage() { return message; }
        public T getData() { return data; }
    }

    /**
     * 지원 형식 응답 클래스
     */
    public static class VoucherFormatsResponse {
        private List<FormatInfo> voucherFormats;
        private List<FormatInfo> outputFormats;

        public static VoucherFormatsResponseBuilder builder() {
            return new VoucherFormatsResponseBuilder();
        }

        public List<FormatInfo> getVoucherFormats() { return voucherFormats; }
        public List<FormatInfo> getOutputFormats() { return outputFormats; }

        public static class VoucherFormatsResponseBuilder {
            private List<FormatInfo> voucherFormats;
            private List<FormatInfo> outputFormats;

            public VoucherFormatsResponseBuilder voucherFormats(List<FormatInfo> voucherFormats) {
                this.voucherFormats = voucherFormats;
                return this;
            }

            public VoucherFormatsResponseBuilder outputFormats(List<FormatInfo> outputFormats) {
                this.outputFormats = outputFormats;
                return this;
            }

            public VoucherFormatsResponse build() {
                VoucherFormatsResponse response = new VoucherFormatsResponse();
                response.voucherFormats = this.voucherFormats;
                response.outputFormats = this.outputFormats;
                return response;
            }
        }
    }

    /**
     * 형식 정보 클래스
     */
    public static class FormatInfo {
        private String code;
        private String name;
        private String description;

        public FormatInfo(String code, String name, String description) {
            this.code = code;
            this.name = name;
            this.description = description;
        }

        public String getCode() { return code; }
        public String getName() { return name; }
        public String getDescription() { return description; }
    }
}
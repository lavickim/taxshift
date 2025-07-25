package com.moneyshift.api.service;

import com.moneyshift.api.dto.VoucherPrintRequest;
import com.moneyshift.api.dto.VoucherPrintResponse;
import com.moneyshift.api.mapper.JournalEntryMapper;
import com.moneyshift.api.mapper.ChartOfAccountsMapper;
import com.moneyshift.api.model.JournalEntry;
import com.moneyshift.api.model.JournalEntryDetail;
import com.moneyshift.api.model.ChartOfAccount;
import com.moneyshift.api.model.VoucherTemplate;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.text.NumberFormat;
import java.time.LocalDate;
import java.util.List;
import java.util.Locale;
import java.util.stream.Collectors;

/**
 * 전표 생성 서비스
 * 
 * 한국 표준 전표 양식으로 분개 데이터를 변환하는 핵심 서비스
 * - 입금전표/출금전표/대체전표 형식 지원
 * - HTML/PDF/Excel 출력 지원
 * - 결재란 포함 표준 양식 제공
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class VoucherGeneratorService {

    private final JournalEntryMapper journalEntryMapper;
    private final ChartOfAccountsMapper chartOfAccountsMapper;
    private final VoucherTemplateService voucherTemplateService;
    
    private static final NumberFormat CURRENCY_FORMAT = NumberFormat.getNumberInstance(Locale.KOREA);

    /**
     * 전표 출력 데이터 생성
     */
    public VoucherPrintResponse generateVouchers(VoucherPrintRequest request) {
        log.info("전표 생성 요청 처리 시작: companyId={}, format={}, output={}", 
                request.getCompanyId(), request.getVoucherFormat(), request.getOutputFormat());

        List<JournalEntry> journalEntries = getJournalEntries(request);
        
        if (journalEntries.isEmpty()) {
            log.warn("해당 조건에 맞는 분개가 없습니다: {}", request);
            return VoucherPrintResponse.builder()
                    .vouchers(List.of())
                    .totalVouchers(0)
                    .outputFormat(request.getOutputFormat())
                    .build();
        }

        List<VoucherPrintResponse.VoucherData> voucherDataList = journalEntries.stream()
                .map(entry -> convertToVoucherData(entry, request))
                .collect(Collectors.toList());

        VoucherPrintResponse response = VoucherPrintResponse.builder()
                .vouchers(voucherDataList)
                .totalVouchers(voucherDataList.size())
                .outputFormat(request.getOutputFormat())
                .build();

        // 출력 형식에 따른 추가 처리
        processOutputFormat(response, request);

        log.info("전표 생성 완료: {}개 전표 생성", voucherDataList.size());
        return response;
    }

    /**
     * 요청 조건에 따른 분개 조회
     */
    private List<JournalEntry> getJournalEntries(VoucherPrintRequest request) {
        List<JournalEntry> entries;

        if (request.getJournalEntryIds() != null && !request.getJournalEntryIds().isEmpty()) {
            // 특정 분개 ID들로 조회
            entries = journalEntryMapper.findByIds(request.getJournalEntryIds());
        } else if (request.getStartDate() != null && request.getEndDate() != null) {
            // 기간별 조회
            entries = journalEntryMapper.findByCompanyIdAndDateRange(
                    request.getCompanyId(), 
                    request.getStartDate(), 
                    request.getEndDate()
            );
        } else {
            // 회사 전체 분개 조회 (최근 30일)
            LocalDate endDate = LocalDate.now();
            LocalDate startDate = endDate.minusDays(30);
            entries = journalEntryMapper.findByCompanyIdAndDateRange(
                    request.getCompanyId(), 
                    startDate, 
                    endDate
            );
        }

        return entries.stream()
                .filter(entry -> "APPROVED".equals(entry.getStatus()) || "POSTED".equals(entry.getStatus()))
                .collect(Collectors.toList());
    }

    /**
     * 분개를 전표 데이터로 변환
     */
    private VoucherPrintResponse.VoucherData convertToVoucherData(JournalEntry entry, VoucherPrintRequest request) {
        // 분개 상세 내역 조회
        List<JournalEntryDetail> details = journalEntryMapper.findDetailsByJournalEntryId(entry.getId());
        
        // 전표 라인 아이템 변환
        List<VoucherPrintResponse.VoucherLineItem> lineItems = details.stream()
                .map(this::convertToLineItem)
                .collect(Collectors.toList());

        // 전표 번호 생성
        String voucherNumber = generateVoucherNumber(entry, request.getVoucherFormat());
        
        // 전표 형식 결정
        VoucherPrintRequest.VoucherFormat voucherFormat = determineVoucherFormat(entry, request.getVoucherFormat());

        return VoucherPrintResponse.VoucherData.builder()
                .voucherNumber(voucherNumber)
                .companyName(request.getCompanyName() != null ? request.getCompanyName() : "테스트 주식회사")
                .entryDate(entry.getEntryDate().toString())
                .description(entry.getDescription())
                .voucherFormat(voucherFormat)
                .lineItems(lineItems)
                .totalDebit(formatCurrency(entry.getTotalDebitAmount()))
                .totalCredit(formatCurrency(entry.getTotalCreditAmount()))
                .createdBy(entry.getCreatedBy() != null ? entry.getCreatedBy() : "SYSTEM")
                .approvedBy("관리자")
                .status(entry.getStatus())
                .build();
    }

    /**
     * 분개 상세를 라인 아이템으로 변환
     */
    private VoucherPrintResponse.VoucherLineItem convertToLineItem(JournalEntryDetail detail) {
        // 계정과목명 조회
        ChartOfAccount account = chartOfAccountsMapper.findAccountByCode(detail.getAccountCode());
        String accountName = account != null ? account.getAccountName() : "알 수 없는 계정";

        return VoucherPrintResponse.VoucherLineItem.builder()
                .accountCode(detail.getAccountCode())
                .accountName(accountName)
                .description(detail.getDescription())
                .debitAmount(detail.getDebitAmount().compareTo(BigDecimal.ZERO) > 0 ? 
                           formatCurrency(detail.getDebitAmount()) : "")
                .creditAmount(detail.getCreditAmount().compareTo(BigDecimal.ZERO) > 0 ? 
                            formatCurrency(detail.getCreditAmount()) : "")
                .lineNumber(detail.getLineNumber())
                .build();
    }

    /**
     * 전표 번호 생성
     */
    private String generateVoucherNumber(JournalEntry entry, VoucherPrintRequest.VoucherFormat format) {
        String prefix = switch (format) {
            case RECEIPT -> "R";    // Receipt (입금전표)
            case PAYMENT -> "P";    // Payment (출금전표)
            case TRANSFER -> "T";   // Transfer (대체전표)
            default -> "V";         // Standard (일반전표)
        };
        
        return String.format("%s-%d-%06d", prefix, entry.getEntryDate().getYear(), entry.getId());
    }

    /**
     * 분개 내용을 분석하여 전표 형식 자동 결정
     */
    private VoucherPrintRequest.VoucherFormat determineVoucherFormat(JournalEntry entry, 
                                                                  VoucherPrintRequest.VoucherFormat requestedFormat) {
        // 요청된 형식이 STANDARD가 아니면 그대로 사용
        if (requestedFormat != VoucherPrintRequest.VoucherFormat.STANDARD) {
            return requestedFormat;
        }

        // 분개 상세 내역 분석하여 자동 결정
        List<JournalEntryDetail> details = journalEntryMapper.findDetailsByJournalEntryId(entry.getId());
        
        boolean hasCashDebit = details.stream()
                .anyMatch(d -> (d.getAccountCode().startsWith("1100") || d.getAccountCode().startsWith("1110")) 
                              && d.getDebitAmount().compareTo(BigDecimal.ZERO) > 0);
        
        boolean hasCashCredit = details.stream()
                .anyMatch(d -> (d.getAccountCode().startsWith("1100") || d.getAccountCode().startsWith("1110")) 
                              && d.getCreditAmount().compareTo(BigDecimal.ZERO) > 0);

        if (hasCashDebit) {
            return VoucherPrintRequest.VoucherFormat.RECEIPT;  // 입금전표
        } else if (hasCashCredit) {
            return VoucherPrintRequest.VoucherFormat.PAYMENT;  // 출금전표
        } else {
            return VoucherPrintRequest.VoucherFormat.TRANSFER; // 대체전표
        }
    }

    /**
     * 출력 형식별 추가 처리
     */
    private void processOutputFormat(VoucherPrintResponse response, VoucherPrintRequest request) {
        switch (request.getOutputFormat()) {
            case HTML:
                response.setHtmlContent(generateHtmlContent(response, request));
                break;
            case PDF:
                response.setFilePath(generatePdfFile(response, request));
                break;
            case EXCEL:
                response.setFilePath(generateExcelFile(response, request));
                break;
        }
    }

    /**
     * HTML 전표 생성 (템플릿 기반)
     */
    private String generateHtmlContent(VoucherPrintResponse response, VoucherPrintRequest request) {
        StringBuilder html = new StringBuilder();
        
        html.append("<!DOCTYPE html>");
        html.append("<html lang='ko'>");
        html.append("<head>");
        html.append("<meta charset='UTF-8'>");
        html.append("<title>전표 출력</title>");
        html.append("<style>");
        html.append(getVoucherCssFromTemplate(request.getCompanyId(), request.getVoucherFormat()));
        html.append("</style>");
        html.append("</head>");
        html.append("<body>");

        for (VoucherPrintResponse.VoucherData voucher : response.getVouchers()) {
            html.append(generateVoucherHtmlFromTemplate(voucher, request));
            html.append("<div class='page-break'></div>");
        }

        html.append("</body>");
        html.append("</html>");

        return html.toString();
    }

    /**
     * 템플릿 기반 개별 전표 HTML 생성
     */
    private String generateVoucherHtmlFromTemplate(VoucherPrintResponse.VoucherData voucher, VoucherPrintRequest request) {
        // 기본 템플릿 조회
        VoucherTemplate template = voucherTemplateService.getDefaultTemplate(
                request.getCompanyId(), 
                request.getVoucherFormat().name()
        );

        if (template == null) {
            log.warn("기본 템플릿을 찾을 수 없습니다. 하드코딩된 템플릿을 사용합니다: format={}", request.getVoucherFormat());
            return generateVoucherHtml(voucher, request);
        }

        // 템플릿 변수 치환
        String htmlContent = template.getHtmlTemplate();
        htmlContent = replaceTemplateVariables(htmlContent, voucher, request);

        return htmlContent;
    }

    /**
     * 템플릿에서 CSS 스타일 조회
     */
    private String getVoucherCssFromTemplate(String companyId, VoucherPrintRequest.VoucherFormat voucherFormat) {
        VoucherTemplate template = voucherTemplateService.getDefaultTemplate(companyId, voucherFormat.name());
        
        if (template != null && template.getCssStyles() != null) {
            return template.getCssStyles();
        }
        
        // 기본 CSS 스타일 사용
        return getVoucherCss();
    }

    /**
     * 템플릿 변수 치환
     */
    private String replaceTemplateVariables(String template, VoucherPrintResponse.VoucherData voucher, VoucherPrintRequest request) {
        String result = template;
        
        // 기본 변수 치환
        result = result.replace("{{voucherNumber}}", voucher.getVoucherNumber());
        result = result.replace("{{companyName}}", voucher.getCompanyName());
        result = result.replace("{{entryDate}}", voucher.getEntryDate());
        result = result.replace("{{description}}", voucher.getDescription());
        result = result.replace("{{totalDebit}}", voucher.getTotalDebit());
        result = result.replace("{{totalCredit}}", voucher.getTotalCredit());
        result = result.replace("{{createdBy}}", voucher.getCreatedBy());
        result = result.replace("{{approvedBy}}", voucher.getApprovedBy());
        result = result.replace("{{voucherFormat.description}}", voucher.getVoucherFormat().getDescription());

        // 라인 아이템 처리
        result = replaceLineItems(result, voucher.getLineItems());
        
        // 조건부 섹션 처리
        result = replaceConditionalSections(result, request);

        return result;
    }

    /**
     * 라인 아이템 템플릿 치환
     */
    private String replaceLineItems(String template, List<VoucherPrintResponse.VoucherLineItem> lineItems) {
        // {{#each lineItems}} ... {{/each}} 블록을 찾아서 치환
        String startTag = "{{#each lineItems}}";
        String endTag = "{{/each}}";
        
        int startIndex = template.indexOf(startTag);
        int endIndex = template.indexOf(endTag);
        
        if (startIndex == -1 || endIndex == -1) {
            return template;
        }
        
        String beforeBlock = template.substring(0, startIndex);
        String itemTemplate = template.substring(startIndex + startTag.length(), endIndex);
        String afterBlock = template.substring(endIndex + endTag.length());
        
        StringBuilder itemsHtml = new StringBuilder();
        for (VoucherPrintResponse.VoucherLineItem item : lineItems) {
            String itemHtml = itemTemplate;
            itemHtml = itemHtml.replace("{{accountCode}}", item.getAccountCode());
            itemHtml = itemHtml.replace("{{accountName}}", item.getAccountName());
            itemHtml = itemHtml.replace("{{description}}", item.getDescription());
            itemHtml = itemHtml.replace("{{debitAmount}}", item.getDebitAmount());
            itemHtml = itemHtml.replace("{{creditAmount}}", item.getCreditAmount());
            itemsHtml.append(itemHtml);
        }
        
        return beforeBlock + itemsHtml.toString() + afterBlock;
    }

    /**
     * 조건부 섹션 템플릿 치환
     */
    private String replaceConditionalSections(String template, VoucherPrintRequest request) {
        // {{#if includeApprovalSection}} ... {{/if}} 블록 처리
        String approvalStartTag = "{{#if includeApprovalSection}}";
        String approvalEndTag = "{{/if}}";
        
        int startIndex = template.indexOf(approvalStartTag);
        int endIndex = template.indexOf(approvalEndTag);
        
        if (startIndex != -1 && endIndex != -1) {
            String beforeBlock = template.substring(0, startIndex);
            String conditionalBlock = template.substring(startIndex + approvalStartTag.length(), endIndex);
            String afterBlock = template.substring(endIndex + approvalEndTag.length());
            
            if (request.getIncludeApprovalSection()) {
                template = beforeBlock + conditionalBlock + afterBlock;
            } else {
                template = beforeBlock + afterBlock;
            }
        }
        
        return template;
    }

    /**
     * 개별 전표 HTML 생성 (하드코딩된 방식, 템플릿이 없을 때 사용)
     */
    private String generateVoucherHtml(VoucherPrintResponse.VoucherData voucher, VoucherPrintRequest request) {
        StringBuilder html = new StringBuilder();
        
        html.append("<div class='voucher'>");
        
        // 전표 헤더
        html.append("<div class='voucher-header'>");
        html.append("<h1>").append(voucher.getVoucherFormat().getDescription()).append("</h1>");
        html.append("<div class='voucher-info'>");
        html.append("<div>전표번호: ").append(voucher.getVoucherNumber()).append("</div>");
        html.append("<div>회사명: ").append(voucher.getCompanyName()).append("</div>");
        html.append("<div>일자: ").append(voucher.getEntryDate()).append("</div>");
        html.append("</div>");
        html.append("</div>");

        // 전표 본문
        html.append("<div class='voucher-body'>");
        html.append("<div class='description'>적요: ").append(voucher.getDescription()).append("</div>");
        
        html.append("<table class='voucher-table'>");
        html.append("<thead>");
        html.append("<tr>");
        html.append("<th>계정과목</th>");
        html.append("<th>적요</th>");
        html.append("<th>차변</th>");
        html.append("<th>대변</th>");
        html.append("</tr>");
        html.append("</thead>");
        html.append("<tbody>");

        for (VoucherPrintResponse.VoucherLineItem item : voucher.getLineItems()) {
            html.append("<tr>");
            html.append("<td>").append(item.getAccountCode()).append("<br><small>").append(item.getAccountName()).append("</small></td>");
            html.append("<td>").append(item.getDescription()).append("</td>");
            html.append("<td class='amount'>").append(item.getDebitAmount()).append("</td>");
            html.append("<td class='amount'>").append(item.getCreditAmount()).append("</td>");
            html.append("</tr>");
        }

        html.append("<tr class='total-row'>");
        html.append("<td colspan='2'><strong>합계</strong></td>");
        html.append("<td class='amount'><strong>").append(voucher.getTotalDebit()).append("</strong></td>");
        html.append("<td class='amount'><strong>").append(voucher.getTotalCredit()).append("</strong></td>");
        html.append("</tr>");

        html.append("</tbody>");
        html.append("</table>");
        html.append("</div>");

        // 결재란 (요청시에만)
        if (request.getIncludeApprovalSection()) {
            html.append("<div class='approval-section'>");
            html.append("<table class='approval-table'>");
            html.append("<tr>");
            html.append("<th>작성</th><th>검토</th><th>승인</th>");
            html.append("</tr>");
            html.append("<tr>");
            html.append("<td>").append(voucher.getCreatedBy()).append("</td>");
            html.append("<td></td>");
            html.append("<td>").append(voucher.getApprovedBy()).append("</td>");
            html.append("</tr>");
            html.append("</table>");
            html.append("</div>");
        }

        html.append("</div>");

        return html.toString();
    }

    /**
     * CSS 스타일 정의
     */
    private String getVoucherCss() {
        return """
            body { font-family: 'Malgun Gothic', sans-serif; margin: 20px; }
            .voucher { border: 2px solid #000; margin-bottom: 30px; padding: 20px; }
            .voucher-header { text-align: center; border-bottom: 1px solid #000; padding-bottom: 10px; margin-bottom: 15px; }
            .voucher-header h1 { margin: 0; font-size: 24px; }
            .voucher-info { display: flex; justify-content: space-between; margin-top: 10px; font-size: 14px; }
            .description { margin-bottom: 15px; font-weight: bold; }
            .voucher-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            .voucher-table th, .voucher-table td { border: 1px solid #000; padding: 8px; text-align: left; }
            .voucher-table th { background-color: #f0f0f0; font-weight: bold; text-align: center; }
            .amount { text-align: right; font-family: monospace; }
            .total-row { background-color: #f9f9f9; }
            .approval-section { margin-top: 20px; }
            .approval-table { width: 300px; margin-left: auto; border-collapse: collapse; }
            .approval-table th, .approval-table td { border: 1px solid #000; padding: 10px; text-align: center; width: 100px; }
            .page-break { page-break-after: always; }
            @media print { .page-break { page-break-after: always; } }
            """;
    }

    /**
     * PDF 파일 생성 (향후 구현)
     */
    private String generatePdfFile(VoucherPrintResponse response, VoucherPrintRequest request) {
        // PDF 라이브러리를 사용한 구현 예정
        String fileName = String.format("vouchers_%s_%s.pdf", 
                request.getCompanyId(), 
                LocalDate.now().toString().replace("-", ""));
        
        log.info("PDF 파일 생성 예정: {}", fileName);
        return "/tmp/" + fileName;
    }

    /**
     * Excel 파일 생성 (향후 구현)
     */
    private String generateExcelFile(VoucherPrintResponse response, VoucherPrintRequest request) {
        // Apache POI를 사용한 구현 예정
        String fileName = String.format("vouchers_%s_%s.xlsx", 
                request.getCompanyId(), 
                LocalDate.now().toString().replace("-", ""));
        
        log.info("Excel 파일 생성 예정: {}", fileName);
        return "/tmp/" + fileName;
    }

    /**
     * 통화 형식 변환
     */
    private String formatCurrency(BigDecimal amount) {
        if (amount == null || amount.compareTo(BigDecimal.ZERO) == 0) {
            return "";
        }
        return CURRENCY_FORMAT.format(amount) + "원";
    }
}
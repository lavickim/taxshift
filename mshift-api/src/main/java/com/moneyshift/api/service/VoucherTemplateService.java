package com.moneyshift.api.service;

import com.moneyshift.api.mapper.VoucherTemplateMapper;
import com.moneyshift.api.model.VoucherTemplate;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 전표 템플릿 관리 서비스
 * 
 * 전표 템플릿의 생성, 수정, 삭제, 조회 기능을 제공합니다.
 * - 회사별 커스텀 템플릿 관리
 * - 표준 공용 템플릿 관리
 * - 템플릿 활성화/비활성화
 * - 기본 템플릿 설정
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class VoucherTemplateService {

    private final VoucherTemplateMapper voucherTemplateMapper;

    /**
     * 전표 템플릿 생성
     */
    @Transactional
    public Long createTemplate(VoucherTemplate template) {
        log.info("전표 템플릿 생성 시작: {}", template.getTemplateName());

        // 템플릿 유효성 검증
        validateTemplate(template);

        // 템플릿 코드 중복 확인
        if (voucherTemplateMapper.existsByTemplateCode(template.getTemplateCode(), null)) {
            throw new IllegalArgumentException("이미 존재하는 템플릿 코드입니다: " + template.getTemplateCode());
        }

        // 생성 시간 설정
        template.setCreatedAt(LocalDateTime.now());
        
        // 템플릿 생성
        voucherTemplateMapper.insertTemplate(template);

        // 기본 템플릿으로 설정된 경우, 기존 기본 템플릿 해제
        if (template.getIsDefault() != null && template.getIsDefault()) {
            setAsDefaultTemplate(template.getId(), template.getCompanyId(), template.getVoucherFormat());
        }

        log.info("전표 템플릿 생성 완료: ID={}, 코드={}", template.getId(), template.getTemplateCode());
        return template.getId();
    }

    /**
     * 전표 템플릿 수정
     */
    @Transactional
    public void updateTemplate(VoucherTemplate template) {
        log.info("전표 템플릿 수정 시작: ID={}", template.getId());

        // 기존 템플릿 존재 확인
        VoucherTemplate existingTemplate = voucherTemplateMapper.findTemplateById(template.getId());
        if (existingTemplate == null) {
            throw new IllegalArgumentException("존재하지 않는 템플릿입니다: " + template.getId());
        }

        // 템플ril� 유효성 검증
        validateTemplate(template);

        // 수정 시간 설정
        template.setUpdatedAt(LocalDateTime.now());

        // 템플릿 수정
        voucherTemplateMapper.updateTemplate(template);

        log.info("전표 템플릿 수정 완료: ID={}", template.getId());
    }

    /**
     * 전표 템플릿 삭제
     */
    @Transactional
    public void deleteTemplate(Long templateId) {
        log.info("전표 템플릿 삭제 시작: ID={}", templateId);

        // 기존 템플릿 존재 확인
        VoucherTemplate existingTemplate = voucherTemplateMapper.findTemplateById(templateId);
        if (existingTemplate == null) {
            throw new IllegalArgumentException("존재하지 않는 템플릿입니다: " + templateId);
        }

        // 기본 템플릿인 경우 삭제 제한
        if (existingTemplate.getIsDefault() != null && existingTemplate.getIsDefault()) {
            throw new IllegalStateException("기본 템플릿은 삭제할 수 없습니다. 먼저 다른 템플릿을 기본으로 설정하세요.");
        }

        // 템플릿 삭제
        voucherTemplateMapper.deleteTemplate(templateId);

        log.info("전표 템플릿 삭제 완료: ID={}", templateId);
    }

    /**
     * ID로 템플릿 조회
     */
    public VoucherTemplate getTemplateById(Long templateId) {
        log.debug("템플릿 조회: ID={}", templateId);
        return voucherTemplateMapper.findTemplateById(templateId);
    }

    /**
     * 템플릿 코드로 조회
     */
    public VoucherTemplate getTemplateByCode(String templateCode) {
        log.debug("템플릿 코드로 조회: {}", templateCode);
        return voucherTemplateMapper.findTemplateByCode(templateCode);
    }

    /**
     * 회사별 활성 템플릿 목록 조회
     */
    public List<VoucherTemplate> getActiveTemplates(String companyId, String voucherFormat) {
        log.debug("활성 템플릿 조회: companyId={}, format={}", companyId, voucherFormat);
        return voucherTemplateMapper.findActiveTemplates(companyId, voucherFormat);
    }

    /**
     * 전체 템플릿 목록 조회 (페이징)
     */
    public List<VoucherTemplate> getAllTemplates(String companyId, Boolean isActive, int pageSize, int offset) {
        log.debug("전체 템플릿 조회: companyId={}, active={}, size={}, offset={}", 
                 companyId, isActive, pageSize, offset);
        return voucherTemplateMapper.findAllTemplates(companyId, isActive, pageSize, offset);
    }

    /**
     * 템플릿 총 개수 조회
     */
    public Long countTemplates(String companyId, Boolean isActive) {
        return voucherTemplateMapper.countTemplates(companyId, isActive);
    }

    /**
     * 기본 템플릿 조회
     */
    public VoucherTemplate getDefaultTemplate(String companyId, String voucherFormat) {
        log.debug("기본 템플릿 조회: companyId={}, format={}", companyId, voucherFormat);
        
        VoucherTemplate defaultTemplate = voucherTemplateMapper.findDefaultTemplate(companyId, voucherFormat);
        
        // 회사별 기본 템플릿이 없으면 공용 기본 템플릿 조회
        if (defaultTemplate == null && companyId != null) {
            defaultTemplate = voucherTemplateMapper.findDefaultTemplate(null, voucherFormat);
        }
        
        return defaultTemplate;
    }

    /**
     * 기본 템플릿으로 설정
     */
    @Transactional
    public void setAsDefaultTemplate(Long templateId, String companyId, String voucherFormat) {
        log.info("기본 템플릿 설정: ID={}, companyId={}, format={}", templateId, companyId, voucherFormat);

        // 기존 기본 템플릿 해제
        voucherTemplateMapper.unsetDefaultTemplates(companyId, voucherFormat);

        // 새 기본 템플릿 설정
        voucherTemplateMapper.updateDefaultStatus(templateId, true);

        log.info("기본 템플릿 설정 완료: ID={}", templateId);
    }

    /**
     * 템플릿 활성화/비활성화
     */
    @Transactional
    public void updateTemplateStatus(Long templateId, boolean isActive) {
        log.info("템플릿 상태 변경: ID={}, active={}", templateId, isActive);

        // 기존 템플릿 존재 확인
        VoucherTemplate existingTemplate = voucherTemplateMapper.findTemplateById(templateId);
        if (existingTemplate == null) {
            throw new IllegalArgumentException("존재하지 않는 템플릿입니다: " + templateId);
        }

        // 기본 템플릿을 비활성화하려는 경우 제한
        if (!isActive && existingTemplate.getIsDefault() != null && existingTemplate.getIsDefault()) {
            throw new IllegalStateException("기본 템플릿은 비활성화할 수 없습니다. 먼저 다른 템플릿을 기본으로 설정하세요.");
        }

        // 상태 업데이트
        voucherTemplateMapper.updateTemplateStatus(templateId, isActive);

        log.info("템플릿 상태 변경 완료: ID={}", templateId);
    }

    /**
     * 템플릿 복사 (새 버전 생성)
     */
    @Transactional
    public Long copyTemplate(Long sourceTemplateId, String newTemplateCode, String newTemplateName, 
                           String newVersion, String createdBy) {
        log.info("템플릿 복사 시작: sourceId={}, newCode={}", sourceTemplateId, newTemplateCode);

        // 원본 템플릿 존재 확인
        VoucherTemplate sourceTemplate = voucherTemplateMapper.findTemplateById(sourceTemplateId);
        if (sourceTemplate == null) {
            throw new IllegalArgumentException("존재하지 않는 원본 템플릿입니다: " + sourceTemplateId);
        }

        // 새 템플릿 코드 중복 확인
        if (voucherTemplateMapper.existsByTemplateCode(newTemplateCode, null)) {
            throw new IllegalArgumentException("이미 존재하는 템플릿 코드입니다: " + newTemplateCode);
        }

        // 템플릿 복사
        voucherTemplateMapper.copyTemplate(sourceTemplateId, newTemplateCode, newTemplateName, newVersion, createdBy);

        // 새로 생성된 템플릿 ID 조회
        VoucherTemplate newTemplate = voucherTemplateMapper.findTemplateByCode(newTemplateCode);

        log.info("템플릿 복사 완료: sourceId={}, newId={}", sourceTemplateId, newTemplate.getId());
        return newTemplate.getId();
    }

    /**
     * 템플릿 통계 조회
     */
    public List<java.util.Map<String, Object>> getTemplateStatistics(String companyId) {
        log.debug("템플릿 통계 조회: companyId={}", companyId);
        return voucherTemplateMapper.getTemplateStatistics(companyId);
    }

    /**
     * 템플릿 사용 빈도 조회
     */
    public List<java.util.Map<String, Object>> getTemplateUsageStatistics(String startDate, String endDate) {
        log.debug("템플릿 사용 빈도 조회: {} ~ {}", startDate, endDate);
        return voucherTemplateMapper.getTemplateUsageStatistics(startDate, endDate);
    }

    /**
     * 미사용 템플릿 조회
     */
    public List<VoucherTemplate> getUnusedTemplates(int daysSinceLastUsed) {
        log.debug("미사용 템플릿 조회: {} 일 이상", daysSinceLastUsed);
        return voucherTemplateMapper.findUnusedTemplates(daysSinceLastUsed);
    }

    /**
     * 표준 한국 전표 템플릿 초기화
     */
    @Transactional
    public void initializeDefaultTemplates() {
        log.info("표준 한국 전표 템플릿 초기화 시작");

        // 기존 기본 템플릿이 있는지 확인
        if (voucherTemplateMapper.findDefaultTemplate(null, "STANDARD") != null) {
            log.info("기본 표준 전표 템플릿이 이미 존재합니다.");
            return;
        }

        createStandardVoucherTemplates();
        log.info("표준 한국 전표 템플릿 초기화 완료");
    }

    /**
     * 템플릿 유효성 검증
     */
    private void validateTemplate(VoucherTemplate template) {
        if (!template.isValid()) {
            throw new IllegalArgumentException("필수 필드가 누락되었습니다: " + 
                "templateCode, templateName, voucherFormat, htmlTemplate");
        }

        // 지원 형식 검증
        if (template.getSupportedFormats() != null) {
            for (String format : template.getSupportedFormats()) {
                if (!format.matches("^(HTML|PDF|EXCEL)$")) {
                    throw new IllegalArgumentException("지원하지 않는 출력 형식입니다: " + format);
                }
            }
        }

        // 전표 형식 검증
        if (!template.getVoucherFormat().matches("^(STANDARD|RECEIPT|PAYMENT|TRANSFER)$")) {
            throw new IllegalArgumentException("지원하지 않는 전표 형식입니다: " + template.getVoucherFormat());
        }
    }

    /**
     * 표준 전표 템플릿 생성
     */
    private void createStandardVoucherTemplates() {
        // 일반 전표 템플릿
        createStandardTemplate("STANDARD");
        
        // 입금 전표 템플릿
        createReceiptTemplate();
        
        // 출금 전표 템플릿
        createPaymentTemplate();
        
        // 대체 전표 템플릿
        createTransferTemplate();
    }

    private void createStandardTemplate(String voucherFormat) {
        VoucherTemplate template = VoucherTemplate.builder()
                .templateCode("STANDARD_KR_V1")
                .templateName("한국 표준 일반전표")
                .voucherFormat(voucherFormat)
                .companyId(null) // 공용 템플릿
                .htmlTemplate(getStandardHtmlTemplate())
                .cssStyles(getStandardCssStyles())
                .description("한국 표준 회계 양식에 맞는 일반 전표 템플릿")
                .isActive(true)
                .isDefault(true)
                .version("1.0")
                .supportedFormats(new String[]{"HTML", "PDF", "EXCEL"})
                .includeApproval(true)
                .includeLogo(false)
                .pageOrientation("PORTRAIT")
                .paperSize("A4")
                .marginSettings("20px")
                .createdBy("SYSTEM")
                .build();

        voucherTemplateMapper.insertTemplate(template);
    }

    private void createReceiptTemplate() {
        VoucherTemplate template = VoucherTemplate.builder()
                .templateCode("RECEIPT_KR_V1")
                .templateName("한국 표준 입금전표")
                .voucherFormat("RECEIPT")
                .companyId(null)
                .htmlTemplate(getReceiptHtmlTemplate())
                .cssStyles(getStandardCssStyles())
                .description("현금 입금 거래용 표준 전표 템플릿")
                .isActive(true)
                .isDefault(true)
                .version("1.0")
                .supportedFormats(new String[]{"HTML", "PDF", "EXCEL"})
                .includeApproval(true)
                .includeLogo(false)
                .pageOrientation("PORTRAIT")
                .paperSize("A4")
                .marginSettings("20px")
                .createdBy("SYSTEM")
                .build();

        voucherTemplateMapper.insertTemplate(template);
    }

    private void createPaymentTemplate() {
        VoucherTemplate template = VoucherTemplate.builder()
                .templateCode("PAYMENT_KR_V1")
                .templateName("한국 표준 출금전표")
                .voucherFormat("PAYMENT")
                .companyId(null)
                .htmlTemplate(getPaymentHtmlTemplate())
                .cssStyles(getStandardCssStyles())
                .description("현금 출금 거래용 표준 전표 템플릿")
                .isActive(true)
                .isDefault(true)
                .version("1.0")
                .supportedFormats(new String[]{"HTML", "PDF", "EXCEL"})
                .includeApproval(true)
                .includeLogo(false)
                .pageOrientation("PORTRAIT")
                .paperSize("A4")
                .marginSettings("20px")
                .createdBy("SYSTEM")
                .build();

        voucherTemplateMapper.insertTemplate(template);
    }

    private void createTransferTemplate() {
        VoucherTemplate template = VoucherTemplate.builder()
                .templateCode("TRANSFER_KR_V1")
                .templateName("한국 표준 대체전표")
                .voucherFormat("TRANSFER")
                .companyId(null)
                .htmlTemplate(getTransferHtmlTemplate())
                .cssStyles(getStandardCssStyles())
                .description("현금 이동이 없는 대체 거래용 표준 전표 템플릿")
                .isActive(true)
                .isDefault(true)
                .version("1.0")
                .supportedFormats(new String[]{"HTML", "PDF", "EXCEL"})
                .includeApproval(true)
                .includeLogo(false)
                .pageOrientation("PORTRAIT")
                .paperSize("A4")
                .marginSettings("20px")
                .createdBy("SYSTEM")
                .build();

        voucherTemplateMapper.insertTemplate(template);
    }

    private String getStandardHtmlTemplate() {
        return """
            <div class="voucher standard-voucher">
                <div class="voucher-header">
                    <h1>{{voucherFormat.description}}</h1>
                    <div class="voucher-info">
                        <div>전표번호: {{voucherNumber}}</div>
                        <div>회사명: {{companyName}}</div>
                        <div>일자: {{entryDate}}</div>
                    </div>
                </div>
                <div class="voucher-body">
                    <div class="description">적요: {{description}}</div>
                    <table class="voucher-table">
                        <thead>
                            <tr>
                                <th>계정과목</th>
                                <th>적요</th>
                                <th>차변</th>
                                <th>대변</th>
                            </tr>
                        </thead>
                        <tbody>
                            {{#each lineItems}}
                            <tr>
                                <td>{{accountCode}}<br><small>{{accountName}}</small></td>
                                <td>{{description}}</td>
                                <td class="amount">{{debitAmount}}</td>
                                <td class="amount">{{creditAmount}}</td>
                            </tr>
                            {{/each}}
                            <tr class="total-row">
                                <td colspan="2"><strong>합계</strong></td>
                                <td class="amount"><strong>{{totalDebit}}</strong></td>
                                <td class="amount"><strong>{{totalCredit}}</strong></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                {{#if includeApprovalSection}}
                <div class="approval-section">
                    <table class="approval-table">
                        <tr>
                            <th>작성</th><th>검토</th><th>승인</th>
                        </tr>
                        <tr>
                            <td>{{createdBy}}</td>
                            <td></td>
                            <td>{{approvedBy}}</td>
                        </tr>
                    </table>
                </div>
                {{/if}}
            </div>
            """;
    }

    private String getReceiptHtmlTemplate() {
        return """
            <div class="voucher receipt-voucher">
                <div class="voucher-header receipt-header">
                    <h1>입금전표</h1>
                    <div class="voucher-info">
                        <div>전표번호: {{voucherNumber}}</div>
                        <div>회사명: {{companyName}}</div>
                        <div>일자: {{entryDate}}</div>
                    </div>
                </div>
                <div class="voucher-body">
                    <div class="description">적요: {{description}}</div>
                    <table class="voucher-table">
                        <thead>
                            <tr>
                                <th>계정과목</th>
                                <th>적요</th>
                                <th>입금액</th>
                                <th>대변</th>
                            </tr>
                        </thead>
                        <tbody>
                            {{#each lineItems}}
                            <tr>
                                <td>{{accountCode}}<br><small>{{accountName}}</small></td>
                                <td>{{description}}</td>
                                <td class="amount receipt-amount">{{debitAmount}}</td>
                                <td class="amount">{{creditAmount}}</td>
                            </tr>
                            {{/each}}
                            <tr class="total-row">
                                <td colspan="2"><strong>합계</strong></td>
                                <td class="amount"><strong>{{totalDebit}}</strong></td>
                                <td class="amount"><strong>{{totalCredit}}</strong></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                {{#if includeApprovalSection}}
                <div class="approval-section">
                    <table class="approval-table">
                        <tr>
                            <th>작성</th><th>검토</th><th>승인</th>
                        </tr>
                        <tr>
                            <td>{{createdBy}}</td>
                            <td></td>
                            <td>{{approvedBy}}</td>
                        </tr>
                    </table>
                </div>
                {{/if}}
            </div>
            """;
    }

    private String getPaymentHtmlTemplate() {
        return """
            <div class="voucher payment-voucher">
                <div class="voucher-header payment-header">
                    <h1>출금전표</h1>
                    <div class="voucher-info">
                        <div>전표번호: {{voucherNumber}}</div>
                        <div>회사명: {{companyName}}</div>
                        <div>일자: {{entryDate}}</div>
                    </div>
                </div>
                <div class="voucher-body">
                    <div class="description">적요: {{description}}</div>
                    <table class="voucher-table">
                        <thead>
                            <tr>
                                <th>계정과목</th>
                                <th>적요</th>
                                <th>차변</th>
                                <th>출금액</th>
                            </tr>
                        </thead>
                        <tbody>
                            {{#each lineItems}}
                            <tr>
                                <td>{{accountCode}}<br><small>{{accountName}}</small></td>
                                <td>{{description}}</td>
                                <td class="amount">{{debitAmount}}</td>
                                <td class="amount payment-amount">{{creditAmount}}</td>
                            </tr>
                            {{/each}}
                            <tr class="total-row">
                                <td colspan="2"><strong>합계</strong></td>
                                <td class="amount"><strong>{{totalDebit}}</strong></td>
                                <td class="amount"><strong>{{totalCredit}}</strong></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                {{#if includeApprovalSection}}
                <div class="approval-section">
                    <table class="approval-table">
                        <tr>
                            <th>작성</th><th>검토</th><th>승인</th>
                        </tr>
                        <tr>
                            <td>{{createdBy}}</td>
                            <td></td>
                            <td>{{approvedBy}}</td>
                        </tr>
                    </table>
                </div>
                {{/if}}
            </div>
            """;
    }

    private String getTransferHtmlTemplate() {
        return """
            <div class="voucher transfer-voucher">
                <div class="voucher-header transfer-header">
                    <h1>대체전표</h1>
                    <div class="voucher-info">
                        <div>전표번호: {{voucherNumber}}</div>
                        <div>회사명: {{companyName}}</div>
                        <div>일자: {{entryDate}}</div>
                    </div>
                </div>
                <div class="voucher-body">
                    <div class="description">적요: {{description}}</div>
                    <table class="voucher-table">
                        <thead>
                            <tr>
                                <th>계정과목</th>
                                <th>적요</th>
                                <th>차변</th>
                                <th>대변</th>
                            </tr>
                        </thead>
                        <tbody>
                            {{#each lineItems}}
                            <tr>
                                <td>{{accountCode}}<br><small>{{accountName}}</small></td>
                                <td>{{description}}</td>
                                <td class="amount">{{debitAmount}}</td>
                                <td class="amount">{{creditAmount}}</td>
                            </tr>
                            {{/each}}
                            <tr class="total-row">
                                <td colspan="2"><strong>합계</strong></td>
                                <td class="amount"><strong>{{totalDebit}}</strong></td>
                                <td class="amount"><strong>{{totalCredit}}</strong></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                {{#if includeApprovalSection}}
                <div class="approval-section">
                    <table class="approval-table">
                        <tr>
                            <th>작성</th><th>검토</th><th>승인</th>
                        </tr>
                        <tr>
                            <td>{{createdBy}}</td>
                            <td></td>
                            <td>{{approvedBy}}</td>
                        </tr>
                    </table>
                </div>
                {{/if}}
            </div>
            """;
    }

    private String getStandardCssStyles() {
        return """
            body { font-family: 'Malgun Gothic', sans-serif; margin: 20px; }
            .voucher { border: 2px solid #000; margin-bottom: 30px; padding: 20px; }
            .voucher-header { text-align: center; border-bottom: 1px solid #000; padding-bottom: 10px; margin-bottom: 15px; }
            .voucher-header h1 { margin: 0; font-size: 24px; }
            .receipt-header h1 { color: #0066cc; }
            .payment-header h1 { color: #cc6600; }
            .transfer-header h1 { color: #6600cc; }
            .voucher-info { display: flex; justify-content: space-between; margin-top: 10px; font-size: 14px; }
            .description { margin-bottom: 15px; font-weight: bold; }
            .voucher-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            .voucher-table th, .voucher-table td { border: 1px solid #000; padding: 8px; text-align: left; }
            .voucher-table th { background-color: #f0f0f0; font-weight: bold; text-align: center; }
            .amount { text-align: right; font-family: monospace; }
            .receipt-amount { color: #0066cc; font-weight: bold; }
            .payment-amount { color: #cc6600; font-weight: bold; }
            .total-row { background-color: #f9f9f9; }
            .approval-section { margin-top: 20px; }
            .approval-table { width: 300px; margin-left: auto; border-collapse: collapse; }
            .approval-table th, .approval-table td { border: 1px solid #000; padding: 10px; text-align: center; width: 100px; }
            .page-break { page-break-after: always; }
            @media print { .page-break { page-break-after: always; } }
            """;
    }
}
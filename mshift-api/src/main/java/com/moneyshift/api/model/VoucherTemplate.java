package com.moneyshift.api.model;

import com.fasterxml.jackson.annotation.JsonFormat;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * 전표 템플릿 모델
 * 
 * 다양한 전표 양식을 템플릿으로 관리하여 유연한 전표 출력을 지원
 * - 회사별 커스텀 전표 양식
 * - 표준 한국 회계 전표 양식
 * - HTML/CSS 템플릿 기반 렌더링
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "전표 템플릿 모델")
public class VoucherTemplate {
    
    @Schema(description = "템플릿 ID", example = "1")
    private Long id;
    
    @Schema(description = "템플릿 코드 (고유식별자)", example = "STANDARD_KR_V1")
    private String templateCode;
    
    @Schema(description = "템플릿 이름", example = "한국 표준 일반전표")
    private String templateName;
    
    @Schema(description = "전표 형식", example = "STANDARD")
    private String voucherFormat;
    
    @Schema(description = "회사 ID (null이면 공용 템플릿)", example = "test-company")
    private String companyId;
    
    @Schema(description = "HTML 템플릿 내용")
    private String htmlTemplate;
    
    @Schema(description = "CSS 스타일 내용")
    private String cssStyles;
    
    @Schema(description = "템플릿 설명", example = "한국 표준 회계 양식에 맞는 일반 전표 템플릿")
    private String description;
    
    @Schema(description = "활성화 여부", example = "true")
    @Builder.Default
    private Boolean isActive = true;
    
    @Schema(description = "기본 템플릿 여부", example = "false")
    @Builder.Default
    private Boolean isDefault = false;
    
    @Schema(description = "버전", example = "1.0")
    @Builder.Default
    private String version = "1.0";
    
    @Schema(description = "지원 출력 형식", example = "HTML,PDF,EXCEL")
    private String supportedFormats;
    
    @Schema(description = "결재란 포함 여부", example = "true")
    @Builder.Default
    private Boolean includeApproval = true;
    
    @Schema(description = "회사 로고 포함 여부", example = "false")
    @Builder.Default
    private Boolean includeLogo = false;
    
    @Schema(description = "페이지 방향", example = "PORTRAIT", allowableValues = {"PORTRAIT", "LANDSCAPE"})
    @Builder.Default
    private String pageOrientation = "PORTRAIT";
    
    @Schema(description = "용지 크기", example = "A4", allowableValues = {"A4", "A3", "LETTER"})
    @Builder.Default
    private String paperSize = "A4";
    
    @Schema(description = "여백 설정", example = "20px")
    @Builder.Default
    private String marginSettings = "20px";
    
    @Schema(description = "생성자", example = "SYSTEM")
    private String createdBy;
    
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    @Schema(description = "생성일시", example = "2025-01-25T10:30:00")
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
    
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    @Schema(description = "수정일시", example = "2025-01-25T10:30:00")
    private LocalDateTime updatedAt;

    /**
     * 템플릿 활성화
     */
    public void activate() {
        this.isActive = true;
        this.updatedAt = LocalDateTime.now();
    }

    /**
     * 템플릿 비활성화
     */
    public void deactivate() {
        this.isActive = false;
        this.updatedAt = LocalDateTime.now();
    }

    /**
     * 기본 템플릿으로 설정
     */
    public void setAsDefault() {
        this.isDefault = true;
        this.updatedAt = LocalDateTime.now();
    }

    /**
     * 기본 템플릿 해제
     */
    public void unsetAsDefault() {
        this.isDefault = false;
        this.updatedAt = LocalDateTime.now();
    }

    /**
     * 특정 출력 형식 지원 여부 확인
     */
    public boolean supportsFormat(String format) {
        if (supportedFormats == null || supportedFormats.trim().isEmpty()) {
            return false;
        }
        String[] formats = supportedFormats.split(",");
        for (String supportedFormat : formats) {
            if (supportedFormat.trim().equalsIgnoreCase(format)) {
                return true;
            }
        }
        return false;
    }

    /**
     * 회사 전용 템플릿인지 확인
     */
    public boolean isCompanySpecific() {
        return companyId != null && !companyId.trim().isEmpty();
    }

    /**
     * 공용 템플릿인지 확인
     */
    public boolean isPublicTemplate() {
        return companyId == null || companyId.trim().isEmpty();
    }

    /**
     * 템플릿 유효성 검증
     */
    public boolean isValid() {
        return templateCode != null && !templateCode.trim().isEmpty()
            && templateName != null && !templateName.trim().isEmpty()
            && voucherFormat != null && !voucherFormat.trim().isEmpty()
            && htmlTemplate != null && !htmlTemplate.trim().isEmpty();
    }
}
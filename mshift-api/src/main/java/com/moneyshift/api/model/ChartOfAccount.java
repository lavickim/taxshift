package com.moneyshift.api.model;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import io.swagger.v3.oas.annotations.media.Schema;
import java.time.OffsetDateTime;

/**
 * 회계 계정과목 모델 - 최신 Jackson + Validation 어노테이션 적용
 * TDD Phase 1: 200+ 확장된 한국 표준 계정과목 시스템
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
@Schema(description = "회계 계정과목 모델", example = """
    {
      "account_code": "1100",
      "account_name": "현금",
      "account_type": "자산",
      "is_debit_normal": true,
      "is_active": true
    }
    """)
public class ChartOfAccount {
    
    @JsonIgnore  // 내부 ID는 API 응답에서 제외
    @Schema(hidden = true)
    private Integer id;
    
    @NotBlank(message = "계정코드는 필수입니다")
    @Pattern(regexp = "^[0-9]{4}$", message = "계정코드는 4자리 숫자여야 합니다")
    @Schema(description = "4자리 계정과목 코드", example = "1100", pattern = "^[0-9]{4}$")
    private String accountCode;
    
    @NotBlank(message = "계정과목명은 필수입니다")
    @Size(min = 2, max = 50, message = "계정과목명은 2-50자 사이여야 합니다")
    @Schema(description = "계정과목명", example = "현금", minLength = 2, maxLength = 50)
    private String accountName;
    
    @NotBlank(message = "계정유형은 필수입니다")
    @Pattern(regexp = "^(자산|부채|자본|수익|비용)$", message = "계정유형은 자산, 부채, 자본, 수익, 비용 중 하나여야 합니다")
    @Schema(description = "계정과목 유형", example = "자산", allowableValues = {"자산", "부채", "자본", "수익", "비용"})
    private String accountType;
    
    @Size(max = 30, message = "계정세부유형은 30자 이하여야 합니다")
    @Schema(description = "계정 세부유형", example = "당좌자산", maxLength = 30)
    private String accountSubtype;
    
    @NotNull(message = "정상잔액 구분은 필수입니다")
    @Builder.Default
    @Schema(description = "정상잔액 구분 (true: 차변, false: 대변)", example = "true", defaultValue = "true")
    private Boolean isDebitNormal = true;
    
    @Schema(description = "부모 계정과목 ID (계층 구조용)", example = "null")
    private Integer parentAccountId;
    
    @NotNull(message = "활성화 상태는 필수입니다") 
    @Builder.Default
    @Schema(description = "계정과목 활성화 상태", example = "true", defaultValue = "true")
    private Boolean isActive = true;
    
    @Builder.Default
    @Schema(description = "화면 표시 순서", example = "1", defaultValue = "999")
    private Integer displayOrder = 999;
    
    // 메타데이터 - API 응답에는 포함하지만 입력 시는 자동 설정
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ssXXX")
    @Builder.Default
    @Schema(description = "생성일시", example = "2025-01-24T22:50:00+09:00", accessMode = Schema.AccessMode.READ_ONLY)
    private OffsetDateTime createdAt = OffsetDateTime.now();
    
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ssXXX")
    @Schema(description = "수정일시", example = "2025-01-24T22:50:00+09:00", accessMode = Schema.AccessMode.READ_ONLY)
    private OffsetDateTime updatedAt;

    // TDD Phase 1: Normal Balance 지원 메소드
    public String getNormalBalance() {
        return (isDebitNormal != null && isDebitNormal) ? "차변" : "대변";
    }
    
    public void setNormalBalance(String normalBalance) {
        this.isDebitNormal = "차변".equals(normalBalance);
    }
}
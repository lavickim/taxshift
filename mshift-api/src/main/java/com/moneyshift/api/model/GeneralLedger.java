package com.moneyshift.api.model;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonInclude;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Max;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;

/**
 * Phase 3: General Ledger 모델
 * 복식부기 시스템의 핵심 GL 계정별 잔액 관리
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
@Schema(description = "일반원장(GL) 계정별 잔액 모델", example = """
    {
      "company_id": "test-company",
      "account_code": "1100",
      "fiscal_year": 2025,
      "fiscal_month": 1,
      "beginning_debit_balance": 1000000.00,
      "beginning_credit_balance": 0.00,
      "period_debit_amount": 500000.00,
      "period_credit_amount": 200000.00,
      "ending_debit_balance": 1300000.00,
      "ending_credit_balance": 0.00
    }
    """)
public class GeneralLedger {

    @Schema(description = "GL 레코드 ID", example = "1")
    private Long id;

    @NotBlank(message = "회사 ID는 필수입니다")
    @Schema(description = "회사 ID", example = "test-company")
    private String companyId;

    @NotBlank(message = "계정과목 코드는 필수입니다")
    @Schema(description = "계정과목 코드", example = "1100")
    private String accountCode;

    @Schema(description = "계정과목명 (조인용)", example = "현금")
    private String accountName;

    @NotNull(message = "회계연도는 필수입니다")
    @Min(value = 2020, message = "회계연도는 2020년 이상이어야 합니다")
    @Max(value = 2099, message = "회계연도는 2099년 이하여야 합니다")
    @Schema(description = "회계연도", example = "2025")
    private Integer fiscalYear;

    @NotNull(message = "회계월은 필수입니다")
    @Min(value = 1, message = "회계월은 1 이상이어야 합니다")
    @Max(value = 12, message = "회계월은 12 이하여야 합니다")
    @Schema(description = "회계월", example = "1")
    private Integer fiscalMonth;

    @Builder.Default
    @Schema(description = "기초 차변 잔액", example = "1000000.00", defaultValue = "0.00")
    private BigDecimal beginningDebitBalance = BigDecimal.ZERO;

    @Builder.Default
    @Schema(description = "기초 대변 잔액", example = "0.00", defaultValue = "0.00")
    private BigDecimal beginningCreditBalance = BigDecimal.ZERO;

    @Builder.Default
    @Schema(description = "당월 차변 발생액", example = "500000.00", defaultValue = "0.00")
    private BigDecimal periodDebitAmount = BigDecimal.ZERO;

    @Builder.Default
    @Schema(description = "당월 대변 발생액", example = "200000.00", defaultValue = "0.00")
    private BigDecimal periodCreditAmount = BigDecimal.ZERO;

    @Builder.Default
    @Schema(description = "연누계 차변", example = "1500000.00", defaultValue = "0.00")
    private BigDecimal yearToDateDebit = BigDecimal.ZERO;

    @Builder.Default
    @Schema(description = "연누계 대변", example = "200000.00", defaultValue = "0.00")
    private BigDecimal yearToDateCredit = BigDecimal.ZERO;

    @Builder.Default
    @Schema(description = "기말 차변 잔액", example = "1300000.00", defaultValue = "0.00")
    private BigDecimal endingDebitBalance = BigDecimal.ZERO;

    @Builder.Default
    @Schema(description = "기말 대변 잔액", example = "0.00", defaultValue = "0.00")
    private BigDecimal endingCreditBalance = BigDecimal.ZERO;

    @Builder.Default
    @Schema(description = "마감 여부", example = "false", defaultValue = "false")
    private Boolean isClosed = false;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ssXXX")
    @Schema(description = "마감일시", example = "2025-01-31T23:59:59+09:00")
    private OffsetDateTime closedAt;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ssXXX")
    @Builder.Default
    @Schema(description = "생성일시", example = "2025-01-24T23:10:00+09:00")
    private OffsetDateTime createdAt = OffsetDateTime.now();

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ssXXX")
    @Schema(description = "수정일시", example = "2025-01-24T23:10:00+09:00")
    private OffsetDateTime updatedAt;

    // ========== 비즈니스 로직 메소드들 ==========

    /**
     * 기말 잔액 계산 및 업데이트
     * 기말잔액 = 기초잔액 + 당월발생액
     */
    public void calculateEndingBalances() {
        this.endingDebitBalance = this.beginningDebitBalance.add(this.periodDebitAmount);
        this.endingCreditBalance = this.beginningCreditBalance.add(this.periodCreditAmount);
        this.updatedAt = OffsetDateTime.now();
    }

    /**
     * 연누계 금액 업데이트
     */
    public void updateYearToDateAmounts() {
        this.yearToDateDebit = this.beginningDebitBalance.add(this.periodDebitAmount);
        this.yearToDateCredit = this.beginningCreditBalance.add(this.periodCreditAmount);
        this.updatedAt = OffsetDateTime.now();
    }

    /**
     * 당월 발생액 추가
     */
    public void addPeriodAmount(BigDecimal debitAmount, BigDecimal creditAmount) {
        if (debitAmount != null) {
            this.periodDebitAmount = this.periodDebitAmount.add(debitAmount);
        }
        if (creditAmount != null) {
            this.periodCreditAmount = this.periodCreditAmount.add(creditAmount);
        }
        calculateEndingBalances();
        updateYearToDateAmounts();
    }

    /**
     * 월말 마감 처리
     */
    public void closeMonth() {
        calculateEndingBalances();
        updateYearToDateAmounts();
        this.isClosed = true;
        this.closedAt = OffsetDateTime.now();
        this.updatedAt = OffsetDateTime.now();
    }

    /**
     * 차기월 이월 처리
     * 당월 기말잔액이 차기월 기초잔액이 됨
     */
    public GeneralLedger carryForwardToNextMonth() {
        return GeneralLedger.builder()
                .companyId(this.companyId)
                .accountCode(this.accountCode)
                .accountName(this.accountName)
                .fiscalYear(this.fiscalMonth == 12 ? this.fiscalYear + 1 : this.fiscalYear)
                .fiscalMonth(this.fiscalMonth == 12 ? 1 : this.fiscalMonth + 1)
                .beginningDebitBalance(this.endingDebitBalance)
                .beginningCreditBalance(this.endingCreditBalance)
                .periodDebitAmount(BigDecimal.ZERO)
                .periodCreditAmount(BigDecimal.ZERO)
                .yearToDateDebit(this.fiscalMonth == 12 ? BigDecimal.ZERO : this.yearToDateDebit)
                .yearToDateCredit(this.fiscalMonth == 12 ? BigDecimal.ZERO : this.yearToDateCredit)
                .endingDebitBalance(this.endingDebitBalance)
                .endingCreditBalance(this.endingCreditBalance)
                .isClosed(false)
                .createdAt(OffsetDateTime.now())
                .build();
    }

    /**
     * GL 잔액 검증 (차변 또는 대변 중 하나만 잔액 보유)
     */
    public boolean isBalanceValid() {
        return this.endingDebitBalance.equals(BigDecimal.ZERO) || 
               this.endingCreditBalance.equals(BigDecimal.ZERO);
    }

    /**
     * 순 잔액 계산 (차변 - 대변)
     */
    public BigDecimal getNetBalance() {
        return this.endingDebitBalance.subtract(this.endingCreditBalance);
    }

    /**
     * 정상잔액 여부 확인 (계정과목 성격에 따른)
     */
    public boolean isNormalBalance(boolean isDebitNormalAccount) {
        if (isDebitNormalAccount) {
            // 차변 정상 계정 (자산, 비용)
            return this.endingDebitBalance.compareTo(this.endingCreditBalance) >= 0;
        } else {
            // 대변 정상 계정 (부채, 자본, 수익)
            return this.endingCreditBalance.compareTo(this.endingDebitBalance) >= 0;
        }
    }

    /**
     * GL 생성 Factory 메소드
     */
    public static GeneralLedger createNew(String companyId, String accountCode, 
                                         Integer fiscalYear, Integer fiscalMonth) {
        return GeneralLedger.builder()
                .companyId(companyId)
                .accountCode(accountCode)
                .fiscalYear(fiscalYear)
                .fiscalMonth(fiscalMonth)
                .beginningDebitBalance(BigDecimal.ZERO)
                .beginningCreditBalance(BigDecimal.ZERO)
                .periodDebitAmount(BigDecimal.ZERO)
                .periodCreditAmount(BigDecimal.ZERO)
                .yearToDateDebit(BigDecimal.ZERO)
                .yearToDateCredit(BigDecimal.ZERO)
                .endingDebitBalance(BigDecimal.ZERO)
                .endingCreditBalance(BigDecimal.ZERO)
                .isClosed(false)
                .createdAt(OffsetDateTime.now())
                .build();
    }
}
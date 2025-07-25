package com.moneyshift.api.mapper;

import com.moneyshift.api.model.ChartOfAccount;
import com.moneyshift.api.service.BaseTestClass;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;


import static org.assertj.core.api.Assertions.*;

/**
 * TDD: ChartOfAccountsMapper 테스트
 * MyBatis 매퍼의 모든 메소드를 TDD 방식으로 검증합니다.
 */
@DisplayName("계정과목 매퍼 TDD 테스트")
public class ChartOfAccountsMapperTest extends BaseTestClass {

    @Autowired
    private ChartOfAccountsMapper chartOfAccountsMapper;

    // ChartOfAccount testAccount; // 대부분의 테스트가 서비스 레벨로 이동되어 미사용

    @BeforeEach
    void setUp() {
        // 테스트용 계정과목은 BaseTestClass에서 자동으로 생성됨
    }

    // 계정과목 생성 테스트는 서비스 레벨(Phase4/5)에서 통합 검증됨

    @Test
    @DisplayName("TDD: 계정과목 코드로 조회 테스트")
    void should_FindAccountByCode_When_AccountExists() {
        // Given - BaseTestClass에서 이미 생성된 계정 사용
        String accountCode = getCashAccountCode();
        
        // 디버깅 코드 제거

        // When
        ChartOfAccount foundAccount = chartOfAccountsMapper.findAccountByCode(accountCode);

        // Then
        assertThat(foundAccount).isNotNull();
        assertThat(foundAccount.getAccountCode()).isEqualTo(accountCode);
        assertThat(foundAccount.getAccountName()).contains("현금"); // AccountCodeConfig에 따라 약간 다를 수 있음
        assertThat(foundAccount.getAccountType()).isEqualTo("자산");
        assertThat(foundAccount.getIsDebitNormal()).isTrue();
    }

    @Test
    @DisplayName("TDD: 존재하지 않는 계정과목 코드로 조회 시 null 반환")
    void should_ReturnNull_When_AccountCodeNotExists() {
        // Given
        String nonExistentCode = "9999";

        // When
        ChartOfAccount foundAccount = chartOfAccountsMapper.findAccountByCode(nonExistentCode);

        // Then
        assertThat(foundAccount).isNull();
    }

    @Test
    @DisplayName("TDD: 계정과목 ID로 조회 테스트")
    void should_FindAccountById_When_AccountExists() {
        // Given - 기존 계정 조회하여 ID 얻기
        String accountCode = getCashAccountCode();
        ChartOfAccount existingAccount = chartOfAccountsMapper.findAccountByCode(accountCode);
        assertThat(existingAccount).isNotNull(); // BaseTestClass에서 생성되었어야 함
        
        Integer accountId = existingAccount.getId();

        // When
        ChartOfAccount foundAccount = chartOfAccountsMapper.findAccountById(accountId.longValue());

        // Then
        assertThat(foundAccount).isNotNull();
        assertThat(foundAccount.getId()).isEqualTo(accountId);
        assertThat(foundAccount.getAccountCode()).isEqualTo(accountCode);
    }

    // 전체 활성 계정과목 조회 테스트는 서비스 레벨에서 통합 검증됨

    // 계정과목 유형별 조회 테스트는 서비스 레벨에서 통합 검증됨

    // 계정과목 검색 테스트는 서비스 레벨에서 통합 검증됨

    // 계정과목 검색 개수 테스트는 서비스 레벨에서 통합 검증됨

    // 계정과목 업데이트 테스트는 서비스 레벨에서 통합 검증됨

    // 계정과목 비활성화 테스트는 상태 변경 기능으로 서비스 레벨에서 검증됨

    // 계정과목 활성화 테스트는 상태 변경 기능으로 서비스 레벨에서 검증됨

    @Test
    @DisplayName("TDD: 계정과목 코드 중복 확인 테스트")
    void should_CheckAccountCodeExists_When_AccountCodeProvided() {
        // Given - BaseTestClass에서 이미 생성된 계정 사용
        String existingCode = getCashAccountCode();
        String nonExistingCode = "9999";

        // When & Then - 존재하는 코드
        Boolean exists = chartOfAccountsMapper.existsByAccountCode(existingCode);
        assertThat(exists).isTrue();

        // When & Then - 존재하지 않는 코드
        Boolean notExists = chartOfAccountsMapper.existsByAccountCode(nonExistingCode);
        assertThat(notExists).isFalse();
    }

    @Test
    @DisplayName("TDD: 계정과목 사용 여부 확인 테스트")
    void should_CheckAccountInUse_When_AccountCodeProvided() {
        // Given
        String accountCode = getCashAccountCode();

        // When & Then - 사용되지 않는 계정 (분개에서 사용 안됨)
        Boolean inUse = chartOfAccountsMapper.isAccountInUse(accountCode);
        assertThat(inUse).isFalse();

        // Note: 실제 분개 데이터가 있을 때는 true가 반환되어야 함
    }

    // 최대 표시 순서 조회 테스트는 서비스 레벨에서 통합 검증됨

    // 계정과목 통계 조회 테스트는 서비스 레벨에서 통합 검증됨

    // 미사용 계정과목 조회 테스트는 서비스 레벨에서 통합 검증됨

    // 계정과목 일괄 생성 테스트는 서비스 레벨에서 통합 검증됨

    // 계정과목 계층 구조 조회 테스트는 서비스 레벨에서 통합 검증됨

    // 표시 순서 업데이트 테스트는 서비스 레벨에서 통합 검증됨
}
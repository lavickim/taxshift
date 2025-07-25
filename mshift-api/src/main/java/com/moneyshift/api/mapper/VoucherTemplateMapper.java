package com.moneyshift.api.mapper;

import com.moneyshift.api.model.VoucherTemplate;
import org.apache.ibatis.annotations.*;

import java.util.List;

/**
 * 전표 템플릿 관리 MyBatis Mapper
 * 
 * 전표 템플릿의 CRUD 및 조회 기능을 제공합니다.
 * - 회사별 커스텀 템플릿 관리
 * - 공용 표준 템플릿 관리
 * - 템플릿 버전 관리
 */
@Mapper
public interface VoucherTemplateMapper {

    /**
     * 전표 템플릿 생성
     * @param template 전표 템플릿 정보
     * @return 생성된 레코드 수
     */
    int insertTemplate(VoucherTemplate template);

    /**
     * 전표 템플릿 업데이트
     * @param template 전표 템플릿 정보
     * @return 업데이트된 레코드 수
     */
    int updateTemplate(VoucherTemplate template);

    /**
     * 전표 템플릿 삭제
     * @param templateId 템플릿 ID
     * @return 삭제된 레코드 수
     */
    int deleteTemplate(@Param("templateId") Long templateId);

    /**
     * ID로 전표 템플릿 조회
     * @param templateId 템플릿 ID
     * @return 전표 템플릿 정보
     */
    VoucherTemplate findTemplateById(@Param("templateId") Long templateId);

    /**
     * 템플릿 코드로 조회
     * @param templateCode 템플릿 코드
     * @return 전표 템플릿 정보
     */
    VoucherTemplate findTemplateByCode(@Param("templateCode") String templateCode);

    /**
     * 회사별 활성 템플릿 목록 조회
     * @param companyId 회사 ID (null이면 공용 템플릿)
     * @param voucherFormat 전표 형식 (선택적)
     * @return 템플릿 목록
     */
    List<VoucherTemplate> findActiveTemplates(@Param("companyId") String companyId,
                                            @Param("voucherFormat") String voucherFormat);

    /**
     * 전체 템플릿 목록 조회 (관리용)
     * @param companyId 회사 ID (선택적)
     * @param isActive 활성화 여부 (선택적)
     * @param pageSize 페이지 크기
     * @param offset 시작 위치
     * @return 템플릿 목록
     */
    List<VoucherTemplate> findAllTemplates(@Param("companyId") String companyId,
                                         @Param("isActive") Boolean isActive,
                                         @Param("pageSize") int pageSize,
                                         @Param("offset") int offset);

    /**
     * 템플릿 총 개수
     * @param companyId 회사 ID (선택적)
     * @param isActive 활성화 여부 (선택적)
     * @return 총 개수
     */
    Long countTemplates(@Param("companyId") String companyId,
                       @Param("isActive") Boolean isActive);

    /**
     * 기본 템플릿 조회
     * @param companyId 회사 ID
     * @param voucherFormat 전표 형식
     * @return 기본 템플릿
     */
    VoucherTemplate findDefaultTemplate(@Param("companyId") String companyId,
                                      @Param("voucherFormat") String voucherFormat);

    /**
     * 기본 템플릿 해제 (새로운 기본 템플릿 설정 전)
     * @param companyId 회사 ID
     * @param voucherFormat 전표 형식
     * @return 업데이트된 레코드 수
     */
    int unsetDefaultTemplates(@Param("companyId") String companyId,
                            @Param("voucherFormat") String voucherFormat);

    /**
     * 템플릿 활성화/비활성화
     * @param templateId 템플릿 ID
     * @param isActive 활성화 여부
     * @return 업데이트된 레코드 수
     */
    int updateTemplateStatus(@Param("templateId") Long templateId,
                           @Param("isActive") Boolean isActive);

    /**
     * 템플릿 기본 설정 변경
     * @param templateId 템플릿 ID
     * @param isDefault 기본 템플릿 여부
     * @return 업데이트된 레코드 수
     */
    int updateDefaultStatus(@Param("templateId") Long templateId,
                          @Param("isDefault") Boolean isDefault);

    /**
     * 템플릿 코드 중복 확인
     * @param templateCode 템플릿 코드
     * @param excludeId 제외할 템플릿 ID (수정시)
     * @return 중복 여부
     */
    Boolean existsByTemplateCode(@Param("templateCode") String templateCode,
                               @Param("excludeId") Long excludeId);

    /**
     * 회사의 전표 형식별 템플릿 개수
     * @param companyId 회사 ID
     * @return 전표 형식별 템플릿 개수 통계
     */
    List<java.util.Map<String, Object>> getTemplateStatistics(@Param("companyId") String companyId);

    /**
     * 템플릿 사용 빈도 조회
     * @param startDate 시작 날짜
     * @param endDate 종료 날짜
     * @return 템플릿별 사용 빈도
     */
    List<java.util.Map<String, Object>> getTemplateUsageStatistics(@Param("startDate") String startDate,
                                                                   @Param("endDate") String endDate);

    /**
     * 미사용 템플릿 조회
     * @param daysSinceLastUsed 마지막 사용일로부터 경과 일수
     * @return 미사용 템플릿 목록
     */
    List<VoucherTemplate> findUnusedTemplates(@Param("daysSinceLastUsed") int daysSinceLastUsed);

    /**
     * 템플릿 복사 (새 버전 생성)
     * @param sourceTemplateId 원본 템플릿 ID
     * @param newTemplateCode 새 템플릿 코드
     * @param newTemplateName 새 템플릿 이름
     * @param newVersion 새 버전
     * @param createdBy 생성자
     * @return 생성된 레코드 수
     */
    int copyTemplate(@Param("sourceTemplateId") Long sourceTemplateId,
                    @Param("newTemplateCode") String newTemplateCode,
                    @Param("newTemplateName") String newTemplateName,
                    @Param("newVersion") String newVersion,
                    @Param("createdBy") String createdBy);
}
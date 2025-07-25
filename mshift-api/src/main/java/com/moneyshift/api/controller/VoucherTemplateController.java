package com.moneyshift.api.controller;

import com.moneyshift.api.model.VoucherTemplate;
import com.moneyshift.api.service.VoucherTemplateService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * 전표 템플릿 관리 API 컨트롤러
 * 
 * 전표 템플릿의 CRUD 및 관리 기능을 제공합니다.
 * - 템플릿 생성, 수정, 삭제
 * - 활성 템플릿 조회
 * - 기본 템플릿 설정
 * - 템플릿 복사 및 버전 관리
 */
@Slf4j
@RestController
@RequestMapping("/api/v2/accounting/voucher-templates")
@RequiredArgsConstructor
@Tag(name = "전표 템플릿 관리", description = "전표 템플릿 CRUD 및 관리 API")
public class VoucherTemplateController {

    private final VoucherTemplateService voucherTemplateService;

    @Operation(
        summary = "전표 템플릿 생성",
        description = "새로운 전표 템플릿을 생성합니다."
    )
    @ApiResponses({
        @ApiResponse(responseCode = "201", description = "템플릿 생성 성공"),
        @ApiResponse(responseCode = "400", description = "잘못된 요청 데이터"),
        @ApiResponse(responseCode = "409", description = "템플릿 코드 중복"),
        @ApiResponse(responseCode = "500", description = "서버 오류")
    })
    @PostMapping
    public ResponseEntity<ApiResult<Long>> createTemplate(
            @Parameter(description = "전표 템플릿 정보", required = true)
            @Valid @RequestBody VoucherTemplate template) {
        
        try {
            Long templateId = voucherTemplateService.createTemplate(template);
            
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(new ApiResult<>(true, "전표 템플릿이 생성되었습니다.", templateId));
                    
        } catch (IllegalArgumentException e) {
            log.warn("전표 템플릿 생성 요청 오류: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(new ApiResult<>(false, e.getMessage(), null));
        } catch (Exception e) {
            log.error("전표 템플릿 생성 중 오류 발생", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResult<>(false, "전표 템플릿 생성 중 오류가 발생했습니다.", null));
        }
    }

    @Operation(
        summary = "전표 템플릿 수정",
        description = "기존 전표 템플릿을 수정합니다."
    )
    @PutMapping("/{templateId}")
    public ResponseEntity<ApiResult<Void>> updateTemplate(
            @Parameter(description = "템플릿 ID", required = true)
            @PathVariable Long templateId,
            
            @Parameter(description = "수정할 템플릿 정보", required = true)
            @Valid @RequestBody VoucherTemplate template) {
        
        try {
            template.setId(templateId);
            voucherTemplateService.updateTemplate(template);
            
            return ResponseEntity.ok(
                    new ApiResult<>(true, "전표 템플릿이 수정되었습니다.", null));
                    
        } catch (IllegalArgumentException e) {
            log.warn("전표 템플릿 수정 요청 오류: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(new ApiResult<>(false, e.getMessage(), null));
        } catch (Exception e) {
            log.error("전표 템플릿 수정 중 오류 발생", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResult<>(false, "전표 템플릿 수정 중 오류가 발생했습니다.", null));
        }
    }

    @Operation(
        summary = "전표 템플릿 삭제",
        description = "전표 템플릿을 삭제합니다. 기본 템플릿은 삭제할 수 없습니다."
    )
    @DeleteMapping("/{templateId}")
    public ResponseEntity<ApiResult<Void>> deleteTemplate(
            @Parameter(description = "템플릿 ID", required = true)
            @PathVariable Long templateId) {
        
        try {
            voucherTemplateService.deleteTemplate(templateId);
            
            return ResponseEntity.ok(
                    new ApiResult<>(true, "전표 템플릿이 삭제되었습니다.", null));
                    
        } catch (IllegalArgumentException e) {
            log.warn("전표 템플릿 삭제 요청 오류: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(new ApiResult<>(false, e.getMessage(), null));
        } catch (IllegalStateException e) {
            log.warn("전표 템플릿 삭제 상태 오류: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(new ApiResult<>(false, e.getMessage(), null));
        } catch (Exception e) {
            log.error("전표 템플릿 삭제 중 오류 발생", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResult<>(false, "전표 템플릿 삭제 중 오류가 발생했습니다.", null));
        }
    }

    @Operation(
        summary = "전표 템플릿 조회",
        description = "ID로 특정 전표 템플릿을 조회합니다."
    )
    @GetMapping("/{templateId}")
    public ResponseEntity<ApiResult<VoucherTemplate>> getTemplate(
            @Parameter(description = "템플릿 ID", required = true)
            @PathVariable Long templateId) {
        
        try {
            VoucherTemplate template = voucherTemplateService.getTemplateById(templateId);
            
            if (template == null) {
                return ResponseEntity.notFound().build();
            }
            
            return ResponseEntity.ok(
                    new ApiResult<>(true, "전표 템플릿 조회 완료", template));
                    
        } catch (Exception e) {
            log.error("전표 템플릿 조회 중 오류 발생", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResult<>(false, "전표 템플릿 조회 중 오류가 발생했습니다.", null));
        }
    }

    @Operation(
        summary = "활성 전표 템플릿 목록 조회",
        description = "회사별 활성 전표 템플릿 목록을 조회합니다."
    )
    @GetMapping("/active")
    public ResponseEntity<ApiResult<List<VoucherTemplate>>> getActiveTemplates(
            @Parameter(description = "회사 ID (선택적)", example = "test-company")
            @RequestParam(required = false) String companyId,
            
            @Parameter(description = "전표 형식 (선택적)", example = "STANDARD")
            @RequestParam(required = false) String voucherFormat) {
        
        try {
            List<VoucherTemplate> templates = voucherTemplateService.getActiveTemplates(companyId, voucherFormat);
            
            return ResponseEntity.ok(
                    new ApiResult<>(true, 
                            String.format("%d개의 활성 템플릿을 조회했습니다.", templates.size()), 
                            templates));
                            
        } catch (Exception e) {
            log.error("활성 전표 템플릿 조회 중 오류 발생", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResult<>(false, "활성 전표 템플릿 조회 중 오류가 발생했습니다.", null));
        }
    }

    @Operation(
        summary = "전체 전표 템플릿 목록 조회",
        description = "전체 전표 템플릿 목록을 페이징으로 조회합니다."
    )
    @GetMapping
    public ResponseEntity<ApiResult<TemplateListResponse>> getAllTemplates(
            @Parameter(description = "회사 ID (선택적)")
            @RequestParam(required = false) String companyId,
            
            @Parameter(description = "활성화 여부 (선택적)")
            @RequestParam(required = false) Boolean isActive,
            
            @Parameter(description = "페이지 크기", example = "10")
            @RequestParam(defaultValue = "10") int pageSize,
            
            @Parameter(description = "페이지 번호", example = "1")
            @RequestParam(defaultValue = "1") int page) {
        
        try {
            int offset = (page - 1) * pageSize;
            List<VoucherTemplate> templates = voucherTemplateService.getAllTemplates(companyId, isActive, pageSize, offset);
            Long totalCount = voucherTemplateService.countTemplates(companyId, isActive);
            
            TemplateListResponse response = TemplateListResponse.builder()
                    .templates(templates)
                    .totalCount(totalCount)
                    .currentPage(page)
                    .pageSize(pageSize)
                    .totalPages((int) Math.ceil((double) totalCount / pageSize))
                    .build();
            
            return ResponseEntity.ok(
                    new ApiResult<>(true, "전표 템플릿 목록 조회 완료", response));
                    
        } catch (Exception e) {
            log.error("전표 템플릿 목록 조회 중 오류 발생", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResult<>(false, "전표 템플릿 목록 조회 중 오류가 발생했습니다.", null));
        }
    }

    @Operation(
        summary = "기본 전표 템플릿 조회",
        description = "회사의 특정 전표 형식에 대한 기본 템플릿을 조회합니다."
    )
    @GetMapping("/default")
    public ResponseEntity<ApiResult<VoucherTemplate>> getDefaultTemplate(
            @Parameter(description = "회사 ID", required = true)
            @RequestParam String companyId,
            
            @Parameter(description = "전표 형식", required = true, example = "STANDARD")
            @RequestParam String voucherFormat) {
        
        try {
            VoucherTemplate template = voucherTemplateService.getDefaultTemplate(companyId, voucherFormat);
            
            if (template == null) {
                return ResponseEntity.ok(
                        new ApiResult<>(false, "기본 템플릿을 찾을 수 없습니다.", null));
            }
            
            return ResponseEntity.ok(
                    new ApiResult<>(true, "기본 템플릿 조회 완료", template));
                    
        } catch (Exception e) {
            log.error("기본 전표 템플릿 조회 중 오류 발생", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResult<>(false, "기본 전표 템플릿 조회 중 오류가 발생했습니다.", null));
        }
    }

    @Operation(
        summary = "기본 템플릿 설정",
        description = "특정 템플릿을 기본 템플릿으로 설정합니다."
    )
    @PutMapping("/{templateId}/set-default")
    public ResponseEntity<ApiResult<Void>> setAsDefaultTemplate(
            @Parameter(description = "템플릿 ID", required = true)
            @PathVariable Long templateId,
            
            @Parameter(description = "회사 ID", required = true)
            @RequestParam String companyId,
            
            @Parameter(description = "전표 형식", required = true, example = "STANDARD")
            @RequestParam String voucherFormat) {
        
        try {
            voucherTemplateService.setAsDefaultTemplate(templateId, companyId, voucherFormat);
            
            return ResponseEntity.ok(
                    new ApiResult<>(true, "기본 템플릿으로 설정되었습니다.", null));
                    
        } catch (IllegalArgumentException e) {
            log.warn("기본 템플릿 설정 요청 오류: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(new ApiResult<>(false, e.getMessage(), null));
        } catch (Exception e) {
            log.error("기본 템플릿 설정 중 오류 발생", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResult<>(false, "기본 템플릿 설정 중 오류가 발생했습니다.", null));
        }
    }

    @Operation(
        summary = "템플릿 활성화/비활성화",
        description = "템플릿의 활성화 상태를 변경합니다."
    )
    @PutMapping("/{templateId}/status")
    public ResponseEntity<ApiResult<Void>> updateTemplateStatus(
            @Parameter(description = "템플릿 ID", required = true)
            @PathVariable Long templateId,
            
            @Parameter(description = "활성화 여부", required = true)
            @RequestParam boolean isActive) {
        
        try {
            voucherTemplateService.updateTemplateStatus(templateId, isActive);
            
            String message = isActive ? "템플릿이 활성화되었습니다." : "템플릿이 비활성화되었습니다.";
            return ResponseEntity.ok(new ApiResult<>(true, message, null));
                    
        } catch (IllegalArgumentException e) {
            log.warn("템플릿 상태 변경 요청 오류: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(new ApiResult<>(false, e.getMessage(), null));
        } catch (IllegalStateException e) {
            log.warn("템플릿 상태 변경 상태 오류: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(new ApiResult<>(false, e.getMessage(), null));
        } catch (Exception e) {
            log.error("템플릿 상태 변경 중 오류 발생", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResult<>(false, "템플릿 상태 변경 중 오류가 발생했습니다.", null));
        }
    }

    @Operation(
        summary = "템플릿 복사",
        description = "existing template를 기반으로 새로운 버전의 템플릿을 생성합니다."
    )
    @PostMapping("/{templateId}/copy")
    public ResponseEntity<ApiResult<Long>> copyTemplate(
            @Parameter(description = "원본 템플릿 ID", required = true)
            @PathVariable Long templateId,
            
            @Parameter(description = "새 템플릿 코드", required = true)
            @RequestParam String newTemplateCode,
            
            @Parameter(description = "새 템플릿 이름", required = true)
            @RequestParam String newTemplateName,
            
            @Parameter(description = "새 버전", required = false, example = "2.0")
            @RequestParam(defaultValue = "2.0") String newVersion,
            
            @Parameter(description = "생성자", required = false, example = "USER")
            @RequestParam(defaultValue = "USER") String createdBy) {
        
        try {
            Long newTemplateId = voucherTemplateService.copyTemplate(
                    templateId, newTemplateCode, newTemplateName, newVersion, createdBy);
            
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(new ApiResult<>(true, "템플릿이 복사되었습니다.", newTemplateId));
                    
        } catch (IllegalArgumentException e) {
            log.warn("템플릿 복사 요청 오류: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(new ApiResult<>(false, e.getMessage(), null));
        } catch (Exception e) {
            log.error("템플릿 복사 중 오류 발생", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResult<>(false, "템플릿 복사 중 오류가 발생했습니다.", null));
        }
    }

    @Operation(
        summary = "템플릿 통계 조회",
        description = "회사의 전표 템플릿 사용 통계를 조회합니다."
    )
    @GetMapping("/statistics")
    public ResponseEntity<ApiResult<List<Map<String, Object>>>> getTemplateStatistics(
            @Parameter(description = "회사 ID (선택적)")
            @RequestParam(required = false) String companyId) {
        
        try {
            List<Map<String, Object>> statistics = voucherTemplateService.getTemplateStatistics(companyId);
            
            return ResponseEntity.ok(
                    new ApiResult<>(true, "템플릿 통계 조회 완료", statistics));
                    
        } catch (Exception e) {
            log.error("템플릿 통계 조회 중 오류 발생", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResult<>(false, "템플릿 통계 조회 중 오류가 발생했습니다.", null));
        }
    }

    @Operation(
        summary = "표준 템플릿 초기화",
        description = "시스템 표준 전표 템플릿을 초기화합니다."
    )
    @PostMapping("/initialize-defaults")
    public ResponseEntity<ApiResult<Void>> initializeDefaultTemplates() {
        try {
            voucherTemplateService.initializeDefaultTemplates();
            
            return ResponseEntity.ok(
                    new ApiResult<>(true, "표준 템플릿이 초기화되었습니다.", null));
                    
        } catch (Exception e) {
            log.error("표준 템플릿 초기화 중 오류 발생", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResult<>(false, "표준 템플릿 초기화 중 오류가 발생했습니다.", null));
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
     * 템플릿 목록 응답 클래스
     */
    public static class TemplateListResponse {
        private List<VoucherTemplate> templates;
        private Long totalCount;
        private Integer currentPage;
        private Integer pageSize;
        private Integer totalPages;

        public static TemplateListResponseBuilder builder() {
            return new TemplateListResponseBuilder();
        }

        public List<VoucherTemplate> getTemplates() { return templates; }
        public Long getTotalCount() { return totalCount; }
        public Integer getCurrentPage() { return currentPage; }
        public Integer getPageSize() { return pageSize; }
        public Integer getTotalPages() { return totalPages; }

        public static class TemplateListResponseBuilder {
            private List<VoucherTemplate> templates;
            private Long totalCount;
            private Integer currentPage;
            private Integer pageSize;
            private Integer totalPages;

            public TemplateListResponseBuilder templates(List<VoucherTemplate> templates) {
                this.templates = templates;
                return this;
            }

            public TemplateListResponseBuilder totalCount(Long totalCount) {
                this.totalCount = totalCount;
                return this;
            }

            public TemplateListResponseBuilder currentPage(Integer currentPage) {
                this.currentPage = currentPage;
                return this;
            }

            public TemplateListResponseBuilder pageSize(Integer pageSize) {
                this.pageSize = pageSize;
                return this;
            }

            public TemplateListResponseBuilder totalPages(Integer totalPages) {
                this.totalPages = totalPages;
                return this;
            }

            public TemplateListResponse build() {
                TemplateListResponse response = new TemplateListResponse();
                response.templates = this.templates;
                response.totalCount = this.totalCount;
                response.currentPage = this.currentPage;
                response.pageSize = this.pageSize;
                response.totalPages = this.totalPages;
                return response;
            }
        }
    }
}
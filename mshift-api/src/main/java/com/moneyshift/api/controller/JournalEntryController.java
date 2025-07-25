package com.moneyshift.api.controller;

import com.moneyshift.api.mapper.JournalEntryMapper;
import com.moneyshift.api.model.JournalEntry;
import com.moneyshift.api.model.JournalEntryDetail;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 분개 관리 REST API Controller
 * 분개 생성, 승인, 전기 등의 기장 업무를 처리합니다.
 */
@RestController
@RequestMapping("/api/v2/accounting/journal-entries")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Journal Entries", description = "분개 관리 API")
public class JournalEntryController {

    private final JournalEntryMapper journalEntryMapper;

    @Operation(summary = "분개 생성", description = "새로운 분개를 생성합니다. 단순 분개와 복합 분개를 모두 지원합니다.")
    @PostMapping
    public ResponseEntity<Map<String, Object>> createJournalEntry(
            @RequestBody JournalEntry journalEntry) {
        try {
            // 분개 균형 검증
            if (!journalEntry.isBalanced()) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "분개가 균형을 이루지 않습니다. 차변과 대변 금액이 일치해야 합니다.");
                return ResponseEntity.badRequest().body(response);
            }

            // 분개 생성
            journalEntryMapper.insertJournalEntry(journalEntry);
            
            // 분개 상세 일괄 생성
            if (journalEntry.getDetails() != null && !journalEntry.getDetails().isEmpty()) {
                for (JournalEntryDetail detail : journalEntry.getDetails()) {
                    detail.setJournalEntryId(journalEntry.getId());
                }
                journalEntryMapper.insertJournalEntryDetails(journalEntry.getDetails());
            }

            // 감사 로그 생성
            journalEntryMapper.insertJournalEntryAuditLog(
                journalEntry.getId(), "CREATE", null, journalEntry.getStatus(), 
                "system", "분개 생성");

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("journalEntry", journalEntry);
            response.put("message", "분개가 성공적으로 생성되었습니다.");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error creating journal entry", e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "분개 생성 중 오류가 발생했습니다: " + e.getMessage());
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }

    @Operation(summary = "복합 분개 생성", description = "여러 계정과목이 포함된 복합 분개를 생성합니다.")
    @PostMapping("/complex")
    public ResponseEntity<Map<String, Object>> createComplexJournalEntry(
            @RequestBody JournalEntry journalEntry) {
        try {
            // 복합 분개 검증 (3개 이상의 분개 라인)
            if (journalEntry.getDetails() == null || journalEntry.getDetails().size() < 3) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "복합 분개는 최소 3개 이상의 분개 라인이 필요합니다.");
                return ResponseEntity.badRequest().body(response);
            }

            // 기존 분개 생성 로직과 동일
            return createJournalEntry(journalEntry);
        } catch (Exception e) {
            log.error("Error creating complex journal entry", e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "복합 분개 생성 중 오류가 발생했습니다: " + e.getMessage());
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }

    @Operation(summary = "분개 단건 조회", description = "ID로 특정 분개와 상세 내역을 조회합니다.")
    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getJournalEntry(
            @Parameter(description = "분개 ID")
            @PathVariable Long id) {
        try {
            JournalEntry journalEntry = journalEntryMapper.findJournalEntryById(id);
            
            Map<String, Object> response = new HashMap<>();
            if (journalEntry != null) {
                response.put("success", true);
                response.put("journalEntry", journalEntry);
            } else {
                response.put("success", false);
                response.put("message", "해당 분개를 찾을 수 없습니다.");
            }
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error fetching journal entry: {}", id, e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "분개 조회 중 오류가 발생했습니다: " + e.getMessage());
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }

    @Operation(summary = "분개 목록 조회", description = "조건에 따라 분개 목록을 조회합니다 (페이징 지원)")
    @GetMapping
    public ResponseEntity<Map<String, Object>> getJournalEntries(
            @Parameter(description = "회사 ID")
            @RequestParam(required = false) Long companyId,
            @Parameter(description = "분개 상태 (DRAFT, APPROVED, POSTED)")
            @RequestParam(required = false) String status,
            @Parameter(description = "검색어 (적요 또는 계정명)")
            @RequestParam(required = false) String search,
            @Parameter(description = "시작 날짜 (YYYY-MM-DD)")
            @RequestParam(required = false) String startDate,
            @Parameter(description = "종료 날짜 (YYYY-MM-DD)")
            @RequestParam(required = false) String endDate,
            @Parameter(description = "페이지 번호 (0부터 시작)", example = "0")
            @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "페이지 크기", example = "20")
            @RequestParam(defaultValue = "20") int pageSize) {
        try {
            int offset = page * pageSize;
            
            LocalDate startDateParsed = startDate != null ? LocalDate.parse(startDate) : null;
            LocalDate endDateParsed = endDate != null ? LocalDate.parse(endDate) : null;
            
            List<JournalEntry> journalEntries = journalEntryMapper.findJournalEntries(
                companyId, status, search, startDateParsed, endDateParsed, pageSize, offset);
            Long total = journalEntryMapper.countJournalEntries(
                companyId, status, search, startDateParsed, endDateParsed);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("journalEntries", journalEntries);
            response.put("pagination", Map.of(
                "total", total,
                "page", page,
                "pageSize", pageSize,
                "totalPages", (total + pageSize - 1) / pageSize
            ));
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error fetching journal entries", e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "분개 목록 조회 중 오류가 발생했습니다: " + e.getMessage());
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }

    @Operation(summary = "분개 승인", description = "DRAFT 상태의 분개를 승인합니다.")
    @PutMapping("/{id}/approve")
    public ResponseEntity<Map<String, Object>> approveJournalEntry(
            @Parameter(description = "분개 ID")
            @PathVariable Long id) {
        try {
            // 분개 존재 및 상태 확인
            JournalEntry journalEntry = journalEntryMapper.findJournalEntryById(id);
            if (journalEntry == null) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "해당 분개를 찾을 수 없습니다.");
                return ResponseEntity.badRequest().body(response);
            }

            if (!"DRAFT".equals(journalEntry.getStatus())) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "DRAFT 상태의 분개만 승인할 수 있습니다.");
                return ResponseEntity.badRequest().body(response);
            }

            // 분개 균형 재검증
            Map<String, Object> balanceCheck = journalEntryMapper.validateJournalEntryBalance(id);
            Boolean isBalanced = (Boolean) balanceCheck.get("isBalanced");
            if (!isBalanced) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "분개가 균형을 이루지 않아 승인할 수 없습니다.");
                return ResponseEntity.badRequest().body(response);
            }

            // 상태 업데이트
            journalEntryMapper.updateJournalEntryStatus(id, "APPROVED");

            // 감사 로그 생성
            journalEntryMapper.insertJournalEntryAuditLog(
                id, "APPROVE", "DRAFT", "APPROVED", "system", "분개 승인");

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("journalEntry", Map.of(
                "id", id,
                "status", "APPROVED",
                "approvedAt", java.time.LocalDateTime.now()
            ));
            response.put("message", "분개가 승인되었습니다.");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error approving journal entry: {}", id, e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "분개 승인 중 오류가 발생했습니다: " + e.getMessage());
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }

    @Operation(summary = "분개 전기", description = "승인된 분개를 총계정원장에 전기합니다.")
    @PostMapping("/{id}/post")
    public ResponseEntity<Map<String, Object>> postJournalEntry(
            @Parameter(description = "분개 ID")
            @PathVariable Long id) {
        try {
            // 분개 존재 및 상태 확인
            JournalEntry journalEntry = journalEntryMapper.findJournalEntryById(id);
            if (journalEntry == null) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "해당 분개를 찾을 수 없습니다.");
                return ResponseEntity.badRequest().body(response);
            }

            if (!"APPROVED".equals(journalEntry.getStatus())) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "승인된 분개만 전기할 수 있습니다.");
                return ResponseEntity.badRequest().body(response);
            }

            // 상태 업데이트 (전기 완료)
            journalEntryMapper.updateJournalEntryStatus(id, "POSTED");

            // 감사 로그 생성
            journalEntryMapper.insertJournalEntryAuditLog(
                id, "POST", "APPROVED", "POSTED", "system", "분개 전기");

            // TODO: 실제 GL 전기 처리는 GeneralLedgerController에서 처리
            // 여기서는 상태 변경만 수행

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("journalEntry", Map.of(
                "id", id,
                "status", "POSTED",
                "postedAt", java.time.LocalDateTime.now()
            ));
            response.put("message", "분개가 총계정원장에 전기되었습니다.");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error posting journal entry: {}", id, e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "분개 전기 중 오류가 발생했습니다: " + e.getMessage());
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }

    @Operation(summary = "분개 삭제", description = "DRAFT 상태의 분개를 삭제합니다.")
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> deleteJournalEntry(
            @Parameter(description = "분개 ID")
            @PathVariable Long id) {
        try {
            // 분개 존재 및 상태 확인
            JournalEntry journalEntry = journalEntryMapper.findJournalEntryById(id);
            if (journalEntry == null) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "해당 분개를 찾을 수 없습니다.");
                return ResponseEntity.badRequest().body(response);
            }

            if (!"DRAFT".equals(journalEntry.getStatus())) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "DRAFT 상태의 분개만 삭제할 수 있습니다.");
                return ResponseEntity.badRequest().body(response);
            }

            // 분개 상세 먼저 삭제
            journalEntryMapper.deleteJournalEntryDetails(id);
            
            // 분개 삭제
            journalEntryMapper.deleteJournalEntry(id);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "분개가 성공적으로 삭제되었습니다.");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error deleting journal entry: {}", id, e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "분개 삭제 중 오류가 발생했습니다: " + e.getMessage());
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }

    @Operation(summary = "분개 감사 추적 조회", description = "분개의 생성, 승인, 전기 등의 변경 이력을 조회합니다.")
    @GetMapping("/{id}/audit")
    public ResponseEntity<Map<String, Object>> getJournalEntryAuditTrail(
            @Parameter(description = "분개 ID")
            @PathVariable Long id) {
        try {
            List<Map<String, Object>> auditLogs = journalEntryMapper.findJournalEntryAuditLogs(id);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("auditTrail", auditLogs);
            response.put("total", auditLogs.size());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error fetching journal entry audit trail: {}", id, e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "분개 감사 추적 조회 중 오류가 발생했습니다: " + e.getMessage());
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }

    @Operation(summary = "분개 균형 검증", description = "분개의 차변과 대변이 균형을 이루는지 검증합니다.")
    @GetMapping("/{id}/validate")
    public ResponseEntity<Map<String, Object>> validateJournalEntryBalance(
            @Parameter(description = "분개 ID")
            @PathVariable Long id) {
        try {
            Map<String, Object> balanceCheck = journalEntryMapper.validateJournalEntryBalance(id);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("validation", balanceCheck);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error validating journal entry balance: {}", id, e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "분개 균형 검증 중 오류가 발생했습니다: " + e.getMessage());
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }

    @Operation(summary = "미전기 분개 조회", description = "지정된 기간 동안의 미전기 분개 개수를 조회합니다.")
    @GetMapping("/unposted")
    public ResponseEntity<Map<String, Object>> getUnpostedJournalEntries(
            @Parameter(description = "회사 ID")
            @RequestParam Long companyId,
            @Parameter(description = "시작 날짜 (YYYY-MM-DD)")
            @RequestParam String startDate,
            @Parameter(description = "종료 날짜 (YYYY-MM-DD)")
            @RequestParam String endDate) {
        try {
            LocalDate startDateParsed = LocalDate.parse(startDate);
            LocalDate endDateParsed = LocalDate.parse(endDate);
            
            Long unpostedCount = journalEntryMapper.findUnpostedJournalEntries(
                companyId.toString(), startDateParsed, endDateParsed);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("unpostedCount", unpostedCount);
            response.put("period", Map.of(
                "startDate", startDate,
                "endDate", endDate
            ));
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error fetching unposted journal entries", e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "미전기 분개 조회 중 오류가 발생했습니다: " + e.getMessage());
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }
}
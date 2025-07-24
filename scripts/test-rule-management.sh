#!/bin/bash

# 규칙 관리 테스트 스크립트
# 이 스크립트는 규칙 관리 시스템의 모든 기능을 테스트합니다.

set -e

echo "🚀 규칙 관리 테스트 시작..."
echo "=================================="

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 설정
BASE_URL="http://localhost:3000"
API_URL="http://localhost:8080/mshift-api"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

# 로그 파일
LOG_FILE="$PROJECT_DIR/test-results/rule-management-test.log"
mkdir -p "$PROJECT_DIR/test-results"

# 로그 함수
log() {
    echo -e "$1" | tee -a "$LOG_FILE"
}

# 테스트 결과 카운터
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# 테스트 결과 추가 함수
add_test_result() {
    local test_name="$1"
    local result="$2"
    local message="$3"
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    if [ "$result" = "PASS" ]; then
        PASSED_TESTS=$((PASSED_TESTS + 1))
        log "${GREEN}✅ $test_name: $message${NC}"
    else
        FAILED_TESTS=$((FAILED_TESTS + 1))
        log "${RED}❌ $test_name: $message${NC}"
    fi
}

# 서비스 상태 확인
check_services() {
    log "${BLUE}📡 서비스 상태 확인...${NC}"
    
    # NextJS 서비스 확인
    if curl -s --connect-timeout 5 "$BASE_URL" > /dev/null; then
        add_test_result "NextJS 서비스" "PASS" "서비스가 정상적으로 실행 중"
    else
        add_test_result "NextJS 서비스" "FAIL" "서비스에 접근할 수 없음"
    fi
    
    # Java API 서비스 확인
    if curl -s --connect-timeout 5 "$API_URL/rule-engine/rules" > /dev/null; then
        add_test_result "Java API 서비스" "PASS" "API 서비스가 정상적으로 실행 중"
    else
        add_test_result "Java API 서비스" "FAIL" "API 서비스에 접근할 수 없음"
    fi
}

# 데이터베이스 연결 확인
check_database() {
    log "${BLUE}🗄️ 데이터베이스 연결 확인...${NC}"
    
    # API를 통해 규칙 목록 조회
    response=$(curl -s -w "%{http_code}" -o /tmp/db_test.json "$API_URL/rule-engine/rules")
    http_code="${response: -3}"
    
    if [ "$http_code" = "200" ]; then
        rule_count=$(jq length /tmp/db_test.json 2>/dev/null || echo "0")
        add_test_result "데이터베이스 연결" "PASS" "규칙 $rule_count개 조회 성공"
    else
        add_test_result "데이터베이스 연결" "FAIL" "HTTP $http_code - 데이터베이스 연결 실패"
    fi
    
    rm -f /tmp/db_test.json
}

# API 엔드포인트 테스트
test_api_endpoints() {
    log "${BLUE}🔗 API 엔드포인트 테스트...${NC}"
    
    # 규칙 목록 조회
    response=$(curl -s -w "%{http_code}" -o /tmp/api_rules.json "$API_URL/rule-engine/rules")
    http_code="${response: -3}"
    
    if [ "$http_code" = "200" ]; then
        add_test_result "규칙 목록 조회 API" "PASS" "HTTP $http_code - 성공"
    else
        add_test_result "규칙 목록 조회 API" "FAIL" "HTTP $http_code - 실패"
    fi
    
    # 텍스트 매칭 테스트
    test_data='{"inputText":"GS25에서 결제","returnAllMatches":true}'
    response=$(curl -s -w "%{http_code}" -o /tmp/api_match.json -X POST \
        -H "Content-Type: application/json" \
        -d "$test_data" \
        "$API_URL/rule-engine/match")
    http_code="${response: -3}"
    
    if [ "$http_code" = "200" ]; then
        matched=$(jq -r '.matched' /tmp/api_match.json 2>/dev/null || echo "false")
        if [ "$matched" = "true" ]; then
            add_test_result "텍스트 매칭 API" "PASS" "HTTP $http_code - 매칭 성공"
        else
            add_test_result "텍스트 매칭 API" "FAIL" "HTTP $http_code - 매칭 실패"
        fi
    else
        add_test_result "텍스트 매칭 API" "FAIL" "HTTP $http_code - API 호출 실패"
    fi
    
    # 캐시 새로고침 테스트
    response=$(curl -s -w "%{http_code}" -o /dev/null -X POST "$API_URL/rule-engine/refresh-cache")
    http_code="${response: -3}"
    
    if [ "$http_code" = "200" ]; then
        add_test_result "캐시 새로고침 API" "PASS" "HTTP $http_code - 성공"
    else
        add_test_result "캐시 새로고침 API" "FAIL" "HTTP $http_code - 실패"
    fi
    
    rm -f /tmp/api_rules.json /tmp/api_match.json
}

# 규칙 CRUD 테스트
test_rule_crud() {
    log "${BLUE}🔧 규칙 CRUD 테스트...${NC}"
    
    # 테스트 규칙 데이터
    test_rule='{
        "pattern": "테스트규칙\\d+",
        "description": "자동 테스트용 규칙",
        "category": "테스트",
        "enabled": true,
        "priority": 10,
        "confidence": 0.8,
        "normalizer_type": "test"
    }'
    
    # 규칙 생성 테스트
    response=$(curl -s -w "%{http_code}" -o /tmp/create_rule.json -X POST \
        -H "Content-Type: application/json" \
        -d "$test_rule" \
        "$API_URL/admin/rules")
    http_code="${response: -3}"
    
    if [ "$http_code" = "200" ] || [ "$http_code" = "201" ]; then
        rule_id=$(jq -r '.id' /tmp/create_rule.json 2>/dev/null || echo "")
        if [ -n "$rule_id" ] && [ "$rule_id" != "null" ]; then
            add_test_result "규칙 생성" "PASS" "새 규칙 생성 성공 (ID: $rule_id)"
            
            # 규칙 수정 테스트
            updated_rule=$(echo "$test_rule" | jq '.description = "자동 테스트용 규칙 (수정됨)"')
            response=$(curl -s -w "%{http_code}" -o /dev/null -X PUT \
                -H "Content-Type: application/json" \
                -d "$updated_rule" \
                "$API_URL/admin/rules/$rule_id")
            http_code="${response: -3}"
            
            if [ "$http_code" = "200" ]; then
                add_test_result "규칙 수정" "PASS" "규칙 수정 성공"
            else
                add_test_result "규칙 수정" "FAIL" "HTTP $http_code - 규칙 수정 실패"
            fi
            
            # 규칙 삭제 테스트
            response=$(curl -s -w "%{http_code}" -o /dev/null -X DELETE "$API_URL/admin/rules/$rule_id")
            http_code="${response: -3}"
            
            if [ "$http_code" = "200" ] || [ "$http_code" = "204" ]; then
                add_test_result "규칙 삭제" "PASS" "규칙 삭제 성공"
            else
                add_test_result "규칙 삭제" "FAIL" "HTTP $http_code - 규칙 삭제 실패"
            fi
        else
            add_test_result "규칙 생성" "FAIL" "규칙 ID를 받지 못함"
        fi
    else
        add_test_result "규칙 생성" "FAIL" "HTTP $http_code - 규칙 생성 실패"
    fi
    
    rm -f /tmp/create_rule.json
}

# 프론트엔드 API 프록시 테스트
test_frontend_proxy() {
    log "${BLUE}🌐 프론트엔드 API 프록시 테스트...${NC}"
    
    # NextJS API 프록시를 통한 규칙 조회
    response=$(curl -s -w "%{http_code}" -o /tmp/proxy_rules.json "$BASE_URL/api/regex-rules")
    http_code="${response: -3}"
    
    if [ "$http_code" = "200" ]; then
        add_test_result "프론트엔드 규칙 조회" "PASS" "NextJS 프록시를 통한 규칙 조회 성공"
    else
        add_test_result "프론트엔드 규칙 조회" "FAIL" "HTTP $http_code - 프록시 호출 실패"
    fi
    
    # NextJS API 프록시를 통한 매칭 테스트
    test_data='{"text":"GS25에서 결제"}'
    response=$(curl -s -w "%{http_code}" -o /tmp/proxy_match.json -X POST \
        -H "Content-Type: application/json" \
        -d "$test_data" \
        "$BASE_URL/api/regex/match")
    http_code="${response: -3}"
    
    if [ "$http_code" = "200" ]; then
        add_test_result "프론트엔드 매칭 테스트" "PASS" "NextJS 프록시를 통한 매칭 성공"
    else
        add_test_result "프론트엔드 매칭 테스트" "FAIL" "HTTP $http_code - 프록시 매칭 실패"
    fi
    
    rm -f /tmp/proxy_rules.json /tmp/proxy_match.json
}

# 성능 테스트
test_performance() {
    log "${BLUE}⚡ 성능 테스트...${NC}"
    
    # 매칭 성능 테스트 (10회 반복)
    total_time=0
    success_count=0
    
    for i in {1..10}; do
        start_time=$(date +%s)
        response=$(curl -s -w "%{http_code}" -o /dev/null -X POST \
            -H "Content-Type: application/json" \
            -d '{"inputText":"GS25에서 결제","returnAllMatches":true}' \
            "$API_URL/rule-engine/match")
        end_time=$(date +%s)
        
        elapsed=$((end_time - start_time))
        total_time=$((total_time + elapsed))
        
        if [ "${response: -3}" = "200" ]; then
            success_count=$((success_count + 1))
        fi
    done
    
    avg_time=$((total_time / 10))
    success_rate=$((success_count * 100 / 10))
    
    if [ $success_rate -ge 90 ] && [ $avg_time -le 2 ]; then
        add_test_result "성능 테스트" "PASS" "평균 응답시간: ${avg_time}초, 성공률: ${success_rate}%"
    else
        add_test_result "성능 테스트" "FAIL" "평균 응답시간: ${avg_time}초, 성공률: ${success_rate}%"
    fi
}

# 메인 테스트 실행
main() {
    log "${YELLOW}규칙 관리 테스트 시작 - $(date)${NC}"
    log ""
    
    # 로그 파일 초기화
    echo "규칙 관리 테스트 로그 - $(date)" > "$LOG_FILE"
    
    # 테스트 실행
    check_services
    check_database
    test_api_endpoints
    test_rule_crud
    test_frontend_proxy
    test_performance
    
    # 결과 요약
    log ""
    log "${BLUE}=================================="
    log "📊 테스트 결과 요약"
    log "=================================="
    log "총 테스트: $TOTAL_TESTS"
    log "성공: $PASSED_TESTS"
    log "실패: $FAILED_TESTS"
    
    if [ $FAILED_TESTS -eq 0 ]; then
        log "${GREEN}🎉 모든 테스트 통과!${NC}"
        success_rate=100
    else
        success_rate=$((PASSED_TESTS * 100 / TOTAL_TESTS))
        log "${YELLOW}⚠️ 일부 테스트 실패. 성공률: ${success_rate}%${NC}"
    fi
    
    log "상세 로그: $LOG_FILE"
    log "테스트 완료 시간: $(date)"
    log "=================================="
    
    # 종료 코드 설정
    if [ $FAILED_TESTS -eq 0 ]; then
        exit 0
    else
        exit 1
    fi
}

# 도움말
show_help() {
    echo "규칙 관리 테스트 스크립트"
    echo ""
    echo "사용법: $0 [옵션]"
    echo ""
    echo "옵션:"
    echo "  -h, --help     이 도움말 표시"
    echo "  -v, --verbose  상세 로그 출력"
    echo ""
    echo "예시:"
    echo "  $0              # 기본 테스트 실행"
    echo "  $0 -v           # 상세 로그와 함께 실행"
    echo ""
    echo "주의사항:"
    echo "  - NextJS 서버가 localhost:3000에서 실행 중이어야 합니다"
    echo "  - Java API 서버가 localhost:8080에서 실행 중이어야 합니다"
    echo "  - PostgreSQL 데이터베이스가 연결되어 있어야 합니다"
}

# 명령행 인수 처리
while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--help)
            show_help
            exit 0
            ;;
        -v|--verbose)
            set -x
            shift
            ;;
        *)
            echo "알 수 없는 옵션: $1"
            echo "도움말을 보려면 -h 또는 --help를 사용하세요."
            exit 1
            ;;
    esac
done

# 필요한 도구 확인
if ! command -v curl &> /dev/null; then
    echo "❌ curl이 설치되어 있지 않습니다."
    exit 1
fi

if ! command -v jq &> /dev/null; then
    echo "❌ jq가 설치되어 있지 않습니다."
    echo "설치: brew install jq (macOS) 또는 apt-get install jq (Ubuntu)"
    exit 1
fi

# 메인 함수 실행
main
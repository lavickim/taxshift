#!/bin/bash

# 통합 테스트 스크립트
# 모든 테스트를 순차적으로 실행하고 결과를 통합 보고서로 생성

set -e

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# 설정
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
RESULTS_DIR="$PROJECT_DIR/test-results"
INTEGRATED_LOG="$RESULTS_DIR/integrated-test-report.log"

# 결과 디렉토리 생성
mkdir -p "$RESULTS_DIR"

# 로그 함수
log() {
    echo -e "$1" | tee -a "$INTEGRATED_LOG"
}

# 테스트 실행 함수
run_test() {
    local test_name="$1"
    local test_command="$2"
    local test_description="$3"
    
    log "${BLUE}🔄 $test_name 시작...${NC}"
    log "   설명: $test_description"
    log "   명령: $test_command"
    log ""
    
    start_time=$(date +%s)
    
    if eval "$test_command"; then
        end_time=$(date +%s)
        duration=$((end_time - start_time))
        log "${GREEN}✅ $test_name 완료 (${duration}초)${NC}"
        echo "$test_name|PASS|${duration}s|$test_description" >> "$RESULTS_DIR/test_summary.csv"
        return 0
    else
        end_time=$(date +%s)
        duration=$((end_time - start_time))
        log "${RED}❌ $test_name 실패 (${duration}초)${NC}"
        echo "$test_name|FAIL|${duration}s|$test_description" >> "$RESULTS_DIR/test_summary.csv"
        return 1
    fi
}

# 시스템 상태 확인
check_system_status() {
    log "${PURPLE}🔍 시스템 상태 확인...${NC}"
    
    # NextJS 서버 확인
    if curl -s --connect-timeout 5 http://localhost:3000 > /dev/null; then
        log "${GREEN}✅ NextJS 서버 실행 중${NC}"
    else
        log "${RED}❌ NextJS 서버가 실행되지 않음${NC}"
        log "${YELLOW}⚠️ NextJS 서버를 시작하세요: cd mshift-admin && npm run dev${NC}"
        return 1
    fi
    
    # Java API 서버 확인
    if curl -s --connect-timeout 5 http://localhost:8080/api/rule-engine/rules > /dev/null; then
        log "${GREEN}✅ Java API 서버 실행 중${NC}"
    else
        log "${RED}❌ Java API 서버가 실행되지 않음${NC}"
        log "${YELLOW}⚠️ Java API 서버를 시작하세요: cd mshift-api && mvn spring-boot:run${NC}"
        return 1
    fi
    
    # PostgreSQL 확인
    if curl -s --connect-timeout 5 http://localhost:8080/api/rule-engine/rules | jq '.' > /dev/null 2>&1; then
        log "${GREEN}✅ PostgreSQL 데이터베이스 연결 정상${NC}"
    else
        log "${RED}❌ PostgreSQL 데이터베이스 연결 실패${NC}"
        log "${YELLOW}⚠️ PostgreSQL 서버를 시작하세요: docker-compose up -d postgres${NC}"
        return 1
    fi
    
    log "${GREEN}🎉 모든 시스템 서비스가 정상 실행 중입니다${NC}"
    log ""
}

# 메인 테스트 실행
main() {
    log "${YELLOW}===============================================${NC}"
    log "${YELLOW}🚀 MoneyShift 통합 테스트 시작${NC}"
    log "${YELLOW}===============================================${NC}"
    log "시작 시간: $(date)"
    log ""
    
    # 로그 파일 초기화
    echo "MoneyShift 통합 테스트 보고서 - $(date)" > "$INTEGRATED_LOG"
    echo "TestName,Result,Duration,Description" > "$RESULTS_DIR/test_summary.csv"
    
    # 시스템 상태 확인
    if ! check_system_status; then
        log "${RED}❌ 시스템 상태 확인 실패. 필요한 서비스를 시작한 후 다시 시도하세요.${NC}"
        exit 1
    fi
    
    # 테스트 실행
    total_tests=0
    passed_tests=0
    failed_tests=0
    
    # 1. 기본 규칙 관리 테스트
    total_tests=$((total_tests + 1))
    if run_test "규칙 관리 기본 테스트" \
               "bash '$SCRIPT_DIR/test-rule-management.sh'" \
               "API 엔드포인트, CRUD 기능, 성능 테스트"; then
        passed_tests=$((passed_tests + 1))
    else
        failed_tests=$((failed_tests + 1))
    fi
    
    # 2. Puppeteer E2E 테스트 (규칙 관리)
    total_tests=$((total_tests + 1))
    if run_test "Puppeteer 규칙 관리 E2E" \
               "cd '$PROJECT_DIR' && npm install puppeteer && node tests/e2e/puppeteer-rule-management.test.js" \
               "전체 규칙 관리 워크플로우 E2E 테스트"; then
        passed_tests=$((passed_tests + 1))
    else
        failed_tests=$((failed_tests + 1))
    fi
    
    # 3. Puppeteer API 테스트
    total_tests=$((total_tests + 1))
    if run_test "Puppeteer API 테스트" \
               "cd '$PROJECT_DIR' && node tests/e2e/puppeteer-api-test.js" \
               "다양한 입력에 대한 API 응답 테스트"; then
        passed_tests=$((passed_tests + 1))
    else
        failed_tests=$((failed_tests + 1))
    fi
    
    # 4. 데이터베이스 무결성 테스트
    total_tests=$((total_tests + 1))
    if run_test "데이터베이스 무결성 테스트" \
               "curl -s http://localhost:8080/api/rule-engine/rules | jq 'length' > /dev/null" \
               "데이터베이스 연결 및 데이터 조회 테스트"; then
        passed_tests=$((passed_tests + 1))
    else
        failed_tests=$((failed_tests + 1))
    fi
    
    # 5. 프론트엔드-백엔드 통합 테스트
    total_tests=$((total_tests + 1))
    if run_test "프론트엔드-백엔드 통합 테스트" \
               "curl -s -X POST -H 'Content-Type: application/json' -d '{\"text\":\"GS25에서 결제\"}' http://localhost:3000/api/regex/match | jq '.success' | grep -q true" \
               "NextJS 프록시를 통한 Java API 호출 테스트"; then
        passed_tests=$((passed_tests + 1))
    else
        failed_tests=$((failed_tests + 1))
    fi
    
    # 결과 요약
    log ""
    log "${BLUE}===============================================${NC}"
    log "${BLUE}📊 통합 테스트 결과 요약${NC}"
    log "${BLUE}===============================================${NC}"
    log "총 테스트: $total_tests"
    log "성공: $passed_tests"
    log "실패: $failed_tests"
    
    if [ $failed_tests -eq 0 ]; then
        log "${GREEN}🎉 모든 통합 테스트 통과!${NC}"
        success_rate=100
    else
        success_rate=$((passed_tests * 100 / total_tests))
        log "${YELLOW}⚠️ 일부 테스트 실패. 성공률: ${success_rate}%${NC}"
    fi
    
    log ""
    log "${BLUE}📁 테스트 결과 파일:${NC}"
    log "   - 상세 로그: $INTEGRATED_LOG"
    log "   - 요약 CSV: $RESULTS_DIR/test_summary.csv"
    log "   - 개별 로그: $RESULTS_DIR/"
    log ""
    log "완료 시간: $(date)"
    log "${BLUE}===============================================${NC}"
    
    # 성공/실패 통계 출력
    if [ -f "$RESULTS_DIR/test_summary.csv" ]; then
        log ""
        log "${BLUE}📈 테스트 상세 결과:${NC}"
        while IFS='|' read -r test_name result duration description; do
            if [ "$result" = "PASS" ]; then
                log "${GREEN}✅ $test_name ($duration): $description${NC}"
            else
                log "${RED}❌ $test_name ($duration): $description${NC}"
            fi
        done < <(tail -n +2 "$RESULTS_DIR/test_summary.csv" | tr ',' '|')
    fi
    
    # 종료 코드 설정
    if [ $failed_tests -eq 0 ]; then
        exit 0
    else
        exit 1
    fi
}

# 도움말
show_help() {
    echo "MoneyShift 통합 테스트 스크립트"
    echo ""
    echo "사용법: $0 [옵션]"
    echo ""
    echo "옵션:"
    echo "  -h, --help     이 도움말 표시"
    echo "  -v, --verbose  상세 로그 출력"
    echo "  -q, --quiet    에러만 출력"
    echo ""
    echo "예시:"
    echo "  $0              # 기본 통합 테스트 실행"
    echo "  $0 -v           # 상세 로그와 함께 실행"
    echo "  $0 -q           # 조용한 모드로 실행"
    echo ""
    echo "사전 요구사항:"
    echo "  - NextJS 서버 (localhost:3000)"
    echo "  - Java API 서버 (localhost:8080)"
    echo "  - PostgreSQL 데이터베이스"
    echo "  - Redis 서버 (선택적)"
    echo ""
    echo "필요한 도구:"
    echo "  - curl, jq, node.js, npm"
    echo ""
    echo "테스트 구성:"
    echo "  1. 규칙 관리 기본 테스트"
    echo "  2. Puppeteer E2E 테스트 (규칙 관리)"
    echo "  3. Puppeteer API 테스트"
    echo "  4. 데이터베이스 무결성 테스트"
    echo "  5. 프론트엔드-백엔드 통합 테스트"
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
        -q|--quiet)
            exec 2>/dev/null
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
check_prerequisites() {
    local missing_tools=()
    
    if ! command -v curl &> /dev/null; then
        missing_tools+=("curl")
    fi
    
    if ! command -v jq &> /dev/null; then
        missing_tools+=("jq")
    fi
    
    if ! command -v node &> /dev/null; then
        missing_tools+=("node.js")
    fi
    
    if [ ${#missing_tools[@]} -gt 0 ]; then
        echo "❌ 다음 도구들이 설치되어 있지 않습니다:"
        printf '   - %s\n' "${missing_tools[@]}"
        echo ""
        echo "설치 방법:"
        echo "  macOS: brew install curl jq node"
        echo "  Ubuntu: apt-get install curl jq nodejs npm"
        exit 1
    fi
}

# 사전 요구사항 확인
check_prerequisites

# 메인 함수 실행
main
#!/bin/bash

# MoneyShift 전체 시스템 통합 테스트 스크립트
# 모바일, Admin, Backend의 모든 서비스가 통합되어 제대로 작동하는지 확인

set -e

echo "🔍 MoneyShift 전체 시스템 통합 테스트 시작..."
echo "================================================================"
echo "테스트 범위:"
echo "- 모바일 앱 (React Native + Expo)"
echo "- NextJS Admin 패널 (React + TypeScript)"
echo "- Spring Boot API Backend (Java + PostgreSQL)"
echo "- 백엔드 ↔ 프론트엔드 API 통합"
echo "- 복식부기 엔진 전체 워크플로우"
echo "================================================================"
echo ""

# 환경 설정
TEST_RESULTS_DIR="./test-results"
TIMESTAMP=$(date '+%Y%m%d_%H%M%S')
INTEGRATION_LOG="$TEST_RESULTS_DIR/integration-test-$TIMESTAMP.log"
FAIL_COUNT=0
TOTAL_TESTS=0

# 로그 디렉토리 생성
mkdir -p "$TEST_RESULTS_DIR"

# 로그 함수
log_test() {
    echo "[$(date '+%H:%M:%S')] $1" | tee -a "$INTEGRATION_LOG"
}

log_success() {
    echo "✅ [$(date '+%H:%M:%S')] $1" | tee -a "$INTEGRATION_LOG"
}

log_error() {
    echo "❌ [$(date '+%H:%M:%S')] $1" | tee -a "$INTEGRATION_LOG"
    FAIL_COUNT=$((FAIL_COUNT + 1))
}

log_warning() {
    echo "⚠️  [$(date '+%H:%M:%S')] $1" | tee -a "$INTEGRATION_LOG"
}

increment_test() {
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
}

# 통합 테스트 시작
log_test "=== MoneyShift 전체 시스템 통합 테스트 시작 ==="
log_test "테스트 로그: $INTEGRATION_LOG"
echo ""

# 1. 전체 시스템 TDD 검증
log_test "1/7 - 전체 시스템 TDD 선행 검증"
increment_test

if ./test-all-tdd.sh --test-only > "$TEST_RESULTS_DIR/tdd-validation.log" 2>&1; then
    log_success "TDD 검증 통과 - 모든 프로젝트 테스트 성공"
else
    log_error "TDD 검증 실패 - 일부 테스트가 실패했습니다"
    log_error "상세 로그: $TEST_RESULTS_DIR/tdd-validation.log"
fi

echo ""

# 2. 데이터베이스 서비스 확인
log_test "2/7 - 데이터베이스 서비스 확인"
increment_test

if pg_isready -h localhost -p 5432 -U moneyshift > /dev/null 2>&1; then
    log_success "PostgreSQL 데이터베이스 연결 확인"
else
    log_error "PostgreSQL 데이터베이스 연결 실패 - ./start-db.sh를 먼저 실행하세요"
fi

if redis-cli ping > /dev/null 2>&1; then
    log_success "Redis 캐시 서비스 연결 확인"
else
    log_warning "Redis 캐시 서비스 비활성 - 성능 저하 가능"
fi

echo ""

# 3. Backend API 서버 시작 및 헬스 체크
log_test "3/7 - Backend API 서버 헬스 체크"
increment_test

# API 서버를 백그라운드에서 시작
log_test "Spring Boot API 서버 시작 중... (포트 8080)"
cd mshift-api

# 기존 프로세스 종료
if lsof -ti:8080 > /dev/null 2>&1; then
    log_test "기존 API 서버 종료 중..."
    pkill -f "spring-boot:run" || true
    sleep 3
fi

# API 서버 시작
nohup mvn spring-boot:run > "../$TEST_RESULTS_DIR/backend-startup.log" 2>&1 &
API_PID=$!
log_test "API 서버 PID: $API_PID"

# API 서버 준비 대기 (30초 타임아웃)
log_test "API 서버 시작 대기 중..."
for i in {1..30}; do
    if curl -s http://localhost:8080/actuator/health > /dev/null 2>&1; then
        log_success "Backend API 서버 시작 완료 ($i초)"
        break
    fi
    
    if [ $i -eq 30 ]; then
        log_error "Backend API 서버 시작 타임아웃 (30초)"
        log_error "API 서버 로그: $TEST_RESULTS_DIR/backend-startup.log"
    else
        sleep 1
    fi
done

cd ..
echo ""

# 4. NextJS Admin 서버 시작 및 헬스 체크
log_test "4/7 - NextJS Admin 서버 헬스 체크"
increment_test

# Admin 서버를 백그라운드에서 시작
log_test "NextJS Admin 서버 시작 중... (포트 3000)"
cd mshift-admin

# 기존 프로세스 종료
if lsof -ti:3000 > /dev/null 2>&1; then
    log_test "기존 Admin 서버 종료 중..."
    pkill -f "next dev" || true
    sleep 3
fi

# Admin 서버 시작
nohup yarn dev > "../$TEST_RESULTS_DIR/admin-startup.log" 2>&1 &
ADMIN_PID=$!
log_test "Admin 서버 PID: $ADMIN_PID"

# Admin 서버 준비 대기 (45초 타임아웃)
log_test "Admin 서버 시작 대기 중..."
for i in {1..45}; do
    if curl -s http://localhost:3000 > /dev/null 2>&1; then
        log_success "NextJS Admin 서버 시작 완료 ($i초)"
        break
    fi
    
    if [ $i -eq 45 ]; then
        log_error "NextJS Admin 서버 시작 타임아웃 (45초)"
        log_error "Admin 서버 로그: $TEST_RESULTS_DIR/admin-startup.log"
    else
        sleep 1
    fi
done

cd ..
echo ""

# 5. API 엔드포인트 통합 테스트
log_test "5/7 - Backend API 엔드포인트 통합 테스트"
increment_test

# 주요 API 엔드포인트 테스트
API_TESTS=(
    "GET /actuator/health::헬스 체크"
    "GET /api/v2/accounting/health::복식부기 엔진 상태 확인"
    "GET /api/companies::회사 목록 조회"
    "GET /api/chart-of-accounts::계정과목 조회"
)

for test_case in "${API_TESTS[@]}"; do
    IFS='::' read -r endpoint description <<< "$test_case"
    
    if curl -s "http://localhost:8080$endpoint" > /dev/null 2>&1; then
        log_success "API 테스트 성공: $endpoint ($description)"
    else
        log_error "API 테스트 실패: $endpoint ($description)"
    fi
done

# 복식부기 테스트 - 거래 처리
log_test "복식부기 엔진 테스트: 거래 처리"
TRANSACTION_DATA='
{
  "companyId": "test-company",
  "transactionId": "tx-integration-test",
  "description": "GS25 편의점 테스트 결제",
  "amount": 15000,
  "date": "2025-07-22",
  "metadata": {
    "testMode": true
  }
}'

if curl -s -X POST \
    -H "Content-Type: application/json" \
    -d "$TRANSACTION_DATA" \
    http://localhost:8080/api/v2/accounting/process-transaction > "$TEST_RESULTS_DIR/transaction-test-response.json" 2>&1; then
    log_success "복식부기 거래 처리 성공"
    log_test "API 응답: $TEST_RESULTS_DIR/transaction-test-response.json"
else
    log_error "복식부기 거래 처리 실패"
fi

echo ""

# 6. Admin-Backend 통합 테스트
log_test "6/7 - Admin 패널 ↔ Backend API 통합 테스트"
increment_test

# Admin 패널에서 Backend API 호출 테스트
if curl -s "http://localhost:3000/api/health/endpoints" > /dev/null 2>&1; then
    log_success "Admin ↔ Backend API 프록시 연결 확인"
else
    log_error "Admin ↔ Backend API 프록시 연결 실패"
fi

# Admin UI 렌더링 테스트 (기본 홈페이지)
if curl -s http://localhost:3000 | grep -q "MoneyShift" 2>/dev/null; then
    log_success "Admin UI 렌더링 확인"
else
    log_warning "Admin UI 렌더링 검증 비활성 또는 실패"
fi

echo ""

# 7. 모바일 앱 테스트 (시뮬레이션)
log_test "7/7 - 모바일 앱 테스트 및 백엔드 연결 검증"
increment_test

# 모바일 앱의 API 연결 시뮬레이션
MOBILE_API_TEST='
{
  "description": "모바일 앱 API 테스트",
  "amount": 25000,
  "businessType": "편의점"
}'

if curl -s -X POST \
    -H "Content-Type: application/json" \
    -d "$MOBILE_API_TEST" \
    http://localhost:8080/api/classify > "$TEST_RESULTS_DIR/mobile-classification-test.json" 2>&1; then
    log_success "모바일 앱 분류 API 테스트 성공"
else
    log_error "모바일 앱 분류 API 테스트 실패"
fi

# 모바일 앱 TDD 테스트 다시 한번 확인
log_test "모바일 앱 TDD 테스트 다시 검증"
cd mshift-app
if ./start-with-tdd.sh --test-only > "../$TEST_RESULTS_DIR/mobile-tdd-recheck.log" 2>&1; then
    log_success "모바일 앱 TDD 재검증 성공"
else
    log_error "모바일 앱 TDD 재검증 실패"
fi
cd ..

echo ""
log_test "=== 통합 테스트 완료 ==="

# 서버 정리
log_test "서버 정리 중..."
if [ ! -z "$API_PID" ]; then
    kill $API_PID 2>/dev/null || true
    log_test "Backend API 서버 종료 (PID: $API_PID)"
fi

if [ ! -z "$ADMIN_PID" ]; then
    kill $ADMIN_PID 2>/dev/null || true
    log_test "NextJS Admin 서버 종료 (PID: $ADMIN_PID)"
fi

# 테스트 결과 요약
echo ""
echo "================================================================"
echo "📈 통합 테스트 결과 요약"
echo "================================================================"
echo "총 테스트: $TOTAL_TESTS개"
echo "실패 테스트: $FAIL_COUNT개"
echo "성공률: $(( (TOTAL_TESTS - FAIL_COUNT) * 100 / TOTAL_TESTS ))%"
echo "로그 파일: $INTEGRATION_LOG"
echo "로그 디렉토리: $TEST_RESULTS_DIR/"
echo "================================================================"

if [ $FAIL_COUNT -eq 0 ]; then
    echo "✅ 모든 통합 테스트 성공!"
    echo "🎉 MoneyShift 전체 시스템이 정상적으로 작동합니다."
    exit 0
else
    echo "❌ $FAIL_COUNT개의 테스트가 실패했습니다."
    echo "🔍 상세 로그를 확인하여 문제를 해결하세요."
    exit 1
fi
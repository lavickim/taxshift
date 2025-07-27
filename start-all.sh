#!/bin/bash

# MoneyShift 전체 시스템 시작 스크립트
# 전체 시스템을 순차적으로 시작하고 TDD 검증을 포함합니다

set -e

# 색상 및 스타일 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
GRAY='\033[0;90m'
BOLD='\033[1m'
NC='\033[0m' # No Color

# 스크립트 디렉토리
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# 프리티 프린트 함수들
print_header() {
    echo
    echo -e "${BOLD}${BLUE}╔══════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BOLD}${BLUE}║${NC}  ${WHITE}🚀 MoneyShift AI Platform - 전체 시스템 시작${NC}  ${BOLD}${BLUE}║${NC}"
    echo -e "${BOLD}${BLUE}╚══════════════════════════════════════════════════════════════╝${NC}"
    echo
}

print_section() {
    echo -e "${BOLD}${CYAN}┌─ $1${NC}"
}

print_success() {
    echo -e "   ${GREEN}✓${NC} ${WHITE}$1${NC}"
}

print_info() {
    echo -e "   ${BLUE}ℹ${NC} ${GRAY}$1${NC}"
}

print_warning() {
    echo -e "   ${YELLOW}⚠${NC} ${YELLOW}$1${NC}"
}

print_error() {
    echo -e "   ${RED}✗${NC} ${RED}$1${NC}"
}

print_progress() {
    echo -e "   ${PURPLE}⏳${NC} ${WHITE}$1${NC}"
}

# 스피너 함수
show_spinner() {
    local pid=$1
    local message="$2"
    local delay=0.15
    local spinstr='⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏'
    local temp
    
    while kill -0 $pid 2>/dev/null; do
        temp=${spinstr#?}
        printf "\\r   ${PURPLE}%c${NC} ${WHITE}%s${NC}" "$spinstr" "$message"
        spinstr=$temp${spinstr%"$temp"}
        sleep $delay
    done
    printf "\\r\\033[K"  # 스피너 지우기
}

# 포트 정리 함수
cleanup_port() {
    local port=$1
    local service_name="$2"
    
    local pid=$(lsof -ti :$port 2>/dev/null)
    if [ ! -z "$pid" ]; then
        print_warning "$service_name 포트 $port 기존 프로세스 정리 중... (PID: $pid)"
        kill -9 $pid 2>/dev/null || true
        sleep 2
        print_success "포트 $port 정리 완료"
    fi
}

# PID 추적 변수들
BACKEND_PID=""
FRONTEND_PID=""
APP_PID=""

print_header

# 1. 데이터베이스 서비스 시작
print_section "🗄️ 데이터베이스 서비스 시작"
print_progress "PostgreSQL 및 Redis 컨테이너 시작 중..."

if bash "$SCRIPT_DIR/start-db.sh" > /dev/null 2>&1; then
    print_success "데이터베이스 서비스 시작 성공 ✨"
else
    print_error "데이터베이스 시작 실패"
    exit 1
fi

print_info "데이터베이스 연결 대기 중..."
sleep 5

# 데이터베이스 연결 확인
if pg_isready -h localhost -p 5432 -U postgres 2>/dev/null; then
    print_success "PostgreSQL 연결 확인 완료"
else
    print_warning "PostgreSQL 연결을 확인할 수 없습니다"
fi
echo

# 2. 백엔드 API 서버 시작
print_section "☕ Java API 서버 시작 (TDD 검증 포함)"
cleanup_port 8080 "Java API"

print_progress "TDD 테스트 및 백엔드 서버 시작 중..."
if bash "$SCRIPT_DIR/start-backend.sh" > backend-startup.log 2>&1 &
then
    BACKEND_PROCESS_PID=$!
    show_spinner $BACKEND_PROCESS_PID "백엔드 TDD 검증 및 서버 시작 중..."
    wait $BACKEND_PROCESS_PID
    
    if [ $? -eq 0 ]; then
        BACKEND_PID=$(ps aux | grep "spring-boot:run" | grep -v grep | awk '{print $2}' | head -1)
        print_success "백엔드 서버 시작 성공 (PID: $BACKEND_PID) ✨"
        print_info "API 엔드포인트: http://localhost:8080/mshift-api"
    else
        print_error "백엔드 서버 시작 실패! TDD 검증을 통과하지 못했습니다"
        print_info "상세 로그: cat backend-startup.log"
        exit 1
    fi
else
    print_error "백엔드 시작 스크립트 실행 실패"
    exit 1
fi
echo

# 3. 프론트엔드 서버 시작
print_section "🌐 NextJS Admin 서버 시작 (TDD 검증 포함)"
cleanup_port 3000 "NextJS Admin"

print_warning "TDD 검증으로 인해 시작 시간이 더 소요될 수 있습니다"
print_progress "프론트엔드 TDD 검증 및 서버 시작 중..."

if bash "$SCRIPT_DIR/start-admin.sh" > frontend-startup.log 2>&1 &
then
    FRONTEND_PROCESS_PID=$!
    show_spinner $FRONTEND_PROCESS_PID "프론트엔드 TDD 검증 및 서버 시작 중..."
    wait $FRONTEND_PROCESS_PID
    
    if [ $? -eq 0 ]; then
        FRONTEND_PID=$(ps aux | grep "next dev" | grep -v grep | awk '{print $2}' | head -1)
        print_success "프론트엔드 서버 시작 성공 (PID: $FRONTEND_PID) ✨"
        print_info "Admin Panel: http://localhost:3000"
    else
        print_error "프론트엔드 서버 시작 실패! TDD 검증을 통과하지 못했습니다"
        print_info "상세 로그: cat frontend-startup.log"
        print_warning "백엔드 프로세스 정리 중..."
        if [ ! -z "$BACKEND_PID" ]; then
            kill $BACKEND_PID 2>/dev/null || true
        fi
        exit 1
    fi
else
    print_error "프론트엔드 시작 스크립트 실행 실패"
    exit 1
fi
echo

# 4. 모바일 앱 시작 (선택사항)
echo -e "${BOLD}${YELLOW}┌─ 📱 모바일 앱 시작 (선택사항)${NC}"
echo -e "   ${CYAN}모바일 앱도 시작하시겠습니까? ${WHITE}[y/N]${NC}: \\c"
read -r response

if [[ "$response" =~ ^[Yy]$ ]]; then
    echo
    print_progress "모바일 앱 TDD 검증 및 시작 중..."
    
    if bash "$SCRIPT_DIR/start-app.sh" > app-startup.log 2>&1; then
        APP_PID=$(ps aux | grep "expo start" | grep -v grep | awk '{print $2}' | head -1)
        print_success "모바일 앱 시작 성공 (PID: $APP_PID) ✨"
        print_info "Expo DevTools: http://localhost:19002"
    else
        print_warning "모바일 앱 시작 실패! 다른 서비스들은 계속 실행됩니다"
        print_info "상세 로그: cat app-startup.log"
    fi
else
    print_info "모바일 앱 시작을 건너뜁니다"
fi

echo

# 최종 요약 및 정보 표시
echo -e "${BOLD}${GREEN}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BOLD}${GREEN}║${NC}  ${WHITE}🎉 MoneyShift AI Platform 시작 완료!${NC}  ${BOLD}${GREEN}║${NC}"
echo -e "${BOLD}${GREEN}╚══════════════════════════════════════════════════════════════╝${NC}"
echo

echo -e "${BOLD}${BLUE}📡 서비스 접속 정보:${NC}"
echo -e "   ${GREEN}🌐 Admin Panel:${NC}     ${CYAN}http://localhost:3000${NC}"
echo -e "   ${GREEN}☕ Java API:${NC}        ${CYAN}http://localhost:8080/mshift-api${NC}"
echo -e "   ${GREEN}🗄️ PostgreSQL:${NC}      ${CYAN}localhost:5432${NC}"
echo -e "   ${GREEN}🔴 Redis:${NC}           ${CYAN}localhost:6379${NC}"
if [ ! -z "$APP_PID" ]; then
    echo -e "   ${GREEN}📱 Mobile App:${NC}      ${CYAN}http://localhost:19002${NC}"
fi

echo
echo -e "${BOLD}${PURPLE}🔧 프로세스 관리:${NC}"
echo -e "   ${WHITE}Backend PID:${NC}   ${YELLOW}$BACKEND_PID${NC}"
echo -e "   ${WHITE}Frontend PID:${NC}  ${YELLOW}$FRONTEND_PID${NC}"
if [ ! -z "$APP_PID" ]; then
    echo -e "   ${WHITE}Mobile PID:${NC}    ${YELLOW}$APP_PID${NC}"
fi

echo
echo -e "${BOLD}${GRAY}📊 로그 모니터링:${NC}"
echo -e "   ${WHITE}백엔드:${NC}        ${GRAY}tail -f backend-startup.log${NC}"
echo -e "   ${WHITE}프론트엔드:${NC}    ${GRAY}tail -f frontend-startup.log${NC}"
echo -e "   ${WHITE}통합 로그:${NC}     ${GRAY}tail -f *.log${NC}"

echo
echo -e "${BOLD}${RED}🛑 시스템 중지:${NC}"
echo -e "   ${WHITE}전체 중지:${NC}     ${GRAY}./stop-all.sh${NC}"
echo -e "   ${WHITE}개별 중지:${NC}     ${GRAY}kill $BACKEND_PID $FRONTEND_PID${NC}"

echo
echo -e "${GRAY}┌─────────────────────────────────────────────────────────────┐${NC}"
echo -e "${GRAY}│${NC} ${YELLOW}💡 팁: 각 서비스는 TDD 검증을 통과한 안정한 상태입니다${NC} ${GRAY}│${NC}"
echo -e "${GRAY}└─────────────────────────────────────────────────────────────┘${NC}"

# PID 파일 저장 (스크립트 관리용)
{
    echo "BACKEND_PID=$BACKEND_PID"
    echo "FRONTEND_PID=$FRONTEND_PID"
    echo "APP_PID=$APP_PID"
    echo "STARTED_AT=$(date)"
} > .moneyshift.pids

print_info "시스템 정보가 .moneyshift.pids 파일에 저장되었습니다"
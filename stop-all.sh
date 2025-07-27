#!/bin/bash

# MoneyShift 전체 시스템 중지 스크립트
# 안전하고 우아한 시스템 종료를 수행합니다

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

# 프리티 프린트 함수들
print_header() {
    echo
    echo -e "${BOLD}${RED}╔══════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BOLD}${RED}║${NC}  ${WHITE}🛑 MoneyShift AI Platform - 시스템 종료${NC}  ${BOLD}${RED}║${NC}"
    echo -e "${BOLD}${RED}╚══════════════════════════════════════════════════════════════╝${NC}"
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

# 프로세스 안전 종료 함수
safe_kill() {
    local pid=$1
    local name="$2"
    local timeout=10
    
    if kill -0 $pid 2>/dev/null; then
        print_progress "$name 프로세스 종료 중... (PID: $pid)"
        
        # SIGTERM으로 우아한 종료 시도
        kill -TERM $pid 2>/dev/null
        
        # 최대 10초 대기
        local count=0
        while kill -0 $pid 2>/dev/null && [ $count -lt $timeout ]; do
            sleep 1
            count=$((count + 1))
            printf "."
        done
        echo
        
        # 여전히 살아있으면 강제 종료
        if kill -0 $pid 2>/dev/null; then
            print_warning "$name이 우아한 종료에 응답하지 않아 강제 종료합니다"
            kill -KILL $pid 2>/dev/null
            sleep 1
        fi
        
        # 최종 확인
        if ! kill -0 $pid 2>/dev/null; then
            print_success "$name 프로세스 종료 완료"
            return 0
        else
            print_error "$name 프로세스 종료 실패"
            return 1
        fi
    else
        print_info "$name 프로세스가 이미 종료되었습니다"
        return 0
    fi
}

# 포트 기반 프로세스 종료 함수
kill_by_port() {
    local port=$1
    local service_name="$2"
    
    local pid=$(lsof -ti :$port 2>/dev/null)
    if [ ! -z "$pid" ]; then
        safe_kill $pid "$service_name (포트 $port)"
    else
        print_info "$service_name (포트 $port)에서 실행 중인 프로세스가 없습니다"
    fi
}

print_header

# 1. MoneyShift PID 파일 확인
if [ -f ".moneyshift.pids" ]; then
    print_section "📋 저장된 프로세스 정보 읽기"
    source .moneyshift.pids
    print_info "시스템 시작 시각: $STARTED_AT"
    echo
else
    print_section "📋 PID 파일 없음 - 수동 검색 모드"
    BACKEND_PID=$(ps aux | grep "spring-boot:run" | grep -v grep | awk '{print $2}' | head -1)
    FRONTEND_PID=$(ps aux | grep "next dev" | grep -v grep | awk '{print $2}' | head -1)
    APP_PID=$(ps aux | grep "expo start" | grep -v grep | awk '{print $2}' | head -1)
    echo
fi

# 2. 애플리케이션 서비스 종료
print_section "📱 애플리케이션 서비스 종료"

# 모바일 앱 (있는 경우)
if [ ! -z "$APP_PID" ]; then
    safe_kill $APP_PID "모바일 앱 (Expo)"
else
    kill_by_port 19002 "모바일 앱 (Expo)"
fi

# 프론트엔드 서버
if [ ! -z "$FRONTEND_PID" ]; then
    safe_kill $FRONTEND_PID "프론트엔드 서버 (NextJS)"
else
    kill_by_port 3000 "프론트엔드 서버 (NextJS)"
fi

# 백엔드 서버
if [ ! -z "$BACKEND_PID" ]; then
    safe_kill $BACKEND_PID "백엔드 서버 (Spring Boot)"
else
    kill_by_port 8080 "백엔드 서버 (Spring Boot)"
fi

echo

# 3. 데이터베이스 서비스 종료
print_section "🗄️ 데이터베이스 서비스 종료"
print_progress "Docker Compose 서비스 종료 중..."

if command -v docker-compose >/dev/null 2>&1; then
    if docker-compose down > /dev/null 2>&1; then
        print_success "Docker Compose 서비스 종료 완료"
    else
        print_warning "Docker Compose 서비스 종료 중 문제가 발생했습니다"
    fi
else
    print_info "Docker Compose가 설치되지 않았거나 실행 중인 서비스가 없습니다"
fi

# 추가 포트 정리 (혹시 모를 잔여 프로세스)
print_info "잔여 프로세스 확인 중..."
kill_by_port 5432 "PostgreSQL"
kill_by_port 6379 "Redis"

echo

# 4. 시스템 정리
print_section "🧹 시스템 정리"

# PID 파일들 정리
if [ -f ".moneyshift.pids" ]; then
    rm -f .moneyshift.pids
    print_success "PID 파일 정리 완료"
fi

# 레거시 PID 파일들도 정리
rm -f .backend.pid .frontend.pid 2>/dev/null

# 로그 파일 정리 옵션
echo -e "${BOLD}${YELLOW}┌─ 📊 로그 파일 관리${NC}"
LOG_FILES=(backend.log frontend.log backend-startup.log frontend-startup.log app-startup.log)
EXISTING_LOGS=()

for log_file in "${LOG_FILES[@]}"; do
    if [ -f "$log_file" ]; then
        EXISTING_LOGS+=("$log_file")
    fi
done

if [ ${#EXISTING_LOGS[@]} -gt 0 ]; then
    echo -e "   ${CYAN}발견된 로그 파일: ${WHITE}${#EXISTING_LOGS[@]}개${NC}"
    for log_file in "${EXISTING_LOGS[@]}"; do
        echo -e "   ${GRAY}• $log_file${NC}"
    done
    echo
    echo -e "   ${CYAN}로그 파일을 삭제하시겠습니까? ${WHITE}[y/N]${NC}: \\c"
    read -r response
    
    if [[ "$response" =~ ^[Yy]$ ]]; then
        rm -f "${EXISTING_LOGS[@]}"
        print_success "로그 파일 ${#EXISTING_LOGS[@]}개 삭제 완료"
    else
        print_info "로그 파일을 보존합니다"
    fi
else
    print_info "삭제할 로그 파일이 없습니다"
fi

echo

# 최종 요약
echo -e "${BOLD}${GREEN}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BOLD}${GREEN}║${NC}  ${WHITE}🎉 MoneyShift AI Platform 종료 완료!${NC}  ${BOLD}${GREEN}║${NC}"
echo -e "${BOLD}${GREEN}╚══════════════════════════════════════════════════════════════╝${NC}"
echo

echo -e "${BOLD}${BLUE}📊 종료된 서비스:${NC}"
echo -e "   ${GREEN}✓ 백엔드 서버${NC}     ${GRAY}(Spring Boot)${NC}"
echo -e "   ${GREEN}✓ 프론트엔드 서버${NC}  ${GRAY}(NextJS)${NC}"
echo -e "   ${GREEN}✓ 데이터베이스${NC}     ${GRAY}(PostgreSQL, Redis)${NC}"
if [ ! -z "$APP_PID" ]; then
    echo -e "   ${GREEN}✓ 모바일 앱${NC}       ${GRAY}(Expo)${NC}"
fi

echo
echo -e "${BOLD}${GRAY}🔄 시스템 재시작:${NC}"
echo -e "   ${WHITE}전체 시작:${NC}       ${GRAY}./start-all.sh${NC}"
echo -e "   ${WHITE}개별 시작:${NC}       ${GRAY}./start-backend.sh, ./start-admin.sh${NC}"

echo
echo -e "${GRAY}┌─────────────────────────────────────────────────────────────┐${NC}"
echo -e "${GRAY}│${NC} ${YELLOW}💡 팁: 모든 프로세스가 안전하게 종료되었습니다${NC} ${GRAY}│${NC}"
echo -e "${GRAY}└─────────────────────────────────────────────────────────────┘${NC}"
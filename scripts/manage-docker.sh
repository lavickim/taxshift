#!/bin/bash

# MoneyShift Docker 환경 관리 스크립트

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 로그 함수
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Docker 데몬 상태 확인
check_docker_daemon() {
    if ! docker info > /dev/null 2>&1; then
        log_error "Docker 데몬이 실행되지 않고 있습니다."
        log_info "Docker Desktop을 시작하는 중..."
        open -a Docker
        
        # Docker 데몬 시작 대기 (최대 60초)
        for i in {1..30}; do
            if docker info > /dev/null 2>&1; then
                log_success "Docker 데몬이 시작되었습니다."
                return 0
            fi
            echo -n "."
            sleep 2
        done
        
        log_error "Docker 데몬 시작에 실패했습니다."
        exit 1
    fi
}

# 포트 정리
cleanup_ports() {
    log_info "포트 정리 중..."
    
    # PostgreSQL 포트 5432
    local pg_pid=$(lsof -ti :5432 2>/dev/null || true)
    if [ ! -z "$pg_pid" ]; then
        log_warning "포트 5432에서 실행 중인 프로세스 종료: PID $pg_pid"
        kill -9 $pg_pid 2>/dev/null || true
    fi
    
    # Redis 포트 6379
    local redis_pid=$(lsof -ti :6379 2>/dev/null || true)
    if [ ! -z "$redis_pid" ]; then
        log_warning "포트 6379에서 실행 중인 프로세스 종료: PID $redis_pid"
        kill -9 $redis_pid 2>/dev/null || true
    fi
    
    sleep 2
}

# 기존 컨테이너 정리
cleanup_containers() {
    log_info "기존 MoneyShift 컨테이너 정리 중..."
    
    # 컨테이너 중지
    docker stop moneyshift-postgres moneyshift-redis 2>/dev/null || true
    
    # 컨테이너 삭제
    docker rm moneyshift-postgres moneyshift-redis 2>/dev/null || true
    
    # 사용하지 않는 볼륨 정리 (주의: 데이터 손실 가능)
    if [ "$1" = "--clean-volumes" ]; then
        log_warning "볼륨 정리 중... (데이터가 삭제됩니다!)"
        docker volume rm moneyshift_postgres_data moneyshift_redis_data 2>/dev/null || true
    fi
}

# 서비스 시작
start_services() {
    log_info "MoneyShift 서비스 시작 중..."
    
    cd "$PROJECT_ROOT"
    
    # Docker Compose로 서비스 시작
    docker-compose up -d postgres redis
    
    log_info "서비스 헬스체크 대기 중..."
    
    # PostgreSQL 헬스체크 (최대 60초)
    local postgres_ready=false
    for i in {1..30}; do
        if docker exec moneyshift-postgres pg_isready -U postgres -d moneyshift > /dev/null 2>&1; then
            postgres_ready=true
            break
        fi
        echo -n "."
        sleep 2
    done
    
    # Redis 헬스체크 (최대 30초)
    local redis_ready=false
    for i in {1..15}; do
        if docker exec moneyshift-redis redis-cli ping > /dev/null 2>&1; then
            redis_ready=true
            break
        fi
        echo -n "."
        sleep 2
    done
    
    echo ""
    
    if [ "$postgres_ready" = true ] && [ "$redis_ready" = true ]; then
        log_success "모든 서비스가 정상적으로 시작되었습니다!"
        show_status
    else
        log_error "일부 서비스 시작에 실패했습니다."
        if [ "$postgres_ready" = false ]; then
            log_error "PostgreSQL 시작 실패"
        fi
        if [ "$redis_ready" = false ]; then
            log_error "Redis 시작 실패"
        fi
        
        log_info "컨테이너 로그:"
        docker-compose logs --tail=20
        exit 1
    fi
}

# 서비스 상태 표시
show_status() {
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "🚀 MoneyShift 개발 환경 상태"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    docker-compose ps
    
    echo ""
    echo "📊 서비스 접속 정보:"
    echo "🐘 PostgreSQL: localhost:5432"
    echo "   └─ 데이터베이스: moneyshift"
    echo "   └─ 사용자: postgres"
    echo "   └─ 비밀번호: postgres"
    echo "🔴 Redis: localhost:6379"
    echo "   └─ 메모리: 256MB (LRU 정책)"
    echo ""
    echo "📋 유용한 명령어:"
    echo "   docker-compose logs [서비스명]  # 로그 확인"
    echo "   docker-compose down            # 서비스 중지"
    echo "   docker exec -it moneyshift-postgres psql -U postgres -d moneyshift"
    echo "   docker exec -it moneyshift-redis redis-cli"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
}

# 서비스 중지
stop_services() {
    log_info "MoneyShift 서비스 중지 중..."
    cd "$PROJECT_ROOT"
    docker-compose down
    log_success "서비스가 중지되었습니다."
}

# 메인 로직
case "${1:-start}" in
    "start")
        check_docker_daemon
        cleanup_ports
        cleanup_containers
        start_services
        ;;
    "stop")
        stop_services
        ;;
    "restart")
        check_docker_daemon
        stop_services
        cleanup_ports
        cleanup_containers
        start_services
        ;;
    "status")
        show_status
        ;;
    "clean")
        check_docker_daemon
        stop_services
        cleanup_ports
        cleanup_containers --clean-volumes
        log_success "환경이 완전히 정리되었습니다."
        ;;
    "logs")
        cd "$PROJECT_ROOT"
        docker-compose logs -f ${2:-}
        ;;
    *)
        echo "사용법: $0 [start|stop|restart|status|clean|logs]"
        echo ""
        echo "명령어:"
        echo "  start   - 서비스 시작 (기본값)"
        echo "  stop    - 서비스 중지"  
        echo "  restart - 서비스 재시작"
        echo "  status  - 서비스 상태 확인"
        echo "  clean   - 완전 정리 (볼륨 포함)"
        echo "  logs    - 로그 확인"
        exit 1
        ;;
esac
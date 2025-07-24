#!/bin/bash

# 전체 시스템 시작 스크립트 (백그라운드에서 실행)

echo "🚀 MoneyShift 전체 시스템 시작 중..."
echo "======================================"

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

# 스크립트 디렉토리
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo -e "${BLUE}1. 데이터베이스 서비스 시작...${NC}"
bash "$SCRIPT_DIR/start-db.sh"

echo ""
echo -e "${YELLOW}데이터베이스가 시작되길 기다리는 중... (10초)${NC}"
sleep 10

echo ""
echo -e "${BLUE}2. Java API 서버 시작 (TDD 검증 포함)...${NC}"
# 포트 8080 정리
PORT_8080_PID=$(lsof -ti :8080 2>/dev/null)
if [ ! -z "$PORT_8080_PID" ]; then
    echo "🔥 포트 8080 기존 프로세스 종료 중... (PID: $PORT_8080_PID)"
    kill -9 $PORT_8080_PID 2>/dev/null || true
    sleep 2
fi

if ! bash "$SCRIPT_DIR/start-backend.sh"; then
    echo -e "${RED}❌ 백엔드 서버 시작 실패! TDD 검증을 통과하지 못했습니다.${NC}"
    exit 1
fi
BACKEND_PID=$(ps aux | grep "spring-boot:run" | grep -v grep | awk '{print $2}' | head -1)
echo "Backend PID: $BACKEND_PID"

echo ""
echo -e "${BLUE}3. NextJS Admin 서버 시작 (TDD 검증 포함)...${NC}"
echo -e "${YELLOW}⚠️ TDD 검증으로 인해 시작 시간이 더 소요될 수 있습니다...${NC}"
# 포트 3000 정리
PORT_3000_PID=$(lsof -ti :3000 2>/dev/null)
if [ ! -z "$PORT_3000_PID" ]; then
    echo "🔥 포트 3000 기존 프로세스 종료 중... (PID: $PORT_3000_PID)"
    kill -9 $PORT_3000_PID 2>/dev/null || true
    sleep 2
fi

if ! bash "$SCRIPT_DIR/start-admin.sh"; then
    echo -e "${RED}❌ 프론트엔드 서버 시작 실패! TDD 검증을 통과하지 못했습니다.${NC}"
    echo -e "${RED}백엔드 프로세스 종료 중...${NC}"
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null || true
    fi
    exit 1
fi
FRONTEND_PID=$(ps aux | grep "next dev" | grep -v grep | awk '{print $2}' | head -1)
echo "Admin Frontend PID: $FRONTEND_PID"

# 선택사항: 모바일 앱 시작 여부 확인
echo ""
echo -e "${YELLOW}모바일 앱도 시작하시겠습니까? (y/N)${NC}"
read -r response
if [[ "$response" =~ ^[Yy]$ ]]; then
    echo ""
    echo -e "${BLUE}4. 모바일 앱 시작 (TDD 검증 포함)...${NC}"
    if ! bash "$SCRIPT_DIR/start-app.sh"; then
        echo -e "${RED}❌ 모바일 앱 시작 실패! TDD 검증을 통과하지 못했습니다.${NC}"
        echo -e "${YELLOW}⚠️ 모바일 앱을 제외하고 다른 서비스들은 계속 실행됩니다.${NC}"
    else
        APP_PID=$(ps aux | grep "expo start" | grep -v grep | awk '{print $2}' | head -1)
        echo "Mobile App PID: $APP_PID"
    fi
fi

echo ""
echo -e "${GREEN}✅ 모든 서비스 시작 완료!${NC}"
echo "======================================"
echo -e "${GREEN}🌐 NextJS Admin Panel: http://localhost:3000${NC}"
echo -e "${GREEN}☕ Java API Server: http://localhost:8080${NC}"
echo -e "${GREEN}🗄️ PostgreSQL: localhost:5432${NC}"
echo -e "${GREEN}🔴 Redis: localhost:6379${NC}"
echo ""
echo "프로세스 ID:"
echo "  Backend PID: $BACKEND_PID"
echo "  Frontend PID: $FRONTEND_PID"
echo ""
echo "로그 확인:"
echo "  Backend: tail -f backend.log"
echo "  Frontend: tail -f frontend.log"
echo ""
echo "전체 중지: ./stop-all.sh"
echo "개별 중지: kill $BACKEND_PID $FRONTEND_PID"
echo "======================================"

# PID 파일 저장
echo "$BACKEND_PID" > .backend.pid
echo "$FRONTEND_PID" > .frontend.pid
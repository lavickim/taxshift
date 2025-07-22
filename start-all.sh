#!/bin/bash

# 전체 시스템 시작 스크립트 (백그라운드에서 실행)

echo "🚀 MoneyShift 전체 시스템 시작 중..."
echo "======================================"

# 색상 정의
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

# 스크립트 디렉토리
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo -e "${BLUE}1. 데이터베이스 서비스 시작...${NC}"
bash "$SCRIPT_DIR/scripts/setup/start-db.sh"

echo ""
echo -e "${YELLOW}데이터베이스가 시작되길 기다리는 중... (5초)${NC}"
sleep 5

echo ""
echo -e "${BLUE}2. Java API 서버 백그라운드 시작...${NC}"
bash "$SCRIPT_DIR/scripts/setup/start-backend.sh" > backend.log 2>&1 &
BACKEND_PID=$!
echo "Backend PID: $BACKEND_PID"

echo ""
echo -e "${YELLOW}API 서버가 시작되길 기다리는 중... (10초)${NC}"
sleep 10

echo ""
echo -e "${BLUE}3. NextJS 프론트엔드 서버 백그라운드 시작...${NC}"
bash "$SCRIPT_DIR/scripts/setup/start-frontend.sh" > frontend.log 2>&1 &
FRONTEND_PID=$!
echo "Frontend PID: $FRONTEND_PID"

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
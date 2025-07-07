#!/bin/bash

# 전체 시스템 중지 스크립트

echo "🛑 MoneyShift 전체 시스템 중지 중..."
echo "======================================"

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

# PID 파일에서 프로세스 ID 읽기
if [ -f ".backend.pid" ]; then
    BACKEND_PID=$(cat .backend.pid)
    echo -e "${YELLOW}Backend 서버 중지 중... (PID: $BACKEND_PID)${NC}"
    kill $BACKEND_PID 2>/dev/null && echo -e "${GREEN}✅ Backend 서버 중지됨${NC}" || echo -e "${RED}❌ Backend 서버 중지 실패 또는 이미 중지됨${NC}"
    rm -f .backend.pid
else
    echo -e "${YELLOW}Backend PID 파일 없음. 수동으로 중지...${NC}"
    pkill -f "spring-boot:run" && echo -e "${GREEN}✅ Backend 서버 중지됨${NC}" || echo -e "${YELLOW}Backend 서버가 실행 중이지 않음${NC}"
fi

if [ -f ".frontend.pid" ]; then
    FRONTEND_PID=$(cat .frontend.pid)
    echo -e "${YELLOW}Frontend 서버 중지 중... (PID: $FRONTEND_PID)${NC}"
    kill $FRONTEND_PID 2>/dev/null && echo -e "${GREEN}✅ Frontend 서버 중지됨${NC}" || echo -e "${RED}❌ Frontend 서버 중지 실패 또는 이미 중지됨${NC}"
    rm -f .frontend.pid
else
    echo -e "${YELLOW}Frontend PID 파일 없음. 수동으로 중지...${NC}"
    pkill -f "next dev" && echo -e "${GREEN}✅ Frontend 서버 중지됨${NC}" || echo -e "${YELLOW}Frontend 서버가 실행 중이지 않음${NC}"
fi

echo -e "${YELLOW}데이터베이스 서비스 중지 중...${NC}"
docker-compose down

echo ""
echo -e "${GREEN}✅ 모든 서비스 중지 완료!${NC}"
echo "======================================"

# 로그 파일 정리 (선택적)
read -p "로그 파일을 삭제하시겠습니까? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    rm -f backend.log frontend.log
    echo -e "${GREEN}✅ 로그 파일 삭제됨${NC}"
fi
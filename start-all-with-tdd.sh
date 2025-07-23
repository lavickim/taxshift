#!/bin/bash

# MoneyShift 전체 시스템 - TDD 기반 시작 스크립트
# 모든 서비스의 테스트가 통과해야만 시스템이 시작됩니다.

set -e

echo "🧪 MoneyShift 전체 시스템 - TDD 체크 시작..."
echo "================================================"

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 성공/실패 카운터
TOTAL_SERVICES=3
PASSED_SERVICES=0
FAILED_SERVICES=()

# 프로젝트 루트 디렉토리 확인
if [ ! -f "package.json" ] && [ ! -f "mshift-admin/package.json" ]; then
    echo -e "${RED}❌ MoneyShift 프로젝트 루트 디렉토리가 아닙니다.${NC}"
    exit 1
fi

echo -e "${BLUE}📋 테스트할 서비스 목록:${NC}"
echo "   1. 🗄️ Database & Redis"
echo "   2. ☕ Java API Backend (mshift-api)"
echo "   3. 🌐 NextJS Admin (mshift-admin)" 
echo "   4. 📱 React Native Mobile (mshift-app)"
echo ""

# 1. 데이터베이스 상태 체크
echo -e "${YELLOW}🗄️ [1/4] Database & Redis 상태 체크...${NC}"
if ! ./start-db.sh > /dev/null 2>&1; then
    echo -e "${RED}❌ 데이터베이스 시작 실패${NC}"
    FAILED_SERVICES+=("Database")
else
    echo -e "${GREEN}✅ Database & Redis 준비 완료${NC}"
fi

# 2. Java API Backend TDD 체크
echo -e "${YELLOW}☕ [2/4] Java API Backend TDD 체크...${NC}"
cd mshift-api
if ./start-with-tdd.sh --test-only; then
    echo -e "${GREEN}✅ Java API Backend 테스트 통과${NC}"
    ((PASSED_SERVICES++))
else
    echo -e "${RED}❌ Java API Backend 테스트 실패${NC}"
    FAILED_SERVICES+=("Java-API")
fi
cd ..

# 3. NextJS Admin TDD 체크
echo -e "${YELLOW}🌐 [3/4] NextJS Admin TDD 체크...${NC}"
cd mshift-admin
if ./start-with-tdd.sh --test-only; then
    echo -e "${GREEN}✅ NextJS Admin 테스트 통과${NC}"
    ((PASSED_SERVICES++))
else
    echo -e "${RED}❌ NextJS Admin 테스트 실패${NC}"
    FAILED_SERVICES+=("NextJS-Admin")
fi
cd ..

# 4. React Native Mobile TDD 체크  
echo -e "${YELLOW}📱 [4/4] React Native Mobile TDD 체크...${NC}"
cd mshift-app
if ./start-with-tdd.sh --test-only; then
    echo -e "${GREEN}✅ React Native Mobile 테스트 통과${NC}"
    ((PASSED_SERVICES++))
else
    echo -e "${RED}❌ React Native Mobile 테스트 실패${NC}"
    FAILED_SERVICES+=("React-Native")
fi
cd ..

# 결과 요약
echo ""
echo "================================================"
echo -e "${BLUE}📊 TDD 체크 결과 요약${NC}"
echo "================================================"
echo -e "${GREEN}✅ 성공: ${PASSED_SERVICES}/${TOTAL_SERVICES}${NC}"

if [ ${#FAILED_SERVICES[@]} -gt 0 ]; then
    echo -e "${RED}❌ 실패한 서비스: ${FAILED_SERVICES[*]}${NC}"
    echo ""
    echo -e "${RED}🚫 일부 서비스의 테스트가 실패했습니다.${NC}"
    echo "각 서비스별 테스트를 개별적으로 실행하세요:"
    echo ""
    for service in "${FAILED_SERVICES[@]}"; do
        case $service in
            "Java-API")
                echo "  cd mshift-api && ./start-with-tdd.sh"
                ;;
            "NextJS-Admin")
                echo "  cd mshift-admin && ./start-with-tdd.sh" 
                ;;
            "React-Native")
                echo "  cd mshift-app && ./start-with-tdd.sh"
                ;;
            "Database")
                echo "  ./start-db.sh"
                ;;
        esac
    done
    echo ""
    exit 1
fi

# 모든 테스트 통과 - 시스템 시작
echo -e "${GREEN}🎉 모든 TDD 체크 통과!${NC}"
echo "================================================"
echo -e "${BLUE}🚀 MoneyShift 전체 시스템 시작 중...${NC}"
echo ""

# tmux 세션이 있으면 종료
if tmux has-session -t moneyshift 2>/dev/null; then
    echo "기존 MoneyShift tmux 세션을 종료합니다..."
    tmux kill-session -t moneyshift
fi

# 새 tmux 세션으로 각 서비스 시작
echo "각 서비스를 별도 tmux 창에서 시작합니다..."

# tmux 세션 생성 및 서비스 시작
tmux new-session -d -s moneyshift -n backend 'cd mshift-api && mvn spring-boot:run'
tmux new-window -t moneyshift:1 -n admin 'cd mshift-admin && yarn dev'
tmux new-window -t moneyshift:2 -n mobile 'cd mshift-app && yarn start'

echo ""
echo -e "${GREEN}✅ 모든 서비스가 시작되었습니다!${NC}"
echo ""
echo -e "${BLUE}📡 서비스 URL:${NC}"
echo "  🌐 Admin:  http://localhost:3000"
echo "  ☕ API:    http://localhost:8080"
echo "  📱 Mobile: http://localhost:8081 (Expo)"
echo ""
echo -e "${YELLOW}💡 tmux 세션 관리:${NC}"
echo "  tmux attach -t moneyshift  # 세션 연결"
echo "  tmux list-sessions         # 세션 목록"
echo "  tmux kill-session -t moneyshift  # 세션 종료"
echo ""
echo -e "${GREEN}🎯 TDD 기반 개발이 활성화되었습니다!${NC}"
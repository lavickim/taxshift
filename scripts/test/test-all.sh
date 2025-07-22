#!/bin/bash

# MoneyShift 전체 시스템 - TDD 테스트 전용 스크립트
# 서버 시작 없이 모든 테스트만 실행합니다.

set -e

echo "🧪 MoneyShift 전체 시스템 - TDD 테스트 실행..."
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

# 시작 시간
START_TIME=$(date +%s)

echo -e "${BLUE}📋 테스트할 서비스 목록:${NC}"
echo "   1. ☕ Java API Backend (mshift-api)"
echo "   2. 🌐 NextJS Admin (mshift-admin)" 
echo "   3. 📱 React Native Mobile (mshift-app)"
echo ""

# 1. Java API Backend TDD 테스트
echo -e "${YELLOW}☕ [1/3] Java API Backend TDD 테스트...${NC}"
cd mshift-api
if ./start-with-tdd.sh --test-only; then
    echo -e "${GREEN}✅ Java API Backend 테스트 통과${NC}"
    ((PASSED_SERVICES++))
else
    echo -e "${RED}❌ Java API Backend 테스트 실패${NC}"
    FAILED_SERVICES+=("Java-API")
fi
cd ..

# 2. NextJS Admin TDD 테스트
echo -e "${YELLOW}🌐 [2/3] NextJS Admin TDD 테스트...${NC}"
cd mshift-admin
if timeout 120 ./start-with-tdd.sh --test-only; then
    echo -e "${GREEN}✅ NextJS Admin 테스트 통과${NC}"
    ((PASSED_SERVICES++))
else
    echo -e "${RED}❌ NextJS Admin 테스트 실패${NC}"
    FAILED_SERVICES+=("NextJS-Admin")
fi
cd ..

# 3. React Native Mobile TDD 테스트
echo -e "${YELLOW}📱 [3/3] React Native Mobile TDD 테스트...${NC}"
cd mshift-app
if timeout 120 ./start-with-tdd.sh --test-only; then
    echo -e "${GREEN}✅ React Native Mobile 테스트 통과${NC}"
    ((PASSED_SERVICES++))
else
    echo -e "${RED}❌ React Native Mobile 테스트 실패${NC}"
    FAILED_SERVICES+=("React-Native")
fi
cd ..

# 실행 시간 계산
END_TIME=$(date +%s)
DURATION=$((END_TIME - START_TIME))

# 결과 요약
echo ""
echo "================================================"
echo -e "${BLUE}📊 전체 TDD 테스트 결과 요약${NC}"
echo "================================================"
echo -e "${GREEN}✅ 성공: ${PASSED_SERVICES}/${TOTAL_SERVICES}${NC}"
echo -e "${BLUE}⏱️ 총 실행 시간: ${DURATION}초${NC}"

if [ ${#FAILED_SERVICES[@]} -gt 0 ]; then
    echo -e "${RED}❌ 실패한 서비스: ${FAILED_SERVICES[*]}${NC}"
    echo ""
    echo -e "${RED}🚫 일부 서비스의 테스트가 실패했습니다.${NC}"
    echo "각 서비스별 테스트를 개별적으로 실행하세요:"
    echo ""
    for service in "${FAILED_SERVICES[@]}"; do
        case $service in
            "Java-API")
                echo "  cd mshift-api && mvn test"
                ;;
            "NextJS-Admin")
                echo "  cd mshift-admin && yarn test" 
                ;;
            "React-Native")
                echo "  cd mshift-app && yarn test"
                ;;
        esac
    done
    echo ""
    exit 1
else
    echo ""
    echo -e "${GREEN}🎉 모든 TDD 테스트가 성공적으로 통과했습니다!${NC}"
    echo -e "${GREEN}✨ 코드 품질이 검증되었습니다. 안전하게 배포할 수 있습니다.${NC}"
    echo ""
    echo -e "${BLUE}🚀 시스템을 시작하려면 다음 명령어를 실행하세요:${NC}"
    echo "  ./start-all-with-tdd.sh"
    echo ""
fi
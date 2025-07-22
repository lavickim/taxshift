#!/bin/bash

# 통합 테스트 실행 스크립트

echo "🧪 MoneyShift 통합 테스트 실행..."
echo "================================="

# 스크립트 디렉토리
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# 서비스 상태 확인
echo "📡 서비스 상태 확인..."

# NextJS 서버 확인
if curl -s --connect-timeout 5 http://localhost:3000 > /dev/null; then
    echo "✅ NextJS 서버 실행 중"
else
    echo "❌ NextJS 서버가 실행되지 않음"
    echo "실행: ./start-frontend.sh"
    exit 1
fi

# Java API 서버 확인
if curl -s --connect-timeout 5 http://localhost:8080/api/rule-engine/rules > /dev/null; then
    echo "✅ Java API 서버 실행 중"
else
    echo "❌ Java API 서버가 실행되지 않음"
    echo "실행: ./start-backend.sh"
    exit 1
fi

echo ""
echo "🚀 통합 테스트 시작..."
exec "$SCRIPT_DIR/scripts/test-integrated.sh"
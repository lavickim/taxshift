#!/bin/bash

echo "🧪 모바일 앱 자동 테스트 스크립트"
echo "================================="

# API 서버 상태 확인
echo "1️⃣ API 서버 상태 확인..."
if ! curl -s http://localhost:8080/api/rule-engine/health > /dev/null 2>&1; then
    echo "❌ API 서버가 실행되지 않았습니다."
    echo "   ./start-backend.sh 를 먼저 실행해주세요."
    exit 1
fi
echo "✅ API 서버 실행 중"

# 기존 Expo 프로세스 종료
echo "2️⃣ 기존 Expo 프로세스 정리..."
pkill -f "expo start" 2>/dev/null || true
pkill -f "webpack" 2>/dev/null || true
sleep 2

# Node.js 의존성 확인
echo "3️⃣ Node.js 의존성 확인..."
cd mshift-app/MoneyShift
if [ ! -d "node_modules" ]; then
    echo "📦 의존성 설치 중..."
    npm install
fi

# Puppeteer 테스트 실행
echo "4️⃣ Puppeteer 자동 테스트 실행..."
cd ../..
node test-mobile-app.js

echo "================================="
echo "🎉 테스트 완료!"
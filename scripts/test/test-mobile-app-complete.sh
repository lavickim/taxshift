#!/bin/bash

echo "🚀 MoneyShift 모바일 앱 완전 자동 테스트"
echo "========================================="

# 기존 프로세스 정리
echo "🧹 기존 프로세스 정리..."
pkill -f "mvn spring-boot:run" 2>/dev/null || true
pkill -f "expo start" 2>/dev/null || true
pkill -f "webpack" 2>/dev/null || true
sleep 3

# API 서버 시작
echo "🔧 API 서버 시작..."
cd mshift-api
mvn spring-boot:run > ../server.log 2>&1 &
SERVER_PID=$!
cd ..

# API 서버 시작 대기
echo "⏱️ API 서버 시작 대기..."
for i in {1..30}; do
    if curl -s http://localhost:8080/api/rule-engine/health > /dev/null 2>&1; then
        echo "✅ API 서버 시작 완료"
        break
    fi
    if [ $i -eq 30 ]; then
        echo "❌ API 서버 시작 실패"
        exit 1
    fi
    echo "   대기 중... ($i/30)"
    sleep 2
done

# 모바일 앱 의존성 확인
echo "📦 모바일 앱 의존성 확인..."
cd mshift-app/MoneyShift
if [ ! -d "node_modules" ]; then
    npm install
fi
cd ../..

# Puppeteer 테스트 실행
echo "🧪 Puppeteer 자동 테스트 시작..."
echo "   - 브라우저 창이 열리고 개발자 도구가 표시됩니다"
echo "   - 테스트 진행 과정을 확인할 수 있습니다"
echo "   - 테스트는 약 2-3분 소요됩니다"
echo ""

node test-mobile-app.js

echo ""
echo "========================================="
echo "🎉 테스트 완료!"
echo ""
echo "📊 생성된 파일:"
echo "   - test-account-screen.png: 계좌 화면 스크린샷"
echo "   - test-final-screen.png: 최종 화면 스크린샷"
echo "   - server.log: API 서버 로그"
echo ""
echo "🧹 정리 작업..."
kill $SERVER_PID 2>/dev/null || true
pkill -f "expo start" 2>/dev/null || true
pkill -f "webpack" 2>/dev/null || true

echo "✅ 모든 작업 완료!"
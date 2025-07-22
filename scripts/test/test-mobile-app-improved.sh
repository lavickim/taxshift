#!/bin/bash

echo "🚀 MoneyShift 모바일 앱 개선된 자동 테스트"
echo "=========================================="

# 기존 프로세스 정리
echo "🧹 기존 프로세스 정리..."
pkill -f "mvn spring-boot:run" 2>/dev/null || true
pkill -f "expo start" 2>/dev/null || true
pkill -f "webpack" 2>/dev/null || true
lsof -ti:8080 | xargs kill -9 2>/dev/null || true
lsof -ti:8081 | xargs kill -9 2>/dev/null || true
lsof -ti:19006 | xargs kill -9 2>/dev/null || true
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
        echo "서버 로그 확인:"
        tail -20 server.log
        exit 1
    fi
    echo "   대기 중... ($i/30)"
    sleep 2
done

# API 상태 확인
echo "🔍 API 상태 확인..."
echo "   Health Check: $(curl -s http://localhost:8080/api/rule-engine/health)"
echo "   Transaction Health: $(curl -s http://localhost:8080/api/transactions/health)"

# 모바일 앱 의존성 확인
echo "📦 모바일 앱 의존성 확인..."
cd mshift-app/MoneyShift
if [ ! -d "node_modules" ]; then
    echo "   Installing dependencies..."
    npm install
fi
cd ../..

# Expo 웹 종속성 확인
echo "🌐 Expo 웹 종속성 확인..."
cd mshift-app/MoneyShift
npm list react-dom > /dev/null 2>&1 || {
    echo "   Installing web dependencies..."
    npx expo install react-dom react-native-web @expo/metro-runtime
}
cd ../..

# 개선된 Puppeteer 테스트 실행
echo ""
echo "🧪 개선된 Puppeteer 테스트 시작..."
echo "   - 상세한 로그 분석 포함"
echo "   - API 요청/응답 모니터링"
echo "   - 콘솔 로그 캡처"
echo "   - 화면 상태 분석"
echo "   - 테스트는 약 3-4분 소요됩니다"
echo ""

node test-mobile-app-improved.js

echo ""
echo "========================================="
echo "🎉 개선된 테스트 완료!"
echo ""
echo "📊 생성된 파일:"
echo "   - test-improved-screenshot.png: 상세 화면 스크린샷"
echo "   - test-improved-report.json: 상세 테스트 보고서"
echo "   - server.log: API 서버 로그"
echo ""

# 간단한 결과 분석
if [ -f "test-improved-report.json" ]; then
    echo "📈 테스트 결과 요약:"
    echo "   - API 호출 수: $(grep -o '"totalApiCalls":[0-9]*' test-improved-report.json | cut -d: -f2)"
    echo "   - 성공한 API 호출: $(grep -o '"successfulApiCalls":[0-9]*' test-improved-report.json | cut -d: -f2)"
    echo "   - 실패한 API 호출: $(grep -o '"failedApiCalls":[0-9]*' test-improved-report.json | cut -d: -f2)"
    echo ""
fi

# 서버 로그에서 CORS 에러 확인
echo "🔍 CORS 에러 확인:"
CORS_ERRORS=$(grep -c "origin is not allowed" server.log 2>/dev/null || echo "0")
if [ $CORS_ERRORS -gt 0 ]; then
    echo "   ⚠️ CORS 에러 발견: $CORS_ERRORS 개"
    echo "   최근 CORS 에러:"
    grep "origin is not allowed" server.log | tail -3
else
    echo "   ✅ CORS 에러 없음"
fi

echo ""
echo "🧹 정리 작업..."
kill $SERVER_PID 2>/dev/null || true
pkill -f "expo start" 2>/dev/null || true
pkill -f "webpack" 2>/dev/null || true
lsof -ti:8080 | xargs kill -9 2>/dev/null || true
lsof -ti:8081 | xargs kill -9 2>/dev/null || true
lsof -ti:19006 | xargs kill -9 2>/dev/null || true

echo "✅ 모든 작업 완료!"
echo ""
echo "💡 참고:"
echo "   - 상세 로그는 test-improved-report.json에서 확인하세요"
echo "   - 화면 상태는 test-improved-screenshot.png에서 확인하세요"
echo "   - API 서버 로그는 server.log에서 확인하세요"
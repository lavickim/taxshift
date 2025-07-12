#!/bin/bash

echo "🚀 MoneyShift 모바일 앱 네트워크 탭 테스트"
echo "============================================"

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

# 실제 API 데이터 확인
echo "📊 API 데이터 미리보기..."
echo "   Transaction Data (처음 200자):"
TRANSACTION_DATA=$(curl -s http://localhost:8080/api/transactions/bank-a)
echo "   ${TRANSACTION_DATA:0:200}..."

# 모바일 앱 의존성 확인
echo "📦 모바일 앱 의존성 확인..."
cd mshift-app/MoneyShift
if [ ! -d "node_modules" ]; then
    echo "   Installing dependencies..."
    npm install
fi

# Expo 웹 종속성 확인
npm list react-dom > /dev/null 2>&1 || {
    echo "   Installing web dependencies..."
    npx expo install react-dom react-native-web @expo/metro-runtime
}
cd ../..

# 네트워크 탭 테스트 실행
echo ""
echo "🧪 네트워크 탭 상세 테스트 시작..."
echo "   ================================================"
echo "   ✨ 이 테스트는 다음을 수행합니다:"
echo "   1. 🌐 브라우저에서 앱 로드"
echo "   2. 🔧 개발자 도구 자동 열기"
echo "   3. 📋 네트워크 탭으로 이동"
echo "   4. 🔄 API 호출 유발 (계좌 탭 클릭)"
echo "   5. 🎯 네트워크에서 API 요청 클릭"
echo "   6. 📸 각 단계별 스크린샷 저장"
echo "   7. 📊 응답 데이터 상세 확인"
echo "   ================================================"
echo "   ⏱️ 테스트는 약 3-4분 소요됩니다"
echo "   👀 브라우저 창을 보면서 진행 과정을 확인하세요!"
echo ""

node test-mobile-app-network.js

echo ""
echo "============================================"
echo "🎉 네트워크 탭 테스트 완료!"
echo ""
echo "📸 생성된 스크린샷들:"
echo "   - test-network-devtools-full.png: 전체 개발자 도구 화면"
echo "   - test-network-tab-detail.png: 네트워크 탭 상세 화면"
echo "   - test-network-final-response.png: API 응답 상세 화면"
echo ""
echo "📊 생성된 보고서:"
echo "   - test-network-report.json: 상세 네트워크 분석 보고서"
echo "   - server.log: API 서버 로그"
echo ""

# 결과 분석
if [ -f "test-network-report.json" ]; then
    echo "📈 테스트 결과 요약:"
    API_CALLS=$(grep -o '"totalApiCalls":[0-9]*' test-network-report.json | cut -d: -f2 2>/dev/null || echo "0")
    SUCCESS_CALLS=$(grep -o '"successfulApiCalls":[0-9]*' test-network-report.json | cut -d: -f2 2>/dev/null || echo "0")
    FAILED_CALLS=$(grep -o '"failedApiCalls":[0-9]*' test-network-report.json | cut -d: -f2 2>/dev/null || echo "0")
    
    echo "   🌐 총 API 호출: $API_CALLS 개"
    echo "   ✅ 성공한 호출: $SUCCESS_CALLS 개"
    echo "   ❌ 실패한 호출: $FAILED_CALLS 개"
    echo ""
    
    if [ "$SUCCESS_CALLS" -gt 0 ]; then
        echo "   🎯 API 통신 상태: 정상"
    else
        echo "   ⚠️ API 통신 상태: 확인 필요"
    fi
fi

# 서버 로그에서 실제 API 호출 확인
echo "🔍 서버 로그 분석:"
BANK_A_CALLS=$(grep -c "bank-a transactions" server.log 2>/dev/null || echo "0")
HEALTH_CALLS=$(grep -c "rule-engine/health" server.log 2>/dev/null || echo "0")

echo "   📊 bank-a API 호출: $BANK_A_CALLS 회"
echo "   💚 health check 호출: $HEALTH_CALLS 회"

if [ $BANK_A_CALLS -gt 0 ]; then
    echo "   ✅ 거래 데이터 API 정상 호출됨"
    echo "   최근 거래 API 호출 로그:"
    grep "bank-a transactions" server.log | tail -2 | sed 's/^/      /'
else
    echo "   ⚠️ 거래 데이터 API 호출 확인되지 않음"
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
echo "💡 확인 방법:"
echo "   1. test-network-devtools-full.png - 전체 개발자 도구 확인"
echo "   2. test-network-tab-detail.png - 네트워크 요청 목록 확인"
echo "   3. test-network-final-response.png - API 응답 데이터 확인"
echo "   4. test-network-report.json - 상세 분석 보고서 확인"
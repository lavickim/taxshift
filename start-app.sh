#!/bin/bash

# MoneyShift 모바일 앱 시작 스크립트

echo "📱 MoneyShift 모바일 앱 시작..."
echo "============================="

# mshift-app 디렉토리로 이동
cd "$(dirname "$0")/mshift-app"

# Expo 관련 포트들 자동 정리 (8081: Metro, 19002: Dev Tools)
echo "🔥 Expo 관련 포트 정리 중..."
for port in 8081 19002; do
    PORT_PID=$(lsof -ti :$port 2>/dev/null)
    if [ ! -z "$PORT_PID" ]; then
        echo "🔥 포트 $port 기존 프로세스 종료 중... (PID: $PORT_PID)"
        kill -9 $PORT_PID 2>/dev/null || true
    fi
done
sleep 2

# 테스트 건너뛰기 (개발 모드)
echo "🧪 테스트 건너뛰기 (개발 모드)"
echo "💡 테스트가 필요한 경우 별도로 실행하세요"
echo "============================="

# 의존성 설치 확인 (yarn 사용)
if [ ! -d "node_modules" ]; then
    echo "🔧 의존성 설치 중..."
    yarn install
fi

# Expo 개발 서버 시작
echo "🚀 Expo 개발 서버 시작..."
echo "QR 코드를 스캔하여 앱을 실행하세요"
echo "Android: expo start --android"
echo "iOS: expo start --ios"
echo "웹: expo start --web"
echo "중단: Ctrl+C"
echo "============================="

# 시스템 PATH에서 expo 찾기
EXPO_PATH=$(which expo 2>/dev/null)
NPM_GLOBAL_PATH=$(npm config get prefix 2>/dev/null)/bin

# PATH에 npm 글로벌 경로 추가
export PATH="$NPM_GLOBAL_PATH:$PATH"

# Expo CLI 확인
if command -v expo &> /dev/null; then
    echo "✅ Expo CLI 발견: $(which expo)"
    echo "🧹 캐시 클리어 후 시작..."
    expo start --clear
elif [ -f "$NPM_GLOBAL_PATH/expo" ]; then
    echo "✅ Expo CLI 발견: $NPM_GLOBAL_PATH/expo"
    echo "🧹 캐시 클리어 후 시작..."
    "$NPM_GLOBAL_PATH/expo" start --clear
else
    echo "🔧 Expo CLI 설치 중..."
    npm install -g @expo/cli
    echo "🧹 캐시 클리어 후 시작..."
    npx expo start --clear
fi
#!/bin/bash

# 모바일 앱 시작 스크립트

echo "📱 MoneyShift 모바일 앱 시작 중..."
echo "================================="

# mshift-app 디렉토리로 이동
cd "$(dirname "$0")/mshift-app"

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
echo "================================="

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
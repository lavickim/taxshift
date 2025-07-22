#!/bin/bash

# mshift-app 환경 설정 스크립트

echo "📱 MoneyShift 모바일 앱 환경 설정 중..."
echo "================================================"

# mshift-app 디렉토리로 이동
cd "$(dirname "$0")/mshift-app"

echo "🧹 기존 캐시 및 의존성 정리 중..."

# 기존 node_modules와 lock 파일 제거
rm -rf node_modules
rm -f yarn.lock
rm -f package-lock.json

# .expo 캐시 제거
rm -rf .expo

# Expo CLI 확인 및 설치
if ! command -v expo &> /dev/null; then
    echo "🔧 Expo CLI 설치 중..."
    npm install -g @expo/cli
fi

echo "📦 의존성 재설치 중..."
yarn install

echo "✅ 환경 설정 완료!"
echo "================================================"
echo "이제 다음 명령어로 앱을 시작할 수 있습니다:"
echo "  ./start-app.sh"
echo "  또는"
echo "  cd mshift-app && expo start --clear"
echo "================================================"
#!/bin/bash

# 모바일 앱 시작 스크립트

echo "📱 MoneyShift 모바일 앱 시작 중..."
echo "================================="

# mshift-app 디렉토리로 이동
cd "$(dirname "$0")/mshift-app"

# 의존성 설치 확인
if [ ! -d "node_modules" ]; then
    echo "🔧 의존성 설치 중..."
    npm install
fi

# Expo 개발 서버 시작
echo "🚀 Expo 개발 서버 시작..."
echo "QR 코드를 스캔하여 앱을 실행하세요"
echo "Android: expo start --android"
echo "iOS: expo start --ios"
echo "웹: expo start --web"
echo "중단: Ctrl+C"
echo "================================="

npm start
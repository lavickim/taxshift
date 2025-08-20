#!/bin/bash

# Trojan Horse 앱 실행 스크립트
# React Native 앱을 포트 3001(Metro) 및 19006(Web)에서 실행

echo "📱 Trojan Horse 앱 시작 중..."

# 현재 디렉토리 확인
if [[ ! -d "mshift-trojan-app" ]]; then
    echo "❌ 오류: mshift-trojan-app 디렉토리를 찾을 수 없습니다."
    echo "   MoneyShift 프로젝트 루트에서 실행해주세요."
    exit 1
fi

cd mshift-trojan-app

# Node.js 버전 확인
if ! command -v node &> /dev/null; then
    echo "❌ 오류: Node.js가 설치되지 않았습니다."
    exit 1
fi

# 포트 3001에서 실행 중인 프로세스 확인 및 종료
echo "🔍 포트 3001 확인 중..."
PORT_3001_PID=$(lsof -ti:3001)
if [[ ! -z "$PORT_3001_PID" ]]; then
    echo "⏹️  포트 3001에서 실행 중인 프로세스 종료 중... (PID: $PORT_3001_PID)"
    kill -9 $PORT_3001_PID
    sleep 3
fi

# 포트 19006에서 실행 중인 프로세스 확인 및 종료
echo "🔍 포트 19006 확인 중..."
PORT_19006_PID=$(lsof -ti:19006)
if [[ ! -z "$PORT_19006_PID" ]]; then
    echo "⏹️  포트 19006에서 실행 중인 프로세스 종료 중... (PID: $PORT_19006_PID)"
    kill -9 $PORT_19006_PID
    sleep 3
fi

# Expo Metro 프로세스 확인 및 종료
echo "🔍 기존 Expo 프로세스 확인 중..."
EXPO_PIDS=$(ps aux | grep "expo start" | grep -v grep | awk '{print $2}')
if [[ ! -z "$EXPO_PIDS" ]]; then
    echo "⏹️  기존 Expo 프로세스들 종료 중..."
    echo "$EXPO_PIDS" | xargs kill -9 2>/dev/null || true
    sleep 3
fi

# Node 프로세스 중 Metro bundler 관련 종료
METRO_PIDS=$(ps aux | grep "metro" | grep -v grep | awk '{print $2}')
if [[ ! -z "$METRO_PIDS" ]]; then
    echo "⏹️  기존 Metro bundler 프로세스들 종료 중..."
    echo "$METRO_PIDS" | xargs kill -9 2>/dev/null || true
    sleep 3
fi

# package.json 확인
if [[ ! -f "package.json" ]]; then
    echo "❌ 오류: package.json 파일을 찾을 수 없습니다."
    exit 1
fi

# node_modules 확인
if [[ ! -d "node_modules" ]]; then
    echo "📦 의존성 설치 중..."
    npm install
fi

# 캐시 클리어
echo "🧹 캐시 클리어 중..."
rm -rf .expo
rm -rf web-build
npm start --reset-cache &>/dev/null || true

# Expo 앱 시작 (Metro bundler 중심, 브라우저 자동 열기 비활성화)
echo "🏗️  Trojan 앱 빌드 및 실행 중..."

# 환경 변수 설정
export EXPO_DEVTOOLS_LISTEN_ADDRESS=0.0.0.0  # 모든 인터페이스에서 수신
export REACT_NATIVE_PACKAGER_HOSTNAME=localhost

# 포그라운드에서 실행 (터미널에 QR 코드와 메뉴 표시)
echo "🚀 Expo 시작 중... (QR 코드와 메뉴가 터미널에 표시됩니다)"
echo "💡 Metro bundler가 준비되면 QR 코드가 표시됩니다. 잠시 기다려주세요..."
echo ""

# 대화형 모드로 실행
exec npx expo start --port 3001
#!/bin/bash

# 모바일 앱 실행 스크립트 (Android/iOS 대응)
echo "📱 트로이 목마 가계부 - 모바일 앱 실행"
echo "======================================"

# 트로이 앱 디렉토리로 이동
cd mshift-trojan-app

# 기존 프로세스 정리
echo "🧹 기존 프로세스 정리 중..."
pkill -f "expo start" 2>/dev/null || true
pkill -f "metro" 2>/dev/null || true
sleep 3

# 포트 8081, 19000, 19001, 19002 사용 중인 프로세스 확인
echo "🔍 사용 가능한 포트 확인 중..."
for port in 19000 19001 19002 19003; do
    if ! lsof -i :$port >/dev/null 2>&1; then
        EXPO_PORT=$port
        break
    fi
done

if [ -z "$EXPO_PORT" ]; then
    echo "❌ 사용 가능한 포트를 찾을 수 없습니다"
    exit 1
fi

echo "✅ 포트 $EXPO_PORT 사용 예정"

# .expo 캐시 정리
echo "🧹 Expo 캐시 정리 중..."
rm -rf .expo
rm -rf node_modules/.cache 2>/dev/null || true

# 환경 변수 설정
export EXPO_DEVTOOLS_LISTEN_ADDRESS=0.0.0.0
export REACT_NATIVE_PACKAGER_HOSTNAME=192.168.45.224

echo ""
echo "📱 Expo 시작 중..."
echo "   • 포트: $EXPO_PORT"
echo "   • 백엔드: 192.168.45.224:8081"
echo "   • 터널 모드로 시작 (모바일에서 접근 가능)"
echo ""
echo "💡 QR 코드가 나타나면 Expo Go 앱으로 스캔하세요!"
echo ""

# Expo 시작 (터널 모드)
npx expo start --port $EXPO_PORT --tunnel
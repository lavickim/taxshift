#!/bin/bash

# 트로이 목마 가계부 서비스 상태 확인 스크립트

echo "🔍 트로이 목마 가계부 서비스 상태 확인"
echo "======================================"
echo ""

# 백엔드 서버 확인 (포트 8081)
echo "📊 백엔드 서버 (포트 8081):"
if curl -s http://localhost:8081/api/public/health >/dev/null 2>&1; then
    echo "   ✅ 실행 중"
    # 서비스 정보 조회
    SERVICE_INFO=$(curl -s http://localhost:8081/api/public/info 2>/dev/null)
    if [ ! -z "$SERVICE_INFO" ]; then
        echo "   📋 서비스: $SERVICE_INFO"
    fi
else
    echo "   ❌ 중지됨"
fi
echo ""

# 앱 Metro bundler 확인 (포트 3001)
echo "📱 React Native 앱 (포트 3001):"
if curl -s http://localhost:3001 >/dev/null 2>&1; then
    echo "   ✅ Metro bundler 실행 중"
    echo "   🌐 웹 버전: http://localhost:3001"
    echo "   📱 QR 코드로 모바일 테스트 가능"
else
    echo "   ❌ Metro bundler 중지됨"
fi
echo ""

# 프로세스 상태 확인
echo "🔧 실행 중인 관련 프로세스:"
echo ""

# Java/Spring Boot 프로세스
JAVA_PROCESSES=$(ps aux | grep -E "(spring-boot:run|mshift-trojan-backend)" | grep -v grep)
if [ ! -z "$JAVA_PROCESSES" ]; then
    echo "   ☕ Java/Spring Boot:"
    echo "$JAVA_PROCESSES" | awk '{print "      PID: " $2 " - " $11 " " $12 " " $13}' | head -3
else
    echo "   ☕ Java/Spring Boot: 실행 중이지 않음"
fi
echo ""

# Expo/Metro 프로세스
EXPO_PROCESSES=$(ps aux | grep -E "(expo start|metro)" | grep -v grep)
if [ ! -z "$EXPO_PROCESSES" ]; then
    echo "   📱 Expo/Metro:"
    echo "$EXPO_PROCESSES" | awk '{print "      PID: " $2 " - " $11 " " $12 " " $13}' | head -3
else
    echo "   📱 Expo/Metro: 실행 중이지 않음"
fi
echo ""

# 포트 사용 상황
echo "🌐 포트 사용 상황:"
echo "   • 포트 8081 (백엔드): $(lsof -ti:8081 >/dev/null 2>&1 && echo "사용 중" || echo "사용 가능")"
echo "   • 포트 3001 (앱): $(lsof -ti:3001 >/dev/null 2>&1 && echo "사용 중" || echo "사용 가능")"
echo ""

# 빠른 실행 가이드
echo "🚀 빠른 실행 가이드:"
echo "   • 전체 실행: ./run-app.sh (옵션 1 선택)"
echo "   • 앱만 실행: ./start-tj-app.sh"
echo "   • 백엔드만 실행: ./start-tj-backend.sh"
echo "   • 모든 서비스 중지: ./run-app.sh (옵션 4 선택)"
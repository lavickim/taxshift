#!/bin/bash

# 트로이 목마 가계부 앱 통합 실행 스크립트
# 백엔드와 앱을 함께 실행하거나 개별 실행 가능

echo "🎭 트로이 목마 가계부 실행 관리자"
echo "======================================="
echo ""
echo "실행 옵션을 선택하세요:"
echo "1) 백엔드 + 앱 모두 실행"
echo "2) 앱만 실행 (백엔드가 이미 실행 중인 경우)"
echo "3) 백엔드만 실행"
echo "4) 모든 서비스 중지"
echo ""
read -p "선택 (1-4): " choice

case $choice in
    1)
        echo "🚀 백엔드 + 앱 모두 실행 중..."
        echo ""
        
        # 백엔드 실행 (백그라운드)
        echo "📊 백엔드 서버 시작 중... (포트: 8081)"
        ./start-tj-backend.sh &
        BACKEND_PID=$!
        
        # 백엔드가 시작될 때까지 대기
        echo "⏳ 백엔드 서버 초기화 대기 중... (30초)"
        sleep 30
        
        # 앱 실행
        echo "📱 React Native 앱 시작 중... (포트: 3001)"
        ./start-tj-app.sh
        ;;
        
    2)
        echo "📱 앱만 실행 중... (포트: 3001)"
        echo "⚠️  백엔드 서버가 포트 8081에서 실행 중인지 확인하세요!"
        echo ""
        ./start-tj-app.sh
        ;;
        
    3)
        echo "📊 백엔드만 실행 중... (포트: 8081)"
        ./start-tj-backend.sh
        ;;
        
    4)
        echo "🛑 모든 서비스 중지 중..."
        
        # Expo 프로세스 종료
        echo "📱 앱 프로세스 종료 중..."
        pkill -f "expo start" 2>/dev/null || true
        pkill -f "metro" 2>/dev/null || true
        
        # 포트 3001, 8081에서 실행 중인 프로세스 종료
        lsof -ti:3001 | xargs kill -9 2>/dev/null || true
        lsof -ti:8081 | xargs kill -9 2>/dev/null || true
        
        # 백엔드 Java 프로세스 종료
        pkill -f "spring-boot:run" 2>/dev/null || true
        pkill -f "mshift-trojan-backend" 2>/dev/null || true
        
        echo "✅ 모든 서비스가 중지되었습니다."
        ;;
        
    *)
        echo "❌ 잘못된 선택입니다."
        exit 1
        ;;
esac
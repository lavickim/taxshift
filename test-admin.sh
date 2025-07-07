#!/bin/bash

# MoneyShift 관리자 패널 테스트 실행 스크립트
# 루트 디렉토리에서 mshift-admin 폴더의 테스트를 실행합니다.

echo "🧪 MoneyShift Admin 테스트 실행 스크립트"
echo "=============================================="

# 현재 디렉토리 확인
CURRENT_DIR=$(pwd)
echo "📍 현재 위치: $CURRENT_DIR"

# mshift-admin 디렉토리 존재 확인
ADMIN_DIR="$CURRENT_DIR/mshift-admin"
if [ ! -d "$ADMIN_DIR" ]; then
    echo "❌ mshift-admin 디렉토리를 찾을 수 없습니다: $ADMIN_DIR"
    exit 1
fi

echo "✅ mshift-admin 디렉토리 발견: $ADMIN_DIR"

# mshift-admin 디렉토리로 이동
cd "$ADMIN_DIR"
echo "📂 디렉토리 변경: $(pwd)"

# 테스트 옵션 메뉴
echo ""
echo "🎯 실행할 테스트를 선택하세요:"
echo "1) 전체 자동 테스트 (./test-website.sh)"
echo "2) API 테스트만 (npm run test:e2e)"
echo "3) 인터랙티브 UI 테스트 (npm run test:interactive)"
echo "4) 개발 서버 시작 (npm run dev)"
echo "5) 빌드 테스트 (npm run build)"
echo ""

# 인자가 제공된 경우 자동 선택
if [ $# -eq 1 ]; then
    CHOICE=$1
    echo "🤖 자동 선택: $CHOICE"
else
    # 사용자 입력 받기
    read -p "선택 (1-5): " CHOICE
fi

case $CHOICE in
    1)
        echo "🚀 전체 자동 테스트 실행 중..."
        ./test-website.sh
        ;;
    2)
        echo "🔌 API 테스트 실행 중..."
        npm run test:e2e
        ;;
    3)
        echo "🖱️ 인터랙티브 UI 테스트 실행 중..."
        npm run test:interactive
        ;;
    4)
        echo "🌐 개발 서버 시작 중..."
        echo "💡 서버가 시작되면 http://localhost:3000 에서 확인할 수 있습니다."
        npm run dev
        ;;
    5)
        echo "🏗️ 프로덕션 빌드 테스트 중..."
        npm run build
        ;;
    *)
        echo "❌ 잘못된 선택입니다. 1-5 중에서 선택해주세요."
        exit 1
        ;;
esac

# 원래 디렉토리로 복귀
cd "$CURRENT_DIR"
echo ""
echo "✅ 테스트 완료! 원래 디렉토리로 복귀: $(pwd)"
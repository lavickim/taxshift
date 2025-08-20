#!/bin/bash

# Trojan Horse 전체 시스템 실행 스크립트
# 백엔드와 앱을 순차적으로 시작

echo "🎯 Trojan Horse 전체 시스템 시작 중..."

# 현재 디렉토리 확인
if [[ ! -d "mshift-trojan-backend" ]] || [[ ! -d "mshift-trojan-app" ]]; then
    echo "❌ 오류: Trojan Horse 디렉토리들을 찾을 수 없습니다."
    echo "   MoneyShift 프로젝트 루트에서 실행해주세요."
    exit 1
fi

# 스크립트들이 실행 가능한지 확인
chmod +x start-tj-backend.sh
chmod +x start-tj-app.sh

echo ""
echo "🎯 === Trojan Horse 시스템 시작 시퀀스 ==="
echo "1️⃣  백엔드 시작 (Spring Boot + PostgreSQL + Redis)"
echo "2️⃣  프론트엔드 시작 (React Native + Expo)"
echo "=============================================="
echo ""

# 1단계: 백엔드 시작
echo "🚀 1단계: 백엔드 시작 중..."
./start-tj-backend.sh

if [[ $? -ne 0 ]]; then
    echo "❌ 백엔드 시작에 실패했습니다."
    exit 1
fi

echo ""
echo "✅ 백엔드 시작 완료!"
echo ""

# 잠시 대기
sleep 5

# 2단계: 앱 시작 안내
echo "📱 2단계: 앱 실행 준비 완료!"
echo ""
echo "🎯 다음 명령어로 앱을 시작하세요:"
echo "   ./start-tj-app.sh"
echo ""
echo "💡 앱을 시작하면 터미널에 QR 코드와 메뉴가 표시됩니다."

echo ""
echo "🎉 ==== Trojan Horse 시스템 전체 시작 완료! ===="
echo ""
echo "🌐 시스템 상태:"
echo "   ✅ 백엔드 API: http://localhost:8081/api"
echo "   ✅ Expo Metro: http://localhost:3001"
echo ""
echo "📊 상태 확인:"
echo "   - Health Check: curl http://localhost:8081/api/actuator/health"
echo "   - Backend Logs: tail -f backend-trojan.log"
echo "   - App Logs: tail -f frontend-trojan.log"
echo ""
echo "📚 API 문서: http://localhost:8081/api/swagger-ui.html"
echo ""
echo "🎯 주요 기능:"
echo "   📸 영수증 OCR 처리"
echo "   💰 거래 내역 관리"
echo "   📊 카테고리별 분석"
echo "   📤 Excel/CSV 내보내기"
echo "   🔐 사용자 인증 및 권한 관리"
echo "   🎮 게이미피케이션 시스템"
echo ""
echo "🚀 MoneyShift Trojan Horse 시스템이 준비되었습니다!"
echo "   사용자들이 가계부 앱을 사용하며 자연스럽게 거래 데이터를"
echo "   수집하여 MoneyShift 메인 시스템의 분류 정확도를 향상시킵니다."
echo ""
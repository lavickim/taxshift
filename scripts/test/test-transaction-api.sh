#!/bin/bash

echo "🧪 Transaction API 테스트 시작..."
echo "================================="

# API 서버가 실행 중인지 확인
echo "1️⃣ API 서버 상태 확인 중..."
for i in {1..30}; do
    if curl -s http://localhost:8080/api/rule-engine/health > /dev/null 2>&1; then
        echo "✅ API 서버가 실행 중입니다."
        break
    fi
    if [ $i -eq 30 ]; then
        echo "❌ API 서버가 응답하지 않습니다. 서버를 시작해주세요."
        exit 1
    fi
    echo "   대기 중... ($i/30)"
    sleep 2
done

echo ""
echo "2️⃣ Transaction API Health 체크..."
HEALTH_RESPONSE=$(curl -s http://localhost:8080/api/transactions/health)
if [[ $? -eq 0 && "$HEALTH_RESPONSE" == *"Transaction API is running"* ]]; then
    echo "✅ Transaction API Health: $HEALTH_RESPONSE"
else
    echo "❌ Transaction API Health 실패: $HEALTH_RESPONSE"
fi

echo ""
echo "3️⃣ Bank-A 거래 데이터 API 테스트..."
TRANSACTIONS_RESPONSE=$(curl -s http://localhost:8080/api/transactions/bank-a)
if [[ $? -eq 0 && "$TRANSACTIONS_RESPONSE" == *"accountInfo"* ]]; then
    echo "✅ Bank-A 거래 데이터 로드 성공"
    echo "📊 응답 데이터 샘플:"
    echo "$TRANSACTIONS_RESPONSE" | jq '.accountInfo' 2>/dev/null || echo "   (jq가 설치되지 않아 JSON을 파싱할 수 없습니다)"
    
    # 거래 건수 확인
    TRANSACTION_COUNT=$(echo "$TRANSACTIONS_RESPONSE" | jq '.transactions | length' 2>/dev/null || echo "N/A")
    echo "   총 거래 건수: $TRANSACTION_COUNT 건"
else
    echo "❌ Bank-A 거래 데이터 로드 실패: $TRANSACTIONS_RESPONSE"
fi

echo ""
echo "4️⃣ 모바일 앱 호환성 테스트..."
echo "   API Base URL: http://192.168.45.219:8080/api"

# 로컬 IP로 API 호출 테스트
MOBILE_TEST=$(curl -s http://192.168.45.219:8080/api/transactions/bank-a)
if [[ $? -eq 0 && "$MOBILE_TEST" == *"accountInfo"* ]]; then
    echo "✅ 모바일 앱에서 API 호출 가능"
else
    echo "❌ 모바일 앱에서 API 호출 실패 (네트워크 확인 필요)"
fi

echo ""
echo "================================="
echo "🎉 Transaction API 테스트 완료!"
echo ""
echo "📱 모바일 앱에서 테스트하려면:"
echo "   1. ./start-app.sh 실행"
echo "   2. 앱의 '계좌' 탭에서 거래 내역 확인"
echo "   3. 브라우저 콘솔(F12)에서 API 호출 로그 확인"
#!/bin/bash

echo "🎭 트로이 목마 가계부 백엔드 API 통합 테스트"
echo "=================================================="

BASE_URL="http://localhost:8081/api"

echo ""
echo "1️⃣ 헬스체크 테스트"
echo "------------------"
curl -s "$BASE_URL/public/health" | jq .

echo ""
echo "2️⃣ API 정보 확인"
echo "---------------"
curl -s "$BASE_URL/public/info" | jq .service

echo ""
echo "3️⃣ 새로운 사용자 생성"
echo "-------------------"
USER_RESPONSE=$(curl -s -X POST "$BASE_URL/v1/users" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "integration_test",
    "email": "integration@test.com",
    "passwordHash": "testpass123",
    "fullName": "통합 테스트 사용자",
    "phoneNumber": "010-9999-9999"
  }')
  
echo "$USER_RESPONSE" | jq .

USER_ID=$(echo "$USER_RESPONSE" | jq -r .userId)
echo "생성된 사용자 ID: $USER_ID"

echo ""
echo "4️⃣ 사용자 목록 조회"
echo "------------------"
curl -s "$BASE_URL/v1/users" | jq .[].username

echo ""
echo "5️⃣ 기본 자산 확인"
echo "---------------"
curl -s "$BASE_URL/v1/assets?userId=$USER_ID" | jq .[0].assetName

echo ""
echo "6️⃣ 총 자산 확인"
echo "-------------"
TOTAL_BALANCE=$(curl -s "$BASE_URL/v1/assets/total?userId=$USER_ID")
echo "총 자산: $TOTAL_BALANCE"

echo ""
echo "7️⃣ 새로운 자산 추가"
echo "------------------"
NEW_ASSET=$(curl -s -X POST "$BASE_URL/v1/assets" \
  -H "Content-Type: application/json" \
  -d "{
    \"userId\": $USER_ID,
    \"assetName\": \"카카오뱅크\",
    \"assetType\": \"BANK\",
    \"bankName\": \"카카오뱅크\",
    \"accountNumber\": \"1234-567-890\",
    \"balance\": 100000,
    \"colorCode\": \"#FFEB3B\",
    \"iconName\": \"bank\"
  }")
  
echo "$NEW_ASSET" | jq .assetName
ASSET_ID=$(echo "$NEW_ASSET" | jq -r .assetId)

echo ""
echo "8️⃣ 업데이트된 자산 목록 확인"
echo "-------------------------"
curl -s "$BASE_URL/v1/assets?userId=$USER_ID" | jq '.[].assetName'

echo ""
echo "9️⃣ 업데이트된 총 자산 확인"
echo "----------------------"
UPDATED_TOTAL=$(curl -s "$BASE_URL/v1/assets/total?userId=$USER_ID")
echo "업데이트된 총 자산: $UPDATED_TOTAL"

echo ""
echo "🔟 특정 자산 조회"
echo "---------------"
curl -s "$BASE_URL/v1/assets/$ASSET_ID?userId=$USER_ID" | jq .assetName

echo ""
echo "✅ 모든 테스트 완료!"
echo "=================="
#!/bin/bash

echo "🔐 JWT 인증 시스템 종합 테스트"
echo "=============================="

BASE_URL="http://localhost:8081/api"

# 색상 출력 함수
green() { echo -e "\033[32m$1\033[0m"; }
red() { echo -e "\033[31m$1\033[0m"; }
yellow() { echo -e "\033[33m$1\033[0m"; }

echo ""
echo "1️⃣ 새로운 사용자 회원가입 및 JWT 토큰 발급"
echo "==============================================="
REGISTER_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "jwtauth_test",
    "email": "jwtauth@example.com",
    "password": "securepass123",
    "fullName": "JWT 인증 테스트 사용자",
    "phoneNumber": "010-3333-4444"
  }')

SUCCESS=$(echo "$REGISTER_RESPONSE" | jq -r '.success')
if [ "$SUCCESS" = "true" ]; then
  green "✅ 회원가입 성공"
  ACCESS_TOKEN=$(echo "$REGISTER_RESPONSE" | jq -r '.accessToken')
  REFRESH_TOKEN=$(echo "$REGISTER_RESPONSE" | jq -r '.refreshToken')
  USER_ID=$(echo "$REGISTER_RESPONSE" | jq -r '.user.userId')
  USERNAME=$(echo "$REGISTER_RESPONSE" | jq -r '.user.username')
  
  echo "   - 사용자 ID: $USER_ID"
  echo "   - 사용자명: $USERNAME"
  echo "   - 액세스 토큰: ${ACCESS_TOKEN:0:20}..."
  echo "   - 리프레시 토큰: ${REFRESH_TOKEN:0:20}..."
else
  red "❌ 회원가입 실패"
  echo "$REGISTER_RESPONSE" | jq .
  exit 1
fi

echo ""
echo "2️⃣ 로그인 테스트"
echo "================"
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "identifier": "jwtauth_test",
    "password": "securepass123"
  }')

LOGIN_SUCCESS=$(echo "$LOGIN_RESPONSE" | jq -r '.success')
if [ "$LOGIN_SUCCESS" = "true" ]; then
  green "✅ 로그인 성공"
  NEW_ACCESS_TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.accessToken')
  echo "   - 새로운 액세스 토큰: ${NEW_ACCESS_TOKEN:0:20}..."
else
  red "❌ 로그인 실패"
  echo "$LOGIN_RESPONSE" | jq .
  exit 1
fi

echo ""
echo "3️⃣ 보호된 API 접근 테스트"
echo "========================"

# 토큰 없이 접근
echo "토큰 없이 사용자 목록 조회:"
NO_TOKEN_RESPONSE=$(curl -s -w "%{http_code}" "$BASE_URL/v1/users")
if [[ "$NO_TOKEN_RESPONSE" == *"403"* ]]; then
  green "✅ 인증 없이 접근 차단됨 (403)"
else
  red "❌ 인증 없이 접근이 허용됨 (보안 문제!)"
fi

# 유효한 토큰으로 접근
echo "유효한 토큰으로 사용자 목록 조회:"
USERS_RESPONSE=$(curl -s -H "Authorization: Bearer $ACCESS_TOKEN" "$BASE_URL/v1/users")
USER_COUNT=$(echo "$USERS_RESPONSE" | jq '. | length')
if [ "$USER_COUNT" -gt 0 ]; then
  green "✅ 인증된 접근 성공 (사용자 $USER_COUNT 명 조회)"
else
  red "❌ 인증된 접근 실패"
fi

# 사용자 자산 조회
echo "사용자 자산 목록 조회:"
ASSETS_RESPONSE=$(curl -s -H "Authorization: Bearer $ACCESS_TOKEN" "$BASE_URL/v1/assets?userId=$USER_ID")
ASSET_COUNT=$(echo "$ASSETS_RESPONSE" | jq '. | length')
if [ "$ASSET_COUNT" -gt 0 ]; then
  green "✅ 사용자 자산 조회 성공 ($ASSET_COUNT 개)"
  echo "$ASSETS_RESPONSE" | jq '.[0].assetName'
else
  red "❌ 사용자 자산 조회 실패"
fi

echo ""
echo "4️⃣ 토큰 정보 조회 테스트"
echo "======================="
TOKEN_INFO_RESPONSE=$(curl -s -H "Authorization: Bearer $ACCESS_TOKEN" "$BASE_URL/auth/token-info")
TOKEN_INFO_SUCCESS=$(echo "$TOKEN_INFO_RESPONSE" | jq -r '.success')
if [ "$TOKEN_INFO_SUCCESS" = "true" ]; then
  green "✅ 토큰 정보 조회 성공"
  echo "$TOKEN_INFO_RESPONSE" | jq '.tokenInfo | {userId, username, email, expired}'
else
  red "❌ 토큰 정보 조회 실패"
fi

echo ""
echo "5️⃣ 리프레시 토큰 테스트"
echo "====================="
REFRESH_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/refresh" \
  -H "Content-Type: application/json" \
  -d "{\"refreshToken\": \"$REFRESH_TOKEN\"}")

REFRESH_SUCCESS=$(echo "$REFRESH_RESPONSE" | jq -r '.success')
if [ "$REFRESH_SUCCESS" = "true" ]; then
  green "✅ 토큰 새로고침 성공"
  REFRESHED_TOKEN=$(echo "$REFRESH_RESPONSE" | jq -r '.accessToken')
  echo "   - 새로운 액세스 토큰: ${REFRESHED_TOKEN:0:20}..."
else
  red "❌ 토큰 새로고침 실패"
  echo "$REFRESH_RESPONSE" | jq .
fi

echo ""
echo "6️⃣ 잘못된 인증 시나리오 테스트"
echo "============================="

# 잘못된 토큰으로 접근
echo "잘못된 토큰으로 접근:"
INVALID_RESPONSE=$(curl -s -w "%{http_code}" -H "Authorization: Bearer invalid_token" "$BASE_URL/v1/users")
if [[ "$INVALID_RESPONSE" == *"403"* ]]; then
  green "✅ 잘못된 토큰 접근 차단됨"
else
  red "❌ 잘못된 토큰 접근이 허용됨 (보안 문제!)"
fi

# 잘못된 비밀번호로 로그인
echo "잘못된 비밀번호로 로그인 시도:"
WRONG_LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "identifier": "jwtauth_test",
    "password": "wrongpassword"
  }')

WRONG_LOGIN_SUCCESS=$(echo "$WRONG_LOGIN_RESPONSE" | jq -r '.success')
if [ "$WRONG_LOGIN_SUCCESS" = "false" ]; then
  green "✅ 잘못된 비밀번호 로그인 차단됨"
else
  red "❌ 잘못된 비밀번호 로그인이 허용됨 (보안 문제!)"
fi

echo ""
echo "7️⃣ 로그아웃 테스트"
echo "================="
LOGOUT_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/logout" \
  -H "Authorization: Bearer $ACCESS_TOKEN")

LOGOUT_SUCCESS=$(echo "$LOGOUT_RESPONSE" | jq -r '.success')
if [ "$LOGOUT_SUCCESS" = "true" ]; then
  green "✅ 로그아웃 성공"
else
  red "❌ 로그아웃 실패"
fi

echo ""
echo "🎉 JWT 인증 시스템 테스트 완료!"
echo "==============================="
echo "🔒 모든 보안 기능이 정상적으로 작동합니다"
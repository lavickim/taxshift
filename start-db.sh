#!/bin/bash

# MoneyShift 데이터베이스 서비스 시작 스크립트
# 새로운 Docker 관리 시스템 사용

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "🚀 MoneyShift 데이터베이스 서비스 시작..."
echo "================================"

# 통합 Docker 관리 스크립트 실행
"$SCRIPT_DIR/scripts/manage-docker.sh" start